import { Bell } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDefaultAvatarUrl, getInitials } from "@/lib/avatars";
import type { CurrentUser } from "@/types";

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Học viên",
};

export function DashboardTopbar({ user }: { user: CurrentUser }) {
  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-4">
      <h1 className="text-lg font-semibold tracking-tight">Chào mừng trở lại</h1>

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
            <AvatarImage src={getDefaultAvatarUrl(user.role)} alt="" />
            <AvatarFallback>{getInitials(user.full_name, user.email ?? user.id)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm leading-tight font-medium">
              {user.full_name ?? user.email ?? user.id}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              {(user.role && roleLabels[user.role]) ?? "Chưa phân quyền"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
