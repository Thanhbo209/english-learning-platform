export type Classroom = {
  id: string;
  name: string;
  description: string | null;
  join_token: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type ClassroomListItem = Classroom & {
  students_count: number;
};

export type EnrolledStudent = {
  student_id: string;
  email: string | null;
  joined_at: string;
};

export type ClassroomWithStudents = Classroom & {
  students: EnrolledStudent[];
};

export type ClassroomInvitePreview = {
  classroom_name: string;
  teacher_email: string | null;
};
