import type { SVGProps } from "react";
import Form from "next/form";
import { IconButton } from "@/components/ui/button";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
        className={cn(FIELD, "rounded-full bg-surface-2")}
      />
      <IconButton type="submit" aria-label="Search" className="border-transparent bg-ink text-bg hover:opacity-90">
        <SearchIcon className="h-4 w-4" />
      </IconButton>
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
