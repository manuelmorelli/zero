---
title: Project Context
doc_id: 00-project-context
version: "4.1"
status: approved
related_docs:
  - 01_Vision
  - 02_Mission
  - 03_User_Problems
  - 04_Product_Principles
  - 16_Tech_Stack
  - 17_Project_Architecture
  - 18_Operational_Manual
  - 90_AI_DEVELOPMENT_RULES
---

# Project Context

## Obiettivo

Questo documento rappresenta la fonte di verità dell'intero progetto Zero.

Chiunque lavori sul progetto, persona o intelligenza artificiale, deve leggere questo documento prima di consultare il resto della documentazione o apportare modifiche al codice.

Le decisioni contenute in questo documento hanno priorità su qualsiasi assunzione o interpretazione.

## Dichiarazione

Zero è una piattaforma dedicata ai Journey: percorsi di trasformazione reali, documentati nel tempo.

La direzione strategica del progetto è definita in Vision; la sua traduzione operativa in Mission. Questo documento non ripete quei contenuti, li presuppone: ogni decisione di prodotto, design, sviluppo e monetizzazione deve essere coerente con i principi definiti in quei due documenti.

## Fonte di verità

La cartella `docs/` rappresenta la documentazione ufficiale del progetto.

In caso di conflitto tra codice e documentazione, la documentazione prevale.

Ogni modifica significativa al prodotto deve essere accompagnata dall'aggiornamento dei documenti interessati.

## Organizzazione della documentazione

La documentazione è organizzata in documenti indipendenti.

Ogni documento descrive un singolo aspetto del progetto.

Le relazioni tra i documenti sono definite esclusivamente attraverso il campo `related_docs` del front matter.

## Regole di sviluppo

Prima di implementare una nuova funzionalità è necessario verificare che sia coerente con:

- Vision
- Mission
- Product Principles
- MVP
- Architettura del progetto

Se una modifica introduce una nuova regola di prodotto o modifica un comportamento esistente, la documentazione deve essere aggiornata prima o contestualmente al codice.

## Architettura generale

Zero è progettato secondo un'architettura modulare.

Ogni componente deve avere una singola responsabilità.

La scalabilità, la leggibilità e la manutenibilità hanno priorità rispetto a soluzioni rapide ma difficili da mantenere.

## Stack tecnologico

Lo stack tecnologico ufficiale è definito nel documento `16_Tech_Stack.md`.

Eventuali modifiche devono essere approvate e documentate.

## Convenzioni

Tutti i documenti della cartella `docs/` seguono lo stesso standard:

- Front matter YAML.
- Un solo titolo H1.
- Struttura uniforme.
- Nessuna duplicazione delle informazioni.
- `related_docs` utilizzato come unico sistema di collegamento tra documenti.

## Gestione delle modifiche

Ogni decisione architetturale o di prodotto deve essere registrata nella documentazione.

Non devono esistere funzionalità implementate che non siano descritte nei documenti ufficiali.

## Obiettivo finale

L'obiettivo del progetto è costruire una piattaforma coerente, mantenibile e scalabile.

La documentazione non è un supporto allo sviluppo: è parte integrante del progetto e rappresenta il riferimento ufficiale per tutte le decisioni future.

## Architettura del Prodotto

Le seguenti decisioni rappresentano lo stato ufficiale dell'architettura di Zero.

### Journey-Centric

L'intera piattaforma è costruita attorno al concetto di Journey.

Ogni funzionalità deve contribuire alla creazione, fruizione, evoluzione o monetizzazione dei Journey.

### Struttura del Journey

Ogni Journey è composto da una Presentazione e da una sequenza di Episodi.

I Capitoli sono un livello organizzativo opzionale: il creator può usarli per suddividere il percorso in fasi quando lo ritiene utile, ma un Journey esiste e si legge normalmente anche senza Capitoli, come sequenza lineare di Episodi.

Questa struttura rappresenta il modello narrativo ufficiale del progetto (dettaglio completo in `05_Journey.md`).

### Modello utente unico

Zero non è una piattaforma pensata solo per i creator: è una piattaforma per tutti.

Ogni persona che si registra ha lo stesso account e le stesse capacità di base: può leggere i Journey degli altri e, quando lo desidera, iniziare il proprio Journey e condividerlo.

"Creator" non è una categoria di utenti separata, con un proprio account o una propria pagina di iscrizione: è semplicemente lo stato di un utente che ha deciso di pubblicare un Journey. Ogni utente può trovarsi in questo stato in qualsiasi momento, senza smettere di essere anche lettore dei Journey altrui.

Da questo derivano tre conseguenze permanenti sull'architettura del prodotto:

- la Home è la stessa per ogni persona, indipendentemente dal fatto che abbia pubblicato un Journey;
- la Dashboard è uno strumento privato per gestire i propri contenuti, non una destinazione riservata a una categoria di utenti;
- il profilo pubblico rappresenta una persona, non un ruolo: se quella persona ha pubblicato uno o più Journey, questi compaiono nel suo profilo. Non esiste una pagina "profilo creator" distinta da una pagina "profilo utente".

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Follow universale (persona-segue-persona)

Dal 2026-08-12 il "Follow" collega due persone, non una persona a un profilo Creator: qualunque utente può seguirne un altro con lo stesso pulsante e lo stesso conteggio, indipendentemente dal fatto che chi viene seguito abbia mai pubblicato un Journey. Conseguenza diretta del principio "Modello utente unico" appena sopra: se il profilo pubblico rappresenta una persona e non un ruolo, anche il Follow deve valere per la persona, non solo per il suo eventuale stato di creator.

Chi non è creator resta seguibile e conta comunque nei follower del suo profilo, ma non genera notifiche "nuovo episodio"/"nuovo Journey" (perché non pubblica nulla) e non compare nelle sezioni di Discovery riservate ai creator (Recommended Creators, Feed). Seguire un creator continua quindi a produrre esattamente gli stessi effetti di prima (notifiche, Feed, Recommended); cambia solo che ora è un caso particolare di un meccanismo di Follow più generale, non un sistema a parte.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo. È inoltre la base su cui si costruirà la messaggistica privata (vedi Roadmap): la regola concordata è che due persone possono scriversi solo se si seguono a vicenda (follow reciproco).

### Drag & Drop

La riorganizzazione tramite drag & drop di Capitoli ed Episodi è una funzionalità distintiva di Zero.

Il creator può modificare l'ordine narrativo del Journey in qualsiasi momento senza alterare la cronologia reale degli eventi.

La sequenza narrativa e la cronologia temporale sono considerate informazioni separate.

### Data di pubblicazione del Journey

Il modello `Journey` include un campo `publishedAt`, distinto da `createdAt` (fissato alla creazione) e da `updatedAt` (cambia ad ogni modifica, anche non legata alla pubblicazione).

`publishedAt` viene valorizzato una sola volta: la prima volta che un Journey passa da Bozza a Pubblicato. Se il Journey torna in Bozza e viene ripubblicato in seguito, `publishedAt` non cambia: resta la data della prima pubblicazione.

Qualunque sezione o funzionalità che debba mostrare o ordinare i Journey in base a "quando sono stati pubblicati" (es. "New Journeys", il Feed dei creator seguiti) deve usare esclusivamente `publishedAt`. Non è mai corretto usare `updatedAt` per questo scopo, perché cambierebbe ad ogni modifica successiva del Journey, non solo alla pubblicazione.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Archiviazione del Journey

**Revisione (2026-08-09)**: un creator può avere più Journey attivi in parallelo (cioè con `status` diverso da `ARCHIVED`). Il limite precedente ("un solo Journey attivo alla volta") è stato rimosso su decisione di Manuel: non esiste più nessun controllo lato server che blocchi la creazione di un nuovo Journey mentre un altro è già attivo.

Sul Profilo pubblico, tra i Journey pubblicati di un creator, quello mostrato "in evidenza" (card principale della tab Overview) è quello che ha ricevuto l'episodio più recente — per data di caricamento dell'episodio (`createdAt`), non per la data reale dell'evento (`occurredAt`), stesso principio già in uso per `Journey.publishedAt` (vedi sezione "Data di pubblicazione del Journey" più sotto). Con un solo Journey pubblicato coincide semplicemente con quello.

Un Journey può essere archiviato ma non eliminato: l'archiviazione imposta `status: ARCHIVED` sulla riga esistente, senza mai cancellarla né usare `deletedAt`. L'archiviazione è un'azione a senso unico nell'MVP: nessuna funzionalità riporta un Journey archiviato a Bozza o Pubblicato.

Il Journey archiviato resta visibile nel profilo pubblico del creator, insieme ai Journey pubblicati, e la sua Pagina Journey pubblica resta raggiungibile (sola lettura, nessuna modifica alle regole di Follow). Un Journey archiviato non compare invece in nessuna sezione di Discovery (Home, Categories, Ricerca, Feed, Recommended): quelle sezioni restano riservate ai Journey "live", cioè con `status: PUBLISHED` o `status: DISCOVERY` (vedi sezione "Discovery Phase" più sotto), coerentemente con il loro scopo di mostrare contenuti attivi.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Discovery Phase

Ogni Journey, alla prima pubblicazione, entra automaticamente in Discovery Phase per 15 giorni (`status: DISCOVERY`, scadenza in `Journey.discoveryEndsAt`): resta pubblico a tutti gli effetti (pagina propria, profilo del creator, categorie, ricerca, Feed di chi segue il creator), ma è mostrato a **tutti** gli utenti nella sezione Home "Discovering Now", senza filtro per interessi o categorie — a differenza del resto della Discovery, che è invece personalizzata. Regole complete e criterio di ranking (Journey Score) in `08_Algorithm.md`.

`discoveryEndsAt` si valorizza una sola volta, alla prima pubblicazione, con lo stesso principio già in uso per `publishedAt`: un ciclo bozza → ripubblicazione non riapre una seconda Discovery Phase sullo stesso Journey.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Categorie del Journey

Le categorie ammesse per un Journey sono una lista fissa e ufficiale, non testo libero scelto dal creator.

L'unica fonte di verità è `lib/constants/categories.ts`: sia il form di creazione/modifica del Journey sia qualunque pagina di Discovery basata su categoria (filtri, pagina Categories, ricerca) devono leggere da lì, senza duplicare l'elenco altrove.

Questa scelta garantisce coerenza nella navigazione per categoria: senza una lista fissa, lo stesso concetto rischierebbe di comparire con grafie diverse (es. "Fitness" e "fitness" trattate come due categorie distinte).

Aggiungere, rinominare o rimuovere una categoria significa modificare solo quel file: non è richiesta una migrazione del database, perché il campo resta un testo validato lato applicazione, non un enum a livello di database.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Onboarding

Dopo la verifica dell'email, il nuovo utente viene mandato a una schermata di Onboarding in cui seleziona i propri interessi tra le stesse categorie ufficiali dei Journey (`lib/constants/categories.ts`, unica fonte di verità, nessuna lista duplicata).

La selezione di almeno un interesse è obbligatoria per procedere: è la regola minima che rende l'Onboarding un passaggio reale e non uno step sempre "vuoto" da saltare. Gli interessi sono salvati sull'utente (`User.interests`, lista di categorie) e dal 2026-08-07 orientano la Home: le sezioni "Recommended for you", "Creator consigliati", "Journeys of the Moment", "New Journeys", "Top Journeys" e "Latest Videos" danno priorità ai contenuti nelle categorie di interesse dichiarate, senza mai alterare l'ordinamento di base di ciascuna sezione (cronologico o per follower) all'interno di ogni gruppo. Chi non ha ancora impostato interessi (lista vuota) vede queste sezioni esattamente come se il criterio non esistesse.

**Revisione (2026-08-03)**: l'Onboarding non è più un passaggio obbligato. In precedenza la Home reindirizzava sempre a `/onboarding` finché gli interessi erano vuoti, qualunque fosse il modo con cui l'utente arrivava alla Home (non solo subito dopo la registrazione). Su decisione di Manuel questo blocco è stato rimosso: l'unico punto in cui l'Onboarding si attiva automaticamente resta il redirect subito dopo la verifica email (`callbackURL` di `signUp.email`). Per chi ha già un account con interessi vuoti (account più vecchi, o Onboarding abbandonato a metà), la Home mostra un banner non invasivo e dismissibile con un link a `/onboarding`, senza più bloccare l'accesso. Conseguenza accettata: chi chiude il banner senza completare l'Onboarding può restare con interessi vuoti indefinitamente, finché non li imposta da `/account`.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Lingua del Prodotto

La lingua ufficiale dell'interfaccia utente di Zero è l'inglese.

Ogni testo rivolto all'utente — pagine, form, messaggi di errore, email transazionali — deve essere scritto in inglese, in modo coerente su tutta la piattaforma.

Commenti nel codice e documentazione tecnica possono restare in italiano, non essendo testo rivolto all'utente finale.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Updates: tutti i formati, stile Stories, scadenza senza job in background

Dal 2026-08-12 l'Update non è più solo testo: il modello `Update` supporta tutti e cinque i tipi previsti in schema fin dalla fondazione del progetto (`TEXT`, `IMAGE`, `VIDEO`, `POLL`, `QUESTION`), tutti pubblicabili dal pulsante "+" globale (`components/creator/QuickUploadButton.tsx`), che ora offre una prima scelta tra "Add to your Journey" (percorso video Episodio, invariato) e "Post an Update". La casella di solo testo già presente in Dashboard (`components/creator/UpdateForm.tsx`) resta com'era, come scorciatoia più semplice accanto al percorso completo del "+".

Un Update può inoltre collegarsi facoltativamente, a prescindere dal tipo, a un Episodio o Journey del creator (`Update.linkedJourneyId`/`linkedEpisodeId`) — solo tra quelli già pubblici (`PUBLISHED`/`DISCOVERY`), mai una Bozza, per non produrre un link che porta a un 404.

Gli Update vivono **solo nella Home reale**, in una riga di cerchi cliccabili in stile Instagram Stories (`components/home/StoriesRow.tsx`), non nel Profilo pubblico: la tab "Updates" del Profilo, mai sviluppata oltre la versione testuale iniziale, è stata rimossa. La riga mostra solo i creator seguiti (non il mix 80/20 con creator "interessanti" usato altrove per gli Update, vedi `08_Algorithm.md`), con il cerchio colorato se c'è almeno un Update di quel creator non ancora visto (`UpdateView`, una riga per utente+Update). Cliccando si apre un visualizzatore a schermo intero (`components/home/StoryViewer.tsx`) con avanzamento automatico: a tempo fisso per testo/foto/sondaggio, alla fine della riproduzione per i video, mai per le Domande (restano finché non si risponde o non si scorre via a mano).

Regole permanenti per i formati aggiuntivi:

- **Sondaggio** (`PollOption`, `UpdateVote`): un voto per persona, non modificabile dopo; i risultati (percentuali) si vedono solo dopo aver votato.
- **Domanda** (`UpdateAnswer`): una risposta di testo libero per persona, visibile solo al creator, mai pubblica — coerente con la bassa pressione già decisa per gli Update, nessuna "gara" di risposte.
- **Reazione rapida** (`UpdateReaction`, un'emoji tra un set fisso): un tocco per persona, il tocco più recente sostituisce il precedente; il conteggio è visibile solo al creator (Dashboard), mai un contatore pubblico.
- **Video**: limiti separati e più stretti di quelli di un Episodio (100MB, 60 secondi) — un Update è un contenuto che sparisce in 24 ore, non l'archivio del Journey.

La scadenza a 24 ore (`09_Updates.md`) non è gestita da un cron job o da un servizio in background, e vale per ogni formato: `archivedAt` viene calcolato e salvato al momento della pubblicazione (`publishedAt + 24h`), e ogni lettura di Update (Dashboard del creator, Stories row in Home) esegue prima una pulizia lazy (`deleteExpiredUpdates` in `lib/updates.ts`) che elimina dal database gli Update già scaduti — se l'Update aveva una foto o un video su Cloudflare R2, il file viene eliminato nello stesso passaggio. Nessun Update scaduto resta quindi salvato più del necessario, senza introdurre infrastruttura aggiuntiva.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Architettura

Zero adotta un'architettura modulare.

Ogni modulo deve avere una responsabilità chiara e dipendenze limitate.

Le principali aree del progetto sono:

- Frontend;
- Backend;
- Database;
- Autenticazione;
- Storage;
- Servizi esterni;
- Documentazione.

### Tech Stack

Le tecnologie ufficiali del progetto sono:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- React Hook Form
- Zod
- Node.js
- PostgreSQL
- Prisma ORM
- Better Auth
- Cloudflare R2
- Stripe
- Resend

Qualsiasi modifica della stack deve essere riflessa nel documento `16_Tech_Stack.md`.

### Documentazione

La cartella `docs` rappresenta la documentazione ufficiale del progetto.

Ogni decisione significativa di prodotto o architettura deve essere documentata prima di essere considerata definitiva.

`00_PROJECT_CONTEXT.md` rimane la fonte di verità dell'intero progetto e deve essere mantenuto sempre aggiornato.