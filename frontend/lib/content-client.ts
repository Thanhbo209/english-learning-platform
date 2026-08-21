import { createClient } from "@/lib/supabase/client";
import type {
  ColumnMappingSuggestion,
  ContentAssignment,
  ContentType,
  LearningContent,
  LearningContentWithItems,
  QuestionType,
} from "@/types/content";

// Client-side mutations only - see lib/classrooms-client.ts for why.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  return { Authorization: `Bearer ${session.access_token}` };
}

async function parseOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(typeof body?.detail === "string" ? body.detail : fallbackMessage);
  }
  return res.json() as Promise<T>;
}

export async function detectStructure(input: {
  contentType: ContentType;
  file: File;
}): Promise<ColumnMappingSuggestion> {
  const formData = new FormData();
  formData.append("content_type", input.contentType);
  formData.append("file", input.file);

  const res = await fetch(`${API_URL}/learning-content/detect-structure`, {
    method: "POST",
    headers: await authHeaders(),
    body: formData,
  });
  return parseOrThrow<ColumnMappingSuggestion>(res, "Failed to detect file structure");
}

export async function importContent(input: {
  contentType: ContentType;
  title: string;
  description?: string;
  file: File;
  columnMapping?: Record<string, unknown>;
}): Promise<LearningContent> {
  const formData = new FormData();
  formData.append("content_type", input.contentType);
  formData.append("title", input.title);
  if (input.description) {
    formData.append("description", input.description);
  }
  if (input.columnMapping) {
    formData.append("column_mapping", JSON.stringify(input.columnMapping));
  }
  formData.append("file", input.file);

  const res = await fetch(`${API_URL}/learning-content/import`, {
    method: "POST",
    headers: await authHeaders(),
    body: formData,
  });
  return parseOrThrow<LearningContent>(res, "Failed to import content");
}


export type VocabularyItemInput = {
  word: string;
  definition: string;
  translation?: string | null;
  example?: string | null;
};

export type ExerciseQuestionInput = {
  question_text: string;
  question_type: QuestionType;
  options?: string[] | null;
  correct_answer: string;
};

export async function updateContent(
  id: string,
  input: {
    title?: string;
    description?: string;
    document_body?: string;
    vocabulary_items?: VocabularyItemInput[];
    questions?: ExerciseQuestionInput[];
  },
): Promise<LearningContentWithItems> {
  const res = await fetch(`${API_URL}/learning-content/${id}`, {
    method: "PATCH",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow<LearningContentWithItems>(res, "Failed to update content");
}

export async function publishContent(id: string): Promise<LearningContent> {
  const res = await fetch(`${API_URL}/learning-content/${id}/publish`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseOrThrow<LearningContent>(res, "Failed to publish content");
}

export async function deleteContent(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/learning-content/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete content");
  }
}

export async function createAssignment(
  contentId: string,
  input: { classroomId: string; dueAt?: string | null },
): Promise<ContentAssignment> {
  const res = await fetch(`${API_URL}/learning-content/${contentId}/assignments`, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify({ classroom_id: input.classroomId, due_at: input.dueAt ?? null }),
  });
  return parseOrThrow<ContentAssignment>(res, "Failed to assign to classroom");
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/assignments/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to remove assignment");
  }
}
