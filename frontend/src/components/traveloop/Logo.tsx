import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2">
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12c4-8 14-8 18 0" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="font-display text-2xl tracking-tight text-foreground">
        traveloop<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
