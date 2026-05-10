import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { citiesApi } from "@/lib/api";
import { useCopyTrip, useTrip, useTripBudget, useTripDailyBudget, useTripFreeDays, useTripHealth } from "@/hooks/use-api";

export const Route = createFileRoute("/trips/$tripId")({
  head: () => ({
    meta: [
      { title: "Trip detail — Traveloop" },
      { name: "description", content: "Trip itinerary, budget, health, and share info." },
    ],
  }),
  component: TripDetailPage,
});

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const tripQuery = useTrip(tripId);
  const healthQuery = useTripHealth(tripId);
  const budgetQuery = useTripBudget(tripId);
  const dailyBudgetQuery = useTripDailyBudget(tripId);
  const freeDaysQuery = useTripFreeDays(tripId);
  const copyTrip = useCopyTrip();

  const cityQueries = useQueries({
    queries: (tripQuery.data?.stops ?? []).map((stop) => ({
      queryKey: ["city", stop.city_id],
      queryFn: () => citiesApi.get(stop.city_id),
      staleTime: 60_000,
    })),
  });

  if (authLoading) {
    return <CenteredState title="Loading account" body="Checking your session." />;
  }

  if (!isAuthenticated) {
    return (
      <CenteredState
        title="Sign in required"
        body="Trip detail pages now read directly from the backend."
        action={<Button asChild className="rounded-full"><Link to="/login">Go to login</Link></Button>}
      />
    );
  }

  if (tripQuery.isLoading) {
    return <CenteredState title="Loading trip" body="Fetching trip and stop data." />;
  }

  if (tripQuery.error || !tripQuery.data) {
    return (
      <CenteredState
        title="Trip not available"
        body={tripQuery.error instanceof Error ? tripQuery.error.message : "The trip could not be loaded."}
        action={<Button asChild className="rounded-full"><Link to="/trips">Back to trips</Link></Button>}
      />
    );
  }

  const trip = tripQuery.data;
  const cityMap = new Map(
    cityQueries
      .map((query) => query.data)
      .filter((city): city is NonNullable<typeof city> => Boolean(city))
      .map((city) => [city.id, city]),
  );
  const sortedStops = [...trip.stops].sort((a, b) => a.stop_order - b.stop_order);
  const budget = budgetQuery.data;
  const dailyBudget = dailyBudgetQuery.data ?? [];
  const freeDays = freeDaysQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link to="/trips" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              ← Trips
            </Link>
            <h1 className="mt-3 font-display text-6xl leading-none">{trip.title}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {trip.description?.trim() || "No description added yet."}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 font-mono text-sm text-muted-foreground">
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
              <span>{trip.num_travelers} travelers</span>
              <span>{sortedStops.length} stops</span>
              <span>{trip.status}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={copyTrip.isPending}
              onClick={async () => {
                const copied = await copyTrip.mutateAsync(trip.id);
                await tripQuery.refetch();
                await navigate({ to: "/trips/$tripId", params: { tripId: copied.id } });
              }}
            >
              {copyTrip.isPending ? "Copying..." : "Copy trip"}
            </Button>
            {trip.share_token ? (
              <Button asChild className="rounded-full">
                <Link to="/share/$token" params={{ token: trip.share_token }}>Open share view</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Health" value={healthQuery.data ? String(healthQuery.data.score) : "--"} />
          <Metric label="Budget" value={budget ? formatMoney(budget.grand_total) : "--"} />
          <Metric label="Per person" value={budget ? formatMoney(budget.cost_per_person ?? 0) : "--"} />
          <Metric label="Free days" value={String(freeDays.length)} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl">Stops</h2>
            {sortedStops.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No stops have been added to this trip yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {sortedStops.map((stop) => {
                  const city = cityMap.get(stop.city_id);
                  return (
                    <div key={stop.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-muted-foreground">
                            Stop {stop.stop_order}
                          </div>
                          <div className="mt-1 text-xl font-medium">
                            {city ? `${city.name}, ${city.country}` : `City #${stop.city_id}`}
                          </div>
                          <div className="mt-1 font-mono text-sm text-muted-foreground">
                            {formatDateRange(stop.arrival_date, stop.departure_date)}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>Accommodation: {formatMoney(stop.accommodation_cost)}</div>
                          <div>Transport: {formatMoney(stop.transport_cost)}</div>
                        </div>
                      </div>
                      {(stop.accommodation_name || stop.transport_type || stop.flight_number) && (
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          <div>Stay: {stop.accommodation_name || "Not set"}</div>
                          <div>Transport: {stop.transport_type || "Not set"}</div>
                          <div>Flight: {stop.flight_number || "Not set"}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-3xl">Budget summary</h2>
              {budget ? (
                <div className="mt-5 space-y-3 text-sm">
                  <BudgetRow label="Transport" value={budget.transport_total} />
                  <BudgetRow label="Accommodation" value={budget.accommodation_total} />
                  <BudgetRow label="Activities" value={budget.activities_total} />
                  <BudgetRow label="Grand total" value={budget.grand_total} strong />
                  <BudgetRow label="Per person" value={budget.cost_per_person ?? 0} strong />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Budget data is still loading.</p>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-3xl">Daily burn</h2>
              {dailyBudget.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No daily budget rows available yet.</p>
              ) : (
                <div className="mt-5 space-y-3">
                  {dailyBudget.map((day) => (
                    <div key={day.date} className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium">{day.city_name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{day.date}</div>
                      </div>
                      <div className="font-mono">{formatMoney(day.day_total)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-3xl">Free days</h2>
          {freeDays.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No dead days detected by the backend function.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {freeDays.map((day) => (
                <div key={day.dead_date} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="text-xs uppercase tracking-widest text-amber-700">Dead day</div>
                  <div className="mt-1 text-lg font-medium">{day.city_name}</div>
                  <div className="font-mono text-sm text-muted-foreground">{day.dead_date}</div>
                  <div className="mt-4 space-y-2">
                    {day.top_activities.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No suggested activities returned.</div>
                    ) : (
                      day.top_activities.map((activity) => (
                        <div key={activity.id} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-muted-foreground">
                            {activity.category || "Activity"} · {formatMoney(activity.avg_cost_usd ?? 0)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function BudgetRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className="font-mono">{formatMoney(value)}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums">{value}</div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", {
    ...opts,
    year: startDate.getFullYear() === endDate.getFullYear() ? undefined : "numeric",
  })}, ${endDate.getFullYear()}`;
}

function CenteredState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-4xl">{title}</div>
        <p className="mt-3 text-muted-foreground">{body}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
