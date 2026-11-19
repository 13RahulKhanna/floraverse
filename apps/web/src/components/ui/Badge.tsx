import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "forest" | "earth" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-cream-deep)] text-[color:var(--color-ink-muted)]",
  forest: "bg-[color:var(--color-forest-100)] text-[color:var(--color-forest-700)]",
  earth: "bg-[color:var(--color-earth-400)]/15 text-[color:var(--color-earth-600)]",
  success: "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning)]/14 text-[color:var(--color-warning)]",
  danger: "bg-[color:var(--color-danger)]/12 text-[color:var(--color-danger)]",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", TONE_CLASSES[tone], className)}
      {...props}
    />
  );
}
