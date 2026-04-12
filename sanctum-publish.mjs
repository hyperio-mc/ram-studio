// sanctum-publish.mjs — SANCTUM hero + viewer publish
// Dark deep-work companion. Inspired by:
//   • Linear's "calmer, more consistent interface" (Mar 11, 2026)
//   • Flomodia's editorial spaced typography (godly.website)
//   • darkmodedesign.com gallery of minimal dark tools

import fs from 'fs';
import https from 'https';

const SLUG      = 'sanctum';
const APP_NAME  = 'SANCTUM';
const TAGLINE   = 'A ritual for deep work.';
const ARCHETYPE = 'productivity-focus';

// ── Publish helper ─────────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        'X-Subdomain':    'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:      '#09090E',
  surface: '#13141C',
  surf2:   '#1A1B26',
  text:    '#E8E6F0',
  muted:   'rgba(232,230,240,0.5)',
  gold:    '#D4A853',
  violet:  '#8B6FD4',
  sage:    '#68A882',
  border:  'rgba(232,230,240,0.07)',
};

// ═══════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ═══════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SANCTUM — A ritual for deep work.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${P.bg};
    --surface: ${P.surface};
    --surf2:   ${P.surf2};
    --text:    ${P.text};
    --muted:   ${P.muted};
    --gold:    ${P.gold};
    --violet:  ${P.violet};
    --sage:    ${P.sage};
    --border:  ${P.border};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg); color: var(--text);
    font-family: 'Space Grotesk', system-ui, sans-serif;
    line-height: 1.6; overflow-x: hidden;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(9,9,14,0.88); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 36px; height: 60px;
  }
  .nav-logo {
    font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700;
    letter-spacing: 5px; color: var(--text); text-decoration: none;
  }
  .nav-logo span { color: var(--gold); }
  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--gold); color: #09090E !important;
    padding: 8px 18px; border-radius: 8px;
    font-weight: 700 !important; font-size: 12px !important;
    letter-spacing: 0.5px; transition: opacity .2s !important;
  }
  .nav-cta:hover { opacity: 0.85 !important; }

  /* HERO */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 100px 24px 80px; position: relative; overflow: hidden;
  }
  .hero-glow-1 {
    position: absolute; top: -100px; left: 50%; transform: translateX(-30%);
    width: 700px; height: 700px; border-radius: 50%; pointer-events: none;
    background: radial-gradient(ellipse, rgba(139,111,212,0.09) 0%, transparent 65%);
  }
  .hero-glow-2 {
    position: absolute; bottom: -60px; left: 50%; transform: translateX(-70%);
    width: 600px; height: 500px; border-radius: 50%; pointer-events: none;
    background: radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 65%);
  }
  .hero-label {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(212,168,83,0.1); border: 1px solid rgba(212,168,83,0.2);
    color: var(--gold); font-family: 'Space Mono', monospace;
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    padding: 6px 16px; border-radius: 100px; margin-bottom: 36px;
  }
  .hero-label::before { content: '✦'; font-size: 9px; animation: rotate 6s linear infinite; }
  @keyframes rotate { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  .hero h1 {
    font-size: clamp(52px, 9vw, 104px); font-weight: 700; line-height: 1.0;
    letter-spacing: -3px; margin-bottom: 8px; max-width: 800px;
  }
  .hero-sub-title {
    font-family: 'Space Mono', monospace;
    font-size: clamp(13px, 2vw, 17px); font-weight: 400;
    letter-spacing: 5px; color: var(--muted); margin-bottom: 28px;
  }
  .hero p {
    font-size: 17px; color: var(--muted); max-width: 520px;
    line-height: 1.75; margin-bottom: 52px;
  }
  .hero-buttons { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 72px; }
  .btn-gold {
    background: var(--gold); color: var(--bg); font-weight: 700;
    font-size: 14px; padding: 14px 32px; border-radius: 10px;
    text-decoration: none; letter-spacing: 0.3px; transition: opacity .2s;
  }
  .btn-gold:hover { opacity: 0.85; }
  .btn-ghost {
    background: transparent; color: var(--text); font-weight: 500;
    font-size: 14px; padding: 14px 32px; border-radius: 10px;
    text-decoration: none; border: 1px solid var(--border); transition: border-color .2s;
  }
  .btn-ghost:hover { border-color: var(--gold); }

  /* DEPTH SCORE PREVIEW */
  .depth-preview {
    display: flex; gap: 16px; justify-content: center; align-items: center;
    flex-wrap: wrap; margin-bottom: 20px;
  }
  .depth-chip {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 16px;
  }
  .depth-score { font-size: 22px; font-weight: 800; }
  .depth-score.gold   { color: var(--gold); }
  .depth-score.violet { color: var(--violet); }
  .depth-score.sage   { color: var(--sage); }
  .depth-meta { display: flex; flex-direction: column; }
  .depth-meta .label { font-size: 10px; letter-spacing: 1.5px; color: var(--muted); }
  .depth-meta .sub   { font-size: 12px; color: var(--text); }

  /* SCREENS SECTION */
  .screens-section { padding: 100px 24px; max-width: 1200px; margin: 0 auto; }
  .section-eyebrow {
    font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700;
    letter-spacing: 3px; color: var(--gold); text-align: center; margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(32px, 5vw, 54px); font-weight: 700;
    letter-spacing: -1.5px; text-align: center; margin-bottom: 12px;
  }
  .section-sub {
    font-size: 16px; color: var(--muted); text-align: center;
    max-width: 520px; margin: 0 auto 64px; line-height: 1.7;
  }
  .screens-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
  }
  .screen-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; overflow: hidden; transition: transform .2s, border-color .2s;
  }
  .screen-card:hover { transform: translateY(-3px); border-color: rgba(212,168,83,0.2); }
  .screen-thumb {
    height: 240px; display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden; padding: 20px;
  }
  .screen-info { padding: 20px 22px; }
  .screen-info h3 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .screen-info p  { font-size: 12px; color: var(--muted); line-height: 1.6; }

  /* PHILOSOPHY SECTION */
  .philosophy-section { padding: 100px 24px; max-width: 900px; margin: 0 auto; }
  .philosophy-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 64px; }
  .philosophy-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px 26px;
  }
  .phil-icon {
    font-size: 22px; margin-bottom: 14px; display: block;
  }
  .philosophy-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; }
  .philosophy-card p  { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* METRICS */
  .metrics-band {
    background: var(--surface); border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border); padding: 64px 24px;
  }
  .metrics-inner { max-width: 860px; margin: 0 auto; display: flex; flex-wrap: wrap; }
  .metric { flex: 1; min-width: 180px; text-align: center; padding: 20px; border-right: 1px solid var(--border); }
  .metric:last-child { border-right: none; }
  .metric .value { font-size: 42px; font-weight: 800; line-height: 1; margin-bottom: 8px; color: var(--gold); }
  .metric .label { font-size: 11px; letter-spacing: 1.5px; color: var(--muted); }

  /* PALETTE */
  .palette-section { padding: 60px 24px; max-width: 800px; margin: 0 auto; }
  .palette-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
  .swatch { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .swatch-block { width: 52px; height: 52px; border-radius: 12px; border: 1px solid var(--border); }
  .swatch span { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--muted); }

  /* CTA */
  .cta-section {
    padding: 120px 24px; text-align: center;
    background: radial-gradient(ellipse 70% 50% at 50% 100%, rgba(139,111,212,0.07) 0%, transparent 100%);
  }
  .cta-section h2 {
    font-size: clamp(30px, 5vw, 54px); font-weight: 700;
    letter-spacing: -1.5px; margin-bottom: 18px; line-height: 1.1;
  }
  .cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 48px; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border); padding: 28px 36px;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
  }
  footer p { font-size: 11px; color: var(--muted); }
  footer a { color: var(--gold); text-decoration: none; font-size: 11px; }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#"><span>SANCTUM</span></a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#philosophy">Philosophy</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/sanctum-viewer" class="nav-cta">Open Viewer →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow-1"></div>
  <div class="hero-glow-2"></div>
  <div class="hero-label">RAM Design · March 2026</div>
  <h1>SANCTUM</h1>
  <div class="hero-sub-title">A  R I T U A L  F O R  D E E P  W O R K</div>
  <p>Not another timer. A calm, intentional system for entering, sustaining, and understanding your deepest focus sessions. Inspired by Linear's calm UI philosophy.</p>

  <div class="depth-preview">
    <div class="depth-chip">
      <div class="depth-score gold">87</div>
      <div class="depth-meta">
        <span class="label">DEPTH SCORE</span>
        <span class="sub">Design Sprint</span>
      </div>
    </div>
    <div class="depth-chip">
      <div class="depth-score violet">14</div>
      <div class="depth-meta">
        <span class="label">DAY STREAK</span>
        <span class="sub">Keep going</span>
      </div>
    </div>
    <div class="depth-chip">
      <div class="depth-score sage">91%</div>
      <div class="depth-meta">
        <span class="label">FLOW TODAY</span>
        <span class="sub">Entered at 7:40</span>
      </div>
    </div>
  </div>

  <div class="hero-buttons">
    <a href="https://ram.zenbin.org/sanctum-viewer" class="btn-gold">Open in Viewer</a>
    <a href="https://ram.zenbin.org/sanctum-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- METRICS -->
<div class="metrics-band">
  <div class="metrics-inner">
    <div class="metric"><div class="value">312</div><div class="label">TOTAL HOURS FOCUSED</div></div>
    <div class="metric"><div class="value">14</div><div class="label">DAY STREAK</div></div>
    <div class="metric"><div class="value">87%</div><div class="label">AVG DEPTH SCORE</div></div>
    <div class="metric"><div class="value">5</div><div class="label">SCREENS DESIGNED</div></div>
  </div>
</div>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="section-eyebrow">5 SCREENS</div>
  <h2 class="section-title">The full ritual</h2>
  <p class="section-sub">From daily intention to session history — every surface shaped around deep work.</p>
  <div class="screens-grid">

    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(145deg, #09090E 0%, #13141C 100%);">
        <div style="text-align:center; width:100%;">
          <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:${P.gold};margin-bottom:16px;">S A N C T U A R Y</div>
          <div style="background:rgba(212,168,83,0.12);border:1px solid rgba(212,168,83,0.2);border-radius:12px;padding:14px 18px;display:inline-flex;align-items:flex-end;gap:10px;">
            <span style="font-size:42px;font-weight:800;color:${P.gold};line-height:1">14</span>
            <span style="font-size:12px;color:${P.muted};margin-bottom:6px">day streak</span>
          </div>
          <div style="margin-top:12px;display:flex;gap:6px;justify-content:center;">
            ${[0.85,0.92,0.70,0.88,0.60,0,0].map((v,i) => {
              const h = Math.round(v * 40);
              const clr = i===1 ? P.gold : v>0 ? 'rgba(139,111,212,0.6)' : 'rgba(35,36,58,1)';
              return `<div style="width:12px;height:${h||4}px;background:${clr};border-radius:3px;align-self:flex-end"></div>`;
            }).join('')}
          </div>
          <div style="font-size:9px;letter-spacing:1px;color:${P.muted};margin-top:8px">THIS WEEK</div>
        </div>
      </div>
      <div class="screen-info"><h3>Sanctuary</h3><p>Home base. Daily streak, today's sessions, weekly rhythm chart, and your intention for the day.</p></div>
    </div>

    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(145deg, #0E0F18 0%, #13141C 100%);">
        <div style="width:90%;text-align:left;">
          <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:${P.gold};margin-bottom:16px;text-align:center">R I T U A L</div>
          ${['Sanctum Design System','Client Proposal','Personal Writing'].map((name, i) => {
            const clrs = [P.violet, P.gold, P.sage];
            const active = i === 0;
            return `<div style="background:${active ? 'rgba(139,111,212,0.1)' : 'rgba(255,255,255,0.03)'};border:1px solid ${active ? P.violet : 'rgba(255,255,255,0.07)'};border-radius:8px;padding:8px 12px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${active ? clrs[i] : 'rgba(255,255,255,0.15)'}"></div>
              <span style="font-size:11px;color:${active ? P.text : P.muted};font-weight:${active?600:400}">${name}</span>
              ${active ? `<span style="margin-left:auto;font-size:10px;color:${P.violet}">✓</span>` : ''}
            </div>`;
          }).join('')}
          <div style="display:flex;gap:6px;margin-top:10px;">
            ${['25m','45m','1h','1.5h','2h'].map((d,i) => `<div style="flex:1;background:${i===2?'rgba(212,168,83,0.25)':'rgba(255,255,255,0.04)'};border:1px solid ${i===2?P.gold:'rgba(255,255,255,0.07)'};border-radius:6px;padding:6px 0;text-align:center;font-size:9px;color:${i===2?P.gold:P.muted};font-weight:${i===2?700:400}">${d}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="screen-info"><h3>Ritual</h3><p>Session setup: choose project, set duration, write intention, pick ambient mode. Intent precedes action.</p></div>
    </div>

    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(145deg, #09090E 0%, #0E0F18 100%);">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:${P.gold};margin-bottom:14px">C H A M B E R</div>
          <div style="position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center;">
            <svg width="110" height="110" viewBox="0 0 110 110" style="position:absolute;top:0;left:0">
              <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(35,36,58,1)" stroke-width="2"/>
              <circle cx="55" cy="55" r="48" fill="none" stroke="${P.violet}" stroke-width="3"
                stroke-dasharray="${2*Math.PI*48}" stroke-dashoffset="${2*Math.PI*48*(1-0.62)}"
                transform="rotate(-90 55 55)" opacity="0.7"/>
              <circle cx="55" cy="55" r="38" fill="none" stroke="rgba(35,36,58,1)" stroke-width="1"/>
            </svg>
            <div style="text-align:center;z-index:1">
              <div style="font-size:26px;font-weight:800;color:${P.text};letter-spacing:-1px;line-height:1">37:22</div>
              <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-top:4px">REMAINING</div>
            </div>
          </div>
          <div style="margin-top:10px;display:flex;gap:6px;align-items:center;">
            <div style="font-size:10px;letter-spacing:1px;color:${P.muted}">DEPTH</div>
            <div style="font-size:16px;font-weight:800;color:${P.sage}">91%</div>
          </div>
        </div>
      </div>
      <div class="screen-info"><h3>Chamber</h3><p>Active focus session. Orbital ring timer, real-time depth score, ambient indicator, and quiet note capture.</p></div>
    </div>

    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(145deg, #09090E 0%, #13141C 100%);">
        <div style="text-align:center;width:90%">
          <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:${P.gold};margin-bottom:14px">H A R V E S T</div>
          <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:6px">SESSION DEPTH</div>
          <div style="font-size:52px;font-weight:800;color:${P.gold};line-height:1;margin-bottom:6px">87</div>
          <div style="font-size:9px;color:${P.muted};margin-bottom:14px">out of 100</div>
          <div style="display:flex;gap:8px;justify-content:center;">
            ${[['1h 00m','FOCUSED'],['4','NOTES'],['Entered','FLOW']].map(([v,l]) =>
              `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px 10px;">
                <div style="font-size:12px;font-weight:700;color:${l==='FLOW'?P.sage:P.text}">${v}</div>
                <div style="font-size:8px;letter-spacing:1px;color:${P.muted};margin-top:2px">${l}</div>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="screen-info"><h3>Harvest</h3><p>Session complete. Depth score, time focused, flow state, session notes, and a prompt to reflect on what got done.</p></div>
    </div>

    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(145deg, #0E0F18 0%, #13141C 100%);">
        <div style="width:90%">
          <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:${P.gold};margin-bottom:14px;text-align:center">C O D E X</div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:10px;">
            ${[0.85,0.92,0.70,0.88,0.60,0,0, 0.88,0.75,0.65,0.95,1.0,0,0, 0.78,0.82,0.9,0.6,0.88,0.5,1.0].map(v => {
              const clr = v>0.7 ? P.gold : v>0.4 ? 'rgba(139,111,212,0.6)' : v>0 ? 'rgba(46,48,80,1)' : 'rgba(35,36,58,1)';
              return `<div style="width:100%;padding-bottom:100%;background:${clr};border-radius:3px"></div>`;
            }).join('')}
          </div>
          ${[
            {d:'87%',l:'Design Sprint',w:'Today'},
            {d:'94%',l:'Morning Block',w:'Today'},
            {d:'78%',l:'Strategy Review',w:'Yesterday'},
          ].map(h => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
            <div style="font-size:13px;font-weight:800;color:${P.gold};min-width:34px">${h.d}</div>
            <div style="flex:1"><div style="font-size:10px;color:${P.text}">${h.l}</div><div style="font-size:9px;color:${P.muted}">${h.w}</div></div>
          </div>`).join('')}
        </div>
      </div>
      <div class="screen-info"><h3>Codex</h3><p>Activity heatmap, AI-generated insights about your patterns, and a scannable history of every session with depth scores.</p></div>
    </div>

  </div>
</section>

<!-- PHILOSOPHY -->
<section class="philosophy-section" id="philosophy">
  <div class="section-eyebrow">DESIGN PHILOSOPHY</div>
  <h2 class="section-title">Calm by design</h2>
  <p class="section-sub">Inspired by Linear's March 2026 "calmer, more consistent interface" — the idea that a tool's visual calm should match the cognitive calm you're trying to protect.</p>
  <div class="philosophy-grid">
    <div class="philosophy-card">
      <span class="phil-icon">◎</span>
      <h3>Spaced editorial typography</h3>
      <p>Labels use wide letter-spacing (1.5–3px) for a contemplative, unhurried quality. Data numerals contrast at bold weights. Inspired by Flomodia's character-spacing technique.</p>
    </div>
    <div class="philosophy-card">
      <span class="phil-icon">◈</span>
      <h3>Orbital ring timer</h3>
      <p>The Chamber screen centres your session around a single orbit. No progress bars, no confetti — just a ring that closes as time passes. Presence over gamification.</p>
    </div>
    <div class="philosophy-card">
      <span class="phil-icon">✦</span>
      <h3>Gold / violet duality</h3>
      <p>Gold (#D4A853) for warmth and presence — the candlelight of intention. Violet (#8B6FD4) for depth and focus. Two moods, never competing, always grounding.</p>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <div class="section-eyebrow">DARK PALETTE</div>
  <h2 class="section-title" style="font-size:32px;letter-spacing:-1px">Night palette</h2>
  <div class="palette-row">
    ${[
      ['#09090E','BG'],
      ['#13141C','Surface'],
      ['#1A1B26','Surface 2'],
      ['#23243A','Border'],
      ['#E8E6F0','Text'],
      ['#9B99B0','Muted'],
      ['#D4A853','Gold'],
      ['#8B6FD4','Violet'],
      ['#68A882','Sage'],
    ].map(([hex, name]) =>
      `<div class="swatch">
        <div class="swatch-block" style="background:${hex}"></div>
        <span>${hex}</span>
        <span style="color:rgba(232,230,240,0.7);font-size:10px">${name}</span>
      </div>`
    ).join('')}
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>Enter the Chamber.<br><span style="color:var(--gold)">Begin your ritual.</span></h2>
  <p>Open the full design in the Pencil viewer or explore the interactive Svelte mock.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
    <a href="https://ram.zenbin.org/sanctum-viewer" class="btn-gold">Open Viewer →</a>
    <a href="https://ram.zenbin.org/sanctum-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <p>SANCTUM · RAM Design Heartbeat · March 23, 2026</p>
  <div style="display:flex;gap:20px">
    <a href="https://ram.zenbin.org/sanctum-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/sanctum-mock">Mock</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
</footer>

</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════
// VIEWER PAGE (with EMBEDDED_PEN)
// ═══════════════════════════════════════════════════════════════════════════
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SANCTUM — Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #09090E; color: #E8E6F0; font-family: 'Space Mono', monospace; display: flex; flex-direction: column; min-height: 100vh; }
  header {
    background: rgba(9,9,14,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(232,230,240,0.07);
    padding: 0 28px; height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 10;
  }
  .logo { font-size: 12px; font-weight: 700; letter-spacing: 4px; color: #D4A853; }
  .links a { color: rgba(232,230,240,0.5); text-decoration: none; font-size: 11px; margin-left: 20px; letter-spacing: 1px; transition: color .2s; }
  .links a:hover { color: #D4A853; }
  #viewer-container { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 32px 16px; }
  #pencil-viewer { width: 100%; max-width: 1400px; height: 80vh; min-height: 600px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(232,230,240,0.07); }
  footer { padding: 20px 28px; border-top: 1px solid rgba(232,230,240,0.07); display: flex; justify-content: space-between; }
  footer p { font-size: 10px; color: rgba(232,230,240,0.3); letter-spacing: 1px; }
</style>
<script>
</script>
</head>
<body>
<header>
  <div class="logo">SANCTUM</div>
  <div class="links">
    <a href="https://ram.zenbin.org/sanctum">Hero</a>
    <a href="https://ram.zenbin.org/sanctum-mock">☀◑ Mock</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
</header>
<div id="viewer-container">
  <div id="pencil-viewer">
    <iframe
      src="https://pencil.dev/embed"
      id="pencil-frame"
      style="width:100%;height:100%;border:none"
      allow="fullscreen"
    ></iframe>
  </div>
</div>
<footer>
  <p>SANCTUM — RAM Design Heartbeat — March 23, 2026</p>
  <p>Pencil.dev v2.8 · 5 screens</p>
</footer>
<script>
  const frame = document.getElementById('pencil-frame');
  frame.addEventListener('load', () => {
    if (window.EMBEDDED_PEN) {
      frame.contentWindow.postMessage({ type: 'load-pen', data: window.EMBEDDED_PEN }, '*');
    }
  });
</script>
</body>
</html>`;

// Inject EMBEDDED_PEN
const penJson    = fs.readFileSync(new URL('./sanctum.pen', import.meta.url), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ═══════════════════════════════════════════════════════════════════════════
// PUBLISH
// ═══════════════════════════════════════════════════════════════════════════
console.log('Publishing SANCTUM hero + viewer...');

const [heroRes, viewerRes] = await Promise.all([
  publish(SLUG,           heroHtml,   'SANCTUM — A ritual for deep work.'),
  publish(`${SLUG}-viewer`, viewerHtml, 'SANCTUM — Viewer'),
]);

console.log('✓ Hero   →', heroRes.url);
console.log('✓ Viewer →', viewerRes.url);
