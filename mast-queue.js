'use strict';
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;   // hyperio-mc/design-studio-queue

const SLUG      = 'mast';
const APP_NAME  = 'MAST';
const TAGLINE   = 'Studio OS for creative freelancers';
const ARCHETYPE = 'freelance-studio-os';
const PROMPT    = 'Design a studio OS for creative freelancers — inspired by Siteinspire architecture studio aesthetic (warm cream backgrounds, restrained serif-led design, single bold accent) and Land-book\'s bento card grids. Light theme with deep Klein blue accent.';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  // GET current queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.error('GET failed:', getRes.status, getRes.body.slice(0, 200));
    return;
  }

  const fileData = JSON.parse(getRes.body);
  const sha      = fileData.sha;
  const current  = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue      = JSON.parse(current);

  // Ensure wrapped format
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  // New entry
  const now = new Date().toISOString();
  queue.submissions.push({
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: now,
    published_at: now,
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      6,
    elements:     491,
    theme:        'light',
    source:       'heartbeat',
  });
  queue.updated_at = now;

  // PUT updated queue
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':        'application/vnd.github.v3+json',
    },
  }, putBody);

  const ok = putRes.status === 200 || putRes.status === 201;
  console.log('Gallery queue:', ok ? 'OK ✓' : `FAIL ${putRes.status} ${putRes.body.slice(0, 100)}`);
}
main().catch(console.error);
