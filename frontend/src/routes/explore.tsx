import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Compass, MapPin, Star } from "lucide-react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Toolbar } from "@/components/traveloop/Toolbar";
import { mockCities, mockActivities } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [
    { title: "Explore — Traveloop" },
    { name: "description", content: "Search cities and activities. Add to a trip in one click." },
  ]}),
  component: Explore,
});

const CLIMATES = ["all", "tropical", "temperate", "arid", "alpine", "mediterranean"] as const;

function Explore() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"Cities" | "Activities">("Cities");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [climate, setClimate] = useState<string>("all");
  const [groupBy, setGroupBy] = useState("None");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => { setDebouncedQ(q); setLoading(false); }, 320);
    return () => clearTimeout(id);
  }, [q]);

  const filteredCities = useMemo(() => {
    let list = mockCities.filter(c =>
      (climate === "all" || c.climate === climate) &&
      (debouncedQ === "" || c.name.toLowerCase().includes(debouncedQ.toLowerCase()) || c.country.toLowerCase().includes(debouncedQ.toLowerCase()))
    );
    if (filter === "Budget < $100") list = list.filter(c => c.avgDailyCostUsd < 100);
    else if (filter === "Premium $150+") list = list.filter(c => c.avgDailyCostUsd >= 150);
    if (sortBy === "Cost ↑") list = [...list].sort((a, b) => a.avgDailyCostUsd - b.avgDailyCostUsd);
    else if (sortBy === "Cost ↓") list = [...list].sort((a, b) => b.avgDailyCostUsd - a.avgDailyCostUsd);
    else if (sortBy === "A → Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [debouncedQ, climate, filter, sortBy]);

  const filteredActivities = useMemo(() => {
    let list = mockActivities.filter(a =>
      debouncedQ === "" || a.name.toLowerCase().includes(debouncedQ.toLowerCase()) || a.category.toLowerCase().includes(debouncedQ.toLowerCase())
    );
    if (filter !== "All" && filter !== "Budget < $100" && filter !== "Premium $150+") {
      list = list.filter(a => a.category === filter.toLowerCase());
    }
    if (sortBy === "Cost ↑") list = [...list].sort((a, b) => a.costUsd - b.costUsd);
    else if (sortBy === "Cost ↓") list = [...list].sort((a, b) => b.costUsd - a.costUsd);
    else if (sortBy === "Top rated") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [debouncedQ, filter, sortBy]);

  const activeCity = mockCities.find(c => c.id === activeId);
  const activeActivity = mockActivities.find(a => a.id === activeId);
  const detail = tab === "Cities" ? activeCity : activeActivity;

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Compass className="h-4 w-4" /> Explore
            </div>
            <h1 className="mt-2 font-display text-6xl leading-none">Find your <em className="text-primary">next</em> stop.</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">Curated cities and activities with daily-cost guidance. No paid placements.</p>
          </div>
          <div className="flex rounded-full bg-secondary p-1">
            {(["Cities", "Activities"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setActiveId(null); setFilter("All"); setSortBy("Recommended"); }}
                className={`rounded-full px-4 py-1.5 text-sm transition ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Toolbar
            search={q}
            onSearchChange={setQ}
            placeholder={tab === "Cities" ? "Search Lisbon, Tokyo…" : "Search activities, food, culture…"}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            groupOptions={tab === "Cities" ? ["None", "Continent", "Climate"] : ["None", "Category", "City"]}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={tab === "Cities"
              ? ["All", "Budget < $100", "Premium $150+"]
              : ["All", "food", "culture", "outdoor", "nightlife", "wellness"]}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOptions={tab === "Cities"
              ? ["Recommended", "Cost ↑", "Cost ↓", "A → Z"]
              : ["Recommended", "Cost ↑", "Cost ↓", "Top rated"]}
          />
        </div>

        {tab === "Cities" && (
          <div className="mt-5 flex flex-wrap gap-2">
            {CLIMATES.map(c => (
              <button key={c} onClick={() => setClimate(c)}
                className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition ${climate === c ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 font-mono text-xs text-muted-foreground">
          {loading ? "Searching…" : `${tab === "Cities" ? filteredCities.length : filteredActivities.length} result${(tab === "Cities" ? filteredCities.length : filteredActivities.length) === 1 ? "" : "s"}`}
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-12">
          {/* Results grid */}
          <div className="lg:col-span-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card p-6">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="mt-4 h-8 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                  <Skeleton className="mt-4 h-12 w-full" />
                </div>
              ))}

              {!loading && tab === "Cities" && filteredCities.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setActiveId(c.id)}
                  className={`lift text-left rounded-3xl border bg-card p-6 ${activeId === c.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{c.emoji}</div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest">{c.climate}</span>
                  </div>
                  <h3 className="mt-4 font-display text-3xl leading-none">{c.name}</h3>
                  <div className="text-sm text-muted-foreground">{c.country}</div>
                  <p className="mt-3 line-clamp-2 text-sm">{c.blurb}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg daily</div>
                      <div className="font-mono">${c.avgDailyCostUsd}</div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium transition ${activeId === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary hover:text-primary"}`}>View →</span>
                  </div>
                </motion.button>
              ))}

              {!loading && tab === "Activities" && filteredActivities.map((a, i) => {
                const city = mockCities.find(c => c.id === a.cityId);
                return (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveId(a.id)}
                    className={`lift text-left rounded-3xl border bg-card p-6 ${activeId === a.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest">{a.category}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-signal text-signal" /> {a.rating}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl leading-tight">{a.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {city?.name}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Per person</div>
                        <div className="font-mono">${a.costUsd}</div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium transition ${activeId === a.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary hover:text-primary"}`}>View →</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {!loading && ((tab === "Cities" && filteredCities.length === 0) || (tab === "Activities" && filteredActivities.length === 0)) && (
              <div className="rounded-3xl border border-dashed border-border p-16 text-center">
                <div className="font-display text-3xl">Nothing matches.</div>
                <p className="mt-2 text-muted-foreground">Try a wider filter or clear the search.</p>
              </div>
            )}
          </div>

          {/* Detail side panel */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 rounded-3xl border border-border bg-card p-6 shadow-sm">
              {!detail ? (
                <div className="text-center text-sm text-muted-foreground">
                  <Compass className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-3">Select a result to see details and quick actions.</p>
                </div>
              ) : tab === "Cities" && activeCity ? (
                <>
                  <div className="text-5xl">{activeCity.emoji}</div>
                  <h3 className="mt-3 font-display text-3xl leading-none">{activeCity.name}</h3>
                  <div className="text-sm text-muted-foreground">{activeCity.country}</div>
                  <p className="mt-4 text-sm">{activeCity.blurb}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-5">
                    <Stat label="Climate" value={activeCity.climate} />
                    <Stat label="Avg / day" value={`$${activeCity.avgDailyCostUsd}`} />
                  </div>
                  <Button
                    className="mt-5 w-full rounded-full"
                    onClick={() => {
                      toast.success(`${activeCity.name} added to draft trip`);
                      navigate({
                        to: "/trips/new",
                        search: { cityId: activeCity.id, cityLabel: `${activeCity.name}, ${activeCity.country}` }
                      });
                    }}
                  >
                    + Add to trip
                  </Button>
                </>
              ) : activeActivity ? (
                <>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest">{activeActivity.category}</span>
                  <h3 className="mt-3 font-display text-2xl leading-tight">{activeActivity.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {mockCities.find(c => c.id === activeActivity.cityId)?.name}
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/60 pt-5">
                    <Stat label="Per person" value={`$${activeActivity.costUsd}`} />
                    <Stat label="Duration" value={`${activeActivity.durationHours}h`} />
                    <Stat label="Rating" value={`${activeActivity.rating}`} />
                  </div>
                  <Button
                    className="mt-5 w-full rounded-full"
                    onClick={() => {
                      toast.success(`${activeActivity.name} added to draft trip`);
                      const city = mockCities.find(c => c.id === activeActivity.cityId);
                      if (city) {
                        navigate({
                          to: "/trips/new",
                          search: { cityId: city.id, cityLabel: `${city.name}, ${city.country}` }
                        });
                      } else {
                        navigate({ to: "/trips/new" });
                      }
                    }}
                  >
                    + Add to trip
                  </Button>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm capitalize">{value}</div>
    </div>
  );
}
