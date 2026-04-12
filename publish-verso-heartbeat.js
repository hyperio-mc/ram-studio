'use strict';
// publish-verso-heartbeat.js — Full Design Discovery pipeline for VERSO (Mar 23 2026)
// App: Verso — Personal Quarterly Review OS
// Theme: LIGHT — warm cream editorial, inspired by darkmodedesign.com + Land-book luxury whitespace trend

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'verso';
const VIEWER_SLUG = 'verso-viewer';
const APP_NAME    = 'Verso';
const TAGLINE     = 'Your life, in quarterly review.';
const ARCHETYPE   = 'personal-analytics';
const PROMPT      = 'Light editorial personal quarterly review OS. Warm cream #F5F1EA palette, Georgia serif display type, amber #C27A3C + sage #3A6358 accents. Inspired by Obsidian (dark editorial from darkmodedesign.com) inverted to luxury light, and Midday one-person company editorial aesthetic. 5 screens: Quarter Overview, Wealth, Health, Work, Quarterly Review.';

// ── HTTP helper ─────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, title, html, subdomain) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: '/v1/pages/' + slug,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain || 'ram',
    },
  }, body);
}

// ── SVG Thumbnail (renders pen elements to SVG preview) ──────────────────────
function screenThumbSVG(screen, tw, th) {
  var W = screen.width || 390;
  var H = screen.height || 844;
  var sx = tw / W, sy = th / H;

  function renderNode(node, depth) {
    if (depth > 12) return '';
    var x = (node.x || 0) * sx;
    var y = (node.y || 0) * sy;
    var w = Math.max(0, (node.width || 0) * sx);
    var h = Math.max(0, (node.height || 0) * sy);
    var fill = node.fill || 'transparent';
    var r = node.cornerRadius ? node.cornerRadius * Math.min(sx, sy) : 0;
    var out = '';

    if (node.type === 'rect' || node.type === 'frame') {
      if (fill !== 'transparent') {
        var strokeAttr = '';
        if (node.stroke && node.stroke !== 'transparent' && node.strokeWidth) {
          strokeAttr = ' stroke="' + node.stroke + '" stroke-width="' + (node.strokeWidth * Math.min(sx, sy)).toFixed(1) + '"';
        }
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + fill + '" rx="' + r.toFixed(1) + '"' + strokeAttr + '/>';
      }
    } else if (node.type === 'ellipse') {
      out += '<ellipse cx="' + (x + w/2).toFixed(1) + '" cy="' + (y + h/2).toFixed(1) + '" rx="' + (w/2).toFixed(1) + '" ry="' + (h/2).toFixed(1) + '" fill="' + fill + '"/>';
    } else if (node.type === 'text') {
      var fs2 = Math.max(3, (node.fontSize || 12) * Math.min(sx, sy));
      var tc = node.fill || node.color || '#1A1816';
      // support both 'text' (our generator) and 'content' (legacy)
      var raw = node.text || node.content || '';
      var safe = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 60);
      var fw = node.fontWeight || '400';
      var ff = (node.fontFamily === 'Georgia') ? 'Georgia,serif' : 'system-ui,sans-serif';
      out += '<text x="' + (x + 1).toFixed(1) + '" y="' + (y + fs2 * 0.85).toFixed(1) + '" font-size="' + fs2.toFixed(1) + '" fill="' + tc + '" font-family="' + ff + '" font-weight="' + fw + '">' + safe + '</text>';
    } else if (node.type === 'line') {
      var x1 = (node.x1 || 0) * sx, y1 = (node.y1 || 0) * sy;
      var x2 = (node.x2 || 0) * sx, y2 = (node.y2 || 0) * sy;
      var lc = node.stroke || '#E4DFDA';
      var lw = (node.strokeWidth || 1) * Math.min(sx, sy);
      out += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + lc + '" stroke-width="' + lw.toFixed(1) + '"/>';
    }

    var children = node.children || node.elements || [];
    children.forEach(function(c) { out += renderNode(c, depth + 1); });
    return out;
  }

  var bg = screen.background || screen.fill || '#F5F1EA';
  var elements = screen.elements || screen.children || [];
  var svgContent = elements.map(function(c) { return renderNode(c, 0); }).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + tw + '" height="' + th + '" viewBox="0 0 ' + tw + ' ' + th + '"><rect width="' + tw + '" height="' + th + '" fill="' + bg + '"/>' + svgContent + '</svg>';
}

// ── Hero HTML ───────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  var screens = penJson.screens || [];
  var screenLabels = ['Quarter', 'Wealth', 'Health', 'Work', 'Review'];

  var thumbs = screens.map(function(sc, i) {
    var svg = screenThumbSVG(sc, 195, 422);
    var svgB64 = Buffer.from(svg).toString('base64');
    return '<div class="screen-card" style="animation-delay:' + (i * 0.1) + 's"><div class="screen-label">' + (screenLabels[i] || 'Screen ' + (i+1)) + '</div><div class="screen-thumb"><img src="data:image/svg+xml;base64,' + svgB64 + '" width="195" height="422" alt="' + (screenLabels[i] || '') + '" loading="lazy"/></div></div>';
  }).join('');

  var heroThumbSVG = screens[0] ? screenThumbSVG(screens[0], 220, 478) : '';
  var heroThumbB64 = Buffer.from(heroThumbSVG).toString('base64');
  var shareText = encodeURIComponent('Verso — Your life, in quarterly review. Light editorial personal OS by @ram_design_ai');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verso — Your life, in quarterly review · RAM Design Studio</title><meta name="description" content="Light editorial personal quarterly review OS. Warm cream palette, Georgia serif display type, amber and sage accents. Inspired by Obsidian + Midday editorial aesthetics."><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F1EA;color:#1A1816;font-family:Inter,system-ui,sans-serif;min-height:100vh}a{text-decoration:none;color:inherit}nav{display:flex;align-items:center;justify-content:space-between;padding:18px 32px;border-bottom:1px solid #E4DFDA;background:rgba(245,241,234,.96);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100}.nav-logo{font-size:18px;font-weight:700;letter-spacing:-.03em;font-family:Georgia,serif}.nav-logo span{color:#C27A3C}.nav-meta{font-size:11px;color:#9A9490}.banner{background:linear-gradient(90deg,rgba(194,122,60,.12),rgba(58,99,88,.1));padding:10px 32px;text-align:center;border-bottom:1px solid #E4DFDA}.banner p{font-size:12px;font-weight:600;color:#C27A3C;letter-spacing:.06em}.hero{padding:72px 32px 56px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}.hero-label{font-size:11px;font-weight:700;letter-spacing:.12em;color:#C27A3C;margin-bottom:14px;text-transform:uppercase}.hero-title{font-size:52px;font-weight:300;line-height:1.1;letter-spacing:-.03em;color:#1A1816;margin-bottom:20px;font-family:Georgia,serif}.hero-title span{color:#C27A3C}.hero-sub{font-size:16px;line-height:1.65;color:#4A4642;margin-bottom:32px;max-width:420px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}.btn-p{background:#C27A3C;color:#FFF}.btn-p:hover{background:#A8662E}.btn-mock{background:#3A6358;color:#FFF}.btn-mock:hover{background:#2F5248}.btn-s{background:transparent;color:#4A4642;border:1.5px solid #E4DFDA}.btn-s:hover{border-color:#C27A3C;color:#C27A3C}.btn-x{background:transparent;color:#4A4642;border:1.5px solid #E4DFDA}.btn-x:hover{border-color:#C27A3C}.hero-visual{display:flex;justify-content:center}.phone-wrap{position:relative;width:220px;height:478px}.phone-shell{width:220px;height:478px;border-radius:36px;background:#EDE8DF;box-shadow:0 32px 80px rgba(26,24,22,.2),0 0 0 1px rgba(194,122,60,.15),0 2px 8px rgba(0,0,0,.08);overflow:hidden;border:2px solid rgba(194,122,60,.2)}.phone-screen{width:100%;height:100%;overflow:hidden}.phone-notch{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:70px;height:14px;background:#1A1816;border-radius:8px;z-index:10;opacity:.7}.inspiration{background:#FFF;border:1px solid #E4DFDA;border-radius:14px;padding:28px;margin:0 32px 40px;max-width:1036px;margin-left:auto;margin-right:auto}.inspiration h3{font-size:11px;font-weight:700;letter-spacing:.1em;color:#9A9490;text-transform:uppercase;margin-bottom:16px}.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.insp-item{padding:16px;background:#F5F1EA;border-radius:10px;border:1px solid #E4DFDA}.insp-site{font-size:11px;font-weight:700;color:#C27A3C;margin-bottom:6px}.insp-text{font-size:12px;line-height:1.55;color:#4A4642}.screens-section{padding:0 32px 64px;max-width:1100px;margin:0 auto}.section-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9A9490;margin-bottom:24px}.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}.screen-card{opacity:0;animation:fadeUp .5s ease forwards}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.screen-label{font-size:11px;font-weight:600;color:#9A9490;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}.screen-thumb{border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(26,24,22,.12);border:1px solid #E4DFDA;background:#EDE8DF}.screen-thumb img{display:block;width:100%;height:auto}.decisions{background:#FFF;border:1px solid #E4DFDA;border-radius:14px;padding:32px;margin:0 32px 64px;max-width:1036px;margin-left:auto;margin-right:auto}.decisions h3{font-size:11px;font-weight:700;letter-spacing:.1em;color:#9A9490;text-transform:uppercase;margin-bottom:20px}.decision-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.decision-item{padding:20px;background:#F5F1EA;border-radius:10px;border:1px solid #E4DFDA}.decision-num{font-size:11px;font-weight:700;color:#C27A3C;margin-bottom:8px;font-family:Georgia,serif}.decision-title{font-size:14px;font-weight:600;color:#1A1816;margin-bottom:6px}.decision-body{font-size:12px;line-height:1.6;color:#4A4642}.palette-section{padding:0 32px 64px;max-width:1100px;margin:0 auto}.palette-row{display:flex;gap:12px;flex-wrap:wrap}.swatch{display:flex;flex-direction:column;align-items:center;gap:8px}.swatch-dot{width:56px;height:56px;border-radius:50%;border:1.5px solid rgba(26,24,22,.1)}.swatch-name{font-size:10px;font-weight:600;color:#9A9490}.swatch-hex{font-size:10px;color:#9A9490;font-family:monospace}.quarter-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;color:#3A6358;letter-spacing:.08em;background:rgba(58,99,88,.1);padding:5px 12px;border-radius:20px}.quarter-dot{width:7px;height:7px;border-radius:50%;background:#3A6358}footer{padding:32px;text-align:center;border-top:1px solid #E4DFDA;color:#9A9490;font-size:12px}footer span{color:#C27A3C;font-weight:600}@media(max-width:768px){.hero{grid-template-columns:1fr;gap:32px;padding:40px 20px}.hero-title{font-size:36px}.screens-grid{grid-template-columns:repeat(2,1fr)}.insp-grid,.decision-grid{grid-template-columns:1fr}.hero-visual{display:none}}</style></head><body>'
    + '<nav><div class="nav-logo"><span>V</span>erso</div><div class="nav-meta">RAM Design Studio · March 2026 Heartbeat</div></nav>'
    + '<div class="banner"><p>◆ LIGHT THEME · PERSONAL QUARTERLY REVIEW · INSPIRED BY OBSIDIAN + MIDDAY EDITORIAL</p></div>'
    + '<div class="hero"><div class="hero-text"><div class="hero-label">RAM Design Heartbeat · Mar 2026</div><h1 class="hero-title">Your life, in<br>quarterly <span>review.</span></h1><p class="hero-sub">Verso turns your health, wealth, and work data into a beautifully typeset quarterly report — warm cream, Georgia serif, sparse editorial layout. Because your year deserves more than a pie chart.</p><div class="hero-actions"><a class="btn btn-p" href="https://ram.zenbin.org/' + VIEWER_SLUG + '" target="_blank">◆ Open Viewer</a><a class="btn btn-mock" href="https://ram.zenbin.org/verso-mock" target="_blank">✦ Interactive Mock ☀◑</a><a class="btn btn-x" href="https://x.com/intent/tweet?text=' + shareText + '&url=https://ram.zenbin.org/' + SLUG + '" target="_blank">𝕏 Share</a><a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a></div><div style="margin-top:20px"><span class="quarter-badge"><span class="quarter-dot"></span>Q1 2026 · YOUR BEST QUARTER</span></div></div>'
    + '<div class="hero-visual"><div class="phone-wrap"><div class="phone-notch"></div><div class="phone-shell"><div class="phone-screen"><img src="data:image/svg+xml;base64,' + heroThumbB64 + '" width="220" height="478" alt="Verso Quarter Overview" style="width:100%;height:100%;object-fit:cover"/></div></div></div></div></div>'
    + '<div class="inspiration"><h3>Inspiration Sources</h3><div class="insp-grid"><div class="insp-item"><div class="insp-site">Obsidian — darkmodedesign.com</div><div class="insp-text">Financial advisers platform on the dark mode showcase. Stone/rock texture photography, deep gray canvas, sophisticated mineral aesthetic. I inverted this to warm cream — the "luxury stone" feeling without the darkness. Same sparse editorial authority, different temperature.</div></div><div class="insp-item"><div class="insp-site">Midday — darkmodedesign.com</div><div class="insp-text">"For the new wave of one-person companies." Large white serif editorial typography on black. The pullquote-as-hero pattern. I translated this directly into Verso\'s Quarterly Review screen — large Georgia serif quote, left accent bar, editorial body copy. The magazine-report aesthetic is the throughline.</div></div><div class="insp-item"><div class="insp-site">Aupale / Kyn & Folk — land-book.com</div><div class="insp-text">Luxury brands on Land-book using extreme whitespace and warm cream tones as status signals. Isolated photography, light type on warm grounds. Confirmed the premise: a cream palette reads "premium" for data products the same way it does for artisan goods.</div></div></div></div>'
    + '<div class="screens-section"><div class="section-label">5 Screens</div><div class="screens-grid">' + thumbs + '</div></div>'
    + '<div class="decisions"><h3>Design Decisions</h3><div class="decision-grid"><div class="decision-item"><div class="decision-num">01</div><div class="decision-title">Georgia serif for numbers</div><div class="decision-body">All financial figures, health scores, and KPIs use Georgia at light (300) weight. Borrowed from editorial magazines — the Financial Times, The Economist use similar hybrid approaches. The serif numeral feels authoritative and calm, not clinical. Pairs against Inter for labels.</div></div><div class="decision-item"><div class="decision-num">02</div><div class="decision-title">Warm cream, not white</div><div class="decision-body">#F5F1EA instead of #FFFFFF as the base. Avoids the sterile medical feel of pure white dashboards. The warmth makes data less anxious — important for health/finance context. The same principle as newsprint: warm ground, dark ink, amber accent.</div></div><div class="decision-item"><div class="decision-num">03</div><div class="decision-title">Pull-quote as a data screen</div><div class="decision-body">The Quarterly Review screen (Screen 5) is deliberately NOT a dashboard. It\'s an AI-written magazine page with a pull-quote, body copy, and three forward commitments. Inspired by Midday\'s editorial hero copy. Data should sometimes be literature.</div></div></div></div>'
    + '<div class="palette-section"><div class="section-label">Color Palette</div><div class="palette-row">'
    + [['Cream','#F5F1EA'],['Surface','#FFFFFF'],['Cream 2','#EDE8DF'],['Border','#E4DFDA'],['Text','#1A1816'],['Mid','#4A4642'],['Muted','#9A9490'],['Amber','#C27A3C'],['Sage','#3A6358'],['Purple','#8B7EC8'],['Gold','#E8C070']].map(function(p){ return '<div class="swatch"><div class="swatch-dot" style="background:' + p[1] + '"></div><div class="swatch-name">' + p[0] + '</div><div class="swatch-hex">' + p[1] + '</div></div>'; }).join('')
    + '</div></div>'
    + '<footer><p>Designed by <span>RAM</span> · RAM Design Studio · March 2026</p><p style="margin-top:8px">Inspired by Obsidian · Midday · Aupale · darkmodedesign.com · land-book.com</p></footer></body></html>';
}

// ── Viewer HTML ─────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  var penJsonStr = JSON.stringify(JSON.stringify(penJson));
  var injection = '<script>window.EMBEDDED_PEN = ' + penJsonStr + ';<\/script>';

  var viewerHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verso — Viewer</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#EDE8DF;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;padding:24px}h1{color:#1A1816;font-size:18px;font-weight:700;margin-bottom:6px;letter-spacing:-.02em;font-family:Georgia,serif}h1 span{color:#C27A3C}.sub{color:#9A9490;font-size:12px;margin-bottom:28px}.screens{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:1200px}.sc{display:flex;flex-direction:column;align-items:center;gap:8px}.sc-label{font-size:10px;font-weight:600;color:#9A9490;text-transform:uppercase;letter-spacing:.08em}.sc-frame{width:195px;height:422px;border-radius:24px;overflow:hidden;border:1.5px solid rgba(194,122,60,.2);background:#F5F1EA;box-shadow:0 8px 32px rgba(26,24,22,.15)}footer{margin-top:32px;color:#9A9490;font-size:11px}</style>'
    + injection
    + '</head><body><h1><span>V</span>erso — Viewer</h1><p class="sub">Your life, in quarterly review · RAM Design Heartbeat · March 2026</p><div class="screens" id="screens"></div><footer>RAM Design Studio · ram.zenbin.org/verso</footer>'
    + '<script>(function(){try{var pen=JSON.parse(window.EMBEDDED_PEN);var screens=pen.screens||[];var labels=["Quarter","Wealth","Health","Work","Review"];var tw=195,th=422;function scThumb(sc){var W=sc.width||390,H=sc.height||844,sx=tw/W,sy=th/H;function rn(n,d){if(d>12)return"";var x=(n.x||0)*sx,y=(n.y||0)*sy,w=Math.max(0,(n.width||0)*sx),h=Math.max(0,(n.height||0)*sy),fill=n.fill||"transparent",r=n.cornerRadius?n.cornerRadius*Math.min(sx,sy):0,out="";if(n.type==="rect"||n.type==="frame"){if(fill!=="transparent"){var sa="";if(n.stroke&&n.stroke!=="transparent"&&n.strokeWidth)sa=\' stroke="\'+n.stroke+\'" stroke-width="\'+(n.strokeWidth*Math.min(sx,sy)).toFixed(1)+\'"\';out+=\'<rect x="\'+x.toFixed(1)+\'" y="\'+y.toFixed(1)+\'" width="\'+w.toFixed(1)+\'" height="\'+h.toFixed(1)+\'" fill="\'+fill+\'" rx="\'+r.toFixed(1)+\'"\'+sa+"/>"}  }else if(n.type==="ellipse"){out+=\'<ellipse cx="\'+(x+w/2).toFixed(1)+\'" cy="\'+(y+h/2).toFixed(1)+\'" rx="\'+(w/2).toFixed(1)+\'" ry="\'+(h/2).toFixed(1)+\'" fill="\'+fill+\'"/>\'}else if(n.type==="text"){var fs=Math.max(3,(n.fontSize||12)*Math.min(sx,sy)),tc=n.fill||n.color||"#1A1816",raw=n.text||n.content||"",safe=raw.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").slice(0,60),fw=n.fontWeight||"400",ff=(n.fontFamily==="Georgia")?"Georgia,serif":"system-ui,sans-serif";out+=\'<text x="\'+(x+1).toFixed(1)+\'" y="\'+(y+fs*0.85).toFixed(1)+\'" font-size="\'+fs.toFixed(1)+\'" fill="\'+tc+\'" font-family="\'+ff+\'" font-weight="\'+fw+\'">\'+safe+"</text>"}else if(n.type==="line"){var x1=(n.x1||0)*sx,y1=(n.y1||0)*sy,x2=(n.x2||0)*sx,y2=(n.y2||0)*sy,lc=n.stroke||"#E4DFDA",lw=(n.strokeWidth||1)*Math.min(sx,sy);out+=\'<line x1="\'+x1.toFixed(1)+\'" y1="\'+y1.toFixed(1)+\'" x2="\'+x2.toFixed(1)+\'" y2="\'+y2.toFixed(1)+\'" stroke="\'+lc+\'" stroke-width="\'+lw.toFixed(1)+\'"/>\'}var ch=n.children||n.elements||[];ch.forEach(function(c){out+=rn(c,d+1)});return out}var bg=sc.background||sc.fill||"#F5F1EA",els=sc.elements||sc.children||[];return\'<svg xmlns="http://www.w3.org/2000/svg" width="\'+tw+\'" height="\'+th+\'" viewBox="0 0 \'+tw+" "+th+\'"><rect width="\'+tw+\'" height="\'+th+\'" fill="\'+bg+\'"/>\'+els.map(function(c){return rn(c,0)}).join("")+"</svg>"}var cont=document.getElementById("screens");screens.forEach(function(sc,i){var svg=scThumb(sc),div=document.createElement("div");div.className="sc";div.innerHTML=\'<div class="sc-label">\'+(labels[i]||"Screen "+(i+1))+\'</div><div class="sc-frame">\'+svg+"</div>";cont.appendChild(div)})}catch(e){document.body.innerHTML+="<p style=color:#C27A3C;margin-top:20px>Render error: "+e.message+"</p>"}})();<\/script>'
    + '</body></html>';

  return viewerHtml;
}

// ── Main pipeline ────────────────────────────────────────────────────────────
(async function() {
  console.log('=== Verso Design Discovery Pipeline (Mar 23 2026) ===\n');

  var penPath = path.join(__dirname, 'verso.pen');
  var penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log('✓ Loaded verso.pen (' + (fs.statSync(penPath).size / 1024).toFixed(1) + ' KB)');

  // 5a — Hero
  console.log('\n── 5a: Publishing hero page…');
  var heroHtml = buildHeroHTML(penJson);
  var heroRes = await publishToZenbin(SLUG, 'Verso — ' + TAGLINE + ' · RAM Design Studio', heroHtml, 'ram');
  console.log('   Status: ' + heroRes.status + '  → https://ram.zenbin.org/' + SLUG);

  // 5b — Viewer
  console.log('\n── 5b: Publishing viewer page…');
  var viewerHtml = buildViewerHTML(penJson);
  var viewerRes = await publishToZenbin(VIEWER_SLUG, 'Verso — Viewer', viewerHtml, 'ram');
  console.log('   Status: ' + viewerRes.status + '  → https://ram.zenbin.org/' + VIEWER_SLUG);

  // 5d — GitHub gallery queue
  console.log('\n── 5d: Updating GitHub gallery queue…');
  var getRes = await httpsReq({
    hostname: 'api.github.com',
    path: '/repos/' + GITHUB_REPO + '/contents/queue.json',
    method: 'GET',
    headers: {
      'Authorization': 'token ' + GITHUB_TOKEN,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.error('   Failed to fetch queue.json:', getRes.body.slice(0, 200));
  } else {
    var fileData = JSON.parse(getRes.body);
    var currentSha = fileData.sha;
    var currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    var queue = JSON.parse(currentContent);
    if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];

    var newEntry = {
      id: 'heartbeat-verso-' + Date.now(),
      status: 'done',
      app_name: APP_NAME,
      tagline: TAGLINE,
      archetype: ARCHETYPE,
      design_url: 'https://ram.zenbin.org/' + SLUG,
      viewer_url: 'https://ram.zenbin.org/' + VIEWER_SLUG,
      mock_url: 'https://ram.zenbin.org/verso-mock',
      submitted_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      credit: 'RAM Design Heartbeat',
      prompt: PROMPT,
      screens: 5,
      source: 'heartbeat',
      theme: 'light',
    };

    queue.submissions.push(newEntry);
    queue.updated_at = new Date().toISOString();

    var newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    var putBody = JSON.stringify({
      message: 'add: Verso (light) to gallery (heartbeat Mar 23)',
      content: newContent,
      sha: currentSha,
    });

    var putRes = await httpsReq({
      hostname: 'api.github.com',
      path: '/repos/' + GITHUB_REPO + '/contents/queue.json',
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + GITHUB_TOKEN,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    }, putBody);

    console.log('   Gallery queue: ' + (putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 120)));
  }

  console.log('\n=== Hero + Viewer + Gallery done ===');
  console.log('  Hero:    https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer:  https://ram.zenbin.org/' + VIEWER_SLUG);
  console.log('  Mock:    https://ram.zenbin.org/verso-mock  (run verso-mock.mjs next)');
})().catch(function(err){ console.error('Pipeline error:', err); process.exit(1); });
