import type { JourneyCardData } from "@/components/journey/JourneyCard";

// Journey di esempio mostrati in Home al posto di "New Journeys" finché non esiste
// ancora nessun Journey pubblicato sulla piattaforma (demo sempre completa). Spariscono
// automaticamente non appena viene pubblicato il primo Journey reale, vedi getNewJourneys
// in app/page.tsx.
export const DEMO_JOURNEYS: JourneyCardData[] = [
  { id: "demo-1", title: "From burnout to balance", coverUrl: null, category: "Wellness", creator: { displayName: "Marco R." }, followersCount: 24000 },
  { id: "demo-2", title: "Stronger every day", coverUrl: null, category: "Fitness", creator: { displayName: "Sara J." }, followersCount: 18000 },
  { id: "demo-3", title: "Ride the unknown", coverUrl: null, category: "Sport", creator: { displayName: "David L." }, followersCount: 31000 },
  { id: "demo-4", title: "See the world differently", coverUrl: null, category: "Creativity", creator: { displayName: "Emma W." }, followersCount: 16000 },
  { id: "demo-5", title: "Build my startup", coverUrl: null, category: "Career", creator: { displayName: "James T." }, followersCount: 29000 },
];
