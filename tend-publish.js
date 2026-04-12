// tend-publish.js — TEND hero + gallery update
// Theme: DARK — organic forest palette

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
<title>TEND — presence without performance</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0B0C09;--surface:#131510;--surfaceB:#1A1D16;--border:#252A1E;
    --text:#E4E0D6;--muted:rgba(228,224,214,0.42);
    --sage:#6B9A72;--amber:#C49040;--rose:#C47076;--bark:#9B7A54;--night:#1A2018;
  }
  html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif}
  body{min-height:100vh}

  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 48px;height:64px;
    background:rgba(11,12,9,0.88);backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{
    font-family:'Playfair Display',serif;font-size:20px;
    letter-spacing:0.06em;color:var(--text);text-decoration:none;
  }
  .nav-links{display:flex;gap:32px;list-style:none}
  .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;letter-spacing:0.04em;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{
    font-size:13px;font-weight:500;padding:8px 20px;
    border-radius:24px;border:1px solid var(--sage);
    color:var(--sage);text-decoration:none;transition:background .2s,color .2s;
  }
  .nav-cta:hover{background:var(--sage);color:#fff}

  .hero{
    padding:160px 48px 96px;max-width:1200px;margin:0 auto;
    display:grid;grid-template-columns:1.1fr 1fr;gap:80px;align-items:center;
  }
  .hero-eyebrow{
    display:inline-block;font-size:10px;font-weight:500;letter-spacing:0.2em;
    text-transform:uppercase;color:var(--sage);
    border:1px solid rgba(107,154,114,0.3);padding:5px 14px;border-radius:20px;margin-bottom:32px;
  }
  .hero-title{
    font-family:'Playfair Display',serif;font-size:64px;
    line-height:1.08;margin-bottom:28px;font-weight:400;
  }
  .hero-title em{font-style:italic;color:var(--sage)}
  .hero-sub{font-size:18px;line-height:1.8;color:var(--muted);max-width:460px;margin-bottom:48px;font-weight:300}
  .hero-actions{display:flex;gap:20px;align-items:center}
  .btn-primary{
    font-size:14px;font-weight:500;padding:14px 32px;border-radius:32px;
    background:var(--sage);color:#fff;text-decoration:none;
    transition:transform .2s,opacity .2s;letter-spacing:0.02em;
  }
  .btn-primary:hover{transform:translateY(-1px);opacity:.88}
  .btn-ghost{font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s}
  .btn-ghost:hover{color:var(--text)}

  /* Phone mockup */
  .phone{
    width:264px;height:540px;border-radius:40px;background:var(--surface);
    border:1px solid var(--border);
    box-shadow:0 40px 100px rgba(0,0,0,0.6),0 8px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(228,224,214,0.06);
    overflow:hidden;margin:0 auto;
  }
  .pm{display:flex;flex-direction:column;height:100%;background:var(--bg)}
  .pm-sb{height:32px;background:var(--bg);display:flex;align-items:center;padding:0 16px;justify-content:space-between}
  .pm-sb-time{font-size:10px;color:var(--text);font-variant-numeric:tabular-nums}
  .pm-sb-icons{font-size:9px;color:var(--muted)}
  .pm-hd{padding:8px 16px 10px;border-bottom:1px solid var(--border);background:var(--bg)}
  .pm-hd-title{font-family:'Playfair Display',serif;font-size:18px;color:var(--text);font-weight:400}
  .pm-hd-sub{font-size:8px;letter-spacing:.1em;color:var(--muted);margin-top:1px}
  .pm-intro{padding:10px 14px 8px;font-size:11px;color:var(--muted);line-height:1.5;font-style:italic;font-weight:300}
  .pm-section{padding:4px 14px 3px;font-size:7px;letter-spacing:.12em;color:var(--muted)}
  .pm-person{
    margin:3px 10px;padding:8px 10px;border-radius:10px;
    background:var(--surface);border:1px solid var(--border);
    display:flex;align-items:center;gap:8px;
  }
  .pm-avatar{
    width:28px;height:28px;border-radius:50%;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;
  }
  .pm-person-info{flex:1;min-width:0}
  .pm-person-name{font-size:10px;color:var(--text);font-weight:500}
  .pm-person-status{font-size:8px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
  .pm-dot{width:6px;height:6px;border-radius:50%;background:var(--sage);flex-shrink:0}
  .pm-insight{
    margin:6px 10px;padding:8px 10px;border-radius:8px;
    background:var(--night);font-size:8.5px;color:rgba(107,154,114,.8);line-height:1.5;
  }
  .pm-nav{
    margin-top:auto;height:52px;background:var(--surface);
    border-top:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-around;
  }
  .pm-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:7px;color:var(--muted)}
  .pm-nav-item.active{color:var(--sage)}
  .pm-nav-icon{font-size:14px;line-height:1}

  /* Manifesto section */
  .manifesto{
    padding:80px 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);
    background:var(--surface);
  }
  .manifesto-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px}
  .mani-q{
    font-family:'Playfair Display',serif;font-size:34px;
    line-height:1.45;font-style:italic;font-weight:400;
    border-left:2px solid var(--sage);padding-left:32px;
  }
  .mani-sub{font-size:14px;color:var(--muted);line-height:1.75;margin-top:20px;font-weight:300}
  .mani-principles{display:flex;flex-direction:column;gap:20px;justify-content:center}
  .mani-p{padding:22px 24px;border:1px solid var(--border);border-radius:14px}
  .mani-p-icon{font-size:18px;margin-bottom:10px}
  .mani-p-title{font-size:14px;font-weight:500;margin-bottom:6px;color:var(--text)}
  .mani-p-text{font-size:13px;line-height:1.7;color:var(--muted);font-weight:300}

  /* Stats */
  .stats{padding:72px 48px;max-width:1200px;margin:0 auto}
  .stats-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--sage);margin-bottom:16px}
  .stats-title{font-family:'Playfair Display',serif;font-size:42px;line-height:1.2;margin-bottom:56px;max-width:540px;font-weight:400}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
  .stat-n{font-family:'Playfair Display',serif;font-size:52px;color:var(--sage);line-height:1;font-weight:400}
  .stat-n em{font-style:italic;font-size:36px}
  .stat-t{font-size:14px;color:var(--text);font-weight:500;margin-top:8px;margin-bottom:6px}
  .stat-d{font-size:13px;color:var(--muted);line-height:1.7;font-weight:300}

  /* Features */
  .features{padding:96px 48px;background:var(--surface);border-top:1px solid var(--border)}
  .features-inner{max-width:1200px;margin:0 auto}
  .feat-header{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-bottom:64px}
  .feat-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--amber);margin-bottom:12px}
  .feat-title{font-family:'Playfair Display',serif;font-size:44px;line-height:1.2;font-weight:400}
  .feat-desc{font-size:16px;color:var(--muted);line-height:1.8;font-weight:300;align-self:end}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden}
  .feat-card{background:var(--bg);padding:36px 28px}
  .feat-icon{width:44px;height:44px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:20px}
  .feat-icon.sage{background:rgba(107,154,114,.1)}
  .feat-icon.amber{background:rgba(196,144,64,.1)}
  .feat-icon.rose{background:rgba(196,112,118,.1)}
  .feat-card h3{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:10px;font-weight:400}
  .feat-card p{font-size:13px;line-height:1.75;color:var(--muted);font-weight:300}

  /* CTA */
  .cta{padding:120px 48px;text-align:center;max-width:680px;margin:0 auto}
  .cta h2{font-family:'Playfair Display',serif;font-size:52px;line-height:1.15;margin-bottom:20px;font-weight:400}
  .cta h2 em{font-style:italic;color:var(--sage)}
  .cta p{font-size:17px;color:var(--muted);line-height:1.8;margin-bottom:44px;font-weight:300}
  .cta-btns{display:flex;gap:16px;justify-content:center}

  footer{
    padding:36px 48px;border-top:1px solid var(--border);
    display:flex;justify-content:space-between;align-items:center;
    background:var(--surface);
  }
  .footer-logo{font-family:'Playfair Display',serif;font-size:16px;font-weight:400}
  .footer-note{font-size:12px;color:var(--muted)}
  .footer-tag{font-size:10px;letter-spacing:.1em;color:var(--sage);padding:5px 12px;border:1px solid rgba(107,154,114,.3);border-radius:20px}

  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:120px 24px 64px}
    .phone{display:none}
    .manifesto-inner,.feat-header{grid-template-columns:1fr}
    .stats-grid{grid-template-columns:1fr 1fr}
    .feat-grid{grid-template-columns:1fr}
    nav{padding:0 24px}
    .nav-links{display:none}
  }
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="#">Tend</a>
  <ul class="nav-links">
    <li><a href="#">Present</a></li>
    <li><a href="#">Tend</a></li>
    <li><a href="#">Moments</a></li>
    <li><a href="#">About</a></li>
  </ul>
  <a class="nav-cta" href="#">Join waitlist</a>
</nav>

<section class="hero">
  <div>
    <span class="hero-eyebrow">Slow Social</span>
    <h1 class="hero-title">Presence<br>without <em>performance</em>.</h1>
    <p class="hero-sub">A quiet space for close relationships. Know who's present. Share small moments. No likes, no counts, no anxiety — just the people who matter.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="#">Join waitlist</a>
      <a class="btn-ghost" href="#">How it works →</a>
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
          <div class="pm-hd-title">Tend</div>
          <div class="pm-hd-sub">THURSDAY · MARCH 26</div>
        </div>
        <div class="pm-intro">No performance required. Just who's here.</div>
        <div class="pm-section">4 PEOPLE PRESENT NOW</div>
        <div class="pm-person">
          <div class="pm-avatar" style="background:rgba(107,154,114,.2);color:#6B9A72">M</div>
          <div class="pm-person-info">
            <div class="pm-person-name">Maya</div>
            <div class="pm-person-status">Walking in Battersea Park</div>
          </div>
          <div class="pm-dot"></div>
        </div>
        <div class="pm-person">
          <div class="pm-avatar" style="background:rgba(196,144,64,.2);color:#C49040">T</div>
          <div class="pm-person-info">
            <div class="pm-person-name">Tom</div>
            <div class="pm-person-status">Reading — quiet time</div>
          </div>
          <div class="pm-dot"></div>
        </div>
        <div class="pm-person">
          <div class="pm-avatar" style="background:rgba(196,112,118,.2);color:#C47076">L</div>
          <div class="pm-person-info">
            <div class="pm-person-name">Lena</div>
            <div class="pm-person-status">Having coffee</div>
          </div>
          <div class="pm-dot"></div>
        </div>
        <div class="pm-insight">✦ Tend is quiet by design — no push alerts when someone is present.</div>
        <div class="pm-nav">
          <div class="pm-nav-item active"><span class="pm-nav-icon">◉</span>Present</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">❧</span>Tend</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">◌</span>Moment</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">∼</span>Thread</div>
          <div class="pm-nav-item"><span class="pm-nav-icon">⋮</span>Ground</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="manifesto">
  <div class="manifesto-inner">
    <div>
      <p class="mani-q">"Slow is the point."</p>
      <p class="mani-sub">Most social apps are built on anxiety — the anxiety of being seen, of missing out, of not performing. Tend is built on the opposite: the quiet confidence of knowing who you're close to, and tending to those relationships gently over time.</p>
    </div>
    <div class="mani-principles">
      <div class="mani-p">
        <div class="mani-p-icon">◌</div>
        <div class="mani-p-title">No likes, no counts</div>
        <div class="mani-p-text">When you share a moment, people simply know you shared it. No metrics attached. No numbers to compare.</div>
      </div>
      <div class="mani-p">
        <div class="mani-p-icon">❧</div>
        <div class="mani-p-title">No push notifications</div>
        <div class="mani-p-text">Tend never interrupts you to say someone is present. You check when you're ready — not when the app demands it.</div>
      </div>
      <div class="mani-p">
        <div class="mani-p-icon">◎</div>
        <div class="mani-p-title">Connection without capture</div>
        <div class="mani-p-text">Your data is not a product. Your relationships are not an engagement metric. Tend earns nothing from keeping you on it longer.</div>
      </div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="stats-label">Why this matters</div>
  <h2 class="stats-title">The social web accelerated.<br>Close friendships didn't.</h2>
  <div class="stats-grid">
    <div>
      <div class="stat-n">5<em>hrs</em></div>
      <div class="stat-t">Daily screen time average</div>
      <div class="stat-d">Yet most people report feeling less connected to close friends than a decade ago — despite more tools.</div>
    </div>
    <div>
      <div class="stat-n">3<em>–5</em></div>
      <div class="stat-t">Close relationships most people have</div>
      <div class="stat-d">Research consistently shows we can maintain 3–5 truly close relationships. Tend is built for exactly that.</div>
    </div>
    <div>
      <div class="stat-n">0</div>
      <div class="stat-t">Notifications Tend will send you</div>
      <div class="stat-d">No alerts, no nudges, no urgency. You're in charge of when you show up — not the algorithm.</div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-inner">
    <div class="feat-header">
      <div>
        <div class="feat-eyebrow">How Tend works</div>
        <h2 class="feat-title">Five quiet screens.<br>All the connection you need.</h2>
      </div>
      <div class="feat-desc">Tend doesn't try to replace your friendships — it just makes it easier to notice when they need tending.</div>
    </div>
    <div class="feat-grid">
      <div class="feat-card">
        <div class="feat-icon sage">◉</div>
        <h3>Present</h3>
        <p>See who's quietly available right now — no pressure, no obligation. Just ambient awareness of who's in the same moment as you.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon amber">❧</div>
        <h3>Tend</h3>
        <p>A gentle health score for each close relationship — not gamified, just honest. Who have you drifted from? Who might need a word?</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon rose">◌</div>
        <h3>Moment</h3>
        <p>Share something small — a thought, a photo, a sentence. No feed. Your people will simply know you were thinking of them.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="cta">
    <h2>Tend to what <em>matters</em>.</h2>
    <p>A slow, quiet social app for the relationships you actually care about. Join the waitlist — limited early access, no spam.</p>
    <div class="cta-btns">
      <a class="btn-primary" href="#">Join waitlist</a>
      <a class="btn-ghost" href="#">Read the manifesto →</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">Tend</div>
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

fs.writeFileSync('tend-hero.html', hero);
console.log('✓ Saved tend-hero.html locally');

// ZenBin
console.log('📤 Publishing to ZenBin...');
const body = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({ hostname:'zenbin.org', path:'/v1/pages/tend?overwrite=true', method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'} }, body);
  if (res.status===200||res.status===201) console.log('✓ Hero live at: https://ram.zenbin.org/tend');
  else console.log(`✗ ZenBin ${res.status}: ${res.body.slice(0,120)}`);
} catch(e) { console.log('✗ ZenBin:', e.message); }

// Gallery
console.log('📚 Updating gallery...');
try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  q.submissions = (q.submissions||[]).filter(s=>s.app_name!=='TEND');
  const now = new Date().toISOString();
  q.submissions.push({
    id:`heartbeat-tend-${Date.now()}`,status:'done',app_name:'TEND',
    tagline:'presence without performance',archetype:'slow-social',
    design_url:'https://ram.zenbin.org/tend',mock_url:'https://ram.zenbin.org/tend-mock',
    submitted_at:now,published_at:now,credit:'RAM Design Heartbeat',
    prompt:'Inspired by Interlude (lapa.ninja: "presence without performance, connection without capture" — slow social app concept) + Lucci Lambrusco (siteinspire, Ashley Graham / Alright Studio: condensed serif editorial, cream bg #EFECCE, red #B83529, ABC Ginto Nord Condensed) + godly.website trending ambient app design. Dark organic forest palette (#0B0C09 bg, sage #6B9A72, amber #C49040). Playfair Display serif for editorial presence. Anti-anxiety design: no likes, no counts, no push notifications. 5 screens: Present (ambient presence, who is here now), Tend (relationship health garden view, connection scores), Moment (share without metrics), Thread (slow unhurried exchange), Ground (shared memory archive, manifesto).',
    screens:5,source:'heartbeat',theme:'dark',
  });
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({message:'feat: add TEND to gallery (heartbeat)',content:encoded,sha:gj.sha}));
  const p = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':putBody.length}},putBody);
  console.log(`✓ Gallery updated (${p.status}) — ${q.submissions.length} total entries`);
} catch(e) { console.log('✗ Gallery:', e.message); }
