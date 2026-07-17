"""
GiveAwayLead — Autonomous Backend API Test Suite
Run: pytest tests/test_backend.py -v --tb=short
"""

import uuid
import time
import pytest
import requests

BASE = "http://localhost:8000"

# ── Unique run ID so parallel runs don't clash ─────────────────────────────
RUN = uuid.uuid4().hex[:8]
USER_EMAIL    = f"testuser_{RUN}@test.com"
SELLER_EMAIL  = f"testseller_{RUN}@test.com"
ADMIN_EMAIL   = "admin@giveway.com"          # seeded admin
ADMIN_PASSWORD = "Admin@1234"
PASSWORD      = "Test@1234"

# ── Shared state filled by fixtures ───────────────────────────────────────
state: dict = {}


# ═══════════════════════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

def register(email, role="user"):
    body = {
        "name": f"Test {role.title()} {RUN}",
        "email": email,
        "phone": "9876543210",
        "password": PASSWORD,
        "role": role,
    }
    if role == "seller":
        body["brand_name"] = f"Test Brand {RUN}"
    return requests.post(f"{BASE}/api/auth/register", json=body)

def login(email, password=PASSWORD):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        data = r.json()
        return data.get("access_token") or data.get("token", "")
    return ""


# ═══════════════════════════════════════════════════════════════════════════
#  FIXTURES
# ═══════════════════════════════════════════════════════════════════════════

@pytest.fixture(scope="session", autouse=True)
def setup_accounts():
    """Create user + seller accounts; login all three roles."""
    # User
    r = register(USER_EMAIL, "user")
    assert r.status_code in (201, 409), f"User register failed: {r.text}"
    state["user_token"] = login(USER_EMAIL)
    assert state["user_token"], "User login failed"

    # Seller
    r = register(SELLER_EMAIL, "seller")
    assert r.status_code in (201, 409), f"Seller register failed: {r.text}"
    state["seller_token"] = login(SELLER_EMAIL)
    assert state["seller_token"], "Seller login failed"

    # Admin (pre-seeded)
    state["admin_token"] = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not state["admin_token"]:
        pytest.skip("Admin account not seeded — run seed script first")

    yield


# ═══════════════════════════════════════════════════════════════════════════
#  AUTH TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestAuth:

    def test_register_user_success(self):
        email = f"newuser_{RUN}_reg@test.com"
        r = register(email, "user")
        assert r.status_code == 201
        data = r.json()
        assert "access_token" in data or "token" in data
        assert data.get("user", {}).get("role") == "user" or data.get("role") == "user"

    def test_register_duplicate_email(self):
        r = register(USER_EMAIL, "user")
        assert r.status_code == 409

    def test_register_missing_field(self):
        r = requests.post(f"{BASE}/api/auth/register", json={"email": "x@x.com"})
        assert r.status_code == 422

    def test_login_success(self):
        r = requests.post(f"{BASE}/api/auth/login", json={"email": USER_EMAIL, "password": PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data or "token" in data

    def test_login_wrong_password(self):
        r = requests.post(f"{BASE}/api/auth/login", json={"email": USER_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_unknown_email(self):
        r = requests.post(f"{BASE}/api/auth/login", json={"email": "nobody@nowhere.com", "password": PASSWORD})
        assert r.status_code == 401

    def test_me_with_valid_token(self):
        r = requests.get(f"{BASE}/api/auth/me", headers=auth_header(state["user_token"]))
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert "referral_code" in data
        assert "password_hash" not in data

    def test_me_without_token(self):
        r = requests.get(f"{BASE}/api/auth/me")
        assert r.status_code in (401, 403)

    def test_me_with_invalid_token(self):
        r = requests.get(f"{BASE}/api/auth/me", headers=auth_header("not.a.token"))
        assert r.status_code in (401, 403)

    def test_profile_update(self):
        r = requests.put(
            f"{BASE}/api/auth/profile",
            json={"name": f"Updated {RUN}", "phone": "9111111111", "city": "Mumbai"},
            headers=auth_header(state["user_token"]),
        )
        assert r.status_code == 200

    def test_user_cannot_access_seller_route(self):
        r = requests.get(f"{BASE}/api/campaigns/mine", headers=auth_header(state["user_token"]))
        assert r.status_code == 403

    def test_user_cannot_access_admin_route(self):
        r = requests.get(f"{BASE}/api/admin/users", headers=auth_header(state["user_token"]))
        assert r.status_code == 403

    def test_seller_cannot_access_admin_route(self):
        r = requests.get(f"{BASE}/api/admin/users", headers=auth_header(state["seller_token"]))
        assert r.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════
#  CAMPAIGNS TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestCampaigns:

    def test_list_active_campaigns(self):
        r = requests.get(f"{BASE}/api/campaigns")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_filter_by_category(self):
        r = requests.get(f"{BASE}/api/campaigns?category=Electronics")
        assert r.status_code == 200
        data = r.json()
        for c in data:
            assert c["category"] == "Electronics"

    def test_list_nonexistent_category_returns_empty(self):
        r = requests.get(f"{BASE}/api/campaigns?category=DoesNotExist_XYZ")
        assert r.status_code == 200
        assert r.json() == []

    def test_featured_limited_to_3(self):
        r = requests.get(f"{BASE}/api/campaigns?featured=true")
        assert r.status_code == 200
        assert len(r.json()) <= 3

    def test_get_campaign_invalid_id(self):
        r = requests.get(f"{BASE}/api/campaigns/not_an_id")
        assert r.status_code == 400

    def test_get_campaign_not_found(self):
        r = requests.get(f"{BASE}/api/campaigns/507f1f77bcf86cd799439011")
        assert r.status_code == 404

    def test_seller_creates_campaign(self):
        r = requests.post(
            f"{BASE}/api/campaigns",
            json={
                "title": f"Test Campaign {RUN}",
                "price": "5000",
                "description": "Autonomous test campaign",
                "category": "Electronics",
                "winners": 1,
                "duration_days": 7,
                "offer_type": "free",
            },
            headers=auth_header(state["seller_token"]),
        )
        assert r.status_code == 201
        data = r.json()
        assert data["status"] == "pending"
        state["campaign_id"] = data["id"]
        state["campaign_title"] = data["title"]

    def test_user_cannot_create_campaign(self):
        r = requests.post(
            f"{BASE}/api/campaigns",
            json={"title": "Hack", "price": "1", "description": "x", "category": "Other", "winners": 1, "duration_days": 1, "offer_type": "free"},
            headers=auth_header(state["user_token"]),
        )
        assert r.status_code == 403

    def test_create_campaign_missing_fields(self):
        r = requests.post(f"{BASE}/api/campaigns", json={"title": "No price"}, headers=auth_header(state["seller_token"]))
        assert r.status_code == 422

    def test_get_created_campaign(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign created")
        r = requests.get(f"{BASE}/api/campaigns/{cid}")
        assert r.status_code == 200
        assert r.json()["id"] == cid

    def test_seller_mine_includes_own_campaign(self):
        r = requests.get(f"{BASE}/api/campaigns/mine", headers=auth_header(state["seller_token"]))
        assert r.status_code == 200
        ids = [c["id"] for c in r.json()]
        assert state.get("campaign_id") in ids

    def test_pending_campaigns_visible_to_admin(self):
        r = requests.get(f"{BASE}/api/campaigns/pending", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200

    def test_admin_approves_campaign(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign created")
        r = requests.patch(f"{BASE}/api/campaigns/{cid}/approve", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        assert r.json()["status"] == "approved"
        state["campaign_active"] = True

    def test_campaign_now_active(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.get(f"{BASE}/api/campaigns/{cid}")
        assert r.json()["status"] == "active"

    def test_non_admin_cannot_approve(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.patch(f"{BASE}/api/campaigns/{cid}/approve", headers=auth_header(state["seller_token"]))
        assert r.status_code == 403

    def test_admin_rejects_separate_campaign(self):
        # Create another campaign and reject it
        r = requests.post(
            f"{BASE}/api/campaigns",
            json={"title": f"Reject Me {RUN}", "price": "100", "description": "x", "category": "Other", "winners": 1, "duration_days": 1, "offer_type": "free"},
            headers=auth_header(state["seller_token"]),
        )
        if r.status_code == 201:
            cid2 = r.json()["id"]
            r2 = requests.patch(f"{BASE}/api/campaigns/{cid2}/reject", headers=auth_header(state["admin_token"]))
            assert r2.status_code == 200
            assert r2.json()["status"] == "rejected"


# ═══════════════════════════════════════════════════════════════════════════
#  ENTRIES TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestEntries:

    def test_enter_active_campaign(self):
        cid = state.get("campaign_id")
        if not cid or not state.get("campaign_active"):
            pytest.skip("No active campaign")
        r = requests.post(
            f"{BASE}/api/entries",
            json={"campaign_id": cid, "name": f"Tester {RUN}", "email": USER_EMAIL, "phone": "9876543210", "city": "Delhi", "ref_code": ""},
            headers=auth_header(state["user_token"]),
        )
        assert r.status_code == 201
        data = r.json()
        assert data["campaign_id"] == cid
        state["entry_id"] = data["id"]

    def test_duplicate_entry_rejected(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.post(
            f"{BASE}/api/entries",
            json={"campaign_id": cid, "name": "Dup", "email": USER_EMAIL, "phone": "9876543210", "city": "Delhi", "ref_code": ""},
            headers=auth_header(state["user_token"]),
        )
        assert r.status_code == 409

    def test_enter_invalid_campaign_id(self):
        r = requests.post(
            f"{BASE}/api/entries",
            json={"campaign_id": "notanid", "name": "X", "email": "x@x.com", "phone": "1234567890", "city": "X", "ref_code": ""},
            headers=auth_header(state["user_token"]),
        )
        assert r.status_code == 400

    def test_enter_without_auth(self):
        r = requests.post(f"{BASE}/api/entries", json={"campaign_id": "abc", "name": "X", "email": "x@x.com", "phone": "123", "city": "X", "ref_code": ""})
        assert r.status_code in (401, 403)

    def test_my_entries(self):
        r = requests.get(f"{BASE}/api/entries/me", headers=auth_header(state["user_token"]))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = [e["id"] for e in data]
        if state.get("entry_id"):
            assert state["entry_id"] in ids

    def test_public_winners_list(self):
        r = requests.get(f"{BASE}/api/entries/winners")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_winners_limit_param(self):
        r = requests.get(f"{BASE}/api/entries/winners?limit=5")
        assert r.status_code == 200
        assert len(r.json()) <= 5

    def test_referral_leaderboard(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.get(f"{BASE}/api/entries/campaign/{cid}/leaderboard")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) <= 10

    def test_seller_gets_campaign_leads(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.get(f"{BASE}/api/entries/campaign/{cid}", headers=auth_header(state["seller_token"]))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_user_cannot_get_campaign_leads(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.get(f"{BASE}/api/entries/campaign/{cid}", headers=auth_header(state["user_token"]))
        assert r.status_code == 403

    def test_csv_export(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.get(f"{BASE}/api/entries/campaign/{cid}/csv", headers=auth_header(state["seller_token"]))
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert "Name" in r.text

    def test_draw_winners(self):
        cid = state.get("campaign_id")
        if not cid or not state.get("campaign_active"):
            pytest.skip("No active campaign")
        r = requests.post(f"{BASE}/api/campaigns/{cid}/draw", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        winners = r.json()
        assert isinstance(winners, list)
        if state.get("entry_id"):
            # At least one winner should exist
            assert len(winners) >= 1
        state["draw_done"] = True

    def test_draw_twice_rejected(self):
        cid = state.get("campaign_id")
        if not cid or not state.get("draw_done"):
            pytest.skip("Draw not done")
        r = requests.post(f"{BASE}/api/campaigns/{cid}/draw", headers=auth_header(state["admin_token"]))
        assert r.status_code == 409

    def test_non_admin_cannot_draw(self):
        cid = state.get("campaign_id")
        if not cid:
            pytest.skip("No campaign")
        r = requests.post(f"{BASE}/api/campaigns/{cid}/draw", headers=auth_header(state["seller_token"]))
        assert r.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════
#  ADMIN TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestAdmin:

    def test_list_users(self):
        r = requests.get(f"{BASE}/api/admin/users", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "users" in data
        for u in data["users"]:
            assert "password_hash" not in u

    def test_search_users(self):
        r = requests.get(f"{BASE}/api/admin/users?search=Test", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200

    def test_list_admin_campaigns(self):
        r = requests.get(f"{BASE}/api/admin/campaigns", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "campaigns" in data

    def test_filter_admin_campaigns_by_status(self):
        r = requests.get(f"{BASE}/api/admin/campaigns?status=active", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        for c in r.json()["campaigns"]:
            assert c["status"] == "active"

    def test_platform_analytics(self):
        r = requests.get(f"{BASE}/api/admin/analytics", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        data = r.json()
        assert "series" in data
        assert len(data["series"]) == 30
        assert "top_campaigns" in data
        for point in data["series"]:
            assert "date" in point
            assert "entries" in point
            assert "users" in point

    def test_non_admin_analytics_blocked(self):
        r = requests.get(f"{BASE}/api/admin/analytics", headers=auth_header(state["user_token"]))
        assert r.status_code == 403

    def test_ban_user(self):
        # Get user ID
        me = requests.get(f"{BASE}/api/auth/me", headers=auth_header(state["user_token"])).json()
        uid = me.get("id", "")
        state["user_id"] = uid
        r = requests.patch(f"{BASE}/api/admin/users/{uid}/ban", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        assert r.json()["status"] == "banned"

    def test_unban_user(self):
        uid = state.get("user_id")
        if not uid:
            pytest.skip("No user id")
        r = requests.patch(f"{BASE}/api/admin/users/{uid}/unban", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        assert r.json()["status"] == "unbanned"

    def test_ban_nonexistent_user(self):
        r = requests.patch(f"{BASE}/api/admin/users/507f1f77bcf86cd799439011/ban", headers=auth_header(state["admin_token"]))
        assert r.status_code == 404


# ═══════════════════════════════════════════════════════════════════════════
#  FRAUD TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestFraud:

    def test_suspicious_entries_endpoint(self):
        r = requests.get(f"{BASE}/api/admin/fraud/suspicious", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        data = r.json()
        assert "duplicate_phones" in data
        assert "duplicate_emails" in data
        assert "total_suspicious" in data

    def test_non_admin_cannot_view_fraud(self):
        r = requests.get(f"{BASE}/api/admin/fraud/suspicious", headers=auth_header(state["user_token"]))
        assert r.status_code == 403

    def test_disqualify_nonexistent_entry(self):
        r = requests.patch(f"{BASE}/api/admin/fraud/disqualify/507f1f77bcf86cd799439011", headers=auth_header(state["admin_token"]))
        assert r.status_code == 404

    def test_disqualify_invalid_id(self):
        r = requests.patch(f"{BASE}/api/admin/fraud/disqualify/notanid", headers=auth_header(state["admin_token"]))
        assert r.status_code == 400

    def test_disqualify_entry_if_exists(self):
        eid = state.get("entry_id")
        if not eid:
            pytest.skip("No entry to disqualify")
        r = requests.patch(f"{BASE}/api/admin/fraud/disqualify/{eid}", headers=auth_header(state["admin_token"]))
        assert r.status_code in (200, 404)

    def test_non_admin_cannot_disqualify(self):
        r = requests.patch(f"{BASE}/api/admin/fraud/disqualify/507f1f77bcf86cd799439011", headers=auth_header(state["seller_token"]))
        assert r.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════
#  PAYMENTS TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestPayments:

    def test_get_plans(self):
        r = requests.get(f"{BASE}/api/payments/plans")
        assert r.status_code == 200
        plans = r.json()
        assert len(plans) >= 2
        ids = [p["id"] for p in plans]
        assert "basic" in ids
        assert "pro" in ids
        for p in plans:
            assert "amount_display" in p
            assert "description" in p

    def test_create_order_no_razorpay_config(self):
        # This will 503 if not configured, or 200 if configured
        r = requests.post(
            f"{BASE}/api/payments/order",
            json={"plan": "basic"},
            headers=auth_header(state["seller_token"]),
        )
        assert r.status_code in (200, 503)

    def test_create_order_invalid_plan(self):
        r = requests.post(
            f"{BASE}/api/payments/order",
            json={"plan": "platinum_xyz"},
            headers=auth_header(state["seller_token"]),
        )
        assert r.status_code in (400, 503)

    def test_create_order_user_forbidden(self):
        r = requests.post(
            f"{BASE}/api/payments/order",
            json={"plan": "basic"},
            headers=auth_header(state["user_token"]),
        )
        assert r.status_code == 403

    def test_verify_tampered_signature(self):
        r = requests.post(
            f"{BASE}/api/payments/verify",
            json={
                "razorpay_order_id":   "order_fake",
                "razorpay_payment_id": "pay_fake",
                "razorpay_signature":  "tampered_signature_value",
                "plan": "basic",
            },
            headers=auth_header(state["seller_token"]),
        )
        assert r.status_code in (400, 503)

    def test_payment_history(self):
        r = requests.get(f"{BASE}/api/payments/history", headers=auth_header(state["seller_token"]))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_revenue(self):
        r = requests.get(f"{BASE}/api/payments/admin/revenue", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        data = r.json()
        assert "total_revenue" in data
        assert "total_payments" in data
        assert "by_plan" in data
        assert "recent_payments" in data

    def test_non_admin_revenue_blocked(self):
        r = requests.get(f"{BASE}/api/payments/admin/revenue", headers=auth_header(state["seller_token"]))
        assert r.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════
#  STATS + HEALTH
# ═══════════════════════════════════════════════════════════════════════════

class TestMisc:

    def test_health_endpoint(self):
        r = requests.get(f"{BASE}/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

    def test_public_stats(self):
        r = requests.get(f"{BASE}/api/stats/platform", headers=auth_header(state["admin_token"]))
        assert r.status_code == 200
        data = r.json()
        for key in ("total_campaigns", "total_entries", "active_giveaways"):
            assert key in data

    def test_stats_values_are_non_negative(self):
        r = requests.get(f"{BASE}/api/stats/platform", headers=auth_header(state["admin_token"]))
        data = r.json()
        for key in ("total_campaigns", "total_entries", "active_giveaways"):
            assert data[key] >= 0
