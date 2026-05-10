import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type Suggestion = {
  name: string;
  category: "food" | "culture" | "outdoor" | "nightlife" | "wellness";
  durationHours: number;
  costPerPersonUsd: number;
  time: string;
  why: string;
};

type Props = {
  city: string;
  country?: string;
  date: string;
  groupSize: number;
  budgetPerPersonUsd: number;
  vibe?: string;
};

const CAT_TINT: Record<Suggestion["category"], string> = {
  food: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  culture: "bg-primary/15 text-primary",
  outdoor: "bg-accent/15 text-accent",
  nightlife: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  wellness: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function AiSuggestions(props: Props) {
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      setItems(data.suggestions ?? []);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!items && !loading && !error) {
    return (
      <button
        onClick={ask}
        className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-xs text-primary transition hover:border-primary hover:bg-primary/10"
      >
        <span className="text-sm">✨</span> Ask AI to fill this day
      </button>
    );
  }

  return (
    <div className="mt-2">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          Traveloop AI is curating suggestions for {props.city}…
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-alert/40 bg-alert/10 p-2 text-xs text-alert">
          {error}{" "}
          <button onClick={ask} className="underline">retry</button>
        </div>
      )}
      <AnimatePresence>
        {items && (
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
            {items.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-background p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${CAT_TINT[s.category]}`}>
                        {s.category}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{s.time}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{s.name}</div>
                    <div className="text-xs italic text-muted-foreground">{s.why}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-muted-foreground">
                    ${Math.round(s.costPerPersonUsd)}<span className="opacity-60">/pp</span>
                    <div className="opacity-60">{s.durationHours}h</div>
                  </div>
                </div>
              </motion.li>
            ))}
            <li className="flex justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={ask}>
                ↻ Regenerate
              </Button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
