// tide-deploy.js — publish hero + viewer for TIDE
const fs   = require('fs');
const https = require('https');

const SLUG     = 'tide';
const APP_NAME = 'Tide';
const TAGLINE  = 'Your money, in motion';

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
    r.write(body); r.end();
  });
}

const heroHtml = fs.readFileSync('/workspace/group/design-studio/tide-hero.html', 'utf8');

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson  = fs.readFileSync('/workspace/group/design-studio/tide.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero…');
  const h = await zenbin(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  const hData = JSON.parse(h.body);
  console.log(`Hero: ${h.status} → ${hData.url}`);

  console.log('Publishing viewer…');
  const v = await zenbin(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  const vData = JSON.parse(v.body);
  console.log(`Viewer: ${v.status} → ${vData.url}`);
})();
