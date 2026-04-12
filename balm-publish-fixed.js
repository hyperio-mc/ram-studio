'use strict';
// balm-publish-fixed.js — Full Design Discovery pipeline for BALM
// BALM — Know what your body knows
// Theme: LIGHT · Slug: balm

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'balm';
const APP_NAME  = 'BALM';
const TAGLINE   = 'Know what your body knows';
const ARCHETYPE = 'wellness-biometric';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Light-theme body intelligence app. Inspired by silencio.es (godly.website — luxury editorial warmth, parchment palette, serif display type) + V7 Go AI Platform (land-book.com — editorial data layout, AI reasoning inline). Parchment cream background, terracotta + sage accent palette, Libre Baskerville serif. 5 screens: Morning Brief, Movement, Nourishment, Reflection, Trends.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'balm.pen'), 'utf8');

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
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
  return res;
}

// Read the hero and viewer HTML
const heroHtml   = fs.readFileSync(path.join(__dirname, 'balm-hero.html'), 'utf8');
const viewerHtmlTemplate = fs.readFileSync(path.join(__dirname, 'balm-viewer.html'), 'utf8');

// Ensure pen is injected into viewer
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
const viewerHtml = viewerHtmlTemplate.includes('window.EMBEDDED_PEN') 
  ? viewerHtmlTemplate 
  : viewerHtmlTemplate.replace('<script>\n  // EMBEDDED_PEN will be injected here\n  </script>', injection + '\n<script>');

async function run() {
  console.log('Publishing hero → balm...');
  const r1 = await zenPut(SLUG, APP_NAME + ' — ' + TAGLINE, heroHtml);
  console.log('Hero:', r1.status, [200,201].includes(r1.status) ? '✓' : r1.body.slice(0, 150));

  console.log('Publishing viewer → balm-viewer...');
  const r2 = await zenPut(SLUG + '-viewer', APP_NAME + ' Prototype Viewer', viewerHtml);
  console.log('Viewer:', r2.status, [200,201].includes(r2.status) ? '✓' : r2.body.slice(0, 150));

  if (![200,201].includes(r1.status) || ![200,201].includes(r2.status)) {
    console.log('Publish failed — skipping gallery queue.');
    return;
  }

  console.log('\nUpdating GitHub gallery queue...');
  // Get current queue
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
    palette: { bg: '#F6F1EB', accent: '#C04A12', accent2: '#3D7A56' }
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'Updated ✓' : putRes.body.slice(0, 100));

  console.log('\n✓ Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('✓ Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('✓ Mock:   https://ram.zenbin.org/' + SLUG + '-mock (pending)');
}

run().catch(console.error);
