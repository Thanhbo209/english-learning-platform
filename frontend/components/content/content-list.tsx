"use client";

import { useState } from "react";

import { ContentCard } from "@/components/content/content-card";
import { cn } from "@/lib/utils";
import type { ContentType, LearningContent } from "@/types/content";

const FILTERS: { value: ContentType | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "learning_document", label: "Tài liệu" },
  { value: "exercise", label: "Bài tập" },
  { value: "vocabulary", label: "Từ vựng" },
];

export function ContentList({ content }: { content: LearningContent[] }) {
  const [filter, setFilter] = useState<ContentType | "all">("all");
  const filtered = filter === "all" ? content : content.filter((item) => item.type === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">Không có nội dung phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      )}
    </div>
  );
}
