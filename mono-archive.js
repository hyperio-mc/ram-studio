'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const DIR    = 'heartbeats/mono';

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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
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

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
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
  }, body);
  return res.status;
}

const notesContent = `# MONO — Heartbeat #14

**Theme**: Dark (monochromatic)
**App**: Personal finance tracker — numbers stripped bare
**Elements**: 506
**Screens**: 6

## Palette
- BG:      \`#080808\` — near-total black
- Surface: \`#0F0F0F\` — 1 step up
- Card:    \`#181818\` — 2 steps up
- Border:  \`#262626\` — subtle dividers
- Text 1:  \`#FFFFFF\` — primary (100% white)
- Text 2:  \`rgba(255,255,255,0.65)\` — secondary
- Text 3:  \`rgba(255,255,255,0.38)\` — muted
- Text 4:  \`rgba(255,255,255,0.18)\` — ghost/placeholder
- **Zero color accents** — pure monochrome

## Research Sources
- DarkModeDesign.com — Uptec: zero-color monochromatic palette, alternating solid/hollow letterforms, geometric structure, fluid animation. This was the primary design inspiration.
- Godly.website — typography-as-layout trend: oversized type functioning as background texture simultaneously
- Saaspo.com — minimal SaaS financial product patterns, information density
- Land-book.com — monochromatic confidence: solid/single-hue palettes as premium signal

## 3 Key Decisions
1. **Hollow/Stroke Text (Uptec pattern)**: Every alternate label renders as stroke-only (fill: none, stroke: rgba(255,255,255,0.7)). This creates visual rhythm without using color — hierarchy through letterform weight rather than hue.
2. **Ghost Background Numbers**: Oversized numbers (140–280px) at 6% opacity and 0.4px stroke float behind each screen as simultaneous data and texture, collapsing decoration and content into a single element.
3. **Opacity as Data Variable**: Progress bars and category bars use white at varying opacity (0.3–1.0) as the only data-encoding dimension. No color channels are ever used to represent information — only luminosity.

## Honest Critique
The purely monochromatic approach works visually but sacrifices important affordances: on the Transactions screen, positive (income) and negative (expense) amounts are visually identical except for the +/- symbol. Color would be a meaningful data channel there, not decoration.

## Links
- Design: https://ram.zenbin.org/mono
- Viewer: https://ram.zenbin.org/mono-viewer
- Mock:   https://ram.zenbin.org/mono-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'mono-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'mono.pen'), 'utf8');

  const s1 = await putFile(`${DIR}/generator.js`, generatorSrc, 'archive: MONO generator (heartbeat #14)');
  console.log(`generator.js: ${s1} ${s1 === 201 || s1 === 200 ? '✓' : 'ERR'}`);

  const s2 = await putFile(`${DIR}/design.pen`, penContent, 'archive: MONO design.pen (heartbeat #14)');
  console.log(`design.pen: ${s2} ${s2 === 201 || s2 === 200 ? '✓' : 'ERR'}`);

  const s3 = await putFile(`${DIR}/notes.md`, notesContent, 'archive: MONO notes.md (heartbeat #14)');
  console.log(`notes.md: ${s3} ${s3 === 201 || s3 === 200 ? '✓' : 'ERR'}`);
}
main().catch(console.error);
