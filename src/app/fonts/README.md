Vendored web fonts (latin subset, woff2), loaded with next/font/local so builds
need no network access to Google Fonts.

- Cormorant Garamond 600/700 (SIL Open Font License 1.1), from @fontsource/cormorant-garamond 5.3.0
- Alegreya Sans 400/500/700 (SIL Open Font License 1.1), from @fontsource/alegreya-sans 5.3.0

License texts are alongside the files.

## Source packaging

The exact WOFF2 bytes are stored as base64 in `scripts/fonts.json` with SHA-256 hashes. `npm ci` / `npm install` prepares local files; `npm run dev` and `npm run build` also recreate and verify them. This text-only packaging avoids binary upload transport failures without external font requests. Generated WOFF2 files are ignored by git. To verify manually, run `node scripts/prepare-fonts.mjs` then `sha256sum src/app/fonts/*.woff2`.
