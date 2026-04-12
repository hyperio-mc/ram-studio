// vega-viewer.mjs — Publish VEGA viewer only

import fs from 'fs';
import https from 'https';

const SLUG = 'vega';
const APP_NAME = 'VEGA';

const P = {
  bg: '#080C14', surface: '#0F1521', border: '#1E2A3D',
  text: '#E6EDF8', muted: '#5C6B82', accent: '#4F87FF',
  green: '#00E5A0', warn: '#FF6B3D',
};

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VEGA — Agent Console Screens</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${P.bg}; font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 48px 16px; }
  .v-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .v-hex { width: 22px; height: 22px; background: ${P.accent}; clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%); }
  h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: ${P.text}; }
  p  { font-size: 13px; color: ${P.muted}; margin-bottom: 28px; letter-spacing: -0.1px; }
  #screen-nav { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
  .screen-btn { background: ${P.surface}; border: 1px solid ${P.border}; color: ${P.text}; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all .15s; font-family: 'Inter', sans-serif; letter-spacing: -0.1px; }
  .screen-btn.active { background: ${P.accent}; border-color: ${P.accent}; color: #fff; }
  #render { width: 390px; height: 844px; background: ${P.bg}; border: 1px solid ${P.border}; border-radius: 36px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.7); position: relative; }
  .loading { padding: 40px; text-align: center; color: ${P.muted}; font-size: 13px; }
  .back-link { font-size: 12px; color: ${P.accent}; text-decoration: none; margin-top: 24px; letter-spacing: -0.1px; }
</style>
</head>
<body>
<div class="v-logo"><div class="v-hex"></div><h1>VEGA</h1></div>
<p>Agent orchestration console · 5 screens</p>
<div id="screen-nav"></div>
<div id="render"><div class="loading">Loading VEGA screens…</div></div>
<a class="back-link" href="https://ram.zenbin.org/vega">← Back to hero</a>
<script>
window.VEGA_PLACEHOLDER = true;
</script>
<script>
(function() {
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderNode(node, offsetX, offsetY) {
    offsetX = offsetX||0; offsetY = offsetY||0;
    if (!node) return '';
    const x = (node.x||0) + offsetX;
    const y = (node.y||0) + offsetY;
    const w = node.width||0;
    const h = node.height||0;
    const fill = node.fill || 'transparent';
    const opacity = node.opacity !== undefined ? node.opacity : 1;
    const r = node.cornerRadius||0;
    let html = '';

    if (node.type === 'RECTANGLE') {
      const stroke = node.stroke ? 'border:' + (node.strokeWidth||1) + 'px solid ' + node.stroke + ';' : '';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:'+r+'px;'+stroke+'opacity:'+opacity+';"></div>';
    } else if (node.type === 'ELLIPSE') {
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:50%;opacity:'+opacity+';"></div>';
    } else if (node.type === 'TEXT') {
      const fw = node.fontWeight||'400';
      const fs = (node.fontSize||14) + 'px';
      const ff = node.fontFamily||'Inter';
      const tc = node.fill||'#fff';
      const ls = (node.letterSpacing||0) + 'px';
      const lh = node.lineHeight||1.3;
      const tw = (node.width||200) + 'px';
      const ta = node.align||'left';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+tw+';font-family:'+esc(ff)+',sans-serif;font-size:'+fs+';font-weight:'+fw+';color:'+esc(tc)+';letter-spacing:'+ls+';line-height:'+lh+';text-align:'+ta+';white-space:pre-wrap;opacity:'+opacity+';">'+esc(node.content||'')+'</div>';
    } else if (node.type === 'LINE') {
      const dx = (node.x2||0) - (node.x||0);
      const dy = (node.y2||0) - (node.y||0);
      const len = Math.sqrt(dx*dx+dy*dy);
      const ang = Math.atan2(dy,dx)*180/Math.PI;
      const stroke = node.stroke||'#333';
      const sw = node.strokeWidth||1;
      const dash = node.strokeDash ? 'border-top:'+sw+'px dashed '+stroke+';' : 'border-top:'+sw+'px solid '+stroke+';';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+len+'px;height:0;transform-origin:0 0;transform:rotate('+ang+'deg);'+dash+'opacity:'+opacity+';"></div>';
    } else if (node.type === 'GROUP') {
      const gx = (node.x||0)+offsetX;
      const gy = (node.y||0)+offsetY;
      if (node.children) {
        for (const child of node.children) html += renderNode(child, gx, gy);
      }
    }

    if (node.type === 'RECTANGLE' && node.children) {
      for (const child of node.children) html += renderNode(child, x, y);
    }
    return html;
  }

  function renderScreen(screen) {
    let html = '<div style="position:relative;width:390px;height:844px;background:' + (screen.fill||'#080C14') + ';overflow:hidden;">';
    const nodes = screen.children || [];
    for (const node of nodes) html += renderNode(node, 0, 0);
    html += '</div>';
    return html;
  }

  function init() {
    const rawPen = window.EMBEDDED_PEN;
    if (!rawPen) { document.getElementById('render').innerHTML = '<div class="loading">No pen data found.</div>'; return; }
    const pen = typeof rawPen === 'string' ? JSON.parse(rawPen) : rawPen;
    const screens = pen.screens || [];
    const nav = document.getElementById('screen-nav');
    const render = document.getElementById('render');
    let current = 0;

    screens.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i===0?' active':'');
      btn.textContent = s.name || ('Screen '+(i+1));
      btn.onclick = () => {
        current = i;
        render.innerHTML = renderScreen(screens[i]);
        document.querySelectorAll('.screen-btn').forEach((b,j) => b.className='screen-btn'+(j===i?' active':''));
      };
      nav.appendChild(btn);
    });

    if (screens.length > 0) render.innerHTML = renderScreen(screens[0]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
</body>
</html>`;

// Inject pen data
const penJson = fs.readFileSync('/workspace/group/design-studio/vega.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace(
  '<script>\nwindow.VEGA_PLACEHOLDER = true;\n</script>',
  injection
);

console.log('📱 Publishing VEGA viewer...');
const r = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Agent Console Screens`);
if (r.status===200||r.status===201) console.log(`✓ Viewer live: https://ram.zenbin.org/${SLUG}-viewer`);
else console.log(`✗ Viewer ${r.status}: ${r.body.slice(0,100)}`);
