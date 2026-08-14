"use client";

import {
  BookOpen,
  Check,
  Copy,
  Info,
  List,
  Type,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  parseDocumentBody,
  parseInlineFormatting,
  type ChoiceOption,
  type DocumentBlock,
} from "@/lib/document-parser";
import { cn } from "@/lib/utils";

type FontSize = "sm" | "base" | "lg";

const FONT_SIZE_CLASSES: Record<FontSize, { body: string; heading1: string; heading2: string; heading3: string }> = {
  sm: {
    body: "text-sm leading-relaxed",
    heading1: "text-lg font-bold",
    heading2: "text-base font-semibold",
    heading3: "text-sm font-semibold",
  },
  base: {
    body: "text-base leading-relaxed sm:leading-7",
    heading1: "text-xl font-bold sm:text-2xl",
    heading2: "text-lg font-semibold sm:text-xl",
    heading3: "text-base font-semibold",
  },
  lg: {
    body: "text-lg leading-relaxed sm:leading-8",
    heading1: "text-2xl font-bold sm:text-3xl",
    heading2: "text-xl font-semibold sm:text-2xl",
    heading3: "text-lg font-semibold",
  },
};

function InlineText({ text }: { text: string }) {
  const segments = parseInlineFormatting(text);
  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.bold && seg.italic) {
          return (
            <strong key={idx} className="font-semibold italic text-foreground">
              {seg.text}
            </strong>
          );
        }
        if (seg.bold) {
          return (
            <strong key={idx} className="font-semibold text-foreground">
              {seg.text}
            </strong>
          );
        }
        if (seg.italic) {
          return <em key={idx} className="italic">{seg.text}</em>;
        }
        if (seg.code) {
          return (
            <code
              key={idx}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground"
            >
              {seg.text}
            </code>
          );
        }
        return <span key={idx}>{seg.text}</span>;
      })}
    </>
  );
}

function QuestionBlockRender({
  number,
  questionText,
  options,
  fontSize,
}: {
  number?: string;
  questionText: string;
  options?: ChoiceOption[];
  fontSize: FontSize;
}) {
  return (
    <div className="my-5 flex flex-col gap-2.5">
      <div className={cn("flex items-start gap-2 font-medium text-foreground", FONT_SIZE_CLASSES[fontSize].body)}>
        {number ? (
          <span className="shrink-0 font-bold text-primary">Câu {number}.</span>
        ) : (
          <span className="shrink-0 font-bold text-primary">•</span>
        )}
        <div className="flex-1">
          <InlineText text={questionText} />
        </div>
      </div>

      {options && options.length > 0 ? (
        <div className="ml-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                {opt.label}
              </span>
              <span className="truncate">
                <InlineText text={opt.text} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DocumentReader({
  title,
  description,
  body,
}: {
  title?: string;
  description?: string | null;
  body: string;
}) {
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(false);

  const blocks = parseDocumentBody(body);
  const headings = blocks.filter((b): b is Extract<DocumentBlock, { type: "heading" }> => b.type === "heading");

  function handleCopy() {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Top Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <BookOpen className="size-4 text-primary" />
          <span>Chế độ đọc bài học</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <span className="px-1.5 text-xs text-muted-foreground">
              <Type className="size-3.5" />
            </span>
            {(["sm", "base", "lg"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold transition-colors",
                  fontSize === size
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {size === "sm" ? "A-" : size === "base" ? "A" : "A+"}
              </button>
            ))}
          </div>

          {/* Outline / TOC Toggle */}
          {headings.length > 0 ? (
            <Button
              type="button"
              variant={showToc ? "default" : "outline"}
              size="sm"
              onClick={() => setShowToc(!showToc)}
              className="h-8 gap-1.5 text-xs"
            >
              <List className="size-3.5" />
              <span>Mục lục ({headings.length})</span>
            </Button>
          ) : null}

          {/* Copy Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Đã chép" : "Sao chép"}</span>
          </Button>
        </div>
      </div>

      {/* Optional Table of Contents Panel */}
      {showToc && headings.length > 0 ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-2 p-4">
            <p className="text-xs font-semibold text-primary">Mục lục nội dung</p>
            <ul className="flex flex-col gap-1.5 text-xs">
              {headings.map((h, i) => (
                <li
                  key={i}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                    h.level === 1 && "font-semibold text-foreground",
                    h.level === 2 && "pl-3",
                    h.level === 3 && "pl-6 text-muted-foreground/80",
                  )}
                >
                  • {h.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Main Document Content Paper Container */}
      <article
        className={cn(
          "flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-all sm:p-10",
          FONT_SIZE_CLASSES[fontSize].body,
        )}
      >
        {/* Document Header */}
        {title ? (
          <div className="flex flex-col gap-2 border-b pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            ) : null}
          </div>
        ) : null}

        {/* Document Body Blocks */}
        {blocks.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-muted-foreground">
            Chưa có nội dung văn bản cho bài học này.
          </p>
        ) : (
          blocks.map((block, index) => {
            switch (block.type) {
              case "heading":
                if (block.level === 1) {
                  return (
                    <h2
                      key={index}
                      className={cn(
                        "mt-6 border-l-4 border-primary pl-3 tracking-tight text-foreground",
                        FONT_SIZE_CLASSES[fontSize].heading1,
                      )}
                    >
                      <InlineText text={block.text} />
                    </h2>
                  );
                }
                if (block.level === 2) {
                  return (
                    <h3
                      key={index}
                      className={cn(
                        "mt-5 border-b pb-1.5 tracking-tight text-foreground",
                        FONT_SIZE_CLASSES[fontSize].heading2,
                      )}
                    >
                      <InlineText text={block.text} />
                    </h3>
                  );
                }
                return (
                  <h4
                    key={index}
                    className={cn(
                      "mt-4 text-foreground/90 font-semibold",
                      FONT_SIZE_CLASSES[fontSize].heading3,
                    )}
                  >
                    <InlineText text={block.text} />
                  </h4>
                );

              case "question":
                return (
                  <QuestionBlockRender
                    key={index}
                    number={block.number}
                    questionText={block.questionText}
                    options={block.options}
                    fontSize={fontSize}
                  />
                );

              case "callout":
                return (
                  <div
                    key={index}
                    className="my-3 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <Info className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="flex flex-col gap-0.5 text-xs sm:text-sm">
                      <span className="font-semibold">{block.title}</span>
                      <p className="leading-relaxed opacity-90">
                        <InlineText text={block.text} />
                      </p>
                    </div>
                  </div>
                );

              case "list":
                if (block.listType === "number") {
                  return (
                    <ol key={index} className="my-2 list-decimal space-y-1.5 pl-6 text-foreground/90">
                      {block.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="pl-1">
                          <InlineText text={item} />
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <ul key={index} className="my-2 list-disc space-y-1.5 pl-6 text-foreground/90">
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="pl-1">
                        <InlineText text={item} />
                      </li>
                    ))}
                  </ul>
                );

              case "paragraph":
                return (
                  <p key={index} className="my-1.5 leading-relaxed text-foreground/90">
                    <InlineText text={block.text} />
                  </p>
                );

              default:
                return null;
            }
          })
        )}
      </article>
    </div>
  );
}
