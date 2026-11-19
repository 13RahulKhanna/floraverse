import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Sprout, Trash2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Loading, ErrorState } from "@/components/ui/Loading";
import { SimpleMarkdown } from "@/components/ui/SimpleMarkdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { BlogPostDetail } from "@/lib/types";

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, loading, error } = useApi<BlogPostDetail>(slug ? `/api/v1/blog/${slug}` : null, [slug]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!post || !window.confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiFetch(`/api/v1/blog/${post.slug}`, { method: "DELETE" });
      navigate("/blog");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete this post.");
      setDeleting(false);
    }
  }

  if (loading) return <Loading />;
  if (error || !post) return <ErrorState message={error ?? "Post not found."} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-[color:var(--color-forest-600)] hover:underline mb-6">
        <ChevronLeft size={14} /> All posts
      </Link>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        {post.is_progress_update ? (
          <Badge tone="forest">
            <Sprout size={11} /> Progress Update
          </Badge>
        ) : null}
        {post.linked_plant ? (
          <Link to={`/plants/${post.linked_plant.slug}`}>
            <Badge tone="earth">{post.linked_plant.common_name}</Badge>
          </Link>
        ) : null}
      </div>

      <h1 className="font-serif text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-[color:var(--color-ink-muted)] mb-6">
        {post.author.display_name} · {new Date(post.created_at).toLocaleDateString()}
      </p>

      <SimpleMarkdown content={post.content_markdown} />

      {post.is_mine ? (
        <div className="mt-8 pt-6 border-t border-[color:var(--color-border)]">
          {deleteError ? <p className="text-sm text-[color:var(--color-danger)] mb-2">{deleteError}</p> : null}
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete Post"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
