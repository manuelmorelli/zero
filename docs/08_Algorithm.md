---
title: Algorithm
doc_id: 08-algorithm
version: "3.2"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 04_Product_Principles
  - 05_Journey
  - 06_User_Experience
  - 07_Creator_Experience
  - 09_Updates
  - 11_Database_Architecture
---

# Algorithm

## Obiettivo

Definire i principi che guidano il sistema di raccomandazione di Zero.

L'algoritmo deve aiutare gli utenti a scoprire Journey di valore, favorendo qualità, fiducia e continuità anziché viralità e consumo compulsivo.

## Dichiarazione

L'algoritmo di Zero non è progettato per massimizzare il tempo trascorso sulla piattaforma.

Il suo obiettivo è mettere in contatto ogni utente con i Journey più rilevanti per i propri interessi e favorire relazioni durature tra creator e community.

La distribuzione dei contenuti deve riflettere i valori del progetto.

## Principi

### Quality Over Virality

La qualità del Journey ha priorità rispetto alla popolarità del singolo contenuto.

---

### Trust First

L'algoritmo favorisce creator che dimostrano continuità, trasparenza e coerenza nel tempo.

---

### Journey First

L'unità di raccomandazione principale è il Journey, non il singolo Episodio.

---

### Personal Relevance

Ogni utente riceve suggerimenti basati sui propri interessi e sul valore percepito, non esclusivamente sui trend globali.

---

### Long-Term Value

I Journey di qualità possono continuare a essere raccomandati anche molto tempo dopo la pubblicazione.

Il valore non dipende dalla novità del contenuto.

## Segnali positivi

L'algoritmo può considerare, tra gli altri:

- continuità del Journey;
- qualità percepita dagli utenti;
- completamento dei Journey;
- tempo di fruizione significativo;
- ritorno spontaneo degli utenti;
- crescita organica della community;
- coerenza del percorso.

## Segnali negativi

L'algoritmo deve ridurre la visibilità di comportamenti come:

- pubblicazione eccessiva di contenuti a basso valore;
- pratiche finalizzate esclusivamente ad aumentare l'engagement;
- contenuti fuorvianti;
- spam;
- manipolazione artificiale delle metriche.

## Discovery Phase

Ogni Journey appena pubblicato entra automaticamente in Discovery Phase per **15 giorni** (`Journey.status: DISCOVERY`, scadenza salvata in `Journey.discoveryEndsAt`).

Durante questi 15 giorni il Journey è visibile a **tutti gli utenti**, non solo a chi ha già interessi compatibili con la sua categoria: l'obiettivo è aiutare le persone a scoprire passioni nuove, non solo confermare quelle che hanno già. In Home questo si traduce nella sezione **"Discovering Now"**, senza alcuna personalizzazione per interessi o creator seguiti — separata di proposito da "Recommended for you", che resta invece mirata.

Un Journey in Discovery Phase è a tutti gli effetti pubblico: raggiungibile dalla sua pagina, dal profilo del creator, dalle categorie, dalla ricerca e dal Feed di chi segue il creator, esattamente come un Journey già "maturo". L'unica differenza è che non partecipa ancora al Journey Score (vedi sotto): le sezioni che dipendono dal punteggio (Top Journeys, spinta extra in Recommended) lo ignorano finché la Discovery Phase non è terminata.

Allo scadere dei 15 giorni lo stato passa da `DISCOVERY` a `PUBLISHED`: da quel momento il Journey Score reale prende il controllo per le eventuali spinte extra. La scadenza si valorizza una sola volta, alla prima pubblicazione: un ciclo bozza → ripubblicazione non riapre una seconda Discovery Phase sullo stesso Journey.

## Journey Score

Punteggio 0-100 calcolato per ogni Journey pubblicato, usato **solo** dalle sezioni "bonus" della Discovery (Top Journeys, spinta extra dentro Recommended). Non tocca mai le sezioni base, garantite a tutti dal primo secondo indipendentemente dal punteggio: New Journeys, Latest Videos, Discovering Now, Feed dei creator seguiti, raccomandazioni per categoria/interesse.

Combina, con pesi diversi:

- **completamento** (peso maggiore) — quota di spettatori che hanno visto almeno il 90% degli episodi del Journey; conta a **fasce**, non linearmente, e l'effetto (mai la percentuale in sé) è l'unica cosa che filtra nel ranking:

  | Completamento | Effetto |
  |---|---|
  | 0-25% | Nessuna spinta extra, ma il Journey non è mai nascosto né penalizzato — distribuzione normale |
  | 25-50% | Prima spinta |
  | 50-75% | Spinta maggiore |
  | 75-90% | Top Level |
  | 90%+ | Super Hero Level (massimo) |

  Queste fasce non sono mai visibili al creator: nessuna barra di progresso "sei al 40%, ti manca il 10%" — è un meccanismo silenzioso, per evitare la pressione da metriche tipica di altri social;
- **continuità di pubblicazione** — quanto di recente e con che regolarità il creator pubblica nuovi episodi;
- **tempo di fruizione reale** — quanto in profondità gli spettatori procedono nel Journey, calcolato sui dati reali di visione (`EpisodeProgress`);
- **follower** — cappati a una soglia fissa: oltre quella soglia, averne di più non alza ulteriormente il punteggio, per non ricreare la stessa dinamica "vince chi ha più follower" di altri social;
- **like** — segnale di qualità, ma con un peso volutamente basso (5%): Zero non è un social basato su like o views.

Il Journey Score si ricalcola **al massimo una volta al giorno** per Journey, non ad ogni richiesta: nessun servizio in background dedicato, il ricalcolo avviene come effetto collaterale della normale lettura di Discovery quando il valore salvato ha più di 24 ore.

## Trust Level

Punteggio 0-100 del creator (mostrato come "Trust Score" sul Profilo pubblico). Sale con la continuità di pubblicazione e con la qualità dei propri Journey (media del loro Journey Score), oltre che con i follower, cappati con lo stesso principio del Journey Score.

Scende **solo** per segnalazioni confermate manualmente (modello `Report`, già presente nello schema): nessun rilevamento automatico di bot, crescita follower artificiale o manipolazione delle metriche — esplicitamente fuori scope per questa fase del prodotto.

## Feed Updates

Gli Update mostrati in Home ("Updates from creators you follow") seguono un mix **80/20**: 80% dagli Update dei creator già seguiti, 20% da creator non ancora seguiti ma potenzialmente interessanti (stesse categorie dei creator seguiti o degli interessi dichiarati). Obiettivo: non chiudere questa sezione in una bolla dei soli follow già esistenti, restando comunque dominata da chi l'utente ha scelto di seguire.

## Trasparenza

L'algoritmo deve essere il più possibile comprensibile.

Le logiche principali devono essere documentate e coerenti con i Product Principles.

## Regole

Nessun segnale individuale deve determinare da solo la distribuzione dei contenuti.

La valutazione deve derivare dall'insieme dei comportamenti e dalla qualità complessiva del Journey.

## Implicazioni sul prodotto

Ogni modifica all'algoritmo deve essere coerente con Vision, Mission e Product Principles.

L'algoritmo rappresenta uno strumento al servizio dell'esperienza utente e non il fine della piattaforma.
