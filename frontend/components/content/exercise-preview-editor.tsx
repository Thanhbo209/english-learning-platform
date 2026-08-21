"use client";

import { AlertCircle, AlertTriangle, Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExerciseQuestionInput } from "@/lib/content-client";
import type { ExerciseQuestion, ValidationErrorItem } from "@/types/content";

function toRows(questions: ExerciseQuestion[]): ExerciseQuestionInput[] {
  return questions.map((question) => ({
    question_text: question.question_text,
    question_type: question.question_type,
    options: question.options,
    correct_answer: question.correct_answer,
  }));
}

export function ExercisePreviewEditor({
  questions,
  validationErrors,
  onSave,
  isSaving,
}: {
  questions: ExerciseQuestion[];
  validationErrors?: ValidationErrorItem[] | null;
  onSave: (rows: ExerciseQuestionInput[]) => void;
  isSaving: boolean;
}) {
  const [rows, setRows] = useState<ExerciseQuestionInput[]>(() => toRows(questions));

  function updateRow(index: number, patch: Partial<ExerciseQuestionInput>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function updateOption(rowIndex: number, optionIndex: number, value: string) {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;
        const options = [...(row.options ?? [])];
        options[optionIndex] = value;
        return { ...row, options };
      }),
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { question_text: "", question_type: "multiple_choice", options: ["", ""], correct_answer: "" },
    ]);
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
          <span>Có {invalidRowCount} câu hỏi bị lỗi không hợp lệ.</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeInvalidRows}
            className="h-7 text-xs"
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Xóa {invalidRowCount} câu bị lỗi
          </Button>
        </div>
      ) : null}

      {rows.map((row, index) => {
        const rowIssues = (validationErrors ?? []).filter(
          (e) => e.row_index === index + 1 || e.location === `Question ${index + 1}`
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
            <div className="flex items-center justify-between border-b border-border bg-emerald-50 px-3 py-2 border-l-4 border-l-emerald-400 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Câu #{index + 1}
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
                aria-label="Xóa câu hỏi"
                onClick={() => removeRow(index)}
                className="size-7 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-3 pt-1">
              <Input
                placeholder="Nội dung câu hỏi"
                value={row.question_text}
                onChange={(event) => updateRow(index, { question_text: event.target.value })}
                className="text-lg font-medium placeholder:font-medium placeholder:text-muted-foreground/70"
              />

              {row.question_type === "multiple_choice" ? (
                <div className="flex flex-col gap-2">
                  {(row.options ?? []).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-medium text-muted-foreground">
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <Input
                        placeholder={`Lựa chọn ${String.fromCharCode(65 + optionIndex)}`}
                        value={option}
                        onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5 mt-2">
                <Label htmlFor={`answer-${index}`} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-medium">
                  <Check className="size-4" />
                  Đáp án đúng
                </Label>
                <Input
                  id={`answer-${index}`}
                  value={row.correct_answer}
                  onChange={(event) => updateRow(index, { correct_answer: event.target.value })}
                  className="border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-900"
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between mt-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-2 size-4" />
          Thêm câu hỏi
        </Button>
        <Button type="button" onClick={() => onSave(rows)} disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
