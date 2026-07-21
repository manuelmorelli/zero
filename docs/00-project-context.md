---
title: Project Context
doc_id: 00-project-context
version: "3.0"
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

Ogni Journey è composto da:

- Presentazione;
- Capitoli;
- Episodi.

Questa struttura rappresenta il modello narrativo ufficiale del progetto.

### Drag & Drop

La riorganizzazione tramite drag & drop di Capitoli ed Episodi è una funzionalità distintiva di Zero.

Il creator può modificare l'ordine narrativo del Journey in qualsiasi momento senza alterare la cronologia reale degli eventi.

La sequenza narrativa e la cronologia temporale sono considerate informazioni separate.

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