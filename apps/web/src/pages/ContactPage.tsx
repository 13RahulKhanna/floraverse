import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/v1/contact", { method: "POST", body: JSON.stringify(form), skipAuth: true });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send your message. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center gap-3">
        <CheckCircle2 size={32} className="text-[color:var(--color-success)]" />
        <h1 className="font-serif text-2xl font-bold">Message received</h1>
        <p className="text-[color:var(--color-ink-muted)]">Thanks for reaching out — we'll get back to you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="text-center flex flex-col items-center gap-2 mb-6">
        <Mail size={28} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-3xl font-bold">Contact Us</h1>
        <p className="text-[color:var(--color-ink-muted)]">Questions, corrections, or feedback — we'd like to hear it.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <input required type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <textarea required placeholder="Your message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="px-4 py-3 rounded-2xl border border-[color:var(--color-border)] text-sm focus-ring resize-none" />
          {error ? <p className="text-sm text-[color:var(--color-danger)]">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
