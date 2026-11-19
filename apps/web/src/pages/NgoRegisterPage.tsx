import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { NgoDetail } from "@/lib/types";

export function NgoRegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ org_name: "", mission: "", focus_area: "", contact_email: "", website: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-[color:var(--color-ink-muted)]">Log in first to register an NGO profile.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ngo = await apiFetch<NgoDetail>("/api/v1/ngos/register", {
        method: "POST",
        body: JSON.stringify({ ...form, website: form.website || null, location: form.location || null }),
      });
      navigate(`/ngos/dashboard`, { state: { registered: true, ngoId: ngo.id } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not register your NGO.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="text-center flex flex-col items-center gap-2 mb-6">
        <Building2 size={28} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-3xl font-bold">Register Your NGO</h1>
        <p className="text-[color:var(--color-ink-muted)]">List your organization so members can find and support your work directly.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Organization name" value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <input required placeholder="Focus area (e.g. Urban reforestation)" value={form.focus_area} onChange={(e) => setForm({ ...form, focus_area: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <textarea required placeholder="Mission statement" rows={3} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} className="px-4 py-3 rounded-2xl border border-[color:var(--color-border)] text-sm focus-ring resize-none" />
          <input required type="email" placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <input placeholder="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <input placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          {error ? <p className="text-sm text-[color:var(--color-danger)]">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Registering..." : "Register NGO"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
