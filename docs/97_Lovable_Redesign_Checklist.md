---
title: Lovable Redesign Checklist
doc_id: 97-lovable-redesign-checklist
version: "1.2"
status: in-progress
related_docs:
  - 14_UI_Pages
  - 15_Design_System
  - 99_Current_Project_Status
---

# Lovable Redesign Checklist

Mappa di lavoro per l'allineamento pixel-preciso del progetto reale al design di riferimento Lovable (`manuelmorelli/zero-your-transformation-journey`, letto tramite lo strumento Lovable collegato — fonte di verità esatta, non ricostruzione a memoria).

**Regola fissa**: prima di iniziare uno qualsiasi dei lavori "Da fare" sotto, presentare il piano per quel lavoro e aspettare che Manuel scriva esplicitamente "vai" in chat — anche se questo documento lo elenca come prossimo passo previsto. Questo documento dice *cosa* resta da fare, non autorizza a farlo.

**Contesto importante**: un primo tentativo di questo porting (prima del 2026-08-13) era stato fatto leggendo il repo GitHub "a occhio", senza lo strumento Lovable collegato in tempo reale — il risultato non assomigliava al vero design ("il risultato finale non è per niente simile al lavoro che ho creato su lovable", feedback di Manuel). Tutto il lavoro elencato come "Fatto" qui sotto è stato rifatto/verificato dal 2026-08-13 in poi leggendo il codice sorgente esatto tramite lo strumento Lovable (`list_files`/`read_file` sul progetto `6da6089f-6d97-45d2-ab83-ec839401dc7d`), non a memoria — quindi affidabile. Se in una sessione futura questo documento risultasse in contraddizione con quanto si vede nel browser, fidarsi di quello che si vede e ricontrollare il sorgente Lovable, non di questo file.

Ogni volta che un punto viene completato: spuntarlo qui (`- [x]`), aggiungere una riga con la data e il commit, e solo dopo aggiornare `99_Current_Project_Status.md` se il cambiamento è abbastanza rilevante da meritarlo.

## Fatto

- [x] Palette colori esatta (oklch) da sorgente Lovable — 2026-08-13
- [x] Header: layout, spaziatura compattata, logo (wordmark originale, non l'SVG quadrato) — 2026-08-13
- [x] Hero riscritta identica al sorgente: immagine `logo.svg` (non testo CSS), foto cinematografica rotante con citazione e puntini cliccabili, bottoni Primitives corretti — 2026-08-13
- [x] Updates spostati sotto i bottoni Explore/Create nella Hero (solo utenti loggati), al posto degli avatar "Join thousands..."; StoriesRow.tsx eliminato (logica confluita in Hero.tsx) — 2026-08-13
- [x] JourneyCard: da "foto sopra + testo sotto" a card poster con testo overlay (usata in Home, Discover, Categorie, Ricerca) — 2026-08-13
- [x] MomentJourneyCard e VideoCard: aggiunto avatar accanto al nome autore, VideoCard con icona Clock — 2026-08-13
- [x] Pannello "vetro" (bordo sottile, sfondo quasi trasparente) sulla prima riga della Home ("Discovering Now") — 2026-08-13
- [x] Home ristrutturata: "Journeys of the Moment" limitata a 4 card; rimosse "From creators you follow", "Continue Your Journey", "New Journeys" (logica conservata, non cancellata — vedi Note); ordine "Latest Videos"/"Journeys of the Moment" invertito; "Recommended for you" spostata al posto di "From creators you follow" — 2026-08-13
- [x] Logo Hero rifinito: `logo.svg` ritagliato via script (solo lettere "ZERO", niente tagline/simbolo cerchio-onda) ed esportato come `public/images/zero-wordmark.png` con sfondo davvero trasparente; eyebrow "Every journey starts from" come testo separato sopra; dimensione aumentata, spaziatura lettere leggermente compressa; Hero più compatta (Discovering Now visibile senza scroll su desktop, corretta dopo un primo taglio troppo aggressivo) — 2026-08-13
- [x] Logo Header: ripristinato il wordmark precedente (`logo.png`) — la richiesta di "cambia il logo" riguardava solo la Hero, non l'header — 2026-08-13
- [x] Cerchi Updates nella Hero: spaziatura ridotta (gap-3 → gap-1.5), massimo 6 mostrati, freccetta "View all" subito dopo il sesto (apre lo stesso visualizzatore a schermo intero) — 2026-08-13

- [x] Pagina Journey: pannello header passato da `bg-surface` pieno a vetro (`bg-white/[0.02]`, come nel sorgente `JourneyPage.tsx`); righe episodi allineate allo stesso stile vetro (`bg-white/[0.02]`, hover `border-white/25 bg-white/[0.05]`) — 2026-08-14
- [x] Pagina Player: confrontato `EpisodePlayer.tsx`+`UpNextList.tsx` con `PlayerPage.tsx` del sorgente — controlli, layout "Up next" e badge Trust Score erano già allineati; corretto solo lo stile vetro delle righe "Up next" inattive (`bg-white/[0.02]`, hover `border-white/25 bg-white/[0.05]`) — 2026-08-14

- [x] Fase 3 — Profilo pubblico, confrontata riga per riga col sorgente Lovable (`Profile.tsx`, `Dashboard.tsx`) in più round con Manuel — 2026-08-14/16:
  - Hero: copertina + anello `zero-o-ring.png` (scaricato dal preview Lovable, non più l'SVG segnaposto); aggiunti `@username` e conteggio "Following" (mancavano); bottoni proprietario tornati a 3 visibili (Edit Profile/Dashboard/Share Profile, niente menu "..." che li duplicava); larghezza contenitore allineata a Header/Home (`max-w-[1400px] px-5 md:px-8`)
  - Overview ristrutturata in 3 sezioni volute da Manuel: "Journey in corso" (card sistemata: titolo `text-xl`, bottone vero non link testuale) → "Recent Episodes" (feed episodi, no punteggio finto, solo Like reale) → "Published Journeys" (anteprima 5 + "View all" verso la tab Journeys, che resta la lista completa)
  - Scoperto e corretto: le card del Profilo nel sorgente Lovable NON sono in overlay come `JourneyCard` (Home/Discover) — sono foto sola sopra + titolo/categoria/punteggio sotto. Nuovo componente `ContentCard` dedicato al Profilo, usato in "Recent Episodes"/"Published Journeys"/tab "Journeys"; vecchio `FeedPhotoItem` rimosso
  - Punteggio "trust" mostrato solo dove è un dato reale (`Journey.journeyScore`, sulle card Journey) — mai sugli episodi, che non hanno un punteggio proprio
  - Rimossa la scheda "Journey Stats" dal profilo pubblico (confermato da Manuel: sono dati privati, l'equivalente Lovable "Private Stats" è esplicitamente Dashboard-only "never shown on public profile" — va in Dashboard nella Fase 5, non prima)
  - Menu a tre puntini sulle card Journey (`JourneyCardMenu`, DropdownMenu reale): Edit (link alla Dashboard, dove vive il form completo) + Share (reale) + Archive (reale, chiama `archiveJourney` con conferma) — niente azioni finte; sugli episodi solo un bottone Share (un menu con una sola voce non ha senso)
  - shadcn/ui installato manualmente (Dialog, DropdownMenu, Input, Textarea in `components/ui/`, mappati sui token colore del progetto, non i default shadcn) + sonner (`<Toaster/>` in `app/layout.tsx`)
  - Corretto bug reale: la barra dei tab Overview/Journeys mostrava la scrollbar nativa del browser (classe `no-scrollbar` già definita nel progetto ma mai usata, ora applicata)
- [x] Fase 3 — correzioni post-revisione live (Manuel ha rivisto la pagina reale in browser, non il sorgente) — 2026-08-16:
  - Rimossa la riga "Continue Your Journey" dall'Overview del proprio Profilo: era doppione della card del Journey in corso mostrata subito sotto (il componente/la query restano, sono ancora usati in Home)
  - Rimossa la sezione "Reorder your episodes" dall'Overview del Profilo: è lavoro da Dashboard, non da profilo pubblico. `EpisodeReorderSection`/`EpisodeReorderGroup` NON cancellati, tenuti da parte per essere riusati quando si farà il drag & drop capitoli/episodi in Fase 5
  - Etichetta "Featured" → "In Progress" sulla card del Journey attivo, sia nell'Overview che nella tab "Journeys" (stessa etichetta in entrambi i punti, stesso significato: il Journey con l'episodio più recente)

- [x] Fase 3 bis — Riordino dei Journey tramite il menu a tre puntini ("Move Back"/"Move Forward", come nel sorgente Lovable `Profile.tsx`) — 2026-08-16:
  - Nuovo campo `Journey.order` (migrazione `20260816120000_journey_order`; dati precedenti fittizi, nessun backfill che ne preservasse l'ordine, tutti azzerati a 0 su richiesta di Manuel)
  - Nuova funzione `moveJourney` in `lib/actions/journey.ts`, stessa tecnica di scambio con il vicino già usata da `moveEpisode`; i "vicini" sono l'elenco visibile sul Profilo pubblico (`PUBLICLY_REACHABLE_JOURNEY_STATUSES`), le Bozze non contano
  - I nuovi Journey continuano ad andare in cima alla lista (comportamento invariato rispetto a prima, quando l'ordine era per data di creazione discendente)
  - Voci collegate in `JourneyCardMenu.tsx`, disattivate quando il Journey è già il primo/ultimo; posizione calcolata sull'elenco completo (non sulla sola anteprima "Published Journeys" dell'Overview), così il riordino è coerente ovunque
  - Verificato end-to-end con un utente di test reale via Playwright (registrazione, verifica email dal link di sviluppo, creator, 3 Journey pubblicati, riordino dal Profilo) — dati di test poi rimossi dal database

- [x] Fase 4 — Righe extra della Home (non presenti nel mockup Lovable) — 2026-08-16:
  - Verificato puntualmente: "Recommended for you" usa già `JourneyCard`, identica allo stile "Explore Journeys" del sorgente Lovable — nessuna modifica necessaria
  - `CreatorResultCard` ("Creators to follow") era rimasta allo stile pre-redesign (sfondo pieno, sollevamento + bagliore arancione) mentre il resto del sito era passato al linguaggio "vetro" — su richiesta di Manuel non è stata portata al vetro, ma l'effetto arancione (sollevamento + bagliore) è stato esteso a **tutte** le card fotografiche del sito, in aggiunta allo zoom della foto già presente: `JourneyCard`, `VideoCard`, `MomentJourneyCard`, `ContentCard` (Profilo), `FeaturedJourneySection` (Profilo). Scelta di stile voluta da Manuel, non presente nel sorgente Lovable originale (che usa solo lo zoom) — divergenza consapevole, non un errore di allineamento
  - Categories: confermato da Manuel che va bene così com'è, nessuna modifica
  - How it works + FAQ: tolte dalla Home come sezioni intere, sostituite da una card compatta e rettangolare ("How Zero works") che apre la nuova pagina statica dedicata `/how-it-works` (stesso pattern di `/what-is-zero`), dove vive tutto il contenuto spostato

### Fase 5 — Dashboard
- [ ] Selettore Journey a griglia (con badge stato, menu a tre puntini)
- [ ] Trascinamento (drag & drop) capitoli/episodi — componenti `EpisodeReorderSection`/`EpisodeReorderGroup` già pronti (usati temporaneamente sul Profilo in Fase 3, poi rimossi da lì il 2026-08-16), da riagganciare qui
- [ ] Pannello "Private Stats" nello stile esatto (oggi è un placeholder onesto "coming soon")
- [ ] Popup di modifica reali (stessa libreria della Fase 3)

## Note aperte (non legate a una fase specifica)

- [ ] Consegnare a Manuel l'elenco finale mappatura categoria → icona per revisione (promesso in una sessione precedente, mai ancora mostrato)
- [ ] `FollowedCreatorsFeed`/`FeedItem`: rimossi dalla Home ma non cancellati (query `getFollowedCreatorsFeed` e componente `FeedItem` intatti) — capire con Manuel se e dove reintrodurli, o se restano inutilizzati definitivamente
- [ ] La freccetta "View all" della riga Updates in Hero apre il visualizzatore a schermo intero (non esiste una pagina Updates dedicata, per scelta di prodotto attuale — `06_User_Experience.md`/`14_UI_Pages.md` non la prevedono)
- [ ] Verificare con un login reale da browser (non automatizzato) che la riga Updates in Hero funzioni: non è stato possibile testarla con Playwright in questa sessione
- [ ] Verifica visiva della Dashboard con sessione autenticata reale: mai riuscita in nessuna sessione finora (limite noto, non nuovo di oggi)
