from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import ConservationStatus, GardenLogType, PlantCategory, WaveScale

NOT_AVAILABLE = "Not available"


def na(value: str | None) -> str:
    """Render an unset botanical field as 'Not available' rather than inventing a fact."""
    return value if value else NOT_AVAILABLE


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=80)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: int
    email: str
    display_name: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserPublic


# ---------------------------------------------------------------------------
# Plants
# ---------------------------------------------------------------------------


class PlantCard(BaseModel):
    id: int
    slug: str
    common_name: str
    scientific_name: str
    category: PlantCategory
    image_url: str | None
    short_description: str


class PlantDetail(BaseModel):
    id: int
    slug: str
    common_name: str
    scientific_name: str
    species: str
    genus: str
    family: str
    kingdom: str
    order_name: str
    class_name: str
    category: PlantCategory
    image_url: str | None

    physical_characteristics: str
    leaf_shape: str
    flower_description: str
    fruit_description: str
    root_structure: str
    average_height: str
    growth_pattern: str
    life_cycle: str

    natural_habitat: str
    geographic_distribution: str
    native_region: str
    climate_requirements: str
    temperature_requirements: str
    humidity_requirements: str
    sunlight_requirements: str
    water_requirements: str
    altitude_range: str

    soil_type: str
    soil_ph: str
    soil_drainage: str
    soil_fertility: str
    nutrient_requirements: str
    recommended_fertilizers: str

    how_to_grow: str
    planting_season: str
    propagation_methods: str
    watering_schedule: str
    pruning_requirements: str
    fertilizer_schedule: str
    common_growing_problems: str
    maintenance_tips: str

    medicinal_uses: str
    ecological_importance: str
    economic_importance: str
    toxicity_and_safety: str
    conservation_status: ConservationStatus
    interesting_facts: str

    is_indoor: bool
    is_outdoor: bool
    is_flowering: bool
    is_medicinal: bool
    is_aquatic: bool
    is_tree_or_shrub: bool


class PlantListResponse(BaseModel):
    items: list[PlantCard]
    total: int
    page: int
    page_size: int


class PlantComparisonField(BaseModel):
    label: str
    a: str
    b: str


class PlantComparisonResponse(BaseModel):
    plant_a: PlantCard
    plant_b: PlantCard
    fields: list[PlantComparisonField]


# ---------------------------------------------------------------------------
# AI
# ---------------------------------------------------------------------------


class IdentificationCandidate(BaseModel):
    common_name: str | None
    scientific_name: str
    genus: str | None
    species: str | None
    family: str | None
    probability: float
    matched_plant: PlantCard | None


class IdentificationResponse(BaseModel):
    candidates: list[IdentificationCandidate]
    is_plant_probability: float | None
    log_id: int


class HealthIssue(BaseModel):
    name: str
    probability: float
    description: str
    treatment: str | None


class HealthAssessmentResponse(BaseModel):
    health_status: str  # "healthy" | "warning" | "unhealthy"
    severity: str  # "none" | "moderate" | "high"
    is_healthy_probability: float
    issues: list[HealthIssue]
    care_recommendations: list[str]
    disclaimer: str
    log_id: int


# ---------------------------------------------------------------------------
# My Garden
# ---------------------------------------------------------------------------


class AddToGardenRequest(BaseModel):
    plant_id: int
    notes: str | None = None


class GardenLogCreate(BaseModel):
    log_type: GardenLogType
    note: str | None = None
    measurement: str | None = None


class GardenLogOut(BaseModel):
    id: int
    log_type: GardenLogType
    note: str | None
    measurement: str | None
    logged_at: datetime


class GardenEntryOut(BaseModel):
    id: int
    plant: PlantCard
    added_at: datetime
    notes: str | None
    logs: list[GardenLogOut]


# ---------------------------------------------------------------------------
# Learn Botany
# ---------------------------------------------------------------------------


class ArticleCard(BaseModel):
    slug: str
    title: str
    summary: str


class ArticleDetail(BaseModel):
    slug: str
    title: str
    summary: str
    content_markdown: str


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


# ---------------------------------------------------------------------------
# Community blog
# ---------------------------------------------------------------------------


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    excerpt: str = Field(min_length=1, max_length=280)
    content_markdown: str = Field(min_length=1, max_length=20000)
    is_progress_update: bool = False
    linked_plant_id: int | None = None


class BlogAuthor(BaseModel):
    id: int
    display_name: str


class BlogPostCard(BaseModel):
    slug: str
    title: str
    excerpt: str
    author: BlogAuthor
    is_progress_update: bool
    linked_plant: PlantCard | None
    created_at: datetime


class BlogPostDetail(BaseModel):
    slug: str
    title: str
    content_markdown: str
    author: BlogAuthor
    is_progress_update: bool
    linked_plant: PlantCard | None
    created_at: datetime
    updated_at: datetime
    is_mine: bool


class BlogListResponse(BaseModel):
    items: list[BlogPostCard]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# NGO directory, opportunities, and outreach
# ---------------------------------------------------------------------------


class NgoRegisterRequest(BaseModel):
    org_name: str = Field(min_length=2, max_length=160)
    mission: str = Field(min_length=10, max_length=2000)
    focus_area: str = Field(min_length=2, max_length=160)
    contact_email: EmailStr
    website: str | None = Field(default=None, max_length=300)
    location: str | None = Field(default=None, max_length=160)


class NgoCard(BaseModel):
    id: int
    org_name: str
    mission: str
    focus_area: str
    location: str | None
    active_opportunity_count: int


class NgoDetail(BaseModel):
    id: int
    org_name: str
    mission: str
    focus_area: str
    contact_email: str
    website: str | None
    location: str | None
    is_mine: bool
    opportunities: list["OpportunityCard"]


class OpportunityCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=4000)
    wave_scale: WaveScale
    location: str | None = Field(default=None, max_length=160)
    event_date: datetime | None = None


class OpportunityCard(BaseModel):
    id: int
    title: str
    description: str
    wave_scale: WaveScale
    location: str | None
    event_date: datetime | None
    is_active: bool
    created_at: datetime
    ngo: NgoCard


class OpportunityListResponse(BaseModel):
    items: list[OpportunityCard]
    total: int
    page: int
    page_size: int


class OutreachCreate(BaseModel):
    ngo_id: int
    opportunity_id: int | None = None
    sender_name: str = Field(min_length=1, max_length=120)
    sender_email: EmailStr
    message: str = Field(min_length=1, max_length=3000)


class OutreachOut(BaseModel):
    id: int
    opportunity_id: int | None
    sender_name: str
    sender_email: str
    message: str
    created_at: datetime
