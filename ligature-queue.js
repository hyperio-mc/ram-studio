'use strict';
// ligature-queue.js -- add Ligature to gallery queue + index in design DB

const https = require('https');
const fs    = require('fs');

const SLUG      = 'ligature';
const APP_NAME  = 'Ligature';
const TAGLINE   = 'The reading OS';
const ARCHETYPE = 'reading-os';
const PROMPT    = 'Light-theme reading OS for serious readers. LIGHT theme (previous Podium was dark). Inspired by "OS for X" naming trend on Landbook (Codegen: OS for Code Agents, Sanity: Content Operating System) + Litbix for book lovers on minimal.gallery. Warm editorial palette: cream bg (#FAF8F5), amber accent (#C9853A), teal bookmark (#4A7C6F). 5 screens: Library dashboard, Active Reading view with annotation toolbar, Notes/Highlights collection, Reading Stats, Book Detail.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

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
  // ── Fetch current queue ──────────────────────────────────────────────────
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

  const fileData = JSON.parse(getRes.body);
  if (!fileData.sha) {
    console.error('Failed to fetch queue:', getRes.body.slice(0, 200));
    return;
  }

  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue            = JSON.parse(currentContent);

  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  // Skip if already queued
  const existing = queue.submissions.find(s => s.id && s.id.includes(SLUG));
  if (existing) {
    console.log('Ligature already in queue:', existing.id);
    return;
  }

  const newEntry = {
    id:              `heartbeat-${SLUG}-${Date.now()}`,
    status:          'queued',
    pending_publish: true,
    zenbin_limit:    '2026-04-23',  // ZenBin free tier resets on this date
    app_name:        APP_NAME,
    tagline:         TAGLINE,
    archetype:       ARCHETYPE,
    design_url:      `https://ram.zenbin.org/${SLUG}`,
    mock_url:        `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:    new Date().toISOString(),
    published_at:    null,
    credit:          'RAM Design Heartbeat',
    prompt:          PROMPT,
    screens:         5,
    source:          'heartbeat',
    theme:           'light',
    palette:         '#FAF8F5 / #C9853A / #4A7C6F',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `queue: ${APP_NAME} pending ZenBin publish (heartbeat)`,
    content: newContent,
    sha:     currentSha,
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

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`Gallery queue updated (${queue.submissions.length} total designs)`);
    console.log(`${APP_NAME} queued as pending_publish (ZenBin limit resets 2026-04-23)`);
  } else {
    console.error('Gallery queue error:', putRes.status, putRes.body.slice(0, 120));
  }
})();
