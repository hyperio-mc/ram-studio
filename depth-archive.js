'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'depth';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function putFile(filePath, content, message) {
  // Check if exists first
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    body.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(body);
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status;
}

const notesContent = `# DEPTH — Heartbeat #331

**Theme**: Dark
**App**: AI organizational memory layer for engineering teams
**Elements**: 543
**Screens**: 6
**Date**: 2026-04-08

## Palette
- BG: \`#080A12\` — deep navy-black
- Surface: \`#0F1120\` — elevated surface
- Card: \`#161828\` — card background
- Accent: \`#818CF8\` — indigo-lavender (dominant in AI SaaS)
- Accent2: \`#34D399\` — emerald green
- Accent3: \`#F472B6\` — pink for memory/recall tags
- Text: \`#E0E2F4\` — soft white
- TextMid: \`#9EA3C0\` — secondary text
- TextDim: \`#5A5F7E\` — muted/labels

## Research Sources
- Godly.website: Limitless.ai featured as top AI memory/capture tool (39,750 views) — ambient cross-platform context capture inspired DEPTH's core concept
- Saaspo.com: AI SaaS is the #1 category with 219 curated examples — indigo-lavender palette confirmed as dominant accent in this space
- DarkModeDesign.com: Neon.tech, Cushion — developer/finance tools using dark mode as professional credibility signal
- Land-book.com: Bento grid confirmed as dominant feature layout pattern for SaaS

## 3 Key Decisions
1. **Indigo-lavender accent (#818CF8)**: Directly validated by Saaspo's AI SaaS category analysis as the dominant accent color for AI products in 2026 — signals intelligence, precision, and trust without the coldness of pure blue.
2. **Bento grid on Command Home**: Land-book and Saaspo both confirmed bento as the dominant feature layout. Applied it to the home screen to surface multiple capture types (decisions, runbooks, signals) at a glance without hierarchy collapse.
3. **AI Query screen as dedicated flow**: Inspired by Limitless.ai's core UX — the query interface is a first-class screen rather than a search overlay, reflecting that AI question-answering is the primary value proposition.

## One Honest Critique
The Knowledge Graph screen (Screen 4) approximates a node graph with circles and lines but lacks the visual density of a real force-directed graph — a canvas-based rendering would be far more compelling in a real product.

## Links
- Design: https://ram.zenbin.org/depth
- Viewer: https://ram.zenbin.org/depth-viewer
- Mock: https://ram.zenbin.org/depth-mock
`;

async function main() {
  const generatorContent = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const basePath = `heartbeats/${SLUG}`;
  const results = await Promise.all([
    putFile(`${basePath}/generator.js`, generatorContent, `archive: DEPTH generator (heartbeat #331)`),
    putFile(`${basePath}/design.pen`, penContent, `archive: DEPTH design.pen (heartbeat #331)`),
    putFile(`${basePath}/notes.md`, notesContent, `archive: DEPTH notes (heartbeat #331)`),
  ]);

  results.forEach((status, i) => {
    const files = ['generator.js', 'design.pen', 'notes.md'];
    console.log(`Archive ${files[i]}: ${status === 201 ? 'created ✓' : status === 200 ? 'updated ✓' : `status ${status}`}`);
  });
}

main().catch(console.error);
