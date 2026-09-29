"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";

const COPIED_FEEDBACK_MS = 2000;

const ACTION_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

/** I tasti sotto una risposta dell'AI, come su Gemini: "Copy" sempre, "Regenerate" solo
 * sull'ultima risposta (chiede all'AI un'altra versione dello stesso turno). */
export function CommunityAiMessageActions({
  text,
  onRegenerate,
  disabled,
}: {
  text: string;
  onRegenerate?: () => void;
  disabled: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Appunti non disponibili (permesso negato): niente da fare, il testo resta selezionabile.
    }
  }

  return (
    <div className="mt-1 flex items-center gap-0.5">
      <button type="button" onClick={handleCopy} aria-label={copied ? "Copied" : "Copy"} title="Copy" className={ACTION_CLASS}>
        {copied ? <Check className="h-4 w-4 text-ember" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={disabled}
          aria-label="Regenerate"
          title="Regenerate"
          className={ACTION_CLASS}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
