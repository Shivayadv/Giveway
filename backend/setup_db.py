"""
Run once after setting MONGODB_URI in backend/.env

  cd backend
  venv/Scripts/python setup_db.py

Creates all collections, indexes, validators, and seed data.
"""

import asyncio
import random
import string
from datetime import datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from utils.security import hash_password, generate_referral_code

NOW = datetime.now(timezone.utc)


# -- helpers ------------------------------------------------------------------

def ts(days_offset: int = 0) -> datetime:
    return NOW + timedelta(days=days_offset)


def rand_code(prefix=""):
    return prefix + "".join(random.choices(string.ascii_uppercase + string.digits, k=5))


# -- collection validators (JSON Schema) --------------------------------------

VALIDATORS = {
    "users": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "email", "phone", "password_hash", "role"],
            "properties": {
                "name":          {"bsonType": "string"},
                "email":         {"bsonType": "string"},
                "phone":         {"bsonType": "string"},
                "password_hash": {"bsonType": "string"},
                "role":          {"enum": ["user", "seller", "admin"]},
                "referral_code": {"bsonType": "string"},
                "streak":        {"bsonType": "int"},
                "total_wins":    {"bsonType": "int"},
                "total_entries": {"bsonType": "int"},
                "is_verified":   {"bsonType": "bool"},
                "is_banned":     {"bsonType": "bool"},
            },
        }
    },
    "brands": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "email", "category", "user_id"],
            "properties": {
                "name":        {"bsonType": "string"},
                "email":       {"bsonType": "string"},
                "category":    {"bsonType": "string"},
                "is_verified": {"bsonType": "bool"},
                "is_approved": {"bsonType": "bool"},
            },
        }
    },
    "campaigns": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["title", "brand_id", "products", "total_winners", "status", "starts_at", "ends_at"],
            "properties": {
                "title":         {"bsonType": "string"},
                "slug":          {"bsonType": "string"},
                "status":        {"enum": ["draft", "pending", "active", "drawing", "ended"]},
                "total_winners": {"bsonType": "int"},
                "total_entries": {"bsonType": "int"},
                "winner_drawn":  {"bsonType": "bool"},
            },
        }
    },
    "entries": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["campaign_id", "name", "email", "phone", "entered_at"],
            "properties": {
                "name":            {"bsonType": "string"},
                "email":           {"bsonType": "string"},
                "phone":           {"bsonType": "string"},
                "total_weight":    {"bsonType": "int"},
                "is_winner":       {"bsonType": "bool"},
                "is_disqualified": {"bsonType": "bool"},
            },
        }
    },
    "winners": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["campaign_id", "entry_id", "name", "email", "drawn_at"],
            "properties": {
                "name":              {"bsonType": "string"},
                "email":             {"bsonType": "string"},
                "shipping_status":   {"enum": ["pending", "shipped", "delivered"]},
                "notified_email":    {"bsonType": "bool"},
                "notified_whatsapp": {"bsonType": "bool"},
            },
        }
    },
    "referrals": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["referrer_user_id", "referred_entry_id", "campaign_id"],
        }
    },
    "notifications": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id", "type", "title"],
            "properties": {
                "type":    {"enum": ["winner", "reminder", "new_campaign", "almost_won"]},
                "is_read": {"bsonType": "bool"},
            },
        }
    },
    "admin_logs": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["admin_id", "action", "target_id"],
            "properties": {
                "action": {
                    "enum": [
                        "approved_campaign", "rejected_campaign",
                        "banned_user", "drew_winners", "disqualified_entry",
                    ]
                },
            },
        }
    },
}


# -- indexes -------------------------------------------------------------------

async def create_indexes(db):
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("referral_code", unique=True)

    await db["brands"].create_index("user_id", unique=True)
    await db["brands"].create_index("email")

    await db["campaigns"].create_index("slug", unique=True)
    await db["campaigns"].create_index([("status", 1), ("ends_at", 1)])
    await db["campaigns"].create_index([("brand_id", 1), ("status", 1)])

    # Prevent duplicate entries: one email per campaign
    await db["entries"].create_index(
        [("campaign_id", 1), ("email", 1)], unique=True
    )
    await db["entries"].create_index([("campaign_id", 1), ("ip_address", 1)])
    await db["entries"].create_index("campaign_id")

    await db["winners"].create_index("campaign_id")
    await db["winners"].create_index("entry_id", unique=True)

    await db["referrals"].create_index([("referrer_user_id", 1), ("campaign_id", 1)])
    await db["referrals"].create_index("referred_entry_id", unique=True)

    await db["notifications"].create_index([("user_id", 1), ("is_read", 1)])

    await db["admin_logs"].create_index([("target_id", 1), ("action", 1)])
    await db["admin_logs"].create_index("created_at")

    print("  [ok] Indexes created")


# -- collections ---------------------------------------------------------------

async def create_collections(db):
    existing = set(await db.list_collection_names())

    for name, validator in VALIDATORS.items():
        if name in existing:
            print(f"  · {name} already exists, skipping creation")
            await db.command(
                "collMod", name,
                validator=validator,
                validationLevel="moderate",
                validationAction="warn",
            )
        else:
            await db.create_collection(
                name,
                validator=validator,
                validationLevel="moderate",
                validationAction="warn",
            )
            print(f"  [ok] Created collection: {name}")


# -- seed data -----------------------------------------------------------------

async def seed_admin(db):
    users = db["users"]
    if await users.find_one({"email": settings.admin_email}):
        print(f"  · Admin already exists ({settings.admin_email}), skipping")
        return None

    result = await users.insert_one({
        "name":          settings.admin_name,
        "email":         settings.admin_email,
        "phone":         "+91 00000 00000",
        "password_hash": hash_password(settings.admin_password),
        "role":          "admin",
        "referral_code": generate_referral_code("ADMIN"),
        "referred_by":   None,
        "streak":        0,
        "total_wins":    0,
        "total_entries": 0,
        "is_verified":   True,
        "is_banned":     False,
        "created_at":    NOW,
        "last_login":    NOW,
    })
    print(f"  [ok] Admin: {settings.admin_email}  /  {settings.admin_password}")
    return result.inserted_id


async def seed_sample_brand_and_seller(db):
    users = db["users"]
    brands = db["brands"]

    if await users.find_one({"email": "techcorp@example.com"}):
        print("  · Sample brand already exists, skipping")
        existing_brand = await brands.find_one({"email": "techcorp@example.com"})
        return existing_brand["_id"] if existing_brand else None

    seller_result = await users.insert_one({
        "name":          "Ravi Kumar",
        "email":         "techcorp@example.com",
        "phone":         "+91 99001 10001",
        "password_hash": hash_password("Brand@1234"),
        "role":          "seller",
        "referral_code": generate_referral_code("RAVI"),
        "referred_by":   None,
        "streak":        0,
        "total_wins":    0,
        "total_entries": 0,
        "is_verified":   True,
        "is_banned":     False,
        "created_at":    NOW,
        "last_login":    NOW,
    })

    brand_result = await brands.insert_one({
        "name":                  "TechCorp India",
        "email":                 "techcorp@example.com",
        "phone":                 "+91 99001 10001",
        "logo":                  None,
        "website":               "https://techcorp.example.com",
        "category":              "Electronics",
        "is_verified":           True,
        "is_approved":           True,
        "user_id":               seller_result.inserted_id,
        "campaigns_run":         0,
        "total_leads_generated": 0,
        "created_at":            NOW,
    })

    print(f"  [ok] Sample seller: techcorp@example.com  /  Brand@1234")
    return brand_result.inserted_id


async def seed_sample_campaigns(db, brand_id):
    campaigns = db["campaigns"]

    SAMPLE_CAMPAIGNS = [
        {
            "title":         "iPhone 15 Pro Max Giveaway",
            "slug":          "iphone-15-pro-max-giveaway",
            "description":   "Win the latest iPhone 15 Pro Max 256GB. Experience Dynamic Island, a 48MP camera, and A17 Pro chip.",
            "brand_id":      brand_id,
            "products": [{
                "name":     "iPhone 15 Pro Max 256GB",
                "image":    "https://images.unsplash.com/photo-1663465374413-83c103e2303c?w=800&q=80",
                "mrp":      159900,
                "quantity": 5,
            }],
            "total_winners": 5,
            "category":      "Electronics",
            "tags":          ["smartphone", "apple", "iphone"],
            "status":        "active",
            "starts_at":     ts(-1),
            "ends_at":       ts(2),
            "total_entries": 24531,
            "winner_drawn":  False,
            "draw_seed":     None,
            "terms":         ["Must be 18+", "India residents only", "One entry per person"],
            "share_text":    "Win a FREE iPhone 15 Pro Max! Join now →",
            "created_at":    ts(-2),
            "approved_at":   ts(-1),
        },
        {
            "title":         "Sony WH-1000XM5 Headphones",
            "slug":          "sony-wh-1000xm5-giveaway",
            "description":   "Industry-leading noise canceling headphones with Auto Noise Canceling Optimizer.",
            "brand_id":      brand_id,
            "products": [{
                "name":     "Sony WH-1000XM5",
                "image":    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
                "mrp":      29990,
                "quantity": 10,
            }],
            "total_winners": 10,
            "category":      "Electronics",
            "tags":          ["headphones", "sony", "audio"],
            "status":        "active",
            "starts_at":     ts(-2),
            "ends_at":       ts(0),
            "total_entries": 8204,
            "winner_drawn":  False,
            "draw_seed":     None,
            "terms":         ["Must be 18+", "India residents only"],
            "share_text":    "Win FREE Sony WH-1000XM5 headphones! Enter now →",
            "created_at":    ts(-3),
            "approved_at":   ts(-2),
        },
        {
            "title":         "MacBook Air M3 Giveaway",
            "slug":          "macbook-air-m3-giveaway",
            "description":   "MacBook Air powered by the M3 chip - faster, thinner, and with a brilliant Liquid Retina display.",
            "brand_id":      brand_id,
            "products": [{
                "name":     "MacBook Air M3 8GB 256GB",
                "image":    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
                "mrp":      114900,
                "quantity": 3,
            }],
            "total_winners": 3,
            "category":      "Electronics",
            "tags":          ["macbook", "apple", "laptop"],
            "status":        "pending",
            "starts_at":     ts(1),
            "ends_at":       ts(8),
            "total_entries": 0,
            "winner_drawn":  False,
            "draw_seed":     None,
            "terms":         ["Must be 18+", "India residents only"],
            "share_text":    "Win a FREE MacBook Air M3! Don't miss this →",
            "created_at":    ts(-1),
            "approved_at":   None,
        },
        {
            "title":         "PlayStation 5 Console Giveaway",
            "slug":          "ps5-console-giveaway",
            "description":   "PlayStation 5 with ultra-high speed SSD, haptic feedback, and 3D Audio.",
            "brand_id":      brand_id,
            "products": [{
                "name":     "Sony PlayStation 5",
                "image":    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
                "mrp":      54990,
                "quantity": 2,
            }],
            "total_winners": 2,
            "category":      "Gaming",
            "tags":          ["ps5", "playstation", "gaming", "sony"],
            "status":        "ended",
            "starts_at":     ts(-10),
            "ends_at":       ts(-3),
            "total_entries": 41902,
            "winner_drawn":  True,
            "draw_seed":     "sha256:a3f1b2c9d4e5f6a7b8c9d0e1f2a3b4c5",
            "terms":         ["Must be 18+", "India residents only"],
            "share_text":    "Win a FREE PS5! Enter now →",
            "created_at":    ts(-12),
            "approved_at":   ts(-11),
        },
    ]

    inserted = 0
    for c in SAMPLE_CAMPAIGNS:
        if await campaigns.find_one({"slug": c["slug"]}):
            continue
        await campaigns.insert_one(c)
        inserted += 1

    print(f"  [ok] Sample campaigns: {inserted} inserted")


async def seed_sample_users(db):
    users = db["users"]
    SAMPLE_USERS = [
        ("Rahul Sharma",  "rahul@example.com",  "+91 98765 43210", "Delhi"),
        ("Priya Patel",   "priya@example.com",  "+91 91234 56789", "Mumbai"),
        ("Amit Kumar",    "amit@example.com",   "+91 99887 76655", "Bangalore"),
        ("Neha Singh",    "neha@example.com",   "+91 98765 12345", "Pune"),
        ("Vikram Reddy",  "vikram@example.com", "+91 97777 88888", "Hyderabad"),
    ]
    inserted = 0
    for name, email, phone, city in SAMPLE_USERS:
        if await users.find_one({"email": email}):
            continue
        await users.insert_one({
            "name":          name,
            "email":         email,
            "phone":         phone,
            "password_hash": hash_password("User@1234"),
            "role":          "user",
            "referral_code": generate_referral_code(name),
            "referred_by":   None,
            "city":          city,
            "streak":        random.randint(0, 7),
            "total_wins":    random.randint(0, 2),
            "total_entries": random.randint(1, 15),
            "is_verified":   True,
            "is_banned":     False,
            "created_at":    ts(-random.randint(1, 30)),
            "last_login":    ts(-random.randint(0, 3)),
        })
        inserted += 1
    print(f"  [ok] Sample users: {inserted} inserted  (password: User@1234)")


# -- main ----------------------------------------------------------------------

async def main():
    print("\n GiveAwayLead - Database Setup")
    print(" ==============================\n")

    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client["giveway"]

    print("> Creating collections & validators...")
    await create_collections(db)

    print("\n> Creating indexes...")
    await create_indexes(db)

    print("\n> Seeding admin user...")
    await seed_admin(db)

    print("\n> Seeding sample brand & seller...")
    brand_id = await seed_sample_brand_and_seller(db)

    print("\n> Seeding sample campaigns...")
    if brand_id:
        await seed_sample_campaigns(db, brand_id)

    print("\n> Seeding sample users...")
    await seed_sample_users(db)

    print("\n Done! Collections in MongoDB Atlas → giveway database:\n")
    for name in await db.list_collection_names():
        count = await db[name].count_documents({})
        print(f"   {name:<20} {count} documents")

    print("\n Login credentials:")
    print(f"   Admin   → {settings.admin_email}  /  {settings.admin_password}")
    print("   Seller  → techcorp@example.com  /  Brand@1234")
    print("   Users   → rahul@example.com  /  User@1234  (and others)\n")

    client.close()


asyncio.run(main())

