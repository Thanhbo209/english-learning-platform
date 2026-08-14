import { describe, expect, it } from "vitest";

import {
  parseChoiceOptions,
  parseDocumentBody,
  parseInlineFormatting,
} from "./document-parser";

describe("document-parser", () => {
  describe("parseInlineFormatting", () => {
    it("parses plain text without markup", () => {
      const segments = parseInlineFormatting("Hello world");
      expect(segments).toEqual([{ text: "Hello world" }]);
    });

    it("parses bold text", () => {
      const segments = parseInlineFormatting("This is **important** information");
      expect(segments).toEqual([
        { text: "This is " },
        { text: "important", bold: true },
        { text: " information" },
      ]);
    });

    it("parses italic text", () => {
      const segments = parseInlineFormatting("An *example* text");
      expect(segments).toEqual([
        { text: "An " },
        { text: "example", italic: true },
        { text: " text" },
      ]);
    });
  });

  describe("parseChoiceOptions", () => {
    it("extracts inline options A, B, C, D from string", () => {
      const input = "What is 2+2? A. 3 B. 4 C. 5 D. 6";
      const { questionPart, options } = parseChoiceOptions(input);
      expect(questionPart).toBe("What is 2+2?");
      expect(options).toEqual([
        { label: "A", text: "3" },
        { label: "B", text: "4" },
        { label: "C", text: "5" },
        { label: "D", text: "6" },
      ]);
    });

    it("returns empty options if fewer than 2 choices are present", () => {
      const input = "Normal line with letter A. in it";
      const { questionPart, options } = parseChoiceOptions(input);
      expect(questionPart).toBe("Normal line with letter A. in it");
      expect(options).toEqual([]);
    });
  });

  describe("parseDocumentBody", () => {
    it("parses Markdown headings", () => {
      const text = "# Unit 1: Greetings\n## Lesson 1\n### Vocabulary";
      const blocks = parseDocumentBody(text);
      expect(blocks).toEqual([
        { type: "heading", level: 1, text: "Unit 1: Greetings" },
        { type: "heading", level: 2, text: "Lesson 1" },
        { type: "heading", level: 3, text: "Vocabulary" },
      ]);
    });

    it("parses explicit keyword and ALL-CAPS headings", () => {
      const text = "UNIT 1: FAMILY\nREADING COMPREHENSION";
      const blocks = parseDocumentBody(text);
      expect(blocks[0]).toEqual({ type: "heading", level: 1, text: "UNIT 1: FAMILY" });
      expect(blocks[1]).toEqual({ type: "heading", level: 2, text: "READING COMPREHENSION" });
    });

    it("parses questions with inline options", () => {
      const text = "1. What is the capital of France? A. London B. Paris C. Berlin D. Rome";
      const blocks = parseDocumentBody(text);
      expect(blocks).toEqual([
        {
          type: "question",
          number: "1",
          questionText: "What is the capital of France?",
          options: [
            { label: "A", text: "London" },
            { label: "B", text: "Paris" },
            { label: "C", text: "Berlin" },
            { label: "D", text: "Rome" },
          ],
        },
      ]);
    });

    it("parses questions with standalone option lines below", () => {
      const text = "Câu 2: Choose the correct word\nA. He goes\nB. He go\nC. He going\nD. He gone";
      const blocks = parseDocumentBody(text);
      expect(blocks).toEqual([
        {
          type: "question",
          number: "2",
          questionText: "Choose the correct word",
          options: [
            { label: "A", text: "He goes" },
            { label: "B", text: "He go" },
            { label: "C", text: "He going" },
            { label: "D", text: "He gone" },
          ],
        },
      ]);
    });

    it("parses bullet and numbered lists", () => {
      const text = "- Item 1\n- Item 2\n\n1. Step A\n2. Step B";
      const blocks = parseDocumentBody(text);
      expect(blocks).toEqual([
        { type: "list", listType: "bullet", items: ["Item 1", "Item 2"] },
        { type: "list", listType: "number", items: ["Step A", "Step B"] },
      ]);
    });

    it("parses callout blocks", () => {
      const text = "Note: Remember to bring your textbook.";
      const blocks = parseDocumentBody(text);
      expect(blocks).toEqual([
        {
          type: "callout",
          title: "Note",
          text: "Remember to bring your textbook.",
        },
      ]);
    });

    it("handles empty document body", () => {
      expect(parseDocumentBody("")).toEqual([]);
      expect(parseDocumentBody("   \n  ")).toEqual([]);
    });
  });
});
