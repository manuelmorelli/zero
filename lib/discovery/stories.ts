import { prisma } from "@/lib/prisma";
import { getFollowedCreatorIds } from "@/lib/discovery/follows";
import { deleteExpiredUpdates } from "@/lib/updates";
import { getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";
import type { UpdateType } from "@/generated/prisma/client";

export type StoryPoll = {
  options: { id: string; label: string; votes: number }[];
  totalVotes: number;
  myOptionId: string | null;
};

export type StoryLink = { href: string; label: string };

export type StoryUpdate = {
  id: string;
  type: UpdateType;
  content: string;
  mediaUrl: string | null;
  publishedAt: Date;
  viewedByMe: boolean;
  myReaction: string | null;
  poll: StoryPoll | null;
  answeredByMe: boolean;
  link: StoryLink | null;
};

export type CreatorStory = {
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
  hasUnseen: boolean;
  updates: StoryUpdate[];
};

/**
 * Update ancora attivi dei creator seguiti, raggruppati per creator per la riga di cerchi in
 * stile Stories in Home (components/home/StoriesRow.tsx). A differenza di
 * `getFollowedCreatorsUpdates` (lib/discovery/updates.ts, usata dal pannello di anteprima in
 * Hero) qui si mostrano solo i creator seguiti, non il mix 80/20 con creator "interessanti" —
 * decisione presa esplicitamente con Manuel per questa riga.
 */
export async function getFollowedCreatorsStories({
  userId,
}: {
  userId: string | null;
}): Promise<CreatorStory[]> {
  if (!userId) return [];

  await deleteExpiredUpdates();

  const followedCreatorIds = await getFollowedCreatorIds(userId);
  if (followedCreatorIds.length === 0) return [];

  const updates = await prisma.update.findMany({
    where: { creatorId: { in: followedCreatorIds }, archivedAt: { gt: new Date() } },
    // Il più vecchio per primo: dentro il visualizzatore di un creator si scorre in ordine
    // cronologico, come le Stories di Instagram.
    orderBy: { publishedAt: "asc" },
    include: {
      creator: { include: { user: true } },
      pollOptions: {
        orderBy: { order: "asc" },
        include: { votes: { select: { userId: true, optionId: true } } },
      },
      views: { where: { userId }, select: { id: true } },
      reactions: { where: { userId }, select: { emoji: true } },
      answers: { where: { userId }, select: { id: true } },
      linkedJourney: { select: { id: true, title: true } },
      linkedEpisode: { select: { id: true, title: true, journeyId: true } },
    },
  });

  const storiesByCreator = new Map<string, CreatorStory>();

  for (const update of updates) {
    const mediaUrl = update.mediaKey
      ? await (update.type === "VIDEO"
          ? getVideoPlaybackUrl(update.mediaKey)
          : getImagePlaybackUrl(update.mediaKey))
      : null;

    const poll =
      update.pollOptions.length > 0
        ? {
            options: update.pollOptions.map((option) => ({
              id: option.id,
              label: option.label,
              votes: option.votes.length,
            })),
            totalVotes: update.pollOptions.reduce((sum, option) => sum + option.votes.length, 0),
            myOptionId:
              update.pollOptions.find((option) => option.votes.some((vote) => vote.userId === userId))?.id ?? null,
          }
        : null;

    const link = update.linkedEpisode
      ? {
          href: `/journeys/${update.linkedEpisode.journeyId}#${update.linkedEpisode.id}`,
          label: `Watch: ${update.linkedEpisode.title}`,
        }
      : update.linkedJourney
        ? { href: `/journeys/${update.linkedJourney.id}`, label: `View: ${update.linkedJourney.title}` }
        : null;

    const storyUpdate: StoryUpdate = {
      id: update.id,
      type: update.type,
      content: update.content,
      mediaUrl,
      publishedAt: update.publishedAt,
      viewedByMe: update.views.length > 0,
      myReaction: update.reactions[0]?.emoji ?? null,
      poll,
      answeredByMe: update.answers.length > 0,
      link,
    };

    const existing = storiesByCreator.get(update.creatorId);
    if (existing) {
      existing.updates.push(storyUpdate);
      if (!storyUpdate.viewedByMe) existing.hasUnseen = true;
      continue;
    }

    const avatarUrl = update.creator.user.avatarUrl
      ? await getImagePlaybackUrl(update.creator.user.avatarUrl)
      : null;

    storiesByCreator.set(update.creatorId, {
      creatorId: update.creatorId,
      creatorName: update.creator.displayName,
      creatorAvatarUrl: avatarUrl,
      hasUnseen: !storyUpdate.viewedByMe,
      updates: [storyUpdate],
    });
  }

  // Creator con almeno un Update non ancora visto per primi (contorno colorato, stile
  // Instagram), poi per data dell'Update più recente tra i visti.
  return Array.from(storiesByCreator.values()).sort((a, b) => {
    if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
    const aLatest = a.updates[a.updates.length - 1].publishedAt.getTime();
    const bLatest = b.updates[b.updates.length - 1].publishedAt.getTime();
    return bLatest - aLatest;
  });
}
