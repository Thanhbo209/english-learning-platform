import { ArrowRight, BookOpen, Calendar, Clock, ClipboardCheck, FileText } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ContentType, StudentAssignment } from "@/types/content";

type TypeConfig = {
  label: string;
  icon: typeof FileText;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
  labelColorClass: string;
};

const TYPE_CONFIG: Record<ContentType, TypeConfig> = {
  learning_document: {
    label: "Tài liệu học tập",
    icon: FileText,
    borderClass: "border-l-blue-500",
    iconBgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColorClass: "text-blue-600 dark:text-blue-400",
    labelColorClass: "text-blue-600 dark:text-blue-400",
  },
  exercise: {
    label: "Bài tập",
    icon: ClipboardCheck,
    borderClass: "border-l-emerald-500",
    iconBgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
    labelColorClass: "text-emerald-600 dark:text-emerald-400",
  },
  vocabulary: {
    label: "Từ vựng",
    icon: BookOpen,
    borderClass: "border-l-amber-500",
    iconBgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColorClass: "text-amber-600 dark:text-amber-400",
    labelColorClass: "text-amber-600 dark:text-amber-400",
  },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function StudentAssignmentCard({ assignment }: { assignment: StudentAssignment }) {
  const typeConfig = TYPE_CONFIG[assignment.content.type] ?? TYPE_CONFIG.learning_document;
  const Icon = typeConfig.icon;

  return (
    <Link href={`/dashboard/assignments/${assignment.assignment.id}`} className="group block h-full">
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border bg-card border-l-4 shadow-2xs",
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          typeConfig.borderClass,
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              typeConfig.iconBgClass,
              typeConfig.iconColorClass,
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {assignment.content.title}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                typeConfig.labelColorClass,
              )}
            >
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-1 flex-col justify-between gap-3 px-4 pb-4">
          {assignment.content.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {assignment.content.description}
            </p>
          ) : (
            <p className="text-xs italic text-muted-foreground/60">
              Bài học được giáo viên giao
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              <span>Giao: {formatDate(assignment.assignment.assigned_at)}</span>
            </span>

            {assignment.assignment.due_at ? (
              <span className="flex items-center gap-1.5 font-medium text-destructive">
                <Clock className="size-3" />
                <span>Hạn: {formatDate(assignment.assignment.due_at)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] transition-colors group-hover:text-primary">
                Vào học <ArrowRight className="size-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
