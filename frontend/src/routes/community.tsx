import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2, Users, Sparkles } from "lucide-react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Toolbar } from "@/components/traveloop/Toolbar";
import { Button } from "@/components/ui/button";
import { type ApiCommunityPost } from "@/lib/api";
import { useCommunity, useCopyTrip, useTrip } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [
    { title: "Community — Traveloop" },
    { name: "description", content: "Real travel stories from Traveloop users — tips, hidden gems, and what they'd skip next time." },
  ]}),
  component: Community,
});

function Community() {
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("None");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Most loved");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: posts, isLoading: isPostsLoading } = useCommunity();
  
  const communityData = posts || [];

  const filtered = useMemo(() => {
    let list = communityData.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    });
    if (filter === "Following") list = list.filter(p => ["Mei", "Theo"].includes(p.author));
    else if (filter === "Recent (week)") list = list.filter(p => p.postedAt.includes("day") || p.postedAt.includes("week"));
    if (sortBy === "Most loved") list = [...list].sort((a, b) => b.likes - a.likes);
    else if (sortBy === "Most discussed") list = [...list].sort((a, b) => b.comments - a.comments);
    else if (sortBy === "Newest") list = [...list].sort((a, b) => communityData.indexOf(a) - communityData.indexOf(b));
    return list;
  }, [search, filter, sortBy, communityData]);

  const toggleLike = (id: string) => setLiked(s => ({ ...s, [id]: !s[id] }));

  const totalLikes = communityData.reduce((a, p) => a + p.likes, 0);

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
          <p className="mt-3 text-muted-foreground">Community stories require an authenticated session.</p>
          <div className="mt-6">
            <Button asChild className="rounded-full"><Link to="/login">Go to login</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Users className="h-4 w-4" /> Community
            </div>
            <h1 className="mt-2 font-display text-6xl leading-none">Real trips, <em className="text-primary">told well</em>.</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Stories, tips, and quiet wins from Traveloop travelers. Search by city, follow people you like, save what's useful.
            </p>
          </div>
          <Button className="rounded-full" onClick={() => toast.success("Share your trip — coming soon")}>
            <Sparkles className="mr-1.5 h-4 w-4" /> Share your trip
          </Button>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Stories shared", value: communityData.length.toString(), hint: "this week" },
            { label: "Total loves", value: totalLikes.toString(), hint: "across the feed" },
            { label: "Active travelers", value: "1.2k", hint: "this month" },
            { label: "Cities covered", value: new Set(communityData.map(c => c.city)).size.toString(), hint: "and growing" },
          ].map((s, i) => (
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

        <div className="mt-8">
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search the community…"
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            groupOptions={["None", "City", "Author"]}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={["All", "Following", "Recent (week)"]}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOptions={["Most loved", "Most discussed", "Newest"]}
          />
        </div>

        <div className="mt-6 font-mono text-xs text-muted-foreground">
          {filtered.length} stor{filtered.length === 1 ? "y" : "ies"}
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isPostsLoading ? (
             <div className="col-span-full py-20 text-center text-muted-foreground">Loading community stories...</div>
          ) : (
            filtered.map((p, i) => (
              <PostCard key={p.id} post={p} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} delay={i * 0.05} />
            ))
          )}
        </div>

        {!isPostsLoading && filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-border p-16 text-center">
            <div className="font-display text-3xl">No stories match.</div>
            <p className="mt-2 text-muted-foreground">Try a different search or clear the filter.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function PostCard({ post, liked, onLike, delay }: { post: ApiCommunityPost; liked: boolean; onLike: () => void; delay: number }) {
  const CardContent = (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="lift overflow-hidden rounded-3xl border border-border bg-card h-full flex flex-col"
    >
      <div className="grain relative h-36" style={{ background: post.cover }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-1.5">
          <span className="rounded-full bg-background/85 px-2.5 py-1 text-xs backdrop-blur">
            {post.emoji} {post.city}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-lg backdrop-blur">{post.avatar}</span>
          <div>
            <div className="text-xs font-medium text-background">{post.author}</div>
            <div className="font-mono text-[10px] text-background/80">{post.postedAt}</div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl leading-tight">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.body}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`inline-flex items-center gap-1.5 transition ${liked ? "text-alert" : "hover:text-foreground"}`}
              aria-label="Like"
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span className="font-mono text-xs">{post.likes + (liked ? 1 : 0)}</span>
            </button>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="font-mono text-xs">{post.comments}</span>
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.success("Link copied");
            }}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );

  if (!post.tripId) {
    return CardContent;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer h-full">{CardContent}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{post.title}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            Itinerary for {post.city}, {post.country} by {post.author}
          </div>
        </DialogHeader>
        <TripItineraryPreview tripId={post.tripId} />
      </DialogContent>
    </Dialog>
  );
}

function TripItineraryPreview({ tripId }: { tripId: string }) {
  const { data: trip, isLoading } = useTrip(tripId);
  const copyTrip = useCopyTrip();

  if (isLoading) {
    return (
      <div className="space-y-4 py-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (!trip) {
    return <div className="py-6 text-center text-muted-foreground">Itinerary details not found.</div>;
  }

  const sortedStops = [...trip.stops].sort((a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime());

  return (
    <div className="mt-4">
      {trip.description && (
        <div className="mb-6 rounded-2xl bg-primary/5 p-4 text-sm text-foreground/90 border border-primary/10">
          <p className="font-medium mb-2 text-primary">Highlights & Must-Dos</p>
          <p className="whitespace-pre-wrap leading-relaxed">{trip.description}</p>
        </div>
      )}
      <div className="space-y-4">
        {sortedStops.length === 0 ? (
          <div className="text-sm text-muted-foreground">No stops recorded for this trip.</div>
        ) : (
          sortedStops.map((stop, i) => (
            <div key={stop.id} className="rounded-2xl border border-border p-4 bg-secondary/30">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Stop {i + 1}</div>
              <div className="mt-1 font-medium">{stop.arrival_date} to {stop.departure_date}</div>
              {stop.accommodation_name && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Stay: {stop.accommodation_name}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border">
        <Button 
          className="w-full rounded-full" 
          onClick={() => {
            toast.promise(copyTrip.mutateAsync(tripId), {
              loading: 'Copying itinerary...',
              success: 'Itinerary copied to your trips! You can find it in your Profile.',
              error: 'Failed to copy itinerary.'
            });
          }}
          disabled={copyTrip.isPending}
        >
          {copyTrip.isPending ? "Copying..." : "Copy Itinerary to My Trips"}
        </Button>
      </div>
    </div>
  );
}
