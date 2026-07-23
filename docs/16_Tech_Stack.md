---
title: Tech Stack
doc_id: 16-tech-stack
version: "3.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 11_Database_Architecture
  - 12_MVP_Features
  - 15_Design_System
  - 17_Project_Architecture
---

# Tech Stack

## Obiettivo

Definire le tecnologie ufficiali utilizzate nello sviluppo di Zero.

La Tech Stack costituisce il riferimento tecnico per tutto il progetto e deve garantire coerenza, scalabilità e facilità di manutenzione.

## Dichiarazione

Zero utilizza una stack moderna, orientata alla produttività degli sviluppatori e alla scalabilità della piattaforma.

Ogni tecnologia viene adottata solo se contribuisce concretamente alla qualità del prodotto.

## Frontend

### Framework

- Next.js

### Linguaggio

- TypeScript

### Styling

- Tailwind CSS

### Component Library

- shadcn/ui

### Icone

- Lucide React

### Animazioni

- Framer Motion

### State Management

- Zustand

### Form

- React Hook Form

### Validazione

- Zod

### Drag & Drop

- dnd-kit

## Backend

### Runtime

- Node.js

### Framework

- Next.js Route Handlers

### API

- REST API

## Database

### Database relazionale

- PostgreSQL

### ORM

- Prisma ORM

## Autenticazione

- Better Auth

## Storage

- Cloudflare R2

## Pagamenti

- Stripe

## Email

- Resend

## Hosting

L'infrastruttura deve supportare una distribuzione semplice, affidabile e scalabile.

La scelta del provider di hosting può evolvere nel tempo senza modificare l'architettura applicativa.

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

Le dipendenze devono essere mantenute aggiornate e documentate.

## Implicazioni sul prodotto

La Tech Stack rappresenta il riferimento tecnico condiviso per lo sviluppo di Zero.

Ogni scelta implementativa deve essere coerente con le tecnologie e i principi definiti in questo documento.