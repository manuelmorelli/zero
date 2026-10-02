---
title: Product Backlog
doc_id: 94-product-backlog
version: "2.0"
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

☑ Interfaccia per caricare il video di presentazione, costruita nel Punto 5 dell'allineamento (Trust & Safety, 2026-09-21): nuova card "Who I am" nella Home personale, stesso stile visivo della card Bio, terza colonna nella stessa riga di bio + Journey in progress. Upload diretto a R2 (`lib/actions/creatorPresentation.ts`, stesso meccanismo del video degli episodi), visibile a chi visita solo se il video esiste già, sempre visibile al proprietario per poterlo caricare. Attiva per la prima volta il Trust Score appena caricato.

**Dipendenza cross-chat**: quando l'iniziativa di allineamento arriverà al Punto 4 (Algoritmo), va aggiornata con questo nuovo modello, non con quello vecchio a base 30 (già segnalato lì come punto di forza esistente).

## UI da rivedere

☑ Player episodio: blocco titolo sotto al video ora allineato al bordo sinistro della card video (prima era allineato al bordo della pagina, più a sinistra della card perché il video, essendo più stretto del contenitore, viene centrato). Trusty e Share spostati dalla riga in basso a una riga in alto, alla stessa altezza di "Episode N", allineati a destra e ingranditi (~25%); il blocco testo a sinistra reso più compatto (meno spazio tra le righe). Implementato in `components/journey/EpisodePlayer.tsx`.

☑ Pagina "Come funziona"/Algorithm: sezioni riordinate, l'Algoritmo è ora la prima cosa che si legge dopo il titolo (prima era in fondo alla pagina). Fatto nel Punto 4 dell'allineamento (Algoritmo e Discovery, 2026-09-21), verificato di nuovo nel Punto 5 (`app/(site)/how-it-works/page.tsx`, sezione con `id="algorithm"` subito dopo l'intestazione). Questa riga non era stata aggiornata quando il lavoro è stato fatto altrove, causa di un rischio di duplicazione.

## Player

☑ Tasto "salta indietro 15 secondi" nel player video degli episodi, subito a destra del Play/Pause (icona `RotateCcw`), implementato in `components/journey/EpisodePlayer.tsx`.

## Moderazione

☑ Segnalazioni contenuti, costruite nel Punto 5 dell'allineamento (Trust & Safety, 2026-09-21): pulsante "Report" su pagina Journey e su profilo (non sulle Update, escluse volutamente da Manuel perché sono contenuto effimero, sparisce da solo entro 24h). Scrive nel modello `Report` già esistente nello schema; mail di avviso a `ADMIN_NOTIFICATION_EMAIL` (via Resend, oggi disattivato: l'avviso resta visibile solo nei log del server finché Resend non viene riattivato). Nessun pannello di gestione: le segnalazioni si vedono/chiudono da Prisma Studio.

☑ Primo filtro automatico su testo e immagini appena caricati, costruito nello stesso punto (`lib/moderation.ts`). Copre bio, titoli/descrizioni di Journey/Episodi, testo delle Update, contenuti Community e le immagini caricate (copertine, foto profilo, foto delle Update), mai i video (decisione esplicita di Manuel). **Attivo**: nato su OpenAI (rimasto spento perché la chiave richiedeva carta di credito e acquisto minimo), spostato su **Gemini** al Punto 8 (2026-09-25), che usa la `GEMINI_API_KEY` gratuita già configurata. OpenAI non serve più.

☑ Privacy Policy aggiornata (2026-09-29): Google (Gemini) aggiunto tra i fornitori, con cosa riceve (testi/immagini da moderare, conversazioni e allegati della chat AI Community) e la dichiarazione che nel piano gratuito Google può usare quei dati per migliorare i suoi prodotti; impegno a passare al piano a pagamento prima del lancio. Aggiunti anche contenuti Community, iscrizioni "I'm going" e conversazioni con l'AI tra i dati raccolti.

☐ **Passare Gemini al piano a pagamento prima del lancio pubblico**: promessa scritta nella Privacy Policy (nel piano gratuito Google può usare i dati inviati per migliorare i suoi prodotti). Da fare insieme all'attivazione delle immagini AI, che richiede comunque la fatturazione sullo stesso account.

## Registrazione & Sicurezza account

☑ [Da Punto 1 allineamento] Bloccare l'iscrizione a chi ha meno di 16 anni — implementato al Punto 6 dell'allineamento (Legale, 2026-09-22): campo `dateOfBirth`, controllo a dichiarazione (non verifica documentale) sia lato client sia lato server (`lib/auth.ts`, `databaseHooks.user.create.before`), non aggirabile. Non retroattivo: account creati prima restano con data di nascita vuota.

☑ [Da Punto 1 allineamento] Raccogliere solo il minimo indispensabile di dati personali in registrazione, per ridurre il rischio legale (GDPR e simili). Verificato il 2026-09-28: `app/register/page.tsx` chiede solo nome, email, password e data di nascita (quest'ultima necessaria per il controllo età minima 16 anni). Bio, città, foto profilo, interessi non si chiedono in registrazione, si aggiungono dopo, per scelta, in Onboarding o nelle Impostazioni. Nessun campo da togliere, nessuna modifica necessaria.

☑ Messaggio di errore onesto nel login (segnalato da Manuel il 2026-09-26, corretto il 2026-09-28): `app/login/page.tsx` ora distingue lo status dell'errore restituito da Better Auth: 401 (`UNAUTHORIZED`, credenziali davvero sbagliate) → "Wrong email or password."; qualunque altro status (es. 500, errore di rete) → "We're having a technical issue. Please try again in a moment.". Il caso email non verificata (403 `FORBIDDEN`) resta gestito come prima, messaggio originale + rinvio email di conferma.

☑ **Bug, trovato il 2026-09-27 aggiornando la documentazione del database, corretto il 2026-09-28**: la cancellazione definitiva degli account dopo i 10 giorni (`lib/account/deletion.ts`, cron `purge-accounts`) non eliminava le iscrizioni "Partecipo" (`WorkshopRsvp`/`EventRsvp`), che hanno foreign key `RESTRICT` verso utenti ed eventi. Effetto: un utente che si è iscritto a un evento gratuito, o un creator con un evento che ha iscritti, non veniva mai cancellato davvero. Corretto aggiungendo `workshopRsvp.deleteMany`/`eventRsvp.deleteMany` sia lato creator (RSVP sui propri Workshop/Event) sia lato utente (proprie iscrizioni), prima della cancellazione di Workshop/Event/utente.

## Diventare creator

☑ Requisiti obbligatori per pubblicare per la prima volta, implementati al Punto 6 dell'allineamento (Legale, 2026-09-22): profilo compilato (nome utente, foto profilo, bio), video di presentazione caricato, Community Guidelines accettate (checkbox sbloccata solo dopo aver scrollato fino in fondo alla pagina). `getPublishReadiness()` in `lib/creator.ts`, controllato in `publishJourney`/`insertEpisode`/`updateEpisode` solo al momento della prima pubblicazione vera (mai sul salvataggio in Bozza, mai su una modifica di contenuto già pubblicato). Nessun grandfathering per gli account creator già esistenti. Corregge con decisione esplicita il principio "diventare creator è automatico" registrato dopo il Punto 2 — resta vero che non c'è una schermata di iscrizione separata, ma ora richiede questi tre passaggi prima del primo publish.

☑ Player video condiviso (`components/common/VideoPlayer.tsx`) tra episodi e video di presentazione, e card "Who I am" del profilo ridisegnata: Bio e video di presentazione ora nella stessa card orizzontale (Bio a sinistra, video a destra, stessa altezza della card "In Progress" tramite lo stretch della griglia). Dettagli completi in `93_Project_Alignment_Recap.md`, Punto 6.

## Navigazione

☑ Tasto "indietro" del sito: la sensazione "macchinosa" segnalata da Manuel è stata chiarita (2026-09-22). Causa trovata: `BackButton.tsx` tiene la sua memoria delle pagine visitate in `sessionStorage`, ma quella memoria si azzera a ogni caricamento completo della pagina — non solo un refresh manuale, ma anche i ricaricamenti automatici che il sito fa durante le sessioni di sviluppo quando il codice viene modificato. Per questo il problema sembrava capitare "sempre, da qualsiasi pagina": succedeva quasi solo mentre si lavorava al progetto insieme, non nell'uso normale. Testato dal vivo con un percorso guidato (Home → Journey → episodio → Indietro → Indietro): funziona correttamente. Comportamento residuo — un utente reale che ricarica manualmente una pagina profonda perde il pulsante "Indietro" — validato con Manuel come accettabile, nessuna modifica al codice necessaria.

## Community

☑ Menu a tre puntini sulle card della lista Dashboard (`CommunityListingMenu.tsx`), chiesto da Manuel per modificare senza aprire la pagina intera: Modifica, Pubblica/Rimetti in Bozza, Elimina (con conferma). "Avvisa i tuoi follower" escluso di proposito (richiesta esplicita di Manuel), resta solo nella pagina di dettaglio.

☑ Copertina e dimensioni delle card nella lista Dashboard (`/dashboard/community`), segnalato da Manuel (2026-09-27/28): `CommunityListingRow.tsx` era solo testo, senza immagine. Ora mostra la copertina (quando presente) con lo stesso stile e le stesse dimensioni delle card episodio della pagina Journey (`EpisodeRow`): miniatura a sinistra, bordo/ombra ember al passaggio del mouse, sfumatura sulla copertina. `app/(site)/dashboard/community/page.tsx` risolve `coverUrl` (chiave R2) in link di riproduzione con `resolveCoverUrl`, stesso meccanismo già usato per le copertine dei Journey.

☑ Ridotti i clic per creare qualcosa in Community (Workshop/Event/Digital Product/1:1 Service), segnalato da Manuel come priorità del Punto 8 (2026-09-27/28): il percorso reale era menu → Dashboard → Community → Add → scegli AI o a mano → conferma → Pubblica, **8 clic** (non serviva già tornare alla lista per pubblicare: `createCommunityListing` reindirizza già alla pagina di dettaglio con il pulsante Pubblica visibile). Aggiunta una voce diretta "Add to Community" nel menu laterale (`components/layout/SideMenu.tsx`, sezione "You"), che porta dritto a `/dashboard/community/new` saltando Dashboard e la lista: **6 clic**.

☑ **Campo "Dove" per Workshop ed Eventi** (trovato il 2026-09-29 rileggendo i documenti): nello schema non esiste un campo per luogo o link online, quindi chi preme "I'm going" non sa dove andare se il creator non l'ha scritto nella descrizione. Decisione di Manuel: il luogo/link è visibile a tutti, non solo a chi partecipa. Fatto (commit `5850ff2`).

☑ **Email di contatto nella pagina `/contact`** (prima "Coming soon"): aggiunta dopo che il dominio zerojourneys.com è stato collegato a Resend (vedi "Infrastruttura & costi"). Fatto (commit `7cb1dc6`).

☑ **Forum per Journey, dentro la Community** (2026-10-02): ripensamento del concetto di Community partito da un documento di Manuel scritto con ChatGPT ("Community → Journey → Chapter → Progress"), poi semplificato con lui in chat. La pagina Community di un creator ora ha due spazi separati: **Activities** (quello che c'era già: abbonamento, workshop, eventi, shop, 1:1, solo rinominato con un suo spazio) e **Forum** (nuovo). Il Forum è testuale (niente foto/video, scelta esplicita di Manuel: non deve diventare un feed di contenuti, resta una vera discussione), **un'unica bacheca per Journey** (non divisa per Capitolo), **ordine cronologico con ricerca testuale** (non a thread). Può scrivere solo chi sta davvero facendo quel Journey — lo sappiamo già in automatico da `JourneyProgress`, creato al primo episodio guardato, nessun pulsante "iscriviti" — più il creator, sempre. Un messaggio del creator è evidenziato con lo stesso trattamento "vetro arancione + bagliore" già usato altrove nel sito (`PANEL_GLASS`), invece del riquadro normale. Nuovo modello `ForumMessage` (`prisma/schema.prisma`), pagina `/community/forum/[journeyId]`, azioni in `lib/actions/forum.ts`. Moderazione minima: l'autore cancella il proprio messaggio, il creator può cancellare qualunque messaggio nel forum dei propri Journey; segnalazione riusa il modello `Report` esistente (`targetType: "COMMENT"`).

☐ **Upgrade futuro, non costruito ora**: dividere il forum per Capitolo invece che per Journey intero, con la stessa regola anti-spoiler dell'idea originale (si può scrivere/leggere un Capitolo solo dopo averlo raggiunto — calcolabile da `EpisodeProgress`, già disponibile).

☐ **Upgrade futuro, non costruito ora**: messaggi a thread (risposta a un messaggio specifico) al posto del flusso cronologico unico, se la discussione dovesse diventare lunga da seguire.

## Sicurezza utenti

☑ **Impostazioni Privacy (`/settings/privacy`)**: blocca utente e account privato (2026-10-01). Bloccare annulla il segue reciproco, chiude i messaggi e nasconde i profili tra le due parti (`lib/block.ts`, `lib/actions/block.ts`). Account privato (scelta "stile YouTube" scartata, vedi discussione: YouTube non ha un vero account privato, solo visibilità per-video): chi non ti segue vede solo nome/foto/bio, non Journey/Update — ma i Journey pubblicati restano scopribili in Discovery/Ricerca, decisione esplicita per non penalizzare chi crea contenuti. `User.isPrivate` + model `Block`, gate in `app/profile/[username]/page.tsx`.

## Discovery

☑ **Most Completed Journeys, solo nella pagina `/journeys`** (2026-10-01): classifica dei Journey ordinata per quota di spettatori che finiscono almeno il 90% degli episodi (stesso criterio di "completamento" di Journey Score), non per il punteggio misto di Top Journeys. Un Journey entra in classifica solo con almeno 5 spettatori distinti, altrimenti la riga semplicemente non lo include — mai una percentuale mostrata. `lib/discovery/mostCompletedJourneys.ts`, riusa `computeViewerStatsByJourney` estratta da `lib/scoring/journeyScore.ts`.

## Business futuro (idee, nessun piano richiesto ora)

☐ [Idea] Sezione dove le aziende possono proporsi per sponsorizzare Zero/i creator, stile Instagram.

☐ [Idea] Marketplace interno per contenuti UGC: le aziende cercano creator per contenuti, Zero trattiene una commissione sulla transazione. Collegato al punto sopra.

☐ [Da definire dove] Dare risalto pubblico al principio "nessun pagamento influenza il ranking dei Journey" (vedi `10_Monetization.md`) — dove mostrarlo è ancora da decidere (pagina Journey? footer? sezione "Come funziona"?).

☐ [Idea, 2026-09-27] Pulsante "Download as PDF" sotto le risposte lunghe della chat AI Community: trasformare testo in PDF non richiede l'AI, quindi è gratis. Utile soprattutto per i Digital product (l'AI scrive la guida, il creator la scarica e la carica come file da vendere). Messa da parte da Manuel per non complicare troppo il giro, da riprendere con calma.

☐ [Idea, 2026-10-01] **Condividere un profilo negli Update** (repost di una persona, non solo di un Journey/episodio): richiede lavoro vero, non solo riuso — il modello `Update` ha solo `linkedJourneyId`/`linkedEpisodeId`, serve aggiungere `linkedUserId` (migrazione) + aggiornare `shareToUpdate` + un nuovo modo di mostrare questo tipo di Update ovunque compaiono (Home, profilo, visualizzatore a schermo intero). Per ora nel menu "..." del profilo c'è solo "Copia link".

## Monetizzazione

Nessuna di queste fonti è ancora costruita: le pagine reali (`/settings/creator`, `/pricing`, `/settings/subscription`) esistono ma mostrano solo "Coming soon". Percentuali e ordine di attivazione decisi al Punto 3 dell'allineamento (`93_Project_Alignment_Recap.md`), dettagli in `10_Monetization.md` v4.0.

☐ **Pubblicità contestuale** (prima fonte da costruire) — collegare una rete pubblicitaria contestuale (es. Media.net, Ezoic/Humix, Primis — alternative a Google AdSense adatte a piattaforme piccole/video), split 60% creator / 40% Zero, pagamento mensile con soglia minima ~100 nella valuta locale.

☐ **Tips e donazioni** (seconda fonte) — meccanismo di pagamento diretto utente→creator, commissione Zero 10%.

☐ **Community Premium** — abbonamento mensile di un utente verso un singolo creator per contenuti/spazi riservati (modello Patreon/Skool). Da progettare da zero, Manuel non ha esperienza diretta da cui partire — servirà un giro di riferimenti concreti prima di disegnarla.

☐ **Eventi/workshop** — stesso gruppo economico di Community Premium (90% creator / 10% Zero), da definire come si organizzano tecnicamente (prenotazione, streaming live?, semplice pagina con link esterno?).

☐ **Consulenze 1:1** (era "servizi professionali", chiarito e confermato al Punto 3) — un creator vende una videochiamata/mentoring a pagamento tramite Zero. Stesso gruppo economico di Community Premium.

☐ **Prodotti digitali** (parola presente nei documenti ma mai definita, chiarita al Punto 3) — file scaricabili venduti dal creator (e-book, guide, corsi, template). Stesso gruppo economico di Community Premium.

☐ **Tag "contenuto sponsorizzato" obbligatoria** — quando un creator promuove un prodotto per accordo diretto con un brand (fuori piattaforma), Zero non trattiene nulla ma richiede una dichiarazione visibile. Priorità più alta delle altre voci di questa sezione: costa poco costruire (solo una tag/etichetta) e riduce rischio legale. **Confermata da costruire da Manuel il 2026-09-29.**

☐ [Idea, non prioritaria] **Marketplace sponsorizzazioni creator-brand** — Zero mette in contatto creator e aziende, trattiene una commissione del 10% solo dal brand (modello TikTok Creator Marketplace). Stesso concetto delle due idee già in questa lista (sezione sponsor, marketplace UGC) — quando si costruirà, unificare i tre in un solo lavoro.

☐ **Meccanismo tecnico dei pagamenti (Stripe Connect)** — scegliere tra account Standard/Express/Custom quando si arriva a costruire davvero (Punto 7 dell'allineamento). Non blocca le decisioni di percentuali/ordine già prese.

## Infrastruttura & costi

☐ [In pausa, decisione presa 2026-09-21] Rivedere compressione/distribuzione video e storage. Nota emersa aprendo il punto: la promessa pubblica su "Know the Algorithm. Know Zero." ("mai compresso") è già tecnicamente imprecisa oggi — esiste già una versione "light" adattiva via Cloudflare Stream (`Episode.lightVideoStatus`, vedi `EpisodePlayer.tsx`), l'originale resta solo come fallback. Se si introduce/rivede la compressione, va comunque riscritto quel testo pubblico. Manuel aveva portato un documento con un'architettura alternativa fai-da-te (R2 + Cloudflare Cache + FFmpeg su server dedicato, niente Cloudflare Stream) pensata per uno scenario futuro a ~1.000 utenti registrati — **non un piano attivo**: oggi Zero non ha ancora traffico video reale, quindi il problema di costo che risolve non esiste ancora, e aspettare non comporta nessun lavoro perso (l'originale resta comunque su R2 in entrambi gli scenari). Documento completo salvato in `95_Video_Scaling_Future_Option.md`. Segnale per riprendere: crescita continua della spesa Cloudflare Stream legata ai minuti di video consegnati, da controllare periodicamente man mano che arrivano utenti reali.

☑ Compressione automatica delle foto caricate, interamente nel browser prima dell'upload (nessun costo, nessuna nuova dipendenza): sopra 2MB la foto viene ridimensionata (lato più lungo max 2000px) e ricompressa come JPEG (qualità 0.82). Limite massimo assoluto alzato da 8MB a 20MB, ora che la compressione gestisce i file pesanti da sola. Nuovo `lib/compressImage.ts` usato dai flussi senza ritaglio (poster episodio in `EpisodeForm.tsx`, poster/foto Update in `QuickUploadButton.tsx`); `lib/cropImage.ts` (avatar, copertina profilo, copertina Journey) esteso con lo stesso limite di dimensione. Non riguarda i video, gestiti a parte (vedi `95_Video_Scaling_Future_Option.md`).

☐ Verificare se esiste un limite di tempo per utenti/sessioni inattive (sessione di login vs account dormienti — da chiarire con Manuel quale dei due). Controllato 2026-09-15: `lib/auth.ts` non ha configurazione esplicita, usa i default di Better Auth. Manuel (2026-09-29): "valutiamolo", da discutere prima di decidere.

☑ **Collegare il dominio zerojourneys.com a Resend** (comprato il 2026-09-23): dominio verificato su Resend (record DNS su Cloudflare), mittente in `lib/email.ts` aggiornato, testato con un invio reale arrivato su Yahoo (commit `5ac5476` + `7cb1dc6`).

☐ Schermate di caricamento (sagome grigie delle card al posto della pagina bianca) e pagine di errore dedicate ("riprova" invece di un messaggio tecnico). Voci della Roadmap in `99_Current_Project_Status.md`, Fase 2; Manuel (2026-09-29): "va bene così credo", priorità bassa.
