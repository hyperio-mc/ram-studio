'use strict';
// canary-publish.js — hero + viewer for CANARY

const fs   = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const SLUG       = 'canary';
const APP_NAME   = 'CANARY';
const TAGLINE    = 'know when they\'re inside';
const SUBDOMAIN  = 'ram';

// ─── ZENBIN PUBLISH ───────────────────────────────────────────────────────────
function zenbin(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html });
    const opts = {
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOMAIN,
        'User-Agent':     'ram-heartbeat/1.0',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const ok = res.statusCode === 200 || res.statusCode === 201;
        resolve({ url: ok ? `https://ram.zenbin.org/${slug}` : null, status: res.statusCode, ok });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#070B14;--surface:#0D1220;--surface2:#131825;
    --border:#1E2D45;--text:#E2E8F3;--muted:#6B7E9A;
    --yellow:#F5C842;--yellow2:#FADA6B;--blue:#3B82F6;
    --red:#EF4444;--green:#22C55E;--orange:#F59E0B;
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(7,11,20,0.88);backdrop-filter:blur(12px)}
  .nav-logo{font-weight:700;font-size:18px;letter-spacing:4px;color:var(--yellow)}
  .nav-links{display:flex;gap:32px}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;letter-spacing:0.5px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--yellow);color:#070B14;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  /* HERO */
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
  .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(245,200,66,0.08) 0%,transparent 60%)}
  .hero-grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:48px 48px;opacity:0.25}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--red);background:linear-gradient(135deg,var(--red)22,var(--yellow)22);border:1px solid var(--yellow)44;border-radius:100px;padding:6px 16px;font-size:12px;font-weight:600;color:var(--yellow);letter-spacing:1.5px;margin-bottom:28px;position:relative}
  .hero-badge::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--red);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
  h1{font-size:clamp(52px,10vw,96px);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:12px;position:relative}
  h1 span{color:var(--yellow)}
  .tagline{font-size:clamp(16px,3vw,22px);color:var(--muted);margin-bottom:40px;letter-spacing:0.5px;max-width:480px;position:relative}
  .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}
  .btn-primary{background:var(--yellow);color:#070B14;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:1.5px;text-decoration:none;transition:all .2s}
  .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
  .btn-secondary{border:1px solid var(--border);color:var(--text);padding:14px 32px;border-radius:10px;font-size:14px;letter-spacing:0.5px;text-decoration:none;transition:all .2s}
  .btn-secondary:hover{border-color:var(--yellow);color:var(--yellow)}

  /* STATS */
  .stats{display:flex;gap:48px;justify-content:center;margin-top:64px;padding-top:40px;border-top:1px solid var(--border);position:relative;flex-wrap:wrap}
  .stat{text-align:center}
  .stat-value{font-size:32px;font-weight:700;color:var(--yellow);display:block}
  .stat-label{font-size:12px;color:var(--muted);letter-spacing:1px;margin-top:4px}

  /* CANARY PULSE STRIP */
  .pulse-section{padding:60px 40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--surface)}
  .pulse-label{text-align:center;font-size:11px;font-weight:700;letter-spacing:3px;color:var(--muted);margin-bottom:24px}
  .pulse-dots{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .dot{width:12px;height:12px;border-radius:50%;transition:all .3s}
  .dot.live{background:var(--green);opacity:0.6}
  .dot.alert{background:var(--red);animation:blink 1.5s infinite}
  .dot.warn{background:var(--orange)}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

  /* HOW IT WORKS */
  .section{padding:80px 40px;max-width:1100px;margin:0 auto}
  .section-label{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--muted);margin-bottom:40px;text-align:center}
  .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px}
  .step{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;position:relative;transition:border-color .2s}
  .step:hover{border-color:var(--yellow)55}
  .step-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--yellow);margin-bottom:12px;letter-spacing:1px}
  .step h3{font-size:16px;font-weight:600;margin-bottom:10px}
  .step p{font-size:13px;color:var(--muted);line-height:1.6}

  /* SCREENS PREVIEW */
  .screens-section{padding:60px 0;background:var(--surface);overflow:hidden}
  .screens-inner{padding:0 40px;max-width:1200px;margin:0 auto}
  .screen-row{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
  .screen-card{flex:0 0 200px;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:20px 16px;transition:transform .2s,border-color .2s}
  .screen-card:hover{transform:translateY(-4px);border-color:var(--yellow)55}
  .screen-icon{font-size:28px;margin-bottom:12px}
  .screen-card h4{font-size:13px;font-weight:600;margin-bottom:6px}
  .screen-card p{font-size:11px;color:var(--muted);line-height:1.5}

  /* ALERT FEED DEMO */
  .demo-section{padding:80px 40px;max-width:700px;margin:0 auto}
  .demo-label{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--muted);margin-bottom:24px;text-align:center}
  .alert-item{display:flex;align-items:flex-start;gap:16px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:12px;border-left:3px solid var(--red)}
  .alert-item.high{border-left-color:var(--orange)}
  .alert-item.medium{border-left-color:var(--yellow)}
  .alert-icon-wrap{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;background:var(--red)22}
  .alert-item.high .alert-icon-wrap{background:var(--orange)22}
  .alert-item.medium .alert-icon-wrap{background:var(--yellow)22}
  .alert-body{flex:1}
  .alert-name{font-size:13px;font-weight:600;margin-bottom:3px}
  .alert-meta{font-size:11px;color:var(--muted)}
  .alert-time{font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;flex-shrink:0}
  .sev-badge{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;padding:2px 8px;border-radius:100px;margin-top:6px}
  .sev-badge.critical{color:var(--red);background:var(--red)22}
  .sev-badge.high{color:var(--orange);background:var(--orange)22}
  .sev-badge.medium{color:var(--yellow);background:var(--yellow)22}

  /* PHILOSOPHY */
  .philosophy{padding:80px 40px;text-align:center;max-width:700px;margin:0 auto}
  .philosophy h2{font-size:clamp(28px,5vw,48px);font-weight:700;margin-bottom:20px;letter-spacing:-1px}
  .philosophy p{font-size:16px;color:var(--muted);line-height:1.7}
  blockquote{margin:32px 0;padding:24px 32px;background:var(--surface);border-left:3px solid var(--yellow);border-radius:0 12px 12px 0;text-align:left;font-size:15px;line-height:1.6;color:var(--text)}
  blockquote em{color:var(--yellow);font-style:normal;font-weight:600}

  /* CTA FOOTER */
  .cta-footer{padding:80px 40px;text-align:center;border-top:1px solid var(--border)}
  .cta-footer h2{font-size:36px;font-weight:700;margin-bottom:16px;letter-spacing:-1px}
  .cta-footer p{color:var(--muted);margin-bottom:36px;font-size:15px}
  footer{padding:32px 40px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:gap;gap:16px}
  footer .brand{font-weight:700;letter-spacing:3px;color:var(--yellow);font-size:15px}
  footer .copy{font-size:12px;color:var(--muted)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">CANARY</div>
  <div class="nav-links">
    <a href="#">How it works</a>
    <a href="#">Alerts</a>
    <a href="#">Deploy</a>
    <a href="/canary-viewer">View Design</a>
  </div>
  <a href="/canary-mock" class="nav-cta">OPEN MOCK →</a>
</nav>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-grid"></div>
  <div class="hero-badge">● LIVE THREAT DETECTION</div>
  <h1>CANARY<span>.</span></h1>
  <p class="tagline">know when they're inside</p>
  <p style="color:var(--muted);font-size:14px;max-width:480px;line-height:1.7;margin-bottom:32px;position:relative">
    Deploy invisible decoy assets across your network. The moment an attacker touches a canary — you know. Not after the breach. <em style="color:var(--yellow)">During it.</em>
  </p>
  <div class="hero-btns">
    <a href="/canary-mock" class="btn-primary">INTERACTIVE MOCK →</a>
    <a href="/canary-viewer" class="btn-secondary">View .pen file</a>
  </div>
  <div class="stats">
    <div class="stat"><span class="stat-value">24</span><div class="stat-label">CANARIES DEPLOYED</div></div>
    <div class="stat"><span class="stat-value" style="color:var(--red)">3</span><div class="stat-label">ALERTS TODAY</div></div>
    <div class="stat"><span class="stat-value" style="color:var(--green)">87%</span><div class="stat-label">COVERAGE SCORE</div></div>
    <div class="stat"><span class="stat-value">30s</span><div class="stat-label">TIME TO DEPLOY</div></div>
  </div>
</section>

<div class="pulse-section">
  <div class="pulse-label">CANARY PULSE — 24 DEPLOYED</div>
  <div class="pulse-dots">
    <div class="dot live"></div><div class="dot live"></div><div class="dot live"></div><div class="dot live"></div>
    <div class="dot live"></div><div class="dot live"></div><div class="dot live"></div><div class="dot live"></div>
    <div class="dot live"></div><div class="dot live"></div><div class="dot live"></div><div class="dot warn"></div>
    <div class="dot live"></div><div class="dot live"></div><div class="dot live"></div><div class="dot live"></div>
    <div class="dot alert"></div><div class="dot live"></div><div class="dot live"></div><div class="dot live"></div>
    <div class="dot live"></div><div class="dot warn"></div><div class="dot live"></div><div class="dot live"></div>
  </div>
</div>

<section class="section">
  <div class="section-label">HOW IT WORKS</div>
  <div class="steps">
    <div class="step">
      <div class="step-num">01 / PLANT</div>
      <h3>Deploy Decoy Assets</h3>
      <p>Place fake AWS keys, SQL dumps, SSH keys, and documents across your infrastructure — wherever an attacker would look.</p>
    </div>
    <div class="step">
      <div class="step-num">02 / WAIT</div>
      <h3>Attacker Takes the Bait</h3>
      <p>Real users ignore decoys. Attackers don't. The moment a canary is touched, accessed, or copied — the trap is sprung.</p>
    </div>
    <div class="step">
      <div class="step-num">03 / DETECT</div>
      <h3>Zero-False-Positive Alert</h3>
      <p>No ML tuning. No alert fatigue. If a canary fires, something is wrong. Immediate fingerprint capture with geo and user-agent.</p>
    </div>
    <div class="step">
      <div class="step-num">04 / RESPOND</div>
      <h3>Contain & Attribute</h3>
      <p>One-tap incident actions: rotate credentials, block IPs, create PagerDuty tickets. IOCs mapped to MITRE ATT&CK.</p>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="screens-inner">
    <div class="section-label" style="text-align:left;margin-bottom:20px">5 SCREENS DESIGNED</div>
    <div class="screen-row">
      <div class="screen-card"><div class="screen-icon">⌂</div><h4>Nest Overview</h4><p>Live canary count, today's alerts, coverage score, and alert feed</p></div>
      <div class="screen-card"><div class="screen-icon">◈</div><h4>Alert Detail</h4><p>Attacker fingerprint, timeline, and one-tap response actions</p></div>
      <div class="screen-card"><div class="screen-icon">◎</div><h4>Canary Map</h4><p>Network topology showing live, triggered, and warning canaries</p></div>
      <div class="screen-card"><div class="screen-icon">◉</div><h4>Threat Intel</h4><p>Actor profile, MITRE ATT&CK coverage, IOCs, 7-day activity</p></div>
      <div class="screen-card"><div class="screen-icon">+</div><h4>Deploy Canary</h4><p>Token type selector, zone picker, lure quality, and alert channels</p></div>
    </div>
  </div>
</section>

<section class="demo-section">
  <div class="demo-label">RECENT ALERTS</div>
  <div class="alert-item">
    <div class="alert-icon-wrap">☁</div>
    <div class="alert-body">
      <div class="alert-name">AWS Credentials Token</div>
      <div class="alert-meta">Cloud / IAM · 185.220.101.47 · Russia</div>
      <span class="sev-badge critical">CRITICAL</span>
    </div>
    <div class="alert-time">4m ago</div>
  </div>
  <div class="alert-item high">
    <div class="alert-icon-wrap" style="background:var(--orange)22">🗄</div>
    <div class="alert-body">
      <div class="alert-name">SQL Dump Canary File</div>
      <div class="alert-meta">DB Server / prod-db-1 · Internal network</div>
      <span class="sev-badge high">HIGH</span>
    </div>
    <div class="alert-time">31m ago</div>
  </div>
  <div class="alert-item medium">
    <div class="alert-icon-wrap" style="background:var(--yellow)22">📄</div>
    <div class="alert-body">
      <div class="alert-name">HR Directory Document</div>
      <div class="alert-meta">File Share / \\\\corp · Lateral movement</div>
      <span class="sev-badge medium">MEDIUM</span>
    </div>
    <div class="alert-time">2h ago</div>
  </div>
</section>

<section class="philosophy" style="border-top:1px solid var(--border)">
  <h2>The <span style="color:var(--yellow)">Assume Breach</span> philosophy</h2>
  <p>Traditional security asks: <em style="color:var(--text)">"Did they get in?"</em> CANARY asks: <em style="color:var(--yellow)">"What are they touching?"</em></p>
  <blockquote>
    It's not <em>if</em> an attacker will breach your perimeter — it's <em>when</em>. Deception technology forces them to reveal themselves the moment they start moving laterally. Every canary trip is a perfect signal: no noise, no tuning, no false positives.
  </blockquote>
  <p>Inspired by real deception tech platforms like Canarytokens, Thinkst Canary, and <em style="color:var(--text)">Tracebit</em> — this design explores what a modern, mobile-first deception platform could feel like.</p>
</section>

<div class="cta-footer">
  <h2>Deploy your first canary.</h2>
  <p>30 seconds. Zero false positives. Know the moment they're inside.</p>
  <a href="/canary-mock" class="btn-primary">OPEN INTERACTIVE MOCK →</a>
</div>

<footer>
  <div class="brand">CANARY</div>
  <div class="copy">Designed by RAM · Design Heartbeat · ram.zenbin.org</div>
</footer>

</body>
</html>`;
}

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
function buildViewer() {
  const penJson = fs.readFileSync(path.join(__dirname, 'canary.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CANARY — Pencil Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#050810;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:Inter,sans-serif;color:#E2E8F3}
  header{padding:20px 40px;width:100%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E2D45}
  .logo{font-weight:700;letter-spacing:4px;color:#F5C842;font-size:16px}
  .sub{font-size:12px;color:#6B7E9A}
  .back{color:#6B7E9A;text-decoration:none;font-size:13px}
  .back:hover{color:#F5C842}
  #pen-canvas{width:100%;overflow-x:auto;padding:40px}
  .placeholder{text-align:center;padding:80px 40px;color:#6B7E9A}
  .placeholder h2{font-size:24px;color:#F5C842;margin-bottom:12px}
</style>
<script>
// Pencil.dev v2.8 viewer
function renderPen(pen) {
  const canvas = document.getElementById('pen-canvas');
  const scale = 0.9;
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width', pen.canvas.w * scale);
  svg.setAttribute('height', pen.canvas.h * scale);
  svg.style.background = pen.canvas.bg || '#050810';
  svg.style.borderRadius = '16px';
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  function renderNode(node, parent, ox, oy) {
    const x = (node.x || 0) + ox;
    const y = (node.y || 0) + oy;
    if (node.type === 'FRAME') {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
      bg.setAttribute('x', x * scale); bg.setAttribute('y', y * scale);
      bg.setAttribute('width', (node.w||375)*scale); bg.setAttribute('height', (node.h||812)*scale);
      bg.setAttribute('fill', node.fill || '#070B14');
      bg.setAttribute('rx', 20*scale);
      if (node.clip) {
        const clipId = 'clip-' + node.id;
        const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
        clipPath.setAttribute('id', clipId);
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
        clipRect.setAttribute('x', x * scale); clipRect.setAttribute('y', y * scale);
        clipRect.setAttribute('width', (node.w||375)*scale); clipRect.setAttribute('height', (node.h||812)*scale);
        clipRect.setAttribute('rx', 20*scale);
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);
        svg.insertBefore(defs, svg.firstChild);
        g.setAttribute('clip-path', 'url(#' + clipId + ')');
      }
      parent.appendChild(bg);
      parent.appendChild(g);
      if (node.name) {
        const label = document.createElementNS('http://www.w3.org/2000/svg','text');
        label.setAttribute('x', x * scale);
        label.setAttribute('y', (y - 10) * scale);
        label.setAttribute('fill', '#6B7E9A');
        label.setAttribute('font-size', 11 * scale);
        label.setAttribute('font-family', 'Inter,sans-serif');
        label.textContent = node.name;
        parent.appendChild(label);
      }
      (node.children || []).forEach(c => renderNode(c, g, x, y));
    } else if (node.type === 'RECTANGLE') {
      if (node.fill === 'transparent') {
        if (!node.stroke) return;
        const el = document.createElementNS('http://www.w3.org/2000/svg','rect');
        el.setAttribute('x', x*scale); el.setAttribute('y', y*scale);
        el.setAttribute('width', (node.w||0)*scale); el.setAttribute('height', (node.h||0)*scale);
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', node.stroke); el.setAttribute('stroke-width', (node.strokeWidth||1)*scale);
        el.setAttribute('rx', (node.cornerRadius||0)*scale);
        el.setAttribute('opacity', node.opacity||1);
        parent.appendChild(el);
      } else {
        const el = document.createElementNS('http://www.w3.org/2000/svg','rect');
        el.setAttribute('x', x*scale); el.setAttribute('y', y*scale);
        el.setAttribute('width', (node.w||0)*scale); el.setAttribute('height', (node.h||0)*scale);
        el.setAttribute('fill', node.fill||'#000');
        el.setAttribute('rx', (node.cornerRadius||0)*scale);
        el.setAttribute('opacity', node.opacity||1);
        if (node.stroke) { el.setAttribute('stroke', node.stroke); el.setAttribute('stroke-width', (node.strokeWidth||1)*scale); }
        parent.appendChild(el);
      }
    } else if (node.type === 'TEXT') {
      const el = document.createElementNS('http://www.w3.org/2000/svg','text');
      el.setAttribute('x', (x + (node.textAlign==='center'?(node.w||80)/2:node.textAlign==='right'?(node.w||80):0))*scale);
      el.setAttribute('y', (y + (node.fontSize||12)*0.85)*scale);
      el.setAttribute('fill', node.color||'#fff');
      el.setAttribute('font-size', (node.fontSize||12)*scale);
      el.setAttribute('font-weight', node.fontWeight||400);
      el.setAttribute('font-family', node.fontFamily==='monospace' ? 'JetBrains Mono,monospace' : 'Inter,sans-serif');
      el.setAttribute('text-anchor', node.textAlign==='center'?'middle':node.textAlign==='right'?'end':'start');
      el.setAttribute('opacity', node.opacity||1);
      if (node.letterSpacing) el.setAttribute('letter-spacing', node.letterSpacing*scale);
      el.textContent = node.content||'';
      parent.appendChild(el);
    } else if (node.type === 'ELLIPSE') {
      const el = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      const cx = x + (node.w||0)/2; const cy = y + (node.h||0)/2;
      el.setAttribute('cx', cx*scale); el.setAttribute('cy', cy*scale);
      el.setAttribute('rx', (node.w||0)/2*scale); el.setAttribute('ry', (node.h||0)/2*scale);
      el.setAttribute('fill', node.fill||'#fff');
      el.setAttribute('opacity', node.opacity||1);
      if (node.stroke) { el.setAttribute('stroke', node.stroke); el.setAttribute('stroke-width', (node.strokeWidth||1)*scale); }
      parent.appendChild(el);
    } else if (node.type === 'LINE') {
      const el = document.createElementNS('http://www.w3.org/2000/svg','line');
      el.setAttribute('x1', x*scale); el.setAttribute('y1', y*scale);
      el.setAttribute('x2', (node.x2||x)*scale+ox*scale); el.setAttribute('y2', (node.y2||y)*scale+oy*scale);
      el.setAttribute('stroke', node.stroke||'#fff');
      el.setAttribute('stroke-width', (node.strokeWidth||1)*scale);
      el.setAttribute('opacity', node.opacity||1);
      parent.appendChild(el);
    }
  }

  pen.frames.forEach(f => renderNode(f, svg, 0, 0));
  canvas.innerHTML = '';
  canvas.appendChild(svg);
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.EMBEDDED_PEN) {
    try { renderPen(JSON.parse(window.EMBEDDED_PEN)); }
    catch(e) { document.getElementById('pen-canvas').innerHTML = '<div class="placeholder"><h2>Render error</h2><p>' + e.message + '</p></div>'; }
  }
});
</script>
</head>
<body>
<header>
  <div>
    <div class="logo">CANARY</div>
    <div class="sub">know when they're inside · Pencil v2.8</div>
  </div>
  <a href="/canary" class="back">← Back to hero</a>
</header>
<div id="pen-canvas">
  <div class="placeholder"><h2>Loading design…</h2></div>
</div>
</body>
</html>`;

  return viewerHtml.replace('<script>', injection + '\n<script>');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing CANARY...\n');

  const hero = buildHero();
  console.log('→ Publishing hero page...');
  const r1 = await zenbin(SLUG, hero, `${APP_NAME} — ${TAGLINE}`);
  console.log('  Hero:', r1.url || r1.raw?.slice(0,80));

  const viewer = buildViewer();
  console.log('→ Publishing viewer...');
  const r2 = await zenbin(`${SLUG}-viewer`, viewer, `${APP_NAME} — Pencil Viewer`);
  console.log('  Viewer:', r2.url || r2.raw?.slice(0,80));

  console.log('\n✓ Done.');
}

main().catch(console.error);
