---
title: Project History
doc_id: 92-project-history
version: "1.7"
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

## Capitolo 14 — La sfumatura che non voleva saperne

Il capitolo comincia con un problema all'apparenza piccolo — la foto di copertina del Profilo che finisce di colpo nel nero invece di sfumare — e diventa la storia di un difetto nascosto negli strumenti stessi usati per costruire il sito, non nel design.

I primi tentativi seguono la strada ovvia: allungare la sfumatura, poi accorciarla, poi ridurne l'intensità. Nessuno basta da solo, e ognuno rivela un pezzo di verità diverso. Una sfumatura più lunga scurisce troppo la foto nel complesso. Una cortissima resta comunque percepita come una riga netta anche quando i pixel, misurati uno per uno, cambiano colore in modo perfettamente continuo: è un'illusione ottica reale (l'effetto "banda di Mach"), non un errore di codice — l'occhio segnala il punto in cui l'oscuramento *comincia bruscamente*, non solo dove il colore cambia.

Il colpo di scena arriva dopo aver scritto una sfumatura "ad S" pensata apposta per evitare quell'effetto: il codice è corretto, ma sulla pagina non cambia assolutamente nulla. "Siamo sicuri che hai fatto il lavoro?" smonta l'assunzione sbagliata di quel momento — controllare che un file sia stato salvato non è la stessa cosa che controllare se il browser lo ha davvero ricevuto. Il confronto diretto tra il file sorgente e il CSS effettivamente scaricato dal sito trova la causa vera: una combinazione specifica di funzioni CSS moderne (`color-mix()` insieme a una variabile di colore) veniva scartata in silenzio dalla pipeline di build del progetto, senza nessun errore visibile — il file si salvava, il sito compilava, ma quella singola regola spariva nel nulla. Scritta con gli stessi valori in modo diretto, la sfumatura funziona subito.

Risolto il mistero tecnico, la richiesta cambia natura: non più "sistema la sfumatura", ma "elimina il blocco nero" — le statistiche e i bottoni dell'intestazione del Profilo escono dalla fascia scura separata sotto la foto e si spostano dentro la foto stessa, come elementi in vetro smerigliato che galleggiano su un'immagine ora molto più alta. Lo stesso trattamento arriva poi alla barra "Overview / Journeys", che perde lo sfondo nero pieno e diventa due pillole in vetro coerenti con il resto.

Il capitolo chiude con una scoperta separata, sulla card del Journey "in corso" del Profilo: una copertina verticale (lo stesso formato "poster" usato ovunque nel sito) forzata dentro un riquadro basso e largo, che ne tagliava via più della metà — più un effetto "si solleva al passaggio del mouse" che, vicino al bordo della card, innescava un piccolo loop di sfarfallio: il cursore esce dalla card quando questa si sposta, l'hover si spegne, la card torna giù, il cursore rientra, l'hover si riaccende, e così via. Due difetti diversi, la stessa lezione del capitolo: quello che sembra un dettaglio estetico nasconde spesso una causa tecnica precisa, che vale la pena trovare invece di limitarsi a spostare i numeri di un CSS finché "sembra meglio".

---

## Capitolo 15 — "Due click, come su Instagram"

Il capitolo comincia con una scoperta scomoda: caricando un video da un profilo diverso dal solito, Manuel scopre che il Journey appena creato finisce in Bozza — invisibile a tutti — senza che nessuno gliel'abbia detto né fatto scegliere. Il bottone diceva "Publish", ma pubblicava solo l'episodio: il Journey che lo conteneva restava fermo, perché pubblicarlo per davvero richiede anche una breve descrizione che quel percorso rapido non aveva mai chiesto.

La richiesta che segue non è "aggiungi un avviso", ma una riscrittura del meccanismo stesso: tutto il caricamento veloce dal tasto "+" — scegliere il video, la copertina, a quale Journey aggiungerlo, titolo e didascalia — diventa un'unica schermata invece di quattro passaggi in fila, con la copertina proposta in automatico da un fotogramma del video stesso (estratto nel browser, senza upload preliminare), esattamente come fa Instagram. Un solo "Publish" ora pubblica davvero tutto insieme: episodio e Journey, usando la didascalia come descrizione breve quando il Journey è nuovo — così il bottone fa esattamente quello che promette.

Il resto del capitolo è una serie di correzioni rapide fatte insieme a Manuel mentre provava dal vivo la nuova schermata: niente più scroll per vedere tutte le opzioni, la copertina ridimensionata più volte fino a una misura "via di mezzo" nel formato verticale già usato dalle card degli episodi, una X per rimuovere il video scelto al posto di una scritta cliccabile, "Episode title" al posto di un generico "Title" ripetuto due volte senza contesto, e il bottone Publish che diventa cliccabile appena il video è pronto invece di restare grigio — misterioso — finché ogni campo di testo non è compilato.

L'ultima scoperta del capitolo arriva da una domanda semplice: perché la copertina di un episodio appena creato non si vede riaprendo la pagina per modificarlo? La copertina, in realtà, c'era — verificata fino al file vero su Cloudflare R2 — ma quella vuota era un'altra: la copertina del *Journey*, che il percorso veloce non aveva mai pensato di impostare, lasciando un riquadro nero apparentemente rotto su una pagina diversa da quella descritta all'inizio. Un Journey creato al volo ora eredita automaticamente la stessa copertina scelta per il suo primo episodio — una copia vera del file, non lo stesso riferimento condiviso, così cancellare l'uno in futuro non spezza l'altro.

Chiude il capitolo un piccolo giallo tecnico nato da un tentativo di rendere più nitida la foto di copertina dell'Hero: alzare la qualità dell'immagine nel codice non cambiava assolutamente nulla sullo schermo. La causa era una novità silenziosa di Next.js 16, la versione "non classica" di cui il progetto avvisa fin dal primo file letto da chi ci lavora: da questa versione in poi le qualità delle immagini vanno dichiarate in una lista esplicita nella configurazione del sito, altrimenti l'unica concessa resta 75 di default, qualunque valore si scriva nel componente. Corretto quello, la differenza si è rivelata reale ma sottile a occhio nudo su una foto di paesaggio — un promemoria che non tutte le correzioni tecnicamente corrette producono un effetto visibile eclatante, e va bene così.

---

## Capitolo 16 — Un sito più piccolo, una foto che non aspetta più

Una richiesta arrivata quasi di sfuggita — "per vederlo bene tengo lo zoom del browser al 75%" — era già stata affrontata una volta, nel Capitolo 13, senza risolversi alla radice. Qui torna e si chiude in un colpo solo: una sola riga in fondo al foglio di stile globale (`font-size: 85%` sull'elemento radice) restringe ogni spaziatura e ogni misura di testo del sito, replicando in modo permanente quello che prima si otteneva solo riducendo lo zoom del browser a mano. La conseguenza, prevedibile ma non pensata in anticipo, è che alcuni titoli — nel Profilo, nelle card di Journey, video e persone, nell'intestazione "Episodes" della pagina Journey — sono diventati troppo piccoli insieme al resto. La correzione non tocca ogni pagina una per una: torna ai componenti condivisi che generano quei titoli ovunque compaiano, così la leggibilità si ripara in un solo punto e si propaga da sola a Home, Journeys, Journeyers e Discover.

Nello stesso arco di lavoro, un fastidio piccolo ma frequente — foto profilo, copertine e Journey che restano un rettangolo vuoto o grigio finché non finiscono di caricare da Cloudflare R2 — trova una soluzione condivisa invece di tre riparazioni separate: un solo componente, `FadeImage`, mostra uno sfondo che pulsa leggermente mentre aspetta e poi dissolve dolcemente l'immagine vera al suo posto, riusato ovunque il problema si ripeteva.

Il Trust Score, presente da tempo come piccola etichetta accanto al nome di un creator, riceve finalmente una spiegazione raggiungibile — un pannello che si apre al tocco, per chi si è sempre chiesto cosa significasse quel numero senza mai trovare un modo per scoprirlo — e lo stile "vetro arancione" nato sulla pagina "What is Zero" si estende al resto del Profilo pubblico: bio, statistiche, schede Overview/Journeys, ogni bottone dell'intestazione. Arriva anche più libertà per chi pubblica: l'editor di ritaglio delle immagini poteva solo ingrandire, mai rimpicciolire, corretto per dare a chi carica una foto lo stesso controllo che altre piattaforme non offrono — coerente con una richiesta esplicita di lasciare ai creator la massima libertà di modificare i propri contenuti anche dopo averli pubblicati, non solo mentre sono ancora in bozza.

Chiude il capitolo un cambiamento più di sostanza che di stile: la pagina "How it works" diventa "Know the Algorithm. Know Zero." — non solo un nuovo titolo, ma nuovi contenuti che spiegano per la prima volta, in parole semplici, come funziona davvero l'algoritmo di scoperta descritto nel Capitolo 5 (perché un Journey con 5 follower può essere visto quanto uno con 600), che pubblicare non è una scelta per sempre, e come esportare un video mantenendo la qualità originale. La voce "Algorithm" si sposta in cima al menu, non più in fondo — a segnalare che non è un dettaglio tecnico, ma un pezzo di fiducia che vale la pena spiegare per primo.

---

## Capitolo 17 — La Hero smette di fingere

Nel Capitolo 4, la Home — ancora senza un solo Journey pubblicato per davvero — aveva iniziato a mostrare foto demo piuttosto che restare vuota: una scelta di come il sito doveva *sentirsi*, non una necessità tecnica. Quella scelta è rimasta ferma per mesi, silenziosamente, mentre tutto il resto del prodotto cresceva intorno a lei — la citazione in apertura della Home era sempre la stessa, sempre finta, indipendentemente da cosa esistesse ormai davvero sulla piattaforma.

Questo capitolo la chiude: `getHeroJourneys()` sceglie ora i Journey veri con il punteggio più alto tra quelli con una copertina reale — lo stesso criterio già usato per "Top Journeys", non un algoritmo nuovo inventato apposta — e mostra titolo, categoria e nome del creator al posto della citazione inventata, con ogni fotografia che diventa un link cliccabile verso il Journey che rappresenta davvero. Le quattro foto demo non sono state cancellate: restano come riserva automatica, pronte a ritirarsi da sole nel momento in cui esisterà un numero sufficiente di Journey reali con copertina — lo stesso principio del Capitolo 4, applicato ora al contrario: non più "mostra qualcosa finché non c'è nulla di vero", ma "lasciati da parte automaticamente appena qualcosa di vero esiste".

---

## Capitolo 18 — Video più leggeri, ma non ancora

Una richiesta arriva con un vincolo scritto prima ancora della richiesta stessa: creare automaticamente versioni più leggere di ogni video per chi ha una connessione lenta, ma senza toccare mai il file originale caricato dal creator — un impegno già preso pubblicamente nella pagina "Know the Algorithm. Know Zero." del capitolo precedente ("Zero non comprime mai il tuo video"), che questa funzionalità non doveva contraddire.

La richiesta arriva anche con un'istruzione insolita rispetto al ritmo abituale delle sessioni: nessun codice prima di un piano completo, da approvare a parole. Il piano confronta due strade — Cloudflare Stream, che elabora un video intero e ne serve automaticamente la qualità giusta a chi guarda in base alla connessione, e "Media Transformations", un servizio più recente dello stesso fornitore che sulla carta sembrava più economico ed elegante. Solo verificando la documentazione fino in fondo emerge perché la seconda strada va scartata: è limitata a 60 secondi di output, pensata per brevi clip o anteprime, non per un episodio intero di più minuti — un dettaglio che a uno sguardo superficiale sarebbe potuto sfuggire, facendo scoprire il problema solo a metà lavoro.

Approvato il piano, il codice segue esattamente la struttura decisa: dopo la pubblicazione, l'episodio manda in background una richiesta a Cloudflare Stream, senza aspettare che l'elaborazione finisca; un avviso automatico (webhook) segnala quando la versione leggera è pronta, con un controllo di riserva una volta al giorno — lo stesso meccanismo già usato per la cancellazione degli account (Capitolo 9), riadattato — per i casi in cui l'avviso si perdesse. Il video originale resta esattamente dov'era, mai sostituito; il player usa la versione leggera solo quando è pronta, altrimenti mostra l'originale, senza che chi guarda debba mai scegliere nulla a mano.

L'ultima decisione del capitolo non è tecnica ma di tempismo: il codice resta scritto e verificato, ma volutamente spento, in attesa che l'account Cloudflare Stream venga collegato per davvero — una scelta deliberata di aspettare che sulla piattaforma ci siano utenti reali prima di iniziare a spendere su un servizio a consumo, non un lavoro lasciato a metà. La stessa disciplina già vista altrove nella storia di Zero (le pagine legali vuote del Capitolo 10, la notifica "nuovo follower" mai collegata del Capitolo 12): costruire l'impalcatura corretta subito, e accenderla solo quando serve davvero.

---

## Capitolo 19 — Coerenza ovunque, e un fantasma nel login

Il capitolo si apre con un allarme che sembrava serio e non lo era: dopo qualche giorno di pausa, il login rifiutava la password — non solo la sua, anche quella di un secondo account provato apposta per escludere un problema personale. La causa, una volta scavato fino in fondo, non aveva nulla a che fare con password o account: il server di sviluppo, rimasto acceso per giorni senza un riavvio, si era semplicemente incantato, rispondendo "pagina non trovata" persino sull'indirizzo che gestisce login e reset password. Un riavvio ha risolto tutto in un attimo — un promemoria che non ogni messaggio d'errore racconta la verità su dove sia davvero il problema.

Poi arriva un test genuino sulla funzione "riprendi da dove hai lasciato", nata mesi prima nel lettore video: guardando un episodio a metà e tornando dopo un sign-out/sign-in, il video ripartiva da zero. L'indagine trova un difetto reale, anche se più sottile di quanto sembrasse a prima vista: la funzione funziona, ma smette di farlo per sempre nel momento in cui un episodio viene segnato come "completato" anche una sola volta — un ri-guardato parziale successivo riparte sempre dall'inizio, indipendentemente da dove ci si era fermati l'ultima volta. Un secondo test, su un episodio diverso mai completato, conferma che il meccanismo di base funziona benissimo. Il difetto resta annotato, ma per scelta esplicita non viene corretto in questa sessione: non tutto quello che si trova va sistemato subito.

Il resto della sessione è una lunga passata di coerenza visiva, partita da un dettaglio piccolo — le card degli episodi nella pagina di un Journey occupavano tutta la larghezza dello schermo con quasi nulla dentro — e finita per toccare quasi ogni card del sito. Le icone di categoria e l'icona play, fino a qui bianche e neutre su ogni copertina, diventano arancioni ovunque compaiano, comprese le card del Profilo che non le avevano mai avute. Le dimensioni delle card, diverse da sezione a sezione — alcune in 16:9, altre in 4:5, alcune sezioni con più colonne di altre pur usando lo stesso formato — vengono uniformate al 4:3 di "Journeys of the Moment" in tutta la Home, nel Profilo e nella pagina Journeys dedicata, con due eccezioni tenute deliberatamente diverse: la card "In Progress" in evidenza sul Profilo, e le card episodio dentro il player e la pagina Journey, già sistemate a parte poco prima nello stesso capitolo. "Discovering Now", "Recommended for you" e "Top Journeys" vengono a loro volta ridotte a una sola riga di quattro elementi con "View all" per il resto — la stessa logica già adottata per "Latest Videos" e "Journeys of the Moment": coerenza non solo nella forma delle card, ma anche nel loro numero.

Torna in Home, in questo stesso capitolo, una funzionalità che esisteva già a metà nel codice ma che nessuno vedeva da mesi: **Continue Watching**. La logica per calcolare quali Journey un utente sta seguendo passo passo era stata scritta tempo prima, ma usata solo per escludere quei contenuti dalle righe di scoperta — la riga vera e propria era stata tolta dalla Home con l'idea di spostarla nel Profilo, un trasloco poi mai avvenuto. Ora la riga torna, in cima alla Home subito sotto l'Hero, visibile solo a chi ha davvero un episodio a metà da riprendere.

Chiude la sessione l'unico pezzo di lavoro discusso in anticipo prima di scrivere una sola riga di codice: il bottone "Add Episode" della dashboard, più macchinoso della sua controparte veloce (il "+" globale, nato nel Capitolo 15), viene ricostruito da capo sulla stessa esperienza in due gesti — video, copertina automatica dal fotogramma, titolo, pubblica — mantenendo però l'unica differenza funzionale che valeva la pena conservare: l'interruttore Bozza/Pubblicato, che il flusso rapido del "+" non ha mai avuto e che qui resta.

---

## Epilogo — Dove siamo oggi

A oggi, il percorso creator è completo e verificato end-to-end. Profilo pubblico, Follow universale, ricerca (ora per singola parola, non più solo a frase intera), Feed, Categorie, Updates e messaggistica funzionano con dati reali. La navigazione del sito è coerente su ogni pagina e ogni larghezza di schermo, con un'area Impostazioni reale al suo interno — inclusa una nuova sezione Creator, con il controllo sulla notifica "nuovo follower" — e con Journeys e Journeyers finalmente due pagine vere invece di una scorciatoia verso la Home. Ogni punto del sito che mostra una persona, non solo un Journey, mostra ora la sua foto vera quando c'è, e la Home stessa ha smesso di aprirsi con una citazione finta ovunque esista già qualcosa di vero da mostrare al suo posto. Chi ha un episodio a metà lo ritrova subito, in una riga "Continue Watching" in cima alla Home, e ogni card del sito — Home, Profilo, Journeys — condivide finalmente le stesse proporzioni e le stesse icone arancioni, invece di variare da sezione a sezione.

I tuoi Journey di prova hanno cominciato a uscire dalla Discovery Phase nei primi giorni di settembre 2026 come previsto, alcuni sono già Published — ma la piattaforma aspetta ancora il suo primo creator esterno vero. Il sito resta pensato per funzionare esattamente allo stesso modo quando arriverà: nessuna funzionalità costruita "per quando ci saranno utenti" è rimasta a metà in attesa di quel momento, compresi i video più leggeri del Capitolo 18, pronti ma tenuti deliberatamente spenti fino ad allora.

Restano aperti: Analytics reali e Community Premium, i pagamenti (Stripe non ancora collegato, da cui dipendono anche Abbonamento nelle Impostazioni e i Payout nella sezione Creator), i testi legali veri (Termini, Privacy, Cookie, Linee guida community — le pagine esistono già, vuote), la Privacy nelle Impostazioni (profilo privato, utenti bloccati), e — ora che il sito è più compatto e le foto caricano senza scatti — un aspetto ancora più "premium" per le pagine rimaste indietro.

C'è anche un tratto di metodo che ha accompagnato tutte le ultime sessioni di lavoro e che vale la pena raccontare: l'abitudine di affrontare un solo compito per sessione, invece di incatenare più funzionalità insieme nello stesso momento — e, quando serve, di fermarsi a scrivere un piano intero prima ancora di aprire un editor, come nel Capitolo 18. È coerente con tutto il resto di questa storia — un progetto costruito un pezzo alla volta, verificato prima di passare al successivo, con una Vision scritta il primo giorno ("il percorso conta più del risultato") che si ritrova, con sorprendente coerenza, tanto nel prodotto quanto nel modo in cui è stato costruito.