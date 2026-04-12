const https = require('https');
const fs = require('fs');

const SLUG = 'pilot';
const APP_NAME = 'PILOT';
const TAGLINE = 'your agents, in formation.';
const ARCHETYPE = 'agent-fleet-manager';
const ORIGINAL_PROMPT = 'Inspired by agent-native SaaS trend (Factory, Composio, Parallel Web Systems on Minimal Gallery) + warm cream editorial style (Folk, Sort). Light theme fleet dashboard for indie devs managing AI agents.';

const palette = {
  bg:      '#F5F1EB',
  surface: '#FFFFFF',
  card:    '#FDFCFA',
  border:  '#E8E3DA',
  text:    '#1A1714',
  muted:   '#8C8580',
  accent:  '#2D5BFF',
  accent2: '#FF4F1A',
  green:   '#1A9E6A',
  amber:   '#F59E0B',
};

function publish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PILOT — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F5F1EB;--surface:#FFFFFF;--card:#FDFCFA;
    --border:#E8E3DA;--text:#1A1714;--muted:#8C8580;
    --accent:#2D5BFF;--accent2:#FF4F1A;
    --green:#1A9E6A;--amber:#F59E0B;
  }
  html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;scroll-behavior:smooth}
  body{min-height:100vh;overflow-x:hidden}

  /* HERO */
  .hero{min-height:100vh;display:grid;place-items:center;position:relative;padding:2rem;
    background:linear-gradient(170deg,#F5F1EB 60%,#EEF2FF 100%)}
  .hero-inner{text-align:center;max-width:720px;position:relative;z-index:1}
  .eyebrow{font-size:11px;letter-spacing:0.28em;color:var(--accent);font-weight:600;
    margin-bottom:1.5rem;text-transform:uppercase}
  .hero-name{font-size:clamp(80px,14vw,140px);font-weight:800;letter-spacing:-0.05em;
    line-height:0.88;color:var(--text);margin-bottom:1.25rem;
    font-family:'Inter',sans-serif}
  .hero-name em{font-style:normal;color:var(--accent)}
  .hero-tag{font-size:clamp(16px,2.5vw,22px);font-weight:400;color:var(--muted);
    letter-spacing:0.01em;margin-bottom:1rem;font-family:'Playfair Display',serif;font-style:italic}
  .hero-desc{font-size:15px;line-height:1.75;color:var(--muted);max-width:520px;margin:0 auto 2.5rem}
  .pill-row{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:3rem}
  .pill{padding:6px 16px;border-radius:100px;border:1px solid var(--border);font-size:11px;
    font-weight:500;letter-spacing:0.1em;color:var(--muted);text-transform:uppercase;
    background:var(--surface)}
  .pill.accent{border-color:var(--accent);color:var(--accent);background:#EEF2FF}
  .pill.orange{border-color:var(--accent2);color:var(--accent2);background:#FFF0EB}
  .cta-row{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
  .btn{padding:14px 32px;border-radius:100px;font-size:13px;font-weight:600;letter-spacing:0.04em;
    cursor:pointer;text-decoration:none;transition:all 0.2s}
  .btn-primary{background:var(--accent);color:#fff}
  .btn-primary:hover{background:#1a3fcc;transform:translateY(-1px);box-shadow:0 8px 24px rgba(45,91,255,0.25)}
  .btn-ghost{border:1.5px solid var(--border);color:var(--text);background:var(--surface)}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}

  /* AGENT GRID VISUAL */
  .agent-grid{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;
    margin:0 auto 4rem;max-width:480px}
  .agent-chip{display:flex;align-items:center;gap:8px;padding:8px 14px;
    border-radius:12px;background:var(--surface);border:1px solid var(--border);
    font-size:12px;font-weight:500;color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,0.05)}
  .agent-dot{width:8px;height:8px;border-radius:50%}
  .agent-dot.green{background:#1A9E6A}
  .agent-dot.blue{background:#2D5BFF}
  .agent-dot.amber{background:#F59E0B}
  .agent-dot.muted{background:#8C8580}
  .agent-count{font-size:10px;color:var(--muted);margin-left:4px}

  /* SCREENS GRID */
  .screens-section{padding:6rem 2rem;max-width:1200px;margin:0 auto}
  .section-label{font-size:10px;letter-spacing:0.3em;color:var(--accent);font-weight:600;
    text-transform:uppercase;margin-bottom:0.75rem;text-align:center}
  .section-sub{font-size:14px;color:var(--muted);text-align:center;margin-bottom:3rem}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem}
  .screen-card{background:var(--surface);border:1.5px solid var(--border);border-radius:20px;
    overflow:hidden;transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s}
  .screen-card:hover{border-color:rgba(45,91,255,0.3);transform:translateY(-4px);
    box-shadow:0 12px 40px rgba(45,91,255,0.1)}
  .screen-mock{aspect-ratio:9/16;padding:1.25rem;display:flex;flex-direction:column;gap:0.6rem;
    background:var(--bg)}
  .sm-bar{height:3px;border-radius:2px;background:var(--accent);opacity:0.2;margin-bottom:2px}
  .sm-title{font-size:16px;font-weight:800;letter-spacing:-0.02em;color:var(--text)}
  .sm-sub{font-size:9px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase}
  .sm-metric{font-size:32px;font-weight:800;letter-spacing:-0.04em;color:var(--text)}
  .sm-metric.accent{color:var(--accent)}
  .sm-metric.green{color:var(--green)}
  .sm-stat-row{display:flex;gap:6px}
  .sm-stat{flex:1;background:var(--surface);border-radius:8px;padding:6px;text-align:center;
    border:1px solid var(--border)}
  .sm-stat-val{font-size:14px;font-weight:700;color:var(--text)}
  .sm-stat-key{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em}
  .sm-pill-row{display:flex;gap:5px;flex-wrap:wrap}
  .sm-pill{padding:3px 8px;border-radius:100px;border:1px solid var(--border);font-size:8px;
    color:var(--muted);letter-spacing:0.08em;text-transform:uppercase;background:var(--surface)}
  .sm-pill.blue{border-color:var(--accent);color:var(--accent);background:#EEF2FF}
  .sm-pill.green{border-color:var(--green);color:var(--green);background:#E8F7F1}
  .sm-pill.amber{border-color:var(--amber);color:var(--amber);background:#FEF3C7}
  .sm-item{padding:6px 0;border-bottom:1px solid var(--border);display:flex;
    flex-direction:column;gap:2px}
  .sm-item-title{font-size:10px;font-weight:600;color:var(--text)}
  .sm-item-sub{font-size:8px;color:var(--muted)}
  .sm-progress{height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:3px}
  .sm-progress-fill{height:100%;border-radius:2px}
  .sm-nav{margin-top:auto;display:flex;justify-content:space-around;padding-top:0.75rem;
    border-top:1px solid var(--border)}
  .sm-nav-dot{width:18px;height:18px;border-radius:5px;background:var(--border)}
  .sm-nav-dot.active{background:var(--accent)}
  .screen-label{padding:0.75rem 1.25rem;font-size:10px;letter-spacing:0.18em;color:var(--muted);
    text-transform:uppercase;border-top:1px solid var(--border);background:var(--surface)}

  /* DESIGN SPEC */
  .spec-section{padding:4rem 2rem 6rem;max-width:1000px;margin:0 auto}
  .spec-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
  .spec-card{background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:1.75rem}
  .spec-card h3{font-size:10px;letter-spacing:0.25em;color:var(--accent);text-transform:uppercase;
    font-weight:600;margin-bottom:1.25rem}
  .color-row{display:flex;gap:0.75rem;flex-wrap:wrap}
  .swatch-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}
  .swatch{width:44px;height:44px;border-radius:10px;border:1px solid var(--border)}
  .swatch-label{font-size:9px;color:var(--muted);letter-spacing:0.06em;text-align:center}
  .type-row{display:flex;flex-direction:column;gap:0.75rem}
  .type-sample.xl{font-size:36px;font-weight:800;letter-spacing:-0.04em;color:var(--text)}
  .type-sample.lg{font-size:18px;font-weight:600;color:var(--text);font-style:italic;
    font-family:'Playfair Display',serif}
  .type-sample.sm{font-size:11px;color:var(--muted);font-weight:500;letter-spacing:0.2em;
    text-transform:uppercase}
  .token-list{display:flex;flex-direction:column;gap:0.6rem}
  .token{display:flex;justify-content:space-between;align-items:center;font-size:11px;
    padding:6px 0;border-bottom:1px solid var(--border)}
  .token:last-child{border-bottom:none}
  .token-key{color:var(--accent);font-family:monospace;font-size:10px}
  .token-val{color:var(--muted);font-family:monospace;font-size:10px}

  /* LINKS */
  .links-section{padding:3rem 2rem 6rem;text-align:center}
  .links-section a{color:var(--accent);text-decoration:none;font-size:13px;
    letter-spacing:0.08em;text-transform:uppercase;font-weight:600;margin:0 1.5rem}
  .links-section a:hover{color:var(--text)}
  .footer{padding:2rem;text-align:center;font-size:10px;color:var(--muted);
    letter-spacing:0.15em;text-transform:uppercase;border-top:1px solid var(--border)}
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="eyebrow">RAM Design Studio · Design Discovery</div>
    <div class="hero-name">PIL<em>OT</em></div>
    <div class="hero-tag">your agents, in formation.</div>
    <p class="hero-desc">
      An AI agent fleet manager for indie developers. Deploy, monitor, and command
      autonomous agents from a single warm-toned dashboard. Inspired by the agent-native
      SaaS explosion on Minimal Gallery (Factory, Composio, Parallel Web Systems)
      and Folk's warm cream editorial style.
    </p>

    <div class="agent-grid">
      <div class="agent-chip"><div class="agent-dot green"></div>Scout <span class="agent-count">12 tasks</span></div>
      <div class="agent-chip"><div class="agent-dot blue"></div>Forge <span class="agent-count">8 tasks</span></div>
      <div class="agent-chip"><div class="agent-dot amber"></div>Herald <span class="agent-count">paused</span></div>
      <div class="agent-chip"><div class="agent-dot green"></div>Ledger <span class="agent-count">31 tasks</span></div>
      <div class="agent-chip"><div class="agent-dot muted"></div>Cipher <span class="agent-count">standby</span></div>
    </div>

    <div class="pill-row">
      <span class="pill accent">Light Theme</span>
      <span class="pill">AI / Agents</span>
      <span class="pill">5 Screens</span>
      <span class="pill orange">Warm Cream</span>
      <span class="pill">Editorial Type</span>
    </div>
    <div class="cta-row">
      <a href="/pilot-viewer" class="btn btn-primary">Open in Viewer →</a>
      <a href="/pilot-mock" class="btn btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<!-- SCREEN PREVIEWS -->
<section class="screens-section">
  <div class="section-label">5 Mobile Screens</div>
  <div class="section-sub">Fleet Dashboard · Agent Detail · Task Queue · Outcomes · Deploy</div>
  <div class="screens-grid">

    <!-- Screen 1: Fleet -->
    <div class="screen-card">
      <div class="screen-mock">
        <div class="sm-bar"></div>
        <div class="sm-title">PILOT</div>
        <div class="sm-sub">Fleet Dashboard</div>
        <div class="sm-stat-row">
          <div class="sm-stat"><div class="sm-stat-val">6</div><div class="sm-stat-key">Agents</div></div>
          <div class="sm-stat"><div class="sm-stat-val" style="color:var(--accent)">23</div><div class="sm-stat-key">Running</div></div>
          <div class="sm-stat"><div class="sm-stat-val">847</div><div class="sm-stat-key">Done</div></div>
        </div>
        <div class="sm-sub" style="margin-top:4px">ACTIVE AGENTS</div>
        <div class="sm-item">
          <div class="sm-item-title">Scout <span style="color:var(--green)">● Running</span></div>
          <div class="sm-item-sub">Web Research · 12 tasks · 2h 14m</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Forge <span style="color:var(--green)">● Running</span></div>
          <div class="sm-item-sub">Code Gen · 8 tasks · 45m</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Herald <span style="color:var(--amber)">● Paused</span></div>
          <div class="sm-item-sub">Email · 3 tasks · —</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Ledger <span style="color:var(--green)">● Running</span></div>
          <div class="sm-item-sub">Data Pipeline · 31 tasks · 6h 02m</div>
        </div>
        <div class="sm-nav">
          <div class="sm-nav-dot active"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
        </div>
      </div>
      <div class="screen-label">Fleet</div>
    </div>

    <!-- Screen 2: Agent Detail -->
    <div class="screen-card">
      <div class="screen-mock">
        <div class="sm-bar"></div>
        <div class="sm-sub">← Fleet</div>
        <div class="sm-title">Scout</div>
        <div class="sm-sub">Web Research Agent · GPT-4o</div>
        <div class="sm-pill-row">
          <span class="sm-pill green">Running</span>
          <span class="sm-pill">v2.3</span>
          <span class="sm-pill">128k ctx</span>
        </div>
        <div style="background:var(--surface);border-radius:8px;padding:8px;border:1px solid var(--border)">
          <div class="sm-sub">CURRENT TASK</div>
          <div class="sm-item-title" style="margin:4px 0;font-size:9px">Scrape competitor pricing — Notion, Linear, Asana</div>
          <div class="sm-progress"><div class="sm-progress-fill" style="width:65%;background:var(--accent)"></div></div>
          <div class="sm-sub" style="margin-top:4px">65% · ~8 min remaining</div>
        </div>
        <div class="sm-stat-row">
          <div class="sm-stat"><div class="sm-stat-val accent" style="color:var(--accent)">847</div><div class="sm-stat-key">Completed</div></div>
          <div class="sm-stat"><div class="sm-stat-val" style="color:var(--green)">98.2%</div><div class="sm-stat-key">Success</div></div>
        </div>
        <div class="sm-sub">RECENT LOG</div>
        <div class="sm-item"><div class="sm-item-sub">09:41 Navigating to asana.com/pricing</div></div>
        <div class="sm-item"><div class="sm-item-sub" style="color:var(--green)">09:38 Extracted 12 points from linear.app</div></div>
        <div class="sm-nav">
          <div class="sm-nav-dot active"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
        </div>
      </div>
      <div class="screen-label">Agent Detail</div>
    </div>

    <!-- Screen 3: Task Queue -->
    <div class="screen-card">
      <div class="screen-mock">
        <div class="sm-bar"></div>
        <div class="sm-title">Task Queue</div>
        <div class="sm-sub">7 tasks · 3 running</div>
        <div class="sm-pill-row">
          <span class="sm-pill blue">All</span>
          <span class="sm-pill">Running</span>
          <span class="sm-pill">Queued</span>
          <span class="sm-pill">Done</span>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Scout · Research AI pricing trends</div>
          <div class="sm-item-sub"><span style="color:var(--green)">● running</span> · High · ~12m</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Forge · Generate TypeScript types</div>
          <div class="sm-item-sub"><span style="color:var(--green)">● running</span> · High · ~4m</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Ledger · Sync Stripe → Postgres</div>
          <div class="sm-item-sub"><span style="color:var(--green)">● running</span> · Med · ~2m</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Scout · Scrape ProductHunt top 50</div>
          <div class="sm-item-sub"><span style="color:var(--accent)">● queued</span> · Med</div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Herald · Draft cold outreach emails</div>
          <div class="sm-item-sub"><span style="color:var(--amber)">● paused</span> · Low</div>
        </div>
        <div class="sm-nav">
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot active"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
        </div>
      </div>
      <div class="screen-label">Task Queue</div>
    </div>

    <!-- Screen 4: Outcomes -->
    <div class="screen-card">
      <div class="screen-mock">
        <div class="sm-bar" style="background:var(--accent2)"></div>
        <div class="sm-title">Outcomes</div>
        <div class="sm-sub">Today's results</div>
        <div style="background:var(--accent);border-radius:10px;padding:10px;color:#fff">
          <div style="font-size:9px;letter-spacing:0.1em;opacity:0.75">TODAY</div>
          <div style="font-size:28px;font-weight:800;letter-spacing:-0.04em">847</div>
          <div style="font-size:9px;opacity:0.75">tasks completed</div>
        </div>
        <div class="sm-sub">BY CATEGORY</div>
        <div class="sm-item">
          <div class="sm-item-title">Research <span style="float:right">312</span></div>
          <div class="sm-progress"><div class="sm-progress-fill" style="width:37%;background:var(--accent)"></div></div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Code gen <span style="float:right">228</span></div>
          <div class="sm-progress"><div class="sm-progress-fill" style="width:27%;background:#7C3AED"></div></div>
        </div>
        <div class="sm-item">
          <div class="sm-item-title">Data sync <span style="float:right">189</span></div>
          <div class="sm-progress"><div class="sm-progress-fill" style="width:22%;background:var(--green)"></div></div>
        </div>
        <div class="sm-nav">
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot active"></div>
          <div class="sm-nav-dot"></div>
        </div>
      </div>
      <div class="screen-label">Outcomes</div>
    </div>

    <!-- Screen 5: Deploy -->
    <div class="screen-card">
      <div class="screen-mock">
        <div class="sm-bar"></div>
        <div class="sm-sub">← Fleet</div>
        <div class="sm-title">Deploy Agent</div>
        <div style="background:var(--surface);border:1.5px solid var(--accent);border-radius:8px;
          padding:7px;font-size:10px;color:var(--text)">Phantom|</div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;
          padding:7px;font-size:9px;color:var(--muted)">Monitor HN for product mentions…</div>
        <div class="sm-sub">MODEL</div>
        <div class="sm-stat-row">
          <div class="sm-stat" style="border-color:var(--accent);background:#EEF2FF">
            <div class="sm-stat-key" style="color:var(--accent)">GPT-4o</div>
          </div>
          <div class="sm-stat"><div class="sm-stat-key">Claude</div></div>
          <div class="sm-stat"><div class="sm-stat-key">Gemini</div></div>
        </div>
        <div class="sm-sub">TOOLS</div>
        <div class="sm-pill-row">
          <span class="sm-pill blue">Web Browse</span>
          <span class="sm-pill blue">Code Exec</span>
          <span class="sm-pill">Email</span>
          <span class="sm-pill">Postgres</span>
          <span class="sm-pill">Slack</span>
        </div>
        <div style="margin-top:auto;background:var(--accent);border-radius:20px;padding:10px;
          text-align:center;font-size:11px;font-weight:700;color:#fff">
          Deploy Phantom →
        </div>
        <div class="sm-nav">
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot"></div>
          <div class="sm-nav-dot active"></div>
        </div>
      </div>
      <div class="screen-label">Deploy</div>
    </div>

  </div>
</section>

<!-- BRAND SPEC -->
<section class="spec-section">
  <div class="section-label">Design Specification</div>
  <div class="spec-grid">
    <div class="spec-card">
      <h3>Color System</h3>
      <div class="color-row">
        <div class="swatch-wrap"><div class="swatch" style="background:#F5F1EB"></div><div class="swatch-label">BG</div></div>
        <div class="swatch-wrap"><div class="swatch" style="background:#FFFFFF"></div><div class="swatch-label">SURFACE</div></div>
        <div class="swatch-wrap"><div class="swatch" style="background:#1A1714"></div><div class="swatch-label">TEXT</div></div>
        <div class="swatch-wrap"><div class="swatch" style="background:#2D5BFF"></div><div class="swatch-label">ACCENT</div></div>
        <div class="swatch-wrap"><div class="swatch" style="background:#FF4F1A"></div><div class="swatch-label">ACC2</div></div>
        <div class="swatch-wrap"><div class="swatch" style="background:#1A9E6A"></div><div class="swatch-label">GREEN</div></div>
      </div>
    </div>
    <div class="spec-card">
      <h3>Typography</h3>
      <div class="type-row">
        <div class="type-sample xl">PILOT</div>
        <div class="type-sample lg">your agents, in formation.</div>
        <div class="type-sample sm">section label · 700 · uppercase</div>
      </div>
    </div>
    <div class="spec-card">
      <h3>Design Tokens</h3>
      <div class="token-list">
        <div class="token"><span class="token-key">--bg</span><span class="token-val">#F5F1EB · warm cream</span></div>
        <div class="token"><span class="token-key">--accent</span><span class="token-val">#2D5BFF · electric blue</span></div>
        <div class="token"><span class="token-key">--accent2</span><span class="token-val">#FF4F1A · warm orange</span></div>
        <div class="token"><span class="token-key">--radius-card</span><span class="token-val">12px</span></div>
        <div class="token"><span class="token-key">--font-hero</span><span class="token-val">Inter 800</span></div>
        <div class="token"><span class="token-key">--font-tag</span><span class="token-val">Playfair Display italic</span></div>
      </div>
    </div>
    <div class="spec-card">
      <h3>Design Brief</h3>
      <p style="font-size:12px;line-height:1.85;color:var(--muted)">
        Warm cream (#F5F1EB) as base — not clinical white, not dark. Electric blue
        for agent status and action. Orange-coral for urgency and deploys. Status dots
        communicate agent health at a glance. Inspired by Folk's editorial warmth and
        Composio's agentic clarity. Playfair tagline creates editorial contrast against
        Inter's clean weight.
      </p>
    </div>
  </div>
</section>

<div class="links-section">
  <a href="/pilot-viewer">Pen Viewer</a>
  <a href="/pilot-mock">Interactive Mock</a>
  <a href="/gallery">Full Gallery</a>
</div>

<div class="footer">© 2026 RAM Design Studio · PILOT · your agents, in formation.</div>
</body>
</html>`;

// ── VIEWER PAGE ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/pilot.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/penviewer-app.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`hero: ${r1.status} ${r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Viewer`);
  console.log(`viewer: ${r2.status} ${r2.body.slice(0,80)}`);

  console.log('✓ Hero + viewer published');
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
})();
