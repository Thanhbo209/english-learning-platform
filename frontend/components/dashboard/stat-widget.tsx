import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultAvatarUrl } from "@/lib/avatars";

export type ClassmateRanking = {
  id: string;
  name: string;
  points: number;
};

export function ClassmatesRankingWidget({ ranking }: { ranking: ClassmateRanking[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng của tôi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ranking.map((entry, index) => (
          <div key={entry.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={getDefaultAvatarUrl("student")} alt="" />
                <AvatarFallback>{entry.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">Hạng {index + 1}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export type ClassSummary = {
  id: string;
  name: string;
  studentsCount: number;
  activeLessons: number;
};

export function MyClassesWidget({ classes }: { classes: ClassSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lớp học của tôi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {classes.map((classItem) => (
          <div key={classItem.id} className="flex items-center justify-between">
            <span className="text-sm font-medium">{classItem.name}</span>
            <span className="text-sm text-muted-foreground">
              {classItem.studentsCount} học viên
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
