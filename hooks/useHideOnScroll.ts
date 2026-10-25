"use client";

import { useEffect, useState } from "react";

/** Vero quando la pagina è stata scrollata verso il basso di un tratto deciso, falso appena si
 * risale anche di poco o si è vicini all'inizio della pagina. Usato da Header e BottomNav per
 * lasciare più spazio al contenuto mentre si scorre: la logica è la stessa a qualunque larghezza,
 * sono i chiamanti a mostrare l'effetto solo sotto i 768px (md), dove lo spazio verticale è
 * davvero poco. */
export function useHideOnScroll(threshold = 12) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < threshold) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);
      lastY = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
