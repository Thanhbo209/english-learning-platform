import { BookOpen, File, FileText, ListChecks } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FILE_TYPE_ICONS } from "@/lib/file-icons";
import { cn } from "@/lib/utils";
import type { ContentStatus, ContentType, LearningContent } from "@/types/content";

const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  learning_document: FileText,
  exercise: ListChecks,
  vocabulary: BookOpen,
};

const TYPE_LABELS: Record<ContentType, string> = {
  learning_document: "Tài liệu",
  exercise: "Bài tập",
  vocabulary: "Từ vựng",
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  ready_for_review: "Chờ xem lại",
  validation_failed: "Lỗi xác thực",
  published: "Đã xuất bản",
  failed: "Thất bại",
};

export function ContentCard({ content }: { content: LearningContent }) {
  const Icon = TYPE_ICONS[content.type];
  const fileType = content.source_format ? FILE_TYPE_ICONS[content.source_format] : null;
  const FileIcon = fileType?.icon ?? File;

  return (
    <Link href={`/dashboard/content/${content.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="line-clamp-1">{content.title}</span>
            </span>
            <Badge variant={content.status === "published" ? "default" : "secondary"}>
              {STATUS_LABELS[content.status]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>{TYPE_LABELS[content.type]}</span>
          {content.source_format ? (
            <>
              <span aria-hidden className="text-xs">
                •
              </span>
              <span className="inline-flex items-center gap-1">
                <FileIcon className={cn("size-3.5", fileType?.color ?? "text-muted-foreground")} />
                <span className="text-xs uppercase">.{content.source_format}</span>
              </span>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
