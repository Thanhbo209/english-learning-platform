import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocumentReader } from "@/components/content/document-reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssignmentDetail } from "@/lib/content";

type AssignmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const { id } = await params;
  const data = await getAssignmentDetail(id);

  if (!data) {
    notFound();
  }

  const { content } = data;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/content"
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Nội dung được giao
      </Link>

      {content.type === "learning_document" ? (
        <DocumentReader
          title={content.title}
          description={content.description}
          body={content.document_body ?? ""}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{content.title}</h2>
            {content.description ? (
              <p className="text-xs text-muted-foreground leading-relaxed">{content.description}</p>
            ) : null}
          </div>

          {content.type === "vocabulary" ? (
            <div className="flex flex-col gap-3">
              {content.vocabulary_items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-primary">{item.word}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">{item.definition}</p>
                    {item.translation ? (
                      <p className="text-xs text-muted-foreground">Bản dịch: {item.translation}</p>
                    ) : null}
                    {item.example ? (
                      <p className="italic text-muted-foreground/80">&ldquo;{item.example}&rdquo;</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {content.type === "exercise" ? (
            <div className="flex flex-col gap-4">
              {content.questions.map((question, index) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold leading-relaxed">
                      Câu {index + 1}: {question.question_text}
                    </CardTitle>
                  </CardHeader>
                  {question.options && question.options.length > 0 ? (
                    <CardContent className="flex flex-col gap-2 pt-0 text-xs sm:text-sm">
                      {question.options.map((option, optIdx) => {
                        const label = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={`${optIdx}-${option}`}
                            className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3.5 py-2.5 font-medium text-foreground transition-colors hover:bg-muted/60"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                              {label}
                            </span>
                            <span className="leading-relaxed">{option}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

