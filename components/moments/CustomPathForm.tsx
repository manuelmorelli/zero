import Form from "next/form";
import { ButtonPrimary } from "@/components/ui/button";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CustomPathFormProps = {
  defaultValue?: string;
  className?: string;
};

/**
 * Casella di testo libero + bottone per avviare il Percorso su Misura (next/form invia come GET,
 * stesso schema di SearchForm): nessuna chiamata all'AI finché non si preme "Build my path", la
 * pagina fa il lavoro vero solo quando c'è un valore in ?situation=.
 */
export function CustomPathForm({ defaultValue = "", className = "" }: CustomPathFormProps) {
  return (
    <Form action="/custom-path" className={cn("grid gap-3", className)}>
      <textarea
        name="situation"
        defaultValue={defaultValue}
        placeholder="e.g. I'm afraid to leave a safe job to start something of my own"
        rows={3}
        className={cn(FIELD, "resize-none")}
      />
      <ButtonPrimary type="submit" className="justify-self-start">
        Build my path
      </ButtonPrimary>
    </Form>
  );
}
