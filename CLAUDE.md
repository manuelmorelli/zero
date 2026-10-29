@AGENTS.md

# Zero — Guida rapida per l'AI

Questo file riassume le regole del progetto (da `docs/90_AI_DEVELOPMENT_RULES.md` e `AGENTS.md`) così non vanno ripetute a ogni sessione.

---

## ⚠️ Avviso importante su Next.js

Questo progetto usa una versione di Next.js con differenze rispetto a quella "classica" (API, convenzioni e struttura file possono cambiare rispetto ai dati di training). **Prima di scrivere codice che tocca funzionalità Next.js, consultare `node_modules/next/dist/docs/`** e rispettare eventuali avvisi di deprecazione.

Esempio concreto già incontrato: il componente `<Image>` in questa versione ha `priority` deprecato a favore di `preload`.

---

## Stack tecnico

Elenco completo e motivato in `docs/16_Tech_Stack.md`; dettaglio architetturale in `docs/23_Technical_Build_History.md`.

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, kit proprio in `components/ui/` su primitive Radix, `lucide-react`, `sonner`
- **Animazioni**: CSS, GSAP, three.js (sabbia 3D), secondo `docs/21_Motion_Guidelines.md`
- **Backend**: Server Components + Server Actions (`lib/actions/`); Route Handler solo per auth, streaming AI, cron e webhook
- **Database**: PostgreSQL su Neon, Prisma 7 con `@prisma/adapter-neon`
- **Auth**: Better Auth (email+password, verifica email obbligatoria)
- **Storage**: Cloudflare R2 (upload diretto con URL prefirmati); copie leggere dei video su Cloudflare Stream
- **AI**: Google Gemini (moderazione, chat Community, Ember, Mappa dei Momenti). OpenAI non è un provider AI attuale di Zero
- **Email**: Resend, dominio `zerojourneys.com`
- **Pagamenti**: nessun fornitore scelto; il lancio è previsto senza funzioni a pagamento
- **Hosting**: predisposto per Vercel (`vercel.json` con i cron), sito non ancora online

Stato attuale (verificare sul codice prima di dare per scontato qualcosa):
- **Non installati**: shadcn/ui, Framer Motion, Zustand, Zod, React Hook Form. Non introdurli senza un motivo concreto.
- Prisma (v7): schema in `prisma/schema.prisma`, config CLI in `prisma.config.ts`, client generato in `generated/prisma` (non committato, rigenerato con `npx prisma generate` o automaticamente via `postinstall`). Import: `@/generated/prisma/client`. Usare sempre `PrismaClient` dal singleton `lib/prisma.ts`, mai istanziarlo altrove. Negli script fuori da Next.js serve passare esplicitamente l'adapter Neon.
- Better Auth è configurato in `lib/auth.ts` (server) e `lib/auth-client.ts` (client), route in `app/api/auth/[...all]/route.ts`. Nessun provider social.
- **Account esterni collegati e funzionanti**: Neon, Cloudflare R2, Cloudflare Stream, Resend, Gemini. Vedi `.env.example` per le variabili richieste.
- Funzioni costruite ma spente da variabile d'ambiente: `MOMENTS_LIBRARY_ENABLED`, `GEMINI_IMAGE_GENERATION_ENABLED`.
- Alias import `@/*` → root del progetto (es. `@/lib/utils`).

---

## Struttura delle cartelle

```
app/
  (site)/             Pagine con header e menu condivisi (layout unico)
  api/                Auth, streaming AI, cron, webhook
  login, register...  Pagine di accesso, fuori dal layout del sito
components/
  ui/                 Kit ufficiale del design system (obbligatorio)
  layout/ common/     Layout e componenti generici
  home/ journey/ profile/ community/ ...   Componenti per area
docs/                 Documentazione ufficiale del progetto
hooks/                Custom React hooks riutilizzabili
lib/
  actions/            Server Actions per dominio
  discovery/ search/ scoring/ profile/     Letture e calcoli per area
  ai/                 Integrazione Gemini
prisma/               Schema e migrazioni del database
public/               Immagini, icone e asset statici
scripts/              check-design.mjs (lucchetto di design), logo, script AI
```

---

## Principi generali

- Non modificare file non collegati al task richiesto.
- Non introdurre breaking change se non necessario.
- Rispettare l'architettura esistente.
- Preferire soluzioni semplici, evitare complessità inutile.
- Preferire codice riutilizzabile, evitare duplicazione di logica di business.
- Separare UI e logica di business.
- Ogni componente ha una singola responsabilità.
- File puliti e leggibili, comprensibili da un altro sviluppatore.

## Regole sui componenti

- Riutilizzabili e indipendenti.
- Ricevono i dati tramite props (evitare stato non necessario).
- Evitare stili duplicati.
- Mai creare componenti enormi: dividere interfacce complesse in componenti più piccoli.

## Regole di stile

- Solo Tailwind CSS, niente stili inline.
- Preferire le utility class.
- Spaziatura coerente.
- Usare i colori semantici già definiti in `app/globals.css` (tema `@theme`), non colori arbitrari:
  `bg`, `surface`, `surface-2`, `border`, `ink`, `ink-muted`, `ink-faint`, `ember` (unico arancione, sempre pieno, mai sfumato), `danger`, `scrim`, `on-photo` (es. `bg-surface`, `text-ink-muted`, `border-border`).
- Font unico Satoshi (`font-sans`, da variabile `--font-satoshi`, file in `app/fonts/`), pesi diversi per gerarchia.
- Approccio Mobile First.
- **Non disegnare a mano bottoni, titoli, riquadri, campi o card: usare sempre i componenti di `components/ui/`** (`button.tsx`, `heading.tsx`, `panel.tsx`, `input.tsx`, `page-container.tsx`, `cover-card.tsx`, `avatar.tsx` — dettagli in `docs/15_Design_System.md`). Prima di scrivere un pezzo di interfaccia nuovo, controllare se esiste già lì. `npm run check:design` (o `node scripts/check-design.mjs`) lo verifica e blocca automaticamente il commit se trova uno scarto: se lo segnala, il pezzo va rifatto con i componenti ufficiali, non aggirato.

### Porting mobile (pagina per pagina) — errori già visti, non ripeterli

Dettaglio e perché in `docs/15_Design_System.md` § "Porting mobile: regole pratiche". Riassunto:

- Confine telefono/computer sempre a `md` (768px), mai `sm` (640px).
- Ogni card con foto passa da `CoverFrame` (`components/ui/cover-card.tsx`): misure in `RATIO`/`CARD_GRID`/`CARD_ROW_ITEM`, mai riquadri fatti a mano. `overlay` = sopra la foto, `below` = sotto/fuori dalla foto (creator+Trust Score stanno in `below`).
- Un titolo che sta bene su una card da computer può andare a capo 4-5 volte su una card stretta da telefono e sfondare il layout: dargli sempre una grandezza ridotta per il telefono (`text-base md:text-xl`), mai una sola grandezza pensata per il computer.
- `pb-[X%]`/`pt-[X%]` sono SEMPRE relativi alla larghezza del box, mai all'altezza (regola CSS) — funzionano per riservare spazio verticale solo su un box quadrato (`aspect-square`). Se sul telefono quel box perde il quadrato e la sua altezza segue il contenuto, usare un'altezza fissa (`h-[300px] md:h-auto`) o una percentuale di altezza (`h-[X%]`), mai un padding percentuale.
- Mai un'opacità a mano su un colore semantico (`bg-ember/40`, bloccato dal lucchetto): serve un token nuovo in `app/globals.css` (vedi `--color-ember-glass`).
- Prima di dire "fatto, controlla tu" su una modifica a rischio di sovrapposizioni/testo-a-capo imprevisto, verificare con uno screenshot Playwright reale (viewport telefono ~390×844), non descrivere a parole quello che dovrebbe succedere. Per ritocchi semplici (colore, pochi pixel) non serve, lì basta Manuel su localhost.

## Convenzioni di naming

| Cosa | Convenzione | Esempio |
|---|---|---|
| Componenti React (nome + file) | PascalCase | `Hero.tsx`, `JourneyCard.tsx` |
| File di utility | camelCase | `formatDate.ts` |
| Cartelle | lowercase | `components/journey/` |
| Variabili | camelCase | `journeyScore` |
| Costanti | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |

## Qualità del codice

- Rimuovere import inutilizzati e codice morto.
- Evitare logica duplicata e numeri magici.
- Funzioni piccole e mirate.

## Regole Git

- Ogni feature completata va committata.
- Messaggi di commit chiari, in stile: `feat: navbar`, `fix: responsive hero`, `refactor: journey cards`, `docs: update project context`.

## Documentazione

Quando cambia uno di questi aspetti, ricordare all'utente di aggiornare la documentazione ufficiale in `docs/`:
architettura, decisioni di prodotto, struttura cartelle, design system, regole di business, database, autenticazione, API.

## Comportamento atteso dall'AI prima di scrivere codice

1. Capire bene il task.
2. Controllare se esistono già componenti riutilizzabili.
3. Seguire l'architettura esistente.
4. Modificare solo ciò che è necessario.
5. Produrre codice pronto per la produzione.

---

## Note per parlare con l'utente (Manuel)

Manuel non ha competenze tecniche di programmazione. Quando serve fargli una domanda o spiegargli qualcosa:
- Usare linguaggio semplice, senza gergo tecnico.
- Se bisogna far scegliere tra opzioni tecniche, spiegare prima in parole semplici cosa cambia **nella pratica** tra le opzioni, prima di chiedere di scegliere.

## Piano e conferme

Non presentare piani e non aspettare un "vai" prima di agire: Manuel chiede il piano quando gli serve. Le azioni difficili da annullare (cancellare file o dati, push, operazioni distruttive su git) vanno comunque confermate prima.

---

# Regole di Context Engineering e Ottimizzazione dei Token

## Vincoli comportamentali
- Non spiegare mai cosa stai per fare prima di farlo.
- Non ripetere o riassumere i prompt dell'utente.
- Evita commenti descrittivi o discorsivi nell'output. Fornisci solo il ragionamento strettamente necessario e le soluzioni dirette.

## Gestione del contesto
- Usa target di file specifici (es. @nomefile) invece di fare ricerche generiche nel repository.
- Non leggere file interi se hai bisogno solo di una funzione specifica; usa grep o letture mirate.
- Esegui i comandi del terminale con i flag per renderli silenziosi (es. `npm test -- --silent`) per evitare di intasare la finestra di contesto con log inutili.