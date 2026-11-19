import { Leaf } from "lucide-react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[color:var(--color-ink-muted)]">
      <Leaf className="animate-pulse" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm text-[color:var(--color-danger)]">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="btn-outline text-sm px-4 py-1.5 focus-ring">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Leaf size={28} className="text-[color:var(--color-forest-200)]" />
      <p className="font-medium text-[color:var(--color-ink)]">{title}</p>
      {description ? <p className="text-sm text-[color:var(--color-ink-muted)] max-w-sm">{description}</p> : null}
    </div>
  );
}
