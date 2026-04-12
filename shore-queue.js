// shore-queue.js — GitHub queue + design DB for SHORE
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

const SLUG = 'shore';
const APP_NAME = 'SHORE';
const TAGLINE = 'Every meeting, turned into momentum';
const ARCHETYPE = 'ai-productivity';
const ORIGINAL_PROMPT = 'AI meeting intelligence platform. Light editorial theme, warm linen palette, deep teal accent. Inspired by NN/G "Outcome-Oriented Design: The Era of AI Design" (Mar 23 2026) + Minimal Gallery SaaS trend (Folk, Composio, Adaline). Outcome-focused: surfaces decisions, actions and patterns.';

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
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
    palette: {
      bg: '#F5F2ED', surface: '#FFFFFF', text: '#1A1917',
      accent: '#1B6B5A', accent2: '#D4613A',
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
    }
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('✓ Gallery queue updated');
  } else {
    console.error('Queue update failed:', putRes.status, putRes.body.slice(0, 100));
  }

  return newEntry;
}

run().then(entry => {
  console.log('Entry added:', entry.id);
  // Now index in design DB
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = require('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, { ...entry });
    rebuildEmbeddings(db);
    console.log('✓ Indexed in design DB');
  } catch(e) {
    console.log('(design-db not available, skipping)', e.message);
  }
}).catch(console.error);
