// fix-last-five.mjs — migrate last 5 gallery entries from ram.zenbin.org to zenbin.org/p/
// Also ensures VALE and FLUX are correctly pointing to zenbin.org/p/

import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d})); });
    r.on('error', rej); if (body) r.write(body); r.end();
  });
}

async function publish(slug, html) {
  const body = Buffer.from(JSON.stringify({ html }));
  const r = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
  }, body);
  return { ok: r.status === 200 || r.status === 201, status: r.status };
}

// Fetch queue
const meta = JSON.parse((await req({ hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json',
  headers:{'User-Agent':'node','Authorization':'token '+TOKEN} })).body);
const q = JSON.parse(Buffer.from(meta.content,'base64').toString('utf8'));

// Targets: the last 5 entries + VALE + FLUX (all should be on zenbin.org/p/)
const targets = ['glaze', 'echo', 'relay', 'vela', 'cadence', 'vale', 'flux'];
let changed = 0;

for (const slug of targets) {
  const heroFile = `${slug}-hero.html`;
  const mockFile = `${slug}-mock.html`;
  const hasHero  = fs.existsSync(heroFile);
  const hasMock  = fs.existsSync(mockFile);

  console.log(`\n→ ${slug.toUpperCase()}`);

  // Find all entries for this slug
  const entries = q.submissions.filter(s => {
    const dSlug = s.design_url?.split('/').pop();
    return dSlug === slug || s.app_name?.toLowerCase() === slug;
  });

  if (!entries.length) { console.log('  not found in gallery'); continue; }

  for (const entry of entries) {
    let updated = false;

    // Hero
    if (hasHero && entry.design_url?.includes('ram.zenbin.org')) {
      const html = fs.readFileSync(heroFile, 'utf8');
      const r = await publish(slug, html);
      if (r.ok) {
        entry.design_url = `https://zenbin.org/p/${slug}`;
        console.log(`  ✓ hero  → zenbin.org/p/${slug} (${r.status})`);
        updated = true;
      } else {
        console.log(`  ✗ hero  ${r.status}`);
      }
    } else if (!hasHero) {
      console.log(`  ⚠ hero  no local file`);
    } else {
      console.log(`  ✓ hero  already on zenbin.org/p/`);
    }

    // Mock
    const mockSlug = entry.mock_url?.split('/').pop();
    const localMock = mockSlug ? `${mockSlug}.html` : mockFile;
    const hasMockFile = fs.existsSync(localMock) || hasMock;

    if (hasMockFile && entry.mock_url?.includes('ram.zenbin.org')) {
      const mockHtml = fs.readFileSync(fs.existsSync(localMock) ? localMock : mockFile, 'utf8');
      const slug2 = mockSlug || `${slug}-mock`;
      const r = await publish(slug2, mockHtml);
      if (r.ok) {
        entry.mock_url = `https://zenbin.org/p/${slug2}`;
        console.log(`  ✓ mock  → zenbin.org/p/${slug2} (${r.status})`);
        updated = true;
      } else {
        console.log(`  ✗ mock  ${r.status}`);
      }
    } else if (!hasMockFile) {
      console.log(`  ⚠ mock  no local file`);
    } else {
      console.log(`  ✓ mock  already on zenbin.org/p/`);
    }

    if (updated) {
      entry.status = 'done';
      delete entry.unavailable_since;
      changed++;
    }
  }
}

if (changed > 0) {
  q.updated_at = new Date().toISOString();
  const content = Buffer.from(JSON.stringify(q, null, 2)).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    message: `fix: migrate ${changed} entries from ram.zenbin.org to zenbin.org/p/`,
    content, sha: meta.sha,
  }));
  const r = await req({ hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json', method:'PUT',
    headers:{'User-Agent':'node','Authorization':'token '+TOKEN,'Content-Type':'application/json','Content-Length':payload.length} }, payload);
  console.log(`\n✓ Gallery updated (${r.status}) — ${changed} entries migrated`);
} else {
  console.log('\nNothing to update.');
}
