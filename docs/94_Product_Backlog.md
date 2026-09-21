---
title: Product Backlog
doc_id: 94-product-backlog
version: "1.9"
status: living
related_docs:
  - 08_Algorithm
  - 10_Monetization
  - 93_Project_Alignment_Recap
  - 95_Video_Scaling_Future_Option
  - 98_Product_Review
---

# Product Backlog

Elenco unico di feature/modifiche prodotto raccolte in sessioni dedicate a "cosa costruire" — separato dall'iniziativa di allineamento generale in `93_Project_Alignment_Recap.md`, che è un audit descrittivo, non un elenco di lavori. ☐ da fare, ☑ fatto. Si lavora un punto alla volta, in ordine libero salvo dipendenze segnalate.

## Ricerca & Discovery

☑ Filtri di ricerca stile YouTube sulla pagina `/search`: categoria e data, non solo ricerca testuale — funzionano anche senza testo scritto (si può navigare per soli filtri). Ricerca YouTube reale (aggiornamento 2026) usata come riferimento: tenuti categoria/data, **scartato deliberatamente "ordina per popolarità"** perché in conflitto diretto con "Quality Over Virality"/"Trust First" già scritti nell'algoritmo. **Scoperta in corso d'opera:** "categoria" e "interesse" in Zero sono già la stessa identica lista fissa (`JOURNEY_CATEGORIES`) — un Journey ha una categoria, un utente ha una o più "interessi" scelti dalla stessa lista in Onboarding. Quindi non servono due filtri separati: un solo filtro categoria copre entrambi i concetti. Implementato in `lib/search/searchJourneys.ts` + `components/search/SearchFilters.tsx`. **Fix (2026-09-21), causa reale:** `SearchFilters` (componente client) importava una costante da `lib/search/searchJourneys.ts`, che carica anche il client Prisma — non eseguibile nel browser. Next.js restituiva un errore 500 reale su `/search` (non un problema di visualizzazione). Prima ipotesi (Suspense/`useSearchParams`) era sbagliata, corretta contestualmente ma non la causa. Risolto spostando le costanti di data (`JOURNEY_DATE_PRESETS`) in `lib/constants/journeyDatePresets.ts`, un file senza alcuna dipendenza server-only. Verificato con una richiesta reale contro il server di sviluppo di Manuel: 500 prima del fix, 200 con i due filtri presenti nell'HTML dopo.

☑ Ordine cronologico al posto del ranking algoritmico finché il catalogo è piccolo. Soglia scelta: **100 Journey pubblicati** (non 20, scartato: con un Journey che richiede tempo reale da costruire — a differenza di un post — e con "Top Journeys" che mostra 8-10 posizioni, sotto 100 il "Top" finirebbe per mostrare quasi l'intero catalogo). Ricerca fatta su YouTube (2005-2012: solo view-count, gaming/clickbait, sistemato solo nel 2012 a scala enorme) e Patreon (13 anni senza vera discovery interna, solo dal 2026 ci lavora) — nessuna delle due ha risolto questo bene e in fretta, quindi una soglia alta è la scelta prudente. Implementato in `lib/discovery/algorithmUnlock.ts` (nuovo helper `isAlgorithmicRankingUnlocked()`), usato da `lib/discovery/topJourneys.ts` e `lib/discovery/recommendedJourneys.ts`: sotto soglia, entrambi ordinano per data di pubblicazione invece che per Journey Score. **Coordinamento cross-chat:** stesso punto toccato in parallelo dalla chat di allineamento (Punto 4, Algoritmo) — avvisata di non rianalizzarlo, riprendere questo risultato.

## Trust & Engagement

☑ Rename del bottone Like → **"Trusty"** (non "Trustable", nome cambiato in corsa) — stesso modello dati (`Like`/`toggleLike`, nessuna migrazione), rinominato solo lato interfaccia in `components/journey/TrustyButton.tsx`. Si sblocca solo a fine visione dell'episodio (stessa soglia usata per segnare il completamento). Non misura più la qualità dell'episodio: non pesa più nel Journey Score (rimosso da `lib/scoring/journeyScore.ts`, il 5% liberato è andato al completamento, ora 50%).

☑ Revisione Trust Score, implementata in `lib/profile/trustScore.ts`: eliminata la base automatica di 30 punti. Il punteggio si attiva solo se `Creator.presentationVideoUrl` è valorizzato (video/card di presentazione) — altrimenti nessun badge mostrato, non uno zero. Formula attivata: presentazione 10% (fissa) + Trusty 2% (media per episodio, cappata) + follower 20% (cappati, invariato) + qualità 58% (media Journey Score, era 40%) + Journey live 10% (invariato) − 10 per report confermato (invariato). Dettagli e motivazione in `docs/08_Algorithm.md`, sezione "Trust Level".

☐ [Aperto — non fa parte di questo lavoro] Manca ancora **l'interfaccia per caricare il video/card di presentazione**: lo schema (`Creator.presentationVideoUrl`) esiste ma nessuna UI lo valorizza. **Collocazione decisa (2026-09-21):** Home personale, nello spazio tra la bio e "Journey in progress". Resta da pianificare la costruzione vera e propria (formato video o card statica, upload flow) prima di costruire. Finché non è pronta, il Trust Score resta disattivato per tutti i creator esistenti, incluso Manuel stesso.

**Dipendenza cross-chat**: quando l'iniziativa di allineamento arriverà al Punto 4 (Algoritmo) o al Punto 5 (Trust & Safety), va aggiornata con questo nuovo modello, non con quello vecchio a base 30 (già segnalato lì come punto di forza esistente).

## UI da rivedere

☐ Player episodio: titolo sotto al video da ricentrare e rivedere nelle dimensioni; posizionamento del tasto Trusty da rivedere.

☐ Pagina "Come funziona"/Algorithm: le sezioni vanno riordinate — oggi la spiegazione dell'algoritmo è in fondo alla pagina, Manuel la vuole come prima cosa che si legge.

## Player

☐ Aggiungere un tasto "salta indietro 15 secondi" nel player video degli episodi.

## Moderazione

☐ [Bassa priorità] Segnalazioni + revisione manuale (Report) — retrocesso in fondo alla lista, nessuna azione richiesta ora.

## Registrazione & Sicurezza account

☐ [Da Punto 1 allineamento] Bloccare l'iscrizione a chi ha meno di 16 anni — oggi nessun controllo età in registrazione. Da definire come verificare l'età in modo credibile (semplice dichiarazione vs verifica più robusta).

☐ [Da Punto 1 allineamento] Raccogliere solo il minimo indispensabile di dati personali in registrazione, per ridurre il rischio legale (GDPR e simili) — da rivedere quali campi sono oggi realmente necessari.

## Navigazione

☐ [Vago, da chiarire] Tasto "indietro" del sito: i bug concreti trovati finora sono stati risolti, ma la sensazione d'uso resta "macchinosa" per Manuel. Da chiarire con lui cosa esattamente non convince prima di poterlo considerare davvero chiuso.

## Business futuro (idee, nessun piano richiesto ora)

☐ [Idea] Sezione dove le aziende possono proporsi per sponsorizzare Zero/i creator, stile Instagram.

☐ [Idea] Marketplace interno per contenuti UGC: le aziende cercano creator per contenuti, Zero trattiene una commissione sulla transazione. Collegato al punto sopra.

☐ [Da definire dove] Dare risalto pubblico al principio "nessun pagamento influenza il ranking dei Journey" (vedi `10_Monetization.md`) — dove mostrarlo è ancora da decidere (pagina Journey? footer? sezione "Come funziona"?).

## Monetizzazione

Nessuna di queste fonti è ancora costruita: le pagine reali (`/settings/creator`, `/pricing`, `/settings/subscription`) esistono ma mostrano solo "Coming soon". Percentuali e ordine di attivazione decisi al Punto 3 dell'allineamento (`93_Project_Alignment_Recap.md`), dettagli in `10_Monetization.md` v4.0.

☐ **Pubblicità contestuale** (prima fonte da costruire) — collegare una rete pubblicitaria contestuale (es. Media.net, Ezoic/Humix, Primis — alternative a Google AdSense adatte a piattaforme piccole/video), split 60% creator / 40% Zero, pagamento mensile con soglia minima ~100 nella valuta locale.

☐ **Tips e donazioni** (seconda fonte) — meccanismo di pagamento diretto utente→creator, commissione Zero 10%.

☐ **Community Premium** — abbonamento mensile di un utente verso un singolo creator per contenuti/spazi riservati (modello Patreon/Skool). Da progettare da zero, Manuel non ha esperienza diretta da cui partire — servirà un giro di riferimenti concreti prima di disegnarla.

☐ **Eventi/workshop** — stesso gruppo economico di Community Premium (90% creator / 10% Zero), da definire come si organizzano tecnicamente (prenotazione, streaming live?, semplice pagina con link esterno?).

☐ **Consulenze 1:1** (era "servizi professionali", chiarito e confermato al Punto 3) — un creator vende una videochiamata/mentoring a pagamento tramite Zero. Stesso gruppo economico di Community Premium.

☐ **Prodotti digitali** (parola presente nei documenti ma mai definita, chiarita al Punto 3) — file scaricabili venduti dal creator (e-book, guide, corsi, template). Stesso gruppo economico di Community Premium.

☐ **Tag "contenuto sponsorizzato" obbligatoria** — quando un creator promuove un prodotto per accordo diretto con un brand (fuori piattaforma), Zero non trattiene nulla ma richiede una dichiarazione visibile. Priorità più alta delle altre voci di questa sezione: costa poco costruire (solo una tag/etichetta) e riduce rischio legale.

☐ [Idea, non prioritaria] **Marketplace sponsorizzazioni creator-brand** — Zero mette in contatto creator e aziende, trattiene una commissione del 10% solo dal brand (modello TikTok Creator Marketplace). Stesso concetto delle due idee già in questa lista (sezione sponsor, marketplace UGC) — quando si costruirà, unificare i tre in un solo lavoro.

☐ **Meccanismo tecnico dei pagamenti (Stripe Connect)** — scegliere tra account Standard/Express/Custom quando si arriva a costruire davvero (Punto 7 dell'allineamento). Non blocca le decisioni di percentuali/ordine già prese.

## Infrastruttura & costi

☐ [In pausa, decisione presa 2026-09-21] Rivedere compressione/distribuzione video e storage. Nota emersa aprendo il punto: la promessa pubblica su "Know the Algorithm. Know Zero." ("mai compresso") è già tecnicamente imprecisa oggi — esiste già una versione "light" adattiva via Cloudflare Stream (`Episode.lightVideoStatus`, vedi `EpisodePlayer.tsx`), l'originale resta solo come fallback. Se si introduce/rivede la compressione, va comunque riscritto quel testo pubblico. Manuel aveva portato un documento con un'architettura alternativa fai-da-te (R2 + Cloudflare Cache + FFmpeg su server dedicato, niente Cloudflare Stream) pensata per uno scenario futuro a ~1.000 utenti registrati — **non un piano attivo**: oggi Zero non ha ancora traffico video reale, quindi il problema di costo che risolve non esiste ancora, e aspettare non comporta nessun lavoro perso (l'originale resta comunque su R2 in entrambi gli scenari). Documento completo salvato in `95_Video_Scaling_Future_Option.md`. Segnale per riprendere: crescita continua della spesa Cloudflare Stream legata ai minuti di video consegnati, da controllare periodicamente man mano che arrivano utenti reali.

☑ Compressione automatica delle foto caricate, interamente nel browser prima dell'upload (nessun costo, nessuna nuova dipendenza): sopra 2MB la foto viene ridimensionata (lato più lungo max 2000px) e ricompressa come JPEG (qualità 0.82). Limite massimo assoluto alzato da 8MB a 20MB, ora che la compressione gestisce i file pesanti da sola. Nuovo `lib/compressImage.ts` usato dai flussi senza ritaglio (poster episodio in `EpisodeForm.tsx`, poster/foto Update in `QuickUploadButton.tsx`); `lib/cropImage.ts` (avatar, copertina profilo, copertina Journey) esteso con lo stesso limite di dimensione. Non riguarda i video, gestiti a parte (vedi `95_Video_Scaling_Future_Option.md`).

☐ Verificare se esiste un limite di tempo per utenti/sessioni inattive (sessione di login vs account dormienti — da chiarire con Manuel quale dei due). Controllato 2026-09-15: `lib/auth.ts` non ha configurazione esplicita, usa i default di Better Auth.
