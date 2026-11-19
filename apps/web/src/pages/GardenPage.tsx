import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Droplets, TrendingUp, StickyNote, Trash2, Plus, Share2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useApi } from "@/lib/useApi";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlantImage } from "@/components/plants/PlantImage";
import { Loading, EmptyState } from "@/components/ui/Loading";
import type { GardenEntryOut, GardenLogType } from "@/lib/types";

const LOG_ICONS: Record<GardenLogType, typeof Droplets> = {
  watering: Droplets,
  growth: TrendingUp,
  health_report: StickyNote,
  note: StickyNote,
};

function GardenEntryCard({ entry, onChange }: { entry: GardenEntryOut; onChange: () => void }) {
  const [logType, setLogType] = useState<GardenLogType>("watering");
  const [note, setNote] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function addLog() {
    setSubmitting(true);
    try {
      await apiFetch(`/api/v1/garden/${entry.id}/logs`, {
        method: "POST",
        body: JSON.stringify({ log_type: logType, note: note || null, measurement: logType === "growth" ? measurement || null : null }),
      });
      setNote("");
      setMeasurement("");
      onChange();
    } finally {
      setSubmitting(false);
    }
  }

  async function removeEntry() {
    await apiFetch(`/api/v1/garden/${entry.id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex gap-4">
        <PlantImage src={entry.plant.image_url} category={entry.plant.category} className="w-20 h-20 rounded-xl shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/plants/${entry.plant.slug}`} className="font-serif text-lg font-semibold hover:text-[color:var(--color-forest-600)]">
              {entry.plant.common_name}
            </Link>
            <Link to={`/blog/new?plant=${entry.plant.id}`} className="inline-flex items-center gap-1 text-xs text-[color:var(--color-forest-600)] hover:underline">
              <Share2 size={12} /> Share Progress
            </Link>
          </div>
          <p className="italic text-sm text-[color:var(--color-ink-muted)]">{entry.plant.scientific_name}</p>
          {entry.notes ? <p className="text-sm mt-1">{entry.notes}</p> : null}
        </div>
        <button onClick={removeEntry} className="text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-danger)] focus-ring self-start" aria-label="Remove from garden">
          <Trash2 size={16} />
        </button>
      </div>

      {entry.logs.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {entry.logs.map((log) => {
            const Icon = LOG_ICONS[log.log_type];
            return (
              <div key={log.id} className="flex items-start gap-2 text-sm">
                <Icon size={14} className="text-[color:var(--color-forest-500)] shrink-0 mt-0.5" />
                <span className="text-[color:var(--color-ink-faint)] text-xs shrink-0">{new Date(log.logged_at).toLocaleDateString()}</span>
                <span className="text-[color:var(--color-ink-muted)]">
                  {log.log_type.replace("_", " ")}
                  {log.measurement ? ` — ${log.measurement}` : ""}
                  {log.note ? ` — ${log.note}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[color:var(--color-ink-faint)]">No watering, growth, or health entries logged yet.</p>
      )}

      <div className="flex gap-2 items-center flex-wrap border-t border-[color:var(--color-border)] pt-3">
        <select value={logType} onChange={(e) => setLogType(e.target.value as GardenLogType)} className="text-xs border border-[color:var(--color-border)] rounded-full px-2 py-1 focus-ring">
          <option value="watering">Watering</option>
          <option value="growth">Growth</option>
          <option value="note">Note</option>
        </select>
        {logType === "growth" ? (
          <input value={measurement} onChange={(e) => setMeasurement(e.target.value)} placeholder="e.g. 12 cm" className="text-xs border border-[color:var(--color-border)] rounded-full px-2 py-1 w-24 focus-ring" />
        ) : null}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="text-xs border border-[color:var(--color-border)] rounded-full px-2 py-1 flex-1 min-w-24 focus-ring" />
        <Button size="sm" onClick={addLog} disabled={submitting}>
          <Plus size={14} /> Log
        </Button>
      </div>
    </Card>
  );
}

export function GardenPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: entries, loading, reload } = useApi<GardenEntryOut[]>(user ? "/api/v1/garden" : null);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">My Garden</h1>
        <p className="text-[color:var(--color-ink-muted)] mt-1">Your saved plants, watering history, and growth notes.</p>
      </div>

      {loading ? (
        <Loading />
      ) : entries && entries.length > 0 ? (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <GardenEntryCard key={entry.id} entry={entry} onChange={reload} />
          ))}
        </div>
      ) : (
        <EmptyState title="Your garden is empty" description="Browse the encyclopedia and add plants you're growing or interested in." />
      )}

      <Link to="/explore" className="self-center">
        <Button variant="outline">Browse plants to add</Button>
      </Link>
    </div>
  );
}
