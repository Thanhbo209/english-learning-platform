import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signUp = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signUp } }),
}));

import { SignupForm } from "./signup-form";

describe("SignupForm", () => {
  beforeEach(() => {
    signUp.mockClear();
  });

  it("shows an error message when sign-up fails", async () => {
    signUp.mockResolvedValue({ error: { message: "User already registered" } });
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("User already registered")).toBeTruthy();
    });
  });

  it("shows a confirmation message on success", async () => {
    signUp.mockResolvedValue({ error: null });
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeTruthy();
    });
  });
});
