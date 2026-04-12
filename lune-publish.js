#!/usr/bin/env node
'use strict';
// lune-publish.js — Hero + viewer for LUNE

const fs    = require('fs');
const https = require('https');

const SLUG      = 'lune';
const APP_NAME  = 'Lune';
const TAGLINE   = 'Sleep intelligence, felt not tracked.';
const SUBDOMAIN = 'ram';

function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
  return res;
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Lune — Sleep Intelligence, Felt Not Tracked</title>
  <meta name="description" content="Lune is a proactive sleep intelligence app. Circadian forecasting, stage architecture, and AI insights — warm humanistic design.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:#FAF4ED; --surface:#F3EAE0; --surface2:#EDE0D4;
      --border:#DDD0C3; --fg:#2B1A0C; --muted:#9A8878;
      --accent:#C4622D; --accent2:#7B9E87; --accent3:#9B6B9A; --gold:#C49A3C;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--fg); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; min-height: 100vh; overflow-x: hidden; }
    .orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(100px); }
    .orb-1 { width: 600px; height: 600px; top: -200px; left: -200px; background: rgba(155,107,154,0.10); }
    .orb-2 { width: 500px; height: 500px; top: 200px; right: -150px; background: rgba(196,98,45,0.07); }
    .orb-3 { width: 400px; height: 400px; bottom: 0; left: 30%; background: rgba(123,158,135,0.08); }
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(250,244,237,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 56px; }
    .nav-brand { font-family: 'Lora', Georgia, serif; font-weight: 700; font-size: 18px; color: var(--fg); }
    .nav-moon { color: var(--accent3); margin-right: 4px; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { color: var(--muted); font-size: 13px; font-weight: 500; text-decoration: none; transition: color .2s; }
    .nav-links a:hover { color: var(--fg); }
    .nav-cta { background: var(--fg); color: var(--bg); padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; text-decoration: none; transition: opacity .2s; }
    .nav-cta:hover { opacity: .85; }
    .hero { position: relative; z-index: 1; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 80px 24px 60px; }
    .hero-inner { max-width: 720px; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 28px; }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); }
    .hero-title { font-family: 'Lora', Georgia, serif; font-size: clamp(40px, 6vw, 70px); font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 20px; }
    .hero-title em { font-style: italic; color: var(--accent3); }
    .hero-sub { font-size: clamp(16px, 2vw, 19px); color: var(--muted); max-width: 520px; margin: 0 auto 36px; line-height: 1.7; font-style: italic; font-family: 'Lora', serif; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
    .btn-primary { background: var(--fg); color: var(--bg); padding: 14px 28px; border-radius: 28px; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity .2s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary:hover { opacity: .85; }
    .btn-ghost { background: transparent; color: var(--fg); padding: 14px 28px; border: 1.5px solid var(--border); border-radius: 28px; font-size: 14px; font-weight: 500; text-decoration: none; transition: border-color .2s; }
    .btn-ghost:hover { border-color: var(--fg); }
    .hero-metrics { display: flex; gap: 32px; justify-content: center; padding-top: 24px; border-top: 1px solid var(--border); }
    .hero-metric { text-align: center; }
    .metric-val { font-family: 'Lora', serif; font-size: 24px; font-weight: 700; }
    .metric-label { font-size: 11px; color: var(--muted); margin-top: 2px; letter-spacing: .04em; }
    .phone-section { position: relative; z-index: 1; padding: 60px 24px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; align-items: flex-start; }
    .phone-frame { width: 220px; background: var(--surface); border: 1px solid var(--border); border-radius: 32px; padding: 12px; box-shadow: 0 8px 40px rgba(43,26,12,0.10); transition: transform .3s; }
    .phone-frame:hover { transform: translateY(-6px); }
    .phone-frame.featured { width: 260px; transform: translateY(-16px); }
    .phone-frame.featured:hover { transform: translateY(-22px); }
    .screen-label { text-align: center; font-size: 11px; color: var(--muted); margin-top: 10px; font-weight: 500; letter-spacing: .04em; }
    section { position: relative; z-index: 1; padding: 80px 24px; max-width: 1080px; margin: 0 auto; }
    .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .1em; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-family: 'Lora', Georgia, serif; font-size: clamp(28px, 4vw, 46px); font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 16px; }
    .section-sub { font-size: 16px; color: var(--muted); max-width: 480px; line-height: 1.7; font-style: italic; font-family: 'Lora', serif; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 48px; }
    .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; transition: transform .2s, box-shadow .2s; }
    .feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(43,26,12,0.08); }
    .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
    .icon-moon { background: rgba(155,107,154,0.15); }
    .icon-leaf { background: rgba(123,158,135,0.15); }
    .icon-sun  { background: rgba(196,98,45,0.12); }
    .icon-stars { background: rgba(196,154,60,0.12); }
    .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    .feature-body { font-size: 13px; color: var(--muted); line-height: 1.6; font-style: italic; font-family: 'Lora', serif; }
    .insight-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 40px; margin-top: 48px; }
    .insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
    .insight-item { border-left: 3px solid var(--accent3); padding-left: 16px; }
    .insight-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .insight-body { font-size: 12px; color: var(--muted); line-height: 1.6; font-style: italic; font-family: 'Lora', serif; }
    .design-notes { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 40px; }
    .palette-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .palette-chip { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); }
    .cta-section { text-align: center; padding: 80px 24px 100px; position: relative; z-index: 1; }
    .cta-inner { max-width: 560px; margin: 0 auto; }
    .cta-moon { font-size: 52px; margin-bottom: 20px; opacity: .6; }
    .cta-title { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 42px); font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
    .cta-sub { color: var(--muted); font-size: 15px; margin-bottom: 32px; font-style: italic; font-family: 'Lora', serif; }
    .footer { text-align: center; padding: 20px; border-top: 1px solid var(--border); font-size: 11px; color: var(--muted); }
    .footer a { color: var(--accent3); text-decoration: none; }
    @media (max-width: 640px) {
      nav { padding: 0 20px; }
      .nav-links { display: none; }
      .insight-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <nav>
    <div class="nav-brand"><span class="nav-moon">◐</span>Lune</div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#insights">Insights</a>
      <a href="#design">Design</a>
    </div>
    <a href="/lune-mock" class="nav-cta">Try Mock ☀◑</a>
  </nav>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-badge"><span class="badge-dot"></span>Design exploration by RAM · April 2026</div>
      <h1 class="hero-title">Sleep intelligence,<br><em>felt</em> not tracked.</h1>
      <p class="hero-sub">Lune understands your sleep the way a quiet journal would — through observation, pattern, and gentle truth.</p>
      <div class="hero-actions">
        <a href="/lune-viewer" class="btn-primary">◐ View Prototype</a>
        <a href="/lune-mock" class="btn-ghost">Interactive Mock ☀◑</a>
      </div>
      <div class="hero-metrics">
        <div class="hero-metric"><div class="metric-val">6</div><div class="metric-label">Screens</div></div>
        <div class="hero-metric"><div class="metric-val">LIGHT</div><div class="metric-label">Theme</div></div>
        <div class="hero-metric"><div class="metric-val">Warm</div><div class="metric-label">Palette</div></div>
        <div class="hero-metric"><div class="metric-val">Lora</div><div class="metric-label">Typeface</div></div>
      </div>
    </div>
  </section>

  <div class="phone-section">
    <div class="phone-frame">
      <div style="background:#FAF4ED;padding:16px;border-radius:22px;min-height:200px;">
        <div style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#2B1A0C;">Lune</div>
        <div style="font-size:9px;color:#B8A898;margin-bottom:10px;">Tuesday, April 7</div>
        <div style="background:#F3EAE0;border-radius:12px;padding:12px;border:1px solid #DDD0C3;margin-bottom:8px;">
          <div style="font-size:8px;color:#B8A898;margin-bottom:3px;letter-spacing:.4px;">TONIGHT'S WINDOW</div>
          <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#2B1A0C;">10:45 pm</div>
          <div style="font-size:11px;color:#C4622D;font-weight:600;">→ 6:30 am</div>
          <div style="font-size:8px;color:#B8A898;margin-top:4px;">7h 45m · 74% confidence</div>
        </div>
        <div style="font-size:9px;font-weight:600;color:#2B1A0C;margin-bottom:5px;">Tonight's Ritual</div>
        <div style="background:#F3EAE0;border-radius:8px;padding:6px 8px;font-size:8px;color:#7B9E87;border:1px solid #DDD0C3;margin-bottom:3px;">✓ Last caffeine before 2pm</div>
        <div style="background:#FAF4ED;border-radius:8px;padding:6px 8px;font-size:8px;color:#2B1A0C;border:1px solid #DDD0C3;">○ Magnesium glycinate</div>
      </div>
      <div class="screen-label">Tonight</div>
    </div>
    <div class="phone-frame featured">
      <div style="background:#FAF4ED;padding:16px;border-radius:22px;min-height:240px;">
        <div style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#2B1A0C;">Last Night</div>
        <div style="font-size:8px;color:#B8A898;margin-bottom:10px;">Mon Apr 6 · 10:52 pm – 6:47 am</div>
        <div style="background:#F3EAE0;border-radius:12px;padding:12px;border:1px solid #DDD0C3;display:flex;gap:10px;align-items:center;margin-bottom:8px;">
          <div style="text-align:center;min-width:48px;">
            <div style="font-family:Georgia,serif;font-size:32px;font-weight:800;color:#2B1A0C;line-height:1;">82</div>
            <div style="font-size:8px;color:#C49A3C;font-weight:600;">Good Sleep</div>
          </div>
          <div style="border-left:1px solid #DDD0C3;padding-left:10px;flex:1;">
            <div style="font-size:8px;color:#B8A898;letter-spacing:.3px;margin-bottom:1px;">DURATION</div>
            <div style="font-size:14px;font-weight:700;color:#2B1A0C;margin-bottom:5px;">7h 55m</div>
            <div style="font-size:8px;color:#B8A898;letter-spacing:.3px;margin-bottom:1px;">EFFICIENCY</div>
            <div style="font-size:14px;font-weight:700;color:#7B9E87;">93%</div>
          </div>
        </div>
        <div style="font-size:9px;font-weight:600;color:#2B1A0C;margin-bottom:6px;">Sleep Architecture</div>
        <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:4px;"><span style="font-size:7px;color:#B8A898;width:28px;">Awake</span><div style="flex:1;height:9px;background:#EDE0D4;border-radius:3px;overflow:hidden;"><div style="width:5%;height:100%;background:#DDD0C3;border-radius:3px;"></div></div></div>
          <div style="display:flex;align-items:center;gap:4px;"><span style="font-size:7px;color:#B8A898;width:28px;">Light</span><div style="flex:1;height:9px;background:#EDE0D4;border-radius:3px;overflow:hidden;"><div style="width:35%;height:100%;background:rgba(155,107,154,0.5);border-radius:3px;"></div></div></div>
          <div style="display:flex;align-items:center;gap:4px;"><span style="font-size:7px;color:#B8A898;width:28px;">Deep</span><div style="flex:1;height:9px;background:#EDE0D4;border-radius:3px;overflow:hidden;"><div style="width:30%;height:100%;background:#9B6B9A;border-radius:3px;margin-left:35%;"></div></div></div>
          <div style="display:flex;align-items:center;gap:4px;"><span style="font-size:7px;color:#B8A898;width:28px;">REM</span><div style="flex:1;height:9px;background:#EDE0D4;border-radius:3px;overflow:hidden;"><div style="width:30%;height:100%;background:#C4622D;border-radius:3px;"></div></div></div>
        </div>
        <div style="background:#EDE0D4;border-radius:8px;padding:8px;border:1px solid #DDD0C3;">
          <div style="font-size:8px;font-weight:600;color:#C4622D;margin-bottom:2px;">✦ Lune noticed</div>
          <div style="font-size:7px;color:#9A8878;line-height:1.55;font-style:italic;">Deep sleep peaked in the first 3 hrs — classic pattern when you skip late screens.</div>
        </div>
      </div>
      <div class="screen-label">Last Night ✦</div>
    </div>
    <div class="phone-frame">
      <div style="background:#FAF4ED;padding:16px;border-radius:22px;min-height:200px;">
        <div style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#2B1A0C;">Insights</div>
        <div style="font-size:8px;color:#B8A898;font-style:italic;margin-bottom:10px;">Lune's observations</div>
        <div style="background:#F3EAE0;border-radius:10px;padding:10px;border:1px solid #DDD0C3;margin-bottom:6px;">
          <div style="font-size:8px;color:#B8A898;margin-bottom:2px;letter-spacing:.4px;">WEEK OF APR 1–7</div>
          <div style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#2B1A0C;line-height:1.3;margin-bottom:4px;">A week of returning rhythm.</div>
          <div style="font-size:7px;color:#9A8878;line-height:1.55;font-style:italic;">HRV trended upward all week — your nervous system finding its cadence.</div>
        </div>
        <div style="background:#F3EAE0;border-radius:8px;padding:8px;border:1px solid #DDD0C3;margin-bottom:4px;">
          <div style="font-size:8px;font-weight:600;color:#2B1A0C;margin-bottom:2px;">∿ Chronotype is shifting</div>
          <div style="font-size:7px;color:#9A8878;font-style:italic;">22 min later over 3 weeks. Spring circadian drift.</div>
        </div>
        <div style="background:#F3EAE0;border-radius:8px;padding:8px;border:1px solid #DDD0C3;">
          <div style="font-size:8px;font-weight:600;color:#2B1A0C;margin-bottom:2px;">⚡ Caffeine half-life noted</div>
          <div style="font-size:7px;color:#9A8878;font-style:italic;">Coffee after 1pm → deep sleep -18%.</div>
        </div>
      </div>
      <div class="screen-label">Insights</div>
    </div>
  </div>

  <section id="features">
    <div class="section-eyebrow">What Lune does</div>
    <h2 class="section-title">Sleep should feel known,<br>not measured.</h2>
    <p class="section-sub">Most sleep apps give you numbers. Lune gives you understanding.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon icon-moon" style="font-size:22px;">◐</div>
        <div class="feature-title">Circadian Forecasting</div>
        <div class="feature-body">Lune predicts your optimal sleep window before you reach for the pillow — calibrated to your chronotype, HRV, and life context.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon icon-leaf" style="font-size:22px;">∿</div>
        <div class="feature-title">Sleep Architecture</div>
        <div class="feature-body">Visualise your nightly hypnogram. Understand the shape of your sleep, not just its length.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon icon-sun" style="font-size:22px;">✦</div>
        <div class="feature-title">Proactive AI Insights</div>
        <div class="feature-body">Lune writes you weekly observations — like margin notes from someone who's been paying attention. Correlation, not prescription.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon icon-stars" style="font-size:22px;">○</div>
        <div class="feature-title">Evening Ritual Protocol</div>
        <div class="feature-body">A personalised wind-down sequence with box breathing, timestamped prompts, and a gentle countdown to your sleep window.</div>
      </div>
    </div>
  </section>

  <section id="insights">
    <div class="section-eyebrow">AI Insights</div>
    <h2 class="section-title">Observations,<br>not notifications.</h2>
    <p class="section-sub">Lune reads your sleep the way a thoughtful clinician would — over time, in context, without alarm.</p>
    <div class="insight-panel">
      <div style="font-size:10px;color:#9A8878;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px;">Week of Apr 1–7</div>
      <div style="font-family:'Lora',serif;font-size:22px;font-weight:700;line-height:1.3;margin-bottom:8px;">A week of returning rhythm.</div>
      <div style="font-size:13px;color:#9A8878;font-style:italic;font-family:'Lora',serif;line-height:1.7;margin-bottom:24px;">You averaged 7h 50m with only 2 disrupted nights. Your HRV trended upward all week — a signal your nervous system is finding its cadence again.</div>
      <div class="insight-grid">
        <div class="insight-item"><div class="insight-title">Your chronotype is shifting</div><div class="insight-body">Optimal sleep onset moved 22 min later over 3 weeks. Circadian drift — common in spring.</div></div>
        <div class="insight-item"><div class="insight-title">HRV recovery improving</div><div class="insight-body">Post-exercise HRV dip now resolves by midnight, down from 2am. Your recovery window is tightening.</div></div>
        <div class="insight-item"><div class="insight-title">Caffeine half-life noted</div><div class="insight-body">Coffee after 1pm → deep sleep drops 18%. Your sensitivity is above average.</div></div>
        <div class="insight-item"><div class="insight-title">Weekend anchor effect</div><div class="insight-body">Saturday late nights cost an average 1.4 days of recovery. Worth protecting Sundays.</div></div>
      </div>
    </div>
  </section>

  <section id="design">
    <div class="design-notes">
      <div class="section-eyebrow">Design Notes</div>
      <h2 class="section-title" style="font-size:28px;">Warm Humanistic AI — by RAM</h2>
      <p style="font-size:14px;color:var(--muted);font-style:italic;font-family:'Lora',serif;line-height:1.7;max-width:560px;margin-bottom:28px;">Inspired by Dawn (joindawn.com, featured on Lapa Ninja) — their warm cream background, Source Serif Pro typography, and earth-tone text showed how AI wellness products can feel genuinely human rather than clinical.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">
        <div style="padding:16px;background:var(--bg);border-radius:14px;border:1px solid var(--border);">
          <div style="font-size:11px;font-weight:600;color:var(--muted);margin-bottom:10px;letter-spacing:.05em;">PALETTE</div>
          <div class="palette-chips">
            <div class="palette-chip" style="background:#FAF4ED;" title="Warm cream bg"></div>
            <div class="palette-chip" style="background:#2B1A0C;" title="Rich dark brown"></div>
            <div class="palette-chip" style="background:#C4622D;" title="Terracotta accent"></div>
            <div class="palette-chip" style="background:#7B9E87;" title="Sage green"></div>
            <div class="palette-chip" style="background:#9B6B9A;" title="Dusty lavender"></div>
          </div>
        </div>
        <div style="padding:16px;background:var(--bg);border-radius:14px;border:1px solid var(--border);">
          <div style="font-size:11px;font-weight:600;color:var(--muted);margin-bottom:8px;letter-spacing:.05em;">TYPOGRAPHY</div>
          <div style="font-family:'Lora',serif;font-size:15px;font-weight:700;color:var(--fg);">Lora — headings</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">Inter — UI data</div>
          <div style="font-family:'Lora',serif;font-size:12px;font-style:italic;color:var(--muted);margin-top:2px;">Lora italic — insights</div>
        </div>
        <div style="padding:16px;background:var(--bg);border-radius:14px;border:1px solid var(--border);">
          <div style="font-size:11px;font-weight:600;color:var(--muted);margin-bottom:8px;letter-spacing:.05em;">SCREENS</div>
          <div style="font-size:12px;color:var(--fg);line-height:1.6;">Tonight · Last Night · Patterns · Insights · Wind Down · Onboarding</div>
        </div>
      </div>
    </div>
  </section>

  <div class="cta-section">
    <div class="cta-inner">
      <div class="cta-moon">◐</div>
      <h2 class="cta-title">Better sleep begins<br>with honest attention.</h2>
      <p class="cta-sub">Explore the prototype. Every screen is interactive.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="/lune-viewer" class="btn-primary">◐ View Prototype</a>
        <a href="/lune-mock" class="btn-ghost">Interactive Mock ☀◑</a>
      </div>
      <p style="font-size:12px;color:var(--muted);margin-top:16px;">A design exploration by RAM · April 2026</p>
    </div>
  </div>

  <div class="footer">Designed by <a href="https://ram.zenbin.org">RAM Design AI</a> · Warm Humanistic AI aesthetic · April 2026</div>
</body>
</html>`;

function buildViewer() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/lune.pen', 'utf8');
  const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';<\/script>';
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function run() {
  console.log('── Lune Design Discovery Pipeline ──\n');

  console.log('Publishing hero page...');
  const heroRes = await zenPut(SLUG, 'Lune — ' + TAGLINE, heroHtml);
  console.log('  hero:', heroRes.status, heroRes.status === 200 ? 'OK' : heroRes.body.slice(0,120));

  console.log('Publishing viewer...');
  const viewerHtml = buildViewer();
  const viewerRes = await zenPut(SLUG + '-viewer', 'Lune — Prototype Viewer', viewerHtml);
  console.log('  viewer:', viewerRes.status, viewerRes.status === 200 ? 'OK' : viewerRes.body.slice(0,120));

  console.log('\nHero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

run().catch(console.error);
