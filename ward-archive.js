'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'ward';
const PREFIX = `heartbeats/${SLUG}`;

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

async function getSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha  = await getSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept':        'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# WARD — Heartbeat #489

**Theme**: Dark (zinc-950 foundation)
**App**: Incident intelligence dashboard for SRE and dev teams
**Elements**: 499
**Screens**: 6

## Palette
- BG:      \`#09090B\` — zinc-950 (from darkmodedesign.com zinc trend)
- Surface: \`#18181B\` — zinc-900
- Card:    \`#27272A\` — zinc-800
- Border:  \`#3F3F46\` — zinc-700
- Muted:   \`#71717A\` — zinc-500
- Sub:     \`#A1A1AA\` — zinc-400
- Text:    \`#FAFAFA\` — zinc-50
- Accent:  \`#6366F1\` — indigo-500
- Accent2: \`#818CF8\` — indigo-400
- Healthy: \`#10B981\` — emerald-500
- Degraded:\`#F59E0B\` — amber-500
- Critical:\`#F43F5E\` — rose-500

## Research Sources
- darkmodedesign.com: Zinc color scale as elevation system — three layered backgrounds creating depth without drop shadows; zinc-950/900/800 progression
- saaspo.com (Twingate): "Bold dark-mode with vivid accent colours" for security/dev-tool SaaS — dark near-black base with saturated single-color accents
- saaspo.com (Linear): "Calm design" philosophy — one action per screen, color only where it means something, progressive disclosure of complexity

## 3 Key Decisions
1. **Color-only-for-status**: Emerald, amber, and rose are reserved exclusively for health indicators. Every other element is achromatic zinc. This gives color maximum signal weight — when you see green or red, it always means something.
2. **Zinc elevation over shadows**: Instead of drop shadows (which disappear on dark backgrounds), three zinc steps create surface hierarchy. Card (\`#27272A\`) sits above surface (\`#18181B\`) sits above bg (\`#09090B\`). Clean, structured, no visual noise.
3. **p99 as primary service metric**: Rather than a traffic-light status icon alone, each service card shows its p99 latency as the primary health signal. Numbers are harder to ignore than dots and communicate severity gradation, not just binary ok/fail.

## Links
- Design: https://ram.zenbin.org/ward
- Viewer: https://ram.zenbin.org/ward-viewer
- Mock: https://ram.zenbin.org/ward-mock
`;

(async () => {
  const generatorJs = fs.readFileSync(path.join(__dirname, 'ward-app.js'), 'utf8');
  const penJson     = fs.readFileSync(path.join(__dirname, 'ward.pen'), 'utf8');

  const r1 = await putFile(`${PREFIX}/generator.js`, generatorJs, `archive: WARD generator (heartbeat #489)`);
  console.log(`generator.js: ${r1 === 201 ? 'created ✓' : r1 === 200 ? 'updated ✓' : `error ${r1}`}`);

  const r2 = await putFile(`${PREFIX}/design.pen`, penJson, `archive: WARD design.pen (heartbeat #489)`);
  console.log(`design.pen: ${r2 === 201 ? 'created ✓' : r2 === 200 ? 'updated ✓' : `error ${r2}`}`);

  const r3 = await putFile(`${PREFIX}/notes.md`, notes, `archive: WARD notes (heartbeat #489)`);
  console.log(`notes.md: ${r3 === 201 ? 'created ✓' : r3 === 200 ? 'updated ✓' : `error ${r3}`}`);
})();
