"use client";

import { Plus, Trash2 } from "lucide-react";
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
        <div key={index} className="flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <Input
              placeholder="Câu hỏi"
              value={row.question_text}
              onChange={(event) => updateRow(index, { question_text: event.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Xóa câu hỏi"
              onClick={() => removeRow(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          {row.question_type === "multiple_choice" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(row.options ?? []).map((option, optionIndex) => (
                <Input
                  key={optionIndex}
                  placeholder={`Lựa chọn ${optionIndex + 1}`}
                  value={option}
                  onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                />
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`answer-${index}`}>Đáp án đúng</Label>
            <Input
              id={`answer-${index}`}
              value={row.correct_answer}
              onChange={(event) => updateRow(index, { correct_answer: event.target.value })}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="size-4" />
          Thêm câu hỏi
        </Button>
        <Button type="button" onClick={() => onSave(rows)} disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
