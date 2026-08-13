export type ApiHealthResponse = {
  status: string;
};

export type UserRole = "admin" | "teacher" | "student";

export type CurrentUser = {
  id: string;
  email: string | null;
  role: UserRole | null;
  full_name: string | null;
};
