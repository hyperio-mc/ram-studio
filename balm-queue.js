const https = require('https');
const fs    = require('fs');

const config  = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const REPO    = config.GITHUB_REPO;

const SLUG      = 'balm';
const APP_NAME  = 'BALM';
const TAGLINE   = 'Calm clarity for creative freelancers';
const ARCHETYPE = 'freelance-studio';
const PROMPT    = 'Warm light-themed freelance studio OS with editorial ghost date anchors, earthy terracotta/sage palette, and calm financial clarity. Inspired by Cushion App (darkmodedesign.com) peace-of-mind positioning and Awwwards editorial typography trend.';

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
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.error('Failed to fetch queue.json:', getRes.status, getRes.body.slice(0,200));
    return;
  }

  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
    theme:        'light',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('Gallery queue updated: OK');
    console.log('Entry:', newEntry.id);
  } else {
    console.error('Failed:', putRes.status, putRes.body.slice(0,200));
  }
}

run().catch(console.error);
