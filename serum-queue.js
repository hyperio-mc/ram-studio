#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'serum';
const APP_NAME  = 'SERUM';
const TAGLINE   = 'Know your skin.';
const ARCHETYPE = 'ai-skin-intelligence-light';
const PROMPT    = 'Light parchment AI skincare intelligence app — warm white (#FAF7F4) bg, terracotta rose (#C46B5A) accents, sage green (#7B9B77) for positive metrics, Inter typography. Inspired by Overlay beauty-tech landing page (lapa.ninja) showing facial AR tracking and "The Future of Beauty is Automated", plus Superpower health intelligence editorial design (godly.website). 5 screens: Scan with AR face tracking dots, scanning frame brackets and skin score ring; Dashboard with 4 metric tiles and 7-day trend chart; Analysis with AI skin grade B+ and 3 concern cards showing cause and fix; Routine with morning step tracker, product toggles and 14-day streak; Progress with 30-day before/after comparison and improvement bars.';

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
    hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done', app_name: APP_NAME, tagline: TAGLINE, archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(), published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat', prompt: PROMPT, screens: 5, source: 'heartbeat', theme: 'light',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));
  return newEntry;
}

main().then(e => console.log('ID:', e.id)).catch(console.error);
