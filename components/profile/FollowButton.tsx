"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions/follow";

type FollowButtonProps = {
  userId: string;
  initialIsFollowing: boolean;
  isLoggedIn: boolean;
};

const buttonClassName =
  "rounded-full border border-ember-line bg-ember-soft px-5 py-2.5 text-sm font-semibold text-on-photo shadow-glow transition-all duration-300 hover:border-ember hover:bg-ember-soft ";

export function FollowButton({ userId, initialIsFollowing, isLoggedIn }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link href="/login" className={buttonClassName}>
        Follow
      </Link>
    );
  }

  function handleClick() {
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    startTransition(async () => {
      const result = await toggleFollow(userId);
      if (result.error) {
        setIsFollowing(wasFollowing);
      }
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={`${buttonClassName} disabled:opacity-50`}>
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
