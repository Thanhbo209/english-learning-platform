import type { UserRole } from "@/types";

const DEFAULT_AVATAR_URLS: Partial<Record<UserRole, string>> = {
  teacher: "https://cdn-icons-png.flaticon.com/512/8815/8815077.png",
  student: "https://images.wuzzuf-data.net/files/company_logo/17557341666a69ba51dc8b8.png",
};

export function getDefaultAvatarUrl(role: UserRole | null | undefined): string | undefined {
  return role ? DEFAULT_AVATAR_URLS[role] : undefined;
}

export function getInitials(name: string | null | undefined, fallback: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    const combined = (first + last).toUpperCase();
    if (combined) return combined;
  }
  return fallback.slice(0, 2).toUpperCase();
}
