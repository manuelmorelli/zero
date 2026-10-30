import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Script di terze parti delle skill di Claude Code (es. .claude/skills/impeccable/scripts/):
    // non è codice del sito, non va corretto né segnalato qui.
    ".claude/**",
  ]),
]);

export default eslintConfig;
