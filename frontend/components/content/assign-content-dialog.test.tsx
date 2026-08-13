import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const createAssignment = vi.fn();
vi.mock("@/lib/content-client", () => ({
  createAssignment: (...args: unknown[]) => createAssignment(...args),
}));

import { AssignContentDialog } from "./assign-content-dialog";

const classrooms = [
  {
    id: "classroom-1",
    name: "Lớp A1",
    description: null,
    join_token: "token",
    is_archived: false,
    created_at: "",
    updated_at: "",
    students_count: 5,
  },
];

describe("AssignContentDialog", () => {
  beforeEach(() => {
    refresh.mockClear();
    createAssignment.mockClear();
  });

  it("shows an error message when assignment fails", async () => {
    createAssignment.mockRejectedValue(new Error("Already assigned to this classroom"));
    render(<AssignContentDialog contentId="content-1" classrooms={classrooms} />);

    fireEvent.click(screen.getByRole("button", { name: "Giao cho lớp học" }));
    fireEvent.click(screen.getByRole("button", { name: "Giao bài" }));

    await waitFor(() => {
      expect(screen.getByText("Already assigned to this classroom")).toBeTruthy();
    });
  });

  it("assigns content to the selected classroom", async () => {
    createAssignment.mockResolvedValue({ id: "assignment-1" });
    render(<AssignContentDialog contentId="content-1" classrooms={classrooms} />);

    fireEvent.click(screen.getByRole("button", { name: "Giao cho lớp học" }));
    fireEvent.click(screen.getByRole("button", { name: "Giao bài" }));

    await waitFor(() => {
      expect(createAssignment).toHaveBeenCalledWith("content-1", { classroomId: "classroom-1" });
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("shows a message when the teacher has no classrooms", () => {
    render(<AssignContentDialog contentId="content-1" classrooms={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "Giao cho lớp học" }));

    expect(screen.getByText("Bạn chưa có lớp học nào.")).toBeTruthy();
  });
});
