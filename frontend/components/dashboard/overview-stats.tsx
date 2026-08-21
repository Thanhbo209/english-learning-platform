import { BookOpen, Clock, GraduationCap, Users } from "lucide-react";
import type { ComponentType } from "react";

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

type StatItem = {
  title: string;
  value: number;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  borderClass: string;
  bgClass: string;
  iconColorClass: string;
  valueColorClass: string;
};

function StatCard({ card }: { card: StatItem }) {
  const Icon = card.icon;
  return (
    <Card
      className={cn(
        "overflow-hidden border-y border-r border-l-4 shadow-xs transition-shadow hover:shadow-sm",
        card.borderClass,
        card.bgClass,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.title}
            </span>
            <span
              className={cn(
                "text-3xl font-bold tracking-tight tabular-nums sm:text-4xl",
                card.valueColorClass,
              )}
            >
              {card.value}
            </span>
            <span className="text-[11px] text-muted-foreground">{card.subtitle}</span>
          </div>
          <Icon className={cn("mt-0.5 size-5 opacity-60", card.iconColorClass)} />
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewStats({
  stats,
}: {
  stats: { type: "teacher"; data: TeacherStats } | { type: "student"; data: StudentStats };
}) {
  if (stats.type === "teacher") {
    const { activeClassrooms, totalStudents, publishedContent, draftContent } = stats.data;

    const cards: StatItem[] = [
      {
        title: "Lớp học hoạt động",
        value: activeClassrooms,
        subtitle: "Đang giảng dạy",
        icon: Users,
        borderClass: "border-l-primary",
        bgClass: "bg-primary/5 dark:bg-primary/10",
        iconColorClass: "text-primary",
        valueColorClass: "text-primary",
      },
      {
        title: "Tổng số học sinh",
        value: totalStudents,
        subtitle: "Tham gia các lớp",
        icon: GraduationCap,
        borderClass: "border-l-emerald-500",
        bgClass: "bg-emerald-500/5 dark:bg-emerald-500/10",
        iconColorClass: "text-emerald-500",
        valueColorClass: "text-emerald-700 dark:text-emerald-400",
      },
      {
        title: "Nội dung đã xuất bản",
        value: publishedContent,
        subtitle: "Sẵn sàng giao cho lớp",
        icon: BookOpen,
        borderClass: "border-l-amber-500",
        bgClass: "bg-amber-500/5 dark:bg-amber-500/10",
        iconColorClass: "text-amber-500",
        valueColorClass: "text-amber-700 dark:text-amber-400",
      },
      {
        title: "Nội dung bản nháp",
        value: draftContent,
        subtitle: "Đang chuẩn bị",
        icon: Clock,
        borderClass: "border-l-border",
        bgClass: "bg-muted/40",
        iconColorClass: "text-muted-foreground",
        valueColorClass: "text-foreground",
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} card={card} />
        ))}
      </div>
    );
  }

  // Student stats
  const { enrolledClassrooms, totalAssignments } = stats.data;

  const cards: StatItem[] = [
    {
      title: "Đang theo học",
      value: enrolledClassrooms,
      subtitle: "lớp học",
      icon: Users,
      borderClass: "border-l-primary",
      bgClass: "bg-primary/5 dark:bg-primary/10",
      iconColorClass: "text-primary",
      valueColorClass: "text-primary",
    },
    {
      title: "Bài học chờ bạn",
      value: totalAssignments,
      subtitle: "bài được giao",
      icon: BookOpen,
      borderClass: "border-l-amber-500",
      bgClass: "bg-amber-500/5 dark:bg-amber-500/10",
      iconColorClass: "text-amber-500",
      valueColorClass: "text-amber-700 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} card={card} />
      ))}
    </div>
  );
}
