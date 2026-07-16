from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import users_col, campaigns_col, entries_col
from utils.security import decode_token

router = APIRouter(prefix="/api/admin", tags=["admin"])
bearer = HTTPBearer()


def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload


@router.get("/users")
async def list_users(
    payload: dict = Depends(_require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    search: str = Query(None),
):
    query: dict = {}
    if search:
        query["$or"] = [
            {"name":  {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    total = await users_col().count_documents(query)
    results = []
    async for u in users_col().find(query, {"password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit):
        uid = str(u["_id"])
        entry_count = await entries_col().count_documents({"user_id": uid})
        results.append({
            "id":         uid,
            "name":       u.get("name", ""),
            "email":      u.get("email", ""),
            "phone":      u.get("phone", ""),
            "role":       u.get("role", "user"),
            "is_banned":  u.get("is_banned", False),
            "created_at": u.get("created_at", "").isoformat() if hasattr(u.get("created_at", ""), "isoformat") else str(u.get("created_at", "")),
            "entries":    entry_count,
        })

    return {"total": total, "users": results}


@router.patch("/users/{user_id}/ban")
async def ban_user(user_id: str, payload: dict = Depends(_require_admin)):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    r = await users_col().update_one({"_id": oid}, {"$set": {"is_banned": True}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "banned"}


@router.patch("/users/{user_id}/unban")
async def unban_user(user_id: str, payload: dict = Depends(_require_admin)):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    r = await users_col().update_one({"_id": oid}, {"$set": {"is_banned": False}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "unbanned"}


@router.get("/analytics")
async def platform_analytics(payload: dict = Depends(_require_admin)):
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=30)
    start_iso = start.isoformat()

    # Entries per day (joined_at stored as ISO string)
    entries_pipeline = [
        {"$match": {"joined_at": {"$gte": start_iso}}},
        {"$group": {"_id": {"$substr": ["$joined_at", 0, 10]}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    entries_by_day = {}
    async for row in entries_col().aggregate(entries_pipeline):
        entries_by_day[row["_id"]] = row["count"]

    # Users per day (created_at stored as datetime)
    users_pipeline = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    users_by_day = {}
    async for row in users_col().aggregate(users_pipeline):
        users_by_day[row["_id"]] = row["count"]

    # Build unified 30-day series
    series = []
    for i in range(30):
        day = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        series.append({
            "date": day,
            "entries": entries_by_day.get(day, 0),
            "users": users_by_day.get(day, 0),
        })

    # Top 5 campaigns by lead count
    top_campaigns = []
    async for c in campaigns_col().find({}).sort("participants", -1).limit(5):
        cid = str(c["_id"])
        leads = await entries_col().count_documents({"campaign_id": cid})
        top_campaigns.append({
            "name": c.get("title", ""),
            "leads": leads,
            "status": c.get("status", ""),
        })

    return {"series": series, "top_campaigns": top_campaigns}


@router.get("/campaigns")
async def admin_list_campaigns(
    payload: dict = Depends(_require_admin),
    status: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
):
    query: dict = {}
    if status and status != "all":
        query["status"] = status

    total = await campaigns_col().count_documents(query)
    results = []
    async for c in campaigns_col().find(query).sort("created_at", -1).skip(skip).limit(limit):
        cid = str(c["_id"])
        leads = await entries_col().count_documents({"campaign_id": cid})
        results.append({
            "id":           cid,
            "title":        c.get("title", ""),
            "brand":        c.get("brand", c.get("seller_name", "")),
            "category":     c.get("category", ""),
            "status":       c.get("status", ""),
            "price":        c.get("price", ""),
            "participants": c.get("participants", 0),
            "leads":        leads,
            "winners":      c.get("winners", 1),
            "created_at":   c.get("created_at", "").isoformat() if hasattr(c.get("created_at", ""), "isoformat") else "",
        })

    return {"total": total, "campaigns": results}
