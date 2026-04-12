'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG      = 'take';
const APP_NAME  = 'Take';
const TAGLINE   = 'AI Video Creation Studio';
const ARCHETYPE = 'ai-video-creative-tools';
const PROMPT    = 'Dark cinematic AI video creation studio. Near-black cinema (#09090B), electric coral (#FF5240), teal (#2DD4BF), violet (#8B5CF6), amber (#F5B13D). 6 screens: Studio dashboard with project grid and GPU credits bar, Generate with prompt input + style presets (Cinematic/Anime/Photorealistic/Abstract/Documentary) + aspect ratio toggles, Timeline editor with three-lane track system (VIDEO/AUDIO/AI) + waveform + AI enhance toolbar, Library with video thumbnail grid and storage bar, Analytics with views chart and platform breakdown, Settings with plan/model config. Inspired by Runway ML, Pika, CapCut Pro. 672 elements.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

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
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const sha      = fileData.sha;
  const current  = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(current);
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
    elements:     672,
    theme:        'dark',
    heartbeat:    10,
    source:       'heartbeat',
  };

  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: Take to gallery (heartbeat #10)`,
    content: newContent,
    sha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json',
    },
  }, putBody);

  console.log('Gallery queue:', putRes.status === 200 ? 'updated ✓' : `${putRes.status} ${putRes.body.slice(0, 120)}`);
}

main().catch(console.error);
