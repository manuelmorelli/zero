"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleLike } from "@/lib/actions/like";
import { formatCompactNumber } from "@/lib/utils";
import type { LikeTargetType } from "@/generated/prisma/client";

type LikeButtonProps = {
  targetType: LikeTargetType;
  targetId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
};

export function LikeButton({
  targetType,
  targetId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        aria-label="Log in to like"
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
      >
        <ThumbsUpIcon className="h-3.5 w-3.5" />
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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Unlike" : "Like"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isLiked
          ? "border-ember/40 bg-ember/10 text-ember"
          : "border-border text-ink-muted hover:border-ink-muted hover:text-ink"
      }`}
    >
      <ThumbsUpIcon className="h-3.5 w-3.5" filled={isLiked} />
      {formatCompactNumber(likeCount)}
    </button>
  );
}

function ThumbsUpIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 8.5H4.5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H7m0-8v8m0-8 2.4-4.8a1.2 1.2 0 0 1 1.35-.65c.9.2 1.5 1.05 1.35 1.96L11.5 8.5h3.02c.98 0 1.72.9 1.53 1.86l-.9 4.5a1.8 1.8 0 0 1-1.77 1.64H7"
      />
    </svg>
  );
}
