"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DocumentPreviewEditor } from "@/components/content/document-preview-editor";
import { ExercisePreviewEditor } from "@/components/content/exercise-preview-editor";
import { VocabularyPreviewEditor } from "@/components/content/vocabulary-preview-editor";
import type { ExerciseQuestionInput, VocabularyItemInput } from "@/lib/content-client";
import { publishContent, updateContent } from "@/lib/content-client";
import type { LearningContentWithItems } from "@/types/content";

export function ContentEditor({ content }: { content: LearningContentWithItems }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveVocabulary(rows: VocabularyItemInput[]) {
    setIsSaving(true);
    setError(null);
    try {
      await updateContent(content.id, { vocabulary_items: rows });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveExercise(rows: ExerciseQuestionInput[]) {
    setIsSaving(true);
    setError(null);
    try {
      await updateContent(content.id, { questions: rows });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveDocument(body: string) {
    setIsSaving(true);
    setError(null);
    try {
      await updateContent(content.id, { document_body: body });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    setIsPublishing(true);
    setError(null);
    try {
      await publishContent(content.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xuất bản");
      setIsPublishing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {content.type === "vocabulary" ? (
        <VocabularyPreviewEditor
          items={content.vocabulary_items}
          onSave={handleSaveVocabulary}
          isSaving={isSaving}
        />
      ) : null}
      {content.type === "exercise" ? (
        <ExercisePreviewEditor
          questions={content.questions}
          onSave={handleSaveExercise}
          isSaving={isSaving}
        />
      ) : null}
      {content.type === "learning_document" ? (
        <DocumentPreviewEditor
          body={content.document_body ?? ""}
          onSave={handleSaveDocument}
          isSaving={isSaving}
        />
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {content.status === "ready_for_review" ? (
        <Button onClick={handlePublish} disabled={isPublishing} className="w-fit">
          {isPublishing ? "Đang xuất bản…" : "Xuất bản"}
        </Button>
      ) : null}
    </div>
  );
}
