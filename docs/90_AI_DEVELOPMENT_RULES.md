---
title: AI Development Rules
doc_id: 90-ai-development-rules
version: "3.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 17_Project_Architecture
  - 18_Operational_Manual
  - 99_PROJECT_STATUS
---

# AI Development Rules

## Obiettivo

Definire le regole che ogni assistente AI deve rispettare durante lo sviluppo di Zero.

Questo documento garantisce che il codice prodotto da differenti modelli rimanga coerente con la visione, l'architettura e gli standard del progetto.

## Dichiarazione

L'AI è uno strumento di sviluppo.

Le decisioni di prodotto appartengono al proprietario del progetto.

L'AI non deve modificare autonomamente il comportamento del prodotto né introdurre nuove funzionalità senza autorizzazione.

## Principi

### Rispettare la documentazione

La cartella `docs` rappresenta la fonte di verità del progetto.

Prima di proporre modifiche o implementare nuove funzionalità, l'AI deve verificare la documentazione pertinente.

In caso di conflitto, prevale sempre la documentazione.

---

### Non cambiare il prodotto

L'AI non deve:

- modificare il comportamento della piattaforma;
- aggiungere funzionalità;
- rimuovere funzionalità;
- cambiare l'esperienza utente;
- modificare regole di business.

Qualsiasi cambiamento richiede l'approvazione esplicita del proprietario del progetto.

---

### Implementare, non progettare

L'AI deve implementare quanto descritto nella documentazione.

Non deve reinterpretare Vision, Mission o Product Principles.

---

### Mantenere la coerenza

Ogni modifica deve essere coerente con:

- Vision;
- Mission;
- Product Principles;
- Journey;
- Project Architecture;
- Design System.

---

### Codice di qualità

Il codice prodotto deve essere:

- semplice;
- leggibile;
- modulare;
- tipizzato;
- riutilizzabile;
- facilmente manutenibile.

---

### Evitare duplicazioni

L'AI deve riutilizzare componenti, utility e servizi esistenti quando possibile.

Non deve introdurre codice duplicato.

---

### Modifiche minime

Quando viene richiesto un cambiamento, l'AI deve intervenire esclusivamente sulle parti interessate.

Non deve effettuare refactoring estesi o modifiche non richieste.

---

### Conservare la compatibilità

Ogni modifica deve evitare regressioni e mantenere il funzionamento delle funzionalità esistenti.

## Gestione della documentazione

Se durante lo sviluppo emerge la necessità di modificare una decisione di prodotto o di architettura, l'AI deve segnalarlo.

La documentazione deve essere aggiornata prima dell'implementazione della modifica.

## Comunicazione

L'AI deve:

- spiegare chiaramente le modifiche proposte;
- evidenziare eventuali rischi;
- distinguere i fatti dalle ipotesi;
- evitare cambiamenti impliciti.

## Regole

L'AI non deve mai:

- prendere decisioni di business;
- modificare la Vision del progetto;
- modificare l'architettura senza autorizzazione;
- introdurre dipendenze non approvate;
- rimuovere codice funzionante senza richiesta;
- modificare la documentazione senza indicarlo esplicitamente.

## Definizione di completamento

Un'attività può essere considerata completata solo quando:

- i requisiti sono soddisfatti;
- il codice è coerente con la documentazione;
- non introduce regressioni;
- mantiene gli standard qualitativi del progetto.

## Implicazioni sul progetto

Questo documento rappresenta il contratto operativo tra Zero e qualsiasi assistente AI coinvolto nello sviluppo.

Ogni modello deve rispettare queste regole indipendentemente dal linguaggio, dallo strumento o dall'ambiente utilizzato.