from fastapi.testclient import TestClient


def _first_plant_id(client: TestClient) -> int:
    return client.get("/api/v1/plants/aloe-vera").json()["id"]


def test_garden_requires_auth(client: TestClient):
    assert client.get("/api/v1/garden").status_code == 401
    assert client.post("/api/v1/garden", json={"plant_id": 1}).status_code == 401


def test_add_and_list_garden_entry(client: TestClient, auth_headers: dict):
    plant_id = _first_plant_id(client)
    add_res = client.post("/api/v1/garden", json={"plant_id": plant_id, "notes": "windowsill"}, headers=auth_headers)
    assert add_res.status_code == 201
    entry = add_res.json()
    assert entry["plant"]["id"] == plant_id
    assert entry["notes"] == "windowsill"
    assert entry["logs"] == []

    list_res = client.get("/api/v1/garden", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


def test_cannot_add_same_plant_twice(client: TestClient, auth_headers: dict):
    plant_id = _first_plant_id(client)
    client.post("/api/v1/garden", json={"plant_id": plant_id}, headers=auth_headers)
    second = client.post("/api/v1/garden", json={"plant_id": plant_id}, headers=auth_headers)
    assert second.status_code == 409


def test_add_to_garden_unknown_plant_404s(client: TestClient, auth_headers: dict):
    res = client.post("/api/v1/garden", json={"plant_id": 999999}, headers=auth_headers)
    assert res.status_code == 404


def test_add_watering_and_growth_logs(client: TestClient, auth_headers: dict):
    plant_id = _first_plant_id(client)
    entry = client.post("/api/v1/garden", json={"plant_id": plant_id}, headers=auth_headers).json()

    water_res = client.post(
        f"/api/v1/garden/{entry['id']}/logs",
        json={"log_type": "watering", "note": "deep watered"},
        headers=auth_headers,
    )
    assert water_res.status_code == 201

    growth_res = client.post(
        f"/api/v1/garden/{entry['id']}/logs",
        json={"log_type": "growth", "measurement": "12 cm"},
        headers=auth_headers,
    )
    assert growth_res.status_code == 201
    logs = growth_res.json()["logs"]
    assert len(logs) == 2
    log_types = {log["log_type"] for log in logs}
    assert log_types == {"watering", "growth"}


def test_cannot_log_to_someone_elses_garden_entry(client: TestClient, auth_headers: dict):
    plant_id = _first_plant_id(client)
    entry = client.post("/api/v1/garden", json={"plant_id": plant_id}, headers=auth_headers).json()

    other_register = client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "password": "otherpass123", "display_name": "Other"},
    )
    other_headers = {"Authorization": f"Bearer {other_register.json()['access_token']}"}

    res = client.post(f"/api/v1/garden/{entry['id']}/logs", json={"log_type": "note", "note": "sneaky"}, headers=other_headers)
    assert res.status_code == 404


def test_remove_garden_entry(client: TestClient, auth_headers: dict):
    plant_id = _first_plant_id(client)
    entry = client.post("/api/v1/garden", json={"plant_id": plant_id}, headers=auth_headers).json()

    delete_res = client.delete(f"/api/v1/garden/{entry['id']}", headers=auth_headers)
    assert delete_res.status_code == 204

    list_res = client.get("/api/v1/garden", headers=auth_headers)
    assert list_res.json() == []
