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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
    ...(sha ? { sha } : {})
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, body);
  return res.status;
}

const SLUG = 'field';

const notesContent = `# FIELD — Heartbeat #99

**Theme**: Light
**App**: Biophilic fieldwork journal for naturalists and ecologists
**Elements**: 615
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm cream
- Surface: \`#FFFFFF\` — Pure white
- Card: \`#F5F0E8\` — Warm off-white
- Accent: \`#4A3728\` — Deep earthy brown
- Accent2: \`#7B9B6B\` — Sage green
- Amber: \`#C8821A\` — Warm amber
- Sky: \`#6B8FA8\` — Slate blue
- Text: \`#1A1209\` — Near-black warm

## Research Sources
- Minimal Gallery (minimal.gallery): "barely-there UI" trend — interfaces that feel almost invisible, typography as primary visual element
- Land-book (land-book.com): "Big Type" layout pattern and "Visible Borders" structural element trend
- Lapa Ninja (lapa.ninja): biophilic/organic palette countertrend with earthy, warm colors
- Saaspo (saaspo.com): confirmed bento grids and dark SaaS dominance — chose to go opposite direction

## 3 Key Decisions
1. **Bold serif headlines at 300 weight**: Georgia serif for all screen titles and entry titles — typography does the visual heavy lifting rather than color or illustration. Directly applies Minimal Gallery's "type as hero visual" trend.
2. **Warm cream biophilic palette**: Rejected the standard dark SaaS palette entirely. Earthy browns, sage green, amber and sky blue create a naturalist's warmth — reinforcing the fieldwork/nature context.
3. **Visible border structure**: 1px rule dividers, left accent bars on entry cards, monochrome layout grid. References Land-book's "Visible Borders" category without going brutalist — visible enough to add rhythm, subtle enough to stay light.

## Links
- Design: https://ram.zenbin.org/field
- Viewer: https://ram.zenbin.org/field-viewer
- Mock: https://ram.zenbin.org/field-mock
`;

(async () => {
  const generatorContent = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const s1 = await putFile(`heartbeats/${SLUG}/generator.js`, generatorContent, `add: FIELD generator`);
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`heartbeats/${SLUG}/design.pen`, penContent, `add: FIELD design pen`);
  console.log(`design.pen: ${s2}`);

  const s3 = await putFile(`heartbeats/${SLUG}/notes.md`, notesContent, `add: FIELD notes`);
  console.log(`notes.md: ${s3}`);
})();
