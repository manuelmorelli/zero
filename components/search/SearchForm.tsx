import type { SVGProps } from "react";
import Form from "next/form";
import { IconButton } from "@/components/ui/button";
import { FIELD } from "@/components/ui/input";
import { ChatComposerShell } from "@/components/ui/chat";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  defaultValue?: string;
  className?: string;
  /** Dove invia la ricerca (GET, via next/form): di base la pagina /search. Il forum di un
   * Journey (ForumSearchForm) la punta invece alla propria pagina, stesso componente. */
  action?: string;
  placeholder?: string;
  /** "hero": stessa barra di scrittura bordata e luminosa delle chat AI (Ember, Community),
   * per l'ingresso principale della ricerca. Di base "default", il campo compatto di sempre. */
  variant?: "default" | "hero";
};

/**
 * Riusato sia nell'header della Home sia in cima alla pagina /search (e, con `action` diverso, dal
 * forum di un Journey): un solo componente, nessuna duplicazione del markup del campo di ricerca.
 */
export function SearchForm({
  defaultValue = "",
  className = "",
  action = "/search",
  placeholder = "Search Journeys and journeyers",
  variant = "default",
}: SearchFormProps) {
  if (variant === "hero") {
    return (
      <Form action={action} className={className}>
        <ChatComposerShell className="flex items-center gap-2 px-2 py-2">
          <input
            type="search"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="w-full min-w-0 flex-1 bg-transparent px-3 py-1.5 text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <IconButton type="submit" aria-label="Search">
            <SearchIcon className="h-4 w-4" />
          </IconButton>
        </ChatComposerShell>
      </Form>
    );
  }

  return (
    <Form action={action} className={`flex items-center gap-2 ${className}`}>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(FIELD, "rounded-full bg-surface-2 max-md:border-ember-line")}
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
