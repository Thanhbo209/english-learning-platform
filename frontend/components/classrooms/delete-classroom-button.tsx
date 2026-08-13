"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteClassroom } from "@/lib/classrooms-client";

export function DeleteClassroomButton({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!window.confirm("Xóa lớp học này? Hành động này không thể hoàn tác.")) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteClassroom(classroomId);
      router.push("/dashboard/classrooms");
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <Button type="button" variant="destructive" onClick={handleClick} disabled={isDeleting}>
      {isDeleting ? "Đang xóa…" : "Xóa lớp học"}
    </Button>
  );
}
