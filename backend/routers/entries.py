from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import campaigns_col, entries_col
from models.campaign import EntryCreate, EntryOut
from utils.security import decode_token

router = APIRouter(prefix="/api/entries", tags=["entries"])
bearer = HTTPBearer()


def _get_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


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
            draw_date=e.get("draw_date", ""),
            entry_status=e.get("entry_status", "Active"),
        ))
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

    existing = await entries_col().find_one({"campaign_id": body.campaign_id, "user_id": user_id})
    if existing:
        raise HTTPException(status_code=409, detail="Already entered this campaign")

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
    }
    result = await entries_col().insert_one(doc)
    return EntryOut(
        id=str(result.inserted_id),
        campaign_id=body.campaign_id,
        campaign_title=campaign["title"],
        prize=campaign.get("price", ""),
        joined_at=now,
        draw_date=campaign.get("draw_date", "TBD"),
        entry_status="Active",
    )
