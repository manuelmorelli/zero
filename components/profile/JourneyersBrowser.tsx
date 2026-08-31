"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/search/SearchForm";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { JourneyerCard } from "@/components/profile/JourneyerCard";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";
import type { JourneyerCategoryRow } from "@/lib/discovery/journeyersByCategory";

type JourneyersBrowserProps = {
  newJourneyers: CreatorSearchResult[];
  rows: JourneyerCategoryRow[];
};

function matchesQuery(journeyer: CreatorSearchResult, q: string): boolean {
  return journeyer.name.toLowerCase().includes(q) || (journeyer.username?.toLowerCase().includes(q) ?? false);
}

/** Ricerca dal vivo (filtra le righe mentre si scrive, nessun cambio pagina) + righe per categoria. */
export function JourneyersBrowser({ newJourneyers, rows }: JourneyersBrowserProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filteredNewJourneyers = useMemo(() => {
    if (!q) return newJourneyers;
    return newJourneyers.filter((journeyer) => matchesQuery(journeyer, q));
  }, [newJourneyers, q]);

  const filteredRows = useMemo(() => {
    if (!q) return rows;
    return rows
      .map((row) => {
        if (row.category.toLowerCase().includes(q)) return row;
        const journeyers = row.journeyers.filter((journeyer) => matchesQuery(journeyer, q));
        return { ...row, journeyers };
      })
      .filter((row) => row.journeyers.length > 0);
  }, [rows, q]);

  const noResults = q.length > 0 && filteredNewJourneyers.length === 0 && filteredRows.length === 0;

  return (
    <div className="space-y-10">
      <div className="max-w-md">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Journeyers"
            aria-label="Search Journeyers"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      {noResults && (
        <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
          {`No Journeyers found for "${query}".`}
        </p>
      )}

      {filteredNewJourneyers.length > 0 && (
        <HorizontalScrollRow
          title="New Journeyers"
          subtitle="Journeyers whose Journey is in Discovery Phase right now."
        >
          {filteredNewJourneyers.map((journeyer) => (
            <JourneyerCard key={journeyer.id} journeyer={journeyer} className="w-40 shrink-0 sm:w-44" />
          ))}
        </HorizontalScrollRow>
      )}

      {filteredRows.map((row) => (
        <HorizontalScrollRow key={row.category} id={row.slug} title={row.category}>
          {row.journeyers.map((journeyer) => (
            <JourneyerCard key={journeyer.id} journeyer={journeyer} className="w-40 shrink-0 sm:w-44" />
          ))}
        </HorizontalScrollRow>
      ))}
    </div>
  );
}
