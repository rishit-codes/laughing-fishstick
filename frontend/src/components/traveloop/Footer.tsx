import { Logo } from "./Logo";
export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-pretty text-sm text-muted-foreground">
            A diagnostic travel planner for groups who&rsquo;d rather show up on day three with everything sorted.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>Itinerary intelligence</li>
            <li>Group budget split</li>
            <li>Climate-aware packing</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Press kit</li>
            <li>hello@traveloop.app</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 py-6 text-center text-xs text-muted-foreground">
        © 2026 Traveloop · Made for travelers, not tabs.
      </div>
    </footer>
  );
}
