from pydantic import BaseModel
from typing import List, Optional


class CampaignOut(BaseModel):
    id: str
    title: str
    image: str
    price: str
    offer: str
    participants: int
    time_left: str
    brand: str
    category: str
    urgent: bool
    winners: int
    status: str


class CampaignDetail(CampaignOut):
    description: str
    terms: List[str]
    rating: float
    total_ratings: int
    draw_date: Optional[str] = "TBD"
    seller_id: Optional[str] = None


class CampaignCreate(BaseModel):
    title: str
    price: str
    description: str
    image: str = ""
    category: str = "Electronics"
    duration_days: int = 7
    winners: int = 1
    offer_type: str = "free"  # free | discount | bogo


class EntryCreate(BaseModel):
    campaign_id: str
    name: str
    email: str
    phone: str
    city: str
    ref_code: str = ""  # referral code of the person who shared the link


class EntryOut(BaseModel):
    id: str
    campaign_id: str
    campaign_title: str
    prize: str
    joined_at: str
    draw_date: str
    entry_status: str  # Active | Won | Lost


class LeadOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    city: str
    campaign_title: str
    joined_at: str
    entry_status: str


class WinnerOut(BaseModel):
    entry_id: str
    user_id: str
    name: str
    email: str
    city: str
    campaign_title: str
    drawn_at: str
