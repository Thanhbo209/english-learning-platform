"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function DocumentPreviewEditor({
  body,
  onSave,
  isSaving,
}: {
  body: string;
  onSave: (body: string) => void;
  isSaving: boolean;
}) {
  const [value, setValue] = useState(body);

  return (
    <div className="flex flex-col gap-3">
      <Textarea value={value} onChange={(event) => setValue(event.target.value)} rows={12} />
      <Button type="button" onClick={() => onSave(value)} disabled={isSaving} className="w-fit">
        {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </div>
  );
}
