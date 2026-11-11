---
title: Verso l'online
doc_id: 100-verso-online
version: "1.0"
status: living
related_docs:
  - 91_Legal_Audit_And_Roadmap
  - 94_Product_Backlog
---

# Verso l'online

Questo documento è scritto per Manuel, in italiano semplice, senza termini tecnici. Dice a che punto siamo per portare Zero online, almeno come beta privata su invito per poche persone scelte da lui. Si aggiorna ogni volta che qualcosa di questa lista cambia. Se perdi una chat con Claude, puoi aprire questo file e leggerlo direttamente, oppure aprire una chat nuova e scrivere "a che punto siamo con Zero".

## Fatto

- **Controllo di sicurezza di tutto il sito** (30 ott 2026): nessuna falla seria. Nessuno può leggere o modificare dati di un altro utente, i lavori automatici del sito sono protetti da password segrete, il pannello di amministrazione è blindato, gli upload controllano tipo e dimensione del file. Tre piccole cose da migliorare con calma, non urgenti, elencate in `94_Product_Backlog.md` (voce S22).
- **Cancello d'ingresso a codice, attivo sul sito vero** (pronto nel codice dal 30 ott 2026, acceso su Vercel l'11 nov 2026): chi non ha il codice che dai tu non entra nel sito.
- **Registrazioni chiuse sul sito vero** (acceso su Vercel l'11 nov 2026): chi entra con il codice può solo navigare e guardare i video già pubblicati, non può crearsi un account, quindi nemmeno pubblicare o caricare video. Tu continui ad accedere normalmente con il tuo account.
- **Controllo automatico che il codice non si rompa** (30 ott 2026): da ora, ogni volta che il codice viene modificato, un servizio gratuito di GitHub lo controlla da solo e segnala se qualcosa non va, prima che arrivi online.
- **Test automatici che aprono il sito vero e controllano che funzioni davvero** (30 ott 2026): registrarsi, entrare, guardare un video, seguire una persona, pubblicare un Journey. Girano in locale sul tuo computer con il comando `npm run test:e2e`; manca ancora collegarli al controllo automatico di GitHub (serve un database "di prova" separato da quello vero, da decidere insieme quando serve).
- **Pannello segnalazioni che nasconde davvero** (8 nov 2026): "Nascondi subito" (contenuto) e "Banna l'account" (persona), entrambi reversibili, da computer e da telefono. Deciso chi controlla (solo tu, per ora) e scritto cosa fare nel caso più grave (materiale di abuso su minori).
- **Frase sulla musica nella pagina Copyright** (8 nov 2026).
- **Accordi sul trattamento dati con i fornitori** (8 nov 2026): controllati Neon, Cloudflare, Resend; già inclusi nei loro termini di servizio, nulla da firmare a parte. Google si sistema da sé quando Gemini passa al piano a pagamento.
- **Piano scritto per una fuga di dati** (8 nov 2026): procedura passo per passo, in `91_Legal_Audit_And_Roadmap.md`.
- **Avviso automatico se il sito va giù** (riconfermato sul dominio vero l'11 nov 2026): UptimeRobot attivo su `https://www.zerojourneys.com/api/health`, avviso via email, piano gratuito.

## Fatto (dominio online)

- **Dominio collegato** (10 nov 2026): zerojourneys.com è online su Vercel.
- **Chiavi vere spostate** (database, foto/video, email, AI) dal computer a Vercel, nel suo pannello protetto.
- Ora si può invitare la prima persona (cancello a codice già attivo, vedi sopra).

## Cose note, lasciate così per scelta

- **Nessuna entità legale registrata dietro Zero**: per un gruppo chiuso di persone che inviti tu di persona il rischio è basso. Da registrare prima di aprire al pubblico vero.

## Audit a 360 gradi (7 nov 2026)

Hai chiesto un controllo completo, non solo tecnico: sicurezza informatica, sicurezza delle persone (minori/contenuti), legale (musica nei video), infrastruttura, costi, prodotto. Dettaglio per punto in `94_Product_Backlog.md` (voci S33-S42). Riassunto:

- **Librerie di sicurezza**: aggiornate il 10 nov 2026 (`better-auth` 1.7.20, `prisma` 7.10.1), riverificato con `npm audit` l'11 nov 2026, nessuna vulnerabilità critica o alta.
- **Intestazioni di sicurezza** (HSTS, anti-clickjacking, ecc.): aggiunte il 10 nov 2026. Manca ancora una vera CSP, da valutare con calma, non urgente.
- **Tutti e sei i punti "prima di invitare qualcuno fuori dagli amici più stretti" sono risolti l'8 nov 2026** (pannello segnalazioni, chi controlla, musica, avviso sito giù, piano fuga dati, accordi fornitori): dettaglio nella sezione "Fatto" sopra.
- **Email**: funzionano anche sul sito vero con il dominio collegato, riverificato l'11 nov 2026 con un reset password reale arrivato a destinazione. (Attenzione se si ritesta la registrazione con un'email già usata, anche solo in locale: per sicurezza anti-enumerazione Better Auth finge un successo senza mandare nulla, non è un guasto.)
- **Il resto** (analytics, indirizzamento Google/SEO, cache per velocità, indici del database) riguarda la crescita dopo il lancio, non accendere il sito: nessuna di queste cose impedisce di iniziare con un piccolo gruppo di persone fidate.

## Confronto mobile vs computer (8 nov 2026)

Controllo completo, pagina per pagina (49 pagine), di tutto il sito a telefono e a computer: stessi bottoni, stesse scritte ovunque, nessun contenuto mancante sul telefono. Una sola differenza vera trovata: nella Home da telefono manca il titolo e i due bottoni principali che ci sono da computer, nella parte alta sopra la foto. Dettaglio in `94_Product_Backlog.md` (S45-S46).

## Perché il sito oggi "sembra lento" e cosa farci

Oggi il sito gira su un computer normale, in modalità sviluppo (quella che ricompila il codice a ogni modifica): è normale che sembri più lento di un sito vero online. Appena si collega a Vercel (punto già in lista sopra), gran parte della lentezza sparisce da sola, perché Vercel distribuisce le pagine da server vicini a chi naviga invece che da un solo computer. Oltre a questo, tre cose concrete, nessuna urgente oggi:

1. **Le foto si "ripagano" ad ogni pagina** (S42): ogni volta che qualcuno apre una pagina, il sito richiede di nuovo il permesso per mostrare la stessa identica foto, invece di riusare quello di prima. Soluzione semplice: far durare quel permesso più a lungo (da un'ora a un giorno). Qualche ora di lavoro, nessun rischio.
2. **Nessuna "memoria veloce" sulle pagine più visitate** (S40): ogni visita a Home/Discover rifà tutte le domande al database da zero, anche se il contenuto non è cambiato da un minuto all'altro. Si può far "ricordare" al sito la risposta per qualche secondo/minuto. Da fare quando gli utenti aumentano, non ora.
3. **Database senza scorciatoie per le ricerche future** (S41): oggi con poche centinaia di Journey non si sente, ma se arrivano migliaia di Journey le ricerche possono rallentare. Si aggiunge una "scorciatoia" (indice) al database quando serve davvero.

Nessuna di queste tre impedisce di andare online con un primo gruppo di persone: sono manutenzione per quando il traffico cresce, non blocchi.
