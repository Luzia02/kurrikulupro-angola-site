"""End-to-end backend tests for KurrikuluPro Angola.
Covers: drafts, professions, profile, orders flow, receipt upload, PDF gating,
admin login (cookie), admin orders, approve/reject, settings publish toggle,
profession add/toggle, audit log.
"""
import io
import os
import pytest
import requests

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://kurrikulum-1.preview.emergentagent.com"
API = f"{BASE}/api"

ADMIN_EMAIL = "pesselajustino7@gmail.com"
ADMIN_PASSWORD = "KurrikuluPro2026!"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_session():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    assert "access_token" in sess.cookies.get_dict()
    return sess


# ------------------------------------------------------------ health
def test_health(s):
    r = s.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ------------------------------------------------------------ professions
def test_professions_list(s):
    r = s.get(f"{API}/professions", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert "professions" in j and "families" in j
    assert len(j["professions"]) > 0


def test_professions_search(s):
    r = s.get(f"{API}/professions", params={"search": "secret"}, timeout=15)
    assert r.status_code == 200
    names = [p["name"].lower() for p in r.json()["professions"]]
    assert any("secret" in n for n in names)


# ------------------------------------------------------------ drafts
@pytest.fixture(scope="session")
def draft(s):
    content = {
        "pathway": "procurar_emprego",
        "personal": {"first_name": "TEST_João", "last_name": "Pereira", "phone": "+244900000111", "city": "Luanda"},
        "education": [{"course": "Contabilidade", "status": "A frequentar", "institution": "ISCED"}],
        "skills": {"confirmed": ["Trabalho em equipa"]},
        "profile": {"text": "Profissional dedicado em Luanda.", "edited": False, "generated": True},
    }
    r = s.post(f"{API}/drafts", json={"content": content}, timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert "token" in j
    return j


def test_draft_get(s, draft):
    r = s.get(f"{API}/drafts/{draft['token']}", timeout=15)
    assert r.status_code == 200
    assert r.json()["content"]["personal"]["first_name"] == "TEST_João"


def test_draft_update(s, draft):
    content = draft["content"]
    content["personal"]["city"] = "Benguela"
    r = s.put(f"{API}/drafts/{draft['token']}", json={"content": content}, timeout=15)
    assert r.status_code == 200
    r2 = s.get(f"{API}/drafts/{draft['token']}", timeout=15)
    assert r2.json()["content"]["personal"]["city"] == "Benguela"


# ------------------------------------------------------------ profile generator
def test_profile_generate(s, draft):
    r = s.post(f"{API}/profile/generate", json={"content": draft["content"]}, timeout=15)
    assert r.status_code == 200
    txt = r.json()["text"]
    assert isinstance(txt, str) and len(txt) > 20


# ------------------------------------------------------------ public settings default (unpublished)
def test_public_settings_unpublished(s, admin_session):
    # ensure unpublished first
    cur = admin_session.get(f"{API}/admin/settings", timeout=15).json()
    cur["published"] = False
    admin_session.put(f"{API}/admin/settings", json=cur, timeout=15)
    r = s.get(f"{API}/settings/public", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["published"] is False
    assert "multicaixa_number" not in j


# ------------------------------------------------------------ orders flow
@pytest.fixture(scope="session")
def order(s, draft):
    r = s.post(f"{API}/orders", json={"draft_token": draft["token"]}, timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["order_code"].startswith("KP-")
    assert "access_token" in j
    assert j["status"] == "aguarda_pagamento"
    return j


def test_order_status(s, order):
    r = s.get(f"{API}/orders/{order['order_code']}", params={"access_token": order["access_token"]}, timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["pdf_available"] is False
    assert j["status"] == "aguarda_pagamento"


def test_pdf_before_approval_forbidden(s, order):
    r = s.get(f"{API}/orders/{order['order_code']}/pdf", params={"access_token": order["access_token"]}, timeout=15)
    assert r.status_code == 403


def test_pdf_wrong_token(s, order):
    r = s.get(f"{API}/orders/{order['order_code']}/pdf", params={"access_token": "wrong"}, timeout=15)
    assert r.status_code == 404


def test_receipt_upload(s, order):
    files = {"file": ("receipt.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 100), "image/png")}
    data = {"access_token": order["access_token"]}
    r = s.post(f"{API}/orders/{order['order_code']}/receipt", files=files, data=data, timeout=20)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "comprovativo_recebido"
    # verify state
    r2 = s.get(f"{API}/orders/{order['order_code']}", params={"access_token": order["access_token"]}, timeout=15)
    assert r2.json()["has_receipt"] is True
    assert r2.json()["pdf_available"] is False  # still not approved


def test_receipt_bad_type(s, order):
    files = {"file": ("x.txt", io.BytesIO(b"hello"), "text/plain")}
    data = {"access_token": order["access_token"]}
    r = s.post(f"{API}/orders/{order['order_code']}/receipt", files=files, data=data, timeout=15)
    assert r.status_code == 400


# ------------------------------------------------------------ admin auth
def test_admin_login_wrong(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_admin_me(admin_session):
    r = admin_session.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_admin_requires_auth(s):
    r = requests.get(f"{API}/admin/orders", timeout=15)
    assert r.status_code == 401


# ------------------------------------------------------------ admin orders & approval
def test_admin_list_and_approve(admin_session, s, order):
    r = admin_session.get(f"{API}/admin/orders", timeout=15)
    assert r.status_code == 200
    orders = r.json()["orders"]
    match = [o for o in orders if o["order_code"] == order["order_code"]]
    assert match, "created order not visible in admin list"
    oid = match[0]["id"]

    # detail
    rd = admin_session.get(f"{API}/admin/orders/{oid}", timeout=15)
    assert rd.status_code == 200
    assert "access_token" not in rd.json()
    assert "_id" not in rd.json()

    # receipt file
    rr = admin_session.get(f"{API}/admin/orders/{oid}/receipt", timeout=15)
    assert rr.status_code == 200

    # approve
    ra = admin_session.post(f"{API}/admin/orders/{oid}/approve", timeout=15)
    assert ra.status_code == 200
    assert ra.json()["status"] == "aprovado"

    # candidate can now download PDF
    rp = s.get(f"{API}/orders/{order['order_code']}/pdf", params={"access_token": order["access_token"]}, timeout=30)
    assert rp.status_code == 200
    assert rp.headers.get("content-type", "").startswith("application/pdf")
    assert rp.content[:4] == b"%PDF"


# ------------------------------------------------------------ reject flow (second order)
def test_reject_flow(admin_session, s):
    # new draft+order
    d = s.post(f"{API}/drafts", json={"content": {"pathway": "procurar_emprego", "personal": {"first_name": "TEST_Rej", "last_name": "X", "phone": "+244900000222"}}}, timeout=15).json()
    o = s.post(f"{API}/orders", json={"draft_token": d["token"]}, timeout=15).json()
    orders = admin_session.get(f"{API}/admin/orders", timeout=15).json()["orders"]
    oid = next(x["id"] for x in orders if x["order_code"] == o["order_code"])
    r = admin_session.post(f"{API}/admin/orders/{oid}/reject", data={"reason": "comprovativo inválido"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["status"] == "rejeitado"


# ------------------------------------------------------------ settings publish
def test_settings_publish_toggle(admin_session, s):
    cur = admin_session.get(f"{API}/admin/settings", timeout=15).json()
    cur.update({"published": True, "multicaixa_number": "925 702 270", "support_whatsapp": "+244 958 826 913"})
    r = admin_session.put(f"{API}/admin/settings", json=cur, timeout=15)
    assert r.status_code == 200
    pub = s.get(f"{API}/settings/public", timeout=15).json()
    assert pub["published"] is True
    assert pub.get("multicaixa_number") == "925 702 270"
    # revert
    cur["published"] = False
    admin_session.put(f"{API}/admin/settings", json=cur, timeout=15)


# ------------------------------------------------------------ profession add/toggle
def test_profession_add_and_toggle(admin_session, s):
    r = admin_session.post(f"{API}/admin/professions", json={"name": "TEST_Testador QA", "family": "admin_servicos"}, timeout=15)
    assert r.status_code == 200
    pid = r.json()["id"]
    # listed
    listed = s.get(f"{API}/professions", params={"search": "TEST_Testador"}, timeout=15).json()["professions"]
    assert any(p["id"] == pid for p in listed)
    # toggle
    rt = admin_session.patch(f"{API}/admin/professions/{pid}/toggle", timeout=15)
    assert rt.status_code == 200
    assert rt.json()["status"] == "draft"
    # not public anymore
    listed2 = s.get(f"{API}/professions", params={"search": "TEST_Testador"}, timeout=15).json()["professions"]
    assert not any(p["id"] == pid for p in listed2)


# ------------------------------------------------------------ audit
def test_audit_log(admin_session):
    r = admin_session.get(f"{API}/admin/audit", timeout=15)
    assert r.status_code == 200
    entries = r.json()["entries"]
    assert len(entries) > 0
    actions = {e["action"] for e in entries}
    assert "aprovar" in actions
