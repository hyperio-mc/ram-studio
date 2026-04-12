/**
 * HARVEST — publish pipeline
 * RAM Design Heartbeat · March 2026
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG      = 'harvest';
const APP_NAME  = 'HARVEST';
const TAGLINE   = 'Freelance Financial Intelligence';
const ARCHETYPE = 'fintech';
const PROMPT    = 'Design a freelance financial intelligence app for independent creatives — invoices, time tracking, client health, income analytics. Light theme: warm parchment (#FAF8F3), copper accent (#C4612A), editorial serif headlines. Inspired by Midday.ai one-person company aesthetic and Typeform editorial off-white SaaS from land-book and Dark Mode Design.';

// ── ZenBin helper ─────────────────────────────────────────────────────────────
function zenPost(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify({ title, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': payload.length,
        'X-Subdomain':    'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) resolve({ ok: true, status: res.statusCode });
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── GitHub helper ─────────────────────────────────────────────────────────────
function ghReq(opts, body) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Hero page
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1/5] Building hero page…');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HARVEST — Freelance Financial Intelligence</title>
<meta name="description" content="Financial clarity for independent creatives. Invoices, time tracking, client health, and income analytics in one warm, editorial interface.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #FAF8F3;
    --surface: #FFFFFF;
    --surface2:#F3F1EA;
    --border:  #E6E2D7;
    --text:    #1C1916;
    --muted:   #7A7063;
    --accent:  #C4612A;
    --accent2: #E8A44E;
    --green:   #2E7D52;
    --red:     #C13333;
    --purple:  #5C4FA0;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(250,248,243,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 900;
    color: var(--text);
    letter-spacing: -0.5px;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    font-size: 13px; color: var(--muted); text-decoration: none;
    transition: color .15s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: white;
    padding: 9px 22px; border-radius: 22px;
    font-size: 13px; font-weight: 600;
    text-decoration: none; transition: opacity .15s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    max-width: 900px; margin: 0 auto;
    padding: 100px 40px 60px;
    text-align: center;
  }
  .hero-eyebrow {
    display: inline-block;
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: var(--accent); text-transform: uppercase;
    background: var(--accent)14;
    border: 1px solid var(--accent)44;
    padding: 5px 14px; border-radius: 99px;
    margin-bottom: 32px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(48px, 8vw, 80px);
    font-weight: 900;
    line-height: 1.06;
    letter-spacing: -1.5px;
    color: var(--text);
    margin-bottom: 24px;
  }
  .hero h1 em {
    font-style: italic;
    color: var(--accent);
  }
  .hero-sub {
    font-size: 18px; color: var(--muted);
    max-width: 560px; margin: 0 auto 44px;
    line-height: 1.65;
    font-weight: 300;
  }
  .hero-actions {
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    margin-bottom: 64px;
  }
  .btn-primary {
    background: var(--accent); color: white;
    padding: 14px 32px; border-radius: 99px;
    font-size: 14px; font-weight: 600;
    text-decoration: none; transition: opacity .15s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    background: var(--surface); color: var(--text);
    padding: 14px 32px; border-radius: 99px;
    font-size: 14px; font-weight: 500;
    text-decoration: none; border: 1px solid var(--border);
    transition: border-color .15s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* ── PHONE MOCKUP ── */
  .phone-wrap {
    display: flex; justify-content: center; gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 80px;
  }
  .phone {
    width: 200px;
    background: var(--surface);
    border-radius: 28px;
    border: 1px solid var(--border);
    padding: 16px 12px;
    box-shadow: 0 20px 60px rgba(28,25,22,0.1), 0 4px 16px rgba(28,25,22,0.06);
    transform: translateY(0);
    transition: transform .3s ease;
  }
  .phone:hover { transform: translateY(-6px); }
  .phone.center {
    transform: translateY(-16px);
    box-shadow: 0 32px 80px rgba(196,97,42,0.15), 0 8px 24px rgba(28,25,22,0.1);
  }
  .phone.center:hover { transform: translateY(-22px); }
  .phone-label {
    font-size: 9px; font-weight: 700; letter-spacing: 1.2px;
    color: var(--muted); text-transform: uppercase;
    text-align: center; margin-bottom: 10px;
  }
  .phone-screen {
    background: var(--bg);
    border-radius: 16px;
    padding: 12px 10px;
    min-height: 280px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  /* Screen content: Overview */
  .psc-greeting { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .psc-sub { font-size: 8px; color: var(--muted); margin-bottom: 10px; font-style: italic; }
  .psc-hero-card {
    background: var(--surface); border-radius: 10px;
    border: 1px solid var(--border);
    padding: 10px; margin-bottom: 8px;
    box-shadow: 0 2px 8px rgba(28,25,22,0.05);
  }
  .psc-label { font-size: 7px; color: var(--muted); margin-bottom: 2px; letter-spacing: 0.5px; }
  .psc-amount { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--text); }
  .psc-trend { display: inline-block; background: #2E7D5218; color: var(--green); font-size: 7px; font-weight: 700; padding: 2px 6px; border-radius: 8px; margin-left: 4px; }
  .psc-bars { display: flex; align-items: flex-end; gap: 2px; height: 20px; margin-top: 6px; }
  .psc-bar { flex: 1; background: var(--accent); border-radius: 1px; opacity: 0.6; }
  .psc-stat-row { display: flex; gap: 4px; margin-bottom: 6px; }
  .psc-stat {
    flex: 1; background: var(--surface); border-radius: 7px; border: 1px solid var(--border);
    padding: 6px 5px;
  }
  .psc-stat-val { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; }
  .psc-stat-l { font-size: 6px; color: var(--muted); }
  .psc-inv-row {
    background: var(--surface); border-radius: 7px; border: 1px solid var(--border);
    padding: 6px 7px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;
  }
  .psc-inv-client { font-size: 8px; font-weight: 600; color: var(--text); }
  .psc-inv-status { font-size: 6.5px; font-weight: 600; padding: 1px 5px; border-radius: 4px; }
  .status-paid { background: #2E7D5218; color: var(--green); }
  .status-sent { background: #5C4FA018; color: var(--purple); }
  .status-over { background: #C1333318; color: var(--red); }
  .psc-inv-amt { font-size: 9px; font-weight: 700; font-family: 'Playfair Display', serif; }

  /* Screen content: Time */
  .psc-accent-card {
    background: var(--accent); border-radius: 10px;
    padding: 10px; margin-bottom: 8px; color: white;
  }
  .psc-accent-card .psc-label { color: rgba(255,255,255,0.65); }
  .psc-accent-card .psc-amount { color: white; font-size: 18px; }
  .psc-day-bars { display: flex; align-items: flex-end; gap: 3px; height: 40px; margin-bottom: 8px; }
  .psc-day-col { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .psc-day-bar { width: 100%; border-radius: 2px; }
  .psc-day-l { font-size: 5.5px; color: var(--muted); margin-top: 2px; }
  .psc-project-row {
    background: var(--surface); border-radius: 7px; border: 1px solid var(--border);
    padding: 6px 7px; margin-bottom: 4px;
    display: flex; align-items: center; gap: 5px;
  }
  .psc-project-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .psc-project-name { font-size: 8px; font-weight: 600; color: var(--text); flex: 1; }
  .psc-project-h { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; }

  /* ── FEATURES ── */
  .features {
    max-width: 900px; margin: 0 auto;
    padding: 80px 40px;
  }
  .section-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    color: var(--accent); text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 4vw, 44px); font-weight: 700;
    color: var(--text); letter-spacing: -0.5px;
    margin-bottom: 12px; line-height: 1.15;
  }
  .section-sub {
    font-size: 15px; color: var(--muted); max-width: 480px;
    margin-bottom: 56px; font-weight: 300;
  }
  .feature-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
  .feature-card {
    background: var(--surface); border-radius: 16px;
    border: 1px solid var(--border);
    padding: 28px;
    transition: box-shadow .2s, transform .2s;
  }
  .feature-card:hover {
    box-shadow: 0 12px 40px rgba(28,25,22,0.08);
    transform: translateY(-2px);
  }
  .feature-icon {
    width: 40px; height: 40px;
    background: var(--accent)14;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 18px;
  }
  .feature-icon.green { background: #2E7D5214; }
  .feature-icon.purple { background: #5C4FA014; }
  .feature-icon.gold { background: #E8A44E14; }
  .feature-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 700; color: var(--text);
    margin-bottom: 10px;
  }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* ── STATS ── */
  .stats-bar {
    background: var(--accent);
    padding: 48px 40px;
    text-align: center;
  }
  .stats-bar h2 {
    font-family: 'Playfair Display', serif;
    font-size: 13px; font-weight: 400; font-style: italic;
    color: rgba(255,255,255,0.75);
    margin-bottom: 36px;
  }
  .stats-grid {
    max-width: 800px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 32px;
  }
  .stat-item { color: white; }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 40px; font-weight: 900; display: block;
    letter-spacing: -1px; line-height: 1;
    margin-bottom: 6px;
  }
  .stat-label { font-size: 12px; opacity: 0.7; font-weight: 300; }

  /* ── QUOTE ── */
  .quote-section {
    max-width: 700px; margin: 80px auto;
    padding: 0 40px; text-align: center;
  }
  .quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: 80px; color: var(--accent); opacity: 0.2;
    line-height: 0.5; display: block; margin-bottom: 20px;
  }
  blockquote {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 3vw, 24px); font-style: italic;
    color: var(--text); line-height: 1.55;
    margin-bottom: 24px;
  }
  .quote-attr {
    font-size: 13px; color: var(--muted);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .quote-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border); }

  /* ── DESIGN META ── */
  .design-meta {
    max-width: 900px; margin: 0 auto;
    padding: 60px 40px;
    border-top: 1px solid var(--border);
  }
  .meta-title {
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    color: var(--muted); text-transform: uppercase; margin-bottom: 32px;
  }
  .meta-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .meta-card {
    background: var(--surface); border-radius: 12px;
    border: 1px solid var(--border);
    padding: 20px;
  }
  .meta-card-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; color: var(--muted); margin-bottom: 8px; }
  .meta-card-val { font-size: 13px; color: var(--text); line-height: 1.5; }
  .palette-row { display: flex; gap: 6px; margin-top: 8px; }
  .swatch {
    width: 24px; height: 24px; border-radius: 6px;
    border: 1px solid var(--border);
    cursor: help;
    transition: transform .2s;
  }
  .swatch:hover { transform: scale(1.2); }
  .insp-quote {
    background: var(--accent)0C;
    border-left: 3px solid var(--accent);
    border-radius: 0 8px 8px 0;
    padding: 16px 20px;
    font-size: 12px; color: var(--muted);
    line-height: 1.7;
    grid-column: 1 / -1;
  }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 40px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
    max-width: 900px; margin: 0 auto;
  }
  .footer-brand {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700; color: var(--text);
  }
  .footer-brand span { color: var(--accent); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--accent); }
  .footer-tag { font-size: 11px; color: var(--muted); font-style: italic; }

  @media (max-width: 640px) {
    nav { padding: 0 20px; }
    .hero, .features, .quote-section, .design-meta, footer { padding-left: 20px; padding-right: 20px; }
    .hero h1 { font-size: 40px; }
    .phone-wrap { gap: 12px; }
    .phone { width: 160px; }
    .stats-bar { padding: 40px 20px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">HAR<span>VEST</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/harvest-viewer">Pen Viewer</a>
    <a href="https://ram.zenbin.org/harvest-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-eyebrow">RAM Design Heartbeat · March 2026</div>
  <h1>Financial clarity<br>for the <em>new wave</em><br>of independents.</h1>
  <p class="hero-sub">Invoices, time tracking, client health, and income analytics — designed for one-person creative businesses. Warm. Editorial. Yours.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/harvest-mock" class="btn-primary">Explore Interactive Mock →</a>
    <a href="https://ram.zenbin.org/harvest-viewer" class="btn-secondary">View .pen file</a>
  </div>
</section>

<!-- Phone mockups -->
<div class="phone-wrap" id="screens">

  <!-- Screen 1: Overview -->
  <div class="phone">
    <div class="phone-label">Overview</div>
    <div class="phone-screen">
      <div class="psc-sub" style="font-family:'Playfair Display',serif;">Good morning,</div>
      <div class="psc-greeting">Naomi.</div>
      <div style="display:flex;gap:3px;margin:6px 0 8px;">
        ${['Week','Month','Qtr','Year'].map((t,i)=>`<div style="flex:1;text-align:center;background:${i===1?'var(--accent)':'var(--surface)'};color:${i===1?'white':'var(--muted)'};border-radius:99px;font-size:6.5px;padding:3px 0;border:1px solid ${i===1?'var(--accent)':'var(--border)'};">${t}</div>`).join('')}
      </div>
      <div class="psc-hero-card">
        <div class="psc-label">Total earned</div>
        <div style="display:flex;align-items:baseline;gap:4px;">
          <div class="psc-amount">$14,820</div>
          <div class="psc-trend">↑ 18%</div>
        </div>
        <div class="psc-bars">
          ${[38,21,42,35,51,29,48].map((v,i)=>`<div class="psc-bar" style="height:${v/51*100}%;opacity:${0.3+v/51*0.7};background:${i===6?'var(--accent)':'var(--border)'};"></div>`).join('')}
        </div>
      </div>
      <div class="psc-stat-row">
        <div class="psc-stat"><div class="psc-stat-l">Invoiced</div><div class="psc-stat-val" style="color:var(--purple)">$4.2K</div></div>
        <div class="psc-stat"><div class="psc-stat-l">Overdue</div><div class="psc-stat-val" style="color:var(--red)">$1.4K</div></div>
        <div class="psc-stat"><div class="psc-stat-l">Hours</div><div class="psc-stat-val" style="color:var(--accent)">24h</div></div>
      </div>
      ${[
        {c:'Horizon Studio', s:'Paid', sc:'status-paid', a:'$2,400'},
        {c:'Luminary Labs',  s:'Sent', sc:'status-sent', a:'$1,800'},
        {c:'Cedar & Grain', s:'Overdue',sc:'status-over',a:'$1,400'},
      ].map(inv=>`
      <div class="psc-inv-row">
        <div>
          <div class="psc-inv-client">${inv.c}</div>
          <div class="psc-inv-status ${inv.sc}">${inv.s}</div>
        </div>
        <div class="psc-inv-amt">${inv.a}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Screen 3: Time (center, featured) -->
  <div class="phone center">
    <div class="phone-label">Time Tracker</div>
    <div class="phone-screen">
      <div class="psc-greeting" style="margin-bottom:2px;">Time</div>
      <div class="psc-sub" style="font-family:'Playfair Display',serif;margin-bottom:8px;">Week of Mar 17</div>
      <div class="psc-accent-card">
        <div class="psc-label">This week</div>
        <div class="psc-amount">24h 15m</div>
        <div style="font-size:7px;color:rgba(255,255,255,0.6);margin-top:2px;">billable · +3h vs last week</div>
      </div>
      <div class="psc-day-bars" style="margin-bottom:4px;">
        ${[
          {d:'M',h:6.5,isToday:false},{d:'T',h:4.0,isToday:false},{d:'W',h:7.0,isToday:false},
          {d:'Th',h:3.0,isToday:true},{d:'F',h:5.5,isToday:false},{d:'S',h:1.5,isToday:false},{d:'Su',h:0,isToday:false},
        ].map(day=>`
        <div class="psc-day-col">
          <div class="psc-day-bar" style="height:${(day.h/7)*40}px;background:${day.isToday?'var(--accent)':'var(--border)'};border-radius:2px 2px 0 0;"></div>
          <div class="psc-day-l" style="color:${day.isToday?'var(--accent)':'var(--muted)'};">${day.d}</div>
        </div>`).join('')}
      </div>
      ${[
        {name:'Horizon Studio',color:'var(--accent)',h:'11.5h'},
        {name:'Luminary Labs',color:'var(--purple)',h:'6.25h'},
        {name:'Cedar & Grain',color:'var(--green)',h:'4.5h'},
        {name:'Moonveil',color:'var(--accent2)',h:'2h'},
      ].map(p=>`
      <div class="psc-project-row">
        <div class="psc-project-dot" style="background:${p.color};"></div>
        <div class="psc-project-name">${p.name}</div>
        <div class="psc-project-h" style="color:${p.color};">${p.h}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Screen 5: Reports -->
  <div class="phone">
    <div class="phone-label">Reports</div>
    <div class="phone-screen">
      <div class="psc-greeting" style="margin-bottom:2px;">Reports</div>
      <div class="psc-sub" style="font-family:'Playfair Display',serif;margin-bottom:8px;">March 2026</div>
      <div class="psc-hero-card" style="margin-bottom:8px;">
        <div class="psc-label">Net income</div>
        <div class="psc-amount" style="font-size:18px;">$14,820</div>
        <div style="display:flex;gap:4px;margin-top:6px;">
          ${[
            {label:'Design',color:'var(--accent)',pct:'57%'},
            {label:'Dev',color:'var(--purple)',pct:'28%'},
            {label:'Consult',color:'var(--green)',pct:'12%'},
            {label:'Other',color:'var(--accent2)',pct:'3%'},
          ].map(s=>`<div style="flex:${parseFloat(s.pct)};height:6px;background:${s.color};border-radius:3px;opacity:0.8;" title="${s.label}: ${s.pct}"></div>`).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
          ${['Design 57%','Dev 28%','Consult 12%'].map((l,i)=>`<div style="display:flex;align-items:center;gap:2px;font-size:6px;color:var(--muted)"><div style="width:5px;height:5px;border-radius:50%;background:${['var(--accent)','var(--purple)','var(--green)'][i]};"></div>${l}</div>`).join('')}
        </div>
      </div>
      <div style="font-size:7px;font-weight:700;letter-spacing:1px;color:var(--muted);margin-bottom:6px;">6-MONTH TREND</div>
      <div style="display:flex;align-items:flex-end;gap:2px;height:44px;margin-bottom:8px;">
        ${[8200,9800,7400,11200,12600,14820].map((v,i)=>`
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;">
          <div style="width:100%;height:${Math.round((v/16000)*40)}px;background:${i===5?'var(--accent)':'var(--green)'};border-radius:2px 2px 0 0;opacity:${0.5+i/5*0.5};"></div>
          <div style="font-size:5px;color:var(--muted);">${['O','N','D','J','F','M'][i]}</div>
        </div>`).join('')}
      </div>
      ${[
        {label:'Net profit',val:'$12,720',c:'var(--green)'},
        {label:'Avg invoice',val:'$2,350',c:'var(--text)'},
        {label:'Tax est.',val:'$3,180',c:'var(--accent)'},
      ].map(k=>`
      <div class="psc-inv-row">
        <div class="psc-inv-client">${k.label}</div>
        <div class="psc-inv-amt" style="color:${k.c};">${k.val}</div>
      </div>`).join('')}
    </div>
  </div>

</div>

<!-- Features -->
<section class="features" id="features">
  <div class="section-eyebrow">What's inside</div>
  <h2 class="section-title">Built for how<br>creatives actually work.</h2>
  <p class="section-sub">Not accounting software. Not a spreadsheet. A focused tool that understands project-based income.</p>

  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">✉</div>
      <div class="feature-title">Smart Invoicing</div>
      <p class="feature-desc">Draft, send, and track invoices with automatic overdue detection, payment status heat indicators, and one-tap reminders.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--green)14;">◷</div>
      <div class="feature-title">Billable Time</div>
      <p class="feature-desc">Log hours per project with weekly bar breakdowns. See which clients are eating your hours vs. paying your rate.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--purple)14;">◉</div>
      <div class="feature-title">Client Health</div>
      <p class="feature-desc">A revenue and relationship score for each client — so you know who to grow, who to reprice, and who to let go.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--accent2)14;">▦</div>
      <div class="feature-title">Income Analytics</div>
      <p class="feature-desc">Monthly breakdowns by service type, 6-month trend bars, net profit, and an auto-calculated quarterly tax estimate.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Morning Digest</div>
      <p class="feature-desc">A personalised greeting with the three things that matter most today — overdue invoices, upcoming deadlines, and unpaid hours.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--green)14;">↑</div>
      <div class="feature-title">Export & Tax</div>
      <p class="feature-desc">One-tap quarterly exports and an always-visible tax estimate based on your current net income and local rate.</p>
    </div>
  </div>
</section>

<!-- Stats bar -->
<div class="stats-bar">
  <h2>Designed for the one-person studio.</h2>
  <div class="stats-grid">
    <div class="stat-item"><span class="stat-num">5</span><div class="stat-label">screens</div></div>
    <div class="stat-item"><span class="stat-num">459</span><div class="stat-label">total nodes</div></div>
    <div class="stat-item"><span class="stat-num">light</span><div class="stat-label">theme mode</div></div>
    <div class="stat-item"><span class="stat-num">4</span><div class="stat-label">font families</div></div>
  </div>
</div>

<!-- Quote -->
<div class="quote-section">
  <span class="quote-mark">"</span>
  <blockquote>For the new wave of one-person companies — financial clarity shouldn't require an accountant.</blockquote>
  <div class="quote-attr">
    <div class="quote-dot"></div>
    <span>Inspired by Midday.ai · Seen on Dark Mode Design</span>
    <div class="quote-dot"></div>
  </div>
</div>

<!-- Design meta -->
<div class="design-meta">
  <div class="meta-title">Design System Details</div>
  <div class="meta-grid">
    <div class="meta-card">
      <div class="meta-card-label">Archetype</div>
      <div class="meta-card-val">Fintech · Freelance SaaS<br>Editorial Mobile App</div>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Theme</div>
      <div class="meta-card-val">Light · Warm parchment<br>Copper/amber accent</div>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Typography</div>
      <div class="meta-card-val">Playfair Display (serif display)<br>Inter (UI body)</div>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Palette</div>
      <div class="meta-card-val">
        <div class="palette-row">
          <div class="swatch" style="background:#FAF8F3;" title="Background #FAF8F3"></div>
          <div class="swatch" style="background:#FFFFFF;" title="Surface #FFFFFF"></div>
          <div class="swatch" style="background:#1C1916;" title="Text #1C1916"></div>
          <div class="swatch" style="background:#C4612A;" title="Copper #C4612A"></div>
          <div class="swatch" style="background:#E8A44E;" title="Gold #E8A44E"></div>
          <div class="swatch" style="background:#2E7D52;" title="Green #2E7D52"></div>
          <div class="swatch" style="background:#5C4FA0;" title="Purple #5C4FA0"></div>
        </div>
      </div>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Pen Format</div>
      <div class="meta-card-val">v2.8 · 311 KB<br>5 screens · 459 nodes</div>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Screens</div>
      <div class="meta-card-val">Overview · Invoices · Time<br>Clients · Reports</div>
    </div>
    <div class="insp-quote">
      ✦ Inspired by <strong>Midday.ai</strong> (Dark Mode Design / land-book) — the editorial "for the new wave of one-person companies" minimal aesthetic, serif headlines over a product screenshot hero. <strong>Typeform</strong> (land-book) for the warm TWK Lausanne editorial SaaS feel with off-white canvas. <strong>Evervault Customers</strong> (Godly) for the Inter + serif card-grid structure.
    </div>
  </div>
</div>

<footer>
  <div class="footer-brand">HAR<span>VEST</span></div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/harvest-viewer">Pen Viewer</a>
    <a href="https://ram.zenbin.org/harvest-mock">Interactive Mock</a>
  </div>
  <div class="footer-tag">RAM Design Heartbeat · March 2026</div>
</footer>

</body>
</html>`;

await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log(`  ✓ Hero → https://ram.zenbin.org/${SLUG}`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Viewer
// ─────────────────────────────────────────────────────────────────────────────
console.log('[2/5] Building viewer page…');

const penJson  = fs.readFileSync(path.join(__dirname, 'harvest.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HARVEST — Pen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#FAF8F3;color:#1C1916;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 16px}
  .logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#7A7063;margin-bottom:32px;letter-spacing:-0.3px}
  .logo span{color:#C4612A}
  .frame{width:100%;max-width:920px;background:#FFFFFF;border:1px solid #E6E2D7;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(28,25,22,0.08)}
  .chrome{background:#F3F1EA;padding:12px 20px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #E6E2D7}
  .dot{width:10px;height:10px;border-radius:50%}
  .r{background:#C13333}.y{background:#E8A44E}.g{background:#2E7D52}
  .chrome-title{font-family:monospace;font-size:11px;color:#7A7063;margin-left:12px}
  .embed-badge{display:inline-flex;align-items:center;gap:5px;background:#C4612A18;border:1px solid #C4612A44;border-radius:99px;padding:4px 10px;font-size:9px;color:#C4612A;margin-left:auto}
  .screen-tabs{display:flex;gap:0;border-bottom:1px solid #E6E2D7;overflow-x:auto;background:#FAF8F3}
  .tab{padding:10px 20px;font-size:11px;font-weight:600;letter-spacing:.5px;color:#7A7063;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:color .2s}
  .tab.active{color:#C4612A;border-bottom-color:#C4612A}
  .content{padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .info-card{background:#FAF8F3;border:1px solid #E6E2D7;border-radius:10px;padding:16px}
  .info-label{font-size:9px;font-weight:700;letter-spacing:1.5px;color:#7A7063;margin-bottom:8px;text-transform:uppercase}
  .info-val{font-size:13px;color:#1C1916;line-height:1.5}
  .node-list{font-family:monospace;font-size:10px;color:#C4612A;line-height:1.8;max-height:280px;overflow-y:auto}
  .meta-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .meta-card{background:#FAF8F3;border:1px solid #E6E2D7;border-radius:8px;padding:14px;text-align:center}
  .meta-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#C4612A}
  .meta-label{font-size:9px;color:#7A7063;margin-top:3px;letter-spacing:.5px;text-transform:uppercase}
  .inspiration{grid-column:1/-1;background:#C4612A08;border:1px solid #C4612A22;border-left:3px solid #C4612A;border-radius:0 8px 8px 0;padding:16px;font-size:12px;color:#7A7063;line-height:1.6}
  .back{margin-top:24px;color:#7A7063;font-size:12px;text-decoration:none}
  .back:hover{color:#C4612A}
</style>
<script>window.HARVEST_PLACEHOLDER=true;<\/script>
</head>
<body>
<div class="logo">HAR<span>VEST</span> · PEN VIEWER</div>
<div class="frame">
  <div class="chrome">
    <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
    <span class="chrome-title">harvest.pen — v2.8</span>
    <div class="embed-badge">● EMBEDDED</div>
  </div>
  <div class="screen-tabs" id="tabs"></div>
  <div class="content" id="content">
    <div class="meta-grid" id="meta"></div>
    <div class="inspiration" id="insp"></div>
    <div class="info-card" style="grid-column:1/-1"><div class="info-label">Nodes — current screen</div><div class="node-list" id="nodes"></div></div>
  </div>
</div>
<a class="back" href="https://ram.zenbin.org/harvest">← Back to HARVEST hero page</a>
<script>
const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
if (pen) {
  const meta = document.getElementById('meta');
  [
    {v: pen.screens.length, l: 'Screens'},
    {v: pen.screens.reduce((a,s)=>a+s.nodes.length,0), l: 'Total Nodes'},
    {v: pen.meta.theme.mode, l: 'Theme'},
    {v: pen.meta.tags.length, l: 'Tags'},
  ].forEach(({v,l}) => {
    meta.innerHTML += '<div class="meta-card"><div class="meta-val">'+v+'</div><div class="meta-label">'+l+'</div></div>';
  });
  document.getElementById('insp').textContent = '✦ ' + pen.meta.inspiration;
  const tabs = document.getElementById('tabs');
  const nodesEl = document.getElementById('nodes');
  function renderScreen(i) {
    tabs.querySelectorAll('.tab').forEach((t,j) => t.className = 'tab'+(j===i?' active':''));
    const s = pen.screens[i];
    nodesEl.innerHTML = s.nodes.map(n =>
      '  '+n.type.padEnd(14)+' · '+(n.content||'').slice(0,50)
    ).join('<br>');
  }
  pen.screens.forEach((s,i) => {
    const t = document.createElement('div');
    t.className = 'tab'+(i===0?' active':'');
    t.textContent = s.name+' ('+s.nodes.length+')';
    t.onclick = () => renderScreen(i);
    tabs.appendChild(t);
  });
  renderScreen(0);
}
<\/script>
</body>
</html>`;

viewerHtml = viewerHtml.replace('<script>window.HARVEST_PLACEHOLDER=true;<\/script>', injection);
await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
console.log(`  ✓ Viewer → https://ram.zenbin.org/${SLUG}-viewer`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Svelte mock
// ─────────────────────────────────────────────────────────────────────────────
console.log('[3/5] Building Svelte mock…');

const design = {
  appName:   'HARVEST',
  tagline:   'Freelance Financial Intelligence',
  archetype: 'fintech',

  palette: {           // dark mode palette
    bg:      '#1C1916',
    surface: '#2A2520',
    text:    '#F5F1EA',
    accent:  '#D4742E',
    accent2: '#E8A44E',
    muted:   'rgba(245,241,234,0.45)',
  },
  lightPalette: {      // light mode palette
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#C4612A',
    accent2: '#E8A44E',
    muted:   'rgba(28,25,22,0.45)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Good morning, Naomi', value: '$14,820', sub: 'Total earned · March 2026 · ↑ 18% vs February' },
        { type: 'metric-row', items: [
          { label: 'Invoiced',  value: '$4.2K' },
          { label: 'Overdue',   value: '$1.4K' },
          { label: 'This week', value: '24h'   },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Horizon Studio',  sub: 'Invoice #INV-047 · $2,400', badge: 'Paid'    },
          { icon: 'share',    title: 'Luminary Labs',   sub: 'Invoice #INV-046 · $1,800', badge: 'Sent'    },
          { icon: 'alert',    title: 'Cedar & Grain',   sub: 'Invoice #INV-045 · $1,400', badge: 'Overdue' },
          { icon: 'star',     title: 'Moonveil Design', sub: 'Invoice #INV-044 · $3,200', badge: 'Paid'    },
        ]},
        { type: 'progress', items: [
          { label: 'Monthly target ($18K)', pct: 82 },
          { label: 'Invoice collection rate', pct: 79 },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',   value: '6' },
          { label: 'Paid',    value: '2' },
          { label: 'Sent',    value: '2' },
          { label: 'Overdue', value: '2' },
        ]},
        { type: 'tags', label: 'Filter by status', items: ['All', 'Draft', 'Sent', 'Paid', 'Overdue'] },
        { type: 'list', items: [
          { icon: 'check',  title: '#INV-047 · Horizon Studio',  sub: '$2,400 · Due Mar 15 · Paid Mar 18', badge: 'Paid'    },
          { icon: 'share',  title: '#INV-046 · Luminary Labs',   sub: '$1,800 · Due Apr 1',                badge: 'Sent'    },
          { icon: 'alert',  title: '#INV-045 · Cedar & Grain',   sub: '$1,400 · Due Mar 14 · 8 days late', badge: 'Overdue' },
          { icon: 'check',  title: '#INV-044 · Moonveil Design', sub: '$3,200 · Paid Mar 5',               badge: 'Paid'    },
          { icon: 'filter', title: '#INV-043 · Ember Media',     sub: '$900 · Draft',                      badge: 'Draft'   },
          { icon: 'share',  title: '#INV-042 · Kova Digital',    sub: '$4,500 · Due Apr 8',                badge: 'Sent'    },
        ]},
        { type: 'metric', label: 'Total outstanding', value: '$7,700', sub: 'Across 4 open invoices' },
      ],
    },
    {
      id: 'time', label: 'Time',
      content: [
        { type: 'metric', label: 'This week', value: '24h 15m', sub: 'Billable · +3h 30m vs last week' },
        { type: 'progress', items: [
          { label: 'Mon  6.5h', pct: 93 },
          { label: 'Tue  4.0h', pct: 57 },
          { label: 'Wed  7.0h', pct: 100 },
          { label: 'Thu  3.0h', pct: 43 },
          { label: 'Fri  5.5h', pct: 79 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Horizon Studio',  sub: '11.5h · $120/h · $1,380',  badge: '47%' },
          { icon: 'layers',   title: 'Luminary Labs',   sub: '6.25h · $140/h · $875',    badge: '26%' },
          { icon: 'check',    title: 'Cedar & Grain',   sub: '4.5h  · $95/h  · $427',    badge: '19%' },
          { icon: 'zap',      title: 'Moonveil Design', sub: '2.0h  · $110/h · $220',    badge: '8%'  },
        ]},
        { type: 'text', label: 'Billable value this week', value: '$2,902 across 4 active projects · avg $119/h effective rate' },
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',     value: '8'    },
          { label: 'Paused',     value: '2'    },
          { label: 'Total earn', value: '$41K' },
          { label: 'Avg rate',   value: '$118' },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Horizon Studio',  sub: '3 projects · $120/h · $14.2K total', badge: '92%' },
          { icon: 'star',   title: 'Luminary Labs',   sub: '2 projects · $140/h · $8.7K total',  badge: '78%' },
          { icon: 'alert',  title: 'Cedar & Grain',   sub: '1 project  · $95/h  · $5.1K total',  badge: '45%' },
          { icon: 'star',   title: 'Moonveil Design', sub: '4 projects · $110/h · $7.6K total',  badge: '88%' },
          { icon: 'eye',    title: 'Ember Media',     sub: '1 project  · $105/h · $3.2K total',  badge: '60%' },
        ]},
        { type: 'progress', items: [
          { label: 'Horizon Studio health',  pct: 92 },
          { label: 'Luminary Labs health',   pct: 78 },
          { label: 'Cedar & Grain health',   pct: 45 },
          { label: 'Moonveil Design health', pct: 88 },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric', label: 'March 2026 · Total income', value: '$14,820', sub: 'Net profit $12,720 · ↑ 21% vs February' },
        { type: 'progress', items: [
          { label: 'Design · 57%',   pct: 57 },
          { label: 'Dev · 28%',      pct: 28 },
          { label: 'Consult · 12%',  pct: 12 },
          { label: 'Other · 3%',     pct: 3  },
        ]},
        { type: 'metric-row', items: [
          { label: 'Net profit',  value: '$12,720' },
          { label: 'Avg invoice', value: '$2,350'  },
          { label: 'Tax est.',    value: '$3,180'  },
        ]},
        { type: 'text', label: 'Tax note', value: 'Estimated Q1 tax: $3,180 — set aside 25% of net income. Resets April 1.' },
        { type: 'list', items: [
          { icon: 'chart',  title: 'October',  sub: '$8,200 income · $1,200 expenses',  badge: '$7K' },
          { icon: 'chart',  title: 'November', sub: '$9,800 income · $1,400 expenses',  badge: '$8.4K' },
          { icon: 'chart',  title: 'December', sub: '$7,400 income · $900 expenses',    badge: '$6.5K' },
          { icon: 'chart',  title: 'January',  sub: '$11,200 income · $1,600 expenses', badge: '$9.6K' },
          { icon: 'chart',  title: 'February', sub: '$12,600 income · $1,800 expenses', badge: '$10.8K' },
          { icon: 'star',   title: 'March ↑',  sub: '$14,820 income · $2,100 expenses', badge: '$12.7K' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Home',     icon: 'home'     },
    { id: 'invoices', label: 'Invoices', icon: 'share'    },
    { id: 'time',     label: 'Time',     icon: 'calendar' },
    { id: 'clients',  label: 'Clients',  icon: 'user'     },
    { id: 'reports',  label: 'Reports',  icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const mockHtml     = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const mockResult   = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
console.log(`  ✓ Mock → ${mockResult.url}`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Gallery queue
// ─────────────────────────────────────────────────────────────────────────────
console.log('[4/5] Pushing to gallery queue…');

const config   = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN    = config.GITHUB_TOKEN;
const REPO     = config.GITHUB_REPO;

const ghHeaders = {
  'Authorization': `token ${TOKEN}`,
  'User-Agent':    'ram-heartbeat/1.0',
  'Accept':        'application/vnd.github.v3+json',
};

const getRes = await ghReq({
  hostname: 'api.github.com',
  path:     `/repos/${REPO}/contents/queue.json`,
  method:   'GET',
  headers:  ghHeaders,
});

const fileData       = JSON.parse(getRes.body);
const currentSha     = fileData.sha;
const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

let queue = JSON.parse(currentContent);
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const newEntry = {
  id:           `heartbeat-${SLUG}-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      TAGLINE,
  archetype:    ARCHETYPE,
  design_url:   `https://ram.zenbin.org/${SLUG}`,
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       PROMPT,
  screens:      5,
  source:       'heartbeat',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody    = JSON.stringify({
  message: `add: ${APP_NAME} to gallery (heartbeat)`,
  content: newContent,
  sha:     currentSha,
});

const putRes = await ghReq({
  hostname: 'api.github.com',
  path:     `/repos/${REPO}/contents/queue.json`,
  method:   'PUT',
  headers:  { ...ghHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) },
}, putBody);

console.log(`  ✓ Gallery queue → ${putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120)}`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Design DB index
// ─────────────────────────────────────────────────────────────────────────────
console.log('[5/5] Indexing in design DB…');
const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('  ✓ Indexed in design DB');

console.log('\n✦ HARVEST publish complete!');
console.log(`  Hero   → https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock   → https://ram.zenbin.org/${SLUG}-mock`);
