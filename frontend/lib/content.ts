import { API_URL } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import type {
  ContentAssignment,
  LearningContent,
  LearningContentWithItems,
  StudentAssignment,
} from "@/types/content";

// Server-side reads only - see lib/classrooms.ts for why (needs next/headers).
// Client-side mutations live in lib/content-client.ts instead.

async function authHeaders(): Promise<HeadersInit> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  return { Authorization: `Bearer ${session.access_token}` };
}

export async function getMyContent(): Promise<LearningContent[]> {
  const res = await fetch(`${API_URL}/learning-content/mine`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch content: ${res.status}`);
  }
  return res.json() as Promise<LearningContent[]>;
}

export async function getContentDetail(id: string): Promise<LearningContentWithItems | null> {
  const res = await fetch(`${API_URL}/learning-content/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch content: ${res.status}`);
  }
  return res.json() as Promise<LearningContentWithItems>;
}

export async function getContentAssignments(contentId: string): Promise<ContentAssignment[]> {
  const res = await fetch(`${API_URL}/learning-content/${contentId}/assignments`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch assignments: ${res.status}`);
  }
  return res.json() as Promise<ContentAssignment[]>;
}

export async function getMyAssignments(): Promise<StudentAssignment[]> {
  const res = await fetch(`${API_URL}/assignments/mine`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch assignments: ${res.status}`);
  }
  return res.json() as Promise<StudentAssignment[]>;
}

export async function getAssignmentDetail(id: string): Promise<StudentAssignment | null> {
  const res = await fetch(`${API_URL}/assignments/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch assignment: ${res.status}`);
  }
  return res.json() as Promise<StudentAssignment>;
}
