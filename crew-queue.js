'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG      = 'crew';
const APP_NAME  = 'Crew';
const TAGLINE   = 'AI Workforce Platform';
const ARCHETYPE = 'ai-workforce-productivity';
const PROMPT    = 'Dark deep-slate AI workforce platform. Void slate (#0D0F14) + electric cyan (#06B6D4) + emerald + amber + violet. Hire AI agents with roles (Research/Writer/Analyst/Dev/Email), manage kanban task board (Queued/Running/Review/Approved), review agent deliverables with AI confidence scores, track per-agent analytics and quality scores. Inspired by Paperclip "zero-human companies" trend and Evervault precision dark aesthetic. 683 elements.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

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

async function main() {
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const sha      = fileData.sha;
  const current  = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(current);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      6,
    elements:     683,
    theme:        'dark',
    heartbeat:    12,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({ message: `add: Crew to gallery (heartbeat #12)`, content: newContent, sha });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json' },
  }, putBody);

  console.log('Gallery queue:', putRes.status === 200 ? 'updated ✓' : `${putRes.status} ${putRes.body.slice(0,100)}`);
}

main().catch(console.error);
