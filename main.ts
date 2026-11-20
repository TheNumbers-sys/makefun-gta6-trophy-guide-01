// Assemble the static Leonida Ledger entry with Node 22 and built-in modules only.
// The app itself is a set of offline files; this script copies those files and captures into the scorer's input folder.
// Keep the vendored dossier writer untouched so its deterministic bytes match the judge's copy.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(output, { recursive: true });
cpSync(join(repository, 'app'), join(output, 'app'), { recursive: true });
mkdirSync(join(output, 'screenshots'), { recursive: true });
const captures = join(repository, 'screenshots');
if (existsSync(captures)) cpSync(captures, join(output, 'screenshots'), { recursive: true });
writeFileSync(join(output, 'dossier.json'), buildDossier(output, caps));
