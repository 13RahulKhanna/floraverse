from datetime import datetime, timezone
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PlantCategory(str, Enum):
    TREE = "tree"
    SHRUB = "shrub"
    HERB = "herb"
    CLIMBER = "climber"
    CREEPER = "creeper"
    AQUATIC = "aquatic"
    MEDICINAL = "medicinal"
    FLOWERING = "flowering"
    NON_FLOWERING = "non_flowering"
    SUCCULENT = "succulent"
    CACTUS = "cactus"
    FERN = "fern"
    GRASS = "grass"
    ORCHID = "orchid"
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    AGRICULTURAL = "agricultural"
    ENDANGERED = "endangered"
    CARNIVOROUS = "carnivorous"


class ConservationStatus(str, Enum):
    LEAST_CONCERN = "least_concern"
    NEAR_THREATENED = "near_threatened"
    VULNERABLE = "vulnerable"
    ENDANGERED = "endangered"
    CRITICALLY_ENDANGERED = "critically_endangered"
    NOT_EVALUATED = "not_evaluated"


# ---------------------------------------------------------------------------
# Users & auth
# ---------------------------------------------------------------------------


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    display_name: str
    created_at: datetime = Field(default_factory=utcnow)

    garden_entries: list["GardenEntry"] = Relationship(back_populates="user")
    identification_logs: list["IdentificationLog"] = Relationship(back_populates="user")


# ---------------------------------------------------------------------------
# Plant encyclopedia
# ---------------------------------------------------------------------------


class Plant(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)

    # A. Basic information
    common_name: str = Field(index=True)
    scientific_name: str = Field(index=True, unique=True)
    species: str | None = None
    genus: str | None = Field(default=None, index=True)
    family: str | None = Field(default=None, index=True)
    kingdom: str | None = "Plantae"
    order_name: str | None = None
    class_name: str | None = None
    category: PlantCategory = Field(index=True)
    image_url: str | None = None

    # B. Botanical description
    physical_characteristics: str | None = None
    leaf_shape: str | None = None
    flower_description: str | None = None
    fruit_description: str | None = None
    root_structure: str | None = None
    average_height: str | None = None
    growth_pattern: str | None = None
    life_cycle: str | None = None

    # C. Habitat and environment
    natural_habitat: str | None = None
    geographic_distribution: str | None = None
    native_region: str | None = None
    climate_requirements: str | None = None
    temperature_requirements: str | None = None
    humidity_requirements: str | None = None
    sunlight_requirements: str | None = None
    water_requirements: str | None = None
    altitude_range: str | None = None

    # D. Soil requirements
    soil_type: str | None = None
    soil_ph: str | None = None
    soil_drainage: str | None = None
    soil_fertility: str | None = None
    nutrient_requirements: str | None = None
    recommended_fertilizers: str | None = None

    # E. Cultivation and maintenance
    how_to_grow: str | None = None
    planting_season: str | None = None
    propagation_methods: str | None = None
    watering_schedule: str | None = None
    pruning_requirements: str | None = None
    fertilizer_schedule: str | None = None
    common_growing_problems: str | None = None
    maintenance_tips: str | None = None

    # F. Additional information
    medicinal_uses: str | None = None
    ecological_importance: str | None = None
    economic_importance: str | None = None
    toxicity_and_safety: str | None = None
    conservation_status: ConservationStatus = ConservationStatus.NOT_EVALUATED
    interesting_facts: str | None = None

    # Filter flags
    is_indoor: bool = False
    is_outdoor: bool = False
    is_flowering: bool = False
    is_medicinal: bool = False
    is_aquatic: bool = False
    is_tree_or_shrub: bool = False

    is_plant_of_the_day: bool = False
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    garden_entries: list["GardenEntry"] = Relationship(back_populates="plant")


# ---------------------------------------------------------------------------
# My Garden
# ---------------------------------------------------------------------------


class GardenEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    plant_id: int = Field(foreign_key="plant.id", index=True)
    added_at: datetime = Field(default_factory=utcnow)
    notes: str | None = None

    user: User = Relationship(back_populates="garden_entries")
    plant: Plant = Relationship(back_populates="garden_entries")
    logs: list["GardenLog"] = Relationship(back_populates="garden_entry")


class GardenLogType(str, Enum):
    WATERING = "watering"
    GROWTH = "growth"
    HEALTH_REPORT = "health_report"
    NOTE = "note"


class GardenLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    garden_entry_id: int = Field(foreign_key="gardenentry.id", index=True)
    log_type: GardenLogType
    note: str | None = None
    # For growth logs: a free-text measurement (e.g. "12 cm"), kept simple rather than
    # forcing a single unit system on every plant type.
    measurement: str | None = None
    logged_at: datetime = Field(default_factory=utcnow)

    garden_entry: GardenEntry = Relationship(back_populates="logs")


# ---------------------------------------------------------------------------
# AI identification / health — logs of what was actually sent to Plant.id and
# what it returned, so "My Garden" health history has something real to show.
# ---------------------------------------------------------------------------


class IdentificationLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    image_path: str
    matched_plant_id: int | None = Field(default=None, foreign_key="plant.id")
    raw_result: str  # JSON string of the provider response, for audit/debugging
    created_at: datetime = Field(default_factory=utcnow)

    user: User | None = Relationship(back_populates="identification_logs")


class HealthAssessmentLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    plant_id: int | None = Field(default=None, foreign_key="plant.id")
    image_path: str
    raw_result: str
    created_at: datetime = Field(default_factory=utcnow)


# ---------------------------------------------------------------------------
# Learn Botany articles
# ---------------------------------------------------------------------------


class Article(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    title: str
    summary: str
    content_markdown: str
    order_index: int = 0
    created_at: datetime = Field(default_factory=utcnow)


# ---------------------------------------------------------------------------
# Contact messages — stored, not emailed (no email provider configured; see docs).
# ---------------------------------------------------------------------------


class ContactMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime = Field(default_factory=utcnow)


# ---------------------------------------------------------------------------
# Community blog — includes garden "progress update" posts, optionally linked to a
# specific plant so a post can read as "an update on my Aloe Vera" rather than a
# generic article.
# ---------------------------------------------------------------------------


class BlogPost(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id", index=True)
    slug: str = Field(unique=True, index=True)
    title: str
    excerpt: str
    content_markdown: str
    is_progress_update: bool = False
    linked_plant_id: int | None = Field(default=None, foreign_key="plant.id")
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


# ---------------------------------------------------------------------------
# NGO directory, opportunities, and outreach — lets an organization register a
# profile, post opportunities tied to a conservation "wave" scale (house /
# neighbourhood / city / country, matching the Conservation Guide page), and
# receive outreach messages from interested users.
# ---------------------------------------------------------------------------


class WaveScale(str, Enum):
    HOUSE = "house"
    NEIGHBOURHOOD = "neighbourhood"
    CITY = "city"
    COUNTRY = "country"


class NgoProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    org_name: str
    mission: str
    focus_area: str
    contact_email: str
    website: str | None = None
    location: str | None = None
    created_at: datetime = Field(default_factory=utcnow)


class Opportunity(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ngo_id: int = Field(foreign_key="ngoprofile.id", index=True)
    title: str
    description: str
    wave_scale: WaveScale
    location: str | None = None
    event_date: datetime | None = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=utcnow)


class OutreachMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ngo_id: int = Field(foreign_key="ngoprofile.id", index=True)
    opportunity_id: int | None = Field(default=None, foreign_key="opportunity.id")
    sender_user_id: int | None = Field(default=None, foreign_key="user.id")
    sender_name: str
    sender_email: str
    message: str
    created_at: datetime = Field(default_factory=utcnow)
