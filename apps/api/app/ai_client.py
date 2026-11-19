"""
Client for Plant.id (Kindwise) — the one vendor that covers both plant identification
AND health/disease assessment from a photo in a single product, which is why it was
chosen over e.g. Pl@ntNet (identification only, no health assessment).

IMPORTANT HONESTY NOTE: this is implemented against Plant.id's v3 API shape as documented
publicly as of this project's build date, parsed defensively (every field read with
.get()/fallbacks) so a minor schema drift doesn't crash the request — but this was written
without a live docs fetch inside this environment, and no real API key was available to
test an actual call end-to-end. Before relying on this in production, do one real request
with a real key and compare the raw response against PLANT_ID_BASE_URL's current reference
at https://platform.plant.id/ — see docs/README.md "AI integration" section.
"""

import base64

import httpx

from app.config import settings


class PlantIdNotConfigured(Exception):
    pass


class PlantIdRequestError(Exception):
    def __init__(self, status_code: int, body: str):
        self.status_code = status_code
        self.body = body
        super().__init__(f"Plant.id request failed ({status_code}): {body}")


def _require_api_key() -> str:
    if not settings.plant_id_api_key:
        raise PlantIdNotConfigured(
            "AI plant identification/health features are not configured on this server. "
            "Set PLANT_ID_API_KEY (from https://platform.plant.id/) to enable them."
        )
    return settings.plant_id_api_key


def _image_to_data_url(image_bytes: bytes, content_type: str = "image/jpeg") -> str:
    encoded = base64.b64encode(image_bytes).decode("ascii")
    return f"data:{content_type};base64,{encoded}"


async def identify_image(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    api_key = _require_api_key()
    url = f"{settings.plant_id_base_url}/identification"
    payload = {
        "images": [_image_to_data_url(image_bytes, content_type)],
        "similar_images": False,
    }
    headers = {"Api-Key": api_key, "Content-Type": "application/json"}
    params = {"details": "common_names,taxonomy,url"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers, params=params)

    if response.status_code >= 400:
        raise PlantIdRequestError(response.status_code, response.text[:2000])
    return response.json()


async def assess_health(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    api_key = _require_api_key()
    url = f"{settings.plant_id_base_url}/health_assessment"
    payload = {
        "images": [_image_to_data_url(image_bytes, content_type)],
    }
    headers = {"Api-Key": api_key, "Content-Type": "application/json"}
    params = {"details": "description,treatment,classification"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers, params=params)

    if response.status_code >= 400:
        raise PlantIdRequestError(response.status_code, response.text[:2000])
    return response.json()


def parse_identification_candidates(raw: dict) -> tuple[list[dict], float | None]:
    """Returns (candidates, is_plant_probability). Defensive against missing keys."""
    result = raw.get("result", {})
    is_plant = result.get("is_plant", {}).get("probability")

    suggestions = result.get("classification", {}).get("suggestions", [])
    candidates = []
    for s in suggestions:
        details = s.get("details", {}) or {}
        taxonomy = details.get("taxonomy", {}) or {}
        common_names = details.get("common_names") or []
        name_parts = (s.get("name") or "").split(" ")
        candidates.append(
            {
                "scientific_name": s.get("name", ""),
                "common_name": common_names[0] if common_names else None,
                "genus": taxonomy.get("genus") or (name_parts[0] if name_parts else None),
                "species": taxonomy.get("species") or (name_parts[1] if len(name_parts) > 1 else None),
                "family": taxonomy.get("family"),
                "probability": s.get("probability", 0.0),
            }
        )
    return candidates, is_plant


def parse_health_assessment(raw: dict) -> dict:
    """Returns {is_healthy_probability, issues: [{name, probability, description, treatment}]}."""
    result = raw.get("result", {})
    is_healthy_probability = result.get("is_healthy", {}).get("probability", 1.0)

    disease_suggestions = result.get("disease", {}).get("suggestions", []) or []
    issues = []
    for d in disease_suggestions:
        details = d.get("details", {}) or {}
        treatment = details.get("treatment", {}) or {}
        treatment_parts = []
        for key in ("biological", "chemical", "prevention"):
            steps = treatment.get(key) or []
            if steps:
                treatment_parts.append(f"{key.capitalize()}: " + "; ".join(steps))
        issues.append(
            {
                "name": d.get("name", "Unknown issue"),
                "probability": d.get("probability", 0.0),
                "description": details.get("description") or "No description returned by the provider.",
                "treatment": " | ".join(treatment_parts) if treatment_parts else None,
            }
        )
    return {"is_healthy_probability": is_healthy_probability, "issues": issues}
