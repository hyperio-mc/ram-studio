const fs = require('fs');
const https = require('https');

const SLUG = 'volt-energy';

function publish(slug, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, slug, subdomain: 'ram' });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
        'X-Slug': slug,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const heroHtml = fs.readFileSync('/tmp/volt-hero.html', 'utf8');
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  const penJson = fs.readFileSync('volt.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
