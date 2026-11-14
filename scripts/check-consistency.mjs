/**
 * Controllo di coerenza pezzo per pezzo (leggendo il sito vero, non foto).
 *
 * Apre ogni pagina del sito su telefono (390px) e computer (1440px), trova ogni pezzo ufficiale
 * (marcato con data-ui in components/ui: card, bottoni, titoli, riquadri, pillole) e legge come è
 * davvero disegnato: font, grandezza, peso, colore, angoli, bordo, spazi interni, distanze.
 * Se lo stesso pezzo appare in due modi diversi in pagine diverse, lo segnala con le pagine.
 *
 * Serve il sito acceso (npm run dev, porta 3000). Uso:  node scripts/check-consistency.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

import fs from "node:fs";
import path from "node:path";
const BASELINE_PATH = path.resolve(process.cwd(), "scripts/consistency-baseline.json");
const BASELINE = new Set(fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) : []);
const WRITE_BASELINE = process.argv.includes("--write-baseline");
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const VIEWPORTS = [
  { name: "telefono", width: 390, height: 844 },
  { name: "computer", width: 1440, height: 900 },
];

// Pagine che si vedono senza account. Le pagine con dati (Journey, profilo) sono prese dal sito vero.
const STATIC_PAGES = [
  "/", "/journeys", "/journeyers", "/search", "/custom-path", "/how-it-works", "/what-is-zero", "/pricing",
  "/discover/top", "/discover/now", "/discover/new", "/discover/recommended", "/discover/latest-videos", "/discover/creators",
  "/contact", "/terms", "/privacy", "/cookies", "/copyright", "/community-guidelines",
];

// Proprietà che descrivono COME un pezzo appare (non quanto è largo o dove sta: dipende dallo schermo).
const LOOK = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "textAlign", "color",
  "backgroundColor", "borderTopWidth", "borderTopColor", "borderTopLeftRadius", "boxShadow",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"
];

/** Eseguito dentro la pagina: per ogni pezzo marcato legge il suo aspetto e quello delle parti dentro. */
function readPieces({ look }) {
  const read = (el) => {
    const s = getComputedStyle(el);
    return look.map((k) => `${k}=${s[k]}`).join("; ");
  };
  const out = [];
  for (const el of document.querySelectorAll("[data-ui]")) {
    if (el.closest("[hidden], [aria-hidden='true']") && getComputedStyle(el).display === "none") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const kind = el.getAttribute("data-ui");
    const parts = { self: read(el) };
    if (kind.startsWith("card-")) {
      const frame = el.querySelector("a > div");
      if (frame) {
        parts.frame = read(frame);
        const fr = frame.getBoundingClientRect();
        parts.ratio = `ratio=${(fr.width / fr.height).toFixed(2)}`;
      }
      const title = el.querySelector("[data-ui='heading-CardTitle'], h3");
      if (title) parts.title = read(title);
      const below = el.querySelector("[data-part='card-below']");
      if (below && frame && below.getBoundingClientRect().top >= frame.getBoundingClientRect().bottom - 1) {
        parts.gap = `gap=${Math.round(below.getBoundingClientRect().top - frame.getBoundingClientRect().bottom)}px`;
        parts.belowRow = read(below.firstElementChild ?? below);
      }
      const chip = el.querySelector("[data-ui='cover-chip']");
      parts.chip = chip ? read(chip) : "none";
    }
    out.push({ kind, parts });
  }
  return out;
}

async function discoverDynamicPages(page) {
  // Un Journey, un episodio e un profilo veri, presi dai link della Home e delle pagine elenco.
  const found = new Set();
  for (const from of ["/discover/top", "/discover/latest-videos", "/discover/creators"]) {
    await page.goto(BASE + from, { waitUntil: "networkidle", timeout: 120000 });
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    for (const re of [/^\/journeys\/[^/]+$/, /^\/journeys\/[^/]+\/episodes\/[^/]+$/, /^\/profile\/[^/]+$/]) {
      const hit = hrefs.find((h) => re.test(h));
      if (hit) found.add(hit);
    }
  }
  return [...found];
}

try {
  await fetch(BASE, { method: "HEAD" });
} catch {
  console.log(`check-consistency: il sito non è acceso su ${BASE}. Avvia "npm run dev" e riprova.`);
  process.exit(2);
}

const browser = await chromium.launch();
const seen = new Map(); // "viewport|kind|part" -> Map(valore -> Set(pagine))
let pagesChecked = 0;

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const pages = [...STATIC_PAGES, ...(await discoverDynamicPages(page))];
  for (const url of pages) {
    try {
      await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 120000 });
    } catch {
      console.log(`  (saltata, non si apre: ${url})`);
      continue;
    }
    // Le righe e i contenuti compaiono con una dissolvenza: si aspetta che finisca.
    await page.waitForTimeout(900);
    const pieces = await page.evaluate(readPieces, { look: LOOK });
    pagesChecked++;
    for (const { kind, parts } of pieces) {
      for (const [part, value] of Object.entries(parts)) {
        const key = `${vp.name}|${kind}|${part}`;
        if (!seen.has(key)) seen.set(key, new Map());
        const byValue = seen.get(key);
        if (!byValue.has(value)) byValue.set(value, new Set());
        byValue.get(value).add(url);
      }
    }
  }
  await context.close();
}
await browser.close();

// Diversità già esistenti prima di questo controllo (baseline): non crescono mai. Una variante
// nuova, cioè un pezzo che prima era uguale e adesso non lo è più, blocca il commit.
const variantId = (key, value) => key + " => " + value;
const allVariants = [];
let problems = 0;
let fresh = 0;
for (const [key, byValue] of [...seen].sort()) {
  if (byValue.size <= 1) continue;
  problems++;
  const [vpName, kind, part] = key.split("|");
  const variants = [...byValue].sort((a, b) => b[1].size - a[1].size);
  const base = variants[0][0].split("; ");
  const lines = [];
  variants.forEach(([value, urls], i) => {
    const id = variantId(key, value);
    allVariants.push(id);
    const isNew = !BASELINE.has(id);
    if (isNew) fresh++;
    const props = value.split("; ");
    const diff = i === 0 ? "(il modo più usato)" : props.filter((p, idx) => p !== base[idx]).join("; ");
    lines.push(`   - ${isNew ? "NUOVO: " : ""}${diff}` + String.fromCharCode(10) + `     in: ${[...urls].slice(0, 6).join(", ")}${urls.size > 6 ? ` e altre ${urls.size - 6}` : ""}`);
  });
  if (fresh > 0 || process.argv.includes("--all")) console.log(String.fromCharCode(10) + `[${vpName}] ${kind} / ${part}: appare in ${byValue.size} modi diversi` + String.fromCharCode(10) + lines.join(String.fromCharCode(10)));
}

if (WRITE_BASELINE) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify([...new Set(allVariants)].sort(), null, 2) + String.fromCharCode(10));
  console.log(`consistency-baseline.json scritto: ${new Set(allVariants).size} varianti note, ${pagesChecked} pagine lette.`);
  process.exit(0);
}

console.log(`
check-consistency: ${pagesChecked} pagine lette, ${seen.size} pezzi confrontati, ${problems} pezzi con più di un aspetto (già noti).`);
if (fresh > 0) {
  console.log(`check-consistency: ${fresh} aspetti NUOVI. Un pezzo che era uguale ovunque adesso appare in un altro modo. Il pezzo deve essere uguale in tutto il sito.`);
  process.exit(1);
}
console.log("check-consistency: nessun aspetto nuovo, il sito non è diventato meno uniforme.");
