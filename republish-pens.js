/**
 * republish-pens.js — same page as publish-pen-downloads.js but with new slugs
 * for the fully-fixed .pen files (added unique id on every node + transparent fill fix)
 */

const fs = require('fs');
const https = require('https');

function post(slug, title, html) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, slug }));
    });
    req.on('error', e => resolve({ status: 0, slug, error: e.message }));
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildPage(config) {
  const { penFile, filename, title, subtitle, screens, palette } = config;
  const penJson = fs.readFileSync(penFile, 'utf8');
  const sizeKB = (penJson.length / 1024).toFixed(1);
  const nodeCount = (penJson.match(/"id":/g) || []).length;

  const escaped = penJson
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');

  const screenList = screens.map((s, i) =>
    `<div class="screen-item"><span class="screen-num">${i + 1}</span><span class="screen-name">${s}</span></div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — pencil.dev design</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d0d14;color:#e8e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px}
  .card{background:#13131f;border:1px solid #1e1e30;border-radius:20px;padding:48px;max-width:560px;width:100%;text-align:center}
  .icon{font-size:48px;margin-bottom:20px;line-height:1}
  h1{font-size:24px;font-weight:700;margin-bottom:8px;color:#f0f0ff}
  .subtitle{font-size:15px;color:#888;margin-bottom:32px;line-height:1.5}
  .screens{display:flex;flex-direction:column;gap:8px;margin-bottom:32px;text-align:left;background:#0a0a12;border:1px solid #1a1a28;border-radius:12px;padding:16px}
  .screen-item{display:flex;align-items:center;gap:10px;padding:6px 0}
  .screen-num{width:22px;height:22px;background:#1e1e30;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#6060a0;flex-shrink:0}
  .screen-name{font-size:13px;color:#c0c0d8}
  .meta{display:flex;justify-content:center;gap:12px;margin-bottom:32px;flex-wrap:wrap}
  .badge{background:#1a1a2a;border:1px solid #2a2a3a;border-radius:8px;padding:5px 12px;font-size:11px;color:#8080a0;font-family:monospace}
  .badge b{color:#c0c0e0}
  .btn-download{display:block;width:100%;padding:14px 24px;background:${palette.primary};border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .15s;margin-bottom:12px;letter-spacing:.01em}
  .btn-download:hover{opacity:.88}
  .btn-copy{display:block;width:100%;padding:12px 24px;background:transparent;border:1px solid #2a2a3a;border-radius:12px;color:#8080a0;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;margin-bottom:24px}
  .btn-copy:hover{border-color:#4040a0;color:#c0c0e0}
  .instructions{font-size:12px;color:#505070;line-height:1.7;text-align:left;border-top:1px solid #1a1a28;padding-top:20px}
  .instructions strong{color:#8080a0}
  .instructions ol{padding-left:16px;margin-top:8px}
  .instructions li{margin-bottom:4px}
  .success-msg{display:none;color:#00cc66;font-size:12px;margin-top:-16px;margin-bottom:16px;text-align:center}
</style>
</head>
<body>
<div class="card">
  <div class="icon">${palette.icon}</div>
  <h1>${title}</h1>
  <p class="subtitle">${subtitle}</p>

  <div class="screens">${screenList}</div>

  <div class="meta">
    <div class="badge">pencil.dev v<b>2.8</b></div>
    <div class="badge"><b>${screens.length}</b> screens</div>
    <div class="badge"><b>${sizeKB} KB</b></div>
    <div class="badge"><b>${nodeCount}</b> nodes</div>
  </div>

  <button class="btn-download" onclick="downloadPen()">&#11015; Download ${filename}</button>
  <button class="btn-copy" onclick="copyJson()">Copy JSON to clipboard</button>
  <div class="success-msg" id="copy-msg">Copied to clipboard!</div>

  <div class="instructions">
    <strong>How to open in Pencil:</strong>
    <ol>
      <li>Click <em>Download</em> above to save <code>${filename}</code></li>
      <li>Open your IDE (Cursor / VS Code / Claude Code) with the Pencil extension</li>
      <li>Use <strong>File &rarr; Open</strong> in the Pencil panel and select the file</li>
    </ol>
  </div>
</div>

<script type="application/json" id="pen-data">${escaped}</script>
<script>
  function getPenData() {
    return document.getElementById('pen-data').textContent;
  }
  function downloadPen() {
    const json = getPenData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '${filename}';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function copyJson() {
    const json = getPenData();
    navigator.clipboard.writeText(json).then(function() {
      var msg = document.getElementById('copy-msg');
      msg.style.display = 'block';
      setTimeout(function() { msg.style.display = 'none'; }, 2500);
    }).catch(function() {
      alert('Copy failed — please use the Download button instead.');
    });
  }
</script>
</body>
</html>`;
}

async function main() {
  const pages = [
    {
      slug: 'geo-signal-dl',
      penFile: 'geo-signal.pen',
      filename: 'geo-signal.pen',
      title: 'GEO Signal — Dark Analytics',
      subtitle: 'Bloomberg Terminal meets Linear. Dense data, sharp edges, navy/blue palette.',
      screens: ['Signal — Dashboard', 'Signal — Scan Results', 'Signal — Competitor Intel', 'Signal — Alert Inbox'],
      palette: { primary: '#3b5bdb', icon: '📡' },
    },
    {
      slug: 'geo-radar-dl',
      penFile: 'geo-radar.pen',
      filename: 'geo-radar.pen',
      title: 'GEO Radar — Clean SaaS',
      subtitle: 'Light cream/indigo. Approachable, structured, citation map at center.',
      screens: ['Radar — Overview', 'Radar — Prompt Library', 'Radar — Citation Map', 'Radar — Reports'],
      palette: { primary: '#6741d9', icon: '🔭' },
    },
    {
      slug: 'geo-pulse-dl',
      penFile: 'geo-pulse.pen',
      filename: 'geo-pulse.pen',
      title: 'GEO Pulse — Neon Dev Tool',
      subtitle: 'Dark terminal aesthetic, neon green. Built for developers who live in the CLI.',
      screens: ['Pulse — Live Dashboard', 'Pulse — Run Scan (Terminal)', 'Pulse — Accuracy Report', 'Pulse — SOV Battle'],
      palette: { primary: '#00cc66', icon: '⚡' },
    },
    {
      slug: 'hive-cyberpunk-dl',
      penFile: 'hive-cyberpunk.pen',
      filename: 'hive-cyberpunk.pen',
      title: 'Hive — Neon Cyberpunk',
      subtitle: 'Distributed computing with attitude. Hot magenta, electric cyan, neon green.',
      screens: ['01 — Hero', '02 — Terminal', '03 — Features', '04 — Deploy CTA'],
      palette: { primary: '#ff0080', icon: '🦾' },
    },
    {
      slug: 'vault-app-dl',
      penFile: 'vault-app.pen',
      filename: 'vault-app.pen',
      title: 'Vault — Finance App',
      subtitle: 'Dark heist-themed personal finance app. Green on black, terminal energy.',
      screens: ['Vault — Dashboard', 'Vault — Add Transaction', 'Vault — Heist Targets', 'Vault — Stats', 'Vault — Weekly Win'],
      palette: { primary: '#1ce585', icon: '💰' },
    },
  ];

  console.log('Publishing fully-fixed .pen download pages...\n');
  for (const p of pages) {
    const html = buildPage(p);
    const r = await post(p.slug, p.title, html);
    const icon = r.status === 201 ? '✅' : r.status === 409 ? '⚠️  slug taken' : '❌';
    console.log(`${icon} ${p.slug} — HTTP ${r.status}  (${(html.length/1024).toFixed(0)} KB)`);
    if (r.status === 201) console.log(`   https://zenbin.org/p/${p.slug}`);
    await sleep(2500);
  }
  console.log('\nAll done!');
}

main().catch(console.error);
