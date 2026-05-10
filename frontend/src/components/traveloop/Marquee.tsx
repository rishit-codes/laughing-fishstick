export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border/60 bg-surface py-6">
      <div className="marquee flex w-max items-center gap-12 whitespace-nowrap">
        {row.map((it, i) => (
          <span key={i} className="font-display text-3xl italic text-foreground/80">
            {it} <span className="mx-6 text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
