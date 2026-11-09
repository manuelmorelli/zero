---
title: Audit Dati e Roadmap Legale
---

# Audit Dati e Roadmap Legale

Documento di lavoro per preparare i documenti legali (Privacy Policy,
Termini di Servizio, Cookie Policy, policy copyright, linee guida
community) prima del lancio pubblico. Contiene solo fatti verificati
leggendo il codice reale, non ipotesi. Va aggiornato ogni volta che
qualcosa di rilevante per questi documenti cambia nel codice.

## Come leggere questo documento

Ogni sezione = un tema legale. Per ognuna: cosa esiste oggi nel codice,
dove si trova, e cosa manca (da implementare o da chiarire prima del
lancio).

---

## 1. Dati personali raccolti

| Dato | Dove è salvato | Hash/chiaro | Visibilità |
|---|---|---|---|
| Email | `users.email` | In chiaro | Solo interna (login, contatti) |
| Password | `accounts.password` (solo per provider "credential") | Hash (gestito da Better Auth) | Mai esposta |
| Nome | `users.name` | In chiaro | Pubblica |
| Username | `users.username` | In chiaro | Pubblica |
| Bio | `users.bio` | In chiaro | Pubblica |
| Foto profilo | `users.avatarUrl` (chiave file su R2) | — | Pubblica |
| Foto di copertina | `users.coverUrl` (chiave file su R2) | — | Pubblica |
| Località | `users.location` | In chiaro | Pubblica (mostrata su `ProfileHero`) |
| Interessi (categorie scelte in Onboarding) | `users.interests` | In chiaro | Pubblica (mostrata su `AboutCard`) |
| Data di nascita | `users.dateOfBirth` | In chiaro | Solo interna (mai mostrata pubblicamente) |
| IP e User-Agent di login | `sessions.ipAddress`, `sessions.userAgent` (gestito da Better Auth) | In chiaro | Solo interna |

Campo `dateOfBirth` aggiunto il 2026-09-22 (Punto 6 dell'allineamento): richiesto in
registrazione per far rispettare l'età minima di 16 anni, controllo lato server in
`lib/auth.ts` (`databaseHooks.user.create.before`, blocca la creazione dell'account
sotto i 16 anni) oltre al controllo lato client nel modulo. Null per gli account creati
prima di questa regola, non applicata retroattivamente.

---

## 2. Servizi terzi collegati

| Servizio | Dato inviato | Stato |
|---|---|---|
| Neon (Postgres) | Tutti i dati sopra (è il database primario) | **Collegato con account reale**, usato nei test end-to-end (corretto 2026-09-17, la voce precedente "placeholder" era superata) |
| Cloudflare R2 | File binari (foto profilo/copertina, video episodi, media degli Update) via `lib/r2.ts` | **Collegato con account reale** (corretto 2026-09-17) |
| Resend | Email di reset password e verifica email (indirizzo email + nome utente), via `lib/email.ts` | **Collegato con account reale** (corretto 2026-09-17); resta da fare solo il passaggio "da test a produzione" (dominio email verificato) |
| Google Gemini | Testi e immagini da moderare (`lib/moderation.ts`), conversazioni e allegati foto/PDF della chat AI Community (`lib/ai/`) | **Collegato, piano gratuito** (dal 2026-09-25): Google può usare i dati per migliorare i suoi prodotti. Dichiarato nella Privacy Policy il 2026-09-29. L'impegno a passare al piano a pagamento prima del lancio è stato tolto dalla Privacy Policy il 9 ott 2026 (Manuel: nessuna spesa evitabile all'inizio); il passaggio resta comunque nel backlog (S7), senza scadenza legata al lancio |
| Stripe | **Nessuno**: nessuna chiamata Stripe nel codice, solo campo `stripeId` nello schema (`Payment.stripeId`) mai popolato da codice reale | Non implementato, per scelta: collegato solo appena prima del lancio online (Punto 7) |

**Nota sulla pagina `/how-it-works`**: contiene il testo "payments go through
Stripe only and your data is never shared with third parties without your
consent", che descrive lo stato a piattaforma online (Stripe collegato),
non lo stato attuale di prototipo. Decisione di Manuel (Punto 6, 2026-09-22):
**non correggere**, perché Zero è ancora un prototipo non online — il testo
diventerà vero nel momento in cui la piattaforma andrà online con Stripe già
collegato ("a tre click dall'online"), non prima.

---

## 3. Cookie e sessione

- Autenticazione gestita da **Better Auth** (`lib/auth.ts`), plugin
  `nextCookies()`: usa un cookie di sessione HTTP gestito dalla libreria
  (nessuna configurazione custom di nome/durata/flag trovata nel codice,
  quindi valgono i default di Better Auth).
- Sessioni salvate anche lato server in `sessions` (id, userId, token,
  scadenza, ipAddress, userAgent).
- **sessionStorage**: un solo uso trovato, `components/layout/OnboardingBanner.tsx`
  — salva solo se il banner "scegli i tuoi interessi" è stato chiuso per la
  sessione corrente (`onboarding-banner-dismissed:<userId>`, cambiato da
  localStorage a sessionStorage il 2026-09-22 per farlo ricomparire ad ogni
  nuovo login finché gli interessi non vengono scelti), nessun dato
  personale, nessun tracking.
- Nessun sistema di analytics/tracking di terze parti (Google Analytics,
  Meta Pixel, ecc.) trovato nel codice.

---

## 4. Contenuti caricati dagli utenti

Un utente può caricare: foto e video (episodi dei Journey, foto/video degli
Update), testo (bio, contenuti di testo negli Update, messaggi 1:1).

- **Segnalazione contenuti**: costruita nel Punto 5 dell'allineamento
  (Trust & Safety, 2026-09-21). Pulsante "Report" (`components/common/
  ReportButton.tsx`) su pagina Journey e su profilo utente — non sulle
  Update, escluse volutamente da Manuel perché spariscono da sole entro
  24h. Scrive nel modello `Report` già esistente
  (`lib/actions/report.ts`), con una mail di avviso a
  `ADMIN_NOTIFICATION_EMAIL` (via Resend, oggi disattivato: l'avviso resta
  visibile solo nei log del server finché Resend non viene riattivato).
  Nessun pannello di gestione: le segnalazioni si vedono/chiudono da
  Prisma Studio.
- **Primo filtro automatico**, costruito nello stesso punto
  (`lib/moderation.ts`): controlla testo e immagini appena caricati,
  prima che vengano pubblicati. Copre bio, titoli/descrizioni di Journey/
  Episodi, testo delle Update, contenuti Community e le immagini caricate.
  Non copre i video, esclusi dalla moderazione automatica. Attivo su
  Google Gemini dal 2026-09-25 (in precedenza OpenAI), fa parte del Launch:
  vedi `docs/94_Product_Backlog.md`.

---

## 5. Cancellazione dati

Implementata il 2026-08-27 (`lib/account/deletion.ts`), dentro "Edit
Profile" → "Delete my account" (`components/profile/DeleteAccountSection.tsx`),
dietro conferma esplicita.

- **Periodo di grazia**: 10 giorni (`ACCOUNT_DELETION_GRACE_PERIOD_MS`).
  Alla richiesta, `User.deletedAt` e `Creator.deletedAt` (se esiste) vengono
  valorizzati subito — l'account sparisce da ricerca persone, profilo
  pubblico (404), liste Followers/Following e da tutta la Discovery
  (che già filtrava su `Creator.deletedAt`/`Journey.deletedAt`) — e
  `User.scheduledDeletionAt` viene fissato a +10 giorni. L'utente viene
  disconnesso subito dopo la richiesta.
- **Riattivazione**: se l'utente rifà login entro i 10 giorni, ogni pagina
  protetta (`requireSession()`) e ogni pagina ibrida pubblica/privata
  (`getViewerSession()`, usata da Home, profilo, pagine Journey/Episodio,
  Discovery) lo dirotta su `/reactivate-account` invece di lasciarlo
  entrare normalmente. Da lì può annullare la cancellazione con un click
  (`reactivateAccount`), che azzera `deletedAt`/`scheduledDeletionAt`.
- **Cancellazione definitiva**: un vero cron job giornaliero
  (`vercel.json` → `app/api/cron/purge-accounts`, protetto da
  `CRON_SECRET`) chiama `purgeExpiredAccounts()`, che cancella per
  sempre ogni account il cui `scheduledDeletionAt` è passato — Journey,
  Capitoli, Episodi, Update, Conversazioni/Messaggi, Follow, Like,
  Notifiche, voti/risposte/reazioni, e i media collegati su Cloudflare
  R2 (video episodi, foto profilo/copertina, media degli Update).
  Nessun residuo tipo "account eliminato" lasciato tra i contenuti di
  altri utenti: una conversazione con la persona cancellata sparisce
  anche dal lato dell'altro partecipante, non solo dal proprio.
- **Pagamenti (Purchase/Tip/Payment)**: cancellati anch'essi per ora,
  insieme al resto — decisione presa con Manuel il 2026-08-27. Stripe
  non è ancora collegato, quindi oggi queste righe non rappresentano
  denaro reale. **Da rivedere quando Stripe verrà davvero collegato**:
  a quel punto cancellarle del tutto potrebbe non essere corretto per
  motivi fiscali/legali (un incasso reale di un journeyer non dovrebbe
  sparire dalla sua contabilità solo perché chi ha pagato cancella
  l'account) — probabilmente andranno anonimizzate (scollegate
  dall'utente ma mantenute in forma aggregata) invece che cancellate.
  Punto ancora aperto, non deciso definitivamente.

---

## 6. Minori

**Età minima di 16 anni, implementata il 2026-09-22 (Punto 6 dell'allineamento).**
Il modulo di registrazione (`app/register/page.tsx`) chiede la data di
nascita e blocca l'invio sotto i 16 anni lato client; il controllo reale è
lato server in `lib/auth.ts` (`databaseHooks.user.create.before`), che
rifiuta la creazione dell'account indipendentemente dal client. Controllo
"a dichiarazione" (l'utente scrive la propria data), non con documento
d'identità: proporzionato per una piattaforma di queste dimensioni, in
linea con l'età di base fissata dal GDPR (Art. 8) per evitare la gestione
del consenso dei genitori. Non retroattivo: gli account creati prima hanno
`dateOfBirth` null.

---

## 7. Requisiti per diventare journeyer

**Implementato il 2026-09-22 (Punto 6 dell'allineamento).** Prima non esisteva alcun
requisito: `requireCreator()` (`lib/creator.ts`) crea il profilo Journeyer al volo e
chiunque poteva pubblicare un Journey/Episodio senza aver mai compilato il profilo,
caricato un video di presentazione o letto le regole della piattaforma.

Ora, prima di poter pubblicare per la prima volta (Dashboard o flusso rapido "+"),
`getPublishReadiness()` (`lib/creator.ts`) verifica tre requisiti insieme, tutti
obbligatori:

- **Profilo compilato**: nome utente, foto profilo e bio, tutti e tre valorizzati.
- **Video di presentazione**: `Creator.presentationVideoUrl` valorizzato (stesso
  campo che attiva il Trust Score, vedi sezione Trust & Safety del Punto 5).
- **Community Guidelines accettate**: nuovo campo `Creator.guidelinesAcceptedAt`,
  valorizzato solo dopo che l'utente ha scrollato fino in fondo alla pagina
  `/community-guidelines` e spuntato la casella di accettazione
  (`components/common/GuidelinesAcceptance.tsx`).

Se manca anche un solo requisito, la pubblicazione viene bloccata con un messaggio
che elenca esattamente cosa manca (non un errore generico). Il controllo scatta solo
al momento in cui un contenuto diventa davvero pubblico (`publishJourney`,
`insertEpisode`/`createEpisode`/il flusso rapido, e `updateEpisode` solo alla prima
pubblicazione di un episodio, mai su una modifica di contenuto già pubblicato):
salvare in Bozza resta sempre libero.

**Riguarda solo chi vuole diventare journeyer**, mai i visitatori/spettatori: guardare,
condividere un link, restano completamente liberi senza account, coerente con
YouTube (ricerca aggiornata 2026: like/commenti/iscrizioni richiedono login, guardare
e condividere no).

**Nessun grandfathering**: la regola vale anche per gli account journeyer già
esistenti (creati prima di questa funzione), incluso quello di Manuel — non è stato
marcato "già accettato" retroattivamente per nessuno.

---

## 8. Moderazione: chi controlla le segnalazioni e cosa fare in caso di materiale di abuso su minori

**Deciso l'8 nov 2026 (Punto 6 dell'allineamento, S35).** Prima di questa decisione il pannello
`/admin/reports` permetteva solo di chiudere una segnalazione (`setReportStatus`), senza mai
nascondere il contenuto segnalato né l'account che lo ha pubblicato: un contenuto grave poteva
restare visibile per ore. Aggiunte due azioni nuove in `lib/actions/adminReports.ts`:

- **`hideReportedContent`** — nasconde subito il contenuto (Journey/Episodio/Commento,
  stesso campo `deletedAt` già usato ovunque un contenuto viene nascosto nel sito). Reversibile
  (`unhideReportedContent`). Non cancella nulla: il contenuto resta nel database/su R2, solo non
  più visibile al pubblico.
- **`banReportedAccount`** — risale all'account che ha pubblicato il contenuto segnalato (qualunque
  sia il tipo di segnalazione) e lo banna (`User.status = BANNED`): la persona viene disconnessa e
  non può più accedere (`lib/session.ts` la rimanda su `/account-suspended` a ogni tentativo).
  Reversibile (`unbanReportedAccount`). Il campo `AccountStatus` esisteva già nello schema dal primo
  audit ma non era mai stato collegato a nessuna azione reale fino a oggi.

### Chi controlla le segnalazioni ogni giorno

**Oggi: solo Manuel**, una volta al giorno, da `/admin/reports` (accessibile da computer e da
telefono, stesso account). Non c'è nessun altro admin. Quando si aggiungerà una seconda persona al
team, va deciso chi controlla quali giorni e aggiunta la sua email a `ADMIN_EMAILS`.

### Protocollo specifico — materiale di abuso su minori (CSAM)

Questo è il caso più grave possibile su una piattaforma con contenuti video: va trattato diverso da
una segnalazione normale.

1. **Non scaricare, non salvare, non condividere, non reinviare il contenuto a nessuno** (nemmeno
   per "farlo vedere a qualcuno per conferma") e guardarlo il minimo indispensabile solo per capire
   di cosa si tratta.
2. **Nascondere subito** il contenuto con il tasto "Nascondi subito": sparisce dal sito, ma resta
   salvato (non va cancellato definitivamente: può servire come prova all'autorità).
3. **Bannare subito l'account** con il tasto "Banna l'account".
4. **Segnalare alla Polizia Postale — Centro Nazionale per il Contrasto alla Pedopornografia Online
   (CNCPO)**: online su `commissariatodips.it` (sezione dedicata alla pedopornografia online), o di
   persona in un qualsiasi commissariato. Se c'è un rischio immediato e in corso per un minore,
   chiamare anche il 114 (Emergenza Infanzia) o il 112.
5. **Annotare un log privato** (data, ID della segnalazione, azioni fatte, se e quando segnalato
   alla Polizia Postale), conservato fuori dal sito — mai descrivere il contenuto stesso nel log.

**Nota legale aperta:** oggi Zero non ha un'entità legale registrata (vedi `100_Verso_Online.md`),
quindi l'obbligo di segnalazione previsto dalla legge italiana (L. 269/1998) grava su Manuel come
persona fisica che gestisce il sito. Da rivedere quando si registrerà una società.

---

## 9. Piano scritto per una fuga di dati (data breach)

**Scritto l'8 nov 2026 (Punto 6 dell'allineamento, S35).** Il GDPR (Art. 33 e 34) obbliga chi
gestisce dati personali ad avere un piano pronto *prima* che succeda un incidente, non da
inventare al momento. Oggi questo piano non esisteva in nessuna forma scritta: questa sezione lo
crea.

### Cos'è una "fuga di dati" per Zero

Qualsiasi evento che porta alla distruzione, perdita, modifica, divulgazione o accesso non
autorizzato ai dati personali degli utenti (vedi tabella al punto 1). Esempi concreti per
l'infrastruttura reale di Zero:

- Accesso non autorizzato al database Neon (es. credenziali `DATABASE_URL` rubate o esposte).
- Accesso non autorizzato al bucket Cloudflare R2 (foto profilo/copertina, video episodi, media
  degli Update diventano scaricabili da chi non dovrebbe).
- Falla in Better Auth o in `lib/session.ts` che permette di entrare nell'account di un altro
  utente, o furto di sessioni (`sessions.token`).
- Chiave API di Resend o di Google Gemini compromessa, usata per leggere email o conversazioni
  non proprie.
- Un bug nel codice che mostra dati privati di un utente a un altro (es. email, data di nascita)
  invece che solo i dati pubblici previsti.

### Chi è responsabile di questo piano

**Oggi: solo Manuel**, stessa situazione del punto 8. Zero non ha ancora un'entità legale
registrata (vedi `100_Verso_Online.md`): gli obblighi GDPR gravano su Manuel come persona fisica
che gestisce il trattamento dei dati. Da rivedere quando si registrerà una società (a quel punto
andrà anche nominato se serve un DPO, improbabile per le dimensioni attuali di Zero).

### I passi da seguire quando si scopre una possibile fuga di dati

1. **Contenere subito.** In base a cosa è stato compromesso:
   - Credenziali database/API esposte → ruotarle immediatamente (rigenerare `DATABASE_URL` su
     Neon, le chiavi R2, la API key Resend o Gemini, a seconda del caso) e invalidare quelle
     vecchie.
   - Bug nel codice che espone dati → disabilitare la funzione o pagina coinvolta (es. tramite
     variabile d'ambiente, come già si fa per `MOMENTS_LIBRARY_ENABLED`) finché non è corretta.
   - Sessioni compromesse → forzare il logout di tutte le sessioni dell'utente coinvolto
     cancellando le sue righe in `sessions`.
2. **Capire cosa è successo**, prima di scrivere qualsiasi comunicazione:
   - Quali dati sono coinvolti (solo email? anche password/foto/video? dati di minori?).
   - Quanti utenti sono coinvolti (uno, un gruppo, tutti).
   - Da quando è in corso l'esposizione (log di Neon/R2/Resend/Vercel, se disponibili).
   - Il problema è già stato chiuso o è ancora attivo.
3. **Annotare tutto in un log privato** (data e ora della scoperta, cosa è successo, dati
   coinvolti, numero di utenti, azioni di contenimento fatte, con orari) conservato fuori dal
   sito. **Questo log va tenuto sempre**, anche per gli incidenti che poi si decide di non
   notificare al Garante: l'Art. 33(5) del GDPR obbliga a documentare ogni fuga di dati, non solo
   quelle notificate.
4. **Decidere se notificare il Garante Privacy, entro 72 ore dalla scoperta** (non dall'inizio
   dell'incidente). Obbligatorio **a meno che** sia improbabile che la fuga comporti un rischio
   per i diritti e le libertà delle persone coinvolte (es. un file già pubblico, o dati cifrati
   dove la chiave non è stata compromessa). In caso di dubbio, notificare: il rischio di non
   notificare quando serviva è molto peggiore. Si fa online su `gpdp.it` (sezione "Violazioni di
   dati personali / Data breach"), con un modulo che chiede: natura della violazione, categorie e
   numero approssimativo di persone/dati coinvolti, conseguenze probabili, misure adottate o
   proposte.
5. **Decidere se avvisare anche gli utenti coinvolti direttamente** (Art. 34), obbligatorio
   quando il rischio per loro è **alto** (es. password o dati di minori esposti, non solo
   nome/bio già pubblici). Canale: email via Resend agli utenti coinvolti (non un annuncio
   generico sul sito, a meno che l'email non sia disponibile o servirebbe uno sforzo
   sproporzionato). Il messaggio deve dire, in linguaggio semplice: cosa è successo, quali dati
   sono coinvolti, cosa rischiano, cosa hanno già fatto per risolvere, cosa possono fare loro
   (es. "cambia la password" se le password sono a rischio anche se sono hashate).
6. **Dopo la chiusura dell'incidente**: capire la causa reale e correggerla nel codice (non solo
   tamponare), e aggiornare questa sezione se l'incidente rivela che il piano aveva un buco.

### Cosa NON fare

- Non aspettare di avere "tutte le informazioni" prima di notificare: il modulo del Garante
  accetta anche notifiche parziali da completare dopo, le 72 ore partono dalla scoperta
  dell'incidente, non da quando si ha il quadro completo.
- Non minimizzare nelle comunicazioni agli utenti: devono poter valutare da soli il rischio.
- Non cancellare log o prove dell'incidente per "pulizia": servono per la notifica e per capire
  la causa.

**Nota:** questo piano è interno (processo operativo per Manuel), non una pagina pubblica. La
Privacy Policy pubblica (`app/(site)/privacy/page.tsx`) non descrive oggi questo impegno in modo
esplicito: valutare se aggiungere una riga breve ("in caso di violazione dei dati, vi avviseremo
come richiesto dalla legge") prima del lancio pubblico — vedi roadmap sotto.

---

## Roadmap — cosa manca prima del lancio pubblico

Da tracciare e aggiornare man mano che si decide/implementa:

- [x] Cancellazione account (vedi sezione 5 sopra) — implementata 2026-08-27.
- [ ] Quando Stripe verrà collegato: rivedere se Purchase/Tip/Payment
      vanno anonimizzati invece che cancellati alla cancellazione
      dell'account (vedi sezione 5).
- [x] Controllo età minima in registrazione — implementato 2026-09-22
      (Punto 6 dell'allineamento), vedi sezione 6 sopra.
- [x] Collegare il modello `Report` a una funzione reale — fatto nel
      Punto 5 dell'allineamento (2026-09-21), vedi sezione 4 sopra.
- [x] Testo su Stripe in `/how-it-works` — deciso di **non correggerlo**
      (Punto 6, 2026-09-22): descrive lo stato a piattaforma online, non
      il prototipo di oggi, e diventerà vero quando Stripe sarà collegato.
- [x] Privacy Policy, Termini di Servizio, Cookie Policy — contenuto vero
      scritto il 2026-09-22 (Punto 6), sostituisce le pagine "Coming soon".
      Nessun banner cookie necessario: Zero usa solo cookie tecnici.
- [x] Content Policy dettagliata (28 categorie di contenuto vietato/limitato,
      da un documento scritto da Manuel) integrata nelle Community
      Guidelines pubbliche, 2026-09-22, con evidenza grafica per le
      categorie a tolleranza zero (minori, incitamento alla violenza,
      autolesionismo/suicidio). Il filtro automatico (`lib/moderation.ts`) è
      già attivo su Gemini; le sue istruzioni sono una sintesi di queste
      regole e vanno riallineate se le regole cambiano.
- [ ] Nessun canale di contatto reale oggi (`/contact` è ancora "Coming
      soon"): Privacy Policy e Termini rimandano al Report per richieste
      sui dati, da collegare a un indirizzo vero prima del lancio.
- [ ] Nessuna entità legale registrata dietro Zero oggi: i Termini di
      Servizio lo dichiarano esplicitamente, da aggiornare con il nome
      dell'entità e la giurisdizione prima del lancio.
- [ ] Quando Neon/R2/Resend/Stripe verranno effettivamente collegati in
      produzione, verificare se cambia il tipo di dato inviato ai
      fornitori (es. Stripe riceverebbe dati di pagamento) e aggiornare
      Privacy Policy di conseguenza.
- [x] Gemini al piano a pagamento (S7): non è più legato al lancio.
      Decisione di Manuel (9 ott 2026): nessuna spesa evitabile
      all'inizio. La promessa "prima del lancio" è stata tolta dalla
      Privacy Policy; il passaggio a pagamento resta nel backlog
      (`94_Product_Backlog.md`), nell'ultimo passaggio insieme agli
      altri lavori che costano soldi.
- [x] Requisiti per diventare journeyer (profilo compilato, video di
      presentazione, Community Guidelines accettate) — implementato
      2026-09-22 (Punto 6), vedi sezione 7 sopra.
- [x] Piano scritto per una fuga di dati (data breach), richiesto dal
      GDPR — scritto l'8 nov 2026 (Punto 6), vedi sezione 9 sopra.
      Aggiunta anche una riga breve nella Privacy Policy pubblica
      (`app/(site)/privacy/page.tsx`, sezione "If something goes
      wrong") sull'impegno a notificare entro 72 ore / gli utenti in
      caso di rischio alto.

---

## Log aggiornamenti di questa sessione

- 2026-08-21 — Primo audit dati/servizi terzi per i documenti legali
  (Privacy Policy, ToS, Cookie Policy, copyright, community guidelines).
  Solo lettura del codice, nessuna modifica applicata.
- 2026-08-27 — Implementata la cancellazione account (vedi sezione 5):
  periodo di grazia di 10 giorni, riattivazione al login, cron
  giornaliero per la cancellazione definitiva completa (media R2
  compresi). Pagamenti (Purchase/Tip/Payment) cancellati anch'essi per
  ora — da rivedere quando Stripe sarà collegato davvero.
- 2026-09-21 — Punto 5 dell'allineamento (Trust & Safety): collegata la
  segnalazione contenuti (modello `Report` già esistente) a un pulsante
  reale su Journey e profilo, aggiunto un primo filtro automatico su
  testo/immagini (OpenAI, codice pronto ma tenuto spento perché
  attivarlo richiede una spesa reale, minima ma vera, non solo un
  account gratuito), e scritto contenuto vero per Community Guidelines
  e Copyright & Report
  Content (prima erano pagine "Coming soon"). Controllo età minima
  confermato ancora rimandato al Punto 6.
- 2026-09-22 — Punto 6 dell'allineamento (Legale): aggiunto il campo
  `dateOfBirth` e il controllo età minima 16 anni in registrazione
  (client + server, `lib/auth.ts`); scritto contenuto vero per Privacy
  Policy, Termini di Servizio e Cookie Policy (prima "Coming soon");
  integrata nelle Community Guidelines una Content Policy dettagliata
  a 28 categorie fornita da Manuel, con evidenza grafica per le
  categorie a tolleranza zero. Corretta anche questa pagina: Neon/R2/
  Resend erano già segnati "non collegati", in realtà collegati con
  account reali dal Punto 0 (2026-09-17), scostamento mai corretto qui
  finora. Deciso di non correggere il testo su Stripe in
  `/how-it-works` (descrive lo stato a piattaforma online, non il
  prototipo di oggi). Più avanti nella stessa sessione, aggiunti i
  requisiti per diventare journeyer (profilo compilato, video di
  presentazione, Community Guidelines accettate, tutti obbligatori
  insieme prima di poter pubblicare, nessun grandfathering) — vedi
  sezione 7.

- 2026-10-05 — Allineamento delle decisioni AI al perimetro di Launch.
  Il primo filtro automatico su testo e immagini è su Google Gemini (non
  più OpenAI) e fa parte del Launch; la chat AI della Community fa parte
  del Launch; le immagini AI e la Mappa dei Momenti sono Post-MVP; il
  passaggio di Gemini al piano a pagamento è da fare prima del lancio
  pubblico. Video esclusi dalla moderazione automatica.
- 2026-10-09 — Tolta dalla Privacy Policy la promessa di passare Gemini
  al piano a pagamento prima del lancio pubblico: decisione di Manuel,
  che vuole spendere il meno possibile su tutti i fronti all'apertura
  del sito. Il passaggio a pagamento resta nel backlog (S7), senza più
  una scadenza legata al lancio.
- 2026-11-08 — Punto 6 dell'allineamento (S35): deciso che per ora
  controlla le segnalazioni solo Manuel, ogni giorno. Scritto il
  protocollo per il materiale di abuso su minori (sezione 8 sopra).
  Costruite le due azioni che il protocollo richiede e che prima non
  esistevano: nascondere subito un contenuto segnalato
  (`hideReportedContent`/`unhideReportedContent`, reversibile) e
  bannare l'account collegato (`banReportedAccount`/
  `unbanReportedAccount`, reversibile) — quest'ultima usa il campo
  `User.status` che esisteva già nello schema ma non era mai collegato
  a nessuna azione reale. Nuova pagina `/account-suspended` e controllo
  in `lib/session.ts` per bloccare l'accesso a un account bannato.
- 2026-11-08 — Punto 6 dell'allineamento (S35), stessa sessione: scritto
  il piano interno per una fuga di dati richiesto dal GDPR (sezione 9
  sopra) — procedura passo per passo per contenere l'incidente, capire
  cosa è successo, tenere un log privato obbligatorio (Art. 33(5)),
  decidere se notificare il Garante entro 72 ore (Art. 33) e se avvisare
  direttamente gli utenti coinvolti in caso di rischio alto (Art. 34),
  specifica per l'infrastruttura reale di Zero (Neon, R2, Resend,
  Gemini, Better Auth). Aggiunta anche una riga breve nella Privacy
  Policy pubblica (sezione "If something goes wrong") sull'impegno a
  notificare entro 72 ore / gli utenti in caso di rischio alto.
