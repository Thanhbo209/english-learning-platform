"use client";

import { BookOpen, Check, Copy, Type } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FontSize = "sm" | "base" | "lg";

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: "text-sm leading-relaxed sm:leading-7",
  base: "text-base leading-relaxed sm:leading-loose",
  lg: "text-lg leading-loose sm:leading-loose sm:text-xl",
};

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

  function handleCopy() {
    if (!body) return;
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Document Reader Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <BookOpen className="size-4 text-primary" />
          <span>Tài liệu học tập</span>
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

          {/* Copy Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!body.trim()}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Đã chép" : "Sao chép"}</span>
          </Button>
        </div>
      </div>

      {/* Main Document Paper Sheet */}
      <article className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm transition-all sm:p-10">
        {/* Document Header */}
        {title ? (
          <div className="flex flex-col gap-2 border-b pb-6">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Raw Document Body - Preserving whitespace and line breaks */}
        {!body || !body.trim() ? (
          <p className="py-12 text-center text-sm italic text-muted-foreground">
            Chưa có nội dung văn bản cho tài liệu này.
          </p>
        ) : (
          <div
            className={cn(
              "whitespace-pre-wrap font-normal text-foreground/90 selection:bg-primary/20",
              FONT_SIZE_CLASSES[fontSize],
            )}
          >
            {body}
          </div>
        )}
      </article>
    </div>
  );
}
