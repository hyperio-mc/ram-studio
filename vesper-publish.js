#!/usr/bin/env node
// VESPER — Publish hero + viewer to ram.zenbin.org
'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG     = 'vesper';
const APP_NAME = 'VESPER';
const TAGLINE  = 'End each day with clarity';

const HOST      = 'zenbin.org';
const SUBDOMAIN = 'ram';

function zenPost(slug, title, html) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title, html, overwrite: true });
    const opts = {
      hostname: HOST,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Subdomain':    SUBDOMAIN
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── HERO PAGE ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VESPER — End each day with clarity</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #060412;
  --surface:  #0D0920;
  --glass:    rgba(255,255,255,0.042);
  --glass2:   rgba(255,255,255,0.075);
  --text:     #EDE9FF;
  --muted:    rgba(237,233,255,0.42);
  --faint:    rgba(237,233,255,0.20);
  --accent:   #9B6DFF;
  --accent2:  #00D4BF;
  --border:   rgba(255,255,255,0.10);
  --borderacc: rgba(155,109,255,0.30);
  --borderteal: rgba(0,212,191,0.22);
  --glow-acc: 0 4px 40px rgba(155,109,255,0.30);
  --glow-teal: 0 4px 30px rgba(0,212,191,0.22);
}

html { scroll-behavior: smooth; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
body { min-height: 100vh; overflow-x: hidden; }

/* ── AMBIENT ORB FIELD ── */
.orb-field {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  overflow: hidden;
}
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); will-change: transform, opacity;
}
.orb-1 { width: 680px; height: 680px; top: -15%; left: -10%; background: radial-gradient(ellipse at center, rgba(91,46,255,0.18) 0%, transparent 70%); animation: drift1 18s ease-in-out infinite; }
.orb-2 { width: 520px; height: 520px; top: 50%; right: -8%; background: radial-gradient(ellipse at center, rgba(0,180,163,0.15) 0%, transparent 70%); animation: drift2 22s ease-in-out infinite; }
.orb-3 { width: 400px; height: 400px; bottom: 0; left: 30%; background: radial-gradient(ellipse at center, rgba(155,109,255,0.08) 0%, transparent 70%); animation: drift3 26s ease-in-out infinite; }

@keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,40px) scale(1.08); } }
@keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-30px) scale(0.94); } }
@keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-50px) scale(1.05); } }

/* ── LAYOUT ── */
.page-content { position: relative; z-index: 1; }

/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 48px;
  background: rgba(6,4,18,0.70);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid var(--border);
}
.nav-wordmark { font-size: 14px; font-weight: 700; letter-spacing: 0.16em; color: var(--text); }
.nav-links { display: flex; gap: 32px; align-items: center; }
.nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  font-size: 13px; font-weight: 600; padding: 9px 22px; border-radius: 10px;
  background: rgba(155,109,255,0.18); border: 1px solid var(--borderacc);
  color: var(--text); text-decoration: none; cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(12px);
}
.nav-cta:hover { background: rgba(155,109,255,0.28); box-shadow: var(--glow-acc); }

/* ── HERO ── */
.hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 120px 48px 80px;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
  color: var(--accent2); padding: 7px 16px; border-radius: 40px;
  background: rgba(0,212,191,0.08); border: 1px solid var(--borderteal);
  margin-bottom: 36px;
}
.hero-badge::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); box-shadow: 0 0 8px rgba(0,212,191,0.60); }
.hero-title {
  font-size: clamp(52px, 8vw, 88px); font-weight: 700;
  line-height: 1.0; letter-spacing: -0.04em;
  background: linear-gradient(135deg, #EDE9FF 0%, #B98FFF 45%, #00D4BF 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: 24px;
}
.hero-tagline {
  font-size: clamp(16px, 2.2vw, 20px); font-weight: 400; color: var(--muted);
  max-width: 480px; line-height: 1.6; margin-bottom: 52px;
}
.hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
.btn-primary {
  font-size: 15px; font-weight: 600; padding: 15px 36px; border-radius: 14px;
  background: linear-gradient(135deg, rgba(155,109,255,0.30) 0%, rgba(0,212,191,0.16) 100%);
  border: 1px solid var(--borderacc); color: var(--text); text-decoration: none;
  backdrop-filter: blur(16px); transition: box-shadow 0.2s, transform 0.15s;
  box-shadow: var(--glow-acc);
}
.btn-primary:hover { box-shadow: 0 4px 60px rgba(155,109,255,0.45); transform: translateY(-2px); }
.btn-secondary {
  font-size: 15px; font-weight: 500; padding: 15px 28px; border-radius: 14px;
  background: var(--glass); border: 1px solid var(--border); color: var(--muted);
  text-decoration: none; backdrop-filter: blur(16px); transition: color 0.2s, border-color 0.2s;
}
.btn-secondary:hover { color: var(--text); border-color: rgba(255,255,255,0.20); }

/* ── SCREEN PREVIEW STRIP ── */
.screens-section { padding: 80px 48px; }
.screens-label { text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 48px; }
.screens-strip { display: flex; gap: 16px; overflow-x: auto; padding: 20px 0 32px; justify-content: center; flex-wrap: wrap; }
.screen-preview {
  width: 200px; flex-shrink: 0; border-radius: 20px; overflow: hidden;
  background: var(--glass); border: 1px solid var(--border);
  backdrop-filter: blur(24px);
  transition: transform 0.25s, box-shadow 0.25s;
}
.screen-preview:hover { transform: translateY(-8px); box-shadow: var(--glow-acc); }
.screen-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: var(--muted); padding: 14px 16px 10px; border-bottom: 1px solid var(--border); }
.screen-content { padding: 16px; min-height: 140px; display: flex; flex-direction: column; gap: 10px; }

/* Screen visualizer elements */
.sv-bar  { height: 8px; border-radius: 4px; background: var(--glass2); }
.sv-bar.acc { background: rgba(155,109,255,0.40); }
.sv-bar.teal { background: rgba(0,212,191,0.35); }
.sv-bar.lg { height: 12px; width: 80%; }
.sv-bar.md { height: 8px; width: 60%; }
.sv-bar.sm { height: 6px; width: 45%; }
.sv-card  { border-radius: 10px; padding: 10px; background: var(--glass2); border: 1px solid var(--border); }
.sv-ring  { width: 52px; height: 52px; border-radius: 50%; border: 3px solid rgba(155,109,255,0.40); margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--muted); }
.sv-ring.teal { border-color: rgba(0,212,191,0.40); }
.sv-metric { font-size: 18px; font-weight: 700; color: var(--text); }
.sv-sub    { font-size: 9px; color: var(--muted); margin-top: 2px; }
.sv-row    { display: flex; gap: 6px; }
.sv-col    { flex: 1; }
.sv-timer  { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700; text-align: center; color: var(--text); text-shadow: 0 0 20px rgba(155,109,255,0.40); }
.sv-glow   { width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle, rgba(91,46,255,0.30) 0%, transparent 70%); margin: 0 auto; filter: blur(8px); }

/* ── FEATURE GRID ── */
.features-section { padding: 80px 48px; max-width: 960px; margin: 0 auto; }
.features-title { font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 16px; letter-spacing: -0.02em; }
.features-sub   { font-size: 16px; color: var(--muted); text-align: center; margin-bottom: 56px; }
.features-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 700px) { .features-grid { grid-template-columns: 1fr; } }
.feature-card {
  border-radius: 20px; padding: 28px;
  background: var(--glass); border: 1px solid var(--border);
  backdrop-filter: blur(24px); transition: border-color 0.2s, box-shadow 0.2s;
}
.feature-card:hover { border-color: var(--borderacc); box-shadow: var(--glow-acc); }
.feature-icon {
  width: 44px; height: 44px; border-radius: 12px; margin-bottom: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; background: var(--glass2); border: 1px solid var(--border);
}
.feature-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

/* ── DESIGN SPECS ── */
.specs-section { padding: 80px 48px; max-width: 960px; margin: 0 auto; }
.specs-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 32px; text-align: center; }
.specs-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
@media (max-width: 600px) { .specs-grid { grid-template-columns: 1fr; } }
.spec-card {
  border-radius: 16px; padding: 24px;
  background: var(--glass); border: 1px solid var(--border);
  backdrop-filter: blur(16px);
}
.spec-label { font-size: 10px; font-weight: 600; letter-spacing: 0.10em; color: var(--muted); margin-bottom: 12px; }
.spec-palette { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.swatch { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border); }
.spec-fonts .sf { font-size: 13px; color: var(--text); margin-bottom: 6px; }
.spec-fonts .sf span { color: var(--muted); font-size: 12px; margin-left: 8px; }
.spec-layers .sl { font-size: 13px; color: var(--text); padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
.spec-layers .sl:last-child { border-bottom: none; }
.sl-label { color: var(--muted); font-size: 12px; }
.spec-effects .se { font-size: 12px; color: var(--muted); padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.spec-effects .se:last-child { border-bottom: none; }

/* ── PALETTE ROW ── */
.palette-section { padding: 40px 48px 60px; max-width: 600px; margin: 0 auto; text-align: center; }
.palette-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 24px; }
.palette-swatches { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.pswatch { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pswatch-dot { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border); }
.pswatch-name { font-size: 10px; color: var(--muted); }

/* ── FOOTER ── */
footer {
  text-align: center; padding: 48px; border-top: 1px solid var(--border);
  font-size: 13px; color: var(--faint); line-height: 1.8;
}
footer a { color: var(--muted); text-decoration: none; }
footer a:hover { color: var(--text); }
</style>
</head>
<body>

<!-- Ambient orb field -->
<div class="orb-field" aria-hidden="true">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
</div>

<div class="page-content">

  <!-- Nav -->
  <nav>
    <span class="nav-wordmark">VESPER</span>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="#specs">Specs</a>
      <a href="https://ram.zenbin.org/vesper-viewer" class="nav-cta">View Design ↗</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-badge">DARK GLASS · PERSONAL CLARITY · 2026</div>
    <h1 class="hero-title">VESPER</h1>
    <p class="hero-tagline">A personal clarity OS built around intention, deep work, and the ritual of reflection.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/vesper-viewer" class="btn-primary">Open in Pencil Viewer ↗</a>
      <a href="https://ram.zenbin.org/vesper-mock" class="btn-secondary">Interactive Mock ↗</a>
    </div>
  </section>

  <!-- Screen previews -->
  <section class="screens-section" id="screens">
    <p class="screens-label">6 SCREENS · DARK GLASSMORPHISM · TIER-3 SPATIAL DEPTH</p>
    <div class="screens-strip">

      <!-- Today -->
      <div class="screen-preview">
        <div class="screen-label">TODAY</div>
        <div class="screen-content">
          <div class="sv-bar acc lg"></div>
          <div class="sv-bar sm"></div>
          <div class="sv-row">
            <div class="sv-col sv-card" style="border-color:rgba(155,109,255,0.28)">
              <div class="sv-metric" style="color:#9B6DFF">4h</div>
              <div class="sv-sub">Focus</div>
            </div>
            <div class="sv-col sv-card" style="border-color:rgba(255,183,77,0.28)">
              <div class="sv-metric" style="color:#FFB74D">18</div>
              <div class="sv-sub">Streak</div>
            </div>
            <div class="sv-col sv-card" style="border-color:rgba(0,212,191,0.28)">
              <div class="sv-metric" style="color:#00D4BF">9.2</div>
              <div class="sv-sub">Clarity</div>
            </div>
          </div>
          <div class="sv-bar md"></div>
          <div class="sv-bar sm"></div>
        </div>
      </div>

      <!-- Focus -->
      <div class="screen-preview">
        <div class="screen-label">FOCUS</div>
        <div class="screen-content" style="align-items:center">
          <div class="sv-glow"></div>
          <div class="sv-timer">47:23</div>
          <div class="sv-bar sm" style="width:40%;margin:0 auto"></div>
          <div class="sv-row" style="justify-content:center;gap:12px">
            <div class="sv-card" style="padding:6px 10px;font-size:10px;color:var(--muted)">⏭</div>
            <div class="sv-card" style="padding:6px 14px;font-size:10px;color:var(--accent);border-color:var(--borderacc)">⏸</div>
            <div class="sv-card" style="padding:6px 10px;font-size:10px;color:var(--muted)">✕</div>
          </div>
        </div>
      </div>

      <!-- Journal -->
      <div class="screen-preview">
        <div class="screen-label">JOURNAL</div>
        <div class="screen-content">
          <div class="sv-card" style="border-color:var(--borderteal)">
            <div class="sv-bar teal sm" style="margin-bottom:5px"></div>
            <div class="sv-bar sm"></div>
          </div>
          <div class="sv-bar md"></div>
          <div class="sv-bar lg"></div>
          <div class="sv-bar md"></div>
          <div class="sv-bar sm"></div>
          <div class="sv-row" style="gap:6px">
            <div class="sv-card" style="font-size:9px;color:#00D4BF;padding:4px 8px">energy</div>
            <div class="sv-card" style="font-size:9px;color:#9B6DFF;padding:4px 8px">design</div>
          </div>
        </div>
      </div>

      <!-- Reflect -->
      <div class="screen-preview">
        <div class="screen-label">REFLECT</div>
        <div class="screen-content">
          <div class="sv-card" style="height:50px;display:flex;align-items:flex-end;padding:8px;gap:4px">
            ${[6,7,5,8,7,6,8].map(h => `<div style="flex:1;height:${h*5}px;background:rgba(155,109,255,0.${20+h*3});border-radius:3px"></div>`).join('')}
          </div>
          <div class="sv-card" style="padding:8px">
            <div class="sv-bar acc sm" style="margin-bottom:4px"></div>
            <div class="sv-bar sm"></div>
          </div>
          <div class="sv-row">
            <div class="sv-col"><div class="sv-metric" style="font-size:14px">28h</div><div class="sv-sub">Focus</div></div>
            <div class="sv-col"><div class="sv-metric" style="font-size:14px">18</div><div class="sv-sub">Streak</div></div>
            <div class="sv-col"><div class="sv-metric" style="font-size:14px">8.5</div><div class="sv-sub">Avg</div></div>
          </div>
        </div>
      </div>

      <!-- Rituals -->
      <div class="screen-preview">
        <div class="screen-label">RITUALS</div>
        <div class="screen-content">
          <div class="sv-row">
            <div class="sv-col sv-card" style="text-align:center">
              <div class="sv-ring"><span>✓</span></div>
              <div class="sv-sub" style="margin-top:5px">Meditate</div>
            </div>
            <div class="sv-col sv-card" style="text-align:center">
              <div class="sv-ring teal"><span>✓</span></div>
              <div class="sv-sub" style="margin-top:5px">Journal</div>
            </div>
          </div>
          <div class="sv-row">
            <div class="sv-col sv-card" style="text-align:center;opacity:.6">
              <div class="sv-ring" style="border-color:rgba(255,183,77,0.30)"><span style="color:rgba(237,233,255,0.3)">○</span></div>
              <div class="sv-sub" style="margin-top:5px">Move</div>
            </div>
            <div class="sv-col sv-card" style="text-align:center;opacity:.6">
              <div class="sv-ring" style="border-color:rgba(185,143,255,0.30)"><span style="color:rgba(237,233,255,0.3)">40%</span></div>
              <div class="sv-sub" style="margin-top:5px">Read</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile -->
      <div class="screen-preview">
        <div class="screen-label">PROFILE</div>
        <div class="screen-content" style="align-items:center">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,rgba(155,109,255,0.4),rgba(0,212,191,0.3));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text);border:2px solid var(--borderacc)">RL</div>
          <div class="sv-row" style="gap:12px;margin-top:4px">
            <div style="text-align:center"><div class="sv-metric" style="font-size:13px">367</div><div class="sv-sub">Days</div></div>
            <div style="text-align:center"><div class="sv-metric" style="font-size:13px">214</div><div class="sv-sub">Entries</div></div>
            <div style="text-align:center"><div class="sv-metric" style="font-size:13px">623</div><div class="sv-sub">Hours</div></div>
          </div>
          <div class="sv-bar md"></div>
          <div class="sv-bar sm"></div>
          <div class="sv-bar md"></div>
        </div>
      </div>

    </div>
  </section>

  <!-- Features -->
  <section class="features-section" id="features">
    <h2 class="features-title">Built around your daily rhythm</h2>
    <p class="features-sub">Six screens that take you from morning intention to evening clarity.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🌅</div>
        <div class="feature-name">Daily Intention</div>
        <div class="feature-desc">Start with a single guiding phrase. Glass metric cards surface your streak, focus time, and clarity score at a glance.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-name">Deep Focus Timer</div>
        <div class="feature-desc">Immersive Pomodoro session. The ambient orb breathes in sync — a subtle cue for your nervous system to settle in.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✍️</div>
        <div class="feature-name">Evening Journal</div>
        <div class="feature-desc">A glass editor with a teal caret and generous line-height. Prompt cards gently surface each night — no blank page anxiety.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <div class="feature-name">Reflect & Patterns</div>
        <div class="feature-desc">Glass area chart, energy heatmap, and an AI insight card that surfaces the one thing worth acting on this week.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔁</div>
        <div class="feature-name">Ritual Rings</div>
        <div class="feature-desc">Four habits, four glass ring cards. Each has its own glow — purple for mind, teal for body, amber for movement.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <div class="feature-name">Private by Default</div>
        <div class="feature-desc">Local-first encryption, Markdown export, and daily backups. Your clarity data belongs to you.</div>
      </div>
    </div>
  </section>

  <!-- Palette -->
  <section class="palette-section">
    <p class="palette-label">PALETTE</p>
    <div class="palette-swatches">
      <div class="pswatch"><div class="pswatch-dot" style="background:#060412"></div><div class="pswatch-name">Void</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:#0D0920"></div><div class="pswatch-name">Deep</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:rgba(255,255,255,0.075);backdrop-filter:blur(8px)"></div><div class="pswatch-name">Glass</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:#9B6DFF"></div><div class="pswatch-name">Violet</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:#B98FFF"></div><div class="pswatch-name">Lilac</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:#00D4BF"></div><div class="pswatch-name">Teal</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:#FFB74D"></div><div class="pswatch-name">Amber</div></div>
      <div class="pswatch"><div class="pswatch-dot" style="background:#EDE9FF"></div><div class="pswatch-name">Frost</div></div>
    </div>
  </section>

  <!-- Specs -->
  <section class="specs-section" id="specs">
    <p class="specs-title">DESIGN SPECIFICATION</p>
    <div class="specs-grid">
      <div class="spec-card">
        <div class="spec-label">DEPTH MODEL</div>
        <div class="spec-layers">
          <div class="sl"><span>Tier 1 — Orb Field</span><span class="sl-label">CSS radial-gradient</span></div>
          <div class="sl"><span>Tier 2 — Glass Cards</span><span class="sl-label">blur(24px) · 4–11% opacity</span></div>
          <div class="sl"><span>Tier 3 — Elevated UI</span><span class="sl-label">CTAs · AI cards · Floating</span></div>
        </div>
      </div>
      <div class="spec-card">
        <div class="spec-label">GLASS TREATMENT</div>
        <div class="spec-effects">
          <div class="se">backdrop-filter: blur(24px) saturate(1.4)</div>
          <div class="se">surface: rgba(255,255,255, 0.042–0.11)</div>
          <div class="se">border: 1px gradient — 10–30% opacity</div>
          <div class="se">hover: opacity +3%, glow +20% radius</div>
          <div class="se">active: scale(0.97) 100ms ease-out</div>
        </div>
      </div>
      <div class="spec-card">
        <div class="spec-label">TYPOGRAPHY</div>
        <div class="spec-fonts">
          <div class="sf">Inter 700 · 36px <span>Display</span></div>
          <div class="sf">Inter 600 · 22px <span>Heading</span></div>
          <div class="sf">Inter 500 · 15px <span>Subheading</span></div>
          <div class="sf">Inter 400 · 14px <span>Body</span></div>
          <div class="sf">JetBrains Mono 400 · 13px <span>Timer only</span></div>
        </div>
      </div>
      <div class="spec-card">
        <div class="spec-label">ORB FIELD</div>
        <div class="spec-effects">
          <div class="se">Violet orb: #5B2EFF · 18% opacity · r≈340px</div>
          <div class="se">Teal orb: #00B4A3 · 14% opacity · r≈260px</div>
          <div class="se">filter: blur(80px) · will-change: transform</div>
          <div class="se">Focus screen: breathe-pulse 4s ease-in-out</div>
          <div class="se">Global: slow drift 18–26s per orb</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <p>VESPER · Personal Clarity OS · Dark Glassmorphism 2026</p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org/vesper-viewer">Pencil Viewer ↗</a> &nbsp;·&nbsp;
      <a href="https://ram.zenbin.org/vesper-mock">Interactive Mock ↗</a> &nbsp;·&nbsp;
      <a href="https://ram.zenbin.org">RAM Design Studio ↗</a>
    </p>
    <p style="margin-top:16px; font-size:11px">RAM Design Heartbeat · 2026-03-31 · Inspired by Dark Glassmorphism trend</p>
  </footer>

</div>
</body>
</html>`;

// ── VIEWER PAGE ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('vesper.pen', 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VESPER — Pencil Viewer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { background: #060412; color: #EDE9FF; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  body { min-height: 100vh; display: flex; flex-direction: column; align-items: center; }

  .viewer-header {
    width: 100%; padding: 18px 48px; display: flex; align-items: center; justify-content: space-between;
    background: rgba(6,4,18,0.80); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 100;
  }
  .viewer-wordmark { font-size: 13px; font-weight: 700; letter-spacing: 0.16em; }
  .viewer-meta { font-size: 12px; color: rgba(237,233,255,0.42); }
  .viewer-back { font-size: 13px; color: rgba(237,233,255,0.42); text-decoration: none; }
  .viewer-back:hover { color: #EDE9FF; }

  .viewer-main { flex: 1; width: 100%; max-width: 960px; padding: 48px 24px; }
  .pen-json-display {
    background: rgba(255,255,255,0.038); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 32px; overflow: auto;
    font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.7;
    color: rgba(237,233,255,0.70); white-space: pre; max-height: 80vh;
    backdrop-filter: blur(16px);
  }
  .pen-json-display .key   { color: #B98FFF; }
  .pen-json-display .str   { color: #00D4BF; }
  .pen-json-display .num   { color: #FFB74D; }
  .pen-json-display .bool  { color: #3DE8B0; }

  .viewer-nav { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
  .screen-btn {
    padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);
    color: rgba(237,233,255,0.60); transition: all 0.2s;
  }
  .screen-btn:hover, .screen-btn.active {
    background: rgba(155,109,255,0.15); border-color: rgba(155,109,255,0.35);
    color: #EDE9FF; box-shadow: 0 4px 20px rgba(155,109,255,0.20);
  }

  .screen-view { display: none; }
  .screen-view.active { display: block; }

  .screen-card {
    border-radius: 20px; padding: 28px; margin-bottom: 20px;
    background: rgba(255,255,255,0.042); border: 1px solid rgba(255,255,255,0.10);
    backdrop-filter: blur(24px);
  }
  .screen-title { font-size: 20px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
  .screen-desc  { font-size: 13px; color: rgba(237,233,255,0.45); line-height: 1.6; margin-bottom: 20px; }
  .comp-list { display: flex; flex-direction: column; gap: 12px; }
  .comp-item {
    padding: 14px 18px; border-radius: 12px;
    background: rgba(255,255,255,0.038); border: 1px solid rgba(255,255,255,0.07);
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
  }
  .comp-type { color: #9B6DFF; font-weight: 500; margin-bottom: 4px; }
  .comp-fields { color: rgba(237,233,255,0.50); }
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</head>
<body>
<header class="viewer-header">
  <span class="viewer-wordmark">VESPER</span>
  <span class="viewer-meta">Personal Clarity OS · Dark Glass · 6 Screens</span>
  <a href="https://ram.zenbin.org/vesper" class="viewer-back">← Hero</a>
</header>

<main class="viewer-main">
  <div class="viewer-nav" id="screen-nav"></div>
  <div id="screens-container"></div>
</main>

<script>
(function() {
  const pen = JSON.parse(window.EMBEDDED_PEN);
  const nav = document.getElementById('screen-nav');
  const cont = document.getElementById('screens-container');

  pen.screens.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'screen-btn' + (i === 0 ? ' active' : '');
    btn.textContent = s.label;
    btn.onclick = () => {
      document.querySelectorAll('.screen-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen-view').forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('screen-' + s.id).classList.add('active');
    };
    nav.appendChild(btn);

    const view = document.createElement('div');
    view.id = 'screen-' + s.id;
    view.className = 'screen-view' + (i === 0 ? ' active' : '');

    const card = document.createElement('div');
    card.className = 'screen-card';
    card.innerHTML = '<div class="screen-title">' + s.label + '</div>' +
      '<div class="screen-desc">' + (s.description || '') + '</div>' +
      '<div class="comp-list">' +
      s.components.map(c => {
        const fields = Object.keys(c).filter(k => k !== 'type').slice(0, 3).map(k => {
          let v = c[k];
          if (typeof v === 'object') v = Array.isArray(v) ? '[' + v.length + ' items]' : '{…}';
          if (typeof v === 'string' && v.length > 40) v = v.slice(0, 40) + '…';
          return k + ': ' + v;
        }).join(' · ');
        return '<div class="comp-item"><div class="comp-type">' + c.type + '</div>' +
          '<div class="comp-fields">' + fields + '</div></div>';
      }).join('') +
      '</div>';

    view.appendChild(card);
    cont.appendChild(view);
  });
})();
</script>
</body>
</html>`;

// ── PUBLISH ──────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing VESPER to ram.zenbin.org…');

  const heroRes = await zenPost(SLUG, APP_NAME + ' — ' + TAGLINE, heroHtml);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  const viewerRes = await zenPost(SLUG + '-viewer', APP_NAME + ' — Viewer', viewerHtml);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 80));

  console.log('');
  console.log('  Hero:   https://ram.zenbin.org/vesper');
  console.log('  Viewer: https://ram.zenbin.org/vesper-viewer');
})();
