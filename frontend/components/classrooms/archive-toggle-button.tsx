"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { setClassroomArchived } from "@/lib/classrooms-client";

export function ArchiveToggleButton({
  classroomId,
  isArchived,
}: {
  classroomId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    try {
      await setClassroomArchived(classroomId, !isArchived);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={isSubmitting}>
      {isArchived ? "Bỏ lưu trữ" : "Lưu trữ"}
    </Button>
  );
}
