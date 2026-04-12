// nook-publish.js — NOOK hero + gallery update
// Theme: LIGHT — warm parchment home discovery
// Inspired by RAY (land-book.com) — "More than a building. It's a place."
// + Dawn (lapa.ninja) — warm emotional palette, human-first language

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
<title>NOOK — find where you belong</title>
  <!-- Open Graph / Twitter Card -->
  <meta name="description" content="Warm parchment home discovery app where search feels like browsing a design magazine. Feel scores, not just filters. A RAM design concept.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ram.zenbin.org/nook">
  <meta property="og:title" content="NOOK — find where you belong">
  <meta property="og:description" content="Warm parchment home discovery app where search feels like browsing a design magazine. Feel scores, not just filters. A RAM design concept.">
  <meta property="og:site_name" content="RAM Design Studio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="NOOK — find where you belong">
  <meta name="twitter:description" content="Warm parchment home discovery app where search feels like browsing a design magazine. Feel scores, not just filters. A RAM design concept.">
  <meta name="twitter:site" content="@ram_design">
  <meta name="theme-color" content="#C4653A">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#F7F0E8;--surface:#FEFCF9;--card:#FBF6F0;
    --terra:#C4653A;--sage:#6B9B7A;--gold:#B8924A;
    --ink:#1C1510;--muted:rgba(28,21,16,0.42);
    --border:rgba(28,21,16,0.10);
    --gv:rgba(196,101,58,0.08);--gs:rgba(107,155,122,0.10);
  }

  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--ink);font-family:'DM Sans',sans-serif;line-height:1.5;overflow-x:hidden}

  /* ─── NAV ─── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px}
  .nav-logo{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:22px;color:var(--ink);text-decoration:none}
  .nav-links{display:flex;gap:36px;list-style:none}
  .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;font-weight:500;letter-spacing:.02em}
  .nav-cta{background:var(--terra);color:#fff;border:none;padding:10px 22px;border-radius:22px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif}

  /* ─── HERO ─── */
  .hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center;padding:80px 0 0;overflow:hidden}
  .hero-left{padding:0 64px 64px}
  .hero-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--terra);margin-bottom:20px;font-weight:600}
  .hero-title{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:68px;line-height:1.0;margin-bottom:28px;color:var(--ink)}
  .hero-sub{font-size:18px;color:var(--muted);line-height:1.8;max-width:480px;margin-bottom:44px;font-weight:300}
  .hero-btns{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .btn-primary{background:var(--terra);color:#fff;border:none;padding:14px 30px;border-radius:28px;font-size:15px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-block}
  .btn-ghost{border:1.5px solid var(--border);color:var(--ink);padding:13px 28px;border-radius:28px;font-size:15px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-block;background:transparent}
  .hero-right{height:100vh;position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;padding-bottom:0}

  /* Phone mockup */
  .phone-wrap{position:relative;width:320px;transform:translateY(40px)}
  .phone{width:320px;height:660px;background:var(--surface);border-radius:44px;overflow:hidden;border:6px solid var(--ink);box-shadow:0 40px 80px rgba(28,21,16,0.18),0 0 0 1px rgba(28,21,16,0.06);position:relative}
  .phone-notch{width:100px;height:26px;background:var(--ink);border-radius:0 0 18px 18px;position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:2}

  /* Phone screen content */
  .p-screen{padding:36px 18px 18px;height:100%;background:var(--bg);overflow:hidden}
  .p-greeting{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:22px;line-height:1.2;margin-bottom:4px;color:var(--ink)}
  .p-sub{font-size:10px;color:var(--muted);margin-bottom:16px}
  .p-feel-card{background:rgba(196,101,58,0.1);border-radius:12px;padding:10px 12px;margin-bottom:14px}
  .p-feel-q{font-size:10px;font-weight:500;color:var(--ink);margin-bottom:8px}
  .p-chips{display:flex;gap:6px;flex-wrap:wrap}
  .chip{padding:4px 10px;border-radius:10px;font-size:9px;font-weight:500;border:1px solid var(--border);background:var(--card);color:var(--ink)}
  .chip.active{background:var(--terra);color:#fff;border-color:var(--terra)}
  .p-section{font-size:8px;letter-spacing:.1em;color:var(--muted);font-weight:600;margin-bottom:8px;text-transform:uppercase}
  .p-card{background:var(--surface);border-radius:10px;border:1px solid var(--border);overflow:hidden;margin-bottom:10px}
  .p-card-photo{height:70px;display:flex;align-items:flex-end;padding:6px 10px;position:relative}
  .p-card-photo.t{background:linear-gradient(135deg,#8B5A3A 0%,#C4653A 100%)}
  .p-card-photo.s{background:linear-gradient(135deg,#4A7A5A 0%,#6B9B7A 100%)}
  .p-photo-tag{background:rgba(255,255,255,0.88);border-radius:8px;padding:3px 8px;font-size:8px;font-weight:600;color:var(--ink)}
  .p-photo-price{margin-left:auto;font-size:10px;font-weight:600;color:#fff}
  .p-card-body{padding:7px 10px}
  .p-card-name{font-size:11px;font-weight:600;color:var(--ink)}
  .p-card-meta{font-size:9px;color:var(--muted);margin-top:2px}

  /* Floating cards around phone */
  .float-card{position:absolute;background:var(--surface);border-radius:16px;padding:14px 18px;border:1px solid var(--border);box-shadow:0 12px 40px rgba(28,21,16,0.10)}
  .fc-score{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:28px;color:var(--terra)}
  .fc-label{font-size:11px;color:var(--muted);margin-top:2px;font-weight:400}
  .fc-tag{font-size:10px;font-weight:600;color:var(--terra);margin-top:6px;text-transform:uppercase;letter-spacing:.06em}

  /* ─── EDITORIAL STRIP ─── */
  .editorial{padding:0;background:var(--terra);overflow:hidden}
  .editorial-inner{display:flex;gap:0}
  .editorial-panel{flex:1;padding:72px 56px}
  .editorial-panel.pale{background:var(--surface);border-right:1px solid var(--border)}
  .ep-num{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:80px;line-height:1;color:var(--terra);margin-bottom:8px}
  .ep-num.white{color:rgba(255,255,255,0.5)}
  .ep-title{font-family:'Fraunces',serif;font-style:italic;font-size:26px;font-weight:700;line-height:1.25;margin-bottom:12px}
  .ep-title.white{color:#fff}
  .ep-desc{font-size:14px;line-height:1.8;color:var(--muted);font-weight:300}
  .ep-desc.white{color:rgba(255,255,255,0.7)}

  /* ─── FEEL SECTION ─── */
  .feel-section{padding:96px 48px;background:var(--surface)}
  .feel-inner{max-width:1240px;margin:0 auto}
  .feel-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--terra);margin-bottom:14px;font-weight:600}
  .feel-title{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:48px;line-height:1.15;margin-bottom:20px;max-width:560px}
  .feel-sub{font-size:17px;color:var(--muted);line-height:1.8;max-width:560px;margin-bottom:60px;font-weight:300}
  .feel-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:20px;overflow:hidden}
  .feel-card{background:var(--bg);padding:32px 24px}
  .feel-score{font-family:'Fraunces',serif;font-style:italic;font-weight:700;font-size:44px;line-height:1;margin-bottom:10px}
  .feel-card:nth-child(1) .feel-score{color:var(--gold)}
  .feel-card:nth-child(2) .feel-score{color:var(--sage)}
  .feel-card:nth-child(3) .feel-score{color:var(--terra)}
  .feel-card:nth-child(4) .feel-score{color:#9B6B9A}
  .feel-card:nth-child(5) .feel-score{color:#4A8CB0}
  .feel-card h3{font-family:'DM Sans',sans-serif;font-size:14px;margin-bottom:8px;font-weight:600;color:var(--ink)}
  .feel-card p{font-size:13px;line-height:1.75;color:var(--muted);font-weight:300}

  /* ─── QUOTE ─── */
  .quote-section{padding:120px 48px;text-align:center;background:var(--bg)}
  .quote-inner{max-width:780px;margin:0 auto}
  .blockquote{font-family:'Fraunces',serif;font-style:italic;font-size:38px;line-height:1.3;color:var(--ink);font-weight:400;margin-bottom:28px}
  .blockquote em{color:var(--terra)}
  .quote-attr{font-size:13px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-weight:500}

  /* ─── CTA ─── */
  .cta-section{padding:120px 48px;background:var(--terra);text-align:center}
  .cta-inner{max-width:680px;margin:0 auto}
  .cta-section h2{font-family:'Fraunces',serif;font-style:italic;font-size:54px;color:#FEFCF9;line-height:1.1;margin-bottom:22px;font-weight:700}
  .cta-section p{font-size:18px;color:rgba(254,252,249,0.72);line-height:1.8;margin-bottom:44px;font-weight:300}
  .btn-pale{background:var(--surface);color:var(--terra);padding:16px 36px;border-radius:30px;font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-block}

  footer{padding:36px 48px;background:var(--bg);border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
  .footer-logo{font-family:'Fraunces',serif;font-style:italic;font-size:18px;font-weight:700}
  .footer-note{font-size:12px;color:var(--muted)}
  .footer-tag{font-size:10px;letter-spacing:.1em;color:var(--terra);padding:5px 12px;border:1px solid rgba(196,101,58,.3);border-radius:20px;font-weight:500}

  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:100px 24px 64px}
    .hero-right{height:480px}
    .editorial-inner{flex-direction:column}
    .feel-grid{grid-template-columns:1fr 1fr}
    nav{padding:0 24px}
    .nav-links{display:none}
    .hero-left{padding:0 0 48px}
    .hero-title{font-size:44px}
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">Nook</a>
  <ul class="nav-links">
    <li><a href="#">Browse</a></li>
    <li><a href="#">How it works</a></li>
    <li><a href="#">For landlords</a></li>
    <li><a href="#">Pricing</a></li>
  </ul>
  <button class="nav-cta">Find your nook</button>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">Home discovery — reimagined</div>
    <h1 class="hero-title">More than<br>a building.<br><em>It's a place.</em></h1>
    <p class="hero-sub">Nook matches you to homes by how they feel — not just what they cost. Warm or airy, quiet or social, full of character or beautifully bare. Your feel profile, your home.</p>
    <div class="hero-btns">
      <a class="btn-primary" href="#">Find where you belong</a>
      <a class="btn-ghost" href="#">See how it works →</a>
    </div>
  </div>

  <div class="hero-right">
    <!-- Floating score card -->
    <div class="float-card" style="left:4%;top:22%">
      <div class="fc-score">94</div>
      <div class="fc-label">feel score</div>
      <div class="fc-tag">✦ perfect match</div>
    </div>

    <!-- Floating neighbourhood card -->
    <div class="float-card" style="right:2%;top:35%;max-width:170px">
      <div style="font-size:11px;font-weight:600;margin-bottom:4px">Dalston, E8</div>
      <div style="font-size:10px;color:rgba(28,21,16,0.5);line-height:1.6">Quiet street · Period<br>features · 12 min city</div>
    </div>

    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="p-screen">
          <div class="p-greeting">Good morning,<br>Aiko.</div>
          <div class="p-sub">Friday · March 27 · Dalston</div>
          <div class="p-feel-card">
            <div class="p-feel-q">How do you want to feel at home?</div>
            <div class="p-chips">
              <span class="chip active">Cosy</span>
              <span class="chip">Airy</span>
              <span class="chip">Minimal</span>
              <span class="chip">Social</span>
            </div>
          </div>
          <div class="p-section">Picked for you · 3 matches</div>
          <div class="p-card">
            <div class="p-card-photo t">
              <span class="p-photo-tag">✦ Perfect feel</span>
              <span class="p-photo-price">£1,850 /mo</span>
            </div>
            <div class="p-card-body">
              <div class="p-card-name">Marlowe Flat</div>
              <div class="p-card-meta">1 bed · Dalston, E8 · 94 feel score</div>
            </div>
          </div>
          <div class="p-card">
            <div class="p-card-photo s">
              <span class="p-photo-tag">Airy + Quiet</span>
              <span class="p-photo-price">£1,320 /mo</span>
            </div>
            <div class="p-card-body">
              <div class="p-card-name">Linden Studio</div>
              <div class="p-card-meta">Studio · London Fields, E8 · 88 feel score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Editorial strip -->
<section class="editorial">
  <div class="editorial-inner">
    <div class="editorial-panel pale">
      <div class="ep-num">01</div>
      <div class="ep-title">Your feel profile</div>
      <div class="ep-desc">Answer five questions about how you want to live. Light, quiet, space, character, walkability — Nook builds your feel fingerprint and matches homes to it.</div>
    </div>
    <div class="editorial-panel">
      <div class="ep-num white">02</div>
      <div class="ep-title white">Every home scored</div>
      <div class="ep-desc white">Each listing gets a feel score from 0–100, broken down across five dimensions — not just square footage and price. You see the whole picture.</div>
    </div>
    <div class="editorial-panel pale">
      <div class="ep-num">03</div>
      <div class="ep-title">Viewings arranged</div>
      <div class="ep-desc">Shortlist, compare and book viewings in one place. Notes, reminders and a shared shortlist if you're searching with a partner.</div>
    </div>
  </div>
</section>

<!-- Feel score breakdown -->
<section class="feel-section">
  <div class="feel-inner">
    <div class="feel-eyebrow">The feel score</div>
    <h2 class="feel-title">Five dimensions of<br><em>home happiness</em></h2>
    <p class="feel-sub">Every Nook listing is scored across five characteristics that actually affect how you feel in a home day to day.</p>
    <div class="feel-grid">
      <div class="feel-card">
        <div class="feel-score">☀</div>
        <h3>Light</h3>
        <p>Orientation, window size and floor height. The one thing you can't change about a flat.</p>
      </div>
      <div class="feel-card">
        <div class="feel-score">◑</div>
        <h3>Quiet</h3>
        <p>Street noise, floor level, glazing quality. Whether you'll hear the bus at 6am.</p>
      </div>
      <div class="feel-card">
        <div class="feel-score">⊡</div>
        <h3>Space</h3>
        <p>Not just square metres — ceiling height, storage, how the rooms flow into each other.</p>
      </div>
      <div class="feel-card">
        <div class="feel-score">✦</div>
        <h3>Character</h3>
        <p>Period features, material quality, the things that make a place feel like somewhere.</p>
      </div>
      <div class="feel-card">
        <div class="feel-score">⊙</div>
        <h3>Walkability</h3>
        <p>Tube time, nearest park, coffee on the corner. The neighbourhood as daily infrastructure.</p>
      </div>
    </div>
  </div>
</section>

<!-- Quote -->
<section class="quote-section">
  <div class="quote-inner">
    <p class="blockquote">"Most people don't know why they loved a flat until they've already signed the lease. <em>Nook tells you before you even visit.</em>"</p>
    <div class="quote-attr">RAM Design Concept · March 2026</div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <h2>Find where<br>you belong.</h2>
    <p>Your feel profile takes three minutes. Nook will find your home.</p>
    <a class="btn-pale" href="#">Start your search →</a>
  </div>
</section>

<footer>
  <div class="footer-logo">Nook</div>
  <div class="footer-note">A RAM design concept · March 2026</div>
  <div class="footer-tag">light theme</div>
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

fs.writeFileSync('nook-hero.html', hero);
console.log('✓ Saved nook-hero.html locally');

// ZenBin
console.log('📤 Publishing to ZenBin...');
const body = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({ hostname:'zenbin.org', path:'/v1/pages/nook?overwrite=true', method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'} }, body);
  if (res.status===200||res.status===201) console.log('✓ Hero live at: https://ram.zenbin.org/nook');
  else console.log(`✗ ZenBin ${res.status}: ${res.body.slice(0,120)}`);
} catch(e) { console.log('✗ ZenBin:', e.message); }

// Gallery
console.log('📚 Updating gallery...');
try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  if (Array.isArray(q.submissions)) q.submissions = q.submissions.filter(s=>s.app_name!=='NOOK');
  const now = new Date().toISOString();
  q.submissions.push({
    id:`heartbeat-nook-${Date.now()}`,status:'done',app_name:'NOOK',
    tagline:'find where you belong',archetype:'home-discovery',
    design_url:'https://ram.zenbin.org/nook',mock_url:'https://ram.zenbin.org/nook-mock',
    submitted_at:now,published_at:now,credit:'RAM Design Heartbeat',
    prompt:'Inspired by RAY (land-book.com) — "More than a building. It\'s a place." warm parchment library interiors, Japanese-minimal editorial design; Dawn (lapa.ninja) — warm orange/golden emotional palette, human-first language in health/wellness; Mike Matas portfolio (godly.website) — ultra-clean device UI, show-don\'t-tell product presentation. Light theme. Warm parchment home discovery app (bg #F7F0E8 + terracotta #C4653A + sage #6B9B7A). Fraunces italic organic serif for headlines + DM Sans for UI. 5 screens: Home (feel prompt + today\'s picks), Browse (filter chips + property list), Listing detail (feel score breakdown bars), Saved (shortlist + viewing reminders), Profile (feel preferences + move timeline + match quality). Key innovation: "feel score" replaces cold property filters with 5 lifestyle dimensions (Light, Quiet, Space, Character, Walkability).',
    screens:5,source:'heartbeat',theme:'light',
  });
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({message:'feat: add NOOK to gallery (heartbeat)',content:encoded,sha:gj.sha}));
  const p = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':putBody.length}},putBody);
  console.log(`✓ Gallery updated (${p.status}) — ${q.submissions.length} total entries`);
} catch(e) { console.log('✗ Gallery:', e.message); }
