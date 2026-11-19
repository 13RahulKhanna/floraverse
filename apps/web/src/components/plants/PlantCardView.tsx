import { Link } from "react-router-dom";
import { PlantImage } from "./PlantImage";
import type { PlantCard } from "@/lib/types";

export function PlantCardView({ plant }: { plant: PlantCard }) {
  return (
    <Link to={`/plants/${plant.slug}`} className="leaf-card leaf-card--interactive overflow-hidden flex flex-col focus-ring">
      <PlantImage src={plant.image_url} category={plant.category} className="h-36 w-full" />
      <div className="p-4 flex flex-col gap-1.5">
        <h3 className="font-serif text-lg font-semibold text-[color:var(--color-ink)]">{plant.common_name}</h3>
        <p className="italic text-sm text-[color:var(--color-forest-600)]">{plant.scientific_name}</p>
        <p className="text-sm text-[color:var(--color-ink-muted)] line-clamp-2">{plant.short_description}</p>
      </div>
    </Link>
  );
}
