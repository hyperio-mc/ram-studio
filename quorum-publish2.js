const fs = require('fs');
const https = require('https');

const SLUG = 'quorum';
const APP_NAME = 'QUORUM';
const TAGLINE = 'Private gatherings, beautifully managed.';

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

async function main() {
  // ── Read hero HTML from quorum-publish.js (already written)
  const heroHtml = fs.readFileSync('/workspace/group/design-studio/quorum-hero.html', 'utf8');

  console.log('1. Publishing hero page...');
  const h = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log(`   Status ${h.status}:`, h.body.slice(0,200));

  console.log('2. Building viewer...');
  const penJson = fs.readFileSync('/workspace/group/design-studio/quorum.pen', 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('   Publishing viewer...');
  const v = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHtml);
  console.log(`   Status ${v.status}:`, v.body.slice(0,200));

  console.log('\nURLs:');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}
main().catch(console.error);
