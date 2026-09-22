"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleLike } from "@/lib/actions/like";
import { formatCompactNumber } from "@/lib/utils";
import type { LikeTargetType } from "@/generated/prisma/client";

// Rinominato da "Like" a "Trusty" nell'interfaccia: il dato sotto resta lo stesso modello `Like`
// (nessuna migrazione, nessun rischio) — cambia solo cosa vede l'utente e a cosa serve il segnale.
// Non misura più la qualità dell'episodio (rimosso da lib/scoring/journeyScore.ts): alimenta invece
// il Trust Score del creator con un contributo piccolo e cappato (lib/profile/trustScore.ts).
type TrustyButtonProps = {
  targetType: LikeTargetType;
  targetId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
  /** Sbloccato solo quando l'episodio è stato guardato fino alla fine (vedi EpisodePlayer). */
  unlocked: boolean;
};

export function TrustyButton({
  targetType,
  targetId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
  unlocked,
}: TrustyButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        aria-label="Log in to react with Trusty"
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
      >
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {formatCompactNumber(likeCount)}
      </Link>
    );
  }

  function handleClick() {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((count) => count + (wasLiked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleLike(targetType, targetId);
      if (result.error) {
        setIsLiked(wasLiked);
        setLikeCount((count) => count + (wasLiked ? 1 : -1));
      }
    });
  }

  return (
    <span className="group relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || !unlocked}
        aria-pressed={isLiked}
        aria-label={
          unlocked ? (isLiked ? "Remove Trusty" : "Give Trusty") : "Watch to the end to unlock Trusty"
        }
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          isLiked
            ? "border-ember/40 bg-ember/10 text-ember"
            : "border-border text-ink-muted hover:border-ink-muted hover:text-ink"
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5" fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
        {formatCompactNumber(likeCount)}
      </button>
      <TrustyTooltip locked={!unlocked} />
    </span>
  );
}

function TrustyTooltip({ locked }: { locked: boolean }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-center text-[0.7rem] leading-snug text-ink-muted opacity-0 shadow-lg transition-opacity md:group-hover:block md:group-hover:opacity-100">
      {locked
        ? "Watch the episode to the end to unlock Trusty."
        : "Give a Trusty when you trust this content, it helps build the creator's Trust Score."}
    </span>
  );
}
