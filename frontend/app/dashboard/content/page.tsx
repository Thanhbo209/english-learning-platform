import { BookOpen, FolderCheck, Library } from "lucide-react";
import { redirect } from "next/navigation";

import { ContentList } from "@/components/content/content-list";
import { ImportContentDialog } from "@/components/content/import-content-dialog";
import { StudentAssignmentCard } from "@/components/content/student-assignment-card";
import { getCurrentUser } from "@/lib/api";
import { getMyAssignments, getMyContent } from "@/lib/content";

function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Library className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default async function ContentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isTeacher = user.role === "teacher" || user.role === "admin";

  if (isTeacher) {
    const content = await getMyContent();
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
              <Library className="size-6 text-primary" />
              <span>Kho nội dung học tập</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Nhập và quản lý tài liệu học tập, bộ từ vựng và bài tập trắc nghiệm.
            </p>
          </div>
          <ImportContentDialog />
        </div>

        {content.length === 0 ? (
          <EmptyState
            title="Chưa có nội dung nào trong kho"
            message="Bắt đầu bằng cách bấm nút 'Nhập nội dung mới' ở góc trên để tải tệp DOCX, XLSX, PDF hoặc CSV."
          />
        ) : (
          <ContentList content={content} />
        )}
      </div>
    );
  }

  const assignments = await getMyAssignments();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
          <FolderCheck className="size-6 text-primary" />
          <span>Bài học được giao</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Danh sách tài liệu, bài tập và từ vựng giáo viên đã giao cho các lớp học của bạn.
        </p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          title="Chưa có nội dung nào được giao"
          message="Nội dung bài học hoặc bài tập được giáo viên giao sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((item) => (
            <StudentAssignmentCard key={item.assignment.id} assignment={item} />
          ))}
        </div>
      )}
    </div>
  );
}

