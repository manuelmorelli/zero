"use client";

import { useState } from "react";
import { Theme } from "@/generated/prisma/enums";
import { updateThemePreference } from "@/lib/actions/settings";
import { Switch } from "@/components/ui/switch";

/** Settings: interruttore scuro/chiaro. Il sito resta scuro di default per tutti, il chiaro è
 * una scelta esplicita. Cambia aspetto all'istante (niente attesa del server), poi salva la
 * scelta in background nel database e nel cookie (vedi updateThemePreference). */
export function ThemeToggle({ theme }: { theme: Theme }) {
  const [checked, setChecked] = useState(theme === Theme.LIGHT);

  return (
    <Switch
      label="Light appearance"
      description="Zero stays dark for everyone else; this only changes it for you."
      checked={checked}
      onChange={(light) => {
        setChecked(light);
        document.documentElement.dataset.theme = light ? "light" : "dark";
        updateThemePreference(light ? Theme.LIGHT : Theme.DARK);
      }}
    />
  );
}
