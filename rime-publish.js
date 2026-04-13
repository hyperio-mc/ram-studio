'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'rime';
const APP     = 'RIME';
const TAGLINE = 'Voice journaling for the reflective mind';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
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
const P       = pen.metadata.palette;

// ── Screen SVG thumbnails ─────────────────────────────────────────────────────
function screenThumb(name, idx) {
  const colors = [
    { bg: '#FAF8F5', acc: '#C85A2A', label: 'Today'    },
    { bg: '#F5E8DF', acc: '#C85A2A', label: 'Record'   },
    { bg: '#FAF8F5', acc: '#4A7C59', label: 'Insights' },
    { bg: '#FAF8F5', acc: '#C85A2A', label: 'Journal'  },
    { bg: '#FAF8F5', acc: '#2E7D8A', label: 'Themes'   },
    { bg: '#F5E8DF', acc: '#8B6F47', label: 'Profile'  },
  ];
  const c = colors[idx] || colors[0];
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
    <rect width="390" height="844" fill="${c.bg}"/>
    <rect x="0" y="0" width="390" height="44" fill="${c.bg}"/>
    <text x="20" y="28" font-size="13" font-weight="600" fill="#1C1814" font-family="Inter,sans-serif">9:41</text>
    <rect x="20" y="136" width="350" height="92" rx="16" fill="${c.acc}"/>
    <circle cx="300" cy="170" r="48" fill="white" opacity="0.07"/>
    <text x="28" y="172" font-size="14" font-family="Inter,sans-serif" fill="white" font-weight="600">🔥 14-day streak</text>
    <text x="20" y="100" font-size="26" font-weight="700" fill="#1C1814" font-family="Inter,sans-serif" letter-spacing="-0.5">${name}</text>
    <rect x="20" y="264" width="60" height="60" rx="14" fill="${c.acc}20"/>
    <rect x="98" y="264" width="60" height="60" rx="14" fill="white" stroke="#E0D9D0" stroke-width="1"/>
    <rect x="176" y="264" width="60" height="60" rx="14" fill="white" stroke="#E0D9D0" stroke-width="1"/>
    <rect x="254" y="264" width="60" height="60" rx="14" fill="white" stroke="#E0D9D0" stroke-width="1"/>
    <rect x="332" y="264" width="58" height="60" rx="14" fill="white" stroke="#E0D9D0" stroke-width="1"/>
    <rect x="20" y="360" width="350" height="64" rx="14" fill="white" stroke="#E0D9D0" stroke-width="0.5"/>
    <circle cx="42" cy="392" r="7" fill="${c.acc}"/>
    <text x="56" y="388" font-size="14" font-weight="600" fill="#1C1814" font-family="Inter,sans-serif">Morning Gratitude</text>
    <text x="56" y="404" font-size="11" fill="#A89C94" font-family="Inter,sans-serif">Today, 7:12 AM</text>
    <rect x="20" y="440" width="350" height="64" rx="14" fill="white" stroke="#E0D9D0" stroke-width="0.5"/>
    <circle cx="42" cy="472" r="7" fill="${c.acc}"/>
    <text x="56" y="468" font-size="14" font-weight="600" fill="#1C1814" font-family="Inter,sans-serif">Work Clarity Session</text>
    <text x="56" y="484" font-size="11" fill="#A89C94" font-family="Inter,sans-serif">Yesterday, 8:44 PM</text>
    <rect x="0" y="764" width="390" height="80" fill="white" stroke="#E0D9D0" stroke-width="0.5"/>
    <text x="195" y="798" font-size="9.5" fill="${c.acc}" font-weight="600" text-anchor="middle" font-family="Inter,sans-serif">${c.label}</text>
  </svg>`)}`;
}

// ── Hero Page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${APP} — ${TAGLINE}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#FAF8F5;--surf:#FFFFFF;--card:#F3EFE9;--card2:#EDE6DB;
    --text:#1C1814;--text2:#6B5E54;--muted:#A89C94;--border:#E0D9D0;
    --acc:#C85A2A;--acc2:#4A7C59;--accL:#F5E8DF;--acc2L:#E0EDDF;
    --amber:#D4870A;--teal:#2E7D8A;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
  a{color:var(--acc);text-decoration:none}

  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid var(--border);background:rgba(250,248,245,0.9);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100}
  .nav-logo{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:var(--text)}
  .nav-logo span{color:var(--acc)}
  .nav-links{display:flex;gap:32px;font-size:14px;color:var(--text2)}
  .nav-cta{background:var(--acc);color:white;padding:10px 22px;border-radius:22px;font-size:13px;font-weight:600}

  /* HERO */
  .hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:80px 24px 60px;max-width:720px;margin:0 auto}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--accL);border:1px solid #E8CEBE;color:var(--acc);font-size:12px;font-weight:600;letter-spacing:1px;padding:6px 14px;border-radius:20px;margin-bottom:28px}
  .hero h1{font-size:clamp(40px,8vw,72px);font-weight:800;letter-spacing:-2px;line-height:1.05;margin-bottom:20px}
  .hero h1 em{font-style:normal;color:var(--acc)}
  .hero p{font-size:18px;color:var(--text2);line-height:1.6;max-width:520px;margin-bottom:36px}
  .hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
  .btn-primary{background:var(--acc);color:white;padding:14px 32px;border-radius:28px;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:8px}
  .btn-primary:hover{opacity:0.9}
  .btn-ghost{border:1.5px solid var(--border);color:var(--text2);padding:14px 28px;border-radius:28px;font-size:15px;font-weight:500}
  .hero-sub{margin-top:16px;font-size:12px;color:var(--muted)}

  /* SCREENS CAROUSEL */
  .screens-section{padding:60px 24px;background:var(--card)}
  .section-label{text-align:center;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--muted);margin-bottom:8px}
  .section-title{text-align:center;font-size:32px;font-weight:700;letter-spacing:-0.5px;color:var(--text);margin-bottom:40px}
  .screens-scroll{display:flex;gap:20px;overflow-x:auto;padding:8px 48px 24px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .screens-scroll::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 200px;background:white;border-radius:24px;overflow:hidden;border:1px solid var(--border);box-shadow:0 4px 24px rgba(28,24,20,0.06)}
  .screen-card img{width:200px;height:auto;display:block}
  .screen-label{padding:10px 14px;font-size:11px;font-weight:600;color:var(--text2);letter-spacing:0.5px;text-align:center;border-top:1px solid var(--border)}

  /* FEATURES BENTO */
  .features{padding:80px 48px;max-width:1100px;margin:0 auto}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .bento-card{background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:28px}
  .bento-card.wide{grid-column:span 2}
  .bento-card.accent{background:var(--acc);border-color:var(--acc);color:white}
  .bento-card.accent .bc-label,.bento-card.accent .bc-text{color:rgba(255,255,255,0.8)}
  .bento-card.green{background:var(--acc2L);border-color:#C8DEC8}
  .bento-card.amber{background:#FDF3E3;border-color:#F5D5A0}
  .bc-icon{font-size:28px;margin-bottom:12px}
  .bc-title{font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px}
  .bento-card.accent .bc-title{color:white}
  .bc-label{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--muted);margin-bottom:8px}
  .bc-text{font-size:13px;color:var(--text2);line-height:1.6}
  .bc-stat{font-size:42px;font-weight:800;letter-spacing:-2px;color:var(--acc);margin:8px 0 2px}
  .bento-card.accent .bc-stat{color:white}

  /* WAVEFORM */
  .wave-demo{display:flex;align-items:flex-end;gap:3px;height:48px;margin:16px 0}
  .wave-bar{width:6px;border-radius:3px;background:var(--acc);opacity:0.7}
  .bento-card.accent .wave-bar{background:white}

  /* PALETTE */
  .palette-section{padding:60px 48px;background:var(--card2);max-width:100%}
  .palette-inner{max-width:900px;margin:0 auto}
  .swatches{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap}
  .swatch{border-radius:16px;width:80px;height:80px;display:flex;flex-direction:column;justify-content:flex-end;padding:8px;font-size:9.5px;font-weight:600;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.2)}
  .swatch.light{color:var(--text2)}

  /* CTA */
  .cta-section{padding:80px 48px;text-align:center;max-width:600px;margin:0 auto}
  .cta-section h2{font-size:40px;font-weight:800;letter-spacing:-1.5px;margin-bottom:16px}
  .cta-section p{color:var(--text2);font-size:16px;margin-bottom:32px;line-height:1.6}

  /* FOOTER */
  footer{padding:32px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted)}

  @media(max-width:700px){
    nav{padding:16px 20px}.nav-links{display:none}
    .features,.palette-section,.cta-section{padding:48px 20px}
    .bento{grid-template-columns:1fr}.bento-card.wide{grid-column:1}
    .screens-scroll{padding:8px 20px 20px}
    footer{flex-direction:column;gap:8px;text-align:center}
  }
</style>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
</head>
<body>

<nav>
  <div class="nav-logo">R<span>I</span>ME</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">Insights</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-badge">🎙️ VOICE-FIRST JOURNALING</div>
  <h1>Your thoughts, <em>spoken</em> into clarity</h1>
  <p>RIME turns your voice into a living journal — capturing emotion, detecting patterns, and surfacing insights across your reflective practice.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">🌐 Try Interactive Mock</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">View in Pencil →</a>
  </div>
  <p class="hero-sub">6 screens · 626 elements · Light theme · Heartbeat #506</p>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">ALL SCREENS</div>
  <div class="section-title">Six moments of reflection</div>
  <div class="screens-scroll">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenThumb(s.name, i)}" alt="${s.name}" loading="lazy"/>
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <div class="section-label">DESIGN DECISIONS</div>
  <div class="section-title" style="text-align:left;margin-bottom:24px">What makes RIME different</div>
  <div class="bento">

    <div class="bento-card accent">
      <div class="bc-icon">🎙️</div>
      <div class="bc-title">Voice-First Recording</div>
      <div class="bc-text" style="color:rgba(255,255,255,0.8)">A full-bleed warm canvas with animated waveform rings replaces the sterile recording UI — inspired by Robinhood's "surreal precision" philosophy seen on Minimal Gallery.</div>
      <div class="wave-demo">
        ${[12,18,28,22,35,26,40,30,22,35,28,18,35,28,22,15,20,30,24,38,26,16,24,32,20].map(h => `<div class="wave-bar" style="height:${h}px"></div>`).join('')}
      </div>
    </div>

    <div class="bento-card">
      <div class="bc-label">PATTERN RECOGNITION</div>
      <div class="bc-icon">🫧</div>
      <div class="bc-title">Bubble-Map Themes</div>
      <div class="bc-text">AI-detected recurring themes rendered as a proportional bubble cluster — a non-uniform bento approach borrowed from Lapa Ninja's Linear showcase. Size = frequency.</div>
    </div>

    <div class="bento-card wide green">
      <div class="bc-label">THIS WEEK · APR 7–14</div>
      <div class="bc-title">Emotional Tone Analytics</div>
      <div class="bc-text">Bar charts with per-day mood scores, top-theme progress bars, and AI-written summaries — all in one glanceable weekly card. Inspired by Saaspo's bento grid feature sections.</div>
      <div style="display:flex;gap:6px;margin-top:16px;align-items:flex-end;height:50px">
        ${[65,40,75,55,80,60,50].map((h, i) => `<div style="width:28px;border-radius:6px;height:${Math.round(h/100*44)}px;background:${i===4?'#C85A2A':'#4A7C59'};opacity:${i===4?1:0.7}"></div>`).join('')}
      </div>
    </div>

    <div class="bento-card amber">
      <div class="bc-stat">14</div>
      <div class="bc-label">DAY STREAK 🔥</div>
      <div class="bc-text">Gamified consistency — streak counter, milestone badges, and consistency score keep the journaling habit alive without being pushy.</div>
    </div>

    <div class="bento-card">
      <div class="bc-icon">🏅</div>
      <div class="bc-title">Milestone Badges</div>
      <div class="bc-text">6 achievement tiles in a 3-col grid on the profile screen. Locked badges are dimmed — clear progress state without cluttering the UI.</div>
    </div>

    <div class="bento-card">
      <div class="bc-label">PALETTE</div>
      <div class="bc-icon">🍂</div>
      <div class="bc-title">Warm Minimal</div>
      <div class="bc-text">Warm cream base (#FAF8F5) with terracotta accent (#C85A2A) — counter to the neon-dark AI aesthetic. One punchy color, everything else neutral.</div>
    </div>

  </div>
</section>

<section class="palette-section">
  <div class="palette-inner">
    <div class="section-label">COLOUR PALETTE</div>
    <div class="section-title" style="text-align:left">Warm, minimal, human</div>
    <div class="swatches">
      <div class="swatch" style="background:#FAF8F5" class="light"><span style="color:#6B5E54">BG<br/>#FAF8F5</span></div>
      <div class="swatch" style="background:#1C1814">Text<br/>#1C1814</div>
      <div class="swatch" style="background:#C85A2A">Terracotta<br/>#C85A2A</div>
      <div class="swatch" style="background:#4A7C59">Sage<br/>#4A7C59</div>
      <div class="swatch" style="background:#D4870A">Amber<br/>#D4870A</div>
      <div class="swatch" style="background:#2E7D8A">Teal<br/>#2E7D8A</div>
      <div class="swatch" style="background:#F3EFE9"><span style="color:#6B5E54">Card<br/>#F3EFE9</span></div>
      <div class="swatch" style="background:#A89C94">Muted<br/>#A89C94</div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2>Reflect. Record. Understand.</h2>
  <p>RIME is a Pencil.dev design prototype by RAM — exploring warm minimal UI for an emerging voice-AI journaling app.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">☀◑ Interactive Mock</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">Pencil Viewer →</a>
  </div>
</section>

<footer>
  <span>RIME — RAM Design Heartbeat #506 · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
  <span>Inspired by: Minimal Gallery · Lapa Ninja · Saaspo</span>
</footer>

</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
