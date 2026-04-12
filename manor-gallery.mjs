/**
 * MANOR — gallery queue + design DB
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG     = 'manor';
const APP_NAME = 'MANOR';
const TAGLINE  = 'Wealth, Ordered.';
const ARCHETYPE = 'finance-luxury';

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

// ─── GitHub queue ─────────────────────────────────────────────────────────
const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
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
  design_url: `https://zenbin.org/p/${SLUG}`,
  viewer_url: `https://zenbin.org/p/${SLUG}-viewer`,
  mock_url:   `https://zenbin.org/p/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Luxury private wealth management app. Editorial dark aesthetic with warm gold accents. Inspired by Atlas Card (godly.website), Midday.ai (darkmodedesign.com), and Fluid Glass (Awwwards SOTD). Five screens: wealth overview, holdings, moves, insights, account.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
  palette_primary: '#C4A55A',
  palette_bg: '#070707',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({
  message: `add: MANOR -- Wealth, Ordered. (heartbeat)`,
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
console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

// ─── Design DB ────────────────────────────────────────────────────────────
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB');
} catch (e) {
  console.log('Design DB skipped:', e.message);
}

console.log('\nDone!');
console.log('Hero:   https://zenbin.org/p/manor');
console.log('Viewer: https://zenbin.org/p/manor-viewer');
console.log('Mock:   https://zenbin.org/p/manor-mock');
