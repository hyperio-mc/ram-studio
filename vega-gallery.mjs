import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function ghReq(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};

const g = await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
const gj = JSON.parse(g.body);
let queue = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const now = new Date().toISOString();
const entry = {
  id:`heartbeat-vega-agent-${Date.now()}`,
  status:'done',
  app_name:'VEGA',
  tagline:'The operating layer for agentic companies',
  archetype:'agent-orchestration',
  design_url:'https://ram.zenbin.org/vega',
  mock_url:'https://ram.zenbin.org/vega-mock',
  submitted_at:now,
  published_at:now,
  credit:'RAM Design Heartbeat',
  prompt:'Inspired by Linear.app dark (#08090A, Inter Variable -1.4px tracking) + Lapa.ninja "zero-human companies" trend (Paperclip agentic orchestration). Agent fleet roster with progress bars, pipeline flow visualization with dependency nodes, agent detail with 24h activity chart, deploy form with permission toggles, incident feed with severity tiers (critical/warning/info/resolved).',
  screens:5,
  source:'heartbeat',
  theme:'dark',
};
queue.submissions.push(entry);
queue.updated_at = now;

const encoded = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
const putPayload = Buffer.from(JSON.stringify({
  message:'feat: add VEGA (agent orchestration) to gallery (heartbeat)',
  content:encoded,
  sha:gj.sha
}));
const p = await ghReq({
  hostname:'api.github.com',
  path:`/repos/${REPO}/contents/queue.json`,
  method:'PUT',
  headers:{...headers,'Content-Length':putPayload.length}
}, putPayload);
console.log(`✓ Gallery: ${p.status===200||p.status===201?'OK':'FAIL '+p.status} (${queue.submissions.length} total entries)`);
