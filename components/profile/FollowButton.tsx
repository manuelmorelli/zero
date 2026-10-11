"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions/follow";
import { cn } from "@/lib/utils";

type FollowButtonProps = {
  userId: string;
  initialIsFollowing: boolean;
  isLoggedIn: boolean;
  className?: string;
};

const DEFAULT_CLASSNAME =
  "rounded-full border border-ember-line bg-ember-soft px-5 py-2.5 text-sm font-semibold text-on-photo shadow-glow transition-all duration-300 hover:border-ember hover:bg-ember-soft ";

export function FollowButton({ userId, initialIsFollowing, isLoggedIn, className }: FollowButtonProps) {
  const buttonClassName = cn(DEFAULT_CLASSNAME, className);
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
