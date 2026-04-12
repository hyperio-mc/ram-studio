'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const SLUG = 'folio';
const APP_NAME = 'Folio';
const TAGLINE = 'Time tracked. Money made.';
const ARCHETYPE = 'freelance-finance';

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

async function publishPage(slug, html, label) {
  const body = Buffer.from(JSON.stringify({ html }));
  const res = await req({
    hostname: 'zenbin.org',
    path: '/v1/pages/' + slug + '?overwrite=true',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }
  }, body);
  if (res.status === 200 || res.status === 201) {
    console.log('✓ ' + label + ': https://ram.zenbin.org/' + slug);
    return true;
  } else {
    console.error('✗ ' + label + ' failed (' + res.status + '): ' + res.body.slice(0, 200));
    return false;
  }
}

(async () => {
  const heroHtml = fs.readFileSync(path.join(__dirname, 'folio-hero.html'), 'utf8');
  const penJson = fs.readFileSync(path.join(__dirname, 'folio.pen'), 'utf8');
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'folio-viewer.html'), 'utf8');

  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO = config.GITHUB_REPO;

  console.log('── Step 1: Hero');
  await publishPage(SLUG, heroHtml, 'Hero');

  console.log('── Step 2: Viewer');
  await publishPage(SLUG + '-viewer', viewerHtml, 'Viewer');

  console.log('── Step 3: Gallery queue');
  const ghHeaders = { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' };
  const getRes = await req({ hostname: 'api.github.com', path: '/repos/' + REPO + '/contents/queue.json', method: 'GET', headers: ghHeaders });
  const fileData = JSON.parse(getRes.body);
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id: 'heartbeat-' + SLUG + '-' + Date.now(),
    status: 'done', app_name: APP_NAME, tagline: TAGLINE, archetype: ARCHETYPE,
    design_url: 'https://ram.zenbin.org/' + SLUG,
    mock_url: 'https://ram.zenbin.org/' + SLUG + '-mock',
    submitted_at: new Date().toISOString(), published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: 'Freelance time & billing app inspired by Midday.ai unified transaction dashboard. Light warm parchment theme, terracotta+green accents.',
    screens: 6, source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: 'add: ' + APP_NAME + ' to gallery (heartbeat)', content: newContent, sha: fileData.sha });
  const putRes = await req({
    hostname: 'api.github.com', path: '/repos/' + REPO + '/contents/queue.json', method: 'PUT',
    headers: { ...ghHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) }
  }, putBody);
  console.log('Gallery:', putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 100));

  console.log('\nDone!');
  console.log('  https://ram.zenbin.org/folio');
  console.log('  https://ram.zenbin.org/folio-viewer');
  console.log('  https://ram.zenbin.org/folio-mock  (mock next)');
})();
