import { ArrowRight, BookOpen, ClipboardCheck, File, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FILE_TYPE_ICONS } from "@/lib/file-icons";
import { cn } from "@/lib/utils";
import type { ContentStatus, ContentType, LearningContent } from "@/types/content";

const TYPE_CONFIG: Record<
  ContentType,
  { label: string; icon: typeof FileText; color: string; bgGradient: string; borderClass: string }
> = {
  learning_document: {
    label: "Tài liệu học tập",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-500/20 to-indigo-500/20",
    borderClass: "border-blue-500/30",
  },
  exercise: {
    label: "Bài tập",
    icon: ClipboardCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-500/20 to-teal-500/20",
    borderClass: "border-emerald-500/30",
  },
  vocabulary: {
    label: "Từ vựng",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
    bgGradient: "from-amber-500/20 to-orange-500/20",
    borderClass: "border-amber-500/30",
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

  return (
    <Link href={`/dashboard/content/${content.id}`} className="group block h-full">
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        {/* Top accent gradient bar */}
        <div
          className={cn(
            "h-1.5 w-full bg-gradient-to-r transition-opacity opacity-80 group-hover:opacity-100",
            content.type === "learning_document" && "from-blue-600 via-indigo-600 to-violet-600",
            content.type === "exercise" && "from-emerald-500 via-teal-500 to-cyan-500",
            content.type === "vocabulary" && "from-amber-500 via-orange-500 to-rose-500",
          )}
        />

        <CardHeader className="pb-2">
          <CardTitle className="flex items-start justify-between gap-3 text-base">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br shadow-xs",
                  typeConfig.bgGradient,
                  typeConfig.borderClass,
                  typeConfig.color,
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="line-clamp-1 font-semibold group-hover:text-primary transition-colors">
                  {content.title}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {typeConfig.label}
                </span>
              </div>
            </div>

            <Badge
              variant={
                content.status === "published"
                  ? "default"
                  : content.status === "validation_failed" || content.status === "failed"
                    ? "destructive"
                    : "secondary"
              }
              className="shrink-0 text-xs"
            >
              {STATUS_LABELS[content.status] ?? content.status}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-2">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {content.description && content.description.trim()
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
              <span className="text-[11px] text-muted-foreground/60">Tài liệu nhập thủ công</span>
            )}

            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 group-hover:text-primary transition-colors">
              Chi tiết <ArrowRight className="size-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

