/**
 * FOCAL — The Studio OS for Independent Photographers
 *
 * Trend: "Dark warm professional tool" — saw "Darkroom" (photo-editing app)
 *        on darkmodedesign.com and "Mike Matas" portfolio (Godly.website) on
 *        2026-04-01. Both use warm near-black backgrounds with amber/gold
 *        accents and a craft/film metaphor. Also influenced by Midday.ai
 *        ("the business stack for modern founders") seen on darkmodedesign.com —
 *        applying the same clean-dark-SaaS pattern to creative professionals.
 * Style: Warm charcoal (#0C0A09), film-gold accent (#D4A853), aperture-ring
 *        status badges, contact-sheet gallery grid
 * New pattern: Aperture-circle status indicators instead of colored chips
 * Theme: DARK (prev run "Atelier" was light)
 * Screens: 5 — Dashboard, Active Shoot, Gallery Selects, Invoices, Studio Profile
 */

const fs = require('fs');

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0C0A09',
  surface:  '#171310',
  surface2: '#1F1A15',
  surface3: '#2A2218',
  border:   'rgba(242,237,232,0.08)',
  text:     '#F2EDE8',
  textMid:  'rgba(242,237,232,0.52)',
  textDim:  'rgba(242,237,232,0.28)',
  amber:    '#D4A853',
  amber10:  'rgba(212,168,83,0.10)',
  amber20:  'rgba(212,168,83,0.18)',
  amber30:  'rgba(212,168,83,0.28)',
  crimson:  '#C44040',
  crimson10:'rgba(196,64,64,0.12)',
  forest:   '#4A7A5A',
  forest10: 'rgba(74,122,90,0.12)',
  sky:      '#5B8FCC',
  sky10:    'rgba(91,143,204,0.10)',
};

const W = 390, H = 844;

// ── Primitives ────────────────────────────────────────────────────────────────
const el     = (type, props = {}) => ({ type, ...props });
const group  = (children, props = {}) => el('group', { children, ...props });
const rect   = (x, y, w, h, fill, props = {}) =>
  el('rect', { x, y, w, h, fill, rx: props.rx ?? 0, ...props });
const text   = (content, x, y, props = {}) =>
  el('text', {
    content, x, y,
    fontSize:   props.fontSize   ?? 13,
    fontWeight: props.fontWeight ?? '400',
    color:      props.color      ?? P.text,
    align:      props.align      ?? 'left',
    opacity:    props.opacity    ?? 1,
    ...props,
  });
const line   = (x1, y1, x2, y2, color, props = {}) =>
  el('line', { x1, y1, x2, y2, stroke: color, strokeWidth: props.w ?? 1, ...props });
const circle = (cx, cy, r, fill, props = {}) =>
  el('ellipse', { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill, rx: r, ...props });

const frame = (id, label, children) => ({
  id, label,
  width: W, height: H,
  background: P.bg,
  children,
});

// ── Shared Components ─────────────────────────────────────────────────────────
const StatusBar = () => group([
  rect(0, 0, W, 44, P.bg),
  text('9:41', 22, 14, { fontSize: 13, fontWeight: '600', color: P.text }),
  text('●●●', W - 22, 14, { fontSize: 8, color: P.text, align: 'right' }),
]);

const NavBar = (active = 0) => {
  const tabs = ['⌂', '▣', '◫', '◉'];
  const labels = ['Studio', 'Shoots', 'Gallery', 'Profile'];
  const TW = Math.floor(W / 4);
  return group([
    rect(0, H - 82, W, 82, P.surface),
    line(0, H - 82, W, H - 82, P.border),
    ...tabs.flatMap((icon, i) => {
      const cx = i * TW + TW / 2;
      const isA = i === active;
      return [
        ...(isA ? [rect(i * TW + TW / 2 - 12, H - 83, 24, 2, P.amber, { rx: 1 })] : []),
        text(icon, cx, H - 62, {
          fontSize: 18, color: isA ? P.amber : P.textDim, align: 'center' }),
        text(labels[i], cx, H - 36, {
          fontSize: 9, fontWeight: isA ? '700' : '400',
          color: isA ? P.amber : P.textDim, align: 'center', letterSpacing: 0.5 }),
      ];
    }),
  ]);
};

// Aperture-style status: outer ring + inner dot
const aperture = (cx, cy, r, color) => group([
  circle(cx, cy, r, 'transparent', { stroke: color, strokeWidth: 1.5 }),
  circle(cx, cy, Math.round(r * 0.4), color),
]);

const chip = (label, x, y, bg, fg, w) => {
  const cw = w || (label.length * 7 + 18);
  return group([
    rect(x, y, cw, 20, bg, { rx: 10 }),
    text(label, x + cw / 2, y + 5, {
      fontSize: 9, fontWeight: '700', color: fg, align: 'center', letterSpacing: 0.5 }),
  ]);
};

const progressBar = (x, y, w, pct, color) => group([
  rect(x, y, w, 4, P.surface3, { rx: 2 }),
  rect(x, y, Math.max(4, Math.round(w * pct)), 4, color, { rx: 2 }),
]);

const divider = (y) => line(20, y, W - 20, y, P.border);

// ── Screen 1: Studio Dashboard ────────────────────────────────────────────────
function Screen1() {
  return frame('dashboard', 'Studio Dashboard', [
    StatusBar(),
    text('FOCAL', 20, 58, { fontSize: 10, fontWeight: '800', color: P.amber, letterSpacing: 3 }),
    text('Studio', W - 20, 58, { fontSize: 10, color: P.textMid, align: 'right' }),

    text('Good morning, Cara.', 20, 88, { fontSize: 20, fontWeight: '700' }),
    text('3 active shoots this week.', 20, 112, { fontSize: 13, color: P.textMid }),

    // Week strip
    rect(20, 132, W - 40, 52, P.surface, { rx: 10 }),
    ...['M','T','W','T','F','S','S'].map((d, i) => {
      const bx = 28 + i * 48;
      const hasShoot = [0, 1, 2].includes(i);
      const isToday  = i === 1;
      return group([
        ...(isToday ? [rect(bx, 138, 36, 38, P.amber20, { rx: 6 })] : []),
        text(d, bx + 18, 146, {
          fontSize: 9, fontWeight: '600',
          color: isToday ? P.amber : (hasShoot ? P.text : P.textDim), align: 'center' }),
        text(hasShoot ? '◉' : '·', bx + 18, 162, {
          fontSize: hasShoot ? 7 : 9,
          color: isToday ? P.amber : (hasShoot ? P.textMid : P.textDim), align: 'center' }),
      ]);
    }),

    text('ACTIVE SHOOTS', 20, 204, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),

    // Card 1
    rect(20, 218, W - 40, 88, P.surface, { rx: 12 }),
    rect(20, 218, 4, 88, P.amber, { rx: 2 }),
    text('Chen × Liu — Wedding', 32, 230, { fontSize: 14, fontWeight: '600' }),
    text('Sat Apr 5  ·  Napa Valley Estate', 32, 248, { fontSize: 11, color: P.textMid }),
    chip('EDITING', 32, 264, P.amber20, P.amber, 72),
    text('142 selects', 110, 266, { fontSize: 10, color: P.textDim }),
    progressBar(32, 290, W - 80, 0.72, P.amber),
    text('72%', W - 28, 286, { fontSize: 9, color: P.textMid, align: 'right' }),

    // Card 2
    rect(20, 316, W - 40, 88, P.surface, { rx: 12 }),
    rect(20, 316, 4, 88, P.sky, { rx: 2 }),
    text('Botanica Co — Brand Campaign', 32, 328, { fontSize: 14, fontWeight: '600' }),
    text('Mon Apr 7  ·  Studio Booking', 32, 346, { fontSize: 11, color: P.textMid }),
    chip('UPCOMING', 32, 362, P.sky10, P.sky, 80),
    text('brief confirmed', 118, 364, { fontSize: 10, color: P.textDim }),
    progressBar(32, 388, W - 80, 0.15, P.sky),
    text('15%', W - 28, 384, { fontSize: 9, color: P.textMid, align: 'right' }),

    text('FINANCIALS THIS MONTH', 20, 416, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),

    rect(20, 430, (W - 52) / 2, 64, P.surface, { rx: 10 }),
    text('$8,400', 28, 446, { fontSize: 20, fontWeight: '700', color: P.forest }),
    text('Invoiced', 28, 468, { fontSize: 10, color: P.textMid }),

    rect(W / 2 + 6, 430, (W - 52) / 2, 64, P.surface, { rx: 10 }),
    text('$5,900', W / 2 + 14, 446, { fontSize: 20, fontWeight: '700', color: P.amber }),
    text('Collected', W / 2 + 14, 468, { fontSize: 10, color: P.textMid }),

    // Nudge
    rect(20, 504, W - 40, 42, P.crimson10, { rx: 10 }),
    rect(20, 504, 4, 42, P.crimson, { rx: 2 }),
    text('Invoice #003 overdue 4 days — tap to chase →', 34, 520, { fontSize: 11, color: '#F2A0A0' }),

    text('RECENT', 20, 558, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    ...[
      [P.forest,  'Gallery approved by client',  'Chen Wedding · 2h ago'],
      [P.amber,   'Exported 48 finals to Dropbox','Tanaka Portrait · 6h ago'],
      [P.textDim, 'Contract signed',              'Botanica Co · 1d ago'],
    ].flatMap(([col, title, sub], i) => {
      const y = 572 + i * 48;
      return [
        circle(30, y + 12, 7, col + '22'),
        aperture(30, y + 12, 7, col),
        text(title, 46, y + 6, { fontSize: 12, fontWeight: '500' }),
        text(sub, 46, y + 22, { fontSize: 10, color: P.textDim }),
        divider(y + 42),
      ];
    }),

    NavBar(0),
  ]);
}

// ── Screen 2: Active Shoot ────────────────────────────────────────────────────
function Screen2() {
  return frame('shoot', 'Active Shoot', [
    StatusBar(),
    text('←', 20, 58, { fontSize: 16, color: P.textMid }),
    text('Chen × Liu', 195, 58, { fontSize: 15, fontWeight: '600', align: 'center' }),
    text('···', W - 22, 58, { fontSize: 14, color: P.textMid, align: 'right' }),

    rect(20, 78, W - 40, 58, P.amber20, { rx: 14 }),
    aperture(44, 107, 10, P.amber),
    text('SHOOT DAY', 62, 96, { fontSize: 9, fontWeight: '700', color: P.amber, letterSpacing: 2 }),
    text('Saturday April 5  ·  Napa Valley Estate', 62, 112, { fontSize: 12 }),
    text('7h 30m', W - 28, 103, { fontSize: 18, fontWeight: '700', color: P.amber, align: 'right' }),
    text('until event', W - 28, 121, { fontSize: 9, color: P.amber + '99', align: 'right' }),

    text('SHOT LIST', 20, 150, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),

    ...[
      { time: '4:30pm', label: 'Getting ready — Bride',  col: P.forest,  active: false, done: true  },
      { time: '5:00pm', label: 'First look ceremony',    col: P.forest,  active: false, done: true  },
      { time: '5:45pm', label: 'Ceremony portraits',     col: P.amber,   active: true,  done: false },
      { time: '6:30pm', label: 'Reception & toasts',     col: P.textDim, active: false, done: false },
      { time: '8:00pm', label: 'Golden hour portraits',  col: P.textDim, active: false, done: false },
      { time: '9:00pm', label: 'Cake & first dance',     col: P.textDim, active: false, done: false },
    ].flatMap(({ time, label, col, active, done }, i) => {
      const y = 164 + i * 46;
      return [
        rect(20, y, W - 40, 38, active ? P.amber10 : P.surface, { rx: 10 }),
        text(time, 32, y + 11, { fontSize: 10, fontWeight: '600', color: active ? P.amber : P.textMid }),
        text(label, 32, y + 23, { fontSize: 12, color: done ? P.textDim : P.text, opacity: done ? 0.6 : 1 }),
        aperture(W - 30, y + 19, 7, col),
      ];
    }),

    rect(20, 444, W - 40, 56, P.surface2, { rx: 12 }),
    line(20 + (W - 40) / 3, 444, 20 + (W - 40) / 3, 500, P.border),
    line(20 + 2 * (W - 40) / 3, 444, 20 + 2 * (W - 40) / 3, 500, P.border),
    ...[ ['342', 'Shots fired'], ['12.8 GB', 'Card used'], ['31%', 'Delivered'] ].map(([val, lbl], i) => {
      const cx = 20 + (i + 0.5) * (W - 40) / 3;
      return group([
        text(val, cx, 462, { fontSize: 15, fontWeight: '700', align: 'center' }),
        text(lbl, cx, 480, { fontSize: 9, color: P.textDim, align: 'center' }),
      ]);
    }),

    text('CLIENT NOTES', 20, 512, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    rect(20, 526, W - 40, 76, P.surface, { rx: 10 }),
    text('"Please capture a shot with Grandma Liu —', 30, 540, { fontSize: 11 }),
    text('she\'s flying in from Shanghai. Keep everything', 30, 556, { fontSize: 11 }),
    text('candid, no posed group photos."', 30, 572, { fontSize: 11 }),
    text('— client note · Apr 2', 30, 590, { fontSize: 9, color: P.textDim }),

    rect(20, 616, W - 40, 50, P.amber, { rx: 14 }),
    text('Mark Ceremony Complete  →', W / 2, 635, {
      fontSize: 13, fontWeight: '700', color: '#0C0A09', align: 'center' }),

    NavBar(1),
  ]);
}

// ── Screen 3: Gallery Selects ─────────────────────────────────────────────────
function Screen3() {
  const approved = [0, 2, 5];
  const starred  = [0, 2, 4, 5, 7, 9, 11];

  return frame('gallery', 'Gallery Selects', [
    StatusBar(),
    text('Chen × Liu', 20, 60, { fontSize: 18, fontWeight: '700' }),
    text('Gallery Selects', 20, 80, { fontSize: 12, color: P.textMid }),
    chip('AWAITING APPROVAL', W - 154, 57, P.amber20, P.amber, 134),

    // Filter tabs
    rect(20, 96, W - 40, 36, P.surface, { rx: 18 }),
    ...['All 142', 'Starred 38', 'Culled 12'].map((lbl, i) => {
      const isA = i === 0;
      const x = 28 + i * 108;
      return group([
        ...(isA ? [rect(x, 99, 86, 30, P.amber10, { rx: 14 })] : []),
        text(lbl, x + 43, 109, {
          fontSize: 11, fontWeight: isA ? '600' : '400',
          color: isA ? P.amber : P.textMid, align: 'center' }),
      ]);
    }),

    // Contact sheet (4 × 3)
    ...Array.from({ length: 12 }, (_, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const gx = 20 + col * 88;
      const gy = 148 + row * 90;
      const r = 20 + idx * 4;
      const g = 18 + idx * 3;
      const b = 14 + idx * 2;
      const isStarred = starred.includes(idx);
      const isApproved = approved.includes(idx);
      return group([
        rect(gx, gy, 82, 78, `rgb(${r},${g},${b})`, { rx: 6 }),
        ...(isStarred ? [
          circle(gx + 72, gy + 10, 8, isApproved ? P.forest : P.amber20),
          text(isApproved ? '✓' : '★', gx + 72, gy + 5,
            { fontSize: 8, color: isApproved ? '#fff' : P.amber, align: 'center' }),
        ] : []),
        text(String(idx + 1).padStart(3, '0'), gx + 4, gy + 70,
          { fontSize: 8, color: P.textDim }),
      ]);
    }),

    // Toolbar
    rect(0, 436, W, 1, P.border),
    rect(0, 437, W, 40, P.surface),
    text('Select All', 28, 452, { fontSize: 11, color: P.textMid }),
    text('★ Star', W / 2, 452, { fontSize: 11, color: P.amber, align: 'center' }),
    text('⊳ Share Link', W - 28, 452, { fontSize: 11, align: 'right' }),

    rect(20, 488, W - 40, 50, P.amber, { rx: 14 }),
    text('Send Gallery to Client  →', W / 2, 507,
      { fontSize: 13, fontWeight: '700', color: '#0C0A09', align: 'center' }),

    text('REVIEW LOG', 20, 552, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    ...[
      [P.forest,  'Client approved 38 selects',     '2h ago'],
      [P.amber,   '12 finals exported to Lightroom', '1d ago'],
      [P.textDim, 'Gallery link sent',               '3d ago'],
    ].flatMap(([col, msg, ago], i) => {
      const y = 566 + i * 44;
      return [
        aperture(30, y + 12, 7, col),
        text(msg, 46, y + 6, { fontSize: 12 }),
        text(ago, 46, y + 22, { fontSize: 10, color: P.textDim }),
        divider(y + 38),
      ];
    }),

    NavBar(2),
  ]);
}

// ── Screen 4: Invoices ────────────────────────────────────────────────────────
function Screen4() {
  const invoices = [
    { num: '#004', client: 'Botanica Co.',  desc: 'Brand Campaign — Phase 1', amount: '$3,800', status: 'DRAFT',   col: P.textDim,  bg: P.surface    },
    { num: '#003', client: 'Tanaka Family', desc: 'Portrait Session',          amount: '$1,200', status: 'OVERDUE', col: P.crimson,  bg: P.crimson10  },
    { num: '#002', client: 'Chen × Liu',   desc: 'Wedding Day Coverage',      amount: '$4,500', status: 'SENT',    col: P.amber,    bg: P.amber10    },
    { num: '#001', client: 'Priya Mehta',  desc: 'Corporate Headshots',       amount: '$850',   status: 'PAID',    col: P.forest,   bg: P.forest10   },
  ];
  return frame('invoices', 'Invoices', [
    StatusBar(),
    text('Invoices', 20, 62, { fontSize: 22, fontWeight: '700' }),
    rect(W - 52, 52, 36, 36, P.amber, { rx: 18 }),
    text('+', W - 34, 60, { fontSize: 20, fontWeight: '700', color: '#0C0A09', align: 'center' }),

    rect(20, 96, W - 40, 68, P.surface, { rx: 14 }),
    line(20 + (W - 40) / 2, 96, 20 + (W - 40) / 2, 164, P.border),
    text('$14,300', 38, 114, { fontSize: 22, fontWeight: '700' }),
    text('Outstanding', 38, 138, { fontSize: 10, color: P.textMid }),
    text('$5,900', W - 20, 114, { fontSize: 22, fontWeight: '700', color: P.forest, align: 'right' }),
    text('Collected this month', W - 20, 138, { fontSize: 10, color: P.textMid, align: 'right' }),

    text('ALL INVOICES', 20, 180, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),

    ...invoices.flatMap(({ num, client, desc, amount, status, col, bg }, i) => {
      const y = 194 + i * 74;
      const cw = status.length * 7 + 16;
      return [
        rect(20, y, W - 40, 66, bg, { rx: 12 }),
        rect(20, y, 4, 66, col, { rx: 2 }),
        text(num, 32, y + 10, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 1 }),
        chip(status, W - 28 - cw, y + 8, col + '22', col, cw),
        text(client, 32, y + 24, { fontSize: 14, fontWeight: '600' }),
        text(desc, 32, y + 40, { fontSize: 10, color: P.textMid }),
        text(amount, W - 28, y + 24, { fontSize: 14, fontWeight: '700', align: 'right' }),
      ];
    }),

    divider(494),
    text('Stripe connected · Payouts every Tuesday', 20, 508, { fontSize: 10, color: P.textDim }),
    text('View earnings →', W - 20, 508, { fontSize: 10, color: P.amber, align: 'right' }),

    NavBar(1),
  ]);
}

// ── Screen 5: Studio Profile ──────────────────────────────────────────────────
function Screen5() {
  const settings = [
    ['◈', P.amber,   'Brand Kit',           'Logo, watermarks, colors'],
    ['⊟', P.sky,     'Client Portal',       'Gallery sharing preferences'],
    ['◑', P.forest,  'Payments & Stripe',   'Connected · Stockholm SEK'],
    ['▣', P.textMid, 'Backup & Export',     'Dropbox, Lightroom catalog sync'],
    ['◎', P.crimson, 'Storage',             '124 GB used of 500 GB'],
  ];
  return frame('profile', 'Studio Profile', [
    StatusBar(),
    text('Profile', 20, 62, { fontSize: 22, fontWeight: '700' }),
    text('Edit', W - 20, 62, { fontSize: 13, color: P.amber, align: 'right' }),

    circle(W / 2, 118, 40, P.surface2),
    circle(W / 2, 118, 40, 'transparent', { stroke: P.amber, strokeWidth: 1.5 }),
    text('CL', W / 2, 106, { fontSize: 20, fontWeight: '700', color: P.amber, align: 'center' }),
    text('Cara Lindström', W / 2, 170, { fontSize: 17, fontWeight: '600', align: 'center' }),
    text('Lindström Visual Studio', W / 2, 190, { fontSize: 12, color: P.textMid, align: 'center' }),
    chip('PRO', W / 2 - 20, 206, P.amber20, P.amber, 40),

    rect(20, 234, W - 40, 56, P.surface, { rx: 14 }),
    ...[['28', 'Projects'], ['142', 'Deliverables'], ['4.9★', 'Rating']].map(([val, lbl], i) => {
      const cx = 60 + i * 108;
      return group([
        text(val, cx, 252, { fontSize: 16, fontWeight: '700', align: 'center' }),
        text(lbl, cx, 270, { fontSize: 9, color: P.textDim, align: 'center' }),
      ]);
    }),
    line(60 + 108, 238, 60 + 108, 286, P.border),
    line(60 + 216, 238, 60 + 216, 286, P.border),

    text('STUDIO SETTINGS', 20, 306, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),

    ...settings.flatMap(([icon, col, label, sub], i) => {
      const y = 322 + i * 56;
      return [
        rect(20, y, W - 40, 48, P.surface, { rx: 12 }),
        circle(40, y + 24, 12, col + '22'),
        text(icon, 40, y + 18, { fontSize: 10, color: col, align: 'center' }),
        text(label, 60, y + 14, { fontSize: 13, fontWeight: '500' }),
        text(sub, 60, y + 30, { fontSize: 10, color: P.textMid }),
        text('›', W - 28, y + 17, { fontSize: 16, color: P.textDim, align: 'right' }),
      ];
    }),

    rect(20, 608, W - 40, 44, P.surface, { rx: 12 }),
    text('Sign out of Studio', W / 2, 622, { fontSize: 13, color: P.crimson, align: 'center' }),

    NavBar(3),
  ]);
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    title: 'FOCAL — Studio OS for Independent Photographers',
    description: 'Dark warm photographer studio app. Inspired by "Darkroom" (darkmodedesign.com) and "Mike Matas" portfolio (Godly.website) 2026-04-01. Warm charcoal (#0C0A09), film-gold accent (#D4A853), aperture-ring status badges, contact-sheet gallery.',
    author: 'RAM Design Heartbeat',
    theme: {
      mode: 'dark',
      primary: P.amber,
      background: P.bg,
      surface: P.surface,
      text: P.text,
    },
    tags: ['dark', 'photography', 'saas', 'studio', 'film', 'warm'],
    created: new Date().toISOString(),
  },
  screens: [Screen1(), Screen2(), Screen3(), Screen4(), Screen5()],
};

fs.writeFileSync('focal.pen', JSON.stringify(pen, null, 2));
console.log('✓ focal.pen written');
pen.screens.forEach(s => console.log(' ', s.id, '—', s.label, '·', s.children.length, 'children'));
