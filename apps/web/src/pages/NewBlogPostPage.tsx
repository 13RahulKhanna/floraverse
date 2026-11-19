import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PenLine } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { BlogPostDetail, GardenEntryOut } from "@/lib/types";

export function NewBlogPostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPlantId = searchParams.get("plant");

  const { data: gardenEntries } = useApi<GardenEntryOut[]>("/api/v1/garden");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isProgressUpdate, setIsProgressUpdate] = useState(!!preselectedPlantId);
  const [linkedPlantId, setLinkedPlantId] = useState(preselectedPlantId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const post = await apiFetch<BlogPostDetail>("/api/v1/blog", {
        method: "POST",
        body: JSON.stringify({
          title,
          excerpt,
          content_markdown: content,
          is_progress_update: isProgressUpdate,
          linked_plant_id: isProgressUpdate && linkedPlantId ? Number(linkedPlantId) : null,
        }),
      });
      navigate(`/blog/${post.slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not publish this post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <PenLine size={24} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-2xl font-bold">Write a Post</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring"
          />
          <input
            required
            placeholder="Short excerpt (shown on the post card)"
            maxLength={280}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring"
          />
          <textarea
            required
            placeholder="Write your post... (markdown-style formatting supported)"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-[color:var(--color-border)] text-sm focus-ring resize-none"
          />

          <label className="flex items-center gap-2 text-sm px-1">
            <input type="checkbox" checked={isProgressUpdate} onChange={(e) => setIsProgressUpdate(e.target.checked)} />
            This is a progress update about a plant in My Garden
          </label>

          {isProgressUpdate ? (
            <select
              value={linkedPlantId}
              onChange={(e) => setLinkedPlantId(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-[color:var(--color-border)] text-sm focus-ring bg-white"
            >
              <option value="">No specific plant</option>
              {gardenEntries?.map((entry) => (
                <option key={entry.plant.id} value={entry.plant.id}>
                  {entry.plant.common_name}
                </option>
              ))}
            </select>
          ) : null}

          {error ? <p className="text-sm text-[color:var(--color-danger)]">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
