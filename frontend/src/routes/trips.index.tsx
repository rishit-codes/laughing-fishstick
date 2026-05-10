import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { TripCard } from "@/components/traveloop/TripCard";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/trips/")({
  head: () => ({
    meta: [
      { title: "Your trips — Traveloop" },
      { name: "description", content: "All your trips, with live health scores and budgets." },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: trips, isLoading, error } = useTrips();

  if (authLoading) {
    return <CenteredState title="Loading account" body="Rehydrating your session." />;
  }

  if (!isAuthenticated) {
    return (
      <CenteredState
        title="Sign in required"
        body="Trips are now loaded from the backend, so you need an authenticated session."
        action={<Button asChild className="rounded-full"><Link to="/login">Go to login</Link></Button>}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Signed in as</div>
            <h1 className="mt-1 font-display text-6xl leading-none">
              {user?.name ?? "Traveler"}.
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Your dashboard is now reading live trip data from FastAPI.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/trips/new">+ New trip</Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Trips" value={String(trips?.length ?? 0)} />
          <Metric
            label="Avg health"
            value={
              trips && trips.length > 0
                ? String(Math.round(trips.reduce((sum, trip) => sum + trip.health_score, 0) / trips.length))
                : "0"
            }
          />
          <Metric
            label="Travelers planned"
            value={String(trips?.reduce((sum, trip) => sum + trip.num_travelers, 0) ?? 0)}
          />
          <Metric
            label="Budgeted total"
            value={formatMoney(trips?.reduce((sum, trip) => sum + (trip.total_budget_limit ?? 0), 0) ?? 0)}
          />
        </div>

        <section className="mt-12">
          {isLoading ? (
            <CenteredPanel title="Loading trips" body="Fetching `/api/trips`." />
          ) : error ? (
            <CenteredPanel
              title="Failed to load trips"
              body={error instanceof Error ? error.message : "Unknown error"}
            />
          ) : !trips || trips.length === 0 ? (
            <CenteredPanel
              title="No trips yet"
              body="Create your first trip and it will appear here from the backend."
              action={<Button asChild className="rounded-full"><Link to="/trips/new">Create trip</Link></Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
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

function CenteredPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
      <div className="font-display text-3xl">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
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
