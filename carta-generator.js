// CARTA — Your Reading Life, Composed
// Inspired by: Litbix (minimal.gallery) — warm minimal book curation grid
//              Old Tom Capital (minimal.gallery) — editorial stat display with large serif numerals
// Theme: LIGHT — warm parchment (#F5F0E6), burnt sienna accent, serif editorial feel
// Challenge: editorial serif typography with big display numerals + personal collection grid

'use strict';
const fs = require('fs');

const SLUG       = 'carta';
const APP_NAME   = 'CARTA';
const TAGLINE    = 'Your Reading Life, Composed';
const ARCHETYPE  = 'editorial-reader';
const VERSION    = '2.8';

// ─── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F0E6',   // warm parchment
  surface:  '#FFFDF8',   // soft cream card
  surface2: '#EDE8DC',   // slightly deeper parchment for alt sections
  border:   '#D8D0BF',   // warm stone border
  text:     '#1A1510',   // near-black ink
  text2:    '#6B5E4A',   // warm brown secondary
  accent:   '#8B3B1F',   // burnt sienna — warmth of old books
  accent2:  '#2B5E3A',   // deep forest green — classic editorial
  gold:     '#B8892A',   // antique gold
  muted:    'rgba(26,21,16,0.4)',
};

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const T = {
  // Typography
  serif:    "'Georgia', 'Times New Roman', serif",
  sans:     "'Inter', 'Helvetica Neue', sans-serif",
  mono:     "'JetBrains Mono', 'Courier New', monospace",

  // Spacing & shape
  r4:  '4px',
  r8:  '8px',
  r12: '12px',
  r16: '16px',
  shadow: '0 1px 3px rgba(26,21,16,0.08), 0 4px 12px rgba(26,21,16,0.06)',
  shadowM: '0 2px 8px rgba(26,21,16,0.10), 0 8px 24px rgba(26,21,16,0.08)',
};

// ─── PEN STRUCTURE ──────────────────────────────────────────────────────────
function makePen() {
  const screens = [
    shelf(),
    reading(),
    stats(),
    discover(),
    notes(),
  ];

  return {
    version: VERSION,
    meta: {
      appName:   APP_NAME,
      tagline:   TAGLINE,
      archetype: ARCHETYPE,
      theme:     'light',
      palette:   P,
      author:    'RAM Design Heartbeat',
      created:   new Date().toISOString(),
      inspiration: [
        'Litbix (minimal.gallery) — warm minimal book curation grid with drag-drop',
        'Old Tom Capital (minimal.gallery) — editorial stat display with large serif numerals and "platform built to compound" framing',
        'Lapa Ninja — Dawn wellness AI positioning adapted to reading habit science',
      ],
    },
    screens,
    nav: [
      { id: 'shelf',    label: 'Shelf',    icon: 'grid' },
      { id: 'reading',  label: 'Reading',  icon: 'book' },
      { id: 'stats',    label: 'Stats',    icon: 'chart' },
      { id: 'discover', label: 'Discover', icon: 'search' },
      { id: 'notes',    label: 'Notes',    icon: 'star' },
    ],
  };
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function card(children, opts = {}) {
  const { bg = P.surface, p = '16px', r = T.r12, mb = '0', shadow = T.shadow, extra = '' } = opts;
  return {
    type: 'raw',
    html: `<div style="background:${bg};padding:${p};border-radius:${r};margin-bottom:${mb};box-shadow:${shadow};${extra}">${children}</div>`,
  };
}

function label(txt, opts = {}) {
  const { color = P.text2, size = '10px', ls = '1.5px', mb = '6px', font = T.sans } = opts;
  return `<div style="font-family:${font};font-size:${size};color:${color};letter-spacing:${ls};text-transform:uppercase;font-weight:600;margin-bottom:${mb}">${txt}</div>`;
}

function serifDisplay(txt, opts = {}) {
  const { size = '48px', color = P.text, weight = '400', mb = '4px', italic = false } = opts;
  return `<div style="font-family:${T.serif};font-size:${size};color:${color};font-weight:${weight};margin-bottom:${mb};line-height:1;${italic ? 'font-style:italic;' : ''}">${txt}</div>`;
}

function sansText(txt, opts = {}) {
  const { size = '13px', color = P.text, weight = '400', mb = '0', lh = '1.5' } = opts;
  return `<div style="font-family:${T.sans};font-size:${size};color:${color};font-weight:${weight};margin-bottom:${mb};line-height:${lh}">${txt}</div>`;
}

function divider(opts = {}) {
  const { color = P.border, mb = '14px', mt = '14px' } = opts;
  return `<div style="height:1px;background:${color};margin:${mt} 0 ${mb} 0;opacity:0.6"></div>`;
}

function progressBar(pct, opts = {}) {
  const { color = P.accent, bg = P.border, h = '3px', r = '2px' } = opts;
  return `<div style="background:${bg};border-radius:${r};height:${h};overflow:hidden">
    <div style="width:${pct}%;background:${color};height:100%;border-radius:${r};transition:width 0.3s"></div>
  </div>`;
}

function tag(txt, opts = {}) {
  const { bg = P.surface2, color = P.text2, border = P.border } = opts;
  return `<span style="display:inline-block;background:${bg};color:${color};border:1px solid ${border};border-radius:4px;padding:3px 8px;font-family:${T.sans};font-size:10px;font-weight:500;letter-spacing:0.5px;margin-right:5px;margin-bottom:5px">${txt}</span>`;
}

// Fake book cover using colored rectangle with title initials
function bookCover(title, author, color, size = '72px') {
  const initials = title.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const aspect = '0.67'; // book aspect ratio
  const w = parseFloat(size);
  const h = w / parseFloat(aspect);
  return `<div style="width:${w}px;height:${h}px;background:${color};border-radius:3px;display:flex;flex-direction:column;justify-content:center;align-items:center;flex-shrink:0;box-shadow:1px 2px 6px rgba(0,0,0,0.15)">
    <div style="font-family:${T.serif};font-size:${w * 0.28}px;color:rgba(255,255,255,0.9);font-weight:400;letter-spacing:1px">${initials}</div>
  </div>`;
}

// ─── SCREEN 1: SHELF ────────────────────────────────────────────────────────
function shelf() {
  // Currently reading hero + book grid
  const heroBook = `
    <div style="display:flex;gap:14px;align-items:flex-start">
      ${bookCover('Piranesi', 'CS', '#3B4F6B', '76px')}
      <div style="flex:1;min-width:0">
        ${label('Currently Reading', { color: P.accent, mb: '4px' })}
        <div style="font-family:${T.serif};font-size:20px;color:${P.text};font-weight:400;line-height:1.2;margin-bottom:3px;font-style:italic">Piranesi</div>
        ${sansText('Susanna Clarke', { color: P.text2, size: '12px', mb: '10px' })}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          ${sansText('Page 187 of 272', { color: P.text2, size: '11px' })}
          ${sansText('69%', { color: P.accent, size: '11px', weight: '600' })}
        </div>
        ${progressBar(69, { color: P.accent })}
      </div>
    </div>
  `;

  const streakRow = `
    <div style="display:flex;gap:8px">
      <div style="flex:1;background:${P.surface2};border-radius:${T.r8};padding:10px 12px;text-align:center;border:1px solid ${P.border}">
        ${serifDisplay('12', { size: '28px', color: P.accent, mb: '0px' })}
        ${sansText('day streak', { size: '10px', color: P.text2 })}
      </div>
      <div style="flex:1;background:${P.surface2};border-radius:${T.r8};padding:10px 12px;text-align:center;border:1px solid ${P.border}">
        ${serifDisplay('34', { size: '28px', color: P.accent2, mb: '0px' })}
        ${sansText('books · 2025', { size: '10px', color: P.text2 })}
      </div>
      <div style="flex:1;background:${P.surface2};border-radius:${T.r8};padding:10px 12px;text-align:center;border:1px solid ${P.border}">
        ${serifDisplay('8.4K', { size: '28px', color: P.gold, mb: '0px' })}
        ${sansText('pages read', { size: '10px', color: P.text2 })}
      </div>
    </div>
  `;

  // Compact shelf grid
  const books = [
    { t: 'Normal People',   a: 'SR', c: '#5C4033' },
    { t: 'The Remains',     a: 'KI', c: '#4A5568' },
    { t: 'Demon Copperhead', a: 'BK', c: '#6B4226' },
    { t: 'Sea of Tranquility', a: 'EMS', c: '#2D5A4E' },
    { t: 'Tomorrow',        a: 'DB', c: '#5A3D6B' },
    { t: 'The Guest',       a: 'EO', c: '#3D5268' },
  ];

  const grid = `
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">
      ${books.map(b => `
        <div>
          ${bookCover(b.t, b.a, b.c, '42px')}
        </div>
      `).join('')}
    </div>
  `;

  return {
    id: 'shelf',
    label: 'Shelf',
    layers: [
      {
        type: 'frame',
        bg: P.bg,
        padding: '0',
        children: [
          // Header
          {
            type: 'raw',
            html: `<div style="padding:20px 18px 14px;background:${P.bg}">
              <div style="display:flex;justify-content:space-between;align-items:baseline">
                <div style="font-family:${T.serif};font-size:26px;color:${P.text};font-weight:400;letter-spacing:-0.5px;font-style:italic">Carta</div>
                <div style="font-family:${T.sans};font-size:11px;color:${P.text2};letter-spacing:1px;text-transform:uppercase">Mon, Mar 24</div>
              </div>
            </div>`,
          },
          // Currently reading card
          {
            type: 'raw',
            html: `<div style="margin:0 14px 12px">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:14px;box-shadow:${T.shadow}">
                ${heroBook}
              </div>
            </div>`,
          },
          // Stats strip
          {
            type: 'raw',
            html: `<div style="margin:0 14px 16px">${streakRow}</div>`,
          },
          // Shelf section
          {
            type: 'raw',
            html: `<div style="padding:0 18px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                ${label('My Shelf', { color: P.text2, mb: '0' })}
                ${sansText('See all →', { color: P.accent, size: '11px', weight: '500' })}
              </div>
              ${grid}
            </div>`,
          },
          // Recent activity
          {
            type: 'raw',
            html: `<div style="margin:14px 14px 0">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:14px;box-shadow:${T.shadow}">
                ${label('Recently Finished', { color: P.text2, mb: '10px' })}
                ${[
                  { t: 'James', a: 'Percival Everett', d: 'Mar 18', r: '★★★★★', c: '#7A5C3A' },
                  { t: 'Small Things Like These', a: 'Claire Keegan', d: 'Mar 8', r: '★★★★', c: '#3D4F3A' },
                ].map((b, i) => `
                  <div style="display:flex;gap:10px;align-items:center${i > 0 ? ';padding-top:10px;border-top:1px solid ' + P.border : ''}">
                    ${bookCover(b.t, b.a, b.c, '36px')}
                    <div style="flex:1">
                      <div style="font-family:${T.serif};font-size:13px;color:${P.text};font-style:italic;margin-bottom:1px">${b.t}</div>
                      <div style="font-family:${T.sans};font-size:10px;color:${P.text2}">${b.a}</div>
                    </div>
                    <div style="text-align:right">
                      <div style="font-size:11px;color:${P.gold};margin-bottom:1px">${b.r}</div>
                      <div style="font-family:${T.sans};font-size:10px;color:${P.muted}">${b.d}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>`,
          },
        ],
      },
    ],
  };
}

// ─── SCREEN 2: READING (Active Book Progress) ────────────────────────────────
function reading() {
  return {
    id: 'reading',
    label: 'Reading',
    layers: [
      {
        type: 'frame',
        bg: P.bg,
        padding: '0',
        children: [
          // Header
          {
            type: 'raw',
            html: `<div style="padding:20px 18px 0">
              ${label('Now Reading', { color: P.accent, size: '10px', mb: '8px' })}
              <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:18px">
                ${bookCover('Piranesi', 'CS', '#3B4F6B', '72px')}
                <div style="flex:1">
                  <div style="font-family:${T.serif};font-size:22px;color:${P.text};font-weight:400;font-style:italic;line-height:1.1;margin-bottom:4px">Piranesi</div>
                  <div style="font-family:${T.sans};font-size:12px;color:${P.text2};margin-bottom:8px">Susanna Clarke · 2020</div>
                  ${tag('Fantasy', { bg: P.surface2 })}${tag('Mystery', { bg: P.surface2 })}${tag('Short', { bg: P.surface2 })}
                </div>
              </div>
            </div>`,
          },
          // Progress card
          {
            type: 'raw',
            html: `<div style="margin:0 14px 12px">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:16px;box-shadow:${T.shadow}">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
                  ${label('Progress', { mb: '0' })}
                  <div style="font-family:${T.serif};font-size:22px;color:${P.accent};font-weight:400">69%</div>
                </div>
                ${progressBar(69, { color: P.accent, h: '6px' })}
                <div style="display:flex;justify-content:space-between;margin-top:8px">
                  ${sansText('Page 187', { color: P.text2, size: '11px' })}
                  ${sansText('85 pages left', { color: P.text2, size: '11px' })}
                </div>
              </div>
            </div>`,
          },
          // Chapter tracker
          {
            type: 'raw',
            html: `<div style="margin:0 14px 12px">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:16px;box-shadow:${T.shadow}">
                ${label('Chapters', { mb: '12px' })}
                ${[
                  { n: 'The First Vestibule',       p: '1–42',   done: true },
                  { n: 'The Drowned Halls',          p: '43–91',  done: true },
                  { n: 'The Other',                  p: '92–147', done: true },
                  { n: 'The Prophet',                p: '148–187',done: true },
                  { n: 'A Revelation of Statues',    p: '188–234',done: false },
                  { n: 'The Biscuit Box',            p: '235–272',done: false },
                ].map((ch, i) => `
                  <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid ${P.border}">
                    <div style="width:16px;height:16px;border-radius:50%;background:${ch.done ? P.accent : 'transparent'};border:1.5px solid ${ch.done ? P.accent : P.border};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      ${ch.done ? `<div style="color:white;font-size:9px">✓</div>` : ''}
                    </div>
                    <div style="flex:1">
                      <div style="font-family:${T.serif};font-size:12px;color:${ch.done ? P.text : P.text2};font-style:${ch.done ? 'normal' : 'italic'}">${ch.n}</div>
                    </div>
                    <div style="font-family:${T.mono};font-size:10px;color:${P.muted}">${ch.p}</div>
                  </div>
                `).join('')}
              </div>
            </div>`,
          },
          // Reading sessions
          {
            type: 'raw',
            html: `<div style="margin:0 14px">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:16px;box-shadow:${T.shadow}">
                ${label('Sessions This Week', { mb: '12px' })}
                <div style="display:flex;gap:6px;align-items:flex-end;height:48px;margin-bottom:6px">
                  ${[22, 45, 0, 38, 55, 30, 65].map((h, i) => {
                    const days = ['M','T','W','T','F','S','S'];
                    const today = i === 6;
                    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                      <div style="width:100%;background:${today ? P.accent : P.border};border-radius:2px;height:${h ? Math.max(4, h * 0.7) : 3}px;opacity:${h ? 1 : 0.4}"></div>
                      <div style="font-family:${T.mono};font-size:8px;color:${today ? P.accent : P.text2}">${days[i]}</div>
                    </div>`;
                  }).join('')}
                </div>
                <div style="display:flex;justify-content:space-between">
                  ${sansText('4 of 7 days', { color: P.text2, size: '11px' })}
                  ${sansText('3h 15m total', { color: P.accent2, size: '11px', weight: '600' })}
                </div>
              </div>
            </div>`,
          },
        ],
      },
    ],
  };
}

// ─── SCREEN 3: STATS (Old Tom Capital-inspired editorial stat display) ────────
function stats() {
  // THIS is the core editorial challenge — large serif numerals, institution-style data display
  return {
    id: 'stats',
    label: 'Stats',
    layers: [
      {
        type: 'frame',
        bg: P.bg,
        padding: '0',
        children: [
          // Editorial header (Old Tom Capital style)
          {
            type: 'raw',
            html: `<div style="padding:20px 18px 16px;border-bottom:1px solid ${P.border}">
              <div style="font-family:${T.mono};font-size:10px;color:${P.text2};letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Your Reading Year</div>
              <div style="font-family:${T.serif};font-size:32px;color:${P.text};font-weight:400;line-height:1;margin-bottom:4px">A Year Built<br><span style="font-style:italic">to Compound</span></div>
              <div style="font-family:${T.sans};font-size:11px;color:${P.text2}">34 books read in 2025 · through March</div>
            </div>`,
          },
          // Big stat grid (Old Tom Capital editorial numbers)
          {
            type: 'raw',
            html: `<div style="padding:16px 18px">
              ${label('FIG. A — READING METRICS', { color: P.text2, mb: '14px', font: T.mono })}
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:${P.border};border-radius:${T.r8};overflow:hidden">
                ${[
                  { v: '34',    l: 'Books Read',     sub: 'on track for 48 this year',   c: P.accent },
                  { v: '8,412', l: 'Pages Turned',   sub: 'avg 247 per book',             c: P.accent2 },
                  { v: '62',    l: 'Hours Reading',  sub: '~2.1h per week',               c: P.gold },
                  { v: '12',    l: 'Day Streak',     sub: 'personal best: 31 days',       c: P.accent },
                ].map(s => `
                  <div style="background:${P.surface};padding:16px 14px">
                    <div style="font-family:${T.serif};font-size:36px;color:${s.c};font-weight:400;line-height:1;margin-bottom:4px">${s.v}</div>
                    <div style="font-family:${T.sans};font-size:11px;color:${P.text};font-weight:600;margin-bottom:2px">${s.l}</div>
                    <div style="font-family:${T.sans};font-size:10px;color:${P.text2};line-height:1.3">${s.sub}</div>
                  </div>
                `).join('')}
              </div>
            </div>`,
          },
          // Genre breakdown
          {
            type: 'raw',
            html: `<div style="margin:0 14px 12px">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:16px;box-shadow:${T.shadow}">
                ${label('FIG. B — GENRE BREAKDOWN', { color: P.text2, mb: '12px', font: T.mono })}
                ${[
                  { g: 'Literary Fiction', n: 14, pct: 41, c: P.accent },
                  { g: 'Non-Fiction',      n: 8,  pct: 24, c: P.accent2 },
                  { g: 'Fantasy & Sci-Fi', n: 6,  pct: 18, c: P.gold },
                  { g: 'Mystery',          n: 4,  pct: 12, c: '#6B5E4A' },
                  { g: 'Other',            n: 2,  pct: 5,  c: P.border },
                ].map(g => `
                  <div style="margin-bottom:10px">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                      ${sansText(g.g, { size: '11px', color: P.text })}
                      <span style="font-family:${T.mono};font-size:10px;color:${P.text2}">${g.n} books · ${g.pct}%</span>
                    </div>
                    ${progressBar(g.pct, { color: g.c, h: '4px' })}
                  </div>
                `).join('')}
              </div>
            </div>`,
          },
          // Monthly pace
          {
            type: 'raw',
            html: `<div style="margin:0 14px">
              <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:16px;box-shadow:${T.shadow}">
                ${label('FIG. C — MONTHLY PACE', { color: P.text2, mb: '12px', font: T.mono })}
                <div style="display:flex;gap:4px;align-items:flex-end;height:56px;margin-bottom:8px">
                  ${[4,3,6,0,0,0,0,0,0,0,0,0].map((n, i) => {
                    const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
                    const active = i <= 2;
                    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                      ${n > 0 ? `<div style="font-family:${T.mono};font-size:8px;color:${P.accent}">${n}</div>` : '<div style="height:12px"></div>'}
                      <div style="width:100%;background:${active ? P.accent : P.surface2};border-radius:2px;height:${n ? Math.max(6, n * 9) : 4}px;border:1px solid ${P.border};opacity:${active ? 1 : 0.5}"></div>
                      <div style="font-family:${T.mono};font-size:7px;color:${P.text2}">${months[i]}</div>
                    </div>`;
                  }).join('')}
                </div>
                <div style="display:flex;justify-content:space-between">
                  ${sansText('Avg 4.3 books/month', { color: P.text2, size: '10px' })}
                  ${sansText('Goal: 4/mo', { color: P.accent2, size: '10px', weight: '600' })}
                </div>
              </div>
            </div>`,
          },
        ],
      },
    ],
  };
}

// ─── SCREEN 4: DISCOVER ──────────────────────────────────────────────────────
function discover() {
  const recommendations = [
    { t: 'Intermezzo',           a: 'Sally Rooney',       g: ['Literary Fiction', 'Contemporary'], c: '#5A3D3D', r: 'Because you loved Normal People' },
    { t: 'The Women',            a: 'Kristin Hannah',     g: ['Historical Fiction', 'War'],         c: '#4A3D2A', r: 'Trending in your network' },
    { t: 'All Fours',            a: 'Miranda July',       g: ['Literary Fiction', 'Feminist'],      c: '#3D4A5C', r: 'Booker longlist 2025' },
    { t: 'Orbital',              a: 'Samantha Harvey',    g: ['Literary Fiction', 'Short'],         c: '#3D5A4A', r: 'Booker Prize winner' },
  ];

  return {
    id: 'discover',
    label: 'Discover',
    layers: [
      {
        type: 'frame',
        bg: P.bg,
        padding: '0',
        children: [
          {
            type: 'raw',
            html: `<div style="padding:20px 18px 14px">
              <div style="font-family:${T.serif};font-size:26px;color:${P.text};font-style:italic;margin-bottom:4px">Discover</div>
              <div style="font-family:${T.sans};font-size:12px;color:${P.text2}">Curated for your reading taste</div>
            </div>`,
          },
          // Genre filter pills
          {
            type: 'raw',
            html: `<div style="padding:0 18px 14px;overflow:hidden">
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${['All', 'Literary', 'Fiction', 'Non-Fiction', 'Fantasy', 'Mystery'].map((g, i) => `
                  <div style="background:${i === 0 ? P.accent : P.surface};color:${i === 0 ? 'white' : P.text2};border:1px solid ${i === 0 ? P.accent : P.border};border-radius:20px;padding:5px 12px;font-family:${T.sans};font-size:11px;font-weight:${i === 0 ? '600' : '400'};cursor:pointer">${g}</div>
                `).join('')}
              </div>
            </div>`,
          },
          // Recommendation list
          {
            type: 'raw',
            html: `<div style="padding:0 14px">
              ${recommendations.map((book, i) => `
                <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};padding:14px;margin-bottom:10px;box-shadow:${T.shadow}">
                  <div style="display:flex;gap:12px;align-items:flex-start">
                    ${bookCover(book.t, book.a, book.c, '56px')}
                    <div style="flex:1">
                      <div style="font-family:${T.serif};font-size:15px;color:${P.text};font-style:italic;margin-bottom:2px">${book.t}</div>
                      <div style="font-family:${T.sans};font-size:11px;color:${P.text2};margin-bottom:6px">${book.a}</div>
                      <div style="margin-bottom:6px">${book.g.map(g => tag(g)).join('')}</div>
                      <div style="display:flex;align-items:center;gap:4px">
                        <div style="width:3px;height:3px;border-radius:50%;background:${P.accent}"></div>
                        <div style="font-family:${T.sans};font-size:10px;color:${P.accent}">${book.r}</div>
                      </div>
                    </div>
                    <div style="font-size:16px;color:${P.border}">+</div>
                  </div>
                </div>
              `).join('')}
            </div>`,
          },
        ],
      },
    ],
  };
}

// ─── SCREEN 5: NOTES (Highlights & Quotes Journal) ───────────────────────────
function notes() {
  const quotes = [
    {
      text: 'I looked out upon the Hall of the Heart-Shaped Column. The light had a quality of late afternoon — golden, slow, with dust motes rising.',
      book: 'Piranesi', author: 'Susanna Clarke', page: '124', date: 'Mar 20', c: '#3B4F6B'
    },
    {
      text: 'The world has become exhausting in its demands upon the soul. We forget we have one.',
      book: 'James', author: 'Percival Everett', page: '89', date: 'Mar 10', c: '#7A5C3A'
    },
    {
      text: 'What small things can make the world turn over. What small things have always made the world turn over.',
      book: 'Small Things Like These', author: 'Claire Keegan', page: '112', date: 'Mar 3', c: '#3D4F3A'
    },
  ];

  return {
    id: 'notes',
    label: 'Notes',
    layers: [
      {
        type: 'frame',
        bg: P.bg,
        padding: '0',
        children: [
          {
            type: 'raw',
            html: `<div style="padding:20px 18px 14px">
              <div style="font-family:${T.serif};font-size:26px;color:${P.text};font-style:italic;margin-bottom:4px">Notes</div>
              <div style="font-family:${T.sans};font-size:12px;color:${P.text2}">47 highlights across 23 books</div>
            </div>`,
          },
          // Quote cards — editorial, pulled-quote style
          {
            type: 'raw',
            html: `<div style="padding:0 14px">
              ${quotes.map(q => `
                <div style="background:${P.surface};border:1px solid ${P.border};border-radius:${T.r12};overflow:hidden;margin-bottom:12px;box-shadow:${T.shadow}">
                  <div style="height:3px;background:${q.c}"></div>
                  <div style="padding:16px">
                    <div style="font-family:${T.serif};font-size:16px;color:${P.text};line-height:1.55;font-style:italic;margin-bottom:12px">"${q.text}"</div>
                    <div style="display:flex;align-items:center;gap:8px">
                      ${bookCover(q.book, '', q.c, '28px')}
                      <div>
                        <div style="font-family:${T.sans};font-size:11px;color:${P.text};font-weight:500">${q.book}</div>
                        <div style="font-family:${T.sans};font-size:10px;color:${P.text2}">${q.author} · p.${q.page}</div>
                      </div>
                      <div style="margin-left:auto;font-family:${T.mono};font-size:10px;color:${P.muted}">${q.date}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>`,
          },
          // Add note prompt
          {
            type: 'raw',
            html: `<div style="margin:0 14px">
              <div style="background:${P.surface2};border:1.5px dashed ${P.border};border-radius:${T.r12};padding:16px;text-align:center">
                <div style="font-size:20px;margin-bottom:6px">📖</div>
                ${sansText('Add a highlight or note', { color: P.text2, size: '12px', weight: '500', mb: '2px' })}
                ${sansText('Capture what moved you', { color: P.muted, size: '10px' })}
              </div>
            </div>`,
          },
        ],
      },
    ],
  };
}

// ─── GENERATE & SAVE ─────────────────────────────────────────────────────────
const pen = makePen();
const penJson = JSON.stringify(pen, null, 2);
fs.writeFileSync('/workspace/group/design-studio/carta.pen', penJson);
console.log(`✓ carta.pen written (${(penJson.length / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.map(s => s.id).join(', ')}`);
console.log(`  Theme: ${pen.meta.theme}`);
console.log(`  Accent: ${P.accent} (burnt sienna)`);
