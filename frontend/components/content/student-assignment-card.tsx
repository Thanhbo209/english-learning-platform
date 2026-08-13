import { BookOpen, FileText, ListChecks } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentType, StudentAssignment } from "@/types/content";

const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  learning_document: FileText,
  exercise: ListChecks,
  vocabulary: BookOpen,
};

const TYPE_LABELS: Record<ContentType, string> = {
  learning_document: "Tài liệu",
  exercise: "Bài tập",
  vocabulary: "Từ vựng",
};

export function StudentAssignmentCard({ assignment }: { assignment: StudentAssignment }) {
  const Icon = TYPE_ICONS[assignment.content.type];

  return (
    <Link href={`/dashboard/assignments/${assignment.assignment.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="line-clamp-1">{assignment.content.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {TYPE_LABELS[assignment.content.type]}
        </CardContent>
      </Card>
    </Link>
  );
}
