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
        className="flex items-center justify-center gap-3 rounded-lg px-3 py-3.5 text-sm text-muted-foreground/50 md:justify-start"
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
        "flex items-center justify-center gap-5 rounded-lg px-3 py-3.5 text-sm font-medium transition-colors md:justify-start",
        active
          ? "bg-primary/10 text-primary"
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
    <aside className="flex w-16 shrink-0 flex-col border-r bg-card px-2 py-6 md:w-64 md:px-4">
      <div className="px-1 text-center text-lg font-semibold tracking-tight text-primary md:px-2 md:text-left">
        <span className="md:hidden">EE</span>
        <span className="hidden md:inline">EnglishEveryday</span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col justify-between gap-6">
        <div className="flex flex-col gap-3">
          <p className="hidden px-3 text-xs font-medium uppercase text-muted-foreground md:block">
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
          <p className="hidden px-3 text-xs font-medium uppercase text-muted-foreground md:block">
            Cài đặt
          </p>
          {settingsNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
          <form action="/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground md:justify-start"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
