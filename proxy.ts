import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { BETA_ACCESS_COOKIE, isRegistrationDisabled } from "@/lib/betaAccess";

// Elenco dei prefissi di pagine riservate a chi ha fatto login.
const PROTECTED_PATHS = ["/account", "/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Blocco diretto della chiamata di registrazione di Better Auth: app/register/page.tsx già
  // nasconde il modulo, questo è il controllo vero sul server, nel caso qualcuno chiami l'API
  // direttamente saltando l'interfaccia.
  if (isRegistrationDisabled() && pathname.startsWith("/api/auth/sign-up")) {
    return NextResponse.json({ error: "Registrations are closed right now." }, { status: 403 });
  }

  // Cancello della beta privata su invito: attivo solo quando BETA_ACCESS_CODE è impostata
  // su Vercel (in locale, senza quella variabile, il sito resta aperto come sempre). Il
  // valore del cookie è il codice stesso: cambiare la variabile invalida subito tutti i
  // cookie già distribuiti, senza bisogno di una lista di inviti da gestire.
  const betaCode = process.env.BETA_ACCESS_CODE;
  if (betaCode && pathname !== "/beta-access") {
    const cookie = request.cookies.get(BETA_ACCESS_COOKIE)?.value;
    if (cookie !== betaCode) {
      return NextResponse.redirect(new URL("/beta-access", request.url));
    }
  }

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) return NextResponse.next();

  // Controllo "ottimistico": legge solo il cookie, senza interrogare il database.
  // Il controllo autoritativo avviene comunque nella pagina tramite getCurrentUser().
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron|api/webhooks).*)"],
};
