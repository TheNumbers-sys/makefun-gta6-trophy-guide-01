// Package the hand-authored offline guide and its review images for make.fun.
// The output contains only local app files plus the deterministic dossier.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(output, { recursive: true });
for (const folder of ['app', 'screenshots']) {
  cpSync(join(root, folder), join(output, folder), { recursive: true });
}
const dossierJson = buildDossier(output, limits);
writeFileSync(join(output, 'dossier.json'), dossierJson, { encoding: 'utf8' });
