import type { NextConfig } from "next";

// Da Next.js 15+ il server di sviluppo rifiuta per difetto le richieste "interne" (incluso il
// collegamento che aggiorna la pagina in automatico mentre si scrive codice) che non arrivano da
// "localhost", per sicurezza (vedi node_modules/next/dist/docs/.../allowedDevOrigins.md). Aprire
// il sito dal telefono tramite l'indirizzo di rete del PC (MOBILE_TEST_URL, vedi .env) attivava
// proprio questo blocco: il collegamento falliva in continuazione e il sito si ricaricava da solo
// nei momenti sbagliati, per esempio svuotando un modulo di accesso appena compilato. Qui si
// aggiunge quello stesso indirizzo alla lista di quelli permessi, solo per lo sviluppo, nessun
// effetto sul sito online. Stesso meccanismo di .env: serve riavviare il server per vedere
// l'effetto, non si attiva da solo.
const mobileTestOrigin = process.env.MOBILE_TEST_URL ? new URL(process.env.MOBILE_TEST_URL).hostname : undefined;

const nextConfig: NextConfig = {
  ...(mobileTestOrigin ? { allowedDevOrigins: [mobileTestOrigin] } : {}),
  images: {
    // Da Next.js 16 le qualità vanno dichiarate esplicitamente (altrimenti l'unica concessa è
    // 75, vedi node_modules/next/dist/docs/.../image.md#qualities): 90 serve alla copertina
    // dell'hero del Profilo (components/profile/ProfileHero.tsx).
    // 85 = copertine di Journey/episodi (COVER_IMAGE_QUALITY in lib/constants/image.ts).
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Foto profilo/copertina caricate su Cloudflare R2 (URL firmati, vedi lib/r2.ts):
        // wildcard perché il nome del bucket compare come sottodominio nell'URL.
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
