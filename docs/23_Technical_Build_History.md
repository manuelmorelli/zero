---
title: Technical Build History
doc_id: 23-technical-build-history
version: "1.0"
status: living
related_docs:
  - 16_Tech_Stack
  - 17_Project_Architecture
  - 11_Database_Architecture
  - 92_Project_History
---

# Technical Build History

*Versione tecnica di `92_Project_History.md`: come è stato costruito Zero, con stack reale, architettura, cronologia per fasi, problemi tecnici incontrati e debito aperto. Fotografia al 21 ottobre 2026, ricavata dal codice e dalla storia git, non dai documenti di progetto. Documento vivo: a ogni fase chiusa si aggiunge una riga alla cronologia e si aggiorna lo stato.*

---

## 1. Numeri chiave

| Voce | Valore |
|---|---|
| Primo commit | 14 luglio 2026 |
| Commit totali | 370 |
| File TypeScript/TSX tracciati | 360 (circa 32.000 righe) |
| Componenti React (`components/`) | 151 file `.tsx`, di cui 100 client component |
| Modelli Prisma | 40 modelli, 15 enum |
| Migrazioni | 36 (`prisma/migrations/`) |
| File di Server Actions (`lib/actions/`) | 25 |
| Route Handler (`app/api/`) | 8 |
| Cron job | 3 |
| Test automatici | nessuno (vedi § 7) |

Sviluppo interamente assistito da AI (Claude Code), con un fondatore non tecnico che decide prodotto e design e verifica il risultato a schermo.

---

## 2. Stack reale

| Area | Tecnologia | Note |
|---|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack), React 19.2 | Versione con breaking change rispetto a Next 14/15: consultare `node_modules/next/dist/docs/` |
| Linguaggio | TypeScript 5 | |
| Stile | Tailwind CSS 4 (`@theme` in `app/globals.css`) | Token semantici, nessun colore arbitrario ammesso |
| Primitive UI | Radix (Dialog, Dropdown Menu), `lucide-react`, `sonner` | Kit proprio in `components/ui/`, **non** shadcn/ui |
| Animazione | GSAP 3, three.js (sfondo di sabbia 3D), CSS | Caricati solo dove servono (§ 5, perf) |
| Drag & drop | dnd-kit | Capitoli ed episodi |
| Media | `react-easy-crop`, `hls.js`, `@ffmpeg-installer/ffmpeg` (solo script) | |
| Database | PostgreSQL su Neon (Francoforte) | |
| ORM | Prisma 7 con `@prisma/adapter-neon`, client generato in `generated/prisma` | Singleton in `lib/prisma.ts` |
| Auth | Better Auth 1.6, email+password, `requireEmailVerification: true` | `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]` |
| Storage | Cloudflare R2 via `@aws-sdk/client-s3` + URL prefirmati | `lib/r2.ts` |
| Video leggero | Cloudflare Stream (HLS) | Copia derivata, l'originale su R2 non viene mai toccato |
| AI | Google Gemini: `gemini-3.5-flash-lite` (principale), `gemini-3.1-flash-lite` (riserva), `gemini-3.1-flash-lite-image` (immagini), `gemini-embedding-2` | `lib/ai/` |
| Email | Resend, dominio verificato `zerojourneys.com` | `lib/email.ts` |
| Pagamenti | nessuno collegato | Lancio previsto senza funzioni a pagamento |
| Hosting | predisposto per Vercel (`vercel.json` con i cron) | Non ancora pubblicato online |

Non installati, pur citati in vecchie versioni dei documenti: shadcn/ui, Framer Motion, Zustand, React Hook Form, Zod. Elenco ufficiale allineato il 22 ottobre in `16_Tech_Stack.md`.

---

## 3. Architettura

### Routing

- `app/(site)/` è un route group con un layout condiviso (`app/(site)/layout.tsx`) che monta header, pannello laterale e componenti globali una sola volta. È stato introdotto il 31 agosto per eliminare il rimontaggio dell'header a ogni navigazione.
- Le pagine di accesso (`login`, `register`, `forgot-password`, `reset-password`, `onboarding`, `account`, `reactivate-account`) stanno fuori dal gruppo, senza header del sito.
- Ogni livello ha `error.tsx`, `not-found.tsx` e `loading.tsx`; `app/global-error.tsx` copre il caso in cui si rompe il layout radice.

### Lettura e scrittura dei dati

- **Lettura:** Server Components che interrogano Prisma direttamente tramite moduli di dominio in `lib/` (`lib/discovery/*` per ogni riga della Home, `lib/search/*`, `lib/profile/*`, `lib/dashboard/*`).
- **Scrittura:** Server Actions (`"use server"`) raggruppate per dominio in `lib/actions/` (journey, chapter, episode, follow, message, update, report, settings, communityListing...). Nessuna API REST interna per le mutazioni.
- **Route Handler** solo dove serve HTTP vero: auth, streaming delle due chat AI (`api/ai/assistant`, `api/community-ai/chat`), generazione immagini, tre cron, webhook di Cloudflare Stream.

### Punteggi calcolati in modo pigro

Journey Score (`lib/scoring/journeyScore.ts`) e Trust Score (`lib/profile/trustScore.ts`) non hanno un job in background: vengono ricalcolati alla prima lettura dopo la scadenza (`ensureFreshJourneyScores`). Per le righe più lente della Home esiste una variante (`computeFreshJourneyScores`) che usa il valore in memoria e salva in background. Stesso schema per `WildcardPick` (scelta casuale stabile 24 ore, ricalcolata alla prima lettura dopo la scadenza).

### Media

- Upload diretto dal browser a R2 con URL prefirmati; il server non riceve i file.
- Foto compresse nel browser prima dell'upload (`lib/compressImage.ts`, limite 8MB); i video restano originali, scelta dichiarata pubblicamente.
- Copertina proposta estraendo un fotogramma nel browser (`lib/media/captureVideoFrame.ts`), durata letta prima dell'upload (`readVideoDuration.ts`) per il tetto di 10 minuti.
- Dopo la pubblicazione, l'episodio viene inviato a Cloudflare Stream; il webhook (`api/webhooks/stream`) segna la copia leggera come pronta, il cron `sync-light-videos` recupera gli avvisi persi. Il player usa HLS se pronto, altrimenti l'originale.

### AI

- `lib/ai/gemini.ts` centralizza modelli, modello di riserva e chiamate.
- Chat Community: conversazione libera in streaming più una seconda chiamata non visibile che estrae una bozza strutturata (Workshop, Event, DigitalProduct, PersonalService). Nessuna azione verso altri utenti senza conferma del journeyer.
- Ember (`lib/ai/siteAssistant.ts`): assistente del sito, contesto costruito leggendo le stesse costanti che le pagine mostrano; limite messaggi per IP in memoria (`assistantRateLimit.ts`).
- Moderazione di testi e immagini su Gemini (`lib/moderation.ts`).
- Mappa dei Momenti (`lib/ai/episodeMoments.ts`, modello `EpisodeMoment`): analisi video, embedding, ricerca per senso (`lib/search/searchEpisodeMoments.ts`) e Percorso su Misura (`lib/search/composeCustomPath.ts`, l'AI sceglie e ordina momenti esistenti, non genera testo).

### Interruttori

| Variabile | Stato | Cosa accende |
|---|---|---|
| `MOMENTS_LIBRARY_ENABLED` | spento | Analisi AI degli episodi, ricerca per senso, `/custom-path`. La stellina manuale dei momenti funziona comunque |
| `GEMINI_IMAGE_GENERATION_ENABLED` | spento | Immagini AI nella chat Community (max 5 al giorno per journeyer) |
| `CLOUDFLARE_STREAM_API_TOKEN` | acceso dal 9 ottobre | Copie leggere dei video |
| `ADMIN_EMAILS` | configurato | Elenco degli indirizzi con accesso a `/admin/reports` |

### Cron (`vercel.json`)

| Percorso | Orario | Compito |
|---|---|---|
| `/api/cron/purge-accounts` | 03:00 | Cancella gli account dopo i 10 giorni di grazia |
| `/api/cron/creator-lifecycle` | 03:30 | Avvisi di inattività a 6, 9, 10 mesi, chiusura modalità journeyer, purge dopo 30 giorni |
| `/api/cron/sync-light-videos` | 04:00 | Recupero stato delle copie leggere Stream |

### Design system e lucchetto

- Componenti ufficiali in `components/ui/` (`button`, `heading`, `panel`, `input`, `page-container`, `cover-card`, `avatar`, `chat`, `dialog`, `skeleton`, ecc.), regole in `docs/15_Design_System.md` e `docs/21_Motion_Guidelines.md`.
- `scripts/check-design.mjs` analizza `app/`, `components/` e i testi in `lib/` e blocca colori fuori token, misure fuori scala, bottoni/titoli/riquadri disegnati a mano, curve di easing non approvate, `animate-bounce`/`animate-ping` (unica eccezione: `AiMascotButton.tsx`), trattini lunghi nei testi.
- Gira come hook di pre-commit (`.githooks/pre-commit`, attivo con `core.hooksPath`).
- Tema chiaro e scuro in due blocchi CSS separati; preferenza salvata sull'utente (enum `Theme`).

---

## 4. Cronologia tecnica

| Periodo | Fase | Interventi tecnici principali |
|---|---|---|
| 14 a 22 luglio | Fondamenta | Next.js + Tailwind, regole AI, schema Prisma iniziale, Better Auth con Neon, CRUD Journey/Capitoli/Episodi, UI in inglese |
| 23 luglio a 3 agosto | Discovery v1 | Pagina pubblica Journey, `/creator` rinominato `/dashboard`, publish/unpublish, dnd-kit, Follow, categorie, `publishedAt`, Recommended, Feed, ricerca, Updates con scadenza 24h, onboarding interessi, upload video su R2 e player |
| 7 a 12 agosto | Algoritmo e social | Progressi per episodio con ripresa esatta, Trust Score + Journey Score + Discovery Phase (v3.2), notifiche interne, Updates ricchi (sondaggi, domande, reazioni), Follow persona-persona, messaggistica |
| 12 a 20 agosto | Redesign su riferimento Lovable | Palette, header unico, player unificato, profilo, dashboard con drag & drop tra capitoli |
| 21 a 31 agosto | Rifiniture | Cancellazione account con grazia di 10 giorni (primo cron), delete reali con conferma, pulsante Back globale con stack di navigazione, layout condiviso `(site)`, pagine Journeys/Journeyers |
| 1 a 13 settembre | Esperienza | Fix di invalidazione cache dopo Follow e lettura messaggi, ricerca per parola, scala globale ridotta, upload in due click con fotogramma di copertina, `FadeImage`, Hero con dati reali, Cloudflare Stream (spento), card poster con Journey Score, `WildcardPick` |
| 17 a 24 settembre | Allineamento | Soglia di 100 Journey prima del ranking reale, filtri di ricerca, compressione foto, segnalazioni, data di nascita (16+), accettazione Linee guida, video di presentazione, Trust Score rivisto, Trusty al posto del Like |
| 25 a 29 settembre | Community AI (Punto 8) | Modelli Workshop/Event/DigitalProduct/PersonalService, chat Gemini in streaming con estrazione bozza separata, immagini AI (spente), allegati, moderazione su Gemini |
| 29 settembre a 1 ottobre | Design system | Inventario automatico (162 file, 2.374 elementi), kit `components/ui/`, migrazione di tutto il sito, `check-design.mjs` + pre-commit, blocco utenti e account privato |
| 2 a 5 ottobre | Community e governance | Forum per Journey, `EpisodeMoment`, toggle Sponsored, pannello `/admin/reports`, modalità Journeyer esplicita con ciclo di inattività (cron), Tips tramite link esterno |
| 7 a 10 ottobre | Movimento e performance | Regola di movimento, Hero video, sabbia three.js, Ember, tetto 10 minuti con Stream acceso, skeleton con ritardo 250ms, riduzione round trip DB, pagine errore/404, ricerca per senso, Percorso su Misura |
| 11 a 13 ottobre | Temi e consolidamento | Tema chiaro/scuro, lucchetto rinforzato (zero eccezioni), Trust Score v3 (peso pieno a 100 spettatori distinti), Journey finiti, autoplay "Up next", trailer Hero e stellina momenti, card animata in SVG |
| 14 a 19 ottobre | Identità | Rinomina Creator in Journeyer nei testi (35 file, il codice mantiene `Creator`), logo vettoriale generato da `scripts/logo/`, favicon e apple-icon |
| 18 a 20 ottobre | Mobile, fase di prototipo | Prototipo cliccabile esterno al repo e inventario completo delle funzioni da computer; nessuna modifica al codice |

---

## 5. Problemi tecnici incontrati

| Problema | Causa | Soluzione |
|---|---|---|
| Sfumatura CSS scritta ma assente nel browser | `color-mix()` con variabile CSS scartato in silenzio dalla pipeline di build | Valori scritti in modo diretto; verificare sempre il CSS servito, non solo il sorgente |
| `quality` di `next/image` ignorata | Next 16 accetta solo le qualità elencate in `images.qualities` di `next.config` | Lista esplicita in configurazione |
| Client Prisma vecchio dopo una migrazione | Cache di Turbopack in `.next` sopravvissuta al riavvio | Cancellare `.next` dopo `prisma generate` se lo schema cambia |
| Login respinto con password corretta | Server di sviluppo rimasto acceso per giorni, 404 anche su `/api/auth` | Riavvio; un errore di auth non sempre è un problema di auth |
| Pulsante Message e pallino non letti non aggiornati | Mutazioni corrette ma pagina non invalidata | Aggiornamento esplicito della pagina dopo l'azione |
| Header che "scattava" a ogni pagina | Header montato da ogni pagina | Spostato nel layout del route group |
| Pulsante Back visibile in Home | Stack di navigazione che gestiva solo un passo indietro | Stack azzerato a ogni ingresso reale e gestione dei salti |
| Bozze AI promesse ma non create (6 su 7) | Campo bozza facoltativo: Gemini lo mandava incompleto e veniva scartato | Bozza obbligatoria e completa, poi conversazione e estrazione separate in due chiamate |
| Chat AI percepita lenta (13 a 17 s) | Risposta e bozza restituite insieme a fine elaborazione | Streaming del testo, bozza estratta dopo: prime parole in circa 2 s |
| API Gemini diversa dal previsto | Introduzione della Interactions API | Chiamata di prova reale prima di scrivere codice |
| Upload a Gemini in timeout su file da 459MB | Invio non a blocchi | Upload a blocchi |
| Campo embedding diverso dalla documentazione di terzi | Fonte secondaria inesatta | Verifica diretta sull'API |
| Home lenta (fino a 3 s) | Circa 15 query sequenziali verso Neon a Francoforte, alcune per rileggere un dato appena scritto | Punteggi usati in memoria, scrittura in background, query indipendenti in parallelo |
| Lampo grigio a ogni navigazione | Lo skeleton sostituiva la pagina precedente anche nei caricamenti rapidi | Skeleton visibile solo oltre 250ms, con dissolvenza |
| Autoplay del prossimo episodio non partiva in sviluppo | Doppio effetto di React StrictMode ricaricava la sorgente | Avvio quando il video è pronto, segnale cancellato solo a partenza avvenuta |
| Regressioni del tema scuro dopo lavori sul chiaro | Regole dei due temi mescolate | Blocchi CSS separati e verifica di entrambi i temi a ogni modifica |
| Screenshot automatici incompleti | Animazioni legate allo scroll e drag di dnd-kit annullato dal resize | Scroll reale prima dello screenshot; mai screenshot a pagina intera durante un drag |

---

## 6. Peso delle pagine

Misura dell'8 ottobre: una pagina normale scarica circa 0,9 a 1,1MB di JavaScript. Le librerie pesanti sono caricate solo dove servono: three.js (circa 470KB) solo da computer e solo sulle pagine con la sabbia, hls.js (circa 570KB) solo nel player, GSAP (circa 110KB) solo su Home e pagine vetrina.

---

## 7. Debito tecnico e punti aperti

- **Nessun test automatico.** La qualità è garantita da TypeScript, ESLint, `check-design.mjs` e verifica visiva manuale. Prima di avere utenti veri servirebbero almeno test sui flussi critici (registrazione, pubblicazione, cancellazione account, cron).
- **Nomi nel codice:** dopo la rinomina, l'interfaccia dice "Journeyer" ma modelli, cartelle e azioni usano ancora `Creator` (`Creator`, `CreatorStatus`, `app/(site)/creator`, `lib/creator.ts`).
- **Card duplicate:** il Profilo usa un componente card diverso da quello del resto del sito; da unificare.
- **Video della Hero** scelti con ID fissi nel codice (S27), da rendere automatici prima del lancio.
- **Ripresa video dopo il completamento:** annotato a metà settembre che un episodio già completato riparte sempre dall'inizio; da verificare se ancora vero.
- **Rate limit di Ember in memoria:** non condiviso tra istanze serverless; sufficiente oggi, non in produzione con traffico reale.
- **Cartelle residue:** in `app/` esistono cartelle vuote, non tracciate da git, con gli stessi nomi di pagine dentro `app/(site)/` (es. `journeys`, `search`); residui da rimuovere.
- **Documentazione:** `17_Project_Architecture.md` resta generico; i dettagli architetturali reali sono in questo documento.
- **Deploy:** il sito non è ancora online, il dominio `zerojourneys.com` è registrato su Cloudflare ma non collegato.
- **Mobile:** layout responsive esistente ma non progettato pagina per pagina; il lavoro è in fase di prototipo.
