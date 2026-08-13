import { createClient } from "@/lib/supabase/client";
import type { Classroom } from "@/types/classroom";

// Client-side mutations only - safe to import from "use client" components.
// Server-side reads live in lib/classrooms.ts instead.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

async function parseOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? fallbackMessage);
  }
  return res.json() as Promise<T>;
}

export async function createClassroom(input: {
  name: string;
  description?: string;
}): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classrooms`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return parseOrThrow<Classroom>(res, "Failed to create classroom");
}

export async function updateClassroom(
  id: string,
  input: { name?: string; description?: string },
): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classrooms/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return parseOrThrow<Classroom>(res, "Failed to update classroom");
}

export async function setClassroomArchived(id: string, archived: boolean): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classrooms/${id}/${archived ? "archive" : "unarchive"}`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseOrThrow<Classroom>(res, "Failed to update classroom");
}

export async function deleteClassroom(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/classrooms/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete classroom");
  }
}

export async function rotateJoinToken(id: string): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classrooms/${id}/rotate-token`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseOrThrow<Classroom>(res, "Failed to rotate join link");
}

export async function joinClassroom(token: string): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classrooms/invite/${token}/join`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseOrThrow<Classroom>(res, "Failed to join classroom");
}

export async function leaveClassroom(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/classrooms/${id}/leave`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to leave classroom");
  }
}
