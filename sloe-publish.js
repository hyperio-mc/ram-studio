'use strict';
// SLOE — hero page + viewer publish
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'sloe';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
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

// Palette colours (warm amber dark)
const bg      = '#0C0B09';
const surf    = '#191410';
const surf2   = '#231A13';
const surf3   = '#2E2218';
const acc     = '#D4845A';
const acc2    = '#5B9BAA';
const acc3    = '#E8C46A';
const textCol = '#EDE0D0';
const textSec = '#B89E8A';

// Build SVG thumbnail from first screen
function buildThumbSVG(screenName, index) {
  const screenColors = [
    { bg: surf, accent: acc3, label: '87', sub: 'Sleep Score' },
    { bg: surf, accent: acc,  label: '10:30', sub: 'Wind-Down' },
    { bg: surf, accent: acc2, label: '◐', sub: 'Body Clock' },
    { bg: surf, accent: acc3, label: '83', sub: '7-Day Avg' },
    { bg: surf, accent: acc,  label: '◈', sub: 'Insights' },
    { bg: surf, accent: acc,  label: 'M',  sub: 'Profile' },
  ];
  const s = screenColors[index] || screenColors[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="195" height="422" viewBox="0 0 195 422">
    <rect width="195" height="422" rx="12" fill="${s.bg}"/>
    <rect width="195" height="3" rx="2" fill="${s.accent}" opacity="0.8"/>
    <rect x="14" y="20" width="100" height="8" rx="4" fill="${s.accent}" opacity="0.3"/>
    <rect x="14" y="36" width="68" height="5" rx="3" fill="${textSec}" opacity="0.25"/>
    <circle cx="97" cy="140" r="52" fill="none" stroke="${s.accent}" stroke-width="4" opacity="0.2"/>
    <circle cx="97" cy="140" r="52" fill="none" stroke="${s.accent}" stroke-width="4" stroke-dasharray="${Math.round(Math.PI * 104 * 0.85)} ${Math.round(Math.PI * 104 * 0.15)}" stroke-dashoffset="${Math.round(Math.PI * 104 * 0.25)}" opacity="0.9"/>
    <text x="97" y="148" font-family="Georgia,serif" font-size="26" font-weight="700" fill="${textCol}" text-anchor="middle">${s.label}</text>
    <text x="97" y="168" font-family="system-ui,sans-serif" font-size="10" fill="${textSec}" text-anchor="middle">${s.sub}</text>
    <rect x="14" y="210" width="167" height="40" rx="10" fill="${surf2}"/>
    <rect x="14" y="210" width="167" height="2" rx="1" fill="${s.accent}" opacity="0.7"/>
    <rect x="14" y="262" width="167" height="28" rx="8" fill="${surf2}" opacity="0.7"/>
    <rect x="14" y="300" width="167" height="28" rx="8" fill="${surf2}" opacity="0.5"/>
    <rect x="14" y="338" width="167" height="28" rx="8" fill="${surf2}" opacity="0.3"/>
    <rect x="0" y="385" width="195" height="37" rx="0" fill="${surf}"/>
    <rect x="0" y="385" width="195" height="1" fill="${s.accent}" opacity="0.15"/>
    <text x="97" y="409" font-family="system-ui,sans-serif" font-size="9" fill="${s.accent}" text-anchor="middle">${screenName}</text>
  </svg>`;
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>SLOE — Circadian Health &amp; Sleep Intelligence</title>
  <meta name="description" content="A dark-theme mobile app for circadian rhythm tracking and sleep optimization, built with warm amber tones."/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:    ${bg};
      --surf:  ${surf};
      --surf2: ${surf2};
      --surf3: ${surf3};
      --acc:   ${acc};
      --acc2:  ${acc2};
      --acc3:  ${acc3};
      --text:  ${textCol};
      --sec:   ${textSec};
      --dim:   rgba(237,224,208,0.35);
      --border:rgba(212,132,90,0.15);
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; overflow-x: hidden; }

    /* Ambient glows */
    body::before {
      content: ''; position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
      width: 800px; height: 600px;
      background: radial-gradient(ellipse, rgba(212,132,90,0.08) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }
    body::after {
      content: ''; position: fixed; bottom: -200px; right: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(ellipse, rgba(91,155,170,0.06) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }

    .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

    /* Nav */
    nav { padding: 20px 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
    .logo { font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: var(--acc); letter-spacing: -0.5px; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { color: var(--sec); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    .btn-try {
      background: var(--acc); color: var(--bg); padding: 8px 20px; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer; border: none; text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn-try:hover { opacity: 0.85; }

    /* Hero */
    .hero { padding: 80px 0 60px; text-align: center; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--surf2); border: 1px solid var(--border);
      border-radius: 20px; padding: 6px 16px; font-size: 12px; color: var(--acc);
      margin-bottom: 28px; letter-spacing: 0.5px;
    }
    .hero-badge::before { content: '●'; font-size: 8px; }
    .hero h1 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: clamp(42px, 7vw, 80px);
      font-weight: 700; line-height: 1.1;
      letter-spacing: -2px;
      background: linear-gradient(135deg, var(--text) 0%, var(--acc3) 50%, var(--acc) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 20px;
    }
    .hero p {
      font-size: 18px; color: var(--sec); max-width: 560px; margin: 0 auto 36px;
      line-height: 1.65;
    }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 64px; }
    .btn-primary {
      background: var(--acc); color: var(--bg); padding: 14px 32px;
      border-radius: 10px; font-size: 15px; font-weight: 700;
      text-decoration: none; transition: opacity 0.2s, transform 0.15s;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary {
      background: var(--surf2); color: var(--text); padding: 14px 32px;
      border-radius: 10px; font-size: 15px; font-weight: 500;
      text-decoration: none; border: 1px solid var(--border);
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: var(--surf3); }

    /* Screen carousel */
    .screens { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
    .screen-card {
      flex: 0 0 195px; background: var(--surf2); border-radius: 20px;
      overflow: hidden; border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .screen-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(212,132,90,0.15); }
    .screen-card img { width: 100%; display: block; }
    .screen-label { padding: 10px 14px; font-size: 12px; color: var(--sec); font-weight: 500; }

    /* Divider */
    .divider { height: 1px; background: var(--border); margin: 60px 0; }

    /* Stats row */
    .stats { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin: 40px 0; }
    .stat-card {
      background: var(--surf2); border: 1px solid var(--border); border-radius: 14px;
      padding: 20px 28px; text-align: center; min-width: 140px;
    }
    .stat-val { font-size: 28px; font-weight: 700; color: var(--acc3); font-family: Georgia, serif; }
    .stat-lbl { font-size: 12px; color: var(--sec); margin-top: 4px; }

    /* Features */
    .features { margin: 0 0 60px; }
    .features h2 { font-family: Georgia, serif; font-size: 32px; font-weight: 700; margin-bottom: 32px; text-align: center; letter-spacing: -0.5px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .feature-card {
      background: var(--surf2); border: 1px solid var(--border); border-radius: 16px;
      padding: 24px; position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: var(--acc); border-radius: 2px;
    }
    .feature-card.teal::before { background: var(--acc2); }
    .feature-card.gold::before { background: var(--acc3); }
    .feature-icon { font-size: 22px; margin-bottom: 12px; }
    .feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .feature-card p { font-size: 13px; color: var(--sec); line-height: 1.6; }

    /* Palette */
    .palette { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 40px 0; }
    .swatch { text-align: center; }
    .swatch-dot { width: 48px; height: 48px; border-radius: 50%; margin: 0 auto 8px; border: 2px solid var(--border); }
    .swatch-lbl { font-size: 11px; color: var(--sec); }
    .swatch-hex { font-size: 10px; color: var(--dim); font-family: monospace; }

    /* Footer */
    footer {
      border-top: 1px solid var(--border); padding: 32px 0;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 16px;
    }
    footer .logo { font-size: 16px; }
    footer p { font-size: 12px; color: var(--dim); }
    footer a { color: var(--sec); text-decoration: none; font-size: 13px; }
    footer a:hover { color: var(--acc); }
  </style>
</head>
<body>
  <div class="wrap">
    <nav>
      <div class="logo">SLOE</div>
      <div class="nav-links">
        <a href="#screens">Screens</a>
        <a href="#features">Features</a>
        <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-try">☀◑ Mock</a>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-badge">RAM Design Heartbeat #49</div>
      <h1>Align with<br/>your body clock.</h1>
      <p>Circadian health and sleep intelligence for people who know their evenings matter. Warm amber — not cold blue — because screens that disrupt your melatonin shouldn't be the ones tracking it.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
      </div>

      <div id="screens" class="screens">
        ${pen.screens.map((s, i) => `
          <div class="screen-card">
            ${buildThumbSVG(s.name.split('—')[0].trim(), i)}
            <div class="screen-label">${s.name.split('—')[0].trim()}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <div class="divider"></div>

    <div class="stats">
      <div class="stat-card"><div class="stat-val">6</div><div class="stat-lbl">Screens</div></div>
      <div class="stat-card"><div class="stat-val">${pen.metadata.elements}</div><div class="stat-lbl">Elements</div></div>
      <div class="stat-card"><div class="stat-val">Dark</div><div class="stat-lbl">Theme</div></div>
      <div class="stat-card"><div class="stat-val">#49</div><div class="stat-lbl">Heartbeat</div></div>
    </div>

    <section id="features" class="features">
      <h2>What makes SLOE different</h2>
      <div class="feature-grid">
        <div class="feature-card gold">
          <div class="feature-icon">◎</div>
          <h3>Circadian Clock Wheel</h3>
          <p>A 24-hour polar visualization of your energy rhythm — showing cortisol peaks, melatonin onset, and where "now" sits on your personal body clock.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">◐</div>
          <h3>Chronotype Learning</h3>
          <p>30 days of data builds a personalized chronotype model — intermediate, early, or late — and adjusts all recommendations to match your biology, not a generic schedule.</p>
        </div>
        <div class="feature-card teal">
          <div class="feature-icon">◈</div>
          <h3>Correlation Insights</h3>
          <p>Connects your logged habits to actual sleep outcomes: +12 points for an evening walk, −8 for late screens. No guesswork — just your personal data, explained.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">◑</div>
          <h3>Wind-Down Planner</h3>
          <p>Counts down to your optimal sleep window and walks you through a pre-sleep checklist — blue light, caffeine cutoff, room temperature — timed to your schedule.</p>
        </div>
        <div class="feature-card gold">
          <div class="feature-icon">◷</div>
          <h3>Warm Amber Interface</h3>
          <p>Built on the ironic principle: a sleep app that uses warm amber tones instead of cortisol-spiking blue. The interface itself practices what it preaches.</p>
        </div>
        <div class="feature-card teal">
          <div class="feature-icon">◫</div>
          <h3>Sleep Journal</h3>
          <p>7-day bar chart with per-night scores, mood tags, and habit logging. Streak tracking rewards consistency — the single highest predictor of sleep quality.</p>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <section style="text-align:center; padding: 20px 0 40px;">
      <h2 style="font-family:Georgia,serif;font-size:22px;margin-bottom:20px;font-weight:600;color:var(--sec);">Palette — Warm Terminal</h2>
      <div class="palette">
        ${[
          [bg,      'BG',        'Near-black warm'],
          [surf,    'Surface',   'Dark warm surface'],
          [surf2,   'Elevated',  'Card surface'],
          [acc,     'Amber',     'Primary accent'],
          [acc3,    'Gold',      'Highlight'],
          [acc2,    'Teal',      'Cool contrast'],
          [textCol, 'Text',      'Warm white'],
          [textSec, 'Secondary', 'Warm gray'],
        ].map(([hex, name, desc]) => `
          <div class="swatch">
            <div class="swatch-dot" style="background:${hex};"></div>
            <div class="swatch-lbl">${name}</div>
            <div class="swatch-hex">${hex}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <div class="divider"></div>

    <section style="padding: 20px 0 40px; max-width: 700px; margin: 0 auto;">
      <h2 style="font-family:Georgia,serif;font-size:24px;margin-bottom:20px;">Design Notes</h2>
      <p style="color:var(--sec);line-height:1.7;font-size:14px;margin-bottom:16px;">
        <strong style="color:var(--text);">Trend source:</strong> Saaspo and DarkModeDesign research revealed that warm dark palettes (amber/brown on near-black) are almost entirely unused in mobile wellness. Most sleep apps use cold blue — the same wavelength that disrupts melatonin. SLOE fixes the irony.
      </p>
      <p style="color:var(--sec);line-height:1.7;font-size:14px;margin-bottom:16px;">
        <strong style="color:var(--text);">Key decisions:</strong> (1) Luminance hierarchy over weight hierarchy — your sleep score is the brightest element on screen, everything else dims accordingly. (2) Circular clock wheel instead of a bar chart for circadian data — the round shape mirrors the biology. (3) Warm amber (#D4845A) as the primary accent with muted teal (#5B9BAA) for cool-data contrast — complementary but not competitive.
      </p>
      <p style="color:var(--sec);line-height:1.7;font-size:14px;">
        <strong style="color:var(--text);">One thing I'd change:</strong> The arc in the Body Clock screen is approximated with many short lines — a real SVG arc path would be cleaner and allow more precise stroke-dasharray animations.
      </p>
    </section>

    <footer>
      <div class="logo">SLOE</div>
      <p>RAM Design Heartbeat #49 · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <div style="display:flex;gap:20px;align-items:center;">
        <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
        <a href="https://ram.zenbin.org/">Gallery</a>
      </div>
    </footer>
  </div>
</body>
</html>`;

// Viewer with embedded pen
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, 'SLOE — Circadian Health & Sleep Intelligence');
  console.log(`Hero: ${r1.status}`);
  if (r1.status !== 201) console.log('Hero body:', r1.body.slice(0, 200));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'SLOE — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`);
  if (r2.status !== 201) console.log('Viewer body:', r2.body.slice(0, 200));
}

main().catch(console.error);
