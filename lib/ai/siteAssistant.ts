import fs from "node:fs";
import path from "node:path";
import { streamGemini } from "@/lib/ai/gemini";
import { sections as privacySections } from "@/app/(site)/privacy/page";
import { sections as termsSections } from "@/app/(site)/terms/page";
import { sections as cookiesSections } from "@/app/(site)/cookies/page";
import { paragraphs as whatIsZeroParagraphs, quickAnswers, different as whatMakesDifferent, howItWorks as howZeroWorksList, journeyExamples } from "@/app/(site)/what-is-zero/page";
import {
  algorithmParagraphs,
  trustyExplainer,
  trustClosingLine,
  mistakesNote,
  orderPhases,
  algorithmQuickAnswers,
  publishingNote,
  steps as gettingStartedSteps,
  questions as faqQuestions,
  uploadTips,
} from "@/app/(site)/how-it-works/page";
import {
  CREATOR_MODE_INTRO,
  VISITOR_DESCRIPTION,
  CREATOR_DESCRIPTION,
  STEPS as creatorSteps,
  INACTIVITY_POLICY_INTRO,
  INACTIVITY_MILESTONES,
  PAUSE_POLICY,
  TURN_OFF_POLICY,
  EARNINGS_STATUS,
} from "@/app/(site)/creator/page";

export type SiteAssistantMessage = { role: "user" | "assistant"; text: string };

import {
  zeroTolerance,
  notAllowedGroups,
  simpleSections as guidelinesSections,
  noEngagementBaitNote,
} from "@/app/(site)/community-guidelines/page";
import { sections as copyrightSections } from "@/app/(site)/copyright/page";

// Percorsi reali delle sezioni di Impostazioni (docs/14_UI_Pages.md descrive cosa fanno, non dove
// sono): un piccolo elenco a parte, giusto i link, per rispondere a "dove trovo X" con un percorso
// vero invece di una descrizione generica.
const SETTINGS_PATHS = [
  "/settings/account — name, email, password, date of birth, account deletion.",
  "/settings/security — login and security.",
  "/settings/notifications — notification preferences.",
  "/settings/privacy — blocking people, private account.",
  "/settings/interests — interest categories.",
  "/settings/subscription — Community subscription (not active yet, Post-MVP).",
  "/settings/creator — turning Journeyer mode on or off, pausing as a journeyer.",
].join("\n");

function section(title: string, body: string[]): string {
  return `### ${title}\n${body.filter(Boolean).join("\n")}`;
}

/**
 * Legge un documento da docs/ (il processo server deve avere accesso a quella cartella, non solo ai
 * file importati da Next.js: se in futuro Zero viene distribuito su una piattaforma serverless che
 * include solo i file tracciati, questa lettura va rivista). Percorso scritto così, con "docs"
 * fisso e solo il nome del file variabile, perché Turbopack tracci solo quella cartella invece di
 * tutto il progetto per sicurezza (altrimenti avviso "the whole project was traced unintentionally"
 * in build). Il frontmatter YAML tra "---" viene tolto: è metadato per noi, non serve a Ember.
 */
function readDoc(filename: string): string {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "docs", filename), "utf-8");
    return raw.replace(/^---[\s\S]*?---\n/, "").trim();
  } catch (error) {
    console.error(`[site-assistant] failed to read docs/${filename}`, error);
    return "";
  }
}

function buildKnowledgeBase(): string {
  return [
    section("What Zero is", whatIsZeroParagraphs),
    section("Quick definitions (Zero, Journey, Journeyer, how to use it)", quickAnswers.map((item) => `${item.title} ${item.text}`)),
    section("Examples of what a Journey can be", journeyExamples.map((item) => item.text)),
    section("What makes Zero different", whatMakesDifferent.map((item) => item.text)),
    section("How it works in practice", howZeroWorksList.map((item) => item.text)),
    section("How the algorithm decides what to show (general explanation only, see hard rules below)", [
      ...algorithmParagraphs,
      trustyExplainer,
      trustClosingLine,
      mistakesNote,
      ...orderPhases.map((phase) => `${phase.tag}: ${phase.title} ${phase.text}`),
      ...algorithmQuickAnswers.map((item) => `${item.title} ${item.text}`),
    ]),
    section("Getting started", gettingStartedSteps.map((step) => `${step.title}: ${step.text}`)),
    section("Frequently asked questions", faqQuestions.map((item) => `Q: ${item.q}\nA: ${item.a}`)),
    section("Publishing and re-uploading episodes", [publishingNote]),
    section("Video upload tips", uploadTips.map((tip) => tip.text)),
    section("Journeyer mode", [
      CREATOR_MODE_INTRO,
      `Visitor: ${VISITOR_DESCRIPTION}`,
      `Journeyer: ${CREATOR_DESCRIPTION}`,
    ]),
    section("How to start as a journeyer", creatorSteps),
    section("What happens if a journeyer stops publishing", [
      INACTIVITY_POLICY_INTRO,
      ...INACTIVITY_MILESTONES,
      PAUSE_POLICY,
    ]),
    section("Turning Journeyer mode off", [TURN_OFF_POLICY]),
    section("Journeyer earnings", [EARNINGS_STATUS]),
    section("Privacy Policy", privacySections.flatMap((item) => [`#### ${item.title}`, ...item.body])),
    section("Terms of Service", termsSections.flatMap((item) => [`#### ${item.title}`, ...item.body])),
    section("Cookie Policy", cookiesSections.flatMap((item) => [`#### ${item.title}`, ...item.body])),
    section("Community Guidelines: never allowed, zero tolerance (immediate removal and ban)", zeroTolerance),
    section(
      "Community Guidelines: not allowed on Zero",
      notAllowedGroups.map((group) => `${group.title}: ${group.body}`).concat(noEngagementBaitNote)
    ),
    section("Community Guidelines: other rules", guidelinesSections.map((item) => `${item.title}: ${item.body}`)),
    section("Copyright and reporting content", copyrightSections.flatMap((item) => [`#### ${item.title}`, ...item.body])),
    section("Every feature of Zero, in detail", [readDoc("20_Feature_Catalog.md")]),
    section("Every page of the site and what it's for", [readDoc("14_UI_Pages.md")]),
    section("Where to find each Settings section", [SETTINGS_PATHS]),
  ].join("\n\n");
}

const SYSTEM_INSTRUCTION_HEADER = `You are Ember, the assistant built into Zero's website (the small glowing face button in the header). Your only job is to help people understand how Zero works, what its features are, and how to find and use things on the site. You are a different assistant from the one in the Community section (that one helps creators draft workshops, events, products and services); you explain the site itself, you don't help create content.

Hard rules, never break them:
- Use only the reference information below. You have no internet access and no browsing tool of any kind: you cannot search online, and you must never claim or imply that you did.
- If the answer isn't in the reference information below, say honestly that you don't know, instead of guessing.
- Never invent a feature, a number, a policy or a page that isn't described below.
- The exact weights and percentages behind the algorithm and the Trust Score are confidential and deliberately not included below. If someone asks for the exact formula, exact percentages, or precisely how points are calculated, say that detail isn't public and give the general explanation instead (what the algorithm actually cares about, in plain words). Never guess or invent numbers for this.
- You explain, you never act: you cannot change anyone's settings, publish anything, delete anything, or submit any form on someone's behalf. If someone asks you to do something instead of asking how, say you can only explain how, and point them to the right page.
- You don't know who is talking to you and can't see anyone's personal data, profile, or content. Answer only in general terms about how Zero works, never about one specific person's account.
- Reply in the same language the person writes in.
- You can use Markdown (bold, bullet lists) when it helps readability.
- Never use dashes (-, – or —) as punctuation. Use commas, parentheses, or separate sentences instead.

Reference information about Zero (use only this, nothing else):

`;

let cachedInstruction: string | null = null;

function getSystemInstruction(): string {
  if (!cachedInstruction) cachedInstruction = SYSTEM_INSTRUCTION_HEADER + buildKnowledgeBase();
  return cachedInstruction;
}

function formatTranscript(messages: SiteAssistantMessage[]): string {
  return messages.map((message) => `${message.role === "user" ? "Visitor" : "Ember"}: ${message.text}`).join("\n\n");
}

/**
 * Un turno della chat di Ember: molto più semplice della chat Community (continueCommunityChat,
 * lib/ai/communityDraft.ts) perché qui non servono bozze, immagini o allegati, solo domanda e
 * risposta ancorata al contenuto vero del sito. Stesso schema di recupero memoria: se
 * previousInteractionId non è più valido, si rimanda la conversazione come testo.
 */
export async function continueSiteAssistantChat(params: {
  message: string;
  previousInteractionId: string | null;
  history: SiteAssistantMessage[];
  onText: (delta: string) => void;
}): Promise<{ reply: string; interactionId: string } | { error: string }> {
  const systemInstruction = getSystemInstruction();

  let streamedText = false;
  const onText = (delta: string) => {
    streamedText = true;
    params.onText(delta);
  };

  let result = await streamGemini(
    { input: params.message, systemInstruction, previousInteractionId: params.previousInteractionId ?? undefined },
    onText
  );
  if ("error" in result && !streamedText && params.previousInteractionId && params.history.length > 0) {
    result = await streamGemini(
      {
        input: `Conversation so far:\n\n${formatTranscript(params.history)}\n\nVisitor's new message: ${params.message}`,
        systemInstruction,
      },
      onText
    );
  }
  if ("error" in result) return result;
  return { reply: result.text, interactionId: result.interactionId };
}
