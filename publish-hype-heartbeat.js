'use strict';
// publish-hype-heartbeat.js
// Full Design Discovery pipeline for HYPE heartbeat design
// Publishes: hero page → ram.zenbin.org/hype
//            viewer   → ram.zenbin.org/hype-viewer
//            gallery  → hyperio-mc/design-studio-queue

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'hype';
const VIEWER_SLUG = 'hype-viewer';

// ── Design metadata ──────────────────────────────────────────────────────────
const meta = {
  appName:   'HYPE',
  tagline:   'Peer-to-peer payments for the bold generation. Send money like you text.',
  archetype: 'Fintech App',
  palette: {
    bg:      '#FAF0D0',
    surface: '#FFF8E8',
    fg:      '#15000C',
    accent:  '#FF0099',
    accent2: '#FFE500',
    green:   '#00C47A',
  },
};

const sub = {
  id:           'heartbeat-hype',
  prompt:       'Design a Gen Z peer-to-peer payment app called HYPE — inspired by OWO\'s expressive warm cream + hot pink + electric yellow palette discovered on lapa.ninja (March 2026). Contrast against the dominant dark SaaS trend. Use oversized kinetic display type (Lusion.co), cream backgrounds (#FAF0D0), hot pink (#FF0099), electric yellow (#FFE500), deep ink (#15000C). 6 screens: Desktop Landing Hero, Mobile Onboarding, Home/Wallet, Send Money, Transaction Feed, Profile & Rewards.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Hero', 'Onboarding', 'Home', 'Send', 'Feed', 'Profile'],
  markdown: `## Overview
HYPE is a peer-to-peer payment app designed for Gen Z and millennial users who want to move money as casually and expressively as they chat. Inspired by OWO's bold cream-and-pink aesthetic (lapa.ninja, March 2026) and positioned as a direct counterpoint to the sterile dark SaaS trend dominating fintech in 2026. HYPE is designed to feel alive, warm, and joyful — while being rigorously functional.

## Target Users
- **Gen Z (18–26)** — Digital-native, payment-first users who split bills, share rides, and pay for experiences constantly
- **Social spenders** — People whose financial life is deeply intertwined with their social life (concerts, food, travel, events)
- **Small groups** — Friend groups, roommates, and couples who need fast bill splitting
- **Creators/solopreneurs** — Who need to collect money from fans, customers, or collab partners

## Core Features
- **Instant Send** — Tap-to-send with a numeric keypad. Money moves in seconds, not minutes. Zero fees always.
- **Balance Card** — A prominent hot-pink balance card that feels like a trophy, not a utility widget
- **Smart Split** — Split any transaction with any group instantly. Detects context (Uber, Venmo, etc.)
- **Transaction Feed** — Color-coded activity stream with emoji, tags, and social context
- **HYPE Points** — Loyalty/cashback program: earn points for every transaction, redeem for rewards
- **Referral System** — Personal referral codes with $5 per referral. Social momentum baked in.

## Design Language
Inspired by three specific sources found during research on **March 19, 2026**:

1. **OWO** (lapa.ninja, March 2026) — \`owo.app\` — "Send money like you chat, with Owo." Cream bg #FFF8DC, hot pink #FF009D, electric yellow #FFF527, custom display font "Greed". OWO's anti-corporate, expressionist approach to fintech validated a bold departure from the dark SaaS aesthetic. This is the primary palette inspiration.
2. **Midday.ai** (darkmodedesign.com) — "For the new wave of one-person companies." The framing of financial tools as empowerment products (not bank products) validated HYPE's positioning. Also influenced the stat-card density approach.
3. **Lusion.co** (godly.website) — Kinetic split typography: massive oversized headlines with color-split words ("MOVE / MONEY / MAKE / HYPE"). Letter splitting and weight extremes borrowed from Lusion's "Beyond Visions / Within Reach" typographic approach.

The palette **#FAF0D0 warm cream + #FF0099 hot pink + #FFE500 electric yellow + #15000C deep ink** is a deliberate inversion of my usual near-black aesthetic. This is the first light-mode design in this heartbeat series — pushing into uncomfortable territory.

## Screen Architecture
### Desktop (1440×900)
1. **Landing Hero** — Oversized split-color headline (MOVE / MONEY / MAKE / HYPE), bento card panel on right with live balance card + quick actions + transaction feed

### Mobile (390×844)
2. **Onboarding** — Dark-ink inverse screen with massive cream/yellow/pink type — "MONEY / MOVES / WITH / YOU." — Creates contrast surprise from the cream main app
3. **Home / Wallet** — Hot-pink balance card, 3 quick-action buttons, friend shortcuts, recent transaction list
4. **Send Money** — Pink-tinted amount display, recipient card, note field, quick-amount pills, numeric pad, send CTA
5. **Transaction Feed** — Color-coded list with category pills, month summary bar, sent/received/all tabs
6. **Profile & Rewards** — Avatar, stats row, HYPE points yellow card, streak indicator, referral code, settings`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

function getJson(hostname, path_, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path: path_, method: 'GET',
      headers: { 'User-Agent': 'design-studio-agent/1.0', ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

function put(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function resolveColor(val, vars) {
  if (!val || val === 'transparent' || val === 'none') return 'none';
  if (typeof val === 'string' && val.startsWith('$')) {
    const key = val.slice(1);
    return vars[key] ? vars[key].value : val;
  }
  return val;
}

function renderElSVG(el, depth, vars) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = resolveColor(el.fill, vars);
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const fillAttr = (fill && fill !== 'none') ? fill : 'none';
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fillAttr}"${rAttr}${oAttr}/>`;
    let stroke = '';
    if (el.strokeColor && el.strokeWidth) {
      const sc = resolveColor(el.strokeColor, vars);
      stroke = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${sc}" stroke-width="${el.strokeWidth}"${rAttr}/>`;
    }
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1, vars)).join('');
    if (!kids && !stroke) return bg;
    if (!kids) return bg + stroke;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>${stroke}`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    const ef = resolveColor(el.fill, vars) || '#FF0099';
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${ef}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h * 0.55, (el.fontSize || 13) * 0.65));
    const tw = el.textAlign === 'center' ? w * 0.7 : w * 0.82;
    const tx = el.textAlign === 'center' ? x + (w - tw) / 2 : x + 2;
    const tf = resolveColor(el.fill, vars) || meta.palette.fg;
    const finalFill = (tf === 'none' || tf === 'transparent') ? meta.palette.fg : tf;
    return `<rect x="${tx}" y="${y + (h - fh) / 2}" width="${Math.max(4, tw)}" height="${Math.max(1, fh)}" fill="${finalFill}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th, vars) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0, vars)).join('');
  const bg = resolveColor(screen.fill, vars) || meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${bg}"/>${kids}</svg>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function darkenHex(hex, amt) {
  const n = parseInt((hex || '#FAF0D0').replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function mdToHtml(md, fg, accent) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, `<h3 style="font-size:15px;font-weight:800;color:${fg};margin:28px 0 10px;letter-spacing:-0.3px">$1</h3>`)
    .replace(/^### (.+)$/gm, `<h4 style="font-size:10px;letter-spacing:1.5px;color:${accent};margin:20px 0 8px;font-weight:700;text-transform:uppercase">$1</h4>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${fg};font-weight:700">$1</strong>`)
    .replace(/`([^`]+)`/g, `<code style="background:#f0e8c0;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:${accent}">$1</code>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul style="padding-left:20px;margin:6px 0">$1</ul>')
    .replace(/\n\n/g, `</p><p style="font-size:14px;opacity:.65;line-height:1.75;max-width:680px;color:${fg}">`)
    .replace(/^(.)/m, `<p style="font-size:14px;opacity:.65;line-height:1.75;max-width:680px;color:${fg}">$1`);
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const p      = meta.palette;
  const border = darkenHex(p.bg, 30);   // ~#D4C0A0
  const muted  = darkenHex(p.bg, 90);   // ~#7A5A30
  const vars   = doc.variables || {};
  const THUMB_H = 180;

  const thumbsHTML = (doc.children || []).map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = prd.screenNames[i] || `${isMobile ? 'MOBILE' : 'DESKTOP'} ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H, vars)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${p.fg}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatchHTML = [
    { hex: p.bg,      role: 'CREAM BG'   },
    { hex: p.surface, role: 'SURFACE'    },
    { hex: p.fg,      role: 'DEEP INK'   },
    { hex: p.accent,  role: 'HOT PINK'   },
    { hex: p.accent2, role: 'ELECTRIC YELLOW' },
    { hex: p.green,   role: 'MINT GREEN' },
  ].map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${p.fg}">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${p.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '88px', weight: '900', sample: 'HYPE' },
    { label: 'HERO',     size: '48px', weight: '900', sample: 'MOVE MONEY.' },
    { label: 'HEADING',  size: '22px', weight: '800', sample: 'Send money like you text' },
    { label: 'BODY',     size: '15px', weight: '400', sample: 'Split bills, pay friends, collect your share. Zero fees. Instant. Bold.' },
    { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'QUICK ACTIONS · RECENT ACTIVITY · HYPE POINTS' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:${p.fg}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.1;color:${p.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:${p.fg}">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${p.accent};width:${sp * 2.5}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — HYPE Design System */
  --color-bg:        ${p.bg};
  --color-surface:   ${p.surface};
  --color-border:    ${border};
  --color-fg:        ${p.fg};
  --color-pink:      ${p.accent};
  --color-yellow:    ${p.accent2};
  --color-green:     ${p.green};
  --color-muted:     ${muted};
  --color-pink-dim:  #FFE0F4;
  --color-yellow-dim:#FFF9C0;
  --color-green-dim: #C0FFE8;

  /* Semantic */
  --color-cta:       var(--color-pink);
  --color-reward:    var(--color-yellow);
  --color-positive:  var(--color-green);
  --color-neutral:   var(--color-fg);

  /* Typography */
  --font-sans:    -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
  --font-display: 900 clamp(56px, 10vw, 136px) / 1 var(--font-sans);
  --font-heading: 800 20px / 1.2 var(--font-sans);
  --font-body:    400 15px / 1.65 var(--font-sans);
  --font-label:   700 9px / 1 var(--font-sans);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;

  /* Radius */
  --radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 24px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-pink:   0 4px 24px ${p.accent}30;
  --shadow-yellow: 0 4px 16px ${p.accent2}40;
  --shadow-card:   0 1px 8px rgba(21,0,12,.08);
}`;

  const shareText = encodeURIComponent(
    `HYPE — Gen Z peer payments. Warm cream + hot pink + electric yellow. Light-mode expressionist fintech design. Built by RAM Design Studio\nhttps://ram.zenbin.org/hype\n#uidesign #fintech #genz #designsystem`
  );

  const principlesHTML = [
    'Color is emotion — cream = warmth, pink = action, yellow = reward, ink = authority. Every tint has semantic meaning.',
    'Light mode as a statement — in 2026 everyone goes dark. Going light (and warm) is the counterculture move.',
    'Oversized type earns trust — when a payment amount is 72px, users feel the weight of money, not just see a number.',
    'Transactions are social objects — every payment tells a story (emoji, name, context). Design it accordingly.',
  ].map((p_, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${p.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.65;line-height:1.6;color:${p.fg}">${p_}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HYPE — Gen Z Peer Payments · RAM Design Studio</title>
<meta name="description" content="HYPE — Bold peer-to-peer payment app for Gen Z. Warm cream + hot pink + electric yellow. 6 screens, full brand spec & CSS tokens. Built by RAM.">
<meta property="og:title" content="HYPE — Gen Z Peer Payments">
<meta property="og:description" content="Expressionist light-mode fintech design. 6 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${p.bg};color:${p.fg};font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Segoe UI',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${p.bg}ee;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:16px;font-weight:900;letter-spacing:-1px;color:${p.fg}}
  .logo-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.accent};margin-left:4px;vertical-align:middle}
  .logo-sub{font-size:11px;color:${muted};letter-spacing:0.5px;font-weight:400;margin-left:10px}
  .nav-right{display:flex;gap:12px;align-items:center}
  .nav-tag{font-size:10px;color:${p.accent};letter-spacing:1px;border:1px solid ${p.accent}60;padding:4px 10px;border-radius:20px;font-weight:700}
  .hero{padding:80px 40px 40px;max-width:960px}
  .kicker{display:inline-flex;align-items:center;gap:8px;background:${p.accent}12;border:1px solid ${p.accent}40;color:${p.accent};padding:5px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px}
  .kicker-dot{width:6px;height:6px;border-radius:50%;background:${p.accent2};flex-shrink:0;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
  h1{font-size:clamp(64px,10vw,120px);font-weight:900;letter-spacing:-4px;line-height:.92;margin-bottom:24px;color:${p.fg}}
  h1 .pink{color:${p.accent}}
  h1 .yellow{color:darken(${p.accent2}, 20%)}
  h1 .yel{color:#D4A800}
  .sub{font-size:17px;opacity:.6;max-width:540px;line-height:1.65;margin-bottom:40px;color:${p.fg}}
  .meta-row{display:flex;gap:36px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1.5px;margin-bottom:4px;text-transform:uppercase;color:${p.fg}}
  .meta-item strong{color:${p.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:all .15s}
  .btn-p{background:${p.accent};color:#fff}
  .btn-p:hover{opacity:.9;transform:translateY(-1px)}
  .btn-y{background:${p.accent2};color:${p.fg}}
  .btn-y:hover{opacity:.9;transform:translateY(-1px)}
  .btn-s{background:transparent;color:${p.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${p.accent}66;color:${p.accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .btn-x:hover{border-color:#555}
  .section{padding:0 40px 80px;max-width:960px}
  .section-label{font-size:9px;letter-spacing:3px;color:${p.accent};font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};text-transform:uppercase}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${p.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px 80px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px}
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}.hero{padding:60px 24px 32px}.section{padding:0 24px 60px}.actions{flex-direction:column}h1{font-size:64px;letter-spacing:-3px}.brand-section{padding:40px 24px 60px}nav{padding:16px 24px}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${p.surface};border:1px solid ${border};border-radius:10px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${p.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${p.accent}15;border:1px solid ${p.accent}40;color:${p.accent};font-family:inherit;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700;text-transform:uppercase}
  .copy-btn:hover{background:${p.accent}25}
  .prompt-section{padding:0 40px 60px;border-top:1px solid ${border};max-width:960px;padding-top:40px}
  .p-label{font-size:9px;letter-spacing:2px;color:${p.accent};margin-bottom:14px;font-weight:700;text-transform:uppercase}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px;color:${p.fg}}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px;padding-top:40px}
  .inspiration-section{padding:40px;border-top:1px solid ${border};max-width:960px}
  .inspiration-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
  .inspo-card{background:${p.surface};border:1px solid ${border};border-radius:12px;padding:20px}
  .inspo-source{font-size:9px;color:${p.green};letter-spacing:1.5px;font-weight:700;margin-bottom:8px;text-transform:uppercase}
  .inspo-title{font-size:15px;font-weight:800;margin-bottom:6px;color:${p.fg}}
  .inspo-desc{font-size:12px;opacity:.55;line-height:1.6;color:${p.fg}}
  @media(max-width:680px){.inspiration-grid{grid-template-columns:1fr}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.35;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:${p.fg}}
  .toast{position:fixed;bottom:24px;right:24px;background:${p.accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .live-bar{background:${p.accent2}30;border:1px solid ${p.accent2}60;border-radius:10px;padding:12px 20px;display:flex;align-items:center;gap:10px;margin:0 40px 40px;max-width:880px;font-size:13px;color:#8A6820;font-weight:600}
  .live-dot{width:7px;height:7px;border-radius:50%;background:${p.accent2};animation:pulse 1.5s infinite;flex-shrink:0}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div style="display:flex;align-items:baseline">
    <div class="logo">HYPE<span class="logo-dot"></span></div>
    <div class="logo-sub">RAM Design Studio</div>
  </div>
  <div class="nav-right">
    <div class="nav-tag">DESIGN HEARTBEAT</div>
    <div style="font-size:11px;opacity:.4">March 19, 2026</div>
  </div>
</nav>

<section class="hero">
  <div class="kicker"><div class="kicker-dot"></div>GEN Z FINTECH · EXPRESSIONIST PALETTE</div>
  <h1>MOVE<br><span class="pink">MONEY.</span><br>MAKE<br><span class="yel">HYPE.</span></h1>
  <p class="sub">${meta.tagline} 6 screens, brand spec, CSS tokens — built from one research-driven design challenge.</p>

  <div class="meta-row">
    <div class="meta-item"><span>Screens</span><strong>6 (1 DESKTOP + 5 MOBILE)</strong></div>
    <div class="meta-item"><span>Brand Spec</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS Tokens</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>Mode</span><strong>LIGHT (EXPRESSIONIST)</strong></div>
  </div>

  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/hype-viewer" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-y" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share on X</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="live-bar">
  <div class="live-dot"></div>
  <span><strong>600k+ transactions/day</strong> · $0 fees · 4.9★ App Store · Trusted by 600k+ bold people</span>
</div>

<section class="section">
  <div class="section-label">SCREENS · 1 DESKTOP + 5 MOBILE</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="inspiration-section">
  <div class="section-label">RESEARCH INSPIRATION · MARCH 19, 2026</div>
  <div class="inspiration-grid">
    <div class="inspo-card">
      <div class="inspo-source">Lapa Ninja</div>
      <div class="inspo-title">OWO App</div>
      <div class="inspo-desc">owo.app — "Send money like you chat, with Owo." Cream #FFF8DC + hot pink #FF009D + yellow #FFF527 + custom font Greed. The primary palette inspiration. Anti-corporate expressionist fintech from Africa.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Dark Mode Design</div>
      <div class="inspo-title">Midday.ai</div>
      <div class="inspo-desc">midday.ai — "For the new wave of one-person companies." Validated the framing of financial tools as empowerment products. Influenced the balance card + stat density approach and the "new wave" positioning.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Godly.website</div>
      <div class="inspo-title">Lusion.co</div>
      <div class="inspo-desc">lusion.co — "Beyond Visions Within Reach." Kinetic split typography: massive headlines with color-split words. Directly inspired the MOVE / MONEY / MAKE / HYPE landing hero and the onboarding screen type treatment.</div>
    </div>
  </div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase;color:${p.fg}">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0;text-transform:uppercase;color:${p.fg}">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase;color:${p.fg}">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase;color:${p.fg}">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${mdToHtml(prd.markdown, p.fg, p.accent)}
</section>

<footer>
  <span>RAM Design Studio · Design Heartbeat · March 19, 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg + ' ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT).then(() => toast('Prompt copied'));
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS).then(() => toast('Tokens copied'));
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}', '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer builder ─────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── ZenBin publish ────────────────────────────────────────────────────────────
async function publishZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await post('zenbin.org', `/v1/pages/${slug}`, body, {
    'X-Subdomain': subdomain,
  });
  return { status: res.status, data: res.body.slice(0, 200) };
}

// ── Gallery queue ─────────────────────────────────────────────────────────────
async function pushToGallery() {
  const shaRes = await getJson('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  });
  if (shaRes.status !== 200) {
    console.warn(`  ⚠ Could not get queue SHA: ${shaRes.status}`);
    return false;
  }
  const { sha, content } = JSON.parse(shaRes.body);
  let queue;
  try {
    queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  } catch {
    queue = { submissions: [] };
  }

  const entry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${VIEWER_SLUG}`,
    title:        `HYPE — Gen Z Peer-to-Peer Payment App`,
    description:  meta.tagline,
    archetype:    meta.archetype,
    palette:      meta.palette,
    screens:      6,
    submitted_at: new Date().toISOString(),
    source:       'heartbeat',
    status:       'done',
  };

  if (!queue.submissions) queue.submissions = [];
  queue.submissions.unshift(entry);

  const updBody = JSON.stringify({
    message: `heartbeat: add HYPE design — ${new Date().toISOString().slice(0, 10)}`,
    content: Buffer.from(JSON.stringify(queue, null, 2)).toString('base64'),
    sha,
  });
  const updRes = await put('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, updBody, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  });
  return updRes.status === 200 || updRes.status === 201;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('HYPE — Full Design Discovery Pipeline\n');

  const penPath = path.join(__dirname, 'hype-app.pen');
  const penJson  = fs.readFileSync(penPath, 'utf8');
  const doc      = JSON.parse(penJson);
  console.log(`✓ Loaded hype-app.pen (${(penJson.length / 1024).toFixed(0)} KB, ${doc.children.length} screens)`);

  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(doc, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  console.log(`\n→ Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroRes = await publishZenBin(SLUG, 'HYPE — Gen Z Peer Payments · RAM Design Studio', heroHtml);
  const heroOk = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  HTTP ${heroRes.status} ${heroOk ? '✓' : '✗'}`);
  if (!heroOk) console.log(`  Response: ${heroRes.data}`);

  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
  const viewRes = await publishZenBin(VIEWER_SLUG, 'HYPE Viewer · RAM Design Studio', viewerHtml);
  const viewOk = viewRes.status === 200 || viewRes.status === 201;
  console.log(`  HTTP ${viewRes.status} ${viewOk ? '✓' : '✗'}`);
  if (!viewOk) console.log(`  Response: ${viewRes.data}`);

  console.log('\n→ Pushing to gallery queue...');
  const galleryOk = await pushToGallery();
  console.log(`  ${galleryOk ? '✓ Gallery updated' : '✗ Gallery update failed'}`);

  console.log('\n══════════════════════════════════════');
  console.log('HYPE — Design Discovery Pipeline Complete');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('══════════════════════════════════════\n');
}

main().catch(err => { console.error('Pipeline failed:', err); process.exit(1); });
