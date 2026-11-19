import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { ApiError } from "@/lib/api";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/garden");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center flex flex-col items-center gap-2 mb-6">
        <Leaf size={28} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-2xl font-bold">Welcome back</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring" />
          {error ? <p className="text-sm text-[color:var(--color-danger)]">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
      <p className="text-center text-sm text-[color:var(--color-ink-muted)] mt-4">
        No account? <Link to="/register" className="text-[color:var(--color-forest-600)] font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
