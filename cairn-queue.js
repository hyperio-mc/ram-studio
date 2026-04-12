'use strict';
const https = require('https'), fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'cairn';
const APP_NAME  = 'CAIRN';
const TAGLINE   = 'Trail Planning & Field Notes';
const ARCHETYPE = 'outdoor-productivity';
const PROMPT    = 'Trail planning and field notes app for serious hikers. Inspired by Land-book tech-spec grid aesthetic (topographic contour lines as design element, monospace coordinates throughout) and Godly barely-there UI (chrome eliminated, typography carries weight). Light theme: parchment canvas #F6F3EE, forest green #3A7A52 trail accent, amber #C67E1A for warnings. Ruled-paper notes screen with red margin line. Bottom-centric architecture (Mobbin pattern). 6 screens: Map (topo contour lines + bottom sheet), Routes (library with difficulty colour strips), Notes (ruled notebook with margin rule), Elevation (profile graph with filled area), Waypoint (detail with coordinate readout), Active Tracking (live stats + recording indicator).';

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
    elements: 565,
    theme: 'light',
    heartbeat: 467,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat #467)`, content: newContent, sha });

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
