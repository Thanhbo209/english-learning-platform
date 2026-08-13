import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const joinClassroom = vi.fn();
vi.mock("@/lib/classrooms-client", () => ({
  joinClassroom: (...args: unknown[]) => joinClassroom(...args),
}));

import { JoinConfirmCard } from "./join-confirm-card";

const preview = {
  classroom_name: "Lớp A1",
  teacher_email: "teacher@englisheveryday.test",
  teacher_full_name: null,
};

describe("JoinConfirmCard", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    joinClassroom.mockClear();
  });

  it("shows the classroom and teacher from the preview", () => {
    render(<JoinConfirmCard token="tok-123" preview={preview} />);

    expect(screen.getByText("Lớp A1")).toBeTruthy();
    expect(screen.getByText(/teacher@englisheveryday.test/)).toBeTruthy();
  });

  it("shows an error message when joining fails", async () => {
    joinClassroom.mockRejectedValue(new Error("Already joined this classroom"));
    render(<JoinConfirmCard token="tok-123" preview={preview} />);

    fireEvent.click(screen.getByRole("button", { name: /tham gia lớp học/i }));

    await waitFor(() => {
      expect(screen.getByText("Already joined this classroom")).toBeTruthy();
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to the classroom on successful join", async () => {
    joinClassroom.mockResolvedValue({ id: "classroom-1" });
    render(<JoinConfirmCard token="tok-123" preview={preview} />);

    fireEvent.click(screen.getByRole("button", { name: /tham gia lớp học/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard/classrooms/classroom-1");
    });
  });
});
