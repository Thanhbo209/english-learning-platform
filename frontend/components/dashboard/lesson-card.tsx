import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type LessonSummary = {
  id: string;
  title: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  topicsCount: number;
  studentsEnrolled: number;
  completion: number;
};

export function LessonCard({
  lesson,
  ctaLabel,
}: {
  lesson: LessonSummary;
  ctaLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{lesson.title}</span>
          <Badge variant="secondary">{lesson.level}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span>
          {lesson.topicsCount} chủ đề, {lesson.studentsEnrolled} học viên
        </span>
        <span>Hoàn thành {lesson.completion}%</span>
      </CardContent>
      <CardFooter>
        <Button className="w-full">{ctaLabel}</Button>
      </CardFooter>
    </Card>
  );
}
