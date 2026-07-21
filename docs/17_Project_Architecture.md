---
title: Project Architecture
doc_id: 17-project-architecture
version: "3.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 11_Database_Architecture
  - 12_MVP_Features
  - 16_Tech_Stack
  - 18_Operational_Manual
---

# Project Architecture

## Obiettivo

Definire l'architettura complessiva di Zero e le regole che guidano l'organizzazione del codice.

L'architettura deve favorire scalabilità, manutenibilità e chiarezza, consentendo al progetto di evolvere senza aumentare inutilmente la complessità.

## Dichiarazione

Zero adotta un'architettura modulare.

Ogni parte del sistema deve avere una responsabilità ben definita, dipendenze limitate e un'interfaccia chiara verso gli altri moduli.

## Principi

### Modularità

Il progetto è suddiviso in moduli indipendenti.

Ogni modulo deve poter evolvere senza generare effetti collaterali sulle altre aree dell'applicazione.

---

### Separazione delle responsabilità

Interfaccia, logica applicativa, accesso ai dati e servizi esterni devono rimanere chiaramente separati.

Ogni componente deve svolgere una sola responsabilità.

---

### Riutilizzabilità

Le funzionalità comuni devono essere sviluppate come componenti o servizi condivisi.

La duplicazione del codice deve essere evitata.

---

### Scalabilità

L'architettura deve supportare la crescita del prodotto senza richiedere riorganizzazioni radicali.

Nuove funzionalità devono poter essere aggiunte mantenendo la struttura esistente.

---

### Manutenibilità

Il codice deve essere semplice da comprendere, documentare e modificare.

La leggibilità è considerata un requisito progettuale.

## Organizzazione del progetto

L'applicazione è organizzata in aree funzionali chiaramente separate.

Le principali aree comprendono:

- interfaccia utente;
- logica applicativa;
- gestione dei dati;
- autenticazione;
- servizi esterni;
- infrastruttura;
- configurazione;
- documentazione.

La struttura delle cartelle deve riflettere questa organizzazione.

## Integrazioni

I servizi esterni devono essere isolati dal resto dell'applicazione tramite livelli di astrazione.

L'eventuale sostituzione di un provider non deve richiedere modifiche diffuse nel codice.

## Gestione delle modifiche

Ogni modifica significativa dell'architettura deve:

- essere documentata;
- essere coerente con la Vision del progetto;
- preservare la compatibilità con i moduli esistenti;
- evitare complessità non necessaria.

## Regole

Le decisioni architetturali devono privilegiare semplicità, chiarezza e solidità nel lungo periodo.

Le ottimizzazioni premature devono essere evitate.

Ogni nuova funzionalità deve integrarsi con l'architettura esistente invece di introdurre percorsi paralleli.

## Implicazioni sul prodotto

L'architettura del progetto rappresenta il riferimento tecnico per tutte le attività di sviluppo.

Ogni evoluzione della piattaforma deve rispettare i principi definiti in questo documento e contribuire a mantenere Zero semplice da sviluppare, estendere e mantenere nel tempo.