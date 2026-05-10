import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "./ProfileMenu";

export function TopNav({ variant = "marketing" }: { variant?: "marketing" | "app" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {variant === "marketing" ? (
            <>
              <a href="#features" className="text-muted-foreground hover:text-foreground">Why Traveloop</a>
              <Link to="/explore" className="text-muted-foreground hover:text-foreground">Cities</Link>
              <a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a>
            </>
          ) : (
            <>
              <Link to="/trips" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Trips</Link>
              <Link to="/explore" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Explore</Link>
              <Link to="/community" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Community</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {variant === "marketing" ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
              <Button asChild size="sm" className="rounded-full"><Link to="/trips">Open app</Link></Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="rounded-full"><Link to="/trips/new">+ New trip</Link></Button>
              <ProfileMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
