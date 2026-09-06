"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/lib/actions/message";

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
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-5 py-2.5 text-sm font-semibold text-ember backdrop-blur-md transition-colors hover:from-ember/15 disabled:opacity-50"
      >
        {isPending ? "Opening…" : "Message"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
