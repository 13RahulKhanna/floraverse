import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Globe, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/AuthContext";
import { Loading, ErrorState } from "@/components/ui/Loading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { NgoDetail, WaveScale } from "@/lib/types";

const WAVE_LABELS: Record<WaveScale, string> = {
  house: "Wave 1 · House",
  neighbourhood: "Wave 2 · Neighbourhood",
  city: "Wave 3 · City",
  country: "Wave 4 · Country",
};

export function NgoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: ngo, loading, error } = useApi<NgoDetail>(id ? `/api/v1/ngos/${id}` : null, [id]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<number | "">("");
  const [senderName, setSenderName] = useState(user?.display_name ?? "");
  const [senderEmail, setSenderEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !ngo) return <ErrorState message={error ?? "NGO not found."} />;

  async function handleReachOut(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      await apiFetch("/api/v1/outreach", {
        method: "POST",
        body: JSON.stringify({
          ngo_id: ngo!.id,
          opportunity_id: selectedOpportunity || null,
          sender_name: senderName,
          sender_email: senderEmail,
          message,
        }),
      });
      setSent(true);
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : "Could not send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">{ngo.org_name}</h1>
        <Badge tone="earth" className="mt-2">{ngo.focus_area}</Badge>
        <p className="text-[color:var(--color-ink-muted)] mt-3 leading-relaxed">{ngo.mission}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-[color:var(--color-ink-muted)]">
          {ngo.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {ngo.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Mail size={14} /> {ngo.contact_email}
          </span>
          {ngo.website ? (
            <a href={ngo.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[color:var(--color-forest-600)] hover:underline">
              <Globe size={14} /> Website
            </a>
          ) : null}
        </div>
        {ngo.is_mine ? (
          <Link to="/ngos/dashboard" className="inline-block mt-4 text-sm text-[color:var(--color-forest-600)] hover:underline">
            Manage your NGO dashboard →
          </Link>
        ) : null}
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold mb-3">Open Opportunities</h2>
        {ngo.opportunities.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-muted)]">No active opportunities posted right now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {ngo.opportunities.map((opp) => (
              <Card key={opp.id} className="p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold">{opp.title}</h3>
                  <Badge tone="forest">{WAVE_LABELS[opp.wave_scale]}</Badge>
                </div>
                <p className="text-sm text-[color:var(--color-ink-muted)] mt-1">{opp.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-[color:var(--color-ink-faint)]">
                  {opp.location ? <span>{opp.location}</span> : null}
                  {opp.event_date ? <span>{new Date(opp.event_date).toLocaleDateString()}</span> : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold mb-3">Reach Out</h2>
        <Card>
          {sent ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle2 size={28} className="text-[color:var(--color-success)]" />
              <p className="text-sm text-[color:var(--color-ink-muted)]">Your message has been sent to {ngo.org_name}.</p>
            </div>
          ) : (
            <form onSubmit={handleReachOut} className="flex flex-col gap-3">
              {ngo.opportunities.length > 0 ? (
                <select
                  value={selectedOpportunity}
                  onChange={(e) => setSelectedOpportunity(e.target.value ? Number(e.target.value) : "")}
                  className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring bg-white"
                >
                  <option value="">General inquiry (not about a specific opportunity)</option>
                  {ngo.opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title}
                    </option>
                  ))}
                </select>
              ) : null}
              <input
                required
                placeholder="Your name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring"
              />
              <input
                required
                type="email"
                placeholder="Your email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring"
              />
              <textarea
                required
                placeholder="How would you like to help, or what would you like to ask?"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-[color:var(--color-border)] text-sm focus-ring resize-none"
              />
              {sendError ? <p className="text-sm text-[color:var(--color-danger)]">{sendError}</p> : null}
              <Button type="submit" disabled={sending}>
                <Send size={14} /> {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
