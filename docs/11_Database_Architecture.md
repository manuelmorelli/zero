---
title: Database Architecture
doc_id: 11-database-architecture
version: "3.3"
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

## Regole

Le modifiche allo schema del database devono:

- mantenere la compatibilità con l'architettura del progetto;
- essere documentate;
- essere accompagnate dalle relative migrazioni.

Ogni nuova entità deve avere una responsabilità chiara e una relazione coerente con il resto del modello.

## Implicazioni sul prodotto

Il database costituisce il fondamento dell'intera piattaforma.

Qualsiasi evoluzione dell'architettura dati deve preservare la centralità del Journey e garantire la stabilità dell'intero ecosistema.