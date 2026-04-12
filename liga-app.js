'use strict';
/**
 * LIGA — Independent type discovery & licensing
 * Inspired by: KOMETA Typefaces (minimal.gallery) — archival index aesthetic,
 * editorial serif revival, "We make fonts AI couldn't invent" counter-culture positioning
 * Theme: LIGHT  |  Heartbeat: auto
 */

const fs   = require('fs');
const path = require('path');

const SLUG = 'liga';
const W    = 390;
const H    = 844;
const NAME = 'LIGA';
const DATE = new Date().toISOString().slice(0, 10);

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG     = '#FAF8F4';   // warm cream paper
const SURF   = '#FFFFFF';   // pure white
const CARD   = '#F0EDE6';   // warm card
const BORDER = '#E3DDD4';   // subtle warm border
const TEXT   = '#141210';   // ink black
const TEXT2  = '#7A746C';   // secondary
const ACC    = '#141210';   // primary accent (ink)
const ACC2   = '#9B7A45';   // warm gold/amber
const GREEN  = '#2D7D46';   // active/licensed
const MUTED  = 'rgba(20,18,16,0.35)';

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ─── SVG Builder ──────────────────────────────────────────────────────────────
function buildSVG(elements) {
  const shapes = elements.map(el => {
    if (el.type === 'rect')
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    if (el.type === 'text')
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" text-anchor="${el.textAnchor}" letter-spacing="${el.letterSpacing}" opacity="${el.opacity}">${el.content}</text>`;
    if (el.type === 'circle')
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    if (el.type === 'line')
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"/>`;
    return '';
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n  ${shapes}\n</svg>`;
}

// ─── Archival margin helper — adds index numbers + thin left border  ──────────
function archivalMargin(els, screenIndex, screenTotal) {
  // Left margin thin rule
  els.push(line(8, 60, 8, H - 90, '#E3DDD4', { sw: 0.5, opacity: 0.5 }));
  // Page index
  els.push(text(8, H - 96, String(screenIndex + 1).padStart(2, '0'), 8, '#E3DDD4', { fw: 600, ls: 1 }));
  els.push(text(8, H - 84, '/' + String(screenTotal).padStart(2, '0'), 8, '#E3DDD4', { fw: 400 }));
  // Top right corner label (archival reference)
  const labels = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1', 'C-2'];
  els.push(text(W - 20, 30, labels[screenIndex] ?? 'X-1', 8, '#E3DDD4', { anchor: 'end', fw: 500, ls: 1 }));
}

// ─── Bottom Nav helper ────────────────────────────────────────────────────────
function bottomNav(els, active) {
  els.push(rect(0, H - 80, W, 80, SURF));
  els.push(line(0, H - 80, W, H - 80, BORDER, { sw: 1 }));
  const items = [
    { label: 'Discover',    x: 48 },
    { label: 'Collections', x: 146 },
    { label: 'My Type',     x: 244 },
    { label: 'Profile',     x: 342 },
  ];
  items.forEach(nav => {
    const isActive = nav.label === active;
    const col = isActive ? TEXT : TEXT2;
    if (isActive) {
      els.push(rect(nav.x - 22, H - 65, 44, 26, CARD, { rx: 13 }));
    }
    els.push(text(nav.x, H - 49, isActive ? '■' : '○', 10, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    els.push(text(nav.x, H - 28, nav.label, 9, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

// ─── Screen 1: Discover — archival index grid ─────────────────────────────────
function screenDiscover() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text(20, 22, '9:41', 12, TEXT, { fw: 600 }));
  els.push(text(W - 20, 22, '●●●', 10, TEXT, { anchor: 'end' }));

  // Top bar
  els.push(text(20, 46, 'LIGA', 16, TEXT, { fw: 700, ls: 4, font: 'Georgia, serif' }));
  // Search icon
  els.push(circle(352, 42, 8, 'none', { stroke: TEXT, sw: 1.5 }));
  els.push(line(358, 48, 365, 55, TEXT, { sw: 1.5 }));
  els.push(line(0, 54, W, 54, BORDER, { sw: 1 }));

  // Filter pills
  const filters = ['All', 'Display', 'Serif', 'Mono', 'Variable'];
  let fx = 20;
  filters.forEach((f, i) => {
    const pw = f.length * 6.5 + 16;
    els.push(rect(fx, 62, pw, 22, i === 0 ? TEXT : 'none', { rx: 11, stroke: i === 0 ? 'none' : BORDER, sw: 1 }));
    els.push(text(fx + pw / 2, 77, f, 11, i === 0 ? SURF : TEXT2, { anchor: 'middle', fw: i === 0 ? 600 : 400 }));
    fx += pw + 6;
  });

  // Count + sort
  els.push(text(20, 104, '247 typefaces', 11, TEXT2));
  els.push(text(W - 20, 104, 'A–Z ↓', 11, TEXT2, { anchor: 'end' }));
  els.push(line(0, 114, W, 114, BORDER, { sw: 0.5 }));

  // Type family rows — archival list
  const families = [
    { name: 'Attila',       cat: 'Display Grotesque', weights: '18', foundry: 'KOMETA', tags: ['Radical', 'High-End'], isNew: true },
    { name: 'Uniforma',     cat: 'Sans Variable',      weights: '18', foundry: 'KOMETA', tags: ['Frictionless', 'Interface'], isNew: false },
    { name: 'Victor',       cat: 'Transitional Serif', weights: '12', foundry: 'RETYPE', tags: ['Editorial', 'Classic'], isNew: false },
    { name: 'Stabil Grotesk', cat: 'Geometric Mono',   weights: '7',  foundry: 'KOMETA', tags: ['Technical', 'Precise'], isNew: true },
  ];

  families.forEach((fam, i) => {
    const rowY = 122 + i * 176;
    if (i > 0) els.push(line(0, rowY - 4, W, rowY - 4, BORDER, { sw: 0.5 }));

    // Large display specimen — the star of the row
    els.push(text(20, rowY + 52, fam.name, 46, TEXT, { fw: 300, font: 'Georgia, serif', ls: -1 }));

    // Sample alphabet
    els.push(text(20, rowY + 72, 'Aa Bb Cc Dd Ee Ff Gg Hh Ii', 10, TEXT2, { ls: 0.3 }));

    // Meta
    els.push(text(20, rowY + 90, fam.cat, 10, TEXT2, { ls: 0.3 }));
    els.push(text(20, rowY + 108, fam.foundry, 9, ACC2, { fw: 600, ls: 1.5 }));
    els.push(text(W - 20, rowY + 90, fam.weights + ' styles', 10, TEXT2, { anchor: 'end' }));

    // Tags
    let tagX = 20;
    fam.tags.forEach(tag => {
      const tw = tag.length * 5.2 + 12;
      els.push(rect(tagX, rowY + 120, tw, 18, CARD, { rx: 3 }));
      els.push(text(tagX + tw / 2, rowY + 132, tag.toUpperCase(), 7.5, TEXT, { anchor: 'middle', fw: 500, ls: 0.6 }));
      tagX += tw + 5;
    });
    if (fam.isNew) {
      els.push(rect(W - 52, rowY + 120, 32, 18, ACC2, { rx: 3 }));
      els.push(text(W - 36, rowY + 132, 'NEW', 7.5, SURF, { anchor: 'middle', fw: 700, ls: 1 }));
    }
  });

  bottomNav(els, 'Discover');
  archivalMargin(els, 1, 7);
  return els;
}

// ─── Screen 2: Specimen — full type specimen ──────────────────────────────────
function screenSpecimen() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Nav back
  els.push(text(20, 46, '← Attila', 13, TEXT, { fw: 500 }));
  els.push(text(W - 20, 46, 'License →', 12, ACC2, { anchor: 'end', fw: 600 }));
  els.push(line(0, 54, W, 54, BORDER, { sw: 1 }));

  // Hero specimen block
  els.push(rect(0, 54, W, 170, CARD));
  els.push(text(W / 2, 128, 'Attila', 72, TEXT, { fw: 700, font: 'Georgia, serif', anchor: 'middle', ls: -2 }));
  els.push(text(W / 2, 160, 'Display Grotesque  ·  18 Styles', 10, TEXT2, { anchor: 'middle', ls: 1.5 }));
  els.push(line(0, 224, W, 224, BORDER, { sw: 0.5 }));

  // Weight waterfall
  els.push(text(20, 244, 'WEIGHT WATERFALL', 8.5, TEXT2, { fw: 600, ls: 2 }));
  els.push(line(0, 252, W, 252, BORDER, { sw: 0.5 }));

  const weights = [
    { label: '100 · Thin',        fw: 100, str: 'The quick brown fox' },
    { label: '300 · Light',       fw: 300, str: 'The quick brown fox' },
    { label: '400 · Regular',     fw: 400, str: 'The quick brown fox' },
    { label: '700 · Bold',        fw: 700, str: 'The quick brown fox' },
    { label: '900 · Black',       fw: 900, str: 'The quick brown' },
  ];
  weights.forEach((wt, i) => {
    const y = 272 + i * 46;
    els.push(text(20, y + 22, wt.str, 24, TEXT, { fw: wt.fw, font: 'Georgia, serif' }));
    els.push(text(W - 20, y + 12, wt.label, 8, TEXT2, { anchor: 'end' }));
    els.push(line(0, y + 32, W, y + 32, BORDER, { sw: 0.3, opacity: 0.6 }));
  });

  // Tags
  els.push(line(0, 506, W, 506, BORDER, { sw: 1 }));
  els.push(text(20, 526, 'CHARACTER TAGS', 8.5, TEXT2, { fw: 600, ls: 2 }));
  const tags = ['Radical', 'High-End', 'Contrasted', 'Display', 'Latin', 'Greek'];
  let tagX = 20;
  tags.forEach(tag => {
    const tw = tag.length * 5.5 + 16;
    if (tagX + tw > W - 20) return;
    els.push(rect(tagX, 534, tw, 22, CARD, { rx: 3, stroke: BORDER, sw: 1 }));
    els.push(text(tagX + tw / 2, 548, tag.toUpperCase(), 8, TEXT, { anchor: 'middle', fw: 500, ls: 0.8 }));
    tagX += tw + 6;
  });

  // Foundry credit
  els.push(line(0, 572, W, 572, BORDER, { sw: 1 }));
  els.push(text(20, 594, 'KOMETA Typefaces', 13, TEXT, { fw: 600 }));
  els.push(text(20, 612, 'Independent foundry  ·  Basel, Switzerland', 11, TEXT2));
  els.push(text(20, 630, '"We make fonts that AI couldn\'t invent."', 11, ACC2));

  // CTA buttons
  els.push(rect(20, 652, 160, 44, TEXT, { rx: 6 }));
  els.push(text(100, 678, 'Test Live', 13, SURF, { anchor: 'middle', fw: 600 }));
  els.push(rect(190, 652, 180, 44, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
  els.push(text(280, 678, 'Add to Wishlist', 12, TEXT, { anchor: 'middle', fw: 500 }));

  // Home indicator
  els.push(rect(0, H - 34, W, 34, BG));
  els.push(line(W / 2 - 50, H - 8, W / 2 + 50, H - 8, TEXT, { sw: 3, opacity: 0.15 }));
  archivalMargin(els, 2, 7);
  return els;
}

// ─── Screen 3: Collections ────────────────────────────────────────────────────
function screenCollections() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Status
  els.push(text(20, 22, '9:41', 12, TEXT, { fw: 600 }));
  els.push(text(20, 46, 'LIGA', 16, TEXT, { fw: 700, ls: 4, font: 'Georgia, serif' }));
  els.push(line(0, 54, W, 54, BORDER, { sw: 1 }));

  // Page heading
  els.push(text(20, 84, 'Collections', 26, TEXT, { fw: 300, font: 'Georgia, serif', ls: -0.5 }));
  els.push(text(20, 104, 'Curated by foundry editors', 12, TEXT2));
  els.push(line(0, 116, W, 116, BORDER, { sw: 0.5 }));

  const collections = [
    { title: 'For the Editorial Page', desc: 'Serifs and display types for print-inspired digital media',
      count: '14 families', bg: '#1A1510', fonts: ['Victor', 'Sabon', 'Canela'], letter: 'E' },
    { title: 'Precision Instruments',  desc: 'Mono and technical faces for developer tools',
      count: '9 families',  bg: '#F0EDE6', fonts: ['Stabil', 'Berkeley', 'Geist'], letter: 'M' },
    { title: 'Radical Forms',          desc: 'Experimental and expressive display faces',
      count: '11 families', bg: '#9B7A45', fonts: ['Attila', 'Pangram', 'Noe'], letter: 'R' },
    { title: 'The Invisible Hand',     desc: 'Interface grotesques — readable, neutral, essential',
      count: '18 families', bg: '#F0EDE6', fonts: ['Uniforma', 'Inter', 'Geist'], letter: 'G' },
  ];

  collections.forEach((col, i) => {
    const cardY = 124 + i * 162;
    const dark = col.bg === '#1A1510' || col.bg === '#9B7A45';
    const textCol = dark ? SURF : TEXT;
    const mutedCol = dark ? 'rgba(255,255,255,0.55)' : TEXT2;

    els.push(rect(20, cardY, W - 40, 150, col.bg, { rx: 8 }));

    // Decorative huge letter (background)
    els.push(text(W - 30, cardY + 138, col.letter, 110, dark ? 'rgba(255,255,255,0.05)' : 'rgba(20,18,16,0.04)',
      { anchor: 'end', font: 'Georgia, serif', fw: 700 }));

    // Count
    els.push(text(W - 28, cardY + 22, col.count, 9, mutedCol, { anchor: 'end', fw: 500, ls: 1 }));

    // Title
    els.push(text(28, cardY + 50, col.title, 18, textCol, { fw: 400, font: 'Georgia, serif' }));

    // Desc
    els.push(text(28, cardY + 70, col.desc, 11, mutedCol));

    // Font pills
    let px = 28;
    col.fonts.forEach(f => {
      const fw = f.length * 6 + 14;
      const pillBg = dark ? 'rgba(255,255,255,0.12)' : 'rgba(20,18,16,0.07)';
      const pillTxt = dark ? 'rgba(255,255,255,0.8)' : TEXT;
      els.push(rect(px, cardY + 86, fw, 20, pillBg, { rx: 3 }));
      els.push(text(px + fw / 2, cardY + 99, f, 9, pillTxt, { anchor: 'middle', fw: 400, ls: 0.4 }));
      px += fw + 6;
    });

    // Arrow
    els.push(text(W - 28, cardY + 128, '→', 18, mutedCol, { anchor: 'end' }));
  });

  bottomNav(els, 'Collections');
  archivalMargin(els, 3, 7);
  return els;
}

// ─── Screen 4: My Type ────────────────────────────────────────────────────────
function screenMyType() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 22, '9:41', 12, TEXT, { fw: 600 }));
  els.push(text(20, 46, 'LIGA', 16, TEXT, { fw: 700, ls: 4, font: 'Georgia, serif' }));
  els.push(line(0, 54, W, 54, BORDER, { sw: 1 }));

  els.push(text(20, 82, 'My Type', 26, TEXT, { fw: 300, font: 'Georgia, serif' }));

  // Stats bar
  els.push(rect(20, 94, W - 40, 48, CARD, { rx: 6 }));
  const stats = [{ v: '12', l: 'Saved' }, { v: '3', l: 'Licensed' }, { v: '2', l: 'In Use' }, { v: '7', l: 'Wishlist' }];
  stats.forEach((s, i) => {
    const sx = 20 + i * ((W - 40) / 4) + (W - 40) / 8;
    if (i > 0) els.push(line(20 + i * ((W - 40) / 4), 98, 20 + i * ((W - 40) / 4), 138, BORDER, { sw: 1 }));
    els.push(text(sx, 114, s.v, 17, i === 3 ? ACC2 : TEXT, { anchor: 'middle', fw: 600 }));
    els.push(text(sx, 128, s.l, 9, TEXT2, { anchor: 'middle' }));
  });

  els.push(line(0, 152, W, 152, BORDER, { sw: 0.5 }));

  // Licensed section
  els.push(text(20, 172, 'LICENSED', 8.5, TEXT2, { fw: 600, ls: 2 }));
  const licensed = [
    { name: 'Attila',       styles: '18 styles', license: 'Web · Desktop · App', price: '$240' },
    { name: 'Victor Serif', styles: '12 styles', license: 'Web only',             price: '$180' },
    { name: 'Stabil Mono',  styles: '7 styles',  license: 'Desktop only',         price: '$90'  },
  ];
  licensed.forEach((lic, i) => {
    const ry = 182 + i * 58;
    els.push(line(0, ry, W, ry, BORDER, { sw: 0.3 }));
    els.push(circle(30, ry + 18, 4, GREEN));
    els.push(text(46, ry + 14, lic.name, 16, TEXT, { fw: 400, font: 'Georgia, serif' }));
    els.push(text(46, ry + 30, lic.styles, 10, TEXT2));
    els.push(text(W - 20, ry + 14, lic.price, 12, TEXT, { anchor: 'end', fw: 600 }));
    els.push(text(W - 20, ry + 30, lic.license, 9, TEXT2, { anchor: 'end' }));
  });

  // Wishlist section
  els.push(line(0, 358, W, 358, BORDER, { sw: 1 }));
  els.push(text(20, 378, 'WISHLIST', 8.5, TEXT2, { fw: 600, ls: 2 }));
  els.push(text(W - 20, 378, 'See all →', 10, ACC2, { anchor: 'end', fw: 500 }));

  const wishlist = [
    { name: 'Canela',      foundry: 'Commercial Type',  price: '$320' },
    { name: 'Pangram',     foundry: 'Pangram Pangram',  price: '$180' },
    { name: 'Noe Display', foundry: 'Schick Toikka',    price: '$240' },
    { name: 'GT Super',    foundry: 'Grilli Type',       price: '$290' },
  ];
  wishlist.forEach((wish, i) => {
    const wy = 388 + i * 54;
    els.push(line(0, wy, W, wy, BORDER, { sw: 0.3 }));
    els.push(text(22, wy + 16, '♡', 12, ACC2));
    els.push(text(44, wy + 16, wish.name, 16, TEXT, { fw: 400, font: 'Georgia, serif' }));
    els.push(text(44, wy + 32, wish.foundry, 10, TEXT2));
    els.push(text(W - 20, wy + 16, wish.price, 12, TEXT, { anchor: 'end', fw: 500 }));
    els.push(rect(W - 80, wy + 28, 60, 18, CARD, { rx: 3, stroke: BORDER, sw: 1 }));
    els.push(text(W - 50, wy + 40, 'License', 9, TEXT, { anchor: 'middle', fw: 500 }));
  });

  bottomNav(els, 'My Type');
  archivalMargin(els, 4, 7);
  return els;
}

// ─── Screen 5: Live Test ──────────────────────────────────────────────────────
function screenLiveTest() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 46, '← Test Live', 13, TEXT, { fw: 500 }));
  els.push(text(W - 20, 46, 'Save', 12, ACC2, { anchor: 'end', fw: 600 }));
  els.push(line(0, 54, W, 54, BORDER, { sw: 1 }));

  // Family + weight
  els.push(text(20, 76, 'Attila  ·  Select weight →', 13, TEXT, { fw: 500 }));

  // Weight pills
  const wts = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
  let px = 20;
  wts.forEach((w, i) => {
    const active = i === 6;
    els.push(rect(px, 86, 34, 22, active ? TEXT : CARD, { rx: 4, stroke: active ? 'none' : BORDER, sw: 1 }));
    els.push(text(px + 17, 101, w, 9, active ? SURF : TEXT2, { anchor: 'middle', fw: active ? 600 : 400 }));
    px += 40;
  });

  // Size slider
  els.push(text(20, 126, 'Size', 9, TEXT2, { fw: 600, ls: 1.5 }));
  els.push(line(20, 140, W - 20, 140, BORDER, { sw: 2 }));
  els.push(line(20, 140, 200, 140, TEXT, { sw: 2 }));
  els.push(circle(200, 140, 7, TEXT));
  els.push(text(20, 156, '12px', 9, TEXT2));
  els.push(text(200, 156, '48px', 9, TEXT, { anchor: 'middle', fw: 600 }));
  els.push(text(W - 20, 156, '200px', 9, TEXT2, { anchor: 'end' }));

  // Preview area
  els.push(rect(0, 168, W, 260, CARD));
  els.push(line(0, 168, W, 168, BORDER, { sw: 0.5 }));
  els.push(line(0, 428, W, 428, BORDER, { sw: 0.5 }));
  els.push(text(W / 2, 254, 'The quick', 48, TEXT, { fw: 700, font: 'Georgia, serif', anchor: 'middle', ls: -1 }));
  els.push(text(W / 2, 310, 'brown fox', 48, TEXT, { fw: 700, font: 'Georgia, serif', anchor: 'middle', ls: -1 }));
  els.push(text(W / 2, 356, 'jumps.', 48, TEXT, { fw: 700, font: 'Georgia, serif', anchor: 'middle', ls: -1 }));
  els.push(text(W / 2, 416, '✎ tap to edit', 10, TEXT2, { anchor: 'middle' }));

  // Presets
  els.push(text(20, 448, 'PRESETS', 8.5, TEXT2, { fw: 600, ls: 2 }));
  const presets = ['Alphabet', 'Numerals', 'Pangram', 'Custom', 'Headline'];
  let prX = 20;
  presets.forEach(p => {
    const pw = p.length * 6.2 + 14;
    els.push(rect(prX, 456, pw, 22, 'none', { rx: 3, stroke: BORDER, sw: 1 }));
    els.push(text(prX + pw / 2, 470, p, 9, TEXT2, { anchor: 'middle' }));
    prX += pw + 7;
  });

  // Pairing suggestions
  els.push(line(0, 490, W, 490, BORDER, { sw: 0.5 }));
  els.push(text(20, 510, 'PAIR WITH', 8.5, TEXT2, { fw: 600, ls: 2 }));
  const pairs = [
    { a: 'Attila Bold', b: 'Victor Light' },
    { a: 'Attila Black', b: 'Stabil Mono' },
  ];
  pairs.forEach((pair, i) => {
    const py = 520 + i * 56;
    const hw = (W - 48) / 2;
    els.push(rect(20, py, hw, 46, CARD, { rx: 4 }));
    els.push(text(20 + hw / 2, py + 22, pair.a.split(' ')[0], 20, TEXT, { anchor: 'middle', font: 'Georgia, serif', fw: 700 }));
    els.push(text(20 + hw / 2, py + 36, pair.a.split(' ').slice(1).join(' '), 8, TEXT2, { anchor: 'middle' }));
    els.push(rect(28 + hw, py, hw, 46, CARD, { rx: 4 }));
    els.push(text(28 + hw + hw / 2, py + 22, pair.b.split(' ')[0], 20, TEXT, { anchor: 'middle', font: 'Georgia, serif', fw: 300 }));
    els.push(text(28 + hw + hw / 2, py + 36, pair.b.split(' ').slice(1).join(' '), 8, TEXT2, { anchor: 'middle' }));
  });

  // Purchase bar
  els.push(rect(0, H - 112, W, 112, SURF));
  els.push(line(0, H - 112, W, H - 112, BORDER, { sw: 1 }));
  els.push(text(20, H - 86, 'Attila Display — 18 styles', 13, TEXT, { fw: 500 }));
  els.push(text(20, H - 68, 'Web + Desktop license', 11, TEXT2));
  els.push(text(W - 20, H - 74, '$240', 22, TEXT, { anchor: 'end', fw: 600 }));
  els.push(rect(20, H - 54, W - 40, 38, TEXT, { rx: 6 }));
  els.push(text(W / 2, H - 29, 'Purchase License', 13, SURF, { anchor: 'middle', fw: 600 }));
  archivalMargin(els, 5, 7);
  return els;
}

// ─── Screen 6: License Checkout ───────────────────────────────────────────────
function screenLicense() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 46, '← License', 13, TEXT, { fw: 500 }));
  els.push(line(0, 54, W, 54, BORDER, { sw: 1 }));

  els.push(text(20, 84, 'Choose License', 22, TEXT, { fw: 300, font: 'Georgia, serif' }));

  const licTypes = [
    { name: 'Web',      desc: 'Unlimited pageviews · 1 domain',  price: '$60',  period: '/year',    popular: false, sel: false },
    { name: 'Desktop',  desc: 'Unlimited users · 1 studio',       price: '$90',  period: 'one-time', popular: false, sel: false },
    { name: 'App',      desc: 'iOS & Android · 1 app',            price: '$120', period: 'one-time', popular: true,  sel: false },
    { name: 'Bundle',   desc: 'Web + Desktop + App  ·  Best value', price: '$240', period: 'one-time', popular: false, sel: true  },
  ];

  licTypes.forEach((lic, i) => {
    const cy = 100 + i * 76;
    const dark = lic.sel;
    els.push(rect(20, cy, W - 40, 66, dark ? TEXT : SURF, { rx: 6, stroke: dark ? 'none' : BORDER, sw: 1 }));
    if (lic.popular && !lic.sel) {
      els.push(rect(W - 80, cy + 8, 60, 18, ACC2, { rx: 3 }));
      els.push(text(W - 50, cy + 20, 'POPULAR', 7.5, SURF, { anchor: 'middle', fw: 700, ls: 1 }));
    }
    // Radio
    els.push(circle(44, cy + 32, 9, 'none', { stroke: dark ? SURF : BORDER, sw: 1.5 }));
    if (dark) els.push(circle(44, cy + 32, 5, SURF));
    els.push(text(64, cy + 26, lic.name, 15, dark ? SURF : TEXT, { fw: 600 }));
    els.push(text(64, cy + 44, lic.desc, 11, dark ? 'rgba(255,255,255,0.6)' : TEXT2));
    els.push(text(W - 28, cy + 26, lic.price, 16, dark ? SURF : TEXT, { anchor: 'end', fw: 600 }));
    els.push(text(W - 28, cy + 44, lic.period, 9, dark ? 'rgba(255,255,255,0.5)' : TEXT2, { anchor: 'end' }));
  });

  // Selected family
  els.push(line(0, 410, W, 410, BORDER, { sw: 1 }));
  els.push(text(20, 432, 'SELECTED FAMILY', 8.5, TEXT2, { fw: 600, ls: 2 }));
  els.push(rect(20, 442, W - 40, 54, CARD, { rx: 6 }));
  els.push(text(36, 466, 'Attila Display', 20, TEXT, { fw: 300, font: 'Georgia, serif' }));
  els.push(text(36, 484, 'KOMETA Typefaces  ·  18 styles', 10, TEXT2));
  els.push(text(W - 28, 462, '18', 24, ACC2, { anchor: 'end', fw: 600 }));
  els.push(text(W - 28, 480, 'styles', 9, TEXT2, { anchor: 'end' }));

  // Summary
  els.push(line(0, 510, W, 510, BORDER, { sw: 1 }));
  els.push(text(20, 530, 'ORDER SUMMARY', 8.5, TEXT2, { fw: 600, ls: 2 }));
  els.push(text(20, 552, 'Attila Display — Bundle License', 12, TEXT));
  els.push(text(W - 20, 552, '$240.00', 12, TEXT, { anchor: 'end', fw: 500 }));
  els.push(text(20, 572, 'Tax (0%)', 11, TEXT2));
  els.push(text(W - 20, 572, '$0.00', 11, TEXT2, { anchor: 'end' }));
  els.push(line(20, 584, W - 20, 584, BORDER, { sw: 1 }));
  els.push(text(20, 604, 'Total', 14, TEXT, { fw: 600 }));
  els.push(text(W - 20, 604, '$240.00', 14, TEXT, { anchor: 'end', fw: 600 }));
  els.push(text(20, 622, '✓ Perpetual  ✓ Updates included  ✓ Invoice', 9, TEXT2));

  // CTA
  els.push(rect(20, H - 110, W - 40, 44, TEXT, { rx: 6 }));
  els.push(text(W / 2, H - 83, 'Purchase · $240', 14, SURF, { anchor: 'middle', fw: 600 }));
  els.push(text(W / 2, H - 58, 'Secure checkout · Instant delivery', 10, TEXT2, { anchor: 'middle' }));

  // Home bar
  els.push(rect(0, H - 34, W, 34, BG));
  els.push(line(W / 2 - 50, H - 8, W / 2 + 50, H - 8, TEXT, { sw: 3, opacity: 0.15 }));
  archivalMargin(els, 6, 7);
  return els;
}

// ─── Screen 7: Onboarding — editorial splash ──────────────────────────────────
function screenOnboarding() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Top mark
  els.push(text(20, 64, 'LIGA', 22, TEXT, { fw: 700, ls: 6, font: 'Georgia, serif' }));
  els.push(text(W - 20, 64, 'β', 16, ACC2, { anchor: 'end', fw: 400 }));
  els.push(line(0, 76, W, 76, BORDER, { sw: 1 }));

  // Hero — giant decorative letterform
  els.push(text(W / 2, 310, 'Aa', 220, TEXT, { fw: 300, font: 'Georgia, serif', anchor: 'middle', opacity: 0.06 }));

  // Centered headline
  els.push(text(W / 2, 200, 'Independent', 36, TEXT, { fw: 300, font: 'Georgia, serif', anchor: 'middle', ls: -1 }));
  els.push(text(W / 2, 244, 'type.', 36, TEXT, { fw: 700, font: 'Georgia, serif', anchor: 'middle', ls: -1 }));
  els.push(text(W / 2, 288, 'Human-made.', 36, ACC2, { fw: 300, font: 'Georgia, serif', anchor: 'middle', ls: -0.5 }));

  // Features list
  els.push(line(0, 360, W, 360, BORDER, { sw: 0.5 }));
  const features = [
    { icon: '◉', text: '247 typefaces from independent foundries' },
    { icon: '◎', text: 'Live in-browser type testing' },
    { icon: '○', text: 'Curated editorial collections' },
    { icon: '◍', text: 'Instant licensing — no subscriptions' },
  ];
  features.forEach((f, i) => {
    const fy = 370 + i * 50;
    els.push(line(0, fy + 46, W, fy + 46, BORDER, { sw: 0.3, opacity: 0.5 }));
    els.push(text(24, fy + 28, f.icon, 14, ACC2, { anchor: 'middle' }));
    els.push(text(44, fy + 28, f.text, 13, TEXT));
    // Decorative right counter
    els.push(text(W - 20, fy + 28, String(i + 1).padStart(2, '0'), 11, BORDER, { anchor: 'end', fw: 600 }));
  });

  // Tagline
  els.push(line(0, 566, W, 566, BORDER, { sw: 1 }));
  els.push(text(W / 2, 600, '"We believe type is culture."', 14, TEXT2, { anchor: 'middle', font: 'Georgia, serif' }));
  els.push(text(W / 2, 622, '— LIGA, 2025', 11, TEXT2, { anchor: 'middle' }));

  // Founding notes — archival index style
  els.push(line(0, 644, W, 644, BORDER, { sw: 0.5 }));
  const notes = [
    ['Curators',  'Basel / Berlin / Tokyo'],
    ['Founded',   '2024'],
    ['Foundries', '38 independent'],
    ['Typefaces', '247 and growing'],
  ];
  notes.forEach((n, i) => {
    const ny = 656 + i * 28;
    els.push(text(20, ny, n[0], 9, TEXT2, { fw: 600, ls: 1 }));
    els.push(text(W - 20, ny, n[1], 9, TEXT2, { anchor: 'end' }));
    if (i < notes.length - 1) els.push(line(0, ny + 10, W, ny + 10, BORDER, { sw: 0.3, opacity: 0.4 }));
  });

  // CTA
  els.push(rect(20, H - 116, W - 40, 44, TEXT, { rx: 6 }));
  els.push(text(W / 2, H - 89, 'Start Discovering', 14, SURF, { anchor: 'middle', fw: 600 }));
  els.push(rect(20, H - 64, W - 40, 38, 'none', { rx: 6, stroke: BORDER, sw: 1 }));
  els.push(text(W / 2, H - 40, 'I\'m a type foundry →', 12, TEXT2, { anchor: 'middle' }));
  els.push(rect(0, H - 18, W, 18, BG));
  els.push(line(W / 2 - 50, H - 6, W / 2 + 50, H - 6, TEXT, { sw: 3, opacity: 0.12 }));
  archivalMargin(els, 0, 7);
  return els;
}

// ─── Assemble ─────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Onboarding',  fn: screenOnboarding },
  { name: 'Discover',    fn: screenDiscover },
  { name: 'Specimen',    fn: screenSpecimen },
  { name: 'Collections', fn: screenCollections },
  { name: 'My Type',     fn: screenMyType },
  { name: 'Live Test',   fn: screenLiveTest },
  { name: 'License',     fn: screenLicense },
];

const penScreens = screens.map(s => {
  const els = s.fn();
  return { name: s.name, svg: buildSVG(els), elements: els };
});

const totalElements = penScreens.reduce((a, s) => a + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: DATE,
    theme: 'light',
    heartbeat: 'auto',
    elements: totalElements,
    slug: SLUG,
    tagline: 'Independent type. Human-made.',
    archetype: 'type-tool',
    inspiration: 'KOMETA Typefaces (minimal.gallery) + archival index aesthetic (siteinspire.com)',
  },
  screens: penScreens.map(s => ({ name: s.name, svg: s.svg, elements: s.elements })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
