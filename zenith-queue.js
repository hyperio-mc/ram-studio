#!/usr/bin/env node
// ZENITH — gallery queue + DB index

const https = require('https');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'zenith-ops';
const APP_NAME  = 'ZENITH';
const TAGLINE   = 'Command your AI fleet';
const ARCHETYPE = 'ai-ops-command';
const ORIGINAL_PROMPT = 'Dark-themed AI operations command center. Inspired by Midday.ai (DarkModeDesign.com, March 2026) — agent-first "business stack for modern founders" with deep dark palette and always-on metrics. Also Traffic Productions (Godly.website, March 2026) — stats baked into bold typography ("GROW WITH TRAFFIC (27%)"). Design concept: treat AI agents like a military ops fleet — live status grid, mission kanban, anomaly triage, deploy wizard, analytics. Deep space dark (#050810) + electric cyan (#00CFFF) + violet (#8B5CF6). Key pattern: scrolling live metrics ticker inspired by financial trading terminals. 6 screens: Command, Agents, Missions, Alerts, Deploy, Analytics.';

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

async function run() {
  // Get current queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
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
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    source: 'heartbeat',
  };

  // Save entry for DB index
  fs.writeFileSync('/workspace/group/design-studio/zenith-queue-entry.json', JSON.stringify(newEntry, null, 2));

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
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
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);

  console.log('Gallery queue updated:', putRes.status === 200 ? '✓' : putRes.body.slice(0, 100));
}

run().catch(console.error);
