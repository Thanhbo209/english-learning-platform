import secrets
import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.auth_user import AuthUser
from app.models.classroom import Classroom
from app.models.classroom_enrollment import ClassroomEnrollment


class ClassroomNotFoundError(Exception):
    pass


class NotClassroomOwnerError(Exception):
    pass


class AlreadyEnrolledError(Exception):
    pass


class NotEnrolledError(Exception):
    pass


def _generate_join_token() -> str:
    return secrets.token_urlsafe(32)


def create_classroom(
    db: Session, teacher_id: uuid.UUID, name: str, description: str | None
) -> Classroom:
    classroom = Classroom(
        name=name,
        description=description,
        teacher_id=teacher_id,
        join_token=_generate_join_token(),
    )
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return classroom


def get_classroom(db: Session, classroom_id: uuid.UUID) -> Classroom:
    classroom = db.get(Classroom, classroom_id)
    if classroom is None:
        raise ClassroomNotFoundError
    return classroom


def assert_owner(classroom: Classroom, user_id: uuid.UUID, is_admin: bool) -> None:
    if not is_admin and classroom.teacher_id != user_id:
        raise NotClassroomOwnerError


def list_owned_with_counts(db: Session, teacher_id: uuid.UUID) -> list[tuple[Classroom, int]]:
    stmt = (
        select(Classroom, func.count(ClassroomEnrollment.id))
        .outerjoin(ClassroomEnrollment, ClassroomEnrollment.classroom_id == Classroom.id)
        .where(Classroom.teacher_id == teacher_id)
        .group_by(Classroom.id)
        .order_by(Classroom.created_at.desc())
    )
    return [(classroom, count) for classroom, count in db.execute(stmt).all()]


def update_classroom(
    db: Session, classroom: Classroom, name: str | None, description: str | None
) -> Classroom:
    if name is not None:
        classroom.name = name
    if description is not None:
        classroom.description = description
    db.commit()
    db.refresh(classroom)
    return classroom


def set_archived(db: Session, classroom: Classroom, archived: bool) -> Classroom:
    classroom.is_archived = archived
    db.commit()
    db.refresh(classroom)
    return classroom


def delete_classroom(db: Session, classroom: Classroom) -> None:
    db.delete(classroom)
    db.commit()


def rotate_join_token(db: Session, classroom: Classroom) -> Classroom:
    classroom.join_token = _generate_join_token()
    db.commit()
    db.refresh(classroom)
    return classroom


def get_classroom_by_token(db: Session, token: str) -> Classroom:
    classroom = db.scalar(select(Classroom).where(Classroom.join_token == token))
    if classroom is None or classroom.is_archived:
        raise ClassroomNotFoundError
    return classroom


def get_teacher_info(db: Session, teacher_id: uuid.UUID) -> tuple[str | None, str | None]:
    teacher = db.get(AuthUser, teacher_id)
    if teacher is None:
        return None, None
    return teacher.email, teacher.full_name


def join_by_token(db: Session, token: str, student_id: uuid.UUID) -> Classroom:
    classroom = get_classroom_by_token(db, token)

    existing = db.scalar(
        select(ClassroomEnrollment).where(
            ClassroomEnrollment.classroom_id == classroom.id,
            ClassroomEnrollment.student_id == student_id,
        )
    )
    if existing is not None:
        raise AlreadyEnrolledError

    db.add(ClassroomEnrollment(classroom_id=classroom.id, student_id=student_id))
    db.commit()
    return classroom


def leave_classroom(db: Session, classroom_id: uuid.UUID, student_id: uuid.UUID) -> None:
    enrollment = db.scalar(
        select(ClassroomEnrollment).where(
            ClassroomEnrollment.classroom_id == classroom_id,
            ClassroomEnrollment.student_id == student_id,
        )
    )
    if enrollment is None:
        raise NotEnrolledError
    db.delete(enrollment)
    db.commit()


def list_enrolled(db: Session, student_id: uuid.UUID) -> list[Classroom]:
    stmt = (
        select(Classroom)
        .join(ClassroomEnrollment, ClassroomEnrollment.classroom_id == Classroom.id)
        .where(ClassroomEnrollment.student_id == student_id)
        .order_by(ClassroomEnrollment.joined_at.desc())
    )
    return list(db.scalars(stmt))


def list_students(
    db: Session, classroom_id: uuid.UUID
) -> list[tuple[uuid.UUID, str | None, str | None, datetime]]:
    stmt = (
        select(
            ClassroomEnrollment.student_id,
            AuthUser.email,
            AuthUser.raw_user_meta_data,
            ClassroomEnrollment.joined_at,
        )
        .join(AuthUser, AuthUser.id == ClassroomEnrollment.student_id)
        .where(ClassroomEnrollment.classroom_id == classroom_id)
        .order_by(ClassroomEnrollment.joined_at.asc())
    )
    return [
        (student_id, email, (meta or {}).get("full_name"), joined_at)
        for student_id, email, meta, joined_at in db.execute(stmt).all()
    ]
