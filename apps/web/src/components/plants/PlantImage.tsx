import { Sprout } from "lucide-react";
import { assetUrl } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { PlantCategory } from "@/lib/types";

const CATEGORY_GRADIENTS: Partial<Record<PlantCategory, string>> = {
  cactus: "from-[#f1ead9] to-[#dcebd3]",
  aquatic: "from-[#dbe9e3] to-[#c7dfd4]",
  carnivorous: "from-[#f3e2d9] to-[#e6c9b8]",
  orchid: "from-[#f1e3ec] to-[#e2c9dc]",
};

// No real photo library is wired up (no image CDN/upload pipeline for the seeded
// encyclopedia) — this renders an honest botanical placeholder tinted by category
// rather than ever faking a photograph.
export function PlantImage({ src, category, className }: { src: string | null; category: PlantCategory; className?: string }) {
  const resolved = assetUrl(src);
  if (resolved) {
    return <img src={resolved} alt="" className={cn("object-cover", className)} />;
  }
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-[color:var(--color-forest-100)] to-[color:var(--color-cream-deep)]";
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br", gradient, className)}>
      <Sprout size={32} className="text-[color:var(--color-forest-500)] opacity-60" />
    </div>
  );
}
