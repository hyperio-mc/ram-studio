const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'volt-energy';
const APP_NAME  = 'VOLT';
const SUBDOMAIN = 'ram';
const HOST      = 'zenbin.org';

function post(slug, html) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const opts = {
      hostname: HOST,
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': SUBDOMAIN,
      },
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

async function run() {
  const heroHtml = fs.readFileSync('/tmp/volt-hero.html', 'utf8');
  console.log('Publishing hero...');
  const r1 = await post(SLUG, heroHtml);
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,120));

  const penJson = fs.readFileSync(path.join(__dirname, 'volt.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r2 = await post(`${SLUG}-viewer`, viewerHtml);
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,120));

  console.log(`\nHero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
run().catch(console.error);
