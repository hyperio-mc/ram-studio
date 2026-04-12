'use strict';
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
const W = 390, H = 844;

function r(x,y,w,h,fill,rx=0,op=1,stroke='none',sw=1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}
function t(x,y,content,size,fill,fw=400,anchor='start',font='system-ui',ls='0',op=1) {
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" style="font-size:${size}px;font-weight:${fw};font-family:${font};letter-spacing:${ls};opacity:${op};">${String(content).replace(/&/g,'&amp;')}</text>`;
}
function c(cx,cy,rad,fill,op=1,stroke='none',sw=1) {
  return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function l(x1,y1,x2,y2,stroke,sw=1,op=1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}

// Horizontal rule + section heading helper
function section(y, label, count) {
  let s = l(24, y, W-24, y, C.border);
  s += t(24, y+16, label, 10, C.muted, 700, 'start', 'system-ui', '0.09em');
  if (count) s += t(W-24, y+16, count, 10, C.muted, 500, 'end');
  return s;
}

// Add: mini calendar strip (Screen 0), forecast row, quick-log floating btn
function extraPass2_Screen0() {
  const parts = [];
  // Calendar strip below status bar area
  const days = ['M','T','W','T','F','S','S'];
  const dates = ['6','7','8','9','10','11','12'];
  const dy = 56;
  days.forEach((d,i) => {
    const dx = 24 + i * 48;
    const active = i === 4; // Thursday = index 4
    if (active) parts.push(r(dx-4, dy-2, 36, 38, C.accent, 18));
    parts.push(t(dx+14, dy+13, d, 10, active?'#FAF7F2':C.muted, active?700:400, 'middle'));
    parts.push(t(dx+14, dy+30, dates[i], 13, active?'#FAF7F2':C.text, active?700:400, 'middle'));
    // dot indicator
    if ([0,2,4].includes(i)) parts.push(c(dx+14, dy+38, 2, active?'#FAF7F2':C.accent2));
  });
  // Horizontal rule
  parts.push(l(24, dy+48, W-24, dy+48, C.border));
  return parts.join('');
}

function extraPass2_Screen1() {
  // Add: similar past entry suggestion + character counter ring
  const parts = [];
  parts.push(section(630, 'SIMILAR PAST ENTRIES'));
  parts.push(r(24, 648, W-48, 52, C.card, 10, 1, C.border, 1));
  parts.push(r(24, 648, 4, 52, C.sky, 2));
  parts.push(t(36, 668, 'Lichen survey - Cliffs of Moher', 13, C.text, 600));
  parts.push(t(36, 686, 'Apr 2025  Botany  Lichen', 11, C.muted));
  // char ring outline
  parts.push(c(363, 656, 16, 'none', 1, C.card, 3));
  parts.push(c(363, 656, 16, 'none', 1, C.accent2, 2));
  parts.push(t(363, 660, '62%', 9, C.textMid, 500, 'middle'));
  return parts.join('');
}

function extraPass2_Screen2() {
  // Add: sort/filter row, view toggle, highlighted featured photo
  const parts = [];
  const gridPad = 8;
  const cellW = (W - gridPad * 4) / 3;
  // 5th photo "featured" badge
  const col = 1, row = 1;
  const gx = gridPad + col * (cellW + gridPad);
  const gy = 158 + row * (cellW + gridPad);
  parts.push(r(gx, gy + cellW - 20, cellW, 20, 'rgba(74,55,40,0.72)', 0));
  parts.push(t(gx + cellW/2, gy + cellW - 7, 'Grass Transect', 9, '#FAF7F2', 600, 'middle'));
  // Sort row above grid
  parts.push(r(24, 148, 70, 22, C.card, 11, 1, C.borderMd, 1));
  parts.push(t(59, 163, 'Sort: Date', 10, C.textMid, 500, 'middle'));
  parts.push(r(102, 148, 52, 22, C.surface, 11, 1, C.borderMd, 1));
  parts.push(t(128, 163, 'Grid', 10, C.textMid, 500, 'middle'));
  parts.push(r(162, 148, 52, 22, C.card, 11, 1, C.borderMd, 1));
  parts.push(t(188, 163, 'List', 10, C.textMid, 400, 'middle'));
  return parts.join('');
}

function extraPass2_Screen3() {
  // Add weather/conditions block in detail
  const parts = [];
  parts.push(r(24, 510, W-48, 46, C.card, 10, 1, C.border, 1));
  parts.push(t(40, 528, 'Conditions', 11, C.muted, 700, 'start', 'system-ui', '0.07em'));
  parts.push(t(40, 546, '11C  Overcast  82% humidity  WSW 14 kph', 11, C.text, 400));
  // Reading progress underline
  parts.push(r(24, 387, 240, 2, C.accent2, 1));
  return parts.join('');
}

function extraPass2_Screen4() {
  // Add: total distance, habitat breakdown bars
  const parts = [];
  parts.push(section(626, 'HABITAT BREAKDOWN'));
  const habitats = [
    { label: 'Coastal', pct: 65, color: C.sky },
    { label: 'Woodland', pct: 20, color: C.green },
    { label: 'Freshwater', pct: 15, color: C.accent2 },
  ];
  habitats.forEach((h, i) => {
    const hy = 646 + i * 40;
    parts.push(t(24, hy+14, h.label, 12, C.text, 500));
    parts.push(r(100, hy, 210, 10, C.card, 5));
    parts.push(r(100, hy, h.pct * 2.1, 10, h.color, 5));
    parts.push(t(320, hy+13, h.pct + '%', 11, C.textMid, 600, 'end'));
  });
  // Total distance stat
  parts.push(r(W-24-92, 104, 90, 28, C.amberBg, 14, 1, C.border, 1));
  parts.push(t(W-24-46, 123, '347 km', 12, C.amber, 700, 'middle'));
  return parts.join('');
}

function extraPass2_Screen5() {
  // Add: linked apps row (iNaturalist, Merlin), dark mode toggle visual
  const parts = [];
  parts.push(section(640, 'LINKED APPS'));
  const apps = [
    { name: 'iNaturalist', color: C.green },
    { name: 'Merlin Bird', color: C.sky },
    { name: 'Windy', color: C.accent },
  ];
  apps.forEach((a, i) => {
    const ax = 24 + i * 120;
    parts.push(r(ax, 656, 112, 48, C.surface, 10, 1, C.border, 1));
    parts.push(c(ax+22, 680, 10, a.color, 0.2, a.color, 2));
    parts.push(t(ax+38, 685, a.name, 11, C.text, 500));
    parts.push(t(ax+38, 699, 'Connected', 10, C.muted));
  });
  // version text at bottom
  parts.push(t(W/2, 800, 'FIELD v2.4.1  Made with care', 10, C.muted, 400, 'middle'));
  return parts.join('');
}

const extras = [extraPass2_Screen0, extraPass2_Screen1, extraPass2_Screen2, extraPass2_Screen3, extraPass2_Screen4, extraPass2_Screen5];
extras.forEach((fn, i) => {
  const extra = fn();
  pen.screens[i].svg = pen.screens[i].svg.replace('</svg>', extra + '</svg>');
});

pen.metadata.elements = pen.screens.reduce((n, s) => {
  return n + (s.svg.match(/<(rect|text|circle|line)/g)||[]).length;
}, 0);

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`FIELD final: ${pen.metadata.elements} elements`);
