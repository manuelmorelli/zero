---
title: Verso l'online
doc_id: 100-verso-online
version: "1.0"
status: living
related_docs:
  - 91_Legal_Audit_And_Roadmap
  - 94_Product_Backlog
---

# Verso l'online

Questo documento è scritto per Manuel, in italiano semplice, senza termini tecnici. Dice a che punto siamo per portare Zero online, almeno come beta privata su invito per poche persone scelte da lui. Si aggiorna ogni volta che qualcosa di questa lista cambia. Se perdi una chat con Claude, puoi aprire questo file e leggerlo direttamente, oppure aprire una chat nuova e scrivere "a che punto siamo con Zero".

## Fatto

- **Controllo di sicurezza di tutto il sito** (30 ott 2026): nessuna falla seria. Nessuno può leggere o modificare dati di un altro utente, i lavori automatici del sito sono protetti da password segrete, il pannello di amministrazione è blindato, gli upload controllano tipo e dimensione del file. Tre piccole cose da migliorare con calma, non urgenti, elencate in `94_Product_Backlog.md` (voce S22).
- **Cancello d'ingresso a codice** (30 ott 2026): chi non ha il codice che dai tu non entra nel sito. Si attiva da solo quando impostiamo la parola segreta su Vercel.
- **Registrazioni chiuse** (30 ott 2026): chi entra con il codice può solo navigare e guardare i video già pubblicati, non può crearsi un account, quindi nemmeno pubblicare o caricare video. Tu continui ad accedere normalmente con il tuo account.
- **Controllo automatico che il codice non si rompa** (30 ott 2026): da ora, ogni volta che il codice viene modificato, un servizio gratuito di GitHub lo controlla da solo e segnala se qualcosa non va, prima che arrivi online.

## In corso

- **Test automatici che aprono il sito vero e controllano che funzioni davvero** (registrarsi, entrare, guardare un video, seguire, pubblicare un Journey): in lavorazione in una chat dedicata, partita il 30 ott 2026.

## Rimandato (tua scelta, non dimenticato)

- **Avviso automatico se il sito si rompe o va giù**: una mail o una notifica sul telefono che arriva direttamente a te, non a Claude, nel momento in cui il sito ha un problema vero. Richiede di scegliere un servizio gratuito esterno (10 minuti per impostarlo). Hai detto di parlarne più avanti: resta comunque da fare prima di invitare le prime persone.

## Da fare, ultimo passaggio tecnico

- **Collegare il dominio** zerojourneys.com (già tuo, comprato su Cloudflare) al servizio che farà girare il sito online (Vercel).
- **Spostare le chiavi vere** (database, foto/video, email, AI) dal tuo computer a Vercel, nel suo pannello protetto.
- Fatto questo, e chiusi i due punti sopra, si può invitare la prima persona.

## Cose note, lasciate così per scelta

- **Nessuna entità legale registrata dietro Zero**: per un gruppo chiuso di persone che inviti tu di persona il rischio è basso. Da registrare prima di aprire al pubblico vero.
