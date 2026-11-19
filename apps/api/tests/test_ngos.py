from fastapi.testclient import TestClient

NGO_PAYLOAD = {
    "org_name": "Green Roots Collective",
    "mission": "We restore native tree cover in degraded urban watersheds.",
    "focus_area": "Urban reforestation",
    "contact_email": "contact@greenroots.org",
    "website": "https://greenroots.org",
    "location": "Portland, OR",
}


def _register_ngo(client: TestClient, headers: dict) -> dict:
    return client.post("/api/v1/ngos/register", json=NGO_PAYLOAD, headers=headers).json()


def test_register_ngo_requires_auth(client: TestClient):
    res = client.post("/api/v1/ngos/register", json=NGO_PAYLOAD)
    assert res.status_code == 401


def test_register_and_fetch_ngo(client: TestClient, auth_headers: dict):
    ngo = _register_ngo(client, auth_headers)
    assert ngo["org_name"] == NGO_PAYLOAD["org_name"]
    assert ngo["is_mine"] is True
    assert ngo["opportunities"] == []

    list_res = client.get("/api/v1/ngos")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    detail_res = client.get(f"/api/v1/ngos/{ngo['id']}")
    assert detail_res.status_code == 200
    assert detail_res.json()["is_mine"] is False  # anonymous viewer


def test_cannot_register_two_ngo_profiles_for_same_user(client: TestClient, auth_headers: dict):
    _register_ngo(client, auth_headers)
    second = client.post("/api/v1/ngos/register", json=NGO_PAYLOAD, headers=auth_headers)
    assert second.status_code == 409


def test_create_opportunity_requires_ngo_profile(client: TestClient, auth_headers: dict):
    res = client.post(
        "/api/v1/opportunities",
        json={"title": "Weekend planting drive", "description": "Plant 200 native saplings along the creek.", "wave_scale": "city"},
        headers=auth_headers,
    )
    assert res.status_code == 403


def test_post_and_list_opportunity(client: TestClient, auth_headers: dict):
    _register_ngo(client, auth_headers)
    res = client.post(
        "/api/v1/opportunities",
        json={"title": "Weekend planting drive", "description": "Plant 200 native saplings along the creek.", "wave_scale": "city"},
        headers=auth_headers,
    )
    assert res.status_code == 201
    opp = res.json()
    assert opp["ngo"]["org_name"] == NGO_PAYLOAD["org_name"]

    list_res = client.get("/api/v1/opportunities")
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 1

    filtered = client.get("/api/v1/opportunities", params={"wave_scale": "country"})
    assert filtered.json()["total"] == 0


def test_outreach_message_and_inbox(client: TestClient, auth_headers: dict):
    ngo = _register_ngo(client, auth_headers)

    send_res = client.post(
        "/api/v1/outreach",
        json={
            "ngo_id": ngo["id"],
            "sender_name": "Curious Volunteer",
            "sender_email": "volunteer@example.com",
            "message": "I'd like to help with your next planting drive.",
        },
    )
    assert send_res.status_code == 201

    inbox_res = client.get("/api/v1/outreach/inbox", headers=auth_headers)
    assert inbox_res.status_code == 200
    assert len(inbox_res.json()) == 1
    assert inbox_res.json()[0]["sender_email"] == "volunteer@example.com"


def test_inbox_requires_ngo_profile(client: TestClient, auth_headers: dict):
    res = client.get("/api/v1/outreach/inbox", headers=auth_headers)
    assert res.status_code == 404


def test_outreach_to_unknown_ngo_404s(client: TestClient):
    res = client.post(
        "/api/v1/outreach",
        json={"ngo_id": 999999, "sender_name": "x", "sender_email": "x@example.com", "message": "hi"},
    )
    assert res.status_code == 404
