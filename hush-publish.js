// hush-publish.js — HUSH hero + gallery update

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config  = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const REPO    = config.GITHUB_REPO;

const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HUSH — sleep intelligence for people who overthink</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#07080D;--surface:#0F1117;--surfaceB:#171B26;--border:#1E2335;
    --text:#E8E6F0;--muted:rgba(232,230,240,0.38);
    --violet:#8B7FFF;--amber:#F0A040;--green:#3DD68C;--rose:#FF6B8A;--indigo:#4F6EFF;
  }
  html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif}
  body{min-height:100vh}

  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 48px;height:64px;
    background:rgba(7,8,13,0.88);backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-family:'Playfair Display',serif;font-size:22px;letter-spacing:0.16em;color:var(--text);text-decoration:none}
  .nav-links{display:flex;gap:32px;list-style:none}
  .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;letter-spacing:0.05em}
  .nav-links a:hover{color:var(--text)}
  .nav-badge{font-size:11px;letter-spacing:0.08em;padding:6px 16px;border-radius:20px;border:1px solid var(--violet);color:var(--violet);text-decoration:none}

  .hero{
    padding:160px 48px 96px;max-width:1280px;margin:0 auto;
    display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;
  }
  .hero-label{
    display:inline-block;font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;
    color:var(--violet);border:1px solid rgba(139,127,255,0.3);padding:5px 14px;border-radius:20px;margin-bottom:28px;
  }
  .hero-title{font-family:'Playfair Display',serif;font-size:60px;line-height:1.1;margin-bottom:24px}
  .hero-title em{font-style:italic;color:var(--violet)}
  .hero-sub{font-size:18px;line-height:1.75;color:var(--muted);max-width:440px;margin-bottom:40px}
  .hero-actions{display:flex;gap:16px;align-items:center}
  .btn-primary{
    font-size:14px;font-weight:500;letter-spacing:0.05em;padding:14px 32px;
    border-radius:32px;background:var(--violet);color:#fff;text-decoration:none;
    transition:opacity 0.2s,transform 0.2s;
  }
  .btn-primary:hover{opacity:0.85;transform:translateY(-1px)}
  .btn-ghost{font-size:14px;color:var(--muted);text-decoration:none}
  .btn-ghost:hover{color:var(--text)}

  .phone{
    width:260px;height:536px;border-radius:38px;background:var(--surface);
    border:1px solid var(--border);box-shadow:0 40px 100px rgba(0,0,0,0.6),0 0 60px rgba(139,127,255,0.08);
    overflow:hidden;margin:0 auto;
  }
  .ps{display:flex;flex-direction:column;height:100%;background:var(--bg)}
  .ps-bar{height:36px;background:var(--bg);display:flex;align-items:center;padding:0 14px;justify-content:space-between}
  .ps-bar-time{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text)}
  .ps-top{padding:10px 14px 8px;border-bottom:1px solid var(--border)}
  .ps-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--text)}
  .ps-sub{font-size:8px;letter-spacing:0.1em;color:var(--muted)}
  .ps-window{background:var(--surface);margin:10px 12px 0;border-radius:10px;padding:10px;border:1px solid var(--border)}
  .ps-win-row{display:flex;justify-content:space-between;align-items:flex-end}
  .ps-win-label{font-size:8px;letter-spacing:0.08em;color:var(--muted)}
  .ps-win-val{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700}
  .ps-countdown{background:var(--surface);margin:8px 12px 0;border-radius:10px;padding:10px 12px;border:1px solid var(--border)}
  .ps-cnt-label{font-size:8px;letter-spacing:0.1em;color:var(--muted);margin-bottom:4px}
  .ps-cnt-num{font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:700;color:var(--text);line-height:1}
  .ps-cnt-sub{font-size:8px;color:var(--muted);margin-top:4px}
  .ps-bar-track{height:3px;background:var(--surfaceB);border-radius:2px;margin-top:6px}
  .ps-bar-fill{height:3px;border-radius:2px;background:var(--violet);width:61%}
  .ps-conds{background:var(--surface);margin:8px 12px 0;border-radius:10px;padding:10px 12px;border:1px solid var(--border)}
  .ps-cond-row{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:9px}
  .ps-cond-icon{font-size:11px}
  .ps-cond-label{flex:1;color:var(--muted)}
  .ps-cond-val{font-family:'JetBrains Mono',monospace;font-weight:500}
  .ps-cta{margin:10px 12px 0;background:var(--violet);border-radius:10px;padding:10px;text-align:center;font-size:11px;font-weight:600;color:#fff}
  .ps-nav{
    margin-top:auto;height:52px;background:var(--surface);border-top:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-around;padding:0 4px;
  }
  .ps-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:7px;color:var(--muted);padding:4px 6px;border-radius:7px}
  .ps-nav-item.active{color:var(--violet);background:rgba(139,127,255,0.12)}
  .ps-nav-icon{font-size:14px;line-height:1}

  .stats{padding:48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .stats-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:40px}
  .stat-n{font-family:'JetBrains Mono',monospace;font-size:42px;color:var(--text);line-height:1}
  .stat-n em{font-style:normal;color:var(--violet)}
  .stat-label{font-size:13px;color:var(--muted);line-height:1.6;margin-top:6px}

  .features{padding:96px 48px;max-width:1280px;margin:0 auto}
  .feat-label{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--amber);margin-bottom:16px}
  .feat-title{font-family:'Playfair Display',serif;font-size:44px;line-height:1.2;max-width:560px;margin-bottom:64px}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden}
  .feat-card{background:var(--surface);padding:40px 32px}
  .feat-icon{width:48px;height:48px;border-radius:12px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;font-size:22px}
  .feat-icon.violet{background:rgba(139,127,255,0.12)}
  .feat-icon.amber{background:rgba(240,160,64,0.12)}
  .feat-icon.green{background:rgba(61,214,140,0.12)}
  .feat-card h3{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:10px}
  .feat-card p{font-size:14px;line-height:1.75;color:var(--muted)}

  .science{padding:96px 48px;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .sci-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .sci-quote{font-family:'Playfair Display',serif;font-size:32px;line-height:1.45;font-style:italic}
  .sci-cite{display:block;margin-top:24px;font-size:13px;font-style:normal;color:var(--muted);letter-spacing:0.06em}
  .sci-facts{display:flex;flex-direction:column;gap:20px}
  .sci-fact{padding:24px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}
  .sci-fact-n{font-family:'JetBrains Mono',monospace;font-size:32px;color:var(--violet);margin-bottom:6px}
  .sci-fact-text{font-size:14px;line-height:1.7;color:var(--muted)}

  .cta-wrap{padding:120px 48px;text-align:center;max-width:760px;margin:0 auto}
  .cta-title{font-family:'Playfair Display',serif;font-size:52px;line-height:1.15;margin-bottom:20px}
  .cta-sub{font-size:17px;color:var(--muted);line-height:1.75;margin-bottom:40px}
  .cta-btns{display:flex;gap:16px;justify-content:center}

  footer{
    padding:40px 48px;border-top:1px solid var(--border);
    display:flex;justify-content:space-between;align-items:center;background:var(--surface);
  }
  .footer-logo{font-family:'Playfair Display',serif;font-size:16px;letter-spacing:0.14em}
  .footer-note{font-size:12px;color:var(--muted)}
  .footer-tag{font-size:10px;letter-spacing:0.1em;color:var(--violet);padding:5px 12px;border:1px solid rgba(139,127,255,0.4);border-radius:20px}

  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:120px 24px 64px}
    .phone{display:none}
    .stats-inner{grid-template-columns:1fr 1fr}
    .feat-grid{grid-template-columns:1fr}
    .sci-inner{grid-template-columns:1fr}
    nav{padding:0 24px}
    .nav-links{display:none}
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">HUSH</a>
  <ul class="nav-links">
    <li><a href="#">Tonight</a></li>
    <li><a href="#">Science</a></li>
    <li><a href="#">Journal</a></li>
    <li><a href="#">About</a></li>
  </ul>
  <a class="nav-badge" href="#">Early Access</a>
</nav>

<section class="hero">
  <div>
    <span class="hero-label">Sleep Intelligence</span>
    <h1 class="hero-title">Quiet your mind.<br>Trust your <em>sleep</em>.</h1>
    <p class="hero-sub">
      Evidence-based sleep tracking for people who lie awake thinking about being awake.
      CBT-I protocols, smart environment sensing, nightly journalling — no gimmicks.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="#">Join Early Access</a>
      <a class="btn-ghost" href="#">Read the science →</a>
    </div>
  </div>
  <div>
    <div class="phone">
      <div class="ps">
        <div class="ps-bar">
          <span class="ps-bar-time">9:41</span>
          <span style="font-size:10px;color:var(--muted)">● ◆ ▮</span>
        </div>
        <div class="ps-top">
          <div class="ps-title">Tonight</div>
          <div class="ps-sub">THURSDAY · MARCH 26</div>
        </div>
        <div class="ps-window">
          <div class="ps-win-row">
            <div>
              <div class="ps-win-label">🌙 SLEEP</div>
              <div class="ps-win-val" style="color:var(--violet)">10:30 PM</div>
            </div>
            <div style="text-align:right">
              <div class="ps-win-label">⏰ WAKE</div>
              <div class="ps-win-val" style="color:var(--amber)">6:30 AM</div>
            </div>
          </div>
        </div>
        <div class="ps-countdown">
          <div class="ps-cnt-label">WIND-DOWN TIMER</div>
          <div class="ps-cnt-num">47:32</div>
          <div class="ps-cnt-sub">minutes until sleep window</div>
          <div class="ps-bar-track"><div class="ps-bar-fill"></div></div>
        </div>
        <div class="ps-conds">
          <div class="ps-cond-row">
            <span class="ps-cond-icon">🌡</span>
            <span class="ps-cond-label">Temperature</span>
            <span class="ps-cond-val" style="color:var(--green)">18.5°C</span>
          </div>
          <div class="ps-cond-row">
            <span class="ps-cond-icon">💧</span>
            <span class="ps-cond-label">Humidity</span>
            <span class="ps-cond-val" style="color:var(--green)">52%</span>
          </div>
          <div class="ps-cond-row">
            <span class="ps-cond-icon">🔇</span>
            <span class="ps-cond-label">Noise level</span>
            <span class="ps-cond-val" style="color:var(--green)">34 dB</span>
          </div>
          <div class="ps-cond-row" style="margin-bottom:0">
            <span class="ps-cond-icon">💡</span>
            <span class="ps-cond-label">Light</span>
            <span class="ps-cond-val" style="color:var(--amber)">8 lux</span>
          </div>
        </div>
        <div class="ps-cta">Start Sleep Mode</div>
        <div class="ps-nav">
          <div class="ps-nav-item active"><span class="ps-nav-icon">🌙</span>Tonight</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">📊</span>Sleep</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">✏️</span>Journal</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">📈</span>Trends</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">⚙️</span>Profile</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="stats-inner">
    <div>
      <div class="stat-n">1<em>in3</em></div>
      <div class="stat-label">adults don't get enough sleep — the most common health problem you're not treating</div>
    </div>
    <div>
      <div class="stat-n">81<em>%</em></div>
      <div class="stat-label">of people with insomnia have untreated anxiety that's driving the problem</div>
    </div>
    <div>
      <div class="stat-n">CBT<em>-I</em></div>
      <div class="stat-label">recommended first-line treatment by WHO — more effective than sleeping pills, no side effects</div>
    </div>
    <div>
      <div class="stat-n">3<em>wks</em></div>
      <div class="stat-label">average time for meaningful sleep improvement with consistent CBT-I practice</div>
    </div>
  </div>
</section>

<section class="features">
  <div class="feat-label">What HUSH does</div>
  <h2 class="feat-title">Sleep science, without the noise</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon violet">🌙</div>
      <h3>Sleep Window</h3>
      <p>HUSH calculates your personal sleep pressure and circadian rhythm to find your optimal sleep and wake times. No generic 8-hour advice.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon amber">✏️</div>
      <h3>Nightly Journal</h3>
      <p>Two-minute pre-sleep ritual: mood, factors, one thing on your mind, one good thing. Correlates your state with next-night quality.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon green">📈</div>
      <h3>Pattern Intelligence</h3>
      <p>See exactly what lifts and lowers your sleep score. Exercise, alcohol, screen time, stress — charted against real outcome data from your nights.</p>
    </div>
  </div>
</section>

<section class="science">
  <div class="sci-inner">
    <blockquote class="sci-quote">
      "The sleeping brain is not resting. It's doing the most important work it will ever do."
      <cite>— HUSH Science Brief, 2026</cite>
    </blockquote>
    <div class="sci-facts">
      <div class="sci-fact">
        <div class="sci-fact-n">23%</div>
        <div class="sci-fact-text">reduction in anxiety symptoms after 3 weeks of sleep journalling combined with CBT-I sleep restriction techniques.</div>
      </div>
      <div class="sci-fact">
        <div class="sci-fact-n">18°C</div>
        <div class="sci-fact-text">The ideal bedroom temperature for sleep onset — 2°C below most people's default. HUSH monitors and reminds.</div>
      </div>
      <div class="sci-fact">
        <div class="sci-fact-n">47 min</div>
        <div class="sci-fact-text">Average time HUSH users reduce sleep latency (time to fall asleep) within the first month.</div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="cta-wrap">
    <h2 class="cta-title">Stop counting sheep.<br>Start understanding sleep.</h2>
    <p class="cta-sub">Join the early access list. First 500 users get lifetime Pro — no subscription, ever.</p>
    <div class="cta-btns">
      <a class="btn-primary" href="#">Join Early Access</a>
      <a class="btn-ghost" href="#">Read the science →</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">HUSH</div>
  <div class="footer-note">A RAM design concept · March 2026</div>
  <div class="footer-tag">dark theme</div>
</footer>
</body>
</html>`;

function req(opts, body) {
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

// Save locally
fs.writeFileSync('hush-hero.html', hero);
console.log('✓ Saved hush-hero.html locally');

// ZenBin publish
console.log('📤 Publishing hero to ZenBin...');
const body = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({
    hostname: 'zenbin.org', path: '/v1/pages/hush?overwrite=true', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': body.length, 'X-Subdomain': 'ram' },
  }, body);
  if (res.status === 200 || res.status === 201) {
    console.log('✓ Hero live at: https://ram.zenbin.org/hush');
  } else {
    console.log(`✗ ZenBin ${res.status}: ${res.body.slice(0, 120)}`);
    console.log('  hush-hero.html saved locally');
  }
} catch (e) { console.log('✗ ZenBin error:', e.message); }

// Gallery update
console.log('📚 Updating gallery...');
try {
  const apiBase = `https://api.github.com/repos/${REPO}/contents/queue.json`;
  const headers = {
    'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  const g = await req({ hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'GET', headers });
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content, 'base64').toString('utf8'));
  if (!q.submissions) q.submissions = [];
  q.submissions = q.submissions.filter(s => s.app_name !== 'HUSH');

  const now = new Date().toISOString();
  q.submissions.push({
    id: `heartbeat-hush-${Date.now()}`,
    status: 'done',
    app_name: 'HUSH',
    tagline: 'sleep intelligence for people who overthink',
    archetype: 'sleep-wellness',
    design_url: 'https://ram.zenbin.org/hush',
    mock_url: 'https://ram.zenbin.org/hush-mock',
    submitted_at: now, published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: 'Inspired by Dawn (lapa.ninja — evidence-based sleep AI) and siteinspire typographic trend (Playfair Display emotional headers). Dark midnight violet palette (#07080D, #8B7FFF violet, #F0A040 amber). CBT-I sleep intelligence app: Tonight wind-down timer + room conditions, Last Night quality score + phase bars, nightly journal with mood/factors, Trends with correlation insights, Profile with smart alarm and connected sources.',
    screens: 5, source: 'heartbeat', theme: 'dark',
  });
  q.updated_at = now;

  const encoded = Buffer.from(JSON.stringify(q, null, 2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({ message: 'feat: add HUSH to gallery (heartbeat)', content: encoded, sha: gj.sha }));
  const p = await req({
    hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'PUT',
    headers: { ...headers, 'Content-Length': putBody.length }
  }, putBody);
  console.log(`✓ Gallery updated (HTTP ${p.status}) — ${q.submissions.length} total entries`);
} catch (e) { console.log('✗ Gallery error:', e.message); }
