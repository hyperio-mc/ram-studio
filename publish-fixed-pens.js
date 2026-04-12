/**
 * publish-fixed-pens.js
 * Publishes fixed .pen files as downloadable JSON pages on zenbin
 * and updated SVG preview renders
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
      res.on('end', () => resolve({ status: res.statusCode, slug, body: d.slice(0, 80) }));
    });
    req.on('error', e => resolve({ status: 0, slug, error: e.message }));
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Build SVG preview HTML for a .pen file
function buildPenPreview(penFile, title, description) {
  const pen = JSON.parse(fs.readFileSync(penFile, 'utf8'));
  const vars = pen.variables || {};

  function resolveColor(val) {
    if (!val || typeof val !== 'string') return '#888';
    if (val.startsWith('$')) {
      const varName = val.slice(1);
      const v = vars[varName];
      if (v && v.value && typeof v.value === 'string') return v.value;
    }
    if (val === 'transparent') return 'transparent';
    return val;
  }

  function nodeToSVG(node, offsetX = 0, offsetY = 0) {
    if (!node || !node.type) return '';
    const x = (node.x || 0) + offsetX;
    const y = (node.y || 0) + offsetY;
    const w = node.width || 0;
    const h = node.height || 0;
    const fill = resolveColor(node.fill);
    let svg = '';

    if (node.type === 'frame' || node.type === 'rectangle') {
      const r = node.cornerRadius || 0;
      const strokeObj = node.stroke;
      let strokeAttr = '';
      if (strokeObj && strokeObj.fill) {
        strokeAttr = `stroke="${resolveColor(strokeObj.fill)}" stroke-width="${strokeObj.thickness || 1}"`;
      }
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill === 'transparent' ? 'none' : fill}" ${strokeAttr} />`;
      if (node.children) {
        const childSVG = node.children.map(c => nodeToSVG(c, x, y)).join('');
        svg += childSVG;
      }
    } else if (node.type === 'ellipse') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rx = w / 2;
      const ry = h / 2;
      const strokeObj = node.stroke;
      let strokeAttr = '';
      if (strokeObj && strokeObj.fill) {
        strokeAttr = `stroke="${resolveColor(strokeObj.fill)}" stroke-width="${strokeObj.thickness || 1}"`;
      }
      svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill === 'transparent' ? 'none' : fill}" ${strokeAttr} />`;
    } else if (node.type === 'text') {
      const textFill = resolveColor(node.fill);
      const fs2 = Math.min(node.fontSize || 13, 14);
      const fw = node.fontWeight || '400';
      const ta = node.textAlign || 'left';
      let textX = x + 2;
      if (ta === 'center') textX = x + w / 2;
      if (ta === 'right') textX = x + w;
      const anchor = ta === 'center' ? 'middle' : ta === 'right' ? 'end' : 'start';
      const content = String(node.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 40);
      svg += `<text x="${textX}" y="${y + fs2 + 2}" font-size="${fs2}" font-weight="${fw}" fill="${textFill}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${content}</text>`;
    }
    return svg;
  }

  // Render all screens, scaled to fit
  const screens = pen.children || [];
  const SCALE = 0.5;
  const PAD = 16;
  const totalW = screens.length > 0 ? (screens[screens.length - 1].x + (screens[screens.length - 1].width || 375)) * SCALE + PAD * 2 : 800;
  const maxH = Math.max(...screens.map(s => (s.height || 812))) * SCALE + PAD * 2;

  const svgContent = screens.map(screen => nodeToSVG(screen, PAD / SCALE, PAD / SCALE)).join('');

  const svgEl = `<svg viewBox="0 0 ${totalW / SCALE} ${maxH / SCALE}" width="${totalW}" height="${maxH}" xmlns="http://www.w3.org/2000/svg" style="display:block">${svgContent}</svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Pencil.dev Design</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0a0a0f;color:#f0f0f0;font-family:system-ui,sans-serif;min-height:100vh}
  .header{padding:32px 40px 20px;border-bottom:1px solid #1f1f2e}
  .header h1{font-size:22px;font-weight:700;margin-bottom:6px}
  .header p{font-size:14px;color:#888;max-width:600px}
  .meta{display:flex;gap:16px;margin-top:12px;flex-wrap:wrap}
  .badge{background:#1f1f2e;padding:4px 10px;border-radius:6px;font-size:11px;color:#aaa;font-family:monospace}
  .badge b{color:#e0e0e0}
  .canvas-wrap{padding:32px 40px;overflow-x:auto}
  .download{margin:0 40px 32px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .btn{display:inline-block;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer}
  .btn-primary{background:#6366f1;color:#fff}
  .btn-secondary{background:#1f1f2e;color:#e0e0e0;border:1px solid #2f2f4e}
  .note{font-size:12px;color:#666;margin-left:8px}
  .screens-info{font-size:12px;color:#888;padding:0 40px 24px}
  .screens-info span{display:inline-block;margin-right:16px;color:#aaa}
  .screen-label{font-size:11px;color:#666;font-family:monospace;margin-top:4px}
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <p>${description}</p>
  <div class="meta">
    <div class="badge">pencil.dev v<b>2.8</b></div>
    <div class="badge">screens: <b>${screens.length}</b></div>
    <div class="badge">format: <b>fixed (clip, stroke, textGrowth)</b></div>
  </div>
</div>
<div class="download">
  <span class="btn btn-secondary">Open in Pencil.dev IDE</span>
  <span class="note">Import the .pen file via File → Open in your Pencil IDE plugin</span>
</div>
<div class="screens-info">
  ${screens.map((s, i) => `<span>${i + 1}. ${s.name || 'Screen ' + (i+1)}</span>`).join('')}
</div>
<div class="canvas-wrap">${svgEl}</div>
</body>
</html>`;
}

async function main() {
  const toPublish = [
    { slug: 'geo-signal-v2', pen: 'geo-signal.pen', title: 'GEO Signal — Dark Analytics (Fixed)', desc: 'Bloomberg Terminal + Linear. Dark navy, blue accents. 4 screens: Dashboard, Scan Results, Competitor Intel, Alert Inbox.' },
    { slug: 'geo-radar-v2',  pen: 'geo-radar.pen',  title: 'GEO Radar — Clean SaaS (Fixed)', desc: 'Light cream/indigo SaaS design. 4 screens: Overview, Prompt Library, Citation Map, Reports.' },
    { slug: 'geo-pulse-v2',  pen: 'geo-pulse.pen',  title: 'GEO Pulse — Neon Dev Tool (Fixed)', desc: 'Dark terminal, neon green accents. 4 screens: Live Dashboard, Run Scan, Accuracy Report, SOV Battle.' },
    { slug: 'hive-cyberpunk-v3', pen: 'hive-cyberpunk.pen', title: 'Hive Neon Cyberpunk (Fixed)', desc: 'Hive distributed computing — neon cyberpunk aesthetic. 4 screens: Hero, Terminal, Features, Deploy CTA.' },
  ];

  console.log('Publishing fixed .pen previews to zenbin...\n');

  for (const item of toPublish) {
    const html = buildPenPreview(item.pen, item.title, item.desc);
    const r = await post(item.slug, item.title, html);
    const icon = r.status === 201 ? '✅' : r.status === 409 ? '⚠️ (slug taken)' : '❌';
    console.log(`${icon} ${item.slug} — HTTP ${r.status}`);
    if (r.status === 201) console.log(`   https://zenbin.org/p/${item.slug}`);
    await sleep(2500);
  }

  console.log('\nDone.');
}

main().catch(console.error);
