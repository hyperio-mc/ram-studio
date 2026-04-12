'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'cron';
const APP     = 'CRON';
const TAGLINE = 'Job Scheduling & Observability';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
      },
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

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:     '#090C12',
  surf:   '#0F1219',
  accent: '#3BFF8C',
  acc2:   '#6366F1',
  text:   '#E2E8F5',
  sub:    '#7A8BAD',
  err:    '#EF4444',
  warn:   '#F59E0B',
};

// ── SVG thumbnails from pen screens ─────────────────────────────────────────
const screenSvgs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<meta name="description" content="AI-powered job scheduling and observability platform. Schedule, monitor, and debug cron jobs with real-time logs and smart alerting.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${P.bg};--surf:${P.surf};--accent:${P.accent};--acc2:${P.acc2};
    --text:${P.text};--sub:${P.sub};--err:${P.err};--warn:${P.warn};
    --border:rgba(59,255,140,0.08);
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  /* ── ambient glow bg ── */
  body::before{content:'';position:fixed;top:-200px;right:-200px;width:600px;height:600px;
    background:radial-gradient(ellipse,rgba(59,255,140,0.07) 0%,transparent 70%);pointer-events:none;z-index:0}
  body::after{content:'';position:fixed;bottom:-200px;left:-200px;width:500px;height:500px;
    background:radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%);pointer-events:none;z-index:0}

  /* ── dot grid ── */
  .dot-grid{position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px);
    background-size:40px 40px}

  /* ── nav ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;
    background:rgba(9,12,18,0.8);backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px}
  .logo{font-size:16px;font-weight:800;letter-spacing:3px;color:var(--accent)}
  .logo span{color:var(--sub);font-weight:400;letter-spacing:1px;margin-left:8px;font-size:12px}
  .nav-links{display:flex;gap:24px}
  .nav-links a{color:var(--sub);text-decoration:none;font-size:13px;font-weight:500;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--accent);color:var(--bg);padding:8px 18px;border-radius:7px;
    font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.3px;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  /* ── hero ── */
  .hero{position:relative;z-index:1;min-height:100vh;display:flex;align-items:center;justify-content:center;
    flex-direction:column;text-align:center;padding:80px 24px 60px}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(59,255,140,0.08);
    border:1px solid rgba(59,255,140,0.2);border-radius:20px;padding:6px 14px;
    font-size:11px;font-weight:600;letter-spacing:1px;color:var(--accent);margin-bottom:28px}
  .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);
    animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  h1{font-size:clamp(48px,8vw,80px);font-weight:800;line-height:1.05;letter-spacing:-2px;margin-bottom:20px}
  h1 .accent{color:var(--accent)}
  h1 .dim{color:var(--sub)}
  .hero-sub{font-size:18px;color:var(--sub);max-width:520px;line-height:1.65;margin-bottom:36px;font-weight:400}
  .hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
  .btn-primary{background:var(--accent);color:var(--bg);padding:14px 28px;border-radius:9px;
    font-size:14px;font-weight:700;text-decoration:none;transition:opacity .2s}
  .btn-primary:hover{opacity:.85}
  .btn-secondary{background:transparent;color:var(--text);padding:14px 28px;border-radius:9px;
    font-size:14px;font-weight:600;text-decoration:none;
    border:1px solid rgba(226,232,245,0.15);transition:border-color .2s}
  .btn-secondary:hover{border-color:rgba(226,232,245,0.35)}

  /* ── stats strip ── */
  .stats{position:relative;z-index:1;display:flex;justify-content:center;gap:0;
    border-top:1px solid var(--border);border-bottom:1px solid var(--border);
    background:rgba(15,18,25,0.6);padding:24px 0}
  .stat{text-align:center;padding:0 40px;border-right:1px solid var(--border)}
  .stat:last-child{border-right:none}
  .stat-val{font-size:28px;font-weight:800;color:var(--accent);letter-spacing:-1px}
  .stat-label{font-size:11px;color:var(--sub);font-weight:600;letter-spacing:1px;margin-top:2px}

  /* ── screen carousel ── */
  .screens{position:relative;z-index:1;padding:80px 24px;max-width:1100px;margin:0 auto}
  .screens h2{font-size:32px;font-weight:700;letter-spacing:-0.5px;margin-bottom:8px}
  .screens .section-sub{color:var(--sub);font-size:15px;margin-bottom:48px}
  .screen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .screen-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;
    overflow:hidden;transition:border-color .25s,transform .25s}
  .screen-card:hover{border-color:rgba(59,255,140,0.25);transform:translateY(-4px)}
  .screen-img{width:100%;display:block;background:var(--bg)}
  .screen-img img{width:100%;display:block}
  .screen-label{padding:14px 16px;font-size:12px;color:var(--sub);font-weight:600;letter-spacing:0.5px;
    border-top:1px solid var(--border)}

  /* ── features bento ── */
  .features{position:relative;z-index:1;padding:80px 24px;max-width:1100px;margin:0 auto}
  .features h2{font-size:32px;font-weight:700;letter-spacing:-0.5px;margin-bottom:8px}
  .features .section-sub{color:var(--sub);font-size:15px;margin-bottom:48px}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px}
  .bento-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:28px;
    position:relative;overflow:hidden;transition:border-color .2s}
  .bento-card:hover{border-color:rgba(99,102,241,0.3)}
  .bento-card.wide{grid-column:span 2}
  .bento-card.tall{grid-row:span 2}
  .bento-card::before{content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse at 80% 20%,rgba(59,255,140,0.04) 0%,transparent 60%);
    pointer-events:none}
  .feat-icon{font-size:26px;margin-bottom:16px}
  .feat-title{font-size:16px;font-weight:700;margin-bottom:8px;letter-spacing:-0.2px}
  .feat-desc{font-size:13px;color:var(--sub);line-height:1.6}
  .feat-accent{color:var(--accent)}
  .feat-metric{font-size:40px;font-weight:800;color:var(--accent);letter-spacing:-2px;margin:12px 0 4px}

  /* ── palette section ── */
  .palette-section{position:relative;z-index:1;padding:60px 24px;max-width:1100px;margin:0 auto}
  .palette-section h2{font-size:24px;font-weight:700;margin-bottom:28px}
  .palette-row{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
  .swatch-block{width:64px;height:64px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)}
  .swatch-hex{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--sub)}
  .swatch-name{font-size:10px;color:var(--dim);text-align:center}

  /* ── links footer ── */
  .links-section{position:relative;z-index:1;padding:60px 24px;max-width:1100px;margin:0 auto;
    border-top:1px solid var(--border)}
  .links-section h2{font-size:20px;font-weight:700;margin-bottom:24px}
  .link-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
  .link-card{background:var(--surf);border:1px solid var(--border);border-radius:10px;padding:18px;
    text-decoration:none;display:flex;flex-direction:column;gap:6px;transition:border-color .2s}
  .link-card:hover{border-color:rgba(59,255,140,0.3)}
  .link-label{font-size:10px;color:var(--sub);font-weight:600;letter-spacing:1px}
  .link-url{font-size:13px;color:var(--accent);font-weight:600}
  .link-desc{font-size:12px;color:var(--sub)}

  footer{position:relative;z-index:1;text-align:center;padding:32px;
    border-top:1px solid var(--border);font-size:12px;color:var(--sub)}

  @media(max-width:700px){
    .bento{grid-template-columns:1fr}.bento-card.wide{grid-column:span 1}
    .stats{flex-direction:column;gap:0}.stat{border-right:none;border-bottom:1px solid var(--border)}
    .stat:last-child{border-bottom:none}
  }
</style>
</head>
<body>
<div class="dot-grid"></div>

<nav>
  <div class="logo">CRON <span>observability</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Try Mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-badge">RAM Design Heartbeat #44</div>
  <h1>Schedule jobs.<br><span class="accent">Zero surprises.</span></h1>
  <p class="hero-sub">AI-powered cron job scheduling, real-time log streaming, and smart alerting — from the team behind 99.2% uptime.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil Viewer →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-val">1,247</div><div class="stat-label">JOBS RUNNING</div></div>
  <div class="stat"><div class="stat-val">99.2%</div><div class="stat-label">SUCCESS RATE</div></div>
  <div class="stat"><div class="stat-val">0.8s</div><div class="stat-label">P90 LATENCY</div></div>
  <div class="stat"><div class="stat-val">6</div><div class="stat-label">SCREENS DESIGNED</div></div>
</div>

<section class="screens" id="screens">
  <h2>6 Screen Flows</h2>
  <p class="section-sub">Dashboard · Job List · Job Detail · Log Stream · Monitor · Alerts</p>
  <div class="screen-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <div class="screen-img">
        <img src="${screenSvgs[i]}" alt="${s.name}" loading="lazy">
      </div>
      <div class="screen-label">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <h2>Design Decisions</h2>
  <p class="section-sub">Inspired by Railway.app's circuit-board connector lines (saaspo.com) + the "Linear Look" bento grid aesthetic (darkmodedesign.com)</p>
  <div class="bento">
    <div class="bento-card wide">
      <div class="feat-icon">◈</div>
      <div class="feat-title">Circuit-Board Connector Lines</div>
      <div class="feat-desc">Inspired directly by Railway.app on saaspo.com — SVG <span class="feat-accent">L-shaped circuit lines</span> with junction dots connect cards and sections, visualizing job dependencies as infrastructure topology. The pattern creates depth without photographic elements.</div>
    </div>
    <div class="bento-card">
      <div class="feat-icon">⬡</div>
      <div class="feat-title">Bento Grid Dashboard</div>
      <div class="feat-desc">The "Linear Look" bento layout from darkmodedesign.com — <span class="feat-accent">varied-size cards</span> create hierarchy through scale rather than color. Two equal metrics, one full-width timeline, two half cards.</div>
    </div>
    <div class="bento-card">
      <div class="feat-metric">3BFF8C</div>
      <div class="feat-title">Neon Mint Accent</div>
      <div class="feat-desc">Charcoal + Neon Green archetype from darkmodedesign.com. Single accent color used exclusively for success states and primary CTAs — everything else is desaturated.</div>
    </div>
    <div class="bento-card">
      <div class="feat-icon">≡</div>
      <div class="feat-title">Terminal Log Stream</div>
      <div class="feat-desc">Log screen uses a <span class="feat-accent">JetBrains Mono</span> font for timestamps, job badge tags, and monospace message rendering — immediately signals dev-tool credibility.</div>
    </div>
    <div class="bento-card">
      <div class="feat-icon">◎</div>
      <div class="feat-title">Ambient Glow Depth</div>
      <div class="feat-desc">Soft radial gradient "light sources" in mint and indigo replace hard drop shadows as the primary depth technique — the dominant pattern across darkmodedesign.com's featured 2026 work.</div>
    </div>
    <div class="bento-card">
      <div class="feat-icon">⊘</div>
      <div class="feat-title">Alert Severity Signaling</div>
      <div class="feat-desc"><span class="feat-accent">Colored left-border bars</span> + glassmorphic card overlays signal alert severity (red/orange) without overwhelming the dark base palette.</div>
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <h2>Palette</h2>
  <div class="palette-row">
    ${[
      { hex: P.bg,     name: 'Background',  label: 'bg' },
      { hex: P.surf,   name: 'Surface',     label: 'surf' },
      { hex: P.accent, name: 'Neon Mint',   label: 'accent' },
      { hex: P.acc2,   name: 'Indigo',      label: 'acc2' },
      { hex: P.err,    name: 'Alert Red',   label: 'err' },
      { hex: P.warn,   name: 'Warn Amber',  label: 'warn' },
      { hex: P.text,   name: 'Text',        label: 'text' },
      { hex: P.sub,    name: 'Muted',       label: 'sub' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-block" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="links-section">
  <h2>Explore</h2>
  <div class="link-grid">
    <a class="link-card" href="https://ram.zenbin.org/${SLUG}-viewer">
      <div class="link-label">PENCIL VIEWER</div>
      <div class="link-url">ram.zenbin.org/${SLUG}-viewer</div>
      <div class="link-desc">Browse all 6 screens in the Pencil.dev viewer</div>
    </a>
    <a class="link-card" href="https://ram.zenbin.org/${SLUG}-mock">
      <div class="link-label">INTERACTIVE MOCK</div>
      <div class="link-url">ram.zenbin.org/${SLUG}-mock ☀◑</div>
      <div class="link-desc">Svelte 5 mock with light/dark toggle and navigation</div>
    </a>
    <a class="link-card" href="https://ram.zenbin.org/">
      <div class="link-label">ALL DESIGNS</div>
      <div class="link-url">ram.zenbin.org</div>
      <div class="link-desc">Full RAM Design Heartbeat gallery</div>
    </a>
  </div>
</section>

<footer>
  RAM Design Heartbeat #44 · CRON · Dark Theme · ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
  · Inspired by Railway.app circuit lines (saaspo.com) + Linear Look (darkmodedesign.com)
</footer>
</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}
main().catch(console.error);
