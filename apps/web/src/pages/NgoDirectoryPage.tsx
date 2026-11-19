import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Search, Building2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Loading, ErrorState, EmptyState } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { NgoCard } from "@/lib/types";

export function NgoDirectoryPage() {
  const [q, setQ] = useState("");
  const { data: ngos, loading, error } = useApi<NgoCard[]>(`/api/v1/ngos${q ? `?q=${encodeURIComponent(q)}` : ""}`, [q]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HeartHandshake size={26} className="text-[color:var(--color-forest-500)]" />
          <div>
            <h1 className="font-serif text-3xl font-bold">NGO Directory</h1>
            <p className="text-sm text-[color:var(--color-ink-muted)]">Organizations doing real conservation work — find one, or reach out directly.</p>
          </div>
        </div>
        <Link to="/ngos/register">
          <Button size="sm">
            <Building2 size={14} /> Register Your NGO
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-faint)]" />
        <input
          placeholder="Search by name or focus area..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring"
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : !ngos || ngos.length === 0 ? (
        <EmptyState title="No NGOs found" description="Be the first organization to register." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {ngos.map((ngo) => (
            <Link key={ngo.id} to={`/ngos/${ngo.id}`} className="leaf-card leaf-card--interactive p-5 flex flex-col gap-2 focus-ring">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold">{ngo.org_name}</h3>
                <Badge tone="forest">{ngo.active_opportunity_count} open</Badge>
              </div>
              <Badge tone="earth" className="w-fit">{ngo.focus_area}</Badge>
              <p className="text-sm text-[color:var(--color-ink-muted)] line-clamp-2">{ngo.mission}</p>
              {ngo.location ? <p className="text-xs text-[color:var(--color-ink-faint)] mt-auto pt-1">{ngo.location}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
