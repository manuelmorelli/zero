"use client";

import { useRouter } from "next/navigation";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";
import { JOURNEY_DATE_PRESETS, type JourneyDatePreset } from "@/lib/constants/journeyDatePresets";

const DATE_PRESET_LABELS: Record<JourneyDatePreset, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
};

/**
 * Filtri per i risultati Journey della ricerca (categoria, data) — si applicano anche senza
 * testo scritto, come i filtri di YouTube usati per navigare senza una query. Niente filtro per
 * popolarità/visualizzazioni: andrebbe contro "Quality Over Virality" (08_Algorithm.md).
 * Ogni select aggiorna subito l'URL (nessun bottone "Applica"). I valori correnti arrivano come
 * prop dal Server Component (la pagina legge già `searchParams`) invece che da `useSearchParams`
 * lato client: evita del tutto il vincolo di Suspense richiesto da quell'hook nei page load.
 */
export function SearchFilters({
  defaultQuery = "",
  defaultCategory = "",
  defaultDatePreset = "",
}: {
  defaultQuery?: string;
  defaultCategory?: string;
  defaultDatePreset?: string;
}) {
  const router = useRouter();

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams();
    if (defaultQuery) params.set("q", defaultQuery);
    if (defaultCategory) params.set("category", defaultCategory);
    if (defaultDatePreset) params.set("date", defaultDatePreset);
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form className="mt-3 flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by category"
        defaultValue={defaultCategory}
        onChange={(event) => updateParam("category", event.target.value)}
        className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-ink-muted focus:outline-none focus:ring-1 focus:ring-ink-muted"
      >
        <option value="">All categories</option>
        {JOURNEY_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by date"
        defaultValue={defaultDatePreset}
        onChange={(event) => updateParam("date", event.target.value)}
        className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-ink-muted focus:outline-none focus:ring-1 focus:ring-ink-muted"
      >
        <option value="">Any time</option>
        {JOURNEY_DATE_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {DATE_PRESET_LABELS[preset]}
          </option>
        ))}
      </select>
    </form>
  );
}
