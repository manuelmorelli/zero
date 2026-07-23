// Unica fonte di verità per le categorie ammesse su un Journey.
// Usata dal form di creazione/modifica Journey e da qualunque filtro o
// pagina di Discovery basata su categoria. Decisione permanente, vedi
// 00-project-context.md ("Categorie del Journey").
export const JOURNEY_CATEGORIES = [
  "Fitness",
  "Nutrition",
  "Mental Health",
  "Personal Growth",
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
  "Sustainability",
  "Environment",
  "Gardening & Plants",
  "Minimalism",
  "Slow Living",
  "Digital Wellbeing",
  "Volunteering",
  "Other",
] as const;

export type JourneyCategory = (typeof JOURNEY_CATEGORIES)[number];
