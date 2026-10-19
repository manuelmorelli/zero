// Rigenera i file SVG del logo Zero in public/images/ partendo dai contorni in source-outlines.json.
// Uso: npm run logo:build. Le due "manovelle" sono WEIGHT_PERCENT e SPACING_PERCENT; per provarle dal
// vivo prima di rigenerare, aprire logo-knobs.html nel browser.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ClipperLib from "clipper-lib";

const WEIGHT_PERCENT = 30;
const SPACING_PERCENT = 35;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, "..", "..", "public", "images");
const FILL = "#ffffff";

// Spessore dei tratti delle lettere originali e riga alta/bassa delle maiuscole, in coordinate sorgente.
const BASE_STROKE = 20.5;
const CAP_TOP = 490;
const CAP_BOTTOM = 650;
const CAP_MIDDLE = (CAP_TOP + CAP_BOTTOM) / 2;
const WORDMARK_CENTER_X = 640.5;
const CLIPPER_SCALE = 100;
const MITER_LIMIT = 3;
const LOCKUP_PADDING = 20;

const src = JSON.parse(fs.readFileSync(path.join(HERE, "source-outlines.json"), "utf8"));
const C = ClipperLib;

const xRange = (polys) => {
  let min = Infinity;
  let max = -Infinity;
  for (const poly of polys) for (const [x] of poly) { min = Math.min(min, x); max = Math.max(max, x); }
  return [min, max];
};

const toClipper = (polys) =>
  polys.map((p) => p.map(([x, y]) => ({ X: Math.round(x * CLIPPER_SCALE), Y: Math.round(y * CLIPPER_SCALE) })));
const fromClipper = (paths) => paths.map((p) => p.map((q) => [q.X / CLIPPER_SCALE, q.Y / CLIPPER_SCALE]));

// Lettere dritte (Z, E, R): il contorno si allarga o si stringe di `delta` su ogni lato, spigoli vivi.
function offsetLetter(polys, delta) {
  const clipper = new C.Clipper();
  clipper.AddPaths(toClipper(polys), C.PolyType.ptSubject, true);
  const union = new C.Paths();
  clipper.Execute(C.ClipType.ctUnion, union, C.PolyFillType.pftEvenOdd, C.PolyFillType.pftEvenOdd);
  if (!delta) return fromClipper(union);
  const offset = new C.ClipperOffset(MITER_LIMIT, 0.1 * CLIPPER_SCALE);
  offset.AddPaths(union, C.JoinType.jtMiter, C.EndType.etClosedPolygon);
  const result = new C.Paths();
  offset.Execute(result, delta * CLIPPER_SCALE);
  return fromClipper(C.Clipper.CleanPolygons(result, 0.02 * CLIPPER_SCALE));
}

// O a pennello: si allarga in senso radiale attorno al cerchio medio, così le setole restano visibili
// invece di fondersi come farebbero con un semplice allargamento del contorno.
function scaleBrushO(polys, factor) {
  const { cx, cy, r0 } = src.ring;
  return polys.map((p) =>
    p.map(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) || 1;
      const nr = r0 + (r - r0) * factor;
      return [cx + (dx / r) * nr, cy + (dy / r) * nr];
    })
  );
}

function buildWordmark(weightPercent, spacingPercent) {
  const { Z, E, R, O } = src.letters;
  const originalGaps = [
    xRange(E)[0] - xRange(Z)[1],
    xRange(R)[0] - xRange(E)[1],
    xRange(O)[0] - xRange(R)[1],
  ];
  const delta = ((weightPercent / 100) * BASE_STROKE) / 2;
  const keepCapHeight = (CAP_BOTTOM - CAP_TOP) / (CAP_BOTTOM - CAP_TOP + 2 * delta);

  const letters = [offsetLetter(Z, delta), offsetLetter(E, delta), offsetLetter(R, delta), scaleBrushO(O, 1 + weightPercent / 100)]
    .map((polys) => polys.map((p) => p.map(([x, y]) => [x, CAP_MIDDLE + (y - CAP_MIDDLE) * keepCapHeight])));

  let cursor = 0;
  const placed = letters.map((polys, i) => {
    const [min, max] = xRange(polys);
    const dx = cursor - min;
    cursor = max + dx + (i < originalGaps.length ? (originalGaps[i] * spacingPercent) / 100 : 0);
    return polys.map((p) => p.map(([x, y]) => [x + dx, y]));
  });
  const [min, max] = xRange(placed.flat());
  const shift = WORDMARK_CENTER_X - (min + max) / 2;
  return placed.map((polys) => polys.map((p) => p.map(([x, y]) => [x + shift, y])));
}

const round = (n) => Math.round(n * 10) / 10;
const polysToPath = (polys) => polys.map((p) => "M" + p.map(([x, y]) => `${round(x)} ${round(y)}`).join("L") + "Z").join("");

function pathBounds(d) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function unionBounds(boxes) {
  return [
    Math.min(...boxes.map((b) => b[0])),
    Math.min(...boxes.map((b) => b[1])),
    Math.max(...boxes.map((b) => b[2])),
    Math.max(...boxes.map((b) => b[3])),
  ];
}

const viewBox = ([x0, y0, x1, y1], pad = 0) =>
  [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].map(round).join(" ");

const svg = (box, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="${FILL}" role="img" aria-label="${label}">${body}</svg>\n`;

const { cx, cy, r, sw } = src.markRing;
const markRing = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${FILL}" stroke-width="${sw}"/>`;
const markRingBounds = [cx - r - sw / 2, cy - r - sw / 2, cx + r + sw / 2, cy + r + sw / 2];

const wordmarkPaths = buildWordmark(WEIGHT_PERCENT, SPACING_PERCENT).map(polysToPath);
const wordmarkBody = wordmarkPaths.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join("");
const wordmarkBounds = unionBounds(wordmarkPaths.map(pathBounds));
const markBounds = unionBounds([pathBounds(src.markLine), markRingBounds]);
const lockupBounds = unionBounds([wordmarkBounds, pathBounds(src.rule), pathBounds(src.tagline), markBounds]);

const files = {
  "zero-wordmark.svg": svg(viewBox(wordmarkBounds), wordmarkBody, "Zero"),
  "zero-logo.svg": svg(
    viewBox(lockupBounds, LOCKUP_PADDING),
    `${wordmarkBody}<path d="${src.rule}"/><path d="${src.tagline}"/><path d="${src.markLine}"/>${markRing}`,
    "Zero, every journey starts from zero"
  ),
  "zero-mark.svg": svg(viewBox(markBounds), `<path d="${src.markLine}"/>${markRing}`, "Zero"),
  "zero-enso.svg": svg(viewBox(pathBounds(src.enso)), `<path fill-rule="evenodd" d="${src.enso}"/>`, "Zero"),
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT_DIR, name), content);
  const box = content.match(/viewBox="([^"]+)"/)[1];
  console.log(`${name}  ${(content.length / 1024).toFixed(1)} KB  viewBox ${box}`);
}
