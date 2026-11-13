# Avalon redesign verification

## Passed on a clean published-branch checkout

- `npm ci` with Node 22.23.4.
- `HTTPS_PROXY=http://127.0.0.1:9 npm run build`: production build without a reachable font proxy.
- `npx eslint src` and `git diff --check`.
- `node scripts/selftest.mts`: all 127 existing engine assertions; `src/lib/avalon.ts` unchanged.
- Font decode: all five generated WOFF2 SHA-256 hashes match the accepted vendored files and embedded hashes; no network font dependency.
- Production Chromium flow: create table, add five players, deal/reveal roles, propose a team, approval votes, quest votes and result.
- Twelve seeded game states at desktop/mobile sizes, including ten-player lobby, proposals, rejection/approval, quest/failure, Assassin and both outcomes: no horizontal overflow or page errors.
- Real mouse and emulated CDP touchscreen hold-to-reveal: sealed before hold, revealed during hold, hidden on release. Space and Enter hold work; keyup and Tab-away hide; short taps stay sealed.
- Temporary static-export build with `/avalon` basePath and trailing slash: local assets load and create/add/deal reaches role reveal without request/page errors. This check does not change the checked-in default Next config or deploy anything.
- Final desktop/mobile screenshots inspected for readable layout, role reveal, Assassin and result states.

## Untested and limits

- Physical phones, Safari/Firefox, screen readers (VoiceOver/NVDA), and live GitHub Pages rebuild/deployment were not tested.
- No realtime backend, cross-device room sync, authentication or server-side secrecy. Game state, including roles, is localStorage data. Hold-to-reveal prevents accidental peeking, not a malicious player inspecting their browser.
- Rooms only resume where local state exists. Clearing storage loses games. Clipboard APIs depend on browser permissions/secure context.
- Existing audit findings: 17 total (2 low, 4 moderate, 10 high, 1 critical). Affected packages: `@eslint/plugin-kit`, `@humanfs/node`, `ajv`, `brace-expansion`, `eslint`, `flatted`, `glob`, `js-yaml`, `minimatch`, `nanoid`, `next`, `picomatch`, `postcss`, `postcss-selector-parser`, `sharp`, `source-map-js`, `yaml`. Dependency remediation is not part of this visual/interaction PR. In particular, the existing Next 15.1.4 and related build dependencies remain unchanged.
- This is an unmerged review candidate. No production deployment or settings change was performed.
