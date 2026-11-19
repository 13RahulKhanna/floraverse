import io

from fastapi.testclient import TestClient
from PIL import Image

from app.ai_client import parse_health_assessment, parse_identification_candidates


def _test_image_bytes() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (40, 40), "green").save(buf, format="JPEG")
    return buf.getvalue()


def test_identify_without_api_key_returns_503_not_fake_data(client: TestClient):
    """
    The core honesty requirement: with no PLANT_ID_API_KEY configured, the endpoint must
    fail clearly rather than fabricate a plausible-looking identification result.
    """
    files = {"file": ("plant.jpg", _test_image_bytes(), "image/jpeg")}
    res = client.post("/api/v1/ai/identify", files=files)
    assert res.status_code == 503
    assert "not configured" in res.json()["detail"].lower()


def test_health_without_api_key_returns_503_not_fake_data(client: TestClient):
    files = {"file": ("plant.jpg", _test_image_bytes(), "image/jpeg")}
    res = client.post("/api/v1/ai/health", files=files)
    assert res.status_code == 503
    assert "not configured" in res.json()["detail"].lower()


def test_identify_rejects_unsupported_file_type(client: TestClient):
    files = {"file": ("plant.txt", b"not an image", "text/plain")}
    res = client.post("/api/v1/ai/identify", files=files)
    assert res.status_code == 415


def test_identify_rejects_empty_file(client: TestClient):
    files = {"file": ("plant.jpg", b"", "image/jpeg")}
    res = client.post("/api/v1/ai/identify", files=files)
    assert res.status_code == 400


def test_parse_identification_candidates_from_representative_response():
    raw = {
        "result": {
            "is_plant": {"probability": 0.98},
            "classification": {
                "suggestions": [
                    {
                        "name": "Aloe vera",
                        "probability": 0.91,
                        "details": {
                            "common_names": ["Aloe Vera", "True Aloe"],
                            "taxonomy": {"genus": "Aloe", "species": "vera", "family": "Asphodelaceae"},
                        },
                    },
                    {
                        "name": "Aloe arborescens",
                        "probability": 0.04,
                        "details": {"common_names": ["Krantz Aloe"], "taxonomy": {"genus": "Aloe", "family": "Asphodelaceae"}},
                    },
                ]
            },
        }
    }
    candidates, is_plant_probability = parse_identification_candidates(raw)
    assert is_plant_probability == 0.98
    assert len(candidates) == 2
    assert candidates[0]["scientific_name"] == "Aloe vera"
    assert candidates[0]["common_name"] == "Aloe Vera"
    assert candidates[0]["genus"] == "Aloe"
    assert candidates[0]["family"] == "Asphodelaceae"
    assert candidates[0]["probability"] == 0.91


def test_parse_identification_candidates_handles_missing_details_gracefully():
    """Defensive parsing: a sparse/unexpected response shape must not crash the request."""
    raw = {"result": {"classification": {"suggestions": [{"name": "Unknown species", "probability": 0.5}]}}}
    candidates, is_plant_probability = parse_identification_candidates(raw)
    assert is_plant_probability is None
    assert candidates[0]["scientific_name"] == "Unknown species"
    assert candidates[0]["common_name"] is None


def test_parse_identification_candidates_handles_completely_empty_response():
    candidates, is_plant_probability = parse_identification_candidates({})
    assert candidates == []
    assert is_plant_probability is None


def test_parse_health_assessment_from_representative_response():
    raw = {
        "result": {
            "is_healthy": {"probability": 0.22},
            "disease": {
                "suggestions": [
                    {
                        "name": "Powdery mildew",
                        "probability": 0.76,
                        "details": {
                            "description": "A fungal disease producing white powdery spots on leaves.",
                            "treatment": {
                                "biological": ["Apply neem oil spray"],
                                "chemical": ["Apply a sulfur-based fungicide"],
                                "prevention": ["Improve air circulation around the plant"],
                            },
                        },
                    }
                ]
            },
        }
    }
    parsed = parse_health_assessment(raw)
    assert parsed["is_healthy_probability"] == 0.22
    assert len(parsed["issues"]) == 1
    issue = parsed["issues"][0]
    assert issue["name"] == "Powdery mildew"
    assert issue["probability"] == 0.76
    assert "fungal" in issue["description"].lower()
    assert "neem oil" in issue["treatment"]
    assert "sulfur" in issue["treatment"]


def test_parse_health_assessment_healthy_plant_has_no_issues():
    raw = {"result": {"is_healthy": {"probability": 0.97}, "disease": {"suggestions": []}}}
    parsed = parse_health_assessment(raw)
    assert parsed["is_healthy_probability"] == 0.97
    assert parsed["issues"] == []
