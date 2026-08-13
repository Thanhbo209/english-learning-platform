import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_bearer_token, get_owned_content, require_teacher_or_admin
from app.core.security import get_role
from app.db.session import get_db
from app.models.content_assignment import ContentAssignment
from app.models.learning_content import LearningContent
from app.schemas.learning_content import (
    AssignmentCreate,
    AssignmentRead,
    LearningContentRead,
    LearningContentUpdate,
    LearningContentWithItems,
)
from app.services import assignment_service, learning_content_service

router = APIRouter(prefix="/learning-content", tags=["learning-content"])

VALID_CONTENT_TYPES = {"learning_document", "exercise", "vocabulary"}
VALID_SOURCE_FORMATS = {"docx", "xlsx", "pdf", "csv"}
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50MB


def _with_items(db: Session, content: LearningContent) -> LearningContentWithItems:
    questions, vocabulary_items = learning_content_service.get_items(db, content)
    return LearningContentWithItems(
        **LearningContentRead.model_validate(content).model_dump(),
        questions=questions,
        vocabulary_items=vocabulary_items,
    )


@router.post("/import", response_model=LearningContentRead, status_code=status.HTTP_201_CREATED)
async def import_content(
    file: UploadFile,
    content_type: Annotated[str, Form()],
    title: Annotated[str, Form()],
    description: Annotated[str | None, Form()] = None,
    db: Session = Depends(get_db),
    token: str = Depends(get_bearer_token),
    user: dict = Depends(require_teacher_or_admin),
) -> LearningContent:
    if content_type not in VALID_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid content type: {content_type}",
        )

    source_format = (file.filename or "").rsplit(".", 1)[-1].lower()
    if source_format not in VALID_SOURCE_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Unsupported file format: {source_format}",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large (max 50MB)",
        )

    return learning_content_service.create_content(
        db,
        uuid.UUID(user["sub"]),
        token,
        content_type,
        title,
        description,
        file.filename or "upload",
        source_format,
        file_bytes,
    )


@router.get("/mine", response_model=list[LearningContentRead])
def list_my_content(
    db: Session = Depends(get_db),
    user: dict = Depends(require_teacher_or_admin),
) -> list[LearningContent]:
    return learning_content_service.list_owned(db, uuid.UUID(user["sub"]))


@router.get("/{content_id}", response_model=LearningContentWithItems)
def get_content_detail(
    db: Session = Depends(get_db),
    content: LearningContent = Depends(get_owned_content),
) -> LearningContentWithItems:
    return _with_items(db, content)


@router.patch("/{content_id}", response_model=LearningContentWithItems)
def update_content(
    payload: LearningContentUpdate,
    db: Session = Depends(get_db),
    content: LearningContent = Depends(get_owned_content),
) -> LearningContentWithItems:
    vocabulary_items = (
        [item.model_dump() for item in payload.vocabulary_items]
        if payload.vocabulary_items is not None
        else None
    )
    questions = (
        [question.model_dump() for question in payload.questions]
        if payload.questions is not None
        else None
    )

    updated = learning_content_service.update_content(
        db,
        content,
        payload.title,
        payload.description,
        payload.document_body,
        vocabulary_items,
        questions,
    )
    return _with_items(db, updated)


@router.post("/{content_id}/publish", response_model=LearningContentRead)
def publish_content(
    db: Session = Depends(get_db),
    content: LearningContent = Depends(get_owned_content),
) -> LearningContent:
    try:
        return learning_content_service.publish_content(db, content)
    except learning_content_service.InvalidPublishStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    db: Session = Depends(get_db),
    content: LearningContent = Depends(get_owned_content),
) -> None:
    learning_content_service.delete_content(db, content)


@router.post(
    "/{content_id}/assignments",
    response_model=AssignmentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    content: LearningContent = Depends(get_owned_content),
    user: dict = Depends(require_teacher_or_admin),
) -> ContentAssignment:
    is_admin = get_role(user) == "admin"
    try:
        return assignment_service.create_assignment(
            db, content, payload.classroom_id, uuid.UUID(user["sub"]), is_admin, payload.due_at
        )
    except assignment_service.ClassroomNotOwnedError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not the classroom owner"
        ) from exc
    except assignment_service.AlreadyAssignedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already assigned to this classroom",
        ) from exc


@router.get("/{content_id}/assignments", response_model=list[AssignmentRead])
def list_assignments(
    db: Session = Depends(get_db),
    content: LearningContent = Depends(get_owned_content),
) -> list[ContentAssignment]:
    return assignment_service.list_for_content(db, content.id)
