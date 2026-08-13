import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ClassroomCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class ClassroomUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class ClassroomRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    join_token: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class ClassroomListItem(ClassroomRead):
    students_count: int


class EnrolledStudent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: uuid.UUID
    email: str | None
    full_name: str | None
    joined_at: datetime


class ClassroomWithStudents(ClassroomRead):
    students: list[EnrolledStudent]


class ClassroomInvitePreview(BaseModel):
    classroom_name: str
    teacher_email: str | None
    teacher_full_name: str | None
