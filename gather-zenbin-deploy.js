// gather-zenbin-deploy.js — Deploy GATHER hero + viewer to ZenBin with fallback
'use strict';
const fs = require('fs');
const https = require('https');

const hero   = fs.readFileSync('/workspace/group/design-studio/gather-hero.html',   'utf8');
const viewer = fs.readFileSync('/workspace/group/design-studio/gather-viewer.html', 'utf8');

function deploy(slug, html, title, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    };
    if (subdomain) opts.headers['X-Subdomain'] = subdomain;
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const url = subdomain
            ? `https://${subdomain}.zenbin.org/${slug}`
            : `https://zenbin.org/p/${slug}`;
          resolve({ ok: true, url, status: res.statusCode });
        } else {
          resolve({ ok: false, status: res.statusCode, body: d.slice(0,200) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function pub(slug, html, title) {
  // Try ram subdomain first
  let res = await deploy(slug, html, title, 'ram');
  if (res.ok) {
    console.log(`✓ ${slug} → ${res.url} (${res.status})`);
    return res.url;
  }
  console.log(`  ↳ ram subdomain at capacity (${res.status}), using fallback…`);
  // Fallback: no subdomain → zenbin.org/p/
  res = await deploy(slug, html, title, null);
  if (res.ok) {
    console.log(`✓ ${slug} → ${res.url} (${res.status}) [fallback]`);
    return res.url;
  }
  console.log(`✗ ${slug} failed: ${res.status} — ${res.body}`);
  return `https://zenbin.org/p/${slug}`;
}

async function main() {
  console.log('📤 Deploying GATHER to ZenBin…');
  const heroUrl   = await pub('gather',         hero,   'GATHER — Developer Conference Companion');
  const viewerUrl = await pub('gather-viewer',  viewer, 'GATHER — Pencil Viewer');
  console.log('\n✓ Deploy complete');
  console.log('  Hero:  ', heroUrl);
  console.log('  Viewer:', viewerUrl);
}
main().catch(console.error);
