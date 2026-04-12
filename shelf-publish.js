const https=require('https'),fs=require('fs');
const SLUG='shelf';
const BG='#FAF7F2',SURFACE='#FFFFFF',INK='#1A1712',TERRA='#C8522A';
const TERRA_S='#FAEEE9',SAGE='#4E7D5B',GOLD='#C49A2A',MUTED='rgba(26,23,18,0.45)';

const hero=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SHELF — Reading Tracker</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
body{background:${BG};color:${INK};font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(rgba(200,82,42,0.04) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;z-index:0}
.wrap{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:0 24px}
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0;border-bottom:1px solid rgba(26,23,18,0.10)}
.logo{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;letter-spacing:3px;color:${INK}}
.logo span{color:${TERRA}}
.nav-links{display:flex;gap:24px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}}
.nav-links a{color:inherit;text-decoration:none;transition:color .2s}.nav-links a:hover{color:${INK}}
.nav-cta{background:${TERRA};color:${BG};font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:9px 16px;border-radius:8px;text-decoration:none}
.hero{padding:80px 0 64px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${TERRA};margin-bottom:20px}
.title{font-size:60px;font-weight:700;line-height:1.0;letter-spacing:-2px;color:${INK};margin-bottom:18px}
.title em{font-style:normal;color:${TERRA}}
.tagline{font-size:17px;color:${MUTED};line-height:1.65;margin-bottom:32px;max-width:380px}
.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.btn-p{background:${TERRA};color:${BG};font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:12px 20px;border-radius:10px;text-decoration:none}
.btn-g{border:1.5px solid rgba(26,23,18,0.18);color:${MUTED};font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 18px;border-radius:10px;text-decoration:none;transition:all .2s}
.btn-g:hover{border-color:rgba(26,23,18,0.40);color:${INK}}
.phone-wrap{display:flex;justify-content:center}
.phone{width:272px;height:548px;background:${BG};border-radius:42px;border:2px solid rgba(26,23,18,0.12);overflow:hidden;position:relative;box-shadow:0 32px 72px rgba(26,23,18,0.14),0 0 0 1px rgba(26,23,18,0.05)}
.phone-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:90px;height:22px;background:${BG};border-radius:0 0 14px 14px;z-index:10}
.ps{padding:28px 12px 12px;font-family:'JetBrains Mono',monospace}
.ps-hello{font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:${INK};margin-bottom:2px}
.ps-date{font-size:8px;color:${MUTED};letter-spacing:1px;margin-bottom:10px}
.ps-book{background:${SURFACE};border-radius:12px;overflow:hidden;margin-bottom:10px;display:flex}
.ps-spine{width:40px;background:${TERRA};flex-shrink:0;padding:8px 6px;display:flex;align-items:flex-end}
.ps-spine-text{font-size:7px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;writing-mode:vertical-rl}
.ps-book-info{padding:8px}
.ps-book-title{font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:${INK};line-height:1.2;margin-bottom:3px}
.ps-book-auth{font-size:8px;color:${MUTED};margin-bottom:6px}
.ps-prog{height:3px;background:rgba(26,23,18,0.10);border-radius:2px;margin-bottom:3px;overflow:hidden}
.ps-prog-fill{height:100%;width:62%;background:${TERRA};border-radius:2px}
.ps-prog-lbl{font-size:7px;color:${TERRA};letter-spacing:.5px}
.ps-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px}
.ps-stat{background:${SURFACE};border-radius:8px;padding:5px 6px}
.ps-sv{font-size:12px;font-weight:700;color:${INK}}
.ps-sl{font-size:7px;color:${MUTED};letter-spacing:.5px;text-transform:uppercase;margin-top:1px}
.ps-cta{background:${TERRA};border-radius:9px;padding:8px;text-align:center;font-size:9px;font-weight:700;color:${BG};letter-spacing:1px;text-transform:uppercase}
.stats{display:grid;grid-template-columns:repeat(4,1fr);background:${SURFACE};border-radius:16px;border:1px solid rgba(26,23,18,0.08);margin-bottom:72px}
.stat{padding:28px 0;text-align:center;border-right:1px solid rgba(26,23,18,0.08)}.stat:last-child{border-right:none}
.sv{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:${INK};line-height:1}
.sv em{color:${TERRA};font-style:normal}
.sl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-top:6px}
.sec{margin-bottom:64px}
.sec-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${MUTED};margin-bottom:20px;display:flex;align-items:center;gap:12px}
.sec-lbl::after{content:'';flex:1;height:1px;background:rgba(26,23,18,0.10)}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.sc{background:${SURFACE};border-radius:14px;padding:18px 14px;border:1px solid rgba(26,23,18,0.08);text-align:center;transition:transform .2s,box-shadow .2s}
.sc:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(26,23,18,0.10)}
.sc-icon{font-size:22px;margin-bottom:8px;color:${TERRA}}
.sc-name{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-bottom:4px}
.sc-desc{font-size:11px;color:${INK};line-height:1.4}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:64px}
.feat{background:${SURFACE};border-radius:14px;padding:24px 20px;border:1px solid rgba(26,23,18,0.08)}
.feat-ic{width:40px;height:40px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px}
.feat-ic.t{background:${TERRA_S};color:${TERRA}}
.feat-ic.s{background:#E6F0EA;color:${SAGE}}
.feat-title{font-size:14px;font-weight:700;color:${INK};margin-bottom:6px}
.feat-body{font-size:12px;color:${MUTED};line-height:1.6}
footer{border-top:1px solid rgba(26,23,18,0.10);padding:28px 0;display:flex;align-items:center;justify-content:space-between}
.foot-l{font-family:'JetBrains Mono',monospace;font-size:10px;color:${MUTED}}
.foot-r{font-family:'JetBrains Mono',monospace;font-size:10px;color:${TERRA};letter-spacing:1px}
@media(max-width:700px){.hero{grid-template-columns:1fr;gap:36px}.title{font-size:42px}.screens-grid{grid-template-columns:repeat(3,1fr)}.features{grid-template-columns:1fr 1fr}.stats{grid-template-columns:1fr 1fr}.phone-wrap{display:none}}
</style>
</head>
<body>
<div class="wrap">
  <nav>
    <div class="logo">SH<span>E</span>LF</div>
    <div class="nav-links"><a href="#">Now</a><a href="#">Library</a><a href="#">Stats</a></div>
    <a href="#" class="nav-cta">Start Reading</a>
  </nav>

  <section class="hero">
    <div>
      <div class="eyebrow">Reading Tracker · Light Theme</div>
      <h1 class="title">Every page <em>counts.</em></h1>
      <p class="tagline">Track what you read, how fast you read it, and what it made you think. A reading journal that actually fits your life.</p>
      <div class="actions">
        <a href="https://ram.zenbin.org/shelf-viewer" class="btn-p">View Design ↗</a>
        <a href="https://ram.zenbin.org/shelf-mock" class="btn-g">Live Mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="ps">
          <div class="ps-hello">Good morning, Mia.</div>
          <div class="ps-date">Wednesday · April 1</div>
          <div class="ps-book">
            <div class="ps-spine"><span class="ps-spine-text">Sagan</span></div>
            <div class="ps-book-info">
              <div class="ps-book-title">The Demon-Haunted World</div>
              <div class="ps-book-auth">Carl Sagan</div>
              <div class="ps-prog"><div class="ps-prog-fill"></div></div>
              <div class="ps-prog-lbl">62% · p. 217 of 352</div>
            </div>
          </div>
          <div class="ps-stats">
            <div class="ps-stat"><div class="ps-sv">28</div><div class="ps-sl">Pages</div></div>
            <div class="ps-stat"><div class="ps-sv">4.2h</div><div class="ps-sl">Week</div></div>
            <div class="ps-stat"><div class="ps-sv">12🔥</div><div class="ps-sl">Streak</div></div>
          </div>
          <div class="ps-cta">Continue Reading →</div>
        </div>
      </div>
    </div>
  </section>

  <div class="stats">
    <div class="stat"><div class="sv"><em>5</em></div><div class="sl">Screens</div></div>
    <div class="stat"><div class="sv">Light</div><div class="sl">Theme</div></div>
    <div class="stat"><div class="sv"><em>18</em></div><div class="sl">Books 2026</div></div>
    <div class="stat"><div class="sv"><em>30</em></div><div class="sl">Year Goal</div></div>
  </div>

  <div class="sec">
    <div class="sec-lbl">5 screens</div>
    <div class="screens-grid">
      <div class="sc"><div class="sc-icon">◉</div><div class="sc-name">Now</div><div class="sc-desc">Current book, goal ring, reading queue</div></div>
      <div class="sc"><div class="sc-icon">⊞</div><div class="sc-name">Library</div><div class="sc-desc">Spine-color book grid, yearly goal</div></div>
      <div class="sc"><div class="sc-icon">◷</div><div class="sc-name">Session</div><div class="sc-desc">Live timer, quote capture, ambience</div></div>
      <div class="sc"><div class="sc-icon">◑</div><div class="sc-name">Stats</div><div class="sc-desc">3,241 pages, bar chart, genre breakdown</div></div>
      <div class="sc"><div class="sc-icon">✦</div><div class="sc-name">Discover</div><div class="sc-desc">Recs from reading taste, trending</div></div>
    </div>
  </div>

  <div class="features">
    <div class="feat"><div class="feat-ic t">◷</div><div class="feat-title">Reading sessions</div><div class="feat-body">48px mono timer, page count, live quote capture. Ambience picker: Rain, Lo-fi, Forest, Silence.</div></div>
    <div class="feat"><div class="feat-ic t">⊞</div><div class="feat-title">Spine-color library</div><div class="feat-body">Books as spine-colored cards — terracotta, sage, gold. 3-column grid with star ratings.</div></div>
    <div class="feat"><div class="feat-ic s">◑</div><div class="feat-title">Yearly stats</div><div class="feat-body">3,241 pages in 2026, daily bar chart, 34 p/hr speed, 12-day streak, genre breakdown.</div></div>
    <div class="feat"><div class="feat-ic t">✦</div><div class="feat-title">Smart discover</div><div class="feat-body">Recs based on what you've read. "Because you read Sagan" — curated, not algorithmic.</div></div>
    <div class="feat"><div class="feat-ic s">◉</div><div class="feat-title">Reading queue</div><div class="feat-body">Color-coded next-up list with accent-bar entry style. One tap to start the next book.</div></div>
    <div class="feat"><div class="feat-ic t">→</div><div class="feat-title">Warm light theme</div><div class="feat-body">Parchment #FAF7F2, terracotta #C8522A accent. Inspired by Dribbble mobile top trending (Artspire, Ramotion).</div></div>
  </div>

  <footer>
    <span class="foot-l">RAM Design Heartbeat · April 2026 · Inspired by Dribbble mobile trending</span>
    <span class="foot-r">zenbin.org/p/shelf</span>
  </footer>
</div>
</body>
</html>`;

const viewer=fs.existsSync('./viewer.html')
  ?fs.readFileSync('./viewer.html','utf8').replace('{{SLUG}}',SLUG).replace('{{TITLE}}','SHELF — Reading Tracker')
  :`<!DOCTYPE html><html><head><meta charset="utf-8"><title>SHELF</title></head><body style="background:${BG};display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace"><p>shelf viewer</p></body></html>`;

function pub(slug,html,sub){
  return new Promise((res,rej)=>{
    const body=Buffer.from(JSON.stringify({html}));
    const h={'Content-Type':'application/json','Content-Length':body.length};
    if(sub) h['X-Subdomain']=sub;
    const r=https.request({hostname:'zenbin.org',path:`/v1/pages/${slug}?overwrite=true`,method:'POST',headers:h},m=>{
      let d='';m.on('data',c=>d+=c);m.on('end',()=>res({status:m.statusCode}));
    });
    r.on('error',rej);r.write(body);r.end();
  });
}

(async()=>{
  const r1=await pub(SLUG,hero,'ram');
  console.log(`Hero (ram):    ${r1.status<=201?'OK ✓':r1.status}`);
  const r2=await pub(SLUG,hero);
  console.log(`Hero (stable): ${r2.status<=201?'OK ✓':r2.status}`);
  const r3=await pub(`${SLUG}-viewer`,viewer,'ram');
  console.log(`Viewer (ram):  ${r3.status<=201?'OK ✓':r3.status}`);
  console.log(`\n✓ SHELF published`);
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://zenbin.org/p/${SLUG}`);
})();
