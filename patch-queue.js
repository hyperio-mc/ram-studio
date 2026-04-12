#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'patch';
const APP_NAME  = 'PATCH';
const TAGLINE   = 'Know your land.';
const ARCHETYPE = 'precision-agriculture-dark';
const PROMPT    = 'Dark precision agriculture intelligence platform — deep night-field green (#0A0F07) bg, vivid grass green (#6ED940) accent, harvest amber (#E8B233) secondary. Inspired by RonDesignLab satellite zone-selection UI (Dribbble) and Drink Mockly bold dark DTC typography (siteinspire). 5 screens: Field Map with satellite NDVI zone overlays and GPS crosshair; Farm Overview dashboard with health score ring and 7-day moisture chart; Sensor Detail with 6-metric soil grid and 30-day trend; Pest & Disease with tiered threat alerts and AI weather risk model; Yield Forecast with scenario sliders and 5-year comparison chart.';

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
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat #6)`, content: newContent, sha: currentSha });
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
