// Unica fonte di verità per le categorie ammesse su un Journey.
// Usata dal form di creazione/modifica Journey e da qualunque filtro o
// pagina di Discovery basata su categoria. Decisione permanente, vedi
// 00-project-context.md ("Categorie del Journey").
export const JOURNEY_CATEGORIES = [
  "Fitness",
  "Nutrition",
  "Mental Health",
  "Recovery & Sobriety",
  "Health & Illness Recovery",
  "Personal Growth",
  "Spirituality",
  "Career",
  "Business",
  "Finance",
  "Learning",
  "Relationships",
  "Parenting",
  "Creativity",
  "Productivity",
  "Habits",
  "Sports",
  "Travel",
  "Lifestyle",
  "Sustainability & Environment",
  "Gardening & Plants",
  "Minimalism & Slow Living",
  "Digital Wellbeing",
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
