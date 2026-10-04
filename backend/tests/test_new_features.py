"""Tests for new features: smart profession search + references consent gate."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Smart profession search ----------
class TestProfessionSearch:
    def test_misspelled_returns_suggestions(self, client):
        r = client.get(f"{API}/professions", params={"search": "electrisista"})
        assert r.status_code == 200
        data = r.json()
        assert data["professions"] == [], f"Expected empty professions, got {data['professions']}"
        assert len(data["suggestions"]) > 0, "Expected non-empty suggestions"
        names = [p["name"] for p in data["suggestions"]]
        assert any("lectric" in n.lower() for n in names), f"Expected Electricista in suggestions, got {names}"

    def test_exact_returns_professions(self, client):
        r = client.get(f"{API}/professions", params={"search": "contabilista"})
        assert r.status_code == 200
        data = r.json()
        assert len(data["professions"]) > 0, "Expected non-empty professions for 'contabilista'"
        assert data["suggestions"] == [], f"Expected empty suggestions, got {data['suggestions']}"
        names = [p["name"].lower() for p in data["professions"]]
        assert any("contabilista" in n for n in names)

    def test_empty_search_no_suggestions(self, client):
        r = client.get(f"{API}/professions")
        assert r.status_code == 200
        data = r.json()
        assert data["suggestions"] == []
        assert len(data["professions"]) > 0


# ---------- References consent sanitization ----------
class TestReferencesConsent:
    def _create_draft(self, client, content):
        r = client.post(f"{API}/drafts", json={"content": content})
        assert r.status_code == 200
        return r.json()["token"]

    def test_consent_false_blanks_name_phone(self, client):
        content = {
            "pathway": "procurar_emprego",
            "personal": {"name": "TEST_X"},
            "references": {
                "mode": "list",
                "items": [
                    {"name": "No Consent", "role": "CEO", "company": "ACME", "phone": "+244900000000", "email": "x@y.com", "consent": False},
                    {"name": "Yes Consent", "role": "Mgr", "company": "ACME2", "phone": "+244900000001", "email": "y@y.com", "consent": True},
                ],
            },
        }
        token = self._create_draft(client, content)

        r = client.get(f"{API}/drafts/{token}")
        assert r.status_code == 200
        refs = r.json()["content"]["references"]
        assert refs["mode"] == "list"
        assert len(refs["items"]) == 2

        no_consent = refs["items"][0]
        assert no_consent["name"] == "", f"Expected blank name, got {no_consent['name']}"
        assert no_consent["phone"] == ""
        assert no_consent["consent"] is False

        yes_consent = refs["items"][1]
        assert yes_consent["name"] == "Yes Consent"
        assert yes_consent["phone"] == "+244900000001"
        assert yes_consent["consent"] is True

        # Cleanup
        client.delete(f"{API}/drafts/{token}")

    def test_put_update_also_sanitizes(self, client):
        token = self._create_draft(client, {"pathway": "procurar_emprego", "personal": {"name": "TEST_U"}})
        update = {
            "content": {
                "pathway": "procurar_emprego",
                "personal": {"name": "TEST_U"},
                "references": {
                    "mode": "list",
                    "items": [
                        {"name": "Leaked", "role": "r", "company": "c", "phone": "+244999", "email": "e@e.com", "consent": False},
                    ],
                },
            }
        }
        r = client.put(f"{API}/drafts/{token}", json=update)
        assert r.status_code == 200

        got = client.get(f"{API}/drafts/{token}").json()
        item = got["content"]["references"]["items"][0]
        assert item["name"] == ""
        assert item["phone"] == ""

        client.delete(f"{API}/drafts/{token}")

    def test_mode_on_request_preserved(self, client):
        token = self._create_draft(client, {
            "pathway": "procurar_emprego",
            "references": {"mode": "on_request", "items": []}
        })
        got = client.get(f"{API}/drafts/{token}").json()
        assert got["content"]["references"]["mode"] == "on_request"
        client.delete(f"{API}/drafts/{token}")
