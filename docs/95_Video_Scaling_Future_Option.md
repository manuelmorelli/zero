---
title: Opzione Futura — Video Scaling Fai-da-te
doc_id: 95-video-scaling-future-option
version: "1.0"
status: parked
related_docs:
  - 16_Tech_Stack
  - 94_Product_Backlog
---

# Opzione Futura — Video Scaling Fai-da-te

**Stato: opzione futura, non un piano attivo.** Pensata per uno scenario ipotetico
attorno a 1.000 utenti registrati, quando i costi di Cloudflare Stream
potrebbero iniziare a pesare davvero. Oggi (2026-09-21) Zero non ha ancora
traffico video reale significativo, quindi il problema che questo documento
risolve non esiste ancora. Non richiede nessuna azione ora.

**Quando riconsiderarlo:** controllare periodicamente la spesa Cloudflare
(sezione Billing/Analytics della dashboard) man mano che arrivano utenti
reali e iniziano a guardare video con regolarità. Se la spesa di Cloudflare
Stream mostra una crescita continua legata ai minuti di video consegnati,
è il segnale per tornare su questo documento. Da verificare se Cloudflare
offre avvisi automatici di soglia di spesa, come rete di sicurezza aggiuntiva
oltre al controllo manuale.

**Perché aspettare non blocca nulla dopo:** l'architettura attuale
(`lib/stream.ts`, vedi `16_Tech_Stack.md`) mantiene sempre il video
originale su Cloudflare R2, non toccato. Cloudflare Stream è solo un
livello aggiuntivo che genera una versione leggera a partire da
quell'originale. Il giorno in cui si passasse al sistema descritto qui
sotto, si parte comunque dall'originale su R2: nessun lavoro pregresso da
rifare per il ritardo.

**Nota sui prezzi:** le cifre riportate sotto sono una stima raccolta in
fase di ricerca esterna, non verificata sulle tariffe correnti. Vanno
ricontrollate su Cloudflare prima di qualunque decisione definitiva.

---

## 1. Il problema (a grandi numeri)

Con molti utenti che guardano video con regolarità, il costo può crescere
in modo significativo se non si progetta la distribuzione con attenzione.
L'obiettivo è un'architettura che riduca il più possibile il costo
ricorrente, restando semplice e legale.

## 2. Principio di base: R2 non fa pagare l'uscita dei dati

Cloudflare R2 non applica costi di "egress" per i dati trasferiti fuori
dall'archivio — il costo principale è storage e operazioni, non quanto
viene scaricato. L'architettura va quindi progettata per far leggere R2 il
meno possibile, non per aggirare Cloudflare.

## 3. Architettura proposta

```
R2 (archivio principale)
  ↓
Cloudflare Cache (distribuzione/cache)
  ↓
Browser dell'utente (riproduzione)
```

R2 conserva i file (originali + versioni ottimizzate). Cloudflare Cache
distribuisce i contenuti. Il browser riceve e riproduce, senza bisogno di
un player costruito da zero — l'elemento video nativo del browser basta,
con un'interfaccia personalizzata sopra se serve.

## 4. R2 come archivio master

Costo indicativo raccolto in fase di ricerca: R2 Standard ~$0,015 per
GB/mese, con quota gratuita iniziale e senza costo di uscita dati. Esempio:
100 GB ~$1,35/mese, 1 TB ~$14,85/mese. **Da riverificare.**

## 5. Cloudflare Cache davanti a R2

Per contenuti pubblicati e immutabili (un video di un Journey non cambia)
si può usare una cache molto lunga, più eventualmente Smart Tiered Cache
per ridurre ulteriormente le richieste verso l'origine.

## 6. Non distribuire il file originale enorme

Un video caricato può essere convertito in versioni più leggere (es. 360p,
720p, 1080p). Esempio illustrativo: un originale da 500 MB può produrre
una versione 360p da ~30 MB, 720p da ~100 MB, 1080p da ~200 MB — numeri
indicativi, il risultato reale dipende da durata, codec, bitrate,
risoluzione e contenuto.

## 7. Transcoding con FFmpeg

FFmpeg (gratuito, open source) genera le versioni ottimizzate da un file
originale. Richiede un server che esegua la conversione: ha quindi un
costo computazionale reale (CPU/tempo di elaborazione), oltre a tutto il
lavoro di gestione attorno (cosa fare se una conversione fallisce, come
monitorare che il server funzioni, sicurezza, aggiornamenti).

Flusso proposto:
1. L'utente carica il video originale.
2. Il server lo riceve.
3. FFmpeg genera le versioni 360p / 720p / 1080p.
4. Le versioni vengono caricate su R2.
5. Cloudflare Cache le distribuisce.
6. Il browser riproduce la versione appropriata.

## 8. Perché non Cloudflare Stream (in questo scenario)

Cloudflare Stream è più semplice da usare (gestisce tutta la pipeline lui),
ma costa in base all'uso — stima raccolta: ~$1 ogni 1.000 minuti di video
consegnati. Esempio: 10.000 utenti che guardano in media 20 minuti/mese
producono 200.000 minuti/mese, cioè ~$200/mese solo di delivery. Simulazione
basata su quell'ipotesi, non un dato garantito. **Da riverificare.**

## 9. Server dedicato per il transcoding

"Server proprio" può voler dire hardware di proprietà (costoso da mantenere:
acquisto, elettricità, manutenzione, sicurezza) oppure un server dedicato
noleggiato — nella fase iniziale la seconda opzione è più sensata, nessun
investimento iniziale grosso.

Attenzione: se il server distribuisse direttamente i video agli utenti
(invece di appoggiarsi a R2 + cache), la banda necessaria crescerebbe
rapidamente con tanti utenti. Per questo il server va usato solo per il
transcoding, non per la distribuzione.

## 10. Strategia operativa se si arriva a costruirlo

1. R2 come storage.
2. Cloudflare Cache davanti a R2.
3. Cache lunga per contenuti immutabili.
4. FFmpeg su un server dedicato economico per il transcoding.
5. Generare solo le risoluzioni realmente necessarie.
6. Nessun Cloudflare Stream, salvo che la semplicità operativa giustifichi il costo.
7. Monitorare i consumi reali prima di aumentare l'infrastruttura.

## 11. Cosa non fare

Non comprare server fisici. Non distribuire ripetutamente il file
originale enorme. Non usare Cloudflare Stream se l'obiettivo prioritario
diventa minimizzare il costo per grandi volumi di visualizzazioni. Non
costruire un'infrastruttura complessa prima di avere dati reali sul
comportamento degli utenti — motivo per cui, oggi, questo documento resta
un riferimento futuro e non un piano attivo.
