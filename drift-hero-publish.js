'use strict';
// Publish DRIFT hero only (gallery already updated, skip that step)
const https = require('https');
const fs = require('fs');

function zenPub(slug, html, title) {
  return new Promise((res, rej) => {
    const body = JSON.stringify({ html, title });
    const r = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': 'ram',
        'Content-Length': Buffer.byteLength(body)
      }
    }, resp => {
      let d = ''; resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej); r.write(body); r.end();
  });
}

// Extract hero HTML from drift-publish.js
const src = fs.readFileSync('./drift-publish.js', 'utf8');
const match = src.match(/const hero = `([\s\S]*?)`;/);
if (!match) { console.error('Could not extract hero HTML'); process.exit(1); }
const hero = match[1];

(async () => {
  console.log('Publishing DRIFT hero...');
  const r = await zenPub('drift', hero, 'DRIFT — explore at your own pace');
  console.log('Hero:', r.status, r.status === 201 ? '✓' : r.body.slice(0, 100));
})();
