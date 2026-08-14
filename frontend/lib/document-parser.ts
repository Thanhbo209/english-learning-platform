export type InlineSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

export type ChoiceOption = {
  label: string; // "A", "B", "C", "D"
  text: string;
};

export type DocumentBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | {
      type: "question";
      number?: string;
      questionText: string;
      options?: ChoiceOption[];
    }
  | { type: "list"; listType: "bullet" | "number"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "paragraph"; text: string };

/**
 * Parses inline markdown-style markup (**bold**, *italic*, `code`) into structured text segments.
 */
export function parseInlineFormatting(text: string): InlineSegment[] {
  if (!text) return [];

  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
  const segments: InlineSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[2] !== undefined) {
      segments.push({ text: match[2], bold: true });
    } else if (match[3] !== undefined) {
      segments.push({ text: match[3], italic: true });
    } else if (match[4] !== undefined) {
      segments.push({ text: match[4], code: true });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
}

/**
 * Extracts multiple choice options (A. ..., B. ..., C. ..., D. ...) from a string.
 */
export function parseChoiceOptions(line: string): { questionPart: string; options: ChoiceOption[] } {
  const optionRegex = /(?:^|\s+)([A-D|a-d])[\.\)]\s+(.*?)(?=\s+[A-D|a-d][\.\)]\s+|$)/g;

  const matches: ChoiceOption[] = [];
  let match: RegExpExecArray | null;
  let firstOptionIndex = -1;

  while ((match = optionRegex.exec(line)) !== null) {
    if (firstOptionIndex === -1) {
      firstOptionIndex = match.index;
    }
    matches.push({
      label: match[1].toUpperCase(),
      text: match[2].trim(),
    });
  }

  if (matches.length >= 2 && firstOptionIndex !== -1) {
    const questionPart = line.slice(0, firstOptionIndex).trim();
    return { questionPart, options: matches };
  }

  return { questionPart: line, options: [] };
}

/**
 * Deterministically parses a raw document string into structured AST blocks.
 */
export function parseDocumentBody(body: string): DocumentBlock[] {
  if (!body || !body.trim()) {
    return [];
  }

  const rawLines = body.split(/\r?\n/);
  const blocks: DocumentBlock[] = [];
  let currentList: { type: "bullet" | "number"; items: string[] } | null = null;

  function flushList() {
    if (currentList) {
      blocks.push({
        type: "list",
        listType: currentList.type,
        items: currentList.items,
      });
      currentList = null;
    }
  }

  const headingKeywordRegex =
    /^(UNIT|SECTION|PART|BÀI|CHAPTER|LESSON|CHUƠNG|PHẦN)\s+(\d+|[IVXLCDM]+)[:\.-]?\s*(.*)$/i;
  const explicitQuestionRegex =
    /^(?:Question|Câu|Q)\s*(\d+)[\.:\)]\s+(.+)$/i;
  const bulletRegex = /^[\*\-•]\s+(.+)$/;
  const numberedLineRegex = /^(\d+)[\.:\)]\s+(.+)$/;
  const calloutRegex =
    /^(Note|Lưu ý|Grammar|Grammar Point|Chú ý|Tip|Remember|Hướng dẫn)[:\-]\s*(.+)$/i;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // 1. Check Markdown Headings (# Header, ## Header, ### Header)
    const mdHeaderMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (mdHeaderMatch) {
      flushList();
      const level = mdHeaderMatch[1].length as 1 | 2 | 3;
      blocks.push({ type: "heading", level, text: mdHeaderMatch[2].trim() });
      continue;
    }

    // 2. Check Explicit Keyword Headings (e.g. "UNIT 1: Family", "PART A: Vocabulary")
    const keywordHeaderMatch = line.match(headingKeywordRegex);
    if (keywordHeaderMatch) {
      flushList();
      const text = `${keywordHeaderMatch[1]} ${keywordHeaderMatch[2]}${
        keywordHeaderMatch[3] ? ": " + keywordHeaderMatch[3] : ""
      }`;
      blocks.push({ type: "heading", level: 1, text: text.trim() });
      continue;
    }

    // 3. Check All-Caps Section Headings (e.g., "READING COMPREHENSION", "PART I: MULTIPLE CHOICE")
    if (
      line.length >= 4 &&
      line.length <= 70 &&
      line === line.toUpperCase() &&
      /[A-Z]/.test(line) &&
      !line.includes(".") &&
      !line.includes("?")
    ) {
      flushList();
      blocks.push({ type: "heading", level: 2, text: line });
      continue;
    }

    // 4. Check Callout Notes (e.g., "Note: ...", "Grammar: ...")
    const calloutMatch = line.match(calloutRegex);
    if (calloutMatch) {
      flushList();
      blocks.push({
        type: "callout",
        title: calloutMatch[1],
        text: calloutMatch[2].trim(),
      });
      continue;
    }

    // 5. Check Multiple Choice Options line (e.g., "A. Went B. Gone C. Going D. Goes" or "A. Went")
    const { questionPart: optionQuestionPart, options: parsedLineOptions } = parseChoiceOptions(line);
    if (parsedLineOptions.length >= 2) {
      flushList();
      // If previous block is a question and line doesn't have a new question part, attach to previous question
      if (blocks.length > 0 && blocks[blocks.length - 1].type === "question" && !optionQuestionPart) {
        const lastQuestion = blocks[blocks.length - 1] as Extract<DocumentBlock, { type: "question" }>;
        lastQuestion.options = [...(lastQuestion.options || []), ...parsedLineOptions];
        continue;
      }

      if (optionQuestionPart) {
        const leadingNumMatch = optionQuestionPart.match(/^(?:Question|Câu|Q)?\s*(\d+)[\.:\)]\s*(.+)$/i);
        if (leadingNumMatch) {
          blocks.push({
            type: "question",
            number: leadingNumMatch[1],
            questionText: leadingNumMatch[2],
            options: parsedLineOptions,
          });
        } else {
          blocks.push({
            type: "question",
            questionText: optionQuestionPart,
            options: parsedLineOptions,
          });
        }
        continue;
      }
    }

    // Single standalone option line (e.g. "A. Option A")
    const singleOptionMatch = line.match(/^([A-D|a-d])[\.:\)]\s+(.+)$/);
    if (singleOptionMatch && blocks.length > 0 && blocks[blocks.length - 1].type === "question") {
      flushList();
      const lastQuestion = blocks[blocks.length - 1] as Extract<DocumentBlock, { type: "question" }>;
      lastQuestion.options = lastQuestion.options || [];
      lastQuestion.options.push({
        label: singleOptionMatch[1].toUpperCase(),
        text: singleOptionMatch[2].trim(),
      });
      continue;
    }

    // 6. Check Explicit Questions (e.g. "Question 1: ...", "Câu 1: ...", "Q1: ...")
    const explicitQMatch = line.match(explicitQuestionRegex);
    if (explicitQMatch) {
      flushList();
      const num = explicitQMatch[1];
      const restText = explicitQMatch[2].trim();
      const { questionPart, options } = parseChoiceOptions(restText);
      blocks.push({
        type: "question",
        number: num,
        questionText: questionPart,
        options: options.length > 0 ? options : undefined,
      });
      continue;
    }

    // 7. Check Numbered lines ("1. What is...", "1. Step A")
    const numberedMatch = line.match(numberedLineRegex);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const restText = numberedMatch[2].trim();
      const { questionPart, options } = parseChoiceOptions(restText);

      // It's a question if it has choices, ends with '?', or is followed by options
      const isQuestion =
        options.length > 0 ||
        restText.endsWith("?") ||
        (i + 1 < rawLines.length && /^([A-D|a-d])[\.:\)]\s+/.test(rawLines[i + 1].trim()));

      if (isQuestion) {
        flushList();
        blocks.push({
          type: "question",
          number: num,
          questionText: questionPart,
          options: options.length > 0 ? options : undefined,
        });
        continue;
      } else {
        // Otherwise treat as a numbered list item
        if (!currentList || currentList.type !== "number") {
          flushList();
          currentList = { type: "number", items: [] };
        }
        currentList.items.push(restText);
        continue;
      }
    }

    // 8. Check Bullet List Items (- item, * item, • item)
    const bulletMatch = line.match(bulletRegex);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(bulletMatch[1].trim());
      continue;
    }

    // 9. Default: Paragraph Block
    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}
