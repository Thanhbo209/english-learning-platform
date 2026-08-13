"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ImportContentForm } from "@/components/content/import-content-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LearningContent } from "@/types/content";

export function ImportContentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess(content: LearningContent) {
    setOpen(false);
    router.push(`/dashboard/content/${content.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Nhập nội dung</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nhập nội dung học tập</DialogTitle>
          <DialogDescription>
            Chọn loại nội dung và tải lên tệp. Bạn sẽ xem trước và chỉnh sửa trước khi xuất bản.
          </DialogDescription>
        </DialogHeader>
        <ImportContentForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
