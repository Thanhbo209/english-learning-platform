import { ArrowRight, BookOpen, Upload, Users } from "lucide-react";
import Link from "next/link";

import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import { ImportContentDialog } from "@/components/content/import-content-dialog";
import { Button } from "@/components/ui/button";

export function QuickActions({ isTeacher }: { isTeacher: boolean }) {
  if (!isTeacher) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="sm" className="gap-2 text-xs">
          <Link href="/dashboard/content">
            <BookOpen className="size-4" />
            <span>Xem bài học được giao</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
          <Link href="/dashboard/classrooms">
            <Users className="size-4" />
            <span>Lớp học của tôi</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CreateClassroomDialog />
      <ImportContentDialog />
      <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
        <Link href="/dashboard/content">
          <BookOpen className="size-4" />
          <span>Kho nội dung</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/dashboard/classrooms">
          <span>Quản lý lớp học</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}
