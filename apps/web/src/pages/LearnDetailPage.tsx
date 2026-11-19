import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Loading, ErrorState } from "@/components/ui/Loading";
import { SimpleMarkdown } from "@/components/ui/SimpleMarkdown";
import type { ArticleDetail } from "@/lib/types";

export function LearnDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, loading, error } = useApi<ArticleDetail>(slug ? `/api/v1/learn/${slug}` : null, [slug]);

  if (loading) return <Loading />;
  if (error || !article) return <ErrorState message={error ?? "Article not found."} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-[color:var(--color-forest-600)] hover:underline mb-6">
        <ChevronLeft size={14} /> All articles
      </Link>
      <h1 className="font-serif text-3xl font-bold mb-2">{article.title}</h1>
      <p className="text-[color:var(--color-ink-muted)] mb-6">{article.summary}</p>
      <SimpleMarkdown content={article.content_markdown} />
    </div>
  );
}
