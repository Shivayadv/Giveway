from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import brands_col, users_col
from models.user import TokenResponse, UserLogin, UserOut, UserRegister
from utils.security import (
    create_access_token,
    decode_token,
    generate_referral_code,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


def _user_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        phone=doc["phone"],
        role=doc["role"],
        referral_code=doc["referral_code"],
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister):
    col = users_col()

    if await col.find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    referral_code = generate_referral_code(body.name)
    now = datetime.now(timezone.utc)

    user_doc = {
        "name": body.name,
        "email": body.email,
        "phone": body.phone,
        "password_hash": hash_password(body.password),
        "role": body.role,
        "referral_code": referral_code,
        "referred_by": None,
        "streak": 0,
        "total_wins": 0,
        "total_entries": 0,
        "is_verified": False,
        "is_banned": False,
        "created_at": now,
        "last_login": now,
    }

    result = await col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    if body.role == "seller":
        if not body.brand_name:
            raise HTTPException(status_code=422, detail="brand_name is required for sellers")
        await brands_col().insert_one(
            {
                "name": body.brand_name,
                "email": body.email,
                "phone": body.phone,
                "logo": None,
                "website": body.brand_website,
                "category": body.brand_category or "General",
                "is_verified": False,
                "is_approved": False,
                "user_id": result.inserted_id,
                "campaigns_run": 0,
                "total_leads_generated": 0,
                "created_at": now,
            }
        )

    token = create_access_token(
        {"sub": str(result.inserted_id), "email": body.email, "name": body.name, "role": body.role}
    )
    return TokenResponse(access_token=token, user=_user_out(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    col = users_col()
    user = await col.find_one({"email": body.email})

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("is_banned"):
        raise HTTPException(status_code=403, detail="Account suspended")

    await col.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.now(timezone.utc)}})

    token = create_access_token(
        {"sub": str(user["_id"]), "email": user["email"], "name": user["name"], "role": user["role"]}
    )
    return TokenResponse(access_token=token, user=_user_out(user))


@router.get("/me", response_model=UserOut)
async def me(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await users_col().find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return _user_out(user)
