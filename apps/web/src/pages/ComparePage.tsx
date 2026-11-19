import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeftRight, Search } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Loading, EmptyState } from "@/components/ui/Loading";
import type { PlantCard, PlantComparisonResponse } from "@/lib/types";

function PlantPicker({ label, value, onSelect }: { label: string; value: PlantCard | null; onSelect: (p: PlantCard) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlantCard[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await apiFetch<{ items: PlantCard[] }>(`/api/v1/plants?q=${encodeURIComponent(query)}&page_size=6`);
        setResults(res.items);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  if (value) {
    return (
      <Card className="flex flex-col items-center text-center gap-1">
        <span className="text-xs uppercase tracking-wide text-[color:var(--color-ink-faint)]">{label}</span>
        <h3 className="font-serif text-xl font-semibold">{value.common_name}</h3>
        <p className="italic text-sm text-[color:var(--color-forest-600)]">{value.scientific_name}</p>
        <button onClick={() => onSelect(null as unknown as PlantCard)} className="text-xs text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-danger)] mt-2 focus-ring">
          Change plant
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <span className="text-xs uppercase tracking-wide text-[color:var(--color-ink-faint)]">{label}</span>
      <div className="relative mt-2">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a plant..."
          className="w-full pl-9 pr-3 py-2 rounded-full border border-[color:var(--color-border)] text-sm focus-ring"
        />
      </div>
      {results.length > 0 ? (
        <div className="flex flex-col mt-2 max-h-48 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                setQuery("");
                setResults([]);
              }}
              className="text-left px-2 py-2 rounded-lg hover:bg-[color:var(--color-cream-deep)] text-sm focus-ring"
            >
              <span className="font-medium">{p.common_name}</span>{" "}
              <span className="italic text-[color:var(--color-ink-muted)]">{p.scientific_name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const [plantA, setPlantA] = useState<PlantCard | null>(null);
  const [plantB, setPlantB] = useState<PlantCard | null>(null);
  const [comparison, setComparison] = useState<PlantComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Resolve a plant passed via ?a=<id> from the plant detail page's "Compare" button.
  useEffect(() => {
    const aId = params.get("a");
    if (!aId || plantA) return;
    (async () => {
      try {
        const list = await apiFetch<{ items: PlantCard[] }>(`/api/v1/plants?page_size=100`);
        const found = list.items.find((p) => String(p.id) === aId);
        if (found) setPlantA(found);
      } catch {
        // ignore — user can still pick manually
      }
    })();
  }, [params, plantA]);

  useEffect(() => {
    if (!plantA || !plantB) {
      setComparison(null);
      return;
    }
    setLoading(true);
    apiFetch<PlantComparisonResponse>(`/api/v1/plants/compare?a=${plantA.id}&b=${plantB.id}`)
      .then(setComparison)
      .catch((err) => {
        if (err instanceof ApiError) setComparison(null);
      })
      .finally(() => setLoading(false));
  }, [plantA, plantB]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-2">
        <ArrowLeftRight size={28} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-3xl font-bold">Compare Plants</h1>
        <p className="text-[color:var(--color-ink-muted)]">Choose two species to see how they differ side by side.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <PlantPicker label="Plant A" value={plantA} onSelect={(p) => { setPlantA(p); setParams(p ? { a: String(p.id) } : {}); }} />
        <PlantPicker label="Plant B" value={plantB} onSelect={setPlantB} />
      </div>

      {loading ? (
        <Loading label="Comparing..." />
      ) : comparison ? (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)]">
                <th className="text-left py-2 pr-4 text-[color:var(--color-ink-faint)] font-medium">Trait</th>
                <th className="text-left py-2 pr-4 font-serif font-semibold">{comparison.plant_a.common_name}</th>
                <th className="text-left py-2 font-serif font-semibold">{comparison.plant_b.common_name}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.fields.map((f) => (
                <tr key={f.label} className="border-b border-[color:var(--color-border)] last:border-0">
                  <td className="py-2.5 pr-4 text-[color:var(--color-ink-faint)]">{f.label}</td>
                  <td className="py-2.5 pr-4">{f.a}</td>
                  <td className="py-2.5">{f.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : plantA && plantB ? null : (
        <EmptyState title="Pick two plants to compare" description="Search and select a plant above for each side." />
      )}
    </div>
  );
}
