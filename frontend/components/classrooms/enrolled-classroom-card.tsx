import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Classroom } from "@/types/classroom";

import { LeaveClassroomButton } from "./leave-classroom-button";

export function EnrolledClassroomCard({ classroom }: { classroom: Classroom }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{classroom.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="line-clamp-2">{classroom.description ?? "Chưa có mô tả"}</p>
      </CardContent>
      <CardFooter className="justify-end">
        <LeaveClassroomButton classroomId={classroom.id} />
      </CardFooter>
    </Card>
  );
}
