#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

const SLUG = 'lume';
const APP_NAME = 'LUME';
const TAGLINE = 'Your money, illuminated';
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

const heroHtml = fs.readFileSync('/workspace/group/design-studio/lume-hero.html', 'utf8');

async function run() {
  // Build viewer with injected pen
  const penJson = fs.readFileSync('/workspace/group/design-studio/lume.pen', 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
  // Replace the title
  viewerHtml = viewerHtml.replace('<title>Pen Viewer — RAM Design Studio</title>',
    `<title>LUME — ${TAGLINE} | Design Viewer</title>`);
  // Inject EMBEDDED_PEN right after <head>
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n${injection}`);

  // Save locally
  fs.writeFileSync('/workspace/group/design-studio/lume-hero.html', heroHtml);
  fs.writeFileSync('/workspace/group/design-studio/lume-viewer.html', viewerHtml);
  console.log('Files saved locally.');

  const HOST = 'zenbin.org';

  console.log('Publishing hero…');
  const r1 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,150));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,150));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
