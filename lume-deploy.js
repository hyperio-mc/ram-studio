const fs = require('fs');
const https = require('https');

const SLUG = 'lume';
const APP_NAME = 'LUME';
const TAGLINE = 'Your money, illuminated';

function deploy(slug, html, title, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    };
    if (subdomain) opts.headers['X-Subdomain'] = subdomain;
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const url = subdomain
            ? `https://${subdomain}.zenbin.org/${slug}`
            : `https://zenbin.org/p/${slug}`;
          resolve({ ok: true, url, status: res.statusCode });
        } else {
          resolve({ ok: false, status: res.statusCode, body: d.slice(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function pub(slug, html, title) {
  let res = await deploy(slug, html, title, 'ram');
  if (res.ok) { console.log(`✓ ${slug} → ${res.url}`); return res.url; }
  console.log(`  ↳ ram subdomain issue (${res.status} ${res.body}), trying fallback…`);
  res = await deploy(slug, html, title, null);
  if (res.ok) { console.log(`✓ ${slug} → ${res.url} [fallback]`); return res.url; }
  console.log(`✗ ${slug} failed: ${res.status} — ${res.body}`);
  return `https://ram.zenbin.org/${slug}`;
}

async function main() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/lume.pen', 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
  viewerHtml = viewerHtml.replace('<title>Pen Viewer — RAM Design Studio</title>', `<title>LUME — ${TAGLINE} | Design Viewer</title>`);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n${injection}`);

  const heroHtml = fs.readFileSync('/workspace/group/design-studio/lume-hero.html', 'utf8');
  fs.writeFileSync('/workspace/group/design-studio/lume-viewer.html', viewerHtml);

  console.log('Deploying LUME to ZenBin…');
  const heroUrl = await pub(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  const viewerUrl = await pub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — ${TAGLINE} | Viewer`);

  console.log('\n✓ Hero:   ' + heroUrl);
  console.log('✓ Viewer: ' + viewerUrl);
}

main().catch(console.error);
