"use client";

import { ArrowRight, ChevronLeft, ChevronRight, School, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ClassroomCard } from "@/components/classrooms/classroom-card";
import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import { EnrolledClassroomCard } from "@/components/classrooms/enrolled-classroom-card";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Classroom, ClassroomListItem } from "@/types/classroom";

export function MyClassroomsSection({
  teacherClassrooms,
  studentClassrooms,
  isTeacher,
}: {
  teacherClassrooms?: ClassroomListItem[];
  studentClassrooms?: Classroom[];
  isTeacher: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 5);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 5,
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, teacherClassrooms, studentClassrooms]);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (isTeacher) {
    const activeClassrooms = (teacherClassrooms ?? []).filter((c) => !c.is_archived);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span>Lớp học đang quản lý</span>
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {activeClassrooms.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeClassrooms.length > 0 ? (
              <div className="flex items-center gap-1 mr-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Cuộn sang trái"
                  className="size-8 rounded-full border-border/80"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Cuộn sang phải"
                  className="size-8 rounded-full border-border/80"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : null}

            <CreateClassroomDialog />
            <Link
              href="/dashboard/classrooms"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <span>Xem tất cả</span>
              <ArrowRight className="size-3.5 shrink-0" />
            </Link>
          </div>
        </div>

        {activeClassrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <School className="size-6" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <p className="text-sm font-semibold text-foreground">Bạn chưa có lớp học nào</p>
              <p className="text-xs text-muted-foreground">
                Tạo lớp học đầu tiên để bắt đầu thêm học viên và giao bài tập.
              </p>
            </div>
            <CreateClassroomDialog />
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {activeClassrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start"
              >
                <ClassroomCard classroom={classroom} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Student view
  const activeStudentClassrooms = (studentClassrooms ?? []).filter((c) => !c.is_archived);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span>Lớp học của tôi</span>
          </h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {activeStudentClassrooms.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeStudentClassrooms.length > 0 ? (
            <div className="flex items-center gap-1 mr-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Cuộn sang trái"
                className="size-8 rounded-full border-border/80"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Cuộn sang phải"
                className="size-8 rounded-full border-border/80"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : null}

          <Link
            href="/dashboard/classrooms"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <span>Xem tất cả</span>
            <ArrowRight className="size-3.5 shrink-0" />
          </Link>
        </div>
      </div>

      {activeStudentClassrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center sm:p-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <School className="size-6" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <p className="text-sm font-semibold text-foreground">Bạn chưa tham gia lớp học nào</p>
            <p className="text-xs text-muted-foreground">
              Nhập mã tham gia hoặc liên hệ giáo viên để vào lớp học.
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {activeStudentClassrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start"
            >
              <EnrolledClassroomCard classroom={classroom} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
