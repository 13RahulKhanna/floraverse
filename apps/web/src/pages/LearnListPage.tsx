import { Link } from "react-router-dom";
import { BookOpen, Sprout } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import type { ArticleCard } from "@/lib/types";

export function LearnListPage() {
  const { data: articles, loading } = useApi<ArticleCard[]>("/api/v1/learn");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-2">
        <BookOpen size={28} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-3xl font-bold">Learn Botany</h1>
        <p className="text-[color:var(--color-ink-muted)] max-w-lg">The core concepts behind every plant profile in the encyclopedia.</p>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {articles?.map((a) => (
            <Link key={a.slug} to={`/learn/${a.slug}`} className="leaf-card leaf-card--interactive p-5 flex flex-col gap-1.5 focus-ring">
              <h3 className="font-serif text-lg font-semibold">{a.title}</h3>
              <p className="text-sm text-[color:var(--color-ink-muted)]">{a.summary}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="leaf-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[color:var(--color-cream-deep)]">
        <div className="flex items-center gap-3">
          <Sprout size={24} className="text-[color:var(--color-forest-600)] shrink-0" />
          <div>
            <h3 className="font-serif font-semibold">Ready to put this knowledge to use?</h3>
            <p className="text-sm text-[color:var(--color-ink-muted)]">See concrete, plant-focused conservation actions — from your house to your country.</p>
          </div>
        </div>
        <Link to="/conservation" className="shrink-0">
          <Button size="sm">Take Action</Button>
        </Link>
      </div>
    </div>
  );
}
