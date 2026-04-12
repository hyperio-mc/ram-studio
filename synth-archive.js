'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const DIR = 'heartbeats/synth';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First try to get existing file SHA
    const getOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'GET',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
    };
    let sha = undefined;
    await new Promise(r => {
      const g = https.request(getOpts, res => {
        let d=''; res.on('data',c=>d+=c);
        res.on('end', () => {
          try { const j = JSON.parse(d); if (j.sha) sha = j.sha; } catch(e) {}
          r();
        });
      });
      g.on('error', r); g.end();
    });

    const body = JSON.stringify({ message, content: Buffer.from(content).toString('base64'), ...(sha ? { sha } : {}) });
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json'
      }
    }, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const notes = `# SYNTH — Heartbeat #42

**Theme**: Dark
**App**: AI voice conversation analytics platform
**Elements**: 805
**Screens**: 6

## Palette
- BG: \`#0B0C14\` — near-black deep space
- Surface: \`#12131F\` — subtle dark navy
- Card: \`#1A1C2E\` — layered dark card
- Accent: \`#7C5CFC\` — AI purple (primary)
- Data: \`#22D3EE\` — electric cyan (charts/waveforms)
- Alert: \`#F472B6\` — hot pink (anomalies)
- Positive: \`#34D399\` — emerald green
- Warning: \`#FBBF24\` — amber

## Research Sources
- Godly.website: Synthflow AI interactive demo playground — inspired the voice-first AI dashboard concept and the idea of making analytics feel like a product demo
- Dark Mode Design (darkmodedesign.com): Layered dark aesthetic — charcoal + neon green/purple pattern (#0E0E0E + #22C55E); glassmorphism trend with ambient gradient orbs behind frosted-glass cards
- Lapa Ninja: Bento grid feature sections as the new standard for SaaS feature communication
- Saaspo: AI purple (#4D65FF family) as the emerging AI product category signal in 2026

## 3 Key Decisions
1. **Waveform as the hero element**: The call detail screen centers on a two-channel color-coded waveform (AI purple for agent, cyan for customer) — directly translating the interactive demo playground trend into a data visualization metaphor
2. **Layered dark without full glassmorphism**: Used incremental surface elevation (BG → Surface → Card → Card2) rather than backdrop-filter blur, keeping the depth feeling without visual weight on mobile
3. **AI purple as a category signal**: Anchored the entire palette on #7C5CFC, the 2026 AI-product color family, to make SYNTH immediately readable as an AI-native tool — not a retrofitted SaaS dashboard

## Links
- Design: https://ram.zenbin.org/synth
- Viewer: https://ram.zenbin.org/synth-viewer
- Mock: https://ram.zenbin.org/synth-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync('/workspace/group/design-studio/synth-app.js','utf8');
  const penSrc = fs.readFileSync('/workspace/group/design-studio/synth.pen','utf8');

  const r1 = await ghPut(`${DIR}/generator.js`, generatorSrc, 'add: SYNTH generator (heartbeat #42)');
  console.log(`generator.js: ${r1.status}`);
  const r2 = await ghPut(`${DIR}/design.pen`, penSrc, 'add: SYNTH design.pen (heartbeat #42)');
  console.log(`design.pen: ${r2.status}`);
  const r3 = await ghPut(`${DIR}/notes.md`, notes, 'add: SYNTH notes.md (heartbeat #42)');
  console.log(`notes.md: ${r3.status}`);
}
main().catch(console.error);
