/*
 * Illustrazione animata di una barca a vela al tramonto (card "Error 404" in fondo alla Home).
 * Si comporta come una foto: i suoi colori restano scuri in qualunque tema, il testo sopra usa
 * on-photo. Il movimento (classi sail-* in app/globals.css) parte solo da computer e mai per chi
 * ha chiesto meno movimento: altrimenti la scena resta ferma con la barca al centro.
 *
 * Coordinate in un quadrato 800x800: orizzonte a y=584, la barca naviga appena sotto (y=600).
 */

const SKY_TOP = "oklch(17% 0 0)";
const SKY_HORIZON = "oklch(22% 0 0)";
const SEA_TOP = "oklch(14% 0 0)";
const SEA_BOTTOM = "oklch(6% 0 0)";
const WAVE_FAR = "oklch(12.5% 0 0)";
const WAVE_MID = "oklch(10% 0 0 / 85%)";
const WAVE_NEAR = "oklch(7% 0 0 / 90%)";
const SILHOUETTE = "oklch(8% 0 0)";
/** Grigio argento dei granelli chiari della sabbia (components/common/SandBackground.tsx). */
const HULL = "oklch(78% 0.012 75)";
/** Il rosso del sito, per le vele. */
const SAIL = "var(--color-danger)";
const EMBER = "var(--color-ember)";

/** Onda ripetuta ogni 100 unità per 1600 unità di larghezza: scorrendo di 800 a sinistra il
 * disegno torna identico, quindi il ciclo non ha mai uno scatto. */
function wavePath(y: number, amplitude: number) {
  return `M0,${y} q50,-${amplitude} 100,0${" t100,0".repeat(15)} V800 H0 Z`;
}

/** Strisce del riflesso del sole sull'acqua: [x, y, larghezza, opacità]. */
const GLINTS = [
  [500, 596, 120, 55],
  [515, 612, 90, 45],
  [490, 630, 140, 35],
  [528, 650, 64, 30],
  [505, 672, 110, 22],
  [535, 696, 50, 16],
] as const;

export function SailingScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sail-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY_TOP} />
          <stop offset="100%" stopColor={SKY_HORIZON} />
        </linearGradient>
        <linearGradient id="sail-horizon-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMBER} stopOpacity="0" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0.22" />
        </linearGradient>
        <radialGradient id="sail-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={EMBER} stopOpacity="0.65" />
          <stop offset="40%" stopColor={EMBER} stopOpacity="0.22" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sail-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SEA_TOP} />
          <stop offset="100%" stopColor={SEA_BOTTOM} />
        </linearGradient>
        <filter id="sail-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* Cielo e luce calda sull'orizzonte */}
      <rect width="800" height="800" fill="url(#sail-sky)" />
      <rect y="380" width="800" height="204" fill="url(#sail-horizon-glow)" />

      {/* Nuvole lontane */}
      <g className="sail-cloud">
        <ellipse cx="200" cy="470" rx="170" ry="9" fill="white" fillOpacity="0.06" filter="url(#sail-soft)" />
      </g>
      <g className="sail-cloud sail-cloud-slow">
        <ellipse cx="620" cy="430" rx="140" ry="7" fill="white" fillOpacity="0.05" filter="url(#sail-soft)" />
      </g>

      {/* Sole che tramonta */}
      <circle className="sail-sun-glow" cx="560" cy="584" r="270" fill="url(#sail-sun-glow)" />
      <circle cx="560" cy="584" r="56" fill={EMBER} />

      {/* Gabbiani */}
      <g className="sail-gulls">
        <path className="sail-gull" d="M640,452 q7,-7 14,0 q7,-7 14,0" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        <path className="sail-gull sail-gull-late" d="M680,470 q5,-5 10,0 q5,-5 10,0" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Mare: base e onde lontane, dietro la barca */}
      <rect y="584" width="800" height="216" fill="url(#sail-sea)" />
      <path className="sail-wave-far" d={wavePath(590, 3)} fill={WAVE_FAR} />

      {/* Riflesso del sole */}
      <g>
        {GLINTS.map(([x, y, width, opacity]) => (
          <rect key={y} className="sail-glint" x={x} y={y} width={width} height="3" rx="1.5" fill={EMBER} fillOpacity={opacity / 100} />
        ))}
      </g>

      {/* Barca: attraversa la scena (sail-boat) e intanto dondola (sail-bob) */}
      <g className="sail-boat">
        <g className="sail-bob">
          <line className="sail-wake" x1="-46" y1="6" x2="-120" y2="6" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
          <line className="sail-wake sail-wake-late" x1="-58" y1="12" x2="-100" y2="12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-2,-92 L-2,-6 L-40,-6 Z" fill={SAIL} />
          <path d="M3,-80 L3,-6 L38,-6 Z" fill={SAIL} />
          <line x1="0" y1="0" x2="0" y2="-96" stroke={SILHOUETTE} strokeWidth="3" />
          <path d="M0,-98 L-15,-92 L0,-86 Z" fill={EMBER} />
          <path d="M-42,-2 L48,-2 L36,12 L-34,12 Z" fill={HULL} />
        </g>
      </g>

      {/* Onde davanti alla barca: coprono la base dello scafo, così sembra davvero in acqua */}
      <path className="sail-wave-mid" d={wavePath(608, 5)} fill={WAVE_MID} />
      <path className="sail-wave-near" d={wavePath(700, 9)} fill={WAVE_NEAR} />
    </svg>
  );
}
