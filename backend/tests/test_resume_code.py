"""Regression tests for resume-code (code + PIN cross-device draft resume)."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def draft(client):
    r = client.post(f"{API}/drafts", json={"content": {"pathway": "procurar_emprego", "personal": {"name": "TEST_RC"}}})
    assert r.status_code == 200
    token = r.json()["token"]
    yield token
    client.delete(f"{API}/drafts/{token}")


class TestResumeCode:
    def test_invalid_pin_short(self, client, draft):
        r = client.post(f"{API}/drafts/{draft}/resume-code", json={"pin": "12"})
        assert r.status_code == 400

    def test_invalid_pin_non_numeric(self, client, draft):
        r = client.post(f"{API}/drafts/{draft}/resume-code", json={"pin": "abcd"})
        assert r.status_code == 400

    def test_create_get_revoke(self, client, draft):
        r = client.post(f"{API}/drafts/{draft}/resume-code", json={"pin": "1234"})
        assert r.status_code == 200
        code = r.json()["code"]
        assert code.startswith("KP-") and len(code) == 9

        g = client.get(f"{API}/drafts/{draft}/resume-code")
        assert g.status_code == 200
        assert g.json()["code"] == code

        rv = client.delete(f"{API}/drafts/{draft}/resume-code")
        assert rv.status_code == 200
        # resume after revoke => 401
        r2 = client.post(f"{API}/drafts/resume", json={"code": code, "pin": "1234"})
        assert r2.status_code == 401

    def test_resume_unknown_code(self, client):
        r = client.post(f"{API}/drafts/resume", json={"code": "KP-ZZZZZZ", "pin": "1234"})
        assert r.status_code == 401

    def test_resume_wrong_pin_then_correct(self, client, draft):
        c = client.post(f"{API}/drafts/{draft}/resume-code", json={"pin": "1234"}).json()["code"]
        r = client.post(f"{API}/drafts/resume", json={"code": c, "pin": "0000"})
        assert r.status_code == 401
        r2 = client.post(f"{API}/drafts/resume", json={"code": c, "pin": "1234"})
        assert r2.status_code == 200
        assert r2.json()["token"] == draft

    def test_lockout_after_5_wrong_pins(self, client, draft):
        c = client.post(f"{API}/drafts/{draft}/resume-code", json={"pin": "1234"}).json()["code"]
        statuses = []
        for _ in range(5):
            r = client.post(f"{API}/drafts/resume", json={"code": c, "pin": "0000"})
            statuses.append(r.status_code)
        # 5th should be 429 (lock)
        assert statuses[-1] == 429, f"Expected lock on 5th attempt, got {statuses}"
        # Subsequent attempts (even correct) should return 429
        r6 = client.post(f"{API}/drafts/resume", json={"code": c, "pin": "1234"})
        assert r6.status_code == 429
