---
title: Current Project Status
doc_id: 99-current-project-status
version: "1.2"
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
- **CRUD Capitoli ed Episodi** — pagina dedicata per capitolo (`/creator/journeys/[id]/chapters/[chapterId]`) con creazione, modifica ed eliminazione (soft delete) di Capitoli ed Episodi, ordine numerico assegnato automaticamente. Ogni Episodio ha una data reale (`occurredAt`) separata dall'ordine narrativo, coerente con la regola di `05_Journey.md` che tiene distinte le due informazioni. Campi dell'Episodio: titolo, caption (opzionale, testo che accompagna il video), link video (soluzione provvisoria in attesa dell'upload diretto), data reale — nessun campo "descrizione" separato.
- **Protezione rotte** — tutte le pagine sotto `/creator/*` richiedono login (gestito in `proxy.ts`).
- **Interfaccia interamente in inglese** — landing page, autenticazione, dashboard creator, form e email transazionali sono tutti in inglese, coerenti fra loro (prima le pagine interne erano in italiano).
- **Pagina pubblica del Journey** (`/journeys/[id]`) — visibile a chiunque, senza login. Mostra Presentazione, Capitoli ed Episodi. Restituisce "non trovato" (404) se il Journey non esiste o non è nello stato "Pubblicato", senza eccezioni per il creator proprietario.
- **Area privata del creator rinominata da `/creator` a `/dashboard`** — decisione architetturale presa per liberare l'indirizzo `/creator/[id]` per la futura Creator Profile pubblica. Non cambia la logica, solo indirizzi e link interni (vedi "Decisioni tecniche chiave").
- **Link "View public page"** nella pagina di gestione del Journey in Dashboard, visibile solo quando lo stato è "Pubblicato": porta alla Pagina Journey pubblica corrispondente.

## Decisioni tecniche chiave

- **Pattern feature**: ogni nuova funzionalità segue lo stesso schema — server action in `lib/actions/*.ts` con validazione Zod → redirect → form client con `useActionState`.
- **Accesso Creator**: `requireCreator()` (in `lib/creator.ts`) è il controllo unico e autoritativo per ogni pagina riservata ai creator; se il profilo non esiste reindirizza a `/creator/new`.
- **Stile**: input bordati (`border-border bg-surface`), bottoni pill (`rounded-full bg-ink text-bg`), badge di stato bordati, tag come chip `bg-surface-2`. Nessun colore arbitrario, solo i token semantici definiti in `app/globals.css`.
- **Testing**: niente Python disponibile sulla macchina di sviluppo → i test end-to-end usano Playwright via Node (installato con `--no-save`, disinstallato a fine test). I dati di test vengono creati/verificati/cancellati con script SQL diretto su Neon (`@neondatabase/serverless`) e non vengono mai lasciati nel database.
- **Form client con id univoci**: quando più istanze dello stesso form possono comparire insieme nella stessa pagina (es. form di modifica capitolo + form "aggiungi episodio"), gli `id` dei campi vanno generati con `useId()` di React invece di stringhe fisse, per evitare collisioni di `id` nel DOM (bug reale trovato e corretto in `ChapterForm.tsx`/`EpisodeForm.tsx`).
- **Lingua dell'interfaccia**: inglese in tutto il prodotto (pagine, form, messaggi di errore, email transazionali). I commenti nel codice restano in italiano, non essendo testo rivolto all'utente. Decisione di prodotto permanente, registrata in `00-project-context.md` (sezione "Lingua del Prodotto").
- **Redirect dopo pubblicazione episodio**: dopo aver creato un episodio il creator viene reindirizzato alla pagina del Journey (non del capitolo), per avere un feedback visivo immediato (contatore episodi aggiornato). Comportamento temporaneo, in attesa della riprogettazione del flusso Creator Profile.
- **Campi Episodio**: titolo, caption (opzionale), video URL (etichettato esplicitamente come "temporary" in attesa dell'upload diretto dei video), data reale dell'evento. Nessun campo "descrizione" separato: rimosso perché ridondante con la caption.
- **Architettura del flusso Creator (decisione presa in questa sessione, vedi `13_User_Flows.md` e `14_UI_Pages.md`)**: Zero non tratta "creator" e "utente" come ruoli con destinazioni diverse — ogni persona atterra sulla stessa Home dopo il login, creator compreso. La Dashboard (`/dashboard`, ex `/creator`) non è più una destinazione di default: vi si accede tramite un link, solo se si ha un profilo Creator. Sono quattro pagine con ruoli distinti e non sovrapposti: Home (per tutti), Creator Profile pubblica (vetrina, non ancora costruita), Dashboard (privata, operativa), Pagina Journey pubblica (il contenuto). La Home reale (dati veri al posto di quelli finti) e la Creator Profile pubblica sono state deliberatamente rimandate a task successivi, per non anticipare decisioni che dipendono da Follow/Discovery/algoritmo (Home) o da Community/prodotti (Creator Profile).
- **Nessuna azione "Pubblica" nell'interfaccia**: lo stato di un Journey può oggi diventare "Pubblicato" solo scrivendo direttamente sul database. Non blocca lo sviluppo in corso, ma va risolto prima che un creator reale possa rendere visibile il proprio Journey (vedi "Note prima del rilascio pubblico").

## Placeholder ancora da sostituire

Nessuno al momento.

## Stato attuale dell'MVP

Confronto con le funzionalità definite in `12_MVP_Features.md`.

| Area MVP | Stato |
|---|---|
| Account (registrazione, accesso, recupero password) | ✅ Fatto |
| Account (gestione profilo) | 🟡 Parziale — `/account` mostra i dati, nessuna modifica |
| Journey (creazione, Capitoli, Episodi) | ✅ Fatto |
| Journey (modifica del Journey stesso) | ❌ Da fare — nessuna UI di modifica per titolo/presentazione/categoria/tag |
| Journey (struttura: riordino libero) | 🟡 Parziale — ordine automatico, drag & drop non ancora implementato |
| Esplorazione (homepage) | 🟡 Parziale — landing con dati statici/finti, non reali (rimandato di proposito, vedi "Decisioni tecniche chiave") |
| Esplorazione (pagina Journey pubblica) | ✅ Fatto |
| Esplorazione (pagina creator, ricerca, scoperta) | ❌ Da fare — **prossimo task consigliato** |
| Community (seguire creator, Community Premium) | ❌ Da fare |
| Updates | ❌ Da fare |
| Dashboard Creator (Updates, analisi base, Community Premium) | ❌ Da fare |

In sintesi: il percorso di creazione lato Creator (Journey → Capitoli → Episodi) è completo e verificato end-to-end. La Pagina Journey pubblica esiste ed è verificata. Manca ancora la Creator Profile pubblica (la vetrina del creator) e un'azione reale per pubblicare un Journey dall'interfaccia (oggi possibile solo scrivendo sul database).

## Note prima del rilascio pubblico

Cose note che vanno risolte prima che utenti reali usino il prodotto, ma non bloccano lo sviluppo in corso.

- **Mittente email non verificato**: le email (verifica account, reset password) partono da `onboarding@resend.dev`, l'indirizzo di test di Resend, non da un dominio verificato. Finché resta così, provider come Yahoo possono spostare le email nella cartella Spam invece di consegnarle in posta normale. Prima del rilascio pubblico serve collegare un dominio verificato su Resend e aggiornare l'indirizzo mittente in `lib/email.ts`.
- **Nessuna azione "Pubblica" nell'interfaccia**: un Journey può passare a stato "Pubblicato" solo scrivendo direttamente sul database. Prima del rilascio pubblico serve un modo, per il creator, di pubblicare il proprio Journey dall'interfaccia (e presumibilmente di tornare in bozza).

## Roadmap

Tutti i lavori futuri, in ordine di priorità.

1. Creator Profile pubblica (`/creator/[id]` o simile) — versione minima: nome, descrizione, elenco dei Journey pubblicati del creator, ognuno che porta alla Pagina Journey pubblica. Community/prodotti/workshop restano fuori finché quelle funzionalità non esistono.
2. Azione "Pubblica" nell'interfaccia — oggi lo stato PUBLISHED è raggiungibile solo via database.
3. Drag & drop per riordinare liberamente Capitoli ed Episodi (oggi l'ordine è assegnato automaticamente in coda).
4. Home reale (Continue Your Journey, Recommended, Follow, algoritmo di scoperta) — da progettare insieme quando si affronteranno Discovery/Follow, non prima.
5. Verifica end-to-end finale su tutto il flusso Journey.

## Current Task

**Obiettivo corrente**: nessuna implementazione in corso al momento. L'ultima sessione ha innanzitutto ridiscusso l'architettura del flusso Creator (vedi "Decisioni tecniche chiave"), poi ha: rinominato l'area privata da `/creator` a `/dashboard`, costruito la Pagina Journey pubblica (`/journeys/[id]`), e aggiunto il link "View public page" nella Dashboard. La Home reale e la Creator Profile pubblica sono state deliberatamente rimandate (vedi Roadmap).

Il prossimo obiettivo consigliato è il punto 1 della Roadmap: la Creator Profile pubblica, in versione minima (nome, descrizione, elenco Journey pubblicati → link alla Pagina Journey). Prima o contestualmente sarebbe utile anche il punto 2 (azione "Pubblica" nell'interfaccia), perché oggi non c'è modo per un creator reale di pubblicare un Journey senza intervento diretto sul database.

**File da leggere prima di iniziare**:
- `app/journeys/[id]/page.tsx` — pattern di riferimento per una pagina pubblica (nessun `requireCreator()`, 404 se non pubblicato)
- `app/dashboard/page.tsx` e `app/dashboard/journeys/[id]/page.tsx` — dati Creator/Journey già disponibili lato Dashboard
- `lib/creator.ts` — helper `requireCreator()`, da NON usare per pagine pubbliche
- `prisma/schema.prisma` — modelli `Creator` e `Journey` (campo `status`)

**Piano di implementazione da proporre prima di scrivere codice**:
- Non scrivere codice subito: presentare prima un piano (indirizzo della pagina, dato che `username` su `User` è opzionale e non ancora impostabile da UI — probabile uso dell'id nel frattempo) e attendere conferma.

**Vincoli da rispettare**:
- La Creator Profile pubblica deve mostrare solo i Journey con `status === "PUBLISHED"` del creator.
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
