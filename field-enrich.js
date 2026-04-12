'use strict';
// Patch field.pen to add more elements to each screen
const fs = require('fs'), path = require('path');

const SLUG = 'field';
const pen = JSON.parse(fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8'));

const C = {
  bg: '#FAF7F2', surface: '#FFFFFF', card: '#F5F0E8',
  accent: '#4A3728', accent2: '#7B9B6B', amber: '#C8821A',
  text: '#1A1209', textMid: '#6B4F3A', muted: 'rgba(74,55,40,0.38)',
  border: 'rgba(74,55,40,0.10)', borderMd: 'rgba(74,55,40,0.18)',
  green: '#5A8A4E', greenBg: '#E8F3E5', amberBg: '#FBF0DC',
  sky: '#6B8FA8', skyBg: '#E5EFF5',
};

function r(x,y,w,h,fill,rx=0,op=1,stroke='none',sw=1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}
function t(x,y,content,size,fill,fw=400,anchor='start',font='system-ui',ls='0',op=1) {
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" style="font-size:${size}px;font-weight:${fw};font-family:${font};letter-spacing:${ls};opacity:${op};">${String(content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
}
function c(cx,cy,rad,fill,op=1,stroke='none',sw=1) {
  return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function l(x1,y1,x2,y2,stroke,sw=1,op=1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}

// Build extra SVG overlay for each screen
function extraScreen0() {
  // Today — add a floating search bar, tooltip on first entry, small sparkline
  const parts = [];
  // Search bar top
  parts.push(r(24, 52, 342, 30, C.card, 15, 1, C.border, 1));
  parts.push(t(48, 71, 'Search entries...', 12, C.muted));
  parts.push(t(348, 71, 'Q', 14, C.muted, 700, 'end'));
  // Recent label extension - count badge
  parts.push(r(342, 240, 20, 18, C.accent, 9));
  parts.push(t(352, 253, '3', 11, '#FAF7F2', 700, 'middle'));
  // Tiny sparkline dots after stats
  [0,1,2,3,4,5,6,7].forEach((v,i) => {
    const vals = [1,3,2,4,3,5,2,4];
    const bx = 24 + i * 11, by = 810 - vals[i]*4;
    parts.push(r(bx, by, 7, vals[i]*4, vals[i]>3?C.accent:C.card, 2));
  });
  // Activity ring teaser
  parts.push(c(350, 728, 20, C.card, 1, C.border, 2));
  parts.push(c(350, 728, 14, 'none', 1, C.accent2, 3));
  parts.push(t(350, 732, '87', 9, C.accent, 700, 'middle'));
  return parts.join('');
}

function extraScreen1() {
  // Compose — add word count, progress indicator, formatting hints
  const parts = [];
  parts.push(r(24, 570, 150, 24, C.card, 12, 1, C.border, 1));
  parts.push(t(38, 586, '142 words  |  ~1 min', 11, C.textMid));
  parts.push(r(24, 600, W * 0.62, 3, C.accent2, 2));
  parts.push(r(24+W*0.62, 600, W - 48 - W*0.62, 3, C.card, 2));
  // Suggestion chip
  parts.push(r(24, 614, 120, 24, C.amberBg, 12, 1, C.border, 1));
  parts.push(t(84, 630, 'Add photo?', 11, C.amber, 600, 'middle'));
  return parts.join('');
}

function extraScreen2() {
  // Gallery — add date headers between rows
  const parts = [];
  const W = 390;
  parts.push(r(0, 400, W, 18, C.bg));
  parts.push(t(24, 413, 'April 8', 11, C.muted, 700, 'start', 'system-ui', '0.07em'));
  parts.push(l(80, 408, W-24, 408, C.border, 1));
  parts.push(r(0, 524, W, 18, C.bg));
  parts.push(t(24, 537, 'April 5', 11, C.muted, 700, 'start', 'system-ui', '0.07em'));
  parts.push(l(80, 532, W-24, 532, C.border, 1));
  // Floating action button
  parts.push(c(347, 714, 26, C.accent));
  parts.push(t(347, 722, '+', 22, '#FAF7F2', 300, 'middle'));
  return parts.join('');
}

function extraScreen3() {
  // Entry Detail — add share + edit buttons, reading progress, notes section
  const parts = [];
  const W = 390;
  // Edit/Share row
  parts.push(r(24, 560, 82, 28, C.card, 14, 1, C.borderMd, 1));
  parts.push(t(65, 578, 'Edit', 12, C.textMid, 600, 'middle'));
  parts.push(r(114, 560, 82, 28, C.card, 14, 1, C.borderMd, 1));
  parts.push(t(155, 578, 'Share', 12, C.textMid, 600, 'middle'));
  parts.push(r(204, 560, 82, 28, C.card, 14, 1, C.borderMd, 1));
  parts.push(t(245, 578, 'Export', 12, C.textMid, 600, 'middle'));
  // Reading time
  parts.push(t(W-24, 402, '2 min read', 10, C.muted, 400, 'end'));
  // Inline annotation
  parts.push(r(24, 458, 8, 8, C.amber, 4));
  parts.push(t(38, 467, 'Annotated: see photo ref CM-2026-04-10-B4', 10, C.amber, 500));
  return parts.join('');
}

function extraScreen4() {
  // Map — add compass rose, scale bar, active marker callout
  const parts = [];
  // Compass rose (simple)
  const cx = 350, cy = 144;
  parts.push(t(cx, cy-10, 'N', 9, C.textMid, 700, 'middle'));
  parts.push(l(cx, cy-4, cx, cy+4, C.borderMd));
  parts.push(l(cx-4, cy, cx+4, cy, C.borderMd));
  // Scale bar
  parts.push(l(24, 388, 74, 388, C.textMid));
  parts.push(l(24, 384, 24, 392, C.textMid));
  parts.push(l(74, 384, 74, 392, C.textMid));
  parts.push(t(49, 383, '50 km', 9, C.muted, 400, 'middle'));
  // Active callout: Moher marker popup
  parts.push(r(100, 148, 110, 38, C.surface, 8, 1, C.border, 1.5));
  parts.push(t(106, 162, 'Cliffs of Moher', 10, C.accent, 700));
  parts.push(t(106, 177, '8 entries', 9, C.muted));
  parts.push(l(155, 186, 140, 200, C.border));
  return parts.join('');
}

function extraScreen5() {
  // Profile — add achievement badges, export button
  const parts = [];
  const W = 390;
  parts.push(t(24, 548, 'ACHIEVEMENTS', 10, C.muted, 700, 'start', 'system-ui', '0.09em'));
  const badges = [
    { label: '100+', sub: 'Entries', color: C.accent },
    { label: 'Streak', sub: '12 day', color: C.amber },
    { label: 'Atlas', sub: '10+ sites', color: C.accent2 },
    { label: 'Year 1', sub: 'Active', color: C.sky },
  ];
  badges.forEach((b, i) => {
    const bx = 24 + i * 86;
    parts.push(r(bx, 558, 80, 56, C.surface, 10, 1, C.border, 1));
    parts.push(r(bx, 558, 80, 3, b.color, 2));
    parts.push(t(bx+40, 578, b.label, 11, b.color, 700, 'middle'));
    parts.push(t(bx+40, 595, b.sub, 10, C.muted, 400, 'middle'));
  });
  // Export all button
  parts.push(r(24, 758, W-48, 38, C.card, 12, 1, C.borderMd, 1));
  parts.push(t(W/2, 781, 'Export all field data', 13, C.textMid, 600, 'middle'));
  return parts.join('');
}

const W = 390;
const extras = [extraScreen0, extraScreen1, extraScreen2, extraScreen3, extraScreen4, extraScreen5];
extras.forEach((fn, i) => {
  const extra = fn();
  // Inject extra SVG elements before closing </svg>
  pen.screens[i].svg = pen.screens[i].svg.replace('</svg>', extra + '</svg>');
});

// Recalculate element count
pen.metadata.elements = pen.screens.reduce((n, s) => {
  const matches = (s.svg.match(/<(rect|text|circle|line)/g) || []).length;
  return n + matches;
}, 0);

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`FIELD enriched: ${pen.metadata.elements} elements`);
