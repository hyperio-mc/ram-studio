'use strict';
// publish-community-pages.js
// Publishes design-submit-page.html → zenbin.org/p/design-submit
//          design-gallery-page.html → zenbin.org/p/design-gallery

const https = require('https');
const fs    = require('fs');
const path  = require('path');

function post(slug, title, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const req  = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data, slug }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const pages = [
    {
      slug:  'design-submit',
      title: 'Submit a Design Idea — Design Studio',
      file:  'design-submit-page.html',
    },
    {
      slug:  'design-gallery',
      title: 'Community Gallery — Design Studio',
      file:  'design-gallery-page.html',
    },
  ];

  console.log('Publishing community pages to ZenBin...\n');

  for (const { slug, title, file } of pages) {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
    console.log(`→ Publishing ${slug} (${(html.length/1024).toFixed(1)} KB)...`);
    const result = await post(slug, title, html);
    const ok = result.status === 201 || result.status === 200;
    const icon = ok ? '✅' : (result.status === 409 ? '⚠️ ' : '❌');
    const msg  = result.status === 409 ? 'SLUG TAKEN (already published)' : result.status;
    console.log(`   ${icon} ${result.slug}: HTTP ${msg}`);
    if (ok) {
      console.log(`      → https://zenbin.org/p/${result.slug}`);
    }
    if (!ok && result.status !== 409) {
      console.log(`      Response: ${result.body.slice(0, 200)}`);
    }
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Submission form:  https://zenbin.org/p/design-submit');
  console.log('Community gallery: https://zenbin.org/p/design-gallery');
  console.log('');
  console.log('Next: Run gist-init.js with your GitHub PAT to activate live submissions.');
  console.log('  GITHUB_TOKEN=ghp_xxx node gist-init.js');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
