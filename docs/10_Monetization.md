---
title: Monetization
doc_id: 10-monetization
version: "4.1"
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

## Fonti di monetizzazione e ordine di attivazione

Zero attiva le fonti di monetizzazione in ordine di priorità, non tutte insieme. L'ordine riflette sia l'importanza economica per Zero e per i creator sia la semplicità di costruzione:

1. **Pubblicità contestuale** — prima fonte, sia per Zero sia per i creator, attiva fin dal lancio.
2. **Tips e donazioni**.
3. **Community Premium, eventi/workshop, consulenze 1:1, prodotti digitali** — stesso gruppo, stesso meccanismo economico (il creator incassa un pagamento diretto da un utente), costruiti insieme.

Le sponsorizzazioni dei creator (vedi sezione dedicata più sotto) non seguono questo ordine di costruzione: non richiedono sviluppo prioritario, solo una regola di trasparenza.

Nuove fonti di ricavo potranno essere introdotte mantenendo gli stessi principi descritti in questo documento.

## Commissioni

Le percentuali variano in base al meccanismo economico della fonte: non è un'unica percentuale fissa per tutto.

| Fonte | Quota creator | Quota Zero | Cadenza di pagamento |
|---|---|---|---|
| Pubblicità contestuale | 60% | 40% | Mensile, soglia minima di pagamento ~100 (valuta locale) |
| Tips e donazioni | 100% | 0% | Mensile, soglia minima ~100 |
| Community Premium, eventi/workshop, consulenze 1:1, prodotti digitali | 90% | 10% | Mensile, soglia minima ~100 |
| Marketplace sponsorizzazioni creator-brand (intermediato da Zero) | Compenso pattuito, meno le commissioni Stripe | 10% trattenuto dal brand, non dal creator | Alla chiusura dell'accordo |
| Sponsorizzazioni dirette creator-brand (accordo fuori piattaforma) | 100% del compenso pattuito | Zero non trattiene nulla | Non gestito da Zero |

**Commissioni Stripe.** Le commissioni che Stripe applica sui pagamenti sono a carico di chi riceve il denaro. Per i tips e per le altre fonti in cui il creator riceve un pagamento, la quota del creator è quindi al netto di queste commissioni. Zero non paga nulla su quelle transazioni e non aggiunge nessun importo a carico dell'utente: chi paga versa la cifra indicata, senza supplementi.

Queste percentuali sono un punto di partenza e possono evolvere nel tempo senza modificare i principi descritti in questo documento. I dettagli fiscali specifici per paese (soglie di reporting, IVA su prodotti digitali, differenze tra Unione Europea, Svizzera e resto del mondo) sono trattati nell'audit legale (`91_Legal_Audit_And_Roadmap.md`), non in questo documento.

## Pubblicità contestuale

La pubblicità rappresenta la prima fonte di ricavo della piattaforma, attiva fin dal lancio.

A differenza delle altre fonti, qui Zero non trattiene una quota da un pagamento del creator: è Zero a incassare dagli inserzionisti in base alle visualizzazioni generate dai contenuti, e a girare al creator la quota indicata nella tabella sopra.

Gli annunci devono essere pertinenti al contesto di navigazione, alla categoria del Journey e agli interessi dell'utente, con l'obiettivo di risultare utili e non invasivi.

## Principi della pubblicità

La pubblicità deve rispettare i principi fondamentali di Zero.

In particolare:

- non influenza il ranking dei Journey;
- non può essere acquistata per ottenere maggiore visibilità organica;
- privilegia la pertinenza rispetto al volume delle impression;
- si basa principalmente sulla categoria del Journey, sul contesto della pagina e sugli interessi dell'utente;
- deve integrarsi nell'esperienza della piattaforma senza interrompere inutilmente la navigazione.

L'obiettivo è creare un sistema pubblicitario sostenibile per la piattaforma e utile per gli utenti, mantenendo sempre al centro la qualità dell'esperienza.

## Sponsorizzazioni dei creator

Un creator può accettare di promuovere il prodotto di un'azienda in cambio di un pagamento diretto, indipendente dalla pubblicità automatica gestita da Zero.

- Se l'accordo avviene fuori dalla piattaforma (creator e brand si mettono d'accordo da soli), Zero non tocca il pagamento e non trattiene nulla. L'unico obbligo è che il contenuto sia dichiarato in modo visibile come sponsorizzato.
- Se l'accordo avviene tramite un marketplace interno che mette in contatto creator e brand (idea futura, non ancora costruita — vedi `94_Product_Backlog.md`), Zero trattiene una commissione solo dal brand, non dal creator.

In entrambi i casi, la sponsorizzazione non deve influenzare il ranking del Journey, coerente con la regola generale di questo documento.

## Regole

La monetizzazione non deve influenzare il ranking dei Journey.

Nessun creator può ottenere maggiore visibilità semplicemente attraverso pagamenti o investimenti economici.

La qualità del Journey rimane il principale criterio di distribuzione.

## Implicazioni sul prodotto

Gli strumenti di monetizzazione devono essere perfettamente integrati nell'esperienza della piattaforma.

Ogni funzionalità economica deve risultare semplice, trasparente e coerente con Vision, Mission e Product Principles.