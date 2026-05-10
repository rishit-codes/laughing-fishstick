import { Link, useNavigate } from "@tanstack/react-router";
import { User, Settings, Languages, History, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

const items = [
  { label: "Your profile", to: "/profile", icon: User },
  { label: "Settings", to: "/profile", icon: Settings },
  { label: "Language", to: "/profile", icon: Languages },
  { label: "History", to: "/profile", icon: History },
  { label: "Admin panel", to: "/admin", icon: Shield },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const avatar = user ? initials(user.name) : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold ring-1 ring-border/60 transition hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span aria-hidden>{avatar}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-2xl border border-border/70 bg-popover p-2 shadow-[0_24px_48px_-24px_oklch(0.18_0.01_60/0.35)]"
      >
        <DropdownMenuLabel className="px-2 pt-1 pb-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {avatar}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {user?.name ?? "Traveler"}
              </div>
              <div className="truncate text-xs font-normal text-muted-foreground">
                {user?.email ?? "Not signed in"}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it) => (
          <DropdownMenuItem key={it.label} asChild className="rounded-lg px-2 py-2 text-sm focus:bg-accent">
            <Link to={it.to} className="flex items-center gap-3">
              <it.icon className="h-4 w-4 text-muted-foreground" />
              <span>{it.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg px-2 py-2 text-sm text-alert focus:bg-alert/10 focus:text-alert"
          onSelect={(event) => {
            event.preventDefault();
            logout();
            navigate({ to: "/login" });
          }}
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
