import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Droplets, Sun, CloudSun, CloudMoon, Thermometer, Wind, Sprout, Heart, HeartOff, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Loading, ErrorState } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlantImage } from "@/components/plants/PlantImage";
import type { PlantDetail } from "@/lib/types";

const SUNLIGHT_ICON = { full_sun: Sun, partial_sun: CloudSun, low_light: CloudMoon };
const SUNLIGHT_LABEL = { full_sun: "Full Sun", partial_sun: "Partial Sun", low_light: "Low Light" };

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <Card>
      <h2 className="font-serif text-xl font-semibold mb-4">{title}</h2>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-[color:var(--color-ink-faint)]">{label}</dt>
            <dd className={`text-sm mt-0.5 ${value === "Not available" ? "text-[color:var(--color-ink-faint)] italic" : "text-[color:var(--color-ink)]"}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function PlantDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: plant, loading, error } = useApi<PlantDetail>(slug ? `/api/v1/plants/${slug}` : null, [slug]);
  const [gardenState, setGardenState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function addToGarden() {
    if (!plant) return;
    setGardenState("saving");
    try {
      await apiFetch("/api/v1/garden", { method: "POST", body: JSON.stringify({ plant_id: plant.id }) });
      setGardenState("saved");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setGardenState("saved");
      else setGardenState("error");
    }
  }

  if (loading) return <Loading label="Loading plant profile..." />;
  if (error || !plant) return <ErrorState message={error ?? "Plant not found."} />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="leaf-card overflow-hidden grid sm:grid-cols-[280px_1fr]">
        <PlantImage src={plant.image_url} category={plant.category} className="h-56 sm:h-full w-full" />
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="forest">{plant.category.replace(/_/g, " ")}</Badge>
            <Badge tone={plant.conservation_status.includes("endanger") || plant.conservation_status === "vulnerable" ? "danger" : "neutral"}>
              {plant.conservation_status.replace(/_/g, " ")}
            </Badge>
            {plant.sunlight_level ? (
              <Badge tone="earth">
                {(() => {
                  const Icon = SUNLIGHT_ICON[plant.sunlight_level];
                  return <Icon size={11} />;
                })()}{" "}
                {SUNLIGHT_LABEL[plant.sunlight_level]}
              </Badge>
            ) : null}
            {plant.climate_preference ? (
              <Badge tone="earth">
                <Thermometer size={11} /> {plant.climate_preference.charAt(0).toUpperCase() + plant.climate_preference.slice(1)}
              </Badge>
            ) : null}
            {plant.is_air_purifying ? (
              <Badge tone="success">
                <Wind size={11} /> Air Purifying
              </Badge>
            ) : null}
          </div>
          <h1 className="font-serif text-3xl font-bold">{plant.common_name}</h1>
          <p className="italic text-[color:var(--color-forest-600)]">{plant.scientific_name}</p>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {plant.genus} · {plant.family} · {plant.kingdom}
          </p>
          <p className="text-sm leading-relaxed text-[color:var(--color-ink)] mt-1">{plant.physical_characteristics}</p>

          <div className="flex gap-4 mt-2 text-sm text-[color:var(--color-ink-muted)]">
            <span className="flex items-center gap-1.5">
              <Sun size={15} /> {plant.sunlight_requirements}
            </span>
            <span className="flex items-center gap-1.5">
              <Droplets size={15} /> {plant.water_requirements}
            </span>
          </div>

          <div className="flex gap-3 mt-2">
            {user ? (
              <Button size="sm" onClick={addToGarden} disabled={gardenState === "saving" || gardenState === "saved"}>
                {gardenState === "saving" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : gardenState === "saved" ? (
                  <Heart size={16} fill="currentColor" />
                ) : (
                  <HeartOff size={16} />
                )}
                {gardenState === "saved" ? "In your garden" : "Add to My Garden"}
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline">
                  Sign in to save
                </Button>
              </Link>
            )}
            <Link to={`/compare?a=${plant.id}`}>
              <Button size="sm" variant="outline">
                <Sprout size={16} /> Compare
              </Button>
            </Link>
          </div>
          {gardenState === "error" ? <p className="text-xs text-[color:var(--color-danger)]">Could not save — try again.</p> : null}
        </div>
      </div>

      <Section
        title="Botanical Description"
        rows={[
          ["Leaf shape", plant.leaf_shape],
          ["Flower description", plant.flower_description],
          ["Fruit description", plant.fruit_description],
          ["Root structure", plant.root_structure],
          ["Average height", plant.average_height],
          ["Growth pattern", plant.growth_pattern],
          ["Life cycle", plant.life_cycle],
        ]}
      />

      <Section
        title="Habitat and Environment"
        rows={[
          ["Natural habitat", plant.natural_habitat],
          ["Geographic distribution", plant.geographic_distribution],
          ["Native region", plant.native_region],
          ["Climate requirements", plant.climate_requirements],
          ["Temperature requirements", plant.temperature_requirements],
          ["Humidity requirements", plant.humidity_requirements],
          ["Sunlight requirements", plant.sunlight_requirements],
          ["Water requirements", plant.water_requirements],
          ["Altitude range", plant.altitude_range],
        ]}
      />

      <Section
        title="Soil Requirements"
        rows={[
          ["Soil type", plant.soil_type],
          ["Soil pH", plant.soil_ph],
          ["Drainage", plant.soil_drainage],
          ["Fertility", plant.soil_fertility],
          ["Nutrient requirements", plant.nutrient_requirements],
          ["Recommended fertilizers", plant.recommended_fertilizers],
        ]}
      />

      <Section
        title="Cultivation and Maintenance"
        rows={[
          ["How to grow", plant.how_to_grow],
          ["Planting season", plant.planting_season],
          ["Propagation methods", plant.propagation_methods],
          ["Watering schedule", plant.watering_schedule],
          ["Pruning requirements", plant.pruning_requirements],
          ["Fertilizer schedule", plant.fertilizer_schedule],
          ["Common growing problems", plant.common_growing_problems],
          ["Maintenance tips", plant.maintenance_tips],
        ]}
      />

      <Section
        title="Additional Information"
        rows={[
          ["Medicinal uses", plant.medicinal_uses],
          ["Ecological importance", plant.ecological_importance],
          ["Economic importance", plant.economic_importance],
          ["Toxicity and safety", plant.toxicity_and_safety],
          ["Interesting facts", plant.interesting_facts],
        ]}
      />
    </div>
  );
}
