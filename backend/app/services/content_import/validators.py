from dataclasses import dataclass

from app.services.content_import.normalizers import (
    DocumentData,
    ExerciseQuestionData,
    VocabularyItemData,
)

VALID_QUESTION_TYPES = {"multiple_choice", "true_false", "short_answer"}


@dataclass
class ValidationIssue:
    location: str
    message: str
    severity: str = "error"  # "error" (blocking) | "warning" (non-blocking)
    row_index: int | None = None


def validate_document(data: DocumentData) -> list[ValidationIssue]:
    if not data.body or not data.body.strip():
        return [ValidationIssue(location="document", message="Document body is empty.", severity="error")]
    return []


def validate_vocabulary(items: list[VocabularyItemData]) -> list[ValidationIssue]:
    if not items:
        return [ValidationIssue(location="vocabulary", message="No vocabulary items found.", severity="error")]

    issues = []
    seen_words: set[str] = set()
    for index, item in enumerate(items, start=1):
        location = f"Row {index}"
        if not item.word:
            issues.append(
                ValidationIssue(
                    location=location,
                    message="Missing word.",
                    severity="error",
                    row_index=index,
                )
            )
        if not item.definition:
            issues.append(
                ValidationIssue(
                    location=location,
                    message="Missing definition.",
                    severity="error",
                    row_index=index,
                )
            )
        key = item.word.strip().lower()
        if key and key in seen_words:
            issues.append(
                ValidationIssue(
                    location=location,
                    message=f"Duplicate word: '{item.word}'.",
                    severity="warning",
                    row_index=index,
                )
            )
        seen_words.add(key)
    return issues


def validate_exercise(questions: list[ExerciseQuestionData]) -> list[ValidationIssue]:
    if not questions:
        return [ValidationIssue(location="exercise", message="No questions found.", severity="error")]

    issues = []
    for index, question in enumerate(questions, start=1):
        location = f"Question {index}"
        if not question.question_text:
            issues.append(
                ValidationIssue(
                    location=location,
                    message="Missing question text.",
                    severity="error",
                    row_index=index,
                )
            )
        if question.question_type not in VALID_QUESTION_TYPES:
            issues.append(
                ValidationIssue(
                    location=location,
                    message=f"Unknown question type: '{question.question_type}'.",
                    severity="error",
                    row_index=index,
                )
            )
        if not question.correct_answer:
            issues.append(
                ValidationIssue(
                    location=location,
                    message="Missing correct answer.",
                    severity="error",
                    row_index=index,
                )
            )

        if question.question_type == "multiple_choice":
            options = question.options or []
            if len(options) < 2:
                issues.append(
                    ValidationIssue(
                        location=location,
                        message="Multiple-choice question has fewer than 2 options.",
                        severity="error",
                        row_index=index,
                    )
                )
            elif question.correct_answer:
                trimmed_ans = question.correct_answer.strip().lower()
                normalized_opts = [opt.strip().lower() for opt in options]
                if trimmed_ans not in normalized_opts:
                    issues.append(
                        ValidationIssue(
                            location=location,
                            message=f"Correct answer '{question.correct_answer}' does not match any of the options.",
                            severity="error",
                            row_index=index,
                        )
                    )
        elif question.question_type == "true_false":
            if question.correct_answer.strip().lower() not in {"true", "false", "đúng", "sai"}:
                issues.append(
                    ValidationIssue(
                        location=location,
                        message="True/false answer must be 'true' or 'false'.",
                        severity="error",
                        row_index=index,
                    )
                )
    return issues
