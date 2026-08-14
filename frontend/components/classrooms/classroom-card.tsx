import { ArrowRight, School, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassroomListItem } from "@/types/classroom";

const GRADIENT_PRESETS = [
  "from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400",
  "from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  "from-amber-500/20 via-orange-500/20 to-rose-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400",
  "from-violet-500/20 via-purple-500/20 to-pink-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PRESETS.length;
  return GRADIENT_PRESETS[index];
}

export function ClassroomCard({ classroom }: { classroom: ClassroomListItem }) {
  const gradientClass = getGradient(classroom.name);

  return (
    <Link href={`/dashboard/classrooms/${classroom.id}`} className="group block h-full">
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        {/* Top gradient accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="pb-3">
          <CardTitle className="flex items-start justify-between gap-3 text-base">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br font-semibold shadow-xs ${gradientClass}`}
              >
                {classroom.name.charAt(0).toUpperCase() || <School className="size-5" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="line-clamp-1 font-semibold group-hover:text-primary transition-colors">
                  {classroom.name}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Lớp học
                </span>
              </div>
            </div>
            {classroom.is_archived ? (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Đã lưu trữ
              </Badge>
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-hover:bg-primary/10 group-hover:text-primary">
                <ArrowRight className="size-4" />
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {classroom.description && classroom.description.trim()
              ? classroom.description
              : "Chưa có mô tả cho lớp học này."}
          </p>

          <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 font-medium">
              <Users className="size-3.5 text-primary" />
              {classroom.students_count} học viên
            </span>

            <span className="text-[11px] text-muted-foreground/80 group-hover:text-primary transition-colors">
              Xem chi tiết &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

