import { ArrowRight, GraduationCap, Mail, Users } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { EnrolledStudent } from "@/types/classroom";

export type StudentOverviewItem = EnrolledStudent & {
  classroom_name?: string;
  classroom_id?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function StudentListOverview({
  students,
  totalStudentsCount,
}: {
  students: StudentOverviewItem[];
  totalStudentsCount: number;
}) {
  const displayedStudents = students.slice(0, 5);

  return (
    <Card className="flex flex-col border-border/70 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight">
            <GraduationCap className="size-5 text-primary" />
            <span>Học sinh gần đây</span>
          </CardTitle>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {totalStudentsCount}
          </span>
        </div>

        <Link
          href="/dashboard/classrooms"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <span>Quản lý lớp</span>
          <ArrowRight className="size-3.5 shrink-0" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {displayedStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">Chưa có học sinh nào</p>
            <p className="max-w-xs text-[11px] text-muted-foreground">
              Học sinh tham gia lớp bằng mã chia sẻ sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {displayedStudents.map((student) => {
              const displayName = student.full_name || student.email?.split("@")[0] || "Học sinh";
              const initials = getInitials(displayName);

              return (
                <div
                  key={`${student.student_id}-${student.classroom_id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-9 border border-primary/20 bg-primary/10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-xs font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {displayName}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Mail className="size-3 shrink-0" />
                        <span className="truncate">{student.email || "Chưa cập nhật email"}</span>
                      </div>
                    </div>
                  </div>

                  {student.classroom_name ? (
                    <Badge variant="secondary" className="shrink-0 text-[11px] max-w-[120px] truncate">
                      {student.classroom_name}
                    </Badge>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
