---
title: Database Architecture
doc_id: 11-database-architecture
version: "3.7"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 05_Journey
  - 12_MVP_Features
  - 16_Tech_Stack
  - 17_Project_Architecture
---

# Database Architecture

## Obiettivo

Definire i principi che guidano la progettazione del database di Zero.

Il database deve essere scalabile, coerente e sufficientemente flessibile da supportare l'evoluzione della piattaforma.

## Dichiarazione

L'architettura dati di Zero è progettata attorno al Journey.

Ogni entità del sistema deve contribuire a rappresentare in modo chiaro le relazioni tra utenti, Journey, contenuti, community e strumenti della piattaforma.

La struttura del database deve privilegiare semplicità, integrità dei dati e facilità di manutenzione.

## Principi

### Modello relazionale

Il database utilizza un modello relazionale basato su PostgreSQL.

Le relazioni tra le entità devono essere esplicite e mantenere l'integrità referenziale.

---

### Journey-Centric

Il Journey rappresenta l'entità principale.

Capitoli, Episodi e gli altri elementi del sistema devono essere collegati in modo coerente al Journey.

---

### Normalizzazione

Le informazioni devono essere organizzate evitando duplicazioni non necessarie.

La struttura deve favorire consistenza e facilità di aggiornamento.

---

### Scalabilità

L'architettura deve supportare una crescita significativa del numero di utenti, Journey e contenuti senza richiedere modifiche sostanziali al modello dati.

## Entità principali

Il database comprende, tra le altre, le seguenti entità:

- User
- Profile
- Journey
- Chapter
- Episode
- Update
- Follow
- Like
- Community
- Subscription
- Notification
- Product
- Workshop
- Event
- Transaction
- Media Asset

L'elenco potrà evolvere mantenendo i principi definiti in questo documento.

## Relazioni

Le relazioni tra le entità devono:

- essere esplicite;
- evitare duplicazioni di dati;
- preservare l'integrità referenziale;
- facilitare interrogazioni efficienti.

`Episode.chapterId` è opzionale (`String?`), coerente con il modello narrativo ufficiale (`05_Journey.md`): un Episodio può esistere senza Capitolo. Ogni Episodio ha inoltre un `journeyId` diretto, così resta collegato al proprio Journey anche senza passare da un Capitolo (migrazione `20260803154620_episode_optional_chapter`, con backfill di `journeyId` dai Capitoli esistenti).

`Like` punta a un Episodio o a un Update tramite `targetType` (`EPISODE`/`UPDATE`) + `targetId`, un solo modello invece di due tabelle quasi identiche una per ciascun target — nessuna relation diretta verso Episode/Update, per questo `targetId` non è vincolato da una foreign key (migrazione `20260804165919_profile_richness`, che aggiunge anche `User.coverUrl`, `User.location` e `Journey.viewsCount`).

L'avanzamento di visione si legge su due livelli separati, non su un unico modello: `JourneyProgress` (una riga per utente+Journey) resta solo il puntatore all'ultimo episodio visto (`currentEpisodeId`), usato da "Continua il tuo Journey"; la posizione video e il completamento vivono per singolo episodio in `EpisodeProgress` (una riga per utente+episodio, `positionSec` + `completedAt`), perché un Journey con più episodi richiede di sapere quali episodi specifici sono stati completati, non solo l'ultimo aperto (migrazione `20260809103604_episode_progress`, che rimuove anche `positionSec`/`completedAt` da `JourneyProgress`, rimasti inutilizzati finché non esisteva un player capace di scriverli).

`Episode` ha tre campi in più per la versione leggera del video (migrazione `20260907125348_episode_light_video`, piano condiviso con Manuel il 2026-09-07): `lightVideoStatus` (enum `LightVideoStatus`: `PENDING`/`READY`/`FAILED`, `null` = mai avviata), `lightVideoId` (uid del video su Cloudflare Stream) e `lightVideoPlaybackUrl` (URL manifest HLS, valorizzato solo a `READY`). Il video originale (`videoKey`) non viene mai toccato: questi campi descrivono solo una copia aggiuntiva per lo streaming adattivo, generata in background dopo la pubblicazione (vedi `lib/stream.ts` e `app/api/webhooks/stream/route.ts`).

`Update` si è esteso da solo testo a cinque formati (migrazione `20260812083850_updates_rich_media`): `mediaKey` porta la chiave R2 di una foto o di un video (stesso principio già in uso per `Episode.videoKey`), `linkedJourneyId`/`linkedEpisodeId` sono foreign key facoltative verso un Journey o Episodio del creator. Quattro tabelle nuove, tutte con cancellazione a cascata quando l'Update a cui appartengono viene eliminato (scaduto o rimosso a mano dal creator), coerente con "contenuti temporanei": `PollOption` (opzioni di un sondaggio) e `UpdateVote` (un voto per utente+Update, vincolo di unicità); `UpdateAnswer` (risposta libera a una Domanda, privata, un utente può risponderne una sola per Update); `UpdateReaction` (un'emoji per utente+Update, il tocco più recente sostituisce il precedente). Una quinta tabella, `UpdateView`, non ha cascata particolare da segnalare oltre a quella dallo stesso Update: registra chi ha già visto quale Update, base per il contorno "visto/non visto" della riga di Stories in Home (`14_UI_Pages.md`). Nessuna di queste tabelle duplica dati già presenti altrove: `UpdateVote`/`UpdateAnswer`/`UpdateReaction`/`UpdateView` puntano sempre a `Update` + `User` con foreign key dirette, non un `targetType`/`targetId` polimorfico come `Like` — a differenza di `Like`, qui il target è sempre e solo l'Update, non serve distinguere tra entità diverse.

Community del creator (Punto 8 dell'allineamento, 2026-09-25/27): i quattro modelli `Workshop`, `Event`, `DigitalProduct`, `PersonalService`, già presenti ma mai usati, sono diventati reali. `Workshop` ed `Event` hanno `isFree` e `startsAt`, con `price` ora facoltativo (null se gratuito); `User.notifyNewOffering` è la preferenza per le notifiche di nuove offerte; `WorkshopRsvp`/`EventRsvp` registrano chi partecipa a un evento gratuito, una riga per utente+evento (migrazione `20260925095419_add_community_ai_foundations`). `DigitalProduct.fileUrl` è facoltativo, perché la bozza nasce prima del caricamento del file (`20260925095830_digital_product_file_optional`). Tutti e quattro hanno `coverUrl`, chiave R2 della copertina sotto `community-covers/` (`20260926083635_community_listing_cover`). `AiImageGeneration` (tabella `ai_image_generations`) registra una riga per ogni immagine creata dall'AI nella chat Community (`userId`, `r2Key` sotto `ai-images/{userId}/`, `createdAt`), usata solo per il tetto di 5 immagini ogni 24 ore per creator, con cancellazione a cascata insieme all'utente (`20260927090527_add_ai_image_generation`). Nota aperta: le foreign key di `WorkshopRsvp`/`EventRsvp` sono `RESTRICT` e `lib/account/deletion.ts` non le cancella prima di utenti ed eventi, vedi `94_Product_Backlog.md`.

`EpisodeMoment` (tabella `episode_moments`, migrazione `20261002214633_add_episode_moments`): la "Mappa dei Momenti", nata da un brainstorming sul salto tecnologico che l'AI può dare a Zero (2026-10-01/03, vedi `93_Project_Alignment_Recap.md`, Punto 8). Una riga per ogni momento che l'AI individua guardando un episodio una volta sola (Gemini, comprensione video "agentica"): `episodeId`, `timestampSec`, `description` e `embedding` (la firma numerica di significato del testo, salvata come `Json` e confrontata in codice applicativo — alla scala attuale della libreria non serve l'estensione `pgvector`). Collegata a `Episode` con `onDelete: Cascade`. Base per funzioni non ancora costruite (ricerca semantica, trailer automatico dai momenti migliori, un futuro "Percorso su Misura" composto da momenti di creator diversi): questa tabella è solo il dato, rigenerabile in qualunque momento riprocessando l'episodio, il video originale su R2 non viene mai toccato. Spenta di default (`MOMENTS_LIBRARY_ENABLED`, vedi `lib/ai/episodeMoments.ts`): nessuna riga viene scritta finché non si attiva esplicitamente.

## Regole

Le modifiche allo schema del database devono:

- mantenere la compatibilità con l'architettura del progetto;
- essere documentate;
- essere accompagnate dalle relative migrazioni.

Ogni nuova entità deve avere una responsabilità chiara e una relazione coerente con il resto del modello.

## Implicazioni sul prodotto

Il database costituisce il fondamento dell'intera piattaforma.

Qualsiasi evoluzione dell'architettura dati deve preservare la centralità del Journey e garantire la stabilità dell'intero ecosistema.