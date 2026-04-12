'use strict';
const https = require('https'), fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'hook';
const APP_NAME  = 'HOOK';
const TAGLINE   = 'Webhook Inspector & Debugger';
const ARCHETYPE = 'developer-tools';
const PROMPT    = 'Webhook delivery inspector and debugger for developers. Real-time event feed, request/response inspection with JSON syntax highlighting, per-endpoint health monitoring, alert rules, and delivery timeline. Inspired by Linear\'s spatial elevation model (no shadows, luminance-only depth), Awwwards SOTD Darknode two-accent minimalism, and Orbit ML monitoring aesthetic. Dark theme, near-black + indigo + teal semantic status system.';

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
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const fileData = JSON.parse(getRes.body);
  const sha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 6,
    elements: 502,
    theme: 'dark',
    heartbeat: 47,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat #47)`, content: newContent, sha });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  console.log(`Gallery queue: ${putRes.status === 200 || putRes.status === 201 ? 'OK' : putRes.body.slice(0,120)}`);
}
main().catch(console.error);
