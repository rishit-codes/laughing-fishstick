import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { stopsApi } from "@/lib/api";
import { useCitySearch, useCreateTrip } from "@/hooks/use-api";

export const Route = createFileRoute("/trips/new")({
  head: () => ({ meta: [{ title: "New trip — Traveloop" }] }),
  component: NewTrip,
});

type DraftStop = {
  city_id: number;
  city_label: string;
  arrival_date: string;
  departure_date: string;
  accommodation_name: string;
  accommodation_cost: string;
  transport_type: string;
  transport_cost: string;
};

function NewTrip() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const createTrip = useCreateTrip();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numTravelers, setNumTravelers] = useState("1");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState("draft");
  const [cityQuery, setCityQuery] = useState("");
  const [stops, setStops] = useState<DraftStop[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: cityResults, isLoading: cityLoading } = useCitySearch(cityQuery);
  const canSearchCities = cityQuery.trim().length >= 2;

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => +new Date(a.arrival_date) - +new Date(b.arrival_date)),
    [stops],
  );

  if (authLoading) {
    return <CenteredState title="Loading account" body="Checking your session." />;
  }

  if (!isAuthenticated) {
    return <CenteredState title="Sign in required" body="Trip creation needs an authenticated API session." />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!title || !startDate || !endDate) {
      setFormError("Title and trip dates are required.");
      return;
    }

    try {
      const trip = await createTrip.mutateAsync({
        title,
        description: description || undefined,
        start_date: startDate,
        end_date: endDate,
        num_travelers: Number(numTravelers) || 1,
        total_budget_limit: budget ? Number(budget) : undefined,
        status,
      });

      const orderedStops = [...sortedStops].sort(
        (a, b) => +new Date(a.arrival_date) - +new Date(b.arrival_date),
      );

      for (let index = 0; index < orderedStops.length; index += 1) {
        const stop = orderedStops[index];
        await stopsApi.create(trip.id, {
          city_id: stop.city_id,
          arrival_date: stop.arrival_date,
          departure_date: stop.departure_date,
          stop_order: index + 1,
          accommodation_name: stop.accommodation_name || undefined,
          accommodation_cost: stop.accommodation_cost ? Number(stop.accommodation_cost) : 0,
          transport_type: stop.transport_type || undefined,
          transport_cost: stop.transport_cost ? Number(stop.transport_cost) : 0,
        });
      }

      await navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create trip.");
    }
  }

  function addStop(cityId: number, cityLabel: string) {
    setStops((current) => [
      ...current,
      {
        city_id: cityId,
        city_label: cityLabel,
        arrival_date: startDate,
        departure_date: endDate,
        accommodation_name: "",
        accommodation_cost: "",
        transport_type: "",
        transport_cost: "",
      },
    ]);
    setCityQuery("");
  }

  function updateStop(index: number, patch: Partial<DraftStop>) {
    setStops((current) => current.map((stop, idx) => (idx === index ? { ...stop, ...patch } : stop)));
  }

  function removeStop(index: number) {
    setStops((current) => current.filter((_, idx) => idx !== index));
  }

  const isSubmitting = createTrip.isPending;

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Connected flow</div>
          <h1 className="mt-2 font-display text-5xl leading-none">Create a real trip.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            This form creates the trip first, then writes each stop through the backend stop API.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Basics</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <Label htmlFor="start">Start date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="end">End date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="travelers">Travelers</Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={numTravelers}
                  onChange={(e) => setNumTravelers(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget limit (USD)</Label>
                <Input id="budget" type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-1.5" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Stops</h2>
            <div className="mt-5">
              <Label htmlFor="city-search">Search city</Label>
              <Input
                id="city-search"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Type at least 2 letters"
                className="mt-1.5"
              />
              <div className="mt-3 rounded-2xl border border-border bg-background">
                {!canSearchCities ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Start typing to search the seeded city database.</div>
                ) : cityLoading ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Searching cities...</div>
                ) : !cityResults || cityResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No matching cities found.</div>
                ) : (
                  cityResults.slice(0, 8).map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => addStop(city.id, `${city.name}, ${city.country}`)}
                      className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-secondary"
                    >
                      <span>
                        <span className="font-medium">{city.name}</span>
                        <span className="text-muted-foreground">, {city.country}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">Add</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {stops.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No stops yet. Add at least one city if you want the itinerary to have destinations.
                </div>
              ) : (
                stops.map((stop, index) => (
                  <div key={`${stop.city_id}-${index}`} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">Stop {index + 1}</div>
                        <div className="font-medium">{stop.city_label}</div>
                      </div>
                      <Button type="button" variant="ghost" onClick={() => removeStop(index)}>
                        Remove
                      </Button>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Arrival date</Label>
                        <Input
                          type="date"
                          value={stop.arrival_date}
                          onChange={(e) => updateStop(index, { arrival_date: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Departure date</Label>
                        <Input
                          type="date"
                          value={stop.departure_date}
                          onChange={(e) => updateStop(index, { departure_date: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Accommodation</Label>
                        <Input
                          value={stop.accommodation_name}
                          onChange={(e) => updateStop(index, { accommodation_name: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Accommodation cost</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stop.accommodation_cost}
                          onChange={(e) => updateStop(index, { accommodation_cost: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Transport type</Label>
                        <Input
                          value={stop.transport_type}
                          onChange={(e) => updateStop(index, { transport_type: e.target.value })}
                          className="mt-1.5"
                          placeholder="flight, train, bus..."
                        />
                      </div>
                      <div>
                        <Label>Transport cost</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stop.transport_cost}
                          onChange={(e) => updateStop(index, { transport_cost: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {formError ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" className="rounded-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create trip"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
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
