import uuid
from datetime import datetime

from sqlalchemy import JSON, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

ContentType = Enum(
    "learning_document", "exercise", "vocabulary", name="content_type", create_type=False
)
ContentStatus = Enum(
    "ready_for_review",
    "validation_failed",
    "published",
    "failed",
    name="content_status",
    create_type=False,
)
SourceFormat = Enum("docx", "xlsx", "pdf", "csv", name="source_format", create_type=False)


class LearningContent(Base):
    __tablename__ = "learning_content"
    __table_args__ = {"schema": "public"}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(ContentType, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(ContentStatus, nullable=False)
    source_file_path: Mapped[str | None] = mapped_column(Text)
    source_file_name: Mapped[str | None] = mapped_column(Text)
    source_format: Mapped[str | None] = mapped_column(SourceFormat)
    document_body: Mapped[str | None] = mapped_column(Text)
    validation_errors: Mapped[list | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )
