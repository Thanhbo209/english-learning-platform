import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_student_or_admin, require_teacher_or_admin
from app.core.security import get_role
from app.db.session import get_db
from app.models.content_assignment import ContentAssignment
from app.models.learning_content import LearningContent
from app.schemas.learning_content import (
    AssignmentRead,
    LearningContentRead,
    LearningContentWithItems,
    StudentAssignmentRead,
)
from app.services import assignment_service, learning_content_service

router = APIRouter(prefix="/assignments", tags=["assignments"])


def _to_student_assignment_read(
    db: Session, assignment: ContentAssignment, content: LearningContent
) -> StudentAssignmentRead:
    questions, vocabulary_items = learning_content_service.get_items(db, content)
    return StudentAssignmentRead(
        assignment=AssignmentRead.model_validate(assignment),
        content=LearningContentWithItems(
            **LearningContentRead.model_validate(content).model_dump(),
            questions=questions,
            vocabulary_items=vocabulary_items,
        ),
    )


@router.get("/mine", response_model=list[StudentAssignmentRead])
def list_my_assignments(
    db: Session = Depends(get_db),
    user: dict = Depends(require_student_or_admin),
) -> list[StudentAssignmentRead]:
    rows = assignment_service.list_for_student(db, uuid.UUID(user["sub"]))
    return [_to_student_assignment_read(db, assignment, content) for assignment, content in rows]


@router.get("/{assignment_id}", response_model=StudentAssignmentRead)
def get_my_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(require_student_or_admin),
) -> StudentAssignmentRead:
    try:
        assignment, content = assignment_service.get_for_student(
            db, assignment_id, uuid.UUID(user["sub"])
        )
    except assignment_service.AssignmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
        ) from exc
    except assignment_service.NotAssignedError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this classroom",
        ) from exc

    return _to_student_assignment_read(db, assignment, content)


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(require_teacher_or_admin),
) -> None:
    try:
        assignment = assignment_service.get_assignment(db, assignment_id)
    except assignment_service.AssignmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
        ) from exc

    is_admin = get_role(user) == "admin"
    try:
        assignment_service.delete_assignment(db, assignment, uuid.UUID(user["sub"]), is_admin)
    except assignment_service.NotAssignmentOwnerError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not the assignment owner"
        ) from exc
