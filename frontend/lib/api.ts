import { createClient } from "@/lib/supabase/server";
import type { ApiHealthResponse, CurrentUser } from "@/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getApiHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) {
    throw new Error(`API health check failed: ${res.status}`);
  }
  return res.json() as Promise<ApiHealthResponse>;
}

// Reads the session via the Supabase server client, so this only works
// from Server Components, Server Actions, or Route Handlers.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch current user: ${res.status}`);
  }

  return res.json() as Promise<CurrentUser>;
}
