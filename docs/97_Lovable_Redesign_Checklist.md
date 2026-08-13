---
title: Lovable Redesign Checklist
doc_id: 97-lovable-redesign-checklist
version: "1.0"
status: in-progress
related_docs:
  - 14_UI_Pages
  - 15_Design_System
  - 99_Current_Project_Status
---

# Lovable Redesign Checklist

Mappa di lavoro per l'allineamento pixel-preciso del progetto reale al design di riferimento Lovable (`manuelmorelli/zero-your-transformation-journey`, letto tramite lo strumento Lovable collegato — fonte di verità esatta, non ricostruzione a memoria).

**Regola fissa**: prima di iniziare uno qualsiasi dei lavori "Da fare" sotto, presentare il piano per quel lavoro e aspettare che Manuel scriva esplicitamente "vai" in chat — anche se questo documento lo elenca come prossimo passo previsto. Questo documento dice *cosa* resta da fare, non autorizza a farlo.

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

## Da fare

### Fase 2 — Pagina Journey e Player
- [ ] Pagina Journey: pannello vetro nell'header (grid 2 colonne, come nel sorgente `JourneyPage.tsx`), invece del blocco `bg-surface` pieno attuale
- [ ] Lista episodi: stile esatto del sorgente (righe con miniatura, non ancora confrontato in dettaglio)
- [ ] Pagina Player: confrontare `EpisodePlayer.tsx` con `PlayerPage.tsx` del sorgente (controlli, layout "Up next", badge Trust Score)

### Fase 3 — Profilo pubblico
- [ ] Hero profilo: foto di copertina + anello decorativo sull'avatar (asset `zero-o-ring.png`, non ancora scaricato/integrato)
- [ ] Tab Overview/Journeys nello stile esatto del sorgente
- [ ] Card poster ovunque nel profilo (attualmente ancora nello stile precedente, vedi screenshot sessione 2026-08-13)
- [ ] Popup di modifica reali (shadcn/ui + Dialog/DropdownMenu, sonner per i toast — Manuel ha già approvato l'installazione di queste due librerie)
- [ ] **Agganciare qui la riga "Continue Your Journey"**, già estratta e pronta in `components/journey/ContinueJourneyRow.tsx` + `lib/discovery/continueJourneys.ts` (rimossa dalla Home su richiesta di Manuel, va sulla home del Profilo)

### Fase 4 — Righe extra della Home (non presenti nel mockup Lovable)
- [ ] "Recommended for you" e "Creators to follow": rivedere lo stile puntualmente (oggi solo riposizionate, non ristilizzate)
- [ ] Categories, How it works, FAQ: valutare se serve lo stesso linguaggio visivo (pannello vetro) o restano come sono

### Fase 5 — Dashboard
- [ ] Selettore Journey a griglia (con badge stato, menu a tre puntini)
- [ ] Trascinamento (drag & drop) capitoli/episodi
- [ ] Pannello "Private Stats" nello stile esatto (oggi è un placeholder onesto "coming soon")
- [ ] Popup di modifica reali (stessa libreria della Fase 3)

## Note aperte (non legate a una fase specifica)

- [ ] Consegnare a Manuel l'elenco finale mappatura categoria → icona per revisione (promesso in una sessione precedente, mai ancora mostrato)
- [ ] `FollowedCreatorsFeed`/`FeedItem`: rimossi dalla Home ma non cancellati (query `getFollowedCreatorsFeed` e componente `FeedItem` intatti) — capire con Manuel se e dove reintrodurli, o se restano inutilizzati definitivamente
- [ ] La freccetta "View all" della riga Updates in Hero apre il visualizzatore a schermo intero (non esiste una pagina Updates dedicata, per scelta di prodotto attuale — `06_User_Experience.md`/`14_UI_Pages.md` non la prevedono)
- [ ] Verificare con un login reale da browser (non automatizzato) che la riga Updates in Hero funzioni: non è stato possibile testarla con Playwright in questa sessione
- [ ] Verifica visiva della Dashboard con sessione autenticata reale: mai riuscita in nessuna sessione finora (limite noto, non nuovo di oggi)
