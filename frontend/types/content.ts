export type ContentType = "learning_document" | "exercise" | "vocabulary";
export type ContentStatus = "ready_for_review" | "validation_failed" | "published" | "failed";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export type ValidationErrorItem = {
  location: string;
  message: string;
  severity?: "error" | "warning";
  row_index?: number | null;
};

export type ColumnMappingSuggestion = {
  headers: string[];
  suggested_mapping: Record<string, string | string[]>;
  missing_required_fields: string[];
  unrecognized_headers: string[];
};


export type ExerciseQuestion = {
  id: string;
  position: number;
  question_text: string;
  question_type: QuestionType;
  options: string[] | null;
  correct_answer: string;
};

export type VocabularyItem = {
  id: string;
  position: number;
  word: string;
  definition: string;
  translation: string | null;
  example: string | null;
};

export type LearningContent = {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  status: ContentStatus;
  source_file_name: string | null;
  source_format: string | null;
  document_body: string | null;
  validation_errors: ValidationErrorItem[] | null;
  created_at: string;
  updated_at: string;
};

export type LearningContentWithItems = LearningContent & {
  questions: ExerciseQuestion[];
  vocabulary_items: VocabularyItem[];
};

export type ContentAssignment = {
  id: string;
  content_id: string;
  classroom_id: string;
  assigned_by: string;
  assigned_at: string;
  due_at: string | null;
};

export type StudentAssignment = {
  assignment: ContentAssignment;
  content: LearningContentWithItems;
};

export type ClassroomAssignmentItem = {
  assignment: ContentAssignment;
  content: LearningContent;
};

