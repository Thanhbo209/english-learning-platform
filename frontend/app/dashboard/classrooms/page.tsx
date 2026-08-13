import { School, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { ClassroomCard } from "@/components/classrooms/classroom-card";
import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import { EnrolledClassroomCard } from "@/components/classrooms/enrolled-classroom-card";
import { getCurrentUser } from "@/lib/api";
import { getEnrolledClassrooms, getMyClassrooms } from "@/lib/classrooms";

function EmptyState({ icon: Icon, message }: { icon: typeof School; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Lớp học của tôi</h2>
          <CreateClassroomDialog />
        </div>
        {classrooms.length === 0 ? (
          <EmptyState icon={School} message="Bạn chưa tạo lớp học nào. Bắt đầu bằng cách tạo một lớp." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classrooms.map((classroom) => (
              <ClassroomCard key={classroom.id} classroom={classroom} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const classrooms = await getEnrolledClassrooms();
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold tracking-tight">Lớp học đã tham gia</h2>
      {classrooms.length === 0 ? (
        <EmptyState icon={Users} message="Bạn chưa tham gia lớp học nào. Hỏi giáo viên để lấy liên kết mời." />
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
