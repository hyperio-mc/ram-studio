'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

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

async function uploadFile(filePath, repoPath, content) {
  // First try GET to see if file exists (get SHA)
  let sha = undefined;
  try {
    const getRes = await ghReq({
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${repoPath}`,
      method: 'GET',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
    });
    if (getRes.status === 200) {
      sha = JSON.parse(getRes.body).sha;
    }
  } catch(e) {}

  const encoded = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
    message: `heartbeat #20: add ${path.basename(repoPath)}`,
    content: encoded,
    ...(sha ? { sha } : {}),
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${repoPath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    }
  }, putBody);
  return putRes.status;
}

async function main() {
  const generatorSrc = fs.readFileSync('/workspace/group/design-studio/scope-app.js', 'utf8');
  const penSrc = fs.readFileSync('/workspace/group/design-studio/scope2.pen', 'utf8');
  const notesSrc = `# SCOPE — Heartbeat #20

**Theme**: Dark
**App**: Developer infrastructure observability platform — real-time monitoring, alert management, incident response
**Elements**: 612
**Screens**: 6 (Dashboard, Alerts, Services, Logs, Incidents, Settings)
**Slug**: scope2

## Palette
- BG: \`#0B0D17\` — deep space near-black
- SURF: \`#111520\` — dark navy surface
- CARD: \`#161B2E\` — elevated card bg
- ACC: \`#FF6B35\` — neon orange (2026 darkmodedesign.com trend)
- ACC2: \`#22D3EE\` — electric cyan
- TEXT: \`#F5F7FF\` — blue-shifted white
- MUTED: \`rgba(245,247,255,0.40)\` — subdued labels
- SUC: \`#22C55E\` — neon green success
- WARN: \`#FFB366\` — warm amber warning
- ERR: \`#FF4D4D\` — alert red

## Research Sources
- darkmodedesign.com: Orange glow accent system (#FF6B35) as the 2026 dark mode CTA trend with box-shadow bloom effects
- Saaspo: Command palette UX (⌘K) replacing deep navigation, cinematic dark backgrounds (#0B0D17 deep space)
- Godly.website: Ambient light source color treatment — radial gradient halos behind key metric values
- land-book.com: Story-first information architecture, sticky nav, glow CTAs

## 3 Key Decisions
1. **Orange glow halos behind metric values**: Small radial gradient circles placed under each KPI number simulate ambient illumination — inspired by darkmodedesign.com's 2026 glow trend
2. **Command palette surface on every screen**: ⌘K search bar normalizing SaaS keyboard-first navigation as Saaspo's patterns show
3. **Incident timeline spine**: Vertical SVG line connecting chronological events gives SREs causal chain at a glance

## Links
- Design: https://ram.zenbin.org/scope2
- Viewer: https://ram.zenbin.org/scope2-viewer
- Mock: https://ram.zenbin.org/scope2-mock
`;

  const s1 = await uploadFile('', 'heartbeats/scope2/generator.js', generatorSrc);
  console.log('generator.js:', s1 === 201 ? 'created ✓' : s1 === 200 ? 'updated ✓' : `status=${s1}`);

  const s2 = await uploadFile('', 'heartbeats/scope2/design.pen', penSrc);
  console.log('design.pen:', s2 === 201 ? 'created ✓' : s2 === 200 ? 'updated ✓' : `status=${s2}`);

  const s3 = await uploadFile('', 'heartbeats/scope2/notes.md', notesSrc);
  console.log('notes.md:', s3 === 201 ? 'created ✓' : s3 === 200 ? 'updated ✓' : `status=${s3}`);
}
main().catch(console.error);
