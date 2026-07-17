from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import campaigns_col, entries_col, users_col
from models.campaign import CampaignCreate, CampaignDetail, CampaignOut, WinnerOut
from utils.security import decode_token
from utils import email as mailer

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])
bearer = HTTPBearer(auto_error=False)


def _get_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
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


def _fmt(c: dict) -> dict:
    c["id"] = str(c.pop("_id"))
    return c


def _time_left(ends_at: datetime | None) -> str:
    if not ends_at:
        return "TBD"
    now = datetime.now(timezone.utc)
    if ends_at.tzinfo is None:
        ends_at = ends_at.replace(tzinfo=timezone.utc)
    delta = ends_at - now
    if delta.total_seconds() <= 0:
        return "Ended"
    days = delta.days
    hours = delta.seconds // 3600
    if days > 0:
        return f"{days}d {hours}h"
    return f"{hours}h"


def _offer_label(offer_type: str) -> str:
    return {"free": "WIN FREE", "discount": "BIG DISCOUNT", "bogo": "BOGO"}.get(offer_type, "WIN FREE")


# ── Public endpoints ───────────────────────────────────────────────────────────

@router.get("", response_model=list[CampaignOut])
async def list_campaigns(
    featured: bool = Query(False),
    category: str = Query(None),
    status: str = Query("active"),
):
    query: dict = {"status": status}
    if category and category.lower() != "all":
        query["category"] = category

    cursor = campaigns_col().find(query).sort("participants", -1)
    if featured:
        cursor = cursor.limit(3)

    result = []
    async for c in cursor:
        c.setdefault("time_left", _time_left(c.get("ends_at")))
        c.setdefault("brand", "Unknown Brand")
        c.setdefault("urgent", False)
        result.append(CampaignOut(**_fmt(c)))
    return result


@router.get("/pending", response_model=list[CampaignDetail])
async def pending_campaigns(payload: dict = Depends(_require_role("admin"))):
    result = []
    async for c in campaigns_col().find({"status": "pending"}).sort("created_at", 1):
        c.setdefault("time_left", "Pending")
        c.setdefault("urgent", False)
        c.setdefault("participants", 0)
        c.setdefault("rating", 0.0)
        c.setdefault("total_ratings", 0)
        c.setdefault("terms", [])
        c.setdefault("description", "")
        c.setdefault("brand", c.get("seller_name", "Unknown Brand"))
        result.append(CampaignDetail(**_fmt(c)))
    return result


@router.get("/mine", response_model=list[CampaignOut])
async def my_campaigns(payload: dict = Depends(_require_role("seller", "admin"))):
    seller_id = payload["sub"]
    result = []
    async for c in campaigns_col().find({"seller_id": seller_id}).sort("created_at", -1):
        c.setdefault("time_left", _time_left(c.get("ends_at")))
        c.setdefault("brand", c.get("seller_name", "My Brand"))
        c.setdefault("urgent", False)
        count = await entries_col().count_documents({"campaign_id": str(c["_id"])})
        c["participants"] = count
        result.append(CampaignOut(**_fmt(c)))
    return result


@router.get("/{campaign_id}", response_model=CampaignDetail)
async def get_campaign(campaign_id: str):
    try:
        oid = ObjectId(campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    c = await campaigns_col().find_one({"_id": oid})
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    count = await entries_col().count_documents({"campaign_id": campaign_id})
    if count:
        c["participants"] = count
    c.setdefault("time_left", _time_left(c.get("ends_at")))
    c.setdefault("brand", c.get("seller_name", "Unknown Brand"))
    c.setdefault("urgent", False)
    c.setdefault("rating", 4.5)
    c.setdefault("total_ratings", 0)
    c.setdefault("terms", ["Valid for Indian residents only (18+)", "One entry per person"])
    c.setdefault("description", c.get("title", ""))
    return CampaignDetail(**_fmt(c))


# ── Seller endpoints ───────────────────────────────────────────────────────────

@router.post("", response_model=CampaignDetail, status_code=201)
async def create_campaign(body: CampaignCreate, payload: dict = Depends(_require_role("seller", "admin"))):
    seller_id = payload["sub"]
    seller = await users_col().find_one({"_id": ObjectId(seller_id)})
    seller_name = seller["name"] if seller else "Brand Partner"

    now = datetime.now(timezone.utc)
    ends_at = now + timedelta(days=body.duration_days)

    doc = {
        "title":        body.title,
        "price":        f"${body.price}" if not body.price.startswith("$") else body.price,
        "offer":        _offer_label(body.offer_type),
        "description":  body.description,
        "image":        body.image or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "category":     body.category,
        "winners":      body.winners,
        "participants": 0,
        "status":       "pending",
        "seller_id":    seller_id,
        "seller_name":  seller_name,
        "brand":        seller_name,
        "urgent":       False,
        "rating":       0.0,
        "total_ratings": 0,
        "terms": [
            "Valid for Indian residents only (18+)",
            "One entry per person",
            "Winner contacted within 48 hours of draw",
        ],
        "draw_date": ends_at.strftime("%b %d, %Y").replace(" 0", " ") if hasattr(ends_at, "strftime") else "TBD",
        "ends_at":   ends_at,
        "created_at": now,
        "time_left": _time_left(ends_at),
    }
    result = await campaigns_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return CampaignDetail(**_fmt(doc))


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.patch("/{campaign_id}/approve")
async def approve_campaign(campaign_id: str, payload: dict = Depends(_require_role("admin"))):
    try:
        oid = ObjectId(campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    campaign = await campaigns_col().find_one({"_id": oid})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await campaigns_col().update_one({"_id": oid}, {"$set": {"status": "active"}})

    # Notify seller (fire-and-forget)
    if campaign.get("seller_id"):
        seller = await users_col().find_one({"_id": ObjectId(campaign["seller_id"])})
        if seller:
            mailer.fire(mailer.send_campaign_live(
                seller_email=seller["email"],
                seller_name=seller["name"],
                campaign_title=campaign["title"],
                campaign_id=str(campaign["_id"]),
            ))
    return {"status": "approved"}


@router.patch("/{campaign_id}/reject")
async def reject_campaign(campaign_id: str, payload: dict = Depends(_require_role("admin"))):
    try:
        oid = ObjectId(campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    r = await campaigns_col().update_one({"_id": oid}, {"$set": {"status": "rejected"}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "rejected"}


@router.post("/{campaign_id}/draw", response_model=list[WinnerOut])
async def draw_winners(campaign_id: str, payload: dict = Depends(_require_role("admin"))):
    try:
        oid = ObjectId(campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

    campaign = await campaigns_col().find_one({"_id": oid})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.get("winner_drawn"):
        raise HTTPException(status_code=409, detail="Winners already drawn for this campaign")

    n_winners = campaign.get("winners", 1)
    pipeline = [
        {"$match": {"campaign_id": campaign_id, "entry_status": "Active"}},
        {"$sample": {"size": n_winners}},
    ]
    winners = []
    drawn_at = datetime.now(timezone.utc).isoformat()

    async for entry in entries_col().aggregate(pipeline):
        await entries_col().update_one({"_id": entry["_id"]}, {"$set": {"entry_status": "Won"}})
        w = WinnerOut(
            entry_id=str(entry["_id"]),
            user_id=entry.get("user_id", ""),
            name=entry.get("name", ""),
            email=entry.get("email", ""),
            city=entry.get("city", ""),
            campaign_title=campaign["title"],
            drawn_at=drawn_at,
        )
        winners.append(w)
        # Notify winner (fire-and-forget)
        mailer.fire(mailer.send_winner_notification(
            name=w.name,
            email=w.email,
            campaign_title=campaign["title"],
            prize=campaign.get("price", ""),
        ))

    await entries_col().update_many(
        {"campaign_id": campaign_id, "entry_status": "Active"},
        {"$set": {"entry_status": "Lost"}},
    )
    await campaigns_col().update_one({"_id": oid}, {"$set": {"status": "ended", "winner_drawn": True}})

    return winners
