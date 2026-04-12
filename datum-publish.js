#!/usr/bin/env node
// datum-publish.js — hero page + viewer for DATUM
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'datum';
const APP_NAME  = 'DATUM';
const TAGLINE   = 'Every byte, in context.';
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
const penJson   = fs.readFileSync(path.join(__dirname, 'datum.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Hero page ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DATUM — Every byte, in context.</title>
  <meta name="description" content="DATUM is a developer observability platform for distributed tracing, log aggregation, and real-time metrics. Data IS the design.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #060910;
      --s1:      #0C1020;
      --s2:      #131828;
      --s3:      #1A2035;
      --text:    #DCE8FF;
      --muted:   rgba(220,232,255,0.42);
      --cyan:    #00CFFF;
      --green:   #00E676;
      --amber:   #FFB300;
      --red:     #FF3D57;
      --indigo:  #7C6FFF;
      --border:  rgba(220,232,255,0.07);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden;
    }

    /* Binary strip ambient — Isidor.ai pattern */
    .binary-strip {
      font-family: 'Space Mono', monospace;
      font-size: 7px; color: var(--cyan); opacity: 0.09;
      letter-spacing: 2px; overflow: hidden;
      white-space: nowrap; pointer-events: none;
      padding: 2px 0;
    }

    /* Nav */
    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 56px; height: 60px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(6,9,16,0.9); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo {
      font-family: 'Space Mono', monospace;
      font-weight: 700; font-size: 16px; letter-spacing: 4px;
      color: var(--cyan);
    }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { text-decoration: none; font-size: 12px; color: var(--muted); transition: color .2s; text-transform: uppercase; letter-spacing: 1px; }
    .nav-links a:hover { color: var(--text); }
    .nav-badge {
      display: flex; align-items: center; gap: 6px;
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      color: var(--green); background: rgba(0,230,118,0.1);
      border: 1px solid rgba(0,230,118,0.25); border-radius: 20px;
      padding: 5px 14px; font-family: 'Space Mono', monospace;
    }
    .nav-badge::before {
      content: '';
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--green);
      animation: blink 2s ease-in-out infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Hero */
    .hero {
      min-height: 90vh;
      display: grid; grid-template-columns: 1fr 1fr;
      align-items: center; gap: 60px;
      padding: 80px 80px 60px;
      position: relative; overflow: hidden;
    }
    .binary-strip.hero-strip {
      position: absolute; left: 0; right: 0;
    }
    .hero-strip-1 { top: 0; }
    .hero-strip-2 { top: 12px; opacity: 0.05 !important; }
    .glow-cyan {
      position: absolute; top: -100px; right: -60px;
      width: 480px; height: 480px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,207,255,0.07), transparent 65%);
      pointer-events: none;
    }
    .glow-indigo {
      position: absolute; bottom: -80px; left: 20%;
      width: 380px; height: 380px; border-radius: 50%;
      background: radial-gradient(circle, rgba(124,111,255,0.06), transparent 65%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(0,207,255,0.08); border: 1px solid rgba(0,207,255,0.22);
      padding: 5px 14px; border-radius: 20px;
      font-size: 10px; font-weight: 700; letter-spacing: 2px;
      color: var(--cyan); margin-bottom: 28px; text-transform: uppercase;
      font-family: 'Space Mono', monospace;
    }
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(42px, 5vw, 68px); font-weight: 700;
      line-height: 1.06; margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--cyan); }
    .hero-sub {
      font-size: 17px; line-height: 1.75; color: var(--muted);
      max-width: 460px; margin-bottom: 40px;
    }
    .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--cyan); color: var(--bg);
      padding: 13px 32px; border-radius: 32px;
      font-size: 14px; font-weight: 700;
      text-decoration: none; transition: all .2s;
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'Space Mono', monospace;
    }
    .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
    .btn-secondary {
      color: var(--muted); font-size: 14px;
      text-decoration: none; display: flex; align-items: center; gap: 6px;
      transition: color .2s;
    }
    .btn-secondary:hover { color: var(--text); }

    /* Phone mockup */
    .hero-phone {
      display: flex; justify-content: center; align-items: center;
      position: relative; z-index: 1;
    }
    .phone-shell {
      width: 280px; height: 580px; border-radius: 44px;
      background: var(--s1);
      border: 1.5px solid rgba(0,207,255,0.15);
      box-shadow: 0 0 0 1px rgba(0,207,255,0.06), 0 40px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,207,255,0.05);
      overflow: hidden; position: relative;
    }
    .phone-shell::before {
      content: '';
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 80px; height: 22px;
      background: var(--bg); border-radius: 11px; z-index: 10;
    }
    .phone-shell iframe { width: 390px; height: 844px; border: none; transform: scale(0.7179); transform-origin: 0 0; }

    /* Floating pills */
    .trace-pill {
      position: absolute; top: 30px; right: -32px;
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 12px; padding: 8px 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      font-family: 'Space Mono', monospace; font-size: 10px;
      white-space: nowrap;
    }
    .trace-pill .trace-id { color: var(--cyan); }
    .trace-pill .trace-dur { color: var(--red); }

    .uptime-pill {
      position: absolute; bottom: 50px; left: -40px;
      background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.2);
      border-radius: 12px; padding: 10px 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    }
    .uptime-num { font-size: 20px; font-weight: 800; color: var(--green); line-height: 1; font-family: 'Space Mono', monospace; }
    .uptime-lbl { font-size: 9px; color: var(--muted); margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }

    /* Metrics strip */
    .metrics-strip {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 16px; padding: 0 80px 80px;
    }
    .mcard {
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px 20px;
    }
    .mcard-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; font-family: 'Space Mono', monospace; }
    .mcard-value { font-size: 28px; font-weight: 700; font-family: 'Space Mono', monospace; line-height: 1; margin-bottom: 4px; }
    .mcard-sub { font-size: 10px; color: var(--muted); }
    .mcard-value.cyan { color: var(--cyan); }
    .mcard-value.green { color: var(--green); }
    .mcard-value.amber { color: var(--amber); }
    .mcard-value.red { color: var(--red); }

    /* Features */
    .features { padding: 80px; }
    .section-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--cyan); margin-bottom: 16px; font-family: 'Space Mono', monospace; }
    .section-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(26px, 3vw, 44px); font-weight: 700; max-width: 540px; margin-bottom: 48px; line-height: 1.2; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .fcard {
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 20px; padding: 28px; position: relative;
      overflow: hidden; transition: transform .2s;
    }
    .fcard:hover { transform: translateY(-2px); }
    .fcard::before {
      content: attr(data-hex);
      position: absolute; top: 0; right: 0; left: 0;
      font-family: 'Space Mono', monospace; font-size: 7px;
      color: var(--cyan); opacity: 0.08; padding: 6px 16px;
      white-space: nowrap; overflow: hidden;
    }
    .fcard-icon { font-size: 24px; margin-bottom: 14px; }
    .fcard-name { font-weight: 700; font-size: 16px; margin-bottom: 8px; }
    .fcard-desc { font-size: 12px; line-height: 1.65; color: var(--muted); margin-bottom: 16px; }
    .fcard-hex { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--cyan); opacity: 0.6; }

    /* Screens section */
    .screens { padding: 80px; background: var(--s1); }
    .s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
    .scard {
      background: var(--s2); border: 1px solid var(--border);
      border-radius: 14px; padding: 22px 18px; transition: transform .2s;
    }
    .scard:hover { transform: translateY(-2px); }
    .scard-hex { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--cyan); margin-bottom: 8px; opacity: 0.7; }
    .scard-name { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .scard-desc { font-size: 11px; color: var(--muted); line-height: 1.55; }

    /* Log block */
    .log-block {
      margin: 0 80px 80px;
      background: var(--s1); border: 1px solid var(--border);
      border-radius: 16px; padding: 0; overflow: hidden;
    }
    .log-header {
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px;
      font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted);
    }
    .log-dot { width: 10px; height: 10px; border-radius: 50%; }
    .log-dot.red { background: #ff5f57; }
    .log-dot.yellow { background: #febc2e; }
    .log-dot.green { background: #28c840; }
    .log-body { padding: 20px; }
    .log-row { display: flex; gap: 12px; padding: 3px 0; font-family: 'Space Mono', monospace; font-size: 11px; line-height: 1.6; }
    .log-ts { color: var(--muted); min-width: 100px; }
    .log-level { min-width: 42px; font-weight: 700; }
    .level-error { color: var(--red); }
    .level-warn  { color: var(--amber); }
    .level-info  { color: var(--cyan); }
    .log-svc { color: var(--indigo); min-width: 80px; }
    .log-msg { color: var(--text); }
    .log-msg.dim { color: var(--muted); }

    /* Viewer */
    .viewer { padding: 80px; text-align: center; }
    .viewer-phone {
      display: inline-block;
      background: var(--s1); border-radius: 52px;
      border: 1.5px solid rgba(0,207,255,0.12);
      overflow: hidden;
      box-shadow: 0 0 0 1px rgba(0,207,255,0.04), 0 48px 96px rgba(0,0,0,0.8);
      width: 320px; height: 664px; position: relative;
    }
    .viewer-phone::before {
      content: '';
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 90px; height: 24px;
      background: var(--bg); border-radius: 12px; z-index: 10;
    }
    .viewer-phone iframe { width: 390px; height: 844px; border: none; transform: scale(0.8205); transform-origin: 0 0; }

    footer {
      padding: 40px 80px; border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px; font-size: 11px; color: var(--muted);
      font-family: 'Space Mono', monospace;
    }
    footer strong { color: var(--cyan); font-size: 13px; letter-spacing: 3px; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 60px 24px; gap: 40px; }
      .hero-phone { display: none; }
      nav, .features, .screens, .viewer { padding-left: 24px; padding-right: 24px; }
      .metrics-strip { grid-template-columns: repeat(2,1fr); padding: 0 24px 60px; }
      .log-block { margin: 0 24px 60px; }
      footer { padding: 32px 24px; flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>

<div class="binary-strip" style="padding:3px 0;">0110 0100 0110 0001 0111 0100 0111 0101 0110 1101 0010 0000 1011 0110 0010 0001 0110 1111 0110 1101 0111 0000 0010 0000 0100 0100 0110 0001 0111 0100 0110 0001 0010 0000 0100 1101 0110 1111 0110 1101 0010 0000 0100 1110 0111 0101 0110 1100 1010 0001 0110 1100 0110 0001 0111 1001 0110 0101 0111 0010</div>

<nav>
  <span class="nav-logo">DATUM</span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#preview">Preview</a>
  </div>
  <div class="nav-badge">ALL SYSTEMS NOMINAL</div>
</nav>

<section class="hero">
  <div class="binary-strip hero-strip hero-strip-1">0110 0100 0110 0001 0111 0100 0111 0101 0110 1101 0010 0000 1011 0110 0010 0001 0110 1111 0110 1101 0111 0000 0010 0000 0100 0100 0110 0001 0111 0100 0110 0001 0010 0000 0100 1101 0110 1111 0110 1101 0010 0000 0100 1110 0111 0101 0110 1100</div>
  <div class="binary-strip hero-strip hero-strip-2" style="top:12px;">1010 0001 0110 1100 0110 0001 0111 1001 0110 0101 0111 0010 0110 0100 0110 0001 0111 0100 0111 0101 0110 1101 0010 0000 0100 0100 0110 0001 0111 0100 0110 0001 0010 0000 0100 1101 0110 1111 0110 1101 0010 0000</div>
  <div class="glow-cyan"></div>
  <div class="glow-indigo"></div>

  <div class="hero-content">
    <div class="eyebrow">◈ Observability Platform</div>
    <h1>Every byte,<br>in <em>context.</em></h1>
    <p class="hero-sub">DATUM gives your team full-stack observability — distributed tracing, structured logs, and real-time metrics — with the data as the design language, not an afterthought.</p>
    <div class="hero-actions">
      <a href="#preview" class="btn-primary">View Prototype →</a>
      <a href="#features" class="btn-secondary">See the screens ↓</a>
    </div>
  </div>

  <div class="hero-phone">
    <div class="phone-shell">
      <iframe src="https://ram.zenbin.org/datum-viewer" title="DATUM Prototype"></iframe>
    </div>
    <div class="trace-pill">
      <span class="trace-id">0xb8c2</span> &nbsp;·&nbsp;
      <span class="trace-dur">894ms</span>
    </div>
    <div class="uptime-pill">
      <div class="uptime-num">99.97</div>
      <div class="uptime-lbl">% uptime 30d</div>
    </div>
  </div>
</section>

<div class="metrics-strip">
  <div class="mcard">
    <div class="mcard-label">0x01 · Requests / Min</div>
    <div class="mcard-value cyan">4,218</div>
    <div class="mcard-sub">+3.2% vs last hour</div>
  </div>
  <div class="mcard">
    <div class="mcard-label">0x02 · P99 Latency</div>
    <div class="mcard-value red">841ms</div>
    <div class="mcard-sub">threshold: 800ms ▲</div>
  </div>
  <div class="mcard">
    <div class="mcard-label">0x03 · Error Rate</div>
    <div class="mcard-value amber">0.04%</div>
    <div class="mcard-sub">all services, 24h</div>
  </div>
  <div class="mcard">
    <div class="mcard-label">0x04 · Apdex Score</div>
    <div class="mcard-value green">0.93</div>
    <div class="mcard-sub">target 0.95 — close</div>
  </div>
</div>

<section class="features" id="features">
  <div class="section-eyebrow">0x05 · Core features</div>
  <h2 class="section-title">Observe everything. Understand what matters.</h2>
  <div class="feature-grid">
    <div class="fcard" data-hex="0110 0100 0110 0001 0111 0100 0111 0101 0110 1101">
      <div class="fcard-icon">◈</div>
      <div class="fcard-name">Distributed Tracing</div>
      <div class="fcard-desc">Waterfall span diagrams across all your microservices. Pinpoint slow spans down to the database shard level. Every trace is addressable by hex ID.</div>
      <div class="fcard-hex">→ 0x02 · TRACES · p99 894ms</div>
    </div>
    <div class="fcard" data-hex="1011 0110 0010 0001 0110 1111 0110 1101 0111">
      <div class="fcard-icon">▦</div>
      <div class="fcard-name">Live Log Stream</div>
      <div class="fcard-desc">Structured log aggregation with sub-second delivery. Filter by service, level, or trace ID. Error rows surface immediately with full context.</div>
      <div class="fcard-hex">→ 0x05 · LOGS · live stream</div>
    </div>
    <div class="fcard" data-hex="0100 0100 0110 0001 0111 0100 0110 0001 0010">
      <div class="fcard-icon">◎</div>
      <div class="fcard-name">Real-Time Metrics</div>
      <div class="fcard-desc">Request rate, error rate, and latency percentiles (p50 → p999). Throughput by service. 24h, 7d, 30d, 90d period selectors with instant re-render.</div>
      <div class="fcard-hex">→ 0x06 · METRICS · 4 charts</div>
    </div>
    <div class="fcard" data-hex="0110 1111 0110 1101 0010 0000 0100 1110">
      <div class="fcard-icon">⊹</div>
      <div class="fcard-name">Smart Alerting</div>
      <div class="fcard-desc">Policy engine with composable alert rules — latency, error rate, budget burn, cert expiry. Routes to PagerDuty, Slack, webhooks. Toggle per rule.</div>
      <div class="fcard-hex">→ 0x0C · ALERTS · 6 rules</div>
    </div>
    <div class="fcard" data-hex="1010 0001 0110 1100 0110 0001 0111 1001">
      <div class="fcard-icon">⬡</div>
      <div class="fcard-name">Service Overview</div>
      <div class="fcard-desc">All 6 services on one screen — uptime, latency, error rate, status. Active incidents surface with full context. Hex-coded section markers throughout.</div>
      <div class="fcard-hex">→ 0x01 · OVERVIEW · 6 svcs</div>
    </div>
    <div class="fcard" data-hex="0110 0100 0110 0001 0111 0100 0111 0101">
      <div class="fcard-icon">◐</div>
      <div class="fcard-name">Data-as-Design</div>
      <div class="fcard-desc">Inspired by Isidor.ai: binary strings as structural texture, hex IDs as section labels, monospace data values as first-class design elements. No illustrations needed.</div>
      <div class="fcard-hex">→ Isidor.ai pattern · Apr 2026</div>
    </div>
  </div>
</section>

<div class="log-block">
  <div class="log-header">
    <div class="log-dot red"></div>
    <div class="log-dot yellow"></div>
    <div class="log-dot green"></div>
    &nbsp;DATUM LOG STREAM · service:search-indexer level:error
  </div>
  <div class="log-body">
    <div class="log-row">
      <span class="log-ts">09:41:03.441</span>
      <span class="log-level level-error">ERROR</span>
      <span class="log-svc">search</span>
      <span class="log-msg">elasticsearch timeout after 800ms — shard[1] unresponsive</span>
    </div>
    <div class="log-row">
      <span class="log-ts">09:41:03.439</span>
      <span class="log-level level-error">ERROR</span>
      <span class="log-svc">search</span>
      <span class="log-msg">retry 3/3 failed — circuit breaker tripped</span>
    </div>
    <div class="log-row">
      <span class="log-ts">09:41:03.101</span>
      <span class="log-level level-warn">WARN</span>
      <span class="log-svc">search</span>
      <span class="log-msg">p99 latency threshold exceeded: 756ms (limit 800ms)</span>
    </div>
    <div class="log-row">
      <span class="log-ts">09:41:02.211</span>
      <span class="log-level level-info">INFO</span>
      <span class="log-svc">gateway</span>
      <span class="log-msg">circuit breaker OPEN for search-indexer · alert triggered</span>
    </div>
    <div class="log-row">
      <span class="log-ts">09:41:01.003</span>
      <span class="log-level level-info">INFO</span>
      <span class="log-svc">gateway</span>
      <span class="log-msg dim">POST /api/search routed to search-indexer-v3</span>
    </div>
  </div>
</div>

<section class="screens" id="screens">
  <div class="section-eyebrow">0x0F · 5 screens</div>
  <h2 class="section-title">Five views, zero noise.</h2>
  <div class="s-grid">
    <div class="scard">
      <div class="scard-hex">0x01 · OVERVIEW</div>
      <div class="scard-name">Service Status</div>
      <div class="scard-desc">6 services, global error rate hero, uptime sparkline, and recent traces strip.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x02 · TRACES</div>
      <div class="scard-name">Waterfall</div>
      <div class="scard-desc">Full span waterfall with depth-indented service names, slow span details, similar trace links.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x05 · LOGS</div>
      <div class="scard-name">Log Stream</div>
      <div class="scard-desc">Structured live logs with level filters, monospace timestamps, per-service colour coding.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x06 · METRICS</div>
      <div class="scard-name">Performance</div>
      <div class="scard-desc">Request rate, error rate, latency distribution, throughput by service — 4 chart panels.</div>
    </div>
    <div class="scard">
      <div class="scard-hex">0x0C · ALERTS</div>
      <div class="scard-name">Policy Engine</div>
      <div class="scard-desc">Active firing alerts, 6 configurable rules with channel routing and per-rule toggles.</div>
    </div>
  </div>
</section>

<div class="viewer" id="preview">
  <div class="section-eyebrow" style="margin-bottom:14px;">0x10 · PROTOTYPE</div>
  <h2 style="font-family:'Space Grotesk',sans-serif; font-size:clamp(26px,3vw,40px); margin-bottom:40px;">See DATUM in motion.</h2>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/datum-viewer" height="844" title="DATUM Prototype"></iframe>
  </div>
  <p style="margin-top:20px; font-size:11px; color:var(--muted); font-family:'Space Mono',monospace;">ram.zenbin.org/datum-viewer</p>
</div>

<footer>
  <strong>DATUM</strong>
  <span>Design by RAM · Pencil.dev v2.8 · DARK theme</span>
  <span>Inspired by Isidor.ai, Factory.ai, Letta — minimal.gallery SAAS Apr 2026</span>
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
