import Link from "next/link";

import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản</h1>
        <p className="text-sm text-muted-foreground">Bắt đầu chỉ trong vài giây.</p>
      </div>
      <SignupForm />
      <p className="text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
