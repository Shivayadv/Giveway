import hashlib
import hmac
import os
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import campaigns_col, users_col
from utils.security import decode_token

router = APIRouter(prefix="/api/payments", tags=["payments"])
bearer = HTTPBearer()

RAZORPAY_KEY_ID     = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

PLANS = {
    "basic": {"name": "Basic",       "amount": 99900,  "currency": "INR", "description": "Up to 10,000 entries"},
    "pro":   {"name": "Pro",         "amount": 249900, "currency": "INR", "description": "Unlimited entries + analytics"},
}


def _get_seller(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") not in ("seller", "admin"):
        raise HTTPException(status_code=403, detail="Seller only")
    return payload


def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload


@router.get("/plans")
async def get_plans():
    return [{"id": k, **v, "amount_display": f"₹{v['amount']//100}"} for k, v in PLANS.items()]


@router.post("/order")
async def create_order(body: dict, payload: dict = Depends(_get_seller)):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    plan_id     = body.get("plan", "basic")
    campaign_id = body.get("campaign_id", "")
    plan        = PLANS.get(plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")

    import httpx
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={
                "amount":   plan["amount"],
                "currency": plan["currency"],
                "notes":    {"campaign_id": campaign_id, "plan": plan_id, "seller_id": payload["sub"]},
            },
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to create payment order")

    order = r.json()
    return {
        "order_id":  order["id"],
        "amount":    order["amount"],
        "currency":  order["currency"],
        "key_id":    RAZORPAY_KEY_ID,
        "plan_name": plan["name"],
    }


@router.post("/verify")
async def verify_payment(body: dict, payload: dict = Depends(_get_seller)):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    order_id   = body.get("razorpay_order_id", "")
    payment_id = body.get("razorpay_payment_id", "")
    signature  = body.get("razorpay_signature", "")
    campaign_id = body.get("campaign_id", "")
    plan       = body.get("plan", "basic")

    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    now = datetime.now(timezone.utc)
    payment_record = {
        "seller_id":  payload["sub"],
        "order_id":   order_id,
        "payment_id": payment_id,
        "plan":       plan,
        "amount":     PLANS.get(plan, {}).get("amount", 0),
        "currency":   "INR",
        "status":     "paid",
        "paid_at":    now,
        "campaign_id": campaign_id,
    }

    db = campaigns_col().database
    await db["payments"].insert_one(payment_record)

    # Unlock campaign → move from payment_pending to pending (for admin approval)
    if campaign_id:
        try:
            oid = ObjectId(campaign_id)
            await campaigns_col().update_one(
                {"_id": oid, "status": "payment_pending"},
                {"$set": {"status": "pending", "plan": plan, "paid_at": now}},
            )
        except Exception:
            pass

    return {"status": "verified", "payment_id": payment_id}


@router.get("/history")
async def payment_history(payload: dict = Depends(_get_seller)):
    db = campaigns_col().database
    results = []
    async for p in db["payments"].find({"seller_id": payload["sub"]}).sort("paid_at", -1):
        results.append({
            "id":          str(p["_id"]),
            "order_id":    p.get("order_id", ""),
            "payment_id":  p.get("payment_id", ""),
            "plan":        p.get("plan", "basic"),
            "amount":      p.get("amount", 0),
            "amount_display": f"₹{p.get('amount', 0)//100}",
            "status":      p.get("status", "paid"),
            "paid_at":     p.get("paid_at", "").isoformat() if hasattr(p.get("paid_at"), "isoformat") else "",
            "campaign_id": p.get("campaign_id", ""),
        })
    return results


@router.get("/admin/revenue")
async def admin_revenue(payload: dict = Depends(_require_admin)):
    db = campaigns_col().database
    total_pipeline = [
        {"$match": {"status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    totals = {"total": 0, "count": 0}
    async for row in db["payments"].aggregate(total_pipeline):
        totals = {"total": row["total"], "count": row["count"]}

    by_plan_pipeline = [
        {"$match": {"status": "paid"}},
        {"$group": {"_id": "$plan", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}},
    ]
    by_plan = []
    async for row in db["payments"].aggregate(by_plan_pipeline):
        by_plan.append({"plan": row["_id"], "amount": row["amount"], "count": row["count"]})

    recent = []
    async for p in db["payments"].find({"status": "paid"}).sort("paid_at", -1).limit(20):
        seller = await users_col().find_one({"_id": ObjectId(p["seller_id"])}) if p.get("seller_id") else None
        recent.append({
            "seller_name":    seller["name"] if seller else "Unknown",
            "plan":           p.get("plan", ""),
            "amount_display": f"₹{p.get('amount', 0)//100}",
            "paid_at":        p.get("paid_at", "").isoformat() if hasattr(p.get("paid_at"), "isoformat") else "",
        })

    return {
        "total_revenue":    f"₹{totals['total']//100:,}",
        "total_payments":   totals["count"],
        "by_plan":          by_plan,
        "recent_payments":  recent,
    }
