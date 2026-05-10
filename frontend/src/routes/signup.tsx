import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import authImg from "@/assets/auth-side.jpg";
import { Logo } from "@/components/traveloop/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Traveloop" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { signup, error, isLoading, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
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
      await signup(name, email, password);
      await navigate({ to: "/trips" });
    } catch {
      setFormError("Unable to create that account.");
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col p-10">
        <Logo />
        <div className="my-auto w-full max-w-lg">
          <h1 className="mt-6 font-display text-5xl leading-tight">
            Start your <em className="text-primary">first</em> trip.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create an account, get a JWT, and start writing real trip data to the backend.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-11 rounded-xl"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <Button type="submit" size="lg" className="h-11 rounded-xl" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            Already in?{" "}
            <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">© Traveloop 2026</div>
      </div>
      <div className="relative hidden overflow-hidden md:block">
        <img src={authImg} alt="Tuscan road at golden hour" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent" />
        <div className="absolute bottom-10 left-10 max-w-sm text-background">
          <div className="font-mono text-xs uppercase tracking-widest opacity-80">Connected flow</div>
          <p className="mt-2 font-display text-3xl italic">
            “Signup now persists a real user before opening the app.”
          </p>
        </div>
      </div>
    </div>
  );
}
