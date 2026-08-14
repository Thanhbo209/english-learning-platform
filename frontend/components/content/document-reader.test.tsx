import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DocumentReader } from "./document-reader";

describe("DocumentReader", () => {
  it("renders empty document state gracefully", () => {
    render(<DocumentReader title="Bài học trống" body="" />);
    expect(screen.getByText("Bài học trống")).toBeTruthy();
    expect(screen.getByText("Chưa có nội dung văn bản cho tài liệu này.")).toBeTruthy();
  });

  it("renders exact text with whitespace-pre-wrap and handles font size controls", () => {
    const rawBody = "Unit 1: Greetings\n\nLine 1\nLine 2   Indented Text";

    const { container } = render(
      <DocumentReader
        title="Tiếng Anh Unit 1"
        description="Tài liệu đọc"
        body={rawBody}
      />,
    );

    expect(screen.getByText("Tiếng Anh Unit 1")).toBeTruthy();
    expect(screen.getByText("Tài liệu đọc")).toBeTruthy();

    const bodyElement = container.querySelector(".whitespace-pre-wrap");
    expect(bodyElement).toBeTruthy();
    expect(bodyElement?.textContent).toBe(rawBody);

    // Font size controls toggle test
    const largeFontBtn = screen.getByRole("button", { name: "A+" });
    fireEvent.click(largeFontBtn);
    expect(bodyElement?.className).toContain("text-lg");
  });

  it("handles copy button click", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<DocumentReader title="Document Title" body="Sample document body" />);

    const copyBtn = screen.getByRole("button", { name: /Sao chép/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("Sample document body");
  });
});
