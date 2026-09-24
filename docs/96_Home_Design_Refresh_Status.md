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
- Card (Journey, Video, Profilo, Creator) con bagliore ambra visibile anche a riposo, non solo in hover
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

## Discusso con Manuel ma non ancora realizzato

- Video al posto della foto statica nella Hero (stile Netflix, anteprima muta in loop) — confermato tecnicamente fattibile via R2, mai iniziato
- Righe di luce animate con puntini che le percorrono (riferimento: esempi v0.app mostrati da Manuel) — solo discusso
- Effetto "racconto con lo scroll" tipo template Evasion (parallasse, immagini che si muovono con lo scroll) su Hero e pagine vetrina (How it works, What is Zero) — mai iniziato
- Estendere lo stesso trattamento (bagliori, colori più vivi) alle altre pagine oltre la Home (Journey, Profilo, Dashboard, Player) — messo in pausa per concentrarsi sulla Home

## Bug segnalati, ancora aperti

- Copertine dei video sgranate: causa diagnosticata (doppia compressione lato client + `quality` non impostato su `next/image` nelle card), correzione mai applicata su richiesta esplicita di Manuel ("poi sistemiamo il bug")
- Header percepito "più lungo del dovuto" se non si scrolla: investigato, non riprodotto (altezza identica misurata prima/dopo scroll), serve uno screenshot di Manuel nel momento esatto in cui lo nota
- Foto dell'ultima card in una riga della Home che non cambia mai: segnalato, non ancora controllato

## Prossimi passi aperti (in discussione)

- Cambiare di nuovo il colore di sfondo del sito (dettagli da definire con Manuel)
- Riprovare un effetto "luce al centro della pagina", perso durante il consolidamento dei due sistemi di bagliore sovrapposti
