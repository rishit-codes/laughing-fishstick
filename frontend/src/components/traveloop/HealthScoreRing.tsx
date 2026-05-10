import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export function HealthScoreRing({ score, size = 140, label = "Trip health" }: { score: number; size?: number; label?: string }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const mv = useMotionValue(0);
  const dash = useTransform(mv, v => c - (v / 100) * c);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const ctrl = animate(mv, score, { duration: 1.2, ease: [0.2, 0.8, 0.2, 1], onUpdate: v => setShown(Math.round(v)) });
    return () => ctrl.stop();
  }, [score, mv]);

  const color = score >= 80 ? "var(--forest)" : score >= 55 ? "var(--signal)" : "var(--alert)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--color-border)" strokeWidth={8} fill="none" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={8} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: dash }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl tabular-nums">{shown}</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
