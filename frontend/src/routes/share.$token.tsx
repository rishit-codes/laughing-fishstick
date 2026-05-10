import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Logo } from "@/components/traveloop/Logo";
import { citiesApi } from "@/lib/api";
import { useSharedTrip } from "@/hooks/use-api";

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Public itinerary — Traveloop" },
      { name: "description", content: "Read-only shared trip view." },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const { token } = Route.useParams();
  const tripQuery = useSharedTrip(token);

  const cityQueries = useQueries({
    queries: (tripQuery.data?.stops ?? []).map((stop) => ({
      queryKey: ["shared-city", stop.city_id],
      queryFn: () => citiesApi.get(stop.city_id),
      staleTime: 60_000,
    })),
  });

  if (tripQuery.isLoading) {
    return <CenteredState title="Loading shared trip" body="Fetching public itinerary." />;
  }

  if (tripQuery.error || !tripQuery.data) {
    return <CenteredState title="Link unavailable" body="The share token is invalid or the trip no longer exists." />;
  }

  const trip = tripQuery.data;
  const cityMap = new Map(
    cityQueries
      .map((query) => query.data)
      .filter((city): city is NonNullable<typeof city> => Boolean(city))
      .map((city) => [city.id, city]),
  );
  const sortedStops = [...trip.stops].sort((a, b) => a.stop_order - b.stop_order);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Make your own →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Public itinerary · read-only</div>
        <h1 className="mt-2 font-display text-7xl leading-none">{trip.title}</h1>
        <p className="mt-3 max-w-2xl text-xl text-muted-foreground">
          {trip.description?.trim() || "Shared from Traveloop."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6 font-mono text-sm">
          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          <span>{sortedStops.length} stops</span>
          <span>{trip.num_travelers} travelers</span>
        </div>

        <ol className="mt-12 space-y-4">
          {sortedStops.map((stop) => {
            const city = cityMap.get(stop.city_id);
            return (
              <li key={stop.id} className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Stop {stop.stop_order}
                </div>
                <h3 className="mt-1 font-display text-3xl">
                  {city ? `${city.name}, ${city.country}` : `City #${stop.city_id}`}
                </h3>
                <div className="mt-2 font-mono text-sm text-muted-foreground">
                  {formatDateRange(stop.arrival_date, stop.departure_date)}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                  <div>Stay: {stop.accommodation_name || "Not set"}</div>
                  <div>Transport: {stop.transport_type || "Not set"}</div>
                  <div>Flight: {stop.flight_number || "Not set"}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </main>
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        Made with <Link to="/" className="text-primary hover:underline">Traveloop</Link>
      </footer>
    </div>
  );
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

function CenteredState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-4xl">{title}</div>
        <p className="mt-3 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
