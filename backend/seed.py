"""Run once: python seed.py — creates admin, demo users, campaigns, and entries."""

import asyncio
import ssl
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient

from config import settings
from utils.security import generate_referral_code, hash_password

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

CAMPAIGNS = [
    {
        "title": "iPhone 16 Pro Max Giveaway",
        "image": "https://images.unsplash.com/photo-1696446701796-da61d14c7a29?w=800&q=80",
        "price": "₹1,42,900",
        "offer": "Win a brand-new iPhone 16 Pro Max 1TB in Titanium Black",
        "participants": 12847,
        "time_left": "2d 14h",
        "brand": "TechCorp India",
        "category": "Electronics",
        "urgent": True,
        "winners": 1,
        "status": "active",
        "description": "Enter for your chance to win the all-new iPhone 16 Pro Max with 1TB storage. Powered by Apple Intelligence, the A18 Pro chip, and a stunning 6.9-inch ProMotion display. This is the most powerful iPhone ever made.",
        "terms": [
            "Valid for Indian residents only (18+)",
            "One entry per person",
            "Winner contacted within 48 hours of draw",
            "Prize non-transferable and non-refundable",
            "Draw date: Aug 1, 2026",
        ],
        "rating": 4.9,
        "total_ratings": 2341,
        "draw_date": "Aug 1, 2026",
        "seller_id": "admin",
    },
    {
        "title": "Sony PlayStation 5 Bundle",
        "image": "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80",
        "price": "₹54,990",
        "offer": "Win a PS5 Slim + DualSense Controller + 3 AAA Games",
        "participants": 9234,
        "time_left": "5d 8h",
        "brand": "GameZone",
        "category": "Gaming",
        "urgent": False,
        "winners": 2,
        "status": "active",
        "description": "Score the ultimate gaming setup with a PS5 Slim console, extra DualSense Wireless Controller in Cobalt Blue, and your choice of 3 AAA game titles from our catalog.",
        "terms": [
            "Valid for Indian residents only (18+)",
            "Winner selects 3 games from approved list",
            "Draw date: Aug 10, 2026",
            "One entry per household",
        ],
        "rating": 4.8,
        "total_ratings": 1876,
        "draw_date": "Aug 10, 2026",
        "seller_id": "admin",
    },
    {
        "title": "MacBook Pro 14\" M4 Giveaway",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "price": "₹1,99,900",
        "offer": "Win a MacBook Pro 14\" M4 chip, 32GB RAM, 1TB SSD",
        "participants": 7891,
        "time_left": "3d 2h",
        "brand": "TechCorp India",
        "category": "Electronics",
        "urgent": True,
        "winners": 1,
        "status": "active",
        "description": "The MacBook Pro 14\" with the M4 chip is a powerhouse for creative professionals. Features 32GB unified memory, 1TB SSD, and the stunning Liquid Retina XDR display.",
        "terms": [
            "Valid for Indian residents only (18+)",
            "Winner must provide valid Indian shipping address",
            "Draw date: Jul 28, 2026",
            "Prize includes standard AppleCare",
        ],
        "rating": 4.9,
        "total_ratings": 3102,
        "draw_date": "Jul 28, 2026",
        "seller_id": "admin",
    },
    {
        "title": "Nike Air Jordan 1 Retro High",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "price": "₹15,000",
        "offer": "Win limited-edition Air Jordan 1 Retro High OG Chicago",
        "participants": 5423,
        "time_left": "7d 0h",
        "brand": "SneakerHub",
        "category": "Fashion",
        "urgent": False,
        "winners": 3,
        "status": "active",
        "description": "Cop the most iconic sneaker of all time. The Air Jordan 1 Retro High OG in the legendary Chicago colorway. Three winners will be selected to receive a pair in their size.",
        "terms": [
            "Indian residents only (18+)",
            "Winner specifies size at time of entry",
            "Size availability not guaranteed for all winners",
            "Draw date: Aug 15, 2026",
        ],
        "rating": 4.7,
        "total_ratings": 987,
        "draw_date": "Aug 15, 2026",
        "seller_id": "admin",
    },
    {
        "title": "Dyson Airwrap Complete Styler",
        "image": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80",
        "price": "₹44,900",
        "offer": "Win the Dyson Airwrap Complete Styler + Carry Bag",
        "participants": 8102,
        "time_left": "4d 16h",
        "brand": "BeautyElite",
        "category": "Beauty",
        "urgent": False,
        "winners": 1,
        "status": "active",
        "description": "The Dyson Airwrap Complete Styler uses Coanda airflow to curl, wave, smooth, and dry hair simultaneously — without extreme heat. Includes 8 styling attachments and premium carry bag.",
        "terms": [
            "Indian residents only (18+)",
            "One entry per email address",
            "Draw date: Aug 5, 2026",
            "No purchase necessary",
        ],
        "rating": 4.8,
        "total_ratings": 1543,
        "draw_date": "Aug 5, 2026",
        "seller_id": "admin",
    },
    {
        "title": "Samsung 85\" 4K Neo QLED TV",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
        "price": "₹2,10,000",
        "offer": "Win a Samsung 85\" 4K Neo QLED Smart TV with installation",
        "participants": 4318,
        "time_left": "9d 3h",
        "brand": "HomeVision",
        "category": "Home",
        "urgent": False,
        "winners": 1,
        "status": "active",
        "description": "Transform your living room with the Samsung 85\" Neo QLED 4K TV. Quantum Matrix Technology, Neural Quantum Processor 4K, and Dolby Atmos sound. Professional installation included.",
        "terms": [
            "Indian residents only (18+)",
            "Professional installation included across India",
            "Winner must provide valid Indian address for delivery",
            "Draw date: Aug 20, 2026",
        ],
        "rating": 4.6,
        "total_ratings": 734,
        "draw_date": "Aug 20, 2026",
        "seller_id": "admin",
    },
]

DEMO_USERS = [
    {
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "phone": "+91 98765 43210",
        "role": "user",
    },
    {
        "name": "Priya Patel",
        "email": "priya@example.com",
        "phone": "+91 91234 56789",
        "role": "user",
    },
    {
        "name": "Arjun Singh",
        "email": "arjun@example.com",
        "phone": "+91 99887 76655",
        "role": "seller",
    },
]


async def seed():
    import certifi
    client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())
    db = client["giveway"]
    users      = db["users"]
    entries    = db["entries"]
    campaigns  = db["campaigns"]

    # ── indexes ──────────────────────────────────────────────────────────────
    await users.create_index("email", unique=True)
    await users.create_index("referral_code", unique=True)
    await entries.create_index([("campaign_id", 1), ("user_id", 1)], unique=True)

    # ── admin ─────────────────────────────────────────────────────────────────
    existing_admin = await users.find_one({"email": settings.admin_email})
    if not existing_admin:
        await users.insert_one({
            "name": settings.admin_name,
            "email": settings.admin_email,
            "phone": "+91 80000 00000",
            "password_hash": hash_password(settings.admin_password),
            "role": "admin",
            "referral_code": generate_referral_code("ADMIN"),
            "referred_by": None,
            "streak": 0,
            "total_wins": 0,
            "total_entries": 0,
            "is_verified": True,
            "is_banned": False,
            "created_at": datetime.now(timezone.utc),
            "last_login":  datetime.now(timezone.utc),
        })
        print(f"Admin created: {settings.admin_email} / {settings.admin_password}")
    else:
        print("Admin already exists, skipping.")

    # ── demo users ────────────────────────────────────────────────────────────
    demo_user_ids: dict[str, str] = {}
    for u in DEMO_USERS:
        existing = await users.find_one({"email": u["email"]})
        if not existing:
            result = await users.insert_one({
                "name":          u["name"],
                "email":         u["email"],
                "phone":         u["phone"],
                "password_hash": hash_password("Demo@1234"),
                "role":          u["role"],
                "referral_code": generate_referral_code(u["name"][:4].upper()),
                "referred_by":   None,
                "streak":        0,
                "total_wins":    0,
                "total_entries": 0,
                "is_verified":   True,
                "is_banned":     False,
                "created_at":    datetime.now(timezone.utc),
                "last_login":    datetime.now(timezone.utc),
            })
            demo_user_ids[u["email"]] = str(result.inserted_id)
            print(f"Demo user created: {u['email']}")
        else:
            demo_user_ids[u["email"]] = str(existing["_id"])
            print(f"Demo user already exists: {u['email']}")

    # ── campaigns ─────────────────────────────────────────────────────────────
    existing_count = await campaigns.count_documents({})
    if existing_count == 0:
        result = await campaigns.insert_many(CAMPAIGNS)
        print(f"Inserted {len(result.inserted_ids)} campaigns.")
        campaign_ids = [str(oid) for oid in result.inserted_ids]
    else:
        campaign_ids = []
        async for c in campaigns.find({}, {"_id": 1}):
            campaign_ids.append(str(c["_id"]))
        print(f"Campaigns already exist ({len(campaign_ids)}), skipping insert.")

    # ── entries (demo participations) ─────────────────────────────────────────
    rahul_id  = demo_user_ids.get("rahul@example.com")
    priya_id  = demo_user_ids.get("priya@example.com")
    now_iso   = datetime.now(timezone.utc).isoformat()

    demo_entries = []
    for i, (user_id, user_name, user_email) in enumerate([
        (rahul_id, "Rahul Sharma", "rahul@example.com"),
        (priya_id, "Priya Patel",  "priya@example.com"),
    ]):
        if not user_id:
            continue
        for j, cid in enumerate(campaign_ids[:3]):
            c_data = CAMPAIGNS[j]
            existing_entry = await entries.find_one({"campaign_id": cid, "user_id": user_id})
            if not existing_entry:
                demo_entries.append({
                    "campaign_id":    cid,
                    "campaign_title": c_data["title"],
                    "prize":          c_data["price"],
                    "user_id":        user_id,
                    "name":           user_name,
                    "email":          user_email,
                    "phone":          "+91 98765 43210",
                    "city":           "Mumbai" if i == 0 else "Bengaluru",
                    "joined_at":      now_iso,
                    "draw_date":      c_data.get("draw_date", "TBD"),
                    "entry_status":   "Active",
                })

    if demo_entries:
        await entries.insert_many(demo_entries)
        print(f"Inserted {len(demo_entries)} demo entries.")
    else:
        print("Demo entries already exist, skipping.")

    client.close()
    print("\nSeed complete.")


asyncio.run(seed())
