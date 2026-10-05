"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateSupportLink } from "@/lib/actions/supportLink";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SupportLinkFormProps = {
  supportLinkUrl: string | null;
};

export function SupportLinkForm({ supportLinkUrl }: SupportLinkFormProps) {
  const [state, formAction, pending] = useActionState(updateSupportLink, { error: null });
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      toast.success("Support link updated");
      submitted.current = false;
    }
  }, [pending, state.error]);

  return (
    <form
      action={(formData) => {
        submitted.current = true;
        formAction(formData);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="supportLinkUrl" className="text-sm font-medium text-ink-muted">
          Your external support page <span className="text-ink-faint">(optional)</span>
        </label>
        <input
          id="supportLinkUrl"
          name="supportLinkUrl"
          type="text"
          inputMode="url"
          maxLength={300}
          placeholder="https://"
          defaultValue={supportLinkUrl ?? ""}
          className={cn(FIELD, "mt-1.5")}
        />
        <p className="mt-2 text-sm text-ink-muted">
          Viewers who press &quot;Support this Creator&quot; are sent to this page. Payments happen there, not on Zero.
        </p>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save link"}
        </Button>
        {supportLinkUrl && (
          <Button variant="secondary" type="submit" name="remove" value="1" disabled={pending}>
            Remove link
          </Button>
        )}
      </div>
    </form>
  );
}
