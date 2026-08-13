import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClassroom = vi.fn();
vi.mock("@/lib/classrooms-client", () => ({
  createClassroom: (...args: unknown[]) => createClassroom(...args),
}));

import { CreateClassroomForm } from "./create-classroom-form";

describe("CreateClassroomForm", () => {
  beforeEach(() => {
    createClassroom.mockClear();
  });

  it("shows an error message when creation fails", async () => {
    createClassroom.mockRejectedValue(new Error("Insufficient permissions"));
    const onSuccess = vi.fn();
    render(<CreateClassroomForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText("Tên lớp học"), {
      target: { value: "Lớp A1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /tạo lớp học/i }));

    await waitFor(() => {
      expect(screen.getByText("Insufficient permissions")).toBeTruthy();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onSuccess with the created classroom", async () => {
    const classroom = { id: "classroom-1", name: "Lớp A1" };
    createClassroom.mockResolvedValue(classroom);
    const onSuccess = vi.fn();
    render(<CreateClassroomForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText("Tên lớp học"), {
      target: { value: "Lớp A1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /tạo lớp học/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(classroom);
    });
  });
});
