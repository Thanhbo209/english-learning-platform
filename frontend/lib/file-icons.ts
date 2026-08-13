import { FileSpreadsheet, FileText, FileType, Table } from "lucide-react";
import type { ComponentType } from "react";

export type FileIcon = { icon: ComponentType<{ className?: string }>; color: string };

// Keyed by lowercase file extension (without the dot), matching the
// backend's SourceFormat enum ("docx" | "xlsx" | "pdf" | "csv").
export const FILE_TYPE_ICONS: Record<string, FileIcon> = {
  docx: { icon: FileText, color: "text-blue-600" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600" },
  xls: { icon: FileSpreadsheet, color: "text-emerald-600" },
  pdf: { icon: FileType, color: "text-red-600" },
  csv: { icon: Table, color: "text-amber-600" },
};

export function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}
