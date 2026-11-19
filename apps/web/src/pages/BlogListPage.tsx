import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Sprout, PenLine } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/AuthContext";
import { Loading, ErrorState, EmptyState } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { BlogListResponse } from "@/lib/types";

export function BlogListPage() {
  const { user } = useAuth();
  const [progressOnly, setProgressOnly] = useState(false);
  const { data, loading, error } = useApi<BlogListResponse>(
    `/api/v1/blog?progress_only=${progressOnly}&page_size=40`,
    [progressOnly],
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Newspaper size={26} className="text-[color:var(--color-forest-500)]" />
          <div>
            <h1 className="font-serif text-3xl font-bold">Community Blog</h1>
            <p className="text-sm text-[color:var(--color-ink-muted)]">Stories, growing notes, and garden progress from other members.</p>
          </div>
        </div>
        {user ? (
          <Link to="/blog/new">
            <Button size="sm">
              <PenLine size={14} /> Write a Post
            </Button>
          </Link>
        ) : (
          <Link to="/login" className="text-sm text-[color:var(--color-forest-600)] hover:underline">
            Log in to write a post
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setProgressOnly(false)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!progressOnly ? "bg-[color:var(--color-forest-100)] text-[color:var(--color-forest-700)]" : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-cream-deep)]"}`}
        >
          All Posts
        </button>
        <button
          onClick={() => setProgressOnly(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${progressOnly ? "bg-[color:var(--color-forest-100)] text-[color:var(--color-forest-700)]" : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-cream-deep)]"}`}
        >
          <Sprout size={14} /> Garden Progress
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No posts yet" description={progressOnly ? "No garden progress updates have been shared yet." : "Be the first to write something."} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.items.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="leaf-card leaf-card--interactive p-5 flex flex-col gap-2 focus-ring">
              <div className="flex items-center gap-2 flex-wrap">
                {post.is_progress_update ? (
                  <Badge tone="forest">
                    <Sprout size={11} /> Progress Update
                  </Badge>
                ) : null}
                {post.linked_plant ? <Badge tone="earth">{post.linked_plant.common_name}</Badge> : null}
              </div>
              <h3 className="font-serif text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-[color:var(--color-ink-muted)] line-clamp-2">{post.excerpt}</p>
              <p className="text-xs text-[color:var(--color-ink-faint)] mt-auto pt-1">
                {post.author.display_name} · {new Date(post.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
