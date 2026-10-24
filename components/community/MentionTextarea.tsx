"use client";

import { useEffect, useRef, useState } from "react";
import { searchMentionSuggestions, type MentionSuggestion } from "@/lib/actions/forum";
import { activeMentionQuery } from "@/lib/community/mentions";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SUGGESTION_DELAY_MS = 150;

type MentionTextareaProps = Omit<React.ComponentProps<"textarea">, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
};

/** Campo di testo con suggerimenti "@persona" mentre si scrive, come nei commenti di Instagram:
 * scegliendo un nome (clic, oppure frecce + Invio) la @ viene completata con lo username. */
export function MentionTextarea({ value, onValueChange, onKeyDown, ...props }: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [highlighted, setHighlighted] = useState(0);

  const query = mention?.query ?? "";
  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await searchMentionSuggestions(query);
      if (!cancelled) {
        setSuggestions(result);
        setHighlighted(0);
      }
    }, SUGGESTION_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const open = mention !== null && query !== "" && suggestions.length > 0;

  function updateMention(text: string, cursor: number) {
    const next = activeMentionQuery(text, cursor);
    setMention(next);
    if (!next?.query) setSuggestions([]);
  }

  function pick(suggestion: MentionSuggestion) {
    if (!mention) return;
    const before = value.slice(0, mention.start);
    const after = value.slice(mention.start + 1 + mention.query.length);
    const inserted = `@${suggestion.username} `;
    onValueChange(before + inserted + after);
    setMention(null);
    setSuggestions([]);
    const cursor = before.length + inserted.length;
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (open) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((index) => (index + 1) % suggestions.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((index) => (index - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(suggestions[highlighted]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setMention(null);
        return;
      }
    }
    onKeyDown?.(event);
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          updateMention(event.target.value, event.target.selectionStart);
        }}
        onKeyDown={handleKeyDown}
        onClick={(event) => updateMention(event.currentTarget.value, event.currentTarget.selectionStart)}
        onBlur={() => setMention(null)}
        aria-autocomplete="list"
        aria-expanded={open}
        {...props}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-card"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.username} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                // mousedown invece di click: il clic farebbe prima perdere il fuoco al campo, che
                // chiuderebbe l'elenco prima della scelta.
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(suggestion);
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  index === highlighted && "bg-surface-2"
                )}
              >
                <Avatar name={suggestion.name} avatarUrl={suggestion.avatarUrl} size="xs" />
                <span className="min-w-0 truncate text-sm">
                  <span className="font-semibold text-ink">{suggestion.username}</span>
                  <span className="ml-1.5 text-ink-muted">{suggestion.name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
