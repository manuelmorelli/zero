"use client";

import { MESSAGE_MAX_LENGTH } from "@/lib/constants/messages";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatComposerProps = {
  canWrite: boolean;
  input: string;
  setInput: (value: string) => void;
  sending: boolean;
  error: string | null;
  otherUserName: string;
  onSubmit: (event: React.FormEvent) => void;
};

export function ChatComposer({
  canWrite,
  input,
  setInput,
  sending,
  error,
  otherUserName,
  onSubmit,
}: ChatComposerProps) {
  return (
    <div className="border-t border-border p-3">
      {canWrite ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={MESSAGE_MAX_LENGTH}
            placeholder={`Message ${otherUserName}…`}
            disabled={sending}
            className={cn(FIELD, "rounded-full bg-surface-2")}
          />
          <Button variant="primary" type="submit" disabled={sending || !input.trim()} className="shrink-0">
            Send
          </Button>
        </form>
      ) : (
        <p className="text-center text-sm text-ink-faint">
          You can only message people you follow, or who follow you.
        </p>
      )}
      {error && <p className="mt-2 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
