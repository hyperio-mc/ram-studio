// vesper-queue.js — push VESPER to GitHub gallery queue + index in design DB
'use strict';
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'vesper';
const APP_NAME  = 'VESPER';
const TAGLINE   = 'End each day with clarity';
const ARCHETYPE = 'personal-clarity-glass';
const PROMPT    = 'Dark glassmorphism personal clarity OS — ambient violet/teal orb field, three-tier spatial depth, glass surfaces, Pomodoro focus timer with breathing animation, evening journal with gradient-border prompt card, ritual ring tracking, AI insight cards. Inspired by Dark Glassmorphism 2026 trend.';

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

(async () => {
  // ── 1. Get current queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      Authorization: `token ${TOKEN}`,
      'User-Agent':  'ram-heartbeat/1.0',
      Accept:        'application/vnd.github.v3+json'
    }
  });

  const fileData   = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  // ── 2. Build entry
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      6,
    source:       'heartbeat',
    theme:        'dark',
    palette:      {
      bg: '#060412', surface: '#0D0920',
      accent: '#9B6DFF', accent2: '#00D4BF',
      text: '#EDE9FF'
    }
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  // ── 3. Push back to GitHub
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
    headers: {
      Authorization:  `token ${TOKEN}`,
      'User-Agent':   'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      Accept:         'application/vnd.github.v3+json'
    }
  }, putBody);

  console.log('Gallery queue:', putRes.status === 200 ? 'updated ✓' : putRes.body.slice(0, 120));

  // ── 4. Write entry to local file for DB indexing
  fs.writeFileSync('vesper-entry.json', JSON.stringify(newEntry, null, 2));
  console.log('Entry saved: vesper-entry.json');
})();
