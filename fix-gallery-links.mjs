// fix-gallery-links.mjs
// Mark broken (both design_url + mock_url are 404) entries as status: 'unavailable'
// All broken entries are on ram.zenbin.org (100-page quota reset cleared them)
// Entries with at least one working URL keep their current status

import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => {
      let d = '';
      m.on('data', c => d += c);
      m.on('end', () => res({ status: m.statusCode, body: d }));
    });
    r.on('error', rej);
    if (body) r.write(body);
    r.end();
  });
}

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || url === 'NO_URL' || !url.startsWith('http')) {
      resolve({ url, status: 0, ok: false });
      return;
    }
    const parsed = new URL(url);
    const r = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      headers: { 'User-Agent': 'ram-gallery-checker/1.0' },
    }, m => {
      resolve({ url, status: m.statusCode, ok: m.statusCode < 400 });
    });
    r.on('error', () => resolve({ url, status: 0, ok: false }));
    r.setTimeout(5000, () => { r.destroy(); resolve({ url, status: 0, ok: false }); });
    r.end();
  });
}

// Fetch queue
const headers = {
  'Authorization': `token ${TOKEN}`,
  'User-Agent': 'ram-gallery-fixer/1.0',
  'Accept': 'application/vnd.github.v3+json',
};
console.log('📥 Fetching queue.json...');
const g = await req({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'GET', headers });
const gj = JSON.parse(g.body);
const q = JSON.parse(Buffer.from(gj.content, 'base64').toString('utf8'));

const submissions = q.submissions || [];
console.log(`Total submissions: ${submissions.length}`);

// Check all URLs in batches of 20
const BATCH = 20;
let checked = 0;
const results = new Map(); // url -> ok

for (let i = 0; i < submissions.length; i += BATCH) {
  const batch = submissions.slice(i, i + BATCH);
  const checks = [];
  for (const s of batch) {
    if (s.design_url) checks.push(checkUrl(s.design_url));
    if (s.mock_url && s.mock_url !== 'NO_URL') checks.push(checkUrl(s.mock_url));
  }
  const batchResults = await Promise.all(checks);
  for (const r of batchResults) results.set(r.url, r.ok);
  checked += batch.length;
  if (checked % 60 === 0) process.stdout.write(`  checked ${checked}/${submissions.length}...\n`);
}

// Now update status
let markedUnavailable = 0;
let alreadyWorking = 0;
let partiallyWorking = 0;

for (const s of submissions) {
  const dOk = s.design_url ? (results.get(s.design_url) ?? false) : false;
  const mOk = s.mock_url && s.mock_url !== 'NO_URL' ? (results.get(s.mock_url) ?? false) : false;
  
  if (!dOk && !mOk && s.status !== 'unavailable') {
    s.status = 'unavailable';
    s.unavailable_since = new Date().toISOString();
    markedUnavailable++;
  } else if (dOk && mOk) {
    alreadyWorking++;
  } else if (dOk || mOk) {
    partiallyWorking++;
  }
}

console.log(`\n📊 Results:`);
console.log(`  Marked unavailable (both 404): ${markedUnavailable}`);
console.log(`  Fully working (both OK): ${alreadyWorking}`);
console.log(`  Partially working (one OK): ${partiallyWorking}`);

// Save locally
q.updated_at = new Date().toISOString();
fs.writeFileSync('/workspace/group/design-studio/queue-fixed.json', JSON.stringify(q, null, 2));
console.log('\n✓ Saved queue-fixed.json locally');

// Push to GitHub
const encoded = Buffer.from(JSON.stringify(q, null, 2)).toString('base64');
const putBody = Buffer.from(JSON.stringify({
  message: 'fix: mark broken ram.zenbin.org links as unavailable (404 audit)',
  content: encoded,
  sha: gj.sha,
}));
const p = await req({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { ...headers, 'Content-Length': putBody.length },
}, putBody);
console.log(`📤 GitHub update: ${p.status}`);
console.log('✓ Gallery fixed.');
