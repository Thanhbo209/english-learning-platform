"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExerciseQuestionInput } from "@/lib/content-client";
import type { ExerciseQuestion } from "@/types/content";

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
  onSave,
  isSaving,
}: {
  questions: ExerciseQuestion[];
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

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => (
        <div key={index} className="relative flex flex-col gap-3 overflow-hidden rounded-lg border bg-card shadow-sm">
          {/* Header Band */}
          <div className="flex items-center justify-between border-b border-border bg-emerald-50 px-3 py-2 border-l-4 border-l-emerald-400 dark:bg-emerald-950/20">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Câu #{index + 1}
            </span>
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
      ))}
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
