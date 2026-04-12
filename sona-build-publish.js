#!/usr/bin/env node
// SONA — Build HTML and publish full pipeline
// Light theme · Inspired by Format AI "hear the color" (darkmodedesign.com)
'use strict';

const fs    = require('fs');
const https = require('https');

const SLUG      = 'sona';
const SUBDOMAIN = 'ram';
const penJson   = fs.readFileSync('sona.pen', 'utf8');
const meta      = JSON.parse(penJson).meta;

// ─── Utility ──────────────────────────────────────────────────────────────────
function post(pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'zenbin.org', path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SONA — Speak freely, hear clearly</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #F6F3EE;
  --surf: #FFFFFF;
  --surf2: #EDE9E3;
  --border: rgba(28,25,23,0.09);
  --border-strong: rgba(28,25,23,0.18);
  --text: #1C1917;
  --muted: rgba(28,25,23,0.44);
  --accent: #E8603A;
  --accent2: #7C5CFC;
  --accent-soft: rgba(232,96,58,0.10);
  --accent2-soft: rgba(124,92,252,0.10);
  --green: #059669;
  --amber: #D97706;
}
html, body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; overflow-x: hidden; }

/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 60px;
  background: rgba(246,243,238,0.90); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.nav-logo-mark {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--accent); display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff; letter-spacing: -0.02em;
}
.nav-logo-name { font-size: 16px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.nav-links { display: flex; align-items: center; gap: 28px; }
.nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  font-size: 13px; font-weight: 600; color: #fff;
  background: var(--accent); padding: 10px 22px; border-radius: 100px;
  text-decoration: none; transition: opacity .2s; box-shadow: 0 2px 16px rgba(232,96,58,0.25);
}
.nav-cta:hover { opacity: .88; }

/* ── HERO ── */
.hero {
  min-height: 100vh; padding-top: 60px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding-left: 24px; padding-right: 24px;
  position: relative; overflow: hidden;
}
.hero-orb1 {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,96,58,0.08) 0%, transparent 70%);
  top: 15%; left: 55%; transform: translateX(-50%); pointer-events: none;
}
.hero-orb2 {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%);
  top: 40%; left: 15%; pointer-events: none;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 100px; padding: 6px 14px; margin-bottom: 32px;
  font-size: 11px; font-weight: 600; color: var(--accent2); letter-spacing: 0.06em;
}
.hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); }
.hero-title {
  font-size: clamp(44px, 6vw, 80px); font-weight: 700; letter-spacing: -0.04em;
  line-height: 1.05; color: var(--text); max-width: 720px; margin-bottom: 12px;
}
.hero-title .accent { color: var(--accent); }
.hero-title .accent2 { color: var(--accent2); }
.hero-sub {
  font-size: clamp(16px, 2vw, 20px); color: var(--muted); max-width: 500px;
  line-height: 1.6; margin-bottom: 40px; font-weight: 400;
}
.hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600;
  padding: 14px 28px; border-radius: 100px; text-decoration: none;
  box-shadow: 0 4px 24px rgba(232,96,58,0.28); transition: opacity .2s, transform .2s;
}
.btn-primary:hover { opacity: .88; transform: translateY(-1px); }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--surf); border: 1px solid var(--border-strong);
  color: var(--text); font-size: 14px; font-weight: 500;
  padding: 14px 28px; border-radius: 100px; text-decoration: none; transition: border-color .2s;
}
.btn-ghost:hover { border-color: var(--accent2); }

/* ── PREVIEW STRIP ── */
.preview-strip {
  margin-top: 64px; display: flex; gap: 16px; justify-content: center; align-items: flex-end;
  flex-wrap: wrap; position: relative; z-index: 1;
}
.phone-mock {
  width: 180px; background: var(--surf); border: 1px solid var(--border);
  border-radius: 24px; padding: 16px 14px; box-shadow: 0 12px 40px rgba(28,25,23,0.08);
  transform: rotate(var(--r, 0deg)); transition: transform .3s;
}
.phone-mock:hover { transform: rotate(0deg) translateY(-4px); }
.pm-bar { height: 5px; background: var(--border); border-radius: 99px; margin-bottom: 12px; }
.pm-bar.accent { background: var(--accent); width: 60%; }
.pm-bar.accent2 { background: var(--accent2); width: 45%; }
.pm-bar.muted { background: var(--border); width: 80%; }
.pm-waveform { display: flex; align-items: flex-end; gap: 2px; height: 32px; margin: 10px 0; }
.pm-waveform span { flex: 1; border-radius: 2px; background: var(--accent); opacity: 0.7; }
.pm-chip {
  display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 600;
  padding: 3px 8px; border-radius: 100px; letter-spacing: 0.04em;
}
.pm-chip.orange { background: var(--accent-soft); color: var(--accent); }
.pm-chip.violet { background: var(--accent2-soft); color: var(--accent2); }
.pm-chart { display: flex; align-items: flex-end; gap: 2px; height: 40px; margin-top: 10px; }
.pm-chart span { flex: 1; border-radius: 2px 2px 0 0; }

/* ── SECTION COMMON ── */
section { padding: 80px 24px; max-width: 1080px; margin: 0 auto; }
.section-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
  color: var(--accent); text-transform: uppercase; margin-bottom: 12px;
}
.section-title {
  font-size: clamp(28px, 4vw, 44px); font-weight: 700; letter-spacing: -0.03em;
  color: var(--text); line-height: 1.1; margin-bottom: 16px;
}
.section-body {
  font-size: 16px; color: var(--muted); max-width: 580px; line-height: 1.65;
}

/* ── FEATURES GRID ── */
.feat-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px; margin-top: 48px;
}
.feat-card {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 20px; padding: 28px 24px;
  transition: box-shadow .2s, border-color .2s;
}
.feat-card:hover { box-shadow: 0 8px 32px rgba(28,25,23,0.07); border-color: var(--border-strong); }
.feat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-bottom: 16px;
}
.feat-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.feat-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

/* ── SCREENS FLOW ── */
.screens-section { background: var(--surf2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 24px; }
.screens-inner { max-width: 1080px; margin: 0 auto; }
.screens-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
@media (max-width: 640px) { .screens-grid { grid-template-columns: 1fr; } }
.screen-card {
  background: var(--surf); border: 1px solid var(--border); border-radius: 20px;
  padding: 24px; transition: transform .2s, box-shadow .2s;
}
.screen-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(28,25,23,0.08); }
.screen-num { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: var(--accent2); margin-bottom: 8px; }
.screen-name { font-size: 17px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.screen-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }
.screen-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.screen-tag { font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 100px; background: var(--surf2); color: var(--muted); border: 1px solid var(--border); }

/* ── QUOTE ── */
.quote-section {
  max-width: 1080px; margin: 0 auto;
  padding: 80px 24px; text-align: center;
}
.blockquote {
  font-size: clamp(20px, 3vw, 32px); font-weight: 400; font-style: italic;
  color: var(--text); line-height: 1.5; letter-spacing: -0.02em;
  max-width: 740px; margin: 0 auto 24px;
  padding: 40px; background: var(--surf); border-radius: 24px;
  border: 1px solid var(--border); border-left: 3px solid var(--accent);
  box-shadow: 0 8px 32px rgba(28,25,23,0.06);
}
.blockquote-attr { font-size: 13px; color: var(--muted); margin-top: 0; }

/* ── FOOTER ── */
footer {
  padding: 32px 40px; text-align: center;
  border-top: 1px solid var(--border); font-size: 12px; color: var(--muted);
}
footer a { color: var(--accent2); text-decoration: none; }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">
    <div class="nav-logo-mark">S</div>
    <span class="nav-logo-name">SONA</span>
  </a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="${`https://ram.zenbin.org/${SLUG}-viewer`}">View Design</a>
  </div>
  <a class="nav-cta" href="${`https://ram.zenbin.org/${SLUG}-mock`}">Try Mock →</a>
</nav>

<div class="hero">
  <div class="hero-orb1"></div>
  <div class="hero-orb2"></div>

  <div class="hero-badge">
    <div class="dot"></div>
    AI Voice Journal · Emotional Intelligence
  </div>

  <h1 class="hero-title">
    Speak freely.<br>
    <span class="accent">Hear</span> <span class="accent2">clearly.</span>
  </h1>
  <p class="hero-sub">
    Record your thoughts in voice. Sona's AI synthesises them into emotional insights, weekly audio digests, and personalised coaching — so you can hear your own patterns.
  </p>

  <div class="hero-actions">
    <a class="btn-primary" href="${`https://ram.zenbin.org/${SLUG}-mock`}">
      ☀ Explore Mock
    </a>
    <a class="btn-ghost" href="${`https://ram.zenbin.org/${SLUG}-viewer`}">
      View Prototype
    </a>
  </div>

  <!-- Phone mocks strip -->
  <div class="preview-strip">
    <!-- Today screen mock -->
    <div class="phone-mock" style="--r:-3deg">
      <div class="pm-bar accent" style="width:50%"></div>
      <div style="font-size:9px;color:rgba(28,25,23,0.4);margin-bottom:6px;letter-spacing:.04em">HOW ARE YOU RIGHT NOW?</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <span class="pm-chip orange">✨ Energised</span>
        <span style="font-size:9px;padding:3px 7px;border-radius:100px;border:1px solid rgba(28,25,23,0.1);color:rgba(28,25,23,0.4)">😌 Calm</span>
        <span style="font-size:9px;padding:3px 7px;border-radius:100px;border:1px solid rgba(28,25,23,0.1);color:rgba(28,25,23,0.4)">😔 Low</span>
      </div>
      <div class="pm-bar muted" style="width:90%;margin-bottom:4px"></div>
      <div class="pm-bar muted" style="width:70%;margin-bottom:4px"></div>
      <div style="text-align:center;margin-top:12px;padding:10px;background:rgba(232,96,58,0.08);border-radius:12px">
        <div style="font-size:10px;color:var(--accent);font-weight:600">● Hold to speak</div>
      </div>
    </div>
    <!-- Insights screen mock -->
    <div class="phone-mock" style="--r:0deg; transform:scale(1.05)">
      <div style="font-size:9px;letter-spacing:.04em;color:rgba(124,92,252,0.9);font-weight:700;margin-bottom:6px">YOUR WEEK IN FEELING</div>
      <div style="font-size:13px;font-weight:700;color:#1C1917;margin-bottom:8px;letter-spacing:-0.02em">Increasingly<br>Calm</div>
      <div class="pm-chart">
        ${[42,38,55,61,74,80,77].map((h,i) => `<span style="height:${h*0.4}%;background:${i < 2 ? 'rgba(232,96,58,0.5)' : 'rgba(124,92,252,0.6)'}"></span>`).join('')}
      </div>
      <div style="margin-top:10px">
        ${['Work / focus','Relationships','Sleep'].map((l,i) => `
        <div style="margin-bottom:5px">
          <div style="font-size:9px;color:rgba(28,25,23,0.5);margin-bottom:2px">${l}</div>
          <div style="height:3px;background:rgba(28,25,23,0.08);border-radius:2px">
            <div style="height:100%;border-radius:2px;background:${['#E8603A','#7C5CFC','#059669'][i]};width:${[68,44,36][i]}%"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <!-- Listen screen mock -->
    <div class="phone-mock" style="--r:3deg">
      <div style="font-size:9px;letter-spacing:.04em;color:rgba(28,25,23,0.4);margin-bottom:6px">AUDIO DIGEST · WEEK 14</div>
      <div style="background:linear-gradient(135deg,rgba(232,96,58,0.15),rgba(124,92,252,0.15));border-radius:12px;height:56px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
        <div class="pm-waveform" style="height:28px;margin:0;padding:0 8px">
          ${[0.3,0.6,0.9,0.7,1.0,0.8,0.6,0.9,0.7,0.5,0.8,0.9,0.6,0.4,0.7,0.8,0.5,0.3,0.6,0.7].map(h => `<span style="height:${h*100}%;background:var(--accent)"></span>`).join('')}
        </div>
      </div>
      <div style="font-size:10px;font-weight:600;color:#1C1917;margin-bottom:4px">Your Week, Synthesised</div>
      <div style="font-size:9px;color:rgba(28,25,23,0.45);margin-bottom:8px">8m 24s · 5 chapters</div>
      <div style="height:3px;background:rgba(28,25,23,0.08);border-radius:2px;margin-bottom:6px">
        <div style="height:100%;width:42%;background:var(--accent);border-radius:2px"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(28,25,23,0.4)">
        <span>3:32</span><span>▶</span><span>8:24</span>
      </div>
    </div>
  </div>
</div>

<!-- ── FEATURES ── -->
<section id="features">
  <div class="section-eyebrow">How Sona Works</div>
  <h2 class="section-title">Your voice. Understood.</h2>
  <p class="section-body">Sona listens to how you speak — not just what you say. It tracks emotional patterns, surfaces hidden correlations, and delivers insights as audio you can actually listen to.</p>

  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background: rgba(232,96,58,0.10);">🎙️</div>
      <div class="feat-title">Voice journaling</div>
      <div class="feat-desc">Tap and speak. No keyboard, no friction. Sona records, transcribes, and AI-titles every entry so your library stays organised automatically.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background: rgba(124,92,252,0.10);">🔮</div>
      <div class="feat-title">Emotional AI analysis</div>
      <div class="feat-desc">Each entry is analysed for emotional tone, recurring themes, and language patterns — surfacing what you didn't realise you were saying.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background: rgba(5,150,105,0.10);">🎧</div>
      <div class="feat-title">Weekly audio digest</div>
      <div class="feat-desc">Your week's emotional arc, synthesised into a personalised podcast. Listen on your commute. Hear your own patterns in a whole new way.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background: rgba(217,119,6,0.10);">📈</div>
      <div class="feat-title">Insight & coaching</div>
      <div class="feat-desc">AI-generated reflection prompts, a weekly personal letter, and intention tracking help you grow — guided by what you actually said, not generic advice.</div>
    </div>
  </div>
</section>

<!-- ── SCREENS ── -->
<div class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="section-eyebrow">Five Screens</div>
    <h2 class="section-title">A complete emotional intelligence companion</h2>
    <p class="section-body">Each screen serves a distinct part of your practice — from the daily check-in to the weekly audio synthesis.</p>

    <div class="screens-grid">
      <div class="screen-card">
        <div class="screen-num">01 — TODAY</div>
        <div class="screen-name">Morning Check-In</div>
        <div class="screen-desc">Mood selector, yesterday's AI insight capsule, and a voice record button with contextual prompts. Streak and weekly stats at a glance.</div>
        <div class="screen-tags">
          <span class="screen-tag">Mood ring</span>
          <span class="screen-tag">Record CTA</span>
          <span class="screen-tag">Daily streak</span>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-num">02 — JOURNAL</div>
        <div class="screen-name">Voice Entry Library</div>
        <div class="screen-desc">All your entries, chronologically listed. Each card shows the AI-generated title, emotional tag, duration, and a miniature waveform for quick scanning.</div>
        <div class="screen-tags">
          <span class="screen-tag">AI titles</span>
          <span class="screen-tag">Waveform thumbs</span>
          <span class="screen-tag">Emotion tags</span>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-num">03 — INSIGHTS</div>
        <div class="screen-name">Emotional Patterns</div>
        <div class="screen-desc">Weekly emotional arc chart (calm vs stress), dominant themes ranked by frequency, and AI-generated observations about your language and timing.</div>
        <div class="screen-tags">
          <span class="screen-tag">Area chart</span>
          <span class="screen-tag">Theme progress</span>
          <span class="screen-tag">AI observations</span>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-num">04 — LISTEN</div>
        <div class="screen-name">Weekly Audio Digest</div>
        <div class="screen-desc">Full podcast-style player for your AI-generated weekly synthesis. Chapter markers, live transcript with highlighted quotes, and playback speed control.</div>
        <div class="screen-tags">
          <span class="screen-tag">Audio player</span>
          <span class="screen-tag">Chapters</span>
          <span class="screen-tag">Live transcript</span>
        </div>
      </div>
      <div class="screen-card" style="grid-column: span 2">
        <div class="screen-num">05 — GROW</div>
        <div class="screen-name">Coaching & Intentions</div>
        <div class="screen-desc">A weekly personal letter written by the AI from your entries, intention progress bars, and curated reflection prompts that invite you to go deeper on the patterns Sona found this week.</div>
        <div class="screen-tags">
          <span class="screen-tag">Weekly letter</span>
          <span class="screen-tag">Intention tracking</span>
          <span class="screen-tag">Prompt cards</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ── PULL QUOTE ── -->
<div class="quote-section">
  <blockquote class="blockquote">
    "Dear Mira — this was a week of quiet transformation. You began it braced for collision and ended it standing straighter. Your words say more than you realise."
  </blockquote>
  <p class="blockquote-attr">— An example of Sona's weekly personal letter, composed from your voice entries</p>
</div>

<!-- ── DESIGN CREDIT ── -->
<section style="text-align:center; padding-top: 0">
  <div class="section-eyebrow" style="margin-bottom:8px">Design Inspiration</div>
  <p style="font-size:13px; color: var(--muted); max-width:560px; margin: 0 auto; line-height:1.7">
    Inspired by <strong style="color:var(--text)">Format AI's "hear the color" concept</strong> (useformat.ai/podcasts),
    featured on <a href="https://www.darkmodedesign.com" style="color:var(--accent2)">darkmodedesign.com</a>.
    Their idea of synthesising business conversations into personalised audio sparked this consumer flip —
    turning personal voice journals into emotional intelligence you can actually listen to.
  </p>
</section>

<footer>
  SONA — Design concept by <a href="https://ram.zenbin.org">RAM Design Heartbeat</a> ·
  <a href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype</a> ·
  <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ───────────────────────────────────────────────────────────────
const viewerHtmlRaw = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SONA — Prototype Viewer</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #F0EDE8; font-family: 'Inter', system-ui, sans-serif; height: 100vh; overflow: hidden; }
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 52px; background: rgba(246,243,238,0.92);
    border-bottom: 1px solid rgba(28,25,23,0.09); backdrop-filter: blur(12px);
  }
  .vn-logo { font-size: 14px; font-weight: 700; letter-spacing: -0.02em; color: #1C1917; display:flex;align-items:center;gap:8px; }
  .vn-mark { width:24px;height:24px;background:#E8603A;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff; }
  .vn-badge { font-size: 10px; font-weight: 600; color: rgba(28,25,23,0.45); letter-spacing: 0.05em; }
  .vn-link { font-size: 12px; color: rgba(28,25,23,0.55); text-decoration: none; }
  .vn-link:hover { color: #E8603A; }
  .viewer { display: flex; align-items: center; justify-content: center; height: calc(100vh - 52px); padding: 24px; }
  #pencil-viewer {
    width: 100%; max-width: 1200px; height: 100%;
    border-radius: 16px; border: 1px solid rgba(28,25,23,0.12);
    background: #FFFFFF;
    box-shadow: 0 16px 60px rgba(28,25,23,0.12);
  }
</style>
<!-- EMBED_PEN_HERE -->
</head>
<body>
<nav>
  <div class="vn-logo">
    <div class="vn-mark">S</div>
    SONA
    <span class="vn-badge">PROTOTYPE</span>
  </div>
  <a class="vn-link" href="https://ram.zenbin.org/${SLUG}">← Back to overview</a>
</nav>
<div class="viewer">
  <div id="pencil-viewer">Loading prototype…</div>
</div>
<script>
(function(){
  var el = document.getElementById('pencil-viewer');
  if (window.EMBEDDED_PEN) {
    var fr = document.createElement('iframe');
    fr.style.cssText = 'width:100%;height:100%;border:none;border-radius:inherit';
    fr.src = 'https://pencil.dev/embed/v2?' + Date.now();
    el.innerHTML = '';
    el.appendChild(fr);
    fr.addEventListener('load', function(){
      fr.contentWindow.postMessage({ type: 'LOAD_PEN', pen: window.EMBEDDED_PEN }, '*');
    });
    el.style.overflow = 'hidden';
  } else {
    el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(28,25,23,0.4);font-size:14px">No embedded design found</div>';
  }
})();
<\/script>
</body>
</html>`;

const penJsonStr = fs.readFileSync('sona.pen', 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};<\/script>`;
const viewerHtml = viewerHtmlRaw.replace('<!-- EMBED_PEN_HERE -->', injection);

fs.writeFileSync('sona-viewer.html', viewerHtml);
console.log('✓ sona-viewer.html written');

(async () => {
  console.log('Publishing SONA hero page…');
  const r1 = await post('/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG },
    { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN }
  );
  console.log(`  Hero: ${r1.status === 200 ? '✓' : '✗'} → https://ram.zenbin.org/${SLUG}`);
  if (r1.status !== 200) console.log('  Error:', r1.body.slice(0, 120));

  console.log('Publishing SONA viewer…');
  const r2 = await post('/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' },
    { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN }
  );
  console.log(`  Viewer: ${r2.status === 200 ? '✓' : '✗'} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (r2.status !== 200) console.log('  Error:', r2.body.slice(0, 120));
})();
