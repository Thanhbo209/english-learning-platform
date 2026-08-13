"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { leaveClassroom } from "@/lib/classrooms-client";

export function LeaveClassroomButton({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    if (!window.confirm("Rời lớp học này? Bạn sẽ cần liên kết mời để tham gia lại.")) {
      return;
    }
    setIsLeaving(true);
    setError(null);
    try {
      await leaveClassroom(classroomId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể rời lớp học");
      setIsLeaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleLeave} disabled={isLeaving}>
        {isLeaving ? "Đang rời lớp…" : "Rời lớp"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
