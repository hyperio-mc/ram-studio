// VOLT energy — publish hero + viewer
const fs = require('fs');
const https = require('https');

const SLUG = 'volt-energy';
const SUBDOMAIN = 'ram';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const heroHtml = fs.readFileSync('/tmp/volt-hero.html', 'utf8');

const penJson = fs.readFileSync('volt.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'VOLT — Know Your Energy');
  console.log('Hero:', r1.url ?? JSON.stringify(r1).slice(0, 120));

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, 'VOLT Prototype Viewer');
  console.log('Viewer:', r2.url ?? JSON.stringify(r2).slice(0, 120));
})();
