---
title: Monetization
doc_id: 10-monetization
version: "5.0"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 02_Mission
  - 04_Product_Principles
  - 07_Creator_Experience
  - 93_Project_Alignment_Recap
---

# Monetization

## Obiettivo

Definire il modello di monetizzazione di Zero.

La monetizzazione deve creare valore per creator, utenti e piattaforma, senza compromettere la qualità dell'esperienza.

## Dichiarazione

Su Zero la monetizzazione è una conseguenza della fiducia costruita nel tempo.

Il modello economico deve incentivare la creazione di Journey autentici e di valore, evitando meccanismi che spingano creator e utenti verso comportamenti orientati esclusivamente al profitto.

## Principi

### Creator First

I creator devono poter monetizzare direttamente il valore che generano.

La piattaforma fornisce strumenti e infrastruttura, lasciando al creator il controllo della propria attività.

---

### Fiducia prima del profitto

Ogni opportunità di monetizzazione deve rafforzare il rapporto tra creator e community.

La monetizzazione non deve compromettere autenticità, trasparenza o qualità dei contenuti.

---

### Modello sostenibile

Zero cresce insieme ai creator.

Il successo economico della piattaforma dipende dal successo della propria community.

---

### Libertà di scelta

Ogni creator decide quali strumenti utilizzare.

Nessuna funzionalità di monetizzazione è obbligatoria.

## Come leggere questo documento

Il documento è diviso in tre parti, da non confondere:

- **A. Decisioni di business**: ciò che Zero ha deciso, diviso tra ciò che parte al lancio e ciò che viene dopo l'MVP.
- **B. Implementazione tecnica da definire**: tutto ciò che dipende dal sistema di pagamento, che non è ancora scelto. Nessun punto di questa parte è una regola di Zero.
- **C. Ricerca di mercato (non vincolante)**: confronti con altre piattaforme. Non sono regole di Zero.

## A. Decisioni di business

### Launch

Al lancio sono attive solo due forme di monetizzazione: la pubblicità contestuale e le Tips.

| Fonte | Quota creator | Quota Zero | Natura |
|---|---|---|---|
| Pubblicità contestuale | 60% | 40% | Fonte di ricavo di Zero |
| Tips ai creator | 100%, al netto delle commissioni del provider di pagamento | 0% | Monetizzazione del creator, non ricavo di Zero |

#### Pubblicità contestuale

La pubblicità è la prima fonte di ricavo della piattaforma, attiva fin dal lancio.

Qui Zero non trattiene una quota da un pagamento del creator: è Zero a incassare dagli inserzionisti in base alle visualizzazioni generate dai contenuti, e a girare al creator la quota indicata nella tabella sopra (60% creator, 40% Zero).

Gli annunci devono essere pertinenti al contesto di navigazione, alla categoria del Journey e agli interessi dell'utente, con l'obiettivo di risultare utili e non invasivi.

La pubblicità deve rispettare i principi fondamentali di Zero. In particolare:

- non influenza il ranking dei Journey;
- non può essere acquistata per ottenere maggiore visibilità organica;
- privilegia la pertinenza rispetto al volume delle impression;
- si basa principalmente sulla categoria del Journey, sul contesto della pagina e sugli interessi dell'utente;
- deve integrarsi nell'esperienza della piattaforma senza interrompere inutilmente la navigazione.

L'obiettivo è creare un sistema pubblicitario sostenibile per la piattaforma e utile per gli utenti, mantenendo sempre al centro la qualità dell'esperienza.

#### Tips ai creator

- Le Tips sono disponibili al lancio, tramite un link esterno che il creator inserisce nel proprio profilo (decisione del 5 ottobre 2026).
- Le Tips appartengono al creator: sono uno strumento di monetizzazione del creator, non una fonte di ricavo di Zero.
- Zero trattiene lo 0%. Zero non raccoglie denaro, non processa pagamenti e non gestisce rimborsi, versamenti o verifiche dell'identità per le Tips.
- Il pagamento avviene fuori da Zero, sulla pagina esterna scelta dal creator. Le commissioni di quella piattaforma sono fuori dal sistema Zero.
- Il creator è responsabile del proprio account esterno e del rapporto con la piattaforma che usa.
- Zero non integra nessun fornitore di pagamento per le Tips. Il campo del link è generico e non dipende da un fornitore.

### Regola generale sui pagamenti ai creator

I pagamenti ai creator hanno cadenza mensile, con una soglia minima di pagamento di circa 100 nella valuta locale (decisione del Punto 3, vedi `93_Project_Alignment_Recap.md`). È una decisione di modello. Il meccanismo tecnico con cui verrà realizzata non è ancora deciso (vedi parte B).

Le commissioni del provider di pagamento sono a carico di chi riceve il denaro, e Zero non aggiunge supplementi a carico di chi paga (decisione del 2026-10-04, vedi `93_Project_Alignment_Recap.md`).

I dettagli fiscali specifici per paese (soglie di reporting, IVA su prodotti digitali, differenze tra Unione Europea, Svizzera e resto del mondo) sono trattati nell'audit legale (`91_Legal_Audit_And_Roadmap.md`), non in questo documento.

### Post-MVP

Le forme di monetizzazione seguenti restano valide come modello futuro, ma non partono al lancio e non devono essere implementate nell'MVP. Tutte le decisioni sono conservate.

Nell'ordine di attivazione originale, la pubblicità e le Tips venivano per prime, e il gruppo qui sotto per ultimo. Le fonti si attivano in ordine di priorità, non tutte insieme.

| Fonte | Quota creator | Quota Zero |
|---|---|---|
| Community Premium, workshop, eventi, consulenze 1:1, prodotti digitali | 90% | 10% |
| Marketplace sponsorizzazioni creator-brand (intermediato da Zero) | Compenso pattuito, al netto delle commissioni del provider di pagamento | 10% trattenuto dal brand, non dal creator |
| Sponsorizzazioni dirette creator-brand (accordo fuori piattaforma) | 100% del compenso pattuito | Zero non trattiene nulla |

Queste percentuali sono un punto di partenza e possono evolvere nel tempo senza modificare i principi di questo documento.

#### Community Premium (decisione S4, 5 ottobre 2026)

- Abbonamento mensile per creator, un solo livello.
- Prezzo scelto dal creator, da 5 euro in su, senza tetto.
- Chi si abbona riceve la sfida "Fai il percorso con lui" e la Members Room (stanza degli abbonati, domande in forma scritta, nessuna diretta).
- Se il creator non pubblica nulla nel mese, il mese è gratis per chi paga.
- Chi si abbona può regalare un mese (Gift Month), senza obblighi per chi lo riceve.
- Chi completa la sfida può aprire un Journey collegato a quello del creator (Staffetta).
- Workshop, consulenze 1:1 e prodotti digitali restano acquisti separati.
- Esclusi: video singoli a pagamento, emoji, badge, pagella delle promesse, co-autore nei crediti, Journey personale, backstage a orario, archivio a sblocco, domande in diretta.

#### Workshop, eventi, consulenze 1:1, prodotti digitali

Stesso gruppo economico della Community Premium, stesso meccanismo (il creator incassa un pagamento diretto da un utente). Per "prodotti digitali" si intendono file e accessi vendibili senza spedizione fisica (e-book, corsi, template, guide scaricabili).

#### Sponsorizzazioni dei creator

Un creator può accettare di promuovere il prodotto di un'azienda in cambio di un pagamento diretto, indipendente dalla pubblicità automatica gestita da Zero.

- Se l'accordo avviene fuori dalla piattaforma (creator e brand si mettono d'accordo da soli), Zero non tocca il pagamento e non trattiene nulla. L'unico obbligo è che il contenuto sia dichiarato in modo visibile come sponsorizzato.
- Se l'accordo avviene tramite un marketplace interno che mette in contatto creator e brand (idea futura, non ancora costruita, vedi `94_Product_Backlog.md`), Zero trattiene una commissione solo dal brand, non dal creator.

In entrambi i casi, la sponsorizzazione non deve influenzare il ranking del Journey.

## B. Implementazione tecnica da definire

Nessun punto di questa parte è una decisione. Ogni voce va definita o verificata quando verrà scelto il sistema di pagamento. L'ordine da seguire è: prima il modello di pagamento, poi la verifica di ciò che permette il provider, poi le regole operative.

- **Provider di pagamento:** non ancora scelto. DA DEFINIRE.
- **Integrazione tecnica:** non ancora costruita. DA DEFINIRE.
- **Meccanismo di cadenza mensile e soglia minima:** DA DEFINIRE.
- **Verifica dell'identità dei creator (KYC):** DA VERIFICARE alla scelta del provider.
- **Costi dei versamenti ai creator e a carico di chi:** DA DEFINIRE.
- **Rimborsi:** DA DEFINIRE.
- **Contestazioni (chargeback):** DA DEFINIRE.
- **Saldi negativi:** DA DEFINIRE.
- **Riserve o trattenute dei fondi:** DA DEFINIRE.
- **Chiusura account e saldo residuo:** DA DEFINIRE.
- **Responsabilità del provider e di Zero:** DA VERIFICARE.
- **Cambio valuta:** chi sostiene la commissione quando si paga in una valuta diversa da quella del creator. DA DEFINIRE.
- **Paesi supportati e sede legale di Zero:** DA VERIFICARE.
- **Base di calcolo delle quote di Zero** (sul prezzo pagato oppure sull'importo netto), per le fonti Post-MVP con quota Zero: DA DEFINIRE.
- **Rete pubblicitaria:** scelta della rete, sue trattenute e se il 40% di Zero si calcola prima o dopo di esse. DA DEFINIRE.
- **Pagamenti dentro le app per iPhone e Android:** DA VERIFICARE prima di costruire l'app.
- **Divieto di acquistare i propri contenuti (Tips comprese):** DA VERIFICARE nel codice.
- **IVA e ritenute fiscali:** DA VERIFICARE nell'audit legale (`91_Legal_Audit_And_Roadmap.md`).

## C. Ricerca di mercato (non vincolante)

Questa sezione raccoglie confronti con altre piattaforme. Non sono regole di Zero e non sono decisioni. Le fonti sono in gran parte guide di terze parti, raccolte il 2026-10-05, e vanno riverificate sulle pagine ufficiali prima di usarle. La ricerca dei Punti precedenti è in `93_Project_Alignment_Recap.md`.

- **YouTube, pubblicità (AdSense):** pagamento mensile, tra il 21 e il 26 del mese. I guadagni del mese precedente si chiudono il 3 del mese. Se la soglia non è raggiunta, il saldo passa al mese successivo. Alla chiusura dell'account c'è una trattenuta di 30 giorni prima del pagamento finale.
- **YouTube, Super Thanks:** secondo guide di terze parti, il creator riceve il 70% al netto di tasse e commissioni dei negozi di app. Le fonti non concordano su chi paghi la commissione della carta.
- **Ko-fi:** donazioni allo 0% nel piano gratuito, 5% su negozio e abbonamenti, 0% con il piano a pagamento. Le commissioni del processore di pagamento sono a carico del creator.
- **Patreon:** commissione della piattaforma del 10% per le pagine create dopo agosto 2025, e il creator tiene in media circa l'85-88% considerando i costi di pagamento. Rimborso richiesto dal membro entro 60 giorni. Fondi in attesa fino a 7 giorni per i contenuti digitali, fino a 75 giorni per gli acquisti da iPhone. Conversione di valuta indicata al 2,5% da guide di terze parti.
- **Substack:** rimborso se richiesto entro 7 giorni dal pagamento.
- **Gumroad:** saldo trattenuto almeno 7 giorni, blocco a rotazione di 30 giorni indicato da guide di terze parti. Pagamenti sospesi se le contestazioni superano il 3%.
- **TikTok (regali nelle dirette):** circa il 50% alla piattaforma, secondo stime di settore (non dichiarato da TikTok).
- **Instagram (abbonamenti, regali):** nessuna quota di Meta secondo fonti di terze parti. I negozi di app trattengono circa il 15-30% sugli acquisti dentro l'app.
- **Finestra delle contestazioni bancarie:** in genere 120 giorni per le carte.
- **Costi tipici dei processori di pagamento:** circa 2,9% più 0,30 dollari per transazione (citato per Ko-fi e Patreon), e circa 15 dollari per ogni contestazione. Alcuni processori applicano anche costi per account attivo e per versamento. Da verificare sul listino del provider scelto.
- **Negozi di app (Apple):** dal maggio 2025, sul negozio degli Stati Uniti le app possono rimandare al pagamento sul sito web senza la commissione Apple. Fuori dagli Stati Uniti, per i beni digitali serve l'acquisto dentro l'app oppure un permesso regionale. Europa e Google Play non verificati.
- **Piattaforme in paesi non supportati dal processore di pagamento:** Gumroad ha esteso i bonifici diretti a più di 100 paesi, Patreon offre alternative come PayPal o Payoneer, YouTube non offre la monetizzazione nei paesi non ammessi.

## Regole

La monetizzazione non deve influenzare il ranking dei Journey.

Nessun creator può ottenere maggiore visibilità semplicemente attraverso pagamenti o investimenti economici.

La qualità del Journey rimane il principale criterio di distribuzione.

## Implicazioni sul prodotto

Gli strumenti di monetizzazione devono essere perfettamente integrati nell'esperienza della piattaforma.

Ogni funzionalità economica deve risultare semplice, trasparente e coerente con Vision, Mission e Product Principles.
