import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Download, FileDown, Check, ArrowLeft, Receipt, Search as SearchIcon } from "lucide-react";
import { TopNav } from "@/components/traveloop/TopNav";
import { Footer } from "@/components/traveloop/Footer";
import { Toolbar } from "@/components/traveloop/Toolbar";
import { Button } from "@/components/ui/button";
import { mockInvoiceFor } from "@/lib/mock-extras";
import { fmtRange } from "@/lib/trip-diagnostics";

export const Route = createFileRoute("/trips/$tripId/invoice")({
  loader: ({ params }) => {
    const inv = mockInvoiceFor(params.tripId);
    if (!inv) throw notFound();
    return { inv };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Invoice — ${loaderData.inv.trip.name}` : "Invoice" },
      { name: "description", content: "Trip invoice and billing summary" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="font-display text-6xl">404</div>
        <p className="mt-2 text-muted-foreground">Invoice not found.</p>
        <Link to="/trips" className="mt-4 inline-block text-primary">← Back to trips</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  component: InvoicePage,
});

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function InvoicePage() {
  const { inv } = Route.useLoaderData() as { inv: NonNullable<ReturnType<typeof mockInvoiceFor>> };
  const { trip, lines, subtotal, tax, discount, total, id, issued, status } = inv;
  const overBudget = total > trip.budgetUsd;

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/trips/$tripId"
          params={{ tripId: trip.id }}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> back to trip
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Receipt className="h-4 w-4" /> Invoice
            </div>
            <h1 className="mt-2 font-display text-5xl leading-none">{trip.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {fmtRange(trip.startDate, trip.endDate)} · {trip.stops.length} cit{trip.stops.length === 1 ? "y" : "ies"} · created by {trip.members[0]?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => toast.success("Invoice downloaded")}>
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => toast.success("PDF exported")}>
              <FileDown className="mr-1.5 h-4 w-4" /> Export PDF
            </Button>
            <Button className="rounded-full" onClick={() => toast.success("Marked as paid")}>
              <Check className="mr-1.5 h-4 w-4" /> Mark as paid
            </Button>
          </div>
        </motion.div>

        {/* Search bar (matches wireframe) */}
        <div className="mt-6">
          <Toolbar
            search=""
            onSearchChange={() => {}}
            placeholder="Search invoices…"
            filterOptions={["All", "Paid", "Pending"]}
            sortOptions={["Newest", "Oldest", "Amount"]}
          />
        </div>

        {/* Header summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-12">
          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Invoice ID</div>
            <div className="mt-1 font-mono text-lg">{id}</div>
            <div className="mt-5 text-[10px] uppercase tracking-widest text-muted-foreground">Travelers</div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {trip.members.map(m => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className="text-base">{m.avatar}</span>
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Generated</div>
            <div className="mt-1 font-mono text-lg">{issued}</div>
            <div className="mt-5 text-[10px] uppercase tracking-widest text-muted-foreground">Payment status</div>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                status === "pending" ? "bg-signal/15 text-signal-foreground" : "bg-forest/15 text-forest"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status === "pending" ? "bg-signal" : "bg-forest"}`} />
              {status}
            </span>
          </div>
          <div className="grain rounded-3xl bg-foreground p-6 text-background md:col-span-4">
            <div className="text-[10px] uppercase tracking-widest opacity-70">Budget insights</div>
            <div className="mt-1 font-mono text-3xl">{usd(total)}</div>
            <div className="text-xs opacity-70">total · budget {usd(trip.budgetUsd)}</div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full ${overBudget ? "bg-alert" : "bg-primary"}`}
                style={{ width: `${Math.min(100, (total / trip.budgetUsd) * 100)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[11px] opacity-70">
              <span>Spent {usd(total)}</span>
              <span>{overBudget ? `Over by ${usd(total - trip.budgetUsd)}` : `Left ${usd(trip.budgetUsd - total)}`}</span>
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full rounded-full text-background hover:bg-white/10" asChild>
              <Link to="/trips/$tripId" params={{ tripId: trip.id }}>View full budget →</Link>
            </Button>
          </div>
        </div>

        {/* Line items table */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="w-12 px-5 py-3">#</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Qty / details</th>
                  <th className="px-3 py-3 text-right">Unit cost</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.id} className="border-b border-border/60 last:border-none">
                    <td className="px-5 py-4 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest">{l.category}</span>
                    </td>
                    <td className="px-3 py-4">{l.description}</td>
                    <td className="px-3 py-4 font-mono text-muted-foreground">{l.qty}</td>
                    <td className="px-3 py-4 text-right font-mono">{usd(l.unitCost)}</td>
                    <td className="px-5 py-4 text-right font-mono font-medium">{usd(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 ml-auto w-full max-w-sm rounded-3xl border border-border bg-card p-6">
          <Row label="Subtotal" value={usd(subtotal)} />
          <Row label="Tax (5%)" value={usd(tax)} />
          <Row label="Discount" value={`− ${usd(discount)}`} />
          <div className="my-3 border-t border-border" />
          <Row label="Grand total" value={usd(total)} bold />
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => toast.success("Invoice downloaded")}>
            <Download className="mr-1.5 h-4 w-4" /> Download invoice
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => toast.success("PDF exported")}>
            <FileDown className="mr-1.5 h-4 w-4" /> Export as PDF
          </Button>
          <Button className="rounded-full" onClick={() => toast.success("Marked as paid")}>
            <Check className="mr-1.5 h-4 w-4" /> Mark as paid
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-sm ${bold ? "font-display text-2xl" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
