"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateClassroom } from "@/lib/classrooms-client";
import type { Classroom } from "@/types/classroom";

export function EditClassroomForm({
  classroomId,
  initialName,
  initialDescription,
  onSuccess,
}: {
  classroomId: string;
  initialName: string;
  initialDescription: string | null;
  onSuccess: (classroom: Classroom) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const classroom = await updateClassroom(classroomId, { name, description });
      onSuccess(classroom);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật lớp học");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-name">Tên lớp học</Label>
        <Input
          id="edit-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-description">Mô tả</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting || !name.trim()} className="w-fit">
        {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
