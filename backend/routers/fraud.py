from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import entries_col
from utils.security import decode_token

router = APIRouter(prefix="/api/admin/fraud", tags=["fraud"])
bearer = HTTPBearer()


def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload


@router.get("/suspicious")
async def suspicious_entries(payload: dict = Depends(_require_admin)):
    """
    Finds entries with duplicate phone or email across different users,
    indicating potential fraud (one person entering under multiple accounts).
    """

    # Duplicate phones — same phone, different user_ids
    phone_pipeline = [
        {"$match": {"phone": {"$ne": "", "$exists": True}}},
        {"$group": {
            "_id": "$phone",
            "user_ids": {"$addToSet": "$user_id"},
            "entry_ids": {"$push": {"id": {"$toString": "$_id"}, "name": "$name", "email": "$email", "campaign": "$campaign_title", "joined_at": "$joined_at"}},
            "count": {"$sum": 1},
        }},
        {"$match": {"$expr": {"$gt": [{"$size": "$user_ids"}, 1]}}},
        {"$sort": {"count": -1}},
        {"$limit": 50},
    ]

    # Duplicate emails — same email, different user_ids
    email_pipeline = [
        {"$match": {"email": {"$ne": "", "$exists": True}}},
        {"$group": {
            "_id": "$email",
            "user_ids": {"$addToSet": "$user_id"},
            "entry_ids": {"$push": {"id": {"$toString": "$_id"}, "name": "$name", "phone": "$phone", "campaign": "$campaign_title", "joined_at": "$joined_at"}},
            "count": {"$sum": 1},
        }},
        {"$match": {"$expr": {"$gt": [{"$size": "$user_ids"}, 1]}}},
        {"$sort": {"count": -1}},
        {"$limit": 50},
    ]

    phone_dupes = []
    async for row in entries_col().aggregate(phone_pipeline):
        phone_dupes.append({
            "type":    "duplicate_phone",
            "value":   row["_id"],
            "count":   row["count"],
            "entries": row["entry_ids"][:5],
        })

    email_dupes = []
    async for row in entries_col().aggregate(email_pipeline):
        email_dupes.append({
            "type":    "duplicate_email",
            "value":   row["_id"],
            "count":   row["count"],
            "entries": row["entry_ids"][:5],
        })

    return {
        "duplicate_phones": phone_dupes,
        "duplicate_emails": email_dupes,
        "total_suspicious": len(phone_dupes) + len(email_dupes),
    }


@router.patch("/disqualify/{entry_id}")
async def disqualify_entry(entry_id: str, payload: dict = Depends(_require_admin)):
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid entry ID")

    r = await entries_col().update_one(
        {"_id": oid},
        {"$set": {"entry_status": "Disqualified"}},
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")

    return {"status": "disqualified"}
