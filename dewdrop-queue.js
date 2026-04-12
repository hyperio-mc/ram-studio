'use strict';
const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

const SLUG      = 'dewdrop';
const APP_NAME  = 'DEWDROP';
const TAGLINE   = 'daily mood & micro-journal';
const ARCHETYPE = 'emotional-wellness-journal';
const PROMPT    = 'Light editorial mood tracking app. Inspired by "Voy: Your Proactive Companion for Healthy Living" (17♥ on land-book), "Dawn" health/fitness on Lapa Ninja, and Litbix (minimal book tracker on minimal.gallery). Swiss editorial layout — large serif numerals as data viz, cream background (#F9F6F1), sage green + warm coral accents, zero card shadows, no chrome. 5 screens: Today (hero mood number), Log Mood, Patterns (heatmap), Journal (timeline), Insights (weekly wrap).';

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
  // GET current queue
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
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
    palette: {
      bg: '#F9F6F1',
      accent: '#7B9E87',
      accent2: '#D4856A',
    },
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

  console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : `Error: ${putRes.body.slice(0, 120)}`);
  return newEntry;
}

main().then(entry => {
  console.log('Entry ID:', entry.id);
}).catch(console.error);
