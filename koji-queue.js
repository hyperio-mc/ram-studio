'use strict';
const https = require('https'), fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'koji';
const APP_NAME  = 'KOJI';
const TAGLINE   = 'Fermentation Culture Companion';
const ARCHETYPE = 'fermentation-lifestyle';
const PROMPT    = 'Fermentation culture companion app. Dark theme — deep forest-black #0A1208 base (warm green undertone), warm amber #D97706 accent. Organic bubble scatter motifs on each screen — subtle imperfection as trust signal (NNGroup "Handmade Designs: The New Trust Signal", Apr 2026). Culture as protagonist: Timeline screen tells the culture\'s story as a narrative arc, not a data log. Inspired by Dribbble warm amber/honey on dark organic palette trend (Apr 2026), WGSN Transformative Teal 2026 (consumer appetite for understanding natural processes), Reddit r/UI_Design via Muzli "non-quantified living systems" category gap. JetBrains Mono for all pH values and data readings — precision signal. Activity glow strips on culture cards (amber intensity = activity level). Science screen: pH trend chart with optimal zone band (3.5–4.5), rise timeline bars, plain-language biological context note. Diagnose screen: symptom selector → narrative diagnosis (not error codes). Bake screen: recipe suggestions matched to culture readiness state. 6 screens: Cultures (overview + activity glow), Timeline (14-day narrative), Feed (ratio selector, flour type, sensory notes), Science (pH chart + rise bars + biology note), Diagnose (symptom → narrative), Bake (readiness-matched recipes).';

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
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const sha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 6,
    elements: 733,
    theme: 'dark',
    heartbeat: 503,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat #503)`, content: newContent, sha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`Gallery queue: ${putRes.status === 200 || putRes.status === 201 ? 'OK' : putRes.body.slice(0, 120)}`);
}
main().catch(console.error);
