import hashlib
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, or_, select

from app.db import get_session
from app.models import ClimatePreference, Plant, PlantCategory, SunlightLevel
from app.schemas import PlantCard, PlantComparisonField, PlantComparisonResponse, PlantDetail, PlantListResponse
from app.serializers import to_plant_card, to_plant_detail

router = APIRouter(prefix="/api/v1/plants", tags=["plants"])


@router.get("", response_model=PlantListResponse)
def list_plants(
    q: str | None = Query(default=None, description="Search by common name, scientific name, genus, species, or family"),
    category: PlantCategory | None = None,
    habitat: str | None = Query(default=None, description="Substring match against natural_habitat"),
    soil_type: str | None = Query(default=None, description="Substring match against soil_type"),
    is_indoor: bool | None = None,
    is_outdoor: bool | None = None,
    is_flowering: bool | None = None,
    is_medicinal: bool | None = None,
    is_aquatic: bool | None = None,
    is_tree_or_shrub: bool | None = None,
    sunlight_level: SunlightLevel | None = None,
    climate_preference: ClimatePreference | None = None,
    is_air_purifying: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> PlantListResponse:
    statement = select(Plant)

    if q:
        like = f"%{q}%"
        statement = statement.where(
            or_(
                Plant.common_name.ilike(like),  # type: ignore[attr-defined]
                Plant.scientific_name.ilike(like),  # type: ignore[attr-defined]
                Plant.genus.ilike(like),  # type: ignore[attr-defined]
                Plant.species.ilike(like),  # type: ignore[attr-defined]
                Plant.family.ilike(like),  # type: ignore[attr-defined]
            )
        )
    if category:
        statement = statement.where(Plant.category == category)
    if habitat:
        statement = statement.where(Plant.natural_habitat.ilike(f"%{habitat}%"))  # type: ignore[attr-defined]
    if soil_type:
        statement = statement.where(Plant.soil_type.ilike(f"%{soil_type}%"))  # type: ignore[attr-defined]
    if is_indoor is not None:
        statement = statement.where(Plant.is_indoor == is_indoor)
    if is_outdoor is not None:
        statement = statement.where(Plant.is_outdoor == is_outdoor)
    if is_flowering is not None:
        statement = statement.where(Plant.is_flowering == is_flowering)
    if is_medicinal is not None:
        statement = statement.where(Plant.is_medicinal == is_medicinal)
    if is_aquatic is not None:
        statement = statement.where(Plant.is_aquatic == is_aquatic)
    if is_tree_or_shrub is not None:
        statement = statement.where(Plant.is_tree_or_shrub == is_tree_or_shrub)
    if sunlight_level:
        statement = statement.where(Plant.sunlight_level == sunlight_level)
    if climate_preference:
        statement = statement.where(Plant.climate_preference == climate_preference)
    if is_air_purifying is not None:
        statement = statement.where(Plant.is_air_purifying == is_air_purifying)

    total = session.exec(select(func.count()).select_from(statement.subquery())).one()

    statement = statement.order_by(Plant.common_name).offset((page - 1) * page_size).limit(page_size)
    plants = session.exec(statement).all()

    return PlantListResponse(
        items=[to_plant_card(p) for p in plants],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/categories", response_model=list[str])
def list_categories() -> list[str]:
    return [c.value for c in PlantCategory]


@router.get("/plant-of-the-day", response_model=PlantCard)
def plant_of_the_day(session: Session = Depends(get_session)) -> PlantCard:
    """
    Deterministic daily rotation over all plants (same approach used elsewhere in this
    user's other projects): no cron job needed, and it's the same pick all day.
    """
    plants = session.exec(select(Plant).order_by(Plant.id)).all()
    if not plants:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No plants in the encyclopedia yet")
    seed = int(hashlib.sha256(date.today().isoformat().encode()).hexdigest(), 16)
    plant = plants[seed % len(plants)]
    return to_plant_card(plant)


@router.get("/featured", response_model=list[PlantCard])
def featured_plants(limit: int = Query(default=6, ge=1, le=20), session: Session = Depends(get_session)) -> list[PlantCard]:
    plants = session.exec(select(Plant).order_by(Plant.id).limit(limit)).all()
    return [to_plant_card(p) for p in plants]


@router.get("/recent", response_model=list[PlantCard])
def recently_added(limit: int = Query(default=6, ge=1, le=20), session: Session = Depends(get_session)) -> list[PlantCard]:
    plants = session.exec(select(Plant).order_by(Plant.created_at.desc()).limit(limit)).all()  # type: ignore[attr-defined]
    return [to_plant_card(p) for p in plants]


@router.get("/compare", response_model=PlantComparisonResponse)
def compare_plants(a: int, b: int, session: Session = Depends(get_session)) -> PlantComparisonResponse:
    plant_a = session.get(Plant, a)
    plant_b = session.get(Plant, b)
    if not plant_a or not plant_b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both plants were not found")

    detail_a, detail_b = to_plant_detail(plant_a), to_plant_detail(plant_b)
    fields = [
        PlantComparisonField(label="Common name", a=detail_a.common_name, b=detail_b.common_name),
        PlantComparisonField(label="Scientific name", a=detail_a.scientific_name, b=detail_b.scientific_name),
        PlantComparisonField(label="Genus", a=detail_a.genus, b=detail_b.genus),
        PlantComparisonField(label="Species", a=detail_a.species, b=detail_b.species),
        PlantComparisonField(label="Family", a=detail_a.family, b=detail_b.family),
        PlantComparisonField(label="Natural habitat", a=detail_a.natural_habitat, b=detail_b.natural_habitat),
        PlantComparisonField(label="Soil requirements", a=detail_a.soil_type, b=detail_b.soil_type),
        PlantComparisonField(label="Water requirements", a=detail_a.water_requirements, b=detail_b.water_requirements),
        PlantComparisonField(label="Sunlight requirements", a=detail_a.sunlight_requirements, b=detail_b.sunlight_requirements),
        PlantComparisonField(label="Growth pattern", a=detail_a.growth_pattern, b=detail_b.growth_pattern),
        PlantComparisonField(label="Average height", a=detail_a.average_height, b=detail_b.average_height),
        PlantComparisonField(label="Climate preference", a=detail_a.climate_requirements, b=detail_b.climate_requirements),
    ]
    return PlantComparisonResponse(plant_a=to_plant_card(plant_a), plant_b=to_plant_card(plant_b), fields=fields)


@router.get("/{slug}", response_model=PlantDetail)
def get_plant(slug: str, session: Session = Depends(get_session)) -> PlantDetail:
    plant = session.exec(select(Plant).where(Plant.slug == slug)).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return to_plant_detail(plant)
