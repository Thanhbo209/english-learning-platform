import Link from "next/link";

import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectToParam = params.redirectTo;
  const redirectTo = typeof redirectToParam === "string" ? redirectToParam : "/dashboard";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Chào mừng trở lại. Nhập thông tin để tiếp tục.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
      <p className="text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
