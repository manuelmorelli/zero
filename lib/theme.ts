import { cookies } from "next/headers";
import { Theme } from "@/generated/prisma/client";

/** Nome del cookie tecnico: letto subito al caricamento della pagina (prima del database) per
 * evitare il lampo del tema sbagliato. Il database resta la fonte vera (sincronizzata al login
 * e ad ogni cambio in Settings), il cookie è solo la scorciatoia per partire col tema giusto. */
export const THEME_COOKIE = "zero-theme";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function parseTheme(value: string | undefined): Theme {
  return value === "light" ? Theme.LIGHT : Theme.DARK;
}

/** Da usare in Server Component (root layout): nessuna query al database, solo il cookie. */
export async function getThemeFromCookie(): Promise<Theme> {
  const store = await cookies();
  return parseTheme(store.get(THEME_COOKIE)?.value);
}

/** Da usare in una Server Function (es. dopo il login, o quando la preferenza nel database non
 * coincide ancora con quella nel cookie di questo browser). */
export async function setThemeCookie(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme === Theme.LIGHT ? "light" : "dark", {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}
