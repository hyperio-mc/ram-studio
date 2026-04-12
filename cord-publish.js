#!/usr/bin/env node
// CORD — Publish hero + viewer to ram.zenbin.org

const fs = require('fs');
const https = require('https');

const SLUG = 'cord';
const APP_NAME = 'CORD';
const TAGLINE = 'Contract intelligence for creative studios';
const SUBDOMAIN = 'ram';

function pub(slug, html, sub) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    };
    if (sub) headers['X-Subdomain'] = sub;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0,120) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HERO HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CORD — Contract intelligence for creative studios</title>
  <meta name="description" content="Proposals, contracts, time tracking, and invoices in one warm editorial workspace built for independent creative studios.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F7F4EF; --bg-alt: #EDE9E2; --surface: #FFFFFF; --surface-alt: #FAF8F4;
      --text: #1C1916; --muted: rgba(28,25,22,0.52); --subtle: rgba(28,25,22,0.28);
      --accent: #2B5A8A; --accent2: #8B4A1E;
      --accent-soft: rgba(43,90,138,0.09); --accent2-soft: rgba(139,74,30,0.09);
      --border: rgba(28,25,22,0.09); --border-strong: rgba(28,25,22,0.18);
      --green: #1E7A4E; --orange: #C4620A; --red: #B83242;
      --green-soft: rgba(30,122,78,0.10); --orange-soft: rgba(196,98,10,0.10);
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }
    a { color: var(--accent); text-decoration: none; }

    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(247,244,239,0.90); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 58px; }
    .nav-brand { font-weight: 800; font-size: 16px; letter-spacing: 0.12em; color: var(--text); }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); transition: color .2s; }
    .nav-links a:hover { color: var(--accent); }
    .nav-cta { background: var(--accent); color: #fff; padding: 8px 20px; border-radius: 24px; font-size: 13px; font-weight: 600; transition: opacity .2s; }
    .nav-cta:hover { opacity: .85; }

    .hero { min-height: 100vh; max-width: 1200px; margin: 0 auto; padding: 0 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding-top: 58px; }
    .hero-left { padding-top: 40px; }
    .hero-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.20em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
    .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(40px, 5vw, 68px); font-weight: 800; line-height: 1.06; color: var(--text); margin-bottom: 24px; }
    .hero-headline em { font-style: italic; color: var(--accent); }
    .hero-sub { font-size: 17px; color: var(--muted); line-height: 1.65; margin-bottom: 40px; max-width: 440px; }
    .hero-actions { display: flex; gap: 14px; align-items: center; margin-bottom: 52px; flex-wrap: wrap; }
    .btn-primary { background: var(--accent); color: #fff; padding: 13px 26px; border-radius: 40px; font-size: 14px; font-weight: 600; transition: opacity .2s, transform .15s; display: inline-block; }
    .btn-primary:hover { opacity: .87; transform: translateY(-1px); }
    .btn-ghost { background: var(--accent-soft); color: var(--accent); padding: 13px 22px; border-radius: 40px; font-size: 14px; font-weight: 600; transition: background .2s; display: inline-block; }
    .btn-ghost:hover { background: rgba(43,90,138,0.16); }
    .hero-proof { display: flex; gap: 32px; flex-wrap: wrap; }
    .proof-val { font-size: 22px; font-weight: 800; color: var(--text); }
    .proof-label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: 0.03em; }

    .hero-right { position: relative; }
    .floating-badge { position: absolute; top: -14px; right: -14px; z-index: 2; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; box-shadow: 0 4px 20px rgba(28,25,22,0.10); }
    .fb-val { font-size: 18px; font-weight: 800; color: var(--green); }
    .fb-label { font-size: 9px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .dashboard-preview { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 20px; box-shadow: 0 8px 48px rgba(28,25,22,0.08); }
    .preview-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .preview-topbar .brand { font-size: 11px; font-weight: 800; letter-spacing: 0.14em; color: var(--text); }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); display: inline-block; margin-right: 5px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
    .preview-live { font-size: 10px; font-weight: 600; color: var(--green); display: flex; align-items: center; }
    .preview-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .pstat { background: var(--surface-alt); border-radius: 8px; padding: 12px; border: 1px solid var(--border); }
    .pstat-val { font-size: 18px; font-weight: 800; color: var(--text); }
    .pstat-label { font-size: 9px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; }
    .pstat-delta { font-size: 9px; font-weight: 600; color: var(--green); }
    .contract-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: var(--surface-alt); border-radius: 8px; margin-bottom: 6px; border: 1px solid var(--border); }
    .contract-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .contract-name { font-size: 12px; font-weight: 600; color: var(--text); flex: 1; }
    .contract-val { font-size: 12px; font-weight: 700; color: var(--text); }
    .contract-status { font-size: 9px; font-weight: 600; padding: 3px 8px; border-radius: 12px; }
    .status-progress { background: rgba(43,90,138,0.10); color: var(--accent); }
    .status-review { background: rgba(196,98,10,0.10); color: var(--orange); }
    .status-draft { background: rgba(28,25,22,0.07); color: var(--muted); }
    .prog-bar { background: var(--bg-alt); border-radius: 4px; height: 4px; overflow: hidden; margin-top: 4px; }
    .prog-fill { height: 4px; border-radius: 4px; background: var(--accent); opacity: .7; }
    .prog-label { display: flex; justify-content: space-between; font-size: 9px; color: var(--muted); font-weight: 500; margin-top: 12px; }

    .trust-bar { background: var(--bg-alt); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 22px 48px; }
    .trust-inner { max-width: 1100px; margin: 0 auto; display: flex; gap: 40px; align-items: center; flex-wrap: wrap; }
    .trust-label { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: .14em; text-transform: uppercase; flex-shrink: 0; }
    .trust-name { font-size: 13px; font-weight: 700; color: var(--subtle); }

    .section { max-width: 1100px; margin: 0 auto; padding: 96px 48px; }
    .section-kicker { font-size: 10px; font-weight: 700; letter-spacing: .18em; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 3.5vw, 44px); font-weight: 800; line-height: 1.10; color: var(--text); margin-bottom: 16px; }
    .section-sub { font-size: 15px; color: var(--muted); max-width: 520px; margin-bottom: 52px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .feature-card { background: var(--surface); border-radius: 12px; border: 1px solid var(--border); padding: 26px; }
    .feature-icon { font-size: 20px; margin-bottom: 14px; }
    .feature-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .feature-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

    .social { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 48px; }
    .social-inner { max-width: 1100px; margin: 0 auto; }
    .testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 44px; }
    .testimonial { background: var(--bg); border-radius: 12px; border: 1px solid var(--border); padding: 22px; }
    .testimonial-body { font-size: 14px; color: var(--text); line-height: 1.65; font-style: italic; margin-bottom: 18px; }
    .testimonial-author { display: flex; align-items: center; gap: 10px; }
    .testimonial-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--accent); flex-shrink: 0; }
    .testimonial-name { font-size: 12px; font-weight: 600; color: var(--text); }
    .testimonial-role { font-size: 11px; color: var(--muted); }

    .pricing { max-width: 1100px; margin: 0 auto; padding: 96px 48px; }
    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 720px; }
    .pricing-card { background: var(--surface); border-radius: 14px; border: 1px solid var(--border); padding: 30px; }
    .pricing-card.featured { border-color: var(--accent); background: var(--accent); color: #fff; }
    .pricing-plan { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 10px; color: var(--muted); }
    .pricing-card.featured .pricing-plan { color: rgba(255,255,255,.65); }
    .pricing-price { font-size: 36px; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 4px; }
    .pricing-card.featured .pricing-price { color: #fff; }
    .pricing-period { font-size: 12px; color: var(--muted); margin-bottom: 22px; }
    .pricing-card.featured .pricing-period { color: rgba(255,255,255,.65); }
    .pricing-features { list-style: none; }
    .pricing-features li { font-size: 13px; color: var(--text); padding: 5px 0; display: flex; gap: 8px; }
    .pricing-card.featured .pricing-features li { color: rgba(255,255,255,.88); }
    .pricing-features li::before { content: '✓'; color: var(--green); font-weight: 700; flex-shrink: 0; }
    .pricing-card.featured .pricing-features li::before { color: rgba(255,255,255,.8); }
    .pricing-btn { display: block; width: 100%; margin-top: 26px; padding: 11px; text-align: center; border-radius: 32px; font-size: 14px; font-weight: 600; background: var(--accent-soft); color: var(--accent); }
    .pricing-card.featured .pricing-btn { background: rgba(255,255,255,.18); color: #fff; }

    .cta-band { background: var(--text); color: #F7F4EF; padding: 80px 48px; text-align: center; }
    .cta-band-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 3.5vw, 42px); font-weight: 800; margin-bottom: 16px; line-height: 1.1; }
    .cta-band-sub { font-size: 16px; color: rgba(247,244,239,.58); margin-bottom: 36px; }
    .cta-band .btn-primary { background: #F7F4EF; color: var(--text); }

    footer { border-top: 1px solid var(--border); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
    .footer-brand { font-weight: 800; font-size: 14px; letter-spacing: .12em; }
    .footer-copy { font-size: 12px; color: var(--muted); }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; padding: 80px 24px 40px; }
      .hero-right { display: none; }
      .features-grid, .testimonials { grid-template-columns: 1fr; }
      .pricing-grid { grid-template-columns: 1fr; }
      nav { padding: 0 20px; }
      .nav-links { display: none; }
      .section, .pricing { padding: 60px 24px; }
    }
  </style>
</head>
<body>
<nav>
  <span class="nav-brand">CORD</span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#pricing">Pricing</a>
    <a href="https://ram.zenbin.org/cord-viewer">Prototype</a>
  </div>
  <a href="#" class="nav-cta">Start free trial</a>
</nav>

<section style="padding-top:58px">
  <div class="hero">
    <div class="hero-left">
      <p class="hero-kicker">Studio Operations · Light theme design</p>
      <h1 class="hero-headline">Your studio's<br><em>contracts,</em><br>all in one place.</h1>
      <p class="hero-sub">Proposals to final invoices — without the spreadsheet chaos. CORD keeps creative studios on time, on budget, and always paid.</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary">Start free trial →</a>
        <a href="https://ram.zenbin.org/cord-viewer" class="btn-ghost">View prototype</a>
      </div>
      <div class="hero-proof">
        <div>
          <div class="proof-val">$2.4M</div>
          <div class="proof-label">Invoiced this month</div>
        </div>
        <div>
          <div class="proof-val">4,200+</div>
          <div class="proof-label">Creative studios</div>
        </div>
        <div>
          <div class="proof-val">11 days</div>
          <div class="proof-label">Avg time to payment</div>
        </div>
      </div>
    </div>
    <div class="hero-right">
      <div class="floating-badge">
        <div class="fb-val">↑ 12%</div>
        <div class="fb-label">Revenue MTD</div>
      </div>
      <div class="dashboard-preview">
        <div class="preview-topbar">
          <span class="brand">CORD</span>
          <span class="preview-live"><span class="live-dot"></span> 3 active contracts</span>
        </div>
        <div class="preview-stats">
          <div class="pstat">
            <div class="pstat-val">$28.4K</div>
            <div class="pstat-label">Revenue MTD</div>
            <div class="pstat-delta">↑ 12%</div>
          </div>
          <div class="pstat">
            <div class="pstat-val">7</div>
            <div class="pstat-label">Pending invoices</div>
            <div class="pstat-delta" style="color:var(--orange)">$12,600</div>
          </div>
          <div class="pstat">
            <div class="pstat-val">26.5h</div>
            <div class="pstat-label">Tracked this week</div>
            <div class="pstat-delta">78% billable</div>
          </div>
        </div>
        <div class="contract-item">
          <div class="contract-dot" style="background:#2B5A8A"></div>
          <span class="contract-name">Prism Brand Identity</span>
          <span class="contract-val">$14,200</span>
          <span class="contract-status status-progress">In Progress</span>
        </div>
        <div class="contract-item">
          <div class="contract-dot" style="background:#C4620A"></div>
          <span class="contract-name">Annual Report Design</span>
          <span class="contract-val">$8,500</span>
          <span class="contract-status status-review">Review</span>
        </div>
        <div class="contract-item">
          <div class="contract-dot" style="background:rgba(28,25,22,0.28)"></div>
          <span class="contract-name">Product Launch Kit</span>
          <span class="contract-val">$5,700</span>
          <span class="contract-status status-draft">Draft</span>
        </div>
        <div class="prog-label">
          <span>Prism Brand Identity · 62% complete</span>
          <span>62%</span>
        </div>
        <div class="prog-bar"><div class="prog-fill" style="width:62%"></div></div>
      </div>
    </div>
  </div>
</section>

<div class="trust-bar">
  <div class="trust-inner">
    <span class="trust-label">Trusted by studios at</span>
    <span class="trust-name">Locomotive</span>
    <span class="trust-name">Antinomy Studio</span>
    <span class="trust-name">Fourth Floor Design</span>
    <span class="trust-name">Okey Studio</span>
    <span class="trust-name">Forge Creative</span>
  </div>
</div>

<section class="section" id="features">
  <p class="section-kicker">Everything you need</p>
  <h2 class="section-title">Built for the way<br>creative work actually flows</h2>
  <p class="section-sub">Not a CRM. Not a generic PM tool. CORD is shaped around the contract lifecycle of creative studios.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◫</div>
      <div class="feature-title">Contract builder</div>
      <div class="feature-body">Draft, send, and e-sign proposals in minutes. Built-in templates for brand, editorial, and digital projects.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◷</div>
      <div class="feature-title">Time tracker</div>
      <div class="feature-body">Log hours against milestones. Weekly summaries auto-attach to invoices so you never leave billable time behind.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Invoice & payments</div>
      <div class="feature-body">One-click invoices from tracked time. Accept Stripe, Wise, or bank transfer. Chase late payments automatically.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">Studio insights</div>
      <div class="feature-body">Revenue per client, utilisation rate, and fastest-paying clients — monthly, quarterly, or YTD.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◬</div>
      <div class="feature-title">Milestone tracking</div>
      <div class="feature-body">Break every contract into deliverable milestones. Clients see live progress. You stay accountable — and paid on schedule.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⌘</div>
      <div class="feature-title">Client portal</div>
      <div class="feature-body">Give each client a branded portal to review work, approve milestones, and pay invoices. No more email threads.</div>
    </div>
  </div>
</section>

<section class="social">
  <div class="social-inner">
    <p class="section-kicker">From creative studios</p>
    <h2 class="section-title">Real studios. Real revenue.</h2>
    <div class="testimonials">
      <div class="testimonial">
        <p class="testimonial-body">"CORD paid for itself in the first month. I recovered $4,200 in late invoices I'd basically written off."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">AK</div>
          <div>
            <div class="testimonial-name">Akemi Kusabe</div>
            <div class="testimonial-role">Brand designer, Tokyo</div>
          </div>
        </div>
      </div>
      <div class="testimonial">
        <p class="testimonial-body">"I used to spend Sundays chasing invoices. Now it's automatic and I barely think about it."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">ML</div>
          <div>
            <div class="testimonial-name">Marcus Lund</div>
            <div class="testimonial-role">Motion & identity, Stockholm</div>
          </div>
        </div>
      </div>
      <div class="testimonial">
        <p class="testimonial-body">"The milestone tracker alone changed how I scope projects. Clients actually respect the process now."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">SP</div>
          <div>
            <div class="testimonial-name">Sofia Petrov</div>
            <div class="testimonial-role">Editorial design studio, Berlin</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="pricing" id="pricing">
  <p class="section-kicker">Pricing</p>
  <h2 class="section-title">One studio, one price.</h2>
  <p class="section-sub">No per-seat nonsense. Flat-rate pricing for your whole studio.</p>
  <div class="pricing-grid">
    <div class="pricing-card">
      <p class="pricing-plan">Solo</p>
      <p class="pricing-price">$18</p>
      <p class="pricing-period">per month, billed annually</p>
      <ul class="pricing-features">
        <li>Up to 5 active contracts</li>
        <li>Unlimited invoices</li>
        <li>Time tracker</li>
        <li>Client portal</li>
        <li>Stripe + Wise payments</li>
      </ul>
      <a href="#" class="pricing-btn">Start free trial</a>
    </div>
    <div class="pricing-card featured">
      <p class="pricing-plan">Studio</p>
      <p class="pricing-price">$44</p>
      <p class="pricing-period">per month, billed annually</p>
      <ul class="pricing-features">
        <li>Unlimited contracts</li>
        <li>Team time tracking (up to 6)</li>
        <li>Advanced insights & reports</li>
        <li>Custom invoice branding</li>
        <li>Automated payment reminders</li>
        <li>Priority support</li>
      </ul>
      <a href="#" class="pricing-btn">Start free trial</a>
    </div>
  </div>
</section>

<section class="cta-band">
  <h2 class="cta-band-title">Your studio deserves<br>to get paid on time.</h2>
  <p class="cta-band-sub">Join 4,200+ creative studios already running on CORD.</p>
  <a href="#" class="btn-primary">Start free — no card required</a>
</section>

<footer>
  <span class="footer-brand">CORD</span>
  <span class="footer-copy">© 2026 CORD · Contract intelligence for creative studios · RAM Design Heartbeat</span>
</footer>
</body>
</html>`;

async function main() {
  // ─── Hero ───────────────────────────────────────────────────────
  console.log('Publishing hero...');
  const r1 = await pub(SLUG, heroHtml, SUBDOMAIN);
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body);

  // ─── Viewer ─────────────────────────────────────────────────────
  const penJson = fs.readFileSync('/workspace/group/design-studio/cord.pen', 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r2 = await pub(SLUG + '-viewer', viewerHtml, SUBDOMAIN);
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body);

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
