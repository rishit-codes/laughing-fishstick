import { Link } from "@tanstack/react-router";
import type { ApiTripWithHealth } from "@/lib/api";

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", {
    ...opts,
    year: startDate.getFullYear() === endDate.getFullYear() ? undefined : "numeric",
  })}, ${endDate.getFullYear()}`;
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function healthTone(score: number) {
  if (score > 70) return "text-emerald-600 bg-emerald-500/10";
  if (score >= 40) return "text-amber-600 bg-amber-500/10";
  return "text-rose-600 bg-rose-500/10";
}

export function TripCard({ trip }: { trip: ApiTripWithHealth }) {
  return (
    <Link
      to="/trips/$tripId"
      params={{ tripId: trip.id }}
      className="group lift flex flex-col rounded-3xl border border-border bg-card p-6 transition hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {trip.status}
          </div>
          <h3 className="mt-2 truncate font-display text-3xl leading-tight text-foreground">
            {trip.title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {trip.description?.trim() || "No description yet."}
          </p>
        </div>
        <div className={`rounded-full px-3 py-2 text-sm font-semibold ${healthTone(trip.health_score)}`}>
          {trip.health_score}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dates</div>
          <div className="mt-1 font-mono">{formatDateRange(trip.start_date, trip.end_date)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Travelers</div>
          <div className="mt-1 font-mono">{trip.num_travelers}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Budget</div>
          <div className="mt-1 font-mono">{formatMoney(trip.total_budget_limit)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Share</div>
          <div className="mt-1 font-mono">{trip.share_token ? "Ready" : "Unavailable"}</div>
        </div>
      </div>
    </Link>
  );
}
