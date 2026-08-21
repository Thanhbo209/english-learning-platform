import { ArrowRight, BookOpen, ClipboardCheck, File, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FILE_TYPE_ICONS } from "@/lib/file-icons";
import { cn } from "@/lib/utils";
import type { ContentStatus, ContentType, LearningContent } from "@/types/content";

type TypeConfig = {
  label: string;
  icon: typeof FileText;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
};

const TYPE_CONFIG: Record<ContentType, TypeConfig> = {
  learning_document: {
    label: "Tài liệu học tập",
    icon: FileText,
    borderClass: "border-l-blue-500",
    iconBgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColorClass: "text-blue-600 dark:text-blue-400",
  },
  exercise: {
    label: "Bài tập",
    icon: ClipboardCheck,
    borderClass: "border-l-emerald-500",
    iconBgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
  },
  vocabulary: {
    label: "Từ vựng",
    icon: BookOpen,
    borderClass: "border-l-amber-500",
    iconBgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColorClass: "text-amber-600 dark:text-amber-400",
  },
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  ready_for_review: "Chờ xem lại",
  validation_failed: "Lỗi xác thực",
  published: "Đã xuất bản",
  failed: "Thất bại",
};

export function ContentCard({ content }: { content: LearningContent }) {
  const typeConfig = TYPE_CONFIG[content.type] ?? TYPE_CONFIG.learning_document;
  const Icon = typeConfig.icon;

  const fileType = content.source_format ? FILE_TYPE_ICONS[content.source_format] : null;
  const FileIcon = fileType?.icon ?? File;

  const isPublished = content.status === "published";
  const isError =
    content.status === "validation_failed" || content.status === "failed";

  return (
    <Link href={`/dashboard/content/${content.id}`} className="group block h-full">
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
              {content.title}
            </span>
            <span className={cn("text-[11px] font-medium uppercase tracking-wider", typeConfig.iconColorClass)}>
              {typeConfig.label}
            </span>
          </div>

          <Badge
            variant={
              isPublished ? "default" : isError ? "destructive" : "secondary"
            }
            className="shrink-0 text-[10px] px-2"
          >
            {STATUS_LABELS[content.status] ?? content.status}
          </Badge>
        </div>

        {/* Description */}
        <div className="flex flex-1 flex-col justify-between gap-3 px-4 pb-4">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {content.description?.trim()
              ? content.description
              : "Chưa có mô tả cho nội dung này."}
          </p>

          <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            {content.source_format ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 font-medium">
                <FileIcon className={cn("size-3.5", fileType?.color ?? "text-muted-foreground")} />
                <span className="uppercase text-[11px] font-semibold">{content.source_format}</span>
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">Thủ công</span>
            )}

            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 transition-colors group-hover:text-primary">
              Chi tiết <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
