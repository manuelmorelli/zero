import { cn } from "@/lib/utils";

type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Se presente, il valore viaggia con il form ("on" quando acceso, assente quando spento). */
  name?: string;
  className?: string;
};

/** Interruttore on/off stile iPhone con etichetta: stesso aspetto di quelli delle Impostazioni. */
export function Switch({ label, description, checked, onChange, name, className }: SwitchProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-surface px-3.5 py-2.5",
        className
      )}
    >
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-sm text-ink-faint">{description}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ember",
          checked ? "bg-ink" : "bg-surface-2"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-bg transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
    </label>
  );
}
