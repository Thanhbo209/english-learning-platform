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

function getGreeting(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const currentHour = parseInt(formatter.format(new Date()), 10);
  if (currentHour >= 5 && currentHour < 11) return "Chào buổi sáng";
  if (currentHour >= 11 && currentHour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function DashboardHeader({ user }: { user: CurrentUser }) {
  const displayName = getDisplayName(user);
  const isTeacher = user.role === "teacher" || user.role === "admin";
  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-1.5 border-l-4 border-l-primary py-2 pl-4 sm:flex-row sm:items-center sm:justify-between sm:py-3 sm:pl-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {greeting}, {displayName} 👋
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {isTeacher
            ? "Hôm nay là thời điểm tốt để chia sẻ kiến thức."
            : "Mở bài học và bắt đầu luyện tập tiếng Anh ngay hôm nay."}
        </p>
      </div>

      <div className="flex items-center gap-1.5 self-start sm:self-auto">
        <span
          className={
            isTeacher
              ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              : "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
          }
        >
          <span
            className={
              isTeacher
                ? "size-1.5 rounded-full bg-primary"
                : "size-1.5 rounded-full bg-emerald-500"
            }
          />
          {isTeacher ? "Giáo viên" : "Học sinh"}
        </span>
      </div>
    </div>
  );
}
