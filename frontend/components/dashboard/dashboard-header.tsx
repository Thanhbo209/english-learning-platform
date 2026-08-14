import type { CurrentUser } from "@/types";

function getDisplayName(user: CurrentUser): string {
  if (user.full_name && user.full_name.trim()) {
    return user.full_name.trim();
  }
  if (user.email) {
    return user.email.split("@")[0];
  }
  return user.role === "teacher" || user.role === "admin" ? "Giáo viên" : "Học sinh";
}

export function DashboardHeader({ user }: { user: CurrentUser }) {
  const displayName = getDisplayName(user);
  const isTeacher = user.role === "teacher" || user.role === "admin";

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border bg-card p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
          <span>Xin chào, {displayName}</span>
          <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {isTeacher
            ? "Chào mừng bạn trở lại! Quản lý các lớp học, bài học và tài liệu của bạn tại đây."
            : "Chào mừng bạn trở lại! Theo dõi bài học và các nội dung được giao của bạn."}
        </p>
      </div>
      <div className="hidden sm:flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        <span>{isTeacher ? "Tài khoản Giáo viên" : "Tài khoản Học sinh"}</span>
      </div>
    </div>
  );
}
