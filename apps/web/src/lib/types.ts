export type PlantCategory =
  | "tree"
  | "shrub"
  | "herb"
  | "climber"
  | "creeper"
  | "aquatic"
  | "medicinal"
  | "flowering"
  | "non_flowering"
  | "succulent"
  | "cactus"
  | "fern"
  | "grass"
  | "orchid"
  | "indoor"
  | "outdoor"
  | "agricultural"
  | "endangered"
  | "carnivorous";

export type ConservationStatus =
  | "least_concern"
  | "near_threatened"
  | "vulnerable"
  | "endangered"
  | "critically_endangered"
  | "not_evaluated";

export interface PlantCard {
  id: number;
  slug: string;
  common_name: string;
  scientific_name: string;
  category: PlantCategory;
  image_url: string | null;
  short_description: string;
}

export interface PlantDetail {
  id: number;
  slug: string;
  common_name: string;
  scientific_name: string;
  species: string;
  genus: string;
  family: string;
  kingdom: string;
  order_name: string;
  class_name: string;
  category: PlantCategory;
  image_url: string | null;

  physical_characteristics: string;
  leaf_shape: string;
  flower_description: string;
  fruit_description: string;
  root_structure: string;
  average_height: string;
  growth_pattern: string;
  life_cycle: string;

  natural_habitat: string;
  geographic_distribution: string;
  native_region: string;
  climate_requirements: string;
  temperature_requirements: string;
  humidity_requirements: string;
  sunlight_requirements: string;
  water_requirements: string;
  altitude_range: string;

  soil_type: string;
  soil_ph: string;
  soil_drainage: string;
  soil_fertility: string;
  nutrient_requirements: string;
  recommended_fertilizers: string;

  how_to_grow: string;
  planting_season: string;
  propagation_methods: string;
  watering_schedule: string;
  pruning_requirements: string;
  fertilizer_schedule: string;
  common_growing_problems: string;
  maintenance_tips: string;

  medicinal_uses: string;
  ecological_importance: string;
  economic_importance: string;
  toxicity_and_safety: string;
  conservation_status: ConservationStatus;
  interesting_facts: string;

  is_indoor: boolean;
  is_outdoor: boolean;
  is_flowering: boolean;
  is_medicinal: boolean;
  is_aquatic: boolean;
  is_tree_or_shrub: boolean;
}

export interface PlantListResponse {
  items: PlantCard[];
  total: number;
  page: number;
  page_size: number;
}

export interface PlantComparisonField {
  label: string;
  a: string;
  b: string;
}

export interface PlantComparisonResponse {
  plant_a: PlantCard;
  plant_b: PlantCard;
  fields: PlantComparisonField[];
}

export interface UserPublic {
  id: number;
  email: string;
  display_name: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserPublic;
}

export interface IdentificationCandidate {
  common_name: string | null;
  scientific_name: string;
  genus: string | null;
  species: string | null;
  family: string | null;
  probability: number;
  matched_plant: PlantCard | null;
}

export interface IdentificationResponse {
  candidates: IdentificationCandidate[];
  is_plant_probability: number | null;
  log_id: number;
}

export interface HealthIssue {
  name: string;
  probability: number;
  description: string;
  treatment: string | null;
}

export interface HealthAssessmentResponse {
  health_status: "healthy" | "warning" | "unhealthy";
  severity: "none" | "moderate" | "high";
  is_healthy_probability: number;
  issues: HealthIssue[];
  care_recommendations: string[];
  disclaimer: string;
  log_id: number;
}

export type GardenLogType = "watering" | "growth" | "health_report" | "note";

export interface GardenLogOut {
  id: number;
  log_type: GardenLogType;
  note: string | null;
  measurement: string | null;
  logged_at: string;
}

export interface GardenEntryOut {
  id: number;
  plant: PlantCard;
  added_at: string;
  notes: string | null;
  logs: GardenLogOut[];
}

export interface ArticleCard {
  slug: string;
  title: string;
  summary: string;
}

export interface ArticleDetail {
  slug: string;
  title: string;
  summary: string;
  content_markdown: string;
}

export interface PublicConfig {
  appName: string;
  aiFeaturesEnabled: boolean;
}

export interface BlogAuthor {
  id: number;
  display_name: string;
}

export interface BlogPostCard {
  slug: string;
  title: string;
  excerpt: string;
  author: BlogAuthor;
  is_progress_update: boolean;
  linked_plant: PlantCard | null;
  created_at: string;
}

export interface BlogPostDetail {
  slug: string;
  title: string;
  content_markdown: string;
  author: BlogAuthor;
  is_progress_update: boolean;
  linked_plant: PlantCard | null;
  created_at: string;
  updated_at: string;
  is_mine: boolean;
}

export interface BlogListResponse {
  items: BlogPostCard[];
  total: number;
  page: number;
  page_size: number;
}

export type WaveScale = "house" | "neighbourhood" | "city" | "country";

export interface NgoCard {
  id: number;
  org_name: string;
  mission: string;
  focus_area: string;
  location: string | null;
  active_opportunity_count: number;
}

export interface OpportunityCard {
  id: number;
  title: string;
  description: string;
  wave_scale: WaveScale;
  location: string | null;
  event_date: string | null;
  is_active: boolean;
  created_at: string;
  ngo: NgoCard;
}

export interface NgoDetail {
  id: number;
  org_name: string;
  mission: string;
  focus_area: string;
  contact_email: string;
  website: string | null;
  location: string | null;
  is_mine: boolean;
  opportunities: OpportunityCard[];
}

export interface OpportunityListResponse {
  items: OpportunityCard[];
  total: number;
  page: number;
  page_size: number;
}

export interface OutreachOut {
  id: number;
  opportunity_id: number | null;
  sender_name: string;
  sender_email: string;
  message: string;
  created_at: string;
}
