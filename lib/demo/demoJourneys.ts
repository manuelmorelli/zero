import type { JourneyCardData } from "@/components/journey/JourneyCard";

// Journey di esempio mostrati in Home al posto di "New Journeys" finché non esiste
// ancora nessun Journey pubblicato sulla piattaforma (demo sempre completa). Spariscono
// automaticamente non appena viene pubblicato il primo Journey reale, vedi getNewJourneys
// in app/page.tsx.
export const DEMO_JOURNEYS: JourneyCardData[] = [
  { id: "demo-1", title: "From burnout to balance", coverUrl: null, category: "Mental Health", journeyScore: 86, creator: { displayName: "Marco R.", avatarUrl: null } },
  { id: "demo-2", title: "Stronger every day", coverUrl: null, category: "Fitness", journeyScore: 88, creator: { displayName: "Sara J.", avatarUrl: null } },
  { id: "demo-3", title: "Ride the unknown", coverUrl: null, category: "Sports", journeyScore: 82, creator: { displayName: "David L.", avatarUrl: null } },
  { id: "demo-4", title: "See the world differently", coverUrl: null, category: "Creativity", journeyScore: 90, creator: { displayName: "Emma W.", avatarUrl: null } },
  { id: "demo-5", title: "Build my startup", coverUrl: null, category: "Career", journeyScore: 85, creator: { displayName: "James T.", avatarUrl: null } },
  { id: "demo-6", title: "My first vegetable garden, one season in", coverUrl: null, category: "Gardening & Plants", journeyScore: 81, creator: { displayName: "Giulia F.", avatarUrl: null } },
  { id: "demo-7", title: "Six months sober, still here", coverUrl: null, category: "Recovery & Sobriety", journeyScore: 93, creator: { displayName: "Chris P.", avatarUrl: null } },
  { id: "demo-8", title: "Learning Mandarin from zero", coverUrl: null, category: "Learning", journeyScore: 77, creator: { displayName: "Yuki S.", avatarUrl: null } },
  { id: "demo-9", title: "Building a tiny house by hand", coverUrl: null, category: "Minimalism & Slow Living", journeyScore: 88, creator: { displayName: "Noah K.", avatarUrl: null } },
  { id: "demo-10", title: "Three months of therapy, honestly", coverUrl: null, category: "Mental Health", journeyScore: 91, creator: { displayName: "Priya R.", avatarUrl: null } },
];
