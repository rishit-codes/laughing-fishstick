import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-collage.jpg";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Marquee } from "@/components/traveloop/Marquee";
import { HealthScoreRing } from "@/components/traveloop/HealthScoreRing";
import { Button } from "@/components/ui/button";
import { CalendarDays, Wallet, Users, CheckCircle2, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import { mockCities } from "@/lib/mock-data";
import { extraTrips } from "@/lib/mock-extras";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traveloop — Plan trips together, without the chaos" },
      { name: "description", content: "Diagnostic group travel planner with live budget intelligence, dead-day detection and a single source of truth for every trip." },
      { property: "og:title", content: "Traveloop — Plan trips together" },
      { property: "og:description", content: "One platform for itinerary, group budget and planning diagnostics." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav variant="marketing" />

      {/* HERO */}
      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built for groups of 2–8 travelers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .8, delay: .05 }}
              className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-tight text-balance"
            >
              Plan trips <em className="text-primary">together</em>,<br />
              without the chaos.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25, duration: .6 }}
              className="mt-6 max-w-lg text-lg text-muted-foreground text-pretty"
            >
              Itinerary, group budget and a planning brain in one place.
              Traveloop tells you what&rsquo;s wrong with your trip <em>before</em> you leave —
              the dead Tuesday in Rome, the overlap in Lisbon, the dinner spend that just blew your week.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/trips">Plan a trip — it&rsquo;s free</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full">
                <Link to="/share/$token" params={{ token: "med-loop-2026-aanya" }}>See a sample trip →</Link>
              </Button>
            </motion.div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-6">
              {[
                ["4–5", "tools replaced"],
                ["100", "health score"],
                ["0", "spreadsheets"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-mono text-2xl">{n}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative md:col-span-5">
            <motion.img
              src={heroImg} alt="Travel collage of Lisbon, Tokyo, Iceland and Marrakech"
              width={1536} height={1024}
              initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl"
            />
            {/* Floating health card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .5, duration: .6 }}
              className="absolute -left-6 bottom-6 hidden w-64 rounded-2xl border border-border bg-card p-4 shadow-xl md:block"
            >
              <div className="flex items-center gap-3">
                <HealthScoreRing score={87} size={64} label="" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Mediterranean Loop</div>
                  <div className="font-display text-lg leading-tight">Trip is in great shape</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">2 dead days</span>
                <span className="rounded-full bg-forest/15 px-2 py-0.5 text-xs text-forest">On budget</span>
              </div>
            </motion.div>
            {/* Floating budget card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .7, duration: .6 }}
              className="absolute -right-4 top-8 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-xl md:block"
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Per person · 4 people</div>
              <div className="mt-1 font-mono text-3xl">$524</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[62%] rounded-full bg-primary" />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
                <span>spent</span><span>$2,094 / $3,360</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee items={["Lisbon", "Tokyo", "Marrakech", "Reykjavik", "Mexico City", "Cape Town", "Rome", "Bangkok"]} />

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary">Everything you need</div>
          <h2 className="mt-2 font-display text-5xl leading-none">Six tools, one <em className="text-primary">trip brain</em>.</h2>
          <p className="mt-4 text-muted-foreground">Other apps store data. Traveloop reads it — across itinerary, budget, group and gear.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Smart Itinerary Builder", d: "Drag-and-drop planning with AI-powered suggestions for optimal routes and timing.", Icon: CalendarDays },
            { t: "Budget Intelligence", d: "Real-time expense tracking with category breakdowns and smart saving recommendations.", Icon: Wallet },
            { t: "Collaborative Planning", d: "Invite friends and family to plan together with real-time sync and voting.", Icon: Users },
            { t: "Smart Packing Lists", d: "Weather-aware packing suggestions that adapt to your destination and activities.", Icon: CheckCircle2 },
            { t: "City Discovery", d: "Explore destinations with curated recommendations and local insights.", Icon: Globe },
            { t: "Trip Health Score", d: "Get a comprehensive view of your trip readiness with actionable improvements.", Icon: ShieldCheck },
          ].map(({ t, d, Icon }) => (
            <div key={t} className="lift rounded-3xl border border-border bg-card p-7">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-6 font-display text-2xl leading-tight">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MOCK ITINERARY */}
      <section id="how" className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary">Live preview</div>
            <h2 className="mt-2 font-display text-5xl leading-tight">A week in <em>Lisbon</em>, diagnosed.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="rounded-3xl border border-border bg-card p-6 md:col-span-7">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="font-display text-2xl">Mon → Sun</div>
                <span className="rounded-full bg-alert/15 px-3 py-1 text-xs text-alert">1 conflict detected</span>
              </div>
              <ol className="mt-4 space-y-3">
                {[
                  ["Mon", "Arrive · Tram 28 sunset", "06 Jun", "ok"],
                  ["Tue", "Time Out Market crawl", "07 Jun", "ok"],
                  ["Wed", "Free day", "08 Jun", "warn"],
                  ["Thu", "Sintra day trip", "09 Jun", "ok"],
                  ["Fri", "Departs LIS · arrives BCN (overlap)", "09 Jun", "alert"],
                  ["Sat", "Sagrada Família", "10 Jun", "ok"],
                  ["Sun", "Park Güell picnic", "11 Jun", "ok"],
                ].map(([d, label, date, tone]) => (
                  <li key={`${d}${date}`} className={`flex items-center gap-4 rounded-xl border p-3 ${
                    tone === "warn" ? "border-signal/40 bg-signal/10" :
                    tone === "alert" ? "border-alert/40 bg-alert/10" : "border-border bg-background"
                  }`}>
                    <div className="w-12 font-mono text-xs uppercase text-muted-foreground">{d}</div>
                    <div className="flex-1 text-sm">{label}</div>
                    <div className="font-mono text-xs text-muted-foreground">{date}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-6 md:col-span-5">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Suggested fix</div>
                <p className="mt-3 font-display text-2xl leading-tight">Add a Wednesday group activity in Lisbon.</p>
                <div className="mt-4 space-y-2">
                  {["Sintra day trip · $60 pp", "Fado supper club · $55 pp", "Belém river cruise · $35 pp"].map(s => (
                    <button key={s} className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-left text-sm hover:border-primary">
                      {s}<span className="text-primary">+ add</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-alert p-6 text-primary-foreground">
                <div className="text-xs uppercase tracking-widest opacity-80">Group budget</div>
                <div className="mt-2 font-mono text-4xl">$2,094</div>
                <div className="text-sm opacity-80">of $3,360 · 4 people</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {[["Food","$597"],["Stay","$1,360"],["Acts","$340"]].map(([k,v])=>(
                    <div key={k} className="rounded-lg bg-white/10 p-2">
                      <div className="opacity-70">{k}</div>
                      <div className="font-mono">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP REGIONAL SELECTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary">Top regional selections</div>
            <h2 className="mt-2 font-display text-5xl leading-tight">Cities people <em>actually</em> finish planning.</h2>
          </div>
          <Link to="/explore" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:inline-flex">
            All cities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mockCities.slice(0, 8).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.04 }}
              className="lift group rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="text-4xl">{c.emoji}</div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest">{c.climate}</span>
              </div>
              <h3 className="mt-5 font-display text-2xl leading-none">{c.name}</h3>
              <div className="text-xs text-muted-foreground">{c.country}</div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.blurb}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg / day</div>
                  <div className="font-mono text-sm">${c.avgDailyCostUsd}</div>
                </div>
                <Link to="/explore" className="text-sm text-primary opacity-0 transition group-hover:opacity-100">Add →</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREVIOUS TRIPS */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary">Previous trips</div>
              <h2 className="mt-2 font-display text-5xl leading-tight">Memories, <em>archived clean</em>.</h2>
              <p className="mt-3 max-w-md text-muted-foreground">Every completed trip stays organized — itinerary, expenses, photos, and notes — exactly the way you left it.</p>
            </div>
            <Link to="/trips" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:inline-flex">
              All trips <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {extraTrips.slice(1, 4).concat(extraTrips.slice(0, 1)).slice(0, 3).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.06 }}
                className="lift group overflow-hidden rounded-3xl border border-border bg-card"
              >
                <div className="grain h-40 w-full" style={{ background: t.cover }} />
                <div className="p-5">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {new Date(t.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                  <h3 className="mt-1 font-display text-2xl leading-tight">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <div className="flex -space-x-2">
                      {t.members.slice(0, 4).map(m => (
                        <span key={m.id} className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-sm">{m.avatar}</span>
                      ))}
                    </div>
                    <Link to="/trips/$tripId" params={{ tripId: t.id }} className="text-sm text-primary hover:underline">Open →</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="mx-auto max-w-5xl px-6 py-32 text-center">
        <p className="font-display text-4xl leading-tight text-balance md:text-6xl">
          &ldquo;We finally stopped <em className="text-primary">arguing</em> about who paid for the train and started enjoying the view.&rdquo;
        </p>
        <div className="mt-8 text-sm uppercase tracking-widest text-muted-foreground">— Mei, 4-city Italy trip · 2026</div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-foreground p-12 text-background md:p-20">
          <h2 className="max-w-3xl font-display text-5xl leading-tight md:text-7xl">
            Your next trip starts <em className="text-primary">here</em>.
          </h2>
          <p className="mt-4 max-w-xl text-background/70">No credit card. No app store. Open it now and import last year&rsquo;s itinerary in one click.</p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/trips">Open Traveloop</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full text-background hover:bg-white/10">
              <Link to="/explore">Browse cities</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
