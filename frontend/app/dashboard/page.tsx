import { redirect } from "next/navigation";

import { LessonCard, type LessonSummary } from "@/components/dashboard/lesson-card";
import { ProgressChart, type WeeklyProgressPoint } from "@/components/dashboard/progress-chart";
import {
  type ClassmateRanking,
  ClassmatesRankingWidget,
  type ClassSummary,
  MyClassesWidget,
} from "@/components/dashboard/stat-widget";
import { getCurrentUser } from "@/lib/api";

const studentLessons: LessonSummary[] = [
  {
    id: "present-tenses",
    title: "Present Simple vs Present Continuous",
    level: "Beginner",
    topicsCount: 8,
    studentsEnrolled: 184,
    completion: 72,
  },
  {
    id: "travel-vocabulary",
    title: "Everyday Vocabulary: Travel",
    level: "Beginner",
    topicsCount: 10,
    studentsEnrolled: 231,
    completion: 45,
  },
  {
    id: "phrasal-verbs-work",
    title: "Phrasal Verbs for Work",
    level: "Intermediate",
    topicsCount: 12,
    studentsEnrolled: 96,
    completion: 20,
  },
  {
    id: "business-email",
    title: "Business Email Writing",
    level: "Advanced",
    topicsCount: 6,
    studentsEnrolled: 58,
    completion: 0,
  },
];

const teacherLessons: LessonSummary[] = studentLessons.map((lesson) => ({
  ...lesson,
  completion: Math.round((lesson.studentsEnrolled % 40) + 40),
}));

const classmatesRanking: ClassmateRanking[] = [
  { id: "1", name: "Linh Tran", points: 980 },
  { id: "2", name: "Minh Pham", points: 915 },
  { id: "3", name: "An Le", points: 860 },
];

const myClasses: ClassSummary[] = [
  { id: "1", name: "Beginner English, Morning", studentsCount: 18, activeLessons: 4 },
  { id: "2", name: "IELTS Prep, Evening", studentsCount: 12, activeLessons: 6 },
  { id: "3", name: "Business English", studentsCount: 9, activeLessons: 3 },
];

const weeklyProgress: WeeklyProgressPoint[] = [
  { week: "Week 1", completed: 8, inProgress: 3 },
  { week: "Week 2", completed: 12, inProgress: 5 },
  { week: "Week 3", completed: 15, inProgress: 2 },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isTeacher = user.role === "teacher";
  const lessons = isTeacher ? teacherLessons : studentLessons;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold tracking-tight">
            {isTeacher ? "Your published lessons" : "Popular lessons"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                ctaLabel={isTeacher ? "Manage" : "Enroll now"}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isTeacher ? (
          <MyClassesWidget classes={myClasses} />
        ) : (
          <ClassmatesRankingWidget ranking={classmatesRanking} />
        )}
        <ProgressChart data={weeklyProgress} />
      </div>
    </div>
  );
}
