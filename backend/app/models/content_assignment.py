import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ContentAssignment(Base):
    __tablename__ = "content_assignments"
    __table_args__ = (
        UniqueConstraint("content_id", "classroom_id", name="uq_content_classroom"),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    content_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("public.learning_content.id", ondelete="CASCADE"), nullable=False
    )
    classroom_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("public.classrooms.id", ondelete="CASCADE"), nullable=False
    )
    assigned_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    due_at: Mapped[datetime | None] = mapped_column()
