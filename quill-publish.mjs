/**
 * QUILL — Full publish: hero + viewer + gallery queue + design DB
 * Inspired by: Siteinspire editorial typographic trend (PW Magazine, QP Magazine)
 * Theme: LIGHT — warm paper (#FAF7F0), copper accent (#B5742A)
 */
import { readFileSync, writeFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLUG = 'quill';
const APP_NAME = 'QUILL';
const TAGLINE = 'Write every day. Keep what matters.';
const ARCHETYPE = 'journaling-app';

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:      '#FAF7F0',
  surface: '#FFFFFF',
  surface2:'#F5F0E8',
  text:    '#1C1714',
  muted:   'rgba(28,23,20,0.45)',
  accent:  '#B5742A',
  accent2: '#7C5C3B',
  border:  'rgba(28,23,20,0.10)',
};

// ── Publish helper ─────────────────────────────────────────────────────────
function publishPage(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://${subdomain}.zenbin.org/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
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

// ── Hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap');
:root {
  --bg: ${C.bg};
  --surface: ${C.surface};
  --surface2: ${C.surface2};
  --text: ${C.text};
  --muted: rgba(28,23,20,0.5);
  --accent: ${C.accent};
  --accent2: ${C.accent2};
  --border: rgba(28,23,20,0.10);
}
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg); color: var(--text);
  min-height: 100vh; line-height: 1.6;
}
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: rgba(250,247,240,0.92); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-logo {
  font-family: 'Lora', Georgia, serif;
  font-size: 22px; font-weight: 700; font-style: italic;
  color: var(--text); text-decoration: none; letter-spacing: 0.05em;
}
.nav-links { display: flex; gap: 32px; }
.nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  border: 1px solid var(--text); color: var(--text);
  padding: 8px 20px; border-radius: 4px;
  font-size: 13px; font-weight: 600; text-decoration: none;
  transition: background .2s, color .2s;
}
.nav-cta:hover { background: var(--text); color: var(--bg); }

/* ── Hero ── */
.hero-wrap {
  max-width: 1200px; margin: 0 auto; padding: 120px 48px 80px;
  display: grid; grid-template-columns: 1fr 320px; gap: 100px; align-items: center;
}
.hero-rule-top { width: 100%; height: 2px; background: var(--text); margin-bottom: 3px; }
.hero-rule-thin { width: 100%; height: 1px; background: var(--text); margin-bottom: 32px; }
.hero-issue {
  font-size: 10px; font-weight: 700; letter-spacing: 0.15em;
  color: var(--muted); text-transform: uppercase; margin-bottom: 20px;
}
h1 {
  font-family: 'Lora', Georgia, serif;
  font-size: clamp(44px, 6vw, 72px);
  font-weight: 700; font-style: italic;
  line-height: 1.1; letter-spacing: -0.02em;
  color: var(--text); margin-bottom: 24px;
}
h1 span { color: var(--accent); }
.hero-sub {
  font-size: 17px; color: var(--muted);
  max-width: 420px; margin-bottom: 40px; line-height: 1.7;
}
.actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.btn {
  background: var(--text); color: var(--bg);
  padding: 14px 28px; border-radius: 4px;
  font-size: 14px; font-weight: 600; text-decoration: none;
  letter-spacing: 0.02em;
  transition: opacity .2s;
}
.btn:hover { opacity: 0.85; }
.btn-ghost { color: var(--muted); font-size: 14px; font-weight: 500; text-decoration: none; border-bottom: 1px solid transparent; }
.btn-ghost:hover { color: var(--text); border-bottom-color: var(--text); }

/* ── Phone mockup ── */
.phone {
  background: var(--surface); border-radius: 40px;
  border: 6px solid rgba(28,23,20,0.12);
  box-shadow: 0 40px 120px rgba(28,23,20,0.14), 0 0 0 1px rgba(28,23,20,0.04);
  overflow: hidden; width: 240px; margin: 0 auto;
}
.ph-top {
  background: var(--bg); padding: 20px 14px 12px;
  border-bottom: 2px solid var(--text);
}
.ph-masthead {
  font-family: 'Lora', serif; font-size: 18px; font-weight: 700; font-style: italic;
  color: var(--text); margin-bottom: 2px;
}
.ph-date { font-size: 9px; color: var(--muted); letter-spacing: 0.06em; }
.ph-rule { height: 1px; background: var(--text); margin: 0 14px 8px; }
.ph-prompt { background: var(--surface2); margin: 8px; border-radius: 6px; padding: 10px; }
.ph-prompt-l { font-size: 7px; font-weight: 700; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.ph-prompt-q { font-family: 'Lora', serif; font-size: 12px; font-style: italic; color: var(--text); line-height: 1.5; }
.ph-btn { background: var(--text); margin: 0 8px 8px; border-radius: 4px; padding: 10px; text-align: center; }
.ph-btn-t { font-size: 10px; font-weight: 600; color: var(--bg); letter-spacing: 0.04em; }
.ph-week { margin: 0 8px; display: flex; gap: 4px; }
.ph-day {
  flex: 1; aspect-ratio: 1; border-radius: 3px; display: flex;
  align-items: center; justify-content: center;
  font-size: 8px; font-weight: 600;
}
.ph-day.done { background: var(--surface2); color: var(--text); }
.ph-day.today { background: var(--accent); color: #fff; }
.ph-day.empty { background: #EEE9DF; color: var(--muted); }
.ph-nav { background: var(--bg); border-top: 1px solid var(--border); display: flex; padding: 6px 0 10px; margin-top: 10px; }
.ph-nav-item { flex: 1; text-align: center; }
.ph-nav-icon { font-size: 14px; display: block; }
.ph-nav-label { font-size: 6px; font-weight: 600; color: var(--muted); }
.ph-nav-item.active .ph-nav-label { color: var(--accent); }

/* ── Feature strips ── */
.features {
  background: var(--surface); border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 80px 48px;
}
.feat-head { max-width: 1200px; margin: 0 auto 48px; display: flex; align-items: baseline; gap: 24px; }
.feat-rule { flex: 1; height: 1px; background: var(--border); }
.feat-title {
  font-family: 'Lora', serif; font-size: 11px; font-weight: 700; font-style: italic;
  letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase;
}
.feat-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
.feat { padding-top: 24px; border-top: 2px solid var(--text); }
.feat-num { font-family: 'Lora', serif; font-size: 40px; font-weight: 700; font-style: italic; color: var(--accent); line-height: 1; margin-bottom: 12px; }
.feat-name { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.feat-desc { font-size: 14px; color: var(--muted); line-height: 1.65; }

/* ── Mockup strip ── */
.screens-section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
.screens-head { margin-bottom: 40px; }
.screens-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; }
.screens-title { font-family: 'Lora', serif; font-size: 32px; font-weight: 700; font-style: italic; color: var(--text); }
.screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
.screen-card { background: var(--surface2); border-radius: 16px; overflow: hidden; aspect-ratio: 9/16; display: flex; flex-direction: column; border: 1px solid var(--border); }
.sc-header { background: var(--bg); border-bottom: 2px solid var(--text); padding: 12px; }
.sc-title { font-family: 'Lora', serif; font-size: 13px; font-weight: 700; font-style: italic; color: var(--text); }
.sc-body { flex: 1; padding: 10px; }
.sc-line { height: 7px; background: var(--border); border-radius: 3px; margin-bottom: 7px; }
.sc-line.accent { background: ${C.accent}55; width: 65%; }
.sc-line.short { width: 45%; }
.sc-line.med { width: 75%; }
.sc-block { height: 36px; background: var(--text); border-radius: 4px; margin: 10px 0; }
.sc-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
.sc-mini-card { background: var(--surface); border-radius: 6px; padding: 6px; border: 1px solid var(--border); height: 50px; }
.sc-mini-date { font-family: 'Lora', serif; font-size: 14px; font-weight: 700; font-style: italic; color: var(--accent); }
.sc-bar { height: 5px; background: var(--border); border-radius: 3px; margin: 4px 0; overflow: hidden; }
.sc-bar-fill { height: 100%; background: var(--accent); border-radius: 3px; }
.sc-pullquote { border-left: 3px solid var(--accent); padding-left: 8px; margin: 10px 0; }
.sc-pullquote-text { font-family: 'Lora', serif; font-size: 9px; font-style: italic; color: var(--accent2); line-height: 1.5; }

/* ── CTA ── */
.cta-section {
  text-align: center; padding: 100px 48px;
  border-top: 1px solid var(--border);
}
.cta-section h2 { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; font-style: italic; color: var(--text); margin-bottom: 16px; }
.cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 36px; }
.cta-row { display: flex; gap: 16px; justify-content: center; align-items: center; }

/* ── Footer ── */
footer {
  border-top: 2px solid var(--text); padding: 32px 48px;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-logo { font-family: 'Lora', serif; font-size: 16px; font-weight: 700; font-style: italic; color: var(--text); }
.footer-right { font-size: 12px; color: var(--muted); }
.footer-right a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">QUILL</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#mock">Interactive</a>
  </div>
  <a class="nav-cta" href="#mock">View Mock →</a>
</nav>

<main>
  <section class="hero-wrap">
    <div class="hero-left">
      <div class="hero-rule-top"></div>
      <div class="hero-rule-thin"></div>
      <div class="hero-issue">Design Studio — Issue 016 · Apr 2026</div>
      <h1>Write every day.<br><span>Keep what</span><br>matters.</h1>
      <p class="hero-sub">QUILL is a personal journaling companion with an editorial magazine aesthetic — because your thoughts deserve the same craft as the writing that inspires them.</p>
      <div class="actions">
        <a class="btn" href="/quill-viewer">View Prototype →</a>
        <a class="btn-ghost" href="/quill-mock">Interactive Mock ☀◑</a>
      </div>
    </div>
    <div>
      <div class="phone">
        <div class="ph-top">
          <div class="ph-masthead">QUILL</div>
          <div class="ph-date">Friday, April 4</div>
        </div>
        <div class="ph-rule"></div>
        <div class="ph-prompt">
          <div class="ph-prompt-l">Today's Prompt</div>
          <div class="ph-prompt-q">"What did you notice today that you almost missed?"</div>
        </div>
        <div class="ph-btn"><div class="ph-btn-t">Start Writing  →</div></div>
        <div class="ph-week">
          <div class="ph-day done">M</div>
          <div class="ph-day done">T</div>
          <div class="ph-day done">W</div>
          <div class="ph-day done">T</div>
          <div class="ph-day today">F</div>
          <div class="ph-day empty">S</div>
          <div class="ph-day empty">S</div>
        </div>
        <div class="ph-nav">
          <div class="ph-nav-item active">
            <span class="ph-nav-icon" style="color:${C.accent}">▦</span>
            <div class="ph-nav-label" style="color:${C.accent}">Today</div>
          </div>
          <div class="ph-nav-item"><span class="ph-nav-icon">✎</span><div class="ph-nav-label">Write</div></div>
          <div class="ph-nav-item"><span class="ph-nav-icon">⊞</span><div class="ph-nav-label">Library</div></div>
          <div class="ph-nav-item"><span class="ph-nav-icon">∿</span><div class="ph-nav-label">Insights</div></div>
          <div class="ph-nav-item"><span class="ph-nav-icon">◎</span><div class="ph-nav-label">Profile</div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="features" id="features">
    <div class="feat-head">
      <div class="feat-title">Why QUILL</div>
      <div class="feat-rule"></div>
    </div>
    <div class="feat-grid">
      <div class="feat">
        <div class="feat-num">01</div>
        <div class="feat-name">Editorial Aesthetic</div>
        <div class="feat-desc">Warm paper tones, serif typography, and magazine grid layouts borrowed from the editorial tradition. Your journal looks like something worth reading.</div>
      </div>
      <div class="feat">
        <div class="feat-num">02</div>
        <div class="feat-name">Daily Prompts</div>
        <div class="feat-desc">Curated writing prompts across five categories — observation, reflection, story, memory, and dream — to spark the first sentence.</div>
      </div>
      <div class="feat">
        <div class="feat-num">03</div>
        <div class="feat-name">Writing Insights</div>
        <div class="feat-desc">Track streaks, word counts, themes, and writing days on an editorial heatmap that makes your habits visible and worth protecting.</div>
      </div>
    </div>
  </section>

  <section class="screens-section" id="screens">
    <div class="screens-head">
      <div class="screens-label">Prototype Screens</div>
      <div class="screens-title">Five flows, one voice.</div>
    </div>
    <div class="screens-grid">
      <div class="screen-card">
        <div class="sc-header"><div class="sc-title">Today</div></div>
        <div class="sc-body">
          <div class="sc-line accent"></div>
          <div class="sc-line short"></div>
          <div class="sc-block"></div>
          <div class="sc-line med"></div>
          <div class="sc-line short"></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="sc-header"><div class="sc-title">Write</div></div>
        <div class="sc-body">
          <div class="sc-line" style="height:18px;width:80%;background:${C.text}20;border-radius:3px"></div>
          <div style="margin-top:8px">
            <div class="sc-line med"></div>
            <div class="sc-line"></div>
            <div class="sc-line short"></div>
            <div class="sc-line med"></div>
            <div class="sc-line short"></div>
          </div>
          <div style="width:2px;height:14px;background:${C.accent};margin-top:4px"></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="sc-header"><div class="sc-title">Library</div></div>
        <div class="sc-body">
          <div class="sc-mini-grid">
            <div class="sc-mini-card"><div class="sc-mini-date" style="color:${C.accent}">04</div><div class="sc-line short" style="margin-top:4px"></div></div>
            <div class="sc-mini-card"><div class="sc-mini-date">03</div><div class="sc-line short" style="margin-top:4px"></div></div>
            <div class="sc-mini-card"><div class="sc-mini-date" style="color:${C.accent2}">02</div><div class="sc-line short" style="margin-top:4px"></div></div>
            <div class="sc-mini-card"><div class="sc-mini-date">01</div><div class="sc-line short" style="margin-top:4px"></div></div>
          </div>
        </div>
      </div>
      <div class="screen-card">
        <div class="sc-header"><div class="sc-title">Insights</div></div>
        <div class="sc-body">
          <div style="display:flex;gap:4px;margin-bottom:8px">
            <div style="flex:1;font-family:Georgia,serif;font-size:16px;font-style:italic;color:${C.accent};font-weight:700">18</div>
            <div style="flex:1;font-family:Georgia,serif;font-size:16px;font-style:italic;color:${C.text};font-weight:700">7.2K</div>
          </div>
          <div class="sc-bar"><div class="sc-bar-fill" style="width:82%"></div></div>
          <div class="sc-bar"><div class="sc-bar-fill" style="width:61%"></div></div>
          <div class="sc-bar"><div class="sc-bar-fill" style="width:44%"></div></div>
          <div class="sc-bar"><div class="sc-bar-fill" style="width:28%"></div></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="sc-header"><div class="sc-title">Entry</div></div>
        <div class="sc-body">
          <div class="sc-line" style="height:18px;width:85%;background:${C.text}20;border-radius:3px;margin-bottom:8px"></div>
          <div class="sc-line"></div>
          <div class="sc-line med"></div>
          <div class="sc-pullquote">
            <div class="sc-pullquote-text">"A ritual that has lost its audience."</div>
          </div>
          <div class="sc-line short"></div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section" id="mock">
    <h2>Experience the prototype.</h2>
    <p>Tap through all five screens in the interactive mock — with light/dark toggle.</p>
    <div class="cta-row">
      <a class="btn" href="/quill-mock">Open Interactive Mock ☀◑</a>
      <a class="btn-ghost" href="/quill-viewer">View Prototype →</a>
    </div>
  </section>
</main>

<footer>
  <div class="footer-logo">QUILL</div>
  <div class="footer-right">
    Design by <a href="https://ram.zenbin.org">RAM</a> ·
    Inspired by editorial typography trends on <a href="https://www.siteinspire.com" target="_blank">Siteinspire</a> ·
    RAM Design Heartbeat · Apr 2026
  </div>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────
const penJson = readFileSync(path.join(__dirname, 'quill.pen'), 'utf8');
const viewerEmbedded = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QUILL — Viewer</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #EEE9DF; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Georgia, serif; }
.frame { background: #FAF7F0; border-radius: 40px; border: 6px solid rgba(28,23,20,0.12); box-shadow: 0 40px 120px rgba(28,23,20,0.15); width: 375px; min-height: 812px; overflow: hidden; position: relative; }
.screen { display: none; padding: 0; }
.screen.active { display: block; }
.nav-bar { position: absolute; bottom: 0; left: 0; right: 0; background: #FAF7F0; border-top: 1px solid rgba(28,23,20,0.10); display: flex; padding: 12px 0 20px; z-index: 10; }
.nav-item { flex: 1; text-align: center; cursor: pointer; }
.nav-icon { font-size: 18px; display: block; }
.nav-label { font-size: 9px; color: rgba(28,23,20,0.45); }
.nav-item.active .nav-label { color: #B5742A; }
.nav-item.active .nav-icon { color: #B5742A; }
/* screen content styles injected per screen */
</style>
</head>
<body>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
<div class="frame" id="app">
  <p style="padding:40px;font-style:italic;color:#7C5C3B">
    QUILL prototype — ${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}
  </p>
</div>
<script src="https://ram.zenbin.org/pencil-viewer.js" onerror="document.getElementById('app').innerHTML='<p style=padding:40px>Viewer loading…</p>'"></script>
</body>
</html>`;

// ── Main ────────────────────────────────────────────────────────────────────
console.log('Publishing QUILL…');

// Hero
const heroRes = await publishPage(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('✓ Hero:', heroRes.url);

// Viewer
const viewerRes = await publishPage(`${SLUG}-viewer`, viewerEmbedded, `${APP_NAME} — Viewer`);
console.log('✓ Viewer:', viewerRes.url);

// ── Gallery queue ───────────────────────────────────────────────────────────
const config = JSON.parse(readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
  viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Editorial typography-first journaling app; light theme; magazine grid; serif/sans pairing; copper accent',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  palette: { bg: '#FAF7F0', accent: '#B5742A', text: '#1C1714' },
  inspiration: 'Siteinspire editorial typographic trend — PW Magazine, QP Magazine grid layouts',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
}, putBody);
console.log('✓ Gallery queue:', putRes.status === 200 ? 'OK' : `status ${putRes.status}`);

// ── Design DB ───────────────────────────────────────────────────────────────
try {
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch (e) {
  console.log('⚠ Design DB skipped:', e.message);
}

console.log('\n✓ All done!');
console.log('  Hero:   https://ram.zenbin.org/quill');
console.log('  Viewer: https://ram.zenbin.org/quill-viewer');
console.log('  Mock:   https://ram.zenbin.org/quill-mock');
