"use client";

import { AlertCircle, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VocabularyItemInput } from "@/lib/content-client";
import type { ValidationErrorItem, VocabularyItem } from "@/types/content";

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
  validationErrors,
  onSave,
  isSaving,
}: {
  items: VocabularyItem[];
  validationErrors?: ValidationErrorItem[] | null;
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

  function removeInvalidRows() {
    if (!validationErrors) return;
    const invalidIndices = new Set(
      validationErrors
        .filter((e) => e.severity !== "warning" && typeof e.row_index === "number")
        .map((e) => e.row_index! - 1)
    );
    setRows((prev) => prev.filter((_, i) => !invalidIndices.has(i)));
  }

  const invalidRowCount = validationErrors
    ? new Set(
        validationErrors
          .filter((e) => e.severity !== "warning" && typeof e.row_index === "number")
          .map((e) => e.row_index)
      ).size
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {invalidRowCount > 0 ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <span>Có {invalidRowCount} dòng bị lỗi không hợp lệ.</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeInvalidRows}
            className="h-7 text-xs"
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Xóa {invalidRowCount} dòng bị lỗi
          </Button>
        </div>
      ) : null}

      {rows.map((row, index) => {
        const rowIssues = (validationErrors ?? []).filter(
          (e) => e.row_index === index + 1 || e.location === `Row ${index + 1}`
        );
        const hasBlockingError = rowIssues.some((e) => e.severity !== "warning");
        const hasWarning = rowIssues.some((e) => e.severity === "warning");

        return (
          <div
            key={index}
            className={`relative flex flex-col gap-3 overflow-hidden rounded-lg border bg-card shadow-sm ${
              hasBlockingError
                ? "border-destructive/60 ring-1 ring-destructive/40"
                : hasWarning
                ? "border-amber-500/60"
                : ""
            }`}
          >
            {/* Header Band */}
            <div className="flex items-center justify-between border-b border-border bg-amber-50 px-3 py-2 border-l-4 border-l-amber-400 dark:bg-amber-950/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  #{index + 1}
                </span>
                {rowIssues.map((issue, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      issue.severity === "warning"
                        ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {issue.severity === "warning" ? (
                      <AlertTriangle className="size-3 shrink-0" />
                    ) : (
                      <AlertCircle className="size-3 shrink-0" />
                    )}
                    {issue.message}
                  </span>
                ))}
              </div>
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
        );
      })}

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
