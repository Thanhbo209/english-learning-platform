import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentReader } from "./document-reader";

describe("DocumentReader", () => {
  it("renders empty document state gracefully", () => {
    render(<DocumentReader title="Bài học trống" body="" />);
    expect(screen.getByText("Bài học trống")).toBeTruthy();
    expect(screen.getByText("Chưa có nội dung văn bản cho bài học này.")).toBeTruthy();
  });

  it("renders parsed document blocks and handles font size toggles", () => {
    const sampleBody = `
# UNIT 1: FAMILY
This is the **main paragraph** introducing *grammar*.

Note: Pay attention to verb tenses.

1. What is the past form of go?
A. Went B. Gone C. Going D. Goes
`;

    render(
      <DocumentReader
        title="Tiếng Anh Unit 1"
        description="Tài liệu tự học"
        body={sampleBody}
      />,
    );

    expect(screen.getByText("Tiếng Anh Unit 1")).toBeTruthy();
    expect(screen.getByText("Tài liệu tự học")).toBeTruthy();
    expect(screen.getByText("UNIT 1: FAMILY")).toBeTruthy();
    expect(screen.getByText("Note")).toBeTruthy();
    expect(screen.getByText("What is the past form of go?")).toBeTruthy();
    expect(screen.getByText("Went")).toBeTruthy();

    // Toggle Font Size controls
    const largeFontButton = screen.getByRole("button", { name: "A+" });
    fireEvent.click(largeFontButton);
    expect(largeFontButton.className).toContain("bg-background");
  });
});
