from fastapi.testclient import TestClient


def test_list_plants_returns_seeded_data(client: TestClient):
    res = client.get("/api/v1/plants")
    assert res.status_code == 200
    body = res.json()
    assert body["total"] >= 25  # the curated seed set
    assert len(body["items"]) > 0


def test_search_by_common_name(client: TestClient):
    res = client.get("/api/v1/plants", params={"q": "Aloe"})
    assert res.status_code == 200
    names = [p["common_name"] for p in res.json()["items"]]
    assert "Aloe Vera" in names


def test_search_by_scientific_name(client: TestClient):
    res = client.get("/api/v1/plants", params={"q": "Mangifera"})
    names = [p["common_name"] for p in res.json()["items"]]
    assert "Mango Tree" in names


def test_search_is_case_insensitive(client: TestClient):
    res = client.get("/api/v1/plants", params={"q": "aloe vera"})
    assert any(p["common_name"] == "Aloe Vera" for p in res.json()["items"])


def test_filter_by_category(client: TestClient):
    res = client.get("/api/v1/plants", params={"category": "cactus"})
    body = res.json()
    assert body["total"] >= 2
    assert all(p["category"] == "cactus" for p in body["items"])


def test_filter_by_medicinal_flag(client: TestClient):
    res = client.get("/api/v1/plants", params={"is_medicinal": True})
    assert res.json()["total"] >= 5


def test_filter_by_indoor_flag(client: TestClient):
    res = client.get("/api/v1/plants", params={"is_indoor": True})
    assert res.json()["total"] >= 5


def test_combined_filters_narrow_results(client: TestClient):
    broad = client.get("/api/v1/plants", params={"is_indoor": True}).json()["total"]
    narrow = client.get("/api/v1/plants", params={"is_indoor": True, "category": "fern"}).json()["total"]
    assert narrow <= broad


def test_pagination(client: TestClient):
    page1 = client.get("/api/v1/plants", params={"page": 1, "page_size": 5}).json()
    page2 = client.get("/api/v1/plants", params={"page": 2, "page_size": 5}).json()
    assert len(page1["items"]) == 5
    ids_page1 = {p["id"] for p in page1["items"]}
    ids_page2 = {p["id"] for p in page2["items"]}
    assert ids_page1.isdisjoint(ids_page2)


def test_plant_detail_by_slug(client: TestClient):
    res = client.get("/api/v1/plants/aloe-vera")
    assert res.status_code == 200
    body = res.json()
    assert body["common_name"] == "Aloe Vera"
    assert body["scientific_name"] == "Aloe vera"


def test_plant_detail_unknown_slug_404s(client: TestClient):
    res = client.get("/api/v1/plants/this-plant-does-not-exist")
    assert res.status_code == 404


def test_unset_fields_render_as_not_available(client: TestClient):
    res = client.get("/api/v1/plants/aloe-vera")
    body = res.json()
    # fruit_description was deliberately left unset for aloe vera in the seed data
    assert body["fruit_description"] == "Not available"
    # never silently empty-string a field — always the explicit sentinel
    assert body["fruit_description"] != ""


def test_plant_of_the_day_is_deterministic_within_a_day(client: TestClient):
    first = client.get("/api/v1/plants/plant-of-the-day").json()
    second = client.get("/api/v1/plants/plant-of-the-day").json()
    assert first["id"] == second["id"]


def test_featured_and_recent_endpoints(client: TestClient):
    featured = client.get("/api/v1/plants/featured", params={"limit": 3}).json()
    recent = client.get("/api/v1/plants/recent", params={"limit": 3}).json()
    assert len(featured) == 3
    assert len(recent) == 3


def test_categories_endpoint_lists_all_required_categories(client: TestClient):
    res = client.get("/api/v1/plants/categories")
    categories = res.json()
    for required in ["tree", "shrub", "herb", "climber", "creeper", "aquatic", "medicinal", "succulent", "cactus", "fern", "grass", "orchid", "carnivorous"]:
        assert required in categories


def test_compare_two_plants(client: TestClient):
    aloe = client.get("/api/v1/plants/aloe-vera").json()
    saguaro = client.get("/api/v1/plants/saguaro-cactus").json()
    res = client.get("/api/v1/plants/compare", params={"a": aloe["id"], "b": saguaro["id"]})
    assert res.status_code == 200
    body = res.json()
    assert body["plant_a"]["common_name"] == "Aloe Vera"
    assert body["plant_b"]["common_name"] == "Saguaro Cactus"
    assert len(body["fields"]) > 0
    assert any(f["label"] == "Scientific name" for f in body["fields"])


def test_compare_unknown_plant_404s(client: TestClient):
    res = client.get("/api/v1/plants/compare", params={"a": 1, "b": 999999})
    assert res.status_code == 404
