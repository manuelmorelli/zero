import type { JourneyCardData } from "@/components/journey/JourneyCard";

// Journey di esempio mostrati in Home al posto di "New Journeys" finché non esiste
// ancora nessun Journey pubblicato sulla piattaforma (demo sempre completa). Spariscono
// automaticamente non appena viene pubblicato il primo Journey reale, vedi getNewJourneys
// in app/page.tsx.
export const DEMO_JOURNEYS: JourneyCardData[] = [
  { id: "demo-1", title: "From burnout to balance", coverUrl: null, category: "Mental Health", journeyScore: 86, creator: { displayName: "Marco R." } },
  { id: "demo-2", title: "Stronger every day", coverUrl: null, category: "Fitness", journeyScore: 88, creator: { displayName: "Sara J." } },
  { id: "demo-3", title: "Ride the unknown", coverUrl: null, category: "Sports", journeyScore: 82, creator: { displayName: "David L." } },
  { id: "demo-4", title: "See the world differently", coverUrl: null, category: "Creativity", journeyScore: 90, creator: { displayName: "Emma W." } },
  { id: "demo-5", title: "Build my startup", coverUrl: null, category: "Career", journeyScore: 85, creator: { displayName: "James T." } },
];
