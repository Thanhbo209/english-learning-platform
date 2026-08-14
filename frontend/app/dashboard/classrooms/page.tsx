import { GraduationCap, School, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import { EnrolledClassroomCard } from "@/components/classrooms/enrolled-classroom-card";
import { TeacherClassroomList } from "@/components/classrooms/teacher-classroom-list";
import { getCurrentUser } from "@/lib/api";
import { getEnrolledClassrooms, getMyClassrooms } from "@/lib/classrooms";

export default async function ClassroomsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isTeacher = user.role === "teacher" || user.role === "admin";

  if (isTeacher) {
    const classrooms = await getMyClassrooms();
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
              <School className="size-6 text-primary" />
              <span>Quản lý lớp học</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Tạo và quản lý các lớp học tiếng Anh, danh sách học viên và tài liệu giảng dạy.
            </p>
          </div>
          <CreateClassroomDialog />
        </div>

        <TeacherClassroomList classrooms={classrooms} />
      </div>
    );
  }

  const classrooms = await getEnrolledClassrooms();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span>Lớp học đã tham gia</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Danh sách các lớp học tiếng Anh bạn đang tham gia học tập.
        </p>
      </div>

      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Bạn chưa tham gia lớp học nào</p>
            <p className="text-xs text-muted-foreground">
              Vui lòng yêu cầu giáo viên gửi liên kết mời để tham gia lớp học.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <EnrolledClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
}

