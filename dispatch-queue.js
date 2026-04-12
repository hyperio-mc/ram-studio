#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'dispatch';
const APP_NAME  = 'DISPATCH';
const TAGLINE   = 'Your AI agent orchestration layer.';
const ARCHETYPE = 'ai-agent-orchestration-dark';
const PROMPT    = 'Dark terminal-teal AI agent orchestration dashboard. Deep navy-black bg (#080B0F), JetBrains Mono typography, #00D4AA teal + #5B8AF0 electric blue accents. Inspired by NaughtyDuk live clock + bold availability display (godly.website) and JetBrains Air multi-agent concept (lapa.ninja). 5 screens: Command Center with live timeline + fleet status, Agent Fleet cards with token/cost/ETA, Dispatch Task with smart routing, Live Run with streaming terminal output + action trace, Run History with success/fail states.';

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
    credit: 'RAM Design Heartbeat', prompt: PROMPT, screens: 5, source: 'heartbeat', theme: 'dark',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
  console.log('Gallery queue updated:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));
  return newEntry;
}

main().then(e => console.log('ID:', e.id)).catch(console.error);
