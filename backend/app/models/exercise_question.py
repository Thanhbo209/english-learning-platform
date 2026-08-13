import uuid

from sqlalchemy import JSON, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

QuestionType = Enum(
    "multiple_choice", "true_false", "short_answer", name="question_type", create_type=False
)


class ExerciseQuestion(Base):
    __tablename__ = "exercise_questions"
    __table_args__ = {"schema": "public"}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    content_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("public.learning_content.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(QuestionType, nullable=False)
    options: Mapped[list | None] = mapped_column(JSON)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
