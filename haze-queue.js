'use strict';
// haze-queue.js — gallery queue + design DB for HAZE

const https = require('https');
const fs    = require('fs');

const config     = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN      = config.GITHUB_TOKEN;
const REPO       = config.GITHUB_REPO;

const SLUG       = 'haze';
const APP_NAME   = 'HAZE';
const TAGLINE    = 'focus deep, drift less';
const ARCHETYPE  = 'focus-productivity';
const PROMPT     = 'Inspired by Midday.ai (darkmodedesign.com) — floating dark dashboard + prose-first data widgets ("Strong week! 18h…"). Also: Evervault (godly.website) ultra-dark navy #010314, Obsidian OS dark serif display. Dark ambient focus & session intelligence app for independent creatives. Electric violet + mint-teal palette. 5 screens: Home (prose dashboard), Session (immersive timer with glow rings), Library (2-col soundscape grid), History (heatmap calendar), Insights (weekly AI brief). Dark theme.';

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
  console.log('📚 Updating gallery queue…');
  const headers = {
    'Authorization': `token ${TOKEN}`,
    'User-Agent':    'ram-heartbeat/1.0',
    'Accept':        'application/vnd.github.v3+json',
  };

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'GET',
    headers,
  });

  const fileData   = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const raw        = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(raw);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  // Remove any previous haze entry
  queue.submissions = queue.submissions.filter(s => s.app_name !== APP_NAME);

  const now = new Date().toISOString();
  const newEntry = {
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
    screens:      5,
    source:       'heartbeat',
    theme:        'dark',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `feat: add ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'PUT',
    headers:  { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) },
  }, putBody);

  console.log(`  GitHub → ${putRes.status}`, putRes.status === 200 ? `OK — ${queue.submissions.length} total entries` : putRes.body.slice(0, 100));
})();
