'use strict';
// publish-prism-heartbeat.js
// Full Design Discovery pipeline for PRISM
// Design Heartbeat — Mar 23, 2026
// Inspired by:
//   • Tracebit "The answer to Assume Breach" landing page (land-book.com)
//   • Dark security UIs on darkmodedesign.com (Linear, Forge, Superset)
//   • Evervault Customers page (godly.website) — encryption/security dark editorial style

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'prism';
const VIEWER_SLUG = 'prism-viewer';
const DATE_STR    = 'March 23, 2026';
const APP_NAME    = 'PRISM';
const TAGLINE     = 'Unified Threat Intelligence';
const ARCHETYPE   = 'security-ops';
const MOCK_URL    = 'https://ram.zenbin.org/prism-mock';

const ORIGINAL_PROMPT = `Inspired by Tracebit "Assume Breach" on land-book.com + dark security UIs on darkmodedesign.com — a mobile threat intelligence platform with dense data dashboard, monospace type for event data, electric cyan + amber alerts on deep navy. Zero-trust posture meets clean mobile UI.`;

const P = {
  bg:       '#080A0F',
  surface:  '#0E1118',
  surface2: '#141824',
  border:   '#1E2535',
  cyan:     '#00E8D6',
  cyanDim:  '#00E8D620',
  amber:    '#F59E0B',
  red:      '#EF4444',
  green:    '#22C55E',
  text:     '#E8EAF2',
  muted:    '#5A6380',
  dim:      '#2A3048',
  purple:   '#8B5CF6',
};

function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

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

function buildHeroHTML(pen) {
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const viewerURL  = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const shareText  = encodeURIComponent(`${APP_NAME} — ${TAGLINE} | RAM Design Studio`);
  const shareURL   = encodeURIComponent(`https://ram.zenbin.org/${SLUG}`);

  const swatches = [
    { color: P.bg,      label: 'Void'    },
    { color: P.surface, label: 'Surface' },
    { color: P.surface2,label: 'Card'    },
    { color: P.cyan,    label: 'Cyan'    },
    { color: P.amber,   label: 'Amber'   },
    { color: P.red,     label: 'Critical'},
    { color: P.green,   label: 'Safe'    },
    { color: P.purple,  label: 'Medium'  },
  ].map(({ color, label }) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div style="width:44px;height:44px;border-radius:10px;background:${color};border:1px solid ${P.border}"></div>
      <span style="font-size:9px;color:${P.muted};letter-spacing:0.5px">${label}</span>
      <span style="font-size:8px;color:${P.muted};font-family:monospace">${color}</span>
    </div>`
  ).join('');

  const typeRows = [
    { size: '32px', weight: 700, label: 'PRISM COMMAND', family: 'Inter', note: 'Display — 32 / 700' },
    { size: '14px', weight: 700, label: 'EVENT STREAM', family: 'Inter', note: 'Label — 14 / 700 / letterspacing 3px' },
    { size: '11px', weight: 600, label: 'Lateral Movement Detected', family: 'Inter', note: 'Body — 11 / 600' },
    { size: '10px', weight: 400, label: 'host-db-04 → host-int-17 via SMB', family: 'JetBrains Mono', note: 'Mono — 10 / 400 (data)' },
    { size: '8px',  weight: 700, label: 'CRITICAL  ·  RISK 98', family: 'Inter', note: 'Tag — 8 / 700 / spacing 1.5' },
  ].map(({ size, weight, label, family, note }) =>
    `<div style="padding:14px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:${size};font-weight:${weight};color:${P.text};font-family:'${family}',monospace;letter-spacing:${weight===700&&size==='14px'?'3px':'normal'}">${label}</div>
      <div style="font-size:10px;color:${P.muted};font-family:monospace;margin-top:4px">${note}</div>
    </div>`
  ).join('');

  const screenLabels = [
    { id: 1, title: 'Command Center', desc: 'Threat score ring, live event feed, key metrics' },
    { id: 2, title: 'Event Stream',   desc: 'Real-time security events with MITRE tagging' },
    { id: 3, title: 'Incident Detail',desc: 'Attack timeline, risk factors, containment' },
    { id: 4, title: 'Asset Inventory',desc: 'Protected systems with health scores' },
    { id: 5, title: 'Threat Intel',   desc: 'IOCs, feed health, hash/IP/domain lookup' },
    { id: 6, title: 'Profile',        desc: 'Analyst stats, notifications, security settings' },
  ].map(({ id, title, desc }) =>
    `<div style="padding:16px;background:${P.surface};border-radius:10px;border:1px solid ${P.border}">
      <div style="font-size:9px;color:${P.cyan};letter-spacing:2px;margin-bottom:6px">SCREEN ${id}</div>
      <div style="font-size:13px;font-weight:700;color:${P.text};margin-bottom:4px">${title}</div>
      <div style="font-size:11px;color:${P.muted}">${desc}</div>
    </div>`
  ).join('');

  const decisionRows = [
    {
      title: 'Threat Score Ring',
      detail: 'Instead of a flat number, the score is displayed as a circular ring with status label. Amber at 72 = Elevated — gives immediate gestalt read before you parse a single digit.',
    },
    {
      title: 'Monospace for Data, Sans for UI',
      detail: 'IP addresses, hashes, hostnames render in JetBrains Mono. Navigation, titles, and labels use Inter. This creates a "terminal inside an app" feel — familiar to analysts, legible for everyone.',
    },
    {
      title: 'Left Accent Bar Severity System',
      detail: 'Each event card has a 3px colored left border (red/amber/purple/muted). This lets analysts scan severity at the far-left edge without reading — a pattern borrowed from IDE error gutter markers.',
    },
    {
      title: 'Dense-but-Breathable Card Grid',
      detail: 'Cards are compact (48–76px tall) with 1px borders. The background alternates between #0E1118 and transparent to create rhythm without heavy dividers. Inspired by Superset\'s data table aesthetic on darkmodedesign.com.',
    },
  ].map(({ title, detail }) =>
    `<div style="padding:20px;background:${P.surface};border-radius:12px;border:1px solid ${P.border};border-left:3px solid ${P.cyan}">
      <div style="font-size:13px;font-weight:700;color:${P.text};margin-bottom:8px">${title}</div>
      <div style="font-size:12px;color:${P.muted};line-height:1.7">${detail}</div>
    </div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PRISM — Unified Threat Intelligence | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: ${P.bg};
    color: ${P.text};
    line-height: 1.6;
  }
  a { color: ${P.cyan}; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px 60px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -200px; left: 50%; transform: translateX(-50%);
    width: 800px; height: 600px;
    background: radial-gradient(ellipse at center, ${P.cyan}10 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px;
    background: ${P.cyan}15;
    border: 1px solid ${P.cyan}40;
    border-radius: 20px;
    font-size: 10px; font-weight: 700; color: ${P.cyan};
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 32px;
  }
  .hero-badge .dot {
    width: 6px; height: 6px;
    background: ${P.red};
    border-radius: 3px;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
  .hero-title {
    font-size: clamp(48px, 10vw, 80px);
    font-weight: 900;
    letter-spacing: -2px;
    line-height: 1;
    background: linear-gradient(135deg, ${P.text} 30%, ${P.cyan} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
  }
  .hero-tagline {
    font-size: 18px; font-weight: 500;
    color: ${P.muted}; letter-spacing: 4px; text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-desc {
    font-size: 16px; color: ${P.muted};
    max-width: 580px; line-height: 1.8;
    margin-bottom: 40px;
  }
  .hero-cta {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
  }
  .btn-primary {
    padding: 14px 32px;
    background: ${P.cyan};
    color: ${P.bg};
    font-size: 13px; font-weight: 700;
    letter-spacing: 1px;
    border-radius: 8px;
    text-decoration: none;
    transition: opacity .2s;
  }
  .btn-primary:hover { opacity: 0.85; text-decoration: none; }
  .btn-ghost {
    padding: 14px 32px;
    background: transparent;
    border: 1px solid ${P.border};
    color: ${P.text};
    font-size: 13px; font-weight: 600;
    letter-spacing: 1px;
    border-radius: 8px;
    text-decoration: none;
    transition: border-color .2s;
  }
  .btn-ghost:hover { border-color: ${P.cyan}; text-decoration: none; }

  /* Threat stat pills */
  .stat-row {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
    margin-top: 48px;
  }
  .stat-pill {
    padding: 10px 20px;
    background: ${P.surface};
    border: 1px solid ${P.border};
    border-radius: 8px;
    text-align: center;
  }
  .stat-pill .val { font-size: 22px; font-weight: 700; }
  .stat-pill .lbl { font-size: 9px; color: ${P.muted}; letter-spacing: 1.5px; margin-top: 2px; }

  section { padding: 80px 24px; max-width: 960px; margin: 0 auto; }

  h2.section-title {
    font-size: 12px; font-weight: 700; color: ${P.cyan};
    letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 32px;
  }

  .screen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  .swatch-row {
    display: flex; gap: 16px; flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .decision-stack { display: flex; flex-direction: column; gap: 16px; }
  .type-scale { }

  .preview-frame {
    width: 100%; max-width: 960px; margin: 0 auto;
    border: 1px solid ${P.border};
    border-radius: 16px; overflow: hidden;
    background: ${P.surface};
  }
  .preview-frame iframe {
    width: 100%; height: 560px; border: 0;
    display: block;
  }
  .preview-label {
    padding: 12px 20px;
    font-size: 11px; color: ${P.muted};
    border-top: 1px solid ${P.border};
    display: flex; justify-content: space-between; align-items: center;
  }

  footer {
    border-top: 1px solid ${P.border};
    padding: 40px 24px;
    text-align: center;
    color: ${P.muted}; font-size: 12px;
  }
  footer a { color: ${P.cyan}; }
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-badge">
    <span class="dot"></span>
    RAM Design Heartbeat · ${DATE_STR}
  </div>
  <div class="hero-title">PRISM</div>
  <div class="hero-tagline">Unified Threat Intelligence</div>
  <p class="hero-desc">
    A mobile security operations platform inspired by the "Assume Breach" movement — dense, analyst-first dark UI with real-time threat scoring, MITRE-tagged event streams, and zero-trust asset monitoring.
  </p>
  <div class="hero-cta">
    <a class="btn-primary" href="${viewerURL}" target="_blank">View Design ›</a>
    <a class="btn-ghost" href="${MOCK_URL}" target="_blank">Interactive Mock ☀◑</a>
  </div>

  <div class="stat-row">
    <div class="stat-pill">
      <div class="val" style="color:${P.red}">17</div>
      <div class="lbl">ACTIVE ALERTS</div>
    </div>
    <div class="stat-pill">
      <div class="val" style="color:${P.amber}">72</div>
      <div class="lbl">THREAT SCORE</div>
    </div>
    <div class="stat-pill">
      <div class="val" style="color:${P.green}">98.2%</div>
      <div class="lbl">ASSETS SAFE</div>
    </div>
    <div class="stat-pill">
      <div class="val" style="color:${P.cyan}">6</div>
      <div class="lbl">SCREENS</div>
    </div>
    <div class="stat-pill">
      <div class="val" style="color:${P.text}">Dark</div>
      <div class="lbl">THEME</div>
    </div>
  </div>
</div>

<!-- PREVIEW -->
<section style="max-width:960px;padding-top:0">
  <h2 class="section-title">Design Preview</h2>
  <div class="preview-frame">
    <iframe src="${viewerURL}" loading="lazy" title="PRISM Design Preview"></iframe>
    <div class="preview-label">
      <span>PRISM — 6 screens · pencil.dev v2.8</span>
      <a href="${viewerURL}" target="_blank">Open full viewer →</a>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section>
  <h2 class="section-title">Screen Architecture</h2>
  <div class="screen-grid">${screenLabels}</div>
</section>

<!-- PALETTE -->
<section>
  <h2 class="section-title">Colour Palette</h2>
  <div class="swatch-row">${swatches}</div>
  <p style="font-size:13px;color:${P.muted};line-height:1.8">
    Void navy (<code style="font-family:JetBrains Mono;font-size:11px">#080A0F</code>) as base keeps brightness minimal for prolonged SOC use. Electric cyan (<code style="font-family:JetBrains Mono;font-size:11px">#00E8D6</code>) is the interactive accent — used only for active states, links, and the threat-score ring. Severity colours follow a traffic-light system: red for critical, amber for high, purple for medium, muted grey for low. Green appears only for safe/healthy states.
  </p>
</section>

<!-- TYPOGRAPHY -->
<section>
  <h2 class="section-title">Type System</h2>
  <div class="type-scale">${typeRows}</div>
</section>

<!-- DESIGN DECISIONS -->
<section>
  <h2 class="section-title">Design Decisions</h2>
  <div class="decision-stack">${decisionRows}</div>
</section>

<!-- RESEARCH -->
<section>
  <h2 class="section-title">Inspiration & Research</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
    <div style="padding:20px;background:${P.surface};border-radius:12px;border:1px solid ${P.border}">
      <div style="font-size:10px;color:${P.cyan};letter-spacing:1.5px;margin-bottom:8px">LAND-BOOK.COM</div>
      <div style="font-size:13px;font-weight:700;color:${P.text};margin-bottom:6px">Tracebit — "The Answer to Assume Breach"</div>
      <div style="font-size:12px;color:${P.muted};line-height:1.7">Cybersecurity SaaS featuring bold "assume breach" framing, dark editorial layouts, and dense capability grids. Sparked the SOC analyst persona and threat-score prominence.</div>
    </div>
    <div style="padding:20px;background:${P.surface};border-radius:12px;border:1px solid ${P.border}">
      <div style="font-size:10px;color:${P.cyan};letter-spacing:1.5px;margin-bottom:8px">DARKMODEDESIGN.COM</div>
      <div style="font-size:13px;font-weight:700;color:${P.text};margin-bottom:6px">Linear · Superset · Forge</div>
      <div style="font-size:12px;color:${P.muted};line-height:1.7">Three featured apps all showed the same pattern: deep navy backgrounds, 1px borders, tiny monospace labels on data, and colour used strictly as signal not decoration.</div>
    </div>
    <div style="padding:20px;background:${P.surface};border-radius:12px;border:1px solid ${P.border}">
      <div style="font-size:10px;color:${P.cyan};letter-spacing:1.5px;margin-bottom:8px">GODLY.WEBSITE</div>
      <div style="font-size:13px;font-weight:700;color:${P.text};margin-bottom:6px">Evervault Customers</div>
      <div style="font-size:12px;color:${P.muted};line-height:1.7">Encryption company's customer page used a tight, editorial grid with technical copy — reinforced the "security-as-product-design" direction rather than generic enterprise charts.</div>
    </div>
  </div>
</section>

<!-- SHARE -->
<section style="text-align:center">
  <h2 class="section-title" style="text-align:center">Share</h2>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" target="_blank" class="btn-ghost" style="padding:10px 20px;font-size:12px">Share on X</a>
    <a href="${viewerURL}" target="_blank" class="btn-ghost" style="padding:10px 20px;font-size:12px">Open Viewer</a>
    <a href="${MOCK_URL}" target="_blank" class="btn-primary" style="padding:10px 20px;font-size:12px">Try Mock ›</a>
  </div>
</section>

<footer>
  <p>PRISM — Unified Threat Intelligence</p>
  <p style="margin-top:8px">RAM Design Heartbeat · ${DATE_STR} · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
</footer>

</body>
</html>`;
}

function buildViewerHTML(penJson) {
  // Read the pencil viewer from an existing published viewer as template
  // We'll use a minimal embed approach
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

  // Minimal viewer that loads pencil.dev viewer with embedded pen
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PRISM — Design Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#080A0F;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:Inter,sans-serif}
  .top-bar{width:100%;padding:14px 24px;background:#0E1118;border-bottom:1px solid #1E2535;display:flex;align-items:center;justify-content:space-between}
  .top-bar .name{font-size:12px;font-weight:700;color:#00E8D6;letter-spacing:3px}
  .top-bar .sub{font-size:10px;color:#5A6380}
  .top-bar a{font-size:11px;color:#00E8D6;text-decoration:none;border:1px solid #1E2535;padding:6px 14px;border-radius:6px}
  .viewer-wrap{flex:1;width:100%;max-width:1200px;padding:40px 24px;display:flex;justify-content:center;align-items:flex-start}
  .pen-canvas{border:1px solid #1E2535;border-radius:12px;overflow:auto;background:#04050A;width:100%;padding:20px}
</style>
</head>
<body>
<div class="top-bar">
  <div>
    <div class="name">PRISM</div>
    <div class="sub">Unified Threat Intelligence · RAM Design Studio</div>
  </div>
  <a href="https://ram.zenbin.org/prism">← Back to Design</a>
</div>
<div class="viewer-wrap">
  <div class="pen-canvas" id="mount"></div>
</div>
${injection}
<script>
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if(!pen){document.getElementById('mount').innerHTML='<p style="color:#5A6380;padding:40px">No pen data</p>';return;}

  const SCALE = Math.min(1, (window.innerWidth - 80) / pen.width);
  const canvas = document.getElementById('mount');
  canvas.style.width = (pen.width * SCALE + 40) + 'px';
  canvas.style.height = (pen.height * SCALE + 40) + 'px';
  canvas.style.minWidth = '320px';

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width', pen.width * SCALE);
  svg.setAttribute('height', pen.height * SCALE);
  svg.setAttribute('viewBox', \`0 0 \${pen.width} \${pen.height}\`);

  function renderNode(parent, node) {
    if(!node) return;
    if(node.type === 'frame' || node.type === 'rectangle') {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x', node.x || 0);
      rect.setAttribute('y', node.y || 0);
      rect.setAttribute('width', node.width || 0);
      rect.setAttribute('height', node.height || 0);
      if(node.fill && node.fill !== 'transparent') rect.setAttribute('fill', node.fill);
      else rect.setAttribute('fill', 'none');
      if(node.cornerRadius) rect.setAttribute('rx', node.cornerRadius);
      if(node.stroke) {
        rect.setAttribute('stroke', node.stroke.fill || '#fff');
        rect.setAttribute('stroke-width', node.stroke.thickness || 1);
      }
      if(node.clip) {
        const clipId = 'clip_' + Math.random().toString(36).slice(2);
        const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        const cp = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
        cp.setAttribute('id', clipId);
        const cr = document.createElementNS('http://www.w3.org/2000/svg','rect');
        cr.setAttribute('width', node.width); cr.setAttribute('height', node.height);
        if(node.cornerRadius) cr.setAttribute('rx', node.cornerRadius);
        cp.appendChild(cr); defs.appendChild(cp); g.appendChild(defs);
        g.setAttribute('clip-path', \`url(#\${clipId})\`);
      }
      g.appendChild(rect);
      if(node.type === 'frame') {
        const inner = document.createElementNS('http://www.w3.org/2000/svg','g');
        inner.setAttribute('transform', \`translate(\${node.x||0},\${node.y||0})\`);
        (node.children||[]).forEach(c => renderNode(inner, c));
        parent.appendChild(inner);
        return;
      }
      parent.appendChild(g);
    } else if(node.type === 'text') {
      const t = document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x', (node.x||0) + (node.textAlign==='center'?(node.width||0)/2:node.textAlign==='right'?(node.width||0):0));
      t.setAttribute('y', (node.y||0) + (node.fontSize||12));
      t.setAttribute('fill', node.fill || '#fff');
      t.setAttribute('font-size', node.fontSize || 12);
      t.setAttribute('font-weight', node.fontWeight || 400);
      if(node.letterSpacing) t.setAttribute('letter-spacing', node.letterSpacing);
      if(node.textAlign==='center') t.setAttribute('text-anchor','middle');
      else if(node.textAlign==='right') t.setAttribute('text-anchor','end');
      t.textContent = node.content || '';
      parent.appendChild(t);
    }
  }

  // Render each screen
  (pen.children||[]).forEach(screen => {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform', \`translate(\${screen.x||0},\${screen.y||0})\`);
    const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
    bg.setAttribute('width', screen.width); bg.setAttribute('height', screen.height);
    bg.setAttribute('fill', screen.fill || pen.fill);
    if(screen.clip) {
      const clipId = 'clip_s_' + Math.random().toString(36).slice(2);
      const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
      const cp = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
      cp.setAttribute('id', clipId);
      const cr = document.createElementNS('http://www.w3.org/2000/svg','rect');
      cr.setAttribute('width', screen.width); cr.setAttribute('height', screen.height);
      cp.appendChild(cr); defs.appendChild(cp); svg.appendChild(defs);
      g.setAttribute('clip-path', \`url(#\${clipId})\`);
    }
    g.appendChild(bg);
    (screen.children||[]).forEach(child => renderNode(g, child));
    svg.appendChild(g);
  });

  canvas.appendChild(svg);
})();
</script>
</body>
</html>`;
}

async function main() {
  console.log('── PRISM Design Discovery Pipeline ──────────────────────────');

  // Load pen
  const pen = JSON.parse(fs.readFileSync(path.join(__dirname, 'prism.pen'), 'utf8'));
  const penJson = JSON.stringify(pen);
  console.log(`Pen loaded: ${pen.name} (${(penJson.length/1024).toFixed(1)} KB)`);

  // a) Hero page
  console.log('\n[a] Publishing hero page → ram.zenbin.org/prism');
  const heroHTML = buildHeroHTML(pen);
  const heroRes = await post(SLUG, `PRISM — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`    Status: ${heroRes.status}  ${heroRes.body.slice(0,80)}`);

  // b) Viewer
  console.log('\n[b] Publishing viewer → ram.zenbin.org/prism-viewer');
  const viewerHTML = buildViewerHTML(penJson);
  const viewerRes = await post(VIEWER_SLUG, `PRISM — Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`    Status: ${viewerRes.status}  ${viewerRes.body.slice(0,80)}`);

  // c) Svelte mock — handled by separate .mjs script
  console.log('\n[c] Svelte mock → handled by prism-mock.mjs');

  // d) GitHub gallery queue
  console.log('\n[d] Updating GitHub gallery queue');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
    mock_url: MOCK_URL,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    source: 'heartbeat',
    theme: 'dark',
    palette: {
      bg: P.bg,
      surface: P.surface,
      accent: P.cyan,
      accent2: P.amber,
    },
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} — ${TAGLINE} (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`    Queue update: ${putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 120)}`);

  // e) Design DB
  console.log('\n[e] Indexing in design DB');
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('    Indexed ✓');
  } catch(err) {
    console.log('    DB index skipped:', err.message.slice(0, 80));
  }

  console.log('\n── Done ─────────────────────────────────────────────────────');
  console.log(`Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`Mock:    ${MOCK_URL}`);
}

main().catch(e => { console.error(e); process.exit(1); });
