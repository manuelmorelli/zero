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
        <span className="text-xs text-ember">{countLabel}</span>
        <Link
          href="/login"
          className="rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-4 py-1.5 text-xs font-semibold text-ember backdrop-blur-md transition-colors hover:from-ember/15"
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
      <span className="text-xs text-ember">{countLabel}</span>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-4 py-1.5 text-xs font-semibold text-ember backdrop-blur-md transition-colors hover:from-ember/15 disabled:opacity-50"
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
