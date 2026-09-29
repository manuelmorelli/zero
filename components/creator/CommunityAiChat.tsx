"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { FileText, Sparkles, Upload } from "lucide-react";
import { sendCommunityAiMessage } from "@/lib/actions/communityAi";
import { COMMUNITY_LISTING_LABELS } from "@/lib/constants/communityListing";
import {
  loadCommunityAiChat,
  saveCommunityAiChat,
  type CommunityAiChatMessage,
  type CommunityAiPendingDraft,
  type StoredCommunityAiChat,
} from "@/lib/communityAiChatStorage";
import { useCommunityAiAttachments } from "@/hooks/useCommunityAiAttachments";
import { CommunityAiChatImage } from "@/components/creator/CommunityAiChatImage";
import { CommunityAiComposer } from "@/components/creator/CommunityAiComposer";
import { CommunityAiMessageActions } from "@/components/creator/CommunityAiMessageActions";

function welcomeMessage(creatorFirstName: string | null): CommunityAiChatMessage {
  const greeting = creatorFirstName ? `Hi ${creatorFirstName}!` : "Hi!";
  return {
    role: "assistant",
    text: `${greeting} What would you like to create today? A workshop, an event, a digital product or a 1:1 service. Describe it in your own words and I'll prepare a draft for you to check.`,
  };
}

// Le risposte dell'AI arrivano in Markdown (grassetti, elenchi) come su Gemini: qui solo la
// spaziatura, i colori restano quelli del testo della chat.
const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
      {children}
    </a>
  ),
};

function hasDraggedFiles(event: React.DragEvent): boolean {
  return event.dataTransfer.types.includes("Files");
}

/** Assistente AI della pagina Community (Punto 8 dell'allineamento): una chat libera con l'aspetto
 * di Gemini (risposte senza fumetto, riquadro di scrittura grande, file trascinabili), che intanto
 * prepara dietro le quinte una bozza (lib/ai/communityDraft.ts). La bozza non viene mai salvata da
 * sola: il creator la apre nel modulo vero e la conferma lui. La conversazione resta salvata nel
 * browser fino al logout (lib/communityAiChatStorage.ts). */
export function CommunityAiChat({
  userId,
  creatorFirstName,
  onDraftReady,
}: {
  userId: string;
  creatorFirstName: string | null;
  onDraftReady: (pending: CommunityAiPendingDraft) => void;
}) {
  const [chat, setChat] = useState<StoredCommunityAiChat>(
    () =>
      loadCommunityAiChat(userId) ?? {
        messages: [welcomeMessage(creatorFirstName)],
        interactionId: null,
        readyDraft: null,
        draftStartIndex: 0,
      }
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const files = useCommunityAiAttachments();

  useEffect(() => {
    saveCommunityAiChat(userId, chat);
  }, [userId, chat]);

  // Scende da solo all'ultimo messaggio (e all'indicatore "Thinking…"), come in ogni app di chat.
  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.readyDraft, pending]);

  /** Un turno con l'AI. `base` è la conversazione fino al messaggio del creator compreso: per un
   * messaggio nuovo è tutta la chat più quel messaggio, per "Regenerate" è la chat senza l'ultima
   * risposta, che viene rifatta partendo dalla stessa memoria Gemini di allora. */
  async function runTurn(base: CommunityAiChatMessage[], parentInteractionId: string | null) {
    const userMessage = base[base.length - 1];
    const before = base.slice(0, -1);
    const conversation = before.filter((item) => !item.failed);
    const draftConversation = before.slice(chat.draftStartIndex).filter((item) => !item.failed);
    const lastImageKey = [...before].reverse().find((item) => item.imageKey)?.imageKey ?? null;

    setChat((current) => ({ ...current, messages: base }));
    setPending(true);

    const result = await sendCommunityAiMessage({
      message: userMessage.text,
      previousInteractionId: parentInteractionId,
      history: conversation,
      draftConversation,
      lastImageKey,
      attachments: userMessage.attachments ?? [],
    });

    if ("error" in result) {
      setChat((current) => ({
        ...current,
        messages: [...current.messages, { role: "assistant", text: result.error, failed: true, parentInteractionId }],
      }));
    } else {
      setChat((current) => ({
        ...current,
        interactionId: result.interactionId,
        messages: [
          ...current.messages,
          {
            role: "assistant",
            text: result.reply,
            parentInteractionId,
            ...(result.imageKey ? { imageKey: result.imageKey } : {}),
          },
        ],
        // Una risposta senza bozza non cancella quella precedente: il pulsante resta finché ce n'è una.
        readyDraft: result.draft ? { type: result.draft.type, draft: result.draft } : current.readyDraft,
      }));
    }
    setPending(false);
  }

  function handleSend() {
    const message = input.trim();
    if ((!message && files.attachments.length === 0) || pending || files.uploading) return;
    const attachments = files.takeReady();
    setInput("");
    runTurn(
      [...chat.messages, { role: "user", text: message, ...(attachments.length > 0 ? { attachments } : {}) }],
      chat.interactionId
    );
  }

  function handleRegenerate(index: number) {
    if (pending) return;
    runTurn(chat.messages.slice(0, index), chat.messages[index].parentInteractionId ?? null);
  }

  // "Regenerate" solo sull'ultima risposta, se si sa da dove era partita (le chat salvate prima di
  // questa funzione non lo sanno) e se non è già stata trasformata in qualcosa di creato.
  const lastIndex = chat.messages.length - 1;
  const lastMessage = chat.messages[lastIndex];
  const canRegenerateLast =
    lastMessage?.role === "assistant" &&
    lastMessage.parentInteractionId !== undefined &&
    chat.messages[lastIndex - 1]?.role === "user" &&
    lastIndex > chat.draftStartIndex;

  const { readyDraft, coverKey } = chat;
  // Il primo messaggio salvato è sempre il benvenuto: non si mostra più come fumetto, al suo posto
  // c'è la grande scritta al centro finché il creator non scrive qualcosa (come Gemini).
  const hasConversation = chat.messages.some((message) => message.role === "user");

  const composer = (
    <CommunityAiComposer
      value={input}
      onChange={setInput}
      onSend={handleSend}
      canSend={!pending && !files.uploading && (input.trim() !== "" || files.attachments.length > 0)}
      attachments={files.attachments}
      attachmentError={files.error}
      onFiles={files.addFiles}
      onRemoveAttachment={files.remove}
    />
  );

  return (
    <div
      onDragEnter={(event) => {
        if (hasDraggedFiles(event)) setDragging(true);
      }}
      onDragOver={(event) => {
        if (hasDraggedFiles(event)) event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        if (!hasDraggedFiles(event)) return;
        event.preventDefault();
        setDragging(false);
        files.addFiles(event.dataTransfer.files);
      }}
      className="relative isolate flex h-dvh flex-col overflow-hidden pt-[3.85rem]"
    >
      {/* La luce dietro la chat: forte al centro a chat vuota, poi scende dietro la barra di
          scrittura. Bianca e neutra, niente arancione (richiesta di Manuel del 2026-09-29). */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_40%_at_50%_48%,rgba(255,255,255,0.16),transparent_70%),radial-gradient(ellipse_95%_75%_at_50%_50%,rgba(255,255,255,0.06),transparent_80%)] transition-opacity duration-700 ${
          hasConversation ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_35%_at_50%_100%,rgba(255,255,255,0.12),transparent_75%)] transition-opacity duration-700 ${
          hasConversation ? "opacity-100" : "opacity-0"
        }`}
      />

      {!hasConversation ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-[8vh]">
          <h1 className="text-center text-3xl font-light tracking-tight text-ink sm:text-5xl">
            {creatorFirstName ? `What shall we create today, ${creatorFirstName}?` : "What shall we create today?"}
          </h1>
          <div className="mt-10 w-full max-w-3xl">{composer}</div>
          <p className="mt-4 text-center text-xs text-ink-faint">
            A workshop, an event, a digital product or a 1:1 service. Describe it and I&apos;ll prepare a draft.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--color-surface-2)_transparent] [scrollbar-width:thin]"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
              {chat.messages.map((message, index) =>
                index === 0 ? null : message.role === "user" ? (
                  <div key={index} className="ml-auto flex max-w-[85%] flex-col items-end gap-2">
                    {message.attachments?.map((attachment) =>
                      attachment.kind === "image" ? (
                        <div key={attachment.key} className="w-56">
                          <CommunityAiChatImage
                            imageKey={attachment.key}
                            selected={coverKey === attachment.key}
                            onSelect={() => setChat((current) => ({ ...current, coverKey: attachment.key }))}
                          />
                        </div>
                      ) : (
                        <div
                          key={attachment.key}
                          className="flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-ink"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                          <span className="truncate text-xs">{attachment.name}</span>
                        </div>
                      )
                    )}
                    {message.text && (
                      <div className="whitespace-pre-wrap rounded-3xl rounded-tr-md bg-surface-2 px-4 py-2.5 text-base leading-relaxed text-ink">
                        {message.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={index} className="flex gap-3">
                    <Sparkles className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
                    <div className="min-w-0 flex-1 text-base leading-relaxed">
                      {message.imageKey && (
                        <div className="max-w-sm">
                          <CommunityAiChatImage
                            imageKey={message.imageKey}
                            selected={coverKey === message.imageKey}
                            onSelect={() => setChat((current) => ({ ...current, coverKey: message.imageKey }))}
                          />
                        </div>
                      )}
                      <div className={message.failed ? "text-ink-muted" : "text-ink"}>
                        <ReactMarkdown components={MARKDOWN_COMPONENTS}>{message.text}</ReactMarkdown>
                      </div>
                      <CommunityAiMessageActions
                        text={message.text}
                        onRegenerate={index === lastIndex && canRegenerateLast ? () => handleRegenerate(index) : undefined}
                        disabled={pending}
                      />
                    </div>
                  </div>
                )
              )}
              {pending && (
                <div className="flex items-center gap-3 text-base text-ink-faint">
                  <Sparkles className="h-5 w-5 shrink-0 animate-pulse text-ember" aria-hidden="true" />
                  Thinking…
                </div>
              )}
            </div>
          </div>

          {/* In basso la barra resta fissa; sotto lg lascia spazio a destra ai pulsanti rotondi
              globali (messaggi, notifiche, "+") che altrimenti la coprirebbero. */}
          <div className="mx-auto w-full max-w-3xl px-4 pb-4 max-lg:pr-[5.5rem]">
            {readyDraft && (
              <button
                type="button"
                onClick={() => onDraftReady({ ...readyDraft, draft: { ...readyDraft.draft, coverKey: coverKey ?? null } })}
                className="mb-3 w-full rounded-full bg-ember px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ember/90"
              >
                Fill the {COMMUNITY_LISTING_LABELS[readyDraft.type]} form with this
              </button>
            )}
            {composer}
          </div>
        </>
      )}

      {dragging && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 top-[calc(3.85rem+1rem)] flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink-muted bg-bg/85 text-sm font-semibold text-ink">
          <Upload className="h-6 w-6 text-ink" aria-hidden="true" />
          Drop your photos or PDFs here
        </div>
      )}
    </div>
  );
}
