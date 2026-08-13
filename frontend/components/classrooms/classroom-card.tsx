import { Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassroomListItem } from "@/types/classroom";

export function ClassroomCard({ classroom }: { classroom: ClassroomListItem }) {
  return (
    <Link href={`/dashboard/classrooms/${classroom.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>{classroom.name}</span>
            {classroom.is_archived ? <Badge variant="secondary">Đã lưu trữ</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p className="line-clamp-2">{classroom.description ?? "Chưa có mô tả"}</p>
          <p className="flex items-center gap-1.5 text-xs">
            <Users className="size-3.5" />
            {classroom.students_count} học viên
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
