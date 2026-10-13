---
title: Memoria di Progetto
doc_id: 22-memoria-progetto
version: "1.0"
status: living
related_docs:
  - 92_Project_History
  - 94_Product_Backlog
  - 93_Project_Alignment_Recap
---

# Memoria di Progetto

Travaso completo, in chiaro e dentro il repository, di tutto ciò che le sessioni AI hanno accumulato lavorando su Zero: non solo cosa è stato costruito (già in `92_Project_History.md` e `94_Product_Backlog.md`), ma anche il *perché*, le preferenze di lavoro di Manuel, le cose scartate e il ragionamento dietro le decisioni. Serve come rete di sicurezza: se la memoria di una sessione AI andasse persa (cambio di strumento, nuovo account, altro motivo), questo file resta leggibile da chiunque riprenda il progetto. Aggiornarlo quando si accumula di nuovo una quantità significativa di decisioni non ancora travasate qui.

## Chi è Manuel

Nessuna competenza tecnica di programmazione: ogni spiegazione va data in linguaggio semplice, senza gergo, e le scelte tecniche vanno presentate spiegando prima cosa cambia nella pratica. Zero è un vero tentativo di startup da portare a investitori (obiettivo $1M di raccolta, crediti cloud gratuiti): questo risolve a monte il dubbio se trattare Zero come prototipo da chiudere o prodotto da far crescere con utenti veri, e impone di non gonfiare mai numeri o far finta che qualcosa sia più pronto di quanto sia.

## Come lavorare con lui (regole di processo)

Queste regole hanno la precedenza su abitudini generiche:

- **Niente piano obbligatorio prima di agire**: la vecchia regola "presenta il piano e aspetta un vai" è superata. Si agisce direttamente; Manuel chiede lui il piano quando gli serve. Restano da confermare solo le azioni difficili da annullare (cancellare file/dati, push, operazioni distruttive su git).
- **Risposte terse**: non spiegare cosa si sta per fare prima di farlo, non ripetere o riassumere i prompt dell'utente, niente commenti descrittivi superflui nell'output, comandi silenziosi dove possibile.
- **Rispondere sempre in italiano semplice**, evitando `AskUserQuestion` per chiarimenti banali.
- **Mai il trattino** (-/–/—) come punteggiatura nei testi, né in chat né nelle pagine del sito: usare virgole, parentesi o frasi separate.
- **Un compito per chat**: finire quello in corso, aprirne una nuova per il prossimo compito distinto. Se una chat si allunga e Manuel si perde tra troppe opzioni, è il segnale di chiuderla e ripartire pulito.
- **Commit frequenti**: appena un lavoro è finito e verificato, va committato, senza lasciarlo accumulare.
- **Verifica visiva prima dei documenti**: per lavoro visivo/di interfaccia, Manuel controlla prima lui su localhost; aggiornare documentazione e fare commit solo dopo il suo ok. Niente screenshot automatici con Playwright per piccole modifiche CSS di routine, se li fa lui.
- **Non rianimare componenti vecchi non ristilizzati** senza prima controllarli/segnalarli: un pannello pre-redesign riattaccato alla cieca ha già causato un problema (rimosso di nuovo).
- **Controllare `docs/14_UI_Pages.md` prima di proporre rotte nuove**; non generalizzare da sessioni passate senza verificare.
- **Verificare lo stato reale nel codice prima di ripetere quanto scritto in documenti di stato**: `99_Current_Project_Status.md` e simili possono essere non aggiornati.
- **Il backlog di prodotto (`98_Product_Review.md`) si lavora una voce alla volta**, non in blocco.
- **Includere sempre YouTube come riferimento** in qualunque ricerca su piattaforme/monetizzazione: Manuel lo considera il benchmark.
- **Mai proporre Stripe di propria iniziativa**: potrebbe non essere il fornitore scelto.
- **Mai rilanciare "troppo presto, siamo pre-lancio" come se fosse una scoperta nuova**: se un numero è basso perché il sito non è ancora online, dirlo e basta, senza la premessa ovvia, Manuel la trova fastidiosa.
- **Se una ricerca contraddice un'assunzione**, presentare prima solo quel problema, pianificare dopo che è risolto.
- **Più sessioni possono lavorare sullo stesso repository nello stesso momento**: non è un bug se succede, è normale su questo progetto. Prima regola era controllare sempre overlap con `ListAgents`; è stata superata, ora non si controlla più in modo proattivo a meno che non serva davvero (per esempio un file condiviso a rischio reale di conflitto, come lo schema Prisma).
- **Mai interrompere il server di sviluppo condiviso**: niente `taskkill` o comandi che liberano la porta 3000, ci lavora Manuel stesso.
- **Prima di toccare un file con lavoro recente non proprio**, nominarlo esplicitamente e spiegare in linguaggio semplice cosa si sta per fare, invece di parlarne in termini tecnici o di codice.
- **Tema chiaro/scuro**: ogni modifica al tema va verificata in entrambe le modalità, un cambiamento pensato per una non deve mai rompere l'altra (è già successo una volta, vedi sotto).

## Decisioni di base del progetto

Scelte di database/autenticazione/servizi e ordine di costruzione per l'autenticazione sono tracciate a parte (origine della prima sessione). Nessun account esterno era collegato all'inizio (Neon, Stripe, Resend, R2): oggi Neon, R2 e Resend sono collegati con account reali, Stripe no (deliberato, resta per l'ultimo passaggio). `master` è ora l'unico branch: il vecchio `design-wow-experiment` è stato unito e cancellato sia in locale sia su GitHub.

Zero ha comprato il dominio reale **zerojourneys.com** su Cloudflare, non ancora collegato al sito. Esiste un account Google dedicato al progetto (`team.zerojourneys@gmail.com`) che ospita le chiavi di servizio (Gemini compresa); la verifica in due passaggi su quell'account è stata attivata.

**Strategia di lancio (decisione di Manuel, confermata più volte)**: Zero andrà online al 100% funzionante ma a zero funzioni a pagamento per gli utenti. Le Tips ai creator restano (link esterno scelto dal creator, Zero non incassa nulla). In più sono previsti: un bottone "sostieni Zero" per donazioni alla piattaforma stessa (reali solo quando esisterà un fiscal hosting, perché Zero non ha ancora un'entità legale propria) e la richiesta di crediti cloud gratuiti (Google/Microsoft/AWS for Startups) per minimizzare i costi. Principio trasversale: prima di proporre qualunque servizio o funzione che costa, chiedersi se è davvero necessario ora o rimandabile; non proporlo come lavoro di lancio senza che Manuel lo chieda esplicitamente.

## Il percorso sull'AI (la parte più corposa)

Tutta questa sezione sostituisce qualunque appunto AI più vecchio dove sono in conflitto: è l'ultima parola.

**Cosa fa parte del Lancio (già spedito):**
- Moderazione automatica di testo e immagini su Google Gemini (mai video); nata su OpenAI, spostata su Gemini perché la chiave è gratuita, OpenAI non è più un fornitore del progetto.
- Chat AI della Community: aiuta i creator a preparare Workshop/Eventi/Prodotti digitali/Consulenze parlando in linguaggio naturale, propone sempre una bozza da confermare nel modulo vero, non salva né pubblica mai da sola.
- **Ember**, l'assistente che spiega agli utenti come funziona Zero (pulsante mascotte nell'header, una "O" con una faccina animata, bordo arancione sempre acceso, occhi che pulsano, sorriso al passaggio del mouse). Risponde solo sulla base dei contenuti veri delle pagine del sito (Come funziona, What is Zero, Creator mode, Privacy, Termini, Cookie, Catalogo Funzionalità), mai inventando, senza accesso a internet, nessuna azione per conto dell'utente, non svela le percentuali esatte dell'algoritmo/Trust Score. Stesso motore gratuito della chat Community, limite di 30 messaggi/ora per indirizzo per proteggere la quota condivisa.

**Idee scartate per sempre (non riproporle mai come nuove):**
- "Chiedi al Percorso" (domande testuali su un Journey con salto al minuto): rischia di far non guardare il video intero, controproducente per la visione e per il Journey Score.
- "Il Percorso che ti parla" (conversazione a voce con un'AI durante l'episodio): ridondante con la voce vera del creator, confonde.
- Generazione video con l'AI.
- Feed che finisce ("sei in pari").
- Agente che suggerisce al creator cosa vendere.
- Sintesi vocale automatica dei Journey (diversa dal doppiaggio, vedi sotto) e audio descrizione per non vedenti: scartate per non aggiungere troppo lavoro a un sito ancora prototipo.
- Sottotitoli: non un lavoro di Zero, li fa il creator con il proprio programma di montaggio, come oggi.
- Rifiniture minori della chat Community: scaricare le risposte in PDF, lista delle chat passate stile Gemini, Word/Excel/video come allegati, Drive, Deep Research, scelta del modello.

**La Mappa dei Momenti (S6), il pezzo grosso:** nata da un brainstorming guidato dalla domanda "cosa farebbe fare a Zero un salto tecnologico vero". L'AI (Gemini, lettura video "agentica": decide da sola cosa guardare con attenzione, fino all'88% di token in meno rispetto a guardare tutto) guarda un episodio una volta sola e scrive "momenti" (minuto, descrizione, una firma numerica di significato per cercare per senso). Dati salvati nel modello `EpisodeMoment`, mai il video stesso modificato: il video originale resta sempre la fonte vera, gli appunti sono rigenerabili.

Tutti e quattro i pezzi collegati sono stati costruiti:
- **Collegamento automatico alla pubblicazione**: ogni episodio pubblicato viene elaborato da solo, niente più scelta manuale di quali video processare (corretto esplicitamente dopo un errore: lo script a mano era solo uno strumento di collaudo, non il disegno finale; una piattaforma che punta a competere con YouTube non può avere una persona che sceglie a mano quali video leggere).
- **Ricerca per senso** su `/search`: parte solo quando la ricerca normale a parole non trova nulla. Il nome tecnico "ricerca semantica" non deve mai comparire nell'interfaccia, solo una domanda semplice e invitante.
- **Percorso su Misura** (pagina `/custom-path`): un Journey composto dall'AI con momenti veri presi da episodi di creator diversi, in base alla situazione descritta da chi cerca, sempre con link all'episodio originale (il creator riceve comunque visibilità). I video aprono dall'inizio, non saltano al minuto esatto (cambiato rispetto al piano iniziale).
- **Trailer della Hero**: un giocatore video dedicato (`MomentsTrailerPlayer.tsx`) salta tra i momenti migliori di un episodio (quelli segnati `isHighlight`). Esiste anche una via manuale, indipendente dall'interruttore dell'AI: il creator può segnare un momento a mano mentre guarda il proprio episodio (stellina, `HighlightMarkButton.tsx`), utile finché l'AI resta spenta. L'interruttore `MOMENTS_LIBRARY_ENABLED` regola solo il lato AI, non la stellina manuale.

**Cosa resta aperto, non nuove idee, solo da chiudere:**
- L'interruttore `MOMENTS_LIBRARY_ENABLED` è spento oggi: nessuna elaborazione AI automatica realmente in corso.
- Solo un episodio di prova ("the valley") è mai stato processato dal vivo con l'AI; manca un secondo test.
- La selezione dei video della Hero è ancora su due ID fissi scelti a mano (non la Mappa dei Momenti): tracciata come lavoro a sé (S27), da fare prima del lancio pubblico.
- **Doppiaggio nella voce del creator in altre lingue**: confermato come idea valida (mai scartata, nonostante un errore di trascrizione in una versione precedente di questa memoria l'avesse messa tra le scartate per sbaglio, confuso con "il Percorso che ti parla"). Oggi solo il consenso del creator è stato costruito (un interruttore nelle Impostazioni, spento di default). La ricerca tecnica reale ha trovato un problema concreto: **Google blocca la clonazione vocale nell'Unione Europea**, mentre un fornitore diverso (ElevenLabs) la offre ma a pagamento. Per questo la funzione vera resta in pausa, in attesa di una decisione economica.
- **Immagini AI** (Nano Banana) nella chat Community: struttura già pronta nel database e nel codice, spenta, serve la fatturazione Google per accenderla. Decisione esplicita: non riproporla come argomento di discussione, menzionarla solo se Manuel chiede lo stato acceso/spento.
- **Gemini al piano a pagamento**: non più legato a nessuna scadenza di lancio (la promessa scritta nella Privacy Policy è stata tolta appositamente, per non avere spese evitabili all'apertura del sito); resta nell'ultimo passaggio del backlog insieme a tutto ciò che riguarda soldi e pagamenti.
- **Selettore di lingua dell'interfaccia** (inglese/italiano/spagnolo, libreria next-intl): idea Post-MVP, solo traduzione dei testi del sito, non generata dall'AI; da costruire in un solo passaggio quando l'MVP sarà considerato chiuso.

## Discovery, Home e algoritmo

Ordine di costruzione della Discovery: Segui → Nuovi → Categorie → Consigliati → Feed → Ricerca → Home. "Most Completed" e "Updates" erano stati rimandati, poi "Most Completed Journeys" è stato costruito (solo nella pagina `/journeys`, richiede almeno 5 spettatori distinti per entrare in classifica, mai una percentuale mostrata). La sezione "Journeys of the Moment" si è rivelata un doppione morto ed è stata unita a "Recommended"; una riga di "Wildcard da seguire" è stata aggiunta, stabile 24 ore a livello di database.

I filtri di ricerca stile YouTube (categoria + data, niente ordinamento per popolarità, scelta deliberata per coerenza con "Quality Over Virality") sono stati costruiti su `/search`; categoria e interesse utente sono la stessa identica lista, un solo filtro basta per entrambi i concetti.

Le sezioni "intelligenti" della Home mostrano ordine cronologico finché la base utenti è piccola; la soglia scelta per passare al ranking algoritmico vero è **100 Journey pubblicati** (non 20: con un Journey che richiede tempo reale da costruire e "Top Journeys" che mostra 8-10 posizioni, una soglia bassa farebbe coincidere "Top" con quasi l'intero catalogo). Nessuna delle due piattaforme di riferimento studiate (YouTube, Patreon) ha risolto bene questo problema in fretta, da cui la scelta di una soglia alta e prudente. La pagina "Come funziona" ha la sezione Algoritmo spostata in cima, subito dopo il titolo (prima era in fondo).

La Hero della Home mostra oggi dati veri ma non ancora un meccanismo davvero automatico: due clip fisse scelte a mano (ID di episodio hardcoded), rimandato finché non ci saranno utenti veri sulla piattaforma a giustificare un meccanismo dinamico completo (si lega al punto "selezione video Hero", S27, sopra). Il colore di sfondo della Home è stato portato a un grigio neutro con una sfumatura di luce soffusa, dopo vari tentativi sull'arancione poi tornato all'originale. Schermate di caricamento (sagome grigie) hanno sostituito lo schermo bianco, con una rivelazione ritardata di 250ms e un taglio dei viaggi al database per tre sezioni della Home.

## Updates, Messaggi, Notifiche

Gli Update supportano cinque formati (foto/video/sondaggio/domanda/reazione/link); la riga "Stories" in Home mostra solo le persone seguite (non un mix 80/20 con persone non seguite), con fallback a persone finte quando è vuota (bug dell'Update del proprietario invisibile già corretto). La messaggistica diretta 1:1 si sblocca quando UNA delle due persone segue l'altra, non serve il segui reciproco (correzione fatta a metà lavoro). Le notifiche in-sito per nuovo episodio/Journey hanno la campanella in basso a destra (non in alto). Nello StoryViewer il proprietario vede i risultati di sondaggi/domande direttamente in linea, niente pannello separato in Dashboard; un pulsante Condividi universale (icona aeroplanino di carta) permette di ripubblicare qualunque contenuto, al posto del vecchio pulsante di sola condivisione.

## Creator, Trust Score, Algoritmo di fiducia

Diventare creator è una scelta esplicita in fase di registrazione o nelle Impostazioni (non più automatico come in una versione precedente): di default si parte "Visitatore", con avvisi a 6/9/10 mesi di inattività dalla pubblicazione, chiusura della modalità creator a 10 mesi, Journey nascosti e cancellati dopo 30 giorni salvo riattivazione. Il bottone "Like" è stato rinominato **Trusty**, si sblocca solo a fine episodio, pesa il 2% nel Trust Score (non più la qualità dell'episodio). Il Trust Score v2: presentazione 5%, Trusty 2% (media per episodio), follower 15% (cappati), qualità 50% (media Journey Score), Journey ancora attivo 5%, con un tetto sull'esperienza sotto i 10 episodi; si attiva solo se il creator ha caricato un video di presentazione, altrimenti nessun badge, mai uno zero finto.

## Community (Punto 8 dell'allineamento)

L'idea di un assistente AI che costruisce strumenti per il creator a comando è diventata la chat reale della Community (CRUD vero per Workshop/Evento/Prodotto digitale/Consulenza 1:1, tutto parte come Bozza). I clic per creare qualcosa in Community sono scesi da 8 a 6 con una voce diretta nel menu laterale. Risolto un bug di cancellazione delle iscrizioni "Partecipo" che bloccava la cancellazione account. "Subscribe" è stata rinominata **Community**. Decisione presa su abbonamento vs acquisto singolo: abbonamento mensile a un livello, prezzo libero da 5 euro in su scelto dal creator, sblocca una sfida dedicata e una stanza per abbonati, mese gratis se il creator non pubblica nulla; workshop/consulenze/prodotti digitali restano vendite a parte. Le Tips sono reali mezzo link esterno, Zero non incassa né trattiene nulla.

## Design e tema chiaro/scuro

Un inventario completo del sito (162 file, migliaia di elementi grafici) ha trovato bottoni/titoli/card fatti a mano invece che con i componenti ufficiali in centinaia di casi: da qui un design system unico (`components/ui/`) e uno script (`scripts/check-design.mjs`), attivato come controllo automatico prima di ogni commit, che blocca pezzi di interfaccia disegnati a mano fuori da quei componenti. Il "lucchetto" è stato poi rinforzato fino a zero eccezioni rimaste, correggendo anche un bottone bianco rimasto fuori standard e un bug reale di animazione (`animate-bounce` lasciato attivo per sbaglio). Regola valida da allora: riusare sempre la struttura di un componente esistente invece di inventarne uno nuovo, chiedere quando c'è un dubbio di design, uno screenshot reale prima di dire "fatto" su qualcosa di visivo. Preferire sempre valori di colore già collaudati (palette professionali) piuttosto che calcolarli a mano: un tentativo di arancione derivato a mano ha richiesto tre correzioni prima di tornare al valore originale.

Il tema chiaro/scuro è stato costruito in Impostazioni (scuro di default, il chiaro è una scelta esplicita per persona). Una modifica pensata per il tema chiaro ha rotto quello scuro (dissolvenza della copertina profilo, colore del pannello statistiche, stato attivo delle schede): tutti e tre i problemi sono stati corretti, da cui la regola di verificare sempre entrambi i temi dopo un cambiamento che riguarda l'aspetto.

## Legale, moderazione, sicurezza

Documenti legali (Privacy Policy, Termini, Cookie Policy) scritti con contenuto vero. La Privacy Policy dichiara Google (Gemini) come fornitore, cosa riceve e che nel piano gratuito può usare i dati per migliorare i propri prodotti; la promessa di passare a pagamento prima del lancio è stata rimossa su richiesta di Manuel (vedi sopra). Il primo filtro automatico di moderazione copre testo e immagini, mai i video (decisione esplicita, non riproporla). Un pannello amministrativo per le segnalazioni (`/admin/reports`, visibile solo agli indirizzi admin) è stato costruito; una segnalazione confermata su un creator toglie 10 punti di Trust Score.

Niente compressione di foto/video caricati (dichiarato pubblicamente in "Come funziona"), solo un limite di dimensione alle immagini; serve ancora decidere una soglia oltre la quale comprimere e limiti più severi, non pianificato. La promessa pubblica "mai compresso" è delicata da cambiare perché compare anche nella pagina "Conosci l'algoritmo": qualunque revisione della compressione andrebbe accompagnata da una revisione di quel testo.

## Idee registrate ma non pianificate

Sezione sponsor stile Instagram per aziende che vogliono farsi conoscere; marketplace interno per contenuti UGC tra aziende e creator (stesso concetto, da unificare se mai costruiti insieme); dare risalto pubblico al principio "nessun pagamento influenza il ranking dei Journey" (dove mostrarlo ancora da decidere); tasto "salta indietro 15 secondi" nel player video (non pianificato).

## Bug chiusi, utili da ricordare perché non sono quello che sembravano

- Il tasto "indietro" percepito come "macchinoso" era un artefatto del ricaricamento a caldo in sviluppo, non un bug reale per un utente normale.
- Uno sfarfallio nello stato di login (`AuthStatus`) è stato corretto da una sessione parallela mentre un'altra lavorava altrove: promemoria che più sessioni possono toccare lo stesso sito nello stesso momento senza che sia un problema.
- Il bug di registrazione legato alla data di nascita è stato confermato risolto.
- Mai fare uno screenshot a pagina intera durante un trascinamento (drag and drop tra Capitoli): annulla silenziosamente l'operazione tramite un evento di ridimensionamento.

## Dove si trova il resto

Questo file riassume; i dettagli completi restano nei documenti già citati (`92_Project_History.md` per il racconto cronologico, `94_Product_Backlog.md` per l'elenco di lavoro corrente con le caselle da spuntare, `93_Project_Alignment_Recap.md` per l'audit punto per punto, `91_Legal_Audit_And_Roadmap.md` per il legale, `11_Database_Architecture.md` per lo schema dati, `20_Feature_Catalog.md` per l'elenco in linguaggio semplice delle funzioni per investitori).
