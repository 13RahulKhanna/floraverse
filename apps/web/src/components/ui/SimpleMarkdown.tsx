// Minimal renderer for the small markdown subset used in seeded articles: paragraphs
// separated by blank lines, with **bold** inline emphasis. Not a general markdown parser —
// deliberately small rather than pulling in a full markdown dependency for ~10 articles.
export function SimpleMarkdown({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-[color:var(--color-ink)] leading-relaxed">
          {renderInline(para)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
