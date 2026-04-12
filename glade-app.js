/**
 * Glade — Nature Walk & Observation Journal
 * RAM Design Heartbeat · April 4 2026
 *
 * Inspired by:
 *  - Litbix (minimal.gallery) → editorial serif typography, warm paper tones, content-first aesthetic
 *  - Dawn health app (lapa.ninja) → nature/wellness tracking with clean structure
 *
 * Challenge: Apply literary-magazine typography conventions (generous leading,
 * editorial hierarchy, warm neutrals) to a *field-notes* interface —
 * a style pattern rarely seen in nature/outdoors apps.
 *
 * Light theme. 5 screens.
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F4EFE4',   // warm parchment
  surface:  '#FFFDF7',   // cream card
  surface2: '#EDE8DC',   // slightly deeper parchment for inset areas
  text:     '#1E1B14',   // warm near-black (ink)
  textMid:  '#5A5040',   // warm mid-tone brown
  textFaint:'#9A8E7A',   // faded ink
  accent:   '#3D6B47',   // forest green
  accent2:  '#A0522D',   // sienna / clay
  accent3:  '#6B8E6A',   // sage (softer green)
  rule:     '#D8D0C0',   // hairline divider
  tag1:     '#C8E6C9',   // soft green tag bg
  tag2:     '#FFE0B2',   // soft amber tag bg
  tag3:     '#E8EAF6',   // lavender tag bg
  white:    '#FFFFFF',
};

// ─── Typography helpers ───────────────────────────────────────────────────────
const SERIF  = '"Georgia", "Times New Roman", serif';
const SANS   = '"Inter", "Helvetica Neue", sans-serif';
const MONO   = '"JetBrains Mono", "Fira Mono", monospace';

// ─── SVG helpers ─────────────────────────────────────────────────────────────
const W = 390, H = 844;

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <style>
      text { font-family: ${SANS}; }
      .serif { font-family: ${SERIF}; }
      .mono  { font-family: ${MONO}; }
    </style>
  </defs>
  ${content}
</svg>`;
}

function rect(x, y, w, h, fill, rx=0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;
}

function text(x, y, content, opts={}) {
  const {
    size=14, fill=P.text, weight='normal', anchor='start',
    family=SANS, opacity=1, letterSpacing=0, lineHeight,
  } = opts;
  const style = `font-size:${size}px;font-family:${family};font-weight:${weight};letter-spacing:${letterSpacing}px;${lineHeight ? `line-height:${lineHeight}px;` : ''}`;
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}"
    style="${style}">${content}</text>`;
}

function line(x1, y1, x2, y2, stroke=P.rule, width=1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
}

function circle(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

function tag(x, y, label, bg='#C8E6C9', fg='#2E7D32') {
  const pw = 10, ph = 6, fs = 10;
  const w = label.length * 6 + pw * 2;
  return `<g>
    ${rect(x, y - 14, w, 20, bg, 10)}
    ${text(x + pw, y, label, { size: fs, fill: fg, weight: '600', letterSpacing: 0.3 })}
  </g>`;
}

// ─── Status bar ──────────────────────────────────────────────────────────────
function statusBar() {
  return `<g>
    ${text(20, 22, '9:41', { size: 15, weight: '600', fill: P.text })}
    ${text(370, 22, '●●● ▲', { size: 11, fill: P.textMid, anchor: 'end' })}
  </g>`;
}

// ─── Nav bar ─────────────────────────────────────────────────────────────────
function navBar(active=0) {
  const items = [
    { label: 'Today', icon: '◉' },
    { label: 'Observe', icon: '◎' },
    { label: 'Journal', icon: '▦' },
    { label: 'Log', icon: '≡' },
    { label: 'Stats', icon: '◈' },
  ];
  const iw = W / items.length;
  const by = H - 34;
  let out = rect(0, H - 72, W, 72, P.surface);
  out += line(0, H - 72, W, H - 72, P.rule, 1);
  items.forEach((item, i) => {
    const cx = iw * i + iw / 2;
    const isActive = i === active;
    const fillC = isActive ? P.accent : P.textFaint;
    out += text(cx, by - 16, item.icon, { size: 20, fill: fillC, anchor: 'middle' });
    out += text(cx, by + 2, item.label, { size: 10, fill: fillC, anchor: 'middle', weight: isActive ? '600' : '400' });
    if (isActive) out += circle(cx, H - 64, 3, P.accent);
  });
  return out;
}

// ─── Leaf/botanical accent SVGs ───────────────────────────────────────────────
function leafAccent(x, y, color=P.accent3, scale=1) {
  // Simple leaf shape using path
  const s = scale;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0,0 C-8,-12 -4,-20 0,-24 C4,-20 8,-12 0,0Z" fill="${color}" opacity="0.6"/>
    <line x1="0" y1="-1" x2="0" y2="-22" stroke="${color}" stroke-width="1" opacity="0.5"/>
  </g>`;
}

function sprig(x, y, color=P.accent3) {
  return `<g transform="translate(${x},${y})">
    <path d="M0,0 L0,-30" stroke="${color}" stroke-width="1.5" opacity="0.4"/>
    <path d="M0,-10 C-10,-14 -14,-10 -12,-6" stroke="${color}" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M0,-18 C10,-22 14,-18 12,-14" stroke="${color}" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M0,-25 C-8,-30 -10,-26 -8,-22" stroke="${color}" stroke-width="1" fill="none" opacity="0.4"/>
  </g>`;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function progressBar(x, y, w, h, pct, fill=P.accent, bg=P.surface2) {
  return `<g>
    ${rect(x, y, w, h, bg, h/2)}
    ${rect(x, y, w * pct, h, fill, h/2)}
  </g>`;
}

// ─── SCREEN 1: Today's Walk ───────────────────────────────────────────────────
function screen1() {
  let out = rect(0, 0, W, H, P.bg);
  out += statusBar();

  // Decorative sprig — editorial touch
  out += sprig(358, 60, P.accent3);
  out += leafAccent(342, 82, P.accent, 0.8);

  // Header — serif editorial style
  out += text(24, 58, 'Glade', { size: 28, weight: '700', family: SERIF, fill: P.text, letterSpacing: -0.5 });
  out += text(24, 78, 'Saturday, April 4', { size: 13, fill: P.textMid });

  out += line(24, 92, W - 24, 92, P.rule);

  // Today's walk card — prominent hero
  out += rect(20, 104, W - 40, 140, P.surface, 16);
  // subtle rule accent
  out += rect(20, 104, 3, 140, P.accent, 2);

  out += text(36, 128, 'Afternoon Walk', { size: 18, weight: '700', family: SERIF, fill: P.text });
  out += text(36, 147, 'Highgate Wood · 2.4 km · 48 min', { size: 12, fill: P.textMid });

  // Walk stats row
  const stats = [
    { icon: '◎', label: '7 sightings' },
    { icon: '◉', label: '18°C' },
    { icon: '▲', label: '62m elev' },
  ];
  stats.forEach((s, i) => {
    const sx = 36 + i * 108;
    out += rect(sx, 162, 96, 30, P.surface2, 8);
    out += text(sx + 10, 181, s.icon, { size: 12, fill: P.accent });
    out += text(sx + 26, 181, s.label, { size: 11, fill: P.textMid });
  });

  // Progress toward daily goal
  out += text(36, 218, 'Daily goal: 3 walks', { size: 11, fill: P.textFaint });
  out += progressBar(36, 224, W - 72, 6, 0.33, P.accent, P.rule);
  out += text(36, 244, '1 of 3 complete', { size: 10, fill: P.textFaint });

  // Divider + section header
  out += line(24, 258, W - 24, 258, P.rule);
  out += text(24, 278, 'Recent Sightings', { size: 13, weight: '600', family: SERIF, fill: P.text, letterSpacing: 0.2 });

  // Sighting rows
  const sightings = [
    { name: 'Great Tit', type: 'Bird', note: 'Pair in oak canopy, singing', icon: '🐦', tag: 'Bird' },
    { name: 'Wood Anemone', type: 'Flower', note: 'Carpet beneath beeches', icon: '🌸', tag: 'Flora' },
    { name: 'Nuthatch', type: 'Bird', note: 'Descending headfirst, hazel', icon: '🐦', tag: 'Bird' },
  ];

  sightings.forEach((s, i) => {
    const ry = 292 + i * 76;
    out += rect(20, ry, W - 40, 66, P.surface, 12);
    // emoji / icon bg
    out += rect(32, ry + 10, 40, 40, P.surface2, 10);
    out += text(52, ry + 36, s.icon, { size: 20, anchor: 'middle' });
    // text content
    out += text(84, ry + 26, s.name, { size: 14, weight: '600', family: SERIF, fill: P.text });
    out += text(84, ry + 42, s.note, { size: 11, fill: P.textMid });
    // tag
    const tagBg = s.tag === 'Bird' ? P.tag1 : P.tag2;
    const tagFg = s.tag === 'Bird' ? '#2E7D32' : '#E65100';
    out += tag(W - 90, ry + 22, s.tag, tagBg, tagFg);

    if (i < sightings.length - 1) out += line(84, ry + 66, W - 24, ry + 66, P.rule, 0.5);
  });

  // Bottom link
  out += text(W / 2, 522, 'View all 7 sightings →', { size: 12, fill: P.accent, anchor: 'middle', weight: '600' });

  out += navBar(0);
  return svg(out);
}

// ─── SCREEN 2: New Observation ─────────────────────────────────────────────────
function screen2() {
  let out = rect(0, 0, W, H, P.bg);
  out += statusBar();

  // Back nav
  out += text(20, 55, '← Today', { size: 13, fill: P.accent });

  // Title — large serif, editorial weight
  out += text(24, 84, 'New', { size: 36, weight: '700', family: SERIF, fill: P.text, letterSpacing: -1 });
  out += text(24, 116, 'Observation', { size: 36, weight: '700', family: SERIF, fill: P.accent, letterSpacing: -1 });

  // Decorative leaves
  out += leafAccent(340, 80, P.accent3, 1.2);
  out += leafAccent(355, 92, P.accent, 0.7);

  out += line(24, 128, W - 24, 128, P.rule);

  // Location pill
  out += rect(20, 140, W - 40, 36, P.surface, 18);
  out += text(36, 163, '◎  Highgate Wood · just now', { size: 12, fill: P.textMid });

  // Photo placeholder
  out += rect(20, 186, W - 40, 140, P.surface2, 14);
  out += circle(W / 2, 256, 28, P.surface);
  out += text(W / 2, 264, '+', { size: 28, fill: P.textFaint, anchor: 'middle', weight: '300' });
  out += text(W / 2, 284, 'Add photo', { size: 12, fill: P.textFaint, anchor: 'middle' });

  // What did you see? — editorial input area
  out += text(24, 348, 'What did you see?', { size: 13, weight: '600', family: SERIF, fill: P.text });
  out += rect(20, 358, W - 40, 44, P.surface, 10);
  out += rect(20, 358, 2, 44, P.accent, 2);
  out += text(36, 385, 'Species or description…', { size: 13, fill: P.textFaint, family: SERIF });

  // Category chips
  out += text(24, 424, 'Category', { size: 12, weight: '600', fill: P.textMid });
  const cats = ['🐦 Bird', '🌿 Flora', '🦋 Insect', '🍄 Fungi', '🦊 Mammal'];
  let cx = 24;
  cats.forEach((c, i) => {
    const cw = c.length * 7.5 + 20;
    const isSelected = i === 0;
    out += rect(cx, 434, cw, 28, isSelected ? P.accent : P.surface, 14);
    out += text(cx + cw / 2, 452, c, { size: 11, fill: isSelected ? P.white : P.textMid, anchor: 'middle', weight: isSelected ? '600' : '400' });
    cx += cw + 8;
    if (cx > W - 24) cx = 24;
  });

  // Notes field
  out += text(24, 490, 'Field notes', { size: 12, weight: '600', fill: P.textMid });
  out += rect(20, 500, W - 40, 80, P.surface, 10);
  out += rect(20, 500, 2, 80, P.rule, 2);
  out += text(36, 522, 'Describe behaviour, habitat,', { size: 12, fill: P.textFaint, family: SERIF });
  out += text(36, 540, 'light conditions…', { size: 12, fill: P.textFaint, family: SERIF });

  // Behaviour quick-tags
  out += text(24, 604, 'Behaviour', { size: 12, weight: '600', fill: P.textMid });
  const behaviours = ['Singing', 'Feeding', 'Nesting', 'In flight'];
  let bx = 24;
  behaviours.forEach(b => {
    const bw = b.length * 7 + 20;
    out += rect(bx, 614, bw, 26, P.surface2, 13);
    out += text(bx + bw / 2, 631, b, { size: 11, fill: P.textMid, anchor: 'middle' });
    bx += bw + 8;
  });

  // Save button
  out += rect(20, 656, W - 40, 48, P.accent, 24);
  out += text(W / 2, 685, 'Save Observation', { size: 15, fill: P.white, anchor: 'middle', weight: '600' });

  out += navBar(1);
  return svg(out);
}

// ─── SCREEN 3: Journal Entry ──────────────────────────────────────────────────
function screen3() {
  let out = rect(0, 0, W, H, P.bg);
  out += statusBar();

  // Header
  out += text(W / 2, 56, 'Field Journal', { size: 16, weight: '700', family: SERIF, fill: P.text, anchor: 'middle' });

  // Date / page info — editorial magazine-style
  out += text(24, 80, 'APRIL 2026', { size: 10, fill: P.textFaint, weight: '600', letterSpacing: 2 });
  out += text(W - 24, 80, 'Entry #47', { size: 10, fill: P.textFaint, weight: '600', anchor: 'end', letterSpacing: 1 });

  out += line(24, 90, W - 24, 90, P.rule);

  // Entry header — strong editorial serif
  out += text(24, 118, 'A morning of quiet', { size: 22, weight: '700', family: SERIF, fill: P.text, letterSpacing: -0.5 });
  out += text(24, 142, 'in Highgate Wood', { size: 22, weight: '700', family: SERIF, fill: P.accent, letterSpacing: -0.5 });

  out += text(24, 162, 'Saturday · 48 min walk · 7 sightings', { size: 11, fill: P.textFaint });

  // Decorative rule — editorial column divider
  out += rect(24, 175, 40, 2, P.accent, 1);

  // Body text — serif, generous leading, like printed journal
  const paras = [
    'The beeches were just coming into leaf, that particular',
    'shade of luminous green that only lasts a week in April.',
    'A pair of Great Tits working through the canopy above',
    'me, singing alternately. Below, a carpet of Wood',
    'Anemone stretched twenty metres along the path.',
  ];
  paras.forEach((p, i) => {
    out += text(24, 196 + i * 19, p, { size: 13, fill: P.text, family: SERIF });
  });

  // Pull quote — magazine convention
  out += rect(20, 306, W - 40, 76, P.surface, 12);
  out += rect(20, 306, 3, 76, P.accent2, 2);
  out += text(34, 328, '"The Nuthatch came down the trunk', { size: 14, fill: P.text, family: SERIF, weight: '400' });
  out += text(34, 348, 'headfirst — always startling."', { size: 14, fill: P.text, family: SERIF, weight: '400' });
  out += text(34, 368, '— Field notes, 14:32', { size: 11, fill: P.textFaint });

  // Second paragraph
  const paras2 = [
    'The Nuthatch appeared at 14:32 on a hazel about',
    '3m up. Moving headfirst down the trunk, typical',
    'of the species. Stayed for nearly two minutes.',
  ];
  paras2.forEach((p, i) => {
    out += text(24, 404 + i * 19, p, { size: 13, fill: P.text, family: SERIF });
  });

  out += line(24, 468, W - 24, 468, P.rule);

  // Sighting summary — editorial column layout
  out += text(24, 488, 'Sightings logged', { size: 12, weight: '600', family: SERIF, fill: P.text });

  const species = [
    { n: 'Great Tit', c: 2, t: 'Bird' },
    { n: 'Nuthatch', c: 1, t: 'Bird' },
    { n: 'Wood Anemone', c: 'patch', t: 'Flora' },
    { n: 'Mistle Thrush', c: 1, t: 'Bird' },
  ];
  species.forEach((s, i) => {
    const sy = 504 + i * 30;
    const cx = Math.floor(i / 2) * (W / 2 - 24) + 24;
    const iy = i % 2;
    const sx = iy === 0 ? 24 : W / 2 + 12;
    const sy2 = 504 + Math.floor(i / 2) * 30;
    out += text(sx, sy2 + 16, `${s.n}`, { size: 12, fill: P.text, family: SERIF });
    out += text(sx, sy2 + 28, `×${s.c}`, { size: 10, fill: P.textFaint });
  });

  // Mood + weather tags
  out += line(24, 576, W - 24, 576, P.rule);
  out += text(24, 594, 'Conditions', { size: 11, weight: '600', fill: P.textFaint, letterSpacing: 1 });

  const conditions = ['Partly cloudy', '18°C', 'Light breeze', 'Good visibility'];
  let tcx = 24;
  conditions.forEach(c => {
    const tw2 = c.length * 6.5 + 18;
    out += rect(tcx, 602, tw2, 22, P.surface2, 11);
    out += text(tcx + tw2 / 2, 617, c, { size: 10, fill: P.textMid, anchor: 'middle' });
    tcx += tw2 + 6;
  });

  out += navBar(2);
  return svg(out);
}

// ─── SCREEN 4: My Sightings Log ───────────────────────────────────────────────
function screen4() {
  let out = rect(0, 0, W, H, P.bg);
  out += statusBar();

  // Header
  out += text(24, 56, 'Sightings', { size: 24, weight: '700', family: SERIF, fill: P.text });
  out += text(24, 74, '143 observations · 68 species', { size: 12, fill: P.textMid });

  // Filter row
  const filters = ['All', 'Birds', 'Flora', 'Insects', 'Fungi'];
  let fx = 24;
  filters.forEach((f, i) => {
    const fw = f.length * 7.5 + 18;
    const isActive = i === 0;
    out += rect(fx, 84, fw, 26, isActive ? P.accent : P.surface, 13);
    out += text(fx + fw / 2, 101, f, { size: 11, fill: isActive ? P.white : P.textMid, anchor: 'middle', weight: isActive ? '600' : '400' });
    fx += fw + 8;
  });

  out += line(24, 120, W - 24, 120, P.rule);

  // Month header — editorial magazine style
  out += text(24, 140, 'APRIL 2026', { size: 10, fill: P.textFaint, weight: '700', letterSpacing: 2 });

  // Sighting cards — two-column editorial grid
  const items = [
    { name: 'Great Tit', loc: 'Highgate', icon: '🐦', cnt: 4, new: true },
    { name: 'Wood Anemone', loc: 'Highgate', icon: '🌸', cnt: 2 },
    { name: 'Nuthatch', loc: 'Highgate', icon: '🐦', cnt: 1, new: true },
    { name: 'Mistle Thrush', loc: 'Hampstead', icon: '🐦', cnt: 3 },
    { name: 'Bluebell', loc: 'Highgate', icon: '💜', cnt: 1, new: true },
    { name: 'Robin', loc: 'Hampstead', icon: '🐦', cnt: 6 },
  ];

  const cols = 2, cw = (W - 48 - 12) / cols;
  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ix = 24 + col * (cw + 12);
    const iy = 150 + row * 98;
    out += rect(ix, iy, cw, 86, P.surface, 12);
    // large emoji
    out += text(ix + cw / 2, iy + 38, item.icon, { size: 28, anchor: 'middle' });
    out += text(ix + cw / 2, iy + 58, item.name, { size: 12, weight: '600', family: SERIF, fill: P.text, anchor: 'middle' });
    out += text(ix + cw / 2, iy + 72, item.loc, { size: 10, fill: P.textFaint, anchor: 'middle' });
    out += text(ix + cw - 12, iy + 16, `×${item.cnt}`, { size: 11, fill: P.textMid, anchor: 'end' });
    if (item.new) {
      out += rect(ix + 10, iy + 8, 28, 14, P.accent, 7);
      out += text(ix + 24, iy + 19, 'new', { size: 9, fill: P.white, anchor: 'middle', weight: '600' });
    }
  });

  // March header
  out += line(24, 450, W - 24, 450, P.rule);
  out += text(24, 468, 'MARCH 2026', { size: 10, fill: P.textFaint, weight: '700', letterSpacing: 2 });
  out += text(W - 24, 468, '38 sightings', { size: 10, fill: P.textFaint, anchor: 'end' });

  // Mini species list — editorial text-only style
  const marchSpecies = ['Fieldfare ×3', 'Redwing ×5', 'Lesser Celandine (patch)', 'Jay ×2', 'Treecreeper ×1'];
  marchSpecies.forEach((s, i) => {
    const sy = 482 + i * 26;
    out += text(24, sy + 14, s, { size: 13, fill: P.text, family: SERIF });
    out += text(W - 24, sy + 14, 'Highgate', { size: 11, fill: P.textFaint, anchor: 'end' });
    if (i < marchSpecies.length - 1) out += line(24, sy + 24, W - 24, sy + 24, P.rule, 0.5);
  });

  out += navBar(3);
  return svg(out);
}

// ─── SCREEN 5: Field Stats ────────────────────────────────────────────────────
function screen5() {
  let out = rect(0, 0, W, H, P.bg);
  out += statusBar();

  // Decorative — large botanical element
  out += sprig(W - 32, 44, P.accent3);
  out += leafAccent(W - 48, 68, P.accent, 0.9);
  out += leafAccent(W - 22, 74, P.accent3, 0.6);

  out += text(24, 56, 'Your Field', { size: 24, weight: '700', family: SERIF, fill: P.text, letterSpacing: -0.5 });
  out += text(24, 80, 'Notes', { size: 24, weight: '700', family: SERIF, fill: P.accent, letterSpacing: -0.5 });
  out += text(24, 98, 'April 2026 · ongoing', { size: 11, fill: P.textFaint });

  out += line(24, 110, W - 24, 110, P.rule);

  // Big metrics — editorial display numbers
  const bigStats = [
    { val: '143', label: 'Observations', sub: '+12 this week' },
    { val: '68', label: 'Species', sub: '4 new this month' },
  ];
  bigStats.forEach((s, i) => {
    const sx = 24 + i * ((W - 48) / 2 + 12);
    out += rect(sx, 120, (W - 48) / 2, 78, P.surface, 12);
    out += text(sx + 16, 166, s.val, { size: 36, weight: '700', family: SERIF, fill: P.accent });
    out += text(sx + 16, 182, s.label, { size: 11, fill: P.text, weight: '600' });
    out += text(sx + 16, 194, s.sub, { size: 10, fill: P.textFaint });
  });

  // Walking stats
  out += text(24, 224, 'Walking', { size: 14, weight: '600', family: SERIF, fill: P.text });
  const walkStats = [
    { label: 'Total distance', value: '34.2 km', pct: 0.68 },
    { label: 'Total time', value: '11h 40m', pct: 0.82 },
    { label: 'Walks completed', value: '22 walks', pct: 0.44 },
  ];
  walkStats.forEach((s, i) => {
    const wy = 234 + i * 44;
    out += text(24, wy + 14, s.label, { size: 12, fill: P.textMid });
    out += text(W - 24, wy + 14, s.value, { size: 12, fill: P.text, weight: '600', anchor: 'end' });
    out += progressBar(24, wy + 20, W - 48, 5, s.pct, P.accent, P.rule);
  });

  out += line(24, 376, W - 24, 376, P.rule);

  // Top locations — editorial table style
  out += text(24, 396, 'Locations', { size: 14, weight: '600', family: SERIF, fill: P.text });

  const locs = [
    { name: 'Highgate Wood', cnt: 89, walks: 14 },
    { name: 'Hampstead Heath', cnt: 34, walks: 6 },
    { name: "Queen's Wood", cnt: 20, walks: 2 },
  ];
  locs.forEach((l, i) => {
    const ly = 408 + i * 42;
    out += text(24, ly + 14, `${i + 1}.`, { size: 13, fill: P.textFaint, family: SERIF });
    out += text(44, ly + 14, l.name, { size: 13, weight: '600', family: SERIF, fill: P.text });
    out += text(44, ly + 28, `${l.cnt} observations · ${l.walks} walks`, { size: 11, fill: P.textFaint });
    out += progressBar(44, ly + 34, W - 68, 4, l.cnt / 100, P.accent3, P.rule);
  });

  out += line(24, 540, W - 24, 540, P.rule);

  // Top species bar chart — horizontal editorial bars
  out += text(24, 560, 'Most seen', { size: 14, weight: '600', family: SERIF, fill: P.text });

  const topSpecies = [
    { name: 'Robin', cnt: 18 },
    { name: 'Blackbird', cnt: 14 },
    { name: 'Great Tit', cnt: 12 },
    { name: 'Nuthatch', cnt: 7 },
  ];
  topSpecies.forEach((s, i) => {
    const sy2 = 570 + i * 32;
    out += text(24, sy2 + 14, s.name, { size: 12, fill: P.text, family: SERIF });
    const barW = (s.cnt / 20) * (W - 130);
    out += rect(100, sy2 + 4, barW, 14, P.accent, 7);
    out += text(W - 24, sy2 + 16, `×${s.cnt}`, { size: 11, fill: P.textFaint, anchor: 'end' });
  });

  out += navBar(4);
  return svg(out);
}

// ─── Assemble .pen file ───────────────────────────────────────────────────────
const screens = [
  { id: 'today',       label: "Today's Walk",   svg: screen1() },
  { id: 'observe',     label: 'New Observation', svg: screen2() },
  { id: 'journal',     label: 'Field Journal',   svg: screen3() },
  { id: 'sightings',   label: 'Sightings Log',   svg: screen4() },
  { id: 'stats',       label: 'Field Stats',      svg: screen5() },
];

const pen = {
  version: '2.8',
  appName: 'Glade',
  tagline: 'Your nature field notebook',
  theme: 'light',
  palette: {
    bg:      P.bg,
    surface: P.surface,
    text:    P.text,
    accent:  P.accent,
    accent2: P.accent2,
    muted:   'rgba(30,27,20,0.45)',
  },
  screens: screens.map(s => ({
    id:    s.id,
    label: s.label,
    width: W,
    height: H,
    svg:   s.svg,
  })),
  meta: {
    created:    new Date().toISOString(),
    generator:  'RAM Design Heartbeat',
    inspiration:'Litbix (minimal.gallery) editorial typography + Dawn health app (lapa.ninja)',
    challenge:  'Apply literary-magazine typographic conventions to a nature field-notes app',
  },
};

const outPath = path.join(__dirname, 'glade.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ glade.pen written');
console.log('  Screens:', screens.map(s => s.label).join(', '));
