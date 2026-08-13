"use client";

import { Check, Copy, Link2, RefreshCw } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { rotateJoinToken } from "@/lib/classrooms-client";

function subscribeNoop() {
  return () => {};
}

function getOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return "";
}

export function JoinLinkPanel({
  classroomId,
  joinToken,
}: {
  classroomId: string;
  joinToken: string;
}) {
  const origin = useSyncExternalStore(subscribeNoop, getOrigin, getServerOrigin);
  const [token, setToken] = useState(joinToken);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = origin ? `${origin}/join/${token}` : "";

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRotate() {
    if (!window.confirm("Tạo liên kết mới? Liên kết cũ sẽ ngừng hoạt động.")) {
      return;
    }
    setIsRotating(true);
    setError(null);
    try {
      const updated = await rotateJoinToken(classroomId);
      setToken(updated.join_token);
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo liên kết mới");
    } finally {
      setIsRotating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          Liên kết mời
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Gửi liên kết này cho học viên để họ tham gia lớp học.
        </p>
        <div className="flex items-center gap-2">
          <Input readOnly value={link} className="text-muted-foreground" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!link}
            aria-label="Sao chép liên kết"
          >
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRotate}
            disabled={isRotating}
            aria-label="Tạo liên kết mới"
          >
            <RefreshCw className={isRotating ? "size-4 animate-spin" : "size-4"} />
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
