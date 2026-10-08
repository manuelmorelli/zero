---
title: Design System
doc_id: 15-design-system
version: "3.1"
status: approved
related_docs:
  - 00_PROJECT_CONTEXT
  - 06_User_Experience
  - 14_UI_Pages
  - 21_Motion_Guidelines
---

# Design System

## Obiettivo

Definire i principi che guidano il design dell'interfaccia di Zero.

Il Design System garantisce coerenza visiva, semplicità di utilizzo e uniformità nello sviluppo dell'intera piattaforma.

## Dichiarazione

Il design di Zero deve mettere il contenuto al centro dell'esperienza.

L'interfaccia deve accompagnare l'utente senza distrarlo, eliminando elementi superflui e privilegiando leggibilità, gerarchia visiva e chiarezza.

## Principi

### Content First

Ogni elemento grafico deve valorizzare il Journey e i suoi contenuti.

L'interfaccia non deve competere con ciò che il creator desidera raccontare.

---

### Semplicità

Ogni schermata deve risultare immediatamente comprensibile.

Le azioni principali devono essere sempre riconoscibili e facilmente accessibili.

---

### Coerenza

Componenti, colori, tipografia, spaziature e comportamenti devono mantenere lo stesso linguaggio visivo in tutta la piattaforma.

---

### Gerarchia visiva

Le informazioni devono essere organizzate secondo la loro importanza.

Gli elementi principali devono emergere naturalmente senza ricorrere a effetti grafici eccessivi.

---

### Accessibilità

L'interfaccia deve essere utilizzabile dal maggior numero possibile di persone.

Colori, contrasti, dimensioni del testo e componenti interattivi devono favorire una navigazione chiara e inclusiva.

---

### Responsive Design

Zero è progettato con un approccio mobile-first.

L'esperienza deve adattarsi in modo coerente a smartphone, tablet e desktop.

## Componenti

L'interfaccia è costruita attraverso componenti riutilizzabili.

Ogni componente deve:

- avere una responsabilità precisa;
- mantenere un comportamento coerente;
- essere facilmente estendibile;
- rispettare gli standard di accessibilità.

## Interazioni

Le animazioni devono essere essenziali e funzionali.

Ogni transizione deve migliorare la comprensione dell'interfaccia senza rallentare l'esperienza.

Il drag & drop deve risultare naturale, fluido e immediatamente comprensibile.

Durate, tipi di movimento, divieti e comportamento su telefono sono fissati nella Regola di Movimento (`21_Motion_Guidelines.md`), approvata da Manuel il 2026-10-07 e aggiornata il 2026-10-09 (sfondo di sabbia dorata 3D).

**Carattere tipografico**: Satoshi (Fontshare, licenza gratuita anche per uso commerciale), scelto da Manuel il 2026-10-09 al posto di Inter. Il file variabile è salvato nel progetto (`app/fonts/Satoshi-Variable.woff2`, pesi da 300 a 900) e caricato con `next/font/local` in `app/layout.tsx`. Il collegamento a `--font-sans` sta in un blocco `@theme inline` di `app/globals.css`: dentro un `@theme` normale la variabile del carattere non veniva trovata e il sito ricadeva sul carattere di sistema (era già successo con Inter, che non si è mai visto davvero).

## Identità visiva

L'identità grafica deve trasmettere:

- autenticità;
- trasformazione;
- chiarezza;
- affidabilità;
- modernità.

Il linguaggio visivo deve rafforzare la percezione di Zero come piattaforma dedicata ai percorsi di crescita personale.

## Attuazione tecnica (dal 2026-09-29)

I principi sopra non bastavano da soli: ogni nuova sessione di lavoro tendeva a ricostruire da zero bottoni, titoli, card e colori invece di riusare quelli già esistenti, e il sito si è scollegato pezzo dopo pezzo (vedi Capitolo 25 di `92_Project_History.md`). Da qui un sistema che *obbliga* a rispettare la coerenza invece di limitarsi a chiederla:

**Un solo posto per i colori e le grandezze**: `app/globals.css` (blocco `@theme`). Sfondo, testi, bordo, arancione (`--color-ember`, sempre pieno, mai sfumato), rosso, velo scuro sulle foto (`--color-scrim`), vetro della barra in alto, tutti i colori vengono da lì. Nessun colore va scritto a mano (`#fff`, `rgba(...)`, `bg-white/10`...) dentro un componente.

**Un solo posto per ogni pezzo di interfaccia**: `components/ui/`.
- `button.tsx` — `ButtonPrimary` (bianco), `ButtonSecondary` (arancione), `ButtonDanger` (rosso), `IconButton`, `TextButton`. Sono gli unici bottoni del sito.
- `heading.tsx` — `PageTitle`, `DisplayTitle`, `SectionTitle`, `ReadingTitle`, `CardTitle`.
- `panel.tsx` — `Panel`/`PANEL`, `PANEL_ACCENT`, `PANEL_DANGER`, `PANEL_DASHED`, `Notice`/`NOTICE`, `ROW`, `Badge`/`BADGE`, `CHIP`/`CHIP_SELECTED`.
- `input.tsx` / `textarea.tsx` — `Input`, `Textarea`, `Select`, `PillField`, e le costanti `FIELD`/`PILL_FIELD` per chi ha bisogno del solo className.
- `page-container.tsx` — `PageContainer`/`PAGE_WIDTH` (`narrow`, `wide`, `wideCover`) e `PAGE_SPACING`: le uniche larghezze e distanze di pagina ammesse.
- `cover-card.tsx` — `CoverFrame` (la card con foto usata da Journey, episodi, persone, eventi), `CARD_GRID`/`CARD_ROW_ITEM` per le griglie e le righe che scorrono.
- `avatar.tsx` — `Avatar`, l'unica foto profilo tonda del sito.

Una pagina nuova compone questi pezzi; non ne disegna di propri. Un'eccezione (un colore o un componente diverso) va discussa con Manuel prima, non decisa da soli.

**Il lucchetto**: `scripts/check-design.mjs` (`npm run check:design`) legge ogni file di `app/` e `components/` e blocca chi usa un colore fuori palette, una grandezza di testo sotto `text-sm`, un bottone/titolo/riquadro/campo/contenitore fatto a mano invece del mattoncino ufficiale, una scritta arancione sfumata, "zero" minuscolo o un trattino lungo nel testo. Parte da solo prima di ogni commit (`git config core.hooksPath .githooks`, già impostato nel repository — a chi clona il progetto da zero conviene rilanciarlo una volta). Un componente approvato come eccezione (es. la chat AI della Community, per scelta esplicita di Manuel) è elencato in cima allo script.

Le scelte di colore, formato delle card e grandezze sono quelle decise da Manuel il 2026-09-29 tramite due pagine di confronto (bottoni/titoli/card e colori), non inventate durante la pulizia.

## Regole

Ogni nuova schermata o componente deve rispettare i principi definiti in questo documento e i mattoncini della sezione precedente.

Le eccezioni devono essere limitate e adeguatamente motivate, e vanno aggiunte esplicitamente alla lista di `scripts/check-design.mjs`.

## Implicazioni sul prodotto

Il Design System rappresenta il riferimento unico per designer e sviluppatori nella realizzazione dell'interfaccia di Zero.

Qualsiasi evoluzione dell'identità visiva deve preservare la coerenza dell'esperienza utente.