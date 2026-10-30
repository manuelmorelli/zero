import { execFileSync } from "node:child_process";
import path from "node:path";
import type { APIRequestContext, BrowserContext } from "@playwright/test";
import { BETA_ACCESS_COOKIE } from "@/lib/betaAccess";

// Playwright transpila i test a CommonJS, ma generated/prisma/client è generato solo in ESM
// (Prisma 7, generator "prisma-client" in prisma/schema.prisma): importarlo o richiederlo da qui
// va in errore ("Cannot require() ES Module ... in a cycle"). db-cli.ts gira invece in un processo
// Node separato via tsx, che risolve l'ESM nel modo giusto — lo stesso identico database, solo
// un salto di processo in più per ogni operazione.
const DB_CLI = path.resolve(__dirname, "db-cli.ts");
const TSX_CLI = path.resolve(__dirname, "../../node_modules/tsx/dist/cli.mjs");

function callDb<T>(model: string, action: string, args?: unknown): T {
  const output = execFileSync(
    process.execPath,
    [TSX_CLI, DB_CLI, model, action, ...(args !== undefined ? [JSON.stringify(args)] : [])],
    { encoding: "utf-8" }
  );
  return output ? (JSON.parse(output) as T) : (null as T);
}

type UserRecord = { id: string; email: string };

/** Prefisso comune a tutte le email create dai test, per poterle riconoscere senza ambiguità
 * rispetto ai dati reali di sviluppo. */
const TEST_EMAIL_PREFIX = "e2e";
const TEST_EMAIL_DOMAIN = "zero.test";

export function uniqueEmail(tag: string): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${TEST_EMAIL_PREFIX}-${tag}-${suffix}@${TEST_EMAIL_DOMAIN}`;
}

export function uniqueUsername(tag: string): string {
  return `e2e${tag}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toLowerCase();
}

/** Età over 16 richiesta da lib/auth.ts, fissa per non dipendere dalla data di oggi. */
export const TEST_DATE_OF_BIRTH = "2000-01-01";

/** I test girano sul server di sviluppo reale (vedi playwright.config.ts): il cancello beta è
 * acceso solo se Manuel ha impostato BETA_ACCESS_CODE nel suo .env, altrimenti è spento come al
 * solito e questo cookie semplicemente non serve a niente (proxy.ts lo ignora quando la variabile
 * non c'è). Nessun valore finto: va bene solo perché è lo stesso .env letto dal server stesso. */
export async function addBetaCookie(context: BrowserContext, baseURL: string) {
  const code = process.env.BETA_ACCESS_CODE;
  if (!code) return;
  await context.addCookies([{ name: BETA_ACCESS_COOKIE, value: code, url: baseURL }]);
}

type SignUpInput = {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  creatorMode?: boolean;
};

/** Crea l'utente passando dalla vera API di Better Auth (hash password, hook età compresi),
 * senza passare dall'interfaccia: l'interfaccia di registrazione è testata separatamente in
 * auth.spec.ts. Non verifica l'email: usare markEmailVerified per poter fare login nei test
 * che hanno solo bisogno di un utente già pronto. */
export async function apiSignUp(request: APIRequestContext, input: SignUpInput): Promise<UserRecord> {
  const response = await request.post("/api/auth/sign-up/email", {
    data: {
      name: input.name,
      email: input.email,
      password: input.password,
      dateOfBirth: input.dateOfBirth ?? TEST_DATE_OF_BIRTH,
      creatorMode: input.creatorMode ?? false,
    },
  });
  if (!response.ok()) {
    throw new Error(`sign-up failed (${response.status()}): ${await response.text()}`);
  }
  return findUserByEmail(input.email);
}

export function findUserByEmail(email: string): UserRecord {
  return callDb<UserRecord>("user", "findUniqueOrThrow", { where: { email } });
}

export function markEmailVerified(email: string) {
  callDb("user", "update", { where: { email }, data: { emailVerified: true } });
}

export function setUsername(userId: string, username: string) {
  callDb("user", "update", { where: { id: userId }, data: { username, emailVerified: true } });
}

/** Completa il profilo e i requisiti di pubblicazione (lib/creator.ts getPublishReadiness)
 * direttamente nel database, per non dover caricare un video reale su R2 ad ogni esecuzione
 * dei test solo per arrivare al punto da cui parte il test vero (il pulsante "Publish"). */
export function makePublishReady(userId: string, username: string) {
  callDb("user", "update", {
    where: { id: userId },
    data: {
      username,
      avatarUrl: "https://example.com/e2e-avatar.png",
      bio: "E2E test bio",
      creatorMode: true,
      emailVerified: true,
    },
  });
  callDb("creator", "upsert", {
    where: { userId },
    create: {
      userId,
      displayName: "E2E Creator",
      presentationVideoUrl: "https://example.com/e2e-presentation.mp4",
      guidelinesAcceptedAt: new Date().toISOString(),
    },
    update: {
      presentationVideoUrl: "https://example.com/e2e-presentation.mp4",
      guidelinesAcceptedAt: new Date().toISOString(),
    },
  });
}

/** Profilo completo ma senza i requisiti "presentation"/"guidelines" (lib/creator.ts), per
 * verificare che publishJourney li blocchi davvero. */
export function makeIncompleteProfile(userId: string, username: string) {
  callDb("user", "update", {
    where: { id: userId },
    data: {
      username,
      avatarUrl: "https://example.com/e2e-avatar.png",
      bio: "E2E test bio",
      emailVerified: true,
    },
  });
  return callDb<{ id: string }>("creator", "create", { data: { userId, displayName: "E2E Incomplete" } });
}

export function getCreatorByUserId(userId: string) {
  return callDb<{ id: string }>("creator", "findUniqueOrThrow", { where: { userId } });
}

export function createDraftJourney(creatorId: string, title: string, description: string) {
  return callDb<{ id: string }>("journey", "create", {
    data: { creatorId, title, description, order: 0, status: "DRAFT" },
  });
}

export function createPublishedEpisode(journeyId: string, title: string) {
  return callDb<{ id: string }>("episode", "create", {
    data: {
      journeyId,
      title,
      order: 0,
      videoKey: "episodes/e2e-placeholder.mp4",
      publishedAt: new Date().toISOString(),
    },
  });
}

export function getJourneyStatus(journeyId: string): string {
  return callDb<{ status: string }>("journey", "findUniqueOrThrow", { where: { id: journeyId } }).status;
}

export function findAnyWatchableEpisode(): { id: string; journeyId: string } | null {
  return callDb("episode", "findFirst", {
    where: {
      publishedAt: { not: null },
      deletedAt: null,
      videoKey: { not: null },
      journey: { status: { in: ["PUBLISHED", "DISCOVERY"] }, deletedAt: null },
    },
    select: { id: true, journeyId: true },
    orderBy: { publishedAt: "desc" },
  });
}

export function findFollow(followerId: string, followingId: string) {
  return callDb("follow", "findUnique", { where: { followerId_followingId: { followerId, followingId } } });
}

/** Rimuove un utente di test e tutto ciò che potrebbe bloccarne la cancellazione (le tabelle
 * collegate a User non hanno tutte onDelete: Cascade nello schema, vedi prisma/schema.prisma).
 * Account/Session invece sono già a cascata. Ogni passo è isolato: va bene se uno di questi non
 * trova niente da cancellare, la maggior parte dei test non arriva a creare tutte queste righe. */
export function deleteTestUser(userId: string) {
  // Un fallimento qui non deve far fallire il test (il risultato del test conta di più della
  // pulizia), ma deve restare visibile: insabbiarlo del tutto ha già nascosto un errore reale di
  // connessione una volta, lasciando utenti di test nel database senza nessun avviso.
  const step = (model: string, args: unknown) => {
    try {
      callDb(model, "deleteMany", args);
    } catch (error) {
      console.warn(`[e2e cleanup] ${model}.deleteMany ha fallito per userId=${userId}:`, error);
    }
  };

  step("notification", { where: { userId } });
  step("follow", { where: { OR: [{ followerId: userId }, { followingId: userId }] } });
  step("episodeProgress", { where: { userId } });
  step("journeyProgress", { where: { userId } });

  let creator: { id: string } | null = null;
  try {
    creator = callDb<{ id: string }>("creator", "findUnique", { where: { userId } });
  } catch (error) {
    console.warn(`[e2e cleanup] creator.findUnique ha fallito per userId=${userId}:`, error);
  }
  if (creator) {
    step("episode", { where: { journey: { creatorId: creator.id } } });
    step("journey", { where: { creatorId: creator.id } });
    try {
      callDb("creator", "delete", { where: { id: creator.id } });
    } catch (error) {
      console.warn(`[e2e cleanup] creator.delete ha fallito per userId=${userId}:`, error);
    }
  }

  try {
    callDb("user", "delete", { where: { id: userId } });
  } catch (error) {
    console.warn(`[e2e cleanup] user.delete ha fallito per userId=${userId}, utente lasciato nel database:`, error);
  }
}
