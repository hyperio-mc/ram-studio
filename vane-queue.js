'use strict';
const https = require('https'), fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'vane';
const APP_NAME  = 'VANE';
const TAGLINE   = 'Hyper-local Weather Intelligence';
const ARCHETYPE = 'weather-outdoor';
const PROMPT    = 'Hyper-local weather intelligence for outdoor athletes (surfers, trail runners, kitesurfers). Dark theme — electric cobalt #1E6EFF on deep navy near-black #06091A. Single-hue monochrome buildout (no secondary palette) inspired by Godly.website avant-garde trend: one pushed color, tone-on-tone texture, maximum discipline. JetBrains Mono for all data values (temperature, wind speed, pressure, swell period), Inter Tight for all labels — two-register type system. Outcome-oriented Insights screen inspired by NNGroup March 2026 article on outcome-oriented vs task-oriented design: surfaces "Best day for surfing this week" and per-sport condition scores rather than raw weather logs. 6 screens: Now (current conditions, wind compass, surf height, AQI), Forecast (hourly strip + 7-day bar chart + wind bars), Alerts (severity-tiered warnings with amber/red functional color), Locations (5 saved spots with mini condition cards), Radar (precipitation map with layer controls + storm tracking), Insights (outcome-driven recommendations + activity score grids).';

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
    elements: 551,
    theme: 'dark',
    heartbeat: 492,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat #492)`, content: newContent, sha });
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
