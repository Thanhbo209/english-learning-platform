import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MyClassroomsSection } from "./my-classrooms-section";

vi.mock("@/components/classrooms/create-classroom-dialog", () => ({
  CreateClassroomDialog: () => <button type="button">Tạo lớp học mới</button>,
}));

vi.mock("@/components/classrooms/enrolled-classroom-card", () => ({
  EnrolledClassroomCard: () => <div>Enrolled Classroom</div>,
}));

describe("MyClassroomsSection", () => {
  it("renders teacher active classrooms and links", () => {
    const mockTeacherClassrooms = [
      {
        id: "class-1",
        name: "Lớp Tiếng Anh 10A1",
        code: "ABC12345",
        description: "Lớp học buổi sáng",
        is_archived: false,
        created_at: "2026-01-01",
        teacher_id: "teacher-1",
        students_count: 25,
      },
    ];

    render(
      <MyClassroomsSection
        isTeacher={true}
        teacherClassrooms={mockTeacherClassrooms}
      />,
    );

    expect(screen.getByText("Lớp học đang quản lý")).toBeTruthy();
    expect(screen.getByText("Lớp Tiếng Anh 10A1")).toBeTruthy();
    expect(screen.getByText("25 học viên")).toBeTruthy();
  });

  it("renders empty state for teacher when no classrooms exist", () => {
    render(<MyClassroomsSection isTeacher={true} teacherClassrooms={[]} />);

    expect(screen.getByText("Lớp học đang quản lý")).toBeTruthy();
    expect(screen.getByText("Bạn chưa có lớp học nào")).toBeTruthy();
  });
});
