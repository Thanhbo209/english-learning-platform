import { ArrowRight, BookOpen, FolderOpen } from "lucide-react";
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

  // Real data fetching for overview stats, classrooms section & content list
  let teacherClassroomsList: Awaited<ReturnType<typeof getMyClassrooms>> = [];
  let studentClassroomsList: Awaited<ReturnType<typeof getEnrolledClassrooms>> = [];
  let teacherContentList: LearningContent[] = [];
  let studentAssignmentsList: StudentAssignment[] = [];
  let recentStudentsList: StudentOverviewItem[] = [];

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
    teacherStats = {
      activeClassrooms: activeClassroomsList.length,
      totalStudents: activeClassroomsList.reduce((sum, c) => sum + (c.student_count ?? 0), 0),
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
      <div className="flex flex-col gap-4">
        <DashboardHeader user={user} />
        <QuickActions isTeacher={isTeacher} />
      </div>

      <OverviewStats
        stats={
          isTeacher
            ? { type: "teacher", data: teacherStats }
            : { type: "student", data: studentStats }
        }
      />

      {/* My Classrooms Section */}
      <MyClassroomsSection
        isTeacher={isTeacher}
        teacherClassrooms={teacherClassroomsList}
        studentClassrooms={studentClassroomsList}
      />

      {/* Student Roster Overview & Learning Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Real Learning Content Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  <span>{isTeacher ? "Nội dung học tập mới nhất" : "Bài học được giao mới nhất"}</span>
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
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

            {isTeacher ? (
              displayedTeacherContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FolderOpen className="size-6" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <p className="text-sm font-semibold text-foreground">Chưa có nội dung nào trong kho</p>
                    <p className="text-xs text-muted-foreground">
                      Tải tệp DOCX, XLSX, PDF hoặc CSV để bắt đầu tạo bài học cho học viên.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {displayedTeacherContent.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </div>
              )
            ) : displayedStudentAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FolderOpen className="size-6" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <p className="text-sm font-semibold text-foreground">Chưa có bài học nào được giao</p>
                  <p className="text-xs text-muted-foreground">
                    Nội dung bài học hoặc bài tập giáo viên giao sẽ xuất hiện tại đây.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {displayedStudentAssignments.map((item) => (
                  <StudentAssignmentCard key={item.assignment.id} assignment={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student List Widget (for Teacher) */}
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





