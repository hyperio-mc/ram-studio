// pith-publish.js — PITH hero + gallery
// Theme: LIGHT — Swiss editorial newsprint reading intelligence
// Inspired by HireKit (Land-book) — editorial grid, Swiss precision
// + Giacomo Dal Prà (Land-book) — newspaper column rules, Playfair + mono

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PITH — read with intention</title>
  <meta name="description" content="Slow reading intelligence app. Swiss editorial newsprint aesthetic. Playfair Display + IBM Plex Mono. Pith summaries, highlights, and reading streaks. A RAM design concept.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ram.zenbin.org/pith">
  <meta property="og:title" content="PITH — read with intention">
  <meta property="og:description" content="Slow reading intelligence app. Swiss editorial newsprint aesthetic. Playfair Display + IBM Plex Mono. Pith summaries, highlights, and reading streaks. A RAM design concept.">
  <meta property="og:site_name" content="RAM Design Studio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="PITH — read with intention">
  <meta name="twitter:description" content="Slow reading intelligence app. Swiss editorial newsprint aesthetic. Playfair Display + IBM Plex Mono. Pith summaries, highlights, and reading streaks. A RAM design concept.">
  <meta name="twitter:site" content="@ram_design">
  <meta name="theme-color" content="#C8331A">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --np:#F8F5F0;--white:#FFFFFF;--ink:#0E0E0E;
    --red:#C8331A;--navy:#1A2E4A;--sage:#4A7860;
    --rule:rgba(14,14,14,0.12);--muted:rgba(14,14,14,0.45);
    --pale:rgba(14,14,14,0.06);--border:rgba(14,14,14,0.08);
  }

  html{scroll-behavior:smooth}
  body{background:var(--np);color:var(--ink);font-family:'IBM Plex Sans',sans-serif;line-height:1.5;overflow-x:hidden}

  /* ─── NAV ─── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--np);border-bottom:2px solid var(--ink);
    display:flex;align-items:center;justify-content:space-between;padding:0 64px;height:60px}
  .nav-logo{font-family:'Playfair Display',serif;font-weight:900;font-size:22px;text-decoration:none;color:var(--ink);letter-spacing:.01em}
  .nav-logo span{color:var(--red)}
  .nav-links{display:flex;gap:40px;list-style:none}
  .nav-links a{font-size:11px;color:var(--muted);text-decoration:none;font-family:'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase}
  .nav-cta{background:var(--ink);color:var(--np);border:none;padding:9px 20px;font-size:11px;font-weight:500;cursor:pointer;font-family:'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase}

  /* ─── HERO ─── */
  .hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px 0 0;overflow:hidden}
  .hero-left{padding:0 64px 72px}
  .hero-masthead{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;margin-bottom:20px;border-top:2px solid var(--ink);padding-top:10px;display:flex;justify-content:space-between}
  .hero-title{font-family:'Playfair Display',serif;font-weight:900;font-size:88px;line-height:0.88;letter-spacing:-.02em;margin-bottom:8px}
  .hero-title em{color:var(--red);font-style:italic}
  .hero-rule{height:2px;background:var(--ink);margin:24px 0}
  .hero-deck{font-family:'Playfair Display',serif;font-size:20px;line-height:1.5;color:var(--ink);font-style:italic;margin-bottom:12px;max-width:480px}
  .hero-body{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--muted);line-height:1.9;max-width:440px;margin-bottom:40px;letter-spacing:.01em}
  .hero-btns{display:flex;gap:14px;align-items:center}
  .btn-ink{background:var(--ink);color:var(--np);padding:13px 28px;font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.08em;text-decoration:none;display:inline-block;text-transform:uppercase}
  .btn-red{background:var(--red);color:var(--white);padding:13px 28px;font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.08em;text-decoration:none;display:inline-block;text-transform:uppercase}
  .btn-ghost{border:1px solid var(--rule);color:var(--muted);padding:12px 26px;font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.08em;text-decoration:none;display:inline-block;text-transform:uppercase}
  .hero-right{height:100vh;position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;padding-bottom:0;background:var(--white);border-left:2px solid var(--ink)}

  /* Phone */
  .phone-wrap{width:280px;transform:translateY(32px)}
  .phone{width:280px;height:580px;background:var(--np);overflow:hidden;border:2px solid var(--ink);position:relative}
  .phone-notch{width:80px;height:18px;background:var(--ink);position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:2}
  .p-screen{padding:28px 14px 14px;height:100%;overflow:hidden}

  /* Phone screen internals */
  .p-mast{font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:.14em;color:var(--muted);text-transform:uppercase;border-top:1.5px solid var(--ink);border-bottom:1px solid var(--rule);padding:4px 0;margin-bottom:10px;display:flex;justify-content:space-between}
  .p-head{font-family:'Playfair Display',serif;font-weight:900;font-size:26px;line-height:0.92;letter-spacing:-.01em;margin-bottom:4px}
  .p-head em{color:var(--red);font-style:italic}
  .p-deck{font-family:'Playfair Display',serif;font-style:italic;font-size:10px;color:var(--muted);line-height:1.55;margin-bottom:10px}
  .p-rule{height:1.5px;background:var(--ink);margin-bottom:10px}
  .p-story{padding:7px 0;border-bottom:1px solid var(--rule)}
  .p-story-tag{font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:.1em;color:var(--red);text-transform:uppercase;margin-bottom:3px}
  .p-story-title{font-family:'Playfair Display',serif;font-weight:700;font-size:11px;line-height:1.35;margin-bottom:2px}
  .p-story-meta{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--muted);letter-spacing:.04em}
  .p-pith{background:var(--white);border-left:2px solid var(--red);padding:6px 8px;margin-top:8px}
  .p-pith-label{font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:.1em;color:var(--red);text-transform:uppercase;margin-bottom:3px}
  .p-pith-text{font-family:'Playfair Display',serif;font-style:italic;font-size:9px;line-height:1.5;color:var(--ink)}

  /* Floating elements */
  .float-card{position:absolute;background:var(--white);border:1px solid var(--rule);padding:12px 14px;max-width:160px}
  .fc-label{font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;margin-bottom:4px}
  .fc-val{font-family:'Playfair Display',serif;font-weight:700;font-size:22px;color:var(--ink)}
  .fc-sub{font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sage);margin-top:2px;letter-spacing:.04em}

  /* ─── EDITORIAL STRIP ─── */
  .editorial{padding:64px 0;background:var(--ink);overflow:hidden}
  .ed-inner{max-width:1240px;margin:0 auto;padding:0 64px}
  .ed-title{font-family:'Playfair Display',serif;font-weight:900;font-style:italic;font-size:72px;line-height:0.90;letter-spacing:-.02em;color:var(--np);max-width:800px;margin-bottom:24px}
  .ed-title em{color:var(--red);font-style:normal}
  .ed-sub{font-family:'IBM Plex Mono',monospace;font-size:13px;color:rgba(248,245,240,0.5);line-height:1.9;max-width:520px;letter-spacing:.02em}

  /* ─── FEATURES ─── */
  .features{padding:96px 64px;background:var(--np);border-top:2px solid var(--ink)}
  .features-inner{max-width:1240px;margin:0 auto}
  .feat-head{display:grid;grid-template-columns:1fr 2fr;gap:48px;margin-bottom:64px;align-items:end;border-bottom:1px solid var(--rule);padding-bottom:32px}
  .feat-kicker{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--red);margin-bottom:12px;text-transform:uppercase}
  .feat-title{font-family:'Playfair Display',serif;font-weight:900;font-size:52px;line-height:0.92;letter-spacing:-.02em}
  .feat-deck{font-family:'Playfair Display',serif;font-style:italic;font-size:18px;line-height:1.6;color:var(--muted)}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--rule)}
  .feat-card{padding:32px 28px;border-right:1px solid var(--rule)}
  .feat-card:last-child{border-right:none}
  .feat-num{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--red);letter-spacing:.1em;margin-bottom:16px}
  .feat-card h3{font-family:'Playfair Display',serif;font-weight:700;font-size:20px;margin-bottom:10px;line-height:1.2}
  .feat-card p{font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.85;color:var(--muted);letter-spacing:.01em}

  /* ─── PITH QUOTE ─── */
  .pith-quote{padding:96px 64px;background:var(--white);border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
  .pq-inner{max-width:960px;margin:0 auto;display:grid;grid-template-columns:auto 1fr;gap:48px;align-items:start}
  .pq-label{writing-mode:vertical-rl;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.16em;color:var(--red);text-transform:uppercase;transform:rotate(180deg)}
  .pq-body{border-left:3px solid var(--red);padding-left:32px}
  .pq-quote{font-family:'Playfair Display',serif;font-style:italic;font-size:36px;line-height:1.35;color:var(--ink);margin-bottom:20px}
  .pq-attr{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.04em}

  /* ─── STATS ─── */
  .stats{padding:80px 64px;background:var(--np);border-top:2px solid var(--ink)}
  .stats-inner{max-width:1240px;margin:0 auto}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid var(--rule)}
  .stat-card{padding:36px 28px;border-right:1px solid var(--rule)}
  .stat-card:last-child{border-right:none}
  .stat-n{font-family:'Playfair Display',serif;font-weight:900;font-size:56px;color:var(--ink);line-height:1}
  .stat-n em{color:var(--red);font-style:normal}
  .stat-t{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.06em;color:var(--muted);margin:8px 0 4px;text-transform:uppercase}
  .stat-d{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--muted);line-height:1.8;letter-spacing:.01em}

  /* ─── CTA ─── */
  .cta{padding:120px 64px;background:var(--ink);text-align:center}
  .cta-inner{max-width:640px;margin:0 auto}
  .cta h2{font-family:'Playfair Display',serif;font-weight:900;font-style:italic;font-size:64px;line-height:0.92;letter-spacing:-.02em;color:var(--np);margin-bottom:24px}
  .cta h2 em{color:var(--red);font-style:normal}
  .cta p{font-family:'IBM Plex Mono',monospace;font-size:13px;color:rgba(248,245,240,0.5);line-height:1.9;margin-bottom:44px;letter-spacing:.02em}
  .btn-red-lg{background:var(--red);color:var(--white);padding:14px 36px;font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;text-decoration:none;display:inline-block;text-transform:uppercase}

  footer{padding:32px 64px;border-top:2px solid rgba(248,245,240,0.15);display:flex;justify-content:space-between;align-items:center;background:var(--ink)}
  .footer-logo{font-family:'Playfair Display',serif;font-weight:900;font-size:18px;color:var(--np);letter-spacing:.02em}
  .footer-logo span{color:var(--red)}
  .footer-note{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(248,245,240,0.4);letter-spacing:.06em}
  .footer-tag{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(--red);padding:4px 12px;border:1px solid rgba(200,51,26,.4);text-transform:uppercase}

  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:80px 24px 64px}
    .hero-right{height:500px;border-left:none;border-top:2px solid var(--ink)}
    .feat-grid{grid-template-columns:1fr}
    .feat-card{border-right:none;border-bottom:1px solid var(--rule)}
    .stats-grid{grid-template-columns:1fr 1fr}
    .stat-card{border-right:none;border-bottom:1px solid var(--rule)}
    nav{padding:0 24px}
    .nav-links{display:none}
    .hero-left{padding:0 0 48px}
    .hero-title{font-size:64px}
    .editorial,.features,.pith-quote,.stats,.cta{padding:64px 24px}
    .ed-title{font-size:48px}
    .feat-head{grid-template-columns:1fr}
    .pq-inner{grid-template-columns:1fr}
    .pq-label{writing-mode:horizontal-tb;transform:none;margin-bottom:12px}
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">PITH<span>.</span></a>
  <ul class="nav-links">
    <li><a href="#">TODAY</a></li>
    <li><a href="#">LIBRARY</a></li>
    <li><a href="#">TOPICS</a></li>
    <li><a href="#">ABOUT</a></li>
  </ul>
  <button class="nav-cta">START READING</button>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-masthead">
      <span>READING INTELLIGENCE · EST. 2026</span>
      <span>FRIDAY, MARCH 27</span>
    </div>
    <h1 class="hero-title">READ<br><em>DEEPER.</em><br>THINK<br>WIDER.</h1>
    <div class="hero-rule"></div>
    <p class="hero-deck">The reading app that distils, connects and rewards the slow readers.</p>
    <p class="hero-body">Most apps optimise for scroll. PITH is optimised for thought. Five curated reads a day. Pith summaries. Highlights that travel with you. A reading intelligence score that grows with every session.</p>
    <div class="hero-btns">
      <a class="btn-red" href="#">START READING</a>
      <a class="btn-ghost" href="#">SEE THE LIBRARY →</a>
    </div>
  </div>

  <div class="hero-right">
    <!-- Floating cards -->
    <div class="float-card" style="left:5%;top:18%">
      <div class="fc-label">PITH SCORE</div>
      <div class="fc-val">847</div>
      <div class="fc-sub">↑ 23 THIS WEEK</div>
    </div>
    <div class="float-card" style="right:4%;top:32%">
      <div class="fc-label">STREAK</div>
      <div class="fc-val">34d</div>
      <div class="fc-sub">READING DAYS</div>
    </div>

    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="p-screen">
          <div class="p-mast"><span>PITH · TODAY'S DIGEST</span><span>MAR 27</span></div>
          <div class="p-head">TO<em>DAY'S</em><br>READS.</div>
          <div class="p-deck">5 curated reads · ~18 min total · matched to your topics</div>
          <div class="p-rule"></div>
          <div class="p-story">
            <div class="p-story-tag">TECHNOLOGY</div>
            <div class="p-story-title">The Quiet Death of the Attention Economy</div>
            <div class="p-story-meta">The Atlantic · 7 min · pith available</div>
          </div>
          <div class="p-story">
            <div class="p-story-tag">SCIENCE</div>
            <div class="p-story-title">What Deep-Sea Vents Tell Us About Life Elsewhere</div>
            <div class="p-story-meta">Nature · 5 min · pith available</div>
          </div>
          <div class="p-pith">
            <div class="p-pith-label">↑ PITH — 3-LINE ESSENCE</div>
            <div class="p-pith-text">"The attention economy is not dying — it is being replaced. The new currency is not clicks, but comprehension depth. Readers who slow down will outcompete those who scan."</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Editorial -->
<section class="editorial">
  <div class="ed-inner">
    <h2 class="ed-title">The world rewards fast readers. We reward <em>smart</em> ones.</h2>
    <p class="ed-sub">PITH distils every article to its sharpest essence — then lets you go deeper if you choose. Slow reading is not inefficiency. It is the competitive advantage most people have stopped practising.</p>
  </div>
</section>

<!-- Features -->
<section class="features">
  <div class="features-inner">
    <div class="feat-head">
      <div>
        <div class="feat-kicker">HOW PITH WORKS</div>
        <h2 class="feat-title">Distil.<br>Connect.<br>Grow.</h2>
      </div>
      <div>
        <p class="feat-deck">Every feature is designed around one principle: reading should leave you with more than you started with. Not just information — understanding. Not just articles — a coherent, growing mind.</p>
      </div>
    </div>
    <div class="feat-grid">
      <div class="feat-card">
        <div class="feat-num">01 —</div>
        <h3>Pith summaries</h3>
        <p>Every article distilled to three precise sentences. Not a simplification — a compression. Read the pith first, decide whether to go deeper. Always your choice.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">02 —</div>
        <h3>Five reads a day</h3>
        <p>Curated, not algorithmically maximised. Five articles matched to your topic fingerprint. No more, no less. Constraint is clarity.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">03 —</div>
        <h3>Highlights + annotations</h3>
        <p>Mark the sentences that matter. Your highlights travel to your library and surface across future reads — building a personal knowledge web over time.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">04 —</div>
        <h3>Topic fingerprint</h3>
        <p>Eight dimensions: Science, Tech, Culture, Politics, Economics, Philosophy, Health, Art. Your balance evolves as you read. Track whether you're broadening or narrowing.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">05 —</div>
        <h3>Reading streaks</h3>
        <p>One article a day keeps the streak alive. 34-day streaks are surprisingly achievable. Momentum compounds. The habit becomes automatic within two weeks.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">06 —</div>
        <h3>Pith score</h3>
        <p>A growing intelligence score built from depth, breadth, consistency and annotation quality. Not a vanity metric — a genuine signal of reading growth over time.</p>
      </div>
    </div>
  </div>
</section>

<!-- Pull Quote -->
<section class="pith-quote">
  <div class="pq-inner">
    <div class="pq-label">↑ PITH PRINCIPLE</div>
    <div class="pq-body">
      <p class="pq-quote">"Comprehension is not reading fast. It is reading with enough friction to leave a mark."</p>
      <p class="pq-attr">FROM THE PITH MANIFESTO — READING INTELLIGENCE LAB, 2026</p>
    </div>
  </div>
</section>

<!-- Stats -->
<section class="stats">
  <div class="stats-inner">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-n"><em>5</em></div>
        <div class="stat-t">Reads per day</div>
        <div class="stat-d">Curated, not infinite. The constraint forces better selection. Every read matters.</div>
      </div>
      <div class="stat-card">
        <div class="stat-n">3×</div>
        <div class="stat-t">Recall improvement</div>
        <div class="stat-d">Pith readers recall 3× more than skimmers after one week. Tested across 10,000 reading sessions.</div>
      </div>
      <div class="stat-card">
        <div class="stat-n">34d</div>
        <div class="stat-t">Average streak</div>
        <div class="stat-d">Median active reader streak. Habit formation occurs at day 14. Most users don't stop after that.</div>
      </div>
      <div class="stat-card">
        <div class="stat-n">847</div>
        <div class="stat-t">Avg Pith score</div>
        <div class="stat-d">After 90 days. Score reflects depth, breadth, annotations and consistency. Grows over a lifetime.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta">
  <div class="cta-inner">
    <h2>Read <em>one</em> thing well today.</h2>
    <p>Five curated reads. Pith summaries. Your reading score. Start your streak today.</p>
    <a class="btn-red-lg" href="#">START READING →</a>
  </div>
</section>

<footer>
  <div class="footer-logo">PITH<span>.</span></div>
  <div class="footer-note">A RAM DESIGN CONCEPT · MARCH 2026</div>
  <div class="footer-tag">LIGHT THEME</div>
</footer>

</body>
</html>`;

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

fs.writeFileSync('pith-hero.html', hero);
console.log('✓ Saved pith-hero.html locally');

console.log('📤 Publishing to ZenBin...');
const body = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({ hostname:'zenbin.org', path:'/v1/pages/pith?overwrite=true', method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'} }, body);
  if (res.status===200||res.status===201) console.log('✓ Hero live at: https://ram.zenbin.org/pith');
  else console.log(`✗ ZenBin ${res.status}: ${res.body.slice(0,120)}`);
} catch(e) { console.log('✗ ZenBin:', e.message); }

console.log('📚 Updating gallery...');
try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  if (Array.isArray(q)) { q.submissions = q; }
  q.submissions = (q.submissions||[]).filter(s=>s.app_name!=='PITH');
  const now = new Date().toISOString();
  q.submissions.push({
    id:`heartbeat-pith-${Date.now()}`,status:'done',app_name:'PITH',
    tagline:'read with intention',archetype:'reading-intelligence',
    design_url:'https://ram.zenbin.org/pith',mock_url:'https://ram.zenbin.org/pith-mock',
    submitted_at:now,published_at:now,credit:'RAM Design Heartbeat',
    prompt:'Inspired by HireKit (Land-book) — Swiss editorial precision, clean newspaper grid, bold section rules, "Stop searching. Start landing." typographic confidence; Giacomo Dal Prà (Land-book) — Swiss newspaper double-column layout, editorial red rule, Playfair Display italic headers + mono labels; NN/G Outcome-Oriented Design article — clarity-first structure. Light theme. Newsprint #F8F5F0 + editorial red #C8331A + ink #0E0E0E. Playfair Display 900 (editorial serif) + IBM Plex Mono (labels/data). 5 screens: Today (newspaper masthead + 5-story digest + two-column split), Read (article view + pith summary 3-line essence + progress bar + highlight tool + annotations), Library (filter chips by topic + story cards + reading time + pith badge), Topics (8-topic block grid map + balance bars + trending), You (reading stats + streak calendar dots + topic balance bars + pith score + all-time highlights).',
    screens:5,source:'heartbeat',theme:'light',
  });
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({message:'feat: add PITH to gallery (heartbeat)',content:encoded,sha:gj.sha}));
  const p = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':putBody.length}},putBody);
  console.log(`✓ Gallery updated (${p.status}) — ${q.submissions.length} total entries`);
} catch(e) { console.log('✗ Gallery:', e.message); }
