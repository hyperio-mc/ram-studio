const https = require('https');
const fs = require('fs');

const SLUG = 'thread';
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({html,title});
    const req=https.request({
      hostname:'zenbin.org',path:`/v1/pages/${slug}?overwrite=true`,method:'POST',
      headers:{'Content-Type':'application/json','X-Subdomain':'ram','Content-Length':Buffer.byteLength(body)}
    },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}))});
    req.on('error',reject);req.write(body);req.end();
  });
}

function ghReq(opts,body){
  return new Promise((resolve,reject)=>{
    const r=https.request(opts,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}))});
    r.on('error',reject);if(body)r.write(body);r.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>THREAD — every thought, connected</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0C0B0F;--surface:#16141C;--surface-b:#1E1C27;--border:#2A2635;
  --text:#EBE8F5;--mid:#8B87A8;--accent:#8B6FE8;--mint:#52B88A;
  --gold:#D4A853;--rose:#E87070;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}

nav{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 2rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:50}
.logo{font-size:1rem;font-weight:700;letter-spacing:.12em;color:var(--text)}
.logo span{color:var(--accent)}
.nav-links{display:flex;gap:1.8rem;align-items:center}
.nav-links a{font-size:.8rem;color:var(--mid);text-decoration:none}
.nav-cta{background:var(--accent);color:#fff;padding:.45rem 1.1rem;border-radius:6px;font-size:.8rem;font-weight:600;text-decoration:none}

.hero{max-width:1100px;margin:0 auto;padding:5.5rem 2rem 4rem;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.hero-eyebrow{font-size:.7rem;font-weight:600;letter-spacing:.14em;color:var(--accent);text-transform:uppercase;margin-bottom:.8rem}
.hero h1{font-size:3.4rem;font-weight:700;line-height:1.1;letter-spacing:-.02em;margin-bottom:1.2rem}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero-sub{font-size:1.05rem;font-weight:300;color:var(--mid);line-height:1.65;max-width:420px;margin-bottom:2rem}
.hero-actions{display:flex;gap:1rem;align-items:center}
.btn-primary{background:var(--accent);color:#fff;padding:.7rem 1.6rem;border-radius:8px;font-size:.88rem;font-weight:600;text-decoration:none}
.btn-secondary{color:var(--mid);font-size:.85rem;text-decoration:none;border-bottom:1px solid var(--border);padding-bottom:2px}

/* Phone mockup */
.phone-wrap{display:flex;justify-content:center}
.phone{width:270px;background:var(--surface);border-radius:28px;padding:16px;border:1px solid var(--border);position:relative;overflow:hidden;box-shadow:0 24px 80px rgba(139,111,232,.12),0 0 0 1px var(--border)}
.glow-orb{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(139,111,232,.18) 0%,transparent 70%);top:-60px;left:50%;transform:translateX(-50%);pointer-events:none}

.note-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.note-date{font-size:7px;color:var(--mid);font-weight:600;letter-spacing:.08em}
.note-stats{text-align:right}
.note-stats span{display:block;font-size:6.5px;color:var(--accent)}
.note-title{font-size:17px;font-weight:700;margin-bottom:8px;line-height:1.2}
.note-divider{height:1px;background:var(--border);margin:8px 0}
.note-text{font-size:9px;color:var(--text);line-height:1.55;margin-bottom:6px}
.note-link{font-size:8.5px;color:var(--accent);margin-bottom:3px}
.note-section{font-size:11px;font-weight:600;margin:8px 0 5px}
.note-task{font-size:9px;color:var(--mid);margin-bottom:3px}
.note-task.pending{color:var(--text)}
.backlink{background:var(--surface-b);border-radius:6px;padding:7px 8px;margin-bottom:5px;border-left:2px solid var(--accent);font-size:8px}
.backlink strong{color:var(--text);display:block;margin-bottom:2px}
.backlink span{color:var(--mid)}
.phone-nav{display:flex;justify-content:space-around;padding:8px 0 0;margin-top:8px;border-top:1px solid var(--border)}
.phone-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px}
.phone-nav-item span{font-size:10px;color:var(--mid)}
.phone-nav-item small{font-size:5.5px;color:var(--mid)}
.phone-nav-item.active span{color:var(--accent)}
.phone-nav-item.active small{color:var(--accent)}

/* Features */
.features{border-top:1px solid var(--border);padding:4.5rem 2rem}
.features-inner{max-width:1100px;margin:0 auto}
.section-label{font-size:.68rem;font-weight:600;letter-spacing:.14em;color:var(--mid);text-transform:uppercase;margin-bottom:2rem}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.feature{background:var(--surface);padding:1.8rem}
.feature-num{font-size:.68rem;color:var(--accent);font-weight:600;letter-spacing:.06em;margin-bottom:.8rem}
.feature h3{font-size:1.05rem;font-weight:600;margin-bottom:.5rem}
.feature p{font-size:.82rem;color:var(--mid);line-height:1.6}

/* Principle */
.principle{max-width:1100px;margin:0 auto;padding:4rem 2rem;display:grid;grid-template-columns:160px 1fr;gap:3rem;align-items:start;border-top:1px solid var(--border)}
.principle-label{font-size:.68rem;font-weight:600;letter-spacing:.12em;color:var(--accent);text-transform:uppercase;padding-top:.2rem}
blockquote{font-size:1.6rem;font-weight:300;line-height:1.4;letter-spacing:-.01em;color:var(--text)}
blockquote em{color:var(--accent);font-style:normal}
blockquote cite{display:block;font-size:.78rem;color:var(--mid);margin-top:.8rem;font-weight:400}

footer{border-top:1px solid var(--border);padding:1.8rem 2rem;display:flex;justify-content:space-between;align-items:center}
.footer-logo{font-size:.85rem;font-weight:700;letter-spacing:.12em}
.footer-links{display:flex;gap:1.4rem}
.footer-links a{font-size:.75rem;color:var(--mid);text-decoration:none}
.footer-note{font-size:.72rem;color:var(--mid)}

@media(max-width:768px){
  .hero{grid-template-columns:1fr;gap:2.5rem;padding:3rem 1.2rem 2rem}
  .hero h1{font-size:2.4rem}
  .features-grid{grid-template-columns:1fr}
  .principle{grid-template-columns:1fr;gap:1rem}
}
</style>
</head>
<body>
<nav>
  <span class="logo">THRE<span>A</span>D</span>
  <div class="nav-links">
    <a href="#">Graph</a><a href="#">Notes</a><a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/thread-mock" class="nav-cta">Try mock ↗</a>
  </div>
</nav>

<section class="hero">
  <div>
    <p class="hero-eyebrow">Personal Knowledge Management</p>
    <h1>Every thought,<br><em>connected.</em></h1>
    <p class="hero-sub">A dark, focused PKM tool built around the graph — not the inbox. Capture ideas, link concepts, and surface what matters when it matters.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/thread-mock" class="btn-primary">Interactive mock ↗</a>
      <a href="https://ram.zenbin.org/thread-mock" class="btn-secondary">Light &amp; dark ☀◑</a>
    </div>
  </div>

  <div class="phone-wrap">
    <div class="phone">
      <div class="glow-orb"></div>
      <div class="note-header">
        <div>
          <div class="note-date">TUE · 24 MARCH 2026</div>
        </div>
        <div class="note-stats">
          <span>247 words</span>
          <span style="color:var(--mid)">18 links</span>
        </div>
      </div>
      <div class="note-title">Today's Note</div>
      <div class="note-divider"></div>
      <div class="note-text">The problem with most PKM systems is they optimize for input, not retrieval. Every thought dumped in, but never surfaced when needed.</div>
      <div class="note-link">→ [[Spaced repetition]], [[Information overload]]</div>
      <div class="note-divider"></div>
      <div class="note-section">Work</div>
      <div class="note-task">☑ Finish THREAD design sprint</div>
      <div class="note-task pending">☐ Review [[API latency notes]]</div>
      <div class="note-task pending">☐ Write [[Weekly review]] template</div>
      <div class="note-divider"></div>
      <div style="font-size:8px;color:var(--mid);font-weight:600;letter-spacing:.06em;margin-bottom:5px">BACKLINKS · 4</div>
      <div class="backlink"><strong>Information overload</strong><span>See also: Inbox zero philosophy...</span></div>
      <div class="backlink" style="border-left-color:var(--mint)"><strong>Spaced repetition</strong><span>Anki vs natural linking approaches</span></div>
      <div class="phone-nav">
        <div class="phone-nav-item active"><span>◎</span><small>Today</small></div>
        <div class="phone-nav-item"><span>⬡</span><small>Graph</small></div>
        <div class="phone-nav-item"><span>▤</span><small>Notes</small></div>
        <div class="phone-nav-item"><span>✦</span><small>Capture</small></div>
        <div class="phone-nav-item"><span>⊕</span><small>Search</small></div>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-inner">
    <p class="section-label">Core concepts</p>
    <div class="features-grid">
      <div class="feature">
        <p class="feature-num">01</p>
        <h3>Graph-first</h3>
        <p>Your notes live in a force-directed graph. See clusters of related ideas emerge naturally — no manual tagging required.</p>
      </div>
      <div class="feature">
        <p class="feature-num">02</p>
        <h3>AI-assisted linking</h3>
        <p>While you capture, THREAD surfaces related notes and suggests backlinks. Your past thinking becomes available when you need it.</p>
      </div>
      <div class="feature">
        <p class="feature-num">03</p>
        <h3>Focused capture</h3>
        <p>One-tap quick capture with a cursor in an empty dark field. No distraction, no hierarchy to navigate. Just the thought.</p>
      </div>
    </div>
  </div>
</section>

<div class="principle">
  <p class="principle-label">Design principle</p>
  <blockquote>
    "The best PKM tool isn't the one with the most features — it's the one that <em>surfaces the right idea</em> at the right moment."
    <cite>— RAM Design Heartbeat</cite>
  </blockquote>
</div>

<footer>
  <span class="footer-logo">THREAD</span>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/thread-mock">Interactive mock ↗</a>
    <a href="https://ram.zenbin.org">RAM Design Studio</a>
  </div>
  <span class="footer-note">RAM Design Heartbeat · March 2026</span>
</footer>
</body>
</html>`;

async function main(){
  // 1. Hero
  console.log('Publishing hero...');
  const r1=await zenPublish(SLUG,heroHtml,'THREAD — every thought, connected');
  console.log(`Hero: ${r1.status}`,r1.body.slice(0,60));

  // 2. Gallery queue
  console.log('Updating gallery...');
  const getRes=await ghReq({
    hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'}
  });
  const fileData=JSON.parse(getRes.body);
  let queue=JSON.parse(Buffer.from(fileData.content,'base64').toString('utf8'));
  if(Array.isArray(queue))queue={version:1,submissions:queue,updated_at:new Date().toISOString()};
  if(!queue.submissions)queue.submissions=[];

  const newEntry={
    id:`heartbeat-thread-${Date.now()}`,status:'done',
    app_name:'THREAD',tagline:'every thought, connected',archetype:'pkm-knowledge-graph',
    design_url:`https://ram.zenbin.org/${SLUG}`,mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:new Date().toISOString(),published_at:new Date().toISOString(),
    credit:'RAM Design Heartbeat',
    prompt:'Dark PKM knowledge graph tool. Inspired by Reflect.app (Godly) and Midday dark surfaces on darkmodedesign.com. Near-black bg #0C0B0F, violet #8B6FE8, mint #52B88A. Screens: daily note with backlinks, graph view with node clusters, note detail with highlights, quick capture with AI link suggestions, semantic search.',
    screens:10,source:'heartbeat',theme:'dark',
  };
  queue.submissions.push(newEntry);
  queue.updated_at=new Date().toISOString();

  const newContent=Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
  const putBody=JSON.stringify({message:'add: THREAD to gallery (heartbeat)',content:newContent,sha:fileData.sha});
  const putRes=await ghReq({
    hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Content-Type':'application/json','Content-Length':Buffer.byteLength(putBody),'Accept':'application/vnd.github.v3+json'}
  },putBody);
  console.log(`Gallery: ${putRes.status===200?'OK ✓':putRes.body.slice(0,60)}`);
  console.log(`Total designs: ${queue.submissions.length}`);

  return newEntry;
}
main().then(e=>{console.log('\n✓ Done');console.log(JSON.stringify(e,null,2))}).catch(console.error);
