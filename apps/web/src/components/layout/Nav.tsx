import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, Menu, X, Sprout, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/explore", label: "Explore Plants" },
  { to: "/ai-doctor", label: "AI Plant Doctor" },
  { to: "/compare", label: "Compare" },
  { to: "/learn", label: "Learn Botany" },
  { to: "/conservation", label: "Take Action" },
  { to: "/blog", label: "Blog" },
  { to: "/ngos", label: "NGOs" },
];

export function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[color:var(--color-cream)]/90 backdrop-blur border-b border-[color:var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-[color:var(--color-forest-700)] focus-ring rounded">
          <Leaf size={22} />
          FloraVerse
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "focus-ring px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive ? "bg-[color:var(--color-forest-100)] text-[color:var(--color-forest-700)]" : "text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/garden" className="focus-ring p-2 rounded-full text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]" aria-label="My Garden">
                <Sprout size={18} />
              </Link>
              <Link to="/profile" className="focus-ring p-2 rounded-full text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-forest-600)]" aria-label="Profile">
                <UserIcon size={18} />
              </Link>
              <button onClick={() => { logout(); navigate("/"); }} className="btn-ghost text-sm px-4 py-2 focus-ring">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2 focus-ring">
                Login
              </Link>
              <Link to="/register" className="btn-leaf text-sm px-5 py-2 focus-ring">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden focus-ring p-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-[color:var(--color-border)] px-4 py-3 flex flex-col gap-1 bg-[color:var(--color-cream)]">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--color-cream-deep)]">
              {link.label}
            </NavLink>
          ))}
          <div className="h-px bg-[color:var(--color-border)] my-1" />
          {user ? (
            <>
              <NavLink to="/garden" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--color-cream-deep)]">
                My Garden
              </NavLink>
              <NavLink to="/profile" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--color-cream-deep)]">
                Profile
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--color-cream-deep)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--color-cream-deep)]">
                Login
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--color-cream-deep)]">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}
