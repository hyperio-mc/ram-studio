'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/kova';

function ghReq(method, filePath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${filePath}`,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(bodyStr ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

async function upsertFile(filePath, content, message) {
  // Try GET first to get SHA
  const getRes = await ghReq('GET', filePath);
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const putBody = {
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  };
  const putRes = await ghReq('PUT', filePath, putBody);
  return putRes.status;
}

const notesContent = `# KOVA — Heartbeat #447

**Theme**: Dark
**App**: Premium wealth intelligence platform — portfolio overview, markets, AI insights, activity, account, equity detail
**Elements**: 685
**Screens**: 6

## Palette
- BG: \`#0F0D0A\` — Deep Obsidian
- Surface: \`#16130F\` — Warm Near-Black
- Card: \`#1E1A14\` — Elevated Card
- Accent: \`#D4A574\` — Antique Gold
- Accent2: \`#E8C07D\` — Warm Gold
- Text: \`#F5EDE0\` — Warm White
- Text2: \`#C9B89A\` — Parchment
- Muted: \`#7A6B57\` — Umber
- Green: \`#6BBF7A\` — Sage Growth
- Red: \`#E05A4E\` — Signal Red

## Research Sources
- DarkModeDesign.com: "Warm Charcoal + Gold" luxury dark palette (#1C1917 bg, #D4A574 accent) — inspired entire palette direction
- Saaspo.com: Bento grid hegemony trend — 67% of top ProductHunt SaaS use bento grids for feature/allocation sections
- Land-book.com: Left color bars as identity encoding — saw multiple examples using vertical accent lines to color-code card categories
- DarkModeDesign.com: Elevation-based hierarchy replacing drop shadows in dark interfaces — drives card layering system

## 3 Key Decisions
1. **Warm near-black instead of pure black**: #0F0D0A feels premium and prevents the cold harshness of #000000 in financial contexts — warmth signals trust and stability
2. **Bento grid for portfolio allocations**: Instead of a pie chart (overused in finance), four equal-size bento cards with left color bars encode asset class identity while maintaining spatial equality
3. **Priority-coded AI insight cards**: Three-tier system (HIGH/MEDIUM/LOW) with red/gold/green left bars lets wealth managers triage recommendations at a glance — each card ends with a direct action CTA

## Links
- Design: https://ram.zenbin.org/kova
- Viewer: https://ram.zenbin.org/kova-viewer
- Mock: https://ram.zenbin.org/kova-mock
`;

async function main() {
  const generatorContent = fs.readFileSync(path.join(__dirname, 'kova-app.js'), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, 'kova.pen'), 'utf8');

  const s1 = await upsertFile(`${BASE}/generator.js`, generatorContent, 'add: KOVA generator (heartbeat #447)');
  console.log(`generator.js: ${s1 === 201 ? 'created' : s1 === 200 ? 'updated' : 'status ' + s1}`);

  const s2 = await upsertFile(`${BASE}/design.pen`, penContent, 'add: KOVA design.pen (heartbeat #447)');
  console.log(`design.pen: ${s2 === 201 ? 'created' : s2 === 200 ? 'updated' : 'status ' + s2}`);

  const s3 = await upsertFile(`${BASE}/notes.md`, notesContent, 'add: KOVA notes (heartbeat #447)');
  console.log(`notes.md: ${s3 === 201 ? 'created' : s3 === 200 ? 'updated' : 'status ' + s3}`);
}

main().catch(console.error);
