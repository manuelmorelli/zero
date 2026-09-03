---
title: Messaging
doc_id: 19-messaging
version: "1.1"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 11_Database_Architecture
  - 12_MVP_Features
  - 14_UI_Pages
---

# Messaging

## Obiettivo

Definire le regole della messaggistica privata di Zero: chi può scrivere a chi, come funziona l'aggiornamento quasi in tempo reale e cosa resta fuori dalla prima versione (V1).

## Dichiarazione

La messaggistica privata permette a due persone di scriversi direttamente, uno a uno. Non introduce una distinzione tra creator e non-creator: la regola per poter scrivere è identica per chiunque, coerente con il "Modello utente unico" (`00-project-context.md`).

## Chi può scrivere a chi

Due persone possono scriversi se almeno una delle due segue l'altra, anche in una sola direzione — non è necessario il follow reciproco. Questa regola si appoggia sul Follow universale persona-segue-persona (`00-project-context.md`, sezione "Follow universale"), non su un sistema di permessi separato.

Una volta che la conversazione esiste, entrambe le persone possono scrivere liberamente, a prescindere da chi ha seguito chi per primo.

Se in un secondo momento l'unico follow che teneva aperta la conversazione viene rimosso (nessuna delle due direzioni resta attiva), la conversazione resta leggibile con tutta la cronologia, ma la casella di scrittura si disattiva finché non torna almeno un follow in una direzione qualsiasi.

Una nuova conversazione si può iniziare solo dal pulsante "Message" sul Profilo pubblico di un'altra persona (visibile solo se la regola sopra è rispettata). Non esiste un punto d'ingresso che permetta di scrivere a chi non si segue e da cui non si è seguiti.

## Aggiornamento quasi in tempo reale

Zero non usa websocket per nessuna funzionalità. Mentre una conversazione è aperta sullo schermo, il client controlla se sono arrivati nuovi messaggi ogni 15-20 secondi. Il pallino "non letti" sul pulsante Messaggi si spegne nel momento in cui si apre la conversazione (non serve rispondere), e l'aggiornamento si propaga subito al resto del sito senza bisogno di ricaricare la pagina a mano.

Un nuovo messaggio non genera una notifica nella campanella generale: i due canali restano separati, ognuno con il proprio indicatore di non letti.

## Modello dati

Due tabelle nuove (`11_Database_Architecture.md`):

- **Conversation** — le due persone coinvolte (`userAId`/`userBId`, sempre normalizzate in ordine lessicografico sugli id così la coppia ha sempre una sola riga possibile) e la data dell'ultimo messaggio, usata per ordinare l'elenco delle conversazioni.
- **Message** — testo, autore, data, se è stato letto dall'altra persona.

## Cosa resta fuori dalla V1

- Solo testo: niente foto, video o altri allegati nei messaggi.
- Nessuna eliminazione dei messaggi.
- Nessuna chat di gruppo: solo conversazioni uno a uno.
- Nessun punto d'ingresso per iniziare una conversazione oltre al pulsante "Message" sul Profilo.

## Implicazioni sul prodotto

Queste funzionalità potranno essere estese in futuro (allegati, gruppi, eliminazione) senza alterare la regola di base su chi può scrivere a chi.
