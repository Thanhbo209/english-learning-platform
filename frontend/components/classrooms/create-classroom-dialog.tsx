"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateClassroomForm } from "@/components/classrooms/create-classroom-form";
import type { Classroom } from "@/types/classroom";

export function CreateClassroomDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess(classroom: Classroom) {
    setOpen(false);
    router.push(`/dashboard/classrooms/${classroom.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tạo lớp học</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo lớp học mới</DialogTitle>
          <DialogDescription>
            Đặt tên cho lớp học của bạn. Bạn sẽ nhận được một liên kết để mời học viên.
          </DialogDescription>
        </DialogHeader>
        <CreateClassroomForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
