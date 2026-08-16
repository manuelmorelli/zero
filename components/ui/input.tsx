import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-muted disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
