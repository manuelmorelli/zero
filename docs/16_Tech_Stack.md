---
title: Tech Stack
doc_id: 16-tech-stack
version: "4.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 11_Database_Architecture
  - 12_MVP_Features
  - 15_Design_System
  - 17_Project_Architecture
  - 23_Technical_Build_History
---

# Tech Stack

## Obiettivo

Definire le tecnologie ufficiali utilizzate nello sviluppo di Zero.

La Tech Stack costituisce il riferimento tecnico per tutto il progetto e deve garantire coerenza, scalabilità e facilità di manutenzione. Questo elenco riflette ciò che è realmente installato e in uso (verificato su `package.json` e sul codice il 22 ottobre 2026). Come le tecnologie lavorano insieme è descritto in `23_Technical_Build_History.md`.

## Dichiarazione

Zero utilizza una stack moderna, orientata alla produttività degli sviluppatori e alla scalabilità della piattaforma.

Ogni tecnologia viene adottata solo se contribuisce concretamente alla qualità del prodotto.

## Frontend

### Framework

- Next.js 16 (App Router, Turbopack) con React 19

Questa versione di Next.js ha differenze rispetto alle precedenti: la documentazione di riferimento è in `node_modules/next/dist/docs/`.

### Linguaggio

- TypeScript

### Styling

- Tailwind CSS 4, con i token semantici definiti nel blocco `@theme` di `app/globals.css`

### Componenti

- Kit proprio in `components/ui/` (bottoni, titoli, riquadri, campi, card, avatar, chat, dialog), unico modo ammesso per costruire l'interfaccia (vedi `15_Design_System.md`)
- Radix UI per le primitive accessibili (Dialog, Dropdown Menu)
- `sonner` per gli avvisi a comparsa

### Icone

- Lucide React

### Animazioni

- CSS e transizioni Tailwind per i movimenti semplici
- GSAP per le animazioni legate allo scroll su Home e pagine vetrina
- three.js per lo sfondo di sabbia 3D (solo da computer)

Tutte seguono `21_Motion_Guidelines.md`.

### Drag & Drop

- dnd-kit

### Media

- `react-easy-crop` per il ritaglio delle immagini
- `hls.js` per la riproduzione delle versioni leggere dei video

## Backend

### Runtime

- Node.js

### Logica applicativa

- Server Components per la lettura dei dati
- Server Actions (`lib/actions/`) per tutte le modifiche
- Route Handlers (`app/api/`) solo per autenticazione, risposte AI in streaming, cron e webhook

### Attività pianificate

- Cron di Vercel, configurati in `vercel.json`

## Database

### Database relazionale

- PostgreSQL su Neon (regione Francoforte)

### ORM

- Prisma ORM 7 con adapter Neon (`@prisma/adapter-neon`)

## Autenticazione

- Better Auth (email e password, verifica email obbligatoria)

## Storage

- Cloudflare R2, con caricamento diretto dal browser tramite URL prefirmati

## Video

- Cloudflare Stream: versioni leggere dei video per connessioni lente, generate in background a partire dal file originale su R2 (mai sostituito)

## AI

- Google Gemini: moderazione automatica di testi e immagini, chat AI della Community, assistente Ember, Mappa dei Momenti (analisi video ed embedding)

## Email

- Resend, con mittente sul dominio verificato `zerojourneys.com`

## Pagamenti

- Nessun fornitore scelto. Il lancio è previsto senza funzioni a pagamento; le Tips passano da un link esterno del journeyer.

## Hosting

- Predisposto per Vercel. Il sito non è ancora pubblicato online.

La scelta del provider di hosting può evolvere nel tempo senza modificare l'architettura applicativa.

## Strumenti di qualità

- ESLint e controllo dei tipi TypeScript
- `scripts/check-design.mjs`: controllo automatico del design system, eseguito prima di ogni commit (`.githooks/pre-commit`)
- Test automatici: non ancora presenti

## Non in uso

Citate in versioni precedenti di questo documento ma non installate: shadcn/ui, Framer Motion, Zustand, React Hook Form, Zod. Non vanno introdotte senza un beneficio concreto: il loro ruolo è già coperto dal kit `components/ui/`, da CSS/GSAP e dai Server Components.

## Principi tecnici

La stack deve garantire:

- tipizzazione completa;
- alta manutenibilità;
- componenti riutilizzabili;
- semplicità di sviluppo;
- facilità di test;
- possibilità di scalare il prodotto.

## Regole

L'introduzione di nuove tecnologie deve essere motivata da un reale beneficio per il progetto.

La duplicazione di librerie con responsabilità equivalenti deve essere evitata.

Le dipendenze devono essere mantenute aggiornate e documentate: ogni libreria aggiunta o rimossa va riportata in questo documento.

## Implicazioni sul prodotto

La Tech Stack rappresenta il riferimento tecnico condiviso per lo sviluppo di Zero.

Ogni scelta implementativa deve essere coerente con le tecnologie e i principi definiti in questo documento.
