// kern-full-publish.mjs — hero + viewer + gallery + DB
import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'kern';
const APP_NAME  = 'Kern';
const TAGLINE   = 'Read deep. Think wider.';
const ARCHETYPE = 'knowledge-tool';
const PROMPT    = 'Dark-mode AI reading intelligence for researchers. Inspired by: Linear (darkmodedesign.com) ambient product-preview UX + Obsidian (darkmodedesign.com) violet-on-black graph metaphor + 108 Supply editorial counted-item typography. Violet #7B5EA7 + teal #3ECFCF accent duo on near-black #0C0C10. 5 screens: Home with streak sparkline + AI resurface card + reading queue, Immersive reader with inline AI annotation + highlight glow, Highlights feed with connection badges + filter chips, Knowledge graph with node/edge visualization + dot-grid ambient, Daily spaced-repetition review with SRS buttons + synthesis prompt.';

function req(opts, body) {
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

const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kern — Read deep. Think wider.</title>
<meta name="description" content="AI reading intelligence for deep learners. Connects your highlights, surfaces hidden links, builds your knowledge graph. A RAM design concept.">
<meta property="og:title" content="Kern — Read deep. Think wider.">
<meta property="og:description" content="AI reading intelligence. Highlights connect, knowledge graphs emerge, ideas resurface. A RAM design concept.">
<meta property="og:url" content="https://ram.zenbin.org/kern">
<meta name="theme-color" content="#7B5EA7">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0C0C10;--surface:#131318;--s2:#1C1C26;--border:#252532;
  --text:#E8E4F0;--muted:rgba(200,192,228,0.45);
  --accent:#7B5EA7;--abr:#9B7EC8;
  --teal:#3ECFCF;--tdim:rgba(62,207,207,0.12);
  --vdim:rgba(123,94,167,0.15);
  --green:#4EC994;--amber:#E8A040;
  --pad:max(24px,6vw);
}
html{scroll-behavior:smooth;background:var(--bg)}
body{font-family:'Inter',system-ui,sans-serif;color:var(--text);background:var(--bg);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 var(--pad);height:60px;
  background:rgba(12,12,16,0.88);
  backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
}
.logo{font-size:22px;font-weight:700;letter-spacing:-0.8px}
.nav-links{display:flex;gap:28px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:500;transition:color 0.2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{
  background:var(--accent);color:#fff;
  padding:8px 18px;border-radius:8px;
  font-size:13px;font-weight:600;
  transition:background 0.2s;
}
.nav-cta:hover{background:var(--abr)}

/* hero */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:80px var(--pad) 60px;text-align:center;
  position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;top:-15%;left:50%;transform:translateX(-50%);
  width:800px;height:800px;
  background:radial-gradient(circle,rgba(123,94,167,0.16) 0%,transparent 65%);
  pointer-events:none;
}
.hero::after{
  content:'';position:absolute;bottom:-8%;right:-5%;
  width:600px;height:600px;
  background:radial-gradient(circle,rgba(62,207,207,0.09) 0%,transparent 65%);
  pointer-events:none;
}
.eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--tdim);border:1px solid rgba(62,207,207,0.22);
  border-radius:20px;padding:6px 16px;
  font-size:11px;font-weight:700;letter-spacing:1.1px;color:var(--teal);
  text-transform:uppercase;margin-bottom:32px;
}
h1{
  font-size:clamp(54px,9vw,100px);font-weight:800;
  letter-spacing:-3.5px;line-height:1.0;
  margin-bottom:24px;max-width:900px;
}
h1 em{
  font-style:normal;
  background:linear-gradient(130deg,var(--abr),var(--teal));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.sub{
  font-size:clamp(16px,2.5vw,20px);color:var(--muted);
  max-width:520px;line-height:1.65;margin-bottom:48px;
}
.actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.btn-p{
  background:var(--accent);color:#fff;
  padding:14px 32px;border-radius:12px;
  font-size:15px;font-weight:600;
  display:inline-flex;align-items:center;gap:8px;
  transition:background 0.2s,transform 0.15s;
}
.btn-p:hover{background:var(--abr);transform:translateY(-2px)}
.btn-g{
  background:var(--s2);border:1px solid var(--border);color:var(--text);
  padding:14px 26px;border-radius:12px;
  font-size:15px;font-weight:500;
  transition:border-color 0.2s,transform 0.15s;
}
.btn-g:hover{border-color:var(--abr);transform:translateY(-2px)}

/* phone previews */
.previews{
  margin-top:80px;width:100%;max-width:1100px;
  display:flex;gap:20px;justify-content:center;align-items:flex-start;
  flex-wrap:wrap;
}
.phone{
  background:var(--s2);border:1px solid var(--border);
  border-radius:28px;overflow:hidden;
  box-shadow:0 40px 80px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.04);
  transition:transform 0.3s;flex-shrink:0;
}
.phone:hover{transform:translateY(-6px)}
.phone.center{transform:scale(1.07) translateY(-10px);z-index:2}
.phone.center:hover{transform:scale(1.07) translateY(-16px)}
.phone-body{padding:18px 14px;min-height:300px;background:var(--bg)}
.phone-label{
  text-align:center;padding:10px 6px;border-top:1px solid var(--border);
  font-size:10px;font-weight:600;color:var(--muted);letter-spacing:0.6px;text-transform:uppercase;
}
.sc-title{font-size:20px;font-weight:700;letter-spacing:-0.6px;color:var(--text);margin-bottom:4px}
.sc-sub{font-size:10px;color:var(--muted);margin-bottom:12px}
.sc-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px}
.sc-num{font-size:26px;font-weight:800;color:var(--text);letter-spacing:-1px}
.sc-dim{font-size:10px;color:var(--muted)}
.sc-teal{background:var(--tdim);border:1px solid rgba(62,207,207,0.2);border-radius:8px;padding:10px;border-left:3px solid var(--teal)}
.sc-teal-t{font-size:9px;font-weight:700;color:var(--teal);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:5px}
.sc-teal-b{font-size:11px;color:var(--text);line-height:1.5}
.sc-vi{background:rgba(123,94,167,0.14);border-radius:4px;padding:10px 10px 10px 14px;border-left:3px solid var(--abr);margin-bottom:8px}
.sc-vi p{font-size:12px;color:var(--text);line-height:1.5}
.sc-ann{background:var(--tdim);border-radius:8px;padding:9px}
.sc-ann p{font-size:11px;color:var(--teal);line-height:1.4}
.badge-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.badge{display:inline-block;background:rgba(123,94,167,0.15);border-radius:10px;padding:3px 9px;font-size:9px;font-weight:600;color:var(--abr)}
.badge.teal{background:var(--tdim);color:var(--teal)}
.prog-wrap{margin-bottom:8px}
.prog-lbl{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-bottom:4px}
.prog-bar{height:4px;background:var(--s2);border-radius:2px}
.prog-fill{height:100%;border-radius:2px;background:var(--abr)}
.prog-fill.teal{background:var(--teal)}

/* sections */
.section{padding:100px var(--pad);max-width:1100px;margin:0 auto}
.sec-label{font-size:10px;font-weight:700;letter-spacing:1.2px;color:var(--teal);text-transform:uppercase;margin-bottom:14px}
.sec-h2{font-size:clamp(32px,5vw,52px);font-weight:700;letter-spacing:-1.5px;line-height:1.1;margin-bottom:52px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.feat-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:28px;
  transition:border-color 0.2s,transform 0.2s;position:relative;overflow:hidden;
}
.feat-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--accent),var(--teal));
  opacity:0;transition:opacity 0.2s;
}
.feat-card:hover{border-color:var(--abr);transform:translateY(-2px)}
.feat-card:hover::before{opacity:1}
.feat-icon{
  width:44px;height:44px;background:var(--vdim);border-radius:11px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;margin-bottom:14px;
}
.feat-title{font-size:15px;font-weight:600;letter-spacing:-0.2px;margin-bottom:9px}
.feat-desc{font-size:13px;color:var(--muted);line-height:1.6}
.stats{display:flex;gap:48px;flex-wrap:wrap;padding:56px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:80px}
.stat-v{font-size:40px;font-weight:800;letter-spacing:-2px}
.stat-v.vi{color:var(--abr)}
.stat-v.tl{color:var(--teal)}
.stat-v.gn{color:var(--green)}
.stat-l{font-size:12px;color:var(--muted);font-weight:500;margin-top:4px}
.cta-box{
  background:var(--vdim);border:1px solid rgba(123,94,167,0.28);
  border-radius:16px;padding:32px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;
  margin-top:56px;
}
.cta-box h3{font-size:20px;font-weight:700;letter-spacing:-0.4px;margin-bottom:6px}
.cta-box p{font-size:14px;color:var(--muted)}
footer{
  padding:40px var(--pad);border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;
  color:var(--muted);font-size:12px;
}
footer a{color:var(--abr)}
.tag{
  display:inline-block;background:var(--tdim);border:1px solid rgba(62,207,207,0.2);
  color:var(--teal);border-radius:20px;padding:3px 10px;
  font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;
}
.tag.vi{background:var(--vdim);border-color:rgba(123,94,167,0.28);color:var(--abr)}
</style>
</head>
<body>
<nav>
  <div class="logo">kern</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/kern-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="/kern-mock">Open mock →</a>
</nav>

<section class="hero">
  <div class="eyebrow"><span>◈</span> AI Reading Intelligence</div>
  <h1>Read deep.<br><em>Think wider.</em></h1>
  <p class="sub">Kern connects your highlights, surfaces hidden links between ideas, and builds your living knowledge graph — turning passive reading into active understanding.</p>
  <div class="actions">
    <a class="btn-p" href="/kern-mock">→ Open interactive mock</a>
    <a class="btn-g" href="/kern-viewer">View .pen design</a>
  </div>

  <div class="previews" id="screens">
    <!-- Phone 1: Home -->
    <div class="phone">
      <div class="phone-body">
        <div class="sc-title">kern</div>
        <div class="sc-sub">Good morning, Rakis.</div>
        <div class="sc-card">
          <div class="sc-num">🔥 14</div>
          <div class="sc-dim">day streak</div>
        </div>
        <div class="sc-teal">
          <div class="sc-teal-t">◈ AI Resurfaced</div>
          <div class="sc-teal-b">"The map is not the territory" — links to 3 notes on LLM hallucination.</div>
        </div>
        <div style="margin-top:10px">
          <div class="sc-sub" style="font-size:9px;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;margin-bottom:6px">QUEUE</div>
          <div class="sc-card" style="padding:8px 10px;margin-bottom:6px">
            <div style="font-size:11px;font-weight:500;color:var(--text)">Effectiveness of RNNs</div>
            <div style="font-size:9px;color:var(--muted);margin-top:3px">karpathy.github.io</div>
          </div>
          <div class="sc-card" style="padding:8px 10px">
            <div style="height:2px;background:var(--s2);border-radius:1px;margin-bottom:6px">
              <div style="width:62%;height:100%;background:var(--abr);border-radius:1px"></div>
            </div>
            <div style="font-size:11px;font-weight:500;color:var(--text)">Against Metrics</div>
            <div style="font-size:9px;color:var(--muted);margin-top:3px">aeon.co · 62%</div>
          </div>
        </div>
      </div>
      <div class="phone-label">Home</div>
    </div>

    <!-- Phone 2: Reader (center/featured) -->
    <div class="phone center">
      <div class="phone-body" style="background:#0A0A0E">
        <div style="height:2px;background:var(--border);border-radius:1px;margin-bottom:12px;position:relative">
          <div style="position:absolute;left:0;top:0;width:38%;height:100%;background:var(--abr);border-radius:1px"></div>
        </div>
        <div style="font-size:9px;color:var(--muted);margin-bottom:10px">karpathy.github.io · Nov 2015</div>
        <div style="font-size:19px;font-weight:700;color:var(--text);letter-spacing:-0.6px;line-height:1.2;margin-bottom:12px">
          The Unreasonable<br>Effectiveness of<br>Recurrent Neural<br>Networks
        </div>
        <div style="font-size:11px;color:var(--text);line-height:1.6;opacity:0.88;margin-bottom:10px">
          There's something magical about Recurrent Neural Networks...
        </div>
        <div class="sc-vi">
          <p>"...the results were so immediately interesting, I felt compelled to investigate them further."</p>
        </div>
        <div class="sc-ann">
          <p>◈ Connected to "Wonder as epistemic signal" from 3 days ago</p>
        </div>
      </div>
      <div class="phone-label">Reader</div>
    </div>

    <!-- Phone 3: Graph -->
    <div class="phone">
      <div class="phone-body" style="background:#080810">
        <div class="sc-title">Knowledge Graph</div>
        <div class="sc-sub">14 concepts · 27 links</div>
        <div style="background:#0B0B14;border:1px solid var(--border);border-radius:12px;padding:10px;margin-bottom:10px">
          <svg viewBox="0 0 280 190" width="100%" style="display:block">
            <line x1="140" y1="80" x2="78" y2="128" stroke="rgba(62,207,207,0.25)" stroke-width="1"/>
            <line x1="140" y1="80" x2="204" y2="110" stroke="rgba(123,94,167,0.25)" stroke-width="1"/>
            <line x1="140" y1="80" x2="108" y2="158" stroke="rgba(123,94,167,0.2)" stroke-width="1"/>
            <line x1="78" y1="128" x2="50" y2="168" stroke="rgba(62,207,207,0.2)" stroke-width="1"/>
            <line x1="204" y1="110" x2="180" y2="158" stroke="rgba(62,207,207,0.2)" stroke-width="1"/>
            <line x1="140" y1="80" x2="176" y2="44" stroke="rgba(232,160,64,0.25)" stroke-width="1"/>
            <circle cx="140" cy="80" r="26" fill="rgba(123,94,167,0.10)"/>
            <circle cx="140" cy="80" r="17" fill="#7B5EA7" stroke="#9B7EC8" stroke-width="2"/>
            <circle cx="78"  cy="128" r="13" fill="#1C1C26" stroke="#3ECFCF" stroke-width="1"/>
            <circle cx="204" cy="110" r="12" fill="#1C1C26" stroke="#9B7EC8" stroke-width="1"/>
            <circle cx="108" cy="158" r="11" fill="#1C1C26" stroke="#E8A040" stroke-width="1"/>
            <circle cx="180" cy="158" r="10" fill="#1C1C26" stroke="#4EC994" stroke-width="1"/>
            <circle cx="50"  cy="168" r="9"  fill="#1C1C26" stroke="#3ECFCF" stroke-width="1"/>
            <circle cx="176" cy="44"  r="9"  fill="#1C1C26" stroke="#E8A040" stroke-width="1"/>
            <text x="140" y="84" text-anchor="middle" fill="#E8E4F0" font-size="7" font-weight="700">Epist.</text>
            <text x="78"  y="148" text-anchor="middle" fill="rgba(200,192,228,0.5)" font-size="6">LLMs</text>
            <text x="207" y="128" text-anchor="middle" fill="rgba(200,192,228,0.5)" font-size="6">Wonder</text>
            <text x="108" y="174" text-anchor="middle" fill="rgba(200,192,228,0.5)" font-size="6">Models</text>
            <text x="180" y="174" text-anchor="middle" fill="rgba(200,192,228,0.5)" font-size="6">Memory</text>
          </svg>
        </div>
        <div class="sc-card" style="border-left:3px solid var(--accent)">
          <div style="font-size:12px;font-weight:600;color:var(--text)">Epistemology</div>
          <div style="font-size:9px;color:var(--muted);margin-top:3px">8 highlights · 5 connections</div>
        </div>
      </div>
      <div class="phone-label">Graph</div>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="sec-label">What Kern does</div>
  <h2 class="sec-h2">Your reading,<br><em style="font-style:normal;color:var(--abr)">finally connected</em></h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">◈</div><div class="feat-title">AI Connection Surfacing</div><div class="feat-desc">Kern reads across all your highlights, automatically surfacing non-obvious links between ideas captured weeks apart.</div></div>
    <div class="feat-card"><div class="feat-icon">◎</div><div class="feat-title">Knowledge Graph</div><div class="feat-desc">Every concept becomes a node. Watch your mental model grow visually — spot orphaned ideas and unexpected clusters.</div></div>
    <div class="feat-card"><div class="feat-icon">◫</div><div class="feat-title">Immersive Reader</div><div class="feat-desc">Distraction-free reading with AI annotations inlined right where you're reading. No context switching, no sidebar anxiety.</div></div>
    <div class="feat-card"><div class="feat-icon">↻</div><div class="feat-title">Spaced Repetition</div><div class="feat-desc">Daily review surfaces highlights at optimal moments — with AI synthesis to find the thread running across today's cards.</div></div>
    <div class="feat-card"><div class="feat-icon">🔥</div><div class="feat-title">Reading Streaks</div><div class="feat-desc">Gentle accountability without gamification anxiety. Track reading sessions, not arbitrary word counts.</div></div>
    <div class="feat-card"><div class="feat-icon">✦</div><div class="feat-title">Synthesis Notes</div><div class="feat-desc">When Kern spots a thread, it prompts you to write a synthesis — turning fragments into genuine insight.</div></div>
  </div>
  <div class="stats">
    <div><div class="stat-v vi">127</div><div class="stat-l">Highlights captured</div></div>
    <div><div class="stat-v tl">27</div><div class="stat-l">AI connections found</div></div>
    <div><div class="stat-v gn">91%</div><div class="stat-l">Retention rate</div></div>
    <div><div class="stat-v vi">14</div><div class="stat-l">Day reading streak</div></div>
  </div>
  <div class="cta-box">
    <div>
      <h3>Explore all 5 screens →</h3>
      <p>Interactive Svelte mock with light/dark toggle. Home, Reader, Highlights, Graph, Daily Review.</p>
    </div>
    <a class="btn-p" href="/kern-mock">Open interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div>kern — RAM Design Heartbeat · 2026-03-28</div>
  <div>
    <span class="tag">Dark theme</span>&nbsp;
    <span class="tag vi">Violet · Teal</span>&nbsp;
    <a href="/kern-viewer">View .pen →</a>&nbsp;
    <a href="/kern-mock">Mock →</a>
  </div>
</footer>
</body></html>`;

// Save hero locally
fs.writeFileSync('/workspace/group/design-studio/kern-hero.html', hero);

// Publish hero
const heroBody = Buffer.from(JSON.stringify({ html: hero }));
const r1 = await req({
  hostname: 'zenbin.org',
  path: `/v1/pages/${SLUG}?overwrite=true`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': heroBody.length, 'X-Subdomain': 'ram' },
}, heroBody);
console.log(`Hero: ${r1.status} ${r1.status < 300 ? '✓' : '✗'} → https://ram.zenbin.org/${SLUG}`);

// Publish viewer
const penJson = fs.readFileSync('/workspace/group/design-studio/kern.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/proxy-viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
if (viewerHtml.includes('window.EMBEDDED_PEN')) {
  viewerHtml = viewerHtml.replace(/window\.EMBEDDED_PEN\s*=\s*[^;]+;/, `window.EMBEDDED_PEN = ${JSON.stringify(penJson)};`);
} else {
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
}
const vBody = Buffer.from(JSON.stringify({ html: viewerHtml }));
const r2 = await req({
  hostname: 'zenbin.org',
  path: `/v1/pages/${SLUG}-viewer?overwrite=true`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': vBody.length, 'X-Subdomain': 'ram' },
}, vBody);
console.log(`Viewer: ${r2.status} ${r2.status < 300 ? '✓' : '✗'} → https://ram.zenbin.org/${SLUG}-viewer`);

// Gallery queue
const ghHeaders = {
  'Authorization': `token ${TOKEN}`,
  'User-Agent': 'ram-heartbeat/1.0',
  'Accept': 'application/vnd.github.v3+json',
};
const g = await req({ hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'GET', headers: ghHeaders });
const gj = JSON.parse(g.body);
let queue = JSON.parse(Buffer.from(gj.content, 'base64').toString('utf8'));
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];
const now = new Date().toISOString();
queue.submissions.push({
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: now,
  published_at: now,
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
queue.updated_at = now;
const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = Buffer.from(JSON.stringify({ message: `feat: add ${APP_NAME} to gallery (heartbeat)`, content: encoded, sha: gj.sha }));
const rp = await req({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { ...ghHeaders, 'Content-Type': 'application/json', 'Content-Length': putBody.length },
}, putBody);
console.log(`Gallery: ${rp.status < 300 ? '✓' : '✗'} (${queue.submissions.length} total)`);

// Design DB
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, {
    id: `heartbeat-${SLUG}-2026`,
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    source: 'heartbeat',
    theme: 'dark',
    prompt: PROMPT,
    screens: 5,
  });
  rebuildEmbeddings(db);
  console.log('DB: ✓ indexed');
} catch(e) { console.log('DB:', e.message); }

console.log(`\n✅ Kern pipeline complete`);
console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`   Mock:   https://ram.zenbin.org/${SLUG}-mock`);
