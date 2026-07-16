from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from database import campaigns_col, entries_col
from models.campaign import CampaignOut, CampaignDetail

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


def _fmt(c: dict) -> dict:
    c["id"] = str(c.pop("_id"))
    return c


@router.get("", response_model=list[CampaignOut])
async def list_campaigns(
    featured: bool = Query(False, description="Return only 3 most popular campaigns"),
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

    # Refresh live participant count from entries
    count = await entries_col().count_documents({"campaign_id": campaign_id})
    if count:
        c["participants"] = count

    return CampaignDetail(**_fmt(c))
