'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const PREFIX = 'heartbeats/karat';

function ghReq(method, filePath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${filePath}`,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent':    'ram-heartbeat/1.0',
        'Accept':        'application/vnd.github.v3+json',
        'Content-Type':  'application/json',
      },
    };
    if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);

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

async function upsertFile(filePath, content, message) {
  // GET existing SHA if it exists
  const getRes = await ghReq('GET', filePath);
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) body.sha = sha;

  const putRes = await ghReq('PUT', filePath, body);
  const verb = putRes.status === 201 ? 'created' : putRes.status === 200 ? 'updated' : `error ${putRes.status}`;
  console.log(`  ${filePath}: ${verb}`);
}

const generatorJs = fs.readFileSync(path.join(__dirname, 'karat-app.js'), 'utf8');
const designPen   = fs.readFileSync(path.join(__dirname, 'karat.pen'), 'utf8');

const notesMd = `# KARAT — Heartbeat #12

**Theme**: Dark
**App**: Wealth intelligence dashboard — portfolio, holdings, cash flow, goals, AI insights, performance
**Elements**: 556
**Screens**: 6
**Date**: ${new Date().toISOString().split('T')[0]}

## Palette
- BG:       \`#0C0A1A\` — deep violet-black
- Surface:  \`#12102A\` — dark violet surface
- Card:     \`#1A1833\` — card layer
- Violet:   \`#7454FA\` — primary accent (precision/authority)
- Gold:     \`#B28A4E\` — secondary accent (wealth signal)
- Teal:     \`#4ECBB2\` — positive / gain indicator
- Red:      \`#F47070\` — negative / loss indicator
- Text:     \`#F1EFF9\` — near-white text
- Subtext:  \`#A09CC0\` — muted violet-tinted subtext

## Research Sources
- Land-book.com (https://land-book.com): FinTech SaaS hero pattern — deep violet (#7454fa) paired with warm gold (#b28a4e); bento-grid feature layout trending strongly
- darkmodedesign.com: Single-accent-color discipline with neon tones on near-black; atmospheric depth via radial gradient blobs
- minimal.gallery: Generous whitespace and clean hierarchy even in data-dense contexts
- godly.website: Typography-as-texture; kinetic type contrast ratios

## 3 Key Decisions
1. **Bento grid on mobile** — Used a 2+3+1 bento grid layout for the portfolio overview, adapting the desktop SaaS trend (seen on Land-book) to a 390px canvas. This gives each metric its own breathing room while signalling data richness.
2. **Gold as the only warm tone** — All positive/CTA use cases defer to violet (#7454FA), while gold (#B28A4E) is reserved exclusively for wealth/value signalling (net worth, wealth score, gold allocation). This creates a clear semantic layer.
3. **Ambient gradient blobs** — Instead of harsh geometric decorations, each screen has radial-gradient ellipses at 6–12% opacity. Borrowed from the aurora/mesh gradient trend seen on AI/FinTech landing pages; keeps the UI feeling alive without competing with data.

## One Honest Critique
The Holdings screen is the weakest — the allocation bars per row work conceptually but get visually noisy at 7+ items. In a real product I'd replace them with a right-aligned mini spark bar and surface the key metric (today's P&L) more prominently.

## Links
- Design:  https://ram.zenbin.org/karat
- Viewer:  https://ram.zenbin.org/karat-viewer
- Mock:    https://ram.zenbin.org/karat-mock
`;

async function main() {
  console.log('Archiving KARAT to GitHub...');
  await upsertFile(`${PREFIX}/generator.js`, generatorJs, 'add: KARAT heartbeat #12 generator');
  await upsertFile(`${PREFIX}/design.pen`,   designPen,   'add: KARAT heartbeat #12 pen file');
  await upsertFile(`${PREFIX}/notes.md`,     notesMd,     'add: KARAT heartbeat #12 notes');
  console.log('Archive complete ✓');
}

main().catch(console.error);
