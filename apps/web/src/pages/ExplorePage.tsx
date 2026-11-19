import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { PlantCardView } from "@/components/plants/PlantCardView";
import { Loading, EmptyState, ErrorState } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import type { PlantCategory, PlantListResponse } from "@/lib/types";

const CATEGORIES: PlantCategory[] = [
  "tree", "shrub", "herb", "climber", "creeper", "aquatic", "medicinal", "flowering",
  "non_flowering", "succulent", "cactus", "fern", "grass", "orchid", "indoor", "outdoor",
  "agricultural", "endangered", "carnivorous",
];

const BOOLEAN_FILTERS: { key: string; label: string }[] = [
  { key: "is_indoor", label: "Indoor" },
  { key: "is_outdoor", label: "Outdoor" },
  { key: "is_flowering", label: "Flowering" },
  { key: "is_medicinal", label: "Medicinal" },
  { key: "is_aquatic", label: "Aquatic" },
  { key: "is_tree_or_shrub", label: "Tree / Shrub" },
];

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [queryInput, setQueryInput] = useState(params.get("q") ?? "");
  const page = Number(params.get("page") ?? "1");

  useEffect(() => {
    setQueryInput(params.get("q") ?? "");
  }, [params]);

  const apiPath = useMemo(() => {
    const qs = new URLSearchParams();
    for (const [key, value] of params.entries()) qs.set(key, value);
    if (!qs.get("page_size")) qs.set("page_size", "12");
    return `/api/v1/plants?${qs.toString()}`;
  }, [params]);

  const { data, loading, error, reload } = useApi<PlantListResponse>(apiPath);

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    // Changing a filter/search term always resets pagination; changing the page itself must not.
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function toggleBoolean(key: string) {
    updateParam(key, params.get(key) === "true" ? null : "true");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", queryInput || null);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Explore Plants</h1>
        <p className="text-[color:var(--color-ink-muted)] mt-1">{data ? `${data.total} species in the encyclopedia` : "Loading the encyclopedia..."}</p>
      </div>

      <form onSubmit={submitSearch} className="flex gap-2 max-w-xl">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-faint)]" />
          <input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search by common name, scientific name, genus, species, or family..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-[color:var(--color-border)] bg-white focus-ring text-sm"
          />
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <select
          value={params.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value || null)}
          className="px-3 py-1.5 rounded-full border border-[color:var(--color-border)] bg-white text-sm focus-ring"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {BOOLEAN_FILTERS.map((f) => {
          const active = params.get(f.key) === "true";
          return (
            <button
              key={f.key}
              onClick={() => toggleBoolean(f.key)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors focus-ring ${
                active
                  ? "bg-[color:var(--color-forest-600)] text-white border-[color:var(--color-forest-600)]"
                  : "bg-white border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-forest-400)]"
              }`}
            >
              {f.label}
            </button>
          );
        })}

        {[...params.keys()].length > 0 ? (
          <button onClick={() => setParams(new URLSearchParams())} className="px-3 py-1.5 rounded-full text-sm text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-danger)] flex items-center gap-1 focus-ring">
            <X size={14} /> Clear filters
          </button>
        ) : null}
      </div>

      {loading ? (
        <Loading label="Searching the encyclopedia..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map((p) => (
              <PlantCardView key={p.id} plant={p} />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParam("page", String(page - 1))}>
                Previous
              </Button>
              <span className="text-sm text-[color:var(--color-ink-muted)]">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => updateParam("page", String(page + 1))}>
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title="No plants matched your search" description="Try a different name, or clear your filters." />
      )}
    </div>
  );
}
