import { Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultAvatarUrl } from "@/lib/avatars";
import type { EnrolledStudent } from "@/types/classroom";

function initials(student: EnrolledStudent): string {
  return (student.email ?? student.student_id).slice(0, 2).toUpperCase();
}

export function StudentRoster({ students }: { students: EnrolledStudent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          Học viên ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có học viên nào tham gia.</p>
        ) : (
          students.map((student) => (
            <div key={student.student_id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={getDefaultAvatarUrl("student")} alt="" />
                  <AvatarFallback>{initials(student)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{student.email ?? student.student_id}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(student.joined_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
