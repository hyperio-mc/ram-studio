// migrate-done-entries.mjs
// Migrates 'done' entries whose URLs still point to ram.zenbin.org → zenbin.org/p/
// Uses local -hero.html and -mock.html files where available
import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function ghReq(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d})); });
    r.on('error', rej);
    if (body) r.write(body);
    r.end();
  });
}

async function zenPost(slug, html) {
  const body = Buffer.from(JSON.stringify({ html }));
  const r = await ghReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
  }, body);
  return { status: r.status, ok: r.status === 200 || r.status === 201 };
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Fetch queue
console.log('Fetching queue...');
const meta = JSON.parse((await ghReq({
  hostname: 'api.github.com', path: '/repos/'+REPO+'/contents/queue.json', method: 'GET',
  headers: { 'Authorization': 'token '+TOKEN, 'User-Agent': 'migrate/1.0', 'Accept': 'application/vnd.github.v3+json' }
})).body);

const q = JSON.parse(Buffer.from(meta.content, 'base64').toString('utf8'));
const subs = Array.isArray(q) ? q : q.submissions;

// Find done entries still pointing to ram.zenbin.org
const ramDone = subs.filter(s =>
  s.status === 'done' &&
  ((s.design_url||'').includes('ram.zenbin.org') || (s.mock_url||'').includes('ram.zenbin.org'))
);

console.log(`Found ${ramDone.length} done entries still on ram.zenbin.org`);

let migrated = 0, skipped = 0, failed = 0;

for (const entry of ramDone) {
  // Extract slug from design_url
  const designUrl = entry.design_url || '';
  const slug = designUrl.replace('https://ram.zenbin.org/', '').split('/')[0];
  if (!slug) { skipped++; continue; }

  const heroFile = `./${slug}-hero.html`;
  const mockFile = `./${slug}-mock.html`;
  const hasHero  = fs.existsSync(heroFile);
  const hasMock  = fs.existsSync(mockFile);

  if (!hasHero && !hasMock) {
    // No local files — try checking if it's already live on zenbin.org/p/
    skipped++;
    continue;
  }

  let anySuccess = false;

  if (hasHero && designUrl.includes('ram.zenbin.org')) {
    const html = fs.readFileSync(heroFile, 'utf8');
    const r = await zenPost(slug, html);
    if (r.ok) {
      entry.design_url = `https://zenbin.org/p/${slug}`;
      anySuccess = true;
      console.log(`  ✓ hero  ${slug} → zenbin.org/p/${slug}`);
    } else {
      console.log(`  ✗ hero  ${slug} (${r.status})`);
      failed++;
    }
    await sleep(120);
  }

  if (hasMock && (entry.mock_url||'').includes('ram.zenbin.org')) {
    const html = fs.readFileSync(mockFile, 'utf8');
    const mockSlug = `${slug}-mock`;
    const r = await zenPost(mockSlug, html);
    if (r.ok) {
      entry.mock_url = `https://zenbin.org/p/${mockSlug}`;
      anySuccess = true;
      console.log(`  ✓ mock  ${mockSlug} → zenbin.org/p/${mockSlug}`);
    } else {
      console.log(`  ✗ mock  ${mockSlug} (${r.status})`);
    }
    await sleep(120);
  }

  if (anySuccess) migrated++;
}

console.log(`\nResults: ${migrated} migrated, ${skipped} skipped (no local files), ${failed} failed`);

if (migrated > 0) {
  const queueObj = Array.isArray(q) ? { version:1, submissions: subs, updated_at: new Date().toISOString() } : q;
  if (!Array.isArray(q)) queueObj.updated_at = new Date().toISOString();
  const content = Buffer.from(JSON.stringify(queueObj, null, 2)).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    message: `fix: migrate ${migrated} done entries from ram.zenbin.org → zenbin.org/p/`,
    content, sha: meta.sha
  }));
  const r = await ghReq({
    hostname: 'api.github.com', path: '/repos/'+REPO+'/contents/queue.json', method: 'PUT',
    headers: { 'Authorization': 'token '+TOKEN, 'User-Agent': 'migrate/1.0', 'Content-Type': 'application/json', 'Content-Length': payload.length, 'Accept': 'application/vnd.github.v3+json' }
  }, payload);
  console.log(r.status === 200 ? `✓ Gallery updated — ${migrated} URLs updated` : `✗ ${r.status}: ${r.body.slice(0,100)}`);
}
