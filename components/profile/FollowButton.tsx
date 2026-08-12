"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions/follow";
import { formatCompactNumber } from "@/lib/utils";

type FollowButtonProps = {
  userId: string;
  initialFollowersCount: number;
  initialIsFollowing: boolean;
  isLoggedIn: boolean;
};

export function FollowButton({
  userId,
  initialFollowersCount,
  initialIsFollowing,
  isLoggedIn,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isPending, startTransition] = useTransition();

  const countLabel = `${formatCompactNumber(followersCount)} ${followersCount === 1 ? "follower" : "followers"}`;

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-muted">{countLabel}</span>
        <Link
          href="/login"
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-ink-muted"
        >
          Follow
        </Link>
      </div>
    );
  }

  function handleClick() {
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowersCount((count) => count + (wasFollowing ? -1 : 1));

    startTransition(async () => {
      const result = await toggleFollow(userId);
      if (result.error) {
        setIsFollowing(wasFollowing);
        setFollowersCount((count) => count + (wasFollowing ? 1 : -1));
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-muted">{countLabel}</span>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          isFollowing
            ? "rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-ink-muted disabled:opacity-50"
            : "rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
        }
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
