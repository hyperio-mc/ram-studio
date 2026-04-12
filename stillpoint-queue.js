/**
 * STILLPOINT — gallery queue + design DB indexer
 */
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'stillpoint';
const APP_NAME  = 'STILLPOINT';
const TAGLINE   = 'Enter the stillness.';
const ARCHETYPE = 'focus-session';
const PROMPT    = 'Cinematic dark focus-session app inspired by supercommon systems (land-book.com) — "stillness vs motion" philosophy, ultra-minimal near-black bg, ice-blue accent, sparse negative space.';

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
  // ── Fetch current queue ───────────────────────────────────────────────────
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
    design_url: `https://zenbin.org/p/${SLUG}`,
    mock_url:   `https://zenbin.org/p/${SLUG}-mock`,
    submitted_at:  new Date().toISOString(),
    published_at:  new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 6,
    source: 'heartbeat',
    theme: 'dark',
    palette: {
      bg: '#06060E', accent: '#8BB8FF', accent2: '#C4A882',
    },
    inspiration: 'supercommon systems via land-book.com — stillness vs motion',
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

  console.log('Gallery queue:', putRes.status === 200 ? '✓ updated' : putRes.body.slice(0,100));
  console.log('Entry:', newEntry.id);

  // ── Local reference ───────────────────────────────────────────────────────
  fs.writeFileSync('/workspace/group/design-studio/stillpoint-entry.json',
    JSON.stringify(newEntry, null, 2));
  console.log('Entry saved locally.');
})();
