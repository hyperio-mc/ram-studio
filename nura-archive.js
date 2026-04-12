'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'nura';
const BASE_PATH = `heartbeats/${SLUG}`;

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First try GET to get SHA if file exists
    const getSha = () => new Promise((res2) => {
      const r = https.request({
        hostname: 'api.github.com',
        path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
        method: 'GET',
        headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
      }, resp => {
        let d = '';
        resp.on('data', c => d += c);
        resp.on('end', () => {
          try { res2(JSON.parse(d).sha || null); } catch { res2(null); }
        });
      });
      r.on('error', () => res2(null));
      r.end();
    });

    const sha = await getSha();
    const body = JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    });

    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

const notes = `# NURA — Heartbeat Apr-10-2026

**Theme**: Dark
**App**: Cognitive performance tracker — neural state, focus sessions, HRV & recovery
**Elements**: 556
**Screens**: 6

## Palette (Electric Bioluminescence)
- BG: \`#070B12\` — deep space black
- Surf: \`#0C1220\` — dark navy
- Card: \`#111A2E\` — elevated surface
- Accent: \`#00F5C3\` — bioluminescent teal (focus/active)
- Accent2: \`#A855F7\` — electric violet (AI/insight)
- Accent3: \`#F59E0B\` — amber glow (energy/warning)
- Text: \`#E2EBF9\` — cool white
- Border: \`#1E2E4A\` — subtle separation

## Research Sources
- Godly.website: Featured bioluminescent teal/violet on dark palettes in multiple SOTD picks; floating card systems with glassmorphism panel treatments
- DarkModeDesign.com: Near-black #121212 + single saturated neon accent pattern; glow/bloom effects on dark UIs
- Saaspo.com: Embedded interactive demo hero trend; floating card feature sections over gradient mesh backgrounds
- Land-Book.com: "Electric Bioluminescence" taxonomy as emerging macro-trend in dark landing pages

## 3 Key Decisions
1. **Gleam-edge cards**: Each card has a 2px colored top border matching its accent role (teal=active, violet=AI, amber=energy) — creates hierarchy without shadows in a dark UI
2. **Tricolor accent semantics**: Three accents each carry specific meaning throughout all 6 screens — never decorative, always semantic
3. **Neural score ring as hero**: The main dashboard leads with a large concentric ring showing the cognitive score — immediately communicates state with zero words needed

## Links
- Design: https://ram.zenbin.org/nura
- Viewer: https://ram.zenbin.org/nura-viewer
- Mock: https://ram.zenbin.org/nura-mock
`;

async function main() {
  const generatorJs = fs.readFileSync(path.join(__dirname, 'nura-app.js'), 'utf8');
  const penJson = fs.readFileSync(path.join(__dirname, 'nura.pen'), 'utf8');

  const r1 = await ghPut(`${BASE_PATH}/generator.js`, generatorJs, `add: NURA generator script`);
  console.log(`generator.js: ${r1.status}`);

  const r2 = await ghPut(`${BASE_PATH}/design.pen`, penJson, `add: NURA design.pen`);
  console.log(`design.pen: ${r2.status}`);

  const r3 = await ghPut(`${BASE_PATH}/notes.md`, notes, `add: NURA notes`);
  console.log(`notes.md: ${r3.status}`);
}

main().catch(console.error);
