"use client";

import { MESSAGE_MAX_LENGTH } from "@/lib/constants/messages";

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
            className="w-full rounded-full border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
          >
            Send
          </button>
        </form>
      ) : (
        <p className="text-center text-xs text-ink-faint">
          You can only message people you follow, or who follow you.
        </p>
      )}
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
