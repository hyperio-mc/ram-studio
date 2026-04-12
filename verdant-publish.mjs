// VERDANT — Hero page + Viewer publish script
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SLUG = 'verdant';
const APP_NAME = 'VERDANT';
const TAGLINE = 'Tend your growth. Track your seasons.';

// ── Load publish helpers ──────────────────────────────────────────────────────
const zenbin = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));

async function publish(slug, html, title = APP_NAME) {
  const res = await fetch('https://zenbin.org/api/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': 'ram',
    },
    body: JSON.stringify({ slug, html, title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Publish failed [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F7F4EF',
  surface:  '#FFFFFF',
  surfaceAlt: '#EDE9E1',
  text:     '#1C1A16',
  textMid:  '#6B6459',
  accent:   '#3D6B4F',
  accentSoft:'#E8F0EA',
  terra:    '#C4692A',
  terrasft: '#F5E6DB',
  gold:     '#C9A84C',
  sage:     '#8AAF8E',
  muted:    'rgba(28,26,22,0.5)',
  border:   'rgba(28,26,22,0.10)',
};

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surface: ${P.surface};
    --surface-alt: ${P.surfaceAlt};
    --text: ${P.text};
    --text-mid: ${P.textMid};
    --accent: ${P.accent};
    --accent-soft: ${P.accentSoft};
    --terra: ${P.terra};
    --terra-soft: ${P.terrasft};
    --gold: ${P.gold};
    --sage: ${P.sage};
    --border: ${P.border};
    --muted: ${P.muted};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px;
    background: rgba(247,244,239,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Lora', serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    text-decoration: none;
    letter-spacing: -0.3px;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--text-mid); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff; border: none; cursor: pointer;
    padding: 10px 22px; border-radius: 24px; font-size: 14px; font-weight: 600;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ── */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-soft); color: var(--accent);
    padding: 5px 14px; border-radius: 20px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
    margin-bottom: 20px;
  }
  .hero-title {
    font-family: 'Lora', serif;
    font-size: clamp(40px, 5vw, 62px);
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -1px;
    color: var(--text);
    margin-bottom: 20px;
  }
  .hero-title em { font-style: italic; color: var(--accent); }
  .hero-subtitle {
    font-size: 17px;
    color: var(--text-mid);
    line-height: 1.65;
    margin-bottom: 36px;
    max-width: 440px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 28px; border-radius: 28px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    display: inline-flex; align-items: center; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(61,107,79,0.3);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(61,107,79,0.35); }
  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 14px 24px; border-radius: 28px;
    border: 1.5px solid var(--border);
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Phone mockup ── */
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .phone-frame {
    width: 280px;
    background: var(--surface);
    border-radius: 36px;
    border: 1px solid var(--border);
    box-shadow: 0 32px 80px rgba(28,26,22,0.14), 0 8px 24px rgba(28,26,22,0.08);
    overflow: hidden;
    position: relative;
  }
  .phone-screen {
    background: var(--bg);
    padding: 24px 20px;
    min-height: 540px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .phone-status-bar {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; font-weight: 600; color: var(--text-mid);
    padding: 0 4px; margin-bottom: 8px;
  }
  .phone-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid var(--border);
  }
  .phone-hero-card {
    background: var(--accent);
    border-radius: 18px;
    padding: 20px;
    color: white;
  }
  .phone-metric-row { display: flex; gap: 8px; }
  .phone-metric {
    background: var(--accent-soft); border-radius: 12px; padding: 12px;
    flex: 1; display: flex; flex-direction: column; gap: 2px;
  }
  .phone-metric-val {
    font-family: 'Lora', serif;
    font-size: 22px; font-weight: 700; color: var(--accent);
  }
  .phone-metric-lbl { font-size: 10px; font-weight: 600; color: var(--text-mid); }

  /* ── Floating decorative elements ── */
  .float-badge {
    position: absolute;
    background: var(--surface);
    border-radius: 14px;
    border: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(28,26,22,0.10);
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .float-1 { top: 60px; right: -20px; animation: float 4s ease-in-out infinite; }
  .float-2 { bottom: 80px; left: -30px; animation: float 4s ease-in-out infinite 1.5s; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  /* ── Features section ── */
  .features {
    padding: 80px 40px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--text-mid);
    text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Lora', serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.5px;
    color: var(--text);
    margin-bottom: 16px;
  }
  .section-sub {
    font-size: 16px; color: var(--text-mid); max-width: 500px; line-height: 1.6;
    margin-bottom: 56px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .feature-card {
    background: var(--surface);
    border-radius: 20px;
    padding: 28px;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(28,26,22,0.08); }
  .feature-icon {
    font-size: 28px;
    margin-bottom: 16px;
    display: block;
  }
  .feature-title {
    font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px;
  }
  .feature-desc {
    font-size: 13px; color: var(--text-mid); line-height: 1.55;
  }

  /* ── Seasons section ── */
  .seasons {
    padding: 60px 40px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .seasons-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 40px;
  }
  .season-card {
    border-radius: 20px;
    padding: 24px 20px;
    text-align: center;
  }
  .season-card h3 { font-family: 'Lora', serif; font-size: 16px; font-weight: 700; margin: 10px 0 6px; }
  .season-card p { font-size: 12px; color: var(--text-mid); line-height: 1.5; }

  /* ── Quote section ── */
  .quote-section {
    padding: 80px 40px;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }
  .quote-text {
    font-family: 'Lora', serif;
    font-size: clamp(22px, 3vw, 32px);
    font-style: italic;
    color: var(--text);
    line-height: 1.45;
    margin-bottom: 20px;
  }
  .quote-author {
    font-size: 13px; color: var(--text-mid); font-weight: 600; letter-spacing: 0.5px;
  }

  /* ── CTA section ── */
  .cta-section {
    padding: 80px 40px;
    text-align: center;
    background: var(--accent);
    color: white;
    margin: 0 40px 60px;
    border-radius: 28px;
  }
  .cta-section h2 { font-family: 'Lora', serif; font-size: 36px; font-weight: 700; margin-bottom: 14px; line-height: 1.2; }
  .cta-section p { font-size: 16px; opacity: 0.8; margin-bottom: 32px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-white {
    background: white; color: var(--accent);
    padding: 14px 28px; border-radius: 28px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-white:hover { opacity: 0.9; }
  .btn-outline-white {
    background: transparent; color: white;
    padding: 14px 24px; border-radius: 28px;
    border: 1.5px solid rgba(255,255,255,0.5);
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: border-color 0.2s;
  }
  .btn-outline-white:hover { border-color: white; }

  /* ── Footer ── */
  footer {
    padding: 40px;
    text-align: center;
    color: var(--text-mid);
    font-size: 13px;
    border-top: 1px solid var(--border);
  }
  footer strong { color: var(--text); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 120px 24px 60px; }
    .hero-visual { display: none; }
    .features-grid { grid-template-columns: 1fr; }
    .seasons-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 14px 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<!-- Nav -->
<nav>
  <a class="nav-logo" href="#"><span>V</span>ERDANT</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#seasons">Seasons</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Try the Mock →</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">🌿 Biophilic Wellness · Spring 2026</div>
    <h1 class="hero-title">
      Tend your<br>
      <em>growth.</em><br>
      Track your seasons.
    </h1>
    <p class="hero-subtitle">
      VERDANT is a personal wellness garden — a space to track your daily rituals,
      journal your reflections, and watch your growth unfold like a living ecosystem.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">
        🌱 Explore Interactive Mock
      </a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">
        View Design Screens
      </a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="phone-status-bar">
          <span>9:41</span>
          <span>●●● 🔋</span>
        </div>
        <div>
          <div style="font-size:11px;color:${P.textMid};font-weight:500;margin-bottom:2px">Sunday, 22 March</div>
          <div style="font-family:'Lora',serif;font-size:22px;font-weight:700;color:${P.text};margin-bottom:8px">Your Garden</div>
          <div style="display:inline-flex;align-items:center;gap:5px;background:${P.accentSoft};color:${P.accent};padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700">🌱 Week 12 of Growth</div>
        </div>
        <div class="phone-hero-card">
          <div style="font-size:9px;font-weight:700;opacity:0.55;letter-spacing:2px;margin-bottom:6px">SPRING EQUINOX</div>
          <div style="font-family:'Lora',serif;font-size:16px;font-weight:700;line-height:1.3;margin-bottom:8px">A season of new roots.</div>
          <div style="font-size:11px;opacity:0.75;line-height:1.5">6 of 7 practices completed this week.</div>
        </div>
        <div class="phone-metric-row">
          <div class="phone-metric">
            <span class="phone-metric-val">24</span>
            <span class="phone-metric-lbl">Day Streak</span>
          </div>
          <div class="phone-metric" style="background:${P.terrasft}">
            <span class="phone-metric-val" style="color:${P.terra}">6</span>
            <span class="phone-metric-lbl">Practices</span>
          </div>
          <div class="phone-metric" style="background:#FEF3DC">
            <span class="phone-metric-val" style="color:${P.gold}">84%</span>
            <span class="phone-metric-lbl">Vitality</span>
          </div>
        </div>
        <div class="phone-card">
          <div style="font-size:12px;font-weight:700;color:${P.text};margin-bottom:10px">Today's Practices</div>
          ${['🌬️ Morning Breathwork · Done','📖 Mindful Reading · Done','🚶 Nature Walk · Pending','✍️ Evening Journal · Pending'].map((t,i) => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid ${P.border};font-size:11px;color:${i<2?P.accent:P.textMid}">
            <span>${t.split('·')[0].trim()}</span>
            <span style="margin-left:auto;font-weight:600">${t.split('·')[1].trim()}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="float-badge float-1">
      <span>🔥</span> 24-Day Streak
    </div>
    <div class="float-badge float-2">
      <span>🌸</span> Spring Equinox
    </div>
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <p class="section-eyebrow">Features</p>
  <h2 class="section-title">Everything your garden needs</h2>
  <p class="section-sub">VERDANT blends habit tracking, reflective journaling, and seasonal storytelling into a single, living practice.</p>
  <div class="features-grid">
    ${[
      { icon: '🌿', title: 'Habit Garden', desc: 'Track rituals as living plants — the more consistent you are, the more they grow. Six categories: body, mind, spirit, creativity, connection, rest.' },
      { icon: '✍️', title: 'Seasonal Journal', desc: 'Daily reflections with mood tagging, gratitude prompts, and free writing. Your journal becomes an archive of your seasons.' },
      { icon: '🗓️', title: 'Growth Timeline', desc: 'An editorial scroll through your milestones — visualised as chapters in an ongoing story rather than data points on a chart.' },
      { icon: '🌸', title: 'Pattern Insights', desc: 'Understand your rhythms. VERDANT surfaces when you\'re most consistent, which practices strengthen others, and seasonal patterns.' },
      { icon: '🌱', title: 'Streak Cultivation', desc: 'Streaks are presented as living streaks rather than numbers — fragile, precious, worth tending carefully.' },
      { icon: '📖', title: 'Reading Ritual', desc: 'Attach reading goals to your practice. Log what you\'re reading, note insights, connect books to moods and seasons.' },
    ].map(f => `
    <div class="feature-card">
      <span class="feature-icon">${f.icon}</span>
      <div class="feature-title">${f.title}</div>
      <p class="feature-desc">${f.desc}</p>
    </div>`).join('')}
  </div>
</section>

<!-- Seasons -->
<section class="seasons" id="seasons">
  <p class="section-eyebrow">Seasonal Design</p>
  <h2 class="section-title">Your life has seasons.<br>VERDANT honours them.</h2>
  <div class="seasons-grid">
    ${[
      { emoji: '🌸', name: 'Spring', sub: 'New beginnings & planting seeds', bg: P.accentSoft, color: P.accent },
      { emoji: '☀️', name: 'Summer', sub: 'Full bloom & sustained energy', bg: '#FEF3DC', color: P.gold },
      { emoji: '🍂', name: 'Autumn', sub: 'Harvest & deep reflection', bg: P.terrasft, color: P.terra },
      { emoji: '❄️', name: 'Winter', sub: 'Rest, warmth & inner quiet', bg: '#EEE9FF', color: '#7B5EA7' },
    ].map(s => `
    <div class="season-card" style="background:${s.bg}">
      <div style="font-size:32px">${s.emoji}</div>
      <h3 style="color:${s.color}">${s.name}</h3>
      <p>${s.sub}</p>
    </div>`).join('')}
  </div>
</section>

<!-- Quote -->
<div class="quote-section">
  <p class="quote-text">
    "The garden suggests there might be a place where we can meet nature halfway."
  </p>
  <p class="quote-author">— Michael Pollan · The Botany of Desire</p>
</div>

<!-- Design Credit -->
<section style="padding: 40px; max-width: 1100px; margin: 0 auto;">
  <div style="background:${P.surfaceAlt};border-radius:20px;padding:28px;display:flex;gap:20px;align-items:flex-start">
    <div style="font-size:28px;flex-shrink:0">🎨</div>
    <div>
      <div style="font-size:11px;font-weight:700;color:${P.textMid};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px">Design Inspiration</div>
      <p style="font-size:13px;color:${P.textMid};line-height:1.6">
        Inspired by <strong style="color:${P.text}">FC Porto Memorial</strong> (Awwwards SOTD, 22 Mar 2026) — an editorial memorial with a 2-colour parchment palette and immersive scroll storytelling by Significa ·
        <strong style="color:${P.text}">Emergence Magazine</strong> (Land-book) — the connection between ecology, culture & spirituality ·
        <strong style="color:${P.text}">Kyn &amp; Folk</strong> (Land-book) — artisanal ceramic warmth and handcrafted aesthetic ·
        <strong style="color:${P.text}">Midday</strong> (Dark Mode Design) — temporal tracking and habit rituals.
      </p>
    </div>
  </div>
</section>

<!-- CTA -->
<div style="padding: 0 40px 60px">
  <div class="cta-section">
    <h2>Start tending your garden today.</h2>
    <p>Five screens. Five practices. One season at a time.</p>
    <div class="cta-btns">
      <a class="btn-white" href="https://ram.zenbin.org/${SLUG}-mock">🌱 Try the Interactive Mock</a>
      <a class="btn-outline-white" href="https://ram.zenbin.org/${SLUG}-viewer">View All Screens</a>
    </div>
  </div>
</div>

<!-- Footer -->
<footer>
  <p><strong>VERDANT</strong> — Biophilic Personal Growth Garden · A RAM Design Heartbeat project · 22 Mar 2026</p>
  <p style="margin-top:8px;font-size:11px">Designed by RAM · Inspired by Awwwards, Land-book, Dark Mode Design · Built with pencil.dev v2.8</p>
</footer>

</body>
</html>`;

// ── Build viewer HTML ─────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/verdant.pen', 'utf8');

// Load viewer template from an existing viewer or build minimal one
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Screens Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#F7F4EF;font-family:'Inter',sans-serif;color:#1C1A16;min-height:100vh}
  header{padding:20px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(28,26,22,0.1);background:rgba(247,244,239,0.9);backdrop-filter:blur(8px);position:sticky;top:0;z-index:10}
  .logo{font-family:'Lora',serif;font-size:18px;font-weight:700;color:#1C1A16}
  .logo span{color:#3D6B4F}
  .back-btn{background:#3D6B4F;color:white;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;transition:opacity 0.2s}
  .back-btn:hover{opacity:0.85}
  .viewer-wrap{max-width:420px;margin:40px auto;padding:0 20px 60px}
  .screen-label{font-size:11px;font-weight:700;color:#6B6459;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;margin-top:32px}
  .screen-frame{background:white;border-radius:28px;border:1px solid rgba(28,26,22,0.1);box-shadow:0 16px 48px rgba(28,26,22,0.10);overflow:hidden}
  .screen-render{padding:20px;min-height:600px;background:#F7F4EF;font-family:'Inter',sans-serif}
  .loading{text-align:center;padding:60px 20px;color:#6B6459}
  .screen-nav{display:flex;gap:8px;overflow-x:auto;padding:16px;background:white;border-top:1px solid rgba(28,26,22,0.08)}
  .screen-btn{flex-shrink:0;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;border:1.5px solid rgba(28,26,22,0.12);cursor:pointer;background:transparent;color:#6B6459;transition:all 0.15s}
  .screen-btn.active{background:#3D6B4F;color:white;border-color:#3D6B4F}
</style>
</head>
<body>
<header>
  <div class="logo"><span>V</span>ERDANT — Viewer</div>
  <a class="back-btn" href="https://ram.zenbin.org/${SLUG}">← Hero Page</a>
</header>
<div class="viewer-wrap">
  <div class="screen-label">Design Screens</div>
  <div class="screen-frame">
    <div class="screen-render" id="render">
      <div class="loading">🌿 Loading VERDANT screens…</div>
    </div>
    <div class="screen-nav" id="screen-nav"></div>
  </div>
</div>
<script>
window.VERDANT_PLACEHOLDER = true;
</script>
<script>
// Minimal screen renderer — reads EMBEDDED_PEN
(function() {
  function init() {
    const pen = window.EMBEDDED_PEN;
    if (!pen) { document.getElementById('render').innerHTML = '<div class="loading">No pen data found.</div>'; return; }
    const data = typeof pen === 'string' ? JSON.parse(pen) : pen;
    const screens = data.screens || [];
    const nav = document.getElementById('screen-nav');
    const render = document.getElementById('render');
    let current = 0;

    function renderNode(node, depth) {
      if (!node) return '';
      if (node.type === 'text') {
        const s = styleStr(node.style || {});
        return '<span style="' + s + '">' + escHtml(node.value || '') + '</span>';
      }
      if (node.type === 'view') {
        const s = styleStr(node.style || {});
        const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
        return '<div style="' + s + '">' + children + '</div>';
      }
      return '';
    }

    function styleStr(s) {
      const map = {
        backgroundColor:'background-color', borderRadius:'border-radius', padding:'padding',
        paddingHorizontal:'padding-left', paddingVertical:'padding-top',
        flexDirection:'flex-direction', justifyContent:'justify-content', alignItems:'align-items',
        fontSize:'font-size', fontWeight:'font-weight', fontFamily:'font-family',
        lineHeight:'line-height', letterSpacing:'letter-spacing', fontStyle:'font-style',
        color:'color', flex:'flex', gap:'gap', marginBottom:'margin-bottom', marginTop:'margin-top',
        width:'width', height:'height', border:'border', overflow:'overflow', position:'position',
        minHeight:'min-height', flexWrap:'flex-wrap', flexShrink:'flex-shrink', alignSelf:'align-self',
        paddingTop:'padding-top', paddingBottom:'padding-bottom',
        paddingLeft:'padding-left', paddingRight:'padding-right',
        marginLeft:'margin-left', marginRight:'margin-right',
        borderBottom:'border-bottom', borderTop:'border-top', textAlign:'text-align',
        opacity:'opacity',
      };
      let out = 'display:flex;flex-direction:column;';
      for (const [k,v] of Object.entries(s)) {
        if (map[k]) {
          let val = v;
          if (k === 'fontSize' && typeof v === 'number') val = v + 'px';
          if (k === 'borderRadius' && typeof v === 'number') val = v + 'px';
          if (k === 'padding' && typeof v === 'number') val = v + 'px';
          if (k === 'paddingHorizontal') { out += 'padding-left:' + v + 'px;padding-right:' + v + 'px;'; continue; }
          if (k === 'paddingVertical') { out += 'padding-top:' + v + 'px;padding-bottom:' + v + 'px;'; continue; }
          if ((k === 'gap' || k === 'width' || k === 'height' || k === 'minHeight') && typeof v === 'number') val = v + 'px';
          out += map[k] + ':' + val + ';';
        }
      }
      return out;
    }

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function showScreen(i) {
      current = i;
      const scr = screens[i];
      if (!scr) return;
      render.innerHTML = renderNode(scr.root, 0) || '<div class="loading">Empty screen</div>';
      document.querySelectorAll('.screen-btn').forEach((b, j) => b.classList.toggle('active', j === i));
    }

    screens.forEach((scr, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i === 0 ? ' active' : '');
      btn.textContent = scr.label || 'Screen ' + (i+1);
      btn.onclick = () => showScreen(i);
      nav.appendChild(btn);
    });

    showScreen(0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
</body>
</html>`;

// Inject EMBEDDED_PEN
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\nwindow.VERDANT_PLACEHOLDER = true;\n</script>', injection);

// ── Publish ───────────────────────────────────────────────────────────────────
console.log('Publishing hero page…');
const heroResult = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('✅ Hero:', heroResult.url || `https://ram.zenbin.org/${SLUG}`);

console.log('Publishing viewer…');
const viewerResult = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Screens Viewer`);
console.log('✅ Viewer:', viewerResult.url || `https://ram.zenbin.org/${SLUG}-viewer`);
