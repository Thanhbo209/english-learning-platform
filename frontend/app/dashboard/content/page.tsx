import { FileText } from "lucide-react";
import { redirect } from "next/navigation";

import { ContentList } from "@/components/content/content-list";
import { ImportContentDialog } from "@/components/content/import-content-dialog";
import { StudentAssignmentCard } from "@/components/content/student-assignment-card";
import { getCurrentUser } from "@/lib/api";
import { getMyAssignments, getMyContent } from "@/lib/content";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <FileText className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Nội dung học tập</h2>
          <ImportContentDialog />
        </div>
        {content.length === 0 ? (
          <EmptyState message="Bạn chưa nhập nội dung nào. Bắt đầu bằng cách nhập một tệp." />
        ) : (
          <ContentList content={content} />
        )}
      </div>
    );
  }

  const assignments = await getMyAssignments();
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold tracking-tight">Nội dung được giao</h2>
      {assignments.length === 0 ? (
        <EmptyState message="Chưa có nội dung nào được giao cho lớp học của bạn." />
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
