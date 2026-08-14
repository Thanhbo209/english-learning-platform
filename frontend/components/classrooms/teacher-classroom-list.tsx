"use client";

import { Archive, LayoutGrid, School, Search } from "lucide-react";
import { useState } from "react";

import { ClassroomCard } from "@/components/classrooms/classroom-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ClassroomListItem } from "@/types/classroom";

export function TeacherClassroomList({ classrooms }: { classrooms: ClassroomListItem[] }) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCount = classrooms.filter((c) => !c.is_archived).length;
  const archivedCount = classrooms.filter((c) => c.is_archived).length;

  const filtered = classrooms.filter((c) => {
    const matchesTab = tab === "archived" ? c.is_archived : !c.is_archived;
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        {/* Tab Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "active"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
            <span>Đang hoạt động</span>
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold">
              {activeCount}
            </span>
          </button>

          {archivedCount > 0 ? (
            <button
              type="button"
              onClick={() => setTab("archived")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === "archived"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Archive className="size-4" />
              <span>Đã lưu trữ</span>
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold">
                {archivedCount}
              </span>
            </button>
          ) : null}
        </div>

        {/* Search Bar */}
        {classrooms.length > 3 ? (
          <div className="relative min-w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm lớp học…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <School className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              {tab === "archived"
                ? "Chưa có lớp học nào bị lưu trữ"
                : searchQuery
                  ? "Không tìm thấy lớp học phù hợp"
                  : "Bạn chưa tạo lớp học nào"}
            </p>
            <p className="text-xs text-muted-foreground">
              {tab === "archived"
                ? "Các lớp học được lưu trữ sẽ hiển thị tại đây."
                : searchQuery
                  ? "Thử tìm kiếm với từ khóa khác."
                  : "Bấm nút 'Tạo lớp học' ở góc trên để bắt đầu."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
}
