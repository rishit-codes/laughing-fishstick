import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Shield, Users as UsersIcon, MapPin, Activity, TrendingUp, MoreHorizontal } from "lucide-react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Toolbar } from "@/components/traveloop/Toolbar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAdminStats } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin — Traveloop" },
    { name: "description", content: "Manage users, monitor city and activity trends, and review platform health." },
  ]}),
  component: Admin,
});

const SECTIONS = ["Manage users", "Popular cities", "Popular activities", "Trends"] as const;

function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const [section, setSection] = useState<typeof SECTIONS[number]>("Manage users");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center text-muted-foreground">Rehydrating your session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <div className="font-display text-4xl">Sign in required</div>
          <p className="mt-3 text-muted-foreground">Admin panel requires an authenticated session.</p>
          <div className="mt-6">
            <Button asChild className="rounded-full"><Link to="/login">Go to login</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (statsLoading || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center text-muted-foreground">Loading admin stats...</div>
      </div>
    );
  }

  const headerStats = [
    { label: "Total users", value: stats.users.toLocaleString(), hint: `+${stats.newUsers7d} last 7 days` },
    { label: "Total trips", value: stats.trips.toLocaleString(), hint: `${stats.activeTrips} active now` },
    { label: "Avg trips / user", value: (stats.trips / stats.users).toFixed(2), hint: "platform-wide" },
    { label: "MoM growth", value: "+12.4%", hint: "new signups" },
  ];

  const filteredUsers = useMemo(() => {
    let list = stats.recentUsers.filter(u => {
      if (!search) return true;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
    if (filter === "Pro") list = list.filter(u => u.plan === "Pro");
    else if (filter === "Free") list = list.filter(u => u.plan === "Free");
    if (sortBy === "Most trips") list = [...list].sort((a, b) => b.trips - a.trips);
    else if (sortBy === "Newest") list = [...list].sort((a, b) => b.joined.localeCompare(a.joined));
    else if (sortBy === "A → Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, filter, sortBy, stats.recentUsers]);

  const maxTrend = Math.max(...(stats?.trends.map(t => t.value) ?? [1]));

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <Shield className="h-4 w-4" /> Admin panel
          </div>
          <h1 className="mt-2 font-display text-6xl leading-none">Platform <em className="text-primary">pulse</em>.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">User management, trending destinations, and growth signals — at a glance.</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {headerStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="lift rounded-2xl border border-border bg-card p-5"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="mt-2 font-mono text-3xl tabular-nums">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-1 border-b border-border/60">
          {SECTIONS.map(s => {
            const Icon =
              s === "Manage users" ? UsersIcon :
              s === "Popular cities" ? MapPin :
              s === "Popular activities" ? Activity : TrendingUp;
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition ${section === s ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-3.5 w-3.5" /> {s}
                {section === s && <motion.span layoutId="admin-tab" className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>

        {section === "Manage users" && (
          <>
            <div className="mt-5">
              <Toolbar
                search={search}
                onSearchChange={setSearch}
                placeholder="Search users by name or email…"
                filter={filter}
                onFilterChange={setFilter}
                filterOptions={["All", "Pro", "Free"]}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOptions={["Newest", "Most trips", "A → Z"]}
              />
            </div>
            <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-5 py-3">User</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3 text-right">Trips</th>
                      <th className="px-3 py-3">Plan</th>
                      <th className="px-3 py-3">Joined</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-border/60 last:border-none">
                        <td className="px-5 py-4 font-medium">{u.name}</td>
                        <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                        <td className="px-3 py-4 text-right font-mono">{u.trips}</td>
                        <td className="px-3 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${u.plan === "Pro" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{u.joined}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => toast("Actions menu opened")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                          No users match your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {section === "Popular cities" && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.popularCities.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="lift rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Rank #{i + 1}</div>
                    <h3 className="mt-1 font-display text-2xl leading-none">{c.name}</h3>
                  </div>
                  <span className="rounded-full bg-forest/15 px-2.5 py-0.5 text-xs text-forest">{c.growth}</span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trips this Q</div>
                    <div className="font-mono text-xl">{c.trips}</div>
                  </div>
                  <div className="h-10 w-24">
                    <svg viewBox="0 0 100 40" className="h-full w-full">
                      <polyline
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        points={Array.from({ length: 8 }).map((_, idx) => `${idx * 14},${30 - ((idx * 5 + i * 7) % 25)}`).join(" ")}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {section === "Popular activities" && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6">
            <div className="space-y-4">
              {stats.popularActivities.map((a, i) => {
                const max = stats.popularActivities[0].bookings;
                const pct = (a.bookings / max) * 100;
                return (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{a.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{a.bookings.toLocaleString()} bookings</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {section === "Trends" && (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 8 weeks</div>
                  <h3 className="mt-1 font-display text-2xl">New trips per week</h3>
                </div>
                <span className="rounded-full bg-forest/15 px-2.5 py-0.5 text-xs text-forest">+34%</span>
              </div>
              <div className="mt-6 flex h-44 items-end gap-3">
                {stats.trends.map((t, i) => {
                  const h = (t.value / maxTrend) * 100;
                  return (
                    <div key={t.week} className="group relative flex flex-1 flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.06 }}
                        className="w-full rounded-t-md bg-primary"
                      />
                      <div className="absolute -top-7 hidden rounded bg-foreground px-2 py-0.5 text-[10px] text-background group-hover:block">
                        {t.value}
                      </div>
                      <div className="mt-2 font-mono text-[10px] text-muted-foreground">{t.week}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Conversion</div>
                <div className="mt-1 font-mono text-3xl">28.4%</div>
                <div className="mt-1 text-xs text-muted-foreground">free → pro, last 30d</div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Retention</div>
                <div className="mt-1 font-mono text-3xl">71%</div>
                <div className="mt-1 text-xs text-muted-foreground">D30, last cohort</div>
              </div>
              <Button variant="outline" className="w-full rounded-full" onClick={() => toast.success("Report exported")}>
                Export report
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
