"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditClassroomForm } from "@/components/classrooms/edit-classroom-form";

export function EditClassroomDialog({
  classroomId,
  initialName,
  initialDescription,
}: {
  classroomId: string;
  initialName: string;
  initialDescription: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Chỉnh sửa</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
        </DialogHeader>
        <EditClassroomForm
          classroomId={classroomId}
          initialName={initialName}
          initialDescription={initialDescription}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
