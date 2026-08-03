---
title: UI Pages
doc_id: 14-ui-pages
version: "3.6"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 06_User_Experience
  - 07_Creator_Experience
  - 09_Updates
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

Punto di accesso principale alla piattaforma, identico per ogni persona che ha fatto login — creator o no.

Zero non separa "utenti" e "creator" come ruoli con destinazioni diverse: ogni persona può seguire Journey altrui e, allo stesso tempo, avere un proprio Journey da gestire. Per questo l'accesso dopo il login porta sempre alla Home, mai direttamente alla Dashboard.

Si apre con una Hero a schermo intero: logo "ZERO", tagline e le due azioni principali ("Explore Journeys" ed "Create Your Journey"). Non è una sezione di Discovery: è il biglietto da visita della piattaforma, identico per chiunque arrivi in Home, loggato o no.

Subito sotto la Hero, tre righe scorrevoli orizzontalmente (stile Netflix) mostrano contenuti globali della piattaforma, non personalizzati su chi l'utente segue:

- **Journeys of the Moment** — i Journey pubblicati più seguiti e rilevanti del momento;
- **Latest Videos** — gli ultimi Episodi con un video caricato, pubblicati su tutta la piattaforma;
- **Top Journeys** — i Journey pubblicati più seguiti in assoluto, con il conteggio dei loro Episodi.

Il resto della pagina segue, in quest'ordine:

- Continue Your Journey;
- Feed dei creator seguiti;
- Updates dei creator seguiti;
- Recommended Journeys;
- Creator consigliati;
- New Journeys;
- Most Completed Journeys;
- Categories.

Le tre righe subito sotto la Hero danno alla Home un primo colpo d'occhio ricco anche a chi non segue ancora nessuno; il resto della pagina torna a riflettere la vicinanza all'utente: prima tutto ciò che riguarda le persone che segue già (continuità, Feed, Updates — massima rilevanza personale secondo `08_Algorithm.md`), poi ciò che aiuta a scoprire persone nuove (Recommended Journeys, Creator consigliati), infine i contenuti globali uguali per tutti (New Journeys, Most Completed Journeys), con Categories in fondo come strumento di navigazione libera per chi non ha trovato nulla di rilevante nelle sezioni precedenti.

Il Feed dei creator seguiti e gli Updates dei creator seguiti sono due sezioni distinte, non intercambiabili: il Feed mostra eventi permanenti del Journey (nuovi Journey pubblicati, nuovi Episodi), gli Updates mostrano i contenuti brevi e temporanei descritti in `09_Updates.md`. Un creator seguito può comparire in una sezione, nell'altra, in entrambe o in nessuna delle due, a seconda di cosa ha effettivamente pubblicato.

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

### Profilo

Rappresenta una persona, non un ruolo: è la stessa pagina per chiunque abbia un account Zero, con o senza Journey pubblicati. Visibile a chiunque, anche senza login — distinta dalla Dashboard, che è privata e riservata alla persona proprietaria.

Se la persona ha pubblicato uno o più Journey, questi compaiono nel suo profilo.

Contiene:

- informazioni della persona;
- Journey pubblicati (se presenti);
- Community Premium (se attiva);
- prodotti e servizi (se offerti);
- workshop ed eventi (se organizzati).

---

### Pagina Journey

Rappresenta il cuore della piattaforma.

Contiene:

- Presentazione;
- Episodi, in sequenza lineare;
- Capitoli, quando il creator li ha usati per organizzare gli Episodi;
- avanzamento dell'utente;
- strumenti di condivisione.

---

### Pagina Episodio

Visualizza un singolo Episodio mantenendo il contesto del Journey.

L'utente può passare facilmente all'episodio precedente o successivo.

## Area autenticata

### Dashboard

Centro operativo di chi sta pubblicando un Journey.

Non è una pagina di destinazione: vi si accede tramite un link dalla Home, disponibile solo a chi ha pubblicato (o sta per pubblicare) un Journey. Chi la usa può sempre tornare a vedere il proprio Journey come lo vede un lettore reale, aprendo il proprio Profilo o la Pagina Journey pubblica da qui.

Permette di:

- gestire Journey;
- gestire Episodi;
- gestire facoltativamente i Capitoli;
- pubblicare Updates;
- gestire Community Premium;
- gestire prodotti;
- consultare Analytics.

---

### Editor Journey

Permette di modificare la struttura completa del Journey.

Il creator può:

- modificare la Presentazione;
- creare Episodi;
- organizzare facoltativamente gli Episodi in Capitoli;
- modificare i contenuti;
- riordinare gli Episodi — e, se presenti, i Capitoli — tramite drag & drop.

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