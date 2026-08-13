import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const importContent = vi.fn();
vi.mock("@/lib/content-client", () => ({
  importContent: (...args: unknown[]) => importContent(...args),
}));

import { ImportContentForm } from "./import-content-form";

function selectFile() {
  const file = new File(["word,definition\ncat,a small animal"], "vocab.csv", {
    type: "text/csv",
  });
  fireEvent.change(screen.getByLabelText("Tệp tải lên"), { target: { files: [file] } });
}

describe("ImportContentForm", () => {
  beforeEach(() => {
    importContent.mockClear();
  });

  it("shows an error message when import fails", async () => {
    importContent.mockRejectedValue(new Error("Unsupported file format"));
    const onSuccess = vi.fn();
    render(<ImportContentForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Từ vựng bài 1" } });
    selectFile();
    fireEvent.click(screen.getByRole("button", { name: /tải lên và xử lý/i }));

    await waitFor(() => {
      expect(screen.getByText("Unsupported file format")).toBeTruthy();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onSuccess with the imported content", async () => {
    const content = { id: "content-1", title: "Từ vựng bài 1" };
    importContent.mockResolvedValue(content);
    const onSuccess = vi.fn();
    render(<ImportContentForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Từ vựng bài 1" } });
    selectFile();
    fireEvent.click(screen.getByRole("button", { name: /tải lên và xử lý/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(content);
    });
  });
});
