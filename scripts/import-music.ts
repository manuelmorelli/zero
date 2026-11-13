// Importa nella Libreria musicale di Zero i brani di una cartella del computer.
// Uso: npx tsx --env-file=.env scripts/import-music.ts "<cartella>" [--dry]
//
// Struttura della cartella: ogni sottocartella è un "mood" (es. Calm, Energetic, Cinematic) e
// contiene i brani (.mp3, .m4a, .wav, .ogg). I brani messi direttamente nella cartella principale
// prendono il mood "General". Titolo e artista si leggono dal file; se mancano, dal nome
// ("Artista - Titolo.mp3"). I brani già presenti (stesso titolo e artista) vengono saltati.
// --dry mostra cosa verrebbe importato senza caricare nulla.
import { randomUUID } from "crypto";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { parseBuffer } from "music-metadata";
import { prisma } from "@/lib/prisma";
import { putAudio } from "@/lib/r2";

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
};
const DEFAULT_MOOD = "General";

type Found = { file: string; mood: string };

async function collect(root: string): Promise<Found[]> {
  const found: Found[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && path.extname(entry.name).toLowerCase() in CONTENT_TYPES) {
      // Salta le copie "(1)" e i file con spazi nel nome (prove, non brani).
      if (/\(\d+\)\.\w+$/.test(entry.name) || entry.name.includes(" ")) continue;
      found.push({ file: path.join(root, entry.name), mood: moodFromFilename(entry.name) });
    } else if (entry.isDirectory()) {
      const inner = await readdir(path.join(root, entry.name), { withFileTypes: true });
      for (const file of inner) {
        if (file.isFile() && path.extname(file.name).toLowerCase() in CONTENT_TYPES) {
          found.push({ file: path.join(root, entry.name, file.name), mood: entry.name });
        }
      }
    }
  }
  return found;
}

// Nomi tipo "autore-titolo-parole-123456.mp3" (scaricati da librerie gratuite): l'autore è il primo
// pezzo, il numero finale è un codice del sito e si toglie, il resto diventa il titolo.
function titleFromFilename(file: string): { artist: string | null; title: string } {
  const base = path.basename(file, path.extname(file)).replace(/-\d{4,}$/, "");
  const parts = base.split(/-/);
  if (parts.length < 2) return { artist: null, title: humanize(base) };
  const [first, ...rest] = parts;
  const words = rest.join(" ").split(/[_ ]+/).filter((word, index, all) => word !== all[index - 1]);
  return { artist: humanize(first), title: humanize(words.join(" ")) };
}

function humanize(text: string): string {
  return text
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Se la cartella non ha sottocartelle per categoria, il mood si deduce da parole del nome.
const MOOD_KEYWORDS: [string, string[]][] = [
  ["Rap", ["rap", "trap"]],
  ["Calm", ["calm", "ambient", "relax", "soothing", "lofi", "lo", "peaceful", "warm"]],
  ["Emotional", ["emotional", "piano", "ballad", "hopeful"]],
  ["Cinematic", ["cinematic", "trailer", "epic", "war"]],
  ["Acoustic", ["acoustic", "folk", "flamenco", "country", "guitar", "string", "violin"]],
  ["Energetic", ["energy", "rock", "action", "sport", "motivation", "motivational", "upbeat", "metal", "heavy"]],
  ["Happy", ["happy", "cheerful", "funk", "pop", "vibe"]],
  ["Travel", ["travel", "adventure", "atlas", "journey"]],
];

function moodFromFilename(file: string): string {
  const tokens = path.basename(file).toLowerCase().split(/[^a-z0-9]+/);
  return MOOD_KEYWORDS.find(([, words]) => words.some((word) => tokens.includes(word)))?.[0] ?? DEFAULT_MOOD;
}

async function main() {
  const args = process.argv.slice(2);
  const folder = args.find((arg) => !arg.startsWith("--"));
  const dry = args.includes("--dry");
  if (!folder) {
    console.error('Uso: npx tsx --env-file=.env scripts/import-music.ts "<cartella>" [--dry]');
    process.exit(1);
  }

  const items = await collect(folder);
  console.log(`${items.length} brani trovati in ${folder}${dry ? " (prova, nessun caricamento)" : ""}.\n`);

  let imported = 0;
  for (const item of items) {
    const buffer = await readFile(item.file);
    const meta = await parseBuffer(buffer, { path: item.file }, { duration: true });
    const fallback = titleFromFilename(item.file);
    const title = meta.common.title?.trim() || fallback.title;
    const artist = meta.common.artist?.trim() || fallback.artist || "Unknown artist";
    const durationSec = Math.round(meta.format.duration ?? 0);

    const exists = await prisma.musicTrack.findFirst({ where: { title, artist } });
    if (exists) {
      console.log(`salto (già presente): ${artist} - ${title}`);
      continue;
    }
    if (durationSec <= 0) {
      console.log(`ERRORE (durata non leggibile): ${item.file}`);
      continue;
    }

    console.log(`${dry ? "da importare" : "importo"}: [${item.mood}] ${artist} - ${title} (${durationSec}s)`);
    if (dry) continue;

    const extension = path.extname(item.file).toLowerCase();
    const audioKey = `music/${randomUUID()}${extension}`;
    await putAudio(audioKey, buffer, CONTENT_TYPES[extension]);
    await prisma.musicTrack.create({ data: { title, artist, mood: item.mood, durationSec, audioKey } });
    imported++;
  }

  console.log(`\nFatto: ${imported} brani importati.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
