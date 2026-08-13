export type HeroSlide = {
  image: string;
  alt: string;
  quote: string;
  author: string;
};

// DEMO DATA - replace when real data available: Journey in evidenza da mostrare a rotazione in
// Hero, in attesa di un meccanismo reale di selezione dei Journey del momento per questo slot.
export const heroSlides: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1920&q=80",
    alt: "Hiker standing on a mountain summit above the clouds at sunset",
    quote: "Zero changed the way I share and the way people connect with my story.",
    author: "Alex R.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
    alt: "Sunlight breaking through a quiet forest path",
    quote: "I stopped chasing likes and started documenting what actually changed me.",
    author: "Elio F.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",
    alt: "Person standing on a cliff above a mountain lake",
    quote: "Every episode I publish holds me accountable. That is the whole point.",
    author: "David L.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80",
    alt: "Open road stretching toward misty mountains",
    quote: "Six months in, my journey has become the calmest part of my day.",
    author: "Olivia H.",
  },
];
