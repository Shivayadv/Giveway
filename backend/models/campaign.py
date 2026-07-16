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


class EntryCreate(BaseModel):
    campaign_id: str
    name: str
    email: str
    phone: str
    city: str


class EntryOut(BaseModel):
    id: str
    campaign_id: str
    campaign_title: str
    prize: str
    joined_at: str
    draw_date: str
    entry_status: str  # Active | Won | Lost
