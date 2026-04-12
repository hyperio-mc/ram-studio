'use strict';
const https = require('https'), fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG     = 'vell';
const APP_NAME = 'VELL';
const TAGLINE  = 'Your money, clearly annotated';
const ARCHETYPE = 'personal-finance';
const PROMPT   = 'Light-theme personal finance app inspired by Minimal Gallery warm off-white palettes and Land-Book annotation-style UI (hand-drawn underlines on key numbers, Ellipsus influence). Persimmon accent on vellum backgrounds. 6 screens: Dashboard, Spending, Budget, Goals, Insights, Profile.';

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
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  }
});

const fileData = JSON.parse(getRes.body);
const sha = fileData.sha;
const currentContent = Buffer.from(fileData.content,'base64').toString('utf8');
let queue = JSON.parse(currentContent);

if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const pen = JSON.parse(fs.readFileSync('/workspace/group/design-studio/vell.pen','utf8'));

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
  screens: pen.screens.length,
  elements: pen.metadata.elements,
  theme: 'light',
  source: 'heartbeat',
});
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({
  message: `add: ${APP_NAME} to gallery (heartbeat)`,
  content: newContent,
  sha,
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
  }
}, putBody);
console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0,120));
}
main().catch(console.error);
