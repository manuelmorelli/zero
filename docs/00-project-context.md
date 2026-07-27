---
title: Project Context
doc_id: 00-project-context
version: "3.6"
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

Un creator può avere un solo Journey attivo alla volta, cioè con `status` diverso da `ARCHIVED`. La regola è applicata lato server al momento della creazione di un nuovo Journey.

Un Journey può essere archiviato ma non eliminato: l'archiviazione imposta `status: ARCHIVED` sulla riga esistente, senza mai cancellarla né usare `deletedAt`. L'archiviazione è un'azione a senso unico nell'MVP: nessuna funzionalità riporta un Journey archiviato a Bozza o Pubblicato. Dopo aver archiviato il proprio Journey attivo, il creator può crearne uno nuovo, perché il vincolo "un solo Journey attivo" non conta più i Journey archiviati.

Il Journey archiviato resta visibile nel profilo pubblico del creator, insieme ai Journey pubblicati, e la sua Pagina Journey pubblica resta raggiungibile (sola lettura, nessuna modifica alle regole di Follow). Un Journey archiviato non compare invece in nessuna sezione di Discovery (Home, Categories, Ricerca, Feed, Recommended): quelle sezioni restano riservate ai Journey con `status: PUBLISHED`, coerentemente con il loro scopo di mostrare contenuti attivi.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Categorie del Journey

Le categorie ammesse per un Journey sono una lista fissa e ufficiale, non testo libero scelto dal creator.

L'unica fonte di verità è `lib/constants/categories.ts`: sia il form di creazione/modifica del Journey sia qualunque pagina di Discovery basata su categoria (filtri, pagina Categories, ricerca) devono leggere da lì, senza duplicare l'elenco altrove.

Questa scelta garantisce coerenza nella navigazione per categoria: senza una lista fissa, lo stesso concetto rischierebbe di comparire con grafie diverse (es. "Fitness" e "fitness" trattate come due categorie distinte).

Aggiungere, rinominare o rimuovere una categoria significa modificare solo quel file: non è richiesta una migrazione del database, perché il campo resta un testo validato lato applicazione, non un enum a livello di database.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Lingua del Prodotto

La lingua ufficiale dell'interfaccia utente di Zero è l'inglese.

Ogni testo rivolto all'utente — pagine, form, messaggi di errore, email transazionali — deve essere scritto in inglese, in modo coerente su tutta la piattaforma.

Commenti nel codice e documentazione tecnica possono restare in italiano, non essendo testo rivolto all'utente finale.

Questa è una decisione di prodotto permanente, non limitata alla fase attuale di sviluppo.

### Updates: solo testo, scadenza senza job in background

Il modello `Update` prevede in schema più tipi (`TEXT`, `IMAGE`, `VIDEO`, `POLL`, `QUESTION`), ma l'MVP implementa solo Updates di testo: gli altri tipi restano previsti nello schema per il futuro, senza bisogno di una nuova migrazione quando arriverà il loro turno.

La scadenza a 24 ore (`09_Updates.md`) non è gestita da un cron job o da un servizio in background: `archivedAt` viene calcolato e salvato al momento della pubblicazione (`publishedAt + 24h`), e ogni lettura di Update (Dashboard del creator, sezione Home dei creator seguiti) esegue prima una pulizia lazy (`deleteExpiredUpdates` in `lib/updates.ts`) che elimina dal database gli Update già scaduti. Nessun Update scaduto resta quindi salvato più del necessario, senza introdurre infrastruttura aggiuntiva.

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