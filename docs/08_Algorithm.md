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

Il suo obiettivo è mettere in contatto ogni utente con i Journey più rilevanti per i propri interessi e favorire relazioni durature tra journeyer e community.

La distribuzione dei contenuti deve riflettere i valori del progetto.

## Principi

### Quality Over Virality

La qualità del Journey ha priorità rispetto alla popolarità del singolo contenuto.

---

### Trust First

L'algoritmo favorisce journeyer che dimostrano continuità, trasparenza e coerenza nel tempo.

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

Durante questi 15 giorni il Journey è visibile a **tutti gli utenti**, non solo a chi ha già interessi compatibili con la sua categoria: l'obiettivo è aiutare le persone a scoprire passioni nuove, non solo confermare quelle che hanno già. In Home questo si traduce nella sezione **"Discovering Now"**, senza alcuna personalizzazione per interessi o journeyer seguiti — separata di proposito da "Recommended for you", che resta invece mirata.

Un Journey in Discovery Phase è a tutti gli effetti pubblico: raggiungibile dalla sua pagina, dal profilo del journeyer, dalle categorie, dalla ricerca e dal Feed di chi segue il journeyer, esattamente come un Journey già "maturo". L'unica differenza è che non partecipa ancora al Journey Score (vedi sotto): le sezioni che dipendono dal punteggio (Most Trusted, spinta extra in Recommended) lo ignorano finché la Discovery Phase non è terminata.

Allo scadere dei 15 giorni lo stato passa da `DISCOVERY` a `PUBLISHED`: da quel momento il Journey Score reale prende il controllo per le eventuali spinte extra. La scadenza si valorizza una sola volta, alla prima pubblicazione: un ciclo bozza → ripubblicazione non riapre una seconda Discovery Phase sullo stesso Journey.

## Journey Score

Punteggio 0-100 calcolato per ogni Journey pubblicato, usato **solo** dalle sezioni "bonus" della Discovery (Most Trusted, spinta extra dentro Recommended). Non tocca mai le sezioni base, garantite a tutti dal primo secondo indipendentemente dal punteggio: New Journeys, Latest Videos, Discovering Now, Feed dei journeyer seguiti, raccomandazioni per categoria/interesse.

Combina, con pesi diversi:

- **completamento** (peso maggiore, 50%) — quota di spettatori che hanno visto almeno il 90% degli episodi del Journey; conta a **fasce**, non linearmente, e l'effetto (mai la percentuale in sé) è l'unica cosa che filtra nel ranking:

  | Completamento | Effetto |
  |---|---|
  | 0-25% | Nessuna spinta extra, ma il Journey non è mai nascosto né penalizzato — distribuzione normale |
  | 25-50% | Prima spinta |
  | 50-75% | Spinta maggiore |
  | 75-90% | Top Level |
  | 90%+ | Super Hero Level (massimo) |

  Queste fasce non sono mai visibili al journeyer: nessuna barra di progresso "sei al 40%, ti manca il 10%" — è un meccanismo silenzioso, per evitare la pressione da metriche tipica di altri social;
- **continuità di pubblicazione** (25%) — quanto di recente e con che regolarità il journeyer pubblica nuovi episodi. Un Journey **segnato come finito** dal journeyer ("Mark as completed", riquadro sotto la lista episodi in Dashboard, `Journey.completedAt`) non perde più punti col tempo: la recenza non conta più e la frequenza si misura solo sul periodo in cui è stato pubblicato. Un Journey lasciato a metà continua invece a perderli. Si può riaprire a mano, e si riapre da solo pubblicando un episodio nuovo;
- **tempo di fruizione reale** (15%) — quanto in profondità gli spettatori procedono nel Journey, calcolato sui dati reali di visione (`EpisodeProgress`);
- **follower** (10%) — cappati a una soglia fissa: oltre quella soglia, averne di più non alza ulteriormente il punteggio, per non ricreare la stessa dinamica "vince chi ha più follower" di altri social.

Il reagire "Trusty" su un episodio (vedi sotto) non entra più in questo punteggio: non misura la qualità del singolo episodio, alimenta invece il Trust Level del journeyer.

**Most Trusted** (chiamata "Top Journeys" fino al 24 ottobre 2026) sceglie i candidati tra i Journey con il Journey Score più alto (o i più recenti, sotto la soglia dei 100 Journey pubblicati), non più tra i 50 pubblicati più di recente: un Journey vecchio ma ottimo, anche finito, resta in gara. Se l'utente ha dichiarato interessi, si prendono a parte anche i migliori di quelle categorie.

Il Journey Score si ricalcola **al massimo una volta al giorno** per Journey, non ad ogni richiesta: nessun servizio in background dedicato, il ricalcolo avviene come effetto collaterale della normale lettura di Discovery quando il valore salvato ha più di 24 ore.

## Trust Level

Punteggio 0-100 del journeyer (mostrato come "Trust Score" sul Profilo pubblico, sulla pagina del Journey e nel player). **Non entra in nessuna classifica**: è solo un'informazione mostrata. **Si attiva solo dopo aver caricato il video/card di presentazione** per diventare journeyer: prima di quel momento non esiste alcun punteggio (nessun badge mostrato, non uno zero). Non c'è più nessuna base automatica gratuita.

Una volta attivato, combina:

- **presentazione** (5%) — fissa, ottenuta caricando il video/card di presentazione;
- **qualità** (50%) — media del Journey Score dei Journey pubblicati del journeyer, pesata dalla regola delle 100 persone (sotto);
- **follower** (15%) — cappati con lo stesso principio del Journey Score;
- **attivo** (5%) — il journeyer ha almeno un Journey pubblicato o in Discovery Phase **e** non ha ancora ricevuto il primo avviso di inattività (6 mesi senza pubblicare, 10 se in pausa, vedi `lib/account/creatorLifecycle.ts`);
- **Trusty** (25%) — per ogni episodio con almeno 5 completamenti distinti (`EpisodeProgress.completedAt` valorizzato), quota di quei completatori che hanno anche cliccato "Trusty"; la media di questa quota sugli episodi con abbastanza dati, cappata al 25%. Un episodio senza almeno 5 completamenti reali non conta né in positivo né in negativo — evita che pochi amici bastino a portare il Trusty al massimo. Il click è verificato anche lato server: non si può dare Trusty su un episodio che non si è davvero completato, a prescindere dal bottone in interfaccia. Il journeyer non può darsi Trusty sui propri episodi (bloccato lato server) e non conta mai né tra i completatori né tra chi ha dato Trusty.

**Regola delle 100 persone**: Trusty e qualità crescono col numero di persone diverse (journeyer escluso) che hanno finito almeno un episodio del journeyer, e sono pieni solo da 100 persone in su (es. 20 persone = 20% del loro peso). L'algoritmo non riconosce chi è amico: dà poco peso a **qualunque** pubblico piccolo, così pochi account compiacenti non bastano. Esempi verificati sul codice: 5 amici che guardano tutto e danno sempre Trusty portano a circa 14% (prima circa 80%), 20 amici a circa 25%, un journeyer nuovo onesto resta all'11%. Il riconoscimento di account sospetti (stessa connessione, account creati insieme) è rimandato a quando ci saranno utenti reali: sbaglia facilmente e ha implicazioni privacy.

**Conteggio Trusty**: accanto al punteggio si mostra il numero di persone diverse che hanno dato Trusty ad almeno un episodio del journeyer ("1,240 Trusty", sotto il @nickname sul Profilo e nel pannello del badge), journeyer escluso, anche sui Journey archiviati. Nascosto quando è zero.

**Tetto per esperienza**: sotto i 10 episodi pubblicati (published + discovery, su tutti i Journey del journeyer), il punteggio finale viene scalato in proporzione al numero di episodi pubblicati (es. con 2 episodi, il massimo raggiungibile è il 20% del punteggio pieno) — anche se tutte le altre metriche fossero perfette. Impedisce che un journeyer nuovo arrivi al 100% con pochissimo contenuto pubblicato.

Oltre alla perdita dei 5 punti "attivo" per inattività, scende per segnalazioni confermate manualmente (modello `Report`, già presente nello schema, −10 punti per segnalazione confermata, applicati dopo lo scaling per esperienza): nessun rilevamento automatico di bot, crescita follower artificiale o manipolazione delle metriche — esplicitamente fuori scope per questa fase del prodotto.

## Feed Updates

Gli Update mostrati in Home ("Updates from journeyers you follow") seguono un mix **80/20**: 80% dagli Update dei journeyer già seguiti, 20% da journeyer non ancora seguiti ma potenzialmente interessanti (stesse categorie dei journeyer seguiti o degli interessi dichiarati). Obiettivo: non chiudere questa sezione in una bolla dei soli follow già esistenti, restando comunque dominata da chi l'utente ha scelto di seguire.

## Trasparenza

L'algoritmo deve essere il più possibile comprensibile.

Le logiche principali devono essere documentate e coerenti con i Product Principles.

## Regole

Nessun segnale individuale deve determinare da solo la distribuzione dei contenuti.

La valutazione deve derivare dall'insieme dei comportamenti e dalla qualità complessiva del Journey.

## Implicazioni sul prodotto

Ogni modifica all'algoritmo deve essere coerente con Vision, Mission e Product Principles.

L'algoritmo rappresenta uno strumento al servizio dell'esperienza utente e non il fine della piattaforma.
