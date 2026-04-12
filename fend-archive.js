'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'fend';
const DIR  = `heartbeats/${SLUG}`;

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

async function getExistingSha(filepath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filepath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function pushFile(filepath, content, message) {
  const sha = await getExistingSha(filepath);
  const encoded = Buffer.from(content).toString('base64');
  const body = JSON.stringify({
    message,
    content: encoded,
    ...(sha ? { sha } : {}),
  });

  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filepath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);

  const statusWord = res.status === 201 ? 'created' : res.status === 200 ? 'updated' : `error ${res.status}`;
  console.log(`  ${filepath}: ${statusWord}`);
}

const notes = `# FEND — Threat Intelligence Platform

**Theme**: Dark
**Heartbeat**: Auto
**Slug**: fend
**Elements**: 521
**Screens**: 6

## Palette
- BG:      \`#080B10\` — near-black navy
- Surface: \`#0E1219\` — elevated surface
- Card:    \`#141A25\` — card background
- Text:    \`#E2E8F4\` — warm off-white
- Accent:  \`#F97316\` — amber-orange (security alert urgency)
- Accent2: \`#38BDF8\` — sky blue (data highlights)
- Green:   \`#22C55E\` — safe/clear
- Red:     \`#EF4444\` — critical

## Research Sources
- darkmodedesign.com: Developer-minimal dark aesthetic (Vercel/Linear/Raycast). Observed that pure black is avoided; #0d0d0d–#1e1e1e is the real standard. Single accent color convention.
- land-book.com: "Oversized stat as headline" pattern — entire hero anchored by one huge number (e.g. "$2.4B processed", "47M users"). Applied as 2,847 threats today at 72–140px.
- saaspo.com: Bento grid dominance in SaaS feature sections. 67% of top PH launches now use bento. Applied to threat category breakdown cards.
- godly.website: Cinematic dark with grain/texture as trust signal. Applied as subtle noise overlay on hero page. AI SaaS purple saturation called out explicitly — avoided.

## 3 Key Decisions
1. **Amber-orange accent over purple**: Saaspo research showed AI SaaS dark+purple+gradient is fully saturated/generic. Amber-orange reads as alert urgency AND differentiates sharply.
2. **Oversized hero stat**: Entire first screen anchored by "2,847" at 72px — the threat count IS the headline. Direct citation of land-book's "number as hero" pattern.
3. **Bento grid threat breakdown**: Critical/High/Medium/Low/Resolved counts in bento-layout cards, not a table or list. Each card has a 2px color-coded top strip for instant scan.

## Honest Critique
The incident detail screen (screen 3) is dense but the timeline and payload sections compete for attention — a real forensics tool would probably collapse one behind a tab, not stack them vertically.

## Links
- Design: https://ram.zenbin.org/fend
- Viewer: https://ram.zenbin.org/fend-viewer
- Mock:   https://ram.zenbin.org/fend-mock
`;

(async () => {
  console.log(`Archiving ${SLUG} to GitHub...`);
  const generatorSrc  = fs.readFileSync(path.join(__dirname, 'fend-app.js'), 'utf8');
  const penContent    = fs.readFileSync(path.join(__dirname, 'fend.pen'), 'utf8');

  await pushFile(`${DIR}/generator.js`, generatorSrc, `archive: FEND generator script`);
  await pushFile(`${DIR}/design.pen`,  penContent,    `archive: FEND design.pen (521 elements, 6 screens)`);
  await pushFile(`${DIR}/notes.md`,    notes,         `archive: FEND design notes`);
  console.log('Archive complete.');
})();
