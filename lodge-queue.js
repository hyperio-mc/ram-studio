'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG      = 'lodge';
const APP_NAME  = 'Lodge';
const TAGLINE   = 'Boutique Nature Retreats';
const ARCHETYPE = 'hospitality-booking-editorial';
const PROMPT    = 'Light editorial booking app for boutique cabin and nature retreats. Warm cream (#FAF7F2), bark brown (#4A3728), sage green (#7B9B6B). 6 screens: Discover with curated retreat grid and category filter, Property detail with photo hero and amenity list, Date picker with inline cancellation policy preview, Guest details with clear multi-stage cancellation policy card before confirm, Booking confirmation with host message, My Trips with upcoming and past stays. Inspired by Moke Valley Cabin on Siteinspire and Kinn Collective editorial style. 522 elements.';

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
    elements:     522,
    theme:        'light',
    heartbeat:    9,
    source:       'heartbeat',
  };

  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat #9)`,
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

  console.log('Gallery queue:', putRes.status === 200 ? 'updated ✓' : putRes.body.slice(0, 120));
}

main().catch(console.error);
