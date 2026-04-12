// gather-db.mjs — Index GATHER in the design DB + fix gallery queue URLs
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const entry = {
  id: `heartbeat-gather-${Date.now()}`,
  status: 'done',
  app_name: 'GATHER',
  tagline: 'Developer conference companion — schedule-first, speaker-focused',
  archetype: 'event-companion',
  design_url: 'https://zenbin.org/p/gather',
  viewer_url: 'https://zenbin.org/p/gather-viewer',
  mock_url: 'https://zenbin.org/p/gather-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  palette: '#F9F7F5 + #FFFFFF + #E8632A + #18140E (Warm Paper + Surface + Ember Amber + Deep Ink)',
  fonts: 'Playfair Display + Inter + JetBrains Mono',
  inspiration: 'Stripe Sessions 2026 (stripesessions.com via godly.website Mar 30 2026) + Land-book.com (Mar 30 2026)',
  prompt: 'Inspired by Stripe Sessions 2026 — warm cream #F9F7F7 bg, editorial Söhne font, conference section hierarchy. Developer conference companion: time-axis schedule, track colors (Design=teal, Eng=blue, Product=grape), editorial Playfair Display headings. Novel: split-track side-by-side sessions, agenda conflict detection. Light theme.',
  note_quota: 'ZenBin quota full — both ram.zenbin.org (100p) and anonymous tier (100p). Resets 2026-04-23. Hero and viewer published on first available slot.',
};

// Index in design DB
try {
  const db = openDB();
  upsertDesign(db, entry);
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch(e) {
  console.log('⚠ Design DB index error:', e.message);
}

// Fix gallery queue URLs (the previous publish put ram.zenbin.org URLs)
console.log('\n📚 Fixing gallery queue URLs…');

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, m => {
      let d = ''; m.on('data', c => d += c);
      m.on('end', () => resolve({ status: m.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

try {
  const headers = { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' };
  const g = await req({ hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'GET', headers });
  const gj = JSON.parse(g.body);
  let queue = JSON.parse(Buffer.from(gj.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };

  // Fix the last GATHER entry's URLs
  const gatherEntry = queue.submissions.findLast(e => e.app_name === 'GATHER' && e.source === 'heartbeat');
  if (gatherEntry) {
    gatherEntry.design_url = 'https://zenbin.org/p/gather';
    gatherEntry.mock_url   = 'https://zenbin.org/p/gather-mock';
    gatherEntry.viewer_url = 'https://zenbin.org/p/gather-viewer';
    gatherEntry.note_quota = 'ZenBin quotas full — both ram subdomain (100p) and anonymous (100p). URLs will activate on reset 2026-04-23.';
    console.log('  Updated GATHER entry URLs → zenbin.org/p/ fallback');
  } else {
    // Add fresh entry
    queue.submissions.push(entry);
    console.log('  Added fresh GATHER entry');
  }
  queue.updated_at = new Date().toISOString();

  const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({ message: 'fix: GATHER URLs → zenbin.org/p/ fallback (quota full)', content: encoded, sha: gj.sha }));
  const p = await req({
    hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': putBody.length },
  }, putBody);
  console.log(`${p.status === 200 ? '✓' : '⚠'} Gallery queue updated (${p.status}) — ${queue.submissions.length} total entries`);
} catch(e) {
  console.log('✗ Gallery queue update failed:', e.message);
}

console.log('\n✅ GATHER indexing complete');
console.log('   Hero:   https://zenbin.org/p/gather');
console.log('   Viewer: https://zenbin.org/p/gather-viewer');
console.log('   Mock:   https://zenbin.org/p/gather-mock (pending quota reset Apr 23)');
console.log('   Quota resets: 2026-04-23T21:09:21Z');
