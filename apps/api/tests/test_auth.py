from fastapi.testclient import TestClient


def test_register_and_login(client: TestClient):
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "securepass123", "display_name": "New User"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == "newuser@example.com"
    assert "access_token" in body

    login_res = client.post("/api/v1/auth/login", json={"email": "newuser@example.com", "password": "securepass123"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_register_rejects_duplicate_email(client: TestClient):
    payload = {"email": "dupe@example.com", "password": "securepass123", "display_name": "Dupe"}
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


def test_login_rejects_wrong_password(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "u@example.com", "password": "correctpass123", "display_name": "U"})
    res = client.post("/api/v1/auth/login", json={"email": "u@example.com", "password": "wrongpass123"})
    assert res.status_code == 401


def test_me_requires_authentication(client: TestClient):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_me_returns_current_user(client: TestClient, auth_headers: dict):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "pytest-user@example.com"


def test_long_password_does_not_crash_hashing(client: TestClient):
    # bcrypt has a 72-byte limit, well under the schema's own 128-char max — this must be
    # handled gracefully by truncation, not throw a 500.
    very_long_password = "x" * 100
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "longpw@example.com", "password": very_long_password, "display_name": "Long PW"},
    )
    assert res.status_code == 201
    login_res = client.post("/api/v1/auth/login", json={"email": "longpw@example.com", "password": very_long_password})
    assert login_res.status_code == 200
