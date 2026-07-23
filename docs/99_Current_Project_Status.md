---
title: Current Project Status
doc_id: 99-current-project-status
version: "1.7"
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
- **Diventa Creator** — un utente può creare un profilo Creator collegato 1:1 al proprio account, cioè può iniziare a pubblicare un proprio Journey.
- **Creazione Journey** — titolo, presentazione, categoria, tag. Regola applicata lato server: un solo Journey attivo (non archiviato) per creator alla volta.
- **Dashboard** (`/dashboard`) — elenca i Journey del creator con badge di stato (Bozza / In scoperta / Pubblicato / Archiviato).
- **Pagina di dettaglio/gestione Journey** (`/dashboard/journeys/[id]`) — con controllo di proprietà (solo il creator che lo possiede può vederla/gestirla). Elenca i Capitoli e permette di aggiungerne di nuovi.
- **CRUD Capitoli ed Episodi** — pagina dedicata per capitolo (`/dashboard/journeys/[id]/chapters/[chapterId]`) con creazione, modifica ed eliminazione (soft delete) di Capitoli ed Episodi, ordine numerico assegnato automaticamente. Ogni Episodio ha una data reale (`occurredAt`) separata dall'ordine narrativo, coerente con la regola di `05_Journey.md` che tiene distinte le due informazioni. Campi dell'Episodio: titolo, caption (opzionale, testo che accompagna il video), link video (soluzione provvisoria in attesa dell'upload diretto), data reale — nessun campo "descrizione" separato.
- **Protezione rotte** — tutte le pagine sotto `/dashboard/*` richiedono login (gestito in `proxy.ts`).
- **Interfaccia interamente in inglese** — landing page, autenticazione, dashboard creator, form e email transazionali sono tutti in inglese, coerenti fra loro (prima le pagine interne erano in italiano).
- **Pagina pubblica del Journey** (`/journeys/[id]`) — visibile a chiunque, senza login. Mostra Presentazione, Capitoli ed Episodi. Restituisce "non trovato" (404) se il Journey non esiste o non è nello stato "Pubblicato", senza eccezioni per il creator proprietario.
- **Area privata rinominata da `/creator` a `/dashboard`** — decisione architetturale presa per liberare l'indirizzo `/creator/[id]` per il futuro Profilo pubblico. Non cambia la logica, solo indirizzi e link interni (vedi "Decisioni tecniche chiave").
- **Link "View public page"** nella pagina di gestione del Journey in Dashboard, visibile solo quando lo stato è "Pubblicato": porta alla Pagina Journey pubblica corrispondente.
- **Publish / Unpublish del Journey** — azione lato server per passare un Journey da Bozza a Pubblicato e viceversa, direttamente dalla Dashboard (nessun intervento sul database necessario). La pubblicazione è respinta con un errore chiaro se mancano i requisiti: una Presentazione (descrizione non vuota) e almeno un Episodio, coerentemente con la struttura ufficiale del Journey (`05_Journey.md`) e con l'ordine dei passaggi descritto in `13_User_Flows.md` ("Creazione di un Journey"). Il ritorno a Bozza è sempre permesso senza requisiti aggiuntivi.
- **Modifica di un Journey esistente** — titolo, presentazione, categoria e tag sono ora modificabili dopo la creazione, in qualunque stato (Bozza, Pubblicato, ecc.), dalla stessa pagina di gestione in Dashboard. Riutilizza `JourneyForm.tsx` sia per creare sia per modificare (stesso pattern di `ChapterForm.tsx`/`EpisodeForm.tsx`) e lo schema di validazione già esistente (`JourneySchema`, `parseTags`). Svuotare la Presentazione di un Journey già Pubblicato non lo riporta automaticamente in Bozza: se in seguito viene rimesso in Bozza e si tenta di ripubblicarlo, l'azione di pubblicazione richiederà di nuovo una Presentazione, come verificato end-to-end in questa sessione.
- **Riordino di Capitoli ed Episodi (solo business logic, niente drag & drop)** — `moveChapterUp`/`moveChapterDown` in `lib/actions/chapter.ts` e `moveEpisodeUp`/`moveEpisodeDown` in `lib/actions/episode.ts`: scambiano il campo `order` con il vicino immediato (sopra o sotto), riutilizzando `requireOwnedChapter`/`requireOwnedEpisode` già esistenti. Attivabili in Dashboard con due semplici pulsanti ↑/↓ per riga (Capitoli sulla pagina del Journey, Episodi sulla pagina del Capitolo), disabilitati ai due estremi della lista. Nessuna UI di drag & drop: resta un task separato in Roadmap.
- **Profilo pubblico (versione minima)** — `app/profile/[username]/page.tsx`, visibile a chiunque senza login. Mostra nome, bio (se presente) ed elenco dei Journey con `status === "PUBLISHED"` della persona, ognuno che porta alla Pagina Journey pubblica. Se la persona non ha pubblicato nulla, mostra un messaggio invece di una lista vuota. "Non trovato" (404) se l'utente non esiste, stesso pattern della Pagina Journey pubblica. Link "View public profile" aggiunto in Dashboard (`app/dashboard/page.tsx`) per renderlo raggiungibile.

## Decisioni tecniche chiave

- **Pattern feature**: ogni nuova funzionalità segue lo stesso schema — server action in `lib/actions/*.ts` con validazione Zod → redirect → form client con `useActionState`.
- **Accesso Creator**: `requireCreator()` (in `lib/creator.ts`) è il controllo unico e autoritativo per ogni pagina riservata ai creator; se il profilo non esiste reindirizza a `/dashboard/new`.
- **Stile**: input bordati (`border-border bg-surface`), bottoni pill (`rounded-full bg-ink text-bg`), badge di stato bordati, tag come chip `bg-surface-2`. Nessun colore arbitrario, solo i token semantici definiti in `app/globals.css`.
- **Testing**: niente Python disponibile sulla macchina di sviluppo → i test end-to-end usano Playwright via Node (installato con `--no-save`, disinstallato a fine test). I dati di test vengono creati/verificati/cancellati con script SQL diretto su Neon (`@neondatabase/serverless`) e non vengono mai lasciati nel database.
- **Form client con id univoci**: quando più istanze dello stesso form possono comparire insieme nella stessa pagina (es. form di modifica capitolo + form "aggiungi episodio"), gli `id` dei campi vanno generati con `useId()` di React invece di stringhe fisse, per evitare collisioni di `id` nel DOM (bug reale trovato e corretto in `ChapterForm.tsx`/`EpisodeForm.tsx`).
- **Lingua dell'interfaccia**: inglese in tutto il prodotto (pagine, form, messaggi di errore, email transazionali). I commenti nel codice restano in italiano, non essendo testo rivolto all'utente. Decisione di prodotto permanente, registrata in `00-project-context.md` (sezione "Lingua del Prodotto").
- **Redirect dopo pubblicazione episodio**: dopo aver creato un episodio il creator viene reindirizzato alla pagina del Journey (non del capitolo), per avere un feedback visivo immediato (contatore episodi aggiornato). Comportamento temporaneo, in attesa della riprogettazione del flusso di gestione Journey.
- **Campi Episodio**: titolo, caption (opzionale), video URL (etichettato esplicitamente come "temporary" in attesa dell'upload diretto dei video), data reale dell'evento. Nessun campo "descrizione" separato: rimosso perché ridondante con la caption.
- **Architettura del flusso Creator (decisione presa in una sessione precedente, vedi `13_User_Flows.md` e `14_UI_Pages.md`)**: Zero non tratta "creator" e "utente" come ruoli con destinazioni diverse — ogni persona atterra sulla stessa Home dopo il login, creator compreso. La Dashboard (`/dashboard`, ex `/creator`) non è più una destinazione di default: vi si accede tramite un link, solo se si è pubblicato (o si sta per pubblicare) un Journey. Sono quattro pagine con ruoli distinti e non sovrapposti: Home (per tutti), Profilo pubblico (vetrina, non ancora costruito), Dashboard (privata, operativa), Pagina Journey pubblica (il contenuto). La Home reale (dati veri al posto di quelli finti) e il Profilo pubblico sono stati deliberatamente rimandati a task successivi, per non anticipare decisioni che dipendono da Follow/Discovery/algoritmo (Home) o da Community/prodotti (Profilo).
- **"Creator" non è una categoria di utenti separata (decisione permanente, vedi `00-project-context.md`, sezione "Modello utente unico")**: è lo stato di un utente che ha pubblicato un Journey, non un ruolo con un proprio account o proprie pagine dedicate. Di conseguenza non esisterà una "Creator Profile" distinta da un "profilo utente": esiste un solo Profilo per persona, che mostra i Journey pubblicati se presenti. Riferimenti già corretti in questa sessione: `07_Creator_Experience.md`, `12_MVP_Features.md`, `13_User_Flows.md`, `14_UI_Pages.md` (sezione "Pagina Creator" rinominata in "Profilo").
- **Requisiti di pubblicazione (decisione presa in una sessione precedente)**: un Journey può passare a "Pubblicato" solo se ha una Presentazione (campo `description` non vuoto) e almeno un Episodio non eliminato in uno dei suoi Capitoli non eliminati. Non è richiesto che ogni singolo Capitolo abbia un Episodio, né un numero minimo di Capitoli: basta che la struttura non sia vuota. Regola derivata direttamente da `05_Journey.md` (Presentazione, Capitoli, Episodi come struttura ufficiale) e dall'ordine dei passaggi in `13_User_Flows.md`, non inventata. Il campo `DISCOVERY` di `JourneyStatus` resta non gestito da questa azione (nessuna regola di business è mai stata definita per quello stato in nessun documento): l'azione lavora solo sulla transizione DRAFT ↔ PUBLISHED.
- **`undefined` vs `null` negli update Prisma (bug potenziale evitato in una sessione precedente)**: in una `create` Prisma, un campo opzionale assente (`undefined`) diventa `NULL` per default. In una `update`, invece, `undefined` significa "non toccare questo campo" — se un form permette di svuotare un campo opzionale (es. la Presentazione di un Journey), l'azione di update deve convertire esplicitamente il valore assente in `null` (`parsed.data.description ?? null`), altrimenti il vecchio valore resterebbe silenziosamente invariato. Rilevante per qualunque futura azione di "update" su un campo opzionale.
- **Riordino per scambio, non per lista completa**: la scelta implementativa per il riordino è stata "sposta questo elemento di una posizione" (scambia `order` con il vicino), non "invia il nuovo ordine di tutta la lista". Più semplice, sufficiente per due pulsanti ↑/↓, e riutilizzabile in futuro anche da un'eventuale UI drag & drop (che dovrebbe comunque poter chiamare gli stessi due elementi scambiati, non necessariamente riscrivere la logica).
- **Indirizzo del Profilo pubblico e fallback sull'id (decisione presa in questa sessione)**: la rotta è `/profile/[username]`, ma poiché `User.username` è opzionale e non ancora impostabile da nessuna interfaccia, la pagina cerca prima un utente con quello username e, se non lo trova, prova a interpretare lo stesso valore come id (`findUserByUsernameOrId` in `app/profile/[username]/page.tsx`). Oggi tutti i link generati dal prodotto (es. il link "View public profile" in Dashboard) usano l'id. Nessuna nuova regola di business né modifica allo schema: quando in futuro gli username saranno impostabili da UI, i link potranno passare a usarli senza toccare la pagina.
- **Playwright + transizioni client-side di Next.js (nota per i test futuri)**: dopo un click su un `<Link>` o su un form con Server Action che fa `redirect()`, `page.waitForLoadState("networkidle")` può risolversi prima che la navigazione lato client sia effettivamente completata (visto in questa sessione: un click su un capitolo restava sulla stessa pagina per ~1 secondo prima di navigare). Per verifiche affidabili: usare `page.waitForURL(...)` dopo un click che deve cambiare pagina, e interrogare il database con un piccolo retry/poll invece di fidarsi del solo stato del DOM subito dopo un'azione.

## Placeholder ancora da sostituire

Nessuno al momento.

## Stato attuale dell'MVP

Confronto con le funzionalità definite in `12_MVP_Features.md`.

| Area MVP | Stato |
|---|---|
| Account (registrazione, accesso, recupero password) | ✅ Fatto |
| Account (gestione profilo) | 🟡 Parziale — `/account` mostra i dati, nessuna modifica |
| Journey (creazione, Capitoli, Episodi) | ✅ Fatto |
| Journey (modifica del Journey stesso) | ✅ Fatto |
| Journey (struttura: riordino libero) | 🟡 Parziale — business logic pronta (pulsanti ↑/↓ in Dashboard), drag & drop non ancora implementato |
| Esplorazione (homepage) | 🟡 Parziale — landing con dati statici/finti, non reali (rimandato di proposito, vedi "Decisioni tecniche chiave") |
| Esplorazione (pagina Journey pubblica) | ✅ Fatto |
| Esplorazione (profilo pubblico, ricerca, scoperta) | 🟡 Parziale — profilo pubblico minimo fatto (nome, bio, Journey pubblicati); ricerca e scoperta ancora da fare |
| Community (seguire creator, Community Premium) | ❌ Da fare |
| Updates | ❌ Da fare |
| Dashboard (Updates, analisi base, Community Premium) | ❌ Da fare |

In sintesi: il percorso di creazione e gestione lato Creator (Journey → Capitoli → Episodi, con modifica, Publish/Unpublish e riordino) è completo e verificato end-to-end, senza alcun intervento necessario sul database. Il Profilo pubblico esiste ora in versione minima (nome, bio, Journey pubblicati). Manca ancora l'interazione drag & drop vera e propria (oggi il riordino funziona con due pulsanti ↑/↓), la ricerca/scoperta e tutto ciò che dipende da Follow/Community.

## Note prima del rilascio pubblico

Cose note che vanno risolte prima che utenti reali usino il prodotto, ma non bloccano lo sviluppo in corso.

- **Mittente email non verificato**: le email (verifica account, reset password) partono da `onboarding@resend.dev`, l'indirizzo di test di Resend, non da un dominio verificato. Finché resta così, provider come Yahoo possono spostare le email nella cartella Spam invece di consegnarle in posta normale. Prima del rilascio pubblico serve collegare un dominio verificato su Resend e aggiornare l'indirizzo mittente in `lib/email.ts`.

## Roadmap

Tutti i lavori futuri, in ordine di priorità.

1. Interazione drag & drop per Capitoli ed Episodi — la business logic di riordino esiste già (`moveChapterUp`/`moveChapterDown`/`moveEpisodeUp`/`moveEpisodeDown`); resta da costruire l'interazione di trascinamento vera e propria al posto dei due pulsanti ↑/↓ attuali.
2. Home reale (Continue Your Journey, Recommended, Follow, algoritmo di scoperta) — da progettare insieme quando si affronteranno Discovery/Follow, non prima.
3. Verifica end-to-end finale su tutto il flusso Journey.

## Current Task

**Obiettivo corrente**: nessuna implementazione in corso al momento. Questa sessione ha implementato il Profilo pubblico in versione minima: `app/profile/[username]/page.tsx` (pagina pubblica, nessun `requireCreator()`, 404 se l'utente non esiste), mostra nome, bio ed elenco dei Journey `PUBLISHED` della persona, e un link "View public profile" in `app/dashboard/page.tsx`. Poiché `User.username` non è ancora impostabile da UI, la pagina accetta anche l'id come fallback (vedi "Decisioni tecniche chiave"). Verificato end-to-end con Playwright su dati reali (Neon): persona con Journey pubblicato, persona senza Journey pubblicati, id inesistente (404); dati di test creati e rimossi, nessuna traccia lasciata nel database. Sessioni precedenti avevano implementato: riordino di Capitoli/Episodi (business logic + pulsanti ↑/↓), modifica completa del Journey, Publish/Unpublish, rinominato l'area privata da `/creator` a `/dashboard`, costruito la Pagina Journey pubblica (`/journeys/[id]`), e chiarito la decisione permanente "Creator non è una categoria di utenti separata" (vedi `00-project-context.md`, sezione "Modello utente unico"). La Home reale, la ricerca/scoperta e l'interazione drag & drop restano rimandate (vedi Roadmap).

Il prossimo obiettivo consigliato è il punto 1 della Roadmap: l'interazione drag & drop vera e propria per Capitoli ed Episodi, al posto degli attuali pulsanti ↑/↓ (la business logic di riordino esiste già).

**File da leggere prima di iniziare**:
- `lib/actions/chapter.ts` e `lib/actions/episode.ts` — `moveChapterUp`/`moveChapterDown`/`moveEpisodeUp`/`moveEpisodeDown`, la business logic di riordino già pronta e da riutilizzare
- `app/dashboard/journeys/[id]/page.tsx` e `components/creator/EpisodeItem.tsx` — dove oggi vivono i pulsanti ↑/↓ da sostituire con il trascinamento

**Piano di implementazione da proporre prima di scrivere codice**:
- Non scrivere codice subito: presentare prima un piano (libreria di drag & drop da usare, se introdurne una nuova) e attendere conferma.

**Vincoli da rispettare**:
- Riutilizzare `moveChapterUp`/`moveChapterDown`/`moveEpisodeUp`/`moveEpisodeDown` esistenti invece di riscrivere la logica di riordino.
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
