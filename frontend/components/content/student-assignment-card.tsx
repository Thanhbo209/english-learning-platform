import { ArrowRight, BookOpen, Calendar, Clock, ClipboardCheck, FileText } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ContentType, StudentAssignment } from "@/types/content";

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
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        {/* Top gradient accent line */}
        <div
          className={cn(
            "h-1.5 w-full bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity",
            assignment.content.type === "learning_document" && "from-blue-600 via-indigo-600 to-violet-600",
            assignment.content.type === "exercise" && "from-emerald-500 via-teal-500 to-cyan-500",
            assignment.content.type === "vocabulary" && "from-amber-500 via-orange-500 to-rose-500",
          )}
        />

        <CardHeader className="pb-2">
          <CardTitle className="flex items-start gap-3 text-base">
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
                {assignment.content.title}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {typeConfig.label}
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-2 text-xs text-muted-foreground">
          {assignment.content.description ? (
            <p className="line-clamp-2 leading-relaxed">{assignment.content.description}</p>
          ) : (
            <p className="italic text-muted-foreground/70">Bài học được giáo viên giao</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 mt-auto">
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground" />
              <span>Giao: {formatDate(assignment.assignment.assigned_at)}</span>
            </span>

            {assignment.assignment.due_at ? (
              <span className="flex items-center gap-1 text-destructive font-medium">
                <Clock className="size-3" />
                <span>Hạn: {formatDate(assignment.assignment.due_at)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                Vào học <ArrowRight className="size-3" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

