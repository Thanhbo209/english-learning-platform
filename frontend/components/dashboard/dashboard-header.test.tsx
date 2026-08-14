import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardHeader } from "./dashboard-header";

describe("DashboardHeader", () => {
  it("renders greeting with user full name for teacher", () => {
    render(
      <DashboardHeader
        user={{
          id: "1",
          email: "teacher@example.com",
          full_name: "Nguyễn Văn A",
          role: "teacher",
        }}
      />,
    );

    expect(screen.getByText("Xin chào, Nguyễn Văn A")).toBeTruthy();
    expect(
      screen.getByText("Chào mừng bạn trở lại! Quản lý các lớp học, bài học và tài liệu của bạn tại đây."),
    ).toBeTruthy();
    expect(screen.getByText("Tài khoản Giáo viên")).toBeTruthy();
  });

  it("renders greeting with fallback email prefix for student", () => {
    render(
      <DashboardHeader
        user={{
          id: "2",
          email: "student123@example.com",
          full_name: null,
          role: "student",
        }}
      />,
    );

    expect(screen.getByText("Xin chào, student123")).toBeTruthy();
    expect(
      screen.getByText("Chào mừng bạn trở lại! Theo dõi bài học và các nội dung được giao của bạn."),
    ).toBeTruthy();
    expect(screen.getByText("Tài khoản Học sinh")).toBeTruthy();
  });
});
