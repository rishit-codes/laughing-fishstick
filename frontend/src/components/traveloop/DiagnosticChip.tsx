import type { Diagnostic } from "@/lib/trip-diagnostics";

const tone = {
  info:  "bg-secondary text-secondary-foreground",
  warn:  "bg-signal/30 text-foreground ring-1 ring-signal/50",
  alert: "bg-alert/15 text-alert ring-1 ring-alert/40",
};
const dot = { info: "bg-foreground/40", warn: "bg-signal", alert: "bg-alert" };

export function DiagnosticChip({ d }: { d: Diagnostic }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${tone[d.severity]}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot[d.severity]}`} />
      {d.label}{d.detail ? <span className="opacity-70">· {d.detail}</span> : null}
    </span>
  );
}
