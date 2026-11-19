import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center gap-4">
      <Leaf size={32} className="text-[color:var(--color-forest-300)]" />
      <h1 className="font-serif text-4xl font-bold">404</h1>
      <p className="text-[color:var(--color-ink-muted)]">This page has wilted away. Let's get you back on the path.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
