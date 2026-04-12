'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const SLUG      = 'glow';
const APP_NAME  = 'Glow';
const TAGLINE   = 'Your morning energy operating system';
const ARCHETYPE = 'wellness-productivity';
const PROMPT    = 'Light-mode morning energy OS for founders — inspired by Dawn mental health app (lapa.ninja) warm amber palette, Equals editorial SaaS dashboard (land-book.com), and Litbix warm cream minimalism (minimal.gallery)';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

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

(async () => {
  console.log('── Gallery queue update');

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
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
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
    palette: { bg: '#FBF7F3', accent: '#E8713C', accent2: '#7AAD83' },
    inspiration: ['lapa.ninja (Dawn app)', 'land-book.com (Equals)', 'minimal.gallery (Litbix)'],
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
    }
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('  Gallery queue: OK');
  } else {
    console.error('  Gallery queue failed:', putRes.body.slice(0, 200));
  }

  // Return entry for DB indexing
  console.log('  Entry ID:', newEntry.id);
  fs.writeFileSync(path.join(__dirname, 'glow-entry.json'), JSON.stringify(newEntry, null, 2));
})();
