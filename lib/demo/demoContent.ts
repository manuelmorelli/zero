import type { FollowedUpdate } from "@/lib/discovery/updates";
import type { FeedItem } from "@/lib/discovery/feed";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";
import type { LatestVideoItem } from "@/lib/discovery/latestVideos";
import type { TopJourneyItem } from "@/lib/discovery/topJourneys";

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
    content: "Week 6 done. Legs are shaking but the streak is alive. Onwards.",
    publishedAt: hoursAgo(3),
  },
  {
    id: "demo-update-2",
    creatorId: "demo-creator-2",
    creatorName: "Sara J.",
    content: "New personal best this morning. Small wins add up.",
    publishedAt: hoursAgo(9),
  },
  {
    id: "demo-update-3",
    creatorId: "demo-creator-3",
    creatorName: "David L.",
    content: "Filming the next chapter today — this one's a hard one to tell.",
    publishedAt: hoursAgo(20),
  },
];

export const DEMO_FEED: FeedItem[] = [
  {
    type: "journey",
    date: hoursAgo(5),
    journeyId: "demo-1",
    title: "From burnout to balance",
    coverUrl: null,
    creatorName: "Marco R.",
  },
  {
    type: "journey",
    date: hoursAgo(30),
    journeyId: "demo-2",
    title: "Stronger every day",
    coverUrl: null,
    creatorName: "Sara J.",
  },
  {
    type: "journey",
    date: hoursAgo(50),
    journeyId: "demo-4",
    title: "See the world differently",
    coverUrl: null,
    creatorName: "Emma W.",
  },
];

export const DEMO_CREATORS: CreatorSearchResult[] = [
  { id: "demo-creator-1", username: "marco-r", name: "Marco R.", bio: "Documenting a slow return to balance.", followersCount: 24000 },
  { id: "demo-creator-2", username: "sara-j", name: "Sara J.", bio: "One rep, one day at a time.", followersCount: 18000 },
  { id: "demo-creator-3", username: "david-l", name: "David L.", bio: "Chasing the unknown, camera in hand.", followersCount: 31000 },
  { id: "demo-creator-4", username: "emma-w", name: "Emma W.", bio: "Creativity as a way back to myself.", followersCount: 16000 },
];

export const DEMO_LATEST_VIDEOS: LatestVideoItem[] = [
  { episodeId: "demo-ep-1", journeyId: "demo-1", title: "Day 1: starting from zero", coverUrl: null, creatorName: "Marco R.", createdAt: hoursAgo(2) },
  { episodeId: "demo-ep-2", journeyId: "demo-2", title: "The workout that changed my mind", coverUrl: null, creatorName: "Sara J.", createdAt: hoursAgo(11) },
  { episodeId: "demo-ep-3", journeyId: "demo-3", title: "First solo ride", coverUrl: null, creatorName: "David L.", createdAt: hoursAgo(26) },
  { episodeId: "demo-ep-4", journeyId: "demo-4", title: "Finding a new perspective", coverUrl: null, creatorName: "Emma W.", createdAt: hoursAgo(40) },
];

export const DEMO_TOP_JOURNEYS: TopJourneyItem[] = [
  { id: "demo-5", title: "Build my startup", coverUrl: null, category: "Career", creatorName: "James T.", followersCount: 29000, episodesCount: 14 },
  { id: "demo-3", title: "Ride the unknown", coverUrl: null, category: "Sport", creatorName: "David L.", followersCount: 31000, episodesCount: 22 },
  { id: "demo-1", title: "From burnout to balance", coverUrl: null, category: "Wellness", creatorName: "Marco R.", followersCount: 24000, episodesCount: 9 },
  { id: "demo-2", title: "Stronger every day", coverUrl: null, category: "Fitness", creatorName: "Sara J.", followersCount: 18000, episodesCount: 17 },
];
