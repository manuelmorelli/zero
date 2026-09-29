"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/lib/actions/message";
import { Button } from "@/components/ui/button";

type MessageButtonProps = {
  userId: string;
};

/**
 * Basta che una delle due persone segua l'altra (non serve il follow reciproco, vedi
 * 00-project-context.md, sezione "Follow universale"): il componente non fa quel controllo da
 * sé, si limita a chiamare `startConversation`, che lo rifiuta con un errore se la regola non è
 * rispettata — evita di duplicare la stessa logica lato server e lato client.
 */
export function MessageButton({ userId }: MessageButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startConversation(userId);
      if (result.error || !result.conversationId) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push(`/messages/${result.conversationId}`);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        {isPending ? "Opening…" : "Message"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
