'use strict';
const https = require('https');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

const SLUG = 'uplink';
const APP_NAME = 'Uplink';
const TAGLINE = "Your API's nervous system.";
const ARCHETYPE = 'monitoring-dashboard';
const PROMPT = "API health monitoring dashboard for indie developers. Inspired by Godly Status tool (featured Mar 2026), Land-book Interfere reliability branding, and Dark Mode Design Midday business dashboard. Dark navy + electric blue + emerald. Monospace data aesthetic with 5 screens: Status, Routes, Incidents, Analytics, Alerts.";

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // GET queue.json
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (getRes.status !== 200) { console.error('GET queue failed:', getRes.status, getRes.body.slice(0,200)); return; }

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
    design_url: `https://zenbin.org/p/${SLUG}`,
    mock_url: `https://zenbin.org/p/${SLUG}-mock`,
    viewer_url: `https://zenbin.org/p/${SLUG}-viewer`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
    palette: { bg: '#0B0D14', accent: '#4F7EFF', accent2: '#FF4F6A', green: '#3DCA8A' },
    inspired_by: ['godly.website/Status', 'land-book.com/Interfere', 'darkmodedesign.com/Midday'],
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

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

  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : `✗ ${putRes.status}: ${putRes.body.slice(0,100)}`);
  if (putRes.status === 200) {
    console.log('  Entry added:', newEntry.id);
    console.log('  Design URL:', newEntry.design_url);
    console.log('  Mock URL:', newEntry.mock_url);
  }
}

main().catch(console.error);
