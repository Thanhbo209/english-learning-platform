"use client";

import { BookOpen, Calendar, Clock, ClipboardCheck, FileText, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ClassroomAssignmentItem, ContentStatus, ContentType } from "@/types/content";

const TYPE_CONFIG: Record<
  ContentType,
  { label: string; icon: typeof FileText; color: string; badgeClass: string }
> = {
  learning_document: {
    label: "Tài liệu học tập",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  },
  exercise: {
    label: "Bài tập",
    icon: ClipboardCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  vocabulary: {
    label: "Từ vựng",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  ready_for_review: "Chờ xem lại",
  validation_failed: "Lỗi xác thực",
  published: "Đã xuất bản",
  failed: "Thất bại",
};

const FILTERS: { value: ContentType | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "learning_document", label: "Tài liệu" },
  { value: "exercise", label: "Bài tập" },
  { value: "vocabulary", label: "Từ vựng" },
];

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function ClassroomContentList({
  assignments,
}: {
  assignments: ClassroomAssignmentItem[];
}) {
  const [filter, setFilter] = useState<ContentType | "all">("all");

  const filtered =
    filter === "all" ? assignments : assignments.filter((item) => item.content.type === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">Nội dung học tập đã giao</h3>
        {assignments.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                  filter === option.value
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <FolderOpen className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">Chưa có nội dung nào được giao</p>
          <p className="text-xs text-muted-foreground">
            {assignments.length === 0
              ? "Nội dung bài học, bài tập hoặc từ vựng được giao cho lớp này sẽ xuất hiện ở đây."
              : "Không có nội dung nào phù hợp với bộ lọc hiện tại."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map(({ assignment, content }) => {
            const typeConfig = TYPE_CONFIG[content.type] ?? TYPE_CONFIG.learning_document;
            const Icon = typeConfig.icon;

            return (
              <Link key={assignment.id} href={`/dashboard/content/${content.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start justify-between gap-2 text-sm font-semibold">
                      <span className="flex items-center gap-2 line-clamp-1">
                        <Icon className={cn("size-4 shrink-0", typeConfig.color)} />
                        <span className="line-clamp-1">{content.title}</span>
                      </span>
                      <Badge variant={content.status === "published" ? "default" : "secondary"}>
                        {STATUS_LABELS[content.status] ?? content.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
                    {content.description ? (
                      <p className="line-clamp-2 text-xs">{content.description}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 mt-auto">
                      <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium", typeConfig.badgeClass)}>
                        {typeConfig.label}
                      </span>

                      <div className="flex flex-col items-end gap-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>Giao: {formatDate(assignment.assigned_at)}</span>
                        </span>
                        {assignment.due_at ? (
                          <span className="flex items-center gap-1 text-destructive font-medium">
                            <Clock className="size-3" />
                            <span>Hạn: {formatDate(assignment.due_at)}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/70">Không có hạn nộp</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
