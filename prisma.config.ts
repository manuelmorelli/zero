import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // connessione diretta (non pooled), usata solo dalla CLI per le migration
    url: env("DIRECT_URL"),
  },
});
