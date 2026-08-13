import { notFound } from "next/navigation";

import { JoinConfirmCard } from "@/components/classrooms/join-confirm-card";
import { getInvitePreview } from "@/lib/classrooms";

type JoinPageProps = {
  params: Promise<{ token: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;
  const preview = await getInvitePreview(token);

  if (!preview) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <JoinConfirmCard token={token} preview={preview} />
    </div>
  );
}
