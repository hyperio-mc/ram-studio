'use strict';
const fs = require('fs'), path = require('path');
const SLUG = 'field';
const pen = JSON.parse(fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8'));
const W = 390;
const C = {
  bg: '#FAF7F2', surface: '#FFFFFF', card: '#F5F0E8', accent: '#4A3728',
  accent2: '#7B9B6B', text: '#1A1209', muted: 'rgba(74,55,40,0.38)', border: 'rgba(74,55,40,0.10)',
  borderMd: 'rgba(74,55,40,0.18)', amberBg: '#FBF0DC', amber: '#C8821A', sky: '#6B8FA8',
};
function r(x,y,w,h,fill,rx=0,op=1,stroke='none',sw=1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}
function t(x,y,content,size,fill,fw=400,anchor='start') {
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" style="font-size:${size}px;font-weight:${fw};font-family:system-ui;">${String(content).replace(/&/g,'&amp;')}</text>`;
}
function l(x1,y1,x2,y2,stroke,sw=1,op=1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}

// Add 5 consistent annotation dots/chips across all 6 screens + extra decorative elements
const patches = [
  // Screen 0 — small notification badge, help text under CTA, micro dividers
  () => {
    let s = '';
    // Dividers between entry cards
    [350, 440, 530].forEach(y => s += l(28, y, W-28, y, C.border, 0.5, 0.5));
    // Small icons before entry dates  
    s += t(24+4, 278, 'i', 9, C.sky, 700);
    s += t(24+4, 368, 'b', 9, C.amber, 700);
    s += t(24+4, 458, 'f', 9, C.accent2, 700);
    // Note under stats
    s += t(24, 810, 'Updated just now', 10, C.muted, 400);
    s += t(W/2, 810, 'Tap for history', 10, C.muted, 400, 'middle');
    return s;
  },
  // Screen 1 — more compose detail
  () => {
    let s = '';
    // Paragraph marks
    [350, 390, 430, 470, 510, 550].forEach(y => s += l(24, y, 26, y, C.border, 2));
    // Mini toolbar icons label
    s += t(24, 768, 'Add  Map  Rec  Bold  Italic  Para', 9, C.muted);
    // Indentation ruler marks
    [280, 300, 320].forEach(y => s += l(24, y, 30, y, C.muted, 1, 0.5));
    return s;
  },
  // Screen 2 — gallery labels all photos  
  () => {
    let s = '';
    const gridPad = 8, cellW = (W - gridPad * 4) / 3;
    for (let i = 12; i < 16; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const gx = gridPad + col * (cellW + gridPad);
      const gy = 158 + row * (cellW + gridPad);
      s += l(gx, gy + cellW - 16, gx + cellW, gy + cellW - 16, 'rgba(74,55,40,0.08)', 1);
    }
    // count bar at very top
    s += r(24, 148, 46, 22, C.surface, 11, 1, C.borderMd, 1);
    s += t(47, 163, '183', 10, C.accent, 700, 'middle');
    return s;
  },
  // Screen 3 — entry detail fine strokes
  () => {
    let s = '';
    // Pull quote highlight
    s += r(24, 440, 3, 38, C.amber, 2);
    s += r(24, 440, W-48, 38, C.amberBg, 0, 0.55);
    s += t(32, 454, 'Coverage approx. 35% of exposed surface area.', 12, C.amber, 500);
    s += t(32, 470, 'Significant increase vs last year.', 12, C.amber, 400);
    return s;
  },
  // Screen 4 — map detail
  () => {
    let s = '';
    // Dotted path between Moher and Dunmore
    for (let i = 0; i < 6; i++) {
      const px = 140 + i * 12, py = 200 + i * 8;
      s += `<circle cx="${px}" cy="${py}" r="2" fill="${C.accent2}" opacity="0.6"/>`;
    }
    // Elevation hint labels
    s += t(24, 398, 'Sea level', 9, C.muted);
    s += t(W/2, 398, '135 m avg', 9, C.muted, 400, 'middle');
    return s;
  },
  // Screen 5 — profile extras
  () => {
    let s = '';
    // Progress bar under streak  
    s += r(24, 530, W-48, 4, C.card, 2);
    s += r(24, 530, (W-48)*0.72, 4, C.amber, 2);
    // Contribution grid (tiny)
    for (let ri = 0; ri < 5; ri++) {
      for (let ci = 0; ci < 20; ci++) {
        const val = Math.random() > 0.6 ? 1 : 0;
        const gx = 24 + ci * 16, gy = 742 + ri * 12;
        s += r(gx, gy, 12, 8, val ? C.accent : C.card, 2, 0.9);
      }
    }
    return s;
  }
];

patches.forEach((fn, i) => {
  const extra = fn();
  pen.screens[i].svg = pen.screens[i].svg.replace('</svg>', extra + '</svg>');
});

pen.metadata.elements = pen.screens.reduce((n, s) => {
  return n + (s.svg.match(/<(rect|text|circle|line)/g)||[]).length;
}, 0);
fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`FIELD final v3: ${pen.metadata.elements} elements`);
