import uuid

from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VocabularyItem(Base):
    __tablename__ = "vocabulary_items"
    __table_args__ = {"schema": "public"}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    content_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("public.learning_content.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(nullable=False)
    word: Mapped[str] = mapped_column(Text, nullable=False)
    definition: Mapped[str] = mapped_column(Text, nullable=False)
    translation: Mapped[str | None] = mapped_column(Text)
    example: Mapped[str | None] = mapped_column(Text)
