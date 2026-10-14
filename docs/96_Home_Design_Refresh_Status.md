---
title: Home Design Refresh Status
doc_id: 96-home-design-refresh-status
version: "1.0"
status: in-progress
related_docs:
  - 97_Lovable_Redesign_Checklist
  - 15_Design_System
  - 99_Current_Project_Status
---

# Home Design Refresh Status

Punto della situazione sul lavoro di "dare vita" al design del sito, cominciato il 2026-09-23 sul ramo `design-wow-experiment`, per ora concentrato sulla Home/Hero. Manuel non era soddisfatto della fedeltà visiva rispetto al design di riferimento Lovable (piattezza di colori/grafica) anche dopo il porting pixel-preciso descritto in `97_Lovable_Redesign_Checklist.md` — questo documento tiene traccia di cosa è stato fatto, cosa resta discusso ma non realizzato, e i bug aperti emersi nel frattempo.

## Fatto e verificato (Home + Hero)

- Bordi ammorbiditi in tutto il sito (`--color-border` unico token, un solo punto da cambiare)
- Card (Journey, Video, Profilo, Journeyer) con bagliore ambra visibile anche a riposo, non solo in hover
- `ButtonSecondary` reso vivo anche da fermo (prima cambiava solo in hover)
- `ButtonPrimary` con sweep di luce animato
- Hero: zoom lentissimo continuo ("Ken Burns"), tinta calda, grana pellicola più marcata che nel resto del sito
- Niente barre "letterbox" nella Hero: provate e tolte, leggevano come un bug di layout (card troppo grande/foto piccola), non come scelta stilistica
- Sfumatura finale della Hero (foto → sfondo pagina) allungata e ammorbidita
- Header: altezza ridotta di 0.5cm; ora ha sempre un velo scuro sfocato visibile (anche da fermo, non solo scrollando)
- Spazio reale (1cm) tra header e Hero senza percezione di "blocco" separato
- Hero e resto della pagina condividono un unico sistema di bagliore ambientale (prima ce n'erano due sovrapposti con parametri diversi, causa di un residuo non voluto)
- Rimossa l'ombra propria della card della Hero: contribuiva a far percepire un bordo anche a colori perfettamente abbinati

### Bug del build tool scoperti nel frattempo

Utili da ricordare per il futuro, non ovvi:

1. Una regola CSS con `background-image` identico byte-per-byte a un'altra regola già presente nel foglio di stile viene scartata in silenzio, anche con selettore diverso.
2. Un commento CSS scritto tra i valori separati da virgola di una proprietà multi-riga (es. dentro `background: valore1, /* commento */ valore2`) fa scartare in silenzio l'intera dichiarazione.
3. **(2026-09-27)** Dopo diverse modifiche ravvicinate a `--color-bg`/`--color-ember` in `app/globals.css` con riavvii ripetuti del dev server, il CSS servito è rimasto quello di una versione precedente (bagliore arancio già rimosso dal codice sorgente ma ancora visibile a schermo) — non un problema di codice. `rm -rf .next/cache` da solo non è bastato una volta, servito anche un `rm -rf .next` completo (l'intera cartella, non solo `cache`) seguito da un riavvio pulito di `npm run dev`. Se un colore non si aggiorna nel browser nonostante il file sorgente sia corretto, fermare il server, cancellare tutta `.next`, riavviare, e verificare il CSS effettivamente servito (non fidarsi solo del refresh del browser).

## Round colori 2026-09-27 (in prova, non ancora committato)

Sessione dedicata a rivedere sfondo e accento dopo il round precedente. Diversi tentativi, alcuni scartati da Manuel con feedback diretto:

- **Sfondo**: partito da un grigio caldo scelto a mano (leggeva "arancio"), poi una palette premium collaudata (famiglia "stone", scartata: aveva comunque un fondo caldo/marrone percepito come arancio), infine un grigio davvero neutro (chroma zero, `--color-bg: #171717`, `--color-surface: #262626`, `--color-surface-2: #404040`). Per dargli "luminosità" (richiesta esplicita di Manuel, uno sfondo piatto in tinta unica "sembra morto") aggiunta una luce soffusa achromatica in `body::after` (radial-gradient da `--color-surface-2` verso trasparente, fissa al viewport, niente animazione): l'idea, confermata da ricerca su risorse di design reali, è che la sensazione di "vetro luminoso" viene da una luce che cade sopra una superficie, non dalla scelta del colore in sé.
- **Bagliore ambra diffuso** (sitewide in `body::after` e quello dietro la Hero in `app/(site)/page.tsx`, introdotti nel round precedente): rimossi del tutto, sporcavano lo sfondo neutro di arancio.
- **Bagliore fisso dietro le card** (Journey/Video/Profilo/Creator, visibile anche a riposo): l'ombra ember è stata sostituita con un'ombra nera neutra normale — quella colorata stonava con la nuova luce neutra di sfondo. L'arancio resta solo nell'ombra al passaggio del mouse (hover), quello è voluto.
- **Accento `--color-ember`**: tentativi in ordine, tutti scartati da Manuel salvo l'ultimo — più saturo/vivido (letto come "AI slop", troppo neon), oro/ambra da palette collaudata (letto come giallo), arancio pieno stile "Fanta" (scartato senza motivazione esplicita). **Deciso di tornare al colore originale di partenza**, `oklch(0.769 0.155 70.5)`.
- **Lezione di metodo**: i colori derivati a mano (oklch calcolato o scala "stone" presa da una palette generica) sono stati percepiti come "arancio"/sbagliati più volte; i valori realmente stabili in questa sessione sono stati quelli achromatic (chroma zero) o il valore originale del progetto, mai un nuovo colore inventato a tavolino.
- **Idea proposta a Manuel, non ancora decisa**: costruire una "manovella" — una o due variabili CSS dedicate (es. saturazione/luminosità dell'accento) invece di un colore fisso, così un futuro cambiamento di tono richiede una sola modifica invece di toccare una decina di file. Stima data: mezza giornata di lavoro, comprende anche ripulire i file che oggi scrivono il colore per esteso invece di richiamare la variabile (necessario perché le ombre/bagliori con opacità sugli elementi arbitrari di Tailwind non possono referenziare `var(--color-ember)` con un modificatore di opacità in modo affidabile in questo progetto).

**Stato: tutto il round sopra è solo in locale, nessun commit fatto.** Prima di committare serve un'approvazione visiva esplicita di Manuel su localhost:3000 (sfondo + accento), separata dalla decisione sulla "manovella".

## Realizzato il 2026-10-07 (Regola di Movimento, `21_Motion_Guidelines.md`)

- Video nella Hero da computer: due clip di 14 secondi da "the valley" e "Swiss Alps" (2-3MB, in `public/videos/`), mute, in dissolvenza tra loro, pulsante audio in alto a destra. Su telefono resta la foto.
- La card a destra segue il video e mostra titolo e didascalia scritti dal journeyer per quell'episodio.
- Frasi a rotazione nel titolo: frase di Zero più sette citazioni, ogni 11 secondi, ognuna con la parte finale in arancione, con una dissolvenza pulita in due tempi (righe di luce, puntini e sabbia 2D sulle frasi sono stati provati e scartati).
- 2026-10-09: sfondo di sabbia dorata 3D (three.js) dietro alle card su Home, Journeys, Journeyers, profili e pagine vetrina; immagine ferma su telefono. Carattere Satoshi su tutto il sito.
- Scroll scenico sulla Hero: il video si rimpicciolisce e il testo sale mentre la pagina scorre, senza bloccarla.

## Discusso con Manuel ma non ancora realizzato

- Effetto "racconto con lo scroll" sulle pagine vetrina (How it works, What is Zero): fatto il 2026-10-09 (`components/common/ScrollStory.tsx`)
- Effetto "luce al centro della pagina": abbandonato, confermato da Manuel (2026-10-09)

## Bug segnalati, ancora aperti

- Copertine dei video sgranate: risolto (`quality` impostato a 85 su `next/image`, qualità di upload a 0.92), commit `c793d18`
- Foto dell'ultima card in una riga della Home che non cambia mai: risolto il 2026-10-13, il banner con la foto è stato sostituito dalle due card quadrate (barca a vela e How Zero works)

## Risolto (2026-10-13)

- "Manovella" colori: costruita, `--ember-l`/`--ember-c`/`--ember-h` in `app/globals.css` regolano il tono dell'arancione in un solo punto
- Card Profilo: Manuel le ha già sistemate così come sono e ne è soddisfatto — non si porta più l'effetto vetro della Hero, chiuso
- Freccia "← [Nome journeyer]'s Community": rimossa
- Logo "ZERO" nella Hero: sistemato (commit `6dbd7d3`)
