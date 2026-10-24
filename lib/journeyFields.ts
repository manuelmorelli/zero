import { z } from "zod";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";

// Campi del Journey condivisi tra lib/actions/journey.ts e la creazione Journey + primo episodio in
// lib/actions/episode.ts: fuori dai file "use server", che possono esportare solo azioni.
export const JourneySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(JOURNEY_CATEGORIES).optional(),
  tags: z.string().trim().max(200).optional(),
  coverKey: z.string().trim().optional(),
});

export function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
}
