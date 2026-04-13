'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'rift';

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

async function putFile(filePath, content, message) {
  // Try GET first for SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) body.sha = JSON.parse(getRes.body).sha;
  const putBody = JSON.stringify(body);
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  return putRes.status;
}

const notes = `# RIFT — Heartbeat #468

**Theme**: Dark
**App**: Engineering health & DORA metrics mobile dashboard
**Elements**: 579
**Screens**: 6

## Palette
- BG: \`#0A0E14\` — deep navy-black
- SURF: \`#0F1923\` — deep navy surface
- CARD: \`#142232\` — elevated card
- CARD2: \`#1C2E40\` — higher elevation
- ACC: \`#00D4FF\` — electric cyan
- ACC2: \`#7FFF00\` — chartreuse (positive metrics)
- RED: \`#FF4F5E\` — error/incident
- AMBER: \`#FFB347\` — warning
- TEXT: \`#E8F4F8\` — cool white

## Research Sources
- Land-book.com (Fintech/Data Dark palette D): deep navy #0F1923 + #00D4FF cyan + #7FFF00 chartreuse for data points
- Saaspo.com (Linear Look): near-black foundations, barely-visible rgba(255,255,255,0.08) borders, monospace accent colors
- darkmodedesign.com: tonal elevation system — four surface levels with no drop shadows, Material Design 3 approach
- godly.website: bento-grid asymmetric layouts used as the DORA metric card pattern

## 3 Key Decisions
1. **Warm-tinted dark over cold gray**: #0A0E14 has a barely perceptible blue-navy warmth vs pure #121212, preventing clinical sterility while maintaining the dark engineering aesthetic
2. **Chartreuse (#7FFF00) for positive metrics only**: Strict semantic color — ACC (cyan) for neutral/data, ACC2 (chartreuse) for improvement/positive, RED for error, AMBER for warning — zero ambiguity in data-dense screens
3. **Monospace data language with distinct color (#A8D4E8)**: All numeric values, commit SHAs, and service names use a separate lighter blue-grey mono color, visually separating data from labels without additional font weight

## Links
- Design: https://ram.zenbin.org/rift
- Viewer: https://ram.zenbin.org/rift-viewer
- Mock: https://ram.zenbin.org/rift-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'rift-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'rift.pen'),    'utf8');

  const base = `heartbeats/${SLUG}`;
  const [s1, s2, s3] = await Promise.all([
    putFile(`${base}/generator.js`, generatorSrc, `archive: ${SLUG} generator (heartbeat #468)`),
    putFile(`${base}/design.pen`,   penContent,   `archive: ${SLUG} pen (heartbeat #468)`),
    putFile(`${base}/notes.md`,     notes,        `archive: ${SLUG} notes (heartbeat #468)`),
  ]);
  console.log(`Archive: generator=${s1} pen=${s2} notes=${s3}`);
  console.log(s1 <= 201 && s2 <= 201 && s3 <= 201 ? '✓ All files archived' : '⚠ Some files may have issues');
}
main().catch(console.error);
