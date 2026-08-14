import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentListOverview } from "./student-list-overview";

describe("StudentListOverview", () => {
  it("renders list of students correctly", () => {
    const mockStudents = [
      {
        student_id: "s1",
        full_name: "Nguyen Van A",
        email: "nguyenvana@gmail.com",
        joined_at: "2026-02-01",
        classroom_name: "Lớp 10A1",
        classroom_id: "c1",
      },
    ];

    render(<StudentListOverview students={mockStudents} totalStudentsCount={1} />);

    expect(screen.getByText("Học sinh gần đây")).toBeTruthy();
    expect(screen.getByText("Nguyen Van A")).toBeTruthy();
    expect(screen.getByText("nguyenvana@gmail.com")).toBeTruthy();
    expect(screen.getByText("Lớp 10A1")).toBeTruthy();
  });

  it("renders empty state when no students exist", () => {
    render(<StudentListOverview students={[]} totalStudentsCount={0} />);

    expect(screen.getByText("Học sinh gần đây")).toBeTruthy();
    expect(screen.getByText("Chưa có học sinh nào")).toBeTruthy();
  });
});
