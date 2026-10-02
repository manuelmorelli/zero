"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { postForumMessage } from "@/lib/actions/forum";
import { FORUM_MESSAGE_MAX_LENGTH } from "@/lib/constants/forum";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ForumComposerProps = {
  journeyId: string;
  canWrite: boolean;
  isLoggedIn: boolean;
  viewerName: string;
  viewerAvatarUrl: string | null;
};

export function ForumComposer({ journeyId, canWrite, isLoggedIn, viewerName, viewerAvatarUrl }: ForumComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <p className="mt-4 text-sm text-ink-muted">
        {isLoggedIn ? "Start this Journey to join the conversation." : "Log in and start this Journey to join the conversation."}
      </p>
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await postForumMessage(journeyId, trimmed);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setContent("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-2.5">
      <Avatar name={viewerName} avatarUrl={viewerAvatarUrl} size="sm" className="mt-1" />
      <div className="min-w-0 flex-1">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={FORUM_MESSAGE_MAX_LENGTH}
          rows={2}
          placeholder="Share your thoughts on this Journey…"
          disabled={pending}
        />
        <div className="mt-2 flex justify-end">
          <Button variant="primary" type="submit" disabled={pending || !content.trim()}>
            {pending ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
