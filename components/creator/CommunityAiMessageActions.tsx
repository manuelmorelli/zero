"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const COPIED_FEEDBACK_MS = 2000;

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
      <Button variant="ghostIconSmall" onClick={handleCopy} aria-label={copied ? "Copied" : "Copy"} title="Copy">
        {copied ? <Check className="h-4 w-4 text-ember" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </Button>
      {onRegenerate && (
        <Button variant="ghostIconSmall" onClick={onRegenerate} disabled={disabled} aria-label="Regenerate" title="Regenerate">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
