---
title: MVP Features
doc_id: 12-mvp-features
version: "3.4"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 05_Journey
  - 11_Database_Architecture
  - 13_User_Flows
  - 17_Project_Architecture
---

# MVP Features

## Obiettivo

Definire le funzionalità incluse nella prima versione pubblica di Zero.

L'MVP deve validare il modello di prodotto con il minor livello possibile di complessità, mantenendo intatta la proposta di valore della piattaforma.

## Dichiarazione

L'MVP non ha l'obiettivo di offrire tutte le funzionalità previste dal progetto.

Ha l'obiettivo di dimostrare che il concetto di Journey rappresenta un'alternativa concreta ai social network tradizionali e genera valore reale per utenti e creator.

## Funzionalità incluse

### Account

- Registrazione tramite email.
- Accesso tramite email.
- Recupero password.
- Gestione del profilo.

---

### Journey

- Creazione di Journey.
- Modifica di Journey.
- Creazione di Episodi (elemento principale del Journey).
- Creazione di Capitoli (opzionale, per organizzare gli Episodi quando il creator lo ritiene utile).
- Gestione della struttura del Journey.
- Archiviazione del Journey (Archive Journey).

Un creator può avere più Journey attivi (non archiviati) in parallelo (vedi `00-project-context.md`, sezione "Archiviazione del Journey"). Un Journey può essere archiviato ma non eliminato; l'archiviazione è un'azione a senso unico. Un Journey archiviato resta visibile nel profilo pubblico ma non partecipa alla Discovery.

---

### Esplorazione

- Homepage.
- Ricerca.
- Scoperta di Journey.
- Profilo utente.
- Pagina Journey.

---

### Community

- Seguire creator.
- Gestione della Community Premium.
- Accesso ai contenuti riservati.

---

### Updates

- Pubblicazione di Updates.
- Visualizzazione degli Updates.
- Scadenza automatica degli Updates.

---

### Dashboard

- Gestione dei Journey.
- Gestione degli Updates.
- Analisi di base.
- Gestione Community Premium.

## Funzionalità escluse

Le seguenti funzionalità non fanno parte dell'MVP:

- Login con Google.
- Login con Apple.
- Autenticazione a due fattori (2FA).
- Messaggistica privata.
- Live streaming.
- Marketplace avanzato.
- Algoritmi avanzati di raccomandazione.
- Moderazione automatica tramite AI.

## Criteri di inclusione

Una funzionalità entra nell'MVP solo se:

- supporta direttamente il Journey;
- contribuisce alla validazione del prodotto;
- è coerente con Vision, Mission e Product Principles;
- offre un valore concreto agli utenti.

## Regole

L'MVP deve privilegiare qualità, stabilità e semplicità.

Ogni funzionalità aggiuntiva deve essere valutata in base al suo impatto sulla validazione del prodotto e non sulla sola disponibilità tecnica.

## Implicazioni sul prodotto

L'MVP rappresenta il punto di partenza dell'evoluzione di Zero.

Le funzionalità escluse potranno essere introdotte successivamente senza alterare i principi fondamentali della piattaforma.