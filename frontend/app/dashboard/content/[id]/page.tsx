import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignContentDialog } from "@/components/content/assign-content-dialog";
import { AssignmentList } from "@/components/content/assignment-list";
import { STATUS_LABELS } from "@/components/content/content-card";
import { ContentEditor } from "@/components/content/content-editor";
import { DeleteContentButton } from "@/components/content/delete-content-button";
import { ValidationErrorList } from "@/components/content/validation-error-list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getMyClassrooms } from "@/lib/classrooms";
import { getContentAssignments, getContentDetail } from "@/lib/content";

type ContentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params;
  const content = await getContentDetail(id);

  if (!content) {
    notFound();
  }

  const [assignments, classrooms] = await Promise.all([
    getContentAssignments(id),
    getMyClassrooms(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/content"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tất cả nội dung
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">{content.title}</h2>
              <Badge variant={content.status === "published" ? "default" : "secondary"}>
                {STATUS_LABELS[content.status]}
              </Badge>
            </div>
          </div>
          {content.description ? (
            <p className="text-sm text-muted-foreground">{content.description}</p>
          ) : null}

          {content.validation_errors && content.validation_errors.length > 0 ? (
            <ValidationErrorList errors={content.validation_errors} />
          ) : null}

          <ContentEditor content={content} />

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Quản lý nội dung</p>
            <DeleteContentButton contentId={content.id} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Đã giao cho</p>
              <AssignContentDialog contentId={content.id} classrooms={classrooms} />
            </div>
            <AssignmentList assignments={assignments} classrooms={classrooms} />
          </div>
        </div>
      </div>
    </div>
  );
}
