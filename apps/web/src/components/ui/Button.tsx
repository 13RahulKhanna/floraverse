import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "btn-leaf",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] border border-[color:var(--color-danger)]/30 hover:bg-[color:var(--color-danger)]/15 rounded-full",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm px-4 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring font-semibold inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
