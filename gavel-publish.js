'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'gavel';
const APP_NAME = 'GAVEL';
const TAGLINE  = 'AI Legal Co-Pilot';

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
const pen     = JSON.parse(penJson);

// ── Build SVG data URIs for each screen ────────────────────────────────────
function buildSvg(screen) {
  const W = screen.canvas?.width  ?? 390;
  const H = screen.canvas?.height ?? 844;
  const bg = screen.canvas?.background ?? '#08080F';

  const elems = (screen.elements || []).filter(Boolean).map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,system-ui,sans-serif'}" text-anchor="${anchor}" opacity="${el.opacity??1}" letter-spacing="${el.letterSpacing||0}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity??1}"/>`;
    }
    return '';
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${elems}
</svg>`;
}

const svgs = pen.screens.map(s => buildSvg(s));
const dataUris = svgs.map(svg =>
  'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
);

// ── Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GAVEL — AI Legal Co-Pilot</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#08080F;--surf:#0F0F1A;--card:#141428;
    --acc:#8B5CF6;--acc2:#06B6D4;
    --success:#10B981;--warn:#F59E0B;--danger:#EF4444;
    --text:#E2E0F0;--mid:#9B96B8;--low:rgba(155,150,184,0.45);
    --glass:rgba(139,92,246,0.07);--gbord:rgba(139,92,246,0.22);
    --border:rgba(139,92,246,0.12);
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

  /* Ambient glow blobs */
  .blob{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
  .blob1{width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%);top:-100px;left:-100px}
  .blob2{width:500px;height:500px;background:radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%);bottom:-100px;right:-100px}

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;background:rgba(8,8,15,0.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
  .logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800;letter-spacing:-0.5px}
  .logo-glyph{width:32px;height:32px;background:var(--acc);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;box-shadow:0 0 20px rgba(139,92,246,0.5)}
  .nav-links{display:flex;gap:28px;font-size:13px;color:var(--mid)}
  .nav-links a{color:var(--mid);text-decoration:none;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--acc);color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;box-shadow:0 0 20px rgba(139,92,246,0.4);transition:box-shadow .2s}
  .nav-cta:hover{box-shadow:0 0 30px rgba(139,92,246,0.6)}

  /* HERO */
  .hero{position:relative;z-index:1;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 32px 80px;text-align:center;flex-direction:column}
  .ai-pill{display:inline-flex;align-items:center;gap:7px;background:rgba(139,92,246,0.12);border:1px solid var(--gbord);border-radius:20px;padding:5px 14px;font-size:11px;font-weight:700;color:var(--acc);letter-spacing:0.8px;margin-bottom:24px;text-transform:uppercase}
  .ai-dot{width:7px;height:7px;background:var(--acc);border-radius:50%;animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  h1{font-size:clamp(48px,7vw,80px);font-weight:800;letter-spacing:-2px;line-height:1.05;background:linear-gradient(135deg,var(--text) 0%,var(--acc) 60%,var(--acc2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px}
  .hero-sub{font-size:18px;color:var(--mid);max-width:520px;line-height:1.6;margin-bottom:36px}
  .hero-btns{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:60px}
  .btn-primary{background:var(--acc);color:#fff;padding:13px 28px;border-radius:24px;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 0 30px rgba(139,92,246,0.45);transition:box-shadow .2s}
  .btn-primary:hover{box-shadow:0 0 45px rgba(139,92,246,0.65)}
  .btn-ghost{background:var(--glass);border:1px solid var(--gbord);color:var(--text);padding:13px 28px;border-radius:24px;font-size:15px;font-weight:500;text-decoration:none;transition:background .2s}
  .btn-ghost:hover{background:rgba(139,92,246,0.12)}

  /* Screen carousel */
  .carousel{display:flex;gap:20px;overflow-x:auto;padding:10px 32px;scrollbar-width:none;-ms-overflow-style:none}
  .carousel::-webkit-scrollbar{display:none}
  .screen-card{flex-shrink:0;width:195px;border-radius:20px;overflow:hidden;border:1px solid var(--gbord);box-shadow:0 8px 40px rgba(0,0,0,0.4);transition:transform .3s;cursor:pointer}
  .screen-card:hover{transform:translateY(-6px)}
  .screen-card img{width:100%;height:auto;display:block}
  .screen-label{text-align:center;font-size:11px;color:var(--mid);margin-top:8px}

  /* CONTENT sections */
  section{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:80px 32px}

  /* Features bento */
  .bento{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
  .bento-card{background:var(--glass);border:1px solid var(--gbord);border-radius:16px;padding:24px}
  .bento-card.span4{grid-column:span 4}
  .bento-card.span6{grid-column:span 6}
  .bento-card.span8{grid-column:span 8}
  .bento-card.span12{grid-column:span 12}
  @media(max-width:700px){.bento-card.span4,.bento-card.span6,.bento-card.span8,.bento-card.span12{grid-column:span 12}}
  .bento-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
  .bento-card h3{font-size:16px;font-weight:700;margin-bottom:6px}
  .bento-card p{font-size:13px;color:var(--mid);line-height:1.5}
  .tag{display:inline-block;padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;letter-spacing:0.5px;margin-bottom:10px;text-transform:uppercase}
  .tag-acc{background:rgba(139,92,246,0.15);color:var(--acc)}
  .tag-danger{background:rgba(239,68,68,0.15);color:var(--danger)}
  .tag-success{background:rgba(16,185,129,0.15);color:var(--success)}
  .tag-warn{background:rgba(245,158,11,0.15);color:var(--warn)}

  /* Palette swatches */
  .palette{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
  .swatch{width:48px;height:48px;border-radius:10px;position:relative;overflow:hidden}
  .swatch-label{font-size:9px;color:var(--mid);text-align:center;margin-top:3px}

  /* Stats row */
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:40px 0}
  .stat{text-align:center;background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:20px 10px}
  .stat-val{font-size:32px;font-weight:800;color:var(--acc);margin-bottom:4px}
  .stat-label{font-size:12px;color:var(--mid)}
  @media(max-width:600px){.stats{grid-template-columns:repeat(2,1fr)}}

  /* Section titles */
  .section-label{font-size:11px;font-weight:700;letter-spacing:1.2px;color:var(--acc);text-transform:uppercase;margin-bottom:10px}
  .section-title{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-1px;margin-bottom:14px}
  .section-sub{font-size:16px;color:var(--mid);max-width:500px;line-height:1.6;margin-bottom:40px}

  /* Footer */
  footer{position:relative;z-index:1;text-align:center;padding:40px 32px;border-top:1px solid var(--border);color:var(--low);font-size:12px}
  footer a{color:var(--acc);text-decoration:none}

  /* Risk demo */
  .risk-demo{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .risk-chip{padding:4px 12px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}
  .risk-high{background:rgba(239,68,68,0.15);color:#EF4444;border:1px solid rgba(239,68,68,0.3)}
  .risk-med{background:rgba(245,158,11,0.15);color:#F59E0B;border:1px solid rgba(245,158,11,0.3)}
  .risk-low{background:rgba(16,185,129,0.15);color:#10B981;border:1px solid rgba(16,185,129,0.3)}
  .risk-clr{background:rgba(6,182,212,0.15);color:#06B6D4;border:1px solid rgba(6,182,212,0.3)}
</style>
</head>
<body>
<div class="blob blob1"></div>
<div class="blob blob2"></div>

<nav>
  <div class="logo">
    <div class="logo-glyph">⚖</div>
    GAVEL
  </div>
  <div class="nav-links">
    <a href="#">Research</a>
    <a href="#">Documents</a>
    <a href="#">Timeline</a>
    <a href="#">Insights</a>
  </div>
  <a href="https://ram.zenbin.org/gavel-mock" class="nav-cta">Try Mock →</a>
</nav>

<div class="hero">
  <div class="ai-pill"><span class="ai-dot"></span> Powered by AI · Legal Intelligence</div>
  <h1>Your AI Legal<br>Co-Pilot</h1>
  <p class="hero-sub">GAVEL analyzes contracts, researches precedents, tracks case timelines, and surfaces AI-powered risk insights — all in one dark, focused interface.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/gavel-viewer" class="btn-primary">View Full Design →</a>
    <a href="https://ram.zenbin.org/gavel-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>

  <!-- Screen carousel -->
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div>
      <div class="screen-card">
        <img src="${dataUris[i]}" alt="${s.name}" loading="lazy">
      </div>
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<!-- Stats -->
<section>
  <div class="stats">
    <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
    <div class="stat"><div class="stat-val">587</div><div class="stat-label">Elements</div></div>
    <div class="stat"><div class="stat-val">26</div><div class="stat-label">Heartbeat #</div></div>
    <div class="stat"><div class="stat-val">Dark</div><div class="stat-label">Theme</div></div>
  </div>
</section>

<!-- Features bento -->
<section>
  <div class="section-label">Features</div>
  <div class="section-title">Built for the Modern Litigator</div>
  <div class="section-sub">Every screen is designed to surface what matters — risks, deadlines, precedents — without friction.</div>

  <div class="bento">
    <div class="bento-card span8">
      <div class="tag tag-danger">Contract Risk</div>
      <div class="bento-icon" style="background:rgba(239,68,68,0.12)">⚠️</div>
      <h3>Automated Risk Detection</h3>
      <p>AI scans every uploaded contract and flags clauses against jurisdiction-specific law. Unenforceable non-competes, missing severability, GDPR gaps — surfaced instantly.</p>
      <div class="risk-demo">
        <span class="risk-chip risk-high">HIGH RISK</span>
        <span class="risk-chip risk-med">MEDIUM</span>
        <span class="risk-chip risk-low">LOW RISK</span>
        <span class="risk-chip risk-clr">CLEAR</span>
      </div>
    </div>
    <div class="bento-card span4">
      <div class="tag tag-acc">Research</div>
      <div class="bento-icon" style="background:rgba(139,92,246,0.12)">⊙</div>
      <h3>Precedent Search</h3>
      <p>Natural language search across millions of cases. Relevance-ranked results with AI summaries and confidence scores.</p>
    </div>
    <div class="bento-card span4">
      <div class="tag tag-warn">Deadlines</div>
      <div class="bento-icon" style="background:rgba(245,158,11,0.12)">🗓</div>
      <h3>Case Timeline</h3>
      <p>Visual milestone tracking with urgency flags and countdown indicators for upcoming court dates.</p>
    </div>
    <div class="bento-card span8">
      <div class="tag tag-acc">AI Insights</div>
      <div class="bento-icon" style="background:rgba(139,92,246,0.12)">⚡</div>
      <h3>Proactive Intelligence</h3>
      <p>GAVEL doesn't wait to be asked. It monitors all active matters and surfaces high-priority insights — precedent matches, filing windows, signature gaps — before they become problems. Every card shows a confidence percentage so you know exactly how to weight each recommendation.</p>
    </div>
    <div class="bento-card span6">
      <div class="tag tag-success">Performance</div>
      <div class="bento-icon" style="background:rgba(16,185,129,0.12)">◎</div>
      <h3>Win Rate Analytics</h3>
      <p>Track outcomes over time and understand which strategies correlate with wins in each judge's courtroom.</p>
    </div>
    <div class="bento-card span6">
      <div class="tag tag-acc">Security</div>
      <div class="bento-icon" style="background:rgba(6,182,212,0.12)">🛡</div>
      <h3>Bar-Connected Profile</h3>
      <p>Attorney verification, 2FA, encrypted document storage, and data export compliant with state bar requirements.</p>
    </div>
  </div>
</section>

<!-- Palette -->
<section>
  <div class="section-label">Design System</div>
  <div class="section-title">Dark Violet × Glassmorphism</div>
  <p style="color:var(--mid);font-size:14px;margin-bottom:24px">Inspired by saaspo.com's AI SaaS purple dominance trend and darkmodedesign.com's glassmorphism elevation patterns. Near-OLED black base with violet-tinted surfaces, ambient glows, and a four-level risk color system.</p>
  <div class="palette">
    ${[
      ['#08080F','BG'], ['#0F0F1A','Surface'], ['#141428','Card'],
      ['#8B5CF6','Violet'], ['#06B6D4','Cyan'],
      ['#10B981','Success'], ['#F59E0B','Warn'], ['#EF4444','Danger'],
      ['#E2E0F0','Text'], ['#9B96B8','Mid'],
    ].map(([c,n]) => `<div><div class="swatch" style="background:${c};border:1px solid rgba(255,255,255,0.08)"></div><div class="swatch-label">${n}<br><span style="font-size:8px;opacity:0.6">${c}</span></div></div>`).join('')}
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat #26 · April 2026</p>
  <p style="margin-top:6px">
    <a href="https://ram.zenbin.org/gavel-viewer">Pen Viewer</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org/gavel-mock">Interactive Mock ☀◑</a>
  </p>
</footer>
</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── Publish ────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero   : ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer : ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
