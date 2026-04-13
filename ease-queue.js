'use strict';
const https = require('https'), fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'ease';
const APP_NAME  = 'EASE';
const TAGLINE   = 'Recovery-Aware Training Companion';
const ARCHETYPE = 'fitness-recovery';
const PROMPT    = 'Recovery-aware training companion app. Light theme — warm parchment #F6F3EE base, terracotta #C4623C accent. Warm mineral editorial palette from Siteinspire curation aesthetic (Apr 2026). Rest is the primary metric: every screen leads with readiness score, not performance targets. Rest days displayed as data points, not blank gaps. Inspired by Gentler Streak (Apple Design Award 2026 — Mobbin), Siteinspire warm mineral palette, NNGroup "Handmade Designs: The New Trust Signal" (Apr 2026). Georgia/Lora serif for all scores and pull quotes — signals craftsmanship. One-question-at-a-time check-in (Ada Health pattern from Mobbin). Body screen shows per-muscle-group recovery map. Insights screen surfaces 30-day behavioral patterns. 6 screens: Today (readiness score 72/100, recovery signals, plan), Log (one-question check-in, 5 steps), Trends (7-day load vs recovery chart, HRV sparkline, sleep bars), Train (adjusted workout suggestions based on readiness), Body (muscle recovery map, per-group status), Insights (pattern recognition — sleep < 7h drops HRV, 3-week overtraining cycle).';

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
    elements: 774,
    theme: 'light',
    heartbeat: 502,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat #502)`, content: newContent, sha });
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
  console.log(`Gallery queue: ${putRes.status === 200 || putRes.status === 201 ? 'OK' : putRes.body.slice(0, 120)}`);
}
main().catch(console.error);
