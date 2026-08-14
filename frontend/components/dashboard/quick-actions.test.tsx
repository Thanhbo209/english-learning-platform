import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuickActions } from "./quick-actions";

vi.mock("@/components/classrooms/create-classroom-dialog", () => ({
  CreateClassroomDialog: () => <button type="button">Tạo lớp học mới</button>,
}));

vi.mock("@/components/content/import-content-dialog", () => ({
  ImportContentDialog: () => <button type="button">Nhập nội dung mới</button>,
}));

describe("QuickActions", () => {
  it("renders teacher quick action buttons", () => {
    render(<QuickActions isTeacher={true} />);

    expect(screen.getByText("Tạo lớp học mới")).toBeTruthy();
    expect(screen.getByText("Nhập nội dung mới")).toBeTruthy();
    expect(screen.getByText("Kho nội dung")).toBeTruthy();
  });

  it("renders student quick action buttons", () => {
    render(<QuickActions isTeacher={false} />);

    expect(screen.getByText("Xem bài học được giao")).toBeTruthy();
    expect(screen.getByText("Lớp học của tôi")).toBeTruthy();
  });
});
