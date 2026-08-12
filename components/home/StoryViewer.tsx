"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { markUpdateViewed, reactToUpdate, submitAnswer, voteOnPoll } from "@/lib/actions/update";
import { REACTION_EMOJIS } from "@/lib/constants/updates";
import type { CreatorStory, StoryUpdate } from "@/lib/discovery/stories";

const STORY_DURATION_MS = 5000;

type StoryViewerProps = {
  stories: CreatorStory[];
  initialCreatorIndex: number;
  onClose: () => void;
};

export function StoryViewer({ stories, initialCreatorIndex, onClose }: StoryViewerProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black sm:h-[92vh] sm:rounded-2xl">
        {/* `key={update.id}`: ogni Update riparte con stato proprio (progresso, voto, risposta,
            reazione) rimontando invece di resettare a mano dentro un effect — stesso pattern
            raccomandato da React per "reset state quando cambia una prop". */}
        <StorySlide
          key={update.id}
          story={story}
          update={update}
          updateIndex={updateIndex}
          onNext={goNext}
          onPrev={goPrev}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function StorySlide({
  story,
  update,
  updateIndex,
  onNext,
  onPrev,
  onClose,
}: {
  story: CreatorStory;
  update: StoryUpdate;
  updateIndex: number;
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // "Al mount" equivale qui a "quando appare questo Update": il componente rimonta a ogni
    // cambio (key={update.id} nel genitore), niente da rieseguire in risposta a un cambio di props.
    if (!update.viewedByMe) void markUpdateViewed(update.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Avanzamento automatico a tempo fisso: mai per Video (avanza all'evento "ended", gestito da
  // StoryContent) né per Domande (restano finché non si risponde o non si scorre via a mano).
  useEffect(() => {
    if (update.type === "VIDEO" || update.type === "QUESTION" || paused) return;

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
    if (myVoteOptionId || !update.poll) return;
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
          <div key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white"
              style={{
                width: `${index < updateIndex ? 100 : index === updateIndex ? segmentProgress : 0}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-4 top-7 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20 text-xs font-semibold text-white">
            {story.creatorAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              story.creatorName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{story.creatorName}</p>
            <p className="text-[11px] text-white/70">{formatRelativeDate(update.publishedAt)}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-white/80 hover:text-white">
          <CloseIcon className="h-5 w-5" />
        </button>
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

      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-10">
        {update.type === "POLL" && update.poll && (
          <div className="space-y-2" onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            {update.poll.options.map((option) => {
              const votes = pollVotes ? (pollVotes[option.id] ?? option.votes) : option.votes;
              const total = pollVotes
                ? Object.values(pollVotes).reduce((sum, value) => sum + value, 0)
                : update.poll!.totalVotes;
              const showResults = myVoteOptionId !== null;
              const percent = showResults && total > 0 ? Math.round((votes / total) * 100) : 0;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  disabled={myVoteOptionId !== null}
                  className={`relative w-full overflow-hidden rounded-full border px-4 py-2.5 text-left text-sm font-semibold text-white transition-colors ${
                    option.id === myVoteOptionId ? "border-ember" : "border-white/30"
                  }`}
                >
                  {showResults && (
                    <div className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${percent}%` }} />
                  )}
                  <span className="relative flex items-center justify-between">
                    <span>{option.label}</span>
                    {showResults && <span className="text-xs text-white/80">{percent}%</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {update.link && (
          <Link
            href={update.link.href}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            {update.link.label} →
          </Link>
        )}

        {update.type === "QUESTION" &&
          (answered ? (
            <p className="text-sm font-medium text-white/80">
              Answer sent — only {story.creatorName} can see it.
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
                className="flex-1 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none"
              />
              <button
                type="submit"
                disabled={answerPending || !answerText.trim()}
                className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-50"
              >
                Send
              </button>
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
                reaction === emoji ? "border-ember bg-ember/20" : "border-white/25 bg-white/5"
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
        {update.content && (
          <p className="absolute bottom-32 left-4 right-4 text-sm font-medium text-white drop-shadow-lg">
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
          className="absolute right-4 top-20 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
        >
          {muted ? <MuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
        </button>
        {update.content && (
          <p className="absolute bottom-32 left-4 right-4 text-sm font-medium text-white drop-shadow-lg">
            {update.content}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 via-black to-black px-8">
      <p className="text-center text-2xl font-bold leading-snug text-white">{update.content}</p>
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
