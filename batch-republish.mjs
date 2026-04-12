// batch-republish.mjs
// Republish unavailable designs that have local hero/mock HTML files
// Publishes to zenbin.org/p/ (stable), updates gallery entries to 'done'

import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d})); });
    r.on('error', rej);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, html) {
  const body = Buffer.from(JSON.stringify({ html }));
  const r = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
  }, body);
  return { status: r.status, ok: r.status === 200 || r.status === 201 };
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Fetch queue
console.log('📥 Fetching queue...');
const meta = JSON.parse((await req({ hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json',
  headers:{'User-Agent':'node','Authorization':'token '+TOKEN} })).body);
const q = JSON.parse(Buffer.from(meta.content,'base64').toString('utf8'));

const unavailable = q.submissions.filter(s => s.status === 'unavailable');
console.log(`Found ${unavailable.length} unavailable entries\n`);

let republished = 0, skipped = 0, failed = 0;
const updates = [];

for (const entry of unavailable) {
  const slug = entry.design_url?.split('/').pop();
  if (!slug) { skipped++; continue; }

  const heroFile = `${slug}-hero.html`;
  const mockFile = `${slug}-mock.html`;
  const hasHero  = fs.existsSync(heroFile);
  const hasMock  = fs.existsSync(mockFile);

  if (!hasHero && !hasMock) { skipped++; continue; }

  let newDesignUrl = entry.design_url;
  let newMockUrl   = entry.mock_url;
  let anySuccess   = false;

  // Republish hero
  if (hasHero) {
    const html = fs.readFileSync(heroFile, 'utf8');
    const r = await publishToZenbin(slug, html);
    if (r.ok) {
      newDesignUrl = `https://zenbin.org/p/${slug}`;
      anySuccess = true;
      process.stdout.write(`  ✓ hero  ${slug} (${r.status})\n`);
    } else {
      process.stdout.write(`  ✗ hero  ${slug} (${r.status})\n`);
      failed++;
    }
    await sleep(100); // gentle rate limit
  }

  // Republish mock
  if (hasMock) {
    const html = fs.readFileSync(mockFile, 'utf8');
    const mockSlug = `${slug}-mock`;
    const r = await publishToZenbin(mockSlug, html);
    if (r.ok) {
      newMockUrl = `https://zenbin.org/p/${mockSlug}`;
      anySuccess = true;
      process.stdout.write(`  ✓ mock  ${mockSlug} (${r.status})\n`);
    } else {
      process.stdout.write(`  ✗ mock  ${mockSlug} (${r.status})\n`);
    }
    await sleep(100);
  }

  if (anySuccess) {
    entry.design_url = newDesignUrl;
    entry.mock_url   = newMockUrl;
    entry.status     = 'done';
    delete entry.unavailable_since;
    delete entry.mock_note;
    republished++;
  }
}

console.log(`\n📊 Results: ${republished} republished, ${skipped} skipped (no local files), ${failed} failed`);

if (republished > 0) {
  console.log('\n📤 Saving updated queue to GitHub...');
  q.updated_at = new Date().toISOString();
  const content = Buffer.from(JSON.stringify(q, null, 2)).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    message: `fix: republish ${republished} unavailable designs (batch restore)`,
    content,
    sha: meta.sha,
  }));
  const r = await req({ hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json', method:'PUT',
    headers:{'User-Agent':'node','Authorization':'token '+TOKEN,'Content-Type':'application/json','Content-Length':payload.length} }, payload);
  console.log(r.status === 200 ? `✓ Gallery updated — ${republished} entries restored to 'done'` : `✗ ${r.status}: ${r.body.slice(0,200)}`);
} else {
  console.log('Nothing to update in gallery.');
}
