import { Navigate, Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useApi } from "@/lib/useApi";
import { Card } from "@/components/ui/Card";
import type { GardenEntryOut } from "@/lib/types";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const { data: entries } = useApi<GardenEntryOut[]>(user ? "/api/v1/garden" : null);

  if (!loading && !user) return <Navigate to="/login" replace />;
  if (!user) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-14 flex flex-col gap-6">
      <Card className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[color:var(--color-forest-100)] text-[color:var(--color-forest-700)] flex items-center justify-center">
          <User size={24} />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold">{user.display_name}</h1>
          <p className="text-sm text-[color:var(--color-ink-muted)]">{user.email}</p>
        </div>
      </Card>

      <Card className="text-center">
        <p className="text-3xl font-serif font-bold text-[color:var(--color-forest-600)]">{entries?.length ?? 0}</p>
        <p className="text-sm text-[color:var(--color-ink-muted)]">Plants in My Garden</p>
        <Link to="/garden" className="text-sm text-[color:var(--color-forest-600)] hover:underline mt-2 inline-block">
          View My Garden →
        </Link>
      </Card>
    </div>
  );
}
