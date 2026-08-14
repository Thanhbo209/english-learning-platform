import { API_URL } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import type {
  Classroom,
  ClassroomInvitePreview,
  ClassroomListItem,
  ClassroomWithStudents,
} from "@/types/classroom";
import type { ClassroomAssignmentItem } from "@/types/content";


// Server-side reads only (uses the Supabase server client, which needs
// next/headers) - call these from Server Components, not Client Components.
// Client-side mutations live in lib/classrooms-client.ts instead.

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

export async function getMyClassrooms(): Promise<ClassroomListItem[]> {
  const res = await fetch(`${API_URL}/classrooms/mine`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch classrooms: ${res.status}`);
  }
  return res.json() as Promise<ClassroomListItem[]>;
}

export async function getEnrolledClassrooms(): Promise<Classroom[]> {
  const res = await fetch(`${API_URL}/classrooms/enrolled`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch enrolled classrooms: ${res.status}`);
  }
  return res.json() as Promise<Classroom[]>;
}

export async function getClassroomDetail(id: string): Promise<ClassroomWithStudents | null> {
  const res = await fetch(`${API_URL}/classrooms/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch classroom: ${res.status}`);
  }
  return res.json() as Promise<ClassroomWithStudents>;
}

export async function getInvitePreview(token: string): Promise<ClassroomInvitePreview | null> {
  const res = await fetch(`${API_URL}/classrooms/invite/${token}`, { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch invite: ${res.status}`);
  }
  return res.json() as Promise<ClassroomInvitePreview>;
}

export async function getClassroomAssignments(
  classroomId: string,
): Promise<ClassroomAssignmentItem[]> {
  const res = await fetch(`${API_URL}/classrooms/${classroomId}/assignments`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 403) {
    return [];
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch classroom assignments: ${res.status}`);
  }
  return res.json() as Promise<ClassroomAssignmentItem[]>;
}

