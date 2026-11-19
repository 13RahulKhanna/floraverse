from app.models import BlogPost, NgoProfile, Opportunity, Plant, User
from app.schemas import (
    BlogAuthor,
    BlogPostCard,
    BlogPostDetail,
    NgoCard,
    OpportunityCard,
    PlantCard,
    PlantDetail,
    na,
)


def plant_short_description(plant: Plant) -> str:
    if plant.physical_characteristics:
        text = plant.physical_characteristics
        return text if len(text) <= 160 else text[:157].rstrip() + "..."
    return na(None)


def to_plant_card(plant: Plant) -> PlantCard:
    return PlantCard(
        id=plant.id,  # type: ignore[arg-type]
        slug=plant.slug,
        common_name=plant.common_name,
        scientific_name=plant.scientific_name,
        category=plant.category,
        image_url=plant.image_url,
        short_description=plant_short_description(plant),
        sunlight_level=plant.sunlight_level,
        climate_preference=plant.climate_preference,
        is_air_purifying=plant.is_air_purifying,
    )


def to_plant_detail(plant: Plant) -> PlantDetail:
    return PlantDetail(
        id=plant.id,  # type: ignore[arg-type]
        slug=plant.slug,
        common_name=plant.common_name,
        scientific_name=plant.scientific_name,
        species=na(plant.species),
        genus=na(plant.genus),
        family=na(plant.family),
        kingdom=na(plant.kingdom),
        order_name=na(plant.order_name),
        class_name=na(plant.class_name),
        category=plant.category,
        image_url=plant.image_url,
        physical_characteristics=na(plant.physical_characteristics),
        leaf_shape=na(plant.leaf_shape),
        flower_description=na(plant.flower_description),
        fruit_description=na(plant.fruit_description),
        root_structure=na(plant.root_structure),
        average_height=na(plant.average_height),
        growth_pattern=na(plant.growth_pattern),
        life_cycle=na(plant.life_cycle),
        natural_habitat=na(plant.natural_habitat),
        geographic_distribution=na(plant.geographic_distribution),
        native_region=na(plant.native_region),
        climate_requirements=na(plant.climate_requirements),
        temperature_requirements=na(plant.temperature_requirements),
        humidity_requirements=na(plant.humidity_requirements),
        sunlight_requirements=na(plant.sunlight_requirements),
        water_requirements=na(plant.water_requirements),
        altitude_range=na(plant.altitude_range),
        soil_type=na(plant.soil_type),
        soil_ph=na(plant.soil_ph),
        soil_drainage=na(plant.soil_drainage),
        soil_fertility=na(plant.soil_fertility),
        nutrient_requirements=na(plant.nutrient_requirements),
        recommended_fertilizers=na(plant.recommended_fertilizers),
        how_to_grow=na(plant.how_to_grow),
        planting_season=na(plant.planting_season),
        propagation_methods=na(plant.propagation_methods),
        watering_schedule=na(plant.watering_schedule),
        pruning_requirements=na(plant.pruning_requirements),
        fertilizer_schedule=na(plant.fertilizer_schedule),
        common_growing_problems=na(plant.common_growing_problems),
        maintenance_tips=na(plant.maintenance_tips),
        medicinal_uses=na(plant.medicinal_uses),
        ecological_importance=na(plant.ecological_importance),
        economic_importance=na(plant.economic_importance),
        toxicity_and_safety=na(plant.toxicity_and_safety),
        conservation_status=plant.conservation_status,
        interesting_facts=na(plant.interesting_facts),
        is_indoor=plant.is_indoor,
        is_outdoor=plant.is_outdoor,
        is_flowering=plant.is_flowering,
        is_medicinal=plant.is_medicinal,
        is_aquatic=plant.is_aquatic,
        is_tree_or_shrub=plant.is_tree_or_shrub,
        sunlight_level=plant.sunlight_level,
        climate_preference=plant.climate_preference,
        is_air_purifying=plant.is_air_purifying,
    )


def to_blog_card(post: BlogPost, author: User, linked_plant: Plant | None) -> BlogPostCard:
    return BlogPostCard(
        slug=post.slug,
        title=post.title,
        excerpt=post.excerpt,
        author=BlogAuthor(id=author.id, display_name=author.display_name),  # type: ignore[arg-type]
        is_progress_update=post.is_progress_update,
        linked_plant=to_plant_card(linked_plant) if linked_plant else None,
        created_at=post.created_at,
    )


def to_blog_detail(post: BlogPost, author: User, linked_plant: Plant | None, is_mine: bool) -> BlogPostDetail:
    return BlogPostDetail(
        slug=post.slug,
        title=post.title,
        content_markdown=post.content_markdown,
        author=BlogAuthor(id=author.id, display_name=author.display_name),  # type: ignore[arg-type]
        is_progress_update=post.is_progress_update,
        linked_plant=to_plant_card(linked_plant) if linked_plant else None,
        created_at=post.created_at,
        updated_at=post.updated_at,
        is_mine=is_mine,
    )


def to_ngo_card(ngo: NgoProfile, active_opportunity_count: int) -> NgoCard:
    return NgoCard(
        id=ngo.id,  # type: ignore[arg-type]
        org_name=ngo.org_name,
        mission=ngo.mission,
        focus_area=ngo.focus_area,
        location=ngo.location,
        active_opportunity_count=active_opportunity_count,
    )


def to_opportunity_card(opportunity: Opportunity, ngo_card: NgoCard) -> OpportunityCard:
    return OpportunityCard(
        id=opportunity.id,  # type: ignore[arg-type]
        title=opportunity.title,
        description=opportunity.description,
        wave_scale=opportunity.wave_scale,
        location=opportunity.location,
        event_date=opportunity.event_date,
        is_active=opportunity.is_active,
        created_at=opportunity.created_at,
        ngo=ngo_card,
    )
