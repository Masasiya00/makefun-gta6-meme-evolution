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
const parsed = JSON.parse(contents) as { url?: unknown };
if (typeof parsed.url !== 'string' || !parsed.url.startsWith('https://')) {
  console.error(`POST.json at ${sourcePath} has no valid https url field.`);
  process.exit(1);
}

writeFileSync(targetPath, contents);
console.log(`POST.json copied: ${sourcePath} -> ${targetPath}`);
