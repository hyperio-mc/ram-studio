/**
 * CADENCE — Gallery queue + design DB
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG = 'cadence';
const APP_NAME = 'CADENCE';
const TAGLINE = 'Map your peak hours';
const ARCHETYPE = 'focus-tracker';
const DESIGN_URL = 'https://zenbin.org/p/cadence';
const MOCK_URL = 'https://zenbin.org/p/cadence-mock';
const VIEWER_URL = 'https://zenbin.org/p/cadence-viewer';

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

async function main() {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO = config.GITHUB_REPO;

  // ── Gallery queue ─────────────────────────────────────────────────────────
  console.log('Fetching gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: DESIGN_URL,
    mock_url: MOCK_URL,
    viewer_url: VIEWER_URL,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: 'Focus rhythm tracker inspired by NEON data-viz bars (darkmodedesign.com) + Litbix spatial cards (minimal.gallery) + Superpower editorial warmth (godly.website). Light cream palette with amber accents.',
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
    palette: {
      bg: '#F6F3ED',
      accent: '#D4830A',
      surface: '#FFFFFF',
      text: '#1C1A16',
    },
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('✓ Gallery queue updated');
  } else {
    console.error('✗ Gallery queue failed:', putRes.status, putRes.body.slice(0, 200));
  }

  // ── Design DB ─────────────────────────────────────────────────────────────
  console.log('Indexing in design DB...');
  try {
    const db = openDB();
    upsertDesign(db, { ...newEntry });
    rebuildEmbeddings(db);
    console.log('✓ Indexed in design DB');
  } catch(e) {
    console.error('Design DB error:', e.message);
  }

  console.log('\n✓ All done!');
  console.log(`  Hero:   ${DESIGN_URL}`);
  console.log(`  Viewer: ${VIEWER_URL}`);
  console.log(`  Mock:   ${MOCK_URL}`);
}

main().catch(console.error);
