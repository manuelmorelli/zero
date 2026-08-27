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
| Data di nascita | **Non esiste nello schema** | — | — |
| IP e User-Agent di login | `sessions.ipAddress`, `sessions.userAgent` (gestito da Better Auth) | In chiaro | Solo interna |

Nessun campo data di nascita/età esiste nel database (`prisma/schema.prisma`).

---

## 2. Servizi terzi collegati

| Servizio | Dato inviato | Stato |
|---|---|---|
| Neon (Postgres) | Tutti i dati sopra (è il database primario) | Configurato ma non ancora collegato (placeholder in `.env`) |
| Cloudflare R2 | File binari (foto profilo/copertina, video episodi, media degli Update) via `lib/r2.ts` | Configurato ma non ancora collegato |
| Resend | Email di reset password e verifica email (indirizzo email + nome utente), via `lib/email.ts` | Configurato ma non ancora collegato; senza `RESEND_API_KEY` il contenuto viene solo stampato in console (dev) |
| Stripe | **Nessuno**: nessuna chiamata Stripe nel codice, solo campo `stripeId` nello schema (`Payment.stripeId`) mai popolato da codice reale | Non implementato |

**Nota importante per la Privacy Policy**: la pagina `/how-it-works`
(`app/how-it-works/page.tsx`) contiene oggi il testo "payments go through
Stripe only and your data is never shared with third parties without your
consent" — è una dichiarazione di prodotto/marketing, non riflette codice
funzionante (i pagamenti non sono implementati). Da allineare prima del
lancio, o correggere il testo o implementare Stripe.

---

## 3. Cookie e sessione

- Autenticazione gestita da **Better Auth** (`lib/auth.ts`), plugin
  `nextCookies()`: usa un cookie di sessione HTTP gestito dalla libreria
  (nessuna configurazione custom di nome/durata/flag trovata nel codice,
  quindi valgono i default di Better Auth).
- Sessioni salvate anche lato server in `sessions` (id, userId, token,
  scadenza, ipAddress, userAgent).
- **localStorage**: un solo uso trovato, `components/layout/OnboardingBanner.tsx`
  — salva solo se il banner "completa il tuo profilo" è stato chiuso
  (`onboarding-banner-dismissed:<userId>`), nessun dato personale, nessun
  tracking.
- Nessun sistema di analytics/tracking di terze parti (Google Analytics,
  Meta Pixel, ecc.) trovato nel codice.

---

## 4. Contenuti caricati dagli utenti

Un utente può caricare: foto e video (episodi dei Journey, foto/video degli
Update), testo (bio, contenuti di testo negli Update, messaggi 1:1).

- **Segnalazione contenuti**: il modello `Report` esiste nello schema
  (`prisma/schema.prisma`, con `targetType`: USER/CREATOR/JOURNEY/UPDATE/
  COMMENT) ma **non è collegato a nessuna funzione utente reale oggi**.
  L'unico punto del codice che lo usa è `lib/profile/trustScore.ts`, e solo
  in lettura (`prisma.report.count(...)`) per calcolare il Trust Score di
  un creator — presuppone che righe `Report` esistano già, ma **non esiste
  nel codice alcun modo per un utente di crearne una** (nessun form, nessun
  pulsante "segnala", nessuna server action di creazione).
- Non esiste quindi oggi alcun meccanismo utilizzabile per segnalare una
  violazione di copyright o un contenuto inappropriato.

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

**Non esiste oggi nessun controllo sull'età minima per registrarsi.** Il
flusso di registrazione (`emailAndPassword` in `lib/auth.ts`) richiede solo
email, password e verifica email; non è previsto nessun campo data di
nascita né nel form né nello schema del database.

---

## Roadmap — cosa manca prima del lancio pubblico

Da tracciare e aggiornare man mano che si decide/implementa:

- [x] Cancellazione account (vedi sezione 5 sopra) — implementata 2026-08-27.
- [ ] Quando Stripe verrà collegato: rivedere se Purchase/Tip/Payment
      vanno anonimizzati invece che cancellati alla cancellazione
      dell'account (vedi sezione 5).
- [ ] Decidere se implementare un controllo età minima in registrazione.
- [ ] Decidere se collegare il modello `Report` a una funzione reale
      (pulsante "segnala" su contenuti/profili) prima del lancio, o
      rimandarlo dichiarandolo esplicitamente nei Termini.
- [ ] Allineare il testo su Stripe in `/how-it-works` allo stato reale
      (Stripe non è collegato oggi).
- [ ] Quando Neon/R2/Resend/Stripe verranno effettivamente collegati,
      aggiornare la sezione "Servizi terzi" sopra da "configurato ma non
      collegato" a "attivo", e verificare se cambia il tipo di dato inviato
      (es. Stripe riceverebbe dati di pagamento).

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
