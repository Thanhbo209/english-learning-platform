import { ArrowRight, BookOpen, Users } from "lucide-react";
import Link from "next/link";

import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import { ImportContentDialog } from "@/components/content/import-content-dialog";
import { buttonVariants } from "@/components/ui/button";

export function QuickActions({ isTeacher }: { isTeacher: boolean }) {
  if (!isTeacher) {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/dashboard/content"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <BookOpen className="size-4 shrink-0" />
          <span>Xem bài học được giao</span>
        </Link>
        <Link
          href="/dashboard/classrooms"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Users className="size-4 shrink-0" />
          <span>Lớp học của tôi</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <CreateClassroomDialog />
      <ImportContentDialog />
      <Link
        href="/dashboard/content"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <BookOpen className="size-4 shrink-0" />
        <span>Kho nội dung</span>
      </Link>
      <Link
        href="/dashboard/classrooms"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <span>Quản lý lớp học</span>
        <ArrowRight className="size-3.5 shrink-0" />
      </Link>
    </div>
  );
}

