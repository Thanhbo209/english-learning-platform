import { ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContentCard } from "@/components/content/content-card";
import { StudentAssignmentCard } from "@/components/content/student-assignment-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MyClassroomsSection } from "@/components/dashboard/my-classrooms-section";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StudentListOverview, type StudentOverviewItem } from "@/components/dashboard/student-list-overview";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api";
import { getClassroomDetail, getEnrolledClassrooms, getMyClassrooms } from "@/lib/classrooms";
import { getMyAssignments, getMyContent } from "@/lib/content";
import type { LearningContent, StudentAssignment } from "@/types/content";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isTeacher = user.role === "teacher" || user.role === "admin";

  let teacherClassroomsList: Awaited<ReturnType<typeof getMyClassrooms>> = [];
  let studentClassroomsList: Awaited<ReturnType<typeof getEnrolledClassrooms>> = [];
  let teacherContentList: LearningContent[] = [];
  let studentAssignmentsList: StudentAssignment[] = [];
  const recentStudentsList: StudentOverviewItem[] = [];

  let teacherStats = {
    activeClassrooms: 0,
    totalStudents: 0,
    publishedContent: 0,
    draftContent: 0,
  };

  let studentStats = {
    enrolledClassrooms: 0,
    totalAssignments: 0,
  };

  if (isTeacher) {
    const [classrooms, content] = await Promise.all([
      getMyClassrooms().catch(() => []),
      getMyContent().catch(() => []),
    ]);

    teacherClassroomsList = classrooms;
    teacherContentList = content;
    const activeClassroomsList = classrooms.filter((c) => !c.is_archived);
    const initialTotalStudents = activeClassroomsList.reduce(
      (sum, c) => sum + (c.students_count ?? (c as { student_count?: number }).student_count ?? 0),
      0,
    );

    teacherStats = {
      activeClassrooms: activeClassroomsList.length,
      totalStudents: initialTotalStudents,
      publishedContent: content.filter((item) => item.status === "published").length,
      draftContent: content.filter((item) => item.status !== "published").length,
    };

    if (activeClassroomsList.length > 0) {
      const classroomDetails = await Promise.all(
        activeClassroomsList.map((c) => getClassroomDetail(c.id).catch(() => null)),
      );

      classroomDetails.forEach((detail) => {
        if (detail && detail.students) {
          detail.students.forEach((s) => {
            recentStudentsList.push({
              ...s,
              classroom_name: detail.name,
              classroom_id: detail.id,
            });
          });
        }
      });

      recentStudentsList.sort(
        (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime(),
      );

      teacherStats.totalStudents = Math.max(
        teacherStats.totalStudents,
        recentStudentsList.length,
      );
    }
  } else {
    const [enrolledClassrooms, assignments] = await Promise.all([
      getEnrolledClassrooms().catch(() => []),
      getMyAssignments().catch(() => []),
    ]);

    studentClassroomsList = enrolledClassrooms;
    studentAssignmentsList = assignments;
    studentStats = {
      enrolledClassrooms: enrolledClassrooms.length,
      totalAssignments: assignments.length,
    };
  }

  const displayedTeacherContent = teacherContentList.slice(0, 4);
  const displayedStudentAssignments = studentAssignmentsList.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      {/* Header + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader user={user} />
        <QuickActions isTeacher={isTeacher} />
      </div>

      {/* Stats */}
      <OverviewStats
        stats={
          isTeacher
            ? { type: "teacher", data: teacherStats }
            : { type: "student", data: studentStats }
        }
      />

      {/* Classrooms */}
      <MyClassroomsSection
        isTeacher={isTeacher}
        teacherClassrooms={teacherClassroomsList}
        studentClassrooms={studentClassroomsList}
      />

      {/* Content + student roster */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-4">
            {/* Section heading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {isTeacher ? "Nội dung học tập mới nhất" : "Bài học được giao"}
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {isTeacher ? teacherContentList.length : studentAssignmentsList.length}
                </span>
              </div>

              <Link
                href="/dashboard/content"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <span>Xem tất cả</span>
                <ArrowRight className="size-3.5 shrink-0" />
              </Link>
            </div>

            {/* Content grid */}
            {isTeacher ? (
              displayedTeacherContent.length === 0 ? (
                <EmptyContentState
                  message="Tải tệp DOCX, XLSX, PDF hoặc CSV để bắt đầu tạo bài học cho học viên."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {displayedTeacherContent.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </div>
              )
            ) : displayedStudentAssignments.length === 0 ? (
              <EmptyContentState message="Nội dung bài học hoặc bài tập giáo viên giao sẽ xuất hiện tại đây." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {displayedStudentAssignments.map((item) => (
                  <StudentAssignmentCard key={item.assignment.id} assignment={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student roster (teacher only) */}
        {isTeacher ? (
          <div className="flex flex-col gap-6">
            <StudentListOverview
              students={recentStudentsList}
              totalStudentsCount={teacherStats.totalStudents}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyContentState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="size-5 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1 max-w-xs">
        <p className="text-sm font-medium text-foreground">Chưa có nội dung</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
