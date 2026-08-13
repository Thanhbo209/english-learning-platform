"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VocabularyItemInput } from "@/lib/content-client";
import type { VocabularyItem } from "@/types/content";

function toRows(items: VocabularyItem[]): VocabularyItemInput[] {
  return items.map((item) => ({
    word: item.word,
    definition: item.definition,
    translation: item.translation,
    example: item.example,
  }));
}

export function VocabularyPreviewEditor({
  items,
  onSave,
  isSaving,
}: {
  items: VocabularyItem[];
  onSave: (rows: VocabularyItemInput[]) => void;
  isSaving: boolean;
}) {
  const [rows, setRows] = useState<VocabularyItemInput[]>(() => toRows(items));

  function updateRow(index: number, patch: Partial<VocabularyItemInput>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [...prev, { word: "", definition: "", translation: "", example: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <Input
            placeholder="Từ"
            value={row.word}
            onChange={(event) => updateRow(index, { word: event.target.value })}
          />
          <Input
            placeholder="Định nghĩa"
            value={row.definition}
            onChange={(event) => updateRow(index, { definition: event.target.value })}
          />
          <Input
            placeholder="Bản dịch"
            value={row.translation ?? ""}
            onChange={(event) => updateRow(index, { translation: event.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Xóa từ"
            onClick={() => removeRow(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="size-4" />
          Thêm từ
        </Button>
        <Button type="button" onClick={() => onSave(rows)} disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
