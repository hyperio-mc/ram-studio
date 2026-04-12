// tome-queue.js — Add TOME to gallery queue

'use strict';
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'tome';
const APP_NAME  = 'Tome';
const TAGLINE   = 'Your reading life, beautifully tracked';
const ARCHETYPE = 'reading-tracker';
const PROMPT    = 'Light-theme personal reading tracker app. Warm paper tones (#F4F0E8), terracotta accent (#B85C38), forest green secondary (#4A7C59). Inspired by "Current - A River of Reading" (land-book.com) and "Litbix (for book lovers)" (minimal.gallery). Editorial serif/sans typography mix. Screens: Home (currently reading + streak), Library (book grid), Book Detail (cover + progress + highlights), Discover (curated recs + trending), Stats (annual goal + weekly chart + genre breakdown). Design push: treat books as editorial objects, not database rows. Generous vertical rhythm, mix of Georgia serif headers with Inter sans data labels.';

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
  // Get current queue
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
    console.error('GET queue failed:', getRes.status, getRes.body.slice(0, 100));
    process.exit(1);
  }

  const fileData      = JSON.parse(getRes.body);
  const currentSha    = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: null,          // ZenBin free tier full -- queued for 2026-04-23
    zenbin_queued: '2026-04-23', // resets on this date
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
    theme:        'light',
    inspiration:  'Current (land-book.com), Litbix (minimal.gallery)',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('Gallery queue updated:', APP_NAME, '--', newEntry.id);
    console.log('Note: ZenBin pages queued for 2026-04-23 (free tier resets)');
  } else {
    console.error('PUT queue failed:', putRes.status, putRes.body.slice(0, 200));
  }
}

main().catch(console.error);
