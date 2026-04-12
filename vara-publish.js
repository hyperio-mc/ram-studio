// vara-publish.js — VARA hero + gallery update
// Theme: DARK — biomarker health intelligence
// Inspired by Superpower (godly.website) — dark navy, orange CTA, longevity tech

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
<title>VARA — know your biology</title>
  <!-- Open Graph / Twitter Card -->
  <meta name="description" content="Dark navy biomarker health intelligence. Health score tracking, 42-marker lab panels, trend analysis and AI-ranked interventions. A RAM design concept.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ram.zenbin.org/vara">
  <meta property="og:title" content="VARA — know your biology">
  <meta property="og:description" content="Dark navy biomarker health intelligence. Health score tracking, 42-marker lab panels, trend analysis and AI-ranked interventions. A RAM design concept.">
  <meta property="og:site_name" content="RAM Design Studio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="VARA — know your biology">
  <meta name="twitter:description" content="Dark navy biomarker health intelligence. Health score tracking, 42-marker lab panels, trend analysis and AI-ranked interventions. A RAM design concept.">
  <meta name="twitter:site" content="@ram_design">
  <meta name="theme-color" content="#FF5A30">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#080C18;--surface:#0F1526;--surfaceB:#192036;--border:#243050;
    --text:#ECE8F8;--muted:rgba(236,232,248,0.42);
    --orange:#FF5A30;--blue:#3DA8F5;--green:#2FC87A;--amber:#F0A830;--red:#F04848;--violet:#9B80F0;
  }
  html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif}
  body{min-height:100vh}

  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 48px;height:64px;
    background:rgba(8,12,24,0.9);backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-size:20px;font-weight:600;letter-spacing:0.04em;color:var(--text);text-decoration:none}
  .nav-logo span{color:var(--orange)}
  .nav-links{display:flex;gap:32px;list-style:none}
  .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;letter-spacing:0.04em;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{font-size:13px;font-weight:600;padding:10px 22px;border-radius:32px;background:var(--orange);color:#fff;text-decoration:none;transition:transform .2s,opacity .2s}
  .nav-cta:hover{transform:translateY(-1px);opacity:.88}

  .hero{
    padding:152px 48px 80px;max-width:1240px;margin:0 auto;
    display:grid;grid-template-columns:1.1fr 1fr;gap:80px;align-items:center;
  }
  .hero-eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:var(--blue);
    border:1px solid rgba(61,168,245,0.3);padding:5px 16px;border-radius:20px;margin-bottom:32px;
  }
  .hero-title{font-size:68px;font-weight:700;line-height:1.03;margin-bottom:24px;letter-spacing:-0.03em}
  .hero-title em{font-style:normal;color:var(--orange)}
  .hero-sub{font-size:18px;line-height:1.8;color:var(--muted);max-width:460px;margin-bottom:44px;font-weight:300}
  .hero-actions{display:flex;gap:16px;align-items:center}
  .btn-primary{font-size:14px;font-weight:600;padding:14px 32px;border-radius:32px;background:var(--orange);color:#fff;text-decoration:none;transition:transform .2s,opacity .2s}
  .btn-primary:hover{transform:translateY(-1px);opacity:.88}
  .btn-ghost{font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s}
  .btn-ghost:hover{color:var(--text)}

  /* Phone mockup */
  .phone{
    width:272px;height:556px;border-radius:44px;background:var(--surface);
    border:1px solid var(--border);
    box-shadow:0 40px 100px rgba(0,0,0,0.7),0 8px 24px rgba(0,0,0,0.5);
    overflow:hidden;margin:0 auto;
  }
  .pm{display:flex;flex-direction:column;height:100%;background:var(--bg);font-family:'Inter',sans-serif}
  .pm-sb{height:30px;background:var(--bg);display:flex;align-items:center;padding:0 14px;justify-content:space-between}
  .pm-sb-time{font-size:10px;font-weight:500;font-family:'JetBrains Mono',monospace}
  .pm-sb-icons{font-size:9px;color:var(--muted)}
  .pm-hd{padding:8px 16px 4px}
  .pm-hd-title{font-size:18px;font-weight:700;letter-spacing:-.02em}
  .pm-hd-sub{font-size:7.5px;letter-spacing:.12em;color:var(--muted);margin-top:2px}
  /* Score row */
  .pm-score{display:flex;align-items:center;gap:12px;padding:8px 14px 4px}
  .pm-score-ring{
    width:66px;height:66px;border-radius:50%;flex-shrink:0;
    background:rgba(47,200,122,.1);border:2px solid rgba(47,200,122,.3);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  }
  .pm-score-n{font-size:20px;font-weight:700;color:var(--green);font-family:'JetBrains Mono',monospace;line-height:1}
  .pm-score-lbl{font-size:6.5px;color:var(--muted);margin-top:2px}
  .pm-score-text h3{font-size:14px;font-weight:700;margin-bottom:3px}
  .pm-score-text p{font-size:9.5px;color:var(--muted);line-height:1.4}
  /* Flag */
  .pm-flag{
    margin:4px 12px;padding:6px 10px;border-radius:8px;
    background:rgba(255,90,48,.1);border:1px solid rgba(255,90,48,.3);
    font-size:8.5px;color:var(--orange);
  }
  /* Section */
  .pm-section{padding:5px 14px 3px;font-size:7px;letter-spacing:.12em;color:var(--muted)}
  /* Category bar */
  .pm-cat{margin:2px 12px;padding:5px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;gap:6px}
  .pm-cat-name{font-size:9.5px;font-weight:500;flex:1}
  .pm-cat-track{flex:2;height:4px;background:var(--surfaceB);border-radius:2px}
  .pm-cat-fill{height:4px;border-radius:2px}
  .pm-cat-score{font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;width:26px;text-align:right}
  /* CTA */
  .pm-cta{
    margin:8px 12px;padding:10px;border-radius:10px;background:var(--orange);
    font-size:10px;font-weight:600;color:#fff;text-align:center;
  }
  .pm-nav{
    margin-top:auto;height:50px;background:var(--surface);
    border-top:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-around;
  }
  .pm-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:7px;color:var(--muted)}
  .pm-nav-item.active{color:var(--orange)}
  .pm-nav-icon{font-size:14px;line-height:1}

  /* Biomarkers ticker */
  .biomarkers{
    padding:60px 48px;border-top:1px solid var(--border);
    background:var(--surface);overflow:hidden;
  }
  .biomarker-track{
    display:flex;gap:48px;
    animation:scroll 20s linear infinite;
    white-space:nowrap;width:max-content;
  }
  @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .biomarker-item{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
  .biomarker-item .dot{width:6px;height:6px;border-radius:50%}

  /* Stats */
  .stats{padding:80px 48px;max-width:1240px;margin:0 auto}
  .stats-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--blue);margin-bottom:16px}
  .stats-title{font-size:46px;font-weight:700;line-height:1.1;margin-bottom:56px;max-width:560px;letter-spacing:-.03em}
  .stats-title em{font-style:normal;color:var(--orange)}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
  .stat-n{font-size:56px;font-weight:700;color:var(--orange);line-height:1;font-family:'JetBrains Mono',monospace}
  .stat-t{font-size:14px;font-weight:500;margin-top:10px;margin-bottom:6px}
  .stat-d{font-size:13px;color:var(--muted);line-height:1.7;font-weight:300}

  /* Features */
  .features{padding:96px 48px;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .features-inner{max-width:1240px;margin:0 auto}
  .feat-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--violet);margin-bottom:12px}
  .feat-title{font-size:48px;font-weight:700;line-height:1.1;margin-bottom:56px;max-width:600px;letter-spacing:-.03em}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:18px;overflow:hidden}
  .feat-card{background:var(--bg);padding:36px 28px}
  .feat-icon{width:44px;height:44px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:20px}
  .feat-icon.g{background:rgba(47,200,122,.1)}
  .feat-icon.b{background:rgba(61,168,245,.1)}
  .feat-icon.v{background:rgba(155,128,240,.1)}
  .feat-card h3{font-size:18px;font-weight:600;margin-bottom:10px}
  .feat-card p{font-size:13px;line-height:1.75;color:var(--muted);font-weight:300}

  /* CTA */
  .cta{padding:120px 48px;text-align:center;max-width:680px;margin:0 auto}
  .cta h2{font-size:54px;font-weight:700;line-height:1.08;margin-bottom:20px;letter-spacing:-.03em}
  .cta h2 em{font-style:normal;color:var(--orange)}
  .cta p{font-size:17px;color:var(--muted);line-height:1.8;margin-bottom:44px;font-weight:300}
  .cta-btns{display:flex;gap:16px;justify-content:center}

  footer{padding:36px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:var(--surface)}
  .footer-logo{font-size:17px;font-weight:600;letter-spacing:.04em}
  .footer-logo span{color:var(--orange)}
  .footer-note{font-size:12px;color:var(--muted)}
  .footer-tag{font-size:10px;letter-spacing:.1em;color:var(--blue);padding:5px 12px;border:1px solid rgba(61,168,245,.3);border-radius:20px}

  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:120px 24px 64px}
    .phone{display:none}
    .stats-grid{grid-template-columns:1fr 1fr}
    .feat-grid{grid-template-columns:1fr}
    nav{padding:0 24px}
    .nav-links{display:none}
  }
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="#">VARA<span>.</span></a>
  <ul class="nav-links">
    <li><a href="#">How it works</a></li>
    <li><a href="#">Biomarkers</a></li>
    <li><a href="#">Pricing</a></li>
    <li><a href="#">For Teams</a></li>
  </ul>
  <a class="nav-cta" href="#">Get tested</a>
</nav>

<section class="hero">
  <div>
    <span class="hero-eyebrow">⬡ Health Intelligence</span>
    <h1 class="hero-title">Know your<br>biology.<br><em>All of it.</em></h1>
    <p class="hero-sub">100+ biomarkers. Every quarter. AI-powered insights that tell you exactly what to optimize — and what's already working.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="#">Get your first test — $17/mo</a>
      <a class="btn-ghost" href="#">See what we test →</a>
    </div>
  </div>
  <div>
    <div class="phone">
      <div class="pm">
        <div class="pm-sb">
          <span class="pm-sb-time">9:41</span>
          <span class="pm-sb-icons">● ◆ ▮</span>
        </div>
        <div class="pm-hd">
          <div class="pm-hd-title">Good morning, Elena.</div>
          <div class="pm-hd-sub">FRIDAY · MARCH 27 · LAST LABS: 8 DAYS AGO</div>
        </div>
        <div class="pm-score">
          <div class="pm-score-ring">
            <div class="pm-score-n">84</div>
            <div class="pm-score-lbl">Health Score</div>
          </div>
          <div class="pm-score-text">
            <h3>Your biology is strong.</h3>
            <p>3 markers need attention.<br>1 new flag vs last test.</p>
          </div>
        </div>
        <div class="pm-flag">⚑ Ferritin low (18 ng/mL) — new flag since January</div>
        <div class="pm-section">BIOMARKER CATEGORIES</div>
        <div class="pm-cat">
          <span class="pm-cat-name">Metabolic</span>
          <div class="pm-cat-track"><div class="pm-cat-fill" style="width:92%;background:var(--green)"></div></div>
          <span class="pm-cat-score" style="color:var(--green)">92</span>
        </div>
        <div class="pm-cat">
          <span class="pm-cat-name">Hormonal</span>
          <div class="pm-cat-track"><div class="pm-cat-fill" style="width:78%;background:var(--amber)"></div></div>
          <span class="pm-cat-score" style="color:var(--amber)">78</span>
        </div>
        <div class="pm-cat">
          <span class="pm-cat-name">Nutrients</span>
          <div class="pm-cat-track"><div class="pm-cat-fill" style="width:71%;background:var(--amber)"></div></div>
          <span class="pm-cat-score" style="color:var(--amber)">71</span>
        </div>
        <div class="pm-cat">
          <span class="pm-cat-name">Cardiovascular</span>
          <div class="pm-cat-track"><div class="pm-cat-fill" style="width:88%;background:var(--green)"></div></div>
          <span class="pm-cat-score" style="color:var(--green)">88</span>
        </div>
        <div class="pm-cta">Schedule next labs →</div>
        <div class="pm-nav">
          <div class="pm-nav-item active"><span class="pm-nav-icon">◎</span>Today</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">▤</span>Labs</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">◈</span>Trends</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">◇</span>Insight</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">◌</span>Profile</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="biomarkers">
  <div class="biomarker-track">
    ${['Testosterone','hs-CRP','HbA1c','Ferritin','Vitamin D','Cortisol','TSH','LDL-P','ApoB','IGF-1','DHEA-S','Homocysteine','Insulin','Omega-3 Index','Magnesium','Uric Acid','eGFR','ALT','SHBG','Free T3',
       'Testosterone','hs-CRP','HbA1c','Ferritin','Vitamin D','Cortisol','TSH','LDL-P','ApoB','IGF-1','DHEA-S','Homocysteine','Insulin','Omega-3 Index','Magnesium','Uric Acid','eGFR','ALT','SHBG','Free T3']
      .map(m => `<span class="biomarker-item"><span class="dot" style="background:var(--green)"></span>${m}</span>`).join('')}
  </div>
</div>

<section class="stats">
  <div class="stats-eyebrow">Why it matters</div>
  <h2 class="stats-title">Most disease is preventable.<br><em>Almost none is detected early.</em></h2>
  <div class="stats-grid">
    <div>
      <div class="stat-n">100+</div>
      <div class="stat-t">Biomarkers per test</div>
      <div class="stat-d">Metabolic, hormonal, cardiovascular, nutrients, immune, thyroid, kidney, liver — every system, every quarter.</div>
    </div>
    <div>
      <div class="stat-n">1,000+</div>
      <div class="stat-t">Conditions detectable early</div>
      <div class="stat-d">Most chronic conditions show up in your blood years before symptoms. VARA's AI flags deviations before they become diagnoses.</div>
    </div>
    <div>
      <div class="stat-n">4×</div>
      <div class="stat-t">More markers than standard labs</div>
      <div class="stat-d">A standard annual physical checks ~20 markers. VARA checks 100+. That's not more data — that's a completely different picture of your health.</div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-inner">
    <div class="feat-eyebrow">What VARA does</div>
    <h2 class="feat-title">Your biology,<br>rendered legible.</h2>
    <div class="feat-grid">
      <div class="feat-card">
        <div class="feat-icon g">◎</div>
        <h3>Today</h3>
        <p>A daily health intelligence briefing. Your overall score, category breakdown, active flags, and the single most important thing to address — all in one screen.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon b">◈</div>
        <h3>Trends</h3>
        <p>Track key markers across every test. Watch your ferritin climb after iron supplementation. See inflammation drop after you changed your diet. Biology is a time series.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon v">◇</div>
        <h3>Insight</h3>
        <p>Three ranked recommendations from your actual data — not generic wellness advice. Each action is backed by your specific biomarker trajectory and current literature.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="cta">
    <h2>Know your biology.<br><em>All of it.</em></h2>
    <p>Start with a comprehensive baseline. VARA tests 100+ biomarkers, builds your health profile, and starts tracking changes from day one. $17/month, cancel anytime. HSA/FSA eligible.</p>
    <div class="cta-btns">
      <a class="btn-primary" href="#">Get your first test</a>
      <a class="btn-ghost" href="#">See what we test →</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">VARA<span>.</span></div>
  <div class="footer-note">A RAM design concept · March 2026</div>
  <div class="footer-tag">dark theme</div>
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

fs.writeFileSync('vara-hero.html', hero);
console.log('✓ Saved vara-hero.html locally');

console.log('📤 Publishing to ZenBin...');
const body = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({ hostname:'zenbin.org', path:'/v1/pages/vara?overwrite=true', method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'} }, body);
  if (res.status===200||res.status===201) console.log('✓ Hero live at: https://ram.zenbin.org/vara');
  else console.log(`✗ ZenBin ${res.status}: ${res.body.slice(0,120)}`);
} catch(e) { console.log('✗ ZenBin:', e.message); }

console.log('📚 Updating gallery...');
try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  q.submissions = (q.submissions||[]).filter(s=>s.app_name!=='VARA');
  const now = new Date().toISOString();
  q.submissions.push({
    id:`heartbeat-vara-${Date.now()}`,status:'done',app_name:'VARA',
    tagline:'know your biology',archetype:'health-biomarker',
    design_url:'https://ram.zenbin.org/vara',mock_url:'https://ram.zenbin.org/vara-mock',
    submitted_at:now,published_at:now,credit:'RAM Design Heartbeat',
    prompt:'Inspired by Superpower.com (godly.website — "Unlock your new health intelligence", biomarker testing, dark navy + warm orange palette, longevity tech design language). Also informed by MÁLÀ PROJECT (siteinspire, 3 days ago — dramatic black entry screen, gold on black, Chinese restaurant brand). Dark navy #080C18 + Superpower orange #FF5A30 + electric blue #3DA8F5. Clinical data visualization: score rings, category progress bars, multi-test trend charts with target lines, ranked AI insight cards. JetBrains Mono for biomarker values. 5 screens: Today (health score ring + category bars + flag strip + CTA), Labs (marker rows with status indicators + filter chips), Trends (4-test dot line charts with target lines), Insight (3 ranked AI actions with evidence tags), Profile (score history bars + connected data sources + next test booking).',
    screens:5,source:'heartbeat',theme:'dark',
  });
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({message:'feat: add VARA to gallery (heartbeat)',content:encoded,sha:gj.sha}));
  const p = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':putBody.length}},putBody);
  console.log(`✓ Gallery updated (${p.status}) — ${q.submissions.length} total entries`);
} catch(e) { console.log('✗ Gallery:', e.message); }
