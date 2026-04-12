#!/usr/bin/env node
// herald-publish.js — hero page + viewer for HERALD
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'herald';
const APP_NAME  = 'HERALD';
const TAGLINE   = 'Your team, without the manual overhead.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

// ── Viewer ─────────────────────────────────────────────────────────────────────
const penJson   = fs.readFileSync(path.join(__dirname, 'herald.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Hero page ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HERALD — ${TAGLINE}</title>
  <meta name="description" content="HERALD is an AI-native async team pulse platform. Agents collect standups from Slack, GitHub, and Linear — so your team ships more and syncs less.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #F4F3EF;
      --s1:      #FFFFFF;
      --s2:      #EEEDF0;
      --text:    #141318;
      --muted:   rgba(20,19,24,0.50);
      --indigo:  #5B3CF5;
      --ind-l:   #EEE9FD;
      --amber:   #D9860A;
      --amb-l:   #FDF3E3;
      --green:   #1A7D4A;
      --grn-l:   #E5F5EC;
      --red:     #CC3726;
      --red-l:   #FCECEA;
      --border:  rgba(20,19,24,0.10);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden;
    }

    /* Isidor.ai pattern — inverted to light */
    .data-strip {
      font-family: 'Space Mono', monospace;
      font-size: 7px; color: var(--text); opacity: 0.07;
      letter-spacing: 2px; overflow: hidden;
      white-space: nowrap; pointer-events: none;
      padding: 3px 0;
    }

    /* Nav */
    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 56px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(244,243,239,0.92); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo {
      font-family: 'Space Mono', monospace;
      font-weight: 700; font-size: 15px; letter-spacing: 4px;
      color: var(--indigo);
    }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a { text-decoration: none; font-size: 13px; color: var(--muted); transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--indigo); color: #fff;
      border: none; border-radius: 8px; padding: 9px 22px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: 'Inter', sans-serif;
    }

    /* Hero */
    .hero {
      max-width: 1100px; margin: 0 auto;
      padding: 80px 56px 60px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--ind-l); border: 1px solid rgba(91,60,245,0.25);
      border-radius: 20px; padding: 6px 16px;
      font-size: 11px; font-weight: 700; color: var(--indigo);
      letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px;
    }
    .hero-eyebrow::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--indigo); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.4); } }
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(36px, 4.5vw, 58px); font-weight: 800;
      line-height: 1.08; letter-spacing: -1.5px; margin-bottom: 20px;
      color: var(--text);
    }
    h1 .accent { color: var(--indigo); }
    .hero-sub {
      font-size: 17px; color: var(--muted); line-height: 1.65; margin-bottom: 36px;
    }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn-primary {
      background: var(--indigo); color: #fff;
      padding: 14px 30px; border-radius: 10px;
      font-weight: 700; font-size: 14px; text-decoration: none;
      transition: transform .15s, box-shadow .15s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(91,60,245,0.30); }
    .btn-ghost {
      background: transparent; color: var(--text); border: 1.5px solid var(--border);
      padding: 13px 28px; border-radius: 10px;
      font-weight: 600; font-size: 14px; text-decoration: none;
    }
    .hero-phone {
      display: flex; justify-content: center; align-items: center;
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 32px; padding: 16px;
      box-shadow: 0 24px 80px rgba(20,19,24,0.10);
    }
    .hero-phone iframe { border: none; border-radius: 20px; display: block; width: 320px; height: 693px; }

    /* Proof bar */
    .proof { background: var(--s1); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .proof-inner {
      max-width: 1100px; margin: 0 auto; padding: 20px 56px;
      display: flex; align-items: center; gap: 48px; flex-wrap: wrap;
    }
    .proof-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
    .proof-stat { font-size: 22px; font-weight: 800; color: var(--text); }
    .proof-stat span { font-size: 12px; font-weight: 500; color: var(--muted); margin-left: 4px; }

    /* Features section */
    .features { max-width: 1100px; margin: 80px auto; padding: 0 56px; }
    .section-eyebrow {
      font-family: 'Space Mono', monospace; font-size: 10px;
      color: var(--indigo); letter-spacing: 3px; text-transform: uppercase;
      margin-bottom: 16px;
    }
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(28px, 3vw, 40px); font-weight: 800;
      line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 48px;
    }
    .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feat-card {
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px;
      transition: transform .2s, box-shadow .2s;
    }
    .feat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(20,19,24,0.07); }
    .feat-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--ind-l); display: flex; align-items: center; justify-content: center;
      font-size: 20px; margin-bottom: 20px;
    }
    .feat-name { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
    .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

    /* Agent showcase */
    .agents { max-width: 1100px; margin: 0 auto 80px; padding: 0 56px; }
    .agent-list { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
    .agent-row {
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px 28px;
      display: flex; align-items: center; gap: 20px;
    }
    .agent-icon { font-size: 22px; width: 48px; flex-shrink: 0; text-align: center; }
    .agent-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .agent-desc { font-size: 13px; color: var(--muted); }
    .agent-status {
      margin-left: auto; flex-shrink: 0;
      padding: 5px 14px; border-radius: 20px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    }
    .status-active { background: var(--grn-l); color: var(--green); }
    .status-idle   { background: var(--s2);    color: var(--muted); }

    /* Screens showcase */
    .screens { max-width: 1100px; margin: 0 auto 80px; padding: 0 56px; }
    .screen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
    .scard {
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px;
    }
    .scard-hex { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--indigo); margin-bottom: 10px; letter-spacing: 1px; }
    .scard-name { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .scard-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

    /* Viewer embed */
    .viewer { max-width: 1100px; margin: 0 auto 80px; padding: 0 56px; text-align: center; }
    .viewer-phone {
      display: inline-block; background: var(--s1);
      border: 1px solid var(--border); border-radius: 36px; padding: 18px;
      box-shadow: 0 28px 80px rgba(20,19,24,0.10);
    }
    .viewer-phone iframe { border: none; border-radius: 24px; display: block; width: 390px; height: 844px; }

    /* Footer */
    footer {
      border-top: 1px solid var(--border); padding: 24px 56px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
      font-size: 12px; color: var(--muted);
    }
    footer strong { font-family: 'Space Mono', monospace; font-weight: 700; color: var(--indigo); letter-spacing: 2px; }

    @media (max-width: 900px) {
      nav { padding: 0 24px; }
      .hero { grid-template-columns: 1fr; padding: 48px 24px 40px; gap: 40px; }
      .hero-phone iframe { width: 280px; height: 607px; }
      .features, .agents, .screens, .viewer, .proof-inner, footer { padding-left: 24px; padding-right: 24px; }
      .feat-grid, .screen-grid { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>

<div class="data-strip">01001000 01100101 01110010 01100001 01101100 01100100 00100000 01000001 01001001 00100000 01010100 01100101 01100001 01101101 00100000 01010000 01110101 01101100 01110011 01100101</div>

<nav>
  <span class="nav-logo">HERALD</span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#agents">Agents</a>
    <a href="#preview">Preview</a>
    <button class="nav-cta">Request access</button>
  </div>
</nav>

<section>
  <div class="hero">
    <div>
      <div class="hero-eyebrow">AI-native team intelligence</div>
      <h1>Your team's pulse, <span class="accent">without the meetings.</span></h1>
      <p class="hero-sub">Herald agents collect standups from Slack, GitHub, and Linear — surface blockers, celebrate wins, and deliver a crisp daily digest. No forms. No friction.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View prototype →</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive mock ☀◑</a>
      </div>
    </div>
    <div class="hero-phone">
      <iframe src="https://ram.zenbin.org/${SLUG}-viewer" title="HERALD Prototype"></iframe>
    </div>
  </div>
</section>

<div class="data-strip">0x5B3C · 0xF4F3 · 0x1413 · 0xD986 · 0x1A7D · 0xCC37 · 0xBEEF · 0xDEAD · 0xCAFE · 0x0001 · 0x0002 · 0x0004 · 0x0008</div>

<div class="proof">
  <div class="proof-inner">
    <div class="proof-label">Why teams choose Herald</div>
    <div>
      <div class="proof-stat">3.2h<span>saved / week per team</span></div>
    </div>
    <div>
      <div class="proof-stat">94%<span>update coverage</span></div>
    </div>
    <div>
      <div class="proof-stat">↓ 38%<span>fewer status meetings</span></div>
    </div>
    <div>
      <div class="proof-stat">8.4 / 10<span>avg team pulse score</span></div>
    </div>
  </div>
</div>

<section class="features" id="features">
  <div class="data-strip">01000110 01100101 01100001 01110100 01110101 01110010 01100101 01110011 00100000 01001000 01100101 01110010 01100001 01101100 01100100</div>
  <div class="section-eyebrow">0x01 · FEATURES</div>
  <h2 class="section-title">Let agents do the gathering.<br>You do the leading.</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <div class="feat-name">Agent standups</div>
      <div class="feat-desc">AI agents collect updates from Slack threads, PR descriptions, and Linear comments — no form to fill in.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <div class="feat-name">Blocker radar</div>
      <div class="feat-desc">Semantic detection surfaces blockers before they compound. Get notified instantly when someone is stuck.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <div class="feat-name">Daily digest</div>
      <div class="feat-desc">A crisp, AI-written daily pulse with wins, risks, and action items. Lands in Slack at 9am your timezone.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◇</div>
      <div class="feat-name">Mood tracking</div>
      <div class="feat-desc">Longitudinal team sentiment scored from communication patterns — not surveys. Privacy-first.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◻</div>
      <div class="feat-name">Sprint intelligence</div>
      <div class="feat-desc">Velocity trends, blocker frequency, and contributor spotlights help you improve sprint by sprint.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⊙</div>
      <div class="feat-name">Cross-team sync</div>
      <div class="feat-desc">Roll up departmental pulses into an executive view. Entire org health in one screen.</div>
    </div>
  </div>
</section>

<section class="agents" id="agents">
  <div class="data-strip">01000001 01100111 01100101 01101110 01110100 01110011 00100000 01010010 01110101 01101110 01101110 01101001 01101110 01100111</div>
  <div class="section-eyebrow">0x02 · AGENTS</div>
  <h2 class="section-title">Five agents. Zero manual work.</h2>
  <div class="agent-list">
    <div class="agent-row">
      <div class="agent-icon">◎</div>
      <div>
        <div class="agent-name">Herald Collector</div>
        <div class="agent-desc">Crawls Slack, GitHub PRs, and Linear issues at 9am — extracts standup signals automatically.</div>
      </div>
      <div class="agent-status status-active">● ACTIVE</div>
    </div>
    <div class="agent-row">
      <div class="agent-icon">◉</div>
      <div>
        <div class="agent-name">Blocker Detector</div>
        <div class="agent-desc">Continuously monitors for phrases and patterns indicating blockers. Pings the team lead in real time.</div>
      </div>
      <div class="agent-status status-active">● ACTIVE</div>
    </div>
    <div class="agent-row">
      <div class="agent-icon">◈</div>
      <div>
        <div class="agent-name">Digest Writer</div>
        <div class="agent-desc">Synthesises collected data into a clean narrative digest. Delivers to Slack at the configured schedule.</div>
      </div>
      <div class="agent-status status-active">● ACTIVE</div>
    </div>
    <div class="agent-row">
      <div class="agent-icon">◇</div>
      <div>
        <div class="agent-name">Mood Monitor</div>
        <div class="agent-desc">Builds team sentiment scores from communication tone over time. Weekly trend report included.</div>
      </div>
      <div class="agent-status status-idle">○ IDLE</div>
    </div>
    <div class="agent-row">
      <div class="agent-icon">◻</div>
      <div>
        <div class="agent-name">Sprint Analyst</div>
        <div class="agent-desc">Post-sprint velocity analysis, blocker breakdown, and contributor recognition. Runs every Friday.</div>
      </div>
      <div class="agent-status status-idle">○ IDLE</div>
    </div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="data-strip">01010011 01100011 01110010 01100101 01100101 01101110 01110011 00100000 01010000 01110010 01101111 01110100 01101111</div>
  <div class="section-eyebrow">0x03 · SCREENS</div>
  <h2 class="section-title">Five screens. Everything you need.</h2>
  <div class="screen-grid">
    <div class="scard">
      <div class="scard-hex">0x01 · TODAY</div>
      <div class="scard-name">Daily Pulse</div>
      <div class="scard-desc">Team score, blockers, wins, and agent-collected stats for the current day at a glance.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x02 · TEAM</div>
      <div class="scard-name">Member Grid</div>
      <div class="scard-desc">At-a-glance status for every teammate — mood, role, last update, and current state.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x03 · FEED</div>
      <div class="scard-name">Update Feed</div>
      <div class="scard-desc">Chronological stream of agent-collected standups tagged by source (Slack, GitHub, Linear).</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x04 · WORK</div>
      <div class="scard-name">Project Health</div>
      <div class="scard-desc">Active sprint projects with progress, blocker flags, PR counts, and owner tracking.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x05 · INSIGHTS</div>
      <div class="scard-name">AI Analysis</div>
      <div class="scard-desc">Velocity sparklines, trend metrics, AI narrative summary, and weekly MVP recognition.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0xFF · DESIGN</div>
      <div class="scard-name">Light Theme</div>
      <div class="scard-desc">Warm cream (#F4F3EF) · Vivid indigo accent (#5B3CF5) · Isidor.ai binary strip pattern on light.</div>
    </div>
  </div>
</section>

<div class="viewer" id="preview">
  <div class="data-strip" style="text-align:left; margin-bottom:32px;">01010000 01110010 01101111 01110100 01101111 01110100 01111001 01110000 01100101 00100000 01010110 01101001 01100101 01110111 01100101 01110010</div>
  <div class="section-eyebrow">0x10 · PROTOTYPE</div>
  <h2 style="font-family:'Space Grotesk',sans-serif; font-size:clamp(26px,3vw,40px); font-weight:800; margin-bottom:40px;">See HERALD in motion.</h2>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/${SLUG}-viewer" height="844" title="HERALD Prototype"></iframe>
  </div>
  <p style="margin-top:20px; font-size:11px; color:var(--muted); font-family:'Space Mono',monospace;">ram.zenbin.org/${SLUG}-viewer</p>
</div>

<footer>
  <strong>HERALD</strong>
  <span>Design by RAM · Pencil.dev v2.8 · LIGHT theme</span>
  <span>Inspired by Midday.ai, Folk.app (agent-first SaaS) + Isidor.ai binary typography — Apr 2026</span>
</footer>
</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Prototype` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  console.log(`\nLive: https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
