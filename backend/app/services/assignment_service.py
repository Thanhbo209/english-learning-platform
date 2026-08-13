import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.classroom import Classroom
from app.models.classroom_enrollment import ClassroomEnrollment
from app.models.content_assignment import ContentAssignment
from app.models.learning_content import LearningContent


class AssignmentNotFoundError(Exception):
    pass


class NotAssignmentOwnerError(Exception):
    pass


class AlreadyAssignedError(Exception):
    pass


class ClassroomNotOwnedError(Exception):
    pass


class NotAssignedError(Exception):
    pass


def create_assignment(
    db: Session,
    content: LearningContent,
    classroom_id: uuid.UUID,
    assigned_by: uuid.UUID,
    is_admin: bool,
    due_at: datetime | None,
) -> ContentAssignment:
    classroom = db.get(Classroom, classroom_id)
    if classroom is None or (not is_admin and classroom.teacher_id != assigned_by):
        raise ClassroomNotOwnedError

    existing = db.scalar(
        select(ContentAssignment).where(
            ContentAssignment.content_id == content.id,
            ContentAssignment.classroom_id == classroom_id,
        )
    )
    if existing is not None:
        raise AlreadyAssignedError

    assignment = ContentAssignment(
        content_id=content.id,
        classroom_id=classroom_id,
        assigned_by=assigned_by,
        due_at=due_at,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def list_for_content(db: Session, content_id: uuid.UUID) -> list[ContentAssignment]:
    stmt = (
        select(ContentAssignment)
        .where(ContentAssignment.content_id == content_id)
        .order_by(ContentAssignment.assigned_at.desc())
    )
    return list(db.scalars(stmt))


def get_assignment(db: Session, assignment_id: uuid.UUID) -> ContentAssignment:
    assignment = db.get(ContentAssignment, assignment_id)
    if assignment is None:
        raise AssignmentNotFoundError
    return assignment


def delete_assignment(
    db: Session, assignment: ContentAssignment, user_id: uuid.UUID, is_admin: bool
) -> None:
    if not is_admin and assignment.assigned_by != user_id:
        raise NotAssignmentOwnerError
    db.delete(assignment)
    db.commit()


def list_for_student(
    db: Session, student_id: uuid.UUID
) -> list[tuple[ContentAssignment, LearningContent]]:
    stmt = (
        select(ContentAssignment, LearningContent)
        .join(LearningContent, LearningContent.id == ContentAssignment.content_id)
        .join(
            ClassroomEnrollment,
            ClassroomEnrollment.classroom_id == ContentAssignment.classroom_id,
        )
        .where(
            ClassroomEnrollment.student_id == student_id,
            LearningContent.status == "published",
        )
        .order_by(ContentAssignment.assigned_at.desc())
    )
    return list(db.execute(stmt).all())


def get_for_student(
    db: Session, assignment_id: uuid.UUID, student_id: uuid.UUID
) -> tuple[ContentAssignment, LearningContent]:
    assignment = db.get(ContentAssignment, assignment_id)
    if assignment is None:
        raise AssignmentNotFoundError

    content = db.get(LearningContent, assignment.content_id)
    if content is None or content.status != "published":
        raise AssignmentNotFoundError

    is_member = db.scalar(
        select(ClassroomEnrollment).where(
            ClassroomEnrollment.classroom_id == assignment.classroom_id,
            ClassroomEnrollment.student_id == student_id,
        )
    )
    if is_member is None:
        raise NotAssignedError

    return assignment, content
