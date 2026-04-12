'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/chisel';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function getSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const bodyObj = { message, content: encoded };
  if (sha) bodyObj.sha = sha;
  const bodyStr = JSON.stringify(bodyObj);
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, bodyStr);
  const label = res.status === 201 ? 'created' : res.status === 200 ? 'updated' : `err:${res.status}`;
  console.log(`  ${filePath} → ${label}`);
}

const notesContent = `# CHISEL — Heartbeat

**Theme**: Dark
**App**: AI-powered pull-request analytics dashboard for developer teams
**Elements**: 579
**Screens**: 6

## Palette
- BG L0: \`#080A0D\` — deepest navy-black (page background)
- BG L1: \`#0F1218\` — card surface
- BG L2: \`#161B24\` — raised card / elevated element
- BG L3: \`#1E2530\` — modal / hover state
- Accent: \`#F59E0B\` — electric amber (primary interactive)
- Accent2: \`#3B82F6\` — blue (secondary/status)
- Green: \`#10B981\` — success/merged
- Red: \`#EF4444\` — error/conflicts
- Purple: \`#8B5CF6\` — review-requested state
- Text: \`#E2E8F0\` — primary text
- Muted: \`#94A3B8\` — secondary text

## Research Sources
- Godly.website: "Technical Mono / Code Brutalism" category — Vercel's terminal-like marketing site, PlayerZero.ai stark B&W grid, Factory AI text-heavy mono. Inspired the monospace type pairing and code-adjacent aesthetic.
- DarkModeDesign.com: Raycast design system — single electric accent (#FF6363) on near-black surfaces. Inspired the amber single-accent strategy and 4-level surface depth system.
- Saaspo.com: Developer tool SaaS pages — bento grid feature layouts, embedded product demos, Stripe-adjacent surface layering. Inspired the bento stats grid on the Dashboard screen.

## 3 Key Decisions
1. **4-level surface depth without borders**: Used #080A0D → #0F1218 → #161B24 → #1E2530 for hierarchy — following the Vercel/Linear pattern of layered greys instead of card outlines. Subtler and more polished.
2. **Single amber accent, no competition**: Every interactive element — CTAs, active tabs, links, glow effects, metric highlights — uses only #F59E0B. Nothing else is coloured except status indicators (green/red/blue for pass/fail/review). This makes the amber feel electric.
3. **JetBrains Mono for all numbers and PR identifiers**: All metrics, PR numbers, commit hashes, line counts use monospace. Everything else uses Inter. The typeface split signals "machine data" vs "human copy" — a pattern common to Raycast, Linear, and Cursor.

## Links
- Design: https://ram.zenbin.org/chisel
- Viewer: https://ram.zenbin.org/chisel-viewer
- Mock: https://ram.zenbin.org/chisel-mock
`;

async function main() {
  const generatorJs = fs.readFileSync(path.join(__dirname, 'chisel-app.js'), 'utf8');
  const penJson = fs.readFileSync(path.join(__dirname, 'chisel.pen'), 'utf8');

  await putFile(`${BASE_PATH}/generator.js`, generatorJs, 'archive: CHISEL generator script');
  await putFile(`${BASE_PATH}/design.pen`, penJson, 'archive: CHISEL design.pen');
  await putFile(`${BASE_PATH}/notes.md`, notesContent, 'archive: CHISEL notes');

  console.log('Archive complete ✓');
}
main().catch(console.error);
