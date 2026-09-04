---
title: Project History
doc_id: 92-project-history
version: "1.4"
status: living
related_docs:
  - 01_Vision
  - 99_Current_Project_Status
---

# Project History

*Come è nata e cresciuta la piattaforma, capitolo per capitolo — dalla prima riga di codice a oggi. Documento vivo: quando si chiude una fase importante del progetto, si aggiunge un nuovo capitolo invece di riscrivere quelli esistenti.*

---

## Capitolo 1 — Le fondamenta

Tutto parte da un'idea semplice, scritta nel documento di Vision del progetto: *"Ogni persona parte da Zero."* Ogni grande risultato nasce da un punto di partenza, e la maggior parte dei contenuti online mostra solo il traguardo, mai il percorso. Zero nasce per invertire questa logica: una piattaforma dove le persone documentano il proprio percorso di trasformazione — non solo il risultato finale, ma tutto il processo, errori compresi — e lo rendono utile anche a chi sta affrontando lo stesso cammino.

Le prime scelte sono state infrastrutturali, non visive: prima di disegnare una sola pagina, il progetto si è dato delle regole. È nato il documento delle regole di sviluppo AI, poi lo schema del database — la mappa di tutti i dati che la piattaforma avrebbe dovuto gestire: utenti, Journey, Capitoli, Episodi.

Il tratto umano di questo capitolo è già tutto qui, anche se passa inosservato: un fondatore senza background tecnico che, prima ancora di vedere una sola pagina funzionante, ha voluto mettere per iscritto le regole con cui il progetto sarebbe stato costruito. Non è scontato — è una forma di controllo esercitata non sul codice (che non sapevi scrivere) ma sul metodo, ed è un tratto che si ritroverà in tutte le fasi successive, ogni volta che è stato chiesto di aggiornare la documentazione prima di considerare chiuso un pezzo di lavoro.

Subito dopo è arrivata l'autenticazione completa, costruita con Better Auth, Prisma e Neon. Il primo pezzo di interfaccia "vera" è stato il componente JourneyCard, collegato a una prima homepage. Da lì in poi, ogni nuova funzionalità avrebbe avuto un posto dove apparire.

---

## Capitolo 2 — La prima identità visiva

Con le fondamenta tecniche pronte, l'attenzione si è spostata sull'aspetto: la landing page ha ricevuto un hero con foto di sfondo a rotazione e un logo vettoriale — con "trasparenza corretta", una precisazione che nel messaggio del commit racconta implicitamente un primo tentativo non riuscito, sistemato subito dopo. Sono arrivate poi animazioni più curate e cinematiche.

È un capitolo breve e più tecnico degli altri, ma segna comunque un'abitudine che si ripeterà spesso lungo tutta la storia di Zero: un primo tentativo, seguito quasi subito da una correzione mirata, invece di procedere finché qualcosa non sembra "abbastanza buono" al primo colpo.

In questa fase nasce anche la documentazione ufficiale completa del progetto: Vision, Mission, principi di prodotto, tutto scritto prima di costruire le funzionalità che ne sarebbero dipese.

---

## Capitolo 3 — Il cuore del prodotto: il Journey

Qui nasce il concetto centrale della piattaforma: il **Journey**, un percorso di trasformazione diviso in Capitoli e Episodi. Prima il profilo creator e la creazione di un Journey, poi il CRUD completo di Capitoli ed Episodi al suo interno.

Una decisione importante presa in questa fase, poi ribadita più volte nel tempo: **"Creator" non è una categoria di utente separata, ma uno stato.** Chiunque si registri su Zero può diventare creator pubblicando il proprio primo Journey, senza una schermata dedicata da attraversare prima. È probabilmente la scelta più "umana" di tutto il progetto: rifiutare di dividere le persone in due caste (chi crea e chi guarda) fin dal disegno del prodotto, non come ripensamento. Il principio è stato scritto nella documentazione e — come racconta il Capitolo 9 — mesi dopo è stato reso ancora più automatico, eliminando anche l'ultimo residuo tecnico di quella separazione.

In questo capitolo arriva anche una scelta che dice qualcosa sull'ambizione del progetto: rendere l'inglese la lingua ufficiale di tutta l'interfaccia, pur essendo un progetto pensato, discusso e costruito in italiano fin dal primo commit. Un atto di fiducia in un pubblico più ampio di quello immediato. Alla fine di questa fase viene fissato un primo traguardo nella documentazione: lo stato dell'MVP, un punto fermo da cui ripartire — il primo di molti "tiriamo il fiato e scriviamo dove siamo arrivati" che punteggiano tutta la storia del progetto.

---

## Capitolo 4 — Da prototipo a sito vero

Con il Journey funzionante lato creator, il progetto si allarga verso chi guarda e scopre contenuti. Arriva la pagina pubblica del Journey, e l'area privata del creator viene rinominata da `/creator` a `/dashboard` per liberare l'indirizzo in vista del futuro profilo pubblico — una decisione presa in anticipo su un bisogno che sarebbe arrivato solo più avanti.

Cresce il lato "scoperta": profilo pubblico minimo, Follow, categorie fisse, "New Journeys", "Continue Your Journey", raccomandazioni, Feed, ricerca base.

C'è un dettaglio piccolo ma rivelatore in questa fase: quando il database non aveva ancora nessun Journey pubblicato per davvero, la Home mostrava dei Journey demo invece di restare vuota. Non è stata una necessità tecnica — sarebbe bastato non mostrare nulla — ma una scelta di come il sito doveva *sentirsi* mentre ancora non c'erano utenti veri: mai disabitato, mai a metà, anche in una fase in cui, di fatto, lo era. È lo stesso pensiero che oggi, mentre aspetti che i tuoi primi Journey di prova escano dalla Discovery Phase, tiene la Home popolata invece che vuota.

---

## Capitolo 5 — Fiducia e scoperta: nasce l'algoritmo

Qui il progetto prende una posizione, più che una funzionalità. L'algoritmo di raccomandazione di Zero è costruito attorno a un'idea dichiarata esplicitamente: **non è progettato per massimizzare il tempo passato sulla piattaforma**, ma per mettere in contatto ogni persona con i Journey più rilevanti per lei.

Il **Trust Score** premia solo continuità e qualità verificata, mai comportamento "ingaggiante". La **Discovery Phase** dà 15 giorni di visibilità piena a ogni Journey nuovo, per aiutare le persone a scoprire cose che non stavano già cercando. Il **Journey Score** limita deliberatamente il peso dei follower con un tetto massimo, e dà ai like un peso volutamente basso.

Questo è probabilmente il capitolo più personale di tutti, anche se non parla di eventi ma di principi: è la parte del progetto in cui la tua idea di cosa Zero *non* deve diventare — un altro posto che ottimizza per tenerti incollato allo schermo — è stata tradotta in regole tecniche precise, invece di restare un'intenzione dichiarata solo a parole.

---

## Capitolo 6 — Notifiche e Updates in stile Stories

Arrivano le notifiche interne al sito — con la campanella in basso a destra, non in alto come quasi ovunque: una piccola rottura deliberata con la convenzione.

Poi gli **Updates ricchi** in stile Stories: foto, video, sondaggi, domande, reazioni, link. Qui il progetto ha cambiato idea in corsa almeno due volte, ed è visibile nella cronologia. La riga delle Stories doveva inizialmente mostrare un mix di creator seguiti e non — poi si è deciso che restasse un canale riservato a chi si segue davvero, una scelta più intima e meno "algoritmica". E i risultati di sondaggi e domande erano stati inizialmente pensati come un pannello a sé nella Dashboard: una volta costruito, non convinceva — non si integrava visivamente col resto — ed è stato tolto e ricostruito da capo direttamente dentro il visualizzatore delle Stories, in stile Instagram. Non capita spesso che un pezzo di lavoro già fatto e funzionante venga smontato perché "non si sentiva giusto"; qui è successo.

---

## Capitolo 7 — Connessioni tra persone

Il Follow diventa universale: qualsiasi persona può seguirne un'altra, non solo un creator. Su questa base nasce la messaggistica privata — e anche qui c'è un ripensamento in corsa, forse il più significativo di tutta la progettazione: l'idea iniziale era di sbloccare i messaggi solo con un follow **reciproco**, poi corretta a un follow in **una sola direzione**. È la differenza tra un prodotto che protegge la privacy per default e uno che facilita il contatto per default — e la scelta finale racconta quale delle due priorità hai deciso pesasse di più per Zero.

---

## Capitolo 8 — Il redesign Lovable

Con le funzionalità principali in piedi, il progetto attraversa un riallineamento visivo importante su un design di riferimento costruito su Lovable, seguito con una checklist a fasi.

È il capitolo con più iterazione visibile in assoluto: la posizione del logo nell'Hero e dei cerchi Updates è stata corretta più volte in commit ravvicinati — "logo Hero, Updates spostati sotto i bottoni" torna identico due volte a distanza di poco, segno che la prima sistemazione non aveva convinto fino in fondo, seguita da un commit esplicito di "correzioni Home su richiesta di Manuel". Non è un dettaglio negativo: è la prova di un lavoro fatto guardando davvero il risultato ogni volta, non spuntando una lista.

E in mezzo a un intero design system preso da un riferimento esterno, un dettaglio è rimasto tuo e basta: il bagliore arancione al passaggio del mouse sulle card fotografiche non esiste nel sorgente Lovable. L'hai voluto comunque, ovunque nel sito — l'unica firma personale dentro un capitolo che per il resto segue pedissequamente un disegno altrui.

---

## Capitolo 9 — Rifiniture e cura dei dettagli

Il lavoro si concentra su ciò che fa la differenza tra un prodotto che "funziona" e uno che si sente curato: nuova gerarchia visiva, cancellazioni reali con conferma esplicita, drag & drop tra Capitoli diversi.

Un filo ricorrente in questa fase è l'onestà verso lo stato reale del progetto: più di una sessione è stata dedicata solo a correggere la documentazione perché non rifletteva più il codice — "pulizia completa dopo verifica sul codice reale", "correggi stato disallineato". È una forma di rigore poco comune: fermarsi a controllare che quello che è scritto corrisponda a quello che esiste davvero, invece di lasciar scivolare la documentazione verso l'obsolescenza.

Arriva anche la cancellazione dell'account con un periodo di grazia di 10 giorni prima della rimozione definitiva — una scelta che protegge chi prende una decisione d'impulso, invece di renderla immediata e irreversibile.

E infine i link "indietro" — una frustrazione piccola e silenziosa, notata e sistemata due volte prima di sentirla davvero risolta. Il primo tentativo li ha resi tutti uguali nello stile ma ha lasciato ogni pagina con una destinazione fissa diversa (una volta la Journey, un'altra i Messaggi): appena provato, non ha convinto — "non è intuitiva", la destinazione cambiava da pagina a pagina ed era difficile da prevedere. È stato smontato e ricostruito da capo come un unico pulsante, sempre nello stesso punto in alto a sinistra, arancione, che non porta più a un posto fisso ma torna davvero alla pagina vista prima — come il tasto indietro del browser — e scompare quando quella pagina precedente non esiste.

---

## Capitolo 10 — Un menu vero, non più una scorciatoia

La coerenza della navigazione, affrontata a fasi nelle sessioni precedenti, si chiude con l'ultimo tassello: un menu per smartphone che all'inizio dell'ultima fase era pensato come una piccola tendina con quattro link, il minimo indispensabile per non lasciare la navigazione irraggiungibile sotto una certa larghezza dello schermo.

Non è rimasto così a lungo. Nella stessa sessione in cui quella tendina è nata, è stata smontata e ricostruita come qualcosa di molto più grande: un pannello laterale che scorre da sinistra, disponibile ovunque — non solo su smartphone — con dentro il profilo, la Dashboard, le Impostazioni, la navigazione principale, l'elenco di chi si segue e tutti i link legali e informativi del sito. Una decisione esplicita, presa insieme, è stata che questo pannello affiancasse il menu orizzontale già esistente su desktop invece di sostituirlo: due modi di raggiungere le stesse pagine, non una gerarchia a scapito dell'altra.

Ed è in questo stesso capitolo che nasce l'area **Impostazioni**, prevista da tempo nella documentazione ma mai costruita per davvero. Non è arrivata come una schermata sola: cambio password ed email da loggati (una funzione che il sistema di autenticazione già offriva sotto il cofano, mai collegata a un'interfaccia) e le preferenze di notifica (quali eventi avvisano un utente, e quali no) sono diventate funzionalità reali fin da subito, non rimandate a "poi". Privacy e Abbonamento restano invece segnaposto dichiarati — il primo perché tocca una parte del prodotto (chi può scrivere a chi, un profilo privato) che merita una progettazione propria; il secondo perché i pagamenti non sono ancora collegati.

Le pagine legali (Termini, Privacy, Cookie, Linee guida community, Copyright, Contattaci) esistono ora come indirizzi reali, raggiungibili dal pannello — ma vuote, in attesa dei testi veri. Anche qui, la stessa disciplina già vista altrove nella storia di Zero: costruire prima l'impalcatura corretta, poi riempirla, invece di lasciare un buco nella navigazione finché il contenuto non sarà pronto.

---

## Capitolo 11 — Journeys e Journeyers, e un menu che smette di scattare

La voce "Discover" del menu, che per una fase intera aveva puntato a una semplice sezione della Home, diventa finalmente una pagina propria: **Journeyers**, la vetrina delle persone al posto di quella dei Journey. Le due pagine nascono insieme, Journeys e Journeyers, con lo stesso linguaggio visivo — righe scorrevoli orizzontalmente per categoria, esattamente lo stile "Netflix" che la documentazione descriveva da tempo ma che, si scopre in questo stesso capitolo, non era mai stato davvero costruito: le righe della Home che sembravano scorrere lateralmente erano in realtà semplici griglie che andavano a capo. Il componente vero — con le frecce cliccabili a sinistra e a destra, mai uno scorrimento automatico, una scelta esplicita — viene costruito qui per la prima volta.

In mezzo a ogni riga di Journey compare una card **Wildcard**, che porta a un percorso scelto a caso nella stessa categoria — un invito alla scoperta casuale che il resto del sito, tutto orientato a raccomandazioni mirate, non offriva ancora. E in questo capitolo il progetto smette anche di avere due stili di card diversi per lo stesso tipo di contenuto: le card Journey, che sovrapponevano titolo e categoria alla foto, vengono riportate allo stesso linguaggio già usato altrove (testo sotto l'immagine, mai sopra) — non un'eccezione locale alle nuove pagine, ma una correzione applicata a ogni pagina del sito che usa quelle stesse card.

L'ultimo pezzo di questo capitolo è il più invisibile e forse il più significativo: il menu in alto, che da sempre veniva ricostruito da zero a ogni cambio pagina, veniva effettivamente smontato e rimontato ogni volta — uno scatto percepibile passando da una pagina all'altra, notato e segnalato subito. La correzione non è stata un ritocco estetico ma strutturale: il menu si è spostato in un unico punto condiviso da tutte le pagine principali del sito, che ora lo mantengono vivo invece di ricrearlo. Nello stesso lavoro emerge e viene sistemato anche un piccolo difetto più vecchio, mai notato prima: il pulsante "indietro" restava a volte visibile in Home quando non aveva senso che ci fosse, perché la logica che ne teneva traccia riconosceva solo un passo indietro alla volta, non un salto diretto a una pagina già vista.

---

## Capitolo 12 — Piccole crepe, trovate solo guardando davvero

Questo capitolo non aggiunge una funzionalità grande: mette a posto una manciata di crepe piccole nella messaggistica, ognuna invisibile finché qualcuno non ci è davvero incappato usando il sito, non leggendo il codice.

Il filo conduttore è sempre lo stesso, ripetuto tre volte in forme diverse: un'azione (seguire qualcuno, leggere un messaggio) scriveva correttamente il dato giusto nel database, ma lo schermo non ne veniva mai avvisato. Il pulsante "Message" restava invisibile dopo aver seguito qualcuno finché non si ricaricava la pagina a mano. Il pallino rosso dei messaggi non letti restava acceso anche dopo aver aperto e letto la conversazione, convincendo chi guardava che l'unico modo per spegnerlo fosse rispondere — un comportamento che, sul tema della fiducia su cui è costruita tutta la piattaforma, sembrava quasi avere un senso, e invece era solo un bug. In entrambi i casi la correzione tecnica è stata la stessa idea applicata due volte: dire esplicitamente alla pagina "qualcosa è cambiato, aggiornati", invece di aspettare che se ne accorgesse da sola.

Vale la pena raccontare come è stato trovato il secondo di questi due bug, perché dice qualcosa sul metodo di questa sessione: una prima lettura del codice sembrava dire che il pallino si spegnesse già correttamente alla sola apertura della chat. Solo un "controlla meglio, te lo assicuro" — la certezza di chi il prodotto lo usa davvero, non solo lo legge — ha spinto a rifare la verifica sul sito vero invece che fidarsi del codice, e a scoprire che la prima lettura era incompleta. È un promemoria semplice: il codice dice cosa *dovrebbe* succedere, non cosa succede davvero sullo schermo di chi guarda.

Nello stesso capitolo emerge anche un pezzo mai completato: il tipo di notifica per i nuovi follower esisteva già nella struttura dati fin dalle prime fasi del progetto, ma nessuno lo aveva mai collegato a un punto che la creasse davvero — un pezzo di impalcatura costruito in anticipo, come già successo altrove nella storia di Zero (le pagine legali vuote del Capitolo 10), ma stavolta dimenticato invece che rimandato di proposito.

Chiude il capitolo un piccolo miglioramento all'iconcina messaggi in basso a destra, che da semplice elenco di conversazioni verso cui navigare diventa una finestra di risposta rapida: si clicca una conversazione e si risponde lì, senza lasciare la pagina che si stava guardando — la lista completa resta a un clic di distanza per chi la vuole davvero.

---

## Capitolo 13 — Etichette che dicono la verità, e un giro di pulizia

Questo capitolo comincia con un dettaglio minuscolo: un campo del Journey, "Your story, in a few words", etichettato "optional" — ma che in realtà bloccava la pubblicazione se lasciato vuoto. Non un bug nella logica, un bug nella sincerità dell'interfaccia: il campo si comportava in un modo e diceva di comportarsi in un altro. La prima correzione è stata onesta ma minima, "(required to publish)" al posto di "optional". Poi lo stesso identico difetto è riemerso da un'altra parte, nel form dell'Episodio, in una forma più contorta: Caption e Video, entrambi "optional", quando in realtà bastava uno dei due — ma non era vero nemmeno quello, perché serviva comunque qualcosa già solo per salvare una bozza. Il primo tentativo di spiegarlo meglio a parole ("required if no video") si è scontrato con un "ancora non ho capito, non è intuitivo" — ed è stata la spinta a tornare indietro e semplificare non il testo, ma la regola stessa: la Caption è sempre facoltativa, punto; il Video è l'unico campo richiesto per pubblicare, esattamente come la Description del Journey. Stesso meccanismo in entrambi i posti, capibile a prima vista in entrambi — un problema di parole che si è rivelato, guardando meglio, un problema di logica.

Una seconda richiesta, quasi opposta nello spirito, ha attraversato il resto della sessione: rendere il sito più compatto. Non un'incoerenza da correggere trovando una via di mezzo, ma una direzione precisa — "per vederlo bene devo tenere lo zoom del browser al 75%" — che ha spinto a scegliere, punto per punto, sempre lo stile più piccolo già esistente da qualche parte nel sito, mai una misura nuova inventata a metà strada. Titoli di pagina, titoletti di sezione, riquadri vuoti, larghezze dei contenitori: uniformati ovunque, con due eccezioni tenute deliberatamente meno estreme — i titoli delle sezioni di Home e Discover, che nella Home reale hanno un ruolo di orientamento che un titolo minuscolo avrebbe indebolito, e la pagina di Ricerca, spostata nella famiglia di pagine "larghe" invece che in quella stretta, perché il suo contenuto (griglie di card affiancate) lo richiedeva.

Il pezzo più rivelatore del capitolo, però, è arrivato da un'osservazione che il codice da solo non avrebbe mai fatto emergere: aprendo la pagina Journeyers con un solo iscritto — se stesso — Manuel ha notato che la propria foto profilo non compariva, solo le iniziali. Controllando, il motivo non era un errore isolato: ogni punto del sito che mostra più persone insieme — Journeyers, i risultati "Creators" e "People" della Ricerca, i creator raccomandati — non aveva mai chiesto la foto al database, in nessuno dei quattro casi. L'unico posto che la foto la mostrava davvero era l'intestazione del Profilo personale. La prima correzione ha mostrato la foto vera dentro lo stesso cerchietto piccolo che prima portava le iniziali — tecnicamente giusta, visivamente sbagliata: "lo vedi che la foto è tonda e non riempie la card [...] te lo avevo detto subito di fare attenzione." La versione definitiva fa esattamente quello che fa la copertina di un Journey: riempie tutto il riquadro rettangolare, non un cerchio piccolo al centro. Stessa foto, stesso ritaglio già quadrato scelto in fase di caricamento — bastava trattarla come una copertina, non come un'iniziale.

Chiude il capitolo un giro di manutenzione sul registro delle cose da fare (`98_Product_Review.md`): rileggendo il codice voce per voce invece di fidarsi delle spunte esistenti, sono emerse altre voci già risolte da tempo ma mai segnate — la conferma di cancellazione per Capitoli ed Episodi, il drag & drop dei Capitoli, le categorie già in ordine alfabetico, una "data Recorded separata" che semplicemente non esisteva più. Lo stesso principio già visto nel Capitolo 12 — verificare sul prodotto vero, non fidarsi di cosa dice la documentazione o il codice a prima lettura — applicato stavolta non a un bug, ma alla lista stessa dei bug.

---

## Epilogo — Dove siamo oggi

A oggi, il percorso creator è completo e verificato end-to-end. Profilo pubblico, Follow universale, ricerca (ora per singola parola, non più solo a frase intera), Feed, Categorie, Updates e messaggistica funzionano con dati reali. La navigazione del sito è coerente su ogni pagina e ogni larghezza di schermo, con un'area Impostazioni reale al suo interno — inclusa una nuova sezione Creator, con il controllo sulla notifica "nuovo follower" — e con Journeys e Journeyers finalmente due pagine vere invece di una scorciatoia verso la Home. Ogni punto del sito che mostra una persona, non solo un Journey, mostra ora la sua foto vera quando c'è.

Non ci sono ancora Journey pubblicati da utenti veri: solo tre Journey di prova tuoi, la cui "laurea" dalla Discovery Phase era prevista per i primi giorni di settembre 2026 — il momento in cui la Home smetterà di mostrare i Journey demo di riserva.

Restano aperti: Analytics reali e Community Premium, i pagamenti (Stripe non ancora collegato, da cui dipendono anche Abbonamento nelle Impostazioni e i Payout nella nuova sezione Creator), i testi legali veri (Termini, Privacy, Cookie, Linee guida community — le pagine esistono già, vuote), la Privacy nelle Impostazioni (profilo privato, utenti bloccati), un aspetto più "premium" per le pagine del sito e l'alternanza dei colori di sfondo, non ancora rivisti nel dettaglio.

C'è anche un tratto di metodo che ha accompagnato tutte le ultime sessioni di lavoro e che vale la pena raccontare: l'abitudine di affrontare un solo compito per sessione, invece di incatenare più funzionalità insieme nello stesso momento. È coerente con tutto il resto di questa storia — un progetto costruito un pezzo alla volta, verificato prima di passare al successivo, con una Vision scritta il primo giorno ("il percorso conta più del risultato") che si ritrova, con sorprendente coerenza, tanto nel prodotto quanto nel modo in cui è stato costruito.