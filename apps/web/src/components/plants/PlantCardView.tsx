import { Link } from "react-router-dom";
import { Sun, CloudSun, CloudMoon, Wind } from "lucide-react";
import { PlantImage } from "./PlantImage";
import type { PlantCard } from "@/lib/types";

const SUNLIGHT_ICON = { full_sun: Sun, partial_sun: CloudSun, low_light: CloudMoon };
const SUNLIGHT_LABEL = { full_sun: "Full sun", partial_sun: "Partial sun", low_light: "Low light" };

export function PlantCardView({ plant }: { plant: PlantCard }) {
  const SunIcon = plant.sunlight_level ? SUNLIGHT_ICON[plant.sunlight_level] : null;

  return (
    <Link to={`/plants/${plant.slug}`} className="leaf-card leaf-card--interactive overflow-hidden flex flex-col focus-ring">
      <PlantImage src={plant.image_url} category={plant.category} className="h-36 w-full" />
      <div className="p-4 flex flex-col gap-1.5">
        <h3 className="font-serif text-lg font-semibold text-[color:var(--color-ink)]">{plant.common_name}</h3>
        <p className="italic text-sm text-[color:var(--color-forest-600)]">{plant.scientific_name}</p>
        <p className="text-sm text-[color:var(--color-ink-muted)] line-clamp-2">{plant.short_description}</p>
        {SunIcon || plant.climate_preference || plant.is_air_purifying ? (
          <div className="flex items-center gap-2.5 text-xs text-[color:var(--color-ink-faint)] pt-1">
            {SunIcon ? (
              <span className="inline-flex items-center gap-1" title={SUNLIGHT_LABEL[plant.sunlight_level!]}>
                <SunIcon size={13} /> {SUNLIGHT_LABEL[plant.sunlight_level!]}
              </span>
            ) : null}
            {plant.climate_preference ? <span className="capitalize">{plant.climate_preference}</span> : null}
            {plant.is_air_purifying ? (
              <span className="inline-flex items-center gap-1 text-[color:var(--color-forest-600)]" title="Air purifying">
                <Wind size={13} /> Air purifying
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
