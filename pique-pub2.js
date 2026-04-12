const fs = require('fs');
const https = require('https');

const HOST = 'zenbin.org';
const SLUG = 'pique';
const APP_NAME = 'PIQUE';
const TAGLINE  = 'Personal Style Intelligence';

const BG    = '#FDFAF6';
const ACCENT = '#C07A56';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// Inline the pen as base64 for viewer
const penJson = fs.readFileSync('/workspace/group/design-studio/pique.pen', 'utf8');

// ── hero HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PIQUE — Personal Style Intelligence</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#FDFAF6;--surface:#F5EFE8;--surface2:#EDE5D8;
    --text:#2A1F1B;--muted:#8C7B73;--border:#E5DDD5;
    --accent:#C07A56;--accent2:#7BA897;--accent3:#D4A853;
  }
  body{background:var(--bg);color:var(--text);font-family:-apple-system,'Helvetica Neue',sans-serif;overflow-x:hidden}
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid var(--border)}
  .logo{font-size:20px;font-weight:800;letter-spacing:-0.5px}
  .logo span{color:var(--accent)}
  nav a{text-decoration:none;color:var(--muted);font-size:14px;font-weight:500;margin-left:28px;transition:color .2s}
  nav a:hover{color:var(--text)}
  .nav-cta{background:var(--accent);color:#fff !important;padding:8px 20px;border-radius:20px}
  .hero{max-width:1100px;margin:0 auto;padding:80px 40px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:70px;align-items:center}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.5px;margin-bottom:24px}
  h1{font-size:54px;font-weight:800;line-height:1.06;letter-spacing:-2px;color:var(--text);margin-bottom:20px}
  h1 em{font-style:italic;color:var(--accent)}
  .hero-sub{font-size:17px;line-height:1.65;color:var(--muted);margin-bottom:36px}
  .hero-btns{display:flex;gap:14px;flex-wrap:wrap}
  .btn-p{background:var(--accent);color:#fff;padding:14px 28px;border-radius:28px;text-decoration:none;font-size:15px;font-weight:700}
  .btn-s{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:14px 28px;border-radius:28px;text-decoration:none;font-size:15px;font-weight:600}
  .phone-wrap{position:relative;display:flex;justify-content:center}
  .phone{width:260px;background:#2A1F1B;border-radius:44px;padding:10px;box-shadow:0 40px 100px rgba(42,31,27,.2)}
  .phone-inner{background:var(--bg);border-radius:36px;overflow:hidden;aspect-ratio:390/844;display:flex;align-items:center;justify-content:center}
  .pin-badge{position:absolute;background:var(--accent);width:12px;height:12px;border-radius:50%;border:2px solid var(--bg);animation:pp 2s ease-in-out infinite}
  .pa{top:32%;left:36%;animation-delay:0s}
  .pb{top:54%;left:64%;animation-delay:.6s}
  .pc{top:70%;left:28%;animation-delay:1.2s}
  @keyframes pp{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(192,122,86,.4)}50%{transform:scale(1.2);box-shadow:0 0 0 5px rgba(192,122,86,0)}}
  .stats{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .stats-in{max-width:1100px;margin:0 auto;padding:32px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  .sv{font-size:30px;font-weight:800;color:var(--accent)}
  .sl{font-size:12px;color:var(--muted);margin-top:4px;font-weight:500}
  .feats{max-width:1100px;margin:0 auto;padding:70px 40px}
  .feat-head{text-align:center;margin-bottom:50px}
  .stag{background:var(--accent);color:#fff;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;display:inline-block;margin-bottom:14px}
  .feat-head h2{font-size:38px;font-weight:800;letter-spacing:-1px}
  .feat-head p{font-size:16px;color:var(--muted);margin-top:10px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.6}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .fc{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;transition:transform .2s}
  .fc:hover{transform:translateY(-3px)}
  .fi{font-size:28px;margin-bottom:16px}
  .fc h3{font-size:17px;font-weight:700;margin-bottom:8px}
  .fc p{font-size:13px;color:var(--muted);line-height:1.6}
  .pin-sec{max-width:1100px;margin:0 auto;padding:0 40px 70px;display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
  .pin-img{position:relative;border-radius:24px;overflow:hidden;aspect-ratio:1;background:linear-gradient(135deg,#D4B896,#9A7A6A);display:flex;align-items:center;justify-content:center;font-size:100px}
  .pd{position:absolute;width:18px;height:18px;background:var(--accent);border-radius:50%;border:3px solid rgba(253,250,246,.9);cursor:pointer}
  .pt{position:absolute;left:26px;background:rgba(253,250,246,.95);border:1px solid var(--border);border-radius:10px;padding:6px 12px;font-size:12px;font-weight:600;white-space:nowrap}
  .pin-t h2{font-size:36px;font-weight:800;letter-spacing:-.8px;margin-bottom:14px;line-height:1.1}
  .pin-t p{font-size:15px;color:var(--muted);line-height:1.65;margin-bottom:24px}
  .steps{display:flex;flex-direction:column;gap:14px}
  .step{display:flex;gap:14px;align-items:flex-start}
  .sn{width:30px;height:30px;min-width:30px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
  .st{font-size:13px;color:var(--muted);line-height:1.5;padding-top:5px}
  .st strong{color:var(--text)}
  .pal-sec{max-width:1100px;margin:0 auto;padding:0 40px 70px}
  .pal-sec h2{font-size:30px;font-weight:800;letter-spacing:-.5px;margin-bottom:8px}
  .pal-sec p{color:var(--muted);font-size:14px;margin-bottom:24px}
  .pal-row{display:flex;gap:10px}
  .sw{flex:1;aspect-ratio:1/1.4;border-radius:14px;position:relative;overflow:hidden;cursor:pointer;transition:transform .2s}
  .sw:hover{transform:scale(1.05)}
  .sl2{position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,.35));color:#fff;font-size:11px;font-weight:600}
  .cta-b{background:var(--surface);border-top:1px solid var(--border);text-align:center;padding:70px 40px}
  .cta-b h2{font-size:40px;font-weight:800;letter-spacing:-1px;margin-bottom:14px}
  .cta-b p{font-size:16px;color:var(--muted);margin-bottom:30px;max-width:440px;margin-left:auto;margin-right:auto}
  .cta-b a{display:inline-block;background:var(--accent);color:#fff;padding:16px 36px;border-radius:28px;text-decoration:none;font-size:16px;font-weight:700}
  footer{padding:28px 40px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto}
  footer p{font-size:12px;color:var(--muted)}
  @media(max-width:768px){.hero,.pin-sec{grid-template-columns:1fr;gap:36px}.feat-grid{grid-template-columns:1fr}.stats-in{grid-template-columns:repeat(2,1fr)}.pal-row{flex-wrap:wrap}h1{font-size:36px}nav{padding:14px 20px}.hero{padding:36px 20px}}
</style>
</head>
<body>
<nav>
  <div class="logo">PIQUE<span>.</span></div>
  <div>
    <a href="#">Features</a>
    <a href="#">Wardrobe</a>
    <a href="https://ram.zenbin.org/pique-mock" class="nav-cta">Interactive mock</a>
  </div>
</nav>
<section class="hero">
  <div>
    <div class="hero-tag">✦ AI-POWERED STYLE INTELLIGENCE</div>
    <h1>Your wardrobe,<br/><em>annotated</em><br/>& understood</h1>
    <p class="hero-sub">PIQUE maps your clothing like a fashion editor — floating pin annotations reveal fabric, fit, and story. Build outfits with intelligence.</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/pique-viewer" class="btn-p">View design →</a>
      <a href="https://ram.zenbin.org/pique-mock" class="btn-s">Interactive mock ☀◑</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-inner">
        <svg viewBox="0 0 390 844" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="390" height="844" fill="#FDFAF6"/>
          <rect x="0" y="136" width="390" height="370" fill="url(#hg)"/>
          <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D4B896"/><stop offset="100%" stop-color="#A07A6A"/></linearGradient></defs>
          <text x="20" y="58" font-family="Helvetica,sans-serif" font-size="24" font-weight="700" fill="#2A1F1B">Discover</text>
          <text x="20" y="78" font-size="13" font-family="Helvetica,sans-serif" fill="#8C7B73">Curated for your aesthetic</text>
          <rect x="20" y="90" width="350" height="38" rx="19" fill="#F5EFE8" stroke="#E5DDD5" stroke-width="0.75"/>
          <!-- pins -->
          <circle cx="145" cy="240" r="12" fill="white" opacity="0.85"/>
          <circle cx="145" cy="240" r="7" fill="#C07A56"/>
          <circle cx="145" cy="240" r="3" fill="white"/>
          <rect x="158" y="225" width="110" height="32" rx="8" fill="rgba(253,250,246,0.9)"/>
          <text x="168" y="239" font-size="10" font-weight="600" font-family="Helvetica,sans-serif" fill="#2A1F1B">Wrap Dress</text>
          <text x="168" y="252" font-size="9" font-family="Helvetica,sans-serif" fill="#8C7B73">Silk chiffon</text>
          <circle cx="250" cy="320" r="12" fill="white" opacity="0.85"/>
          <circle cx="250" cy="320" r="7" fill="#C07A56"/>
          <circle cx="250" cy="320" r="3" fill="white"/>
          <circle cx="110" cy="390" r="12" fill="white" opacity="0.85"/>
          <circle cx="110" cy="390" r="7" fill="#C07A56"/>
          <circle cx="110" cy="390" r="3" fill="white"/>
          <text x="20" y="488" font-size="18" font-weight="700" font-family="Helvetica,sans-serif" fill="#2A1F1B">Côte d'Azur Edit</text>
          <text x="20" y="508" font-size="13" font-family="Helvetica,sans-serif" fill="#8C7B73">3 pieces tagged · Tap pins to explore</text>
          <!-- bottom nav -->
          <rect x="0" y="761" width="390" height="83" fill="#FDFAF6"/>
          <line x1="0" y1="761" x2="390" y2="761" stroke="#E5DDD5" stroke-width="0.75"/>
          <rect x="76" y="758" width="24" height="3" rx="1.5" fill="#C07A56"/>
          <text x="88" y="798" font-size="10" font-family="Helvetica,sans-serif" fill="#C07A56" text-anchor="middle" font-weight="600">Discover</text>
          <text x="186" y="798" font-size="10" font-family="Helvetica,sans-serif" fill="#8C7B73" text-anchor="middle">Wardrobe</text>
          <text x="284" y="798" font-size="10" font-family="Helvetica,sans-serif" fill="#8C7B73" text-anchor="middle">Style</text>
          <text x="353" y="798" font-size="10" font-family="Helvetica,sans-serif" fill="#8C7B73" text-anchor="middle">Me</text>
          <rect x="147" y="834" width="96" height="4" rx="2" fill="#2A1F1B" opacity="0.15"/>
        </svg>
      </div>
    </div>
    <div class="pin-badge pa"></div>
    <div class="pin-badge pb"></div>
    <div class="pin-badge pc"></div>
  </div>
</section>
<div class="stats">
  <div class="stats-in">
    <div><div class="sv">24</div><div class="sl">Pieces tracked</div></div>
    <div><div class="sv">47</div><div class="sl">Detail annotations</div></div>
    <div><div class="sv">88%</div><div class="sl">Style match accuracy</div></div>
    <div><div class="sv">6</div><div class="sl">Complete outfits built</div></div>
  </div>
</div>
<section class="feats">
  <div class="feat-head">
    <div class="stag">FEATURES</div>
    <h2>Style intelligence, pin by pin</h2>
    <p>Every garment holds a story. PIQUE's annotation layer surfaces it — fabric origins, wear history, styling context.</p>
  </div>
  <div class="feat-grid">
    <div class="fc"><div class="fi">📍</div><h3>Spatial Annotations</h3><p>Floating pin markers map every detail of your clothing directly onto the image — collar type, fabric, construction.</p></div>
    <div class="fc"><div class="fi">🎨</div><h3>Palette Extraction</h3><p>Auto-extract your wardrobe's colour DNA. Understand your true palette with occasion and season breakdowns.</p></div>
    <div class="fc"><div class="fi">✨</div><h3>AI Outfit Harmony</h3><p>Real-time compatibility scoring as you build outfits. Flags clashes and suggests the missing piece to complete a look.</p></div>
    <div class="fc"><div class="fi">👤</div><h3>Style Archetype</h3><p>Your evolving style fingerprint — updated as you save and build. Know your aesthetic before you shop.</p></div>
    <div class="fc"><div class="fi">📐</div><h3>Fabric Intelligence</h3><p>Composition breakdowns, care codes, and sustainability scores surfaced automatically from brand data.</p></div>
    <div class="fc"><div class="fi">🔍</div><h3>Visual Search</h3><p>Photograph anything in the wild and PIQUE finds it in your wardrobe, or surfaces a better version.</p></div>
  </div>
</section>
<section class="pin-sec">
  <div class="pin-img">
    👗
    <div class="pd" style="top:28%;left:35%"><div class="pt">Italian lapel collar</div></div>
    <div class="pd" style="top:52%;left:55%"><div class="pt">67% linen blend</div></div>
    <div class="pd" style="top:72%;left:30%"><div class="pt">Patch pocket detail</div></div>
  </div>
  <div class="pin-t">
    <h2>Every pin<br/>tells a story</h2>
    <p>Inspired by how fashion editors annotate look-books, PIQUE brings that same depth to your personal wardrobe. Tap any pin to reveal the full story.</p>
    <div class="steps">
      <div class="step"><div class="sn">1</div><div class="st"><strong>Photograph your item</strong> — or paste a retailer URL to import automatically.</div></div>
      <div class="step"><div class="sn">2</div><div class="st"><strong>PIQUE places pins</strong> — AI identifies key garment details and maps them spatially.</div></div>
      <div class="step"><div class="sn">3</div><div class="st"><strong>Edit and enrich</strong> — add your own notes, wear history, and styling context to each pin.</div></div>
    </div>
  </div>
</section>
<section class="pal-sec">
  <h2>Your colour story</h2>
  <p>Your wardrobe palette, extracted and ranked by frequency.</p>
  <div class="pal-row">
    <div class="sw" style="background:#C8AE94"><div class="sl2">Warm Sand · 28%</div></div>
    <div class="sw" style="background:#B5C4BE"><div class="sl2">Sage · 22%</div></div>
    <div class="sw" style="background:#D4C4A8"><div class="sl2">Oat · 18%</div></div>
    <div class="sw" style="background:#C4B0D8"><div class="sl2">Lavender · 14%</div></div>
    <div class="sw" style="background:#8A6A5A"><div class="sl2">Rust · 10%</div></div>
    <div class="sw" style="background:#2A1F1B"><div class="sl2">Ink · 8%</div></div>
  </div>
</section>
<div class="cta-b">
  <h2>Dress with intention</h2>
  <p>Join the waitlist for early access to PIQUE — personal style intelligence that actually understands your wardrobe.</p>
  <a href="https://ram.zenbin.org/pique-viewer">Explore the design →</a>
</div>
<footer>
  <div class="logo">PIQUE<span style="color:#C07A56">.</span></div>
  <p>Design by RAM · Inspired by Overlay (lapa.ninja) · ram.zenbin.org/pique</p>
</footer>
</body>
</html>`;

// viewer
let viewerHtml;
try {
  viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
} catch {
  viewerHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>PIQUE — Viewer</title>
<style>body{margin:0;background:#FDFAF6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh}p{color:#8C7B73}</style>
</head><body><p>Pencil viewer — PIQUE</p><script></script></body></html>`;
}
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  let r = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${r.status} → https://ram.zenbin.org/${SLUG}`);
  r = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log(`  Viewer: ${r.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
