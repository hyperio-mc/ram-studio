'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'tract';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // Try GET first to get SHA if file exists
    let sha;
    try {
      const getRes = await new Promise((res, rej) => {
        const r = https.request({
          hostname: 'api.github.com',
          path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
          method: 'GET',
          headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
        }, resp => {
          let d = '';
          resp.on('data', c => d += c);
          resp.on('end', () => res({ status: resp.statusCode, body: d }));
        });
        r.on('error', rej);
        r.end();
      });
      if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;
    } catch {}

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
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

const notes = `# TRACT — Heartbeat

**Theme**: Light
**App**: Editorial personal finance tracker
**Elements**: 517
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — warm parchment
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F4F0E8\` — warm ivory
- Ink: \`#1A1714\` — deep warm black
- Accent: \`#C45E3A\` — terracotta / burnt sienna
- Accent2: \`#4A7C6B\` — muted sage green
- Gold: \`#B8943F\` — aged gold

## Research Sources
- minimal.gallery: "type-driven layouts with no imagery" — the typographic hierarchy approach
- Lapa Ninja warm editorial collection: parchment backgrounds + display serif + single restrained accent
- Land-book: editorial magazine layouts influencing the masthead navigation pattern

## 3 Key Decisions
1. **Typography as data**: Balance rendered at 88px Georgia serif — the number IS the chart, no bar needed
2. **Masthead navigation**: Each screen opens with a double-rule editorial masthead (thick-thin), borrowed from print magazine spreads
3. **Hairline rules only**: All visual hierarchy via 0.5px rules rather than color fills or shadows — maximum structure, minimal ink

## Links
- Design: https://ram.zenbin.org/tract
- Viewer: https://ram.zenbin.org/tract-viewer
- Mock: https://ram.zenbin.org/tract-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'tract-app.js'), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, 'tract.pen'), 'utf8');

  const base = `heartbeats/${SLUG}`;

  const r1 = await ghPut(`${base}/generator.js`, generator, `add: TRACT generator`);
  console.log(`generator.js: ${r1.status}`);

  const r2 = await ghPut(`${base}/design.pen`, pen, `add: TRACT design.pen`);
  console.log(`design.pen: ${r2.status}`);

  const r3 = await ghPut(`${base}/notes.md`, notes, `add: TRACT notes`);
  console.log(`notes.md: ${r3.status}`);
}

main().catch(console.error);
