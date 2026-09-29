import { cn } from "@/lib/utils";
import { FIELD } from "@/components/ui/input";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(FIELD, "resize-none", className)} {...props} />;
}

export { Textarea };
