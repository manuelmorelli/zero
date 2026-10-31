#!/usr/bin/env node
/*
 * Lucchetto "il desktop non si tocca": blocca il commit se il lavoro non ancora committato
 * cambia come appare il sito a una larghezza da computer, rispetto all'ultimo commit (HEAD) —
 * cioè rispetto all'ultima versione già vista e approvata. Nasce da un errore reale
 * (2026-10-30): una modifica pensata per il telefono ha cambiato anche la resa a schermo largo
 * perché una classe non aveva il prefisso `md:`/`max-md:` giusto.
 *
 * Perché confrontare con HEAD e non con master: il branch `mobile-redesign` ha già dietro di sé
 * tanti commit che TOCCANO il desktop di proposito e con l'ok di Manuel (card più piccole,
 * icone aggiunte, pillole ridimensionate...) — confrontare con master segnalerebbe anche quelli,
 * sommerso di falsi allarmi su lavoro già approvato. Confrontando con HEAD, il lucchetto si
 * accende solo sulle modifiche NUOVE, quelle che stai per committare proprio ora.
 *
 * Come funziona: per ogni file .tsx modificato nella cartella di lavoro, legge tutte le classi
 * dentro ogni `className`, sia nell'ultimo commit sia in quella attuale. Per ciascuna classe
 * calcola se si "vede" su un computer vero (larghezza di riferimento 1440px: oltre i breakpoint
 * sm/md/lg/xl ma sotto 2xl) — una classe `md:grid-cols-3` conta come visibile a 1440px,
 * `max-md:h-8` no. Se l'insieme delle classi visibili a 1440px cambia, il commit viene bloccato:
 * un computer vero vedrebbe un sito diverso da prima.
 *
 * Limiti onesti: confronta l'insieme delle classi nel file, non riga per riga — se un elemento
 * viene tolto e un altro aggiunto con le stesse identiche classi "da desktop", il lucchetto non
 * se ne accorge. Non guarda app/globals.css (colori/temi, non breakpoint). Non sa leggere la
 * mente: se la modifica di oggi TOCCA DAVVERO il desktop apposta (una scelta vera, non un
 * dimenticato md:), si sblocca con `ALLOW_DESKTOP_CHANGE=1 git commit ...` — ma solo dopo aver
 * letto l'elenco qui sotto e deciso consapevolmente, mai di riflesso.
 *
 * Uso: `npm run check:desktop` (parte anche da solo prima di ogni commit, vedi .githooks/).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const BASE_REF = "HEAD";
const SCAN_DIRS = ["app", "components"];

/** Larghezza "schermo vero da computer" usata in questa sessione per gli screenshot di verifica
 * (vedi memoria del progetto): sopra i breakpoint sm/md/lg/xl, sotto 2xl. */
const DESKTOP_WIDTH = 1440;
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" });
}

function literalText(node) {
  const out = [];
  (function visit(n) {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.push(n.text);
    else if (ts.isTemplateExpression(n)) {
      out.push(n.head.text);
      n.templateSpans.forEach((span) => { visit(span.expression); out.push(span.literal.text); });
    } else ts.forEachChild(n, visit);
  })(node);
  return out.join(" ");
}

/** Riduce una classe Tailwind a "come si vede su un computer a DESKTOP_WIDTH", oppure null se a
 * quella larghezza non si applica affatto (es. max-md: sotto i 768px, o 2xl: sopra i 1536px). I
 * prefissi non legati alla larghezza (dark:, hover:, focus:, group-*, ecc.) restano intatti. */
function desktopToken(raw) {
  const important = raw.startsWith("!");
  const body = important ? raw.slice(1) : raw;
  const parts = body.split(":");
  const base = parts.pop();
  const kept = [];
  for (const v of parts) {
    const maxMatch = v.match(/^max-(sm|md|lg|xl|2xl)$/);
    if (maxMatch) {
      // max-X si applica quando la larghezza è SOTTO il breakpoint: a DESKTOP_WIDTH non vale,
      // a meno che il breakpoint sia più largo del nostro riferimento (caso raro, 2xl).
      if (DESKTOP_WIDTH < BREAKPOINTS[maxMatch[1]]) { kept.push(v); continue; }
      return null;
    }
    const minMatch = v.match(/^(sm|md|lg|xl|2xl)$/);
    if (minMatch) {
      // X: si applica quando la larghezza è SOPRA il breakpoint: a DESKTOP_WIDTH vale sempre
      // per sm/md/lg/xl (si normalizza togliendo il prefisso), non per 2xl (1536 > 1440).
      if (DESKTOP_WIDTH >= BREAKPOINTS[minMatch[1]]) continue;
      return null;
    }
    kept.push(v); // dark:, hover:, focus:, group-hover:, data-*, aria-*...: non legati alla larghezza
  }
  const token = [...kept, base].join(":");
  return important ? "!" + token : token;
}

const DISPLAY_UTILS = new Set([
  "hidden", "block", "inline-block", "inline", "flex", "inline-flex", "grid", "inline-grid",
  "contents", "table", "table-row", "table-cell", "list-item",
]);
/** Priorità tra breakpoint quando più di uno si applica a DESKTOP_WIDTH insieme (raro): quello
 * più grande vince, come nel CSS generato da Tailwind (i blocchi @media sono in ordine
 * crescente, quindi l'ultimo che si applica è quello che conta davvero). */
const BP_PRIORITY = { sm: 1, md: 2, lg: 3, xl: 4, "2xl": 5 };

function classNameOf(openingOrSelfClosing, sf) {
  for (const attr of openingOrSelfClosing.attributes.properties) {
    if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
    if (attr.name.getText(sf) !== "className") continue;
    return ts.isStringLiteral(attr.initializer) ? attr.initializer.text : literalText(attr.initializer);
  }
  return "";
}

/** Tra le utility di display presenti in una classe (hidden, block, flex...), decide quale vince
 * a DESKTOP_WIDTH — serve a sapere se l'elemento è davvero visibile da computer, non solo se la
 * parola "hidden" compare da qualche parte nella stringa. */
function resolveDisplayWinner(cls) {
  let winner = null; // { display, bp }
  for (const raw of cls.split(/\s+/).filter(Boolean)) {
    const body = raw.replace(/^!/, "");
    const parts = body.split(":");
    const base = parts.pop();
    if (!DISPLAY_UTILS.has(base)) continue;
    let bp = 0;
    let applies = true;
    for (const v of parts) {
      const maxMatch = v.match(/^max-(sm|md|lg|xl|2xl)$/);
      if (maxMatch) {
        if (!(DESKTOP_WIDTH < BREAKPOINTS[maxMatch[1]])) { applies = false; break; }
        continue;
      }
      const minMatch = v.match(/^(sm|md|lg|xl|2xl)$/);
      if (minMatch) {
        if (!(DESKTOP_WIDTH >= BREAKPOINTS[minMatch[1]])) { applies = false; break; }
        bp = Math.max(bp, BP_PRIORITY[minMatch[1]]);
      }
    }
    if (!applies) continue;
    if (!winner || bp >= winner.bp) winner = { display: base, bp };
  }
  return winner;
}

/** Tutte le classi "visibili da computer" di un file, come borsa (conta anche i duplicati):
 * non prova ad accoppiare elemento per elemento, solo "l'insieme è lo stesso?". Un elemento (o un
 * suo antenato) nascosto a DESKTOP_WIDTH via hidden/md:hidden/ecc. non contribuisce alla borsa:
 * altrimenti ogni normale blocco "solo per telefono" (hidden md:flex o md:hidden) sembrerebbe un
 * cambiamento sul desktop anche quando non lo è davvero. */
function desktopBag(source, file) {
  const bag = new Map();
  let sf;
  try {
    sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  } catch {
    return bag;
  }

  function addClassTokens(cls) {
    for (const raw of cls.split(/\s+/).filter(Boolean)) {
      const tok = desktopToken(raw);
      if (tok === null) continue;
      bag.set(tok, (bag.get(tok) ?? 0) + 1);
    }
  }

  function visit(node, hiddenAtDesktop) {
    if (ts.isJsxElement(node)) {
      const cls = classNameOf(node.openingElement, sf);
      const winner = resolveDisplayWinner(cls);
      const selfHidden = winner?.display === "hidden";
      if (!hiddenAtDesktop && !selfHidden) addClassTokens(cls);
      const childHidden = hiddenAtDesktop || selfHidden;
      for (const child of node.children) visit(child, childHidden);
      return;
    }
    if (ts.isJsxSelfClosingElement(node)) {
      const cls = classNameOf(node, sf);
      const winner = resolveDisplayWinner(cls);
      if (!hiddenAtDesktop && winner?.display !== "hidden") addClassTokens(cls);
      return;
    }
    if (ts.isJsxFragment(node)) {
      for (const child of node.children) visit(child, hiddenAtDesktop);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, hiddenAtDesktop));
  }

  visit(sf, false);
  return bag;
}

function diffBags(before, after) {
  const diffs = [];
  const keys = new Set([...before.keys(), ...after.keys()]);
  for (const k of keys) {
    const b = before.get(k) ?? 0;
    const a = after.get(k) ?? 0;
    if (b !== a) diffs.push({ token: k, before: b, after: a });
  }
  return diffs.sort((x, y) => x.token.localeCompare(y.token));
}

let changedFiles = [];
try {
  changedFiles = run(`git diff --name-only ${BASE_REF} -- ${SCAN_DIRS.join(" ")}`)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.endsWith(".tsx"));
} catch {
  console.log(`check-desktop: impossibile confrontare con ${BASE_REF} (branch non trovato?), controllo saltato.`);
  process.exit(0);
}

const problems = [];
for (const rel of changedFiles) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue; // file eliminato: nessuna classe nuova da controllare

  let before;
  try {
    before = run(`git show ${BASE_REF}:${rel}`);
  } catch {
    continue; // file nuovo su questo branch: nessuna base in master, niente da confrontare
  }
  const after = fs.readFileSync(abs, "utf8");

  const diffs = diffBags(desktopBag(before, rel), desktopBag(after, rel));
  if (diffs.length > 0) problems.push({ file: rel, diffs });
}

if (problems.length === 0) {
  console.log(`check-desktop: nessuna modifica cambia la resa da computer rispetto a ${BASE_REF}.`);
  process.exit(0);
}

console.log(`check-desktop: alcune modifiche cambiano la resa a ${DESKTOP_WIDTH}px (schermo da computer) rispetto a ${BASE_REF}.`);
console.log("Probabile causa: una classe cambiata/aggiunta senza il prefisso md:/max-md: giusto.\n");
for (const { file, diffs } of problems) {
  console.log(file);
  for (const { token, before, after } of diffs) {
    if (before === 0) console.log(`  + ${token}  (nuova su desktop, assente in ${BASE_REF})`);
    else if (after === 0) console.log(`  - ${token}  (presente in ${BASE_REF}, sparita da desktop)`);
    else console.log(`  ~ ${token}  (${before} → ${after} occorrenze)`);
  }
  console.log("");
}
if (process.env.ALLOW_DESKTOP_CHANGE === "1") {
  console.log(
    "ALLOW_DESKTOP_CHANGE=1: commit consentito nonostante l'elenco sopra. Usalo solo dopo aver\n" +
    "deciso con Manuel che il cambiamento sul computer è voluto, non un md: dimenticato."
  );
  process.exit(0);
}

console.log(
  "Se è una modifica solo per telefono, aggiungi md: o max-md: alla classe cambiata.\n" +
  "Se invece è una modifica voluta anche per il computer, rilancia con:\n" +
  "  ALLOW_DESKTOP_CHANGE=1 git commit ...\n" +
  "ma solo dopo aver mostrato questo elenco a Manuel e aver avuto il suo ok esplicito."
);
process.exit(1);
