import { ArrowLeft, BookOpen, School, Users } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArchiveToggleButton } from "@/components/classrooms/archive-toggle-button";
import { ClassroomContentList } from "@/components/classrooms/classroom-content-list";
import { DeleteClassroomButton } from "@/components/classrooms/delete-classroom-button";
import { EditClassroomDialog } from "@/components/classrooms/edit-classroom-dialog";
import { JoinLinkPanel } from "@/components/classrooms/join-link-panel";
import { StudentRoster } from "@/components/classrooms/student-roster";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getClassroomAssignments, getClassroomDetail } from "@/lib/classrooms";

type ClassroomDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassroomDetailPage({ params }: ClassroomDetailPageProps) {
  const { id } = await params;
  const [classroom, assignments] = await Promise.all([
    getClassroomDetail(id),
    getClassroomAssignments(id),
  ]);

  if (!classroom) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation */}
      <Link
        href="/dashboard/classrooms"
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tất cả lớp học
      </Link>

      {/* Classroom Hero Card */}
      <Card className="relative overflow-hidden border">
        <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 font-bold text-lg text-blue-600 dark:text-blue-400">
                {classroom.name.charAt(0).toUpperCase() || <School className="size-6" />}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{classroom.name}</h1>
                  {classroom.is_archived ? <Badge variant="secondary">Đã lưu trữ</Badge> : null}
                </div>
                {classroom.description ? (
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                    {classroom.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Chưa có mô tả cho lớp học này.</p>
                )}
              </div>
            </div>

            <EditClassroomDialog
              classroomId={classroom.id}
              initialName={classroom.name}
              initialDescription={classroom.description}
            />
          </div>

          <Separator className="my-1" />

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="size-4 text-primary" />
              <span>{classroom.students.length} học viên đã tham gia</span>
            </span>
            <span aria-hidden className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="size-4 text-indigo-500" />
              <span>{assignments.length} nội dung đã giao</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ClassroomContentList assignments={assignments} />

          <Separator />

          {/* Classroom Management Options */}
          <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4">
            <p className="text-xs font-semibold text-muted-foreground">Thiết lập lớp học</p>
            <div className="flex flex-wrap gap-2">
              <ArchiveToggleButton classroomId={classroom.id} isArchived={classroom.is_archived} />
              <DeleteClassroomButton classroomId={classroom.id} />
            </div>
          </div>
        </div>

        {/* Sidebar Roster & Join Panel */}
        <div className="flex flex-col gap-6">
          <JoinLinkPanel classroomId={classroom.id} joinToken={classroom.join_token} />
          <StudentRoster students={classroom.students} />
        </div>
      </div>
    </div>
  );
}


