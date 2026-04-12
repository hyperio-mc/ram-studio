const https = require('https');
const fs    = require('fs');

const SLUG     = 'mint';
const APP_NAME = 'MINT';
const TAGLINE  = 'Freelance Finance, Clearly';
const ARCHETYPE= 'editorial-finance';
const PROMPT   = 'Freelance finance app with editorial magazine aesthetic. Giant display numerals as hero visuals inspired by QP/PW Magazine editorial layouts on Siteinspire. Warm parchment light theme, deep forest green accent, warm gold highlights. 6 screens: Overview with 88px revenue hero, Invoices editorial table, Cash Flow dual-bar chart with pull-quote annotations, Clients profile cards, Expense journal, Profile/Settings. 521 elements.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function ghReq(opts,body) {
  return new Promise((resolve,reject) => {
    const r = https.request(opts, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    r.on('error',reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  const getRes = await ghReq({
    hostname:'api.github.com',
    path:`/repos/${REPO}/contents/queue.json`,
    method:'GET',
    headers:{Authorization:`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0',Accept:'application/vnd.github.v3+json'},
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content,'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
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
    elements: 521,
    theme: 'light',
    heartbeat: 7,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
  const putBody = JSON.stringify({
    message:`add: ${APP_NAME} to gallery (heartbeat #7)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await ghReq({
    hostname:'api.github.com',
    path:`/repos/${REPO}/contents/queue.json`,
    method:'PUT',
    headers:{
      Authorization:`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0',
      'Content-Type':'application/json','Content-Length':Buffer.byteLength(putBody),
      Accept:'application/vnd.github.v3+json'
    },
  }, putBody);

  console.log('Gallery queue:', putRes.status===200?'OK ✓':putRes.body.slice(0,120));
  return newEntry;
}

main().catch(console.error);
