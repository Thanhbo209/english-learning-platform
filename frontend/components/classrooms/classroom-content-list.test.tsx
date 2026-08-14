import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ClassroomAssignmentItem } from "@/types/content";
import { ClassroomContentList } from "./classroom-content-list";

describe("ClassroomContentList", () => {
  it("renders empty state when no assignments are present", () => {
    render(<ClassroomContentList assignments={[]} />);
    expect(screen.getByText("Chưa có nội dung nào được giao")).toBeTruthy();
    expect(
      screen.getByText(
        "Nội dung bài học, bài tập hoặc từ vựng được giao cho lớp này sẽ xuất hiện ở đây.",
      ),
    ).toBeTruthy();
  });

  it("renders assigned items with correct Vietnamese badges and titles", () => {
    const mockAssignments: ClassroomAssignmentItem[] = [
      {
        assignment: {
          id: "assign-1",
          content_id: "content-1",
          classroom_id: "classroom-1",
          assigned_by: "teacher-1",
          assigned_at: "2026-08-14T10:00:00Z",
          due_at: "2026-08-20T23:59:00Z",
        },
        content: {
          id: "content-1",
          type: "vocabulary",
          title: "Từ vựng Bài 1",
          description: "Danh sách 20 từ vựng chủ đề gia đình",
          status: "published",
          source_file_name: "vocab.csv",
          source_format: "csv",
          document_body: null,
          validation_errors: null,
          created_at: "2026-08-14T09:00:00Z",
          updated_at: "2026-08-14T09:00:00Z",
        },
      },
      {
        assignment: {
          id: "assign-2",
          content_id: "content-2",
          classroom_id: "classroom-1",
          assigned_by: "teacher-1",
          assigned_at: "2026-08-14T11:00:00Z",
          due_at: null,
        },
        content: {
          id: "content-2",
          type: "exercise",
          title: "Bài tập Thì Quá Khứ Đơn",
          description: null,
          status: "published",
          source_file_name: "quiz.xlsx",
          source_format: "xlsx",
          document_body: null,
          validation_errors: null,
          created_at: "2026-08-14T09:00:00Z",
          updated_at: "2026-08-14T09:00:00Z",
        },
      },
    ];

    render(<ClassroomContentList assignments={mockAssignments} />);

    expect(screen.getByText("Từ vựng Bài 1")).toBeTruthy();
    expect(screen.getByText("Bài tập Thì Quá Khứ Đơn")).toBeTruthy();
    expect(screen.getAllByText("Từ vựng").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bài tập").length).toBeGreaterThan(0);
    expect(screen.getByText("Không có hạn nộp")).toBeTruthy();

  });
});
