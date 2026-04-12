#!/usr/bin/env node
// LUMIS — gallery queue + design DB

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'lumis';
const APP_NAME  = 'LUMIS';
const TAGLINE   = 'See through your finances';
const ARCHETYPE = 'personal-finance-clarity';
const PROMPT    = 'Light-themed personal finance clarity app. Inspired by "Fluid Glass" Awwwards Site of the Day (March 30 2026, by Exo Ape) — physics-based liquid glassmorphism with frosted translucent panels floating over soft lavender→peach gradient fields. Also: Neon.com featured on DarkModeDesign.com — bold typographic hierarchy in AI-era developer tools. Design concept: treat financial data like light through glass — translucent depth without harsh shadows, warm cream palette (#F3F0EC), soft violet accent (#6B4FE9), warm orange secondary (#F97316). 5 screens: Overview (net worth hero + spending donut), Accounts (glass list cards), Activity (glass tx feed), Budget (liquid progress rings), Insights (AI analysis cards + area chart).';

function ghReq(opts, body) {
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

(async () => {
  // ── GET current queue ──────────────────────────────────────────────────────
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'GET',
    headers:  {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json'
    }
  });

  if (getRes.status !== 200) {
    console.error('GitHub GET failed:', getRes.status, getRes.body.slice(0,100));
    process.exit(1);
  }

  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: now,
    published_at: now,
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat'
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'PUT',
    headers:  {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':        'application/vnd.github.v3+json'
    }
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('✓ Gallery queue updated OK');
  } else {
    console.error('Gallery PUT failed:', putRes.status, putRes.body.slice(0,100));
  }

  // save entry locally
  fs.writeFileSync(`${SLUG}-queue-entry.json`, JSON.stringify(newEntry, null, 2));
  console.log(`✓ Entry saved to ${SLUG}-queue-entry.json`);
})();
