import logging
import uuid
from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, get_role, verify_token
from app.db.session import get_db
from app.models.classroom import Classroom
from app.services import classroom_service

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    try:
        return verify_token(credentials.credentials)
    except InvalidTokenError as exc:
        logger.warning("Token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def require_role(*roles: str) -> Callable[[dict], dict]:
    def check_role(user: dict = Depends(get_current_user)) -> dict:
        if get_role(user) not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return check_role


require_teacher_or_admin = require_role("teacher", "admin")
require_student_or_admin = require_role("student", "admin")


def get_owned_classroom(
    classroom_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> Classroom:
    try:
        classroom = classroom_service.get_classroom(db, classroom_id)
    except classroom_service.ClassroomNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Classroom not found"
        ) from exc

    is_admin = get_role(user) == "admin"
    try:
        classroom_service.assert_owner(classroom, uuid.UUID(user["sub"]), is_admin)
    except classroom_service.NotClassroomOwnerError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not the classroom owner"
        ) from exc

    return classroom
