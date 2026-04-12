// fix-hero-pages.mjs
// Adds: design system section (palette + type) + screens preview (from .pen files)
// Re-publishes all 9 heartbeat heroes to zenbin.org/p/[slug] (stable URL, no X-Subdomain)
// Updates queue.json design_url + mock_url fields

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const DESIGNS = [
  { slug:'grain', name:'GRAIN', tagline:'know what you wear',    archetype:'fashion-sustainability', theme:'light', screens:['Wardrobe','Item','Discover','Library','Profile'] },
  { slug:'hush',  name:'HUSH',  tagline:'sleep by design',       archetype:'sleep-wellness',         theme:'dark',  screens:['Tonight','Programs','Session','Stats','Profile'] },
  { slug:'keel',  name:'KEEL',  tagline:'sharpen your edge',     archetype:'productivity-focus',     theme:'light', screens:['Log','Plan','Progress','Coach','Profile'] },
  { slug:'tend',  name:'TEND',  tagline:'grow something good',   archetype:'gardening-wellness',     theme:'dark',  screens:['Dashboard','Garden','Log','Community','Profile'] },
  { slug:'rite',  name:'RITE',  tagline:'own your morning',      archetype:'habits-ritual',          theme:'light', screens:['Today','Ritual','History','Discover','Profile'] },
  { slug:'vara',  name:'VARA',  tagline:'watch the sky',         archetype:'astronomy-discovery',    theme:'dark',  screens:['Tonight','Cast','History','Saved','Profile'] },
  { slug:'nook',  name:'NOOK',  tagline:'find where you belong', archetype:'home-discovery',         theme:'light', screens:['Home','Browse','Listing','Saved','Profile'] },
  { slug:'form',  name:'FORM',  tagline:'train with intention',  archetype:'fitness-training',       theme:'dark',  screens:['Today','Live','Program','Progress','Coach'] },
  { slug:'pith',  name:'PITH',  tagline:'read with intention',   archetype:'reading-intelligence',   theme:'light', screens:['Today','Read','Library','Topics','You'] },
];

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

function extractColors(html) {
  // Extract CSS :root variables
  const rootMatch = html.match(/:root\s*\{([^}]+)\}/s);
  if (!rootMatch) return [];
  const lines = rootMatch[1].split('\n');
  const colors = [];
  for (const line of lines) {
    const m = line.match(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/);
    if (m) colors.push({ name: m[1], hex: m[2] });
  }
  return colors;
}

function extractFonts(html) {
  const matches = html.match(/family=([^&"']+)/g) || [];
  return [...new Set(matches.map(m => m.replace('family=','').split(':')[0].replace(/\+/g,' ').split(',')[0]).filter(f => f.length > 1))];
}

function renderPenScreens(slug, screenNames) {
  const penPath = `/workspace/group/design-studio/${slug}.pen`;
  let pen;
  try { pen = JSON.parse(fs.readFileSync(penPath,'utf8')); } catch(e) { return null; }
  if (pen.children.length < 20) return null;

  const W=375, H=812, GAP=80, SCALE=0.21;
  const SCREENS=5;
  const tw = Math.round(W*SCALE); // ~79px
  const th = Math.round(H*SCALE); // ~170px

  return Array.from({length:SCREENS},(_,i)=>{
    const sx = GAP + i*(W+GAP);
    const nodes = pen.children.filter(n => n.x >= sx-2 && n.x < sx+W+10);
    let inner='';
    for (const n of nodes) {
      if (n.type==='RECTANGLE') {
        const fill = n.fill;
        if (!fill || fill==='transparent'||fill==='none') continue;
        const rx=Math.round((n.x-sx)*SCALE), ry=Math.round(n.y*SCALE);
        const rw=Math.max(1,Math.round(n.width*SCALE)), rh=Math.max(1,Math.round(n.height*SCALE));
        const cr=n.cornerRadius?`border-radius:${Math.max(1,Math.round(n.cornerRadius*SCALE))}px;`:'';
        const op=n.opacity&&n.opacity<1?`opacity:${n.opacity};`:'';
        inner+=`<div style="position:absolute;left:${rx}px;top:${ry}px;width:${rw}px;height:${rh}px;background:${fill};${cr}${op}"></div>`;
      } else if (n.type==='TEXT' && n.content) {
        const rx=Math.round((n.x-sx)*SCALE), ry=Math.round(n.y*SCALE);
        const rw=Math.max(4,Math.round(n.width*SCALE));
        const fs=Math.max(2,Math.round((n.fontSize||12)*SCALE*0.85));
        const color=n.color||'#000';
        const fw=n.weight>=700?'600':'400';
        inner+=`<div style="position:absolute;left:${rx}px;top:${ry}px;width:${rw}px;font-size:${fs}px;color:${color};font-weight:${fw};white-space:nowrap;overflow:hidden;line-height:1.15;">${n.content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;
      }
    }
    return {html:inner, w:tw, h:th, label:screenNames[i]||`Screen 0${i+1}`};
  });
}

function makePlaceholderScreens(slug, screenNames, colors, isDark) {
  // For pen files with <20 nodes (GRAIN-VARA)
  // Make color-blocked skeleton screens using the design palette
  const bg = colors.find(c=>c.name==='bg')?.hex || (isDark?'#111':'#fafaf8');
  const surface = colors.find(c=>c.name==='surface')?.hex || (isDark?'#1a1a1a':'#fff');
  const accent = colors.find(c=>['accent','sage','lime','gold','terra','ember','azure','red','emerald','orange'].includes(c.name))?.hex || (isDark?'#888':'#555');
  const text = colors.find(c=>['text','ink','bone'].includes(c.name))?.hex || (isDark?'#e8e8e8':'#111');
  const muted = colors.find(c=>c.name==='muted')||{hex:(isDark?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.18)')};
  const W=79, H=170;

  return screenNames.map((label,i)=>{
    // Different layouts for each screen
    const layouts=[
      // Home/Today
      `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:${bg}"></div>
       <div style="position:absolute;left:6px;top:16px;width:32px;height:4px;background:${accent};border-radius:2px"></div>
       <div style="position:absolute;left:6px;top:24px;width:${W-12}px;height:12px;background:${surface};border-radius:3px"></div>
       <div style="position:absolute;left:6px;top:40px;width:${W-12}px;height:32px;background:${surface};border-radius:4px"></div>
       <div style="position:absolute;left:10px;top:44px;width:20px;height:3px;background:${accent};border-radius:1px"></div>
       <div style="position:absolute;left:10px;top:50px;width:40px;height:2px;background:${text};opacity:0.5;border-radius:1px"></div>
       <div style="position:absolute;left:6px;top:76px;width:${W-12}px;height:22px;background:${surface};border-radius:4px"></div>
       <div style="position:absolute;left:6px;top:102px;width:${W-12}px;height:22px;background:${surface};border-radius:4px"></div>
       <div style="position:absolute;left:0;bottom:0;width:${W}px;height:14px;background:${surface};border-top:1px solid ${text}22"></div>`,
      // List/Browse
      `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:${bg}"></div>
       <div style="position:absolute;left:6px;top:16px;width:40px;height:5px;background:${text};opacity:0.7;border-radius:2px"></div>
       <div style="position:absolute;left:6px;top:26px;width:${W-12}px;height:10px;background:${surface};border-radius:12px"></div>
       ${[0,1,2,3].map(r=>`<div style="position:absolute;left:6px;top:${42+r*28}px;width:${W-12}px;height:24px;background:${surface};border-radius:4px"></div><div style="position:absolute;left:10px;top:${46+r*28}px;width:${r%2===0?28:20}px;height:3px;background:${accent};opacity:0.8;border-radius:1px"></div>`).join('')}
       <div style="position:absolute;left:0;bottom:0;width:${W}px;height:14px;background:${surface};border-top:1px solid ${text}22"></div>`,
      // Detail/Feature
      `<div style="position:absolute;left:0;top:0;width:${W}px;height:50px;background:${accent}"></div>
       <div style="position:absolute;left:0;top:50px;width:${W}px;height:${H-50}px;background:${bg}"></div>
       <div style="position:absolute;left:6px;top:14px;width:36px;height:6px;background:rgba(255,255,255,0.9);border-radius:2px"></div>
       <div style="position:absolute;left:6px;top:24px;width:22px;height:3px;background:rgba(255,255,255,0.6);border-radius:1px"></div>
       <div style="position:absolute;left:6px;top:58px;width:${W-12}px;height:40px;background:${surface};border-radius:4px"></div>
       <div style="position:absolute;left:6px;top:104px;width:${W-12}px;height:20px;background:${surface};border-radius:4px"></div>
       <div style="position:absolute;left:6px;top:128px;width:${W-12}px;height:20px;background:${surface};border-radius:4px"></div>
       <div style="position:absolute;left:0;bottom:0;width:${W}px;height:14px;background:${surface};border-top:1px solid ${text}22"></div>`,
      // Saved/Progress
      `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:${bg}"></div>
       <div style="position:absolute;left:6px;top:16px;width:44px;height:5px;background:${text};opacity:0.7;border-radius:2px"></div>
       <div style="position:absolute;left:6px;top:26px;width:${W-12}px;height:34px;background:${surface};border-radius:6px"></div>
       <div style="position:absolute;left:10px;top:30px;width:${W-20}px;height:4px;background:${accent};border-radius:2px"></div>
       <div style="position:absolute;left:10px;top:36px;width:${W-30}px;height:4px;background:${accent};opacity:0.4;border-radius:2px"></div>
       <div style="position:absolute;left:10px;top:42px;width:${W-25}px;height:4px;background:${accent};opacity:0.25;border-radius:2px"></div>
       ${[0,1,2].map(r=>`<div style="position:absolute;left:6px;top:${66+r*24}px;width:${W-12}px;height:20px;background:${surface};border-radius:4px"></div>`).join('')}
       <div style="position:absolute;left:0;bottom:0;width:${W}px;height:14px;background:${surface};border-top:1px solid ${text}22"></div>`,
      // Profile/Settings
      `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:${bg}"></div>
       <div style="position:absolute;left:${Math.round(W/2)-14}px;top:12px;width:28px;height:28px;background:${accent};border-radius:50%"></div>
       <div style="position:absolute;left:${Math.round(W/2)-18}px;top:44px;width:36px;height:4px;background:${text};opacity:0.6;border-radius:2px"></div>
       <div style="position:absolute;left:${Math.round(W/2)-12}px;top:52px;width:24px;height:3px;background:${text};opacity:0.3;border-radius:1px"></div>
       ${[0,1,2,3].map(r=>`<div style="position:absolute;left:6px;top:${64+r*24}px;width:${W-12}px;height:20px;background:${surface};border-radius:4px"></div>`).join('')}
       <div style="position:absolute;left:0;bottom:0;width:${W}px;height:14px;background:${surface};border-top:1px solid ${text}22"></div>`,
    ];
    return { html: layouts[i]||layouts[0], w:W, h:H, label };
  });
}

function buildSpecSection(design, html) {
  const colors = extractColors(html);
  const fonts = extractFonts(html);
  const isDark = design.theme==='dark';

  // Render screens from pen or placeholder
  const penScreens = renderPenScreens(design.slug, design.screens);
  const screens = penScreens || makePlaceholderScreens(design.slug, design.screens, colors, isDark);

  // Color palette HTML (skip rgba/functional colors)
  const paletteColors = colors.filter(c => c.hex && !['rule','pale','border','overlay'].includes(c.name));
  const paletteHtml = paletteColors.map(c =>
    `<div class="ds-swatch">
      <div class="ds-swatch-color" style="background:${c.hex}"></div>
      <div class="ds-swatch-name">--${c.name}</div>
      <div class="ds-swatch-hex">${c.hex}</div>
    </div>`
  ).join('');

  // Typography HTML
  const fontHtml = fonts.map((f,i) =>
    `<div class="ds-font-row">
      <div class="ds-font-sample" style="font-family:'${f}',serif;font-size:${i===0?28:18}px;line-height:1.1">Aa</div>
      <div class="ds-font-meta">
        <div class="ds-font-name">${f}</div>
        <div class="ds-font-role">${i===0?'Display / Headlines':'Labels / Monospace'}</div>
      </div>
    </div>`
  ).join('');

  // Screens HTML
  const screensHtml = screens.map((s,i) =>
    `<div class="ds-screen-wrap">
      <div class="ds-thumb" style="width:${s.w}px;height:${s.h}px">${s.html}</div>
      <div class="ds-screen-label">${s.label}</div>
    </div>`
  ).join('');

  // Theme-aware colors
  const dsBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)';
  const dsBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const dsText = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  const css = `
  /* ─── DESIGN SPEC SECTION ─── */
  .ds-section{padding:80px 64px;border-top:1px solid ${dsBorder}}
  .ds-inner{max-width:1240px;margin:0 auto}
  .ds-label{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${dsText};margin-bottom:20px;font-family:monospace}
  .ds-h2{font-size:36px;font-weight:800;line-height:1.05;letter-spacing:-.02em;margin-bottom:48px}
  .ds-cols{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-bottom:56px}
  .ds-col-head{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:${dsText};margin-bottom:16px;font-family:monospace}
  .ds-palette{display:flex;flex-wrap:wrap;gap:10px}
  .ds-swatch{width:72px}
  .ds-swatch-color{width:72px;height:36px;border-radius:6px;margin-bottom:6px;border:1px solid ${dsBorder}}
  .ds-swatch-name{font-size:9px;letter-spacing:.04em;color:${dsText};font-family:monospace;overflow:hidden;white-space:nowrap}
  .ds-swatch-hex{font-size:9px;font-family:monospace;letter-spacing:.02em;opacity:0.7}
  .ds-fonts{display:flex;flex-direction:column;gap:16px}
  .ds-font-row{display:flex;align-items:center;gap:16px;padding:16px;border:1px solid ${dsBorder};border-radius:6px}
  .ds-font-sample{flex-shrink:0;width:60px}
  .ds-font-name{font-size:13px;font-weight:700;margin-bottom:3px}
  .ds-font-role{font-size:10px;color:${dsText};letter-spacing:.04em;font-family:monospace}
  .ds-screens-label{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:${dsText};margin-bottom:20px;font-family:monospace}
  .ds-screens{display:flex;gap:20px;overflow-x:auto;padding-bottom:8px}
  .ds-screen-wrap{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px}
  .ds-thumb{position:relative;overflow:hidden;border-radius:8px;border:1px solid ${dsBorder};flex-shrink:0}
  .ds-screen-label{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:${dsText};font-family:monospace}
  @media(max-width:900px){.ds-section{padding:48px 24px}.ds-cols{grid-template-columns:1fr}}`;

  const html_section = `
<!-- DESIGN SPEC -->
<section class="ds-section">
  <div class="ds-inner">
    <div class="ds-label">DESIGN SYSTEM · ${design.name}</div>
    <h2 class="ds-h2">Palette · Type · Screens</h2>
    <div class="ds-cols">
      <div>
        <div class="ds-col-head">COLOR PALETTE — ${paletteColors.length} TOKENS</div>
        <div class="ds-palette">${paletteHtml}</div>
      </div>
      <div>
        <div class="ds-col-head">TYPOGRAPHY — ${fonts.length} TYPEFACES</div>
        <div class="ds-fonts">${fontHtml}</div>
      </div>
    </div>
    <div class="ds-screens-label">ALL SCREENS — ${design.screens.length} VIEWS</div>
    <div class="ds-screens">${screensHtml}</div>
  </div>
</section>`;

  return { css, html_section };
}

async function processDesign(design) {
  const heroPath = `/workspace/group/design-studio/${design.slug}-hero.html`;
  let html = fs.readFileSync(heroPath, 'utf8');

  const { css, html_section } = buildSpecSection(design, html);

  // Inject CSS into <style> block (before closing </style>)
  html = html.replace(/(<\/style>)/, `${css}\n$1`);

  // Inject spec section before the CTA section
  const ctaPattern = /<section class="cta[^"]*"/;
  if (ctaPattern.test(html)) {
    html = html.replace(ctaPattern, `${html_section}\n<!-- CTA -->\n<section class="cta`);
  } else {
    // Fallback: inject before </body>
    html = html.replace('</body>', `${html_section}\n</body>`);
  }

  // Save locally
  fs.writeFileSync(heroPath, html);
  console.log(`  ✓ ${design.name}: spec section injected → ${heroPath}`);

  // Publish to zenbin.org/p/[slug] (no X-Subdomain — stable URL)
  const body = Buffer.from(JSON.stringify({ html }));
  try {
    const res = await req({
      hostname: 'zenbin.org',
      path: `/v1/pages/${design.slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Content-Length': body.length }
    }, body);
    if (res.status===200||res.status===201) {
      console.log(`  ✓ Published: https://zenbin.org/p/${design.slug}`);
      return `https://zenbin.org/p/${design.slug}`;
    } else {
      console.log(`  ✗ ZenBin ${res.status}: ${res.body.slice(0,80)}`);
      return null;
    }
  } catch(e) {
    console.log(`  ✗ Publish error: ${e.message}`);
    return null;
  }
}

// --- MAIN ---
console.log('🔧 Fixing hero pages — adding design spec sections + re-publishing...\n');

const publishedUrls = {};
for (const design of DESIGNS) {
  console.log(`Processing ${design.name}...`);
  const url = await processDesign(design);
  if (url) publishedUrls[design.slug] = url;
}

console.log('\n📚 Updating queue.json with new URLs...');
try {
  const headers = { 'Authorization':`token ${TOKEN}`, 'User-Agent':'ram-heartbeat/1.0', 'Accept':'application/vnd.github.v3+json' };
  const g = await req({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'GET', headers });
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));

  let updated = 0;
  for (const entry of (q.submissions||[])) {
    const design = DESIGNS.find(d => d.name === entry.app_name);
    if (design && publishedUrls[design.slug]) {
      const oldUrl = entry.design_url;
      entry.design_url = publishedUrls[design.slug];
      console.log(`  ${design.name}: ${oldUrl} → ${entry.design_url}`);
      updated++;
    }
  }
  q.updated_at = new Date().toISOString();

  if (updated > 0) {
    const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
    const putBody = Buffer.from(JSON.stringify({
      message: `fix: update design_url for ${updated} heartbeat designs — stable zenbin.org/p/ URLs`,
      content: encoded,
      sha: gj.sha
    }));
    const p = await req({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
      headers: {...headers, 'Content-Length': putBody.length} }, putBody);
    console.log(`\n✓ queue.json updated (${p.status}) — ${updated} design URLs fixed`);
  } else {
    console.log('  No entries needed updating (check app_name field matching)');
  }
} catch(e) {
  console.log('✗ Queue update error:', e.message);
}

console.log('\n✅ Done! Summary:');
DESIGNS.forEach(d => {
  const url = publishedUrls[d.slug];
  console.log(`  ${d.name}: ${url||'⚠ FAILED — check ZenBin quota'}`);
});
