import type { CreatorFeedItem } from "@/lib/profile/creatorFeed";

// DEMO DATA - replace when real data available: placeholder solo per il Profilo pubblico di un
// creator che non ha ancora episodi o update reali da mostrare nel feed — stesso principio già
// in uso in lib/demo/demoContent.ts per la Home. Le foto vengono da Unsplash (stesso dominio già
// autorizzato in next.config.ts e già usato in HeroBackgroundSlideshow), non da upload reali.
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

export const DEMO_FEED_ITEMS: CreatorFeedItem[] = [
  {
    type: "episode",
    date: daysAgo(1),
    episodeId: "demo-feed-ep-1",
    title: "Week one, day one",
    caption: "First real step. Slower than I'd like, but it's a start.",
    category: null,
    journeyId: "demo-journey",
    coverUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    likeCount: 24,
    isLiked: false,
  },
  {
    type: "update",
    date: daysAgo(2),
    updateId: "demo-feed-update-1",
    content: "Small win today: showed up even when I didn't feel like it.",
    coverUrl:
      "https://images.unsplash.com/photo-1499728603263-13726abce5fd?auto=format&fit=crop&w=1200&q=80",
    likeCount: 9,
    isLiked: false,
  },
  {
    type: "episode",
    date: daysAgo(4),
    episodeId: "demo-feed-ep-2",
    title: "The setback",
    caption: "Missed two days in a row. Documenting it anyway — that's the point.",
    category: null,
    journeyId: "demo-journey",
    coverUrl:
      "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1200&q=80",
    likeCount: 41,
    isLiked: false,
  },
  {
    type: "episode",
    date: daysAgo(7),
    episodeId: "demo-feed-ep-3",
    title: "Back on track",
    caption: "Reset, restarted, still here.",
    category: null,
    journeyId: "demo-journey",
    coverUrl:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
    likeCount: 17,
    isLiked: false,
  },
];

