'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'ward';
const NAME    = 'WARD';
const TAGLINE = 'Incident intelligence for dev teams';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:     '#09090B',
  surf:   '#18181B',
  card:   '#27272A',
  border: '#3F3F46',
  text:   '#FAFAFA',
  sub:    '#A1A1AA',
  muted:  '#71717A',
  accent: '#6366F1',
  ok:     '#10B981',
  warn:   '#F59E0B',
  crit:   '#F43F5E',
  acc2:   '#818CF8',
};

// ─── Publish helper ─────────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Read pen file ───────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// ─── SVG renderer ───────────────────────────────────────────────────────────
function renderSVG(screen, scale = 1) {
  const W = screen.width  || 390;
  const H = screen.height || 844;
  const sw = Math.round(W * scale);
  const sh = Math.round(H * scale);

  let svgBody = '';
  for (const el of screen.elements) {
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    if (el.type === 'rect') {
      const rx   = el.rx   ? ` rx="${el.rx * scale}"` : '';
      const stk  = el.stroke ? ` stroke="${el.stroke}" stroke-width="${(el.sw || 1) * scale}"` : '';
      const fill = el.fill || 'transparent';
      svgBody += `<rect x="${el.x*scale}" y="${el.y*scale}" width="${el.w*scale}" height="${el.h*scale}" fill="${fill}"${rx}${stk}${op}/>`;
    } else if (el.type === 'circle') {
      const stk = el.stroke ? ` stroke="${el.stroke}" stroke-width="${(el.sw || 1) * scale}" fill="none"` : '';
      svgBody += `<circle cx="${el.cx*scale}" cy="${el.cy*scale}" r="${el.r*scale}" fill="${el.stroke ? 'none' : (el.fill || 'transparent')}"${stk}${op}/>`;
    } else if (el.type === 'line') {
      svgBody += `<line x1="${el.x1*scale}" y1="${el.y1*scale}" x2="${el.x2*scale}" y2="${el.y2*scale}" stroke="${el.stroke || '#fff'}" stroke-width="${(el.sw || 1) * scale}"${op}/>`;
    } else if (el.type === 'text') {
      const anchor = el.anchor || 'start';
      const fw     = el.fw   || 400;
      const size   = (el.size || 12) * scale;
      const ls     = el.ls ? ` letter-spacing="${el.ls * scale}"` : '';
      const font   = el.font || 'Inter, system-ui, sans-serif';
      svgBody += `<text x="${el.x*scale}" y="${el.y*scale}" fill="${el.fill || '#fff'}" font-size="${size}" font-weight="${fw}" text-anchor="${anchor}" font-family="${font}"${ls}${op}>${el.content}</text>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}">${svgBody}</svg>`;
}

// ─── Hero page ───────────────────────────────────────────────────────────────
const screens = pen.screens;
const scale   = 0.55;

const screenCardsHtml = screens.map((sc, i) => {
  const svg    = renderSVG(sc, scale);
  const b64    = Buffer.from(svg).toString('base64');
  const dataUri = `data:image/svg+xml;base64,${b64}`;
  const isFirst = i === 0;
  return `
    <div class="screen-card${isFirst ? ' active' : ''}" data-idx="${i}" onclick="activateScreen(${i})">
      <div class="screen-label">${sc.name}</div>
      <img src="${dataUri}" alt="${sc.name}" loading="lazy" />
    </div>`;
}).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${NAME} — ${TAGLINE}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${C.bg};--surf:${C.surf};--card:${C.card};
    --border:${C.border};--text:${C.text};--sub:${C.sub};--muted:${C.muted};
    --accent:${C.accent};--ok:${C.ok};--warn:${C.warn};--crit:${C.crit};--acc2:${C.acc2};
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* ── Ambient glow ── */
  body::before{
    content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);
    width:700px;height:500px;
    background:radial-gradient(ellipse,rgba(99,102,241,0.12) 0%,transparent 70%);
    pointer-events:none;z-index:0;
  }

  /* ── Nav ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 32px;height:60px;
    background:rgba(9,9,11,0.85);backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(63,63,70,0.5);
  }
  .nav-logo{font-size:18px;font-weight:800;letter-spacing:-0.5px;color:var(--text)}
  .nav-logo span{color:var(--accent)}
  .nav-links{display:flex;gap:24px;align-items:center}
  .nav-links a{color:var(--sub);text-decoration:none;font-size:14px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{
    background:var(--accent);color:var(--text);border:none;border-radius:8px;
    padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;
    transition:opacity .2s;
  }
  .nav-cta:hover{opacity:.85}

  /* ── Hero ── */
  .hero{
    padding:140px 32px 80px;max-width:1100px;margin:0 auto;
    position:relative;z-index:1;
    display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;
  }
  .hero-left{}
  .hero-badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);
    color:var(--acc2);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;
    letter-spacing:0.5px;margin-bottom:24px;text-transform:uppercase;
  }
  .hero-badge::before{content:'●';color:var(--ok);font-size:8px}
  h1{
    font-size:clamp(38px,5vw,58px);font-weight:800;line-height:1.0;
    letter-spacing:-2px;margin-bottom:20px;
  }
  h1 .dim{color:var(--sub);font-weight:300}
  .hero-sub{font-size:17px;color:var(--sub);line-height:1.6;max-width:460px;margin-bottom:36px}
  .cta-group{display:flex;gap:12px;flex-wrap:wrap}
  .btn-primary{
    background:var(--accent);color:var(--text);border:none;border-radius:10px;
    padding:13px 28px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;
    transition:transform .15s,box-shadow .15s;
    box-shadow:0 0 0 0 rgba(99,102,241,0.4);
  }
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(99,102,241,0.35)}
  .btn-secondary{
    background:transparent;color:var(--sub);border:1px solid var(--border);border-radius:10px;
    padding:13px 28px;font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;
    transition:color .2s,border-color .2s;
  }
  .btn-secondary:hover{color:var(--text);border-color:var(--sub)}

  /* ── Status strip ── */
  .status-strip{
    display:flex;gap:20px;margin-top:40px;padding:14px 18px;
    background:var(--surf);border:1px solid var(--border);border-radius:10px;max-width:440px;
  }
  .status-item{display:flex;flex-direction:column;gap:2px}
  .status-val{font-size:18px;font-weight:800;color:var(--text)}
  .status-lbl{font-size:11px;color:var(--muted)}
  .status-val.ok{color:var(--ok)}
  .status-val.warn{color:var(--warn)}
  .status-val.crit{color:var(--crit)}

  /* ── Screen carousel ── */
  .hero-right{position:relative}
  .carousel{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:8px}
  .carousel::-webkit-scrollbar{display:none}
  .screen-card{
    flex-shrink:0;cursor:pointer;border-radius:16px;overflow:hidden;
    border:2px solid transparent;transition:border-color .2s,transform .2s;opacity:.5;
    background:var(--card);
  }
  .screen-card:hover{transform:translateY(-2px);opacity:.75}
  .screen-card.active{border-color:var(--accent);opacity:1;transform:scale(1.02)}
  .screen-card img{display:block;max-width:100%}
  .screen-label{
    font-size:10px;font-weight:600;color:var(--sub);letter-spacing:0.5px;
    text-transform:uppercase;padding:8px 12px 4px;
  }
  .screen-card.active .screen-label{color:var(--acc2)}

  /* ── Features ── */
  .features{max-width:1100px;margin:80px auto 0;padding:0 32px}
  .section-eyebrow{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin-bottom:12px}
  .section-title{font-size:32px;font-weight:800;letter-spacing:-1px;margin-bottom:48px;color:var(--text)}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .feat-card{
    background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;
    transition:border-color .2s;
  }
  .feat-card:hover{border-color:var(--accent)}
  .feat-icon{font-size:22px;margin-bottom:14px}
  .feat-card h3{font-size:15px;font-weight:700;margin-bottom:8px;color:var(--text)}
  .feat-card p{font-size:13px;color:var(--sub);line-height:1.6}

  /* ── Palette swatches ── */
  .palette-section{max-width:1100px;margin:80px auto 0;padding:0 32px}
  .palette-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
  .swatch{
    display:flex;flex-direction:column;gap:6px;align-items:center;
  }
  .swatch-dot{width:44px;height:44px;border-radius:10px;border:1px solid rgba(255,255,255,0.08)}
  .swatch-name{font-size:10px;color:var(--muted);font-weight:500}
  .swatch-hex{font-size:9px;color:var(--muted);font-family:monospace}

  /* ── Status legend ── */
  .legend-row{display:flex;gap:24px;margin-bottom:48px;flex-wrap:wrap}
  .legend-item{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub)}
  .legend-dot{width:10px;height:10px;border-radius:50%}

  /* ── Footer ── */
  footer{
    max-width:1100px;margin:80px auto 0;padding:32px 32px 48px;
    border-top:1px solid var(--border);
    display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;
  }
  .footer-brand{font-size:16px;font-weight:800;letter-spacing:-0.5px}
  .footer-brand span{color:var(--accent)}
  .footer-links{display:flex;gap:20px}
  .footer-links a{color:var(--sub);text-decoration:none;font-size:13px;transition:color .2s}
  .footer-links a:hover{color:var(--text)}
  .footer-credit{font-size:11px;color:var(--muted)}

  /* ── Responsive ── */
  @media(max-width:768px){
    .hero{grid-template-columns:1fr;gap:48px}
    .feat-grid{grid-template-columns:1fr}
    footer{flex-direction:column;align-items:flex-start}
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">W<span>A</span>RD</span>
  <div class="nav-links">
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/ward-viewer">View Design</a>
    <a href="https://ram.zenbin.org/ward-mock" class="nav-cta">Live Mock ↗</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-badge">● Incident Intelligence</div>
    <h1>See every<br/><span class="dim">signal.</span><br/>Silence the<br/>noise.</h1>
    <p class="hero-sub">WARD gives dev and SRE teams a unified view of service health, active incidents, and on-call coverage. Color speaks only when something needs your attention.</p>
    <div class="cta-group">
      <a href="https://ram.zenbin.org/ward-mock" class="btn-primary">Open Interactive Mock</a>
      <a href="https://ram.zenbin.org/ward-viewer" class="btn-secondary">Pencil Viewer →</a>
    </div>
    <div class="status-strip">
      <div class="status-item"><span class="status-val ok">99.87%</span><span class="status-lbl">Avg Uptime</span></div>
      <div class="status-item"><span class="status-val warn">1</span><span class="status-lbl">Degraded</span></div>
      <div class="status-item"><span class="status-val crit">1</span><span class="status-lbl">Down</span></div>
      <div class="status-item"><span class="status-val">12</span><span class="status-lbl">Services</span></div>
    </div>
  </div>
  <div class="hero-right">
    <div class="carousel">
      ${screenCardsHtml}
    </div>
  </div>
</section>

<section class="features">
  <p class="section-eyebrow">Design Highlights</p>
  <h2 class="section-title">Zinc elevation · Status-only color</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <h3>Zinc scale elevation</h3>
      <p>Three nested surfaces — <code>#09090B</code> → <code>#18181B</code> → <code>#27272A</code> — create depth without shadows. Inspired by the zinc color system trending on darkmodedesign.com.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <h3>Color = signal only</h3>
      <p>Emerald, amber, and rose are reserved exclusively for health status. Everything else — chrome, labels, borders — is achromatic zinc. No decorative color; every hue carries meaning.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">△</div>
      <h3>Calm design philosophy</h3>
      <p>One action per screen. Progressive disclosure of incident context. Ambient indigo glow at 5% opacity behind hero sections — visible without demanding attention.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <h3>Service health grid</h3>
      <p>2-column card grid surfaces all 12 services at a glance. p99 latency is the primary health signal per card — numbers over icons.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <h3>On-call clarity</h3>
      <p>Weekly schedule strip with avatar-based on-call ownership. Shift duration surfaced as a countdown, not a clock time — "14h 22m remaining" reduces cognitive load.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⚡</div>
      <h3>Firing alert state</h3>
      <p>Alert rules that are actively firing get a 5% opacity tint of their severity color behind the card row — subtle but unmistakable in peripheral vision.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-eyebrow">Color System</p>
  <h2 class="section-title">Zinc foundation · Signal accents</h2>
  <div class="palette-row">
    ${[
      { hex: '#09090B', name: 'BG',     label: 'zinc-950' },
      { hex: '#18181B', name: 'Surface', label: 'zinc-900' },
      { hex: '#27272A', name: 'Card',    label: 'zinc-800' },
      { hex: '#3F3F46', name: 'Border',  label: 'zinc-700' },
      { hex: '#71717A', name: 'Muted',   label: 'zinc-500' },
      { hex: '#A1A1AA', name: 'Sub',     label: 'zinc-400' },
      { hex: '#FAFAFA', name: 'Text',    label: 'zinc-50'  },
      { hex: '#6366F1', name: 'Accent',  label: 'indigo-500' },
      { hex: '#818CF8', name: 'Accent2', label: 'indigo-400' },
      { hex: '#10B981', name: 'Healthy', label: 'emerald-500' },
      { hex: '#F59E0B', name: 'Degraded', label: 'amber-500' },
      { hex: '#F43F5E', name: 'Critical', label: 'rose-500' },
    ].map(s => `<div class="swatch">
      <div class="swatch-dot" style="background:${s.hex}"></div>
      <span class="swatch-name">${s.name}</span>
      <span class="swatch-hex">${s.hex}</span>
    </div>`).join('')}
  </div>
  <div class="legend-row">
    <div class="legend-item"><div class="legend-dot" style="background:#10B981"></div>Healthy — systems nominal</div>
    <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div>Degraded — elevated latency or errors</div>
    <div class="legend-item"><div class="legend-dot" style="background:#F43F5E"></div>Critical — service down or P1 active</div>
  </div>
</section>

<footer>
  <div>
    <div class="footer-brand">W<span>A</span>RD</div>
    <p class="footer-credit">RAM Design Heartbeat #489 · ${new Date().toISOString().split('T')[0]}</p>
    <p class="footer-credit">Inspired by darkmodedesign.com zinc trend + saaspo.com Twingate bold dark</p>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/ward-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/ward-mock">Interactive Mock ↗</a>
  </div>
</footer>

<script>
function activateScreen(idx){
  document.querySelectorAll('.screen-card').forEach((c,i)=>{
    c.classList.toggle('active', i===idx);
  });
}
</script>
</body>
</html>`;

// ─── Viewer ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);
}

main().catch(console.error);
