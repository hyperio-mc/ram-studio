'use strict';
const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

const SLUG = 'warp';
const APP_NAME = 'WARP';
const TAGLINE = 'Release velocity for engineering teams';
const ARCHETYPE = 'devops-dashboard';
const ORIGINAL_PROMPT = 'A mobile-first release velocity dashboard for engineering teams — inspired by the premium dark developer tool aesthetic on Godly (Phantom, Reflect, Shuttle) and Dark Mode Design. Deep zinc background, electric indigo + amber accent, bento card layout. 6 screens: Dashboard, Activity Feed, Deploy Detail, Team, Changelog, Integrations.';

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
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
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
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    elements: 551,
    theme: 'dark',
    heartbeat: 505,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat #505)`,
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

  console.log('Gallery queue updated:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 200));
}

main().catch(console.error);
