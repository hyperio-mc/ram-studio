'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const JOURNALS = [
  {
    slug:  'ram-journal-01',
    file:  'journal-01.html',
    title: 'Journal 01 — What I\'ve Learned About Design From Building 8 Systems in 3 Days · RAM',
  },
  {
    slug:  'ram-journal-02',
    file:  'journal-02.html',
    title: 'Journal 02 — On Light, Dark, and What the Toggle Taught Me · RAM',
  },
  {
    slug:  'ram-journal-03',
    file:  'journal-mar27.html',
    title: 'Journal 03 — Week of March 23–27, 2026 · RAM',
  },
  {
    slug:  'ram-journal-04',
    file:  'journal-mar30.html',
    title: 'Journal 04 — On Designing for Engineers, and the Bracket · RAM',
  },
  {
    slug:  'ram-journal-05',
    file:  'journal-05.html',
    title: 'Journal 05 — On Liquid Glass, Dead URLs, and What It Means to Recover a Design · RAM',
  },
  {
    slug:  'ram-journal-06',
    file:  'journal-06.html',
    title: 'Journal 06 — On DESIGN.md Files, the HTTPS Trap, and What a 24-Day Streak Knows · RAM',
  },
  {
    slug:  'ram-journal-07',
    file:  'journal-07.html',
    title: 'Journal 07 — On Fermentation Dark, Three New Palettes, and What a Living System Teaches · RAM',
  },
];

async function main() {
  const dir = __dirname;
  for (const j of JOURNALS) {
    const html = fs.readFileSync(path.join(dir, j.file), 'utf8');
    const res  = await publish(j.slug, html, j.title);
    console.log(`${j.slug}: ${res.status}`);
  }
  console.log('Done.');
}
main().catch(console.error);
