'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'loop';
const HB     = 503;

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

async function putFile(filePath, contentStr, message) {
  // Check if file exists (get SHA if so)
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
  const encoded = Buffer.from(contentStr).toString('base64');
  const payload = { message, content: encoded };
  if (getRes.status === 200) {
    payload.sha = JSON.parse(getRes.body).sha;
  }
  const body = JSON.stringify(payload);
  const putRes = await ghReq({
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
  return putRes.status;
}

const notesContent = `# LOOP — Heartbeat #${HB}

**Theme**: Dark
**App**: AI-powered user behavior analytics platform
**Elements**: 507
**Screens**: 6

## Palette
- BG: \`#09090B\` — zinc 950
- Surface: \`#111113\` — zinc 900
- Card: \`#19191F\` — elevated zinc
- Border: \`#2A2A35\` — hairline dividers
- Text: \`#F4F4F5\` — zinc 100
- Muted: \`#71717A\` — zinc 500
- Accent: \`#F97316\` — orange (rising brand color 2026)
- Accent2: \`#8B5CF6\` — violet (tech differentiation)
- Accent3: \`#06B6D4\` — cyan (data emphasis)
- Positive: \`#22C55E\` — green

## Research Sources
- godly.website: "Spaceship Instruction Manual" UI aesthetic — thin hairlines, measurement labels, monospace annotations, exploded-view precision. Applied throughout: monospace metric labels, hairline rulers between sections, measurement tick marks on charts.
- darkmodedesign.com: Zinc-family bento grid dark systems. Zinc-950 baseline (#09090B), layered elevation through lightness. Bento grid on Overview screen mirrors the asymmetric bento pattern trending in dark-mode dashboards.
- saaspo.com: AI SaaS dominance — AI-generated insights as a core product feature (not a bolt-on). LOOP's AI Insights screen reflects this: pattern detection, anomaly surfacing, cross-session synthesis surfaced as primary navigation item.

## 3 Key Decisions
1. **Orange as primary accent** (#F97316): Moving away from the now-generic blue SaaS default. Orange signals urgency and energy, aligning with session replay / rage-click alerting context. Pairs with violet for a split-complementary palette that reads as technical without being cold.
2. **Monospace precision everywhere**: Session IDs, timestamps, metric labels, page paths — all rendered in monospace font. This is directly borrowed from godly.website's Spaceship Instruction Manual aesthetic. It creates density and technical credibility without requiring additional visual decoration.
3. **Health Score as session navigation model**: Instead of forcing users to watch every session, a 0–100 health score (AI-computed from rage clicks, dead ends, exit patterns) lets teams triage instantly. Displayed as a circle ring on session list cards — compact, scannable, immediately meaningful.

## One thing I'd change
The funnel screen is information-dense but the drop percentage annotations (shown at far right) get lost on narrow widths. They'd work better as inline callout chips directly on the bar.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

const generatorContent = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penContent        = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

async function main() {
  const base = `heartbeats/${SLUG}`;
  const r1 = await putFile(`${base}/generator.js`, generatorContent, `archive: LOOP generator (heartbeat #${HB})`);
  console.log(`generator.js: ${r1}`);
  const r2 = await putFile(`${base}/design.pen`, penContent, `archive: LOOP design.pen (heartbeat #${HB})`);
  console.log(`design.pen: ${r2}`);
  const r3 = await putFile(`${base}/notes.md`, notesContent, `archive: LOOP notes (heartbeat #${HB})`);
  console.log(`notes.md: ${r3}`);
  console.log('Archive complete ✓');
}

main().catch(console.error);
