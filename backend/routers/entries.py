from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import StreamingResponse
import csv
import io

from database import campaigns_col, entries_col
from models.campaign import EntryCreate, EntryOut, LeadOut
from utils.security import decode_token

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
    writer.writerow(["Name", "Email", "Phone", "City", "Campaign", "Joined At", "Status"])
    async for e in entries_col().find({"campaign_id": campaign_id}).sort("joined_at", -1):
        writer.writerow([
            e.get("name", ""),
            e.get("email", ""),
            e.get("phone", ""),
            e.get("city", ""),
            e.get("campaign_title", ""),
            e.get("joined_at", ""),
            e.get("entry_status", "Active"),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leads-{campaign_id}.csv"},
    )


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

    # Increment participant count
    await campaigns_col().update_one({"_id": oid}, {"$inc": {"participants": 1}})

    return EntryOut(
        id=str(result.inserted_id),
        campaign_id=body.campaign_id,
        campaign_title=campaign["title"],
        prize=campaign.get("price", ""),
        joined_at=now,
        draw_date=campaign.get("draw_date", "TBD"),
        entry_status="Active",
    )
