import json

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlmodel import Session, select

from app.ai_client import (
    PlantIdNotConfigured,
    PlantIdRequestError,
    assess_health,
    identify_image,
    parse_health_assessment,
    parse_identification_candidates,
)
from app.db import get_session
from app.models import HealthAssessmentLog, IdentificationLog, Plant, User
from app.schemas import HealthAssessmentResponse, HealthIssue, IdentificationCandidate, IdentificationResponse
from app.security import get_current_user_optional
from app.serializers import to_plant_card
from app.uploads import save_upload

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

HEALTH_DISCLAIMER = (
    "This assessment is generated from a photo by an automated image-recognition model. It is "
    "preliminary and can be wrong, especially for subtle or early-stage problems. If your plant "
    "shows serious symptoms, is valuable, or the result is uncertain, confirm with a local plant "
    "specialist, extension office, or nursery before treating it."
)


def _match_plant_by_name(session: Session, scientific_name: str, genus: str | None) -> Plant | None:
    if scientific_name:
        exact = session.exec(select(Plant).where(Plant.scientific_name.ilike(scientific_name))).first()  # type: ignore[attr-defined]
        if exact:
            return exact
    if genus:
        by_genus = session.exec(select(Plant).where(Plant.genus.ilike(genus))).first()  # type: ignore[attr-defined]
        if by_genus:
            return by_genus
    return None


@router.post("/identify", response_model=IdentificationResponse)
async def identify_plant(
    file: UploadFile,
    user: User | None = Depends(get_current_user_optional),
    session: Session = Depends(get_session),
) -> IdentificationResponse:
    content, content_type, relative_path = await save_upload(file)

    try:
        raw = await identify_image(content, content_type)
    except PlantIdNotConfigured as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except PlantIdRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="The plant identification provider rejected the request."
        ) from exc

    candidates_raw, is_plant_probability = parse_identification_candidates(raw)

    candidates: list[IdentificationCandidate] = []
    top_matched_plant_id: int | None = None
    for c in candidates_raw:
        matched = _match_plant_by_name(session, c["scientific_name"], c["genus"])
        if matched and top_matched_plant_id is None:
            top_matched_plant_id = matched.id
        candidates.append(
            IdentificationCandidate(
                common_name=c["common_name"],
                scientific_name=c["scientific_name"],
                genus=c["genus"],
                species=c["species"],
                family=c["family"],
                probability=c["probability"],
                matched_plant=to_plant_card(matched) if matched else None,
            )
        )

    log = IdentificationLog(
        user_id=user.id if user else None,
        image_path=relative_path,
        matched_plant_id=top_matched_plant_id,
        raw_result=json.dumps(raw)[:20000],
    )
    session.add(log)
    session.commit()
    session.refresh(log)

    return IdentificationResponse(candidates=candidates, is_plant_probability=is_plant_probability, log_id=log.id)  # type: ignore[arg-type]


def _classify_health_status(is_healthy_probability: float, issues: list[dict]) -> str:
    significant_issues = [i for i in issues if i["probability"] >= 0.5]
    if is_healthy_probability >= 0.85 and not significant_issues:
        return "healthy"
    if is_healthy_probability < 0.5 or any(i["probability"] >= 0.7 for i in significant_issues):
        return "unhealthy"
    return "warning"


def _severity_from_status(health_status: str) -> str:
    return {"healthy": "none", "warning": "moderate", "unhealthy": "high"}[health_status]


def _generic_care_recommendations(plant: Plant | None) -> list[str]:
    if plant:
        return [
            f"Watering: {plant.watering_schedule or 'Not available'}",
            f"Sunlight: {plant.sunlight_requirements or 'Not available'}",
            f"Soil: {plant.soil_type or 'Not available'}",
            f"Fertilizer: {plant.fertilizer_schedule or 'Not available'}",
            f"Pruning: {plant.pruning_requirements or 'Not available'}",
        ]
    return [
        "Check that the plant isn't sitting in waterlogged soil — most leaf yellowing and root problems trace back to overwatering.",
        "Confirm it's getting the right amount of light for its species — too little light often looks like a nutrient problem.",
        "Isolate the plant from others nearby if a pest or fungal infection is suspected, to limit spread.",
        "Remove visibly dead or severely affected leaves to redirect the plant's energy toward healthy growth.",
    ]


@router.post("/health", response_model=HealthAssessmentResponse)
async def analyze_plant_health(
    file: UploadFile,
    plant_id: int | None = Form(default=None),
    user: User | None = Depends(get_current_user_optional),
    session: Session = Depends(get_session),
) -> HealthAssessmentResponse:
    content, content_type, relative_path = await save_upload(file)

    try:
        raw = await assess_health(content, content_type)
    except PlantIdNotConfigured as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except PlantIdRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="The plant health assessment provider rejected the request."
        ) from exc

    parsed = parse_health_assessment(raw)
    health_status = _classify_health_status(parsed["is_healthy_probability"], parsed["issues"])

    plant = session.get(Plant, plant_id) if plant_id else None

    log = HealthAssessmentLog(
        user_id=user.id if user else None,
        plant_id=plant.id if plant else None,
        image_path=relative_path,
        raw_result=json.dumps(raw)[:20000],
    )
    session.add(log)
    session.commit()
    session.refresh(log)

    return HealthAssessmentResponse(
        health_status=health_status,
        severity=_severity_from_status(health_status),
        is_healthy_probability=parsed["is_healthy_probability"],
        issues=[
            HealthIssue(name=i["name"], probability=i["probability"], description=i["description"], treatment=i["treatment"])
            for i in parsed["issues"]
        ],
        care_recommendations=_generic_care_recommendations(plant),
        disclaimer=HEALTH_DISCLAIMER,
        log_id=log.id,  # type: ignore[arg-type]
    )
