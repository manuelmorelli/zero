@AGENTS.md

# Zero — Guida rapida per l'AI

Questo file riassume le regole del progetto (da `docs/90_AI_DEVELOPMENT_RULES.md` e `AGENTS.md`) così non vanno ripetute a ogni sessione.

---

## ⚠️ Avviso importante su Next.js

Questo progetto usa una versione di Next.js con differenze rispetto a quella "classica" (API, convenzioni e struttura file possono cambiare rispetto ai dati di training). **Prima di scrivere codice che tocca funzionalità Next.js, consultare `node_modules/next/dist/docs/`** e rispettare eventuali avvisi di deprecazione.

Esempio concreto già incontrato: il componente `<Image>` in questa versione ha `priority` deprecato a favore di `preload`.

---

## Stack tecnico

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL, Better Auth
- **Validazione**: Zod, React Hook Form
- **AI**: Google Gemini (moderazione automatica di testi e immagini, chat AI della Community). OpenAI non è un provider AI attuale di Zero
- **Storage**: Cloudflare R2
- **Pagamenti**: Stripe
- **Email**: Resend

Stato attuale (verificare prima di dare per scontato che qualcosa sia già installato):
- `shadcn/ui` **non è ancora installato**.
- Prisma (v7) è installato e configurato: schema in `prisma/schema.prisma`, config CLI in `prisma.config.ts`, client generato in `generated/prisma` (non committato, rigenerato con `npx prisma generate` o automaticamente via `postinstall`). Import: `@/generated/prisma/client`. Usare sempre `PrismaClient` dal singleton `lib/prisma.ts`, mai istanziarlo altrove.
- Better Auth è configurato in `lib/auth.ts` (server) e `lib/auth-client.ts` (client), route in `app/api/auth/[...all]/route.ts`. Solo email+password per ora, nessun provider social.
- **Nessun account esterno è ancora collegato** (Neon, Stripe, Resend, Cloudflare R2): `.env` locale ha solo placeholder. Vedi `.env.example` per le variabili richieste. Finché Neon non è configurato, le query reali al DB falliranno: è previsto, non è un bug.
- `components/ui/`, `hooks/`, `types/`, `prompts/` esistono come cartelle ma sono ancora vuote.
- Alias import `@/*` → root del progetto (es. `@/lib/utils`).

---

## Struttura delle cartelle

```
app/                  Routing dell'applicazione (App Router)
components/
  landing/            Componenti della Landing Page
  ui/                 Componenti UI condivisi (shadcn/ui)
  layout/             Componenti di layout
  common/             Componenti generici riutilizzabili
  journey/            Componenti legati ai "Journey"
docs/                 Documentazione ufficiale del progetto
hooks/                Custom React hooks riutilizzabili
lib/                  Utility e funzioni helper
prisma/               Schema e migrazioni del database
public/               Immagini, icone e asset statici
types/                Tipi TypeScript condivisi
prompts/              Prompt riutilizzabili per lo sviluppo AI
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
## Regola di conferma obbligatoria

Prima di modificare, creare o cancellare qualsiasi file, presentare sempre il piano completo e fermarsi. Aspettare che l'utente scriva esplicitamente "vai" in chat. Non procedere automaticamente dopo aver ricevuto risposte a domande di chiarimento — le risposte informano il piano, non autorizzano a scrivere codice.