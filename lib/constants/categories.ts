// Unica fonte di verità per le categorie ammesse su un Journey.
// Usata dal form di creazione/modifica Journey e da qualunque filtro o
// pagina di Discovery basata su categoria. Decisione permanente, vedi
// 00-project-context.md ("Categorie del Journey").
export const JOURNEY_CATEGORIES = [
  "Business",
  "Career",
  "Creativity",
  "Digital Wellbeing",
  "Finance",
  "Fitness",
  "Gardening & Plants",
  "Habits",
  "Health & Illness Recovery",
  "Learning",
  "Lifestyle",
  "Mental Health",
  "Minimalism & Slow Living",
  "Nutrition",
  "Parenting",
  "Personal Growth",
  "Productivity",
  "Recovery & Sobriety",
  "Relationships",
  "Spirituality",
  "Sports",
  "Sustainability & Environment",
  "Travel",
  "Volunteering",
  "Other",
] as const;

export type JourneyCategory = (typeof JOURNEY_CATEGORIES)[number];

/** Slug leggibile per l'URL (es. "Mental Health" -> "mental-health"), derivato sempre da JOURNEY_CATEGORIES: mai definire uno slug a mano altrove. */
export function categoryToSlug(category: JourneyCategory): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Trova la categoria a partire dal suo slug, undefined se lo slug non corrisponde a nessuna categoria ammessa. */
export function categoryFromSlug(slug: string): JourneyCategory | undefined {
  return JOURNEY_CATEGORIES.find((category) => categoryToSlug(category) === slug);
}
