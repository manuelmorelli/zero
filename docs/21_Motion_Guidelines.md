---
title: Regola di Movimento
doc_id: 21-motion-guidelines
version: "2.0"
status: approved
related_docs:
  - 15_Design_System
  - 96_Home_Design_Refresh_Status
---

# Regola di Movimento

Approvata da Manuel il 2026-10-07, aggiornata il 2026-10-09 dopo le prove (sabbia 3D, carattere Satoshi). Il controllo automatico (`scripts/check-design.mjs`) verifica forme e colori ma non il movimento: questa regola si rispetta a mano, a ogni modifica che fa muovere qualcosa.

## Scopo

Il sito deve avere vita, ma il movimento non deve mai togliere attenzione al contenuto. Ogni movimento ha un motivo e una durata precisa.

## Durate

- **Lenta**, da 8 a 14 secondi: sfondo, sabbia, video.
- **Media**, da 0,3 a 0,9 secondi: comparse, cambi di frase, righe che salgono.
- **Rapida**, da 0,15 a 0,25 secondi: risposte ai clic e al passaggio del mouse.

## Stile

Gli elementi arrivano e rallentano (ease-out, curve decise come `cubic-bezier(0.16, 1, 0.3, 1)`). Niente rimbalzi, niente effetto elastico, niente lettere che compaiono una per una.

## La sabbia 3D (sfondo)

Lo sfondo vivo del sito è un fiume di sabbia dorata in 3D (three.js, `lib/sand/sandScene.ts`, montato da `components/common/SandBackground.tsx`), scelto da Manuel il 2026-10-09 prendendo come riferimento lusion.co e lumalabs.ai.

- Una S che scende per tutta la pagina, fissata ai contenuti: scorrendo, la curva scorre con le card mentre i granelli continuano a fluire.
- Il fiume e un alone di polvere fine stanno dietro alle card; pochi granelli grandi e sfocati passano davanti, per la profondità.
- Il mouse apre piano un varco nella sabbia (lo segue con calma, mai di scatto).
- Nessun effetto legato alla velocità dello scroll: provato e tolto su richiesta di Manuel.
- Compare su Home, Journeys, Journeyers, profili, What is Zero e How it works. Mai su Dashboard, Impostazioni, Messaggi, moduli e Player.
- Nebulose e stelle sono state provate e scartate (2026-10-09): solo sabbia.

## Quando si muove il resto

- **Alla comparsa**: una volta sola, quando l'elemento entra nello schermo, poi resta fermo.
- **In loop**: solo la sabbia e il video della Hero.
- **Cambio di frase nella Hero**: dissolvenza in due tempi, senza movimento: la frase vecchia svanisce (0,3 secondi), poi compare la nuova (0,5 secondi).
- **Legato allo scroll**: solo nella Hero e nelle pagine vetrina, solo da computer, al massimo il 30% di spostamento o riduzione. La pagina non si blocca mai.

## Vietato

- Rimbalzi, elastico, lettere che compaiono una per una.
- Testi che lampeggiano o scorrono in continuo.
- Spostare di pochi pixel un testo grande durante una dissolvenza: le lettere saltano da un pixel all'altro e sembra uno scatto.
- Sfocature animate su testi grandi o `mix-blend-mode` su livelli a tutto schermo: con video e sabbia sotto costano troppo e fanno scattare il resto.
- Granelli più piccoli di circa 2 pixel che si muovono piano: saltellano invece di scorrere.
- Movimenti sopra il testo che lo rendono difficile da leggere.
- Animazioni che bloccano i clic o lo scroll.
- Effetti di scroll su Dashboard, Impostazioni, Player e form.
- Immagini che entrano a zig zag, puntini o righe decorative che si muovono da sole, linee che sembrano una seconda barra di scorrimento.
- Arancione sfumato: l'arancione si muove solo come colore pieno.
- Effetti 2D che imitano il 3D (sabbia disegnata su canvas piatto): provati e scartati, non arrivano mai alla qualità del 3D.

## Telefono

Il più leggero possibile: niente 3D in movimento, niente video, niente effetti di scroll. Al posto della sabbia un fotogramma fermo dello stesso fiume (`public/images/sand-still.jpg`). Restano la foto della Hero e il cambio di frase.

## Chi preferisce meno movimento

Quando il telefono o il computer chiedono meno movimento: la sabbia resta ferma, nessuno scroll animato, nessun cambio automatico. Il video diventa un fotogramma fermo, la frase resta quella di Zero.

## Come è applicata oggi

- **Hero, video**: clip di 14 secondi ricavate da episodi veri e salvate nel sito (`public/videos/`, 2-3MB invece delle centinaia di MB dell'originale, elenco in `lib/discovery/heroVideos.ts`). Partono mute e si danno il cambio in dissolvenza. Il pulsante dell'audio è in alto a destra. Solo da computer.
- **Hero, card a destra**: segue il video, non le frasi. Mostra quello che il creator ha scritto sull'episodio da cui viene la clip (categoria, titolo, didascalia) e porta a quell'episodio. Su telefono segue la foto, ogni 10 secondi.
- **Hero, frasi**: la frase di Zero apre sempre, poi sette citazioni senza autore e senza trattini (`lib/landing/heroPayoffs.ts`), ognuna con la parte finale in arancione pieno. Cambiano ogni 11 secondi.
- **Hero, scroll**: mentre si scorre, il video si allontana rimpicciolendosi fino all'85% e il testo sale più in fretta.
- **What is Zero e Algorithm** (`components/common/ScrollStory.tsx`): il titolo si allontana scorrendo, i paragrafi entrano riga per riga da sotto una maschera, i riquadri arancioni salgono da sotto come il resto, passi e riquadri salgono uno dopo l'altro, la frase finale cresce arrivando al centro.
