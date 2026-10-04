---
title: Catalogo Funzionalità
doc_id: 20-feature-catalog
version: "1.0"
status: living
related_docs:
  - 08_Algorithm
  - 09_Updates
  - 10_Monetization
  - 19_Messaging
  - 93_Project_Alignment_Recap
  - 94_Product_Backlog
  - 99_Current_Project_Status
---

# Catalogo Funzionalità

Raccolta di tutto quello che Zero sa fare oggi, scritta per essere letta anche da chi non è tecnico (investitori, partner, chiunque debba capire cos'è Zero in pochi minuti). Questo documento si aggiorna da solo ogni volta che viene completata una nuova funzionalità, senza bisogno che qualcuno lo chieda esplicitamente.

Ogni funzione descritta qui sotto è **reale e funzionante**, testata su dati veri, non un mockup o un bottone finto. Dove qualcosa è pronto ma spento (perché costa, o perché aspettiamo utenti reali prima di accenderlo), viene segnalato chiaramente. La sezione finale elenca invece tutto quello che ancora manca, per onestà verso chi legge.

## In breve

Zero è una piattaforma dove i creator pubblicano "Journey": percorsi a episodi (non singoli video sparsi) organizzati in capitoli opzionali, con un player dedicato che ricorda il punto esatto in cui ogni spettatore ha interrotto la visione. Intorno ai Journey gira un livello social completo (follow, stories, messaggi, notifiche) e un livello community dove il creator può proporre workshop, eventi, prodotti digitali e consulenze, aiutato da un assistente AI che lo guida nella creazione.

Il cuore del prodotto è l'algoritmo di scoperta: è costruito fin dall'inizio perché il pagamento non comandi mai la visibilità, e perché la qualità reale (quanto le persone guardano e tornano) conti più dei numeri grezzi di follower.

## Cosa ci rende diversi

Queste sono le caratteristiche che non si trovano insieme da nessun'altra parte, o che abbiamo costruito deliberatamente in modo diverso dagli altri.

**Il ranking non si può comprare.** Nessuna funzione a pagamento di Zero, oggi o in futuro, tocca l'ordine con cui i contenuti vengono mostrati. Non è solo una promessa scritta: è verificato nel codice e dichiarato pubblicamente nella pagina "How it works" del sito.

**Un punteggio di fiducia per ogni creator (Trust Score), non solo un conteggio di follower.** Si attiva quando il creator carica un video di presentazione di sé stesso, e combina qualità reale dei contenuti, continuità, follower e segnalazioni confermate. Un creator con pochi follower ma contenuti seguiti fino alla fine può valere più di uno con tanti follower e poco coinvolgimento.

**L'algoritmo resta onesto finché la piattaforma è piccola.** Finché Zero non raggiunge 100 Journey pubblicati in totale, le classifiche "in evidenza" mostrano i contenuti in ordine cronologico invece che per punteggio, proprio per evitare che con pochi dati un ranking artificiale favorisca il primo arrivato. È una soglia scelta dopo aver studiato come YouTube e Patreon hanno gestito (e in parte sbagliato) lo stesso problema nei loro primi anni.

**Riordino narrativo con trascinamento (drag&drop).** Un creator può riorganizzare capitoli ed episodi del proprio Journey trascinandoli con il mouse (o da tastiera), per cambiare l'ordine in cui la storia viene raccontata senza dover ricaricare nulla.

**Nessuna compressione dei video caricati.** A differenza della maggior parte delle piattaforme video, Zero non comprime i video dei creator: restano alla qualità originale con cui sono stati caricati. È una scelta dichiarata pubblicamente, non un limite tecnico nascosto.

**Un assistente AI che aiuta il creator a creare la propria offerta, parlandoci.** Nella sezione Community, il creator può descrivere a parole (anche allegando foto o PDF) il workshop, l'evento o il prodotto che vuole proporre, e l'assistente prepara una bozza pronta da confermare. Non è un modulo da compilare a mano.

**Moderazione automatica dei contenuti scritti e delle immagini**, attiva su bio, titoli, descrizioni e contenuti Community, per mantenere la piattaforma pulita fin da subito senza intervento manuale continuo.

**Un solo tipo di "seguire" per tutti.** Non esiste una distinzione tra seguire una persona normale e "abbonarsi" a un creator: il follow è universale, chiunque può seguire chiunque, e questo sblocca automaticamente anche la messaggistica privata.

## Cosa può fare oggi chi guarda i contenuti

Uno spettatore può scoprire i Journey attraverso una Home personalizzata (contenuti nuovi, consigliati in base agli interessi, creator da seguire); la classifica dei Journey più completati si trova nella pagina Journeys, oppure cercarli per categoria o per testo con filtri simili a YouTube (categoria e data, non ordinati per popolarità: una scelta voluta per non premiare la viralità fine a sé stessa).

Ogni Journey si guarda in un player dedicato che tiene il segno esatto di dove si è arrivati, episodio per episodio, con possibilità di saltare indietro di 15 secondi, vedere "cosa guardare dopo" e riprendere da dove si era interrotta la visione anche giorni dopo.

Intorno ai contenuti c'è un livello social completo:

- **Follow**: si può seguire qualunque persona, non solo i creator.
- **Stories (Updates)**: contenuti che durano 24 ore in cinque formati (testo, foto, video, sondaggio, domanda), con una reazione rapida visibile solo a chi li ha pubblicati.
- **Messaggi privati**: una conversazione uno a uno si sblocca appena una delle due persone segue l'altra (non serve che sia reciproco).
- **Notifiche**: nuovo follower, nuovo episodio o Journey di chi si segue, nuove offerte Community, risposte alle domande poste.
- **Trusty**: la reazione "mi fido di questo contenuto", che si sblocca solo arrivando alla fine di un episodio, e che alimenta il punteggio di fiducia del creator.

## Cosa può fare oggi un creator

Un creator costruisce un Journey organizzandolo in capitoli (facoltativi) ed episodi, carica i video, scrive la presentazione, sceglie la categoria, e decide quando pubblicare. Ogni Journey appena pubblicato ottiene 15 giorni di visibilità garantita a tutti, indipendentemente dagli interessi di ciascuno, per dargli una possibilità reale di farsi notare.

Dalla propria Dashboard il creator gestisce tutti i suoi Journey (bozza, pubblicato, archiviato), gli Update, e ha accesso a statistiche reali: visualizzazioni totali, tasso medio di completamento, quante persone hanno finito l'intero percorso, quante interazioni ha ricevuto.

Nella sezione **Community** del proprio profilo, il creator può proporre:

- **Workshop ed eventi** (oggi solo gratuiti, con iscrizione reale),
- **Prodotti digitali** scaricabili (e-book, guide, corsi, template),
- **Consulenze individuali**.

Per creare una di queste offerte può scrivere una semplice descrizione a un assistente AI, che prepara automaticamente la bozza da confermare, capendo anche foto e documenti allegati. È inoltre pronta (ma non ancora accesa, perché a pagamento) la generazione di immagini di copertina direttamente dall'AI.

Ogni episodio ha un interruttore "Sponsored content": se il creator lo accende (perché un brand l'ha pagato o gli ha regalato qualcosa per mostrarlo), l'episodio riporta in bella vista l'etichetta, in linea con le Linee guida. L'etichetta serve solo a informare chi guarda e non cambia in alcun modo la posizione del Journey nelle classifiche.

Un pulsante dedicato permette al creator di avvisare manualmente i propri follower quando pubblica una nuova offerta Community, sempre per sua scelta esplicita, mai in automatico.

## Sicurezza e privacy

- **Blocco utente**: interrompe ogni rapporto reciproco (follow, messaggi, visibilità del profilo) tra due persone.
- **Account privato**: chi non segue vede solo nome, foto e bio, non i contenuti pubblicati.
- **Segnalazioni**: ogni Journey e ogni profilo può essere segnalato; le segnalazioni confermate riducono il punteggio di fiducia del creator segnalato.
- **Età minima 16 anni**, verificata in fase di registrazione e non aggirabile.
- **Cancellazione account** con 10 giorni di tempo per ripensarci prima che tutto venga eliminato in modo definitivo.
- **Regole di contenuto dettagliate**, con tolleranza zero esplicita su minori, incitamento alla violenza e autolesionismo/suicidio.
- **Nessun banner cookie invasivo**: Zero non traccia per pubblicità, quindi non serve chiederne il consenso.

## Cosa manca ancora

Per onestà verso chi legge questo documento, ecco cosa oggi non è ancora reale, raggruppato per non confonderlo con le funzioni già attive:

- **Nessun pagamento vero è ancora collegato.** Abbonamenti Community, vendita di eventi/prodotti/consulenze, pubblicità, donazioni: tutto ha già percentuali e meccanismo decisi, ma nessuna riga di codice si collega oggi a un pagamento reale. È una scelta di sequenza (prima il prodotto, poi i pagamenti), non una dimenticanza, e il collegamento a Stripe è predisposto per essere attivabile in pochi passaggi quando sarà il momento.
- **La generazione di immagini AI** è pronta ma spenta, perché ha un costo reale per immagine e serve attivare la fatturazione sul nostro account Google.
- **La versione video a qualità adattiva per connessioni lente** (per far partire i video più in fretta su internet lento) è pronta ma spenta per lo stesso motivo: costa, e aspettiamo utenti reali prima di accenderla.
- **La messaggistica resta volutamente semplice**: solo testo, solo conversazioni uno a uno, senza gruppi né allegati, per scelta della prima versione.
- **Non esiste ancora moderazione automatica dei video** (solo testo e immagini sono filtrati oggi).
- **Zero non è ancora un'azienda registrata**: è dichiarato apertamente anche nei Termini di Servizio del sito.
- **Non è stato fatto nessun audit di sicurezza formale** e la piattaforma non è ancora online in produzione per il pubblico.
