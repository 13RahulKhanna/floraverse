from fastapi.testclient import TestClient


def test_list_articles(client: TestClient):
    res = client.get("/api/v1/learn")
    assert res.status_code == 200
    titles = [a["title"] for a in res.json()]
    assert "Introduction to Botany" in titles
    assert len(titles) == 10


def test_get_article_detail(client: TestClient):
    res = client.get("/api/v1/learn/photosynthesis")
    assert res.status_code == 200
    body = res.json()
    assert body["title"] == "Photosynthesis"
    assert len(body["content_markdown"]) > 100


def test_get_unknown_article_404s(client: TestClient):
    res = client.get("/api/v1/learn/not-a-real-article")
    assert res.status_code == 404


def test_submit_contact_message(client: TestClient):
    res = client.post(
        "/api/v1/contact",
        json={"name": "A Student", "email": "student@example.com", "subject": "Question", "message": "How do I identify this plant?"},
    )
    assert res.status_code == 201
    assert res.json()["ok"] is True


def test_contact_requires_all_fields(client: TestClient):
    res = client.post("/api/v1/contact", json={"name": "A Student"})
    assert res.status_code == 422
