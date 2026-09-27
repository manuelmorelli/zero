---
title: Project Alignment Recap
doc_id: 93-project-alignment-recap
version: "0.5"
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
| 4 | Algoritmo e Discovery | ✅ Chiuso (2026-09-21) |
| 5 | Trust & Safety (Trust Score + moderazione contenuti) | ✅ Chiuso (2026-09-21) |
| 6 | Legale (Privacy, Termini, Cookie — continua `91_Legal_Audit_And_Roadmap.md`) | ✅ Chiuso (2026-09-22) |
| 7 | Struttura pagine Creator Economy (Community Premium, Prodotti/Servizi, Workshop/Eventi — le "Strumenti" mai costruiti di `07_Creator_Experience.md`) | ✅ Chiuso (2026-09-22) |
| 8 | AI sulla piattaforma (nuovo, mai discusso prima, portato da Manuel da una conversazione separata con Claude) | 🟢 Costruito (2026-09-25/27) — chiusura formale da confermare con Manuel |
| 9 | Business Plan / Dossier investitori (Mercato, Team, Trazione, Piano Finanziario, la Richiesta) | ⬜ Da fare |
| 10 | Infrastruttura tecnica e pagamenti (hosting, sicurezza, test, monitoraggio, Stripe Connect reale) | ⬜ Da fare |
| 11 | Piano di lancio | ⬜ Da fare |

**Riordino deciso il 2026-09-22** (sostituisce l'elenco originale a 10 punti): i Punti 7-9 originali (Infrastruttura tecnica, Piano di lancio, Business Plan) sono stati riorganizzati in 5 punti. Motivo: prima chiarire come guadagnano i creator con le loro skills (pagine/strumenti mancanti) prima di costruire il meccanismo tecnico dei pagamenti dietro; il Business Plan non dipende dall'infrastruttura pronta e viene prima per chiarire quali pezzi di infrastruttura contano davvero per un investitore; il Piano di lancio resta per ultimo perché dipende da tutto il resto.

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

## Punto 4 — Algoritmo e Discovery

### Situazione di partenza

`docs/08_Algorithm.md` è risultato, per la prima volta in questa iniziativa, già allineato al codice reale senza scostamenti da correggere: Discovery Phase (15 giorni), Journey Score (completamento 50% / continuità 25% / fruizione 15% / follower cappati 10%, con soglia minima di 5 spettatori distinti sotto la quale completamento ed engagement restano a zero) e Trust Level erano tutti implementati esattamente come documentato. Restavano però due debolezze concrete: con pochissimi Journey pubblicati (5 pubblicati, 22 in bozza al momento della decisione) le sezioni "intelligenti" della Home (Top Journeys, Recommended) rischiavano di ordinare quasi solo per follower/continuità, sembrando arbitrarie; e il principio "il pagamento non influenza il ranking", già vero nel codice fin dal Punto 1, non era mai stato reso visibile pubblicamente da nessuna parte.

### Decisioni prese in questo punto

- **Soglia cronologico-vs-algoritmo**: sotto **100 Journey pubblicati**, le sezioni Top Journeys e Recommended ordinano per data di pubblicazione invece che per Journey Score. Decisione presa e già implementata in una sessione parallela dedicata al backlog prodotto (`lib/discovery/algorithmUnlock.ts`, usato da `lib/discovery/topJourneys.ts` e `lib/discovery/recommendedJourneys.ts`), registrata qui per completezza. Soglia scartata: 20 (con "Top Journeys" che mostra 8-10 posizioni, sotto 100 il "Top" finirebbe per mostrare quasi l'intero catalogo). Motivata da due casi storici: YouTube ha usato solo il conteggio visualizzazioni dal 2005 al 2012, favorendo clickbait/gaming, corretto solo a scala enorme; Patreon in 13 anni non ha mai costruito una vera discovery interna, ci lavora solo dal 2026. Nessuna delle due piattaforme ha risolto bene e in fretta questo problema — una soglia alta è la scelta prudente, non debole.
- **Principio anti-pagamento reso pubblico per la prima volta**: nuova card nella pagina `/how-it-works`, dentro la sezione Algoritmo — "Paying doesn't get you seen more. On Zero, a Journey rises only because people actually watch and love it, never because someone paid for it."
- **Pagina "Come funziona" riordinata e restyled**: la sezione Algoritmo è ora la prima cosa che si legge dopo il titolo (prima era in fondo alla pagina, voce già in backlog). Design visivo allineato a `what-is-zero/page.tsx` (badge sopra il titolo, sfondo sfumato, titolo con gradiente, card con icone, pulsanti finali) per coerenza site-wide.
- **Mix 80/20 degli Update in Home**: confermato invariato da Manuel, comportamento preesistente già corretto in `08_Algorithm.md`, nessuna decisione nuova necessaria.

### Nota di processo

Durante questo punto due chat hanno lavorato per un tratto sullo stesso argomento in parallelo: questa (allineamento, Punto 4) e un'altra dedicata al backlog prodotto (`docs/94_Product_Backlog.md`), perché la soglia cronologico-vs-algoritmo era registrata in entrambi i documenti senza che nessuno dei due segnalasse il collegamento. Risolto coordinando le due sessioni in diretta; per il futuro, le voci di `94` che sono decisioni strategiche (non semplice esecuzione) restano bloccate finché non arriva il punto di allineamento corrispondente, invece di essere prese in carico liberamente.

### Ricerca di mercato aggiornata rilevante per questo punto

- **Trasparenza algoritmica (UE, Digital Services Act art. 27)**: le micro-imprese (meno di 10 dipendenti, meno di 2M€ di fatturato/bilancio) sono esenti da questo obbligo — Zero non avrebbe alcun vincolo legale oggi. Il fatto che Zero scelga comunque di spiegare pubblicamente il proprio algoritmo va oltre quanto richiesto per legge — argomento pulito per un dossier investitori, non solo compliance.
- **TikTok 2026**: i segnali di qualità principali sono ormai completion rate e watch time, con i "like" pesati sempre meno — stessa direzione già presa da Zero (completamento al 50% del Journey Score, Trusty ridotto al 2% del Trust Level). Convalida indipendente di scelte già fatte al Punto 2.
- **Tendenza 2026 verso feed cronologici e controllo utente** (Bluesky in particolare: feed "Following" puramente cronologico, "marketplace di algoritmi" al posto di un ranking nascosto unico): conferma che l'approccio "cronologico finché i dati sono pochi" è allineato a una direzione di mercato reale, non solo un ripiego tecnico in attesa di dati.
- Nessuno standard di settore su "quanti utenti/contenuti servono prima che un algoritmo funzioni bene" — dipende dai dati disponibili, non è un numero scritto da nessuna parte: la soglia dei 100 Journey resta una scelta di prodotto di Zero, non un valore preso da uno studio esterno.

### Punti di forza per un investitore

- Motore di ranking reale e già testato nel codice (non solo descritto), con un meccanismo di protezione dai dati insufficienti sia a livello di singolo Journey (soglia 5 spettatori) sia ora a livello di intero catalogo (soglia 100 Journey pubblicati) — scelta prudente, sostenuta da precedenti storici concreti (YouTube, Patreon), non arbitraria.
- Principio "il pagamento non compra visibilità" ora visibile pubblicamente agli utenti, non solo vero nel codice — coerenza tra quello che Zero dichiara e quello che fa, rafforzata rispetto ai Punti 0-1.
- Trasparenza sull'algoritmo scelta volontariamente, oltre l'obbligo legale minimo (Zero è esente come micro-impresa dal DSA europeo).

### Stato del punto

Chiuso il 2026-09-21, confermato da Manuel. Riepilogo da esportare in `Desktop\Zero - Punti Chiusi\Punto 4 - Algoritmo e Discovery.md`.

## Punto 5 — Trust & Safety (Trust Score + moderazione contenuti)

### Situazione di partenza

Il Trust Score era già stato rivisto in una sessione parallela (vedi Punto 2): formula pronta in `lib/profile/trustScore.ts`, ma disattivata per ogni creator esistente, incluso Manuel, perché mancava un'interfaccia per caricare il video di presentazione che la attiva. Sul fronte moderazione, il modello `Report` esisteva nello schema del database ma era usato solo in lettura dal Trust Score: nessun utente poteva davvero segnalare nulla, nessun pulsante da nessuna parte. Le pagine Community Guidelines e Copyright & Report Content erano ancora placeholder "Coming soon", e non esisteva alcun controllo automatico sui contenuti caricati.

### Decisioni prese e costruite in questo punto

- **Segnalazioni contenuti**: pulsante "Report" aggiunto a pagina Journey e a profilo utente, non alle Update (escluse volutamente da Manuel perché sono contenuto effimero, sparisce da solo entro 24 ore). Scrive nel modello `Report` già esistente (`lib/actions/report.ts`), con una mail di avviso a un indirizzo amministratore. Nessun pannello di gestione: le segnalazioni si vedono e si chiudono da Prisma Studio, coerente con il volume atteso oggi.
- **Video di presentazione**: nuova card "Who I am" nella Home personale del creator, stesso stile visivo della card Bio, inserita come terza colonna nella stessa riga di bio e Journey in progress. Upload diretto su Cloudflare R2 con lo stesso meccanismo già usato per i video degli episodi. Attiva per la prima volta il Trust Score appena caricato.
- **Primo filtro automatico** su testo e immagini appena caricati (`lib/moderation.ts`), tramite l'endpoint di moderazione di OpenAI: copre bio, titoli e descrizioni di Journey ed Episodi, testo delle Update, e le immagini caricate (copertine, foto profilo, foto delle Update), non ancora i video. Codice pronto e collegato ovunque serve, ma tenuto spento: creare la chiave OpenAI richiede una carta di credito reale e un primo acquisto minimo di crediti (circa 5 dollari), non un account gratuito come Neon, R2 o Resend. Scoperto durante questo punto, corretto subito a Manuel dopo una prima informazione imprecisa. Manuel ha deciso di rimandare questa spesa, minima ma vera, a quando ci saranno utenti reali sulla piattaforma.
- **Community Guidelines e Copyright & Report Content**: contenuto vero scritto al posto delle due pagine "Coming soon", in inglese come il resto del sito. Spiegano le regole della community, l'obbligo di dichiarare le sponsorizzazioni già deciso al Punto 3, come funziona il pulsante Report, e cosa copre (e non copre ancora) il filtro automatico.
- **Controllo età minima**: discusso e confermato che resta di competenza del Punto 6 (Legale), non di questo punto.

### Correzione di processo emersa durante il punto

Manuel ha corretto ripetutamente l'uso del trattino come punteggiatura nei testi scritti in questa sessione (pagine Community Guidelines, Copyright, e la pagina "Come funziona"/algoritmo del Punto 4, che usava lo stesso stile). Corretto ovunque trovato, con virgole, parentesi o frasi separate. Regola salvata in memoria per non ripeterlo nelle prossime sessioni.

### Ricerca aggiornata rilevante per questo punto

- **Obblighi europei (Digital Services Act, art. 27)**: le micro imprese restano esenti dagli obblighi più pesanti, ma non del tutto: da luglio 2025 esistono linee guida UE sulla protezione dei minori online applicabili anche a piattaforme piccole, e un meccanismo minimo di "segnala e rimuovi" resta una buona pratica attesa anche dalle micro imprese.
- **Leggi USA sull'età minima (2026)**: il quadro è cambiato molto rispetto a quanto noto ai punti precedenti. Florida vieta account social sotto i 14 anni; Virginia, Nebraska e Mississippi richiedono verifica età o consenso dei genitori sotto i 16-18 anni (la legge della Virginia è bloccata da un giudice per ora, ma la direzione è chiara). Rilevante per il Punto 6, non deciso qui.
- **Strumenti di moderazione per piattaforme piccole**: esistono servizi pensati apposta per chi non ha un team dedicato (Hive, Sightengine, l'endpoint di OpenAI usato qui). Il modello comune è un primo filtro automatico gratuito o quasi, seguito da revisione umana solo sui casi dubbi, esattamente l'approccio scelto in questo punto.
- **Section 230 (USA)**: la protezione legale delle piattaforme per i contenuti caricati dagli utenti resta in vigore ma sotto pressione crescente nel 2026 (cause legali, proposte di riforma). Non blocca nulla oggi, ma rafforza l'idea che avere un meccanismo minimo di segnalazione è una buona pratica difensiva.
- **Crediti cloud** (refresh di routine): nessuna novità rispetto a quanto già confermato ai punti precedenti, Cloudflare, Google, AWS e Microsoft restano tutti attivi e gratuiti all'iscrizione.

### Punti di forza per un investitore

- Meccanismo di segnalazione e primo filtro automatico costruiti prima che servissero davvero (zero utenti esterni oggi), non rincorsi dopo un problema reale.
- Trust Score finalmente attivabile dai creator, non più bloccato da un pezzo di interfaccia mancante.
- Onestà mantenuta anche sui limiti: il filtro automatico copre testo e immagini ma non ancora i video, dichiarato chiaramente nella pagina pubblica invece di sovrapromettere.

### Stato del punto

Chiuso il 2026-09-21, confermato da Manuel. Riepilogo da esportare in `Desktop\Zero - Punti Chiusi\Punto 5 - Trust & Safety.md`. Il Punto 6 (Legale) parte in una chat nuova, come da metodo concordato.

## Punto 6 — Legale (Privacy, Termini, Cookie)

### Situazione di partenza

Le pagine Privacy Policy, Termini di Servizio e Cookie Policy esistevano solo come "Coming soon", vuote. Le Community Guidelines (scritte al Punto 5) dichiaravano già "almeno 16 anni per creare un account", ma senza nessun controllo reale: il modulo di registrazione non chiedeva data di nascita, nessun blocco. `91_Legal_Audit_And_Roadmap.md` aveva anche una correzione mai fatta: segnava Neon/R2/Resend come "non collegati", mentre in realtà lo erano già dal Punto 0 (2026-09-17), stesso tipo di scostamento documenti/codice già visto ai Punti 1 e 2.

### Decisioni prese e costruite in questo punto

- **Età minima**: aggiunto il campo `dateOfBirth` al modello `User` e al modulo di registrazione. Controllo a doppio livello: lato client (messaggio immediato) e lato server in `lib/auth.ts` (`databaseHooks.user.create.before`), che blocca davvero la creazione dell'account sotto i 16 anni, non aggirabile. Controllo "a dichiarazione" (l'utente scrive la sua data), non con documento d'identità: proporzionato per una piattaforma di queste dimensioni. Soglia di 16 scelta perché coincide con l'età di base del GDPR europeo per gestire da soli i propri dati, evitando la complessità del consenso dei genitori richiesto sotto quella soglia. Non retroattivo: gli account già esistenti restano con data di nascita vuota.
- **Privacy Policy, Termini di Servizio, Cookie Policy**: contenuto vero scritto per tutte e tre, basato sui dati reali mappati in `91_Legal_Audit_And_Roadmap.md`. Dichiarano onestamente anche i limiti attuali: nessuna entità legale ancora registrata dietro Zero, nessun canale di contatto reale ancora collegato (`/contact` resta "Coming soon", le richieste sui dati passano dal Report per ora).
- **Cookie Policy senza banner**: confermato dalla ricerca che, usando solo cookie tecnici (sessione di login, nessun tracciamento pubblicitario/analytics), la legge europea non richiede un banner "accetta i cookie". Scelta di trasparenza comunque mantenuta: la pagina elenca comunque nome e scopo di ogni cookie.
- **Content Policy dettagliata**: Manuel ha fornito un documento con 28 categorie di contenuto da vietare o limitare (nudità/sessualizzazione, violenza, odio, autolesionismo, disturbi alimentari, droghe, challenge pericolose, cyberbullismo, gossip/drama, propaganda politica, disinformazione, deepfake, truffe, pseudo-esperti, fuffa motivazionale, ostentazione di lusso, repost senza valore, spam, canali faceless/anonimi, AI che finge di essere umana). Integrata nelle Community Guidelines pubbliche (stessa pagina, non una nuova, come fanno YouTube/TikTok/Instagram), raggruppata in blocchi tematici leggibili invece che come lista piatta. Le tre categorie a tolleranza zero (sessualizzazione minori, incitamento alla violenza, autolesionismo/suicidio) sono in un riquadro rosso visivamente distinto dal resto, per farle risaltare come richiesto da Manuel. Questa stessa lista diventerà la base scritta delle istruzioni per il filtro automatico (`lib/moderation.ts`) quando sarà riattivato.
- **Testo su Stripe in `/how-it-works` non corretto**: Manuel ha confermato che resta così di proposito. Descrive lo stato della piattaforma quando sarà online con Stripe già collegato ("a tre click dall'online"), non lo stato di prototipo di oggi, e diventerà vero nel momento del lancio, non prima.
- **Correzione emersa durante il punto**: `91_Legal_Audit_And_Roadmap.md` segnava ancora Neon/R2/Resend come "configurato ma non ancora collegato". Corretto: sono collegati con account reali dal 2026-09-17 (Punto 0), lo scostamento non era mai stato riportato in questo documento specifico.

### Nota di processo

Prima di iniziare, verificato che nessun'altra sessione in parallelo stesse lavorando sugli stessi file (chiesto direttamente all'altra sessione attiva, che lavorava solo su `EpisodePlayer.tsx`): nessuna sovrapposizione.

### Ricerca di mercato/normativa aggiornata rilevante per questo punto

- **Età minima (aggiornamento 2026)**: il GDPR europeo fissa la soglia base a 16 anni per il consenso al trattamento dati (Art. 8), con gli Stati membri liberi di abbassarla fino a un minimo di 13; scendere sotto i 16 richiederebbe gestire il consenso dei genitori, complessità che Zero evita restando a 16. Il COPPA statunitense fissa 13 anni. Confronto con leggi più recenti e severe (Florida vieta social sotto i 14; Virginia, Nebraska, Mississippi richiedono verifica età o consenso genitori sotto i 16-18; Australia vieta account social sotto i 16 con multe fino a 50 milioni di dollari australiani per le piattaforme inadempienti): tutte più restrittive di quanto Zero abbia scelto, confermando che 16 anni con controllo a dichiarazione è una soglia prudente ma non eccessiva per una piattaforma di queste dimensioni.
- **Privacy Policy GDPR + CCPA**: la pratica raccomandata per una startup piccola è una sola informativa privacy globale che rispetti lo standard più severo tra i due (GDPR), invece di due documenti separati — approccio seguito qui. Il CCPA californiano si applica solo sopra soglie di fatturato (~26,6 milioni di dollari) o 100.000 utenti californiani/anno, molto lontane dai numeri attuali di Zero, ma includere già ora i diritti CCPA nella Privacy Policy non costa nulla e evita di doverla riscrivere più avanti.
- **Cookie tecnici ed esenzione dal consenso (GDPR/ePrivacy)**: confermato che i cookie strettamente necessari al funzionamento del servizio (sessione di login, sicurezza) sono l'unica categoria esente dall'obbligo di consenso, a patto di non essere usati per tracciamento o pubblicità — esattamente il caso di Zero oggi. Resta comunque raccomandata la trasparenza tramite una pagina dedicata, anche senza banner.
- **Crediti cloud**: nessuna novità rispetto ai punti precedenti (refresh di routine, nessuna ricerca aggiuntiva necessaria essendo già stata aggiornata due volte nella stessa giornata ai Punti 4 e 5).

### Punti di forza per un investitore

- Zero applica una soglia d'età più prudente rispetto a quanto richiesto dalla maggior parte delle normative studiate, senza però ricorrere alla complessità di una verifica documentale sproporzionata per la fase attuale.
- Privacy Policy e Termini scritti sui dati reali del codice, non un modello generico scaricato online: riflettono esattamente cosa fa la piattaforma oggi, inclusi i suoi limiti dichiarati apertamente (nessuna entità legale ancora registrata, nessun canale di contatto reale).
- Content Policy dettagliata (28 categorie) integrata prima del lancio pubblico, non dopo un incidente: stessa logica già mostrata al Punto 5 con segnalazioni e filtro automatico, costruiti in anticipo.
- Nessun banner cookie necessario, un dettaglio piccolo ma concreto che mostra un prodotto pensato per non raccogliere più dati del necessario, coerente con il principio di trasparenza già mostrato ai Punti 0-1 e 4.

### Decisione aggiuntiva emersa nello stesso punto: requisiti per diventare creator

Discutendo dove far leggere le Community Guidelines, è emerso un ripensamento più grande: **diventare creator non deve più essere completamente automatico e senza requisiti**. Prima, chiunque poteva pubblicare un Journey/Episodio senza mai aver compilato il profilo, caricato un video di presentazione o letto le regole. Decisione di Manuel: tutti e tre insieme diventano obbligatori prima di poter pubblicare per la prima volta — profilo compilato (nome utente, foto, bio), video di presentazione, accettazione delle Community Guidelines (scrollando fino in fondo alla pagina). **Riguarda solo chi vuole diventare creator, mai i visitatori/spettatori**, che restano liberi di guardare e condividere senza account, confermato coerente con YouTube da una ricerca aggiornata nella stessa sessione. Nessun grandfathering: vale anche per gli account creator già esistenti, incluso quello di Manuel.

Questo corregge (con decisione esplicita, non per svista) il principio "diventare creator è automatico" registrato dopo il Punto 2: resta vero che non c'è una schermata di iscrizione separata dietro un bottone, ma ora pubblicare per la prima volta richiede di aver completato questi tre passaggi.

Durante la stessa discussione, sistemato anche un piccolo problema di UX trovato per strada: il banner "Pick your interests" in Home spariva per sempre dopo la prima chiusura (localStorage), anche per chi non aveva mai scelto un interesse — ora usa sessionStorage e torna a comparire a ogni nuovo login finché gli interessi non vengono davvero scelti.

### Effetto collaterale: video di presentazione e player video ridisegnati

Provando il nuovo requisito del video di presentazione, Manuel ha caricato un video di prova e trovato diversi problemi di visualizzazione nella card "Who I am" del proprio profilo, sistemati con una serie di iterazioni nella stessa sessione:

- **Player video condiviso**: nuovo componente `components/common/VideoPlayer.tsx` con la stessa dimensione "di default" (naturale, fino al 70% dell'altezza schermo) e la stessa barra di controllo (play/pausa, avanzamento, indietro 15s, volume, schermo intero) usata dai video dei Journey. `components/journey/EpisodePlayer.tsx` è stato rifattorizzato per usarlo internamente, tenendo per sé solo la logica specifica degli episodi (salvataggio progressi, ripresa posizione, sblocco Trusty, HLS) — **nota per chi riprende in mano `EpisodePlayer.tsx`**: è stato toccato anche da questa sessione (allineamento), non solo dalla sessione parallela che lavorava sul layout di Trusty/Share citata sopra.
- **Card "Who I am" ridisegnata più volte**: da un ritaglio verticale 9/16 (troppo alto, sproporzionato rispetto alle card vicine) a un riquadro orizzontale 4/3 in stile "poster" (come le card di Recent Episodes), con titolo sovrapposto e ritaglio del video (`object-cover`) per riempirlo sempre, play/volume/schermo intero come pulsanti fuori dal riquadro invece che sovrapposti al video.
- **Bio e video di presentazione incorporati in un'unica card orizzontale** (Bio a sinistra, video a destra) invece di due card separate: la card ora eredita l'altezza vera della card "In Progress" (Journey in evidenza) tramite lo stretch di default della griglia, non una propria proporzione fissa (che con larghezze di colonna diverse avrebbe dato altezze diverse).
- **Vista a schermo intero**: cliccando il tasto Maximize si apre un modale con lo stesso `VideoPlayer` condiviso, dimensione naturale come i Journey; la X di chiusura è sull'angolo della card del video ingrandito, non della pagina intera.
- **Formato video consigliato**: orizzontale (telefono sdraiato), soggetto centrato con un po' di margine — l'anteprima piccola ritaglia sempre per riempire il riquadro 4/3, un video verticale perderebbe gran parte dell'inquadratura in quel contesto.

### Stato del punto

Chiuso il 2026-09-22, confermato da Manuel dopo un controllo finale diretto nel codice (campo `dateOfBirth` e blocco server-side in `lib/auth.ts`, `getPublishReadiness()` in `lib/creator.ts`, riquadro rosso delle tre categorie a tolleranza zero nelle Community Guidelines, migrazione applicata su Neon). Riepilogo esportato in `Desktop\Zero - Punti Chiusi\Punto 6 - Legale.md`. Il Punto 7 (Infrastruttura tecnica) parte in questa stessa chat, come da indicazione di Manuel di procedere più velocemente sui punti restanti.

## Punto 7 — Struttura pagine Creator Economy

### Situazione di partenza

Le "Strumenti" del creator previste in `07_Creator_Experience.md` (Community Premium, prodotti/servizi, workshop/eventi) non erano mai state costruite: solo testo "Coming soon" nelle pagine reali. Community Premium (`membership`) e Shop (prodotti digitali) costruite in una sessione precedente della stessa giornata (commit `2ec8702`), restavano da fare Workshop/Evento e Consulenza 1:1.

### Decisioni prese e costruite in questo punto

- **Workshop/Evento e Consulenza 1:1** costruite direttamente nel codice reale di Zero (non su Lovable: crediti quasi esauriti), stesso stile e pattern già stabilito da Membership/Shop: bozze visive, dati di esempio, pulsante disattivato "Coming soon", nessun pagamento reale (commit `3ea4a14`).
- **Ripensamento della struttura, deciso da Manuel subito dopo**: invece di quattro pulsanti/pagine separati sul profilo (Become a Member, Shop, Workshops, 1:1 Consulting), un solo punto di ingresso. "Become a Member" rinominato **"Subscribe"** (stesso nome usato da YouTube), unico pulsante rimasto sul profilo. Shop, Workshop & Events e 1:1 Consulting sono ora sezioni dentro quella stessa pagina, non pagine a parte: le tre pagine separate sono state rimosse. **Logica di accesso confermata da Manuel**: l'abbonamento sblocca l'accesso alla pagina, ma ogni card resta a prezzo indipendente (Shop/Workshop/Consulenza non sono incluse gratis nell'abbonamento) — coerente con come funzionano già Patreon/YouTube Membership. Implementato in `app/(site)/profile/[username]/membership/page.tsx` (nuovo componente interno `OfferingSection`, riusato per le tre sezioni), commit `a271d19`.
- **Idea emersa e rimandata al Punto 8**: Manuel ha proposto, invece di pagine statiche, un assistente AI a cui il creator può chiedere in linguaggio naturale di costruire i propri strumenti (es. "crea un evento workshop per il 23 febbraio e invita i miei follower"), riconoscendo lo stile del sito ed eseguendo azioni vere (non solo suggerire testo). Riconosciuto come l'argomento del Punto 8 ("AI sulla piattaforma"), non una rifinitura del Punto 7: richiede un collegamento a un servizio AI vero (costo minimo reale, stesso ostacolo già incontrato con il filtro di moderazione OpenAI) e scelte di sicurezza (conferma prima di azioni che coinvolgono altre persone, es. notificare i follower). Idea salvata, da riprendere quando si aprirà il Punto 8. Resta aperta anche la domanda se le pagine statiche costruite ora (Membership/Shop/Workshop/Consulenza) diventeranno superflue una volta pronto l'assistente.

### Stato del punto

Chiuso il 2026-09-22, confermato da Manuel. Il Punto 8 (AI sulla piattaforma) parte in una chat nuova, come da metodo concordato.

## Punto 8 — AI sulla piattaforma

### Situazione di partenza

Idea nata a chiusura del Punto 7 (vedi sopra): un assistente a cui il creator chiede in linguaggio naturale di costruire i propri strumenti (es. "crea un evento workshop per il 23 febbraio e invita tutti i miei follower a partecipare"), capace di eseguire azioni vere sulla piattaforma, non solo suggerire testo. Prima di iniziare, verificato che nessun'altra sessione in parallelo stesse lavorando su aree collegate (chiesto direttamente a `zero-0b`, che risultava ferma su una modifica di stile già committata, `bf89ec1`): nessuna sovrapposizione.

### Decisioni prese in questo punto (solo discussione, nessun codice ancora scritto)

- **Niente AI locale, per ora**: né un modello sui server di Zero (conviene solo sopra i 50.000$/anno di spesa o 5-10 milioni di token al giorno, lontanissimo dai volumi attuali), né un modello nel browser del creator (i modelli abbastanza piccoli per girarci hanno ancora un tasso di errore reale — circa 1 esecuzione su 3 — quando devono eseguire un'azione precisa, non solo chiacchierare).
- **Gemini (Google AI Studio) come servizio scelto**: piano gratuito vero, nessuna carta di credito richiesta, a differenza del filtro moderazione OpenAI del Punto 5. Account Google creato apposta per Zero, separato da quello personale di Manuel, per tenere l'infrastruttura del progetto scollegata dall'identità personale fin da ora (stessa logica già seguita per gli altri servizi). Chiave `GEMINI_API_KEY` salvata in `.env` (mai su Git), segnaposto documentato in `.env.example`.
- **Ambito dell'AI, i "mattoncini"**: l'assistente può creare solo dentro i quattro modelli già presenti in `prisma/schema.prisma` ma mai collegati a nulla (`Workshop`, `Event`, `DigitalProduct`, `PersonalService`, vedi sezione "WORKSHOP / EVENT / DIGITAL PRODUCT / PERSONAL SERVICE"). Nessun tipo di contenuto nuovo inventato dall'AI. Dentro questi quattro, libertà piena su come vengono riempiti e presentati: un creator di hiking e uno di finanza useranno lo stesso "mattoncino" Workshop in modo completamente diverso, senza bisogno di campi diversi per ogni nicchia.
- **Nuova sezione "Community" nella Dashboard del creator**: emersa parlando di dove l'AI dovrebbe scrivere i suoi risultati — oggi non esiste nessun posto dove il creator gestisce (modifica, cancella, vede l'elenco) ciò che crea, solo la vetrina pubblica. La sezione ospiterà sia la creazione a mano (form vuoto) sia quella assistita dall'AI (richiesta in linguaggio naturale → bozza pre-compilata nello stesso form → conferma del creator prima di salvare).
- **Pulsante "Pubblica"** per ogni elemento, stesso pattern già usato per i Journey: solo da quel momento appare nella pagina pubblica Subscribe, che smette di mostrare gli esempi finti (`shopItems`, `workshops`, `consultingSessions` hardcoded in `membership/page.tsx`) e mostra dati veri.
- **Pulsante separato "Avvisa i tuoi follower"**, visibile solo dopo la pubblicazione, mai automatico: riusa il sistema di notifiche già esistente (gratis, nessun cron). Applica la regola di sicurezza concordata fin dall'inizio della discussione — nessuna azione dell'AI verso altre persone senza una conferma esplicita del creator.
- **Accesso**: tutta la zona di creazione/gestione (AI e manuale) resta visibile solo al creator proprietario della pagina, mai a chi si abbona o segue — stesso confine già esistente tra Dashboard privata e profilo pubblico.
- **Le pagine statiche costruite al Punto 7 restano**, come modalità manuale accanto all'AI, non vengono sostituite.

### Ricerca aggiornata rilevante per questo punto

- **Gemini API, piano gratuito 2026**: modelli Flash/Flash-Lite, nessuna carta di credito, circa 1.500 richieste al giorno — sufficiente per il volume atteso. Contropartita: sul piano gratuito Google può usare gli input per migliorare i propri modelli, accettabile per un prototipo senza dati sensibili di terzi.
- **OpenRouter (modelli gratuiti aggregati)**: alternativa valida solo per test, limiti troppo stretti per produzione (~20 richieste/minuto, 200/giorno, nessuna garanzia di continuità).
- **Claude (Anthropic) come riferimento di costo**: Haiku 4.5 a 1$/milione di token in ingresso e 5$ in uscita — economico ma richiede comunque una carta collegata dal primo euro, stesso ostacolo già visto con OpenAI al Punto 5.
- **Self-hosting di un modello proprio**: conviene solo sopra i 50.000$/anno di spesa AI o 5-10 milioni di token/giorno per un modello da 70 miliardi di parametri; sotto quella soglia un ingegnere dedicato a farlo girare costa più della bolletta che si vorrebbe risparmiare.
- **Modelli piccoli nel browser (WebGPU/WebLLM)**: tecnologia reale e in crescita nel 2026, ma i modelli abbastanza leggeri da girarci (0,5-3 miliardi di parametri) hanno un tasso di successo di circa il 63% per singola esecuzione di un'azione precisa senza un addestramento dedicato — troppo inaffidabile per scrivere davvero sul database.

### Nota di processo

Durante la discussione, Manuel ha comunicato l'acquisto del dominio reale del progetto, **zerojourneys.com**, registrato su Cloudflare — fatto slegato dal Punto 8 in sé, salvato in memoria per i Punti 10/11 (Infrastruttura, Lancio). Emerso anche un piccolo disallineamento tra `docs/93` e `docs/99_Current_Project_Status.md`, quest'ultimo ancora fermo su "Creator Economy non iniziata" nonostante il Punto 7 avesse già costruito le bozze visive: corretto nella stessa sessione.

### Costruzione (2026-09-25 → 2026-09-27, più chat tecniche dedicate)

Tutto costruito e committato sul branch `design-wow-experiment`. In ordine:

1. **Fondamenta** (commit `fdc282b`): CRUD reale sui quattro modelli dalla nuova sezione `/dashboard/community`, tutto parte come Bozza; pulsante "Notify your followers" separato; Workshop/Event gratuiti con RSVP reale ("Partecipo"); pagina Subscribe con dati veri. Prima di scrivere codice, verificata dal vivo l'API Gemini: Google l'aveva cambiata (nuova "Interactions API"). Moderazione contenuti passata da OpenAI a Gemini, attiva per la prima volta su tutto il sito (testo e immagini, mai video).
2. **Correzioni dopo test reale** (`aab91a2`, `1562ab4`, `1428c6a`): copertine per i quattro tipi, badge Free/Locked in stile vetro, pagina di dettaglio pubblica e condivisibile, card cliccabili, **"Subscribe" rinominata "Community"** (decisione di Manuel: un follower che clicca un evento gratuito non deve finire su una pagina di abbonamento). Card evento gratuito enorme corretta riallineandola alla griglia a 4 colonne esistente; da qui la regola "riusare componenti esistenti e chiedere in caso di dubbio di design".
3. **Chat AI affidabile** (`c907513`): la bozza "promessa ma mai allegata" succedeva circa 6 volte su 7 perché Gemini mandava bozze incomplete; corretta rendendo la bozza completa o assente. Scorrimento automatico, benvenuto con il nome del creator (letto dal profilo, non "addestrato").
4. **Chat come un'AI normale** (`b3f2468`): Manuel l'ha trovata robotica ("perché gli hai imposto dei limiti?"). Ora risponde liberamente (Markdown, consigli, domande sui dettagli, descrizioni complete) e la bozza viene estratta dalla conversazione con una seconda chiamata separata. Conversazione salvata nel browser fino al logout (scelta di Manuel), pulsante della bozza nascosto dopo una creazione confermata per evitare doppioni. Resta sul modello gratuito Flash-Lite ("vediamo se va bene, poi casomai Flash"). Campo prezzo senza freccette, orario evento corretto (era un'ora indietro).
5. **Creazione immagini, pronta ma spenta** (`ae45645`): Nano Banana via API **non è gratuito** (circa 0,034$ a immagine; gratis è solo l'app Gemini usata a mano). Esplorate e scartate con Manuel: Cloudflare Workers AI, link a Gemini con incolla manuale, modelli cinesi (Zhipu CogView-3-Flash, non verificato). Decisione: struttura pronta con interruttore spento, tetto di 5 immagini ogni 24 ore per creator, "Use as cover" porta l'immagine nel modulo. Verificato dal vivo che Google risponde "limite 0 sul piano gratuito": manca solo la fatturazione.
6. **"+" per allegati** (`32be1fb`, `be86459`): versione minima scelta da Manuel, solo foto e PDF (gratis in lettura), max 3 per messaggio, menu "Photo / PDF document" invece di aprire subito la cartella. Verificato dal vivo: foto descritta, PDF letto e trasformato in bozza. Word/Excel/video esclusi di proposito finché i creator non li chiedono.

**Scartata**: un'AI cinese per la chat (DeepSeek), proposta da Manuel. Motivi: blocco del Garante Privacy italiano (gennaio 2025), API a pagamento, e il problema reale era il design della chat, non il modello.

**Rimandato** (in `94_Product_Backlog.md`): pulsante "Download as PDF" nella chat; messaggio di errore onesto nel login.

### Stato del punto

Costruito e funzionante. Unica parte non attiva: la creazione immagini, da accendere quando Manuel attiverà la fatturazione Google. Resta da confermare con Manuel la chiusura formale del punto prima di aprire il Punto 9 (Business Plan) in una chat nuova.
