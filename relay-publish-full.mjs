// relay-publish-full.mjs — hero + viewer + mock + gallery + DB for Relay
// Dark terminal-green AI agent orchestration UI

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'relay';
const APP_NAME  = 'RELAY';
const TAGLINE   = 'Route, monitor & inspect your AI agents in real time';
const ARCHETYPE = 'developer-tools';
const PROMPT    = 'Inspired by Neon.com (found via darkmodedesign.com, Mar 30 2026) — deep near-black bg, signature bright terminal-green accent, "Fast Postgres for Teams and Agents" agentic AI framing dominating dev tooling dark UIs. Also Chus Retro OS Portfolio (minimal.gallery, Mar 30 2026) — terminal window chrome aesthetic, monospace as a design element. Land-book.com (Mar 30 2026) — Interfere testing tool shows dark minimal with subtle card grids and status indicators. AI agent orchestration dashboard: monitor, route, and inspect autonomous agents. Novel pattern: agent heartbeat pulse cards + monospace log stream component with terminal chrome. First time using terminal window aesthetic + live-log stream as primary UI element in heartbeat series. Dark theme: space black #0A0C10 + cool surface #111420 + terminal green #00D47A + electric violet #7C5CFC. 5 screens: Dashboard (agent grid + log teaser), Agent Detail (stats + current task + context window), Task Queue (filter tabs + priority task list), Log Stream (terminal chrome + timestamped log lines + level badges), Settings (API keys + model config + toggles).';

// ── Utility ───────────────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, m => {
      let d = ''; m.on('data', c => d += c);
      m.on('end', () => resolve({ status: m.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, html, subDomain = 'ram') {
  const body = Buffer.from(JSON.stringify({ html }));
  try {
    const res = await req({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subDomain,
      },
    }, body);
    if (res.status === 200 || res.status === 201) {
      console.log(`✓ Published ${slug} → https://${subDomain}.zenbin.org/${slug} (${res.status})`);
    } else {
      console.log(`⚠ ZenBin ${res.status} for ${slug}:`, res.body.slice(0,160));
    }
    return `https://${subDomain}.zenbin.org/${slug}`;
  } catch(e) {
    console.log(`✗ Publish failed for ${slug}:`, e.message);
    return `https://${subDomain}.zenbin.org/${slug}`;
  }
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relay — AI Agent Orchestration</title>
<meta name="description" content="Route, monitor and inspect your AI agents in real time. Dark terminal-green UI. A RAM design concept.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ram.zenbin.org/relay">
<meta property="og:title" content="Relay — AI Agent Orchestration">
<meta property="og:description" content="Terminal-green on space black. Monitor 6 agents, stream live logs, manage tasks. Inspired by Neon.com's agentic developer aesthetic.">
<meta property="og:site_name" content="RAM Design Studio">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0C10; --surface: #111420; --raised: #181C2C;
    --deep: #0D0F18; --border: #1E2438; --border2: #252A3E;
    --text: #E2E8F5; --muted: #6B7A99; --dim: #3A4260; --faint: #151829;
    --green: #00D47A; --green2: #00A85F; --greenlt: #001A0F;
    --violet: #7C5CFC; --amber: #F5A623; --coral: #FF5C7A;
    --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;
  }
  html { background: var(--bg); color: var(--text); font-family: var(--sans); }
  body { min-height: 100vh; }

  nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(10,12,16,0.88); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .wordmark { font-family: var(--mono); font-weight: 700; font-size: 20px; color: var(--green); letter-spacing: -0.5px; }
  .wordmark span { color: var(--muted); font-weight: 400; font-size: 11px; margin-left: 6px; }
  .nav-links { display: flex; gap: 28px; }
  nav a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  nav a:hover { color: var(--text); }
  .cta-btn {
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    color: var(--bg); background: var(--green); border-radius: 8px;
    padding: 8px 18px; text-decoration: none; letter-spacing: 0.3px; transition: all .2s;
  }
  .cta-btn:hover { background: #00f58e; box-shadow: 0 0 20px rgba(0,212,122,0.35); }

  .hero {
    padding: 90px 40px 80px; max-width: 860px; margin: 0 auto; text-align: center;
    position: relative;
  }
  .glow-orb {
    position: absolute; width: 600px; height: 400px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,212,122,0.07) 0%, transparent 70%);
    left: 50%; top: 40%; transform: translate(-50%, -50%); pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 11px; font-weight: 600; letter-spacing: 1px;
    color: var(--green); background: var(--greenlt);
    border: 1px solid rgba(0,212,122,0.25); border-radius: 100px;
    padding: 6px 16px; margin-bottom: 32px;
  }
  .hero-badge::before { content: '●'; font-size: 8px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  h1 {
    font-size: clamp(36px, 6vw, 62px); font-weight: 700; line-height: 1.1;
    letter-spacing: -1.5px; margin-bottom: 24px;
  }
  h1 em { color: var(--green); font-style: normal; }
  .hero-sub {
    font-size: 17px; color: var(--muted); line-height: 1.65;
    max-width: 540px; margin: 0 auto 44px;
  }
  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    font-family: var(--mono); font-size: 13px; font-weight: 700; letter-spacing: 0.3px;
    background: var(--green); color: var(--bg); padding: 14px 30px; border-radius: 10px;
    text-decoration: none; transition: all .2s;
  }
  .btn-primary:hover { background: #00f58e; box-shadow: 0 0 30px rgba(0,212,122,0.4); transform: translateY(-1px); }
  .btn-secondary {
    font-family: var(--mono); font-size: 13px; font-weight: 600;
    background: transparent; color: var(--text); padding: 14px 30px; border-radius: 10px;
    border: 1px solid var(--border2); text-decoration: none; transition: all .2s;
  }
  .btn-secondary:hover { border-color: var(--green); color: var(--green); }

  .screens-section { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; }
  .section-label {
    font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 24px; text-align: center;
  }
  .screens-row {
    display: flex; gap: 16px; justify-content: center; overflow-x: auto; padding-bottom: 12px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .screen-card {
    flex: 0 0 168px; height: 306px;
    background: var(--surface); border-radius: 18px; border: 1px solid var(--border);
    overflow: hidden; transition: transform .25s, box-shadow .25s;
  }
  .screen-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,122,0.2); }
  .sc-inner { padding: 12px 10px; height: 100%; }
  .sc-glow { height: 2px; border-radius: 1px; margin-bottom: 10px; }
  .sc-name { font-family: var(--mono); font-size: 8px; color: var(--green); letter-spacing: 0.8px; margin-bottom: 8px; }
  .mini-card { background: var(--raised); border-radius: 6px; padding: 7px 8px; margin-bottom: 6px; }
  .mini-mono { font-family: var(--mono); font-size: 8px; color: var(--muted); line-height: 1.7; }
  .mini-bar-bg { height: 3px; border-radius: 2px; background: var(--dim); margin: 4px 0; overflow: hidden; }
  .mini-bar-fill { height: 100%; border-radius: 2px; }
  .term-bg { background: var(--deep); border-radius: 6px; padding: 8px; margin-bottom: 6px; }

  .features { padding: 80px 40px; max-width: 1000px; margin: 0 auto; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
  .feat {
    background: var(--surface); border-radius: 14px; padding: 24px;
    border: 1px solid var(--border); position: relative; overflow: hidden;
    transition: border-color .2s, transform .2s;
  }
  .feat:hover { border-color: rgba(0,212,122,0.3); transform: translateY(-2px); }
  .feat-top { height: 2px; position: absolute; top: 0; left: 0; right: 0; }
  .feat-icon { font-size: 20px; margin-bottom: 14px; display: block; }
  .feat h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .feat p { font-size: 12px; color: var(--muted); line-height: 1.6; }

  .log-section { max-width: 740px; margin: 0 auto 80px; padding: 0 40px; }
  .term-chrome { background: var(--surface); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
  .tc-top { display: flex; align-items: center; gap: 7px; padding: 10px 16px; background: var(--raised); border-bottom: 1px solid var(--border); }
  .tc-dot { width: 10px; height: 10px; border-radius: 50%; }
  .tc-title { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-left: 8px; }
  .tc-body { padding: 18px 20px; background: var(--deep); }
  .ll { font-family: var(--mono); font-size: 12px; line-height: 1.9; display: flex; gap: 10px; align-items: baseline; }
  .lt { color: var(--dim); white-space: nowrap; }
  .lv { padding: 1px 5px; border-radius: 3px; font-size: 9px; font-weight: 700; white-space: nowrap; }
  .lv-i { background: rgba(107,122,153,0.2); color: var(--muted); }
  .lv-w { background: rgba(245,166,35,0.15); color: var(--amber); }
  .lv-e { background: rgba(255,92,122,0.15); color: var(--coral); }
  .la { color: var(--violet); }
  .lm { color: var(--text); opacity: .85; }
  .lm-ok { color: var(--green); }
  .cursor { animation: blink 1.2s step-end infinite; color: var(--green); }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .stats { display: flex; justify-content: center; gap: 0; max-width: 680px; margin: 0 auto 80px; background: var(--surface); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; padding: 0 30px; }
  .stat { flex: 1; padding: 28px 0; text-align: center; border-right: 1px solid var(--border); }
  .stat:last-child { border-right: none; }
  .sv { font-family: var(--mono); font-size: 28px; font-weight: 700; }
  .sv.g { color: var(--green); }
  .sl { font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: 1px; margin-top: 4px; }

  footer { padding: 28px 40px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto; }
  footer p { font-family: var(--mono); font-size: 11px; color: var(--dim); }
  .fl { display: flex; gap: 18px; }
  .fl a { font-size: 12px; color: var(--muted); text-decoration: none; }
  .fl a:hover { color: var(--green); }

  @media (max-width: 600px) {
    nav, .hero, .screens-section, .features, .log-section { padding-left: 20px; padding-right: 20px; }
    h1 { font-size: 30px; }
    .stats { padding: 0 10px; }
  }
</style>
</head>
<body>

<nav>
  <div class="wordmark">relay <span>v2.4</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#logs">Logs</a>
    <a href="https://ram.zenbin.org/relay-viewer">Design</a>
  </div>
  <a class="cta-btn" href="https://ram.zenbin.org/relay-mock">View Mock →</a>
</nav>

<section class="hero">
  <div class="glow-orb"></div>
  <div class="hero-badge">RELAY · AI AGENT ORCHESTRATION</div>
  <h1>Route, monitor &amp;<br><em>inspect</em> your agents</h1>
  <p class="hero-sub">Real-time visibility into every AI agent running in your stack. Monitor tasks, stream logs, manage API keys, and keep your autonomous workflows running cleanly.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/relay-mock" class="btn-primary">↗ Interactive Mock</a>
    <a href="https://ram.zenbin.org/relay-viewer" class="btn-secondary">View Design File</a>
  </div>
</section>

<div class="screens-section">
  <div class="section-label">5 SCREENS · DARK TERMINAL UI · SPACE BLACK + TERMINAL GREEN</div>
  <div class="screens-row">

    <div class="screen-card">
      <div class="sc-inner">
        <div class="sc-glow" style="background:#00D47A;"></div>
        <div class="sc-name">01 · DASHBOARD</div>
        <div style="display:flex;gap:4px;margin-bottom:7px;">
          <div style="flex:1;background:#181C2C;border-radius:4px;padding:5px 5px;text-align:center;">
            <div style="font-family:monospace;font-size:9px;color:#00D47A;font-weight:700;">6</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">ACTIVE</div>
          </div>
          <div style="flex:1;background:#181C2C;border-radius:4px;padding:5px 5px;text-align:center;">
            <div style="font-family:monospace;font-size:9px;color:#F5A623;font-weight:700;">14</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">QUEUED</div>
          </div>
          <div style="flex:1;background:#181C2C;border-radius:4px;padding:5px 5px;text-align:center;">
            <div style="font-family:monospace;font-size:9px;color:#6B7A99;font-weight:700;">47</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">DONE</div>
          </div>
        </div>
        <div style="background:#181C2C;border-radius:6px;padding:7px;margin-bottom:5px;">
          <div style="font-family:monospace;font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:3px;">researcher-01</div>
          <div style="font-size:8px;color:#6B7A99;margin-bottom:5px;">Scraping product docs</div>
          <div style="background:#3A4260;border-radius:2px;height:3px;"><div style="width:74%;height:100%;border-radius:2px;background:#00D47A;"></div></div>
        </div>
        <div style="background:#181C2C;border-radius:6px;padding:7px;margin-bottom:5px;">
          <div style="font-family:monospace;font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:3px;">writer-02</div>
          <div style="font-size:8px;color:#6B7A99;margin-bottom:5px;">Drafting blog post</div>
          <div style="background:#3A4260;border-radius:2px;height:3px;"><div style="width:41%;height:100%;border-radius:2px;background:#7C5CFC;"></div></div>
        </div>
        <div style="background:#0D0F18;border-radius:6px;padding:7px;">
          <div style="font-family:monospace;font-size:7px;color:#00D47A;margin-bottom:3px;">LOG STREAM ● LIVE</div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;line-height:1.8;">[researcher-01] 12 records fetched<br>[writer-02] token: 847/4096<br>[validator-03] complete ✓</div>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-inner">
        <div class="sc-glow" style="background:#00D47A;"></div>
        <div class="sc-name">02 · AGENT DETAIL</div>
        <div style="background:#181C2C;border-radius:7px;padding:9px;margin-bottom:6px;">
          <div style="font-family:monospace;font-size:8px;color:#E2E8F5;font-weight:700;margin-bottom:2px;">researcher-01</div>
          <div style="font-size:7px;color:#00D47A;margin-bottom:6px;">gpt-4o · Active · 4h 23m</div>
          <div style="display:flex;gap:6px;margin-bottom:6px;">
            <div style="flex:1;text-align:center;"><div style="font-family:monospace;font-size:10px;color:#E2E8F5;font-weight:700;">23</div><div style="font-family:monospace;font-size:7px;color:#6B7A99;">TASKS</div></div>
            <div style="flex:1;text-align:center;"><div style="font-family:monospace;font-size:10px;color:#E2E8F5;font-weight:700;">184K</div><div style="font-family:monospace;font-size:7px;color:#6B7A99;">TOK</div></div>
            <div style="flex:1;text-align:center;"><div style="font-family:monospace;font-size:10px;color:#00D47A;font-weight:700;">0</div><div style="font-family:monospace;font-size:7px;color:#6B7A99;">ERR</div></div>
          </div>
        </div>
        <div style="background:#181C2C;border-radius:7px;padding:9px;border-left:2px solid #00D47A;margin-bottom:6px;">
          <div style="font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:2px;">Scraping product docs</div>
          <div style="font-size:7px;color:#6B7A99;margin-bottom:5px;">#T-204 · 14 min ago</div>
          <div style="background:#3A4260;border-radius:2px;height:3px;"><div style="width:74%;height:100%;border-radius:2px;background:#00D47A;"></div></div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;margin-top:3px;">Step 18/24</div>
        </div>
        <div style="background:#181C2C;border-radius:7px;padding:9px;">
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;margin-bottom:4px;">RECENT TASKS</div>
          <div style="font-size:7px;color:#E2E8F5;line-height:2;">✓ Fetch competitor pricing<br>✓ Summarize changelog v3.1<br>✓ Extract FAQ sections</div>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-inner">
        <div class="sc-glow" style="background:#7C5CFC;"></div>
        <div class="sc-name" style="color:#7C5CFC;">03 · TASK QUEUE</div>
        <div style="display:flex;gap:4px;margin-bottom:8px;">
          <div style="background:#181C2C;border-radius:4px;padding:3px 8px;font-family:monospace;font-size:7px;color:#00D47A;border:1px solid rgba(0,212,122,0.3);">All</div>
          <div style="border-radius:4px;padding:3px 8px;font-family:monospace;font-size:7px;color:#6B7A99;">Pending</div>
          <div style="border-radius:4px;padding:3px 8px;font-family:monospace;font-size:7px;color:#6B7A99;">Active</div>
        </div>
        ${[
          {id:'T-218',t:'Generate API reference docs',s:'active',c:'#7C5CFC',a:'writer-02'},
          {id:'T-219',t:'Validate JSON schemas',s:'pending',c:'#F5A623',a:'validator-03'},
          {id:'T-220',t:'Scrape competitor pricing',s:'pending',c:'#F5A623',a:'researcher-01'},
          {id:'T-221',t:'Summarize user interviews',s:'pending',c:'#3A4260',a:'—'},
        ].map(t => `<div style="background:#181C2C;border-radius:5px;padding:6px;margin-bottom:5px;border-left:2px solid ${t.c};">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
            <span style="font-family:monospace;font-size:7px;color:#6B7A99;">${t.id}</span>
            <span style="font-family:monospace;font-size:7px;color:${t.c};">${t.s==='active'?'▶ run':'○ wait'}</span>
          </div>
          <div style="font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:1px;">${t.t.length>24?t.t.slice(0,24)+'…':t.t}</div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;">${t.a}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-inner" style="background:#0D0F18;">
        <div style="display:flex;gap:4px;align-items:center;background:#111420;border-radius:5px;padding:4px 8px;margin-bottom:8px;">
          <div style="width:7px;height:7px;border-radius:50%;background:#FF5C5C;"></div>
          <div style="width:7px;height:7px;border-radius:50%;background:#FFBF00;"></div>
          <div style="width:7px;height:7px;border-radius:50%;background:#28CA41;"></div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;margin-left:4px;">relay:logs</div>
        </div>
        <div style="font-family:monospace;font-size:8px;line-height:1.9;">
          ${[
            ['09:41:03','INFO','res-01','fetched 12 records','#00D47A'],
            ['09:41:01','INFO','wri-02','token: 847/4096','#E2E8F5'],
            ['09:40:58','INFO','val-03','task complete ✓','#00D47A'],
            ['09:40:52','WARN','wri-02','rate limit 85%','#F5A623'],
            ['09:40:47','INFO','res-01','step 16/24','#E2E8F5'],
            ['09:40:35','ERROR','wri-02','retry 1/3','#FF5C7A'],
            ['09:40:22','INFO','val-03','schema OK','#00D47A'],
            ['09:40:08','WARN','res-01','slow 2400ms','#F5A623'],
          ].map(([t,l,a,m,c]) => `<div><span style="color:#3A4260;">${t} </span><span style="color:${l==='WARN'?'#F5A623':l==='ERROR'?'#FF5C7A':'#6B7A99'};font-size:7px;">[${l}]</span> <span style="color:#7C5CFC;">${a} </span><span style="color:${c};">${m}</span></div>`).join('')}
          <span style="color:#00D47A;">▌</span>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-inner">
        <div class="sc-glow" style="background:#7C5CFC;opacity:0.5;"></div>
        <div class="sc-name">05 · SETTINGS</div>
        <div style="background:#181C2C;border-radius:7px;padding:8px;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:50%;background:#111420;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:8px;color:#00D47A;font-weight:700;">RK</div>
          <div><div style="font-size:8px;color:#E2E8F5;font-weight:600;">Rakis</div><div style="font-size:7px;color:#00D47A;">Pro · 6 agents</div></div>
        </div>
        <div style="font-family:monospace;font-size:7px;color:#6B7A99;margin-bottom:5px;letter-spacing:1px;">API KEYS</div>
        ${['OpenAI','Anthropic','Serper'].map((k,i) => `<div style="background:#181C2C;border-radius:5px;padding:6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:8px;color:#E2E8F5;font-weight:600;">${k}</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">sk-••••${['3f8a','2c1d','1b4e'][i]}</div>
          </div>
          <div style="width:22px;height:12px;border-radius:6px;background:${i<2?'rgba(0,212,122,0.25)':'#3A4260'};position:relative;">
            <div style="width:8px;height:8px;border-radius:50%;background:${i<2?'#00D47A':'#6B7A99'};position:absolute;top:2px;${i<2?'right:2px':'left:2px'};"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>

  </div>
</div>

<section id="features" class="features">
  <div class="section-label" style="margin-bottom:40px;">WHAT'S INSIDE</div>
  <div class="feature-grid">
    <div class="feat">
      <div class="feat-top" style="background:linear-gradient(90deg,#00D47A,transparent);"></div>
      <span class="feat-icon">⬡</span>
      <h3>Agent Grid</h3>
      <p>Every agent's current status, active task, and progress in one glance. Green heartbeat indicators show liveness.</p>
    </div>
    <div class="feat">
      <div class="feat-top" style="background:linear-gradient(90deg,#7C5CFC,transparent);"></div>
      <span class="feat-icon">☰</span>
      <h3>Task Queue</h3>
      <p>Route, prioritize and assign tasks across agents. Filter by status, agent, or priority level.</p>
    </div>
    <div class="feat">
      <div class="feat-top" style="background:linear-gradient(90deg,#00D47A,transparent);"></div>
      <span class="feat-icon">▶</span>
      <h3>Log Stream</h3>
      <p>Terminal-chrome streaming logs from all agents. Filter by INFO / WARN / ERROR. Monospace aesthetic with agent tags.</p>
    </div>
    <div class="feat">
      <div class="feat-top" style="background:linear-gradient(90deg,#F5A623,transparent);"></div>
      <span class="feat-icon">◎</span>
      <h3>Model Config</h3>
      <p>Assign different LLMs per task type. Manage API keys with a toggle. Set retry policies per workspace.</p>
    </div>
  </div>
</section>

<div id="logs" class="log-section">
  <div class="term-chrome">
    <div class="tc-top">
      <div class="tc-dot" style="background:#FF5C5C;"></div>
      <div class="tc-dot" style="background:#FFBF00;"></div>
      <div class="tc-dot" style="background:#28CA41;"></div>
      <div class="tc-title">relay:logs — live stream</div>
    </div>
    <div class="tc-body">
      <div class="ll"><span class="lt">09:41:03</span><span class="lv lv-i">INFO</span><span class="la">researcher-01</span><span class="lm lm-ok">fetched 12 new records from source</span></div>
      <div class="ll"><span class="lt">09:41:01</span><span class="lv lv-i">INFO</span><span class="la">writer-02</span><span class="lm">token usage: 847/4096</span></div>
      <div class="ll"><span class="lt">09:40:58</span><span class="lv lv-i">INFO</span><span class="la">validator-03</span><span class="lm lm-ok">task T-216 complete ✓</span></div>
      <div class="ll"><span class="lt">09:40:52</span><span class="lv lv-w">WARN</span><span class="la">writer-02</span><span class="lm" style="color:var(--amber)">rate limit approaching (85%)</span></div>
      <div class="ll"><span class="lt">09:40:47</span><span class="lv lv-i">INFO</span><span class="la">researcher-01</span><span class="lm">step 16/24 — parsing HTML</span></div>
      <div class="ll"><span class="lt">09:40:35</span><span class="lv lv-e">ERROR</span><span class="la">writer-02</span><span class="lm" style="color:var(--coral)">retry 1/3 after connection timeout</span></div>
      <div class="ll"><span class="lt">09:40:28</span><span class="lv lv-i">INFO</span><span class="la">researcher-01</span><span class="lm">step 14/24 — extracting links</span></div>
      <div class="ll"><span class="lt">09:40:22</span><span class="lv lv-i">INFO</span><span class="la">validator-03</span><span class="lm lm-ok">schema validated OK: user.json</span></div>
      <div class="ll"><span class="lt">09:40:08</span><span class="lv lv-w">WARN</span><span class="la">researcher-01</span><span class="lm" style="color:var(--amber)">slow response — 2400ms</span></div>
      <div class="ll"><span class="lt">09:40:02</span><span class="lv lv-i">INFO</span><span class="la">writer-02</span><span class="lm lm-ok">started task T-218</span></div>
      <div class="ll"><span class="lt">09:39:55</span><span class="lv lv-i">INFO</span><span class="la">researcher-01</span><span class="lm lm-ok">started task T-204</span></div>
      <div class="ll"><span class="lt">_</span><span class="lv" style="opacity:0;">.</span><span class="la" style="opacity:0;">.</span><span class="lm"><span class="cursor">▌</span></span></div>
    </div>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="sv g">6</div><div class="sl">ACTIVE AGENTS</div></div>
  <div class="stat"><div class="sv">14</div><div class="sl">QUEUED TASKS</div></div>
  <div class="stat"><div class="sv g">47</div><div class="sl">TASKS DONE</div></div>
  <div class="stat"><div class="sv">2</div><div class="sl">ERRORS</div></div>
</div>

<footer>
  <p>RAM Design Heartbeat · ram.zenbin.org/relay · Mar 30 2026</p>
  <div class="fl">
    <a href="https://ram.zenbin.org/relay-viewer">Design File</a>
    <a href="https://ram.zenbin.org/relay-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/relay.pen', 'utf8');
const penObj = JSON.parse(penJson);
const screenDescs = [
  'Dashboard — Summary stats bar (6 active / 14 queued / 47 done / 2 errors), agent heartbeat cards with progress bars, live log teaser strip',
  'Agent Detail — Hero card with status ring, uptime + token + task stats row, current task with context window bar, recent task history',
  'Task Queue — Tab filter (All/Pending/Active/Done), priority-tagged task list with agent assignment and status indicators',
  'Log Stream — macOS terminal chrome (traffic light dots), timestamped log lines with INFO/WARN/ERROR level badges + agent name tags, filter bar',
  'Settings — Profile card, API key list with on/off toggles (OpenAI, Anthropic, Serper), model defaults per task type, general preferences',
];
const nodeCount = penObj.nodes ? penObj.nodes.length : 0;

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relay — Pencil Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0A0C10;color:#E2E8F5;font-family:'Inter',sans-serif;min-height:100vh;}
.vn{background:#111420;border-bottom:1px solid #1E2438;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;}
.vl{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:#00D47A;}
.vb{display:flex;gap:10px;}
.vbtn{padding:7px 16px;border-radius:6px;font-size:11px;text-decoration:none;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;}
.vbtn.p{background:#00D47A;color:#0A0C10;font-weight:700;}
.vbtn.g{border:1px solid #1E2438;color:#6B7A99;}
.vbody{max-width:1100px;margin:0 auto;padding:40px 28px;}
.vt{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;margin-bottom:6px;color:#E2E8F5;}
.vs{font-size:13px;color:#6B7A99;margin-bottom:28px;font-family:'JetBrains Mono',monospace;letter-spacing:0.03em;}
.panels{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}
.panel{background:#111420;border-radius:10px;border:1px solid #1E2438;overflow:hidden;}
.ph{padding:10px 14px;border-bottom:1px solid #1E2438;display:flex;align-items:center;justify-content:space-between;}
.pn{font-family:'JetBrains Mono',monospace;font-size:9px;color:#00D47A;font-weight:700;letter-spacing:0.06em;}
.pb{padding:14px;}
.pd{font-size:11px;color:#6B7A99;line-height:1.5;margin-bottom:8px;}
.nc{font-family:'JetBrains Mono',monospace;font-size:9px;color:#3A4260;margin-top:6px;}
.hl{margin-top:24px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#6B7A99;letter-spacing:0.03em;}
.hl a{color:#00D47A;text-decoration:none;}
</style>
<script>
  const penJson = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
</script>
</head>
<body>
<div class="vn">
  <div class="vl">relay</div>
  <div class="vb">
    <a href="https://ram.zenbin.org/relay" class="vbtn g">← Hero</a>
    <a href="https://ram.zenbin.org/relay-mock" class="vbtn p">MOCK ☀◑</a>
  </div>
</div>
<div class="vbody">
  <div class="vt">Relay — Pencil Viewer</div>
  <div class="vs">AI Agent Orchestration · 5 screens · Dark terminal theme · ${nodeCount} nodes</div>
  <div class="panels" id="panels">
    ${screenDescs.map((desc, i) => `
    <div class="panel">
      <div class="ph"><span class="pn">SCREEN ${String(i+1).padStart(2,'0')}</span></div>
      <div class="pb">
        <div class="pd">${desc}</div>
      </div>
    </div>`).join('')}
  </div>
  <div class="hl">AI agent orchestration · dark terminal · <a href="https://ram.zenbin.org/relay">ram.zenbin.org/relay</a></div>
</div>
<script>
if (penJson && penJson.nodes) {
  const panels = document.querySelectorAll('.panel');
  const W = 375, GAP = 80;
  panels.forEach((p, i) => {
    const startX = GAP + i * (W + GAP);
    const endX = startX + W;
    const count = penJson.nodes.filter(n => n.x >= startX && n.x < endX).length;
    const body = p.querySelector('.pb');
    if (body) body.insertAdjacentHTML('beforeend', '<div class="nc">' + count + ' design nodes</div>');
  });
}
</script>
</body>
</html>`;

// Inject embedded pen
const penInjection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', penInjection + '\n<script>');

// Save locally
fs.writeFileSync('/workspace/group/design-studio/relay-hero.html', hero);
fs.writeFileSync('/workspace/group/design-studio/relay-viewer.html', viewerHtml);
console.log('✓ relay-hero.html written');
console.log('✓ relay-viewer.html written');

// ── Svelte Mock ────────────────────────────────────────────────────────────────
console.log('\n🎨 Building Svelte mock…');
const design = {
  appName:   'RELAY',
  tagline:   'Route, monitor & inspect your AI agents',
  archetype: 'developer-tools',
  palette: {
    bg:      '#0A0C10',
    surface: '#111420',
    text:    '#E2E8F5',
    accent:  '#00D47A',
    accent2: '#7C5CFC',
    muted:   'rgba(107,122,153,0.5)',
  },
  lightPalette: {
    bg:      '#F4F6FA',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#00A85F',
    accent2: '#6B46FC',
    muted:   'rgba(13,17,23,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [{ label: 'ACTIVE', value: '6' }, { label: 'QUEUED', value: '14' }, { label: 'DONE', value: '47' }, { label: 'ERRORS', value: '2' }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'researcher-01', sub: 'Scraping product docs · 74%', badge: '● active' },
          { icon: 'activity', title: 'writer-02', sub: 'Drafting blog post · 41%', badge: '● active' },
          { icon: 'alert', title: 'validator-03', sub: 'Awaiting next task', badge: '○ idle' },
        ]},
        { type: 'text', label: 'LOG STREAM', value: '[researcher-01] fetched 12 records\n[writer-02] token: 847/4096\n[validator-03] task complete ✓' },
      ],
    },
    {
      id: 'agent-detail', label: 'Agent Detail',
      content: [
        { type: 'metric', label: 'researcher-01', value: 'Active', sub: 'gpt-4o · Uptime 4h 23m' },
        { type: 'metric-row', items: [{ label: 'TASKS', value: '23' }, { label: 'TOKENS', value: '184K' }, { label: 'ERRORS', value: '0' }] },
        { type: 'progress', items: [{ label: 'Current task — T-204', pct: 74 }, { label: 'Context window', pct: 62 }] },
        { type: 'list', items: [
          { icon: 'check', title: 'T-203', sub: 'Fetch competitor pricing', badge: '✓' },
          { icon: 'check', title: 'T-202', sub: 'Summarize changelog v3.1', badge: '✓' },
          { icon: 'check', title: 'T-201', sub: 'Extract FAQ sections', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'task-queue', label: 'Task Queue',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Pending', 'Active', 'Done'] },
        { type: 'list', items: [
          { icon: 'play', title: 'T-218 — Generate API reference docs', sub: 'writer-02 · HIGH priority', badge: '▶ run' },
          { icon: 'zap', title: 'T-219 — Validate JSON schemas', sub: 'validator-03 · MED', badge: '○ wait' },
          { icon: 'search', title: 'T-220 — Scrape competitor pricing', sub: 'researcher-01 · MED', badge: '○ wait' },
          { icon: 'list', title: 'T-221 — Summarize user interviews', sub: 'Unassigned · LOW', badge: '○ wait' },
          { icon: 'layers', title: 'T-222 — Build knowledge graph', sub: 'Unassigned · HIGH', badge: '○ wait' },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'text', label: 'relay:logs — live', value: '[INFO] researcher-01 · fetched 12 records\n[INFO] writer-02 · token usage 847/4096\n[INFO] validator-03 · task T-216 complete\n[WARN] writer-02 · rate limit 85%\n[INFO] researcher-01 · step 16/24\n[ERROR] writer-02 · retry 1/3 timeout\n[INFO] validator-03 · schema OK: user.json' },
        { type: 'metric-row', items: [{ label: 'INFO', value: '48' }, { label: 'WARN', value: '3' }, { label: 'ERROR', value: '1' }] },
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Account', value: 'Rakis', sub: 'Pro Plan · 6 agents active' },
        { type: 'list', items: [
          { icon: 'code', title: 'OpenAI', sub: 'sk-••••••••••••••3f8a', badge: '● on' },
          { icon: 'code', title: 'Anthropic', sub: 'sk-ant-••••••••••2c1d', badge: '● on' },
          { icon: 'code', title: 'Serper', sub: 'ser-••••••••••••1b4e', badge: '○ off' },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Research tasks', sub: 'gpt-4o', badge: '›' },
          { icon: 'settings', title: 'Writing tasks', sub: 'claude-3.5-sonnet', badge: '›' },
          { icon: 'settings', title: 'Validation', sub: 'gpt-4o-mini', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Agents', icon: 'activity' },
    { id: 'task-queue', label: 'Queue', icon: 'list' },
    { id: 'logs', label: 'Logs', icon: 'play' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

let mockUrl = `https://ram.zenbin.org/${SLUG}-mock`;
try {
  const svelteSource = generateSvelteComponent(design);
  const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
  mockUrl = result.url || mockUrl;
  console.log('Mock live at:', mockUrl);
} catch(e) {
  console.log('⚠ Mock build error:', e.message);
}

// ── Publish hero + viewer ─────────────────────────────────────────────────────
console.log('\n📤 Publishing to ZenBin…');
const heroUrl   = await publishToZenbin(SLUG,             hero,       'ram');
const viewerUrl = await publishToZenbin(SLUG + '-viewer', viewerHtml, 'ram');

// ── Gallery Queue ─────────────────────────────────────────────────────────────
console.log('\n📚 Updating gallery queue…');
try {
  const headers = {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  const g = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers,
  });
  const gj = JSON.parse(g.body);
  let queue = JSON.parse(Buffer.from(gj.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    mock_url: mockUrl,
    submitted_at: now,
    published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
    palette: '#0A0C10 + #111420 + #00D47A + #7C5CFC (Space Black + Surface + Terminal Green + Electric Violet)',
    fonts: 'JetBrains Mono + Inter',
    inspiration: 'Neon.com (darkmodedesign.com, Mar 30 2026) + Chus Retro OS Portfolio (minimal.gallery, Mar 30 2026)',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: encoded,
    sha: gj.sha,
  }));
  const p = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': putBody.length },
  }, putBody);
  const ok = p.status === 200 || p.status === 201;
  console.log(`${ok ? '✓' : '⚠'} Gallery updated (${p.status}) — ${queue.submissions.length} total entries`);
} catch(e) {
  console.log('✗ Gallery update failed:', e.message);
}

// ── Design DB ─────────────────────────────────────────────────────────────────
console.log('\n🗄 Indexing in design DB…');
try {
  const db = openDB();
  upsertDesign(db, {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    mock_url: mockUrl,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  });
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch(e) {
  console.log('⚠ DB index error:', e.message);
}

console.log('\n✅ RELAY publish complete');
console.log(`   Hero:   ${heroUrl}`);
console.log(`   Viewer: ${viewerUrl}`);
console.log(`   Mock:   ${mockUrl}`);
