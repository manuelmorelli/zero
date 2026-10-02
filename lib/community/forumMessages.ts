import { prisma } from "@/lib/prisma";
import { toSearchWords } from "@/lib/search/queryWords";
import { resolveAvatarUrl } from "@/lib/media/resolveCoverUrl";

export type ForumMessageItem = {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  isCreator: boolean;
  content: string;
  createdAt: string;
};

/** Messaggi del forum di un Journey, in ordine cronologico, filtrati per `query` (ogni parola deve
 * comparire nel testo, stesso criterio di searchPeople/searchJourneys). `query` vuota = tutti. */
export async function getForumMessages(journeyId: string, query: string): Promise<ForumMessageItem[]> {
  const words = toSearchWords(query);

  const [messages, journey] = await Promise.all([
    prisma.forumMessage.findMany({
      where: {
        journeyId,
        deletedAt: null,
        ...(words.length > 0
          ? { AND: words.map((word) => ({ content: { contains: word, mode: "insensitive" as const } })) }
          : {}),
      },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.journey.findUnique({ where: { id: journeyId }, select: { creator: { select: { userId: true } } } }),
  ]);

  const creatorUserId = journey?.creator.userId;

  return Promise.all(
    messages.map(async (message) => ({
      id: message.id,
      authorId: message.authorId,
      authorName: message.author.name,
      authorUsername: message.author.username,
      authorAvatarUrl: await resolveAvatarUrl(message.author.avatarUrl),
      isCreator: message.authorId === creatorUserId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }))
  );
}
