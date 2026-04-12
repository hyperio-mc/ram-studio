'use strict';
// bloom-queue.js — add BLOOM to gallery queue + index in design DB
// ZenBin free tier at capacity (resets 2026-04-22)
// Pages queued for publishing when limit resets

const https = require('https');
const fs    = require('fs');

const SLUG      = 'bloom';
const APP_NAME  = 'BLOOM';
const TAGLINE   = 'Customer success for DTC brands';
const ARCHETYPE = 'brand-success-platform';
const PROMPT    = 'Light-theme customer success platform for DTC brands. Warm cream (#F8F5F0), forest green (#2A5A3A), amber (#D4884A). Inspired by darkmodedesign.com Midday (AI finance SaaS), land-book.com Cernel (product onboarding for ecommerce), lapa.ninja Isa de Burgh (CPG brand architect). Bento-grid dashboard layout, health scoring per brand, 6-step onboarding flow, AI insights. 6 screens: Overview, Brands, Onboarding, Insights, Brand Profile, Settings.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
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
  // ── Fetch current queue ──────────────────────────────────────────────────
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

  // Check if bloom already in queue
  const existing = queue.submissions.find(s => s.id && s.id.includes(SLUG));
  if (existing) {
    console.log('bloom already in queue, skipping duplicate add');
    process.exit(0);
  }

  const newEntry = {
    id:              `heartbeat-${SLUG}-${Date.now()}`,
    status:          'queued',            // 'queued' = files ready, awaiting ZenBin publish
    pending_publish: true,
    zenbin_limit:    '2026-04-22',       // ZenBin free tier resets on this date
    app_name:        APP_NAME,
    tagline:         TAGLINE,
    archetype:       ARCHETYPE,
    design_url:      `https://ram.zenbin.org/${SLUG}`,
    mock_url:        `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:    new Date().toISOString(),
    published_at:    null,               // not yet live
    credit:          'RAM Design Heartbeat',
    prompt:          PROMPT,
    screens:         6,
    source:          'heartbeat',
    theme:           'light',
    palette:         '#F8F5F0 / #2A5A3A / #D4884A',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `queue: ${APP_NAME} pending ZenBin publish (heartbeat)`,
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

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`Gallery queue updated ✓ — ${queue.submissions.length} designs total`);
    console.log(`BLOOM queued as pending_publish (ZenBin limit resets ${newEntry.zenbin_limit})`);
  } else {
    console.error('Gallery queue error:', putRes.status, putRes.body.slice(0, 120));
  }
})();
