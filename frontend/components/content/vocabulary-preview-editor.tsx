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
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => (
        <div
          key={index}
          className="relative flex flex-col gap-3 overflow-hidden rounded-lg border bg-card shadow-sm"
        >
          {/* Header Band */}
          <div className="flex items-center justify-between border-b border-border bg-amber-50 px-3 py-2 border-l-4 border-l-amber-400 dark:bg-amber-950/20">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              #{index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Xóa từ"
              onClick={() => removeRow(index)}
              className="size-7 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-300"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-3 p-3 pt-1">
            <Input
              placeholder="Từ tiếng Anh"
              value={row.word}
              onChange={(event) => updateRow(index, { word: event.target.value })}
              className="text-lg font-medium placeholder:font-medium placeholder:text-muted-foreground/70"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </div>
            <Input
              placeholder="Ví dụ: The student studied hard."
              value={row.example ?? ""}
              onChange={(event) => updateRow(index, { example: event.target.value })}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between mt-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-2 size-4" />
          Thêm từ
        </Button>
        <Button type="button" onClick={() => onSave(rows)} disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
