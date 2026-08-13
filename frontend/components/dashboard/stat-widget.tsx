import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ClassmateRanking = {
  id: string;
  name: string;
  points: number;
};

const rankLabels = ["1st", "2nd", "3rd"];

export function ClassmatesRankingWidget({ ranking }: { ranking: ClassmateRanking[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My ranking</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ranking.map((entry, index) => (
          <div key={entry.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback>{entry.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {rankLabels[index] ?? `${index + 1}th`}
            </span>
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
        <CardTitle>My classes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {classes.map((classItem) => (
          <div key={classItem.id} className="flex items-center justify-between">
            <span className="text-sm font-medium">{classItem.name}</span>
            <span className="text-sm text-muted-foreground">
              {classItem.studentsCount} students
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
