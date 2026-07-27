import type { SVGProps } from "react";
import Form from "next/form";

type SearchFormProps = {
  defaultValue?: string;
  className?: string;
};

/**
 * Riusato sia nell'header della Home sia in cima alla pagina /search: un solo
 * componente, nessuna duplicazione del markup del campo di ricerca.
 */
export function SearchForm({ defaultValue = "", className = "" }: SearchFormProps) {
  return (
    <Form action="/search" className={`flex items-center gap-2 ${className}`}>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search Journeys and creators"
        className="w-full rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-ink-muted"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-opacity hover:opacity-90"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </Form>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
