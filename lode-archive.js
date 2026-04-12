'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config  = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const ARCHIVE = 'hyperio-mc/ram-designs';
const SLUG    = 'lode';
const BASE    = `heartbeats/${SLUG}`;

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // Try GET first for SHA (update vs create)
    const getReq = https.request({
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE}/contents/${filePath}`,
      method: 'GET',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        let sha;
        try { sha = JSON.parse(d).sha; } catch(_) {}
        const body = JSON.stringify({ message, content: Buffer.from(content).toString('base64'), ...(sha ? { sha } : {}) });
        const putReq = https.request({
          hostname: 'api.github.com',
          path: `/repos/${ARCHIVE}/contents/${filePath}`,
          method: 'PUT',
          headers: {
            'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
            'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
            'Accept': 'application/vnd.github.v3+json',
          },
        }, r => {
          let rd = ''; r.on('data', c => rd += c);
          r.on('end', () => resolve({ status: r.statusCode, body: rd }));
        });
        putReq.on('error', reject);
        putReq.write(body); putReq.end();
      });
    });
    getReq.on('error', reject);
    getReq.end();
  });
}

const notes = `# LODE — Heartbeat #43

**Theme**: Light
**App**: Codebase intelligence & technical debt tracker
**Elements**: 620
**Screens**: 6

## Palette
- BG: \`#F5F0E8\` — Warm Parchment
- Surface: \`#EDE8DF\` — Deep Cream
- Card: \`#E5DED3\` — Card Surface
- Rule: \`#C4BAA8\` — Hairline Rule
- Text: \`#1A1818\` — Near-Black
- Accent: \`#B85C38\` — Terracotta
- Accent2: \`#4A7C6F\` — Sage Green
- Muted: \`#7A7268\` — Warm Gray

## Research Sources
- Godly.website: "Spaceship Manual" technical documentation aesthetic — monospaced fonts, numbered callout labels, hairline rules, beige/parchment palette. NASA-grade seriousness as SaaS aesthetic.
- Lapa.ninja (Relace, March 2026): Gray-orange palette as AI challenger to purple saturation. Purple (#8B5CF6) has reached herd saturation; terracotta chosen as alternative authority signal.
- Minimal.gallery: One-accent-color rule — single restrained terracotta carries all brand weight, sage green reserved for positive states only.

## 3 Key Decisions
1. **Spaceship Manual aesthetic**: Monospace font throughout (not just code snippets), numbered callout labels (01, 02, 03), hairline rule dividers as section separators — treating developer tools as precision instruments, not consumer apps.
2. **Terracotta anti-purple**: Deliberately avoiding the violet/purple herd (#8B5CF6) that dominates AI/SaaS. Terracotta (#B85C38) signals warmth and earthy authority; sage green (#4A7C6F) for healthy/positive states only.
3. **Treemap heat view**: Codebase Map screen uses opacity encoding for debt density — higher debt = more saturated fill color — giving spatial at-a-glance debt reading without labels on the overview level.

## Links
- Design: https://ram.zenbin.org/lode
- Viewer: https://ram.zenbin.org/lode-viewer
- Mock: https://ram.zenbin.org/lode-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`),    'utf8');

  const r1 = await ghPut(`${BASE}/generator.js`, generatorSrc, `add: lode generator (heartbeat #43)`);
  console.log(`generator.js: ${r1.status}`);

  const r2 = await ghPut(`${BASE}/design.pen`, penSrc, `add: lode design.pen (heartbeat #43)`);
  console.log(`design.pen:   ${r2.status}`);

  const r3 = await ghPut(`${BASE}/notes.md`, notes, `add: lode notes (heartbeat #43)`);
  console.log(`notes.md:     ${r3.status}`);
}

main().catch(console.error);
