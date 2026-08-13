import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArchiveToggleButton } from "@/components/classrooms/archive-toggle-button";
import { DeleteClassroomButton } from "@/components/classrooms/delete-classroom-button";
import { EditClassroomDialog } from "@/components/classrooms/edit-classroom-dialog";
import { JoinLinkPanel } from "@/components/classrooms/join-link-panel";
import { StudentRoster } from "@/components/classrooms/student-roster";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getClassroomDetail } from "@/lib/classrooms";

type ClassroomDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassroomDetailPage({ params }: ClassroomDetailPageProps) {
  const { id } = await params;
  const classroom = await getClassroomDetail(id);

  if (!classroom) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/classrooms"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tất cả lớp học
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">{classroom.name}</h2>
              {classroom.is_archived ? <Badge variant="secondary">Đã lưu trữ</Badge> : null}
            </div>
            <EditClassroomDialog
              classroomId={classroom.id}
              initialName={classroom.name}
              initialDescription={classroom.description}
            />
          </div>
          {classroom.description ? (
            <p className="text-sm text-muted-foreground">{classroom.description}</p>
          ) : null}

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Quản lý lớp học</p>
            <div className="flex gap-2">
              <ArchiveToggleButton classroomId={classroom.id} isArchived={classroom.is_archived} />
              <DeleteClassroomButton classroomId={classroom.id} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <JoinLinkPanel classroomId={classroom.id} joinToken={classroom.join_token} />
          <StudentRoster students={classroom.students} />
        </div>
      </div>
    </div>
  );
}
