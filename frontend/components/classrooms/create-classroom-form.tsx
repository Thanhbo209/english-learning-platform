"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClassroom } from "@/lib/classrooms-client";
import type { Classroom } from "@/types/classroom";

export function CreateClassroomForm({ onSuccess }: { onSuccess: (classroom: Classroom) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const classroom = await createClassroom({
        name,
        description: description || undefined,
      });
      onSuccess(classroom);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo lớp học");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Tên lớp học</Label>
        <Input
          id="name"
          required
          placeholder="VD: Tiếng Anh giao tiếp, buổi tối"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Mô tả (không bắt buộc)</Label>
        <Textarea
          id="description"
          placeholder="Nội dung, lịch học, đối tượng học viên…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting || !name.trim()}>
        {isSubmitting ? "Đang tạo…" : "Tạo lớp học"}
      </Button>
    </form>
  );
}
