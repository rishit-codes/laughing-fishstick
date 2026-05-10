import { motion } from "framer-motion";
import type { SubScore } from "@/lib/trip-diagnostics";

function color(v: number) {
  return v >= 80 ? "var(--forest)" : v >= 55 ? "var(--signal)" : "var(--alert)";
}

export function HealthBreakdown({ scores }: { scores: SubScore[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Health insights</div>
          <h3 className="mt-1 font-display text-2xl">What drives your score</h3>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">live</span>
      </div>
      <ul className="mt-5 space-y-4">
        {scores.map((s, i) => (
          <li key={s.key}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{s.label}</span>
              <span className="font-mono text-sm tabular-nums" style={{ color: color(s.value) }}>{s.value}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                className="h-full rounded-full"
                style={{ backgroundColor: color(s.value) }}
              />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.hint}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
