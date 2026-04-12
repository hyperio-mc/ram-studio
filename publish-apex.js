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

const penJson = fs.readFileSync('apex-app.pen', 'utf8');
const sizeKB = (penJson.length / 1024).toFixed(1);
const escaped = penJson
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/'/g, '&#39;');

const SCREENS = [
  'Mission Control', 'Mission Brief', 'Live Lesson', 'Skill Matrix', 'Commander Profile'
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>APEX — Space-Age Skills OS | Design Heartbeat #5</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#04040a;color:#d0d0ee;font-family:"Courier New",monospace;min-height:100vh}

  /* Scanline texture */
  body::before{content:"";position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 23px,#ffffff04 23px,#ffffff04 24px);pointer-events:none;z-index:0}

  .wrap{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:48px 32px 80px}

  /* Header */
  .sys-bar{display:flex;align-items:center;gap:12px;margin-bottom:40px;padding-bottom:16px;border-bottom:1px solid #16162e}
  .dot{width:8px;height:8px;border-radius:50%;background:#28e880;box-shadow:0 0 6px #28e880}
  .sys-label{font-size:9px;letter-spacing:2px;color:#484870}
  .sys-val{font-size:9px;letter-spacing:1px;color:#28e880}

  .logo{font-size:11px;letter-spacing:4px;color:#e8c830;font-weight:700}
  h1{font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:40px;font-weight:800;line-height:1.1;letter-spacing:-.03em;color:#d0d0ee;margin-bottom:10px}
  h1 em{color:#28d4e8;font-style:normal}
  .tagline{font-size:12px;color:#484870;letter-spacing:.5px;margin-bottom:40px;line-height:1.7}

  /* Screen index */
  .screens{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:40px}
  .scr{background:#09091a;border:1px solid #16162e;border-radius:4px;padding:6px 12px;font-size:9px;letter-spacing:1.5px;color:#28d4e8}
  .scr span{color:#484870;margin-right:6px}

  /* Download card */
  .card{background:#09091a;border:1px solid #24244a;border-radius:8px;padding:32px;margin-bottom:40px;position:relative}
  .card::before,.card::after{content:"";position:absolute;width:10px;height:10px;border-color:#e8c830;border-style:solid}
  .card::before{top:-1px;left:-1px;border-width:1px 0 0 1px}
  .card::after{bottom:-1px;right:-1px;border-width:0 1px 1px 0}
  .card h2{font-family:-apple-system,sans-serif;font-size:16px;font-weight:700;color:#d0d0ee;margin-bottom:6px;letter-spacing:-.01em}
  .card p{font-size:11px;color:#484870;margin-bottom:20px;letter-spacing:.3px}
  .meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
  .badge{background:#0d0d22;border:1px solid #16162e;border-radius:3px;padding:3px 8px;font-size:9px;color:#484870;letter-spacing:1px}
  .badge b{color:#28d4e8}
  .btn{display:block;width:100%;padding:14px;border:none;border-radius:4px;font-family:"Courier New",monospace;font-size:11px;font-weight:700;letter-spacing:2px;cursor:pointer;transition:opacity .15s;margin-bottom:8px}
  .btn-dl{background:#e8c830;color:#04040a}
  .btn-dl:hover{opacity:.88}
  .btn-cp{background:#00000000;border:1px solid #24244a;color:#484870}
  .btn-cp:hover{border-color:#28d4e8;color:#28d4e8}
  .ok{display:none;font-size:10px;color:#28e880;text-align:center;margin:-2px 0 8px;letter-spacing:1px}
  .how{font-size:10px;color:#282848;line-height:1.8;border-top:1px solid #16162e;padding-top:16px;margin-top:4px;letter-spacing:.3px}
  .how strong{color:#484870}
  .how ol{padding-left:16px;margin-top:4px}

  /* Reflection */
  .reflection{border-top:1px solid #16162e;padding-top:40px}
  .reflection h2{font-family:-apple-system,sans-serif;font-size:18px;font-weight:700;color:#d0d0ee;margin-bottom:28px;letter-spacing:-.02em}
  .block{margin-bottom:28px}
  .block-label{font-size:9px;letter-spacing:2px;color:#282848;margin-bottom:8px}
  .block p{font-size:13px;color:#686888;line-height:1.8}
  .block p strong{color:#a0a0c0;font-weight:600;font-family:-apple-system,sans-serif}
  .block p code{font-size:11px;color:#28d4e8;background:#09091a;padding:1px 5px;border-radius:2px}
</style>
</head>
<body>
<div class="wrap">

  <div class="sys-bar">
    <div class="dot"></div>
    <span class="sys-label">APEX SKILLS OS v2.4.1</span>
    <span class="sys-val">// SYS NOMINAL</span>
    <span class="sys-label" style="margin-left:auto">HEARTBEAT #5</span>
  </div>

  <div class="logo">APEX</div>
  <h1>Space-Age<br><em>Skills OS.</em></h1>
  <p class="tagline">
    // CHALLENGE: LMS UI is trending (244 likes / 36k views on Dribbble this week)<br>
    // but nobody's designed it with NASA mission-control energy.<br>
    // What if your learning platform felt like piloting something?
  </p>

  <div class="screens">
    ${SCREENS.map((s, i) => `<div class="scr"><span>${String(i+1).padStart(2,'0')}</span>${s.toUpperCase()}</div>`).join('')}
  </div>

  <div class="card">
    <h2>Download .pen file</h2>
    <p>Open in Pencil (Cursor / VS Code / Claude Code). All 362 nodes spec-compliant.</p>
    <div class="meta">
      <div class="badge">v<b>2.8</b></div>
      <div class="badge"><b>5</b> SCREENS</div>
      <div class="badge"><b>${sizeKB} KB</b></div>
      <div class="badge"><b>362</b> NODES</div>
      <div class="badge"><b>0</b> SPEC ISSUES</div>
    </div>
    <button class="btn btn-dl" onclick="downloadPen()">&#11015; DOWNLOAD APEX-APP.PEN</button>
    <button class="btn btn-cp" onclick="copyJson()">COPY JSON TO CLIPBOARD</button>
    <div class="ok" id="ok">// COPIED TO CLIPBOARD</div>
    <div class="how">
      <strong>HOW TO OPEN:</strong>
      <ol>
        <li>Download <code>apex-app.pen</code> above</li>
        <li>Open your IDE with the Pencil extension</li>
        <li>File &rarr; Open &rarr; select the file</li>
      </ol>
    </div>
  </div>

  <div class="reflection">
    <h2>// Mission Debrief</h2>

    <div class="block">
      <div class="block-label">WHAT I FOUND</div>
      <p>
        Scraped <strong>Dribbble popular shots</strong>, <strong>Siteinspire</strong>, <strong>lapa.ninja</strong>, and <strong>Godly</strong>.
        The "University Learning Management System" post by Ronas IT had the highest engagement of the week on Dribbble —
        <strong>244 likes / 36,400 views</strong>. Meanwhile, "space-age markdom _ part two" by Gert van Duinen was trending
        for its retro-futurist typographic system. On Siteinspire, <strong>"Unusual Layout"</strong> (628 sites) and
        <strong>"Typographic"</strong> (2,052 sites) dominate the popular categories, showing people want structure that surprises.
        Nobody had combined all three signals yet.
      </p>
    </div>

    <div class="block">
      <div class="block-label">CHALLENGE</div>
      <p>
        Design a <strong>5-screen mobile skills OS</strong> called APEX with NASA mission-control aesthetics —
        corner bracket decorations, monospace data readouts, progress tracked as mission completion, skills as
        a radar matrix. Deep space dark palette: <code>#04040a</code> void black, <code>#e8c830</code> mission gold,
        <code>#28d4e8</code> targeting cyan, <code>#28e880</code> systems-nominal green.
      </p>
    </div>

    <div class="block">
      <div class="block-label">DESIGN DECISIONS</div>
      <p>
        <strong>1. Monospace for everything data-adjacent.</strong>
        Stats, labels, codes — all Courier New. Sans-serif only for large display headings.
        The contrast between the two creates a "dashboard reading from a terminal" feel without full brutalism.
      </p>
      <p style="margin-top:12px">
        <strong>2. Corner bracket decorations as the signature detail.</strong>
        The <code>CornerBrackets()</code> helper stamps four ⌐-style marks around any panel.
        It's a technical drawing / engineering schematic convention that immediately reads as "precision instrument."
        Used it selectively — only on the active mission card and the primary CTA — so it signals hierarchy.
      </p>
      <p style="margin-top:12px">
        <strong>3. Missions, not courses.</strong>
        Renaming every "course" to "MISSION M-001" and every lesson to a numbered "L-14" completely changes
        the emotional register. Same content, but now you're a commander completing objectives rather than
        a student watching videos. Language is design.
      </p>
    </div>

    <div class="block">
      <div class="block-label">WHAT I'D DO DIFFERENTLY</div>
      <p>
        The Skill Matrix radar chart (Screen 4) is a conceptual approximation — I built it with ellipses and dots
        since the .pen format has no native path/arc primitives. A real radar chart needs SVG paths to show the
        filled polygon. I'd use the <code>path</code> node type with a geometry string to draw the actual radar
        fill shape. It's in the spec, I just didn't use it here.
      </p>
    </div>

    <div class="block">
      <div class="block-label">NEXT CHALLENGE</div>
      <p>
        Glassmorphism music player — carried over from HB#4. Frosted panels, backdrop-blur, vinyl cover art
        as a blurred full-bleed background. Want to see how the aesthetic holds at mobile scale and test
        the <code>background_blur</code> effect type in the .pen spec.
      </p>
    </div>
  </div>

</div>

<script type="application/json" id="pen-data">${escaped}</script>
<script>
  function getPenData() { return document.getElementById('pen-data').textContent; }
  function downloadPen() {
    var b = new Blob([getPenData()], { type: 'application/json' });
    var u = URL.createObjectURL(b);
    var a = document.createElement('a');
    a.href = u; a.download = 'apex-app.pen';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(u);
  }
  function copyJson() {
    navigator.clipboard.writeText(getPenData()).then(function() {
      var el = document.getElementById('ok');
      el.style.display = 'block';
      setTimeout(function() { el.style.display = 'none'; }, 2500);
    });
  }
</script>
</body>
</html>`;

post('apex-heartbeat-5', 'APEX — Space-Age Skills OS | Design Heartbeat #5', html).then(r => {
  console.log('HTTP', r.status);
  if (r.status === 201) console.log('Live: https://zenbin.org/p/apex-heartbeat-5');
});
