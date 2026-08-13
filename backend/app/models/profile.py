import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

UserRole = Enum("admin", "teacher", "student", name="user_role", create_type=False)


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[str] = mapped_column(UserRole, nullable=False, server_default="student")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
