import { ArrowRight, Plus, School, Users } from "lucide-react";
import Link from "next/link";

import { ClassroomCard } from "@/components/classrooms/classroom-card";
import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import { EnrolledClassroomCard } from "@/components/classrooms/enrolled-classroom-card";
import { Button } from "@/components/ui/button";
import type { Classroom, ClassroomListItem } from "@/types/classroom";

export function MyClassroomsSection({
  teacherClassrooms,
  studentClassrooms,
  isTeacher,
}: {
  teacherClassrooms?: ClassroomListItem[];
  studentClassrooms?: Classroom[];
  isTeacher: boolean;
}) {
  if (isTeacher) {
    const activeClassrooms = (teacherClassrooms ?? []).filter((c) => !c.is_archived);
    const displayedClassrooms = activeClassrooms.slice(0, 3);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span>Lớp học đang quản lý</span>
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {activeClassrooms.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CreateClassroomDialog />
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/classrooms">
                <span>Xem tất cả</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {displayedClassrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <School className="size-6" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <p className="text-sm font-semibold text-foreground">Bạn chưa có lớp học nào</p>
              <p className="text-xs text-muted-foreground">
                Tạo lớp học đầu tiên để bắt đầu thêm học viên và giao bài tập.
              </p>
            </div>
            <CreateClassroomDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedClassrooms.map((classroom) => (
              <ClassroomCard key={classroom.id} classroom={classroom} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Student view
  const activeStudentClassrooms = (studentClassrooms ?? []).filter((c) => !c.is_archived);
  const displayedStudentClassrooms = activeStudentClassrooms.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span>Lớp học của tôi</span>
          </h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {activeStudentClassrooms.length}
          </span>
        </div>

        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/classrooms">
            <span>Xem tất cả</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      {displayedStudentClassrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <School className="size-6" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <p className="text-sm font-semibold text-foreground">Bạn chưa tham gia lớp học nào</p>
            <p className="text-xs text-muted-foreground">
              Nhập mã tham gia hoặc liên hệ giáo viên để vào lớp học.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedStudentClassrooms.map((classroom) => (
            <EnrolledClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
}
