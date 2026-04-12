#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

const SLUG = 'graft';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

const heroHtml = fs.readFileSync('/workspace/group/design-studio/graft-hero.html', 'utf8');
const viewerHtmlRaw = fs.readFileSync('/workspace/group/design-studio/graft-viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/graft.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
const viewerHtml = viewerHtmlRaw.replace('<!-- EMBED_PEN_HERE -->', injection);

async function run() {
  console.log('Publishing GRAFT hero…');
  const r1 = await post('zenbin.org', '/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG },
    { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN }
  );
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 120));

  console.log('Publishing GRAFT viewer…');
  const r2 = await post('zenbin.org', '/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' },
    { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN }
  );
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 120));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
