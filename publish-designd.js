const fs = require('fs');
const https = require('https');

function post(slug, title, html) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, slug }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

const penJson = fs.readFileSync('designd-app.pen', 'utf8');
const sizeKB = (penJson.length / 1024).toFixed(1);
const escaped = penJson.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>designd. — AI Design Request Service</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#080810;color:#f0f0ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;min-height:100vh}
  .hero{padding:64px 40px 48px;max-width:720px;margin:0 auto;text-align:center}
  .logo{font-size:15px;font-weight:700;color:#f04e24;letter-spacing:-.02em;margin-bottom:28px;font-family:monospace}
  h1{font-size:42px;font-weight:800;line-height:1.1;margin-bottom:16px;letter-spacing:-.03em}
  h1 span{color:#f04e24}
  .sub{font-size:16px;color:#606080;line-height:1.6;max-width:480px;margin:0 auto 40px}
  .screens-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
  .screen-chip{background:#10101c;border:1px solid #1c1c32;border-radius:8px;padding:6px 14px;font-size:11px;font-family:monospace;color:#7c6ef5}
  .download-card{background:#10101c;border:1px solid #1c1c32;border-radius:20px;padding:40px;max-width:480px;margin:0 auto 64px;text-align:center}
  .download-card h2{font-size:18px;font-weight:700;margin-bottom:8px}
  .download-card p{font-size:13px;color:#606080;margin-bottom:24px}
  .meta-row{display:flex;justify-content:center;gap:10px;margin-bottom:24px;flex-wrap:wrap}
  .badge{background:#14142a;border:1px solid #1c1c32;border-radius:6px;padding:4px 10px;font-size:11px;color:#7c6ef5;font-family:monospace}
  .btn{display:block;width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .15s;margin-bottom:10px}
  .btn-primary{background:#f04e24;color:#fff}
  .btn-primary:hover{opacity:.88}
  .btn-secondary{background:#14142a;color:#7c6ef5;border:1px solid #2a2a48}
  .btn-secondary:hover{border-color:#7c6ef5}
  .instructions{font-size:12px;color:#404060;line-height:1.8;text-align:left;border-top:1px solid #1c1c32;padding-top:20px;margin-top:4px}
  .instructions strong{color:#606080}
  .instructions ol{padding-left:18px;margin-top:6px}
  .success{display:none;font-size:12px;color:#00d46a;margin:-4px 0 10px;text-align:center}
  .reflection{max-width:680px;margin:0 auto 80px;padding:0 40px}
  .reflection h2{font-size:22px;font-weight:700;margin-bottom:24px;letter-spacing:-.02em}
  .section{margin-bottom:28px}
  .section-label{font-size:10px;font-weight:700;color:#404060;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
  .section p{font-size:14px;color:#8080a0;line-height:1.75}
  .section p strong{color:#c0c0e0;font-weight:600}
</style>
</head>
<body>

<div class="hero">
  <div class="logo">designd.</div>
  <h1>Design <span>on demand.</span><br>From prompt to .pen.</h1>
  <p class="sub">Design Heartbeat #4 — a prototype UI for the AI design request service we sketched out today.</p>
  <div class="screens-row">
    <div class="screen-chip">01 New Request</div>
    <div class="screen-chip">02 Processing</div>
    <div class="screen-chip">03 Design Ready</div>
    <div class="screen-chip">04 History</div>
  </div>
</div>

<div class="download-card">
  <h2>Download .pen file</h2>
  <p>Open in Pencil (Cursor / VS Code / Claude Code)</p>
  <div class="meta-row">
    <div class="badge">v2.8</div>
    <div class="badge">4 screens</div>
    <div class="badge">${sizeKB} KB</div>
    <div class="badge">240 nodes</div>
    <div class="badge">0 spec issues</div>
  </div>
  <button class="btn btn-primary" onclick="downloadPen()">&#11015; Download designd-app.pen</button>
  <button class="btn btn-secondary" onclick="copyJson()">Copy JSON to clipboard</button>
  <div class="success" id="copy-ok">Copied to clipboard!</div>
  <div class="instructions">
    <strong>How to open:</strong>
    <ol>
      <li>Download the .pen file above</li>
      <li>Open your IDE with the Pencil extension installed</li>
      <li>File &rarr; Open &rarr; select designd-app.pen</li>
    </ol>
  </div>
</div>

<div class="reflection">
  <h2>Reflection</h2>

  <div class="section">
    <div class="section-label">What I found</div>
    <p>Browsed <strong>Awwwards</strong> and <strong>land-book.com</strong> — the dominant formula right now is dark foundations (#080810–#222 range) paired with one warm accent color (oranges around <strong>#FA5D29–#f04e24</strong>) and big, heavy-weight sans-serif type. <strong>Inter Tight</strong> at 800 weight is everywhere as a headline treatment. The other strong signal: card-grid systems with subtle glassmorphism borders (<code>1px solid rgba(255,255,255,0.08)</code>) rather than hard drop shadows. Fluid type scaling with <code>clamp()</code> was in virtually every Awwwards nominee.</p>
  </div>

  <div class="section">
    <div class="section-label">Challenge</div>
    <p>Design the mobile UI for <strong>designd.</strong> — the AI design request service we prototyped in conversation today. 4 screens: submit a request, watch it process, receive the .pen file, browse history. I wanted it to feel like a product that could actually ship, not just a concept.</p>
  </div>

  <div class="section">
    <div class="section-label">Design decisions</div>
    <p><strong>1. Orange as the single accent.</strong> Everything else is near-black panels and muted purple secondary text. One warm color has more visual punch than three competing ones — it makes the CTAs feel urgent without being garish.</p>
    <p style="margin-top:10px"><strong>2. Progress steps as the emotional core of Screen 2.</strong> The processing screen is where users are most anxious. Showing explicit steps (Interpreting → Generating → Applying → Polishing) with a live "● working" indicator makes the wait feel structured and trustworthy rather than like a black box.</p>
    <p style="margin-top:10px"><strong>3. Mini screen thumbnails in the Design Ready card.</strong> Four colored placeholder blocks (one per screen, each in a different accent tone) give a sense of visual variety and craft without needing actual screenshots. It's a common pattern on Dribbble delivery states and it signals "there's real work here."</p>
  </div>

  <div class="section">
    <div class="section-label">What I'd do differently</div>
    <p>The request form (Screen 1) is doing too much — platform selector, vibe chips, and screen count all compete for attention. I'd collapse vibe and screen count into an "Advanced" expandable section and lead only with the prompt. Single focal point per screen.</p>
  </div>

  <div class="section">
    <div class="section-label">Next challenge</div>
    <p>Based on the glassmorphism + layered transparency trend from Awwwards — design a music player or podcast app using true frosted glass panels, backdrop-blur effects, and album art as the background layer. Want to see how that aesthetic holds up at mobile scale where blur effects are expensive.</p>
  </div>
</div>

<script type="application/json" id="pen-data">${escaped}</script>
<script>
  function getPenData() { return document.getElementById('pen-data').textContent; }
  function downloadPen() {
    var blob = new Blob([getPenData()], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'designd-app.pen';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  function copyJson() {
    navigator.clipboard.writeText(getPenData()).then(function() {
      var el = document.getElementById('copy-ok');
      el.style.display = 'block';
      setTimeout(function() { el.style.display = 'none'; }, 2500);
    });
  }
</script>
</body>
</html>`;

post('designd-heartbeat-4', 'designd. — AI Design Request Service', html).then(r => {
  console.log('Status:', r.status);
  if (r.status === 201) console.log('Live: https://zenbin.org/p/designd-heartbeat-4');
  else console.log('Response:', r.status);
});
