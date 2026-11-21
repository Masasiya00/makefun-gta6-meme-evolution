// Entry program for the make.fun bounty "Post a GTA 6 meme on X" (gta6-meme-x-01).
// Node 22, standard library only.
//
// The whole job of this program is to hand the house the address of the X post
// that is the entry: it reads POST.json out of the repository and writes an
// identical copy to the output folder, where the gate picks it up. The meme
// itself, the post, and the judging all happen outside this file.
//
// Paths come from the environment so the same code works both in the grader
// container and on a laptop:
//   MAKEFUN_BOT_DIR     - folder holding POST.json (default: /bot)
//   MAKEFUN_OUTPUT_DIR  - folder the copy goes to (default: /output)
// Local check:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = resolve(join(botDir, 'POST.json'));
const targetPath = resolve(join(outputDir, 'POST.json'));

if (!existsSync(sourcePath)) {
  console.error(`No POST.json found at ${sourcePath}; nothing to hand in.`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

const contents = readFileSync(sourcePath, 'utf8');

// Fail loudly on malformed JSON instead of handing the gate a broken file.
let parsed: unknown;
try {
  parsed = JSON.parse(contents);
} catch (err) {
  console.error(`POST.json at ${sourcePath} is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

// POST.json must be a JSON object, not null, an array, or a bare value:
// reading .url off null would crash, and an array/string has no url field.
if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  const kind = Array.isArray(parsed) ? 'array' : parsed === null ? 'null' : typeof parsed;
  console.error(`POST.json at ${sourcePath} must be a JSON object, got ${kind}.`);
  process.exit(1);
}

const url = (parsed as { url?: unknown }).url;
if (
  typeof url !== 'string' ||
  (!url.startsWith('http://') && !url.startsWith('https://'))
) {
  console.error(
    `POST.json at ${sourcePath} must have a "url" string field starting with http:// or https://.`,
  );
  process.exit(1);
}

writeFileSync(targetPath, contents);
console.log(`POST.json copied: ${sourcePath} -> ${targetPath}`);
