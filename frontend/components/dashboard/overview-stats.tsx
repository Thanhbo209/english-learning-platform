import { BookOpen, Clock, GraduationCap, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TeacherStats = {
  activeClassrooms: number;
  totalStudents: number;
  publishedContent: number;
  draftContent: number;
};

export type StudentStats = {
  enrolledClassrooms: number;
  totalAssignments: number;
};

export function OverviewStats({
  stats,
}: {
  stats: { type: "teacher"; data: TeacherStats } | { type: "student"; data: StudentStats };
}) {
  if (stats.type === "teacher") {
    const { activeClassrooms, totalStudents, publishedContent, draftContent } = stats.data;

    const cards = [
      {
        title: "Lớp học hoạt động",
        value: activeClassrooms,
        subtitle: "Đang giảng dạy",
        icon: Users,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
      },
      {
        title: "Tổng số học sinh",
        value: totalStudents,
        subtitle: "Tham gia các lớp",
        icon: GraduationCap,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
      },
      {
        title: "Nội dung đã xuất bản",
        value: publishedContent,
        subtitle: "Sẵn sàng giao cho lớp",
        icon: BookOpen,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/20",
      },
      {
        title: "Nội dung bản nháp",
        value: draftContent,
        subtitle: "Đang chuẩn bị",
        icon: Clock,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden border-border/70 shadow-2xs">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                  <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {card.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{card.subtitle}</span>
                </div>
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs",
                    card.bg,
                    card.color,
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Student stats
  const { enrolledClassrooms, totalAssignments } = stats.data;
  const cards = [
    {
      title: "Lớp học đã tham gia",
      value: enrolledClassrooms,
      subtitle: "Đang theo học",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Bài học được giao",
      value: totalAssignments,
      subtitle: "Cần hoàn thành",
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="overflow-hidden border-border/70 shadow-2xs">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {card.value}
                </span>
                <span className="text-[11px] text-muted-foreground">{card.subtitle}</span>
              </div>
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs",
                  card.bg,
                  card.color,
                )}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
