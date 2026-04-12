'use strict';
// publish-lore.js — full Design Discovery pipeline for LORE heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG       = 'lore';
const APP_NAME   = 'LORE';
const TAGLINE    = 'Tabletop RPG Companion & Campaign Manager';
const DATE_STR   = 'March 20, 2026';
const SUBDOMAIN  = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'lore.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette (must match lore-app.js) ──────────────────────────────────────────
const P = {
  bg:       '#07060D',
  surface:  '#0F0D1A',
  surface2: '#16132A',
  surface3: '#1E1A38',
  border:   '#2A2450',
  muted:    '#6B7280',
  fg:       '#F0EBD8',
  accent:   '#7C3AED',
  accentLt: '#A855F7',
  gold:     '#D4AF37',
  sage:     '#6EE7B7',
  danger:   '#EF4444',
  fire:     '#F97316',
};

const SCREEN_NAMES = ['Campaign Hub', 'World Index', 'Character Sheet', 'Session Log', 'Combat Tracker'];
const PROMPT = `Design a dark-mode tabletop RPG companion app for dungeon masters and players, inspired by:
1. Marblex (lapa.ninja) — next-gen gaming ecosystem, dark mode with vibrant purple/gold
2. Midday.ai (darkmodedesign.com) — clean dark data organization with breathing room
3. TRIONN (darkmodedesign.com) — bold, layered dark editorial with vivid accent hits
Palette: deep void #07060D + rich amethyst #7C3AED + warm gold #D4AF37 + parchment text.
5 mobile screens: Campaign Hub bento dashboard, World/Lore bento grid, Character Sheet with stat blocks, AI-powered Session Log with timeline, and Combat Tracker with initiative order.`;

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x  = (node.x || 0) + ox;
  const y  = (node.y || 0) + oy;
  const w  = node.width  || 10;
  const h  = node.height || 10;
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const size  = Math.max(node.fontSize || 12, 6);
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w / 2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }

  if (node.type === 'ellipse') {
    const fill    = sc(node.fill || 'transparent');
    const isTrans = !node.fill || node.fill === 'transparent';
    const stroke  = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${isTrans?'none':fill}" opacity="${op}"${stroke}/>`;
  }

  const fill   = sc(node.fill || P.bg);
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clipId = node.clip ? `clip-${node.id || Math.random().toString(36).slice(2)}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');

  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 6) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  const bg = sc(screen.fill || P.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:14px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── CSS Design Tokens ─────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* LORE — Tabletop RPG Companion */

  /* Backgrounds (deep void parchment) */
  --color-bg:         ${P.bg};
  --color-surface:    ${P.surface};
  --color-surface-2:  ${P.surface2};
  --color-surface-3:  ${P.surface3};
  --color-border:     ${P.border};
  --color-muted:      ${P.muted};

  /* Foreground */
  --color-fg:         ${P.fg};   /* warm parchment */

  /* Primary: Rich Amethyst (magic / active state) */
  --color-accent:     ${P.accent};
  --color-accent-lt:  ${P.accentLt};

  /* Secondary: Warm Gold (XP / loot / legendary) */
  --color-gold:       ${P.gold};

  /* Semantic: HP / damage / healing */
  --color-hp:         ${P.sage};
  --color-damage:     ${P.danger};
  --color-fire:       ${P.fire};

  /* Typography */
  --font-ui:      'Inter', 'SF Pro Text', -apple-system, sans-serif;
  --font-display: 900 clamp(30px, 8vw, 64px) / 0.95 var(--font-ui);
  --font-heading: 800 18px / 1.2 var(--font-ui);
  --font-body:    400 13px / 1.6 var(--font-ui);
  --font-label:   700 9px  / 1   var(--font-ui);

  /* Spacing (4px base grid) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 28px; --s-7: 40px; --s-8: 56px;

  /* Radius */
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 24px; --r-full: 9999px;

  /* Shadows */
  --shadow-card:   0 4px 24px rgba(124, 58, 237, 0.15);
  --shadow-active: 0 0 0 2px rgba(110, 231, 183, 0.50);
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 180, THUMB_H = 330;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 5)}
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,       role: 'BG — Void',        },
  { hex: P.surface2, role: 'SURFACE',           },
  { hex: P.fg,       role: 'FG — Parchment',   },
  { hex: P.accent,   role: 'AMETHYST',          },
  { hex: P.accentLt, role: 'AMETHYST LIGHT',   },
  { hex: P.gold,     role: 'GOLD — XP/Loot',   },
  { hex: P.sage,     role: 'SAGE — Healing',   },
  { hex: P.danger,   role: 'DANGER — Damage',  },
  { hex: P.fire,     role: 'FIRE — Spells',    },
].map(s => `
  <div style="flex:1;min-width:72px;max-width:110px">
    <div style="height:52px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:7px"></div>
    <div style="font-size:7.5px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px">${s.role}</div>
    <div style="font-size:10px;font-weight:700;color:${P.gold};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '38px', weight: '900', sample: 'LORE' },
  { label: 'HEADING',  size: '20px', weight: '800', sample: 'The Shattered Crown' },
  { label: 'SUBHEAD',  size: '14px', weight: '700', sample: 'Session 13 · Ember Reach Dungeon' },
  { label: 'BODY',     size: '13px', weight: '400', sample: 'The party narrowly survived an ambush by two Iron Wraiths.' },
  { label: 'LABEL',    size: '9px',  weight: '700', sample: 'DUNGEON · INITIATIVE ORDER · XP EARNED' },
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:7px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`LORE — dark-mode Tabletop RPG companion app. Deep void + amethyst + gold. Campaign hub, world bento grid, character sheet, AI session recap, combat tracker. By RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>LORE is a dark-mode mobile companion app for tabletop RPG players and dungeon masters. It brings together the critical components of campaign management — world-building, character tracking, session recaps, and real-time combat — in a single beautifully designed interface. The aesthetic marries the gaming darkness of Marblex (lapa.ninja) with the data clarity of Midday.ai (darkmodedesign.com), resulting in a "command center for your campaign."</p>

<h3>WHAT I FOUND</h3>
<p><strong>Marblex (lapa.ninja, March 2026)</strong>: A next-generation gaming and interactive ecosystem showcasing rich dark-mode gaming UI with vibrant purple and gold on near-black. Proved that dense gaming data can be visually stunning.</p>
<p><strong>Midday.ai (darkmodedesign.com)</strong>: Dark finance OS for one-person companies, featuring ultra-clean tabular data on deep dark backgrounds. The transactional row-density pattern translated perfectly to initiative lists and skill lists.</p>
<p><strong>TRIONN (darkmodedesign.com)</strong>: Bold editorial dark mode with strong contrast between muted surfaces and vivid accent hits — inspired the "Glow" atmospheric technique used throughout LORE.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Dungeon Masters</strong> managing complex multi-campaign worlds with dozens of NPCs, locations, and threads</li>
<li><strong>Players</strong> who want their character sheet always at hand with HP tracking and skill quick-reference</li>
<li><strong>Casual groups</strong> who want AI-assisted session recaps without taking notes mid-game</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Campaign Hub</strong> — Active campaigns with session count, party roster, AI session summary teaser, and XP tracker</li>
<li><strong>World Bento Grid</strong> — Responsive bento layout of world regions and lore nodes; NPC index; quick-add lore entry</li>
<li><strong>Character Sheet</strong> — Full stat block with ability scores, HP ring, AC, speed, skill proficiencies, equipped items</li>
<li><strong>AI Session Log</strong> — GPT-generated narrative session recap, session statistics, and scrollable event timeline</li>
<li><strong>Combat Tracker</strong> — Initiative order with HP bars, status effect badges, action tracking, one-tap "End Turn"</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Deep Void (#07060D)</strong> — A near-black with a slight blue tint evoking the deep dungeon and mystical atmosphere; darker than classic charcoal for maximum immersion</li>
<li><strong>Rich Amethyst (#7C3AED)</strong> — The primary accent; color of magic and mystery; used for active states, borders, and primary CTAs</li>
<li><strong>Warm Gold (#D4AF37)</strong> — Rewards, XP, legendary items; connotes treasure and achievement without being garish</li>
<li><strong>Parchment Foreground (#F0EBD8)</strong> — Slightly warm off-white; evokes aged maps and manuscript; reduces eye strain vs pure white</li>
<li><strong>Semantic Color System</strong> — Sage (healing/HP), Danger Red (damage/death), Fire Orange (spells/active abilities) create instant visual parsing in combat</li>
<li><strong>Multi-layer Glow Orbs</strong> — 4-layer radial ellipse technique creates atmospheric depth behind surfaces, like the ambient light of torches on stone walls</li>
<li><strong>Bento Grid World View</strong> — Inspired by the bento grid trend on godly.website; variable-width region cards pack high information density while maintaining visual interest</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>S1 — Campaign Hub:</strong> Active campaign hero card (with party avatars), campaign list with status pills, AI session teaser, XP progress bar</li>
<li><strong>S2 — World Index:</strong> 6-region bento grid, mystery counter card, NPC roster with alignment and role, add-entry CTA</li>
<li><strong>S3 — Character Sheet:</strong> Name + class header, HP/AC/Speed trio row, 6-stat ability score blocks, skill proficiency list, equipped items</li>
<li><strong>S4 — Session Log:</strong> AI narrative recap card (gold-bordered), 4-stat session summary row, timestamp event timeline with type badges</li>
<li><strong>S5 — Combat Tracker:</strong> Round + action tracker, 5-combatant initiative order with HP bars and status badges, End Turn CTA</li>
</ul>
`;

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LORE — Tabletop RPG Companion · RAM Design Studio</title>
<meta name="description" content="Dark-mode tabletop RPG companion. Deep void + amethyst + gold. Campaign Hub, World Bento Grid, Character Sheet, AI Session Log, Combat Tracker. Design by RAM.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Display',-apple-system,sans-serif;min-height:100vh;line-height:1.5}
  a{color:inherit;text-decoration:none}

  nav{padding:16px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(20px);z-index:100}
  .logo{font-size:13px;font-weight:900;letter-spacing:5px;color:${P.fg}}
  .logo em{color:${P.accentLt};font-style:normal}
  .nav-tag{font-size:9px;color:${P.muted};letter-spacing:1.5px;font-weight:700;border:1px solid ${P.border};padding:4px 12px;border-radius:4px}

  .hero{padding:80px 40px 56px;max-width:1100px;margin:0 auto;position:relative;overflow:hidden}
  .hero-glow{position:absolute;top:-80px;right:-80px;width:400px;height:400px;background:radial-gradient(circle,${P.accent}18 0%,transparent 70%);pointer-events:none}
  .hero-glow2{position:absolute;bottom:0;left:-60px;width:280px;height:280px;background:radial-gradient(circle,${P.gold}10 0%,transparent 70%);pointer-events:none}
  .hero-eyebrow{font-size:9px;letter-spacing:3.5px;color:${P.accentLt};margin-bottom:20px;font-weight:700;font-family:'Courier New',monospace}
  h1{font-size:clamp(52px,10vw,110px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:28px;color:${P.fg}}
  h1 em{color:${P.accentLt};font-style:normal}
  .tagline{font-size:18px;color:${P.muted};max-width:560px;line-height:1.7;margin-bottom:44px}

  .meta-strip{display:flex;gap:40px;margin-bottom:52px;flex-wrap:wrap;padding-bottom:36px;border-bottom:1px solid ${P.border}}
  .meta-item .label{font-size:8px;color:${P.muted};letter-spacing:2px;margin-bottom:5px;font-weight:700}
  .meta-item .val{color:${P.fg};font-size:13px;font-weight:700}
  .meta-item .val em{color:${P.gold};font-style:normal}

  .actions{display:flex;gap:10px;margin-bottom:80px;flex-wrap:wrap}
  .btn{padding:11px 24px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:1px;transition:opacity .15s;text-transform:uppercase}
  .btn:hover{opacity:.85}
  .btn-p{background:${P.accent};color:#fff}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-v{background:transparent;color:${P.muted};border:1px solid ${P.border}}

  .section-label{font-size:9px;letter-spacing:3px;color:${P.muted};font-weight:700;margin-bottom:20px;font-family:'Courier New',monospace}
  section{padding:56px 40px;max-width:1100px;margin:0 auto}

  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;-webkit-overflow-scrolling:touch}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-thumb{background:${P.border}}

  .brand-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;margin-top:40px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
  .type-scale{margin-top:12px}
  .spacing-list{margin-top:12px}
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:12px}
  @media(max-width:600px){.principles-grid{grid-template-columns:1fr}}
  .principle-card{padding:20px;background:${P.surface};border-radius:10px;border:1px solid ${P.border}}
  .principle-title{font-size:11px;font-weight:700;margin-bottom:8px;color:${P.fg}}
  .principle-desc{font-size:11px;color:${P.muted};line-height:1.6}

  .tokens-block{margin-top:32px}
  .tokens-pre{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:24px;font-family:'Courier New',monospace;font-size:11px;line-height:1.7;color:${P.muted};overflow-x:auto;white-space:pre}
  .copy-btn{margin-top:14px;background:${P.surface};border:1px solid ${P.border};color:${P.fg};padding:8px 20px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:1.5px;font-family:inherit;transition:border-color .15s}
  .copy-btn:hover{border-color:${P.accent};color:${P.accent}}

  .prompt-section{padding:48px 40px;max-width:1100px;margin:0 auto;border-top:1px solid ${P.border}}
  .p-label{font-size:8px;letter-spacing:3px;color:${P.muted};font-weight:700;margin-bottom:18px;font-family:'Courier New',monospace}
  .p-text{font-size:17px;font-style:italic;color:${P.muted};max-width:720px;line-height:1.8;border-left:3px solid ${P.accent};padding-left:24px}

  .prd-section{padding:48px 40px 80px;max-width:1100px;margin:0 auto;border-top:1px solid ${P.border}}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${P.accentLt};margin-bottom:10px;margin-top:32px;font-weight:800}
  .prd-section p,.prd-section li{font-size:13px;color:${P.muted};line-height:1.7;margin-bottom:8px}
  .prd-section ul{padding-left:20px}
  .prd-section strong{color:${P.fg}}

  footer{padding:28px 40px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;font-size:10px;color:${P.muted};letter-spacing:1px;flex-wrap:wrap;gap:10px}

  #toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:${P.sage};color:#07060D;padding:10px 24px;border-radius:24px;font-size:11px;font-weight:700;letter-spacing:1px;opacity:0;transition:all .25s;pointer-events:none;z-index:999}
  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<div id="toast">Copied ✓</div>

<nav>
  <div class="logo"><em>LORE</em></div>
  <div class="nav-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
</nav>

<div class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="hero-eyebrow">RAM DESIGN STUDIO — HEARTBEAT CHALLENGE · MARCH 2026</div>
  <h1><em>LORE</em></h1>
  <p class="tagline">${TAGLINE}. Five screens for the dungeon master who needs a command center — not another character sheet PDF.</p>

  <div class="meta-strip">
    <div class="meta-item"><div class="label">ARCHETYPE</div><div class="val">Gaming Companion</div></div>
    <div class="meta-item"><div class="label">PLATFORM</div><div class="val">Mobile · iOS</div></div>
    <div class="meta-item"><div class="label">SCREENS</div><div class="val">5 × 390×844</div></div>
    <div class="meta-item"><div class="label">PALETTE</div><div class="val"><em>Void</em> + Amethyst + Gold</div></div>
    <div class="meta-item"><div class="label">INSPIRED BY</div><div class="val">Marblex · Midday · TRIONN</div></div>
  </div>

  <div class="actions">
    <button class="btn btn-p" onclick="window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank')">▷ Open in Viewer</button>
    <button class="btn btn-s" id="dlBtn">↓ Download .pen</button>
    <button class="btn btn-v" id="cpBtn">⌘ Copy Prompt</button>
    <a class="btn btn-v" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank" rel="noopener">↗ Share on X</a>
    <a class="btn btn-v" href="https://ram.zenbin.org/gallery">◎ Gallery</a>
  </div>
</div>

<section>
  <div class="section-label">SCREEN PREVIEWS · SCROLL TO EXPLORE</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section style="border-top:1px solid ${P.border}">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div class="section-label" style="margin-bottom:12px">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div class="section-label" style="margin-bottom:12px">TYPE SCALE</div>
      <div class="type-scale">${typeScaleHTML}</div>
    </div>
    <div>
      <div class="section-label" style="margin-bottom:12px">SPACING SYSTEM (4px grid)</div>
      <div class="spacing-list">
        ${[4,8,12,16,20,28,40,56].map(sp => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:9px">
            <div style="font-size:9px;color:${P.muted};width:28px;font-family:'Courier New',monospace">${sp}</div>
            <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 1.8}px;opacity:0.7"></div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <div style="margin-top:48px">
    <div class="section-label">DESIGN PRINCIPLES</div>
    <div class="principles-grid">
      ${[
        { t: 'Void Immersion',       d: 'Near-black #07060D with a blue tint evokes the dungeon atmosphere. Dark enough to feel like a cave, light enough to read comfortably.' },
        { t: 'Semantic RPG Colors',  d: 'Sage = healing, Red = damage, Fire = spells, Gold = rewards. Zero reading required — your eye finds the threat instantly in initiative order.' },
        { t: 'Bento World Density',  d: 'The World Index packs six regions + mystery count + NPCs into a single scroll. Bento grid variable widths signal importance without headers.' },
      ].map(p => `<div class="principle-card"><div class="principle-title">${p.t}</div><div class="principle-desc">${p.d}</div></div>`).join('')}
    </div>
  </div>

  <div class="tokens-block">
    <div class="section-label" style="margin-top:40px">CSS DESIGN TOKENS</div>
    <pre class="tokens-pre">${cssTokens.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
  </div>
</section>

<div class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text">"${PROMPT.replace(/\n/g, ' ')}"</div>
</div>

<div class="prd-section">
  <div class="p-label">PRODUCT BRIEF / PRD</div>
  ${prd}
</div>

<footer>
  <span>LORE · RAM Design Studio · ${DATE_STR}</span>
  <span>Inspired by Marblex (lapa.ninja) · Midday.ai (darkmodedesign.com) · TRIONN (darkmodedesign.com)</span>
</footer>

<script>
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
function copyTokens(){navigator.clipboard.writeText(${JSON.stringify(cssTokens)}).then(()=>toast('Tokens copied ✓'));}
function copyPrompt(){navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>toast('Prompt copied ✓'));}
document.getElementById('cpBtn').addEventListener('click',copyPrompt);
// Download .pen from viewer page
document.getElementById('dlBtn').addEventListener('click',()=>{
  const a=document.createElement('a');a.href='https://ram.zenbin.org/${SLUG}-viewer';a.download='${SLUG}.pen';
  toast('Opening viewer to download .pen');
  window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');
});
</script>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHTML() {
  const screenSections = screens.map((s, i) => `
    <div class="screen-wrap">
      <div class="screen-label">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
      <div class="screen-svg">${screenSVG(s, 390, 844, 8)}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LORE Viewer · RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#04030A;min-height:100vh;font-family:'Inter',-apple-system,sans-serif;padding:24px 16px}
  header{max-width:1400px;margin:0 auto 32px;display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid ${P.border}}
  .vlogo{font-size:13px;font-weight:900;letter-spacing:5px;color:${P.fg}}
  .vlogo em{color:${P.accentLt};font-style:normal}
  .back{font-size:10px;color:${P.muted};text-decoration:none;letter-spacing:1px;border:1px solid ${P.border};padding:6px 14px;border-radius:6px;transition:color .15s,border-color .15s}
  .back:hover{color:${P.accentLt};border-color:${P.accent}}
  .screens{max-width:1400px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;justify-content:center}
  .screen-wrap{position:relative}
  .screen-label{font-size:8px;color:${P.muted};letter-spacing:2.5px;font-weight:700;margin-bottom:10px;text-align:center;font-family:'Courier New',monospace}
  .screen-svg svg{border-radius:24px;border:1px solid ${P.border};box-shadow:0 20px 60px rgba(124,58,237,0.18)}
</style>
</head>
<body>
<header>
  <div class="vlogo"><em>LORE</em></div>
  <a class="back" href="https://ram.zenbin.org/${SLUG}">← Hero Page</a>
</header>
<div class="screens">${screenSections}</div>
</body>
</html>`;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body); req.end();
  });
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET',
        headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }

  queue.submissions.push(entry);

  const shaR = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });

  if (shaR.status !== 200) throw new Error('Cannot get SHA: ' + shaR.status);
  const sha = JSON.parse(shaR.body).sha;
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: lore — tabletop rpg companion heartbeat`,
    content, sha,
  });

  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body); req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing LORE to ZenBin (ram.zenbin.org)…\n');

  // Save hero HTML locally
  const heroPath = path.join(__dirname, 'lore-hero.html');
  fs.writeFileSync(heroPath, heroHTML);
  console.log('  ✓ lore-hero.html written (' + Math.round(heroHTML.length / 1024) + 'KB)');

  // 1. Hero page
  console.log('  → Publishing hero: ' + SLUG);
  const heroR = await post(SLUG, 'LORE — Tabletop RPG Companion · RAM Design Studio', heroHTML, SUBDOMAIN);
  console.log('    Status:', heroR.status, heroR.status <= 201 ? '✓' : heroR.body.slice(0, 200));

  // 2. Viewer with embedded pen
  const viewerSlug = SLUG + '-viewer';
  let viewerHTML = buildViewerHTML();
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHTML = viewerHTML.replace('<script>', injection + '\n<script>');

  const viewerPath = path.join(__dirname, 'lore-viewer.html');
  fs.writeFileSync(viewerPath, viewerHTML);

  console.log('  → Publishing viewer: ' + viewerSlug);
  const viewerR = await post(viewerSlug, 'LORE Viewer · RAM Design Studio', viewerHTML, SUBDOMAIN);
  console.log('    Status:', viewerR.status, viewerR.status <= 201 ? '✓' : viewerR.body.slice(0, 200));

  // 3. Gallery queue
  console.log('  → Pushing to gallery queue…');
  try {
    const gR = await pushGalleryEntry({
      id: SLUG,
      title: APP_NAME,
      subtitle: TAGLINE,
      design_url:    `https://ram.zenbin.org/${SLUG}`,
      viewer_url:    `https://ram.zenbin.org/${viewerSlug}`,
      thumbnail_url: `https://ram.zenbin.org/${SLUG}`,
      tags: ['dark-mode', 'gaming', 'tabletop', 'rpg', 'mobile', 'bento-grid', 'amethyst', 'gold', 'campaign'],
      created_at: new Date().toISOString(),
      status: 'published',
    });
    console.log('    Status:', gR.status, gR.status <= 201 ? '✓' : gR.body.slice(0, 150));
  } catch (e) {
    console.log('    Gallery push failed:', e.message);
  }

  console.log('\n✅ LORE published!');
  console.log('   Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('   Viewer: https://ram.zenbin.org/' + viewerSlug);
}

main().catch(e => { console.error(e); process.exit(1); });
