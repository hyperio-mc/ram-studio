// SONA — Gallery queue + design DB indexing
'use strict';
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'sona';
const APP_NAME  = 'Sona';
const TAGLINE   = 'Speak freely, hear clearly';
const ARCHETYPE = 'ai-voice-wellness-journal';
const PROMPT    = 'Design a light-mode AI voice journaling app for emotional wellbeing — inspired by Format AI\'s "hear the color" concept (featured on darkmodedesign.com). Users speak; AI synthesises emotional insights and weekly audio digests.';

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
  // ── 1. Read current queue ──
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  // ── 2. New entry ──
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
    screens:      5,
    source:       'heartbeat',
    theme:        'light',
    palette: {
      bg:      '#F6F3EE',
      surface: '#FFFFFF',
      accent:  '#E8603A',
      accent2: '#7C5CFC',
    },
    inspiration: 'Format AI (useformat.ai/podcasts) — "hear the color" emotional AI synthesis, spotted on darkmodedesign.com',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  // ── 3. Update GitHub ──
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  console.log('Gallery queue updated:', putRes.status === 200 ? '✓ OK' : `✗ ${putRes.body.slice(0, 100)}`);
})();
