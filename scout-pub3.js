const fs = require('fs');
const https = require('https');
const path = require('path');

const SLUG = 'scout';
const APP_NAME = 'SCOUT';
const TAGLINE = 'AI product analytics for indie dev teams';

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
  const heroHtml = fs.readFileSync(path.join(__dirname, 'scout-hero.html'), 'utf8');

  console.log('1. Publishing hero...');
  const h = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log(`   ${h.status}:`, h.body.slice(0, 200));

  console.log('2. Building + publishing viewer...');
  const penJson = fs.readFileSync(path.join(__dirname, 'scout.pen'), 'utf8');
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  const v = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHtml);
  console.log(`   ${v.status}:`, v.body.slice(0, 200));

  console.log('\nURLs:');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

main().catch(console.error);
