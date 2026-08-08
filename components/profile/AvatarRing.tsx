type AvatarRingProps = {
  className?: string;
};

/**
 * Contorno a pennellata per la foto profilo: un cerchio disegnato a mano libera, non un semplice
 * bordo pieno né il logo ufficiale (troppo pesante per un uso ripetuto come cornice di un'immagine).
 * Un solo tratto SVG leggero (poche centinaia di byte), stesso stile organico del brand ma pensato
 * apposta per circondare un'immagine: leggermente irregolare, spessore variabile, senza chiusura
 * perfetta (l'inizio e la fine del tratto si sovrappongono leggermente, come un vero pennello).
 */
export function AvatarRing({ className }: AvatarRingProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 50 6
           C 74 6, 92 20, 94 42
           C 96 62, 86 80, 66 90
           C 46 99, 22 95, 10 78
           C -1 62, 2 38, 16 22
           C 28 8, 40 6, 50 6.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        pathLength={100}
        style={{ strokeDasharray: "100 100", strokeDashoffset: 0 }}
      />
    </svg>
  );
}
