import { AlertCircle, AlertTriangle } from "lucide-react";

import type { ValidationErrorItem } from "@/types/content";

export function ValidationErrorList({ errors }: { errors: ValidationErrorItem[] }) {
  const blockingErrors = errors.filter((e) => e.severity !== "warning");
  const warnings = errors.filter((e) => e.severity === "warning");

  return (
    <div className="flex flex-col gap-3">
      {blockingErrors.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            Có {blockingErrors.length} lỗi cần khắc phục trước khi xuất bản
          </p>
          <ul className="flex flex-col gap-1 text-xs text-destructive">
            {blockingErrors.map((error, index) => (
              <li key={index}>
                <span className="font-semibold">{error.location}:</span> {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 dark:border-amber-500/20">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            {warnings.length} cảnh báo (không bắt buộc sửa)
          </p>
          <ul className="flex flex-col gap-1 text-xs text-amber-800 dark:text-amber-300">
            {warnings.map((warning, index) => (
              <li key={index}>
                <span className="font-semibold">{warning.location}:</span> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
