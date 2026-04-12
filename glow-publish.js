'use strict';
// glow-publish.js — GLOW hero + viewer

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'glow';
const APP_NAME  = 'Glow';
const TAGLINE   = 'Your morning energy operating system';
const ARCHETYPE = 'wellness-productivity';
const PROMPT    = 'Light-mode morning energy & focus tracker for founders — inspired by Dawn mental health app (lapa.ninja) warm palette and Equals editorial SaaS dashboard (land-book.com), plus Litbix warm cream tones (minimal.gallery)';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function publish(slug, html, title) {
  const body = JSON.stringify({ title, html });
  const res = await request({
    hostname: 'zenbin.org',
    path: '/v1/pages/' + slug + '?overwrite=true',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    }
  }, body);
  if (res.status === 200 || res.status === 201) {
    let r;
    try { r = JSON.parse(res.body); } catch(e) { r = {}; }
    const url = r.url || ('https://ram.zenbin.org/' + slug);
    console.log('  Published:', url);
    return url;
  } else {
    console.error('  Publish failed (' + res.status + '):', res.body.slice(0, 200));
    return null;
  }
}

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Glow — Your morning energy operating system</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#FBF7F3;color:#1C1815;font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.5;overflow-x:hidden}
:root{
  --bg:#FBF7F3;--surface:#FFFFFF;--surface2:#F4EFE9;
  --text:#1C1815;--mid:#5C5248;--mute:#9C9088;
  --accent:#E8713C;--accent2:#7AAD83;--soft:#FAE8DE;--green:#D4EDDA;
  --border:#EAE4DC;--purple:#9B7FCC;--purple-soft:#F0EBF9;
}
/* NAV */
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;background:rgba(251,247,243,0.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.nav-logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;color:var(--text)}
.logo-dot{width:28px;height:28px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;flex-shrink:0}
.nav-links{display:flex;gap:28px}
.nav-links a{text-decoration:none;color:var(--mid);font-size:14px;font-weight:500;transition:color .15s}
.nav-links a:hover{color:var(--accent)}
.nav-cta{background:var(--accent);color:#fff;border:none;padding:10px 22px;border-radius:22px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none}
/* HERO */
.hero{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px;margin:0 auto;padding:80px 40px 60px}
.hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--soft);color:var(--accent);padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.5px;margin-bottom:24px}
.hero-tag::before{content:'✦';font-size:10px}
h1{font-size:52px;font-weight:800;line-height:1.08;letter-spacing:-1.5px;color:var(--text);margin-bottom:18px}
h1 .glow{color:var(--accent)}
.hero-sub{font-size:17px;color:var(--mid);line-height:1.65;max-width:430px;margin-bottom:32px}
.hero-actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;border:none;padding:14px 28px;border-radius:28px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{background:transparent;color:var(--text);border:1.5px solid var(--border);padding:13px 24px;border-radius:28px;font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;display:inline-block;transition:border-color .2s}
.btn-secondary:hover{border-color:var(--accent)}
.hero-proof{display:flex;align-items:center;gap:10px;margin-top:22px}
.avatars{display:flex}
.avatars span{width:28px;height:28px;border-radius:50%;border:2px solid var(--bg);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:12px}
.avatars span:not(:first-child){margin-left:-8px}
.proof-text{font-size:13px;color:var(--mute)}
.proof-text strong{color:var(--text)}
/* PHONE VISUAL */
.hero-visual{display:flex;justify-content:center;align-items:center;position:relative}
.phone-glow{position:absolute;inset:-40px;background:radial-gradient(ellipse,rgba(232,113,60,0.14) 0%,transparent 68%);border-radius:50%;z-index:0;pointer-events:none}
.phone{position:relative;z-index:1;width:260px;background:var(--surface);border-radius:40px;overflow:hidden;box-shadow:0 32px 80px rgba(28,24,21,0.18),0 0 0 8px #EDE6DC}
.phone svg{display:block;width:100%}
/* METRICS ROW */
.metrics{display:flex;justify-content:center;gap:0;max-width:900px;margin:0 auto;padding:0 40px 60px}
.metric-item{flex:1;text-align:center;padding:32px 16px;border-right:1px solid var(--border)}
.metric-item:last-child{border-right:none}
.metric-val{font-size:36px;font-weight:800;color:var(--accent);letter-spacing:-1px}
.metric-val.green{color:var(--accent2)}
.metric-val.purple{color:var(--purple)}
.metric-label{font-size:13px;color:var(--mute);margin-top:4px}
/* FEATURES */
.features{max-width:1100px;margin:0 auto;padding:60px 40px}
.section-label{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.section-title{font-size:38px;font-weight:800;letter-spacing:-.8px;line-height:1.12;margin-bottom:48px}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;transition:transform .2s,box-shadow .2s}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(28,24,21,0.09)}
.feat-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.ic-amber{background:var(--soft)} .ic-green{background:var(--green)} .ic-purple{background:var(--purple-soft)}
.ic-blue{background:#E8F0FB} .ic-rose{background:#FDE8EE}
.feat-card h3{font-size:17px;font-weight:700;margin-bottom:8px}
.feat-card p{font-size:14px;color:var(--mid);line-height:1.65}
/* QUOTE */
.quote-band{background:var(--surface2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:60px 40px;text-align:center}
.quote-band blockquote{font-size:26px;font-weight:700;max-width:680px;margin:0 auto 16px;line-height:1.4;letter-spacing:-.3px}
.quote-band cite{font-size:14px;color:var(--mute);font-style:normal}
/* SCREENS */
.screens-section{max-width:1100px;margin:0 auto;padding:60px 40px}
.screens-row{display:flex;gap:16px;margin-top:40px;flex-wrap:wrap}
.screen-card{flex:1;min-width:160px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px}
.sc-num{font-size:10px;font-weight:700;color:var(--accent);letter-spacing:.8px;margin-bottom:8px}
.sc-name{font-size:15px;font-weight:700;margin-bottom:6px}
.sc-desc{font-size:12px;color:var(--mute);line-height:1.5}
/* INSIGHT CARDS */
.insights-section{max-width:900px;margin:0 auto;padding:0 40px 60px}
.insight-list{display:flex;flex-direction:column;gap:12px;margin-top:32px}
.insight-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px 20px 20px 24px;border-left:3px solid;display:flex;gap:14px;align-items:flex-start}
.insight-card.amber{border-left-color:var(--accent)}.insight-card.green{border-left-color:var(--accent2)}.insight-card.purple{border-left-color:var(--purple)}
.ic-tag{font-size:9px;font-weight:700;letter-spacing:.12em;padding:3px 8px;border-radius:8px;white-space:nowrap;flex-shrink:0}
.ic-tag.amber{background:var(--soft);color:var(--accent)}.ic-tag.green{background:var(--green);color:var(--accent2)}.ic-tag.purple{background:var(--purple-soft);color:var(--purple)}
.ic-title{font-size:14px;font-weight:600;margin-bottom:4px}
.ic-body{font-size:13px;color:var(--mid);line-height:1.6}
/* CTA */
.cta-section{background:var(--text);color:#fff;padding:80px 40px;text-align:center}
.cta-section h2{font-size:40px;font-weight:800;letter-spacing:-1px;margin-bottom:14px}
.cta-section p{font-size:17px;color:rgba(255,255,255,0.55);margin-bottom:36px}
.cta-btn{background:var(--accent);color:#fff;border:none;padding:16px 36px;border-radius:32px;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block}
/* FOOTER */
footer{padding:32px 40px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg);font-size:12px;color:var(--mute)}
.foot-logo{font-weight:700;font-size:16px;color:var(--text);display:flex;align-items:center;gap:8px}
@media(max-width:768px){
  .hero{grid-template-columns:1fr;padding:48px 24px;text-align:center}
  h1{font-size:36px}
  .hero-sub,.hero-proof{margin-left:auto;margin-right:auto}
  .hero-actions{justify-content:center}
  .hero-visual{display:none}
  .feat-grid{grid-template-columns:1fr}
  .metrics{flex-wrap:wrap}
  .metric-item{min-width:50%;border-right:none;border-bottom:1px solid var(--border)}
  nav{padding:0 20px}
  .nav-links{display:none}
}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<nav class="nav">
  <div class="nav-logo"><div class="logo-dot">☀</div>Glow</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="#insights">AI Insights</a>
    <a href="#pricing">Pricing</a>
  </div>
  <a href="https://ram.zenbin.org/glow-mock" class="nav-cta">Try it free</a>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-tag">Morning OS for founders</div>
    <h1>Your energy,<br><span class="glow">operating system.</span></h1>
    <p class="hero-sub">Glow tracks your daily energy rhythms, focus sessions, and intentions — then surfaces AI insights that help you work with your biology, not against it.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/glow-viewer">View prototype →</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/glow-mock">Interactive mock ☀◑</a>
    </div>
    <div class="hero-proof">
      <div class="avatars"><span>🧑</span><span>👩</span><span>🧔</span><span>👧</span></div>
      <div class="proof-text"><strong>2,400+</strong> founders tracking energy daily</div>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-glow"></div>
    <div class="phone">
      <svg viewBox="0 0 390 720" xmlns="http://www.w3.org/2000/svg">
        <defs><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="8" flood-color="rgba(28,24,21,0.08)"/></filter></defs>
        <rect width="390" height="720" fill="#FBF7F3"/>
        <!-- Status bar -->
        <text x="20" y="30" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="#1C1815">9:41</text>
        <!-- Greeting -->
        <text x="24" y="70" font-family="Inter,sans-serif" font-size="13" fill="#5C5248">Good morning,</text>
        <text x="24" y="100" font-family="Inter,sans-serif" font-size="28" font-weight="800" fill="#1C1815">Thursday</text>
        <!-- Date pill -->
        <rect x="24" y="112" width="138" height="28" rx="14" fill="#F4EFE9"/>
        <text x="34" y="130" font-family="Inter,sans-serif" font-size="11" fill="#5C5248" font-weight="500">March 26, 2026</text>
        <!-- Energy card -->
        <rect x="16" y="152" width="358" height="190" rx="20" fill="#fff" filter="url(#sh)"/>
        <!-- Outer ring -->
        <circle cx="195" cy="244" r="62" fill="none" stroke="#EAE4DC" stroke-width="11"/>
        <!-- Progress ring (~78%) -->
        <circle cx="195" cy="244" r="62" fill="none" stroke="#E8713C" stroke-width="11"
                stroke-dasharray="234 390" stroke-dashoffset="0" stroke-linecap="round"
                transform="rotate(-90 195 244)"/>
        <!-- Score -->
        <text x="195" y="234" font-family="Inter,sans-serif" font-size="32" font-weight="800" fill="#1C1815" text-anchor="middle">78</text>
        <text x="195" y="258" font-family="Inter,sans-serif" font-size="11" fill="#9C9088" text-anchor="middle">energy</text>
        <!-- 3 stats -->
        <line x1="130" y1="308" x2="130" y2="332" stroke="#EAE4DC" stroke-width="1"/>
        <line x1="260" y1="308" x2="260" y2="332" stroke="#EAE4DC" stroke-width="1"/>
        <text x="60" y="316" font-family="Inter,sans-serif" font-size="10" fill="#9C9088" text-anchor="middle">Focus</text>
        <text x="195" y="316" font-family="Inter,sans-serif" font-size="10" fill="#9C9088" text-anchor="middle">Mood</text>
        <text x="330" y="316" font-family="Inter,sans-serif" font-size="10" fill="#9C9088" text-anchor="middle">Body</text>
        <text x="60" y="334" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#7AAD83" text-anchor="middle">92%</text>
        <text x="195" y="334" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#1C1815" text-anchor="middle">↑ Great</text>
        <text x="330" y="334" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#E8713C" text-anchor="middle">84%</text>
        <!-- Intentions heading -->
        <text x="24" y="368" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#5C5248">Morning Intentions</text>
        <!-- Intention 1 — done -->
        <rect x="16" y="376" width="358" height="56" rx="14" fill="#fff" filter="url(#sh)"/>
        <rect x="26" y="390" width="28" height="28" rx="8" fill="#FAE8DE"/>
        <text x="30" y="409" font-family="Inter,sans-serif" font-size="17">🧘</text>
        <text x="64" y="393" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="#1C1815">10 min meditation</text>
        <text x="64" y="411" font-family="Inter,sans-serif" font-size="10" fill="#7AAD83">7:30 AM · Done</text>
        <circle cx="350" cy="404" r="12" fill="#7AAD83"/>
        <text x="344" y="409" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#fff">✓</text>
        <!-- Intention 2 -->
        <rect x="16" y="440" width="358" height="56" rx="14" fill="#fff" filter="url(#sh)"/>
        <rect x="26" y="454" width="28" height="28" rx="8" fill="#FAE8DE"/>
        <text x="30" y="473" font-family="Inter,sans-serif" font-size="17">✍</text>
        <text x="64" y="457" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="#1C1815">Journal entry</text>
        <text x="64" y="475" font-family="Inter,sans-serif" font-size="10" fill="#9C9088">Write 3 gratitudes</text>
        <circle cx="350" cy="468" r="12" fill="none" stroke="#EAE4DC" stroke-width="1.5"/>
        <!-- Insight card -->
        <rect x="16" y="510" width="358" height="68" rx="16" fill="#FAE8DE"/>
        <text x="30" y="530" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#E8713C">✦ Glow insight</text>
        <text x="30" y="548" font-family="Inter,sans-serif" font-size="12" fill="#1C1815">Your energy peaks at 10am. Block 2 hrs</text>
        <text x="30" y="566" font-family="Inter,sans-serif" font-size="12" fill="#1C1815">for deep work before lunch.</text>
        <!-- Nav bar -->
        <rect x="0" y="648" width="390" height="72" fill="#fff"/>
        <line x1="0" y1="648" x2="390" y2="648" stroke="#EAE4DC" stroke-width="1"/>
        <text x="39" y="674" font-family="Inter,sans-serif" font-size="18" fill="#E8713C" text-anchor="middle">☀</text>
        <text x="39" y="690" font-family="Inter,sans-serif" font-size="9" font-weight="600" fill="#E8713C" text-anchor="middle">Today</text>
        <text x="117" y="674" font-family="Inter,sans-serif" font-size="17" fill="#9C9088" text-anchor="middle">⚡</text>
        <text x="117" y="690" font-family="Inter,sans-serif" font-size="9" fill="#9C9088" text-anchor="middle">Focus</text>
        <text x="195" y="672" font-family="Inter,sans-serif" font-size="17" fill="#9C9088" text-anchor="middle">~</text>
        <text x="195" y="690" font-family="Inter,sans-serif" font-size="9" fill="#9C9088" text-anchor="middle">Patterns</text>
        <text x="273" y="674" font-family="Inter,sans-serif" font-size="17" fill="#9C9088" text-anchor="middle">✦</text>
        <text x="273" y="690" font-family="Inter,sans-serif" font-size="9" fill="#9C9088" text-anchor="middle">Insights</text>
        <text x="351" y="674" font-family="Inter,sans-serif" font-size="17" fill="#9C9088" text-anchor="middle">◎</text>
        <text x="351" y="690" font-family="Inter,sans-serif" font-size="9" fill="#9C9088" text-anchor="middle">Goals</text>
      </svg>
    </div>
  </div>
</section>

<!-- Metrics row -->
<div class="metrics">
  <div class="metric-item"><div class="metric-val">+38%</div><div class="metric-label">avg focus time increase</div></div>
  <div class="metric-item"><div class="metric-val">14 days</div><div class="metric-label">to first AI insight</div></div>
  <div class="metric-item"><div class="metric-val green">2,400+</div><div class="metric-label">founders using Glow</div></div>
  <div class="metric-item"><div class="metric-val purple">4.9 ★</div><div class="metric-label">app store rating</div></div>
</div>

<!-- Features -->
<section class="features" id="features">
  <div class="section-label">What Glow does</div>
  <h2 class="section-title">Built around your<br>biological rhythms</h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon ic-amber">☀</div><h3>Morning Energy Score</h3><p>Start each day with a real-time energy score based on sleep, habits, and yesterday's data. Know before you open your calendar.</p></div>
    <div class="feat-card"><div class="feat-icon ic-green">⚡</div><h3>Focus Session Blocks</h3><p>Color-coded deep work, shallow work, and recovery blocks. Track where your attention goes and how it maps to energy.</p></div>
    <div class="feat-card"><div class="feat-icon ic-purple">✦</div><h3>AI Pattern Insights</h3><p>After 14 days, Glow surfaces actionable observations — "You peak at 10am. Protect that window."</p></div>
    <div class="feat-card"><div class="feat-icon ic-blue">~</div><h3>Weekly Patterns View</h3><p>Editorial, data-rich view of your week. Energy score bars + focus-minutes bars — one clean scan tells the story.</p></div>
    <div class="feat-card"><div class="feat-icon ic-amber">🌿</div><h3>Intentions & Goals</h3><p>Set daily intentions in under 60 seconds. Track streaks that connect to how you actually feel, not just what you checked off.</p></div>
    <div class="feat-card"><div class="feat-icon ic-rose">📓</div><h3>Daily Reflection</h3><p>Lightweight prompts that capture what mattered. Glow connects journal patterns to energy data over time.</p></div>
  </div>
</section>

<!-- Quote band -->
<section class="quote-band">
  <blockquote>"I stopped guessing when to do deep work. Glow just tells me."</blockquote>
  <cite>— Mira K., founder & product designer</cite>
</section>

<!-- Screens -->
<section class="screens-section" id="how">
  <div class="section-label">5 screens</div>
  <h2 class="section-title">Every view, zero clutter</h2>
  <div class="screens-row">
    <div class="screen-card"><div class="sc-num">01</div><div class="sc-name">Today</div><div class="sc-desc">Energy ring, morning intentions, daily tip</div></div>
    <div class="screen-card"><div class="sc-num">02</div><div class="sc-name">Focus</div><div class="sc-desc">Active timer, session log, daily progress bar</div></div>
    <div class="screen-card"><div class="sc-num">03</div><div class="sc-name">Patterns</div><div class="sc-desc">Energy & focus charts for the past 7 days</div></div>
    <div class="screen-card"><div class="sc-num">04</div><div class="sc-name">Insights</div><div class="sc-desc">AI-generated pattern cards with citations</div></div>
    <div class="screen-card"><div class="sc-num">05</div><div class="sc-name">Goals</div><div class="sc-desc">Streak tracker, progress bars, add goal CTA</div></div>
  </div>
</section>

<!-- AI Insights -->
<section class="insights-section" id="insights">
  <div class="section-label">Glow AI in action</div>
  <h2 class="section-title" style="text-align:center;font-size:32px">What your data tells you</h2>
  <div class="insight-list">
    <div class="insight-card amber"><span class="ic-tag amber">TIMING</span><div><div class="ic-title">Peak window found</div><div class="ic-body">You consistently hit 90%+ energy between 9–11am. Schedule your hardest tasks then — every time you do, your focus time is 42% longer.</div></div></div>
    <div class="insight-card purple"><span class="ic-tag purple">SLEEP</span><div><div class="ic-title">Sleep correlation detected</div><div class="ic-body">On days you sleep 7.5h+, focus time increases by 38%. Last 3 nights averaged 6.2h — that's costing you roughly 90 mins of deep work daily.</div></div></div>
    <div class="insight-card green"><span class="ic-tag green">RECOVERY</span><div><div class="ic-title">Afternoon slump pattern</div><div class="ic-body">Energy dips from 2–3:30pm daily. A 10-min walk during this window boosted energy by 22% the two times you tried it this week.</div></div></div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>Start your first morning session</h2>
  <p>Free for 14 days. No credit card. Just clarity.</p>
  <a class="cta-btn" href="https://ram.zenbin.org/glow-mock">Try the interactive mock →</a>
</section>

<footer>
  <div class="foot-logo"><div class="logo-dot" style="width:22px;height:22px;font-size:11px">☀</div>Glow</div>
  <p>Designed by RAM · ${new Date().toDateString()}</p>
  <p>Inspired by Dawn (lapa.ninja) + Equals (land-book.com) + Litbix (minimal.gallery)</p>
</footer>

</body>
</html>`;

// ─── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  const base = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Glow — Prototype Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#FBF7F3;font-family:Inter,system-ui,sans-serif;color:#1C1815}
.nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;background:rgba(251,247,243,0.96);backdrop-filter:blur(12px);border-bottom:1px solid #EAE4DC;position:sticky;top:0;z-index:100}
.logo{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}
.ld{width:22px;height:22px;border-radius:50%;background:#E8713C;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px}
.tagline{font-size:12px;color:#9C9088}
.back{font-size:12px;color:#5C5248;text-decoration:none;padding:7px 16px;border:1px solid #EAE4DC;border-radius:20px;font-weight:500}
.back:hover{border-color:#E8713C;color:#E8713C}
.viewer-frame{height:calc(100vh - 56px);width:100%;border:none;display:block}
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
<div class="nav">
  <div class="logo"><div class="ld">☀</div>Glow</div>
  <div class="tagline">morning energy OS · prototype viewer</div>
  <a href="https://ram.zenbin.org/glow" class="back">← Back to landing</a>
</div>
<iframe class="viewer-frame" src="https://pencil.dev/embed/viewer" id="vf"></iframe>
<script>
const vf = document.getElementById('vf');
vf.addEventListener('load', () => {
  vf.contentWindow.postMessage({ type: 'LOAD_PEN', pen: window.EMBEDDED_PEN }, '*');
});
</script>
</body>
</html>`;
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return base.replace('<script>', injection + '\n<script>');
}

(async () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const penJson = fs.readFileSync(path.join(__dirname, 'glow.pen'), 'utf8');

  // 1. Hero page
  console.log('\n── Hero page');
  await publish(SLUG, heroHtml, APP_NAME + ' — ' + TAGLINE);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Viewer
  console.log('── Viewer');
  await publish(SLUG + '-viewer', buildViewer(penJson), APP_NAME + ' — Prototype Viewer');
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n✓ glow hero + viewer published');
})();
