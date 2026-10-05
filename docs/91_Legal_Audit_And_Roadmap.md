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
| Google Gemini | Testi e immagini da moderare (`lib/moderation.ts`), conversazioni e allegati foto/PDF della chat AI Community (`lib/ai/`) | **Collegato, piano gratuito** (dal 2026-09-25): Google può usare i dati per migliorare i suoi prodotti. Dichiarato nella Privacy Policy il 2026-09-29, con l'impegno a passare al piano a pagamento prima del lancio |
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
  motivi fiscali/legali (un incasso reale di un creator non dovrebbe
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

## 7. Requisiti per diventare creator

**Implementato il 2026-09-22 (Punto 6 dell'allineamento).** Prima non esisteva alcun
requisito: `requireCreator()` (`lib/creator.ts`) crea il profilo Creator al volo e
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

**Riguarda solo chi vuole diventare creator**, mai i visitatori/spettatori: guardare,
condividere un link, restano completamente liberi senza account, coerente con
YouTube (ricerca aggiornata 2026: like/commenti/iscrizioni richiedono login, guardare
e condividere no).

**Nessun grandfathering**: la regola vale anche per gli account creator già
esistenti (creati prima di questa funzione), incluso quello di Manuel — non è stato
marcato "già accettato" retroattivamente per nessuno.

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
- [ ] Gemini al piano a pagamento (S7, PRE-LAUNCH): da fare prima del
      lancio pubblico, come promesso nella Privacy Policy.
- [x] Requisiti per diventare creator (profilo compilato, video di
      presentazione, Community Guidelines accettate) — implementato
      2026-09-22 (Punto 6), vedi sezione 7 sopra.

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
  requisiti per diventare creator (profilo compilato, video di
  presentazione, Community Guidelines accettate, tutti obbligatori
  insieme prima di poter pubblicare, nessun grandfathering) — vedi
  sezione 7.

- 2026-10-05 — Allineamento delle decisioni AI al perimetro di Launch.
  Il primo filtro automatico su testo e immagini è su Google Gemini (non
  più OpenAI) e fa parte del Launch; la chat AI della Community fa parte
  del Launch; le immagini AI e la Mappa dei Momenti sono Post-MVP; il
  passaggio di Gemini al piano a pagamento è da fare prima del lancio
  pubblico. Video esclusi dalla moderazione automatica.
