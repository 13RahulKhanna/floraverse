import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 font-serif text-lg font-bold text-[color:var(--color-forest-700)] mb-2">
            <Leaf size={18} />
            FloraVerse
          </div>
          <p className="text-[color:var(--color-ink-muted)]">Discover, Identify, and Understand the World of Plants.</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[color:var(--color-ink)]">Explore</span>
          <Link to="/explore" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Plant Encyclopedia</Link>
          <Link to="/ai-doctor" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">AI Plant Doctor</Link>
          <Link to="/compare" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Compare Plants</Link>
          <Link to="/learn" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Learn Botany</Link>
          <Link to="/conservation" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Take Action</Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[color:var(--color-ink)]">Community</span>
          <Link to="/blog" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Blog</Link>
          <Link to="/ngos" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">NGO Directory</Link>
          <Link to="/ngos/register" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Register Your NGO</Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[color:var(--color-ink)]">Account</span>
          <Link to="/garden" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">My Garden</Link>
          <Link to="/login" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Login</Link>
          <Link to="/register" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Sign up</Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[color:var(--color-ink)]">Company</span>
          <Link to="/about" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">About Us</Link>
          <Link to="/contact" className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]">Contact Us</Link>
        </div>
      </div>
      <div className="text-center text-xs text-[color:var(--color-ink-faint)] pb-8">
        © {new Date().getFullYear()} FloraVerse. A botanical encyclopedia built for learning, not a substitute for professional botanical or medical advice.
      </div>
    </footer>
  );
}
