import logging
import uuid
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.exercise_question import ExerciseQuestion
from app.models.learning_content import LearningContent
from app.models.vocabulary_item import VocabularyItem
from app.services import storage_service
from app.services.content_import.importers import FileImportError, RawContent, import_file
from app.services.content_import.normalizers import (
    DocumentData,
    ExerciseQuestionData,
    NormalizationError,
    VocabularyItemData,
    normalize_document,
    normalize_exercise,
    normalize_vocabulary,
)
from app.services.content_import.validators import (
    ValidationIssue,
    validate_document,
    validate_exercise,
    validate_vocabulary,
)

logger = logging.getLogger(__name__)

NormalizedContent = DocumentData | list[VocabularyItemData] | list[ExerciseQuestionData]

_CONTENT_TYPE_MIME = {
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pdf": "application/pdf",
    "csv": "text/csv",
}


class ContentNotFoundError(Exception):
    pass


class NotContentOwnerError(Exception):
    pass


class InvalidPublishStateError(Exception):
    pass


def _issues_to_dicts(issues: list[ValidationIssue]) -> list[dict[str, str]]:
    return [{"location": issue.location, "message": issue.message} for issue in issues]


def _normalize_and_validate(
    content_type: str, raw: RawContent
) -> tuple[NormalizedContent, list[ValidationIssue]]:
    if content_type == "learning_document":
        normalized = normalize_document(raw)
        return normalized, validate_document(normalized)
    if content_type == "vocabulary":
        normalized = normalize_vocabulary(raw)
        return normalized, validate_vocabulary(normalized)
    if content_type == "exercise":
        normalized = normalize_exercise(raw)
        return normalized, validate_exercise(normalized)
    raise ValueError(f"Unknown content type: {content_type}")


def _persist_normalized(
    db: Session, content: LearningContent, content_type: str, normalized: NormalizedContent
) -> None:
    if content_type == "learning_document":
        content.document_body = normalized.body
        return

    if content_type == "vocabulary":
        db.execute(delete(VocabularyItem).where(VocabularyItem.content_id == content.id))
        for position, item in enumerate(normalized):
            db.add(
                VocabularyItem(
                    content_id=content.id,
                    position=position,
                    word=item.word,
                    definition=item.definition,
                    translation=item.translation,
                    example=item.example,
                )
            )
        return

    if content_type == "exercise":
        db.execute(delete(ExerciseQuestion).where(ExerciseQuestion.content_id == content.id))
        for position, question in enumerate(normalized):
            db.add(
                ExerciseQuestion(
                    content_id=content.id,
                    position=position,
                    question_text=question.question_text,
                    question_type=question.question_type,
                    options=question.options,
                    correct_answer=question.correct_answer,
                )
            )
        return


def create_content(
    db: Session,
    teacher_id: uuid.UUID,
    token: str,
    content_type: str,
    title: str,
    description: str | None,
    file_name: str,
    source_format: str,
    file_bytes: bytes,
) -> LearningContent:
    content = LearningContent(
        teacher_id=teacher_id,
        type=content_type,
        title=title,
        description=description,
        status="failed",
        source_file_name=file_name,
        source_format=source_format,
    )
    db.add(content)
    db.flush()

    # Persist the original file for audit/re-import. Non-fatal: the
    # normalized content (below) is the real application representation,
    # so a storage hiccup shouldn't block the import itself.
    storage_path = f"{teacher_id}/{content.id}/{file_name}"
    mime_type = _CONTENT_TYPE_MIME.get(source_format, "application/octet-stream")
    try:
        storage_service.upload_object(token, storage_path, file_bytes, mime_type)
        content.source_file_path = storage_path
    except storage_service.StorageError:
        logger.warning("Failed to persist source file to storage for content %s", content.id)

    try:
        raw = import_file(source_format, file_bytes)
    except FileImportError as exc:
        content.status = "failed"
        content.validation_errors = [{"location": "file", "message": str(exc)}]
        db.commit()
        db.refresh(content)
        return content

    try:
        normalized, issues = _normalize_and_validate(content_type, raw)
    except NormalizationError as exc:
        content.status = "validation_failed"
        content.validation_errors = [{"location": "content", "message": str(exc)}]
        db.commit()
        db.refresh(content)
        return content

    if issues:
        content.status = "validation_failed"
        content.validation_errors = _issues_to_dicts(issues)
        db.commit()
        db.refresh(content)
        return content

    _persist_normalized(db, content, content_type, normalized)
    content.status = "ready_for_review"
    content.validation_errors = None
    db.commit()
    db.refresh(content)
    return content


def get_content(db: Session, content_id: uuid.UUID) -> LearningContent:
    content = db.get(LearningContent, content_id)
    if content is None:
        raise ContentNotFoundError
    return content


def assert_owner(content: LearningContent, user_id: uuid.UUID, is_admin: bool) -> None:
    if not is_admin and content.teacher_id != user_id:
        raise NotContentOwnerError


def list_owned(db: Session, teacher_id: uuid.UUID) -> list[LearningContent]:
    stmt = (
        select(LearningContent)
        .where(LearningContent.teacher_id == teacher_id)
        .order_by(LearningContent.created_at.desc())
    )
    return list(db.scalars(stmt))


def list_exercise_questions(db: Session, content_id: uuid.UUID) -> list[ExerciseQuestion]:
    stmt = (
        select(ExerciseQuestion)
        .where(ExerciseQuestion.content_id == content_id)
        .order_by(ExerciseQuestion.position)
    )
    return list(db.scalars(stmt))


def get_items(
    db: Session, content: LearningContent
) -> tuple[list[ExerciseQuestion], list[VocabularyItem]]:
    """Fetch the type-specific children for a content row (empty lists otherwise)."""
    if content.type == "exercise":
        return list_exercise_questions(db, content.id), []
    if content.type == "vocabulary":
        return [], list_vocabulary_items(db, content.id)
    return [], []


def list_vocabulary_items(db: Session, content_id: uuid.UUID) -> list[VocabularyItem]:
    stmt = (
        select(VocabularyItem)
        .where(VocabularyItem.content_id == content_id)
        .order_by(VocabularyItem.position)
    )
    return list(db.scalars(stmt))


def update_content(
    db: Session,
    content: LearningContent,
    title: str | None,
    description: str | None,
    document_body: str | None,
    vocabulary_items: list[dict[str, Any]] | None,
    questions: list[dict[str, Any]] | None,
) -> LearningContent:
    if title is not None:
        content.title = title
    if description is not None:
        content.description = description

    issues: list[ValidationIssue] | None = None

    if content.type == "learning_document" and document_body is not None:
        content.document_body = document_body
        issues = validate_document(DocumentData(body=document_body))

    elif content.type == "vocabulary" and vocabulary_items is not None:
        items = [VocabularyItemData(**item) for item in vocabulary_items]
        db.execute(delete(VocabularyItem).where(VocabularyItem.content_id == content.id))
        for position, item in enumerate(items):
            db.add(
                VocabularyItem(
                    content_id=content.id,
                    position=position,
                    word=item.word,
                    definition=item.definition,
                    translation=item.translation,
                    example=item.example,
                )
            )
        issues = validate_vocabulary(items)

    elif content.type == "exercise" and questions is not None:
        parsed_questions = [ExerciseQuestionData(**question) for question in questions]
        db.execute(delete(ExerciseQuestion).where(ExerciseQuestion.content_id == content.id))
        for position, question in enumerate(parsed_questions):
            db.add(
                ExerciseQuestion(
                    content_id=content.id,
                    position=position,
                    question_text=question.question_text,
                    question_type=question.question_type,
                    options=question.options,
                    correct_answer=question.correct_answer,
                )
            )
        issues = validate_exercise(parsed_questions)

    if issues is not None:
        if issues:
            # Never leave invalid content sitting in "published".
            content.status = "validation_failed"
            content.validation_errors = _issues_to_dicts(issues)
        else:
            # Minor edits (e.g. a typo fix) that stay valid don't force the
            # teacher to re-publish; only non-published content advances to
            # ready_for_review.
            if content.status != "published":
                content.status = "ready_for_review"
            content.validation_errors = None

    db.commit()
    db.refresh(content)
    return content


def publish_content(db: Session, content: LearningContent) -> LearningContent:
    if content.status != "ready_for_review":
        raise InvalidPublishStateError(
            f"Cannot publish content with status '{content.status}'; it must be ready_for_review."
        )
    content.status = "published"
    db.commit()
    db.refresh(content)
    return content


def delete_content(db: Session, content: LearningContent) -> None:
    db.delete(content)
    db.commit()
