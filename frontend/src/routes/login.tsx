import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import authImg from "@/assets/auth-side.jpg";
import { Logo } from "@/components/traveloop/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Traveloop" },
      { name: "description", content: "Sign in to your Traveloop account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login, error, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/trips" });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    try {
      await login(email, password);
      await navigate({ to: "/trips" });
    } catch {
      setFormError("Unable to sign in with those credentials.");
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col p-10">
        <Logo />
        <div className="my-auto max-w-sm">
          <h1 className="font-display text-5xl leading-tight">
            Welcome <em className="text-primary">back</em>.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to load your trips, budgets, and share links from the API.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 h-11 rounded-xl"
                required
              />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11 rounded-xl"
                required
              />
            </div>
            {(formError || error) && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                {formError || error}
              </div>
            )}
            <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
              Make an account
            </Link>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">© Traveloop 2026</div>
      </div>
      <div className="relative hidden overflow-hidden md:block">
        <img src={authImg} alt="Tuscan road at golden hour" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent" />
        <div className="absolute bottom-10 left-10 max-w-sm text-background">
          <div className="font-mono text-xs uppercase tracking-widest opacity-80">Live backend</div>
          <p className="mt-2 font-display text-3xl italic">
            “Your trips load from the API now, not the mock layer.”
          </p>
        </div>
      </div>
    </div>
  );
}
