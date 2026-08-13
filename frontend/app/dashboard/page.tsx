import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Signed in</h1>
        <p className="text-sm text-muted-foreground">{user.email ?? user.id}</p>
        <p className="text-xs text-muted-foreground">Role: {user.role ?? "unassigned"}</p>
      </div>
      <form action="/logout" method="post">
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </div>
  );
}
