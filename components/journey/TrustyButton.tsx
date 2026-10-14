"use client";

import { ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleLike } from "@/lib/actions/like";
import { cn, formatCompactNumber } from "@/lib/utils";
import type { LikeTargetType } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { CHIP } from "@/components/ui/panel";

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
  /** Il creator vede il conteggio sui propri episodi ma non può darsi il Trusty (vedi lib/actions/like.ts). */
  isOwnContent?: boolean;
};

export function TrustyButton({
  targetType,
  targetId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
  unlocked,
  isOwnContent = false,
}: TrustyButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button variant="secondary" href="/login" aria-label="Log in to react with Trusty">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {formatCompactNumber(likeCount)}
      </Button>
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
        disabled={isPending || !unlocked || isOwnContent}
        aria-pressed={isLiked}
        aria-label={
          isOwnContent
            ? "Trusty on your own episode"
            : unlocked
              ? (isLiked ? "Remove Trusty" : "Give Trusty")
              : "Watch to the end to unlock Trusty"
        }
        className={cn(
          isLiked ? "border-ember-line bg-ember-soft text-ember" : CHIP,
          "transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
        {formatCompactNumber(likeCount)}
      </button>
      <TrustyTooltip locked={!unlocked} isOwnContent={isOwnContent} />
    </span>
  );
}

function TrustyTooltip({ locked, isOwnContent }: { locked: boolean; isOwnContent: boolean }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm leading-snug text-ink-muted opacity-0 shadow-lg transition-opacity md:group-hover:block md:group-hover:opacity-100">
      {isOwnContent
        ? "Trusty comes from your viewers, you can't give it to your own episode."
        : locked
          ? "Watch the episode to the end to unlock Trusty."
          : "Give a Trusty once you've finished watching, it helps build the journeyer's Trust Score."}
    </span>
  );
}
