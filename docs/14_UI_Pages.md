---
title: UI Pages
doc_id: 14-ui-pages
version: "3.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 06_User_Experience
  - 07_Creator_Experience
  - 13_User_Flows
  - 15_Design_System
---

# UI Pages

## Obiettivo

Definire la struttura delle principali pagine dell'applicazione Zero.

Questo documento descrive il ruolo di ogni pagina e le responsabilità funzionali, senza entrare nei dettagli grafici.

## Dichiarazione

L'interfaccia di Zero deve essere semplice, coerente e focalizzata sul Journey.

Ogni pagina deve avere uno scopo preciso e guidare l'utente verso l'azione principale con il minimo livello di complessità.

## Pagine pubbliche

### Home

Punto di accesso principale alla piattaforma.

Contiene:

- Continue Your Journey;
- Recommended Journeys;
- New Journeys;
- Most Completed Journeys;
- Categories;
- Updates dei creator seguiti;
- Creator consigliati.

---

### Esplora

Permette di scoprire nuovi Journey attraverso categorie, ricerca e suggerimenti.

---

### Ricerca

Consente di cercare:

- Journey;
- Creator;
- categorie.

---

### Pagina Creator

Contiene:

- informazioni del creator;
- Journey pubblicati;
- Community Premium;
- prodotti e servizi;
- workshop ed eventi.

---

### Pagina Journey

Rappresenta il cuore della piattaforma.

Contiene:

- Presentazione;
- Capitoli;
- Episodi;
- avanzamento dell'utente;
- strumenti di condivisione.

---

### Pagina Episodio

Visualizza un singolo Episodio mantenendo il contesto del Journey.

L'utente può passare facilmente all'episodio precedente o successivo.

## Area autenticata

### Dashboard Creator

Centro operativo del creator.

Permette di:

- gestire Journey;
- gestire Capitoli;
- gestire Episodi;
- pubblicare Updates;
- gestire Community Premium;
- gestire prodotti;
- consultare Analytics.

---

### Editor Journey

Permette di modificare la struttura completa del Journey.

Il creator può:

- modificare la Presentazione;
- creare Capitoli;
- creare Episodi;
- modificare i contenuti;
- riordinare Capitoli ed Episodi tramite drag & drop.

Il drag & drop costituisce una funzionalità distintiva della piattaforma e deve risultare semplice, fluido e immediato.

---

### Gestione Community

Permette di gestire:

- iscritti;
- livelli di accesso;
- contenuti Premium.

---

### Analytics

Mostra le principali metriche del creator.

Le statistiche devono privilegiare indicatori di qualità, continuità e completamento dei Journey rispetto alle sole metriche di visualizzazione.

---

### Impostazioni

Permette la gestione di:

- profilo;
- account;
- notifiche;
- privacy;
- preferenze.

## Regole

Ogni pagina deve avere una responsabilità chiara.

Le funzionalità non devono essere duplicate tra pagine differenti.

La navigazione deve risultare coerente in tutta la piattaforma.

## Implicazioni sul prodotto

La struttura delle pagine costituisce il riferimento per lo sviluppo del frontend.

Ogni nuova schermata dovrà rispettare i principi definiti nel Design System e integrarsi con i flussi utente esistenti.