'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'burl';
const APP_NAME = 'BURL';
const TAGLINE  = 'Craft your revenue. Own your time.';

// Palette
const P = {
  bg:      '#FAF7F2',
  surf:    '#FFFFFF',
  card:    '#F2EDE5',
  text:    '#1C1410',
  textMid: '#4A3F36',
  muted:   '#9C8F85',
  accent:  '#4A7C59',
  accent2: '#C4714A',
  accent3: '#8B6FAE',
  line:    '#E0D8CE',
};

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
const pen     = JSON.parse(penJson);

// ── Render SVG screens ────────────────────────────────────────────────────────
function renderSVG(screen, W, H) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '';
      svg += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${rx}"${op}${st}/>`;
    } else if (el.type === 'circle') {
      const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '';
      svg += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${op}${st}/>`;
    } else if (el.type === 'text') {
      const fw     = el.fw   || 400;
      const anchor = el.anchor === 'middle' ? 'middle' : el.anchor === 'end' ? 'end' : 'start';
      const ls     = el.ls   ? ` letter-spacing="${el.ls}"` : '';
      const op     = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      const font   = el.font === 'serif' ? 'Georgia, serif' : 'Inter, system-ui, sans-serif';
      svg += `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${fw}" text-anchor="${anchor}" font-family="${font}"${ls}${op}>${el.content}</text>`;
    } else if (el.type === 'line') {
      const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      svg += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw || 1}"${op}/>`;
    }
  }
  svg += '</svg>';
  return svg;
}

const W = 390, H = 844;
const svgScreens = pen.screens.map(s => renderSVG(s, W, H));
const svgDataURIs = svgScreens.map(s => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64'));

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:     ${P.bg};
    --surf:   ${P.surf};
    --card:   ${P.card};
    --text:   ${P.text};
    --mid:    ${P.textMid};
    --muted:  ${P.muted};
    --accent: ${P.accent};
    --a2:     ${P.accent2};
    --a3:     ${P.accent3};
    --line:   ${P.line};
  }
  body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  /* NAV */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid var(--line);
    position: sticky; top: 0; background: rgba(250,247,242,0.9);
    backdrop-filter: blur(12px); z-index: 10;
  }
  .logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: var(--text); }
  .logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { text-decoration: none; color: var(--muted); font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff; padding: 10px 24px; border-radius: 24px;
    font-size: 14px; font-weight: 700; text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    max-width: 1100px; margin: 0 auto; padding: 100px 48px 60px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 20px;
  }
  .hero h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 64px; line-height: 1.05; font-weight: 700;
    color: var(--text); margin-bottom: 24px;
    letter-spacing: -1.5px;
  }
  .hero h1 em { color: var(--accent); font-style: italic; }
  .hero p {
    font-size: 18px; line-height: 1.65; color: var(--mid);
    margin-bottom: 36px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--accent); color: #fff; padding: 14px 32px; border-radius: 30px;
    font-size: 15px; font-weight: 700; text-decoration: none; transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary {
    color: var(--mid); font-size: 14px; font-weight: 500; text-decoration: none;
    display: flex; align-items: center; gap: 6px;
  }
  .hero-social {
    margin-top: 48px; display: flex; gap: 32px; padding-top: 32px;
    border-top: 1px solid var(--line);
  }
  .stat-item { display: flex; flex-direction: column; gap: 4px; }
  .stat-num { font-size: 28px; font-weight: 800; color: var(--text); }
  .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }

  /* Phone mockup */
  .phone-wrap { display: flex; justify-content: center; align-items: center; position: relative; }
  .phone {
    background: var(--surf); border-radius: 48px; padding: 12px;
    box-shadow: 0 40px 80px rgba(28,20,16,0.15), 0 8px 24px rgba(28,20,16,0.08);
    border: 2px solid var(--line); width: 280px;
  }
  .phone-screen { border-radius: 38px; overflow: hidden; }
  .phone-screen img { width: 100%; display: block; }
  .phone-notch {
    width: 80px; height: 28px; background: var(--text); border-radius: 0 0 20px 20px;
    margin: 0 auto 6px;
  }

  /* FEATURES bento grid */
  .features {
    max-width: 1100px; margin: 0 auto; padding: 80px 48px;
  }
  .features-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 48px; text-align: center;
  }
  .bento {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--surf); border: 1px solid var(--line);
    border-radius: 24px; padding: 32px; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .bento-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(28,20,16,0.08); }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.accent-card { background: var(--accent); border-color: transparent; }
  .bento-card.accent-card h3, .bento-card.accent-card p { color: #fff; }
  .bento-card.accent-card p { opacity: 0.75; }
  .card-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 20px;
  }
  .card-icon.green { background: rgba(74,124,89,0.12); }
  .card-icon.orange { background: rgba(196,113,74,0.12); }
  .card-icon.purple { background: rgba(139,111,174,0.12); }
  .card-icon.cream { background: var(--card); }
  .bento-card h3 { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
  .bento-card p { font-size: 14px; line-height: 1.6; color: var(--muted); }

  /* Bento bar visual */
  .mini-bars { margin-top: 20px; display: flex; gap: 6px; align-items: flex-end; height: 48px; }
  .mini-bar { flex: 1; border-radius: 4px; }

  /* Palette */
  .palette-section {
    max-width: 1100px; margin: 0 auto; padding: 0 48px 80px;
    display: flex; gap: 16px; align-items: center;
  }
  .palette-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; font-weight: 600; flex-shrink: 0; }
  .swatches { display: flex; gap: 10px; }
  .swatch { width: 36px; height: 36px; border-radius: 10px; }

  /* Screens carousel */
  .screens-section {
    max-width: 1200px; margin: 0 auto; padding: 40px 48px 80px;
  }
  .screens-label { font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 32px; text-align: center; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px;
  }
  .screen-card {
    background: var(--surf); border: 1px solid var(--line);
    border-radius: 20px; padding: 8px; overflow: hidden;
  }
  .screen-card img { width: 100%; border-radius: 14px; display: block; }
  .screen-name { text-align: center; font-size: 10px; color: var(--muted); margin-top: 8px; font-weight: 600; letter-spacing: 0.5px; }

  /* CTA */
  .cta-section {
    background: var(--accent); text-align: center; padding: 80px 48px;
  }
  .cta-section h2 {
    font-family: Georgia, serif; font-size: 48px; color: #fff;
    margin-bottom: 16px; letter-spacing: -1px;
  }
  .cta-section p { color: rgba(255,255,255,0.75); font-size: 18px; margin-bottom: 32px; }
  .cta-links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .cta-btn-white { background: #fff; color: var(--accent); padding: 14px 32px; border-radius: 30px; font-size: 15px; font-weight: 700; text-decoration: none; }
  .cta-btn-ghost { border: 2px solid rgba(255,255,255,0.4); color: #fff; padding: 14px 32px; border-radius: 30px; font-size: 15px; font-weight: 600; text-decoration: none; }

  /* Footer */
  footer { padding: 32px 48px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
  footer p { font-size: 13px; color: var(--muted); }
</style>
</head>
<body>

<nav>
  <div class="logo">BU<span>RL</span></div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-label">Freelance Finance Tracker · Heartbeat #50</div>
    <h1>Craft your revenue.<br><em>Own your time.</em></h1>
    <p>BURL is a mindful tracker for independent makers — revenue, time, projects, and milestones in one warm, editorial space. No clutter. No overwhelm.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Explore the Mock →</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil ↗</a>
    </div>
    <div class="hero-social">
      <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">Screens</span></div>
      <div class="stat-item"><span class="stat-num">466</span><span class="stat-label">Elements</span></div>
      <div class="stat-item"><span class="stat-num">Light</span><span class="stat-label">Theme</span></div>
      <div class="stat-item"><span class="stat-num">#50</span><span class="stat-label">Heartbeat</span></div>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="${svgDataURIs[0]}" alt="Dashboard Screen" />
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-label">What's inside</div>
  <div class="bento">
    <div class="bento-card accent-card">
      <div class="card-icon cream">📊</div>
      <h3>Bento Dashboard</h3>
      <p>Inspired by the bento grid trend dominating SaaS design in 2026 — revenue, hours, projects and clients in one scannable layout.</p>
      <div class="mini-bars">
        ${[40,65,50,80,70,90,60].map((h, i) => `<div class="mini-bar" style="height:${h}%;background:rgba(255,255,255,${0.2 + i*0.08});border-radius:4px;"></div>`).join('')}
      </div>
    </div>
    <div class="bento-card">
      <div class="card-icon green">⏱</div>
      <h3>Time Logging</h3>
      <p>Weekly bar charts, session breakdowns, live timer, and a daily rate calculator — all in warm cream clarity.</p>
    </div>
    <div class="bento-card">
      <div class="card-icon orange">📁</div>
      <h3>Project Tracker</h3>
      <p>See every active project, budget consumed, and completion progress. Colour-coded and scannable.</p>
    </div>
    <div class="bento-card">
      <div class="card-icon purple">◈</div>
      <h3>Invoice Manager</h3>
      <p>Sent, paid, pending, draft — full invoice lifecycle at a glance with status badges and running totals.</p>
    </div>
    <div class="bento-card wide">
      <div class="card-icon green">🌿</div>
      <h3>Milestone Goals — Gamified</h3>
      <p>Achievement rings, progress milestones, and annual revenue goals that feel like craft — not a spreadsheet. Hit $10K months. Earn badges. Watch your practice grow.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <span class="palette-label">Palette</span>
  <div class="swatches">
    ${[P.bg, P.surf, P.card, P.text, P.textMid, P.muted, P.accent, P.accent2, P.accent3, P.line].map(c => `<div class="swatch" title="${c}" style="background:${c};border:1px solid #E0D8CE;"></div>`).join('')}
  </div>
</section>

<section class="screens-section">
  <div class="screens-label">All 6 Screens</div>
  <div class="screens-grid">
    ${svgDataURIs.map((uri, i) => `
    <div class="screen-card">
      <img src="${uri}" alt="${pen.screens[i].name}" />
      <div class="screen-name">${pen.screens[i].name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <h2>Try the interactive mock</h2>
  <p>Navigate all 6 screens with light/dark toggle — built in Svelte 5.</p>
  <div class="cta-links">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-btn-white">Open Mock ☀◑</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="cta-btn-ghost">Pencil Viewer</a>
  </div>
</section>

<footer>
  <p>BURL — RAM Design Heartbeat #50 · ${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</p>
  <p style="color:var(--accent);font-weight:600;">ram.zenbin.org/${SLUG}</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : 'OK');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : 'OK');

  console.log('Done.');
  console.log(`Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
