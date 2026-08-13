import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Nền tảng học tiếng Anh
      </h1>
      <p className="max-w-md text-muted-foreground">
        Đã hoàn tất thiết lập nền tảng. Các tính năng sản phẩm chưa được triển khai.
      </p>
      <Button asChild>
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          Xem tài liệu API
        </a>
      </Button>
    </div>
  );
}
