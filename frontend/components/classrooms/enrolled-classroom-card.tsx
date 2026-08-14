import { GraduationCap, School } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Classroom } from "@/types/classroom";

import { LeaveClassroomButton } from "./leave-classroom-button";

export function EnrolledClassroomCard({ classroom }: { classroom: Classroom }) {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-3 text-base">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 font-semibold text-emerald-600 dark:text-emerald-400">
              {classroom.name.charAt(0).toUpperCase() || <School className="size-5" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="line-clamp-1 font-semibold">{classroom.name}</span>
              <span className="text-xs font-normal text-muted-foreground">Lớp học đã tham gia</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 border-emerald-500/30 bg-emerald-50 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-300">
            <GraduationCap className="mr-1 size-3" />
            Học viên
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-0 text-xs text-muted-foreground">
        <p className="line-clamp-2 leading-relaxed">
          {classroom.description && classroom.description.trim()
            ? classroom.description
            : "Chưa có mô tả cho lớp học này."}
        </p>
      </CardContent>

      <CardFooter className="justify-end border-t pt-3 pb-3">
        <LeaveClassroomButton classroomId={classroom.id} />
      </CardFooter>
    </Card>
  );
}

