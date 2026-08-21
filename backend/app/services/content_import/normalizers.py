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


def _is_option_header(key: str) -> bool:
    norm = _normalize_key(key)
    # Reserved non-option column names must never be misclassified as option headers
    if norm in {
        "question",
        "question text",
        "cau hoi",
        "câu hỏi",
        "nội dung câu hỏi",
        "type",
        "question type",
        "loai",
        "loại",
        "loại câu hỏi",
        "answer",
        "correct answer",
        "dap an",
        "đáp án",
        "đáp án đúng",
        "key",
        "word",
        "tu",
        "từ",
        "từ vựng",
        "thuật ngữ",
        "definition",
        "meaning",
        "nghia",
        "nghĩa",
        "định nghĩa",
        "giải thích",
    }:
        return False

    if norm.startswith(("option", "choice", "lựa chọn", "lua chon")):
        return True
    if norm in {"a", "b", "c", "d", "e", "f"}:
        return True
    if re.match(r"^(đáp án|dap an)\s+[a-f1-6]$", norm):
        return True
    return False


def _find_options(row: dict[str, str]) -> list[str]:
    """Collect option columns (option_a/option 1/Option A/Choice 1/A/B/C/D/Lựa chọn A/...)
    in the file's original column order."""
    options = []
    for key, value in row.items():
        if _is_option_header(key) and value and value.strip():
            options.append(value.strip())
    return options


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
            word = _find_column(
                row, "word", "tu", "từ", "từ vựng", "thuật ngữ", "term", "vocab"
            )
            definition = _find_column(
                row,
                "definition",
                "meaning",
                "nghia",
                "nghĩa",
                "định nghĩa",
                "giải thích",
                "explanation",
            )
            if not word and not definition:
                continue
            translation = (
                _find_column(row, "translation", "dich", "dịch", "nghĩa tiếng việt", "bản dịch") or ""
            ).strip()
            example = (
                _find_column(row, "example", "vi du", "ví dụ", "câu ví dụ", "sample") or ""
            ).strip()
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
    if has_options:
        return "multiple_choice"
    if declared_type in {"true_false", "true false", "true/false", "đúng/sai", "dung/sai"}:
        return "true_false"
    if declared_type in VALID_QUESTION_TYPES:
        return declared_type
    return "short_answer"


def _resolve_answer(raw_answer: str, options: list[str]) -> str:
    """Some exports reference the correct option by position ('1', '2') or letter ('A', 'B'),
    or with case/whitespace variations."""
    clean_answer = raw_answer.strip()
    if not clean_answer or not options:
        return clean_answer

    # Check 1-based digit index
    if clean_answer.isdigit():
        index = int(clean_answer) - 1
        if 0 <= index < len(options):
            return options[index]

    # Check single letter index (A=0, B=1, ...)
    if len(clean_answer) == 1 and clean_answer.isalpha():
        index = ord(clean_answer.upper()) - ord("A")
        if 0 <= index < len(options):
            return options[index]

    # Check exact case-insensitive & trimmed option match
    normalized_clean = clean_answer.lower()
    for opt in options:
        if opt.strip().lower() == normalized_clean:
            return opt

    return clean_answer


def normalize_exercise(raw: RawContent) -> list[ExerciseQuestionData]:
    if not raw.rows:
        raise NormalizationError(
            "Exercise import requires a spreadsheet or CSV with a question column "
            "('question' or 'question text'), option columns for multiple choice "
            "('option_a'/'option 1'/'A'/'B', etc.), and an answer column "
            "('answer' or 'correct answer'). DOCX/PDF exercise import isn't supported yet."
        )

    questions = []
    for row in raw.rows:
        question_text = _find_column(
            row, "question", "question text", "cau hoi", "câu hỏi", "nội dung câu hỏi"
        )
        if not question_text or not question_text.strip():
            continue

        declared_type = (
            _find_column(row, "type", "question type", "loai", "loại", "loại câu hỏi") or ""
        ).strip().lower()
        options = _find_options(row)
        question_type = _infer_question_type(declared_type, bool(options))
        answer = (
            _find_column(row, "answer", "correct answer", "dap an", "đáp án", "đáp án đúng", "key") or ""
        ).strip()
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
