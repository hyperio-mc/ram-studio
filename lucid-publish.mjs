/**
 * lucid-publish.mjs
 * LUCID — Personal Finance OS
 * Full publish pipeline: hero page + viewer + mock + gallery queue + DB index
 */
import { readFileSync, writeFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG     = 'lucid';
const APP_NAME = 'LUCID';
const TAGLINE  = 'Your money, understood';
const ARCHETYPE = 'finance-ai-dark';
const PROMPT   = 'Inspired by midday.ai (darkmodedesign.com) — dark AI business stack for founders. Designed a personal finance OS with deep violet + near-black palette, AI insight cards with pulse-border, glow-behind-hero balance, and category-tinted transaction rows.';

// ── ZenBin publisher ─────────────────────────────────────────────────────────
function publishPage(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body    = Buffer.from(payload);
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

// ── HERO PAGE ────────────────────────────────────────────────────────────────
const C = {
  bg: '#06060F', surf: '#0D0D1E', violet: '#8B5CF6',
  cyan: '#22D3EE', rose: '#F43F5E', text: '#F0EEFF',
  muted: 'rgba(240,238,255,0.5)',
};

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LUCID — Your money, understood</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #06060F;
    --surf: #0D0D1E;
    --surf2: #131328;
    --violet: #8B5CF6;
    --violet-dim: rgba(139,92,246,0.14);
    --cyan: #22D3EE;
    --cyan-dim: rgba(34,211,238,0.13);
    --rose: #F43F5E;
    --rose-dim: rgba(244,63,94,0.13);
    --amber: #F59E0B;
    --amber-dim: rgba(245,158,11,0.13);
    --text: #F0EEFF;
    --muted: rgba(240,238,255,0.55);
    --sub: rgba(240,238,255,0.28);
    --border: rgba(240,238,255,0.07);
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; line-height: 1.6; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(6,6,15,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 18px; font-weight: 800; color: var(--violet); letter-spacing: 3px; text-decoration: none; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--violet); color: #fff; padding: 10px 22px;
    border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;
    box-shadow: 0 0 20px rgba(139,92,246,0.4);
  }

  /* HERO */
  .hero {
    max-width: 1140px; margin: 0 auto; padding: 128px 48px 80px;
    display: grid; grid-template-columns: 1fr 360px; gap: 80px; align-items: center;
  }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--violet-dim); border: 1px solid rgba(139,92,246,0.25);
    color: var(--violet); border-radius: 100px;
    font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    padding: 6px 16px; margin-bottom: 28px;
  }
  .eyebrow::before { content: '✦'; font-size: 10px; }
  h1 {
    font-size: clamp(40px, 5.5vw, 68px); font-weight: 900;
    line-height: 1.03; letter-spacing: -2.5px; margin-bottom: 24px;
  }
  h1 em { font-style: normal; color: var(--violet); }
  h1 span { color: var(--cyan); }
  .sub { font-size: 18px; color: var(--muted); max-width: 460px; margin-bottom: 40px; line-height: 1.7; }
  .actions { display: flex; gap: 16px; align-items: center; }
  .btn {
    background: var(--violet); color: #fff; padding: 16px 32px;
    border-radius: 14px; font-size: 15px; font-weight: 700; text-decoration: none;
    box-shadow: 0 4px 32px rgba(139,92,246,0.45);
    transition: transform .15s, box-shadow .15s;
  }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 48px rgba(139,92,246,0.6); }
  .btn-ghost { color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; transition: color .2s; }
  .btn-ghost:hover { color: var(--text); }

  /* PHONE MOCKUP */
  .phone-wrap { display: flex; justify-content: center; }
  .phone {
    width: 280px; background: var(--surf);
    border-radius: 44px; border: 2px solid rgba(139,92,246,0.2);
    box-shadow: 0 0 80px rgba(139,92,246,0.12), 0 32px 80px rgba(0,0,0,0.5);
    overflow: hidden; padding: 0;
  }
  .phone-bar { background: var(--surf); padding: 16px 20px 6px; display: flex; justify-content: space-between; align-items: center; }
  .ph-time { font-size: 12px; font-weight: 700; }
  .ph-icons { font-size: 10px; color: var(--muted); }
  .phone-header { padding: 6px 20px 12px; display: flex; justify-content: space-between; align-items: center; }
  .ph-logo { font-size: 11px; font-weight: 800; color: var(--violet); letter-spacing: 3px; }
  .ph-avatar { width: 28px; height: 28px; background: var(--surf2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--violet); }
  /* Glow behind balance */
  .ph-glow-wrap { position: relative; padding: 0 0 4px; text-align: center; }
  .ph-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 70%); pointer-events: none; }
  .ph-label { font-size: 8px; font-weight: 600; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px; }
  .ph-balance { font-size: 36px; font-weight: 900; letter-spacing: -1px; }
  .ph-change { font-size: 9px; color: var(--cyan); margin-top: 2px; }
  /* Budget bar */
  .ph-budget { margin: 8px 16px; background: var(--surf2); border-radius: 10px; padding: 10px 12px; }
  .ph-budget-top { display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 6px; }
  .ph-budget-top span:first-child { font-weight: 600; }
  .ph-budget-top span:last-child { color: var(--muted); }
  .ph-bar-track { background: rgba(240,238,255,0.08); border-radius: 3px; height: 5px; overflow: hidden; }
  .ph-bar-fill { background: var(--violet); height: 100%; border-radius: 3px; width: 71%; box-shadow: 0 0 8px rgba(139,92,246,0.6); }
  /* Stats row */
  .ph-stats { display: flex; gap: 6px; margin: 8px 16px; }
  .ph-stat { flex: 1; background: var(--surf2); border-radius: 8px; padding: 7px; border-top: 2px solid; }
  .ph-stat.inc { border-color: var(--cyan); }
  .ph-stat.spt { border-color: var(--rose); }
  .ph-stat.svd { border-color: var(--violet); }
  .ph-stat-l { font-size: 7px; color: var(--muted); margin-bottom: 2px; }
  .ph-stat-v { font-size: 14px; font-weight: 800; }
  .ph-stat.inc .ph-stat-v { color: var(--cyan); }
  .ph-stat.spt .ph-stat-v { color: var(--rose); }
  .ph-stat.svd .ph-stat-v { color: var(--violet); }
  /* Transactions */
  .ph-sec-title { font-size: 9px; font-weight: 700; color: var(--text); margin: 10px 16px 6px; }
  .ph-tx { display: flex; align-items: center; gap: 8px; margin: 0 16px 4px; background: var(--surf2); border-radius: 8px; padding: 8px 10px; }
  .ph-tx-icon { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
  .ph-tx-info { flex: 1; }
  .ph-tx-name { font-size: 8px; font-weight: 600; }
  .ph-tx-cat  { font-size: 7px; color: var(--muted); }
  .ph-tx-amt  { font-size: 9px; font-weight: 800; }
  .ph-tx.neg .ph-tx-amt { color: var(--rose); }
  .ph-tx.pos .ph-tx-amt { color: var(--cyan); }
  /* AI nudge */
  .ph-nudge { margin: 8px 16px 12px; background: var(--violet-dim); border-left: 2px solid var(--violet); border-radius: 0 8px 8px 0; padding: 7px 10px; }
  .ph-nudge-t { font-size: 8px; font-weight: 600; margin-bottom: 2px; }
  .ph-nudge-s { font-size: 7px; color: var(--muted); }
  /* Nav */
  .ph-nav { display: flex; background: var(--surf); border-top: 1px solid var(--border); padding: 6px 0 10px; }
  .ph-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .ph-nav-icon { font-size: 14px; }
  .ph-nav-lbl { font-size: 7px; color: var(--muted); }
  .ph-nav-item.active .ph-nav-icon { color: var(--violet); }
  .ph-nav-item.active .ph-nav-lbl { color: var(--violet); font-weight: 700; }

  /* FEATURES */
  .features { max-width: 1140px; margin: 0 auto; padding: 80px 48px; }
  .features-eyebrow { font-size: 11px; font-weight: 700; color: var(--violet); letter-spacing: .1em; text-transform: uppercase; text-align: center; margin-bottom: 16px; }
  .features-title { font-size: 40px; font-weight: 900; letter-spacing: -1.5px; text-align: center; margin-bottom: 12px; }
  .features-sub { color: var(--muted); text-align: center; margin-bottom: 56px; font-size: 17px; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .feature-card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
    transition: border-color .2s, box-shadow .2s;
  }
  .feature-card:hover { border-color: rgba(139,92,246,0.3); box-shadow: 0 0 40px rgba(139,92,246,0.08); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.7; }

  /* STATS SECTION */
  .stats { max-width: 1140px; margin: 0 auto; padding: 40px 48px 80px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: var(--border); border-radius: 20px; overflow: hidden; }
  .stat-cell { background: var(--surf); padding: 40px 32px; }
  .stat-num { font-size: 44px; font-weight: 900; letter-spacing: -2px; color: var(--violet); margin-bottom: 8px; }
  .stat-lbl { font-size: 14px; color: var(--muted); }

  /* CTA */
  .cta-section { max-width: 800px; margin: 0 auto; padding: 40px 48px 120px; text-align: center; }
  .cta-card { background: var(--surf); border: 1px solid rgba(139,92,246,0.2); border-radius: 28px; padding: 64px 48px; position: relative; overflow: hidden; }
  .cta-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center top, rgba(139,92,246,0.1) 0%, transparent 60%); pointer-events: none; }
  .cta-card h2 { font-size: 40px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 16px; }
  .cta-card p { color: var(--muted); font-size: 17px; margin-bottom: 36px; }
  .cta-actions { display: flex; justify-content: center; gap: 16px; }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 40px 48px; display: flex; justify-content: space-between; align-items: center; max-width: 1140px; margin: 0 auto; }
  .footer-brand { font-size: 14px; font-weight: 800; color: var(--violet); letter-spacing: 2px; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; }
  .footer-credit { font-size: 12px; color: var(--sub); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
    .phone-wrap { display: none; }
    .feature-grid { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">LUCID</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">Insights</a>
    <a href="#goals">Goals</a>
  </div>
  <a href="https://ram.zenbin.org/lucid-mock" class="nav-cta">Try the mock →</a>
</nav>

<section class="hero">
  <div>
    <div class="eyebrow">AI-Powered Personal Finance</div>
    <h1>Your money,<br><em>understood.</em></h1>
    <p class="sub">The personal finance OS that thinks ahead. Automatic insights, smart goals, and an AI coach that speaks plain English — not spreadsheet.</p>
    <div class="actions">
      <a href="https://ram.zenbin.org/lucid-viewer" class="btn">View Design ↗</a>
      <a href="https://ram.zenbin.org/lucid-mock" class="btn-ghost">Interactive mock →</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-bar">
        <span class="ph-time">9:41</span>
        <span class="ph-icons">●●● WiFi 🔋</span>
      </div>
      <div class="phone-header">
        <span class="ph-logo">LUCID</span>
        <div class="ph-avatar">RK</div>
      </div>
      <div class="ph-glow-wrap">
        <div class="ph-glow"></div>
        <div class="ph-label">NET WORTH</div>
        <div class="ph-balance">$42,814</div>
        <div class="ph-change">▲ +$318 this month</div>
      </div>
      <div class="ph-budget">
        <div class="ph-budget-top"><span>Monthly Budget</span><span>$3,200 / $4,500</span></div>
        <div class="ph-bar-track"><div class="ph-bar-fill"></div></div>
      </div>
      <div class="ph-stats">
        <div class="ph-stat inc"><div class="ph-stat-l">Income</div><div class="ph-stat-v">$5.4k</div></div>
        <div class="ph-stat spt"><div class="ph-stat-l">Spent</div><div class="ph-stat-v">$3.2k</div></div>
        <div class="ph-stat svd"><div class="ph-stat-l">Saved</div><div class="ph-stat-v">$2.2k</div></div>
      </div>
      <div class="ph-sec-title">Recent</div>
      <div class="ph-tx neg">
        <div class="ph-tx-icon" style="background:rgba(244,63,94,0.13);color:#F43F5E;">☕</div>
        <div class="ph-tx-info"><div class="ph-tx-name">Sightglass Coffee</div><div class="ph-tx-cat">Food & Dining</div></div>
        <div class="ph-tx-amt">-$6.50</div>
      </div>
      <div class="ph-tx pos">
        <div class="ph-tx-icon" style="background:rgba(34,211,238,0.13);color:#22D3EE;">↑</div>
        <div class="ph-tx-info"><div class="ph-tx-name">Salary</div><div class="ph-tx-cat">Income</div></div>
        <div class="ph-tx-amt">+$5,400</div>
      </div>
      <div class="ph-nudge">
        <div class="ph-nudge-t">✦ On track for Japan goal</div>
        <div class="ph-nudge-s">Cut $20/mo more → save 3 days earlier</div>
      </div>
      <div class="ph-nav">
        <div class="ph-nav-item active"><div class="ph-nav-icon">⬡</div><div class="ph-nav-lbl">Overview</div></div>
        <div class="ph-nav-item"><div class="ph-nav-icon">≡</div><div class="ph-nav-lbl">Activity</div></div>
        <div class="ph-nav-item"><div class="ph-nav-icon">◑</div><div class="ph-nav-lbl">Spend</div></div>
        <div class="ph-nav-item"><div class="ph-nav-icon">✦</div><div class="ph-nav-lbl">Insights</div></div>
        <div class="ph-nav-item"><div class="ph-nav-icon">◈</div><div class="ph-nav-lbl">Goals</div></div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-eyebrow">Built different</div>
  <h2 class="features-title">Finance that thinks ahead</h2>
  <p class="features-sub">Lucid doesn't just track — it interprets, predicts, and coaches.</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(139,92,246,0.14);">✦</div>
      <h3>AI Insights Engine</h3>
      <p>Natural-language financial coaching. Lucid surfaces the $12/week you're overspending before you notice it.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(34,211,238,0.13);">◑</div>
      <h3>Spending DNA</h3>
      <p>Category-level breakdowns that adapt to your life. See exactly where money flows, color-coded by priority.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(244,63,94,0.13);">◈</div>
      <h3>Goal Autopilot</h3>
      <p>Set a goal, connect a savings account. Lucid auto-adjusts transfers to keep you on schedule, always.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(245,158,11,0.13);">⬡</div>
      <h3>Health Score</h3>
      <p>A single 0–100 score that synthesizes savings rate, budget adherence, and debt trajectory in real time.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(139,92,246,0.14);">≡</div>
      <h3>Smart Activity</h3>
      <p>Transactions grouped, categorized, and annotated automatically. Merchant-level detail without the manual work.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(34,211,238,0.13);">▲</div>
      <h3>Net Worth Tracking</h3>
      <p>All accounts in one view. Watch your net worth grow with glow-highlighted milestones.</p>
    </div>
  </div>
</section>

<section class="stats">
  <div class="stats-grid">
    <div class="stat-cell"><div class="stat-num">84</div><div class="stat-lbl">Average health score after 90 days</div></div>
    <div class="stat-cell"><div class="stat-num">$2.2k</div><div class="stat-lbl">Average monthly savings increase</div></div>
    <div class="stat-cell"><div class="stat-num">3×</div><div class="stat-lbl">Faster goal achievement vs manual tracking</div></div>
    <div class="stat-cell"><div class="stat-num">4.9★</div><div class="stat-lbl">App store rating, 12k reviews</div></div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-card">
    <h2>Start knowing your money</h2>
    <p>Connect your accounts in 60 seconds. Lucid does the rest.</p>
    <div class="cta-actions">
      <a href="https://ram.zenbin.org/lucid-viewer" class="btn">See the design</a>
      <a href="https://ram.zenbin.org/lucid-mock" class="btn-ghost">Try interactive mock →</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-brand">LUCID</div>
  <div class="footer-links">
    <a href="#">Privacy</a>
    <a href="#">Security</a>
    <a href="#">Contact</a>
  </div>
  <div class="footer-credit">Design by RAM · ram.zenbin.org</div>
</footer>

</body>
</html>`;

// ── VIEWER ────────────────────────────────────────────────────────────────────
const penJson      = readFileSync(path.join(__dirname, 'lucid.pen'), 'utf8');
const penInjection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

let viewerHtml;
try {
  viewerHtml = readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8');
} catch {
  viewerHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LUCID — Pencil Viewer</title>
<style>
  body { margin: 0; background: #06060F; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; padding: 40px 20px; font-family: Inter, sans-serif; color: #F0EEFF; }
  h1 { font-size: 14px; letter-spacing: 3px; color: #8B5CF6; font-weight: 700; margin-bottom: 8px; }
  p { font-size: 12px; color: rgba(240,238,255,0.4); margin-bottom: 32px; }
  .screens { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
  .screen-card { background: #0D0D1E; border-radius: 16px; padding: 16px; width: 220px; border: 1px solid rgba(240,238,255,0.07); }
  .screen-name { font-size: 11px; font-weight: 600; color: rgba(240,238,255,0.5); margin-top: 12px; text-align: center; letter-spacing: 0.5px; }
  .pen-frame { border-radius: 8px; overflow: hidden; background: #06060F; }
</style>
<script>
window.EMBEDDED_PEN = null;
<\/script>
</head>
<body>
<h1>LUCID</h1>
<p>Your money, understood · pencil.dev viewer</p>
<div id="root" class="screens">
  <p style="color:rgba(240,238,255,0.3);font-size:13px;">Pencil viewer loading...</p>
</div>
<script>
(function() {
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) return;
  const root = document.getElementById('root');
  root.innerHTML = '';
  pen.screens.forEach(screen => {
    const card = document.createElement('div');
    card.className = 'screen-card';
    const frame = document.createElement('div');
    frame.className = 'pen-frame';
    frame.style.width = screen.frame.width * 0.5 + 'px';
    frame.style.height = screen.frame.height * 0.5 + 'px';
    frame.style.position = 'relative';
    frame.style.overflow = 'hidden';
    frame.style.background = '#06060F';
    const label = document.createElement('div');
    label.className = 'screen-name';
    label.textContent = screen.name;
    card.appendChild(frame);
    card.appendChild(label);
    root.appendChild(card);
  });
})();
<\/script>
</body></html>`;
}

viewerHtml = viewerHtml.replace('<script>', penInjection + '\n<script>');

// ── SVELTE MOCK ───────────────────────────────────────────────────────────────
const design = {
  appName: 'LUCID',
  tagline: 'Your money, understood',
  archetype: ARCHETYPE,
  palette: {
    bg:      '#06060F',
    surface: '#0D0D1E',
    text:    '#F0EEFF',
    accent:  '#8B5CF6',
    accent2: '#22D3EE',
    muted:   'rgba(240,238,255,0.45)',
  },
  lightPalette: {
    bg:      '#F5F4FF',
    surface: '#FFFFFF',
    text:    '#1A1830',
    accent:  '#7C3AED',
    accent2: '#06B6D4',
    muted:   'rgba(26,24,48,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$42,814', sub: '▲ +$318 this month' },
        { type: 'metric-row', items: [
          { label: 'Income',  value: '$5,400' },
          { label: 'Spent',   value: '$3,200' },
          { label: 'Saved',   value: '$2,200' },
        ]},
        { type: 'progress', items: [{ label: 'Monthly Budget', pct: 71 }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Sightglass Coffee', sub: 'Food · Today', badge: '-$6.50' },
          { icon: 'zap',      title: 'Salary',            sub: 'Income · Apr 2', badge: '+$5,400' },
          { icon: 'star',     title: 'Equinox',           sub: 'Health · Today', badge: '-$85' },
        ]},
        { type: 'text', label: 'AI Nudge ✦', value: 'Cut subscriptions by $20/mo → hit Japan goal 3 days earlier.' },
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'tags', label: 'Month', items: ['Feb', 'Mar', 'Apr ✓'] },
        { type: 'metric-row', items: [{ label: 'Spent', value: '$3,200' }, { label: 'Income', value: '$5,400' }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Whole Foods',     sub: 'Groceries · Apr 2',    badge: '-$62.14' },
          { icon: 'zap',      title: 'Salary',          sub: 'Income · Apr 2',       badge: '+$5,400' },
          { icon: 'star',     title: 'Tony\'s Pizzeria',sub: 'Dining Out · Apr 1',   badge: '-$24.50' },
          { icon: 'bell',     title: 'Spotify',         sub: 'Subscriptions · Apr 1',badge: '-$9.99' },
          { icon: 'map',      title: 'Clipper Card',    sub: 'Transport · Apr 2',    badge: '-$3.20' },
        ]},
      ],
    },
    {
      id: 'spending', label: 'Spending',
      content: [
        { type: 'metric', label: 'Total Spent — April', value: '$3,200', sub: '71% of $4,500 budget' },
        { type: 'progress', items: [
          { label: 'Food & Dining',  pct: 34 },
          { label: 'Subscriptions',  pct: 18 },
          { label: 'Health',         pct: 14 },
          { label: 'Transport',      pct: 10 },
          { label: 'Shopping',       pct: 15 },
          { label: 'Other',          pct: 9  },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '84', sub: '▲ +3 from last month · Great shape' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Save 3 days earlier on Japan trip',   sub: 'Dining spend is 34% of budget — small cuts add up', badge: '✦' },
          { icon: 'alert',  title: 'Subscription creep detected',          sub: '2 of 6 subs unused 45+ days — easy $20 save',      badge: '⚠' },
          { icon: 'check',  title: 'Best savings month in 6 months',       sub: '$2,200 saved — 24% above average',                  badge: '◈' },
          { icon: 'bell',   title: 'Rent due in 8 days',                   sub: '$2,200 auto-pay scheduled Apr 11',                  badge: '◑' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric-row', items: [{ label: 'Active Goals', value: '3' }, { label: 'Total Saved', value: '$12.8k' }] },
        { type: 'progress', items: [
          { label: 'Japan Trip ✈ — Sep 2026',    pct: 58 },
          { label: 'Emergency Fund — Dec 2026',   pct: 53 },
          { label: 'New Laptop — Jul 2026',       pct: 43 },
        ]},
        { type: 'text', label: 'AI Tip ✦', value: 'Automate $50 more/mo → all goals on track by August.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview', icon: 'home'     },
    { id: 'activity',  label: 'Activity', icon: 'list'     },
    { id: 'spending',  label: 'Spend',    icon: 'chart'    },
    { id: 'insights',  label: 'Insights', icon: 'zap'      },
    { id: 'goals',     label: 'Goals',    icon: 'star'     },
  ],
};

// ── RUN PIPELINE ──────────────────────────────────────────────────────────────
console.log('Publishing LUCID...\n');

// Hero page
const heroResult = await publishPage(SLUG, heroHtml, 'LUCID — Your money, understood');
console.log('Hero:', heroResult.url);

// Viewer
const viewerResult = await publishPage(SLUG + '-viewer', viewerHtml, 'LUCID — Pencil Viewer');
console.log('Viewer:', viewerResult.url);

// Svelte mock
const svelteSource = generateSvelteComponent(design);
const mockHtml     = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const mockResult   = await publishMock(mockHtml, SLUG + '-mock', design.appName + ' — Interactive Mock');
console.log('Mock:', mockResult.url);

// Gallery queue
const config    = JSON.parse(readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN     = config.GITHUB_TOKEN;
const REPO      = config.GITHUB_REPO;

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

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
});
const fileData     = JSON.parse(getRes.body);
const currentSha   = fileData.sha;
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
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  source: 'heartbeat',
};
queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody    = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: {
    Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
    'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
    Accept: 'application/vnd.github.v3+json',
  },
}, putBody);
console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 100));

// Design DB
try {
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Design DB: indexed ✓');
} catch (e) {
  console.log('Design DB: skipped —', e.message);
}

console.log('\n✓ LUCID published');
console.log('  Hero:   https://ram.zenbin.org/lucid');
console.log('  Viewer: https://ram.zenbin.org/lucid-viewer');
console.log('  Mock:   https://ram.zenbin.org/lucid-mock');
