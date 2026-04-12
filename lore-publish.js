'use strict';
// lore-publish.js — hero page + viewer for LORE

const fs   = require('fs');
const https = require('https');

const SLUG   = 'lore';
const SUBDOM = 'ram';

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d, status: res.statusCode }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LORE — Story Intelligence Workspace</title>
<style>
  :root {
    --bg:      #080B12;
    --surf:    #0E1320;
    --surf2:   #141929;
    --border:  #1E2A42;
    --text:    #EAE6DC;
    --dim:     #8A8680;
    --accent:  #6B4FE8;
    --gold:    #B8984A;
    --danger:  #E85B4F;
    --success: #4FBF7A;
    --warn:    #C4873D;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', -apple-system, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 60px;
    background: rgba(8,11,18,0.85);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(16px);
  }
  .logo { font-size: 15px; font-weight: 800; letter-spacing: 4px; color: var(--gold); }
  .logo span { color: var(--dim); font-weight: 400; font-size: 12px; letter-spacing: 2px; margin-left: 12px; }
  .nav-cta {
    background: var(--accent);
    color: #fff;
    border: none; border-radius: 8px;
    padding: 8px 20px; font-size: 13px; font-weight: 600;
    cursor: pointer; letter-spacing: 0.3px;
    text-decoration: none;
    transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    position: relative;
    overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: 20%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(107,79,232,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-glow2 {
    position: absolute; top: 60%; left: 30%;
    width: 400px; height: 300px;
    background: radial-gradient(ellipse, rgba(184,152,74,0.10) 0%, transparent 70%);
    pointer-events: none;
  }
  .eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 4px;
    color: var(--gold); text-transform: uppercase;
    margin-bottom: 20px;
  }
  h1 {
    font-size: clamp(44px, 8vw, 80px);
    font-weight: 800; line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 24px;
  }
  h1 em { color: var(--accent); font-style: normal; }
  .hero-sub {
    font-size: clamp(16px, 2.5vw, 20px);
    color: var(--dim); max-width: 560px;
    margin: 0 auto 48px;
    line-height: 1.65;
  }
  .hero-ctas {
    display: flex; gap: 14px; flex-wrap: wrap;
    align-items: center; justify-content: center;
  }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 32px; border-radius: 10px;
    font-size: 15px; font-weight: 700;
    text-decoration: none; letter-spacing: 0.2px;
    transition: transform .2s, opacity .2s;
  }
  .btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
  .btn-secondary {
    background: var(--surf); color: var(--text);
    padding: 14px 32px; border-radius: 10px;
    font-size: 15px; font-weight: 600;
    text-decoration: none;
    border: 1px solid var(--border);
    transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); }

  /* ── App Preview ── */
  .preview-wrap {
    padding: 0 24px 100px;
    display: flex; justify-content: center;
  }
  .device-frame {
    width: 320px; height: 680px;
    background: var(--surf);
    border-radius: 44px;
    border: 1.5px solid var(--border);
    overflow: hidden;
    position: relative;
    box-shadow:
      0 0 0 8px rgba(14,19,32,0.8),
      0 40px 100px rgba(0,0,0,0.6),
      0 0 80px rgba(107,79,232,0.12);
  }
  .device-notch {
    position: absolute; top: 12px; left: 50%;
    transform: translateX(-50%);
    width: 100px; height: 26px;
    background: var(--bg);
    border-radius: 13px;
    z-index: 2;
  }
  .screen-preview {
    width: 100%; height: 100%;
    background: var(--bg);
    padding: 50px 0 0;
    overflow: hidden;
  }

  /* Mini app UI inside frame */
  .mini-header {
    padding: 0 20px 12px;
    border-bottom: 1px solid var(--border);
  }
  .mini-eyebrow {
    font-size: 8px; letter-spacing: 3px; color: var(--gold); font-weight: 700;
    margin-bottom: 3px;
  }
  .mini-title { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
  .mini-chips { display: flex; gap: 6px; margin-top: 6px; }
  .chip {
    font-size: 7px; font-weight: 700; letter-spacing: 1.5px; padding: 3px 8px;
    border-radius: 99px; background: rgba(107,79,232,0.2); color: var(--accent);
  }
  .chip.gold { background: rgba(184,152,74,0.15); color: var(--gold); }

  .mini-metrics {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 0; margin: 12px 16px;
    background: var(--surf); border-radius: 10px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .mini-metric {
    padding: 10px 4px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .mini-metric:last-child { border-right: none; }
  .mini-metric-val { font-size: 15px; font-weight: 800; }
  .mini-metric-lbl { font-size: 7px; letter-spacing: 1px; color: var(--dim); margin-top: 2px; }

  .mini-section-lbl {
    font-size: 8px; letter-spacing: 2px; color: var(--dim); font-weight: 700;
    padding: 0 20px; margin: 10px 0 6px;
  }

  .mini-act {
    display: flex; align-items: center; gap: 8px;
    margin: 0 16px 5px;
    background: var(--surf); border-radius: 6px;
    padding: 7px 10px;
  }
  .mini-act-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .mini-act-fill { height: 100%; border-radius: 2px; }
  .mini-act-label { font-size: 8px; color: var(--dim); width: 36px; font-weight: 600; }
  .mini-act-name { font-size: 9px; color: var(--text); font-weight: 500; width: 58px; }

  .mini-activity-item {
    display: flex; align-items: flex-start; gap: 8px;
    margin: 0 16px 5px;
    background: var(--surf); border-radius: 6px;
    padding: 8px 10px;
    border-left: 2px solid;
  }
  .mini-activity-text { font-size: 9px; color: var(--text); line-height: 1.4; }
  .mini-activity-time { font-size: 8px; color: var(--dim); }

  .mini-nav {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: var(--surf);
    border-top: 1px solid var(--border);
    display: flex;
    padding: 8px 0 12px;
  }
  .mini-nav-item {
    flex: 1; text-align: center;
    font-size: 7px; color: var(--dim);
    display: flex; flex-direction: column; align-items: center; gap: 3px;
  }
  .mini-nav-item.active { color: var(--accent); }
  .mini-nav-icon { font-size: 13px; }
  .mini-nav-bar {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 36px; height: 2px;
    background: var(--accent); border-radius: 1px;
  }

  /* ── Features ── */
  .features { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 4px;
    color: var(--gold); text-align: center; margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 800; text-align: center; letter-spacing: -1px;
    margin-bottom: 60px; line-height: 1.15;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .feature-card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: border-color .25s, transform .25s;
  }
  .feature-card:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
  }
  .feature-icon {
    font-size: 28px; margin-bottom: 16px;
    display: block;
  }
  .feature-card h3 {
    font-size: 17px; font-weight: 700; margin-bottom: 10px;
    letter-spacing: -0.3px;
  }
  .feature-card p { font-size: 14px; color: var(--dim); line-height: 1.65; }

  /* ── Graph section ── */
  .graph-section {
    padding: 60px 24px 80px; text-align: center;
    position: relative; overflow: hidden;
  }
  .graph-vis {
    width: 360px; height: 220px;
    position: relative; margin: 40px auto;
  }
  .g-node {
    position: absolute; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: var(--text);
    letter-spacing: 0.5px;
  }
  .g-line {
    position: absolute; transform-origin: 0 50%;
    height: 1px; opacity: 0.3;
  }

  /* ── Screens strip ── */
  .screens-section { padding: 60px 0 80px; overflow: hidden; }
  .screens-label { text-align: center; margin-bottom: 40px; }
  .screens-strip {
    display: flex; gap: 16px;
    padding: 0 40px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .screens-strip::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 180px; height: 290px;
    background: var(--surf2); border-radius: 20px;
    border: 1px solid var(--border);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 20px 14px;
    font-size: 11px; color: var(--dim);
    gap: 8px;
    transition: border-color .2s;
  }
  .screen-card:hover { border-color: var(--accent); }
  .screen-card .sc-icon { font-size: 28px; }
  .screen-card .sc-name { font-weight: 700; color: var(--text); font-size: 13px; }
  .screen-card .sc-desc { text-align: center; line-height: 1.5; font-size: 11px; }

  /* ── Inspiration ── */
  .inspiration {
    padding: 60px 24px;
    max-width: 800px; margin: 0 auto;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .insp-title { font-size: 13px; font-weight: 700; color: var(--gold); letter-spacing: 3px; margin-bottom: 20px; }
  .insp-item { display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start; }
  .insp-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
  .insp-text p { font-size: 14px; color: var(--dim); line-height: 1.6; }
  .insp-text strong { color: var(--text); }

  /* ── CTA footer ── */
  .cta-section {
    padding: 100px 24px; text-align: center;
  }
  .cta-section h2 {
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 800; letter-spacing: -1.5px;
    margin-bottom: 20px; line-height: 1.1;
  }
  .cta-section p { color: var(--dim); font-size: 16px; margin-bottom: 40px; }

  footer {
    padding: 32px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--dim);
    flex-wrap: wrap; gap: 12px;
  }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: var(--dim); text-decoration: none; transition: color .2s; }
  .footer-links a:hover { color: var(--text); }
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<!-- Nav -->
<nav>
  <div class="logo">LORE <span>STORY INTELLIGENCE</span></div>
  <a href="https://ram.zenbin.org/lore-viewer" class="nav-cta">View Design →</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <p class="eyebrow">RAM Design Heartbeat · 2026</p>
  <h1>Your story<br>universe,<br><em>mapped.</em></h1>
  <p class="hero-sub">A cinematic dark workspace for screenwriters and narrative designers. Characters, timelines, lore, and plot threads — all connected in one living story graph.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/lore-viewer" class="btn-primary">Explore Design</a>
    <a href="https://ram.zenbin.org/lore-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- Device Preview -->
<div class="preview-wrap">
  <div class="device-frame">
    <div class="device-notch"></div>
    <div class="screen-preview">
      <div class="mini-header">
        <div class="mini-eyebrow">LORE</div>
        <div class="mini-title">The Pale Kingdom</div>
        <div class="mini-chips">
          <span class="chip">DRAFT</span>
          <span class="chip gold">FANTASY</span>
        </div>
      </div>
      <div class="mini-metrics">
        <div class="mini-metric">
          <div class="mini-metric-val" style="color:#6B4FE8">3/5</div>
          <div class="mini-metric-lbl">ACTS</div>
        </div>
        <div class="mini-metric">
          <div class="mini-metric-val" style="color:#B8984A">42K</div>
          <div class="mini-metric-lbl">WORDS</div>
        </div>
        <div class="mini-metric">
          <div class="mini-metric-val" style="color:#4FBF7A">18</div>
          <div class="mini-metric-lbl">CHARS</div>
        </div>
        <div class="mini-metric">
          <div class="mini-metric-val" style="color:#C4873D">67</div>
          <div class="mini-metric-lbl">SCENES</div>
        </div>
      </div>
      <div class="mini-section-lbl">ACT STRUCTURE</div>
      <div class="mini-act">
        <div class="mini-act-label" style="color:#6B4FE8">Act I</div>
        <div class="mini-act-name">The Call</div>
        <div class="mini-act-bar"><div class="mini-act-fill" style="width:78%;background:#6B4FE8"></div></div>
      </div>
      <div class="mini-act">
        <div class="mini-act-label" style="color:#B8984A">Act II-A</div>
        <div class="mini-act-name">Descent</div>
        <div class="mini-act-bar"><div class="mini-act-fill" style="width:55%;background:#B8984A"></div></div>
      </div>
      <div class="mini-act">
        <div class="mini-act-label" style="color:#C4873D">Act II-B</div>
        <div class="mini-act-name">The Turn</div>
        <div class="mini-act-bar"><div class="mini-act-fill" style="width:30%;background:#C4873D"></div></div>
      </div>
      <div class="mini-act">
        <div class="mini-act-label" style="color:#E85B4F">Act III</div>
        <div class="mini-act-name">Resolution</div>
        <div class="mini-act-bar"><div class="mini-act-fill" style="width:8%;background:#E85B4F"></div></div>
      </div>
      <div class="mini-section-lbl">RECENT ACTIVITY</div>
      <div class="mini-activity-item" style="border-left-color:#6B4FE8">
        <div>
          <div class="mini-activity-text">Lyra Ashveil — motives updated</div>
          <div class="mini-activity-time">2h ago</div>
        </div>
      </div>
      <div class="mini-activity-item" style="border-left-color:#B8984A">
        <div>
          <div class="mini-activity-text">Scene 34 "The Mirror Room" drafted</div>
          <div class="mini-activity-time">5h ago</div>
        </div>
      </div>
      <div class="mini-nav">
        <div class="mini-nav-item active">
          <div class="mini-nav-bar"></div>
          <div class="mini-nav-icon">◈</div>
          <div>Universe</div>
        </div>
        <div class="mini-nav-item"><div class="mini-nav-icon">◉</div><div>Characters</div></div>
        <div class="mini-nav-item"><div class="mini-nav-icon">◌</div><div>Timeline</div></div>
        <div class="mini-nav-item"><div class="mini-nav-icon">◫</div><div>Lore</div></div>
        <div class="mini-nav-item"><div class="mini-nav-icon">◧</div><div>Threads</div></div>
      </div>
    </div>
  </div>
</div>

<!-- Features -->
<section class="features">
  <p class="section-label">The Workspace</p>
  <h2 class="section-title">Every part of your story,<br>in one living system.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <span class="feature-icon">◈</span>
      <h3>Story Universe</h3>
      <p>Your story at a glance. Act structure progress, scene counts, word milestones, and real-time activity — all in one cinematic dashboard.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◉</span>
      <h3>Character Intelligence</h3>
      <p>Track every character's arc completion, relationships, and scene count. Know instantly who needs more scenes and who's overdeveloped.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◌</span>
      <h3>Dramatic Arc Timeline</h3>
      <p>A visual tension-curve beat sheet. See your story's rhythm at a glance — rising action, midpoints, dark nights, and resolutions mapped live.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◫</span>
      <h3>Lore Compendium</h3>
      <p>Locations, factions, artifacts, events — each entry links to the characters and scenes that touch it. Your world stays internally consistent.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◧</span>
      <h3>Plot Thread Tracking</h3>
      <p>Know which threads are active, planted, stalled, or resolved. Track weave percentage and ensure every promise to the reader gets paid off.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◈</span>
      <h3>Story Graph</h3>
      <p>An Obsidian-style knowledge graph of your entire universe. Characters, locations, and events as interconnected nodes you can navigate visually.</p>
    </div>
  </div>
</section>

<!-- Screens strip -->
<section class="screens-section">
  <div class="screens-label">
    <p class="section-label">Five Screens</p>
  </div>
  <div class="screens-strip">
    <div class="screen-card">
      <span class="sc-icon">◈</span>
      <span class="sc-name">Universe</span>
      <span class="sc-desc">Story dashboard with act structure and activity feed</span>
    </div>
    <div class="screen-card">
      <span class="sc-icon">◉</span>
      <span class="sc-name">Characters</span>
      <span class="sc-desc">Character roster with arc tracking and relationship counts</span>
    </div>
    <div class="screen-card">
      <span class="sc-icon">◌</span>
      <span class="sc-name">Timeline</span>
      <span class="sc-desc">Tension curve + beat sheet with live status per scene</span>
    </div>
    <div class="screen-card">
      <span class="sc-icon">◫</span>
      <span class="sc-name">Lore</span>
      <span class="sc-desc">World compendium: locations, factions, artifacts, events</span>
    </div>
    <div class="screen-card">
      <span class="sc-icon">◧</span>
      <span class="sc-name">Threads</span>
      <span class="sc-desc">Plot thread management with weave percentage tracker</span>
    </div>
  </div>
</section>

<!-- Inspiration -->
<section style="padding: 60px 24px; max-width: 800px; margin: 0 auto; border-top: 1px solid var(--border);">
  <p style="font-size:11px;font-weight:700;letter-spacing:3px;color:var(--gold);margin-bottom:20px;">DESIGN INSPIRATION</p>
  <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
    <div style="width:8px;height:8px;border-radius:50%;background:#6B4FE8;margin-top:6px;flex-shrink:0;"></div>
    <p style="font-size:14px;color:var(--dim);line-height:1.65;"><strong style="color:var(--text)">Obsidian (via darkmodedesign.com)</strong> — Treating story elements as interconnected knowledge nodes, navigable as a graph. LORE applies this pattern to creative storytelling: every character, location, and plot thread is a node in a living story graph.</p>
  </div>
  <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
    <div style="width:8px;height:8px;border-radius:50%;background:#B8984A;margin-top:6px;flex-shrink:0;"></div>
    <p style="font-size:14px;color:var(--dim);line-height:1.65;"><strong style="color:var(--text)">Atlas Card (via godly.website)</strong> — The luxury editorial dark aesthetic with ALL-CAPS micro-labeling, cinematic depth, and premium exclusivity. Translated from finance concierge into creative intelligence — same editorial confidence, different domain.</p>
  </div>
  <div style="display:flex;gap:16px;align-items:flex-start;">
    <div style="width:8px;height:8px;border-radius:50%;background:#E85B4F;margin-top:6px;flex-shrink:0;"></div>
    <p style="font-size:14px;color:var(--dim);line-height:1.65;"><strong style="color:var(--text)">Linear's feature density</strong> — Packing rich information into elegant dark cards without feeling cluttered. The "progress bar per item" pattern adapted for dramatic arc tracking.</p>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>Every story has<br>a structure. Now<br>you can <em style="color:var(--accent);font-style:normal">see it.</em></h2>
  <p>Explore the full design in the Pencil viewer or try the interactive mock.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
    <a href="https://ram.zenbin.org/lore-viewer" class="btn-primary" style="background:var(--accent);color:#fff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">Open Viewer →</a>
    <a href="https://ram.zenbin.org/lore-mock" class="btn-secondary" style="background:var(--surf);color:var(--text);padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;border:1px solid var(--border);">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div class="logo">LORE</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/lore-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/lore-mock">Mock</a>
    <a href="https://ram.zenbin.org">RAM Design</a>
  </div>
  <div style="color:var(--dim);font-size:12px;">RAM Design Heartbeat · 2026</div>
</footer>

<style>
  .btn-primary { background:var(--accent);color:#fff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none; }
  .btn-secondary { background:var(--surf);color:var(--text);padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;border:1px solid var(--border); }
</style>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LORE — Pencil Viewer</title>
<style>
  body { margin: 0; background: #080B12; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; font-family: Inter, sans-serif; color: #EAE6DC; }
  nav { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; background: rgba(8,11,18,0.9); border-bottom: 1px solid #1E2A42; }
  .logo { font-size: 14px; font-weight: 800; letter-spacing: 4px; color: #B8984A; }
  a.back { color: #8A8680; font-size: 13px; text-decoration: none; }
  a.back:hover { color: #EAE6DC; }
  #viewer-root { width: 100%; }
</style>
<script>PLACEHOLDER_SCRIPT</script>
</head>
<body>
<nav>
  <div class="logo">LORE</div>
  <a href="https://ram.zenbin.org/lore" class="back">← Back to Design</a>
</nav>
<div id="viewer-root">
  <p style="text-align:center;padding:80px;color:#8A8680">Loading LORE design…</p>
</div>
<script src="https://app.pencil.dev/embed/pencil-embed.js" defer></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  if (typeof PencilEmbed !== 'undefined' && window.EMBEDDED_PEN) {
    PencilEmbed.render(document.getElementById('viewer-root'), JSON.parse(window.EMBEDDED_PEN));
  }
});
</script>
</body>
</html>`;

async function main() {
  console.log('Publishing LORE design pipeline...\n');

  // 1. Hero page
  console.log('1/2 Publishing hero page → lore');
  const heroRes = await zenPublish('lore', heroHtml, 'LORE — Story Intelligence Workspace');
  console.log('   Hero:', heroRes.url || heroRes.status || JSON.stringify(heroRes).slice(0, 80));

  // 2. Viewer
  console.log('2/2 Publishing viewer → lore-viewer');
  const penJson = fs.readFileSync('/workspace/group/design-studio/lore.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  const viewerHtml = viewerTemplate.replace('PLACEHOLDER_SCRIPT', `window.EMBEDDED_PEN = ${JSON.stringify(penJson)}`);
  const viewerRes = await zenPublish('lore-viewer', viewerHtml, 'LORE — Pencil Viewer');
  console.log('   Viewer:', viewerRes.url || viewerRes.status || JSON.stringify(viewerRes).slice(0, 80));

  console.log('\n✓ Publishing complete');
}

main().catch(console.error);
