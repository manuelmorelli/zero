import type { CreatorFeedItem } from "@/lib/profile/creatorFeed";

// DEMO DATA - replace when real data available: placeholder solo per il Profilo pubblico di un
// creator che non ha ancora episodi o update reali da mostrare nel feed — stesso principio già
// in uso in lib/demo/demoContent.ts per la Home. `coverUrl` è volutamente null: al posto di una
// foto finta, la card mostra la `caption` come scritta motivazionale (vedi ContentCard
// `emptyMessage`, collegato in app/(site)/profile/[username]/page.tsx).
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

export const DEMO_FEED_ITEMS: CreatorFeedItem[] = [
  {
    type: "episode",
    date: daysAgo(1),
    episodeId: "demo-feed-ep-1",
    title: "Post your first episode",
    caption: "Your Journey starts with one step.",
    category: null,
    journeyId: "demo-journey",
    coverUrl: null,
    likeCount: 24,
    isLiked: false,
  },
  {
    type: "update",
    date: daysAgo(2),
    updateId: "demo-feed-update-1",
    content: "Small win today: showed up even when I didn't feel like it.",
    coverUrl: null,
    likeCount: 9,
    isLiked: false,
  },
  {
    type: "episode",
    date: daysAgo(4),
    episodeId: "demo-feed-ep-2",
    title: "Document today",
    caption: "Even small progress is progress.",
    category: null,
    journeyId: "demo-journey",
    coverUrl: null,
    likeCount: 41,
    isLiked: false,
  },
  {
    type: "episode",
    date: daysAgo(7),
    episodeId: "demo-feed-ep-3",
    title: "Tell your story",
    caption: "Someone out there needs to hear it.",
    category: null,
    journeyId: "demo-journey",
    coverUrl: null,
    likeCount: 17,
    isLiked: false,
  },
];

