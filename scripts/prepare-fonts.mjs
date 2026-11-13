import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const fonts = JSON.parse(readFileSync(new URL('scripts/fonts.json', root), 'utf8'));
const target = new URL('src/app/fonts/', root);
mkdirSync(target, { recursive: true });
for (const [name, font] of Object.entries(fonts)) {
  if (!/^[a-z0-9-]+\.woff2$/.test(name)) throw new Error('Invalid font filename');
  const bytes = Buffer.from(font.base64, 'base64');
  if (createHash('sha256').update(bytes).digest('hex') !== font.sha256) throw new Error(`Font hash mismatch: ${name}`);
  writeFileSync(new URL(name, target), bytes);
}
console.log(`Prepared ${Object.keys(fonts).length} licensed local fonts`);
