import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ValidationErrorItem(BaseModel):
    location: str
    message: str
    severity: str = "error"
    row_index: int | None = None



class ExerciseQuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    position: int
    question_text: str
    question_type: str
    options: list[str] | None
    correct_answer: str


class ExerciseQuestionInput(BaseModel):
    question_text: str = Field(min_length=1)
    question_type: str
    options: list[str] | None = None
    correct_answer: str


class VocabularyItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    position: int
    word: str
    definition: str
    translation: str | None
    example: str | None


class VocabularyItemInput(BaseModel):
    word: str = Field(min_length=1)
    definition: str = Field(min_length=1)
    translation: str | None = None
    example: str | None = None


class LearningContentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    title: str
    description: str | None
    status: str
    source_file_name: str | None
    source_format: str | None
    document_body: str | None
    validation_errors: list[ValidationErrorItem] | None
    created_at: datetime
    updated_at: datetime


class LearningContentWithItems(LearningContentRead):
    questions: list[ExerciseQuestionRead] = []
    vocabulary_items: list[VocabularyItemRead] = []


class LearningContentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    document_body: str | None = None
    vocabulary_items: list[VocabularyItemInput] | None = None
    questions: list[ExerciseQuestionInput] | None = None


class AssignmentCreate(BaseModel):
    classroom_id: uuid.UUID
    due_at: datetime | None = None


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    content_id: uuid.UUID
    classroom_id: uuid.UUID
    assigned_by: uuid.UUID
    assigned_at: datetime
    due_at: datetime | None


class StudentAssignmentRead(BaseModel):
    assignment: AssignmentRead
    content: LearningContentWithItems


class ClassroomAssignmentItemRead(BaseModel):
    assignment: AssignmentRead
    content: LearningContentRead

