"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createAssignment } from "@/lib/content-client";
import type { ClassroomListItem } from "@/types/classroom";

export function AssignContentDialog({
  contentId,
  classrooms,
}: {
  contentId: string;
  classrooms: ClassroomListItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [classroomId, setClassroomId] = useState(classrooms[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssign() {
    if (!classroomId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createAssignment(contentId, { classroomId });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể giao bài");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Giao cho lớp học</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giao nội dung cho lớp học</DialogTitle>
          <DialogDescription>Chọn một lớp học để giao nội dung này.</DialogDescription>
        </DialogHeader>
        {classrooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa có lớp học nào.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="classroom-select">Lớp học</Label>
            <select
              id="classroom-select"
              value={classroomId}
              onChange={(event) => setClassroomId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button onClick={handleAssign} disabled={isSubmitting || !classroomId}>
            {isSubmitting ? "Đang giao…" : "Giao bài"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
