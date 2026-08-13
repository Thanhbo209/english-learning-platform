import { Bell } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CurrentUser } from "@/types";

function initials(user: CurrentUser): string {
  return (user.email ?? user.id).slice(0, 2).toUpperCase();
}

export function DashboardTopbar({ user }: { user: CurrentUser }) {
  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-4">
      <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4" />
        </button>

        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>{initials(user)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm leading-tight font-medium">{user.email ?? user.id}</p>
            <p className="text-xs leading-tight text-muted-foreground capitalize">
              {user.role ?? "unassigned"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
