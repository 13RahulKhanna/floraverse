import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Camera, Sparkles } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlantCardView } from "@/components/plants/PlantCardView";
import { Loading } from "@/components/ui/Loading";
import type { PlantCard, PlantCategory } from "@/lib/types";

const CATEGORY_CHIPS: { value: PlantCategory; label: string }[] = [
  { value: "tree", label: "Trees" },
  { value: "medicinal", label: "Medicinal" },
  { value: "succulent", label: "Succulents" },
  { value: "orchid", label: "Orchids" },
  { value: "aquatic", label: "Aquatic" },
  { value: "carnivorous", label: "Carnivorous" },
  { value: "fern", label: "Ferns" },
  { value: "indoor", label: "Indoor" },
];

export function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: featured, loading: featuredLoading } = useApi<PlantCard[]>("/api/v1/plants/featured?limit=6");
  const { data: recent, loading: recentLoading } = useApi<PlantCard[]>("/api/v1/plants/recent?limit=4");
  const { data: potd } = useApi<PlantCard>("/api/v1/plants/plant-of-the-day");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="botanical-blob w-[500px] h-[500px] -top-40 -right-40" />
        <div className="botanical-blob w-[400px] h-[400px] -bottom-32 -left-32" />
        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center flex flex-col items-center gap-6">
          <Badge tone="forest">Discover, Identify, and Understand the World of Plants.</Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[color:var(--color-ink)] max-w-2xl">
            FloraVerse — Explore the World of Plants
          </h1>
          <p className="text-[color:var(--color-ink-muted)] max-w-xl text-lg">
            A digital botanical encyclopedia with species profiles, growing guides, and an AI-powered plant
            identification and health assistant.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-lg flex gap-2 mt-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-faint)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any plant by common or scientific name..."
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[color:var(--color-border)] bg-white focus-ring text-sm"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex gap-3 flex-wrap justify-center mt-2">
            <Link to="/explore">
              <Button size="lg">Explore Plants</Button>
            </Link>
            <Link to="/ai-doctor">
              <Button size="lg" variant="outline">
                <Camera size={18} /> AI Plant Identifier
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plant of the day */}
      {potd ? (
        <section className="max-w-6xl mx-auto px-4 py-10 w-full">
          <Link to={`/plants/${potd.slug}`} className="leaf-card leaf-card--interactive flex items-center gap-4 p-5 focus-ring">
            <Sparkles size={22} className="text-[color:var(--color-forest-500)] shrink-0" />
            <div>
              <Badge tone="forest" className="mb-1">
                Plant of the Day
              </Badge>
              <h3 className="font-serif text-xl font-semibold">{potd.common_name}</h3>
              <p className="italic text-sm text-[color:var(--color-ink-muted)]">{potd.scientific_name}</p>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-6 w-full">
        <h2 className="font-serif text-2xl font-bold mb-4">Popular Categories</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_CHIPS.map((c) => (
            <Link
              key={c.value}
              to={`/explore?category=${c.value}`}
              className="px-4 py-2 rounded-full border border-[color:var(--color-border)] bg-white text-sm font-medium hover:border-[color:var(--color-forest-400)] hover:text-[color:var(--color-forest-600)] transition-colors focus-ring"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold">Featured Plants</h2>
          <Link to="/explore" className="text-sm font-medium text-[color:var(--color-forest-600)] hover:underline">
            View all →
          </Link>
        </div>
        {featuredLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured?.map((p) => (
              <PlantCardView key={p.id} plant={p} />
            ))}
          </div>
        )}
      </section>

      {/* Recently discovered */}
      <section className="max-w-6xl mx-auto px-4 py-10 w-full">
        <h2 className="font-serif text-2xl font-bold mb-4">Recently Added to the Encyclopedia</h2>
        {recentLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recent?.map((p) => (
              <PlantCardView key={p.id} plant={p} />
            ))}
          </div>
        )}
      </section>

      {/* About blurb */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold mb-3">What is FloraVerse?</h2>
        <p className="text-[color:var(--color-ink-muted)] leading-relaxed">
          FloraVerse is a growing digital encyclopedia of plant species — built for students, gardeners, farmers,
          and researchers. Every species profile covers botanical description, habitat, soil and cultivation
          requirements, and documented uses, with fields clearly marked "Not available" rather than guessed at.
          Snap a photo in the AI Plant Doctor to identify an unknown plant or check on one that looks unwell.
        </p>
      </section>
    </div>
  );
}
