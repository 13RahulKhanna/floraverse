import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Trash2, Mail, PlusCircle } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Loading, ErrorState } from "@/components/ui/Loading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { NgoDetail, OutreachOut, WaveScale } from "@/lib/types";

const WAVE_OPTIONS: { value: WaveScale; label: string }[] = [
  { value: "house", label: "Wave 1 · House" },
  { value: "neighbourhood", label: "Wave 2 · Neighbourhood" },
  { value: "city", label: "Wave 3 · City" },
  { value: "country", label: "Wave 4 · Country" },
];

export function NgoDashboardPage() {
  const { data: ngo, loading, error, reload: reloadNgo } = useApi<NgoDetail>("/api/v1/ngos/me");
  const { data: inbox } = useApi<OutreachOut[]>(ngo ? "/api/v1/outreach/inbox" : null, [ngo?.id]);

  const [form, setForm] = useState({ title: "", description: "", wave_scale: "neighbourhood" as WaveScale, location: "", event_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreateOpportunity(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch("/api/v1/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          wave_scale: form.wave_scale,
          location: form.location || null,
          event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        }),
      });
      setForm({ title: "", description: "", wave_scale: "neighbourhood", location: "", event_date: "" });
      reloadNgo();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not post this opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteOpportunity(id: number) {
    if (!window.confirm("Remove this opportunity?")) return;
    await apiFetch(`/api/v1/opportunities/${id}`, { method: "DELETE" });
    reloadNgo();
  }

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center gap-3">
        <p className="text-[color:var(--color-ink-muted)]">You haven't registered an NGO profile yet.</p>
        <Link to="/ngos/register">
          <Button size="sm">Register Your NGO</Button>
        </Link>
      </div>
    );
  }
  if (!ngo) return <ErrorState message="Could not load your NGO dashboard." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <LayoutDashboard size={26} className="text-[color:var(--color-forest-500)]" />
        <div>
          <h1 className="font-serif text-2xl font-bold">{ngo.org_name} Dashboard</h1>
          <Link to={`/ngos/${ngo.id}`} className="text-sm text-[color:var(--color-forest-600)] hover:underline">
            View public profile →
          </Link>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-lg font-semibold mb-3">Post a New Opportunity</h2>
        <Card>
          <form onSubmit={handleCreateOpportunity} className="flex flex-col gap-3">
            <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
            <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-4 py-3 rounded-2xl border border-[color:var(--color-border)] text-sm focus-ring resize-none" />
            <select value={form.wave_scale} onChange={(e) => setForm({ ...form, wave_scale: e.target.value as WaveScale })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring bg-white">
              {WAVE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
            <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
            {formError ? <p className="text-sm text-[color:var(--color-danger)]">{formError}</p> : null}
            <Button type="submit" disabled={submitting}>
              <PlusCircle size={14} /> {submitting ? "Posting..." : "Post Opportunity"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold mb-3">Your Active Opportunities</h2>
        {ngo.opportunities.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-muted)]">None posted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {ngo.opportunities.map((opp) => (
              <Card key={opp.id} className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{opp.title}</h3>
                    <Badge tone="forest">{WAVE_OPTIONS.find((w) => w.value === opp.wave_scale)?.label}</Badge>
                  </div>
                  <p className="text-sm text-[color:var(--color-ink-muted)] mt-1">{opp.description}</p>
                </div>
                <button onClick={() => handleDeleteOpportunity(opp.id)} className="focus-ring p-1.5 text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-danger)] shrink-0" aria-label="Remove opportunity">
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
          <Mail size={18} /> Inbox
        </h2>
        {!inbox || inbox.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-muted)]">No messages yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {inbox.map((msg) => (
              <Card key={msg.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{msg.sender_name}</p>
                  <p className="text-xs text-[color:var(--color-ink-faint)]">{new Date(msg.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-xs text-[color:var(--color-ink-muted)]">{msg.sender_email}</p>
                <p className="text-sm mt-2">{msg.message}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
