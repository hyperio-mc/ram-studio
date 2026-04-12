'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const config      = JSON.parse(fs.readFileSync(path.join(__dirname,'community-config.json'),'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const SUBDOMAIN    = 'ram';

const SLUG     = 'tempo';
const APP_NAME = 'TEMPO';
const TAGLINE  = 'Time & Billing Intelligence for Creative Freelancers';
const ARCHETYPE = 'productivity-light';

const penJson = fs.readFileSync(path.join(__dirname,'tempo.pen'),'utf8');

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    r.on('error',reject);
    if(body) r.write(body);
    r.end();
  });
}

function zenPut(slug, title, html) {
  const body = JSON.stringify({title,html,overwrite:true});
  return req({
    hostname:'zenbin.org', path:`/v1/pages/${slug}`, method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Content-Length':Buffer.byteLength(body),
      'X-Subdomain':SUBDOMAIN,
    }
  }, body);
}

function buildViewer() {
  let html = fs.readFileSync(path.join(__dirname,'viewer.html'),'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  html = html.replace('<script>', injection+'\n<script>');
  return html;
}

async function updateGithubQueue(mockUrl) {
  const getRes = await req({
    hostname:'api.github.com',
    path:`/repos/${GITHUB_REPO}/contents/queue.json`,
    method:'GET',
    headers:{
      'Authorization':`token ${GITHUB_TOKEN}`,
      'User-Agent':'ram-heartbeat/1.0',
      'Accept':'application/vnd.github.v3+json',
    }
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content,'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if(Array.isArray(queue)) queue={version:1,submissions:queue,updated_at:new Date().toISOString()};
  if(!queue.submissions) queue.submissions=[];

  const newEntry={
    id:`heartbeat-${SLUG}-${Date.now()}`,
    status:'done',
    app_name:APP_NAME,
    tagline:TAGLINE,
    archetype:ARCHETYPE,
    design_url:`https://ram.zenbin.org/${SLUG}`,
    mock_url:mockUrl||`https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:new Date().toISOString(),
    published_at:new Date().toISOString(),
    credit:'RAM Design Heartbeat',
    prompt:'Warm-light minimal time-tracking & billing app for creative freelancers. Inspired by Midday.ai (unified business data), Cardless/Equals (clean product dashboards). 5 screens: Dashboard, Timer, Projects, Insights, Invoice.',
    screens:5,
    source:'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at=new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
  const putBody = JSON.stringify({
    message:`add: ${APP_NAME} to gallery (heartbeat)`,
    content:newContent, sha:currentSha
  });
  const putRes = await req({
    hostname:'api.github.com',
    path:`/repos/${GITHUB_REPO}/contents/queue.json`,
    method:'PUT',
    headers:{
      'Authorization':`token ${GITHUB_TOKEN}`,
      'User-Agent':'ram-heartbeat/1.0',
      'Content-Type':'application/json',
      'Content-Length':Buffer.byteLength(putBody),
      'Accept':'application/vnd.github.v3+json',
    }
  }, putBody);
  return putRes.status===200?'OK':putRes.body.slice(0,100);
}

(async()=>{
  // a) Hero
  console.log('Publishing hero page…');
  const heroHtml = fs.readFileSync(path.join(__dirname,'tempo-hero.html'),'utf8');
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log(`  hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // b) Viewer
  console.log('Publishing viewer…');
  try {
    const viewerHtml = buildViewer();
    const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Design Viewer`, viewerHtml);
    console.log(`  viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  } catch(e) {
    console.log('  viewer skipped:', e.message);
  }

  // c) GitHub queue
  console.log('Updating GitHub gallery queue…');
  try {
    const qr = await updateGithubQueue();
    console.log('  queue:', qr);
  } catch(e) {
    console.log('  queue error:', e.message);
  }

  console.log('\n✓ Pipeline (hero + viewer + queue)');
  console.log(`  Design: https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
