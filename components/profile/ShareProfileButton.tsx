"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Copia il link del profilo negli appunti, conferma con un toast (sonner). */
export function ShareProfileButton() {
  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick}>
      Share Profile
    </Button>
  );
}
