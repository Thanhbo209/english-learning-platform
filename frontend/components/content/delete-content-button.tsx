"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteContent } from "@/lib/content-client";

export function DeleteContentButton({ contentId }: { contentId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!window.confirm("Xóa nội dung này? Hành động này không thể hoàn tác.")) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteContent(contentId);
      router.push("/dashboard/content");
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <Button type="button" variant="destructive" onClick={handleClick} disabled={isDeleting}>
      {isDeleting ? "Đang xóa…" : "Xóa nội dung"}
    </Button>
  );
}
