'use strict';
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'ward';
const APP_NAME  = 'WARD';
const TAGLINE   = 'Incident intelligence for dev teams';
const ARCHETYPE = 'devops-monitoring';
const PROMPT    = 'Dark incident intelligence mobile app for SRE/dev teams. Inspired by darkmodedesign.com zinc color scale trend and saaspo.com Twingate bold-dark security tool aesthetic. Color-coded status system (emerald/amber/rose) as sole carrier of color.';

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

(async () => {
  // GET current queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  const fileData = JSON.parse(getRes.body);
  const sha      = fileData.sha;
  const raw      = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(raw);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const entry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      6,
    elements:     499,
    theme:        'dark',
    heartbeat:    489,
    source:       'heartbeat',
  };

  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat #489)`,
    content: newContent,
    sha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':        'application/vnd.github.v3+json',
    },
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('Gallery queue updated ✓');
  } else {
    console.log('Gallery queue error:', putRes.body.slice(0, 120));
  }
})();
