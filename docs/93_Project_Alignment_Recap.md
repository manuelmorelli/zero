---
title: Project Alignment Recap
doc_id: 93-project-alignment-recap
version: "0.2"
status: living
related_docs:
  - 99_Current_Project_Status
  - 10_Monetization
  - 91_Legal_Audit_And_Roadmap
  - 92_Project_History
  - 98_Product_Review
---

# Project Alignment Recap

Diario delle sessioni di allineamento avviate il 2026-09-17 per dare a Manuel un quadro completo e ordinato di Zero: cosa è stato costruito, punti di forza e debolezza, cosa manca per diventare un progetto reale, finanziabile e online. Sostituisce la necessità di ricostruire il quadro generale a ogni chat: chi riprende un punto legge prima questo documento.

## Regole del processo

- Un punto alla volta: si passa al successivo solo dopo conferma esplicita di Manuel che quello attuale è chiuso.
- Alla chiusura di un punto: si produce un riepilogo esportabile, Manuel lo copia nella cartella personale `Desktop\Zero - Punti Chiusi`, e il punto successivo parte in una nuova chat.
- Nessuna attivazione di servizi a pagamento finché Manuel non decide di spendere: l'obiettivo delle parti infrastrutturali è avere tutto pronto e testato gratis/in locale, non attivarlo.
- A ogni nuovo punto, prima di partire si aggiorna la ricerca online già fatta nei punti precedenti (crediti cloud, normative, benchmark di mercato), non solo l'argomento nuovo.
- Obiettivo finale dichiarato: un progetto completo, funzionante, con un piano di guadagno reale (anche se ipotetico) per Zero e per i creator, e un dossier credibile per investitori o programmi di crediti cloud gratuiti.

## Elenco punti

| # | Punto | Stato |
|---|---|---|
| 0 | Fotografia generale | ✅ Chiuso (2026-09-17) |
| 1 | Prodotto e esperienza utente | ✅ Chiuso (2026-09-20) |
| 2 | Esperienza Creator | ✅ Chiuso (2026-09-20) |
| 3 | Monetizzazione (Business Model) | ✅ Chiuso (2026-09-21) |
| 4 | Algoritmo e Discovery | ⬜ Da fare |
| 5 | Trust & Safety (Trust Score + moderazione contenuti) | ⬜ Da fare |
| 6 | Legale (Privacy, Termini, Cookie — continua `91_Legal_Audit_And_Roadmap.md`) | ⬜ Da fare |
| 7 | Infrastruttura tecnica (readiness) | ⬜ Da fare |
| 8 | Piano di lancio | ⬜ Da fare |
| 9 | Business Plan / Dossier investitori (Mercato, Team, Trazione, Piano Finanziario, la Richiesta) | ⬜ Da fare |

## Punto 0 — Fotografia generale

### Cosa è stato costruito (solido, verificato)

- **Percorso Creator completo**: creazione Journey → Capitoli → Episodi, modifica, Publish/Unpublish, riordino via drag & drop. Verificato end-to-end su dati reali, considerato chiuso.
- **Discovery**: Home con Recommended, Feed dei creator seguiti, New Journeys, Categorie, ricerca Journey/Creator, Follow universale persona-a-persona.
- **Updates in stile Stories**: tutti i formati (testo, foto, video, sondaggio, domanda), scadenza automatica 24h, nessun cron job necessario.
- **Messaggistica 1:1**, sbloccata da un follow in una sola direzione.
- **Video reale**: upload diretto su Cloudflare R2, player interno con ripresa esatta della posizione, versioni leggere pronte ma volutamente non attivate (nessun costo finché non ci sono utenti reali).
- **Trust Score**: già un algoritmo reale (non un numero finto), basato su qualità dei Journey e follower.

### Correzione importante rispetto a quanto si pensava

Controllando il codice reale (non solo la documentazione), **l'infrastruttura è più avanti di quanto sembrasse all'inizio di questa chat**: Neon (database), Cloudflare R2 (storage) e Resend (email) sono già collegati con account reali e usati nei test end-to-end — non sono semplici placeholder. Resta da fare, per ciascuno, solo il passaggio "da test a produzione" (es. dominio email verificato). **L'unico dei quattro servizi completamente non collegato è Stripe** (pagamenti). Questo significa che il traguardo "a tre click dall'online" è più vicino di quanto temuto — lo verificheremo nel dettaglio al Punto 6.

### Punti deboli confermati (letti direttamente nel codice/documenti, non per sentito dire)

- **Monetizzazione**: `10_Monetization.md` contiene solo principi, nessun numero, nessuna percentuale, nessun meccanismo tecnico. Testuale: "le percentuali... sono definite a livello di business" — cioè non sono mai state decise. Conferma la preoccupazione di Manuel.
- **Creator Economy (Fase 4 della Roadmap) non è ancora iniziata**: Community Premium, integrazione Stripe, Analytics, Creator Insights, Monetization Dashboard sono tutti segnati "non iniziato". Non è un allarme: è sequenziato correttamente. Stripe offre una modalità di prova (sandbox) completamente gratuita — si può costruire e testare tutto il meccanismo di pagamento senza spendere nulla, esattamente come già fatto per database/email/storage, lasciando solo l'attivazione dei pagamenti veri come ultimo passo prima del lancio (Punto 3 per decidere il meccanismo, Punto 7 per costruirlo).
- **Moderazione dei contenuti**: esiste nel database una tabella pensata per le segnalazioni (`Report`), ma non è collegata a nessun pulsante o funzione reale — un utente non può segnalare nulla oggi. Già annotato come decisione aperta in `91_Legal_Audit_And_Roadmap.md`, mai presa.
- **Nessun controllo età minima** in registrazione.
- **Fase 5 (Preparazione al lancio)** non iniziata: nessun audit di sicurezza, nessuna suite di test automatizzata permanente, nessun deploy. Per scelta di Manuel, questa fase resta in pausa finché non ci saranno fondi/utenti reali, non è un'urgenza.

### Punti di forza per un investitore

- Prodotto core (creazione contenuti, Discovery, engagement) completo e testato, non un mockup.
- Principio distintivo reale e già implementato: la monetizzazione non può comprare visibilità (regola scritta e rispettata nel codice del ranking).
- Trust Score come meccanismo di fiducia già funzionante, differenziante rispetto a piattaforme social generiche.

### Stato del punto

Chiuso il 2026-09-17, confermato da Manuel. Riepilogo esportato in `Desktop\Zero - Punti Chiusi\Punto 0 - Fotografia Generale.md`.

## Punto 1 — Prodotto ed esperienza utente

### Cosa è stato confermato solido (letto nel codice reale)

- **Home**: struttura reale e coerente (Hero con Stories, Continue Watching, Recommended unificato, Discovering Now, Top Journeys, Latest Videos, Wildcards to follow, Categories) — non un mockup, dati veri.
- **Updates in stile Stories**: tutti i 5 formati funzionanti, scadenza automatica 24h.
- **Messaggistica**: 1:1 testo, sbloccata da un follow in una direzione — scelta più prudente rispetto a come Instagram gestisce oggi i messaggi da non-follower.
- **Menu laterale + Settings**: area reale, non placeholder (password/email/notifiche vere).
- **Principio "il pagamento non influenza il ranking"**: già nel codice, e la ricerca di mercato conferma che risponde a un problema concreto e attuale (vedi sotto).

### Correzione importante emersa durante il punto

Il presunto "buco" sul meccanismo Hero/dati veri **non esiste più**: verifica diretta sul database reale (query, non solo memoria) confermata da Manuel — oggi ci sono 4 Journey pubblicati reali (i suoi stessi test, usciti dalla fase Discovery), la Home mostra quei dati veri, il fallback demo non è più attivo. Corretto anche l'errore in una memoria precedente che dava questo punto come ancora aperto.

### Punti deboli/aperture confermati

- **Nessuna verifica dell'età minima in registrazione** (nessun controllo per gli under 16) e **nessuna riflessione sui dati minimi da raccogliere** in fase di iscrizione (rischio legale/GDPR). Nuovo, aggiunto al backlog.
- **Tasto "indietro"**: i bug concreti trovati in passato sono risolti, ma resta "macchinoso" nella sensazione d'uso secondo Manuel — causa precisa ancora da chiarire. Aggiunto al backlog.
- **Nessuna moderazione/segnalazioni collegata**: esiste solo la tabella nel database, nessun pulsante reale. Già discusso e **volutamente retrocesso in fondo alla lista priorità** in una sessione parallela dello stesso giorno — non è più considerato urgente per l'esperienza utente.
- Voci già tracciate in precedenza e solo confermate qui, senza nuove decisioni: skip-back 15s nel player, compressione upload (con l'attenzione che la promessa pubblica "zero compressione video" su "Know the Algorithm" potrebbe dover essere rivista per sostenibilità economica a scala).

Tutte le voci nuove/aperte sono nel registro unico `docs/94_Product_Backlog.md`, non ripetute qui.

### Ricerca di mercato aggiornata rilevante per questo punto

- Nessun concorrente diretto 1:1: le piattaforme community/corsi (Skool, Circle, Mighty Networks) non fanno percorsi narrativi a Capitoli/Episodi; le piattaforme di narrativa seriale (Wattpad, Tapas) fanno fiction scritta, non contenuti reali di vita. Zero è una categoria a sé — buon argomento per un dossier investitori.
- Il principio "pagamento non compra visibilità" risponde a un problema reale e attuale del mercato: il 10% dei creator guadagna il 62% dei pagamenti totali, e gli algoritmi (es. TikTok) possono far crollare la visibilità di un creator dall'oggi al domani con un solo aggiornamento.
- Formato Stories/effimero ed empty-state con contenuti demo: entrambi allineati alle best practice UX 2026 confermate da più fonti indipendenti.
- Messaggi sbloccati da un follow in una direzione: più restrittivo (quindi più sicuro) di quanto fa oggi Instagram con le richieste di messaggio da non-follower.

### Punti di forza per un investitore

- Prodotto core dell'esperienza utente (Discovery, Stories, Messaggi) reale, testato, coerente — non un mockup.
- Categoria di prodotto senza concorrente diretto identificato.
- Principio anti-pay-to-rank ora sostenuto da dati di mercato concreti, non solo da un valore dichiarato.

### Stato del punto

Chiuso il 2026-09-20, confermato da Manuel. Riepilogo esportato in `Desktop\Zero - Punti Chiusi\Punto 1 - Prodotto e Esperienza Utente.md`.

## Punto 2 — Esperienza Creator

### Cosa è stato confermato solido (letto nel codice reale)

- **Diventare creator è automatico e invisibile**: nessuna schermata di iscrizione separata. Basta pubblicare qualcosa e il profilo Creator viene creato al volo (`lib/creator.ts`), coerente con il principio "modello utente unico" già in `00-project-context.md`.
- **Percorso di creazione/gestione già chiuso al Punto 0** riconfermato: Journey → Capitoli → Episodi, modifica, Publish/Unpublish, Archive, drag & drop.
- **Pannello statistiche nella Dashboard** — Total views, tasso di completamento, Completions, Interactions: numeri reali calcolati dal database, senza dati finti né trend inventati.

### Correzione importante emersa durante il punto

I documenti (`99_Current_Project_Status.md`) davano ancora le Analytics del creator come "placeholder — coming soon" e la Roadmap le segnava "non iniziate" (Fase 4). Verifica diretta nel codice (`lib/dashboard/creatorStats.ts`, `PrivateStatsPanel.tsx`): sono reali e già in produzione, solo in versione base — nessuno storico, nessuna suddivisione per fonte di ricavo. Stesso tipo di scostamento documenti/codice già trovato al Punto 1 con l'Hero. Corretto in questa sessione in `99_Current_Project_Status.md`.

### Scoperta durante il punto: Trust Score e Trusty già in lavorazione altrove

Durante questo punto è emerso che **un'altra sessione**, in parallelo a questa, stava già costruendo (codice non ancora salvato su Git al momento della scoperta) esattamente le due voci che il backlog aveva segnalato come aperte per il Trust Score:

- Eliminata la base automatica di 30 punti: il Trust Score ora si attiva **solo** dopo che il creator carica un video/card di presentazione (prima: nessun badge, non uno zero).
- Formula attivata: presentazione 10% (fissa) + Trusty 2% (reazioni, cappate) + follower 20% + qualità 58% (media Journey Score) + Journey live 10% − 10 per segnalazione confermata.
- Il vecchio bottone Like è stato rinominato **"Trusty"**: si sblocca solo a fine visione dell'episodio, e non pesa più nella qualità del singolo Journey (quel 5% è confluito nel peso del completamento, ora 50%).

Manuel ha confermato (in questa stessa sessione) che questo lavoro è reale e voluto, fatto in un'altra chat. **Resta un gap aperto anche in quel lavoro**: non esiste ancora nessuna interfaccia per caricare il video/card di presentazione — quindi, a oggi, il Trust Score è disattivato per ogni creator esistente, incluso Manuel stesso. Non è stato deciso in questo punto (competenza dei Punti 4/5), solo osservato e registrato per accuratezza: la formula descritta sopra è quella reale al 2026-09-20, non quella vecchia a base 30 citata ai Punti 0/1.

### Punti deboli/aperture confermati

- **Tutto ciò che genera reddito diretto per il creator è a zero, non parziale**: Community Premium, Stripe, Payouts (`/settings/creator`), Pricing (`/pricing`), Subscription (`/settings/subscription`) — tutte pagine reali ma con testo "Coming soon", nessun collegamento funzionante. Confermato da Manuel che va costruito, ma resta volutamente per ultimo: prima si costruisce tutto il motore gratis/in locale, Stripe si collega solo alla fine, appena prima di andare online ("prima il motore, poi le chiavi della macchina").
- Nessuno strumento per workshop, eventi, prodotti digitali o servizi professionali (previsti come "Strumenti" in `07_Creator_Experience.md`, mai costruiti).
- Il pannello Analytics resta minimo rispetto ai concorrenti diretti di community/creator tools (vedi ricerca sotto) — per scelta di prodotto confermata da Manuel in questa sessione: deve restare intuitivo per il creator e semplice da costruire, non deve rincorrere la complessità dei concorrenti (cohort analysis, previsione abbandono) solo perché ce l'hanno loro.
- Video di presentazione del creator per attivare il Trust Score: schema pronto, nessuna interfaccia di caricamento — vedi sopra.

### Ricerca di mercato aggiornata rilevante per questo punto

- **Commissioni tipiche su piattaforme creator comparabili** (dato utile per orientare il Punto 3, non deciso qui): Ko-fi 5%, Patreon 8-12% (12-15% effettivo con le commissioni di pagamento), Substack 10% (~13% effettivo), Skool ~10% tutto incluso.
- **Piattaforme community concorrenti** (Skool, Circle, Mighty Networks) offrono pannelli statistiche più maturi di quello attuale di Zero: cohort analysis, previsione abbandono, report automatici via email. Zero è più semplice ma anche più onesto (zero numeri finiti/trend inventati) — scelta di prodotto deliberata, non un ritardo da colmare subito.
- **Dimensione del mercato creator economy 2026**: stime discordanti tra fonti indipendenti (da 214 a 323 miliardi di dollari secondo la fonte) — nessun numero singolo abbastanza affidabile da citare a un investitore senza ulteriore verifica mirata.
- **Normativa fiscale USA sui pagamenti ai creator** (soglia di reporting 1099-K): le fonti trovate nel 2026 sono in disaccordo tra loro (alcune indicano un ritorno a 20.000$/200 transazioni, altre 600$) — materia instabile, da chiarire con precisione al Punto 6 (Infrastruttura/Legale), non blocca nulla ora.
- **Programmi di crediti cloud** (refresh richiesto dal processo): nessuna novità rispetto a quanto già noto — Cloudflare for Startups, Google for Startups Cloud (fino a 350.000$ per startup orientate AI), AWS Activate, Microsoft for Startups tutti ancora attivi e gratuiti all'iscrizione.

### Punti di forza per un investitore

- Percorso creator completo e testato end-to-end, non un mockup — confermato di nuovo in questo punto.
- Analytics oneste (zero numeri finti) rafforzano lo stesso principio di trasparenza già mostrato ai Punti 0 e 1 ("il pagamento non compra visibilità") — coerenza di valori lungo tutto il prodotto, non solo a parole.
- Il Trust Score, appena rivisto, lega la fiducia del creator a segnali reali (presentazione, completamento, qualità) invece che a un punteggio di partenza gratuito — differenziazione concreta rispetto ai social generalisti, anche se resta da attivare con l'interfaccia di caricamento mancante.
- Il gap economico per il creator è identificato con precisione e sequenziato per scelta (Stripe per ultimo, non per trascuratezza): una storia chiara da raccontare a un investitore, non un buco nascosto.

### Stato del punto

Chiuso il 2026-09-20, confermato da Manuel. Riepilogo esportato in `Desktop\Zero - Punti Chiusi\Punto 2 - Esperienza Creator.md`.

## Punto 3 — Monetizzazione (Business Model)

### Situazione di partenza

`docs/10_Monetization.md` conteneva solo principi generali, nessun numero: testuale, "le percentuali... sono definite a livello di business" — mai decise davvero. Nessuna fonte di ricavo era costruita, incluse quelle segnate solo come "Coming soon" nelle pagine reali del prodotto (Community Premium, pubblicità, Stripe/Payouts).

### Decisioni prese in questo punto

- **Ordine di attivazione delle fonti** (non tutte insieme): 1) pubblicità contestuale, 2) tips/donazioni, 3) Community Premium + eventi/workshop + consulenze 1:1 + prodotti digitali (stesso gruppo, stesso meccanismo).
- **Percentuali**: pubblicità 60% creator / 40% Zero; tips e gruppo 3 al 90% creator / 10% Zero; marketplace sponsorizzazioni 10% trattenuto solo dal brand; sponsorizzazioni dirette creator-brand fuori piattaforma non toccate da Zero (100% creator, solo obbligo di dichiararle visibilmente).
- **Pagamenti ai creator**: cadenza mensile (non ogni 15 giorni: raddoppierebbe i costi fissi di ogni bonifico, e nessun concorrente studiato paga più spesso del mese), soglia minima di pagamento ~100 nella valuta locale. Dettagli fiscali per paese (Unione Europea, Svizzera, resto del mondo) rimandati al Punto 6 legale.
- **Chiarito "prodotti digitali"** (parola presente nei documenti ma mai definita): file/accessi vendibili illimitatamente senza spedizione fisica (e-book, corsi, template, guide scaricabili) — confermato da Manuel, unito nello stesso gruppo economico di consulenze 1:1 ed eventi/workshop.
- **Sponsorizzazioni brand-creator**: distinzione tra accordo privato (Zero non trattiene nulla, solo tag "contenuto sponsorizzato" obbligatoria) e futuro marketplace interno stile TikTok Creator Marketplace (Zero trattiene commissione solo dal brand, non dal creator) — collega e attiva le idee già presenti in backlog (sezione sponsor, marketplace UGC).
- Meccanismo tecnico dei pagamenti (Stripe Connect: Standard/Express/Custom) discusso solo a livello concettuale, decisione rimandata al Punto 7 (costruzione), non blocca le percentuali decise qui.

Tutto scritto in `docs/10_Monetization.md` (versione 4.0). Le voci ancora da costruire sono registrate in `docs/94_Product_Backlog.md`.

### Ricerca di mercato aggiornata rilevante per questo punto

- **Split pubblicitario di riferimento**: YouTube paga 55% al creator / 45% alla piattaforma, invariato dal 2007, uguale per canali piccoli e grandi — Zero parte da 60/40, leggermente più generoso verso i creator per compensare la mancanza di rete propria nella fase iniziale.
- **Pagamenti YouTube**: mensili, soglia minima 100$, pagamento tra il 21 e il 26 del mese — modello di riferimento diretto per la cadenza scelta da Zero.
- **Commissioni su tips/abbonamenti dei concorrenti diretti**: Ko-fi 0% (piano gratuito), Buy Me a Coffee 5%, Passes 10%, Substack/Patreon ~10% (12-15% con le commissioni di pagamento incluse), OnlyFans 20% fisso — il 10% scelto da Zero è in linea con la fascia bassa/onesta del mercato.
- **Sponsorizzazioni brand-creator**: TikTok Creator Marketplace trattiene circa il 10% dal brand e zero dal creator — stesso schema scelto da Zero per il futuro marketplace interno.
- **Obblighi di trasparenza (FTC, USA)**: ogni collegamento materiale tra brand e creator va dichiarato in modo visibile e non ambiguo ("#ad" esplicito, non "#collab"); le sanzioni nel 2026 sono salite fino a oltre 50.000$ a violazione — rafforza la scelta di rendere obbligatoria la tag sponsorizzata fin da subito, anche prima di costruire il marketplace.
- **Normativa fiscale USA aggiornata** (incerta al Punto 2): il 1099-K è tornato alla soglia storica di 20.000$ e 200 transazioni — meno burocrazia automatica per i creator piccoli rispetto a quanto temuto.
- **Reti pubblicitarie adatte a una piattaforma piccola**: esistono alternative concrete a Google AdSense pensate per publisher piccoli o contenuti video (Media.net, Ezoic/Humix, Primis), compatibili con l'approccio "contestuale, non invasivo" già scritto nel documento.

### Punti di forza per un investitore

- Modello di monetizzazione ora concreto e citabile (percentuali, ordine, cadenza), non solo un principio dichiarato — colma esattamente la debolezza più visibile individuata al Punto 0.
- Split pubblicitario più generoso di YouTube verso i creator: argomento di acquisizione concreto per attrarre creator da altre piattaforme.
- Coerenza mantenuta con il principio "il pagamento non compra visibilità" anche nelle nuove regole su pubblicità e sponsorizzazioni.
- Approccio disciplinato sui costi: cadenza di pagamento e soglie scelte guardando ai costi reali di ogni transazione, non per copiare la concorrenza senza motivo.

### Nota aperta, non risolta in questo punto

Manuel ha chiesto se, a un incasso pubblicitario lordo di 1 milione, il 40% trattenuto da Zero basterebbe a sostenere la piattaforma. Risposta onesta: dipende dai costi operativi reali (hosting, sviluppo, team) che non sono ancora stimati con numeri veri — argomento di competenza del Punto 9 (Business Plan/Piano Finanziario), dove si costruiranno proiezioni con numeri reali invece che risposte a intuito. Segnato qui per non perderlo.

### Stato del punto

Chiuso il 2026-09-21, confermato da Manuel. Riepilogo da esportare in `Desktop\Zero - Punti Chiusi\Punto 3 - Monetizzazione.md`.
