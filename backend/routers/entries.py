from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import StreamingResponse
import csv
import io

from database import campaigns_col, entries_col, users_col
from models.campaign import EntryCreate, EntryOut, LeadOut
from utils.security import decode_token
from utils import email as mailer

router = APIRouter(prefix="/api/entries", tags=["entries"])
bearer = HTTPBearer()


def _get_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def _require_role(*roles: str):
    def dep(payload: dict = Depends(_get_user)):
        if payload.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    return dep


@router.get("/winners")
async def public_winners(limit: int = Query(20, le=50)):
    """Public list of recent winners across all campaigns."""
    results = []
    async for e in entries_col().find({"entry_status": "Won"}).sort("joined_at", -1).limit(limit):
        campaign = await campaigns_col().find_one({"_id": ObjectId(e["campaign_id"])}) if e.get("campaign_id") else None
        results.append({
            "name":           e.get("name", ""),
            "campaign_title": e.get("campaign_title", ""),
            "prize":          campaign.get("price", e.get("prize", "")) if campaign else e.get("prize", ""),
            "image":          campaign.get("image", "") if campaign else "",
            "city":           e.get("city", ""),
            "won_at":         e.get("joined_at", ""),
        })
    return results


@router.get("/me", response_model=list[EntryOut])
async def my_entries(payload: dict = Depends(_get_user)):
    user_id = payload["sub"]
    results = []
    async for e in entries_col().find({"user_id": user_id}).sort("joined_at", -1):
        results.append(EntryOut(
            id=str(e["_id"]),
            campaign_id=e["campaign_id"],
            campaign_title=e.get("campaign_title", ""),
            prize=e.get("prize", ""),
            joined_at=e.get("joined_at", ""),
            draw_date=e.get("draw_date", "TBD"),
            entry_status=e.get("entry_status", "Active"),
        ))
    return results


@router.get("/campaign/{campaign_id}", response_model=list[LeadOut])
async def campaign_leads(
    campaign_id: str,
    payload: dict = Depends(_require_role("seller", "admin")),
):
    results = []
    async for e in entries_col().find({"campaign_id": campaign_id}).sort("joined_at", -1):
        results.append(LeadOut(
            id=str(e["_id"]),
            name=e.get("name", ""),
            email=e.get("email", ""),
            phone=e.get("phone", ""),
            city=e.get("city", ""),
            campaign_title=e.get("campaign_title", ""),
            joined_at=e.get("joined_at", ""),
            entry_status=e.get("entry_status", "Active"),
        ))
    return results


@router.get("/campaign/{campaign_id}/csv")
async def export_leads_csv(
    campaign_id: str,
    payload: dict = Depends(_require_role("seller", "admin")),
):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Email", "Phone", "City", "Campaign", "Joined At", "Status", "Referred By"])
    async for e in entries_col().find({"campaign_id": campaign_id}).sort("joined_at", -1):
        writer.writerow([
            e.get("name", ""),
            e.get("email", ""),
            e.get("phone", ""),
            e.get("city", ""),
            e.get("campaign_title", ""),
            e.get("joined_at", ""),
            e.get("entry_status", "Active"),
            e.get("referred_by", ""),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leads-{campaign_id}.csv"},
    )


@router.get("/campaign/{campaign_id}/leaderboard")
async def referral_leaderboard(campaign_id: str):
    """Public leaderboard of top referrers for a campaign."""
    pipeline = [
        {"$match": {"campaign_id": campaign_id, "referred_by": {"$ne": "", "$exists": True}}},
        {"$group": {
            "_id": "$referred_by",
            "referrer_name": {"$first": "$referrer_name"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    results = []
    async for row in entries_col().aggregate(pipeline):
        results.append({
            "ref_code": row["_id"],
            "name": row.get("referrer_name") or "Anonymous",
            "count": row["count"],
        })
    return results


@router.post("", response_model=EntryOut, status_code=201)
async def create_entry(body: EntryCreate, payload: dict = Depends(_get_user)):
    user_id = payload["sub"]

    try:
        oid = ObjectId(body.campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = await campaigns_col().find_one({"_id": oid})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.get("status") != "active":
        raise HTTPException(status_code=400, detail="Campaign is not accepting entries")

    existing = await entries_col().find_one({"campaign_id": body.campaign_id, "user_id": user_id})
    if existing:
        raise HTTPException(status_code=409, detail="Already entered this campaign")

    # Resolve referrer info from ref_code
    referred_by = ""
    referrer_name = ""
    if body.ref_code:
        referrer = await users_col().find_one({"referral_code": body.ref_code})
        if referrer and str(referrer["_id"]) != user_id:
            referred_by = body.ref_code
            referrer_name = referrer.get("name", "")

    # Fetch current user for their referral_code (needed for confirmation email)
    current_user = await users_col().find_one({"_id": ObjectId(user_id)})
    my_referral_code = current_user.get("referral_code", "") if current_user else ""

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "campaign_id":    body.campaign_id,
        "campaign_title": campaign["title"],
        "prize":          campaign.get("price", ""),
        "user_id":        user_id,
        "name":           body.name,
        "email":          body.email,
        "phone":          body.phone,
        "city":           body.city,
        "joined_at":      now,
        "draw_date":      campaign.get("draw_date", "TBD"),
        "entry_status":   "Active",
        "referred_by":    referred_by,
        "referrer_name":  referrer_name,
    }
    result = await entries_col().insert_one(doc)
    await campaigns_col().update_one({"_id": oid}, {"$inc": {"participants": 1}})

    # Send confirmation email (non-blocking)
    mailer.fire(mailer.send_entry_confirmation(
        name=body.name,
        email=body.email,
        campaign_id=body.campaign_id,
        campaign_title=campaign["title"],
        prize=campaign.get("price", ""),
        draw_date=campaign.get("draw_date", "TBD"),
        referral_code=my_referral_code,
    ))

    return EntryOut(
        id=str(result.inserted_id),
        campaign_id=body.campaign_id,
        campaign_title=campaign["title"],
        prize=campaign.get("price", ""),
        joined_at=now,
        draw_date=campaign.get("draw_date", "TBD"),
        entry_status="Active",
    )
