const fs = require('fs');
const https = require('https');

const SLUG = 'vanta';
const SUBDOMAIN = 'ram';

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

async function run() {
  const heroHtml = fs.readFileSync('/workspace/group/design-studio/vanta-hero.html', 'utf8');
  const penJson = fs.readFileSync('/workspace/group/design-studio/vanta.pen', 'utf8');
  
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  if (viewerHtml.includes('<script>')) {
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
  }

  console.log('Publishing hero...');
  const r1 = await zenPut(SLUG, 'VANTA — AI Model Registry', heroHtml);
  console.log('Hero:', r1.status, r1.status === 200 || r1.status === 201 ? '✓' : r1.body.slice(0,150));

  console.log('Publishing viewer...');
  const r2 = await zenPut(SLUG + '-viewer', 'VANTA — Prototype Viewer', viewerHtml);
  console.log('Viewer:', r2.status, r2.status === 200 || r2.status === 201 ? '✓' : r2.body.slice(0,150));

  console.log(`\n  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
