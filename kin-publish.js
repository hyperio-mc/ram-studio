#!/usr/bin/env node
// KIN — Hero page + viewer publisher

const fs = require('fs');
const https = require('https');

const SLUG = 'kin';
const APP_NAME = 'KIN';
const TAGLINE = 'Relationship Memory, Amplified.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>KIN — Relationship Memory, Amplified.</title>
  <meta name="description" content="KIN is an AI-powered personal relationship intelligence app. Memory-first design that helps you stay meaningfully connected to the people who matter most.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F5F4F1;
      --surface: #FFFFFF;
      --surface-alt: #EEECEA;
      --text: #1A1817;
      --muted: rgba(26,24,23,0.50);
      --accent: #3A5CFF;
      --accent2: #FF6B35;
      --accent-soft: rgba(58,92,255,0.08);
      --green: #2DB87C;
      --green-soft: rgba(45,184,124,0.10);
      --border: rgba(26,24,23,0.10);
      --border-strong: rgba(26,24,23,0.18);
      --shadow: 0 2px 24px rgba(26,24,23,0.08), 0 1px 4px rgba(26,24,23,0.04);
      --shadow-lg: 0 8px 48px rgba(26,24,23,0.12), 0 2px 12px rgba(26,24,23,0.06);
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

    /* ── NAV ── */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(245,244,241,0.90); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 56px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; }
    .nav-logo { width: 30px; height: 30px; background: var(--text); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--surface); font-size: 13px; font-weight: 800; }
    .nav-links { display: flex; align-items: center; gap: 28px; }
    .nav-links a { font-size: 13px; color: var(--muted); font-weight: 500; transition: color .15s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--text); color: var(--surface); border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity .15s; }
    .nav-cta:hover { opacity: 0.85; }

    /* ── SECTIONS ── */
    section { position: relative; }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 40px; }

    /* ── HERO ── */
    .hero { padding: 140px 40px 80px; max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--accent-soft); border: 1px solid rgba(58,92,255,0.2); border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: var(--accent); letter-spacing: 0.05em; margin-bottom: 24px; }
    .hero-badge span { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
    h1 { font-size: 52px; font-weight: 800; line-height: 1.10; letter-spacing: -0.03em; margin-bottom: 20px; }
    h1 em { font-style: normal; color: var(--accent); }
    .hero-sub { font-size: 18px; color: var(--muted); line-height: 1.6; margin-bottom: 36px; font-weight: 400; }
    .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .btn-primary { background: var(--text); color: var(--surface); border: none; border-radius: 10px; padding: 14px 28px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity .15s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-secondary { background: transparent; color: var(--text); border: 1.5px solid var(--border-strong); border-radius: 10px; padding: 13px 24px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; text-decoration: none; }
    .btn-secondary:hover { border-color: var(--text); }
    .hero-trust { margin-top: 28px; display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
    .trust-item { font-size: 13px; color: var(--muted); font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .trust-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

    /* ── PHONE MOCKUP ── */
    .phone-mockup { position: relative; display: flex; justify-content: center; }
    .phone-frame { width: 300px; height: 620px; background: var(--surface); border-radius: 40px; box-shadow: var(--shadow-lg), 0 0 0 1px var(--border); overflow: hidden; position: relative; padding: 16px; }
    .phone-inner { width: 100%; height: 100%; background: var(--bg); border-radius: 28px; overflow: hidden; padding: 20px 16px 0; display: flex; flex-direction: column; gap: 10px; }
    .phone-greeting { font-size: 12px; color: var(--muted); font-weight: 400; }
    .phone-name { font-size: 22px; font-weight: 700; line-height: 1.2; color: var(--text); margin-bottom: 8px; }
    .phone-search { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; font-size: 11px; color: var(--muted); }
    .phone-section-label { font-size: 9px; font-weight: 600; letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase; margin-top: 6px; }
    .nudge-cards { display: flex; gap: 8px; overflow: hidden; }
    .nudge-card { min-width: 110px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px; flex-shrink: 0; }
    .nudge-name { font-size: 10px; font-weight: 600; color: var(--text); }
    .nudge-note { font-size: 9px; color: var(--muted); margin-top: 2px; }
    .nudge-link { font-size: 9px; color: var(--accent); margin-top: 6px; font-weight: 500; }
    .metrics-row { display: flex; gap: 6px; }
    .metric-card { flex: 1; background: var(--surface); border-radius: 8px; padding: 8px; text-align: left; }
    .metric-val { font-size: 18px; font-weight: 700; }
    .metric-label { font-size: 8px; color: var(--muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
    .activity-list { display: flex; flex-direction: column; gap: 6px; }
    .activity-item { background: var(--surface); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; gap: 8px; }
    .av-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0; }
    .act-name { font-size: 10px; font-weight: 600; color: var(--text); }
    .act-action { font-size: 9px; color: var(--muted); }

    /* ── FEATURES ── */
    .features { padding: 80px 0; }
    .features-header { text-align: center; margin-bottom: 56px; }
    .features-header h2 { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 14px; }
    .features-header p { font-size: 16px; color: var(--muted); max-width: 520px; margin: 0 auto; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px; transition: box-shadow .2s; }
    .feature-card:hover { box-shadow: var(--shadow-lg); }
    .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 18px; }
    .feature-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; letter-spacing: -0.01em; }
    .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }

    /* ── MEMORY PALACE SECTION ── */
    .memory-section { padding: 80px 0; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .memory-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .memory-text h2 { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; }
    .memory-text p { font-size: 16px; color: var(--muted); line-height: 1.7; margin-bottom: 24px; }
    .memory-point { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .memory-point-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 8px; flex-shrink: 0; }
    .memory-point p { font-size: 14px; color: var(--muted); margin: 0; }
    .memory-vis { background: var(--bg); border-radius: 20px; padding: 32px; border: 1px solid var(--border); position: relative; height: 320px; }
    .node { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; font-weight: 700; }
    .node-label { font-size: 13px; }
    .node-count { font-size: 10px; opacity: 0.7; }

    /* ── SOCIAL PROOF ── */
    .social-proof { padding: 80px 0; }
    .proof-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 48px; }
    .proof-metric { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; text-align: center; }
    .proof-val { font-size: 32px; font-weight: 800; letter-spacing: -0.03em; color: var(--accent); }
    .proof-label { font-size: 13px; color: var(--muted); margin-top: 4px; font-weight: 500; }

    /* ── CTA ── */
    .cta-section { padding: 80px 40px; text-align: center; max-width: 600px; margin: 0 auto; }
    .cta-section h2 { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; }
    .cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 32px; }

    /* ── FOOTER ── */
    footer { border-top: 1px solid var(--border); padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; }
    .footer-brand { font-size: 14px; font-weight: 600; }
    .footer-meta { font-size: 12px; color: var(--muted); }

    /* ── VIEWER LINK STRIP ── */
    .viewer-strip { background: var(--accent); color: white; padding: 10px 20px; text-align: center; font-size: 13px; font-weight: 600; }
    .viewer-strip a { color: white; text-decoration: underline; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; gap: 40px; }
      h1 { font-size: 36px; }
      .features-grid { grid-template-columns: 1fr; }
      .memory-layout { grid-template-columns: 1fr; }
      .proof-grid { grid-template-columns: repeat(2, 1fr); }
      nav { padding: 0 20px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<!-- Viewer strip -->
<div class="viewer-strip">
  Interactive prototype → <a href="https://ram.zenbin.org/kin-viewer">View in Pencil Viewer</a> &nbsp;·&nbsp;
  <a href="https://ram.zenbin.org/kin-mock">Live Mock ☀◑</a>
</div>

<!-- Nav -->
<nav>
  <div class="nav-brand">
    <div class="nav-logo">K</div>
    KIN
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#memory">Memory Palace</a>
    <a href="#prototype">Prototype</a>
  </div>
  <button class="nav-cta">Get early access</button>
</nav>

<!-- Hero -->
<div class="hero">
  <div class="hero-text">
    <div class="hero-badge"><span></span> MEMORY-FIRST PERSONAL CRM</div>
    <h1>Your relationships deserve <em>real memory</em></h1>
    <p class="hero-sub">KIN remembers every conversation, topic, and moment across all your connections — so you can show up fully for the people who matter.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/kin-viewer" class="btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/kin-mock" class="btn-secondary">☀◑ Live Mock</a>
    </div>
    <div class="hero-trust">
      <div class="trust-item"><div class="trust-dot"></div>AI memory across all channels</div>
      <div class="trust-item"><div class="trust-dot"></div>59 relationships tracked</div>
      <div class="trust-item"><div class="trust-dot"></div>Memory Palace visualization</div>
    </div>
  </div>
  <div class="phone-mockup">
    <div class="phone-frame">
      <div class="phone-inner">
        <div class="phone-greeting">Good morning</div>
        <div class="phone-name">Marcus</div>
        <div class="phone-search">○ Search people, topics…</div>
        <div class="phone-section-label">Reach out today</div>
        <div class="nudge-cards">
          <div class="nudge-card">
            <div style="width:28px;height:28px;border-radius:50%;background:#B5D5FF;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-bottom:6px;">PS</div>
            <div class="nudge-name">Priya S.</div>
            <div class="nudge-note">Last chat 3 wks ago</div>
            <div class="nudge-link">Draft message →</div>
          </div>
          <div class="nudge-card">
            <div style="width:28px;height:28px;border-radius:50%;background:#FFD9C4;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-bottom:6px;">TO</div>
            <div class="nudge-name">Tom Okafor</div>
            <div class="nudge-note">Birthday in 2 days</div>
            <div class="nudge-link">Draft message →</div>
          </div>
        </div>
        <div class="phone-section-label">Your Network</div>
        <div class="metrics-row">
          <div class="metric-card"><div class="metric-val" style="color:#2DB87C">47</div><div class="metric-label">Active</div></div>
          <div class="metric-card"><div class="metric-val" style="color:#FF6B35">12</div><div class="metric-label">Fading</div></div>
          <div class="metric-card"><div class="metric-val" style="color:#3A5CFF">94%</div><div class="metric-label">Memory</div></div>
        </div>
        <div class="phone-section-label">Recent Moments</div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="av-circle" style="background:#F5D5FF;">JR</div>
            <div><div class="act-name">Jamie Reyes</div><div class="act-action">shared a project update</div></div>
          </div>
          <div class="activity-item">
            <div class="av-circle" style="background:#D5FFE8;">SK</div>
            <div><div class="act-name">Sofia Kim</div><div class="act-action">started a new role at Figma</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Features -->
<section class="features" id="features">
  <div class="container">
    <div class="features-header">
      <h2>Everything you need to stay truly connected</h2>
      <p>From passive memory capture to AI-drafted messages, Kin handles the overhead so you can focus on the relationship.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(58,92,255,0.1);">◇</div>
        <h3>Memory Palace</h3>
        <p>AI organizes all your conversations into topic clusters — design, travel, career, family. See which themes dominate your relationships.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(45,184,124,0.1);">∿</div>
        <h3>Relationship Pulse</h3>
        <p>A live health score for every connection. Know who's thriving, who's drifting, and who needs attention — before it's too late.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(255,107,53,0.1);">✦</div>
        <h3>AI Compose</h3>
        <p>Kin drafts messages grounded in your shared history — not generic text. Every draft is context-aware, warm, and genuinely personal.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(107,131,255,0.1);">◎</div>
        <h3>Smart Nudges</h3>
        <p>Surface who to reach out to today, based on relationship recency, life events, and the natural rhythm of your connections.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(26,24,23,0.06);">◈</div>
        <h3>Omnichannel Memory</h3>
        <p>Captures context from WhatsApp, iMessage, email, LinkedIn, and in-person notes. One unified memory layer across all channels.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(255,180,53,0.1);">◑</div>
        <h3>Insights Dashboard</h3>
        <p>Monthly relationship analytics: interaction quality, network health over time, and AI observations on emerging patterns.</p>
      </div>
    </div>
  </div>
</section>

<!-- Memory Palace section -->
<section class="memory-section" id="memory">
  <div class="container">
    <div class="memory-layout">
      <div class="memory-text">
        <h2>Your Memory Palace</h2>
        <p>Inspired by memory-first AI design, Kin builds a living map of the topics, themes, and moments that define your relationships.</p>
        <div class="memory-point"><div class="memory-point-dot"></div><p>34 conversations about Design across 12 people — see the full thread</p></div>
        <div class="memory-point"><div class="memory-point-dot"></div><p>AI identifies emerging topics before you've consciously noticed them</p></div>
        <div class="memory-point"><div class="memory-point-dot"></div><p>Transparently view and edit any memory — you're always in control</p></div>
        <div class="memory-point"><div class="memory-point-dot"></div><p>Memory persists across devices and models — port it anywhere</p></div>
      </div>
      <div class="memory-vis">
        <!-- Design node (center) -->
        <div class="node" style="left:50%;top:42%;transform:translate(-50%,-50%);width:100px;height:100px;background:rgba(58,92,255,0.08);border:1.5px solid rgba(58,92,255,0.2);color:#3A5CFF;">
          <div class="node-label">Design</div>
          <div class="node-count">34 convos</div>
        </div>
        <!-- Travel -->
        <div class="node" style="left:14%;top:28%;width:68px;height:68px;background:rgba(255,107,53,0.08);border:1.5px solid rgba(255,107,53,0.2);color:#FF6B35;">
          <div class="node-label" style="font-size:11px">Travel</div>
          <div class="node-count">18</div>
        </div>
        <!-- Career -->
        <div class="node" style="right:8%;top:30%;width:74px;height:74px;background:rgba(45,184,124,0.08);border:1.5px solid rgba(45,184,124,0.2);color:#2DB87C;">
          <div class="node-label" style="font-size:12px">Career</div>
          <div class="node-count">22</div>
        </div>
        <!-- AI -->
        <div class="node" style="left:20%;bottom:22%;width:58px;height:58px;background:rgba(107,131,255,0.1);border:1.5px solid rgba(107,131,255,0.2);color:#6B83FF;">
          <div class="node-label" style="font-size:11px">AI</div>
          <div class="node-count">16</div>
        </div>
        <!-- Health -->
        <div class="node" style="right:14%;bottom:22%;width:52px;height:52px;background:rgba(255,180,53,0.1);border:1.5px solid rgba(255,180,53,0.25);color:#CC8800;">
          <div class="node-label" style="font-size:10px">Health</div>
          <div class="node-count">11</div>
        </div>
        <!-- Books -->
        <div class="node" style="right:5%;bottom:5%;width:44px;height:44px;background:rgba(180,107,255,0.1);border:1.5px solid rgba(180,107,255,0.2);color:#8B5CF6;">
          <div class="node-label" style="font-size:9px">Books</div>
        </div>
        <!-- Food -->
        <div class="node" style="left:5%;bottom:8%;width:42px;height:42px;background:rgba(26,24,23,0.05);border:1px solid rgba(26,24,23,0.1);color:rgba(26,24,23,0.4);">
          <div class="node-label" style="font-size:9px">Food</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Social Proof -->
<section class="social-proof" id="prototype">
  <div class="container">
    <div class="proof-grid">
      <div class="proof-metric"><div class="proof-val">59</div><div class="proof-label">Relationships tracked</div></div>
      <div class="proof-metric"><div class="proof-val">84</div><div class="proof-label">Connection Score</div></div>
      <div class="proof-metric"><div class="proof-val">24</div><div class="proof-label">Memory topics built</div></div>
      <div class="proof-metric"><div class="proof-val">94%</div><div class="proof-label">Memory accuracy</div></div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:14px;color:var(--muted);margin-bottom:24px;font-weight:500;">DESIGN PROTOTYPE — 6 SCREENS</div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="https://ram.zenbin.org/kin-viewer" class="btn-primary">Open in Pencil Viewer →</a>
        <a href="https://ram.zenbin.org/kin-mock" class="btn-secondary">☀◑ Interactive Mock</a>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section>
  <div class="cta-section">
    <h2>Memory-first relationship intelligence.</h2>
    <p>Built for people who value deep connection over surface-level networking. Kin remembers so you don't have to.</p>
    <a href="https://ram.zenbin.org/kin-viewer" class="btn-primary" style="display:inline-flex;">Get started — it's free →</a>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="footer-brand">KIN</div>
  <div class="footer-meta">RAM Design Heartbeat · April 2025 · ram.zenbin.org/kin</div>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
const penJson = fs.readFileSync('kin.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function publish(slug, html, title) {
  const body = JSON.stringify({ html, title });
  const res = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => resolve({ status: r.statusCode, body: d })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
  console.log(`  ${slug}: ${res.status} ${res.body.slice(0, 80)}`);
  return res;
}

(async () => {
  console.log('Publishing KIN...');
  await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Viewer`);
  console.log('\nDone:');
  console.log(`  Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
})();
