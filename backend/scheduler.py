from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from database import campaigns_col, entries_col
from utils import email as mailer

scheduler = AsyncIOScheduler(timezone="UTC")


async def check_ending_soon():
    """
    Runs every hour. Finds active campaigns ending within 24 hours
    that haven't had a reminder sent yet, then emails all active entrants.
    """
    now = datetime.now(timezone.utc)
    window_start = now
    window_end   = now + timedelta(hours=24)

    async for campaign in campaigns_col().find({
        "status":        "active",
        "reminder_sent": {"$ne": True},
        "ends_at":       {"$gte": window_start, "$lte": window_end},
    }):
        campaign_id    = str(campaign["_id"])
        campaign_title = campaign.get("title", "")
        prize          = campaign.get("price", "")
        ends_at        = campaign["ends_at"]

        if ends_at.tzinfo is None:
            ends_at = ends_at.replace(tzinfo=timezone.utc)
        hours_left = max(1, int((ends_at - now).total_seconds() // 3600))

        # Mark reminder sent first to prevent duplicates if job overlaps
        await campaigns_col().update_one(
            {"_id": campaign["_id"]},
            {"$set": {"reminder_sent": True}},
        )

        # Email every active entrant
        async for entry in entries_col().find({"campaign_id": campaign_id, "entry_status": "Active"}):
            mailer.fire(mailer.send_ending_soon(
                name=entry.get("name", ""),
                email=entry.get("email", ""),
                campaign_id=campaign_id,
                campaign_title=campaign_title,
                prize=prize,
                hours_left=hours_left,
            ))


def start():
    scheduler.add_job(
        check_ending_soon,
        trigger="interval",
        hours=1,
        id="ending_soon_reminder",
        replace_existing=True,
        next_run_time=datetime.now(timezone.utc),  # run once on startup, then every hour
    )
    scheduler.start()


def stop():
    scheduler.shutdown(wait=False)
