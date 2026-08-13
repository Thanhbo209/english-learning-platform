import uuid

from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuthUser(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    email: Mapped[str | None] = mapped_column()
    raw_user_meta_data: Mapped[dict | None] = mapped_column(JSON)

    @property
    def full_name(self) -> str | None:
        return (self.raw_user_meta_data or {}).get("full_name")
