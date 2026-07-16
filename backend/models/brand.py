from pydantic import BaseModel
from typing import Optional


class BrandOut(BaseModel):
    id: str
    name: str
    category: str
    website: Optional[str] = None
    is_verified: bool
    user_id: str
