import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Da Next.js 16 le qualità vanno dichiarate esplicitamente (altrimenti l'unica concessa è
    // 75, vedi node_modules/next/dist/docs/.../image.md#qualities): 90 serve alla copertina
    // dell'hero del Profilo (components/profile/ProfileHero.tsx).
    qualities: [75, 90],
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
