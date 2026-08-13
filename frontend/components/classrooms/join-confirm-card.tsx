"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultAvatarUrl, getInitials } from "@/lib/avatars";
import { joinClassroom } from "@/lib/classrooms-client";
import type { ClassroomInvitePreview } from "@/types/classroom";

export function JoinConfirmCard({
  token,
  preview,
}: {
  token: string;
  preview: ClassroomInvitePreview;
}) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setIsJoining(true);
    setError(null);
    try {
      const classroom = await joinClassroom(token);
      router.push(`/dashboard/classrooms/${classroom.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tham gia lớp học");
      setIsJoining(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Tham gia lớp học</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          Bạn sắp tham gia lớp học{" "}
          <span className="font-medium text-foreground">{preview.classroom_name}</span>
        </p>
        {preview.teacher_email || preview.teacher_full_name ? (
          <div className="mt-1 flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={getDefaultAvatarUrl("teacher")} alt="" />
              <AvatarFallback>
                {getInitials(preview.teacher_full_name, preview.teacher_email ?? "GV")}
              </AvatarFallback>
            </Avatar>
            <span>{preview.teacher_full_name ?? preview.teacher_email}</span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" onClick={handleJoin} disabled={isJoining}>
          {isJoining ? "Đang tham gia…" : "Tham gia lớp học"}
        </Button>
      </CardFooter>
    </Card>
  );
}
