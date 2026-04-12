// VAULT — publish hero + viewer to ram.zenbin.org AND zenbin.org/p/
const https = require('https');
const fs    = require('fs');

const SLUG = 'vault';

const BG      = '#030303';
const SURFACE = '#0D0C0B';
const PAPER   = '#E6E1D6';
const CANDLE  = '#FFE566';
const CANDLE_D= '#C4A800';
const TEAL    = '#2DD4BF';
const MUTED   = 'rgba(230,225,214,0.45)';

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VAULT — Private Archive</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;700&display=swap');
  body{
    background:${BG};color:${PAPER};
    font-family:'Inter',sans-serif;min-height:100vh;
    overflow-x:hidden;
  }
  /* Subtle noise/grain on background */
  body::before{
    content:'';position:fixed;inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events:none;z-index:0;opacity:.4;
  }
  .wrap{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:0 24px}

  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0;border-bottom:1px solid rgba(230,225,214,0.10)}
  .logo{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;letter-spacing:6px;color:${PAPER}}
  .logo-star{color:${CANDLE};margin-left:8px}
  .nav-links{display:flex;gap:24px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}}
  .nav-links a{color:inherit;text-decoration:none;transition:color .2s}
  .nav-links a:hover{color:${PAPER}}
  .nav-cta{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;background:${CANDLE};color:${BG};padding:8px 16px;border-radius:8px;text-decoration:none}

  /* HERO */
  .hero{padding:88px 0 72px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${CANDLE_D};margin-bottom:22px}
  .title{font-size:64px;font-weight:700;line-height:1.0;letter-spacing:-2px;color:${PAPER};margin-bottom:20px}
  .title em{font-style:normal;color:${CANDLE}}
  .tagline{font-size:17px;color:${MUTED};line-height:1.65;margin-bottom:36px;max-width:360px}
  .actions{display:flex;gap:12px;flex-wrap:wrap}
  .btn-p{background:${CANDLE};color:${BG};font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:12px 20px;border-radius:10px;text-decoration:none}
  .btn-g{border:1px solid rgba(230,225,214,0.18);color:${MUTED};font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 18px;border-radius:10px;text-decoration:none;transition:all .2s}
  .btn-g:hover{border-color:rgba(230,225,214,0.40);color:${PAPER}}

  /* Phone mockup */
  .phone-wrap{display:flex;justify-content:center}
  .phone{width:268px;height:540px;background:${BG};border-radius:40px;border:2px solid rgba(230,225,214,0.12);overflow:hidden;position:relative;box-shadow:0 40px 90px rgba(0,0,0,0.7),0 0 0 1px rgba(230,225,214,0.05)}
  .phone-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:90px;height:22px;background:${BG};border-radius:0 0 14px 14px;z-index:10}
  .phone-screen{padding:28px 12px 16px;font-family:'JetBrains Mono',monospace}
  .ps-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
  .ps-logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${PAPER}}
  .ps-star{color:${CANDLE};font-size:14px}
  .ps-meta{display:flex;justify-content:space-between;margin-bottom:6px;font-size:8px;color:${MUTED};letter-spacing:1px}
  .ps-line{height:1px;background:rgba(230,225,214,0.12);margin-bottom:8px}
  .ps-entry{background:#161512;border-radius:8px;padding:8px 10px;margin-bottom:6px}
  .ps-e-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
  .ps-e-lock{color:${CANDLE};font-size:10px}
  .ps-e-title{font-size:11px;color:${PAPER};font-family:'Inter',sans-serif;font-weight:600;line-height:1.3}
  .ps-e-meta{display:flex;gap:6px;align-items:center;margin-top:4px}
  .ps-tag{font-size:7px;letter-spacing:1.5px;padding:2px 6px;border-radius:6px}
  .ps-tag.c{background:rgba(255,229,102,0.12);color:${CANDLE}}
  .ps-tag.t{background:rgba(45,212,191,0.12);color:${TEAL}}
  .ps-tag.d{background:rgba(230,225,214,0.08);color:${MUTED}}
  .ps-date{font-size:7px;color:${MUTED};letter-spacing:.5px}
  .ps-bottom{position:absolute;bottom:0;left:0;right:0;background:${SURFACE};border-top:1px solid rgba(230,225,214,0.08);padding:8px 12px;display:flex;justify-content:space-between;align-items:center}
  .ps-new{font-size:8px;font-weight:700;letter-spacing:2px;color:${CANDLE}}
  .ps-time{font-size:7px;color:${MUTED};letter-spacing:.5px}

  /* STATS */
  .stats{display:grid;grid-template-columns:repeat(4,1fr);background:${SURFACE};border-radius:16px;border:1px solid rgba(230,225,214,0.07);margin-bottom:72px}
  .stat{padding:28px 0;text-align:center;border-right:1px solid rgba(230,225,214,0.07)}
  .stat:last-child{border-right:none}
  .sv{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:${PAPER};line-height:1}
  .sv em{color:${CANDLE};font-style:normal}
  .sl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-top:6px}

  /* SCREENS */
  .sec{margin-bottom:72px}
  .sec-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${MUTED};margin-bottom:20px;display:flex;align-items:center;gap:12px}
  .sec-lbl::after{content:'';flex:1;height:1px;background:rgba(230,225,214,0.10)}
  .screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
  .sc{background:${SURFACE};border-radius:14px;padding:20px 14px;border:1px solid rgba(230,225,214,0.07);text-align:center;transition:transform .2s,box-shadow .2s}
  .sc:hover{transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,.5)}
  .sc-icon{font-size:22px;margin-bottom:8px}
  .sc-name{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-bottom:4px}
  .sc-desc{font-size:11px;color:${PAPER};line-height:1.4}

  /* FEATURES */
  .features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:72px}
  .feat{background:${SURFACE};border-radius:14px;padding:26px 20px;border:1px solid rgba(230,225,214,0.07)}
  .feat-ic{font-family:'JetBrains Mono',monospace;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:9px;margin-bottom:14px;font-size:18px}
  .feat-ic.c{background:rgba(255,229,102,0.10);color:${CANDLE}}
  .feat-ic.t{background:rgba(45,212,191,0.10);color:${TEAL}}
  .feat-title{font-size:14px;font-weight:700;color:${PAPER};margin-bottom:6px}
  .feat-body{font-size:12px;color:${MUTED};line-height:1.6}

  /* FOOTER */
  footer{border-top:1px solid rgba(230,225,214,0.10);padding:28px 0;display:flex;align-items:center;justify-content:space-between}
  .foot-l{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;color:${MUTED}}
  .foot-r{font-family:'JetBrains Mono',monospace;font-size:10px;color:${CANDLE_D};letter-spacing:1px}

  @media(max-width:700px){
    .hero{grid-template-columns:1fr;gap:36px}
    .title{font-size:44px}
    .screens-grid{grid-template-columns:repeat(3,1fr)}
    .features{grid-template-columns:1fr 1fr}
    .stats{grid-template-columns:1fr 1fr}
    .phone-wrap{display:none}
  }
</style>
</head>
<body>
<div class="wrap">

  <nav>
    <div class="logo">VAULT <span class="logo-star">✦</span></div>
    <div class="nav-links">
      <a href="#">Entries</a>
      <a href="#">Search</a>
      <a href="#">Security</a>
    </div>
    <a href="#" class="nav-cta">Open Vault</a>
  </nav>

  <section class="hero">
    <div>
      <div class="eyebrow">Private Archive · Dark Theme</div>
      <h1 class="title">Held in<br><em>darkness.</em></h1>
      <p class="tagline">A minimal encrypted archive for your most private thoughts. Write in the dark. Seal with a word.</p>
      <div class="actions">
        <a href="https://ram.zenbin.org/vault-viewer" class="btn-p">View Design ↗</a>
        <a href="https://ram.zenbin.org/vault-mock" class="btn-g">Live Mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="ps-header"><span class="ps-logo">VAULT</span><span class="ps-star">✦</span></div>
          <div class="ps-meta"><span>ENTRIES</span><span>12 sealed</span></div>
          <div class="ps-line"></div>
          <div class="ps-entry">
            <div class="ps-e-top"><span></span><span class="ps-e-lock">◈</span></div>
            <div class="ps-e-title">On loneliness and distance</div>
            <div class="ps-e-meta"><span class="ps-tag c">REFLECT</span><span class="ps-date">2026.04.01</span></div>
          </div>
          <div class="ps-entry">
            <div class="ps-e-top"><span></span><span class="ps-e-lock">◈</span></div>
            <div class="ps-e-title">The Lisbon conversation</div>
            <div class="ps-e-meta"><span class="ps-tag d">MEMORY</span><span class="ps-date">2026.03.28</span></div>
          </div>
          <div class="ps-entry">
            <div class="ps-e-top"><span></span><span class="ps-e-lock" style="opacity:.25">◎</span></div>
            <div class="ps-e-title">Things I will not say</div>
            <div class="ps-e-meta"><span class="ps-tag d">DRAFT</span><span class="ps-date">2026.03.22</span></div>
          </div>
          <div class="ps-entry">
            <div class="ps-e-top"><span></span><span class="ps-e-lock">◈</span></div>
            <div class="ps-e-title">Architecture of trust</div>
            <div class="ps-e-meta"><span class="ps-tag c">REFLECT</span><span class="ps-date">2026.03.15</span></div>
          </div>
          <div class="ps-entry">
            <div class="ps-e-top"><span></span><span class="ps-e-lock" style="opacity:.25">◎</span></div>
            <div class="ps-e-title">Inventory of fears</div>
            <div class="ps-e-meta"><span class="ps-tag t">LIST</span><span class="ps-date">2026.03.08</span></div>
          </div>
        </div>
        <div class="ps-bottom">
          <span class="ps-new">⊕ NEW ENTRY</span>
          <span class="ps-time">04.01 · 08:56:34</span>
        </div>
      </div>
    </div>
  </section>

  <div class="stats">
    <div class="stat"><div class="sv"><em>5</em></div><div class="sl">Screens</div></div>
    <div class="stat"><div class="sv">Dark</div><div class="sl">Theme</div></div>
    <div class="stat"><div class="sv"><em>12</em></div><div class="sl">Entries</div></div>
    <div class="stat"><div class="sv"><em>256</em></div><div class="sl">AES Bits</div></div>
  </div>

  <div class="sec">
    <div class="sec-lbl">5 screens</div>
    <div class="screens-grid">
      <div class="sc"><div class="sc-icon">◈</div><div class="sc-name">Entries</div><div class="sc-desc">Archive of sealed thoughts as typographic list</div></div>
      <div class="sc"><div class="sc-icon">✦</div><div class="sc-name">Open</div><div class="sc-desc">Giant display title, prose on black, timestamp</div></div>
      <div class="sc"><div class="sc-icon">✏</div><div class="sc-name">Write</div><div class="sc-desc">Minimal compose — category tags, candle cursor</div></div>
      <div class="sc"><div class="sc-icon">⌕</div><div class="sc-name">Search</div><div class="sc-desc">Full-text within sealed entries, lit matches</div></div>
      <div class="sc"><div class="sc-icon">⬡</div><div class="sc-name">Security</div><div class="sc-desc">AES-256, Face ID, decoy mode, danger zone</div></div>
    </div>
  </div>

  <div class="features">
    <div class="feat"><div class="feat-ic c">✦</div><div class="feat-title">Typographic entries</div><div class="feat-body">Entry titles as dominant visual elements — 40px display type on pure black. Inspired by Antinomy Studio's "Mail" hero moment.</div></div>
    <div class="feat"><div class="feat-ic c">◈</div><div class="feat-title">Sealed / unsealed</div><div class="feat-body">Each entry can be sealed (AES-256 encrypted) or open. Candle yellow lock icon marks what's protected.</div></div>
    <div class="feat"><div class="feat-ic t">⬡</div><div class="feat-title">Decoy mode</div><div class="feat-body">Under duress, show an empty vault. The real entries remain hidden behind a secondary passcode.</div></div>
    <div class="feat"><div class="feat-ic c">⌕</div><div class="feat-title">Encrypted search</div><div class="feat-body">Search across sealed entries without decrypting to disk. Lit candle-yellow match highlights.</div></div>
    <div class="feat"><div class="feat-ic t">✏</div><div class="feat-title">Category tags</div><div class="feat-body">REFLECT · MEMORY · LETTER · LIST · DRAFT. Organise thoughts by type, not by date.</div></div>
    <div class="feat"><div class="feat-ic c">◑</div><div class="feat-title">Dark-native UI</div><div class="feat-body">Pure black #030303 canvas. Warm paper text. Live mono clock strip at bottom — Antinomy's clock detail.</div></div>
  </div>

  <footer>
    <span class="foot-l">RAM Design Heartbeat · April 2026 · Inspired by Antinomy Studio (awwwards.com)</span>
    <span class="foot-r">zenbin.org/p/vault</span>
  </footer>

</div>
</body>
</html>`;

const viewerHtml = fs.existsSync('./viewer.html')
  ? fs.readFileSync('./viewer.html', 'utf8').replace('{{SLUG}}', SLUG).replace('{{TITLE}}', 'VAULT — Private Archive')
  : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VAULT Viewer</title></head><body style="background:#030303;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#E6E1D6"><p>Viewer: zenbin.org/p/vault</p></body></html>`;

function pub(slug, html, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const headers = { 'Content-Type': 'application/json', 'Content-Length': body.length };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const r1 = await pub(SLUG, heroHtml, 'ram');
  console.log(`Hero (ram):    ${r1.status <= 201 ? 'OK ✓' : r1.status}`);
  const r2 = await pub(SLUG, heroHtml);
  console.log(`Hero (stable): ${r2.status <= 201 ? 'OK ✓' : r2.status}`);
  const r3 = await pub(`${SLUG}-viewer`, viewerHtml, 'ram');
  console.log(`Viewer (ram):  ${r3.status <= 201 ? 'OK ✓' : r3.status}`);
  console.log(`\n✓ VAULT published`);
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Stable: https://zenbin.org/p/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
