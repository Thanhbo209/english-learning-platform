import re
from dataclasses import dataclass
from typing import Any

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
    sheet_name: str | None = None


@dataclass
class ExerciseQuestionData:
    question_text: str
    question_type: str
    options: list[str] | None
    correct_answer: str
    sheet_name: str | None = None


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


def detect_structure_and_suggest_mappings(
    raw: RawContent, content_type: str
) -> dict[str, Any]:
    available_sheets = list(raw.sheets.keys()) if raw.sheets else []

    if not raw.rows:
        return {
            "headers": [],
            "suggested_mapping": {},
            "missing_required_fields": [],
            "unrecognized_headers": [],
            "available_sheets": available_sheets,
        }

    sample_row = raw.rows[0]
    headers = [k for k in sample_row.keys() if k != "_sheet_name"]

    suggested_mapping: dict[str, Any] = {}
    missing_required_fields: list[str] = []
    mapped_headers: set[str] = set()

    if content_type == "vocabulary":
        required_fields = ["word", "definition"]
        candidates_map = {
            "word": ("word", "tu", "từ", "từ vựng", "thuật ngữ", "term", "vocab"),
            "definition": ("definition", "meaning", "nghia", "nghĩa", "định nghĩa", "giải thích", "explanation"),
            "translation": ("translation", "dich", "dịch", "nghĩa tiếng việt", "bản dịch"),
            "example": ("example", "vi du", "ví dụ", "câu ví dụ", "sample"),
        }
        for field_name, candidates in candidates_map.items():
            matched = None
            for key in headers:
                if key in mapped_headers:
                    continue
                norm_k = _normalize_key(key)
                if norm_k in candidates:
                    matched = key
                    break
            if matched:
                suggested_mapping[field_name] = matched
                mapped_headers.add(matched)
            elif field_name in required_fields:
                missing_required_fields.append(field_name)

    elif content_type == "exercise":
        question_candidates = ("question", "question text", "cau hoi", "câu hỏi", "nội dung câu hỏi")
        type_candidates = ("type", "question type", "loai", "loại", "loại câu hỏi")
        answer_candidates = ("answer", "correct answer", "dap an", "đáp án", "đáp án đúng", "key")

        # question_text
        for key in headers:
            if _normalize_key(key) in question_candidates:
                suggested_mapping["question_text"] = key
                mapped_headers.add(key)
                break
        else:
            missing_required_fields.append("question_text")

        # question_type
        for key in headers:
            if key not in mapped_headers and _normalize_key(key) in type_candidates:
                suggested_mapping["question_type"] = key
                mapped_headers.add(key)
                break

        # correct_answer
        for key in headers:
            if key not in mapped_headers and _normalize_key(key) in answer_candidates:
                suggested_mapping["correct_answer"] = key
                mapped_headers.add(key)
                break
        else:
            missing_required_fields.append("correct_answer")

        # options headers
        option_headers = [k for k in headers if k not in mapped_headers and _is_option_header(k)]
        if option_headers:
            for opt_header in option_headers:
                mapped_headers.add(opt_header)
            suggested_mapping["options"] = option_headers

    unrecognized_headers = [h for h in headers if h not in mapped_headers]

    return {
        "headers": headers,
        "suggested_mapping": suggested_mapping,
        "missing_required_fields": missing_required_fields,
        "unrecognized_headers": unrecognized_headers,
        "available_sheets": available_sheets,
    }


def normalize_document(raw: RawContent) -> DocumentData:
    if raw.text and raw.text.strip():
        return DocumentData(body=raw.text.strip())
    if raw.rows:
        body = "\n".join(" | ".join(v for k, v in row.items() if k != "_sheet_name") for row in raw.rows)
        if body.strip():
            return DocumentData(body=body.strip())
    raise NormalizationError("No readable text was found in this file.")


def normalize_vocabulary(
    raw: RawContent, column_mapping: dict[str, str] | None = None
) -> list[VocabularyItemData]:
    if raw.rows:
        items = []
        for row in raw.rows:
            sheet_name = row.get("_sheet_name")
            if column_mapping:
                word_col = column_mapping.get("word")
                def_col = column_mapping.get("definition")
                trans_col = column_mapping.get("translation")
                ex_col = column_mapping.get("example")

                word = (
                    row.get(word_col, "")
                    if word_col
                    else _find_column(
                        row, "word", "tu", "từ", "từ vựng", "thuật ngữ", "term", "vocab"
                    )
                )
                definition = (
                    row.get(def_col, "")
                    if def_col
                    else _find_column(
                        row,
                        "definition",
                        "meaning",
                        "nghia",
                        "nghĩa",
                        "định nghĩa",
                        "giải thích",
                        "explanation",
                    )
                )
                translation = (
                    row.get(trans_col, "")
                    if trans_col
                    else _find_column(
                        row, "translation", "dich", "dịch", "nghĩa tiếng việt", "bản dịch"
                    )
                )
                example = (
                    row.get(ex_col, "")
                    if ex_col
                    else _find_column(row, "example", "vi du", "ví dụ", "câu ví dụ", "sample")
                )
            else:
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
                translation = _find_column(
                    row, "translation", "dich", "dịch", "nghĩa tiếng việt", "bản dịch"
                )
                example = _find_column(row, "example", "vi du", "ví dụ", "câu ví dụ", "sample")

            if not word and not definition:
                continue

            items.append(
                VocabularyItemData(
                    word=(word or "").strip(),
                    definition=(definition or "").strip(),
                    translation=(translation or "").strip() or None,
                    example=(example or "").strip() or None,
                    sheet_name=sheet_name,
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


def normalize_exercise(
    raw: RawContent, column_mapping: dict[str, Any] | None = None
) -> list[ExerciseQuestionData]:
    if not raw.rows:
        raise NormalizationError(
            "Exercise import requires a spreadsheet or CSV with a question column "
            "('question' or 'question text'), option columns for multiple choice "
            "('option_a'/'option 1'/'A'/'B', etc.), and an answer column "
            "('answer' or 'correct answer'). DOCX/PDF exercise import isn't supported yet."
        )

    questions = []
    for row in raw.rows:
        sheet_name = row.get("_sheet_name")
        if column_mapping:
            q_col = column_mapping.get("question_text") if isinstance(column_mapping.get("question_text"), str) else None
            type_col = column_mapping.get("question_type") if isinstance(column_mapping.get("question_type"), str) else None
            ans_col = column_mapping.get("correct_answer") if isinstance(column_mapping.get("correct_answer"), str) else None

            question_text = (
                row.get(q_col, "")
                if q_col
                else _find_column(
                    row, "question", "question text", "cau hoi", "câu hỏi", "nội dung câu hỏi"
                )
            )
            declared_type = (
                (
                    row.get(type_col, "")
                    if type_col
                    else (
                        _find_column(
                            row, "type", "question type", "loai", "loại", "loại câu hỏi"
                        )
                        or ""
                    )
                )
                .strip()
                .lower()
            )

            # Options mapping
            opt_cols = column_mapping.get("options")
            if isinstance(opt_cols, list):
                options = [
                    row.get(c, "").strip()
                    for c in opt_cols
                    if row.get(c, "") and row.get(c, "").strip()
                ]
            else:
                options = _find_options(row)

            answer = (
                (
                    row.get(ans_col, "")
                    if ans_col
                    else (
                        _find_column(
                            row,
                            "answer",
                            "correct answer",
                            "dap an",
                            "đáp án",
                            "đáp án đúng",
                            "key",
                        )
                        or ""
                    )
                )
                .strip()
            )
        else:
            question_text = _find_column(
                row, "question", "question text", "cau hoi", "câu hỏi", "nội dung câu hỏi"
            )
            declared_type = (
                _find_column(row, "type", "question type", "loai", "loại", "loại câu hỏi") or ""
            ).strip().lower()
            options = _find_options(row)
            answer = (
                _find_column(
                    row,
                    "answer",
                    "correct answer",
                    "dap an",
                    "đáp án",
                    "đáp án đúng",
                    "key",
                )
                or ""
            ).strip()

        if not question_text or not question_text.strip():
            continue

        question_type = _infer_question_type(declared_type, bool(options))
        resolved_answer = _resolve_answer(answer, options)

        questions.append(
            ExerciseQuestionData(
                question_text=question_text.strip(),
                question_type=question_type,
                options=options or None,
                correct_answer=resolved_answer,
                sheet_name=sheet_name,
            )
        )

    if not questions:
        raise NormalizationError(
            "No questions found. Expected a column named 'question' or 'question text'."
        )
    return questions
