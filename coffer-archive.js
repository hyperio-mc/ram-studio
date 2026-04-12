'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/coffer';

function ghReq(method, repoPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${repoPath}`,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    if (bodyStr) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

async function upsertFile(repoPath, content, message) {
  // Check if file exists for SHA
  const getRes = await ghReq('GET', repoPath);
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) body.sha = sha;
  const res = await ghReq('PUT', repoPath, body);
  return res.status;
}

const notes = `# Coffer — Heartbeat #465

**Theme**: Light (warm off-white)
**App**: Personal wealth tracker — net worth, portfolio, transactions, goals, analytics
**Elements**: 483
**Screens**: 6

## Palette
- BG: \`#F9F7F2\` — warm off-white (NoGood inspired)
- Surface: \`#FFFFFF\` — pure white cards
- Card: \`#EDE8DE\` — warm card background
- Text: \`#1C1C1A\` — deep charcoal
- Muted: \`#9A948C\` — warm gray
- Accent: \`#1A5C40\` — forest green (money/growth)
- AccentLight: \`#EAF4EE\` — light green tint
- Lime: \`#C8E83A\` — lime-yellow signal (NoGood inspired)
- Border: \`#E0DAD0\` — warm border
- Red: \`#C0392B\` — expense/negative

## Research Sources
- minimal.gallery — NoGood (nogood.studio): warm off-white #FAF8F3, lime accent #d8ff7c, retro bitmap aesthetic, soundbar animations
- minimal.gallery — Old Tom Capital (oldtomcapital.com): Geist Mono as the sole typeface for a finance brand — monospace in non-developer context
- minimal.gallery — Tayte.co: Montreal Medium at uniform size, minimal hierarchy through spacing not scale
- lapa.ninja — SaaS category: bento grid patterns, horizontal logo carousels, 3-tier pricing structures

## 3 Key Decisions
1. **Warm off-white over pure white**: Background is #F9F7F2 not #FFFFFF — gives warmth and prevents cold clinical feel. Directly from NoGood's palette.
2. **Monospace for all financial figures**: Every currency value uses font-family:monospace — borrowed from Old Tom Capital's bold Geist Mono branding choice. Numbers align cleanly and feel precise.
3. **Lime as a single signal color**: #C8E83A appears only for positive outcomes (goals achieved, budget on track) — one accent used with strict discipline rather than decoratively.

## Honest Critique
The donut chart on screen 2 is simulated with horizontal bars rather than a real SVG arc — functional but not as visually impactful as a proper radial chart would be.

## Links
- Design: https://ram.zenbin.org/coffer
- Viewer: https://ram.zenbin.org/coffer-viewer
- Mock: https://ram.zenbin.org/coffer-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'coffer-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'coffer.pen'), 'utf8');

  const r1 = await upsertFile(`${BASE}/generator.js`, generator, 'archive: coffer generator (heartbeat #465)');
  console.log(`generator.js: ${r1}`);

  const r2 = await upsertFile(`${BASE}/design.pen`, pen, 'archive: coffer design.pen (heartbeat #465)');
  console.log(`design.pen:   ${r2}`);

  const r3 = await upsertFile(`${BASE}/notes.md`, notes, 'archive: coffer notes.md (heartbeat #465)');
  console.log(`notes.md:     ${r3}`);
}

main().catch(console.error);
