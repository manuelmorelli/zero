import type { FollowedUpdate } from "@/lib/discovery/updates";
import type { CreatorStory } from "@/lib/discovery/stories";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";
import type { LatestVideoItem } from "@/lib/discovery/latestVideos";
import type { TopJourneyItem } from "@/lib/discovery/topJourneys";
import type { DiscoveringNowItem } from "@/lib/discovery/discoveringNow";

// DEMO DATA - replace when real data available: placeholder per le sezioni Home che restano
// vuote finché la piattaforma non ha abbastanza dati reali (Updates, Feed, Creator consigliati,
// Latest Videos, Top Journeys). Stesso principio già in uso per DEMO_JOURNEYS (New Journeys):
// ogni sezione torna automaticamente ai dati reali non appena ce ne sono abbastanza.

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

export const DEMO_UPDATES: FollowedUpdate[] = [
  {
    id: "demo-update-1",
    creatorId: "demo-creator-1",
    creatorName: "Marco R.",
    type: "TEXT",
    content: "Week 6 done. Legs are shaking but the streak is alive. Onwards.",
    publishedAt: hoursAgo(3),
  },
  {
    id: "demo-update-2",
    creatorId: "demo-creator-2",
    creatorName: "Sara J.",
    type: "TEXT",
    content: "New personal best this morning. Small wins add up.",
    publishedAt: hoursAgo(9),
  },
  {
    id: "demo-update-3",
    creatorId: "demo-creator-3",
    creatorName: "David L.",
    type: "TEXT",
    content: "Filming the next chapter today — this one's a hard one to tell.",
    publishedAt: hoursAgo(20),
  },
];

export const DEMO_STORIES: CreatorStory[] = [
  {
    creatorId: "demo-creator-1",
    creatorName: "Marco R.",
    creatorAvatarUrl: null,
    hasUnseen: true,
    updates: [
      {
        id: "demo-story-1a",
        type: "TEXT",
        content: "Week 6 done. Legs are shaking but the streak is alive. Onwards.",
        mediaUrl: null,
        publishedAt: hoursAgo(3),
        viewedByMe: false,
        myReaction: null,
        poll: null,
        isQuestion: false,
        answers: [],
        answeredByMe: false,
        link: null,
      },
    ],
  },
  {
    creatorId: "demo-creator-2",
    creatorName: "Sara J.",
    creatorAvatarUrl: null,
    hasUnseen: true,
    updates: [
      {
        id: "demo-story-2a",
        type: "IMAGE",
        content: "New personal best this morning.",
        mediaUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        publishedAt: hoursAgo(9),
        viewedByMe: false,
        myReaction: null,
        poll: null,
        isQuestion: false,
        answers: [],
        answeredByMe: false,
        link: null,
      },
    ],
  },
  {
    creatorId: "demo-creator-3",
    creatorName: "David L.",
    creatorAvatarUrl: null,
    hasUnseen: false,
    updates: [
      {
        id: "demo-story-3a",
        type: "POLL",
        content: "Which chapter should I film next?",
        mediaUrl: null,
        publishedAt: hoursAgo(20),
        viewedByMe: true,
        myReaction: null,
        poll: {
          options: [
            { id: "demo-opt-1", label: "The hard one", votes: 12 },
            { id: "demo-opt-2", label: "The fun one", votes: 8 },
          ],
          totalVotes: 20,
          myOptionId: null,
        },
        isQuestion: false,
        answers: [],
        answeredByMe: false,
        link: null,
      },
    ],
  },
];

export const DEMO_CREATORS: CreatorSearchResult[] = [
  { id: "demo-creator-1", username: "marco-r", name: "Marco R.", bio: "Documenting a slow return to balance.", avatarUrl: null, followersCount: 24000 },
  { id: "demo-creator-2", username: "sara-j", name: "Sara J.", bio: "One rep, one day at a time.", avatarUrl: null, followersCount: 18000 },
  { id: "demo-creator-3", username: "david-l", name: "David L.", bio: "Chasing the unknown, camera in hand.", avatarUrl: null, followersCount: 31000 },
  { id: "demo-creator-4", username: "emma-w", name: "Emma W.", bio: "Creativity as a way back to myself.", avatarUrl: null, followersCount: 16000 },
  { id: "demo-creator-5", username: "james-t", name: "James T.", bio: "Building a company in public.", avatarUrl: null, followersCount: 29000 },
  { id: "demo-creator-6", username: "nora-k", name: "Nora K.", bio: "Learning to sail at 40.", avatarUrl: null, followersCount: 340 },
  { id: "demo-creator-7", username: "leo-p", name: "Leo P.", bio: "Quitting sugar, one week at a time.", avatarUrl: null, followersCount: 180 },
  { id: "demo-creator-8", username: "ana-m", name: "Ana M.", bio: "Teaching myself to paint.", avatarUrl: null, followersCount: 95 },
];

export const DEMO_LATEST_VIDEOS: LatestVideoItem[] = [
  { episodeId: "demo-ep-1", journeyId: "demo-1", title: "Day 1: starting from Zero", coverUrl: null, category: "Mental Health", creatorName: "Marco R.", creatorAvatarUrl: null, createdAt: hoursAgo(2), journeyScore: 86 },
  { episodeId: "demo-ep-2", journeyId: "demo-2", title: "The workout that changed my mind", coverUrl: null, category: "Fitness", creatorName: "Sara J.", creatorAvatarUrl: null, createdAt: hoursAgo(11), journeyScore: 88 },
  { episodeId: "demo-ep-3", journeyId: "demo-3", title: "First solo ride", coverUrl: null, category: "Sports", creatorName: "David L.", creatorAvatarUrl: null, createdAt: hoursAgo(26), journeyScore: 82 },
  { episodeId: "demo-ep-4", journeyId: "demo-4", title: "Finding a new perspective", coverUrl: null, category: "Creativity", creatorName: "Emma W.", creatorAvatarUrl: null, createdAt: hoursAgo(40), journeyScore: 90 },
  { episodeId: "demo-ep-5", journeyId: "demo-7", title: "Day 180, no counting anymore", coverUrl: null, category: "Recovery & Sobriety", creatorName: "Chris P.", creatorAvatarUrl: null, createdAt: hoursAgo(55), journeyScore: 93 },
  { episodeId: "demo-ep-6", journeyId: "demo-9", title: "Raising the roof beam", coverUrl: null, category: "Minimalism & Slow Living", creatorName: "Noah K.", creatorAvatarUrl: null, createdAt: hoursAgo(70), journeyScore: 88 },
  { episodeId: "demo-ep-7", journeyId: "demo-6", title: "First tomatoes of the season", coverUrl: null, category: "Gardening & Plants", creatorName: "Giulia F.", creatorAvatarUrl: null, createdAt: hoursAgo(84), journeyScore: 81 },
  { episodeId: "demo-ep-8", journeyId: "demo-10", title: "What my therapist actually said", coverUrl: null, category: "Mental Health", creatorName: "Priya R.", creatorAvatarUrl: null, createdAt: hoursAgo(96), journeyScore: 91 },
];

export const DEMO_DISCOVERING_NOW: DiscoveringNowItem[] = [
  { id: "demo-discovery-1", title: "Learning to sail at 40", coverUrl: null, category: "Sports", creatorName: "Nora K.", creatorAvatarUrl: null, followersCount: 340, daysLeft: 11 },
  { id: "demo-discovery-2", title: "Quitting sugar, day by day", coverUrl: null, category: "Nutrition", creatorName: "Leo P.", creatorAvatarUrl: null, followersCount: 180, daysLeft: 6 },
  { id: "demo-discovery-3", title: "Teaching myself to paint", coverUrl: null, category: "Creativity", creatorName: "Ana M.", creatorAvatarUrl: null, followersCount: 95, daysLeft: 14 },
  { id: "demo-discovery-4", title: "Waking up at 5am for a month", coverUrl: null, category: "Habits", creatorName: "Tom B.", creatorAvatarUrl: null, followersCount: 60, daysLeft: 9 },
  { id: "demo-discovery-5", title: "My first vegetable garden", coverUrl: null, category: "Gardening & Plants", creatorName: "Giulia F.", creatorAvatarUrl: null, followersCount: 120, daysLeft: 3 },
  { id: "demo-discovery-6", title: "Quitting my 9-to-5 to freelance", coverUrl: null, category: "Career", creatorName: "Omar H.", creatorAvatarUrl: null, followersCount: 45, daysLeft: 8 },
  { id: "demo-discovery-7", title: "Learning the violin at 35", coverUrl: null, category: "Learning", creatorName: "Elena V.", creatorAvatarUrl: null, followersCount: 72, daysLeft: 12 },
  { id: "demo-discovery-8", title: "My minimalist closet experiment", coverUrl: null, category: "Minimalism & Slow Living", creatorName: "Sofie L.", creatorAvatarUrl: null, followersCount: 28, daysLeft: 5 },
  { id: "demo-discovery-9", title: "Walking every day this winter", coverUrl: null, category: "Health & Illness Recovery", creatorName: "Ben C.", creatorAvatarUrl: null, followersCount: 54, daysLeft: 10 },
  { id: "demo-discovery-10", title: "Saving my first €10,000", coverUrl: null, category: "Finance", creatorName: "Rahul M.", creatorAvatarUrl: null, followersCount: 99, daysLeft: 7 },
];

export const DEMO_TOP_JOURNEYS: TopJourneyItem[] = [
  { id: "demo-5", title: "Build my startup", coverUrl: null, category: "Career", creatorName: "James T.", creatorAvatarUrl: null, followersCount: 29000, episodesCount: 14, journeyScore: 92 },
  { id: "demo-3", title: "Ride the unknown", coverUrl: null, category: "Sports", creatorName: "David L.", creatorAvatarUrl: null, followersCount: 31000, episodesCount: 22, journeyScore: 89 },
  { id: "demo-1", title: "From burnout to balance", coverUrl: null, category: "Mental Health", creatorName: "Marco R.", creatorAvatarUrl: null, followersCount: 24000, episodesCount: 9, journeyScore: 87 },
  { id: "demo-2", title: "Stronger every day", coverUrl: null, category: "Fitness", creatorName: "Sara J.", creatorAvatarUrl: null, followersCount: 18000, episodesCount: 17, journeyScore: 85 },
  { id: "demo-4", title: "See the world differently", coverUrl: null, category: "Creativity", creatorName: "Emma W.", creatorAvatarUrl: null, followersCount: 16000, episodesCount: 11, journeyScore: 84 },
  { id: "demo-7", title: "Six months sober, still here", coverUrl: null, category: "Recovery & Sobriety", creatorName: "Chris P.", creatorAvatarUrl: null, followersCount: 41000, episodesCount: 30, journeyScore: 93 },
  { id: "demo-10", title: "Three months of therapy, honestly", coverUrl: null, category: "Mental Health", creatorName: "Priya R.", creatorAvatarUrl: null, followersCount: 27000, episodesCount: 13, journeyScore: 91 },
  { id: "demo-9", title: "Building a tiny house by hand", coverUrl: null, category: "Minimalism & Slow Living", creatorName: "Noah K.", creatorAvatarUrl: null, followersCount: 22000, episodesCount: 19, journeyScore: 88 },
  { id: "demo-6", title: "My first vegetable garden, one season in", coverUrl: null, category: "Gardening & Plants", creatorName: "Giulia F.", creatorAvatarUrl: null, followersCount: 12000, episodesCount: 16, journeyScore: 81 },
  { id: "demo-8", title: "Learning Mandarin from zero", coverUrl: null, category: "Learning", creatorName: "Yuki S.", creatorAvatarUrl: null, followersCount: 5400, episodesCount: 8, journeyScore: 77 },
];
