'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG = 'crew';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org', port: 443, path: `/v1/pages/${slug}`, method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body), 'X-Subdomain': 'ram' },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'crew.pen'), 'utf8');
const pen     = JSON.parse(penJson);

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Crew — AI Workforce Platform</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0D0F14; --surf:#12151D; --card:#1A1E2A; --border:#252D40;
    --text:#E2E8F0; --text2:#94A3B8; --text3:#475569;
    --cyan:#06B6D4; --cyan2:#0891B2; --cyan3:#67E8F9;
    --emerald:#10B981; --amber:#F59E0B; --violet:#8B5CF6; --rose:#F43F5E;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  .hero{
    min-height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 24px 60px;position:relative;overflow:hidden;
    background:
      radial-gradient(ellipse 55% 40% at 65% 10%, rgba(6,182,212,0.10) 0%, transparent 65%),
      radial-gradient(ellipse 40% 35% at 20% 85%, rgba(16,185,129,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 30% 30% at 85% 70%, rgba(139,92,246,0.06) 0%, transparent 50%),
      var(--bg);
  }
  .badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);
    color:var(--cyan3);font-size:11px;font-weight:600;letter-spacing:2px;
    padding:6px 16px;border-radius:100px;margin-bottom:32px;
  }
  .dot{width:6px;height:6px;border-radius:50%;background:var(--emerald);animation:pulse 2s infinite;display:inline-block}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  h1{
    font-family:'Playfair Display',serif;font-size:clamp(64px,11vw,128px);
    font-weight:700;line-height:0.95;text-align:center;margin-bottom:8px;
    background:linear-gradient(135deg,#E2E8F0 0%,#67E8F9 40%,#06B6D4 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-3px;
  }
  .sub{font-size:clamp(13px,1.5vw,16px);color:var(--text3);letter-spacing:3px;text-transform:uppercase;font-weight:600;text-align:center;margin-bottom:12px}
  .tagline{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,2.5vw,26px);
    color:var(--text2);text-align:center;margin-bottom:56px;max-width:480px;line-height:1.5;
  }
  .ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-p{
    background:linear-gradient(135deg,var(--cyan),var(--cyan2));color:var(--bg);
    font-weight:700;font-size:14px;padding:14px 28px;border-radius:100px;
    box-shadow:0 8px 32px rgba(6,182,212,0.3);text-decoration:none;display:inline-block;
  }
  .btn-s{
    background:rgba(26,30,42,0.8);color:var(--text2);font-weight:500;font-size:14px;
    padding:14px 28px;border-radius:100px;border:1px solid var(--border);
    text-decoration:none;display:inline-block;backdrop-filter:blur(8px);
  }
  .screens-row{
    display:flex;gap:16px;justify-content:center;align-items:flex-end;
    overflow-x:auto;padding:0 24px;
  }
  .screen-card{
    flex-shrink:0;border-radius:20px;overflow:hidden;
    box-shadow:0 32px 64px rgba(0,0,0,0.6),0 0 0 1px rgba(6,182,212,0.10);
    transition:transform 0.3s ease;
  }
  .screen-card:hover{transform:translateY(-8px) scale(1.02)}
  .screen-card.main{transform:scale(1.10);z-index:2}
  .screen-card.main:hover{transform:translateY(-10px) scale(1.12)}
  .screen-card img{display:block}

  .features{padding:100px 24px;max-width:1100px;margin:0 auto}
  .features h2{
    font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);
    text-align:center;margin-bottom:16px;
    background:linear-gradient(135deg,#E2E8F0 0%,#06B6D4 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  }
  .features-sub{text-align:center;color:var(--text2);font-size:16px;margin-bottom:64px;line-height:1.6}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .feature-card{
    background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;
    transition:border-color 0.2s,transform 0.2s;
  }
  .feature-card:hover{border-color:rgba(6,182,212,0.3);transform:translateY(-4px)}
  .feature-card h3{font-size:17px;font-weight:600;margin-bottom:10px}
  .feature-card p{font-size:14px;color:var(--text2);line-height:1.7}
  .fi{font-size:28px;margin-bottom:16px;display:block}

  .stat-row{
    display:flex;justify-content:center;gap:0;max-width:700px;margin:0 auto 80px;
    border:1px solid var(--border);border-radius:20px;overflow:hidden;background:var(--card);
  }
  .stat-item{flex:1;padding:32px 24px;text-align:center;border-right:1px solid var(--border)}
  .stat-item:last-child{border-right:none}
  .stat-val{font-size:32px;font-weight:700;margin-bottom:4px}
  .stat-label{font-size:12px;color:var(--text3);letter-spacing:1px;text-transform:uppercase}

  .quote-section{
    padding:100px 24px;
    background:radial-gradient(ellipse 70% 50% at 50% 50%,rgba(6,182,212,0.06) 0%,transparent 70%);
  }
  .quote-inner{max-width:680px;margin:0 auto;text-align:center}
  .qmark{font-size:64px;color:var(--cyan2);opacity:0.4;line-height:1;font-family:'Playfair Display',serif}
  .qtext{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(22px,3vw,36px);
    color:var(--text);line-height:1.4;margin:16px 0 24px;
  }
  .qattr{font-size:13px;color:var(--text3);letter-spacing:1px}

  .palette-section{padding:60px 24px;max-width:800px;margin:0 auto}
  .palette-section h3{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:8px;text-align:center;color:var(--text2)}
  .palette-section p{text-align:center;color:var(--text3);font-size:13px;margin-bottom:28px}
  .swatches{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .swatch{width:72px;height:72px;border-radius:14px;display:flex;align-items:flex-end;padding:6px;font-size:9px;font-weight:600}

  footer{padding:48px 24px;text-align:center;border-top:1px solid var(--border);color:var(--text3);font-size:12px;line-height:2}
  footer a{color:var(--cyan);text-decoration:none}
</style>
</head>
<body>
<section class="hero">
  <div class="badge"><span class="dot"></span> RAM DESIGN · APR 2026 · DARK THEME</div>
  <h1>CREW</h1>
  <p class="sub">Heartbeat #12</p>
  <p class="tagline">Hire agents. Set goals.<br>Ship work without lifting a finger.</p>
  <div class="ctas">
    <a href="https://ram.zenbin.org/crew-viewer" class="btn-p">View Design ✦</a>
    <a href="https://ram.zenbin.org/crew-mock" class="btn-s">Interactive Mock ◈</a>
  </div>
  <div class="screens-row">
    ${pen.screens.map((s, i) => {
      const scales = [0.27, 0.31, 0.37, 0.31, 0.27, 0.22];
      const scale = scales[i] ?? 0.28;
      const w = Math.round(390 * scale);
      const h = Math.round(844 * scale);
      return `<div class="screen-card${i===2?' main':''}">
        <img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}" loading="lazy"/>
      </div>`;
    }).join('\n    ')}
  </div>
</section>

<section class="features" style="padding-top:120px">
  <div class="stat-row">
    <div class="stat-item"><div class="stat-val" style="color:#06B6D4">12</div><div class="stat-label">AI Agents</div></div>
    <div class="stat-item"><div class="stat-val" style="color:#10B981">94%</div><div class="stat-label">Avg Quality</div></div>
    <div class="stat-item"><div class="stat-val" style="color:#F59E0B">1,247</div><div class="stat-label">Tasks/month</div></div>
    <div class="stat-item"><div class="stat-val" style="color:#8B5CF6">$0.28</div><div class="stat-label">Per Task</div></div>
  </div>
  <h2>Your company, run by agents</h2>
  <p class="features-sub">The next org chart isn't all-human. CREW is where you build a team<br>of AI employees, assign them roles, and review their work.</p>
  <div class="features-grid">
    <div class="feature-card"><span class="fi">◎</span><h3>Hire in 60 seconds</h3><p>Name your agent, pick a role (Research, Writing, Dev, Email, Analysis), select a base model, set permissions. Deploy. Your new hire starts immediately.</p></div>
    <div class="feature-card"><span class="fi">⚡</span><h3>Task Board (Kanban)</h3><p>Queued → Running → Review → Approved. Every piece of work has an owner, a deadline, and a priority. Nothing slips through the cracks.</p></div>
    <div class="feature-card"><span class="fi">✦</span><h3>Deliverable Review</h3><p>AI scores each deliverable before it hits your queue. Review agent notes, source citations, confidence score. Approve, revise, or reject — one tap.</p></div>
    <div class="feature-card"><span class="fi">◈</span><h3>Performance Analytics</h3><p>Track tasks completed, quality scores, speed, and cost per output for each agent. Know which agents earn their keep — and which need retraining.</p></div>
    <div class="feature-card"><span class="fi">⊞</span><h3>Permission Control</h3><p>Each agent has a granular permission set: web search, email, file access, code execution, API calls. You decide what each agent can and cannot touch.</p></div>
    <div class="feature-card"><span class="fi">⟳</span><h3>Real-time Utilization</h3><p>See live utilization for every agent. Who's maxed out? Who's idle? CPU-like bars for your workforce — rebalance assignments in one view.</p></div>
  </div>
</section>

<section class="quote-section">
  <div class="quote-inner">
    <div class="qmark">"</div>
    <p class="qtext">The best companies in 2026 won't be all-human. They'll be all-intention — humans setting goals, agents executing.</p>
    <p class="qattr">— CREW PHILOSOPHY</p>
  </div>
</section>

<section class="palette-section">
  <h3>Deep Slate Palette</h3>
  <p>Void darkness with electric cyan intelligence, emerald vitality</p>
  <div class="swatches">
    <div class="swatch" style="background:#0D0F14;border:1px solid #252D40;color:#475569">Void</div>
    <div class="swatch" style="background:#12151D;color:#475569">Slate</div>
    <div class="swatch" style="background:#1A1E2A;color:#475569">Card</div>
    <div class="swatch" style="background:#06B6D4;color:#0D0F14">Cyan</div>
    <div class="swatch" style="background:#10B981;color:#0D0F14">Emerald</div>
    <div class="swatch" style="background:#F59E0B;color:#0D0F14">Amber</div>
    <div class="swatch" style="background:#8B5CF6;color:white">Violet</div>
    <div class="swatch" style="background:#F43F5E;color:white">Rose</div>
  </div>
</section>

<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Heartbeat #12 · April 2026</p>
  <p>Inspired by Paperclip (Lapa Ninja) · Evervault (Godly) · Mixpanel AI Analytics</p>
  <p style="margin-top:8px;color:#1E2333">683 elements · 6 screens · Pencil.dev v2.8</p>
</footer>
</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing CREW hero...');
  const r1 = await publish(SLUG, heroHtml, 'Crew — AI Workforce Platform');
  console.log(`Hero: ${r1.status} → https://${HOST}/${SLUG}`);

  console.log('Publishing CREW viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Crew — Viewer');
  console.log(`Viewer: ${r2.status} → https://${HOST}/${SLUG}-viewer`);
}

main().catch(console.error);
