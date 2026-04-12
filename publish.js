#!/usr/bin/env node
/**
 * RAM Design Studio — Publish to Zenbin
 * Usage: node publish.js <design.pen> [slug]
 *
 * Generates a Zenbin page with:
 * - Live canvas preview of all screens
 * - Download button for the .pen file
 */

const fs = require('fs');
const { execSync } = require('child_process');

const penFile = process.argv[2];
const slug = process.argv[3] || `ram-design-${Date.now()}`;

if (!penFile) {
  console.error('Usage: node publish.js <design.pen> [slug]');
  process.exit(1);
}

const penJson = fs.readFileSync(penFile, 'utf8');
const penDoc = JSON.parse(penJson);
const penB64 = Buffer.from(penJson, 'utf8').toString('base64');
const appName = penFile.replace(/\.pen$/, '').replace(/^.*\//, '');
const screenCount = (penDoc.children || []).length;
const varCount = Object.keys(penDoc.variables || {}).length;
const version = penDoc.version || '2.8';

const rendererHtml = fs.readFileSync('/workspace/group/design-studio/renderer.html', 'utf8');

// Inject pen data and add download button into renderer
const page = rendererHtml
  .replace('<title>RAM Design Studio — Canvas Renderer</title>',
    `<title>${appName} — RAM Design Studio</title>`)
  .replace('<div class="logo">> ram design studio</div>',
    `<div class="logo">> ram design studio / ${appName.toLowerCase()}</div>`)
  // Add download button styles
  .replace('</style>', `
  #toolbar {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .dl-btn {
    background: #00ffcc;
    color: #0a0a0f;
    border: none;
    padding: .5rem 1.2rem;
    font-family: inherit;
    font-size: .8rem;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
    letter-spacing: .05em;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: .4rem;
  }
  .dl-btn:hover { background: #00e6b8; }
  .dl-btn.outline {
    background: transparent;
    border: 1px solid #00ffcc33;
    color: #00ffcc;
  }
  .dl-btn.outline:hover { background: #00ffcc11; }
</style>`)
  // Add toolbar after app-info div
  .replace('<div id="screens-container"></div>', `
<div id="toolbar">
  <button class="dl-btn" id="dl-pen">⬇ Download ${appName}.pen</button>
  <span class="app-meta">${screenCount} screens · ${varCount} variables · v${version}</span>
</div>
<div id="screens-container"></div>`)
  // Inject the pen data and auto-render script before closing body
  .replace('</body>', `
<script>
// ─── Embedded design data ─────────────────────────────────────────────────────
(function() {
  const b64 = "${penB64}";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const json = new TextDecoder().decode(arr);

  // Auto-render immediately
  try {
    renderPen(JSON.parse(json));
    document.getElementById('drop-zone').style.display = 'none';
  } catch(e) { console.error('Render error:', e); }

  // Download button
  document.getElementById('dl-pen').addEventListener('click', function() {
    const blob = new Blob([arr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '${appName}.pen';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
</script>
</body>`);

// Write payload and POST to Zenbin
const payload = JSON.stringify({
  title: `${appName} — RAM Design Studio`,
  html: page,
});

fs.writeFileSync('/tmp/publish_payload.json', payload);
console.log(`📦 Payload: ${(payload.length / 1024).toFixed(1)} KB`);

const result = execSync(
  `curl -s -X POST https://zenbin.org/v1/pages/${slug} -H "Content-Type: application/json" --data-binary @/tmp/publish_payload.json`
).toString();

const res = JSON.parse(result);
if (res.url) {
  console.log(`\n✅ Published!`);
  console.log(`🔗 ${res.url}`);
  console.log(`📥 .pen download included on page`);
} else {
  console.error('❌ Publish failed:', result);
}
