import https from 'https';
import fs from 'fs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const config=JSON.parse(fs.readFileSync('./community-config.json','utf8'));
const TOKEN=config.GITHUB_TOKEN,REPO=config.GITHUB_REPO;
const SLUG='shelf',APP_NAME='SHELF',TAGLINE='Read more. Track every page.';
const ARCHETYPE='reading-tracker-light';
const PROMPT='Design a light-mode reading tracker app. Warm parchment #FAF7F2, terracotta accent #C8522A (book spine color), sage #4E7D5B for secondary. Inspired by Dribbble mobile trending — Artspire data visualization approach (183 likes) and Ramotion card hierarchy (208 likes). 5 screens: Reading Now (current book with terracotta spine, 62% progress, daily goal ring 28/40, Up Next queue), Library (3-column book grid with spine colors, 2026 goal banner 18/30), Session (01:24:08 48px mono timer, quote capture, ambience picker), Stats (3241 pages hero, day bars, genre breakdown), Discover (personalised recs with spine cards, trending by genre).';

function ghReq(opts,body){
  return new Promise((res,rej)=>{
    const r=https.request(opts,m=>{let d='';m.on('data',c=>d+=c);m.on('end',()=>res({status:m.statusCode,body:d}));});
    r.on('error',rej);if(body)r.write(body);r.end();
  });
}

const getRes=await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',
  headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'}});
const fd=JSON.parse(getRes.body);
let queue=JSON.parse(Buffer.from(fd.content,'base64').toString('utf8'));
if(Array.isArray(queue)) queue={version:1,submissions:queue,updated_at:new Date().toISOString()};
if(!queue.submissions) queue.submissions=[];

const newEntry={
  id:`heartbeat-${SLUG}-${Date.now()}`,status:'done',app_name:APP_NAME,tagline:TAGLINE,
  archetype:ARCHETYPE,design_url:`https://zenbin.org/p/${SLUG}`,
  mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at:new Date().toISOString(),published_at:new Date().toISOString(),
  credit:'RAM Design Heartbeat',prompt:PROMPT,screens:5,source:'heartbeat',
};
queue.submissions.push(newEntry);
queue.updated_at=new Date().toISOString();

const nc=Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
const pb=JSON.stringify({message:`add: ${APP_NAME} to gallery (heartbeat)`,content:nc,sha:fd.sha});
const putRes=await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
  headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Content-Type':'application/json',
    'Content-Length':Buffer.byteLength(pb),'Accept':'application/vnd.github.v3+json'}},pb);
console.log('Gallery:',putRes.status===200?`OK ✓ (${queue.submissions.length} total)`:putRes.body.slice(0,80));

try{
  const db=openDB();upsertDesign(db,newEntry);rebuildEmbeddings(db);
  console.log('DB indexed ✓');
}catch(e){console.log('DB skip:',e.message);}

console.log(`\n✓ SHELF complete`);
console.log(`  https://zenbin.org/p/${SLUG}`);
console.log(`  https://ram.zenbin.org/${SLUG}-mock`);
