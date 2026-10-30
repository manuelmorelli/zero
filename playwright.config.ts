import "dotenv/config";
import { defineConfig } from "@playwright/test";

// Next.js 16 blocca un secondo "next dev" nella stessa cartella di progetto (lock in
// .next/dev/lock) e invita a riusare quello già avviato invece di interromperlo (vedi
// node_modules/next/dist/docs/01-app/02-guides/ai-agents.md, sezione "Runtime visibility").
// Qui facciamo esattamente questo: i test girano sul server di sviluppo di Manuel, qualunque
// porta usi di default (3000), e lo avviano da soli solo se non è già in piedi (CI, o quando
// Manuel non ha "npm run dev" aperto). Il database resta quello di sviluppo: i dati creati dai
// test sono isolati tramite l'email "e2e-*@zero.test" e rimossi a fine test (tests/e2e/helpers.ts).
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
