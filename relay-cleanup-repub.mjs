import https from 'https';
import fs from 'fs';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

function zenReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const r = https.request({
      hostname: 'zenbin.org', path, method,
      headers: { 'X-Subdomain': 'ram', ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}) },
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// Free 4 slots by deleting old pages
const toDelete = ['draft-mock', 'kite-mock', 'bask-mock', 'flare-mock', 'aeon-mock', 'sanctum-mock', 'logr-mock', 'folio-mock'];
let freed = 0;
for (const s of toDelete) {
  if (freed >= 4) break;
  const r = await zenReq('DELETE', `/v1/pages/${s}`);
  console.log(`DELETE ${s} → ${r.status}`);
  if (r.status === 200 || r.status === 204 || r.status === 404) freed++;
}
console.log(`Freed ${freed} slots`);

const hero = fs.readFileSync('/workspace/group/design-studio/relay-hero.html', 'utf8');
const viewerHtml = fs.readFileSync('/workspace/group/design-studio/relay-viewer.html', 'utf8');

// Republish hero
let r = await zenReq('POST', '/v1/pages/relay?overwrite=true', { html: hero });
console.log('Hero publish:', r.status, r.body.slice(0, 80));

// Republish viewer
r = await zenReq('POST', '/v1/pages/relay-viewer?overwrite=true', { html: viewerHtml });
console.log('Viewer publish:', r.status, r.body.slice(0, 80));

// Build and publish mock
const design = {
  appName: 'RELAY', tagline: 'Route, monitor & inspect your AI agents', archetype: 'developer-tools',
  palette: { bg:'#0A0C10', surface:'#111420', text:'#E2E8F5', accent:'#00D47A', accent2:'#7C5CFC', muted:'rgba(107,122,153,0.5)' },
  lightPalette: { bg:'#F4F6FA', surface:'#FFFFFF', text:'#0D1117', accent:'#00A85F', accent2:'#6B46FC', muted:'rgba(13,17,23,0.45)' },
  screens: [
    { id:'dashboard', label:'Dashboard', content: [
      { type:'metric-row', items:[{label:'ACTIVE',value:'6'},{label:'QUEUED',value:'14'},{label:'DONE',value:'47'},{label:'ERRORS',value:'2'}]},
      { type:'list', items:[
        {icon:'activity',title:'researcher-01',sub:'Scraping product docs · 74%',badge:'● active'},
        {icon:'activity',title:'writer-02',sub:'Drafting blog post · 41%',badge:'● active'},
        {icon:'alert',title:'validator-03',sub:'Awaiting next task',badge:'○ idle'},
      ]},
      { type:'text', label:'LOG STREAM', value:'[researcher-01] fetched 12 records\n[writer-02] token: 847/4096\n[validator-03] task complete ✓'},
    ]},
    { id:'agent-detail', label:'Agent Detail', content: [
      {type:'metric',label:'researcher-01',value:'Active',sub:'gpt-4o · Uptime 4h 23m'},
      {type:'metric-row',items:[{label:'TASKS',value:'23'},{label:'TOKENS',value:'184K'},{label:'ERRORS',value:'0'}]},
      {type:'progress',items:[{label:'Task T-204',pct:74},{label:'Context window',pct:62}]},
      {type:'list',items:[{icon:'check',title:'T-203',sub:'Fetch competitor pricing',badge:'✓'},{icon:'check',title:'T-202',sub:'Summarize changelog',badge:'✓'}]},
    ]},
    { id:'task-queue', label:'Task Queue', content: [
      {type:'tags',label:'Filter',items:['All','Pending','Active','Done']},
      {type:'list',items:[
        {icon:'play',title:'T-218 — Generate API docs',sub:'writer-02 · HIGH',badge:'▶ run'},
        {icon:'zap',title:'T-219 — Validate JSON',sub:'validator-03 · MED',badge:'○ wait'},
        {icon:'search',title:'T-220 — Scrape pricing',sub:'researcher-01 · MED',badge:'○ wait'},
        {icon:'list',title:'T-221 — Summarize interviews',sub:'Unassigned · LOW',badge:'○ wait'},
      ]},
    ]},
    { id:'logs', label:'Logs', content: [
      {type:'text',label:'relay:logs — live',value:'[INFO] researcher-01 · fetched 12 records\n[INFO] writer-02 · token usage 847/4096\n[INFO] validator-03 · task T-216 complete\n[WARN] writer-02 · rate limit 85%\n[ERROR] writer-02 · retry 1/3 timeout\n[INFO] validator-03 · schema OK'},
      {type:'metric-row',items:[{label:'INFO',value:'48'},{label:'WARN',value:'3'},{label:'ERROR',value:'1'}]},
    ]},
    { id:'settings', label:'Settings', content: [
      {type:'metric',label:'Account',value:'Rakis',sub:'Pro Plan · 6 agents active'},
      {type:'list',items:[
        {icon:'code',title:'OpenAI',sub:'sk-••••••••••••••3f8a',badge:'● on'},
        {icon:'code',title:'Anthropic',sub:'sk-ant-••••••••••2c1d',badge:'● on'},
        {icon:'code',title:'Serper',sub:'ser-••••••••••••1b4e',badge:'○ off'},
      ]},
    ]},
  ],
  nav: [
    {id:'dashboard',label:'Agents',icon:'activity'},
    {id:'task-queue',label:'Queue',icon:'list'},
    {id:'logs',label:'Logs',icon:'play'},
    {id:'settings',label:'Settings',icon:'settings'},
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(mockHtml, 'relay-mock', 'RELAY — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch(e) {
  console.log('⚠ Mock error:', e.message);
  // Try direct upload as fallback
  const svelteSource = generateSvelteComponent(design);
  const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const mr = await zenReq('POST', '/v1/pages/relay-mock?overwrite=true', { html: mockHtml });
  console.log('Mock direct publish:', mr.status, mr.body.slice(0, 80));
}
