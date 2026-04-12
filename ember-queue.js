#!/usr/bin/env node
// ember-queue.js — Update GitHub gallery queue for EMBER Podcast AI

const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'ember';
const APP_NAME  = 'Ember';
const TAGLINE   = 'Your podcast, deeply understood';
const ARCHETYPE = 'audio-intelligence';
const PROMPT    = 'EMBER — AI-powered podcast discovery and insights companion. Warm dark theme (#0D0907 bg, #C45E1A amber accent, #E8D5C4 warm white). Inspired by Format Podcasts (dark amber editorial, darkmodedesign.com) + Neon Postgres glowing vertical bars. 5 screens: Discover (AI-curated feed with match scores), Episode Detail (artwork + playback + insights preview), AI Insights (key ideas + quotes + action item), Listening Stats (glowing amber bar chart), Profile (AI taste profile + genre breakdown). Theme rotation: previous entry was Sona (light) → using DARK.';

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
  // Get current queue
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

  const now = new Date().toISOString();
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    slug:         SLUG,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    theme:        'dark',
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: now,
    published_at: now,
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
    palette: {
      bg:      '#0D0907',
      fg:      '#E8D5C4',
      accent:  '#C45E1A',
      accent2: '#F0A030',
    },
    inspiration: 'Format Podcasts (darkmodedesign.com) + Neon Postgres glowing bars (vercel.com/blog)',
  };

  // Save entry locally for DB index
  fs.writeFileSync('/workspace/group/design-studio/ember-queue-entry.json', JSON.stringify(newEntry, null, 2));

  queue.submissions.push(newEntry);
  queue.updated_at = now;

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

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('Gallery queue updated ✓');
    console.log('Entry:', newEntry.id);
  } else {
    console.log('Queue update status:', putRes.status);
    console.log(putRes.body.slice(0, 200));
  }
}

run().catch(console.error);
