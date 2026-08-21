"use client";

import {
  BookOpen,
  Check,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  LayoutGrid,
  Table as TableIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { useRef, useState, type ComponentType, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { detectStructure, importContent } from "@/lib/content-client";
import { FILE_TYPE_ICONS, getExtension } from "@/lib/file-icons";
import { cn } from "@/lib/utils";
import type { ColumnMappingSuggestion, ContentType, LearningContent } from "@/types/content";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["docx", "xlsx", "xls", "pdf", "csv"];

const CONTENT_TYPES: {
  value: ContentType;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    value: "learning_document",
    label: "Tài liệu học tập",
    hint: "VD: bài học, tài liệu đọc",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    value: "exercise",
    label: "Bài tập",
    hint: "VD: trắc nghiệm, bài kiểm tra",
    icon: ClipboardCheck,
    color: "text-emerald-600",
  },
  {
    value: "vocabulary",
    label: "Từ vựng",
    hint: "VD: danh sách từ, flashcard",
    icon: BookOpen,
    color: "text-amber-600",
  },
];

const TEMPLATE_URLS: Partial<Record<ContentType, string>> = {
  vocabulary: "/templates/vocabulary-template.csv",
  exercise: "/templates/exercise-template.csv",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportContentForm({
  onSuccess,
}: {
  onSuccess: (content: LearningContent) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contentType, setContentType] = useState<ContentType>("vocabulary");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detection, setDetection] = useState<ColumnMappingSuggestion | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [sheetName, setSheetName] = useState<string>("all");
  const [isDetecting, setIsDetecting] = useState(false);

  async function runDetection(candidate: File, selectedSheet?: string) {
    setIsDetecting(true);
    try {
      const result = await detectStructure({
        contentType,
        file: candidate,
        sheetName: selectedSheet ?? sheetName,
      });
      setDetection(result);
      if (result.suggested_mapping) {
        const initialMap: Record<string, string> = {};
        for (const [k, v] of Object.entries(result.suggested_mapping)) {
          if (typeof v === "string") {
            initialMap[k] = v;
          }
        }
        setColumnMapping(initialMap);
      }
    } catch {
      // Fall back gracefully if detection is unavailable
    } finally {
      setIsDetecting(false);
    }
  }

  async function applyFile(candidate: File | undefined | null) {
    if (!candidate) return;
    const extension = getExtension(candidate.name);
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError(
        `Định dạng .${extension || "?"} không được hỗ trợ. Vui lòng dùng DOCX, XLSX, PDF hoặc CSV.`,
      );
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setError("Tệp vượt quá dung lượng tối đa 50MB.");
      return;
    }
    setError(null);
    setFile(candidate);
    setDetection(null);
    setColumnMapping({});
    setSheetName("all");

    if (extension === "csv" || extension === "xlsx" || extension === "xls") {
      runDetection(candidate, "all");
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    applyFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Vui lòng chọn một tệp để tải lên.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const content = await importContent({
        contentType,
        title,
        description: description || undefined,
        file,
        columnMapping: Object.keys(columnMapping).length > 0 ? columnMapping : undefined,
        sheetName: sheetName !== "all" ? sheetName : undefined,
      });
      onSuccess(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể nhập nội dung");
      setIsSubmitting(false);
    }
  }

  const selectedFileType = file ? FILE_TYPE_ICONS[getExtension(file.name)] : null;
  const SelectedFileIcon = selectedFileType?.icon ?? FileText;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Loại nội dung</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CONTENT_TYPES.map((option) => {
            const Icon = option.icon;
            const selected = contentType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setContentType(option.value);
                  if (file) {
                    applyFile(file);
                  }
                }}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                {selected ? (
                  <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                ) : null}
                <Icon className={cn("size-6", option.color)} />
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.hint}</span>
              </button>
            );
          })}
          <div
            aria-disabled="true"
            title="Sắp ra mắt"
            className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4 text-left opacity-50"
          >
            <LayoutGrid className="size-6 text-violet-600" />
            <span className="text-sm font-medium">Khác</span>
            <span className="text-xs text-muted-foreground">VD: hoạt động, nội dung tương tác</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content-title">Tiêu đề</Label>
        <Input
          id="content-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content-description">Mô tả (không bắt buộc)</Label>
        <Textarea
          id="content-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="content-file">Tệp tải lên</Label>
          {TEMPLATE_URLS[contentType] ? (
            <a
              href={TEMPLATE_URLS[contentType]}
              download
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Download className="size-3.5" />
              Tải tệp mẫu (.csv)
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              Chỉ cần văn bản trong tệp DOCX hoặc PDF — không cần mẫu
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_14rem]">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
            )}
          >
            {file ? (
              <div className="flex flex-col items-center gap-1.5">
                <SelectedFileIcon className={cn("size-8", selectedFileType?.color ?? "text-muted-foreground")} />
                <p className="max-w-xs truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFile(null);
                    setDetection(null);
                    setColumnMapping({});
                    setSheetName("all");
                  }}
                >
                  <X className="size-3.5" />
                  Chọn tệp khác
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud className="size-8 text-primary" />
                <p className="text-sm font-medium">Kéo thả tệp vào đây hoặc bấm để chọn</p>
                <p className="text-xs text-muted-foreground">Dung lượng tối đa 50MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              id="content-file"
              type="file"
              accept=".docx,.xlsx,.xls,.pdf,.csv"
              className="hidden"
              onChange={(event) => applyFile(event.target.files?.[0])}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-primary">Định dạng hỗ trợ</p>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-blue-600" /> DOCX (.docx)
              </li>
              <li className="flex items-center gap-1.5">
                <FileSpreadsheet className="size-3.5 text-emerald-600" /> Excel (.xlsx, .xls)
              </li>
              <li className="flex items-center gap-1.5">
                <FileType className="size-3.5 text-red-600" /> PDF (.pdf)
              </li>
              <li className="flex items-center gap-1.5">
                <TableIcon className="size-3.5 text-amber-600" /> CSV (.csv)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isDetecting ? (
        <p className="text-xs text-muted-foreground animate-pulse">Đang phân tích cấu trúc tệp…</p>
      ) : null}

      {/* Sheet selection for Excel workbooks with multiple worksheets */}
      {detection && detection.available_sheets && detection.available_sheets.length > 1 ? (
        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/20 p-3">
          <Label htmlFor="select-sheet" className="text-xs font-semibold text-primary">
            Chọn Trang tính (Worksheet) trong tệp Excel ({detection.available_sheets.length} trang tính)
          </Label>
          <select
            id="select-sheet"
            value={sheetName}
            onChange={(e) => {
              const newSheet = e.target.value;
              setSheetName(newSheet);
              if (file) {
                runDetection(file, newSheet);
              }
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả trang tính (Gộp tất cả)</option>
            {detection.available_sheets.map((s) => (
              <option key={s} value={s}>
                Trang tính: {s}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Column mapping controls */}
      {detection && detection.headers.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ánh xạ cột dữ liệu ({detection.headers.length} cột phát hiện)
            </span>
            {detection.missing_required_fields.length > 0 ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                ⚠️ Chưa khớp đủ cột bắt buộc
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Đã khớp cột tự động
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {contentType === "vocabulary" ? (
              <>
                <div className="flex flex-col gap-1 text-xs">
                  <Label htmlFor="map-word" className="text-xs font-medium">
                    Từ tiếng Anh (Word) *
                  </Label>
                  <select
                    id="map-word"
                    value={columnMapping["word"] ?? ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, word: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chọn cột --</option>
                    {detection.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <Label htmlFor="map-def" className="text-xs font-medium">
                    Định nghĩa (Definition) *
                  </Label>
                  <select
                    id="map-def"
                    value={columnMapping["definition"] ?? ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, definition: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chọn cột --</option>
                    {detection.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <Label htmlFor="map-trans" className="text-xs font-medium">
                    Bản dịch (Translation)
                  </Label>
                  <select
                    id="map-trans"
                    value={columnMapping["translation"] ?? ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, translation: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Không sử dụng --</option>
                    {detection.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <Label htmlFor="map-ex" className="text-xs font-medium">
                    Ví dụ (Example)
                  </Label>
                  <select
                    id="map-ex"
                    value={columnMapping["example"] ?? ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, example: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Không sử dụng --</option>
                    {detection.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : contentType === "exercise" ? (
              <>
                <div className="flex flex-col gap-1 text-xs">
                  <Label htmlFor="map-q" className="text-xs font-medium">
                    Câu hỏi (Question) *
                  </Label>
                  <select
                    id="map-q"
                    value={columnMapping["question_text"] ?? ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, question_text: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chọn cột --</option>
                    {detection.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <Label htmlFor="map-ans" className="text-xs font-medium">
                    Đáp án đúng (Answer) *
                  </Label>
                  <select
                    id="map-ans"
                    value={columnMapping["correct_answer"] ?? ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, correct_answer: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chọn cột --</option>
                    {detection.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting || !title.trim() || !file}>
        {isSubmitting ? "Đang tải lên…" : "Tải lên và xử lý"}
      </Button>
    </form>
  );
}
