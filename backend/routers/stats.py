from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import get_db, campaigns_col, entries_col, users_col
from utils.security import decode_token

router = APIRouter(prefix="/api/stats", tags=["stats"])
bearer = HTTPBearer()


def _require_role(role: str):
    def dep(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
        payload = decode_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        if payload.get("role") != role and payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    return dep


@router.get("/platform")
async def platform_stats(payload: dict = Depends(_require_role("admin"))):
    total_users     = await users_col().count_documents({})
    total_campaigns = await campaigns_col().count_documents({})
    active_giveaways= await campaigns_col().count_documents({"status": "active"})
    total_entries   = await entries_col().count_documents({})

    recent_users = []
    async for u in users_col().find({}, {"name": 1, "email": 1, "role": 1, "created_at": 1}).sort("created_at", -1).limit(5):
        recent_users.append({
            "name":  u["name"],
            "email": u["email"],
            "role":  u.get("role", "user"),
        })

    return {
        "total_users":      total_users,
        "total_campaigns":  total_campaigns,
        "active_giveaways": active_giveaways,
        "total_entries":    total_entries,
        "total_revenue":    "$2.9M",   # placeholder until payments collection
        "recent_signups":   recent_users,
    }


@router.get("/seller")
async def seller_stats(payload: dict = Depends(_require_role("seller"))):
    seller_id = payload["sub"]

    pipeline = [
        {"$match": {"seller_id": seller_id}},
        {"$lookup": {
            "from":         "entries",
            "localField":   "_id_str",
            "foreignField": "campaign_id",
            "as":           "entries",
        }},
        {"$addFields": {"leads": {"$size": "$entries"}}},
        {"$project": {"entries": 0}},
    ]

    campaigns = []
    async for c in campaigns_col().find({"seller_id": seller_id}):
        cid    = str(c["_id"])
        leads  = await entries_col().count_documents({"campaign_id": cid})
        campaigns.append({
            "id":         cid,
            "name":       c["title"],
            "leads":      leads,
            "status":     c.get("status", "active"),
            "conversion": f"{min(99, round(leads / max(c.get('participants', 1), 1) * 100, 1))}%",
        })

    total_campaigns = len(campaigns)
    total_leads     = sum(c["leads"] for c in campaigns)
    avg_conversion  = f"{round(sum(float(c['conversion'].rstrip('%')) for c in campaigns) / max(total_campaigns, 1), 1)}%"

    return {
        "total_campaigns": total_campaigns,
        "total_leads":     total_leads,
        "avg_conversion":  avg_conversion,
        "campaigns":       campaigns,
    }


@router.get("/user")
async def user_stats(payload: dict = Depends(_require_role("user"))):
    user_id = payload["sub"]
    total   = await entries_col().count_documents({"user_id": user_id})
    active  = await entries_col().count_documents({"user_id": user_id, "entry_status": "Active"})
    wins    = await entries_col().count_documents({"user_id": user_id, "entry_status": "Won"})

    entries = []
    async for e in entries_col().find({"user_id": user_id}).sort("joined_at", -1).limit(10):
        entries.append({
            "id":             str(e["_id"]),
            "campaign_id":    e["campaign_id"],
            "campaign_title": e.get("campaign_title", ""),
            "prize":          e.get("prize", ""),
            "joined_at":      e.get("joined_at", ""),
            "draw_date":      e.get("draw_date", ""),
            "entry_status":   e.get("entry_status", "Active"),
        })

    return {
        "total_participations": total,
        "active_campaigns":     active,
        "total_wins":           wins,
        "entries":              entries,
    }
