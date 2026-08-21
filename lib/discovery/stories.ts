import { prisma } from "@/lib/prisma";
import { getFollowedCreatorIds, getOwnCreatorId } from "@/lib/discovery/follows";
import { deleteExpiredUpdates } from "@/lib/updates";
import { getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";
import type { Prisma, UpdateType } from "@/generated/prisma/client";

export type StoryPoll = {
  options: { id: string; label: string; votes: number }[];
  totalVotes: number;
  myOptionId: string | null;
};

export type StoryLink = { href: string; label: string };

export type StoryAnswer = { id: string; content: string; createdAt: Date };

export type StoryUpdate = {
  id: string;
  type: UpdateType;
  content: string;
  mediaUrl: string | null;
  publishedAt: Date;
  viewedByMe: boolean;
  myReaction: string | null;
  poll: StoryPoll | null;
  isQuestion: boolean;
  answeredByMe: boolean;
  /** Le risposte vere e proprie, mai inviate al browser a meno che `isOwner` non fosse true nel
   * momento della richiesta (sono private, solo il creator può leggerle) — vuoto altrimenti,
   * anche se ne esistono. */
  answers: StoryAnswer[];
  link: StoryLink | null;
};

export type CreatorStory = {
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
  hasUnseen: boolean;
  updates: StoryUpdate[];
};

const storyUpdateInclude = {
  pollOptions: {
    orderBy: { order: "asc" },
    include: { votes: { select: { userId: true, optionId: true } } },
  },
  views: { select: { id: true, userId: true } },
  reactions: { select: { emoji: true, userId: true } },
  answers: { orderBy: { createdAt: "desc" }, select: { id: true, userId: true, content: true, createdAt: true } },
  linkedJourney: { select: { id: true, title: true } },
  linkedEpisode: { select: { id: true, title: true, journeyId: true } },
} satisfies Prisma.UpdateInclude;

type RawStoryUpdate = Prisma.UpdateGetPayload<{ include: typeof storyUpdateInclude }>;

/** Trasforma un Update grezzo (con le relazioni di `storyUpdateInclude`) nella forma pronta per
 * il visualizzatore Stories, dal punto di vista di `viewerId` (voto, risposta, reazione, "visto"
 * sono tutti personali). Condiviso tra i creator seguiti e il proprio Update, per non duplicare
 * la stessa logica di mappatura due volte. */
async function buildStoryUpdate(
  update: RawStoryUpdate,
  viewerId: string | null,
  isOwner: boolean
): Promise<StoryUpdate> {
  const mediaUrl = update.mediaKey
    ? await (update.type === "VIDEO" ? getVideoPlaybackUrl(update.mediaKey) : getImagePlaybackUrl(update.mediaKey))
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
            update.pollOptions.find((option) => option.votes.some((vote) => vote.userId === viewerId))?.id ?? null,
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

  return {
    id: update.id,
    type: update.type,
    content: update.content,
    mediaUrl,
    publishedAt: update.publishedAt,
    viewedByMe: update.views.some((view) => view.userId === viewerId),
    myReaction: update.reactions.find((reaction) => reaction.userId === viewerId)?.emoji ?? null,
    poll,
    isQuestion: update.isQuestion || update.type === "QUESTION",
    answeredByMe: update.answers.some((answer) => answer.userId === viewerId),
    answers: isOwner
      ? update.answers.map((answer) => ({ id: answer.id, content: answer.content, createdAt: answer.createdAt }))
      : [],
    link,
  };
}

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
    include: { creator: { include: { user: true } }, ...storyUpdateInclude },
  });

  const storiesByCreator = new Map<string, CreatorStory>();

  for (const update of updates) {
    // Non si segue mai se stessi (getFollowedCreatorIds), quindi qui non si è mai il proprietario.
    const storyUpdate = await buildStoryUpdate(update, userId, false);

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

/**
 * Gli Update ancora attivi di un creator qualsiasi, dal punto di vista di `viewerId` (chi vota,
 * risponde, reagisce — `null` per un visitatore non loggato, che può comunque vedere l'anello e
 * aprire l'Update, non votare/rispondere/reagire). Usata sia per il proprio Update (`getOwnStory`
 * sotto) sia per l'anello arancione sulla foto profilo di un creator qualsiasi
 * (components/profile/ProfileAvatarStory.tsx): un profilo Creator senza Update attivi restituisce
 * comunque un `CreatorStory` con `updates: []` e `hasUnseen: false`, per distinguere "nessun
 * Update attivo" da "creator inesistente" (quest'ultimo va gestito dal chiamante).
 */
export async function getCreatorActiveStory({
  creatorId,
  viewerId,
}: {
  creatorId: string;
  viewerId: string | null;
}): Promise<CreatorStory> {
  await deleteExpiredUpdates();

  const [creator, updates] = await Promise.all([
    prisma.creator.findUniqueOrThrow({ where: { id: creatorId }, include: { user: true } }),
    prisma.update.findMany({
      where: { creatorId, archivedAt: { gt: new Date() } },
      orderBy: { publishedAt: "asc" },
      include: storyUpdateInclude,
    }),
  ]);

  const avatarUrl = creator.user.avatarUrl ? await getImagePlaybackUrl(creator.user.avatarUrl) : null;
  const isOwner = creator.userId === viewerId;

  return {
    creatorId,
    creatorName: creator.displayName,
    creatorAvatarUrl: avatarUrl,
    hasUnseen: updates.length > 0,
    updates: await Promise.all(updates.map((update) => buildStoryUpdate(update, viewerId, isOwner))),
  };
}

/**
 * I propri Update ancora attivi, per il cerchio dedicato "tuo" davanti alla riga Stories in Home
 * (components/landing/Hero.tsx): a differenza di `getFollowedCreatorsStories`, un utente non
 * segue mai se stesso, quindi senza questa funzione i propri Update non comparirebbero mai nella
 * propria Home. Restituisce `null` per chi non ha (ancora) un profilo Creator.
 */
export async function getOwnStory({ userId }: { userId: string | null }): Promise<CreatorStory | null> {
  if (!userId) return null;
  const creatorId = await getOwnCreatorId(userId);
  if (!creatorId) return null;
  return getCreatorActiveStory({ creatorId, viewerId: userId });
}
