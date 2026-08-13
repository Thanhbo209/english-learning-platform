import re
from dataclasses import dataclass

from app.services.content_import.importers import RawContent

VALID_QUESTION_TYPES = {"multiple_choice", "true_false", "short_answer"}


class NormalizationError(Exception):
    """Raised when raw content cannot be normalized into the requested content type."""


@dataclass
class DocumentData:
    body: str


@dataclass
class VocabularyItemData:
    word: str
    definition: str
    translation: str | None = None
    example: str | None = None


@dataclass
class ExerciseQuestionData:
    question_text: str
    question_type: str
    options: list[str] | None
    correct_answer: str


def _normalize_key(key: str) -> str:
    """Collapse separators/case so 'Question_Text', 'question-text' and
    'Question Text' all match the same candidate name."""
    return re.sub(r"[\s_-]+", " ", key.strip().lower())


def _find_column(row: dict[str, str], *candidates: str) -> str | None:
    normalized = {_normalize_key(key): value for key, value in row.items()}
    for name in candidates:
        if name in normalized:
            return normalized[name]
    return None


def _find_options(row: dict[str, str]) -> list[str]:
    """Collect every 'option ...' column (option_a/option 1/Option A/...),
    in the file's original column order, regardless of how many there are."""
    return [
        value.strip()
        for key, value in row.items()
        if _normalize_key(key).startswith("option") and value and value.strip()
    ]


def normalize_document(raw: RawContent) -> DocumentData:
    if raw.text and raw.text.strip():
        return DocumentData(body=raw.text.strip())
    if raw.rows:
        body = "\n".join(" | ".join(row.values()) for row in raw.rows)
        if body.strip():
            return DocumentData(body=body.strip())
    raise NormalizationError("No readable text was found in this file.")


def normalize_vocabulary(raw: RawContent) -> list[VocabularyItemData]:
    if raw.rows:
        items = []
        for row in raw.rows:
            word = _find_column(row, "word", "tu", "từ")
            definition = _find_column(row, "definition", "meaning", "nghia", "nghĩa")
            if not word and not definition:
                continue
            translation = (_find_column(row, "translation", "dich", "dịch") or "").strip()
            example = (_find_column(row, "example", "vi du", "ví dụ") or "").strip()
            items.append(
                VocabularyItemData(
                    word=(word or "").strip(),
                    definition=(definition or "").strip(),
                    translation=translation or None,
                    example=example or None,
                )
            )
        if not items:
            raise NormalizationError(
                "Expected columns named 'word' and 'definition' "
                "(optionally 'translation', 'example')."
            )
        return items

    if raw.text and raw.text.strip():
        items = []
        for line in raw.text.splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            word, definition = line.split(":", 1)
            if word.strip() and definition.strip():
                items.append(VocabularyItemData(word=word.strip(), definition=definition.strip()))
        if items:
            return items
        raise NormalizationError(
            "Expected one 'word: definition' pair per line in the document text."
        )

    raise NormalizationError("No content found to import.")


def _infer_question_type(declared_type: str, has_options: bool) -> str:
    # The shape of the row is more reliable than a vendor-specific type label
    # (e.g. spreadsheet exports from quiz tools use labels like "Quiz" or
    # "Poll" instead of our three internal types) - if there are option
    # columns with values, it's a multiple-choice question regardless of
    # what the type column says.
    if has_options:
        return "multiple_choice"
    if declared_type in {"true_false", "true false", "true/false"}:
        return "true_false"
    if declared_type in VALID_QUESTION_TYPES:
        return declared_type
    return "short_answer"


def _resolve_answer(raw_answer: str, options: list[str]) -> str:
    """Some exports (e.g. quiz tools) reference the correct option by its
    1-based position or letter ('2', 'B') instead of repeating its text."""
    if not raw_answer or not options:
        return raw_answer
    if raw_answer.isdigit():
        index = int(raw_answer) - 1
        if 0 <= index < len(options):
            return options[index]
    elif len(raw_answer) == 1 and raw_answer.isalpha():
        index = ord(raw_answer.upper()) - ord("A")
        if 0 <= index < len(options):
            return options[index]
    return raw_answer


def normalize_exercise(raw: RawContent) -> list[ExerciseQuestionData]:
    if not raw.rows:
        raise NormalizationError(
            "Exercise import requires a spreadsheet or CSV with a question column "
            "('question' or 'question text'), option columns for multiple choice "
            "('option_a'/'option 1', etc.), and an answer column "
            "('answer' or 'correct answer'). DOCX/PDF exercise import isn't supported yet."
        )

    questions = []
    for row in raw.rows:
        question_text = _find_column(row, "question", "question text", "cau hoi", "câu hỏi")
        if not question_text or not question_text.strip():
            continue

        declared_type = (
            _find_column(row, "type", "question type", "loai", "loại") or ""
        ).strip().lower()
        options = _find_options(row)
        question_type = _infer_question_type(declared_type, bool(options))
        answer = (_find_column(row, "answer", "correct answer", "dap an", "đáp án") or "").strip()
        resolved_answer = _resolve_answer(answer, options)

        questions.append(
            ExerciseQuestionData(
                question_text=question_text.strip(),
                question_type=question_type,
                options=options or None,
                correct_answer=resolved_answer,
            )
        )

    if not questions:
        raise NormalizationError(
            "No questions found. Expected a column named 'question' or 'question text'."
        )
    return questions
