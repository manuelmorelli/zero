#!/usr/bin/env node
/*
 * Lucchetto del design system Zero.
 *
 * Blocca il codice che rompe l'uniformità del sito: bottoni, titoli, riquadri, campi o card
 * fatti a mano invece dei mattoncini ufficiali in components/ui/, colori o grandezze fuori dalla
 * scala di app/globals.css, scritte arancioni sfumate, "zero" minuscolo, trattini lunghi nei testi.
 * Nasce dal Capitolo 25 di docs/92_Project_History.md: le regole scritte non bastavano, serve un
 * sistema che obblighi a rispettarle.
 *
 * Uso: `npm run check:design` (parte anche da solo prima di ogni commit, vedi .githooks/).
 * Per cambiare l'aspetto del sito si modificano components/ui/ e app/globals.css, mai le pagine.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SCAN_DIRS = ["app", "components"];

/** Dove vivono i mattoncini ufficiali: qui valori su misura e stili propri sono ammessi. */
const DESIGN_SYSTEM_DIR = "components/ui/";

/** Eccezioni approvate da Manuel: file lasciati volutamente come sono. */
const APPROVED_EXCEPTIONS = new Set([
  // Chat AI della Community, approvata il 2026-09-29 (commit c381b15..3dbfa45).
  "components/creator/CommunityAiChat.tsx",
  "components/creator/CommunityAiComposer.tsx",
  "components/creator/CommunityAiNewChatButton.tsx",
  "components/creator/CommunityAiMessageActions.tsx",
  "components/creator/CommunityAiAttachMenu.tsx",
  "components/creator/NewCommunityListingClient.tsx",
]);

/** bg-black qui è il nero vero del canvas video/foto (letterbox), non lo sfondo di pagina:
 * intenzionalmente diverso da --color-bg, non un colore dimenticato. */
const VIDEO_CANVAS_BLACK_FILES = new Set([
  "components/common/ImageCropper.tsx",
  "components/common/VideoPlayer.tsx",
  "components/journey/EpisodePlayer.tsx",
]);

/** File che possono usare le taglie di testo su misura della Hero. */
const HERO_FILES = new Set(["components/landing/Hero.tsx"]);

const COLOR_TOKENS = new Set([
  "bg", "surface", "surface-2", "border", "ink", "ink-muted", "ink-faint", "danger",
  "ember", "ember-soft", "ember-line", "danger-soft", "danger-line", "scrim", "on-photo", "glass", "glass-strong", "overlay", "overlay-soft", "transparent", "current", "inherit",
]);
const COLOR_UTILS = "bg|text|border|border-[trblxy]|ring|ring-offset|outline|from|via|to|fill|stroke|divide|placeholder|decoration|accent|caret|shadow";
const TEXT_SIZES = new Set(["sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "reading", "reading-lg"]);

const RULES = {
  size: "Grandezza di testo fuori scala: usa text-sm o più grande (la più piccola ammessa è text-sm).",
  arbitraryColor: "Colore scritto a mano: usa un colore di app/globals.css (bg, surface, ink, ember...).",
  paletteColor: "Colore fuori palette: usa un colore di app/globals.css.",
  opacity: "Trasparenza su misura: usa i colori fissi (ember-soft, ember-line, scrim).",
  gradientText: "Scritta sfumata: le scritte arancioni devono essere piene (text-ember).",
  heading: "Titolo fatto a mano: usa PageTitle, DisplayTitle, SectionTitle, ReadingTitle o CardTitle (components/ui/heading).",
  button: "Bottone fatto a mano: usa Button/ButtonPrimary/ButtonSecondary/ButtonDanger/IconButton (components/ui/button).",
  box: "Riquadro fatto a mano: usa Panel, Notice, PANEL o NOTICE (components/ui/panel).",
  field: "Campo fatto a mano: usa Input, Textarea, Select, PillField o FIELD (components/ui/input).",
  page: "Contenitore di pagina fatto a mano: usa PageContainer o PAGE_WIDTH (components/ui/page-container).",
  zero: "\"Zero\" va sempre scritto con la Z maiuscola.",
  dash: "Niente trattini lunghi come punteggiatura: usa virgole, punti o parentesi.",
  back: "Niente frecce \"Back\" dentro la pagina: l'unica è quella arancione in alto (BackButton).",
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "api" || entry.name === "node_modules") continue;
      walk(full, out);
    } else if (/\.tsx$/.test(entry.name)) out.push(full);
  }
  return out;
}

const stripVariants = (cls) => cls.replace(/^([a-z0-9-]+:|\[[^\]]+\]:|group-[a-z-]+:)*/i, "").replace(/^!/, "").replace(/^-/, "");

function checkClasses(classes, ctx) {
  const problems = [];
  const list = classes.split(/\s+/).filter(Boolean);
  for (const raw of list) {
    const c = stripVariants(raw);
    let m;
    if ((m = c.match(/^text-(.+)$/))) {
      const v = m[1];
      if (v === "xs" || /^\[\d/.test(v) || /^\[(clamp|calc)/.test(v)) problems.push(["size", raw]);
      else if (v.startsWith("hero-") && !ctx.hero) problems.push(["size", raw]);
    }
    if (/\[(#|rgb|rgba|oklch|hsl)|[_(,](rgba?|oklch|hsla?)\(|#[0-9a-f]{3,8}\b/i.test(c)) problems.push(["arbitraryColor", raw]);
    if ((m = c.match(new RegExp(`^(${COLOR_UTILS})-(.+)$`)))) {
      const value = m[2];
      const base = value.split("/")[0];
      const isColorWord = /^(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\d+)?$/.test(base);
      const isCanvasBlack = ctx.videoCanvas && m[1] === "bg" && base === "black";
      if (isColorWord && !isCanvasBlack) problems.push(["paletteColor", raw]);
      else if (COLOR_TOKENS.has(base) && value.includes("/")) problems.push(["opacity", raw]);
    }
    if (c === "bg-clip-text") problems.push(["gradientText", raw]);
  }
  return problems;
}

const has = (cls, re) => cls.split(/\s+/).some((c) => re.test(stripVariants(c)));
/** Solo le classi "a riposo" (senza hover:, sm:...): sono quelle che decidono la forma di un elemento. */
const hasBase = (cls, re) => cls.split(/\s+/).some((c) => !c.includes(":") && re.test(c.replace(/^!/, "")));
/** Costanti ufficiali di components/ui/: se il className le usa, la forma viene dai mattoncini. */
const KIT = /\b(PANEL|PANEL_ACCENT|PANEL_GLASS|PANEL_DANGER|PANEL_DASHED|ROW|NOTICE|BADGE|CHIP|CHIP_SELECTED|FIELD|PILL_FIELD|PILL_FIELD_INPUT|PILL_FIELD_ON_PHOTO|BUTTON_VARIANTS|PAGE_WIDTH|PAGE_SPACING|CARD_GRID|CARD_ROW_ITEM|COVER_PLACEHOLDER)\b/;

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

function checkText(text, report, node) {
  if (/\bzero\b|\bZERO\b/.test(text)) report("zero", node, text);
  if (/\s[—–]\s|—/.test(text)) report("dash", node, text);
  if (/←|&larr;/.test(text)) report("back", node, text);
}

const errors = [];
for (const file of SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)))) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (rel.startsWith(DESIGN_SYSTEM_DIR) || APPROVED_EXCEPTIONS.has(rel)) continue;
  const ctx = { hero: HERO_FILES.has(rel), videoCanvas: VIDEO_CANVAS_BLACK_FILES.has(rel) };
  const source = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const report = (rule, node, detail) => {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    errors.push({ file: rel, line: line + 1, rule, detail: String(detail).replace(/\s+/g, " ").trim().slice(0, 90) });
  };

  (function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sf);
      let cls = "";
      let usesKit = false;
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
        const name = attr.name.getText(sf);
        if (name === "className") {
          cls = ts.isStringLiteral(attr.initializer) ? attr.initializer.text : literalText(attr.initializer);
          usesKit = KIT.test(attr.initializer.getText(sf));
        }
        if (["alt", "title", "aria-label", "placeholder"].includes(name) && ts.isStringLiteral(attr.initializer)) {
          checkText(attr.initializer.text, report, attr);
        }
        if (name === "style") {
          const styleText = attr.initializer.getText(sf);
          if (/#[0-9a-f]{3,8}\b|rgba?\(|oklch\(|hsla?\(/i.test(styleText)) report("arbitraryColor", attr, styleText);
        }
      }
      for (const [rule, detail] of checkClasses(cls, ctx)) report(rule, node, detail);

      const looksStyled = has(cls, /^(text-(sm|base|lg|xl|\dxl|\[)|font-(bold|semibold|extrabold|black|medium))/);
      if (/^h[1-3]$/.test(tag) && looksStyled) report("heading", node, `<${tag}> ${cls}`);

      // Bottone fatto a mano: forma a pillola o riquadro con sfondo/bordo proprio.
      const pill = hasBase(cls, /^rounded/) && hasBase(cls, /^(px|p)-/) && hasBase(cls, /^(bg-(ink|ember|danger|surface|surface-2|ember-soft)|border)$/);
      if ((tag === "button" || tag === "Link" || tag === "a") && pill && !usesKit) report("button", node, `<${tag}> ${cls}`);
      const box = hasBase(cls, /^rounded-(lg|xl|2xl|3xl)$/) && hasBase(cls, /^border$/) && hasBase(cls, /^(p|px|py)-/);
      if (/^(div|section|article|aside|li|p|ul|form)$/.test(tag) && box && !usesKit) report("box", node, `<${tag}> ${cls}`);
      const isCheckOrRadio = tag === "input" && node.attributes.properties.some(
        (a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "type" && a.initializer && ts.isStringLiteral(a.initializer) && /^(checkbox|radio)$/.test(a.initializer.text)
      );
      if (/^(input|textarea|select)$/.test(tag) && !isCheckOrRadio && hasBase(cls, /^(border|rounded(-.*)?)$/) && !usesKit) report("field", node, `<${tag}> ${cls}`);
      if (has(cls, /^mx-auto$/) && has(cls, /^max-w-(xl|2xl|3xl|4xl|5xl|6xl|7xl|\[\d+px\])$/) && !usesKit) report("page", node, cls);
    }
    if (ts.isJsxText(node)) {
      const text = node.getText(sf);
      if (/[A-Za-z]/.test(text) || /[—–←]/.test(text)) checkText(text, report, node);
    }
    if (ts.isJsxExpression(node) && node.expression && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))) {
      checkText(node.expression.text, report, node);
    }
    // Titoli della scheda del browser (metadata) e testi in costanti da mostrare.
    if (ts.isPropertyAssignment(node) && ["title", "description", "label", "subtitle", "text"].includes(node.name.getText(sf))) {
      if (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) checkText(node.initializer.text, report, node);
    }
    ts.forEachChild(node, visit);
  })(sf);
}

if (errors.length === 0) {
  console.log("check-design: nessun problema, il sito rispetta il design system.");
  process.exit(0);
}

const byRule = {};
for (const e of errors) byRule[e.rule] = (byRule[e.rule] ?? 0) + 1;
for (const e of errors) console.log(`${e.file}:${e.line}  [${e.rule}] ${e.detail}`);
console.log("\nRiepilogo:");
for (const [rule, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.log(`  ${String(count).padStart(4)}  ${rule}: ${RULES[rule]}`);
console.log(`\ncheck-design: ${errors.length} problemi. Usa i mattoncini di components/ui/ e i colori di app/globals.css.`);
process.exit(1);
