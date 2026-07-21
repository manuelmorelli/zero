---
title: Operational Manual
doc_id: 18-operational-manual
version: "3.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 16_Tech_Stack
  - 17_Project_Architecture
  - 90_AI_DEVELOPMENT_RULES
  - 99_PROJECT_STATUS
---

# Operational Manual

## Obiettivo

Definire le regole operative per lo sviluppo e la manutenzione del progetto Zero.

Questo documento rappresenta il riferimento per tutte le attività quotidiane di sviluppo, documentazione e collaborazione.

## Dichiarazione

Ogni modifica al progetto deve essere eseguita seguendo un processo chiaro, documentato e verificabile.

La qualità del progetto dipende tanto dalla qualità del codice quanto dalla qualità del processo con cui viene sviluppato.

## Principi operativi

### Documentazione prima del codice

Le decisioni significative di prodotto o architettura devono essere documentate prima della loro implementazione.

La documentazione costituisce la fonte di verità del progetto.

---

### Coerenza

Ogni modifica deve rispettare Vision, Mission, Product Principles e Project Architecture.

Le soluzioni temporanee che compromettono la coerenza del progetto devono essere evitate.

---

### Semplicità

Ogni implementazione deve privilegiare la soluzione più semplice in grado di soddisfare i requisiti.

La complessità deve essere introdotta solo quando realmente necessaria.

---

### Qualità

Ogni modifica deve mantenere elevati standard di leggibilità, manutenibilità e affidabilità.

## Flusso di sviluppo

Ogni nuova funzionalità dovrebbe seguire il seguente processo:

1. Definizione dell'obiettivo.
2. Aggiornamento della documentazione, se necessario.
3. Progettazione della soluzione.
4. Implementazione.
5. Verifica del funzionamento.
6. Refactoring, se necessario.
7. Aggiornamento dello stato del progetto.

## Gestione della documentazione

La cartella `docs` rappresenta la documentazione ufficiale del progetto.

Ogni documento deve:

- avere una responsabilità specifica;
- evitare duplicazioni;
- rimanere coerente con gli altri documenti;
- essere aggiornato quando una decisione diventa definitiva.

## Gestione del codice

Il codice deve:

- essere semplice da leggere;
- essere modulare;
- evitare duplicazioni;
- rispettare la struttura del progetto;
- essere coerente con la Tech Stack ufficiale.

## Gestione delle dipendenze

L'introduzione di nuove librerie deve essere giustificata da un beneficio concreto.

Devono essere evitate librerie con responsabilità sovrapposte.

## Controllo delle modifiche

Ogni modifica significativa deve essere verificata prima di essere considerata completata.

Bug, regressioni e incoerenze devono essere risolti prima di procedere con nuove funzionalità.

## Regole

Durante lo sviluppo devono essere rispettati i seguenti principi:

- documentazione e codice devono rimanere coerenti;
- le decisioni devono essere tracciabili;
- la qualità ha priorità sulla velocità;
- la semplicità ha priorità sulla complessità;
- il Journey rimane il centro del prodotto.

## Implicazioni sul progetto

L'Operational Manual definisce il modo in cui Zero viene sviluppato e mantenuto.

Il rispetto di queste regole garantisce che il progetto possa evolvere nel tempo senza perdere qualità, coerenza e sostenibilità.