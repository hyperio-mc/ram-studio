'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'koda';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
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

// ── Palette
const BG     = '#080B12';
const SURF   = '#0E1320';
const CARD   = '#141B2E';
const ACC    = '#00D4FF';
const ACC2   = '#8B5CF6';
const ACC3   = '#10B981';
const TEXT   = '#E8F0FE';
const MUTED  = 'rgba(140,160,210,0.6)';
const BORDER = 'rgba(0,212,255,0.18)';
const MONO   = "'Courier New', monospace";

// ── SVG thumbnail from screen elements
function elementToSVG(el) {
  if (el.type === 'rect') {
    const rx = el.rx || 0;
    const op = el.opacity ?? 1;
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${rx}" opacity="${op}" ${stroke}/>`;
  }
  if (el.type === 'text') {
    const op = el.opacity ?? 1;
    const anchor = el.textAnchor || 'start';
    const fw = el.fontWeight || 400;
    const font = el.fontFamily || 'Inter';
    const ls = el.letterSpacing || 0;
    const safeContent = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${safeContent}</text>`;
  }
  if (el.type === 'circle') {
    const op = el.opacity ?? 1;
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${op}" ${stroke}/>`;
  }
  if (el.type === 'line') {
    const op = el.opacity ?? 1;
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}" opacity="${op}"/>`;
  }
  return '';
}

function screenToSVG(screen, scale = 0.4) {
  const W = 390, H = 844;
  const svgEls = screen.elements.map(elementToSVG).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * scale}" height="${H * scale}" style="border-radius:18px;overflow:hidden;display:block;">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${svgEls}
  </svg>`;
}

// ── Hero HTML
const screenSVGs = pen.screens.map(s => screenToSVG(s));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KODA — Wealth Constellation Tracker</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};
    --acc:${ACC};--acc2:${ACC2};--acc3:${ACC3};
    --text:${TEXT};--muted:${MUTED};--border:${BORDER};
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

  /* star field */
  body::before{
    content:'';position:fixed;inset:0;
    background-image:
      radial-gradient(1px 1px at 12% 8%, rgba(232,240,254,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 42% 14%, rgba(232,240,254,0.3) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 71% 6%, rgba(0,212,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 22%, rgba(232,240,254,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 23% 35%, rgba(232,240,254,0.3) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 58% 41%, rgba(139,92,246,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 91% 50%, rgba(232,240,254,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 6% 62%, rgba(232,240,254,0.35) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 34% 78%, rgba(0,212,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 77% 88%, rgba(232,240,254,0.2) 0%, transparent 100%);
    pointer-events:none;z-index:0;
  }

  .content{position:relative;z-index:1}

  /* nav */
  nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid var(--border)}
  .logo{font-family:${MONO};font-size:22px;font-weight:700;color:var(--acc);letter-spacing:4px}
  .logo span{color:var(--text);opacity:0.6;font-size:10px;display:block;letter-spacing:2px;margin-top:2px}
  .nav-links{display:flex;gap:32px;align-items:center}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;letter-spacing:0.5px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:rgba(0,212,255,0.1);border:1px solid var(--acc);color:var(--acc);padding:8px 20px;border-radius:8px;font-size:12px;cursor:pointer;letter-spacing:1px;font-family:${MONO}}

  /* hero */
  .hero{text-align:center;padding:80px 40px 60px;max-width:900px;margin:0 auto}
  .hero-eyebrow{font-family:${MONO};font-size:10px;letter-spacing:3px;color:var(--acc);margin-bottom:20px;opacity:0.9}
  .hero-eyebrow span{background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);padding:4px 14px;border-radius:20px}
  h1{font-size:clamp(44px,7vw,80px);font-weight:700;line-height:1.05;letter-spacing:-2px;margin-bottom:16px}
  h1 em{font-style:normal;color:var(--acc)}
  .hero-sub{font-size:17px;color:var(--muted);max-width:520px;margin:0 auto 40px;line-height:1.6}
  .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:#000;font-weight:700;padding:14px 32px;border-radius:10px;border:none;cursor:pointer;font-size:14px;letter-spacing:0.5px;text-decoration:none;display:inline-block;transition:opacity .2s}
  .btn-primary:hover{opacity:0.85}
  .btn-secondary{background:transparent;color:var(--text);border:1px solid var(--border);padding:14px 32px;border-radius:10px;font-size:14px;cursor:pointer;text-decoration:none;display:inline-block;transition:border-color .2s}
  .btn-secondary:hover{border-color:var(--acc)}

  /* wealth number */
  .wealth-strip{display:flex;justify-content:center;gap:60px;padding:40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin:20px 0}
  .wealth-item{text-align:center}
  .wealth-val{font-size:32px;font-weight:700;font-family:${MONO};color:var(--acc)}
  .wealth-label{font-size:10px;color:var(--muted);letter-spacing:2px;margin-top:4px;font-family:${MONO}}

  /* screens */
  .screens-section{padding:60px 40px;max-width:1200px;margin:0 auto}
  .section-label{font-family:${MONO};font-size:10px;letter-spacing:3px;color:var(--muted);text-align:center;margin-bottom:40px}
  .screens-grid{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;justify-content:center;flex-wrap:wrap}
  .screen-card{flex:0 0 auto;text-align:center}
  .screen-card svg{box-shadow:0 0 40px rgba(0,212,255,0.08),0 0 0 1px rgba(0,212,255,0.12);border-radius:18px}
  .screen-label{font-family:${MONO};font-size:9px;letter-spacing:1.5px;color:var(--muted);margin-top:12px;text-transform:uppercase}

  /* feature grid */
  .features{padding:60px 40px;max-width:1100px;margin:0 auto}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .feature-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;position:relative;overflow:hidden}
  .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--acc),var(--acc2));opacity:0.6}
  .feature-icon{font-size:24px;margin-bottom:16px}
  .feature-title{font-size:15px;font-weight:600;margin-bottom:8px;color:var(--text)}
  .feature-desc{font-size:13px;color:var(--muted);line-height:1.6}

  /* palette */
  .palette-section{padding:40px;max-width:900px;margin:0 auto;text-align:center}
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px}
  .swatch{text-align:center}
  .swatch-box{width:52px;height:52px;border-radius:12px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.08)}
  .swatch-hex{font-family:${MONO};font-size:9px;color:var(--muted)}
  .swatch-name{font-size:9px;color:var(--muted);letter-spacing:0.5px}

  /* footer */
  footer{text-align:center;padding:40px;border-top:1px solid var(--border);margin-top:40px}
  .footer-links{display:flex;gap:24px;justify-content:center;margin-bottom:16px;flex-wrap:wrap}
  .footer-links a{color:var(--acc);text-decoration:none;font-size:13px;border:1px solid var(--border);padding:8px 20px;border-radius:8px;transition:border-color .2s}
  .footer-links a:hover{border-color:var(--acc)}
  .footer-meta{font-family:${MONO};font-size:10px;color:var(--muted);letter-spacing:1px}
</style>
</head>
<body>
<div class="content">

<nav>
  <div class="logo">KODA<span>wealth constellation</span></div>
  <div class="nav-links">
    <a href="#">Portfolio</a>
    <a href="#">Insights</a>
    <a href="#">Goals</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">VIEW DESIGN</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span>✦ RAM HEARTBEAT #501 · DARK THEME</span></div>
  <h1>Your wealth as a<br><em>constellation</em></h1>
  <p class="hero-sub">KODA maps your portfolio as a living star chart — AI-powered signals illuminate opportunities before they appear on any screen.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View in Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<div class="wealth-strip">
  <div class="wealth-item"><div class="wealth-val">$247,830</div><div class="wealth-label">NET WORTH</div></div>
  <div class="wealth-item"><div class="wealth-val" style="color:${ACC3}">+24.8%</div><div class="wealth-label">YTD RETURN</div></div>
  <div class="wealth-item"><div class="wealth-val" style="color:${ACC2}">84</div><div class="wealth-label">HEALTH SCORE</div></div>
  <div class="wealth-item"><div class="wealth-val">6</div><div class="wealth-label">SCREENS</div></div>
  <div class="wealth-item"><div class="wealth-val">852</div><div class="wealth-label">ELEMENTS</div></div>
</div>

<section class="screens-section">
  <div class="section-label">— 6 SCREENS · DARK THEME · MOBILE FIRST —</div>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      ${screenSVGs[i]}
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="section-label">— DESIGN DECISIONS —</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Concept-Driven Metaphor</div>
      <div class="feature-desc">Inspired by Superpower.com's anatomy-as-interface approach (Godly). Financial data becomes a star constellation — your assets are stars, AI signals are new stars appearing in your map.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Glow-State Dark System</div>
      <div class="feature-desc">Derived from QASE's starfield-glow pattern on Dark Mode Design. Cards use 1px cyan-glow borders and a top-edge accent strip. Hover states expand the glow rather than change fill — purely atmospheric.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⌨</div>
      <div class="feature-title">Monospace as Luxury Identity</div>
      <div class="feature-desc">Borrowing from KidSuper World's Diatype Mono usage (Awwwards). All financial data, timestamps, percentages, and technical labels use Courier New — signalling precision, not utility.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Progress Arcs as Orbit Rings</div>
      <div class="feature-desc">Portfolio allocation shown as concentric arc rings — each asset class orbiting a central net worth figure. Goals page uses the same orbital arc language to show progress toward targets.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Inline Sparklines on Every Row</div>
      <div class="feature-desc">Every asset row carries a 30-day sparkline — the movers list becomes a mini dashboard of trajectories, not just numbers. Color-coded by direction (cyan bullish, rose bearish).</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▼</div>
      <div class="feature-title">Sentiment-Coded Insight Cards</div>
      <div class="feature-desc">Each AI insight card has a left-edge accent strip colour-coded by urgency: ACC2 purple = action needed, ACC3 green = on track, red = alert. Color carries meaning at a glance.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">— CONSTELLATION DARK PALETTE —</div>
  <div class="swatches">
    <div class="swatch"><div class="swatch-box" style="background:#080B12;box-shadow:0 0 0 1px rgba(0,212,255,0.15)"></div><div class="swatch-hex">#080B12</div><div class="swatch-name">Deep Space</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#0E1320"></div><div class="swatch-hex">#0E1320</div><div class="swatch-name">Surface</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#141B2E"></div><div class="swatch-hex">#141B2E</div><div class="swatch-name">Card</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#00D4FF;box-shadow:0 0 12px rgba(0,212,255,0.4)"></div><div class="swatch-hex">#00D4FF</div><div class="swatch-name">Cyan Glow</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#8B5CF6;box-shadow:0 0 12px rgba(139,92,246,0.3)"></div><div class="swatch-hex">#8B5CF6</div><div class="swatch-name">Violet</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#10B981;box-shadow:0 0 12px rgba(16,185,129,0.3)"></div><div class="swatch-hex">#10B981</div><div class="swatch-name">Emerald</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#F43F5E;box-shadow:0 0 12px rgba(244,63,94,0.3)"></div><div class="swatch-hex">#F43F5E</div><div class="swatch-name">Rose Alert</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#E8F0FE"></div><div class="swatch-hex">#E8F0FE</div><div class="swatch-name">Star White</div></div>
  </div>
</section>

<footer>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Open in Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="footer-meta">RAM DESIGN HEARTBEAT #501 · KODA WEALTH CONSTELLATION · ${new Date().toISOString().split('T')[0]}</div>
</footer>

</div>
</body>
</html>`;

// ── Viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'KODA — Wealth Constellation Tracker');
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'KODA — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
