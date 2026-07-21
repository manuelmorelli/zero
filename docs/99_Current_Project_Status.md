---
title: Current Project Status
doc_id: 99-current-project-status
version: "1.1"
status: living
related_docs:
  - 12_MVP_Features
  - 11_Database_Architecture
  - 17_Project_Architecture
---

# Current Project Status

Documento principale da cui ripartire all'inizio di ogni nuova sessione di lavoro (umana o AI). Sostituisce la necessità di rileggere l'intero progetto.

## Obiettivo del documento

Fotografia aggiornata di cosa è stato costruito, quali decisioni tecniche sono state prese e cosa manca. Va aggiornato ogni volta che si completa una funzionalità importante, così una nuova sessione di lavoro può ripartire senza dover rileggere tutto il progetto.

## Funzionalità completate

Verificate end-to-end su database reale (Neon) e coerenti visivamente con il design system del sito.

- **Autenticazione** — Better Auth, email+password, verifica email via Resend.
- **Diventa Creator** — un utente può creare un profilo Creator collegato 1:1 al proprio account.
- **Creazione Journey** — titolo, presentazione, categoria, tag. Regola applicata lato server: un solo Journey attivo (non archiviato) per creator alla volta.
- **Dashboard Creator** (`/creator`) — elenca i Journey del creator con badge di stato (Bozza / In scoperta / Pubblicato / Archiviato).
- **Pagina di dettaglio/gestione Journey** (`/creator/journeys/[id]`) — con controllo di proprietà (solo il creator che lo possiede può vederla/gestirla). Elenca i Capitoli e permette di aggiungerne di nuovi.
- **CRUD Capitoli ed Episodi** — pagina dedicata per capitolo (`/creator/journeys/[id]/chapters/[chapterId]`) con creazione, modifica ed eliminazione (soft delete) di Capitoli ed Episodi, ordine numerico assegnato automaticamente. Ogni Episodio ha una data reale (`occurredAt`) separata dall'ordine narrativo, coerente con la regola di `05_Journey.md` che tiene distinte le due informazioni.
- **Protezione rotte** — tutte le pagine sotto `/creator/*` richiedono login (gestito in `proxy.ts`).

## Decisioni tecniche chiave

- **Pattern feature**: ogni nuova funzionalità segue lo stesso schema — server action in `lib/actions/*.ts` con validazione Zod → redirect → form client con `useActionState`.
- **Accesso Creator**: `requireCreator()` (in `lib/creator.ts`) è il controllo unico e autoritativo per ogni pagina riservata ai creator; se il profilo non esiste reindirizza a `/creator/new`.
- **Stile**: input bordati (`border-border bg-surface`), bottoni pill (`rounded-full bg-ink text-bg`), badge di stato bordati, tag come chip `bg-surface-2`. Nessun colore arbitrario, solo i token semantici definiti in `app/globals.css`.
- **Testing**: niente Python disponibile sulla macchina di sviluppo → i test end-to-end usano Playwright via Node (installato con `--no-save`, disinstallato a fine test). I dati di test vengono creati/verificati/cancellati con script SQL diretto su Neon (`@neondatabase/serverless`) e non vengono mai lasciati nel database.
- **Form client con id univoci**: quando più istanze dello stesso form possono comparire insieme nella stessa pagina (es. form di modifica capitolo + form "aggiungi episodio"), gli `id` dei campi vanno generati con `useId()` di React invece di stringhe fisse, per evitare collisioni di `id` nel DOM (bug reale trovato e corretto in `ChapterForm.tsx`/`EpisodeForm.tsx`).

## Placeholder ancora da sostituire

Nessuno al momento.

## Note prima del rilascio pubblico

Cose note che vanno risolte prima che utenti reali usino il prodotto, ma non bloccano lo sviluppo in corso.

- **Mittente email non verificato**: le email (verifica account, reset password) partono da `onboarding@resend.dev`, l'indirizzo di test di Resend, non da un dominio verificato. Finché resta così, provider come Yahoo possono spostare le email nella cartella Spam invece di consegnarle in posta normale. Prima del rilascio pubblico serve collegare un dominio verificato su Resend e aggiornare l'indirizzo mittente in `lib/email.ts`.

## Roadmap

Tutti i lavori futuri, in ordine di priorità.

1. Pagina pubblica del Journey (presentazione + capitoli + episodi), visibile solo per i Journey pubblicati.
2. Drag & drop per riordinare liberamente Capitoli ed Episodi (oggi l'ordine è assegnato automaticamente in coda).
3. Verifica end-to-end finale su tutto il flusso Journey.

## Current Task

**Obiettivo corrente**: nessuna implementazione in corso al momento — l'ultimo lavoro di codice completato e verificato è il CRUD di Capitoli ed Episodi dentro un Journey (vedi "Funzionalità completate"). Il prossimo obiettivo, quando si riprende, è il punto 1 della Roadmap: la pagina pubblica del Journey.

**File da leggere prima di iniziare**:
- `app/creator/journeys/[id]/page.tsx` e `app/creator/journeys/[id]/chapters/[chapterId]/page.tsx` — pattern di riferimento per leggere Capitoli/Episodi da Prisma
- `lib/creator.ts` — helper `requireCreator()`, da NON usare per la pagina pubblica (nessun login richiesto per leggere un Journey pubblicato)
- `prisma/schema.prisma` — modello `Journey` (campo `status`) e relazioni con `Chapter`/`Episode`

**Piano di implementazione da proporre prima di scrivere codice**:
- Non scrivere codice subito: presentare prima un piano (route pubblica, cosa mostrare, come gestire i Journey non pubblicati) e attendere conferma.

**Vincoli da rispettare**:
- La pagina pubblica deve essere visibile solo se `journey.status === "PUBLISHED"` (altrimenti 404).
- Non introdurre breaking change né modificare file non collegati al task.

**Cosa deve essere aggiornato quando il task è completato**:
- Aggiornare questo documento (sezioni "Funzionalità completate", "Roadmap" e "Current Task").
- Aggiornare `00-project-context.md` solo se sono state prese decisioni architetturali o di prodotto importanti.
- Verifica end-to-end (Playwright + dati puliti su Neon) e controllo visivo prima di considerare il task chiuso.
- Commit con messaggio chiaro in stile `feat: ...`.

## Checklist di fine task

- [ ] Eseguire i test.
- [ ] Verificare che tutto funzioni (verifica end-to-end e controllo visivo).
- [ ] Aggiornare questo documento (`docs/99_Current_Project_Status.md`).
- [ ] Aggiornare `00_Project_Context.md` solo se sono state prese decisioni architetturali o di prodotto importanti.
