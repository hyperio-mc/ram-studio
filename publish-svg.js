// publish-svg.js — Standalone SVG renderer + publisher for pencil.dev .pen files
// Usage: node publish-svg.js <file.pen> <slug>

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SCALE   = 0.55;
const PHONE_W = 375;
const PHONE_H = 812;

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  if (hex.length !== 6) return null;
  const n = parseInt(hex, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
function resolveVar(fill, vars) {
  if (typeof fill === 'string' && fill.startsWith('$') && vars) {
    const key = fill.slice(1);
    const v = vars[key];
    return (v && (v.value || v)) || fill;
  }
  return fill;
}
function resolveColor(fill, vars) {
  if (!fill) return null;
  if (Array.isArray(fill)) {
    for (const f of fill) { const c = resolveColor(f, vars); if (c && c !== 'rgba(0,0,0,0)') return c; }
    return null;
  }
  fill = resolveVar(fill, vars);
  if (typeof fill === 'string') {
    if (fill.startsWith('#') || fill.startsWith('rgb') || fill === 'transparent') return fill;
    return null;
  }
  if (typeof fill === 'object' && fill !== null) {
    if (fill.type === 'color' || fill.type === 'solid') {
      const hex = fill.color || fill.value || '#cccccc';
      const op = fill.opacity !== undefined ? fill.opacity : 1;
      if (op === 0) return 'rgba(0,0,0,0)';
      const rgb = hexToRgb(hex);
      return rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${op})` : hex;
    }
    if (fill.type === 'gradient') { const colors = fill.colors || fill.stops || []; return colors[0]?.color || '#e5e7eb'; }
    if (fill.color) { const op = fill.opacity !== undefined ? fill.opacity : 1; const rgb = hexToRgb(fill.color); return rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${op})` : fill.color; }
  }
  return null;
}
function effectiveLayout(node) {
  if (node.layout) return node.layout;
  const children = node.children || [];
  const hasFillChild = children.some(c => c.width === 'fill_container' || c.height === 'fill_container');
  const hasAutoProps = node.gap != null || node.alignItems;
  return (hasFillChild || hasAutoProps) ? 'horizontal' : 'none';
}
function parsePadding(padding) {
  if (!padding && padding !== 0) return { t:0, r:0, b:0, l:0 };
  if (typeof padding === 'number') return { t:padding, r:padding, b:padding, l:padding };
  if (Array.isArray(padding)) {
    if (padding.length === 2) return { t:padding[0], r:padding[1], b:padding[0], l:padding[1] };
    if (padding.length === 4) return { t:padding[0], r:padding[1], b:padding[2], l:padding[3] };
  }
  return { t:0, r:0, b:0, l:0 };
}
function measureNode(node) {
  const w = typeof node.width==='number' ? node.width : node.width==='fill_container' ? 200 : 80;
  if (node.height === 'fill_container') return { w, h: 200 };
  if (typeof node.height === 'number' && node.height > 0) return { w, h: node.height };
  if (node.type === 'text') return { w, h: (node.fontSize||14)+8 };
  if (node.children && node.children.length && node.layout) {
    const pad = parsePadding(node.padding); const gap = node.gap||0; const isH = node.layout==='horizontal';
    const sizes = node.children.map(measureNode);
    if (isH) return { w, h: pad.t + Math.max(...sizes.map(s=>s.h), 0) + pad.b };
    const totalH = sizes.reduce((s,m)=>s+m.h,0) + gap*Math.max(sizes.length-1,0);
    return { w, h: pad.t + totalH + pad.b };
  }
  return { w, h: 40 };
}
function escXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function svgTextLines(text, maxW, fontSize) {
  const paras = text.split('\n');
  if (maxW <= 0) return paras;
  const avgCW = fontSize * 0.55;
  const maxCh = Math.max(Math.floor(maxW / avgCW), 1);
  const out = [];
  for (const para of paras) {
    if (para.length <= maxCh) { out.push(para); continue; }
    const words = para.split(' '); let line = '';
    for (const word of words) {
      const test = line ? line+' '+word : word;
      if (test.length > maxCh && line) { out.push(line); line = word; } else line = test;
    }
    if (line) out.push(line);
  }
  return out;
}

function generateScreenSVG(screen, vars, screenIdx) {
  const sw = screen.width || PHONE_W;
  const sh = screen.height || PHONE_H;
  const scale = sw <= 430 ? SCALE : Math.min(SCALE, 700/sw);
  const cw = Math.round(sw*scale);
  const ch = Math.round(sh*scale);
  const isPhone = sw <= 430;
  const defs = []; let uid = 0;
  const nid = () => `s${screenIdx}e${uid++}`;

  function getFill(fill, x, y, w, h) {
    fill = resolveVar(fill, vars);
    if (!fill) return null;
    if (typeof fill === 'string') {
      if (fill.startsWith('#') || fill.startsWith('rgb') || fill === 'transparent') return fill;
      return null;
    }
    if (typeof fill !== 'object') return null;
    if (fill.type === 'color' || fill.type === 'solid') {
      const hex = fill.color||fill.value||'#cccccc'; const op = fill.opacity!==undefined ? fill.opacity : 1;
      if (op === 0) return null;
      const rgb = hexToRgb(hex);
      return rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${op})` : hex;
    }
    if (fill.type === 'gradient') {
      const colors = fill.colors||fill.stops||[];
      if (!colors.length) return null;
      const id = nid();
      const stops = colors.map(s => `<stop offset="${Math.round((s.position??s.offset??0)*100)}%" stop-color="${s.color||'#000'}"/>`).join('');
      if (fill.gradientType === 'radial') {
        const cx = fill.center ? (x+fill.center.x*w) : (x+w/2);
        const cy = fill.center ? (y+fill.center.y*h) : (y+h/2);
        const rw = fill.size?.width!=null ? fill.size.width*w : w;
        const rh = fill.size?.height!=null ? fill.size.height*h : h;
        defs.push(`<radialGradient id="${id}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(Math.max(rw,rh)/2).toFixed(1)}" gradientUnits="userSpaceOnUse">${stops}</radialGradient>`);
      } else {
        const ang = ((fill.rotation||0)-90)*Math.PI/180;
        const cx = x+w/2, cy = y+h/2;
        const d = Math.sqrt(w*w+h*h)/2;
        defs.push(`<linearGradient id="${id}" x1="${(cx-Math.cos(ang)*d).toFixed(1)}" y1="${(cy-Math.sin(ang)*d).toFixed(1)}" x2="${(cx+Math.cos(ang)*d).toFixed(1)}" y2="${(cy+Math.sin(ang)*d).toFixed(1)}" gradientUnits="userSpaceOnUse">${stops}</linearGradient>`);
      }
      return `url(#${id})`;
    }
    if (fill.color) {
      const op = fill.opacity!==undefined ? fill.opacity : 1;
      if (op === 0) return null;
      const rgb = hexToRgb(fill.color);
      return rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${op})` : fill.color;
    }
    return null;
  }

  function nSVG(node, ox, oy, clipW, clipH) {
    if (!node || !node.type) return '';
    const FRAME_LIKE = new Set(['frame','group','component','instance','component-set']);
    const nodeType = FRAME_LIKE.has(node.type) ? 'frame' : node.type;
    const nw = typeof node.width==='number' ? node.width : node.width==='fill_container' ? (clipW||0) : (clipW||80);
    const nh = typeof node.height==='number' ? node.height : node.height==='fill_container' ? (clipH||0) : measureNode(node).h;
    const x = ox+(node.x||0); const y = oy+(node.y||0);
    const cr = node.cornerRadius||0; const rxA = cr>0 ? ` rx="${cr}"` : '';
    let fltA = '';
    const eff = Array.isArray(node.effects) ? node.effects[0] : node.effect;
    if (eff && nodeType!=='text' && (eff.type==='shadow'||eff.type==='drop-shadow')) {
      const fid = nid();
      const sc2 = resolveColor(eff.color, vars)||'rgba(0,0,0,0.25)';
      defs.push(`<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="${(eff.offset?.x||0).toFixed(1)}" dy="${(eff.offset?.y||3).toFixed(1)}" stdDeviation="${((eff.blur||8)/2).toFixed(1)}" flood-color="${sc2}"/></filter>`);
      fltA = ` filter="url(#${fid})"`;
    }
    if (node.type==='text' && node.content) {
      const fs=node.fontSize||14; const fw=node.fontWeight||'400';
      const lh=node.lineHeight ? fs*node.lineHeight : fs*1.4;
      const col=resolveColor(node.fill,vars)||'#111827';
      const aln=node.textAlign||'left'; const ls=node.letterSpacing ? ` letter-spacing="${node.letterSpacing}"` : '';
      let tx=x, anchor='start';
      if (aln==='center') { tx=x+nw/2; anchor='middle'; }
      else if (aln==='right') { tx=x+nw; anchor='end'; }
      const maxW=nw>0 ? nw : (clipW||400);
      const needsWrap=node.content.includes('\n')||node.lineHeight||(node.content.length>30&&nw>0);
      if (needsWrap) {
        const lines=svgTextLines(node.content,maxW,fs);
        const tspans=lines.map((ln,idx)=>`<tspan x="${tx.toFixed(1)}" dy="${(idx===0?fs*0.85:lh).toFixed(1)}">${escXml(ln)}</tspan>`).join('');
        return `<text x="${tx.toFixed(1)}" y="${y.toFixed(1)}" font-family="Inter,-apple-system,sans-serif" font-size="${fs}" font-weight="${fw}" fill="${col}" text-anchor="${anchor}"${ls}>${tspans}</text>`;
      } else {
        const ty=(nh>0 ? y+nh*0.5+fs*0.36 : y+fs).toFixed(1);
        return `<text x="${tx.toFixed(1)}" y="${ty}" font-family="Inter,-apple-system,sans-serif" font-size="${fs}" font-weight="${fw}" fill="${col}" text-anchor="${anchor}"${ls}>${escXml(node.content)}</text>`;
      }
    }
    const parts=[]; const isEll=node.type==='ellipse';
    if (nw>0&&nh>0) {
      const fills=Array.isArray(node.fill)?node.fill:(node.fill?[node.fill]:[]);
      let firstF=true;
      for (const fi of fills) {
        const fStr=getFill(fi,x,y,nw,nh); if (!fStr) continue;
        const fa=firstF?fltA:''; firstF=false;
        if (isEll) parts.push(`<ellipse cx="${(x+nw/2).toFixed(1)}" cy="${(y+nh/2).toFixed(1)}" rx="${(nw/2).toFixed(1)}" ry="${(nh/2).toFixed(1)}" fill="${fStr}"${fa}/>`);
        else parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}"${rxA} fill="${fStr}"${fa}/>`);
      }
    }
    const stk=node.stroke||node.border;
    if (stk?.fill) {
      const sCol=resolveColor(stk.fill,vars);
      if (sCol) {
        const sw2=stk.thickness||stk.width||1;
        if (isEll) parts.push(`<ellipse cx="${(x+nw/2).toFixed(1)}" cy="${(y+nh/2).toFixed(1)}" rx="${(nw/2).toFixed(1)}" ry="${(nh/2).toFixed(1)}" fill="none" stroke="${sCol}" stroke-width="${sw2}"/>`);
        else parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}"${rxA} fill="none" stroke="${sCol}" stroke-width="${sw2}"/>`);
      }
    }
    if (isEll) { const content=parts.join(''); return (typeof node.opacity==='number'&&node.opacity<1&&content)?`<g opacity="${node.opacity}">${content}</g>`:content; }
    if (node.children?.length) {
      const pad=parsePadding(node.padding); const gap=node.gap||0;
      const jc=node.justifyContent||'start'; const ai=node.alignItems||'start';
      const innerW=nw-pad.l-pad.r; const innerH=nh-pad.t-pad.b;
      const layout=effectiveLayout(node);
      const shouldClip=nodeType==='frame'&&node.clipsContent===true;
      let clipA='';
      if (shouldClip) {
        const cid=nid();
        defs.push(`<clipPath id="${cid}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}"${rxA}/></clipPath>`);
        clipA=` clip-path="url(#${cid})"`;
      }
      const kidSVGs=[];
      if (layout==='none') {
        node.children.forEach(child => { kidSVGs.push(nSVG(child,ox+(node.x||0),oy+(node.y||0),innerW,innerH)); });
      } else {
        const children=node.children; const isH=layout==='horizontal';
        let fixedMain=0, fillCount=0;
        const rawSz=children.map(child=>{
          const wF=child.width==='fill_container'; const hF=child.height==='fill_container';
          const mw=typeof child.width==='number'?child.width:measureNode(child).w;
          const mh=typeof child.height==='number'?child.height:measureNode(child).h;
          if (isH?wF:hF) fillCount++; else fixedMain+=isH?mw:mh;
          return {mw,mh,wF,hF};
        });
        const totalGaps=gap*(children.length-1); const availMain=isH?innerW:innerH;
        const fillSz=fillCount>0?Math.max((availMain-fixedMain-totalGaps)/fillCount,0):0;
        const sizes=rawSz.map(({mw,mh,wF,hF})=>({w:wF?(isH?fillSz:innerW):mw,h:hF?(isH?innerH:fillSz):mh}));
        const totalMain=sizes.reduce((s,m)=>s+(isH?m.w:m.h),0)+totalGaps;
        let cursor=isH?pad.l:pad.t;
        if (jc==='center') cursor+=(availMain-totalMain)/2;
        else if (jc==='end') cursor+=availMain-totalMain;
        const spGap=jc==='space_between'&&children.length>1?(availMain-sizes.reduce((s,m)=>s+(isH?m.w:m.h),0))/(children.length-1):gap;
        children.forEach((child,ci)=>{
          const {w:cw2,h:ch2}=sizes[ci];
          const ca=isH?innerH:innerW; const cs=isH?ch2:cw2;
          let co=isH?pad.t:pad.l;
          if (ai==='center') co+=(ca-cs)/2; else if (ai==='end') co+=ca-cs;
          if (isH) kidSVGs.push(nSVG(child,ox+(node.x||0)+cursor-(child.x||0),oy+(node.y||0)+co-(child.y||0),cw2,ch2));
          else kidSVGs.push(nSVG(child,ox+(node.x||0)+co-(child.x||0),oy+(node.y||0)+cursor-(child.y||0),cw2,ch2));
          cursor+=(isH?cw2:ch2)+spGap;
        });
      }
      const kids=kidSVGs.join('');
      parts.push(clipA?`<g${clipA}>${kids}</g>`:kids);
    }
    const content=parts.join('');
    if (!content) return '';
    return (typeof node.opacity==='number'&&node.opacity<1)?`<g opacity="${node.opacity}">${content}</g>`:content;
  }

  const body=nSVG(screen,-(screen.x||0),-(screen.y||0),sw,sh);
  const bgFill=resolveColor(screen.fill,vars)||'#f9fafb';
  const svgStr=`<svg viewBox="0 0 ${sw} ${sh}" width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg" style="display:block"><defs>${defs.join('')}</defs><rect width="${sw}" height="${sh}" fill="${bgFill}"/>${body}</svg>`;
  return {svgStr,cw,ch,isPhone,name:screen.name||`Screen ${screenIdx+1}`};
}

function buildSharePage(json, fileName) {
  const doc=JSON.parse(json); const screens=doc.children||[]; const vars=doc.variables||{};
  const version=doc.version||'2.8'; const appName=fileName.replace(/\.(pen|json)$/i,'');
  const penB64=Buffer.from(json).toString('base64');
  const screenCards=screens.map((screen,i)=>{
    const {svgStr,cw,ch,isPhone,name}=generateScreenSVG(screen,vars,i);
    const frameStyle=isPhone
      ?`width:${cw}px;height:${ch}px;border-radius:36px;overflow:hidden;box-shadow:0 0 0 8px #12182a,0 0 0 10px #0d1220,0 20px 60px rgba(0,0,0,.6);flex-shrink:0`
      :`width:${cw}px;height:${ch}px;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5);flex-shrink:0`;
    return `<div class="sw"><div class="sn">${escXml(name)}</div><div style="${frameStyle}">${svgStr}</div><div class="si">${i+1}/${screens.length}</div></div>`;
  }).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escXml(appName)} — Pen Viewer</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#080b12;color:#e8eaf0;font-family:'Inter',-apple-system,sans-serif;min-height:100vh;padding:1.5rem;}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #1c2333;}.logo{display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:.95rem;color:#fff;}.logo-icon{width:24px;height:24px;background:linear-gradient(135deg,#4f7fff,#7c5fff);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.7rem;}.dl-btn{display:inline-flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#4f7fff,#7c5fff);color:#fff;border:none;padding:.4rem .9rem;border-radius:6px;font-family:inherit;font-size:.78rem;font-weight:600;cursor:pointer;}.dl-btn:hover{opacity:.9;}#screens{display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start;}.sw{display:flex;flex-direction:column;align-items:center;gap:.5rem;}.sn{font-size:.7rem;color:#5a6480;font-weight:600;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.si{font-size:.6rem;color:#2a3448;letter-spacing:.1em;text-transform:uppercase;}footer{margin-top:3rem;text-align:center;font-size:.72rem;color:#2a3448;}footer a{color:#4f7fff;text-decoration:none;}</style></head><body><header><div class="logo"><div class="logo-icon">✏</div>${escXml(appName)}<span style="color:#5a6480;font-weight:400;font-size:.78rem">· ${screens.length} screen${screens.length!==1?'s':''} · v${version}</span></div><button class="dl-btn" id="dl">⬇ Download .pen</button></header><div id="screens">${screenCards}</div><footer>Made with <a href="https://penviewer.zenbin.org" target="_blank">Pen Viewer</a> · powered by pencil.dev v${version}</footer><script>document.getElementById('dl').addEventListener('click',function(){const raw=atob('${penB64}');const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const blob=new Blob([bytes],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='${escXml(appName)}.pen';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);});<\/script></body></html>`;
}

function publishPage(slug, title, html, method='POST') {
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({title,html});
    const opts={hostname:'zenbin.org',path:`/v1/pages/${slug}`,method,headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}};
    const req=https.request(opts,res=>{
      let data='';
      res.on('data',d=>data+=d);
      res.on('end',()=>{ try{resolve({status:res.statusCode,body:JSON.parse(data)});}catch(e){resolve({status:res.statusCode,body:data});} });
    });
    req.on('error',reject); req.write(body); req.end();
  });
}

async function main() {
  const penFile=process.argv[2]||'/workspace/group/design-studio/field-app.pen';
  const slug=process.argv[3]||'pen-design';
  console.log(`Reading ${penFile}...`);
  const json=fs.readFileSync(penFile,'utf8');
  const doc=JSON.parse(json);
  const screens=doc.children||[];
  console.log(`Found ${screens.length} screens: ${screens.map(s=>s.name).join(', ')}`);
  console.log('Generating SVG share page...');
  const fileName=path.basename(penFile);
  const html=buildSharePage(json,fileName);
  console.log(`Generated HTML: ${(html.length/1024).toFixed(1)} KB`);
  const title=fileName.replace(/\.(pen|json)$/i,'')+' — Pen Viewer';
  console.log(`Publishing to zenbin.org/p/${slug}...`);
  let result=await publishPage(slug,title,html,'POST');
  if (result.status===409) { console.log('Slug taken, trying PUT...'); result=await publishPage(slug,title,html,'PUT'); }
  console.log('Status:',result.status);
  console.log('Response:',JSON.stringify(result.body,null,2));
  if (result.status===200||result.status===201) console.log(`\n✓ Published! https://zenbin.org/p/${slug}`);
  else { console.error('\n✗ Publish failed'); process.exit(1); }
}
main().catch(err=>{console.error(err);process.exit(1);});
