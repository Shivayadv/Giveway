from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import brands_col
from models.brand import BrandOut
from utils.security import decode_token

router = APIRouter(prefix="/api/brands", tags=["brands"])
bearer = HTTPBearer()


def _require_seller(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") not in ("seller", "admin"):
        raise HTTPException(status_code=403, detail="Seller access required")
    return payload


@router.get("/me", response_model=BrandOut)
async def get_my_brand(payload: dict = Depends(_require_seller)):
    brand = await brands_col().find_one({"user_id": payload["sub"]})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return BrandOut(
        id=str(brand["_id"]),
        name=brand["name"],
        category=brand["category"],
        website=brand.get("website"),
        is_verified=brand["is_verified"],
        user_id=str(brand["user_id"]),
    )
