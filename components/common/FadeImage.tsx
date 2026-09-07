"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/** Wrapper di next/image per foto vere (mai asset statici locali): mostra uno sfondo che
 * pulsa finché la foto non è pronta e poi la fa comparire con una dissolvenza, invece dello
 * spazio vuoto/grigio fisso che si vede altrimenti durante il caricamento da remoto (R2).
 * La dissolvenza è su un div che avvolge l'immagine, non sulla classe dell'immagine stessa:
 * così non entra in conflitto con eventuali transizioni già presenti su di essa (es. lo zoom
 * al passaggio del mouse in ContentCard, che anima "transform" e verrebbe rotto se anche noi
 * impostassimo "transition-property" sullo stesso elemento). */
export function FadeImage(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-surface-2 transition-opacity duration-300 ${
          loaded ? "opacity-0" : "animate-pulse opacity-100"
        }`}
      />
      <div className={`absolute inset-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <Image {...props} onLoad={() => setLoaded(true)} />
      </div>
    </>
  );
}
