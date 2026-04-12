const fs = require('fs');
const https = require('https');
const path = require('path');

const SLUG = 'lumen-clarity';
const APP_NAME = 'Lumen';
const TAGLINE = 'Know your mind. Work with it.';

function zenbin(slug, html, title) {
  return new Promise((res, rej) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org', port: 443,
      path: '/v1/pages/' + slug, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      }
    };
    const r = https.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej);
    r.write(body);
    r.end();
  });
}

// Read the hero HTML from lumen-publish.js output — re-use the already-written HTML string
// We'll inline it here by reading the published file concept differently
// Actually, let's just re-read from the generated script and publish

const heroHtml = fs.readFileSync('/workspace/group/design-studio/lumen-hero.html', 'utf8');
const viewerHtml = fs.readFileSync('/workspace/group/design-studio/lumen-viewer.html', 'utf8');

async function main() {
  console.log('Publishing hero...');
  const h = await zenbin(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', h.status, h.body.slice(0,80));

  console.log('Publishing viewer...');
  const v = await zenbin(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
  console.log('Viewer:', v.status, v.body.slice(0,80));
}
main().catch(console.error);
