"use client";

import { useState } from "react";
import { Stat } from "@/components/profile/ProfileStat";
import { FollowListModal } from "@/components/profile/FollowListModal";
import { loadFollowList } from "@/lib/actions/follow";
import { formatCompactNumber } from "@/lib/utils";
import type { FollowListPerson } from "@/lib/profile/followList";

type ProfileFollowStatsProps = {
  /** Id dell'utente di cui si sta guardando il profilo (non del visitatore). */
  profileUserId: string;
  followersCount: number;
  followingCount: number;
  viewerId: string | null;
  isLoggedIn: boolean;
};

type OpenList = { kind: "followers" | "following"; title: string } | null;

/** Rende cliccabili le cifre Followers/Following della riga statistiche del Profilo: aprono un
 * elenco (components/profile/FollowListModal.tsx), caricato solo al click, non insieme al resto
 * della pagina. */
export function ProfileFollowStats({
  profileUserId,
  followersCount,
  followingCount,
  viewerId,
  isLoggedIn,
}: ProfileFollowStatsProps) {
  const [open, setOpen] = useState<OpenList>(null);
  const [people, setPeople] = useState<FollowListPerson[]>([]);
  const [loading, setLoading] = useState(false);

  async function openList(kind: "followers" | "following", title: string) {
    setOpen({ kind, title });
    setLoading(true);
    const result = await loadFollowList(kind, profileUserId);
    setPeople(result);
    setLoading(false);
  }

  return (
    <>
      <Stat
        label="Followers"
        value={formatCompactNumber(followersCount)}
        onClick={() => openList("followers", "Followers")}
      />
      <Stat
        label="Following"
        value={formatCompactNumber(followingCount)}
        onClick={() => openList("following", "Following")}
      />

      {open && (
        <FollowListModal
          title={open.title}
          people={people}
          loading={loading}
          viewerId={viewerId}
          isLoggedIn={isLoggedIn}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
