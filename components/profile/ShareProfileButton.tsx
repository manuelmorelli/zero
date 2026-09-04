"use client";

import { toast } from "sonner";

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
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-ember backdrop-blur-md transition-colors hover:bg-white/10"
    >
      Share Profile
    </button>
  );
}
