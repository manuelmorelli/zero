import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
