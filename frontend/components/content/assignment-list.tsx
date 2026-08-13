import type { ClassroomListItem } from "@/types/classroom";
import type { ContentAssignment } from "@/types/content";

export function AssignmentList({
  assignments,
  classrooms,
}: {
  assignments: ContentAssignment[];
  classrooms: ClassroomListItem[];
}) {
  if (assignments.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa giao cho lớp học nào.</p>;
  }

  const classroomNames = new Map(classrooms.map((classroom) => [classroom.id, classroom.name]));

  return (
    <ul className="flex flex-col gap-2">
      {assignments.map((assignment) => (
        <li key={assignment.id} className="rounded-lg border px-3 py-2 text-sm">
          {classroomNames.get(assignment.classroom_id) ?? assignment.classroom_id}
        </li>
      ))}
    </ul>
  );
}
