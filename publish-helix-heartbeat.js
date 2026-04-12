'use strict';
// publish-helix-heartbeat.js — Full Design Discovery pipeline for HELIX

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'helix';
const VIEWER_SLUG = 'helix-viewer';
const MOCK_SLUG   = 'helix-mock';
const APP_NAME    = 'HELIX';

const meta = {
  appName:   'HELIX',
  tagline:   'Deep sleep intelligence. Know your cycles, own your rest.',
  archetype: 'health',
  palette: {
    bg:      '#070710',
    surface: '#0F0F1E',
    surface2:'#161628',
    text:    '#E4E4F0',
    accent:  '#7B5CFF',
    accent2: '#2EE5C8',
    warm:    '#F59E2B',
    danger:  '#FF4F6A',
    muted:   'rgba(228,228,240,0.4)',
  },
};

const ORIGINAL_PROMPT = `Design HELIX — a dark-themed sleep biometric tracker. Inspired by:

1. Frames (withframes.com) discovered on Dark Mode Design (darkmodedesign.com) — a niche film photography notebook app with a precision instrument-panel aesthetic, dark UI, deliberate data-logging per session, tactile controls.

2. Evervault customers page (godly.website) — dense enterprise card layouts on deep dark backgrounds, top-border colour coding by metric type, clean information hierarchy.

Challenge: Translate the "niche precision utility + instrument panel dark UI" pattern from Frames into a sleep biometric context. 5 screens: Tonight (wind-down + readiness ring), Live (active session waveform tracker), Wake (morning report + cycle pie), Trends (weekly bar chart), Goals (sleep targets + toggles).

Theme: DARK — near-black #070710, electric violet #7B5CFF, cool teal #2EE5C8, warm amber #F59E2B, signal red #FF4F6A. Typography: Georgia serif for large numerics (instrument readings), uppercase tracked system-ui for labels.`;

const sub = {
  id:           `heartbeat-helix-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

const screenNames = ['Tonight', 'Live', 'Wake', 'Trends', 'Goals'];
const P = meta.palette;

// ── Helpers ────────────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.end(body); else r.end();
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

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': 'ram',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  // artboards in v2.8 format
  const artboards = penJson.artboards || penJson.children || [];

  const thumbsHTML = artboards.map((ab, i) => {
    const label = screenNames[i] || ab.name || `SCREEN ${i+1}`;
    const tw = 100;
    const th = Math.round(tw * (ab.height / ab.width));
    // Extract SVG content from first layer
    const svgContent = (ab.layers && ab.layers[0] && ab.layers[0].content) ? ab.layers[0].content : '';
    const svgEncoded = svgContent.replace(/"/g, "'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div style="text-align:center;flex-shrink:0">
      <div style="width:${tw}px;height:${th}px;border-radius:12px;overflow:hidden;border:1px solid rgba(228,228,240,0.08);background:${P.surface}">
        <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}" width="${tw}" height="${th}" style="display:block;width:100%;height:100%;object-fit:cover"/>
      </div>
      <div style="font-size:9px;opacity:.4;margin-top:6px;letter-spacing:1.5px;color:${P.text};text-transform:uppercase">${label}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,       role: 'VOID',    },
    { hex: P.surface,  role: 'SURFACE'  },
    { hex: P.text,     role: 'TEXT'     },
    { hex: P.accent,   role: 'VIOLET'   },
    { hex: P.accent2,  role: 'TEAL'     },
    { hex: P.warm,     role: 'AMBER'    },
    { hex: P.danger,   role: 'SIGNAL'   },
  ];

  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:60px;text-align:center">
      <div style="height:40px;border-radius:8px;background:${sw.hex};border:1px solid rgba(228,228,240,0.1);margin-bottom:6px"></div>
      <div style="font-size:7px;letter-spacing:1.5px;opacity:.4;color:${P.text};margin-bottom:2px">${sw.role}</div>
      <div style="font-size:9px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HELIX — Deep Sleep Intelligence · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
  nav{padding:20px 40px;border-bottom:1px solid rgba(228,228,240,0.06);display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:11px;font-weight:700;letter-spacing:4px;color:${P.text}}
  .nav-id{font-size:9px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px;position:relative}
  .hero::before{content:'';position:absolute;top:-100px;left:-100px;width:600px;height:600px;background:radial-gradient(circle,${P.accent}12 0%,transparent 65%);pointer-events:none;z-index:0}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:16px;position:relative;z-index:1}
  h1{font-size:clamp(64px,12vw,108px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${P.text};font-family:Georgia,serif;position:relative;z-index:1}
  h1 .glow{background:linear-gradient(135deg,${P.accent},${P.accent2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .sub{font-size:16px;color:rgba(228,228,240,0.5);max-width:520px;line-height:1.6;margin-bottom:32px;position:relative;z-index:1}
  .meta-row{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap;position:relative;z-index:1}
  .meta-item span{display:block;font-size:9px;color:rgba(228,228,240,0.3);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase}
  .meta-item strong{color:${P.text};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap;position:relative;z-index:1}
  .btn{padding:11px 22px;border-radius:100px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px;transition:all .2s}
  .btn-p{background:${P.accent};color:#fff}
  .btn-p:hover{transform:translateY(-2px);box-shadow:0 10px 30px ${P.accent}40}
  .btn-mock{background:${P.accent2}18;color:${P.accent2};border:1px solid ${P.accent2}40}
  .btn-mock:hover{background:${P.accent2}28}
  .btn-s{background:transparent;color:${P.text};border:1px solid rgba(228,228,240,0.12)}
  .btn-s:hover{border-color:rgba(228,228,240,0.3)}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid rgba(228,228,240,0.06)}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-thumb{background:${P.accent}55;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid rgba(228,228,240,0.06);max-width:960px}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .insp-box{background:${P.surface};border:1px solid rgba(228,228,240,0.06);border-left:3px solid ${P.accent};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;max-width:640px;position:relative;z-index:1}
  .insp-box p{font-size:13px;color:rgba(228,228,240,0.55);line-height:1.7}
  .insp-box strong{color:${P.text}}
  .decisions{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:32px}
  .decision{background:${P.surface};border:1px solid rgba(228,228,240,0.06);border-radius:12px;padding:24px}
  .d-icon{font-size:24px;margin-bottom:12px}
  .d-title{font-size:13px;font-weight:700;margin-bottom:8px;color:${P.text}}
  .d-desc{font-size:12px;color:rgba(228,228,240,0.45);line-height:1.6}
  .pulse-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:${P.danger};animation:pulse 2s infinite;margin-right:6px;vertical-align:middle}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
  footer{padding:24px 40px;border-top:1px solid rgba(228,228,240,0.06);font-size:10px;color:rgba(228,228,240,0.3);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  footer a{color:${P.accent};text-decoration:none}
</style>
</head>
<body>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag"><span class="pulse-dot"></span>HEARTBEAT DESIGN · HEALTH · APRIL 2026 · DARK THEME</div>
  <h1>HE<span class="glow">LIX</span></h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta-row">
    <div class="meta-item"><span>Screens</span><strong>5 Mobile</strong></div>
    <div class="meta-item"><span>Inspired By</span><strong>Frames + Evervault</strong></div>
    <div class="meta-item"><span>Key Accent</span><strong>#7B5CFF Violet</strong></div>
    <div class="meta-item"><span>Theme</span><strong>Dark — Near-Black Void</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="/helix-viewer" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="/helix-mock" target="_blank">✦ Interactive Mock ☀◑</a>
    <a class="btn btn-s" href="#brand">⬡ Brand System</a>
  </div>

  <div class="insp-box">
    <p><strong>Trend spotted:</strong> Frames (withframes.com) on Dark Mode Design — a niche film photography notebook with precision instrument-panel UI and deliberate data logging per session. I took that "focused analog utility app" energy and translated it into a sleep biometric context: each night as a "session", each metric as an instrument reading. Also informed by Evervault's dense enterprise card layouts from godly.website.</p>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN PREVIEW — 5 MOBILE SCREENS (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section" id="brand">
  <div class="section-label">DESIGN DECISIONS</div>
  <div class="decisions">
    <div class="decision">
      <div class="d-icon">🌊</div>
      <div class="d-title">Biomorphic Waveforms</div>
      <div class="d-desc">Sleep stage data as organic variable-height waveforms. EEG readout vocabulary — deliberately scientific, not decorative. The shape encodes meaning.</div>
    </div>
    <div class="decision">
      <div class="d-icon">🔵</div>
      <div class="d-title">Violet × Teal Duality</div>
      <div class="d-desc">#7B5CFF (electric indigo) for active/energy states. #2EE5C8 (cool teal) for restorative/rest states. Accents encode semantic meaning, not just aesthetics.</div>
    </div>
    <div class="decision">
      <div class="d-icon">📐</div>
      <div class="d-title">Instrument-Panel Typography</div>
      <div class="d-desc">Georgia serif for large numeric readouts (score, timer, duration) with uppercase tracked system-ui labels. Borrowed from precision instruments and medical devices.</div>
    </div>
    <div class="decision">
      <div class="d-icon">🌑</div>
      <div class="d-title">Three-Level Dark Depth</div>
      <div class="d-desc">#070710 base → #0F0F1E cards → #161628 inset elements. Depth without flat black, maintaining the void-like calm a sleep app demands.</div>
    </div>
    <div class="decision">
      <div class="d-icon">💡</div>
      <div class="d-title">Ambient Glow Halos</div>
      <div class="d-desc">4–8% opacity radial gradient blooms around accent colors on each screen. Environmental light that never overwhelms data. Screen mood via background illumination.</div>
    </div>
    <div class="decision">
      <div class="d-icon">🎯</div>
      <div class="d-title">Score-First Hierarchy</div>
      <div class="d-desc">Every screen leads with the single most important number at Georgia 36–60px: Readiness (78), Score (82), Weekly Average (78.3). Context is always secondary.</div>
    </div>
  </div>

  <div style="margin-top:48px">
    <div class="section-label">COLOUR PALETTE</div>
    <div class="swatches">${swatchHTML}</div>
  </div>
</section>

<footer>
  <span>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</span>
  <span><a href="/helix-viewer">Viewer</a> · <a href="/helix-mock">Mock</a> · ram.zenbin.org/helix</span>
</footer>
</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const penJsonStr = JSON.stringify(penJson);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HELIX — Pencil Viewer · RAM</title>
<style>
  body{margin:0;background:${P.bg};display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,sans-serif}
  #viewer-root{width:100%;max-width:1200px;padding:24px}
  .viewer-header{color:${P.text};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;opacity:.3}
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};</script>
</head>
<body>
<div id="viewer-root">
  <div class="viewer-header">HELIX — Deep Sleep Intelligence · Pencil v2.8</div>
  <div id="pencil-viewer"></div>
</div>
<script src="https://cdn.pencil.dev/viewer/v2.8/pencil-viewer.min.js"></script>
<script>
  if(window.PencilViewer){
    PencilViewer.init({container:document.getElementById('pencil-viewer'),pen:JSON.parse(window.EMBEDDED_PEN),theme:'dark'});
  }else{
    // Fallback: render artboard SVGs directly
    const pen = JSON.parse(window.EMBEDDED_PEN);
    const boards = pen.artboards || pen.children || [];
    const wrap = document.getElementById('pencil-viewer');
    wrap.style.cssText = 'display:flex;gap:20px;flex-wrap:wrap;justify-content:center;padding:20px';
    boards.forEach((ab,i) => {
      const div = document.createElement('div');
      div.style.cssText = 'background:${P.surface};border-radius:20px;overflow:hidden;border:1px solid rgba(228,228,240,0.08)';
      const svg = (ab.layers && ab.layers[0] && ab.layers[0].content) ? ab.layers[0].content : '';
      div.innerHTML = '<div style="font-size:10px;letter-spacing:2px;color:rgba(228,228,240,0.4);padding:8px 16px;text-align:center;text-transform:uppercase">' + (ab.name||('Screen '+(i+1))) + '</div>' + svg.replace('width="390"','width="280"').replace('height="844"','height="607"').replace('viewBox="0 0 390 844"','viewBox="0 0 390 844"');
      wrap.appendChild(div);
    });
  }
</script>
</body>
</html>`;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
(async () => {
  console.log('── HELIX Heartbeat Publish Pipeline ──\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'helix.pen'), 'utf8'));
  const boards = penJson.artboards || penJson.children || [];
  console.log(`✓ Loaded helix.pen — ${boards.length} artboards`);

  // 1. Hero page
  console.log('\n── 1. Hero page ──');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  HTML: ${heroHTML.length.toLocaleString()} chars`);
  const heroRes = await publishToZenbin(SLUG, 'HELIX — Deep Sleep Intelligence · RAM Design Studio', heroHTML);
  console.log(`${heroRes.status===200||heroRes.status===201?'✓':'✗'} Hero → https://ram.zenbin.org/${SLUG} [${heroRes.status}]`);
  if (heroRes.status !== 200 && heroRes.status !== 201) console.log('  Body:', heroRes.body.slice(0,200));

  // 2. Viewer
  console.log('\n── 2. Viewer ──');
  const viewerHTML = buildViewerHTML(penJson);
  console.log(`  HTML: ${viewerHTML.length.toLocaleString()} chars`);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'HELIX Viewer · RAM Design Studio', viewerHTML);
  console.log(`${viewerRes.status===200||viewerRes.status===201?'✓':'✗'} Viewer → https://ram.zenbin.org/${VIEWER_SLUG} [${viewerRes.status}]`);

  // 3. GitHub gallery queue
  console.log('\n── 3. GitHub gallery queue ──');
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

  if (getRes.status !== 200) {
    console.log('  GitHub GET failed:', getRes.status, getRes.body.slice(0,100));
  } else {
    const fileData = JSON.parse(getRes.body);
    const currentSha = fileData.sha;
    let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];

    queue.submissions.push({
      ...sub,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
      mock_url:    `https://ram.zenbin.org/${MOCK_SLUG}`,
    });
    queue.updated_at = new Date().toISOString();

    const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const putBody = JSON.stringify({
      message: `add: ${APP_NAME} to gallery (heartbeat)`,
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

    if (putRes.status === 200 || putRes.status === 201) {
      console.log(`✓ Gallery queue updated — ${queue.submissions.length} total entries`);
    } else {
      console.log('  GitHub PUT failed:', putRes.status, putRes.body.slice(0,150));
    }
  }

  console.log('\n── Pipeline complete ──');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${MOCK_SLUG}`);
})();
