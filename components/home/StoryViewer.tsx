"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn, formatRelativeDate } from "@/lib/utils";
import { NOTICE } from "@/components/ui/panel";
import { archiveUpdate, markUpdateViewed, reactToUpdate, submitAnswer, voteOnPoll } from "@/lib/actions/update";
import { REACTION_EMOJIS } from "@/lib/constants/updates";
import type { CreatorStory, StoryUpdate } from "@/lib/discovery/stories";
import { Button } from "@/components/ui/button";
import { PILL_FIELD_ON_PHOTO } from "@/components/ui/input";

const STORY_DURATION_MS = 5000;

type StoryViewerProps = {
  stories: CreatorStory[];
  initialCreatorIndex: number;
  /** true quando chi guarda è il proprietario di questi Update (StoryViewer usato per la propria
   * Home o il proprio profilo): mostra i risultati di sondaggi/domande invece di poter votare o
   * rispondere, più un modo per cancellare — mai true per i creator seguiti. */
  isOwner: boolean;
  onClose: () => void;
};

export function StoryViewer({ stories, initialCreatorIndex, isOwner, onClose }: StoryViewerProps) {
  const [creatorIndex, setCreatorIndex] = useState(initialCreatorIndex);
  const [updateIndex, setUpdateIndex] = useState(0);

  const story = stories[creatorIndex];
  const update = story?.updates[updateIndex];

  function goNext() {
    if (!story) return;
    if (updateIndex < story.updates.length - 1) {
      setUpdateIndex((index) => index + 1);
      return;
    }
    if (creatorIndex < stories.length - 1) {
      setCreatorIndex((index) => index + 1);
      setUpdateIndex(0);
      return;
    }
    onClose();
  }

  function goPrev() {
    if (updateIndex > 0) {
      setUpdateIndex((index) => index - 1);
      return;
    }
    if (creatorIndex > 0) {
      const previousStory = stories[creatorIndex - 1];
      setCreatorIndex((index) => index - 1);
      setUpdateIndex(previousStory.updates.length - 1);
    }
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorIndex, updateIndex]);

  if (!story || !update) return null;

  // Portale su document.body: un antenato con `isolation: isolate` (es. la sezione della foto
  // profilo, components/profile/ProfileHero.tsx) intrappolerebbe altrimenti questo overlay dentro
  // il proprio contesto di stacking, facendolo comparire sotto ad Header e altri elementi della
  // pagina invece che sopra a tutto — indipendente da dove viene aperto il visualizzatore.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--color-surface)_0%,_var(--color-bg)_65%)]">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-bg sm:h-[92vh] sm:rounded-2xl">
        {/* `key={update.id}`: ogni Update riparte con stato proprio (progresso, voto, risposta,
            reazione) rimontando invece di resettare a mano dentro un effect — stesso pattern
            raccomandato da React per "reset state quando cambia una prop". */}
        <StorySlide
          key={update.id}
          story={story}
          update={update}
          updateIndex={updateIndex}
          isOwner={isOwner}
          onNext={goNext}
          onPrev={goPrev}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
}

function StorySlide({
  story,
  update,
  updateIndex,
  isOwner,
  onNext,
  onPrev,
  onClose,
}: {
  story: CreatorStory;
  update: StoryUpdate;
  updateIndex: number;
  isOwner: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const [segmentProgress, setSegmentProgress] = useState(0);
  const [myVoteOptionId, setMyVoteOptionId] = useState<string | null>(update.poll?.myOptionId ?? null);
  const [pollVotes, setPollVotes] = useState<Record<string, number> | null>(null);
  const [answered, setAnswered] = useState(update.answeredByMe);
  const [answerText, setAnswerText] = useState("");
  const [answerPending, setAnswerPending] = useState(false);
  const [reaction, setReaction] = useState<string | null>(update.myReaction);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function handleDelete() {
    if (deleting || !window.confirm("Delete this Update? This can't be undone.")) return;
    setDeleting(true);
    const result = await archiveUpdate(update.id);
    if (result.error) {
      setDeleting(false);
      return;
    }
    onClose();
  }

  useEffect(() => {
    // "Al mount" equivale qui a "quando appare questo Update": il componente rimonta a ogni
    // cambio (key={update.id} nel genitore), niente da rieseguire in risposta a un cambio di props.
    if (!update.viewedByMe) void markUpdateViewed(update.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Avanzamento automatico a tempo fisso: mai per Video (avanza all'evento "ended", gestito da
  // StoryContent) né per Domande (restano finché non si risponde o non si scorre via a mano) —
  // "Domanda" include qui sia il tipo QUESTION puro sia un Update foto/video con isQuestion.
  useEffect(() => {
    if (update.type === "VIDEO" || update.isQuestion || paused) return;

    const start = Date.now() - (segmentProgress / 100) * STORY_DURATION_MS;
    const interval = setInterval(() => {
      const percent = Math.min(100, ((Date.now() - start) / STORY_DURATION_MS) * 100);
      setSegmentProgress(percent);
      if (percent >= 100) {
        clearInterval(interval);
        onNext();
      }
    }, 50);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  async function handleVote(optionId: string) {
    if (isOwner || myVoteOptionId || !update.poll) return;
    const poll = update.poll;
    setMyVoteOptionId(optionId);
    setPollVotes({
      ...Object.fromEntries(poll.options.map((option) => [option.id, option.votes])),
      [optionId]: (poll.options.find((option) => option.id === optionId)?.votes ?? 0) + 1,
    });
    const result = await voteOnPoll(update.id, optionId);
    if (result.error) setMyVoteOptionId(null);
  }

  async function handleAnswerSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!answerText.trim() || answerPending) return;
    setAnswerPending(true);
    const result = await submitAnswer(update.id, answerText);
    setAnswerPending(false);
    if (!result.error) setAnswered(true);
  }

  async function handleReaction(emoji: string) {
    const next = reaction === emoji ? null : emoji;
    setReaction(next);
    await reactToUpdate(update.id, emoji);
  }

  return (
    <>
      <div className="absolute inset-x-3 top-3 z-30 flex gap-1">
        {story.updates.map((item, index) => (
          <div key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-overlay">
            <div
              className="h-full bg-on-photo"
              style={{
                width: `${index < updateIndex ? 100 : index === updateIndex ? segmentProgress : 0}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-4 top-7 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-overlay text-sm font-semibold text-on-photo">
            {story.creatorAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              story.creatorName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-on-photo">{story.creatorName}</p>
            <p className="text-sm text-on-photo">{formatRelativeDate(update.publishedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete this Update"
              className="text-on-photo hover:text-on-photo disabled:opacity-50"
            >
              <TrashIcon className="h-[18px] w-[18px]" />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className="text-on-photo hover:text-on-photo">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <button type="button" aria-label="Previous update" onClick={onPrev} className="absolute inset-y-0 left-0 z-20 w-1/3" />
      <button type="button" aria-label="Next update" onClick={onNext} className="absolute inset-y-0 right-0 z-20 w-2/3" />

      <div className="relative flex h-full w-full items-center justify-center">
        <StoryContent
          update={update}
          muted={muted}
          paused={paused}
          onToggleMute={() => setMuted((value) => !value)}
          videoRef={videoRef}
          onVideoEnded={onNext}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 card-scrim px-4 pb-5 pt-10">
        {/* Prompt del sondaggio/domanda quando abbinati a una foto/video: qui, appena sopra i
            pulsanti/il campo risposta, invece che come didascalia sovrapposta più in alto (dove
            entrerebbe in collisione con un pannello alto come quello del sondaggio). Per un
            Update di tipo POLL/QUESTION puro (senza media) resta come testo centrale grande,
            gestito da StoryContent. */}
        {(update.poll || update.isQuestion) &&
          (update.type === "IMAGE" || update.type === "VIDEO") &&
          update.content && <p className="text-sm font-medium text-on-photo">{update.content}</p>}

        {update.poll && (
          <div className="space-y-2" onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            {update.poll.options.map((option) => {
              const votes = pollVotes ? (pollVotes[option.id] ?? option.votes) : option.votes;
              const total = pollVotes
                ? Object.values(pollVotes).reduce((sum, value) => sum + value, 0)
                : update.poll!.totalVotes;
              // Il proprietario vede subito i risultati del proprio sondaggio, senza dover votare
              // (non avrebbe senso) — stile Instagram: la card diventa una barra di riempimento
              // invece di un pulsante da premere.
              const showResults = isOwner || myVoteOptionId !== null;
              const percent = showResults && total > 0 ? Math.round((votes / total) * 100) : 0;
              const isMine = option.id === myVoteOptionId;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  disabled={isOwner || myVoteOptionId !== null}
                  className={cn(
                    NOTICE,
                    "relative w-full overflow-hidden rounded-2xl text-left font-semibold text-on-photo transition-colors",
                    isMine ? "border-ember" : "border-border",
                    isOwner && "cursor-default"
                  )}
                >
                  {showResults && (
                    <div
                      className={`absolute inset-y-0 left-0 ${isMine ? "bg-ember-line" : "bg-overlay-soft"}`}
                      style={{ width: `${percent}%` }}
                    />
                  )}
                  <span className="relative flex items-center justify-between">
                    <span>{option.label}</span>
                    {showResults && <span className="text-sm text-on-photo">{percent}%</span>}
                  </span>
                </button>
              );
            })}
            {isOwner && (
              <p className="text-center text-sm text-on-photo">
                {update.poll.totalVotes} {update.poll.totalVotes === 1 ? "vote" : "votes"}
              </p>
            )}
          </div>
        )}

        {update.link && (
          <Link
            href={update.link.href}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-on-photo px-4 py-2 text-sm font-semibold text-bg"
          >
            {update.link.label} →
          </Link>
        )}

        {/* Il proprietario legge subito le risposte ricevute, stile Instagram (swipe-up sulla
            propria storia) — chiunque altro vede il campo per rispondere, mai le une le altre. */}
        {update.isQuestion && isOwner && (
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-on-photo">
              {update.answers.length === 0
                ? "No answers yet"
                : `${update.answers.length} ${update.answers.length === 1 ? "answer" : "answers"}`}
            </p>
            {update.answers.length > 0 && (
              <div
                className="max-h-40 space-y-1.5 overflow-y-auto"
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {update.answers.map((answer) => (
                  <div key={answer.id} className="rounded-2xl bg-overlay-soft px-3.5 py-2">
                    <p className="text-sm text-on-photo">{answer.content}</p>
                    <p className="mt-0.5 text-sm text-on-photo">{formatRelativeDate(answer.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {update.isQuestion &&
          !isOwner &&
          (answered ? (
            <p className="text-sm font-medium text-on-photo">
              Answer sent. Only {story.creatorName} can see it.
            </p>
          ) : (
            <form onSubmit={handleAnswerSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                placeholder="Send a private answer…"
                maxLength={500}
                className={PILL_FIELD_ON_PHOTO}
              />
              <Button variant="primary" type="submit" disabled={answerPending || !answerText.trim()}>
                Send
              </Button>
            </form>
          ))}

        <div className="flex items-center gap-2">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleReaction(emoji)}
              aria-pressed={reaction === emoji}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-base transition-transform active:scale-90 ${
                reaction === emoji ? "border-ember bg-ember-soft" : "border-border bg-overlay-soft"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StoryContent({
  update,
  muted,
  paused,
  onToggleMute,
  videoRef,
  onVideoEnded,
}: {
  update: StoryUpdate;
  muted: boolean;
  paused: boolean;
  onToggleMute: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoEnded: () => void;
}) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else void video.play().catch(() => {});
  }, [paused, videoRef]);

  if (update.type === "IMAGE" && update.mediaUrl) {
    return (
      <>
        {/* Foto già firmata (foto reale) o URL demo: mai un file locale, next/image non serve qui. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={update.mediaUrl} alt="" className="h-full w-full object-cover" />
        {update.content && !update.poll && !update.isQuestion && (
          <p className="absolute bottom-32 left-4 right-4 text-sm font-medium text-on-photo drop-shadow-lg">
            {update.content}
          </p>
        )}
      </>
    );
  }

  if (update.type === "VIDEO" && update.mediaUrl) {
    return (
      <>
        <video
          ref={videoRef}
          src={update.mediaUrl}
          autoPlay
          muted={muted}
          playsInline
          onEnded={onVideoEnded}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-4 top-20 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-scrim text-on-photo"
        >
          {muted ? <MuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
        </button>
        {update.content && !update.poll && !update.isQuestion && (
          <p className="absolute bottom-32 left-4 right-4 text-sm font-medium text-on-photo drop-shadow-lg">
            {update.content}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center cover-placeholder px-8">
      <p className="text-center text-2xl font-bold leading-snug text-on-photo">{update.content}</p>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 6 6 16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l.5-10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 9v5M11.5 9v5" strokeLinecap="round" />
    </svg>
  );
}

function MuteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M3 8v4h3l4 3V5L6 8H3Z" strokeLinejoin="round" />
      <path d="m13 8 4 4m0-4-4 4" strokeLinecap="round" />
    </svg>
  );
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M3 8v4h3l4 3V5L6 8H3Z" strokeLinejoin="round" />
      <path d="M14 7a3.5 3.5 0 0 1 0 6M16.2 5a6.5 6.5 0 0 1 0 10" strokeLinecap="round" />
    </svg>
  );
}
