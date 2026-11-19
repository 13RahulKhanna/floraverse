from fastapi.testclient import TestClient


def _plant_id(client: TestClient) -> int:
    return client.get("/api/v1/plants/aloe-vera").json()["id"]


def test_create_and_list_post(client: TestClient, auth_headers: dict):
    res = client.post(
        "/api/v1/blog",
        json={"title": "My First Post", "excerpt": "A short intro", "content_markdown": "Hello world."},
        headers=auth_headers,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["slug"] == "my-first-post"
    assert body["is_mine"] is True
    assert body["author"]["display_name"] == "Pytest User"

    list_res = client.get("/api/v1/blog")
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 1


def test_duplicate_titles_get_unique_slugs(client: TestClient, auth_headers: dict):
    payload = {"title": "Same Title", "excerpt": "e", "content_markdown": "c"}
    first = client.post("/api/v1/blog", json=payload, headers=auth_headers).json()
    second = client.post("/api/v1/blog", json=payload, headers=auth_headers).json()
    assert first["slug"] == "same-title"
    assert second["slug"] == "same-title-2"


def test_progress_update_links_to_plant(client: TestClient, auth_headers: dict):
    plant_id = _plant_id(client)
    res = client.post(
        "/api/v1/blog",
        json={
            "title": "My Aloe is thriving",
            "excerpt": "Update",
            "content_markdown": "Growing fast!",
            "is_progress_update": True,
            "linked_plant_id": plant_id,
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["is_progress_update"] is True
    assert body["linked_plant"]["id"] == plant_id

    progress_res = client.get("/api/v1/blog", params={"progress_only": True})
    assert progress_res.json()["total"] == 1


def test_create_post_requires_auth(client: TestClient):
    res = client.post("/api/v1/blog", json={"title": "x", "excerpt": "y", "content_markdown": "z"})
    assert res.status_code == 401


def test_only_author_can_delete_post(client: TestClient, auth_headers: dict):
    post = client.post(
        "/api/v1/blog", json={"title": "Mine", "excerpt": "e", "content_markdown": "c"}, headers=auth_headers
    ).json()

    other_register = client.post(
        "/api/v1/auth/register",
        json={"email": "otherblog@example.com", "password": "otherpass123", "display_name": "Other"},
    )
    other_headers = {"Authorization": f"Bearer {other_register.json()['access_token']}"}

    forbidden = client.delete(f"/api/v1/blog/{post['slug']}", headers=other_headers)
    assert forbidden.status_code == 404

    ok = client.delete(f"/api/v1/blog/{post['slug']}", headers=auth_headers)
    assert ok.status_code == 204
