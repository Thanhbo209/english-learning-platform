import { Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultAvatarUrl, getInitials } from "@/lib/avatars";
import type { EnrolledStudent } from "@/types/classroom";

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
                  <AvatarFallback>
                    {getInitials(student.full_name, student.email ?? student.student_id)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {student.full_name ?? student.email ?? student.student_id}
                </span>
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
