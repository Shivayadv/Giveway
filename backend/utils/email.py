import os
import asyncio
import httpx

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "GiveAwayLead <noreply@giveway.com>")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


async def _send(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        return False
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html},
            )
            return r.status_code in (200, 201)
    except Exception:
        return False


def fire(coro):
    """Fire-and-forget: schedule email without blocking the request."""
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(coro)
    except Exception:
        pass


async def send_entry_confirmation(
    name: str,
    email: str,
    campaign_id: str,
    campaign_title: str,
    prize: str,
    draw_date: str,
    referral_code: str,
):
    share_url = f"{APP_URL}/campaigns/{campaign_id}?ref={referral_code}"
    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f0f0f;color:#f5f5f5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#f97316,#f59e0b);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:28px;color:#fff">You&apos;re Entered!</h1>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px">Hi <strong>{name}</strong>,</p>
        <p>You&apos;ve successfully entered <strong>{campaign_title}</strong> for a chance to win <strong>{prize}</strong>.</p>
        <p><strong>Draw Date:</strong> {draw_date}</p>
        <hr style="border-color:#333;margin:24px 0"/>
        <p style="font-weight:600;font-size:15px">Boost your chances — share your referral link!</p>
        <p style="font-size:13px;color:#aaa">Every friend who enters through your link increases your visibility on the leaderboard.</p>
        <a href="{share_url}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#f97316;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">
          Share My Link
        </a>
        <p style="font-size:12px;color:#666;margin-top:24px">Or copy: {share_url}</p>
        <hr style="border-color:#333;margin:24px 0"/>
        <p style="font-size:13px;color:#888">Good luck! — The GiveAwayLead Team</p>
      </div>
    </div>
    """
    await _send(email, f"You're entered in {campaign_title}!", html)


async def send_winner_notification(name: str, email: str, campaign_title: str, prize: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f0f0f;color:#f5f5f5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:32px;color:#fff">You WON!</h1>
        <p style="margin:8px 0 0;color:#bbf7d0;font-size:16px">Congratulations!</p>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px">Hi <strong>{name}</strong>,</p>
        <p>You&apos;ve <strong>WON</strong> the <strong>{campaign_title}</strong> giveaway!</p>
        <p style="font-size:24px;font-weight:900;color:#f97316">{prize}</p>
        <p>Our team will contact you within 48 hours to arrange delivery of your prize.</p>
        <hr style="border-color:#333;margin:24px 0"/>
        <p style="font-size:13px;color:#888">— The GiveAwayLead Team</p>
      </div>
    </div>
    """
    await _send(email, f"You won {campaign_title}!", html)


async def send_ending_soon(name: str, email: str, campaign_id: str, campaign_title: str, prize: str, hours_left: int):
    url = f"{APP_URL}/campaigns/{campaign_id}"
    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f0f0f;color:#f5f5f5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:26px;color:#fff">Only {hours_left}h Left!</h1>
        <p style="margin:8px 0 0;color:#fecaca;font-size:14px">The draw is almost here</p>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>{name}</strong>,</p>
        <p>The <strong>{campaign_title}</strong> giveaway closes in <strong>{hours_left} hours</strong>!</p>
        <p style="font-size:22px;font-weight:900;color:#f97316">{prize}</p>
        <p>You&apos;re entered — share your referral link now to boost your visibility on the leaderboard before time runs out.</p>
        <a href="{url}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#ef4444;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">
          View Campaign
        </a>
        <hr style="border-color:#333;margin:24px 0"/>
        <p style="font-size:13px;color:#888">Good luck! — The GiveAwayLead Team</p>
      </div>
    </div>
    """
    await _send(email, f"Only {hours_left}h left — {campaign_title} draw is closing!", html)


async def send_campaign_live(seller_email: str, seller_name: str, campaign_title: str, campaign_id: str):
    url = f"{APP_URL}/campaigns/{campaign_id}"
    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f0f0f;color:#f5f5f5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#f97316,#f59e0b);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:26px;color:#fff">Your Campaign is Live!</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>{seller_name}</strong>,</p>
        <p>Your campaign <strong>{campaign_title}</strong> has been approved and is now live on GiveAwayLead.</p>
        <a href="{url}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#f97316;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">
          View Campaign
        </a>
        <hr style="border-color:#333;margin:24px 0"/>
        <p style="font-size:13px;color:#888">— The GiveAwayLead Team</p>
      </div>
    </div>
    """
    await _send(seller_email, f"Your campaign '{campaign_title}' is live!", html)
