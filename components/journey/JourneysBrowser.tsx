"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/search/SearchForm";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { WildcardJourneyCard } from "@/components/journey/WildcardJourneyCard";
import type { JourneyCategoryRow } from "@/lib/discovery/journeysByCategory";

type JourneysBrowserProps = {
  rows: JourneyCategoryRow[];
};

/** Ricerca dal vivo (filtra le righe mentre si scrive, nessun cambio pagina) + righe per categoria. */
export function JourneysBrowser({ rows }: JourneysBrowserProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    if (!q) return rows;
    return rows
      .map((row) => {
        if (row.category.toLowerCase().includes(q)) return row;
        const journeys = row.journeys.filter((journey) => journey.title.toLowerCase().includes(q));
        return { ...row, journeys, wildcardJourneyId: null };
      })
      .filter((row) => row.journeys.length > 0);
  }, [rows, q]);

  return (
    <div className="space-y-10">
      <div className="max-w-md">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Journeys"
            aria-label="Search Journeys"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      {q.length > 0 && filteredRows.length === 0 && (
        <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
          {`No Journeys found for "${query}".`}
        </p>
      )}

      {filteredRows.map((row) => (
        <HorizontalScrollRow key={row.category} id={row.slug} title={row.category}>
          {row.wildcardJourneyId && (
            <WildcardJourneyCard journeyId={row.wildcardJourneyId} className="w-40 shrink-0 sm:w-44" />
          )}
          {row.journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} className="w-40 shrink-0 sm:w-44" />
          ))}
        </HorizontalScrollRow>
      ))}
    </div>
  );
}
