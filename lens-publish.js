// lens-publish.js — LENS hero + viewer + gallery
// DARK: near-black #09090F + electric violet #7C5CFC + teal #2DCBBA
// Inspired by: Linear "for teams & agents" shift + darkmodedesign.com data-dense SaaS

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'lens';
const APP       = 'LENS';
const TAGLINE   = 'AI agent observability platform';
const ARCHETYPE = 'developer-tools-dark';
const PROMPT    = 'Inspired by Linear.app dark hero "The product development system for teams and agents" (spotted on darkmodedesign.com) and Midday.ai agent-first business stack — both signal the rise of AI agents as first-class team members needing ops tooling. Dark theme. Near-black #09090F + electric violet #7C5CFC + teal/cyan #2DCBBA + Inter typeface. 5 screens: Mission Control (big agent count hero metric, 3 stat tiles, agent health bar rows), Agents (card list with model/status/rate/cost, filter tabs), Task Stream (live feed with emoji icons, status dots, agent attribution), Usage & Cost (spend card, token-by-model progress bars, hourly bar chart), Alerts (error/warn/info cards with colored borders, restart CTA, resolved history).';

// ── Helpers ──────────────────────────────────────────────────────────────────

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    // Strip non-ASCII to avoid WAF issues
    const safeHtml = html.replace(/[^\x00-\x7F]/g, ' ');
    const body = JSON.stringify({ title, html: safeHtml });
    const buf  = Buffer.from(body);
    // Use no subdomain → zenbin.org/p/[slug]  (ram subdomain is at 100-page limit)
    const req  = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const p = JSON.parse(d);
          resolve({ status: res.statusCode, url: p.url || `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0, 200) });
        } catch (e) {
          resolve({ status: res.statusCode, url: `https://zenbin.org/p/${slug}`, raw: d.slice(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ── HERO HTML ─────────────────────────────────────────────────────────────────

const HERO = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LENS - AI Agent Observability Platform</title>
<meta name="description" content="Watch your AI agents work. Real-time task streams, cost tracking, health monitoring, and instant alerts. Dark UI for the AI-native ops team.">
<meta property="og:title" content="LENS - AI Agent Observability Platform">
<meta property="og:description" content="Watch your AI agents work. Real-time task streams, cost tracking, health monitoring, and instant alerts.">
<meta name="theme-color" content="#7C5CFC">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#09090F;
  --s1:#111120;
  --s2:#191930;
  --bd:#242442;
  --tx:#EEEEFF;
  --mu:#7070A0;
  --ac:#7C5CFC;
  --ad:#2A1D6B;
  --a2:#2DCBBA;
  --rd:#FF4757;
  --am:#F59E0B;
  --gn:#22D17A;
  --wh:#FFFFFF;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--tx);font-family:'Inter',sans-serif;line-height:1.6;overflow-x:hidden}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(9,9,15,0.85);backdrop-filter:blur(24px);
  border-bottom:1px solid var(--bd);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:62px;
}
.nav-logo{
  font-size:18px;font-weight:800;letter-spacing:.14em;text-decoration:none;
  color:var(--wh);text-transform:uppercase;
}
.nav-logo span{color:var(--ac)}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{font-size:12px;color:var(--mu);text-decoration:none;letter-spacing:.04em;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--tx)}
.nav-cta{
  background:var(--ac);color:var(--wh);border:none;
  padding:8px 20px;border-radius:8px;font-size:12px;font-weight:700;
  cursor:pointer;letter-spacing:.04em;text-decoration:none;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:.85}

/* ── HERO ── */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:120px 24px 80px;text-align:center;
  position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);
  width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(124,92,252,.28) 0%,transparent 70%);
  pointer-events:none;
}
.hero::after{
  content:'';position:absolute;bottom:-100px;right:-100px;
  width:400px;height:400px;border-radius:50%;
  background:radial-gradient(circle,rgba(45,203,186,.16) 0%,transparent 70%);
  pointer-events:none;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(124,92,252,.15);border:1px solid rgba(124,92,252,.35);
  padding:6px 16px;border-radius:100px;
  font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--ac);
  margin-bottom:32px;text-transform:uppercase;
}
.hero-eyebrow::before{
  content:'';width:6px;height:6px;border-radius:50%;
  background:var(--ac);animation:pulse 2s ease infinite;
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero-title{
  font-size:clamp(52px,9vw,96px);font-weight:900;line-height:.94;
  letter-spacing:-.03em;margin-bottom:28px;
}
.hero-title .ac{color:var(--ac)}
.hero-title .a2{color:var(--a2)}
.hero-sub{
  font-size:clamp(16px,2.5vw,20px);color:var(--mu);max-width:560px;
  margin:0 auto 44px;font-weight:400;line-height:1.55;
}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
.btn-primary{
  background:var(--ac);color:var(--wh);padding:14px 32px;
  border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;
  letter-spacing:.02em;transition:transform .2s,opacity .2s;
}
.btn-primary:hover{transform:translateY(-2px);opacity:.9}
.btn-secondary{
  background:transparent;color:var(--tx);padding:14px 32px;
  border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;
  border:1px solid var(--bd);letter-spacing:.02em;
  transition:border-color .2s,color .2s;
}
.btn-secondary:hover{border-color:var(--ac);color:var(--ac)}

/* ── LIVE STATS BAR ── */
.stats-bar{
  display:flex;gap:0;background:var(--s1);
  border:1px solid var(--bd);border-radius:14px;
  overflow:hidden;max-width:640px;width:100%;margin:0 auto;
}
.stat-item{flex:1;padding:18px 20px;text-align:center;border-right:1px solid var(--bd)}
.stat-item:last-child{border-right:none}
.stat-val{font-size:28px;font-weight:800;margin-bottom:4px}
.stat-label{font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--mu);text-transform:uppercase}
.stat-val.ac{color:var(--ac)}
.stat-val.gn{color:var(--gn)}
.stat-val.a2{color:var(--a2)}

/* ── SECTIONS ── */
section{padding:96px 24px;max-width:1100px;margin:0 auto}
.section-eyebrow{
  font-size:10px;font-weight:700;letter-spacing:.18em;color:var(--ac);
  text-transform:uppercase;margin-bottom:16px;
}
.section-title{
  font-size:clamp(32px,5vw,52px);font-weight:800;line-height:1.05;
  letter-spacing:-.02em;margin-bottom:20px;
}
.section-sub{font-size:17px;color:var(--mu);max-width:520px;line-height:1.6;margin-bottom:56px}

/* ── FEATURE GRID ── */
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.feature-card{
  background:var(--s1);border:1px solid var(--bd);border-radius:16px;
  padding:32px;transition:border-color .3s,transform .3s;
}
.feature-card:hover{border-color:rgba(124,92,252,.5);transform:translateY(-4px)}
.feature-icon{
  width:44px;height:44px;border-radius:12px;display:flex;
  align-items:center;justify-content:center;font-size:20px;
  margin-bottom:20px;
}
.feature-icon.v{background:rgba(124,92,252,.18)}
.feature-icon.t{background:rgba(45,203,186,.18)}
.feature-icon.r{background:rgba(255,71,87,.18)}
.feature-icon.g{background:rgba(34,209,122,.18)}
.feature-title{font-size:16px;font-weight:700;margin-bottom:10px}
.feature-desc{font-size:14px;color:var(--mu);line-height:1.6}

/* ── SCREENS ── */
.screens-section{background:linear-gradient(180deg,transparent,rgba(124,92,252,.05) 50%,transparent)}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
.screen-card{
  background:var(--s1);border:1px solid var(--bd);border-radius:12px;
  overflow:hidden;transition:transform .3s,border-color .3s;
}
.screen-card:hover{transform:scale(1.04);border-color:rgba(124,92,252,.5)}
.screen-mock{
  height:180px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--s2),var(--bg));font-size:36px;
}
.screen-label{padding:12px 14px;font-size:11px;font-weight:600;color:var(--mu);letter-spacing:.06em;text-transform:uppercase}

/* ── PALETTE ── */
.palette-row{display:flex;gap:16px;flex-wrap:wrap}
.swatch{flex:1;min-width:140px}
.swatch-color{height:72px;border-radius:12px;margin-bottom:12px}
.swatch-hex{font-size:12px;font-weight:700;font-family:monospace;letter-spacing:.04em}
.swatch-name{font-size:11px;color:var(--mu);margin-top:4px}

/* ── PHILOSOPHY ── */
.phil-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.phil-left h2{font-size:clamp(28px,4vw,42px);font-weight:800;line-height:1.1;letter-spacing:-.02em;margin-bottom:20px}
.phil-left p{font-size:15px;color:var(--mu);line-height:1.7;margin-bottom:16px}
.phil-right{display:flex;flex-direction:column;gap:20px}
.phil-card{
  background:var(--s1);border:1px solid var(--bd);
  border-left:3px solid var(--ac);border-radius:0 12px 12px 0;padding:20px 24px;
}
.phil-card.t2{border-left-color:var(--a2)}
.phil-card.rd{border-left-color:var(--rd)}
.phil-card h4{font-size:13px;font-weight:700;margin-bottom:8px;font-family:monospace;letter-spacing:.04em}
.phil-card p{font-size:13px;color:var(--mu);line-height:1.6}

/* ── CTA ── */
.cta-section{
  text-align:center;padding:96px 24px 80px;
  background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(124,92,252,.12),transparent);
}
.cta-section h2{font-size:clamp(36px,6vw,68px);font-weight:900;letter-spacing:-.03em;line-height:.96;margin-bottom:24px}
.cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:40px}
.cta-btn-v{
  background:var(--ac);color:var(--wh);padding:15px 36px;
  border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;
}
.cta-btn-ghost{
  background:transparent;color:var(--tx);padding:15px 36px;
  border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;
  border:1px solid var(--bd);
}

/* ── FOOTER ── */
footer{
  border-top:1px solid var(--bd);padding:32px 48px;
  display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:var(--mu);
}
.footer-logo{font-size:15px;font-weight:800;letter-spacing:.12em;color:var(--wh)}

@media(max-width:768px){
  nav{padding:0 20px}
  .nav-links,.nav-cta{display:none}
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .phil-grid{grid-template-columns:1fr}
  footer{flex-direction:column;gap:12px;text-align:center}
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">LE<span>N</span>S</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Design</a></li>
    <li><a href="#palette">Palette</a></li>
    <li><a href="#philosophy">Philosophy</a></li>
  </ul>
  <a class="nav-cta" href="https://zenbin.org/p/lens-viewer">View Design</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">RAM Design Heartbeat</div>
  <h1 class="hero-title">
    Watch your<br>
    <span class="ac">agents</span> work.<br>
    <span class="a2">Live.</span>
  </h1>
  <p class="hero-sub">
    LENS is an AI agent observability platform. Real-time task streams,
    cost tracking, health monitoring, and instant alerts for teams running AI in production.
  </p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://zenbin.org/p/lens-viewer">Open Viewer</a>
    <a class="btn-secondary" href="https://zenbin.org/p/lens-mock">Interactive Mock</a>
  </div>
  <div class="stats-bar">
    <div class="stat-item">
      <div class="stat-val ac">12</div>
      <div class="stat-label">Agents active</div>
    </div>
    <div class="stat-item">
      <div class="stat-val gn">98.2%</div>
      <div class="stat-label">Success rate</div>
    </div>
    <div class="stat-item">
      <div class="stat-val">4,281</div>
      <div class="stat-label">Tasks today</div>
    </div>
    <div class="stat-item">
      <div class="stat-val a2">$14.32</div>
      <div class="stat-label">Spend today</div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features">
  <p class="section-eyebrow">What LENS does</p>
  <h2 class="section-title">Built for<br>the AI-native team.</h2>
  <p class="section-sub">When your team includes AI agents, you need tools that make their work visible. LENS is ops for the era of ambient intelligence.</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon v">&#9632;</div>
      <div class="feature-title">Mission Control</div>
      <div class="feature-desc">One glance shows everything: how many agents are running, their collective success rate, and today's spend. The dashboard your 3am self needs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon t">&#9672;</div>
      <div class="feature-title">Live Task Stream</div>
      <div class="feature-desc">Watch every agent action as it happens. Web searches, code commits, reviews, deployments -- attributed to the agent that ran them, timestamped to the second.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon g">&#9702;</div>
      <div class="feature-title">Health Monitoring</div>
      <div class="feature-desc">Per-agent health bars and status indicators. Spot idle agents, error states, and throughput degradation before they cascade into incidents.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon r">&#9675;</div>
      <div class="feature-title">Cost Intelligence</div>
      <div class="feature-desc">Token usage by model, hourly spend charts, per-agent cost attribution. Know exactly where your LLM budget goes and who is spending it.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon v">&#9670;</div>
      <div class="feature-title">Smart Alerts</div>
      <div class="feature-desc">Errors, rate limit spikes, latency anomalies -- triaged by severity with one-tap remediation actions. Resolve Monitor-05 without digging through logs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon t">&#9644;</div>
      <div class="feature-title">Model Breakdown</div>
      <div class="feature-desc">Multi-model agent fleets handled natively. See Sonnet, Haiku, GPT-4o, Gemini side by side -- token counts, cost share, task throughput per model.</div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section id="screens" class="screens-section" style="padding:96px 24px;max-width:100%">
  <div style="max-width:1100px;margin:0 auto">
    <p class="section-eyebrow">5 screens</p>
    <h2 class="section-title">Every angle covered.</h2>
    <p class="section-sub">From high-level mission control to individual agent health, from live task feeds to cost forensics.</p>
    <div class="screens-grid">
      <div class="screen-card">
        <div class="screen-mock" style="background:linear-gradient(135deg,#09090F,#141420)">&#9647;</div>
        <div class="screen-label">01 Overview</div>
      </div>
      <div class="screen-card">
        <div class="screen-mock" style="background:linear-gradient(135deg,#09090F,#1C1C2E)">&#9643;</div>
        <div class="screen-label">02 Agents</div>
      </div>
      <div class="screen-card">
        <div class="screen-mock" style="background:linear-gradient(135deg,#0B0915,#141420)">&#9648;</div>
        <div class="screen-label">03 Task Stream</div>
      </div>
      <div class="screen-card">
        <div class="screen-mock" style="background:linear-gradient(135deg,#09090F,#141428)">&#9646;</div>
        <div class="screen-label">04 Usage</div>
      </div>
      <div class="screen-card">
        <div class="screen-mock" style="background:linear-gradient(135deg,#120909,#1A1014)">&#9649;</div>
        <div class="screen-label">05 Alerts</div>
      </div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section id="palette" style="padding:96px 24px;max-width:1100px;margin:0 auto">
  <p class="section-eyebrow">Colour system</p>
  <h2 class="section-title">Dark. Dense. Precise.</h2>
  <p class="section-sub">Inspired by the night-mode UIs taking over devtools and ops dashboards -- every colour earns its place by carrying meaning.</p>
  <div class="palette-row">
    <div class="swatch">
      <div class="swatch-color" style="background:#09090F;border:1px solid #242442"></div>
      <div class="swatch-hex" style="color:#EEEEFF">#09090F</div>
      <div class="swatch-name">Void (base)</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#111120"></div>
      <div class="swatch-hex" style="color:#EEEEFF">#111120</div>
      <div class="swatch-name">Surface</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#7C5CFC"></div>
      <div class="swatch-hex" style="color:#EEEEFF">#7C5CFC</div>
      <div class="swatch-name">Electric violet</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#2DCBBA"></div>
      <div class="swatch-hex" style="color:#EEEEFF">#2DCBBA</div>
      <div class="swatch-name">Teal (data)</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#22D17A"></div>
      <div class="swatch-hex" style="color:#09090F">#22D17A</div>
      <div class="swatch-name">Green (OK)</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#FF4757"></div>
      <div class="swatch-hex" style="color:#EEEEFF">#FF4757</div>
      <div class="swatch-name">Red (error)</div>
    </div>
  </div>
</section>

<!-- PHILOSOPHY -->
<section id="philosophy" style="padding:96px 24px;max-width:1100px;margin:0 auto">
  <p class="section-eyebrow">Design rationale</p>
  <div class="phil-grid">
    <div class="phil-left">
      <h2>Designed for the era of ambient agents.</h2>
      <p>Linear's 2026 rebrand dropped "issue tracking" and pushed "for teams and agents" -- a signal that AI agents are becoming first-class team members. That shift needs tooling.</p>
      <p>LENS is what an ops dashboard looks like when your team has 12 members and 9 of them run on inference. Dense information, semantic colour, zero decoration.</p>
      <p>Every visual choice serves legibility under pressure: monitoring screens get read at 2am by tired engineers. No gradients for beauty, only for hierarchy.</p>
    </div>
    <div class="phil-right">
      <div class="phil-card">
        <h4>#09090F -- The Void</h4>
        <p>Near-black with a violet shift, not pure #000000. Reduces harsh contrast while keeping the depth that makes data pop. Matches the purple-tinted OLED dark modes I spotted across darkmodedesign.com nominees.</p>
      </div>
      <div class="phil-card t2">
        <h4>#7C5CFC + #2DCBBA -- Two accent axis</h4>
        <p>Violet for primary actions and the dominant metric (agent count). Teal for financial data (spend, tokens). Semantic duality that trains the eye to read chart type before reading values.</p>
      </div>
      <div class="phil-card rd">
        <h4>Semantic status palette</h4>
        <p>Green = running, amber = idle/warn, red = error. Consistent across every screen -- the same dot that indicates a running agent in the Overview is the dot that marks a successful task in the Stream.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section">
  <p class="section-eyebrow" style="margin-bottom:20px">RAM Design Studio</p>
  <h2>Your agents<br>need a <span style="color:var(--ac)">control room</span>.</h2>
  <p style="font-size:17px;color:var(--mu);max-width:460px;margin:0 auto;line-height:1.6">
    LENS is a design concept from RAM's daily heartbeat -- exploring how developer tools evolve when AI agents become team members.
  </p>
  <div class="cta-btns">
    <a class="cta-btn-v" href="https://zenbin.org/p/lens-viewer">Open Design Viewer</a>
    <a class="cta-btn-ghost" href="https://zenbin.org/p/lens-mock">Interactive Mock (light/dark)</a>
    <a class="cta-btn-ghost" href="https://ram.zenbin.org">Design Studio</a>
  </div>
</div>

<footer>
  <span class="footer-logo">LENS</span>
  <span>AI Agent Observability &mdash; RAM Design Heartbeat &middot; Dark Theme &middot; Inter &middot; &copy; 2026</span>
</footer>

</body>
</html>`;

// ── VIEWER HTML ───────────────────────────────────────────────────────────────

const penJson = fs.readFileSync(path.join(__dirname, 'lens.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

const VIEWER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LENS -- Design Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#09090F;color:#EEEEFF;font-family:'Inter',sans-serif;height:100vh;display:flex;flex-direction:column}
.viewer-bar{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 24px;background:#111120;border-bottom:1px solid #242442;
  flex-shrink:0;
}
.viewer-logo{font-size:14px;font-weight:800;letter-spacing:.12em;color:#7C5CFC}
.back{font-size:11px;color:#7070A0;text-decoration:none;font-weight:500}
.back:hover{color:#EEEEFF}
.mock-link{
  font-size:11px;font-weight:600;text-decoration:none;
  background:#7C5CFC;color:#fff;padding:6px 14px;border-radius:6px;letter-spacing:.02em;
}
#viewer{flex:1;border:none;width:100%}
</style>
</head>
<body>
<div class="viewer-bar">
  <a class="back" href="https://zenbin.org/p/lens">&#8592; LENS</a>
  <span class="viewer-logo">LENS</span>
  <a class="mock-link" href="https://zenbin.org/p/lens-mock">Interactive Mock &#9788;&#9697;</a>
</div>
INJECTION_PLACEHOLDER
<iframe id="viewer" src="https://cdn.zenbin.org/pen-viewer" title="LENS design viewer"></iframe>
</body>
</html>`;

const VIEWER = VIEWER_TEMPLATE.replace('INJECTION_PLACEHOLDER', injection);

// ── RUN ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log('LENS Publish Script');
  console.log('===================\n');

  // 1. Save hero locally
  fs.writeFileSync(path.join(__dirname, 'lens-hero.html'), HERO);
  console.log('+ Saved lens-hero.html');

  // 2. Publish hero
  console.log('Publishing hero -> zenbin.org/p/lens ...');
  let heroUrl = `https://zenbin.org/p/${SLUG}`;
  try {
    const r = await publish(SLUG, HERO, `${APP} -- ${TAGLINE}`);
    console.log(`  ${r.status === 200 || r.status === 201 ? 'OK' : 'Warn ' + r.status} -> ${heroUrl}`);
  } catch (e) {
    console.log('  Error:', e.message);
  }

  // 3. Publish viewer
  console.log(`Publishing viewer -> zenbin.org/p/${SLUG}-viewer ...`);
  fs.writeFileSync(path.join(__dirname, 'lens-viewer.html'), VIEWER);
  let viewerUrl = `https://zenbin.org/p/${SLUG}-viewer`;
  try {
    const r = await publish(`${SLUG}-viewer`, VIEWER, `${APP} -- Design Viewer`);
    console.log(`  ${r.status === 200 || r.status === 201 ? 'OK' : 'Warn ' + r.status} -> ${viewerUrl}`);
  } catch (e) {
    console.log('  Error:', e.message);
  }

  // 4. GitHub gallery queue
  console.log('\nUpdating GitHub gallery queue ...');
  const ghHeaders = {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  let sha, queue;
  try {
    const getRes = await ghReq({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'GET',
      headers: ghHeaders,
    });
    const fileData = JSON.parse(getRes.body);
    sha = fileData.sha;
    const raw = Buffer.from(fileData.content, 'base64').toString('utf8');
    queue = JSON.parse(raw);
    if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];
  } catch (e) {
    console.log('  Could not fetch queue:', e.message);
    return;
  }

  const now = new Date().toISOString();
  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    viewer_url: viewerUrl,
    mock_url: `https://zenbin.org/p/${SLUG}-mock`,
    submitted_at: now,
    published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `feat: add LENS to gallery (heartbeat)`,
    content: newContent,
    sha,
  });

  try {
    const putRes = await ghReq({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) },
    }, putBody);
    console.log(`  Gallery updated: ${putRes.status === 200 ? 'OK' : 'Status ' + putRes.status} (${queue.submissions.length} entries total)`);
  } catch (e) {
    console.log('  Gallery error:', e.message);
  }

  console.log('\n===================');
  console.log('Hero:   https://zenbin.org/p/lens');
  console.log('Viewer: https://zenbin.org/p/lens-viewer');
  console.log('Mock:   https://zenbin.org/p/lens-mock');
}

run();
