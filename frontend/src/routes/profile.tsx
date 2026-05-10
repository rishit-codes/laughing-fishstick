import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Globe2, MapPin, Compass, Calendar, Share2, Pencil, BookOpen, NotebookPen, Map } from "lucide-react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCities, mockTrips, mockUser } from "@/lib/mock-data";
import { tripDays } from "@/lib/trip-diagnostics";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: `${mockUser.name} — Traveloop profile` },
    { name: "description", content: "Your travel profile: stats, visited places, plans, guides and journals." },
  ]}),
  component: ProfilePage,
});

const visited = [
  { city: "Lisbon", country: "Portugal", emoji: "🇵🇹", year: 2024 },
  { city: "Barcelona", country: "Spain", emoji: "🇪🇸", year: 2024 },
  { city: "Rome", country: "Italy", emoji: "🇮🇹", year: 2023 },
  { city: "Tokyo", country: "Japan", emoji: "🇯🇵", year: 2023 },
  { city: "Marrakech", country: "Morocco", emoji: "🇲🇦", year: 2022 },
  { city: "Reykjavik", country: "Iceland", emoji: "🇮🇸", year: 2022 },
  { city: "Mexico City", country: "Mexico", emoji: "🇲🇽", year: 2021 },
  { city: "Cape Town", country: "South Africa", emoji: "🇿🇦", year: 2020 },
];

function ProfilePage() {
  const [following, setFollowing] = useState(false);
  const totalDays = mockTrips.reduce((a, t) => a + tripDays(t).length, 0);
  const cities = mockTrips.reduce((a, t) => a + t.stops.length, 0) + visited.length;
  const countries = new Set(visited.map(v => v.country)).size;

  const stats = [
    { label: "Countries", value: countries, icon: Globe2, hint: "across 4 continents" },
    { label: "Cities", value: cities, hint: "explored & planned", icon: MapPin },
    { label: "Trips", value: mockTrips.length + 6, hint: "completed", icon: Compass },
    { label: "Travel days", value: totalDays + 84, hint: "lifetime", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 via-signal/30 to-forest/30 blur-xl" aria-hidden />
            <div className="relative inline-flex h-32 w-32 items-center justify-center rounded-full bg-secondary text-6xl ring-4 ring-background shadow-[0_24px_48px_-24px_oklch(0.18_0.01_60/0.35)]">
              {mockUser.avatar}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Traveler since 2020</div>
            <h1 className="mt-1 font-display text-6xl leading-none">{mockUser.name} <em className="text-primary">Rao</em></h1>
            <div className="mt-2 font-mono text-sm text-muted-foreground">@aanya</div>
            <p className="mt-4 max-w-xl text-pretty text-foreground/80">
              Slow traveler. Coffee cartographer. Currently chasing coastlines from Lisbon to Cape Town —
              one custard tart at a time.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
              <div><span className="font-mono text-base text-foreground">248</span> <span className="text-muted-foreground">followers</span></div>
              <div><span className="font-mono text-base text-foreground">137</span> <span className="text-muted-foreground">following</span></div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Lisbon, PT</div>
            </div>
          </div>
          <div className="flex gap-2 md:flex-col md:items-end">
            <Button
              size="sm"
              variant={following ? "secondary" : "default"}
              onClick={() => { setFollowing(f => !f); toast.success(following ? "Edit mode opened" : "Profile edit mode"); }}
              className="rounded-full"
            >
              <Pencil className="h-4 w-4" /> Edit profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { navigator.clipboard?.writeText("https://traveloop.app/u/aanya"); toast.success("Profile link copied"); }}
              className="rounded-full"
            >
              <Share2 className="h-4 w-4" /> Share profile
            </Button>
          </div>
        </motion.section>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="lift rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 font-mono text-3xl tabular-nums">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </motion.div>
          ))}
        </div>

        {/* Map */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_48px_-24px_oklch(0.18_0.01_60/0.25)]"
        >
          <div className="relative h-72 w-full md:h-96">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(at 20% 30%, oklch(0.78 0.13 75 / 0.35), transparent 55%), radial-gradient(at 75% 60%, oklch(0.42 0.06 150 / 0.35), transparent 55%), radial-gradient(at 50% 80%, oklch(0.62 0.15 38 / 0.3), transparent 60%), linear-gradient(180deg, var(--surface), var(--background))",
              }}
            />
            <svg aria-hidden className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none" viewBox="0 0 800 400">
              {Array.from({ length: 18 }).map((_, i) => (
                <line key={`h${i}`} x1="0" x2="800" y1={i * 24} y2={i * 24} stroke="currentColor" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 28 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 30} x2={i * 30} y1="0" y2="400" stroke="currentColor" strokeWidth="0.5" />
              ))}
            </svg>
            {/* Pins */}
            {[
              { x: "22%", y: "38%", label: "Lisbon" },
              { x: "30%", y: "32%", label: "Barcelona" },
              { x: "40%", y: "36%", label: "Rome" },
              { x: "82%", y: "40%", label: "Tokyo" },
              { x: "32%", y: "20%", label: "Reykjavik" },
              { x: "33%", y: "55%", label: "Marrakech" },
              { x: "20%", y: "62%", label: "Cape Town" },
              { x: "12%", y: "48%", label: "Mexico City" },
            ].map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 220, damping: 18 }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: p.x, top: p.y }}
              >
                <div className="group relative">
                  <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-primary/30" />
                  <span className="relative block h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 transition group-hover:opacity-100">
                    {p.label}
                  </span>
                </div>
              </motion.div>
            ))}

            <div className="absolute left-5 top-5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <Map className="mr-1.5 inline h-3.5 w-3.5 text-primary" /> {countries} countries · {cities} cities
            </div>
            <div className="absolute right-5 bottom-5">
              <Button size="sm" variant="secondary" className="rounded-full shadow-md">+ Add visited place</Button>
            </div>
          </div>
        </motion.section>

        {/* Tabs */}
        <Tabs defaultValue="preplanned" className="mt-12">
          <TabsList className="rounded-full bg-secondary p-1">
            <TabsTrigger value="preplanned" className="rounded-full px-4">Preplanned Trips</TabsTrigger>
            <TabsTrigger value="previous" className="rounded-full px-4">Previous Trips</TabsTrigger>
            <TabsTrigger value="guides" className="rounded-full px-4">Guides</TabsTrigger>
            <TabsTrigger value="journals" className="rounded-full px-4">Journals</TabsTrigger>
          </TabsList>

          <TabsContent value="preplanned" className="mt-6">
            <div className="mb-4 text-sm text-muted-foreground">Trips you have planned for the future.</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {mockTrips.filter(t => new Date(t.startDate) >= new Date()).map((t) => (
                <Link
                  key={t.id}
                  to="/trips/$tripId"
                  params={{ tripId: t.id }}
                  className="lift group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="h-28" style={{ backgroundImage: t.cover }} />
                  <div className="p-5">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.stops.length} stops</div>
                    <div className="mt-1 font-display text-xl leading-tight">{t.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{t.tagline}</div>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">Upcoming</div>
                  </div>
                </Link>
              ))}
              {mockTrips.filter(t => new Date(t.startDate) >= new Date()).length === 0 && (
                <div className="col-span-3 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No upcoming trips yet.
                  <Link to="/trips/new" className="ml-2 text-primary hover:underline">Plan one →</Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="previous" className="mt-6">
            <div className="mb-4 text-sm text-muted-foreground">Trips you've completed — memories archived clean.</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {mockTrips.filter(t => new Date(t.endDate) < new Date()).map((t) => (
                <Link
                  key={t.id}
                  to="/trips/$tripId"
                  params={{ tripId: t.id }}
                  className="lift group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="h-28" style={{ backgroundImage: t.cover }} />
                  <div className="p-5">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.stops.length} stops</div>
                    <div className="mt-1 font-display text-xl leading-tight">{t.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{t.tagline}</div>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Completed</div>
                  </div>
                </Link>
              ))}
              {mockTrips.filter(t => new Date(t.endDate) < new Date()).length === 0 && (
                <div className="col-span-3 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No completed trips yet — go somewhere!
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="mt-6">
            <EmptyState
              icon={BookOpen}
              title="No guides yet"
              body="Turn your favorite trips into shareable city guides. Anything you publish lives here."
              cta="Create your first guide"
            />
          </TabsContent>

          <TabsContent value="journals" className="mt-6">
            <EmptyState
              icon={NotebookPen}
              title="Your journal is quiet"
              body="Capture small moments — a stranger's recommendation, a corner café, a sunset. They'll live here forever."
              cta="Start a journal entry"
            />
          </TabsContent>
        </Tabs>

        {/* Visited list */}
        <section className="mt-12">
          <h2 className="font-display text-3xl">Recently visited</h2>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-3">
            {visited.map((v) => (
              <div key={v.city} className="lift min-w-[200px] rounded-2xl border border-border bg-card p-5">
                <div className="text-3xl">{v.emoji}</div>
                <div className="mt-3 font-display text-xl leading-tight">{v.city}</div>
                <div className="text-sm text-muted-foreground">{v.country} · {v.year}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tip: explore more in <Link to="/explore" className="text-primary hover:underline">Cities</Link>.
          </p>
          {/* mockCities used for type-safety reference */}
          <span className="hidden">{mockCities.length}</span>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; cta: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-display text-3xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      <Button className="mt-6 rounded-full">{cta}</Button>
    </div>
  );
}