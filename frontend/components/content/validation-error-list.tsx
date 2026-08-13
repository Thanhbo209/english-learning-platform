import { AlertCircle } from "lucide-react";

import type { ValidationErrorItem } from "@/types/content";

export function ValidationErrorList({ errors }: { errors: ValidationErrorItem[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertCircle className="size-4" />
        Có {errors.length} lỗi cần khắc phục
      </p>
      <ul className="flex flex-col gap-1 text-sm text-destructive">
        {errors.map((error, index) => (
          <li key={index}>
            <span className="font-medium">{error.location}:</span> {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
