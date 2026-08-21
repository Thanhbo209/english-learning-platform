"use client";

import {
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const mainNav: NavItem[] = [
  { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lớp học", href: "/dashboard/classrooms", icon: Users },
  { label: "Nội dung học tập", href: "/dashboard/content", icon: BookOpen },
  {
    label: "Bài kiểm tra",
    href: "/dashboard/tests",
    icon: ClipboardCheck,
    disabled: true,
  },
  {
    label: "Tiến độ của tôi",
    href: "/dashboard/progress",
    icon: LineChart,
    disabled: true,
  },
];

const settingsNav: NavItem[] = [
  {
    label: "Hồ sơ",
    href: "/dashboard/profile",
    icon: UserRound,
    disabled: true,
  },
  {
    label: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
    disabled: true,
  },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        title="Sắp ra mắt"
        className="flex items-center justify-center gap-4 rounded-lg px-3 py-4 text-sm font-medium text-muted-foreground/50 transition-all md:justify-start"
      >
        <Icon className="size-4 shrink-0" />
        <span className="hidden md:inline">{item.label}</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-center gap-4 rounded-lg px-3 py-4 text-sm font-medium transition-all md:justify-start",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/70 hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="hidden md:inline">{item.label}</span>
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r bg-card px-2 py-6 md:w-64 md:px-4">
      <div className="flex items-center justify-center gap-3 px-1 md:justify-start md:px-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 font-bold text-primary-foreground shadow-sm">
          EE
        </div>
        <span className="hidden text-lg font-bold tracking-tight text-foreground md:inline">
          English<span className="text-primary">Everyday</span>
        </span>
      </div>

      <nav className="mt-8 flex min-h-0 flex-1 flex-col justify-between gap-6 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <p className="hidden px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:block">
            Trang chủ
          </p>
          {mainNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-2 border-t pt-4">
            <p className="hidden px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:block mb-2">
              Cài đặt
            </p>
            {settingsNav.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(pathname, item.href)}
              />
            ))}
          </div>
          <div className="mt-auto pb-2 flex flex-col gap-2">
            <form action="/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-4 rounded-lg px-3 py-4 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground md:justify-start"
              >
                <LogOut className="size-4 shrink-0" />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </form>
          </div>
        </div>
      </nav>
    </aside>
  );
}
