"use client";

import { FolderOpen, Search } from "lucide-react";
import { useState } from "react";

import { ContentCard } from "@/components/content/content-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ContentType, LearningContent } from "@/types/content";

const TYPE_FILTERS: { value: ContentType | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "learning_document", label: "Tài liệu" },
  { value: "exercise", label: "Bài tập" },
  { value: "vocabulary", label: "Từ vựng" },
];

const STATUS_FILTERS: { value: "all" | "published" | "draft"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
];

export function ContentList({ content }: { content: LearningContent[] }) {
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = content.filter((item) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter === "published") {
      matchesStatus = item.status === "published";
    } else if (statusFilter === "draft") {
      matchesStatus = item.status !== "published";
    }

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          {/* Type Filters */}
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((option) => {
              const count =
                option.value === "all"
                  ? content.length
                  : content.filter((item) => item.type === option.value).length;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTypeFilter(option.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    typeFilter === option.value
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[11px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1">Trạng thái:</span>
            {STATUS_FILTERS.map((option) => {
              const count = content.filter((item) => {
                if (option.value === "all") return true;
                if (option.value === "published") return item.status === "published";
                return item.status !== "published";
              }).length;

              let activeClasses = "bg-primary text-primary-foreground shadow-xs";
              if (option.value === "published") {
                activeClasses = "bg-emerald-600 text-white shadow-xs dark:bg-emerald-700";
              } else if (option.value === "draft") {
                activeClasses = "bg-amber-500 text-white shadow-xs dark:bg-amber-600";
              }

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    statusFilter === option.value
                      ? activeClasses
                      : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{option.label}</span>
                  <span className={cn("rounded-full px-1.5 py-0.2 text-[11px]", 
                    statusFilter === option.value ? "bg-white/20" : "bg-muted-foreground/10"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        {content.length > 3 ? (
          <div className="relative min-w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm nội dung…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Không tìm thấy nội dung học tập</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác."
                : "Không có nội dung nào phù hợp với bộ lọc đã chọn."}
            </p>
          </div>
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
