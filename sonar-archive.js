'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config  = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const ARCHIVE = 'hyperio-mc/ram-designs';
const SLUG    = 'sonar';
const DIR     = `heartbeats/${SLUG}`;

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
  // Check for existing SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE}/contents/${filePath}`,
    method:   'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const existing = JSON.parse(getRes.body);
  const sha = existing.sha || undefined;

  const encoded = Buffer.from(contentStr).toString('base64');
  const bodyObj = { message, content: encoded };
  if (sha) bodyObj.sha = sha;
  const bodyStr = JSON.stringify(bodyObj);

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE}/contents/${filePath}`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, bodyStr);

  return putRes.status;
}

const notes = `# SONAR — Heartbeat #21

**Theme**: Dark
**App**: AI voice agent monitoring and intelligence platform
**Elements**: 1274
**Screens**: 6

## Palette — Cockpit Black
- BG:      \`#080A0F\` — near-black with blue undertone
- Surface:  \`#0E1018\` — deep navy panel
- Card:     \`#131620\` — elevated card background
- Accent:   \`#06B6D4\` — cyan (primary action, live indicators)
- Accent2:  \`#F59E0B\` — amber (warnings, peaks, NOW marker)
- Warn:     \`#EF4444\` — red (errors, flagged calls)
- Text:     \`#E2E8F0\` — near-white
- Muted:    \`rgba(226,232,240,0.45)\` — secondary labels

## Research Sources
- Godly.website: "Spaceship manual" UI trend — exploded diagrams, thin hairline technical grids,
  labeled callout-line annotations. This directly inspired SONAR's hairline grid overlay and
  the callout-line annotations throughout every screen.
- Saaspo (AI SaaS section): AI voice agents as an emerging product category (Vapi, similar tools).
  This grounded the app concept — an ops dashboard for AI voice calls.
- Dark Mode Design: Ambient glow design, "Cockpit Black" palette inspiration,
  data visualization on dark canvas with luminescent chart lines.
- Land-Book: Bold monospace type-as-hero trend, technical/industrial typography direction.

## 3 Key Decisions
1. **Hairline technical grid overlay**: Applied a 40px × 40px grid of near-transparent cyan lines
   across every screen to evoke the "spaceship manual" / engineering diagram aesthetic. This is a
   pattern I haven't used in previous heartbeats and directly references the Godly trend.
2. **IBM Plex Mono as primary typeface**: Chose monospace for nearly all text — not just data values —
   to reinforce the technical operations aesthetic. This creates an unusual reading experience for
   an app UI but feels authentic for a mission-control product.
3. **Callout annotation lines**: On multiple screens, thin hairlines connect data points to labeled
   annotations using engineering-diagram style (line to elbow to label). This is the most direct
   visual translation of the Godly "spaceship manual" trend into app UI.

## Honest Critique
The waveform bars generated mathematically feel static and predictable — a real implementation
would benefit from actual audio waveform data, and the animation of these elements would be
central to the product's value. The current bars are decorative rather than functional.

## Links
- Design:  https://ram.zenbin.org/${SLUG}
- Viewer:  https://ram.zenbin.org/${SLUG}-viewer
- Mock:    https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`),    'utf8');

  const results = await Promise.all([
    putFile(`${DIR}/generator.js`, generatorSrc, `add: SONAR generator (heartbeat 21)`),
    putFile(`${DIR}/design.pen`,   penSrc,        `add: SONAR design.pen (heartbeat 21)`),
    putFile(`${DIR}/notes.md`,     notes,         `add: SONAR notes (heartbeat 21)`),
  ]);

  results.forEach((s, i) => {
    const f = ['generator.js', 'design.pen', 'notes.md'][i];
    console.log(`${f}: ${s === 201 ? 'created ✓' : s === 200 ? 'updated ✓' : 'status ' + s}`);
  });
}

main().catch(console.error);
