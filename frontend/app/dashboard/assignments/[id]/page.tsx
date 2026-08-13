import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/dashboard/content"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Nội dung được giao
      </Link>

      <div>
        <h2 className="text-base font-semibold tracking-tight">{content.title}</h2>
        {content.description ? (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        ) : null}
      </div>

      {content.type === "learning_document" ? (
        <Card>
          <CardContent className="whitespace-pre-wrap pt-4 text-sm">
            {content.document_body}
          </CardContent>
        </Card>
      ) : null}

      {content.type === "vocabulary" ? (
        <div className="flex flex-col gap-3">
          {content.vocabulary_items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.word}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>{item.definition}</p>
                {item.translation ? <p>Bản dịch: {item.translation}</p> : null}
                {item.example ? <p className="italic">&ldquo;{item.example}&rdquo;</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {content.type === "exercise" ? (
        <div className="flex flex-col gap-3">
          {content.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-sm">
                  Câu {index + 1}: {question.question_text}
                </CardTitle>
              </CardHeader>
              {question.options ? (
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {question.options.map((option) => (
                    <p key={option}>• {option}</p>
                  ))}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
