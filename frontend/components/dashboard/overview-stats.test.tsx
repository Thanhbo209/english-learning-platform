import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverviewStats } from "./overview-stats";

describe("OverviewStats", () => {
  it("renders teacher statistics correctly", () => {
    render(
      <OverviewStats
        stats={{
          type: "teacher",
          data: {
            activeClassrooms: 4,
            totalStudents: 38,
            publishedContent: 12,
            draftContent: 3,
          },
        }}
      />,
    );

    expect(screen.getByText("Lớp học hoạt động")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("Tổng số học sinh")).toBeTruthy();
    expect(screen.getByText("38")).toBeTruthy();
    expect(screen.getByText("Nội dung đã xuất bản")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Nội dung bản nháp")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders student statistics correctly", () => {
    render(
      <OverviewStats
        stats={{
          type: "student",
          data: {
            enrolledClassrooms: 2,
            totalAssignments: 7,
          },
        }}
      />,
    );

    expect(screen.getByText("Lớp học đã tham gia")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Bài học được giao")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
  });
});
