// relay-publish.js — hero page + viewer for Relay

const https = require('https');
const fs = require('fs');

const SLUG = 'relay';
const SUBDOMAIN = 'ram';
const HOST = `${SUBDOMAIN}.zenbin.org`;

function publish(slug, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html });
    const req = https.request({
      hostname: HOST,
      path: `/${slug}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': SUBDOMAIN,
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relay — AI Agent Orchestration</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0C10; --surface: #111420; --raised: #181C2C;
    --deep: #0D0F18; --border: #1E2438; --border2: #252A3E;
    --text: #E2E8F5; --muted: #6B7A99; --dim: #3A4260; --faint: #151829;
    --green: #00D47A; --green2: #00A85F; --greenlt: #001A0F; --greenglow: rgba(0,212,122,0.13);
    --violet: #7C5CFC; --amber: #F5A623; --coral: #FF5C7A;
    --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;
  }
  html { background: var(--bg); color: var(--text); font-family: var(--sans); }
  body { min-height: 100vh; }

  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(10,12,16,0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .wordmark { font-family: var(--mono); font-weight: 700; font-size: 20px; color: var(--green); letter-spacing: -0.5px; }
  .wordmark span { color: var(--muted); font-weight: 400; font-size: 11px; margin-left: 6px; }
  nav a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  nav a:hover { color: var(--text); }
  .nav-links { display: flex; gap: 28px; }
  .cta-btn {
    font-family: var(--mono); font-size: 12px; font-weight: 600;
    color: var(--bg); background: var(--green);
    border: none; border-radius: 8px; padding: 8px 18px; cursor: pointer;
    transition: all .2s; text-decoration: none; letter-spacing: 0.3px;
  }
  .cta-btn:hover { background: #00f58e; box-shadow: 0 0 20px rgba(0,212,122,0.35); }

  /* ── HERO ── */
  .hero {
    padding: 90px 40px 80px; max-width: 900px; margin: 0 auto; text-align: center;
    position: relative;
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
    font-size: clamp(38px, 6vw, 64px); font-weight: 700; line-height: 1.1;
    letter-spacing: -1.5px; margin-bottom: 24px; color: var(--text);
  }
  h1 em { color: var(--green); font-style: normal; }
  .hero-sub {
    font-size: 17px; color: var(--muted); line-height: 1.65; max-width: 560px;
    margin: 0 auto 44px;
  }
  .hero-actions { display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    font-family: var(--mono); font-size: 13px; font-weight: 700; letter-spacing: 0.3px;
    background: var(--green); color: var(--bg); padding: 14px 30px; border-radius: 10px;
    text-decoration: none; transition: all .2s;
  }
  .btn-primary:hover { background: #00f58e; box-shadow: 0 0 30px rgba(0,212,122,0.4); transform: translateY(-1px); }
  .btn-secondary {
    font-family: var(--mono); font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
    background: transparent; color: var(--text); padding: 14px 30px; border-radius: 10px;
    border: 1px solid var(--border2); text-decoration: none; transition: all .2s;
  }
  .btn-secondary:hover { border-color: var(--green); color: var(--green); }

  /* ── GLOW BG ── */
  .glow-orb {
    position: absolute; width: 600px; height: 400px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,212,122,0.06) 0%, transparent 70%);
    left: 50%; top: 50%; transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* ── MOCKUP STRIP ── */
  .mockup-strip {
    padding: 0 40px 80px; max-width: 1100px; margin: 0 auto;
  }
  .mockup-label {
    font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--muted); text-align: center; margin-bottom: 24px; text-transform: uppercase;
  }
  .screens-row {
    display: flex; gap: 16px; overflow-x: auto; padding-bottom: 12px; justify-content: center;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .screen-card {
    flex: 0 0 160px; height: 292px;
    background: var(--surface); border-radius: 16px;
    border: 1px solid var(--border);
    overflow: hidden; position: relative;
    transition: transform .25s, box-shadow .25s;
  }
  .screen-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,122,0.2); }
  .screen-inner { padding: 12px 10px; height: 100%; position: relative; }
  .screen-glow { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--green); opacity: 0.7; }
  .screen-name { font-family: var(--mono); font-size: 9px; color: var(--green); margin-bottom: 8px; letter-spacing: 0.5px; }
  .mini-stat { display: flex; gap: 6px; margin-bottom: 6px; }
  .mini-bar { height: 3px; border-radius: 2px; background: var(--dim); margin: 4px 0; }
  .mini-bar-fill { height: 100%; border-radius: 2px; }
  .mini-row { height: 10px; border-radius: 3px; background: var(--raised); margin: 3px 0; }
  .mini-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

  /* ── FEATURES ── */
  .features {
    padding: 80px 40px; max-width: 1000px; margin: 0 auto;
  }
  .features-label {
    font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 48px; text-align: center; text-transform: uppercase;
  }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .feature-card {
    background: var(--surface); border-radius: 14px; padding: 28px;
    border: 1px solid var(--border); position: relative; overflow: hidden;
    transition: border-color .2s, transform .2s;
  }
  .feature-card:hover { border-color: rgba(0,212,122,0.3); transform: translateY(-2px); }
  .feature-accent { position: absolute; top: 0; left: 0; width: 100%; height: 2px; }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px;
  }
  .feature-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .feature-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── LOG TEASER ── */
  .log-teaser {
    max-width: 760px; margin: 0 auto 80px; padding: 0 40px;
  }
  .term-chrome {
    background: var(--surface); border-radius: 12px;
    border: 1px solid var(--border); overflow: hidden;
  }
  .term-chrome-top {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px;
    background: var(--raised); border-bottom: 1px solid var(--border);
  }
  .tc-dot { width: 10px; height: 10px; border-radius: 50%; }
  .tc-title { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-left: 8px; }
  .term-body { padding: 20px 20px; background: var(--deep); }
  .log-line { font-family: var(--mono); font-size: 12px; line-height: 1.8; display: flex; gap: 10px; }
  .log-time { color: var(--dim); white-space: nowrap; }
  .log-level { padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; white-space: nowrap; }
  .ll-info { background: rgba(107,122,153,0.2); color: var(--muted); }
  .ll-warn { background: rgba(245,166,35,0.15); color: var(--amber); }
  .ll-error { background: rgba(255,92,122,0.15); color: var(--coral); }
  .log-agent { color: var(--violet); }
  .log-msg { color: var(--text); opacity: 0.85; }
  .log-msg.ok { color: var(--green); }
  .cursor { animation: blink 1.2s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── STATS ── */
  .stats-row {
    display: flex; justify-content: center; gap: 0;
    max-width: 700px; margin: 0 auto 80px;
    background: var(--surface); border-radius: 16px;
    border: 1px solid var(--border); overflow: hidden;
    padding: 0 40px;
  }
  .stat-item {
    flex: 1; padding: 32px 0; text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-val { font-family: var(--mono); font-size: 32px; font-weight: 700; color: var(--text); }
  .stat-val.green { color: var(--green); }
  .stat-lbl { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; margin-top: 4px; }

  /* ── FOOTER ── */
  footer {
    padding: 32px 40px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1100px; margin: 0 auto;
  }
  footer p { font-family: var(--mono); font-size: 11px; color: var(--dim); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--green); }

  @media (max-width: 600px) {
    nav { padding: 0 20px; }
    .hero, .features, .log-teaser, .mockup-strip { padding-left: 20px; padding-right: 20px; }
    h1 { font-size: 32px; }
    .stats-row { padding: 0 20px; }
    .feature-grid { grid-template-columns: 1fr; }
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
  <p class="hero-sub">
    Real-time visibility into every AI agent running in your stack. 
    Monitor tasks, stream logs, manage API keys, and keep your autonomous 
    workflows running cleanly.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/relay-mock" class="btn-primary">↗ Interactive Mock</a>
    <a href="https://ram.zenbin.org/relay-viewer" class="btn-secondary">View Design File</a>
  </div>
</section>

<div class="mockup-strip">
  <div class="mockup-label">5 screens · dark terminal UI</div>
  <div class="screens-row">
    <!-- Screen 1: Dashboard -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="screen-glow"></div>
        <div class="screen-name">01 · DASHBOARD</div>
        <div style="display:flex;gap:4px;margin-bottom:8px;">
          <div style="flex:1;background:#111420;border-radius:4px;padding:6px 5px;">
            <div style="font-family:monospace;font-size:9px;color:#00D47A;font-weight:700;">6</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">ACTIVE</div>
          </div>
          <div style="flex:1;background:#111420;border-radius:4px;padding:6px 5px;">
            <div style="font-family:monospace;font-size:9px;color:#F5A623;font-weight:700;">14</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">QUEUED</div>
          </div>
          <div style="flex:1;background:#111420;border-radius:4px;padding:6px 5px;">
            <div style="font-family:monospace;font-size:9px;color:#6B7A99;font-weight:700;">47</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">DONE</div>
          </div>
        </div>
        <div style="background:#111420;border-radius:6px;padding:8px;margin-bottom:5px;">
          <div style="font-family:monospace;font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:4px;">researcher-01</div>
          <div style="font-size:8px;color:#6B7A99;margin-bottom:5px;">Scraping product docs</div>
          <div style="background:#3A4260;border-radius:2px;height:3px;"><div style="width:74%;height:100%;border-radius:2px;background:#00D47A;"></div></div>
        </div>
        <div style="background:#111420;border-radius:6px;padding:8px;margin-bottom:5px;">
          <div style="font-family:monospace;font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:4px;">writer-02</div>
          <div style="font-size:8px;color:#6B7A99;margin-bottom:5px;">Drafting blog post</div>
          <div style="background:#3A4260;border-radius:2px;height:3px;"><div style="width:41%;height:100%;border-radius:2px;background:#7C5CFC;"></div></div>
        </div>
        <div style="background:#0D0F18;border-radius:6px;padding:7px;">
          <div style="font-family:monospace;font-size:8px;color:#00D47A;margin-bottom:4px;">LOG STREAM ● LIVE</div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;line-height:1.7;">[researcher-01] fetched 12 records<br>[writer-02] token usage: 847/4096<br>[validator-03] complete ✓</div>
        </div>
      </div>
    </div>
    <!-- Screen 2: Agent Detail -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="screen-glow"></div>
        <div class="screen-name">02 · AGENT DETAIL</div>
        <div style="background:#111420;border-radius:8px;padding:10px;margin-bottom:8px;">
          <div style="font-family:monospace;font-size:9px;color:#E2E8F5;font-weight:700;margin-bottom:2px;">researcher-01</div>
          <div style="font-size:8px;color:#00D47A;margin-bottom:6px;">gpt-4o · Active · 4h 23m</div>
          <div style="display:flex;gap:8px;">
            <div style="text-align:center;flex:1;"><div style="font-family:monospace;font-size:11px;color:#E2E8F5;font-weight:700;">23</div><div style="font-family:monospace;font-size:7px;color:#6B7A99;">TASKS</div></div>
            <div style="text-align:center;flex:1;"><div style="font-family:monospace;font-size:11px;color:#E2E8F5;font-weight:700;">184K</div><div style="font-family:monospace;font-size:7px;color:#6B7A99;">TOKENS</div></div>
            <div style="text-align:center;flex:1;"><div style="font-family:monospace;font-size:11px;color:#00D47A;font-weight:700;">0</div><div style="font-family:monospace;font-size:7px;color:#6B7A99;">ERRORS</div></div>
          </div>
        </div>
        <div style="background:#111420;border-radius:8px;padding:10px;border-left:2px solid #00D47A;margin-bottom:5px;">
          <div style="font-size:9px;color:#E2E8F5;font-weight:600;margin-bottom:2px;">Scraping product docs</div>
          <div style="font-size:8px;color:#6B7A99;margin-bottom:5px;">Task #T-204 · 14 min ago</div>
          <div style="background:#3A4260;border-radius:2px;height:3px;"><div style="width:74%;height:100%;border-radius:2px;background:#00D47A;"></div></div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;margin-top:3px;">Step 18/24</div>
        </div>
        <div style="background:#111420;border-radius:8px;padding:8px;">
          <div style="font-family:monospace;font-size:8px;color:#6B7A99;margin-bottom:4px;">RECENT TASKS</div>
          <div style="font-size:8px;color:#E2E8F5;line-height:2;">✓ Fetch competitor pricing<br>✓ Summarize changelog v3.1<br>✓ Extract FAQ sections</div>
        </div>
      </div>
    </div>
    <!-- Screen 3: Task Queue -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="screen-glow" style="background:#7C5CFC;"></div>
        <div class="screen-name" style="color:#7C5CFC;">03 · TASK QUEUE</div>
        <div style="display:flex;gap:4px;margin-bottom:8px;">
          <div style="background:#111420;border-radius:4px;padding:4px 8px;font-family:monospace;font-size:8px;color:#00D47A;border:1px solid rgba(0,212,122,0.3);">All</div>
          <div style="border-radius:4px;padding:4px 8px;font-family:monospace;font-size:8px;color:#6B7A99;">Pending</div>
          <div style="border-radius:4px;padding:4px 8px;font-family:monospace;font-size:8px;color:#6B7A99;">Active</div>
        </div>
        ${[
          {id:'T-218',t:'Generate API reference docs',s:'active',c:'#7C5CFC',a:'writer-02'},
          {id:'T-219',t:'Validate JSON schemas',s:'pending',c:'#F5A623',a:'validator-03'},
          {id:'T-220',t:'Scrape competitor pricing',s:'pending',c:'#F5A623',a:'researcher-01'},
          {id:'T-221',t:'Summarize user interviews',s:'pending',c:'#3A4260',a:'—'},
        ].map(t => `<div style="background:#111420;border-radius:6px;padding:7px;margin-bottom:5px;border-left:2px solid ${t.c};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span style="font-family:monospace;font-size:7px;color:#6B7A99;">${t.id}</span>
            <span style="font-family:monospace;font-size:7px;color:${t.c};">${t.s === 'active' ? '▶ run' : '○ wait'}</span>
          </div>
          <div style="font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:2px;">${t.t}</div>
          <div style="font-family:monospace;font-size:7px;color:#6B7A99;">${t.a}</div>
        </div>`).join('')}
      </div>
    </div>
    <!-- Screen 4: Log Stream -->
    <div class="screen-card">
      <div class="screen-inner" style="background:#0D0F18;">
        <div style="display:flex;gap:4px;align-items:center;background:#111420;border-radius:6px;padding:5px 8px;margin-bottom:8px;">
          <div style="width:7px;height:7px;border-radius:50%;background:#FF5C5C;"></div>
          <div style="width:7px;height:7px;border-radius:50%;background:#FFBF00;"></div>
          <div style="width:7px;height:7px;border-radius:50%;background:#28CA41;"></div>
          <div style="font-family:monospace;font-size:8px;color:#6B7A99;margin-left:4px;">relay:logs</div>
        </div>
        <div style="font-family:monospace;font-size:8px;line-height:2;">
          ${[
            ['09:41:03','INFO','researcher-01','fetched 12 records','#00D47A'],
            ['09:41:01','INFO','writer-02','token: 847/4096','#E2E8F5'],
            ['09:40:58','INFO','validator-03','task T-216 complete','#00D47A'],
            ['09:40:52','WARN','writer-02','rate limit 85%','#F5A623'],
            ['09:40:47','INFO','researcher-01','step 16/24 parsing','#E2E8F5'],
            ['09:40:35','ERROR','writer-02','retry 1/3 timeout','#FF5C7A'],
            ['09:40:22','INFO','validator-03','schema OK: user.json','#00D47A'],
          ].map(([t,l,a,m,c]) => `<div style="margin-bottom:1px;"><span style="color:#3A4260;">${t}</span> <span style="color:${l==='WARN'?'#F5A623':l==='ERROR'?'#FF5C7A':'#6B7A99'};font-size:7px;">[${l}]</span> <span style="color:#7C5CFC;">${a.split('-')[0]}</span> <span style="color:${c};">${m}</span></div>`).join('')}
          <span style="color:#00D47A;" class="cursor">▌</span>
        </div>
      </div>
    </div>
    <!-- Screen 5: Settings -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="screen-glow" style="background:#7C5CFC;opacity:0.5;"></div>
        <div class="screen-name">05 · SETTINGS</div>
        <div style="background:#111420;border-radius:8px;padding:8px;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <div style="width:30px;height:30px;border-radius:50%;background:#181C2C;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:9px;color:#00D47A;font-weight:700;">RK</div>
          <div><div style="font-size:9px;color:#E2E8F5;font-weight:600;">Rakis</div><div style="font-size:8px;color:#00D47A;">Pro Plan · 6 agents</div></div>
        </div>
        <div style="font-family:monospace;font-size:8px;color:#6B7A99;margin-bottom:6px;letter-spacing:1px;">API KEYS</div>
        ${['OpenAI','Anthropic','Serper'].map((k,i) => `<div style="background:#111420;border-radius:6px;padding:7px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:8px;color:#E2E8F5;font-weight:600;margin-bottom:1px;">${k}</div>
            <div style="font-family:monospace;font-size:7px;color:#6B7A99;">sk-••••••••••${['3f8a','2c1d','1b4e'][i]}</div>
          </div>
          <div style="width:26px;height:14px;border-radius:8px;background:${i<2?'rgba(0,212,122,0.25)':'#3A4260'};position:relative;">
            <div style="width:10px;height:10px;border-radius:50%;background:${i<2?'#00D47A':'#6B7A99'};position:absolute;top:2px;${i<2?'right:2px':'left:2px'};"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>

<div id="features" class="features">
  <div class="features-label">What's inside</div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-accent" style="background:linear-gradient(90deg,#00D47A,transparent);"></div>
      <div class="feature-icon" style="background:var(--greenlt);">⬡</div>
      <h3>Agent Grid</h3>
      <p>See every agent's current status, active task, and progress in a single glance. Heartbeat indicators show liveness in real time.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:linear-gradient(90deg,#7C5CFC,transparent);"></div>
      <div class="feature-icon" style="background:var(--violetlt,#1A123A);">☰</div>
      <h3>Task Queue</h3>
      <p>Route, prioritize, and assign tasks across agents. Filter by status, agent, or priority. Watch items move from pending to done.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:linear-gradient(90deg,#00D47A,transparent);"></div>
      <div class="feature-icon" style="background:#001A0F;">▶</div>
      <h3>Live Log Stream</h3>
      <p>Terminal-style streaming logs from all agents. Filter by level (INFO / WARN / ERROR). Full monospace aesthetic with timestamp and agent tags.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:linear-gradient(90deg,#F5A623,transparent);"></div>
      <div class="feature-icon" style="background:#1F1509;">◎</div>
      <h3>Model Config</h3>
      <p>Assign different LLMs per task type. Manage API keys with a toggle. Set retry policies and log retention per workspace.</p>
    </div>
  </div>
</div>

<div id="logs" class="log-teaser">
  <div class="term-chrome">
    <div class="term-chrome-top">
      <div class="tc-dot" style="background:#FF5C5C;"></div>
      <div class="tc-dot" style="background:#FFBF00;"></div>
      <div class="tc-dot" style="background:#28CA41;"></div>
      <div class="tc-title">relay:logs — live stream</div>
    </div>
    <div class="term-body">
      <div class="log-line"><span class="log-time">09:41:03</span><span class="log-level ll-info">INFO</span><span class="log-agent">researcher-01</span><span class="log-msg ok">fetched 12 new records from source</span></div>
      <div class="log-line"><span class="log-time">09:41:01</span><span class="log-level ll-info">INFO</span><span class="log-agent">writer-02</span><span class="log-msg">token usage: 847/4096</span></div>
      <div class="log-line"><span class="log-time">09:40:58</span><span class="log-level ll-info">INFO</span><span class="log-agent">validator-03</span><span class="log-msg ok">task T-216 complete ✓</span></div>
      <div class="log-line"><span class="log-time">09:40:52</span><span class="log-level ll-warn">WARN</span><span class="log-agent">writer-02</span><span class="log-msg" style="color:var(--amber)">rate limit approaching (85%)</span></div>
      <div class="log-line"><span class="log-time">09:40:47</span><span class="log-level ll-info">INFO</span><span class="log-agent">researcher-01</span><span class="log-msg">step 16/24 — parsing HTML</span></div>
      <div class="log-line"><span class="log-time">09:40:35</span><span class="log-level ll-error">ERROR</span><span class="log-agent">writer-02</span><span class="log-msg" style="color:var(--coral)">retry 1/3 after connection timeout</span></div>
      <div class="log-line"><span class="log-time">09:40:28</span><span class="log-level ll-info">INFO</span><span class="log-agent">researcher-01</span><span class="log-msg">step 14/24 — extracting links</span></div>
      <div class="log-line"><span class="log-time">09:40:22</span><span class="log-level ll-info">INFO</span><span class="log-agent">validator-03</span><span class="log-msg ok">schema validated OK: user.json</span></div>
      <div class="log-line"><span class="log-time">09:40:08</span><span class="log-level ll-warn">WARN</span><span class="log-agent">researcher-01</span><span class="log-msg" style="color:var(--amber)">slow response — 2400ms</span></div>
      <div class="log-line"><span class="log-time">09:40:02</span><span class="log-level ll-info">INFO</span><span class="log-agent">writer-02</span><span class="log-msg ok">started task T-218</span></div>
      <div class="log-line"><span class="log-time">09:39:55</span><span class="log-level ll-info">INFO</span><span class="log-agent">researcher-01</span><span class="log-msg ok">started task T-204</span></div>
      <div class="log-line"><span class="log-time">09:39:50</span><span class="log-level ll-info">INFO</span><span class="log-agent">validator-03</span><span class="log-msg">idle — awaiting next task assignment</span></div>
      <div class="log-line"><span class="log-time">_</span><span class="log-level ll-info" style="opacity:0;">.</span><span class="log-agent" style="opacity:0;">.</span><span class="log-msg"><span class="cursor" style="color:var(--green)">▌</span></span></div>
    </div>
  </div>
</div>

<div class="stats-row">
  <div class="stat-item">
    <div class="stat-val green">6</div>
    <div class="stat-lbl">ACTIVE AGENTS</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">14</div>
    <div class="stat-lbl">TASKS QUEUED</div>
  </div>
  <div class="stat-item">
    <div class="stat-val green">47</div>
    <div class="stat-lbl">TASKS DONE</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">2</div>
    <div class="stat-lbl">ERRORS</div>
  </div>
</div>

<footer>
  <p>RAM Design Heartbeat · ram.zenbin.org/relay · Mar 30 2026</p>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/relay-viewer">Design File</a>
    <a href="https://ram.zenbin.org/relay-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// ── Viewer page ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/relay.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml);
  console.log('Hero:', r1.status, r1.body.slice(0, 80));

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml);
  console.log('Viewer:', r2.status, r2.body.slice(0, 80));
})();
