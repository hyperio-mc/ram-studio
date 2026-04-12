/**
 * FUSE — Motion templates for obsessive creators.
 *
 * Inspired by:
 * 1. DarkModeDesign.com "108 Supply" — dark editorial masonry grid of motion
 *    templates, pill category filters (Carousel/Stack/Sequence/Grid), black
 *    background, mixed serif + sans, warm cream text, obsessive precision aesthetic
 * 2. DarkModeDesign.com "Muradov" — ALL-CAPS massive display typography filling
 *    screen width, ultra-high contrast near-black + electric accent
 * 3. Awwwards "The Lookback (BO®S/2026)" by Gil Huybrecht — mixed-media editorial
 *    collage layout, street culture aesthetic, editorial category chips
 *
 * Theme: DARK — #090909 near-black with electric chartreuse #CDFF47 + warm cream
 * Archetype: creative-marketplace
 */

const fs = require('fs');

const T = {
  bg:         '#090909',
  surface:    '#111111',
  surface2:   '#181818',
  surface3:   '#222222',
  surfaceHi:  '#2A2A2A',
  text:       '#F0EBE2',
  textMid:    '#888077',
  textMute:   '#3A3730',
  lime:       '#CDFF47',
  limeLt:     'rgba(205,255,71,0.09)',
  limeMid:    'rgba(205,255,71,0.20)',
  purple:     '#8B6EFF',
  purpleLt:   'rgba(139,110,255,0.10)',
  coral:      '#FF6B5B',
  coralLt:    'rgba(255,107,91,0.10)',
  amber:      '#FFB84D',
  amberLt:    'rgba(255,184,77,0.10)',
  mint:       '#47FFCC',
  mintLt:     'rgba(71,255,204,0.09)',
  border:     'rgba(205,255,71,0.07)',
  borderDim:  'rgba(240,235,226,0.07)',
  shadow:     'rgba(0,0,0,0.7)',
  serif:      'Georgia, "Times New Roman", serif',
  sans:       '"Inter", "Helvetica Neue", Arial, sans-serif',
};

const uid = () => Math.random().toString(36).slice(2, 9);

function r(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    shadow: opts.shadow ? { x: 0, y: 4, blur: 24, color: T.shadow } : undefined,
    border: opts.border ? { color: opts.border, width: opts.bw ?? 1 } : undefined,
  };
}

function t(x, y, w, content, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, width: w, content,
    fontSize: opts.size ?? 14,
    fontFamily: opts.font ?? T.sans,
    fontWeight: opts.weight ?? '400',
    color: opts.color ?? T.text,
    lineHeight: opts.lh ?? 1.45,
    letterSpacing: opts.ls ?? 0,
    align: opts.align ?? 'left',
    opacity: opts.opacity ?? 1,
  };
}

function el(x, y, sz, fill, opts = {}) {
  return {
    id: uid(), type: 'ellipse',
    x: x - sz, y: y - sz,
    width: sz * 2, height: sz * 2,
    fill: fill || 'transparent',
    border: opts.border ? { color: opts.border, width: opts.bw ?? 1 } : undefined,
    opacity: opts.opacity ?? 1,
  };
}

function clean(obj) {
  if (Array.isArray(obj)) return obj.filter(Boolean).map(clean);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = clean(v);
    }
    return out;
  }
  return obj;
}

function statusBar(y = 0) {
  return [
    r(0, y, 390, 48, T.bg),
    t(20, y + 15, 60, '9:41', { size: 15, weight: '600', color: T.text }),
    t(296, y + 15, 74, '▲ ◆ ■', { size: 10, color: T.textMid, align: 'right' }),
  ];
}

function pill(x, y, label, active = false, color) {
  const c = color || T.lime;
  const w = label.length * 7.8 + 22;
  return [
    r(x, y, w, 26, active ? c + '18' : T.surface2, {
      r: 13,
      border: active ? c : T.borderDim,
      bw: active ? 1 : 1,
    }),
    t(x + 11, y + 6, w - 22, label, {
      size: 11,
      weight: active ? '600' : '400',
      color: active ? c : T.textMid,
      align: 'center',
    }),
  ];
}

function bottomNav(activeIdx = 0) {
  const items = [
    { icon: '▦', label: 'Browse' },
    { icon: '⚡', label: 'New' },
    { icon: '✦', label: 'Saved' },
    { icon: '○', label: 'Profile' },
  ];
  const y = 780;
  return [
    r(0, y, 390, 64, T.surface, { border: T.borderDim }),
    ...items.flatMap((item, i) => {
      const cx = 49 + i * 98;
      const isActive = i === activeIdx;
      return [
        t(cx - 16, y + 10, 32, item.icon, {
          size: 18, color: isActive ? T.lime : T.textMute, align: 'center',
        }),
        t(cx - 22, y + 34, 44, item.label, {
          size: 9, weight: isActive ? '700' : '400',
          color: isActive ? T.lime : T.textMute, align: 'center',
        }),
      ];
    }),
  ];
}

// Template card in masonry style
function templateCard(x, y, w, h, data) {
  const { title, type, author, count, tag, tagColor, accent } = data;
  const ac = accent || T.lime;
  return [
    r(x, y, w, h, T.surface2, { r: 10, border: T.borderDim }),
    // Preview area (animated preview placeholder)
    r(x + 1, y + 1, w - 2, h * 0.58, T.surface3, { r: 10 }),
    // Abstract motion preview dots/shapes
    el(x + w * 0.25, y + h * 0.19, w * 0.08, ac + '30'),
    el(x + w * 0.5, y + h * 0.25, w * 0.12, ac + '20'),
    el(x + w * 0.75, y + h * 0.15, w * 0.06, ac + '40'),
    r(x + w * 0.1, y + h * 0.31, w * 0.8, 1.5, ac + '40'),
    r(x + w * 0.2, y + h * 0.38, w * 0.6, 1.5, ac + '25'),
    // Type tag
    r(x + 8, y + 8, type.length * 6.5 + 14, 18, T.bg + 'CC', { r: 9 }),
    t(x + 15, y + 11, type.length * 7, type, { size: 9, weight: '600', color: ac }),
    // Info section
    t(x + 10, y + h * 0.62, w - 20, title, { size: 12.5, weight: '600', color: T.text, lh: 1.25 }),
    t(x + 10, y + h * 0.62 + 32, 80, author, { size: 10, color: T.textMid }),
    t(x + w - 46, y + h * 0.62 + 32, 36, count + ' uses', { size: 9.5, color: T.textMute, align: 'right' }),
  ].flat();
}

// ─── SCREEN 1: BROWSE ─────────────────────────────────────────────────────────
function buildBrowse() {
  const elements = [
    ...statusBar(),

    // Header
    t(20, 52, 160, 'FUSE', {
      size: 26, weight: '900', color: T.text, ls: 1.5,
    }),
    t(20, 82, 300, 'Motion templates for obsessive creators', {
      size: 11.5, color: T.textMid,
    }),
    // Search
    r(20, 100, 310, 36, T.surface2, { r: 10, border: T.borderDim }),
    t(38, 112, 20, '◎', { size: 13, color: T.textMid }),
    t(60, 112, 200, 'Search templates…', { size: 12, color: T.textMute }),
    // Cart icon
    r(340, 100, 34, 36, T.surface2, { r: 10, border: T.borderDim }),
    t(340, 111, 34, '▤', { size: 14, color: T.textMid, align: 'center' }),

    // Filter pills — 108 Supply inspired categories
    ...pill(20, 146, 'All', true),
    ...pill(56, 146, 'Carousel'),
    ...pill(118, 146, 'Stack'),
    ...pill(166, 146, 'Sequence'),
    ...pill(238, 146, 'Grid'),
    ...pill(281, 146, 'Reveal'),
    ...pill(335, 146, 'Loop'),

    // Section header
    t(20, 184, 200, 'Fresh Release', { size: 13, weight: '700', color: T.text }),
    r(128, 190, 1, 14, T.borderDim),
    t(136, 184, 120, 'View all →', { size: 11.5, color: T.lime, weight: '500' }),

    // Masonry grid — row 1 (tall + narrow)
    ...templateCard(20, 204, 178, 192, {
      title: 'Depth Carousel',
      type: 'CAROUSEL',
      author: 'Mika Ono',
      count: '2.4K',
      accent: T.lime,
    }),
    ...templateCard(208, 204, 162, 136, {
      title: 'Magnetic Stack',
      type: 'STACK',
      author: 'Leon Haas',
      count: '1.8K',
      accent: T.purple,
    }),
    ...templateCard(208, 348, 162, 48, {
      title: 'Grid Pulse',
      type: 'GRID',
      author: 'Mira K.',
      count: '912',
      accent: T.mint,
    }),

    // Row 2 (wide + small side by side)
    ...templateCard(20, 404, 240, 152, {
      title: 'Reveal Sequence',
      type: 'SEQUENCE',
      author: 'Ana Torres',
      count: '3.1K',
      accent: T.coral,
    }),
    ...templateCard(270, 404, 100, 70, {
      title: 'Loop Fade',
      type: 'LOOP',
      author: 'Björn S.',
      count: '744',
      accent: T.amber,
    }),
    ...templateCard(270, 482, 100, 74, {
      title: 'Type Drop',
      type: 'REVEAL',
      author: 'Kai Liu',
      count: '1.2K',
      accent: T.lime,
    }),

    // Row 3 — three equal
    ...templateCard(20, 564, 110, 142, {
      title: 'Noise Grid',
      type: 'GRID',
      author: 'Yuki A.',
      count: '590',
      accent: T.purple,
    }),
    ...templateCard(140, 564, 110, 142, {
      title: 'Liquid Stack',
      type: 'STACK',
      author: 'Reza F.',
      count: '870',
      accent: T.mint,
    }),
    ...templateCard(260, 564, 110, 142, {
      title: 'Pan & Scale',
      type: 'CAROUSEL',
      author: 'Léa V.',
      count: '2.0K',
      accent: T.lime,
    }),

    ...bottomNav(0),
  ].flat();

  return { id: 'browse', title: 'Browse', width: 390, height: 844, elements };
}

// ─── SCREEN 2: TRENDING (Muradov-inspired massive type) ───────────────────────
function buildTrending() {
  const items = [
    { rank: '01', title: 'Depth Carousel', type: 'CAROUSEL', author: 'Mika Ono', uses: '2,441', hot: true, accent: T.lime },
    { rank: '02', title: 'Magnetic Stack', type: 'STACK', author: 'Leon Haas', uses: '1,872', hot: true, accent: T.purple },
    { rank: '03', title: 'Reveal Sequence', type: 'SEQUENCE', author: 'Ana Torres', uses: '3,107', hot: true, accent: T.coral },
    { rank: '04', title: 'Noise Grid', type: 'GRID', author: 'Yuki Ando', uses: '912', hot: false, accent: T.mint },
    { rank: '05', title: 'Liquid Stack', type: 'STACK', author: 'Reza Farsi', uses: '870', hot: false, accent: T.amber },
  ];

  const rankItems = items.flatMap((s, i) => {
    const y = 304 + i * 82;
    return [
      r(20, y, 350, 1, T.borderDim),
      t(20, y + 12, 46, s.rank, {
        size: 26, weight: '900', color: T.textMute, font: T.sans, ls: -1,
      }),
      r(68, y + 16, s.type.length * 6 + 14, 18, s.accent + '18', { r: 9 }),
      t(75, y + 18, s.type.length * 6.5, s.type, { size: 9, weight: '700', color: s.accent }),
      t(68, y + 42, 230, s.title, { size: 13, weight: '600', color: T.text }),
      t(68, y + 62, 100, 'by ' + s.author, { size: 10, color: T.textMid }),
      t(300, y + 20, 68, s.uses + ' uses', { size: 10.5, weight: '600', color: s.hot ? s.accent : T.textMid, align: 'right' }),
    ];
  });

  const elements = [
    ...statusBar(),

    // Massive display type — Muradov inspired
    t(20, 52, 350, 'TOP', {
      size: 84, weight: '900', color: T.text, ls: -4, font: T.sans, lh: 0.85,
    }),
    t(20, 126, 350, 'TEMPLATES', {
      size: 54, weight: '900', color: T.lime, ls: -2.5, font: T.sans, lh: 0.9,
    }),
    t(20, 192, 350, 'THIS WEEK', {
      size: 54, weight: '900', color: T.text, ls: -2.5, font: T.sans, lh: 0.9,
      opacity: 0.35,
    }),

    // Sub
    t(20, 258, 200, '247 templates · updated daily', { size: 11.5, color: T.textMid }),
    // Filter
    ...pill(220, 254, 'This Week', true),
    ...pill(314, 254, 'All Time'),

    ...rankItems.flat(),

    // See all button
    r(20, 720, 350, 46, T.surface2, { r: 12, border: T.borderDim }),
    t(20, 737, 350, 'Browse all 247 templates →', {
      size: 12, weight: '600', color: T.lime, align: 'center',
    }),

    ...bottomNav(0),
  ].flat();

  return { id: 'trending', title: 'Top Templates', width: 390, height: 844, elements };
}

// ─── SCREEN 3: TEMPLATE DETAIL ────────────────────────────────────────────────
function buildDetail() {
  function statChip(x, y, label, value, color) {
    return [
      r(x, y, 100, 56, T.surface2, { r: 12, border: T.borderDim }),
      t(x + 10, y + 10, 80, value, { size: 22, weight: '800', color }),
      t(x + 10, y + 36, 80, label, { size: 10, color: T.textMid }),
    ];
  }

  const elements = [
    ...statusBar(),
    t(20, 54, 60, '← Back', { size: 13, color: T.lime, weight: '500' }),

    // Big preview area
    r(20, 82, 350, 210, T.surface2, { r: 16, border: T.borderDim }),
    // Motion preview decoration
    el(110, 174, 52, T.lime + '10', { border: T.lime + '20' }),
    el(110, 174, 34, T.lime + '15', { border: T.lime + '30' }),
    el(110, 174, 16, T.lime + '40'),
    el(196, 142, 30, T.purple + '15', { border: T.purple + '25' }),
    el(196, 142, 14, T.purple + '50'),
    el(268, 190, 22, T.coral + '15', { border: T.coral + '25' }),
    r(60, 172, 100, 2, T.lime + '50'),
    r(60, 182, 80, 2, T.lime + '25'),
    // Play button
    el(330, 100, 20, T.surface3, { border: T.borderDim }),
    t(318, 91, 24, '▶', { size: 11, color: T.lime, align: 'center' }),

    // Type badge on preview
    r(30, 90, 80, 22, T.bg + 'DD', { r: 11 }),
    t(40, 93, 60, 'CAROUSEL', { size: 9.5, weight: '700', color: T.lime }),

    // Title + author
    t(20, 304, 280, 'Depth Carousel', {
      size: 24, weight: '800', color: T.text, ls: -0.5,
    }),
    t(20, 334, 220, 'by Mika Ono · Jitter · Framer compatible', {
      size: 11, color: T.textMid,
    }),

    // Rating
    t(20, 356, 100, '✦ ✦ ✦ ✦ ✧', { size: 12, color: T.amber }),
    t(96, 356, 60, '4.8 (128)', { size: 11, color: T.textMid }),

    // Stats row
    ...statChip(20, 380, 'Uses', '2.4K', T.lime),
    ...statChip(130, 380, 'Saves', '891', T.purple),
    ...statChip(240, 380, 'Rating', '4.8', T.amber),

    // Description
    r(20, 448, 350, 1, T.borderDim),
    t(20, 460, 350, 'Description', { size: 13, weight: '700', color: T.text }),
    t(20, 482, 350, 'A depth-layered carousel with perspective distortion and elastic spring physics. Includes 8 variants with Jitter source files. Built for obsessively smooth scroll interactions.', {
      size: 12, color: T.textMid, lh: 1.65, font: T.serif,
    }),

    // Tags
    r(20, 560, 350, 1, T.borderDim),
    t(20, 572, 350, 'Compatible with', { size: 13, weight: '700', color: T.text }),
    ...['Jitter', 'Framer', 'After Effects', 'Rive'].reduce((acc, tag, i) => {
      const x = 20 + (i % 2) * 180;
      const y = 594 + Math.floor(i / 2) * 36;
      return [...acc,
        r(x, y, 164, 28, T.surface2, { r: 8, border: T.borderDim }),
        t(x + 14, y + 7, 136, tag, { size: 11.5, color: T.text }),
        t(x + 140, y + 7, 14, '✓', { size: 11, color: T.lime, align: 'right' }),
      ];
    }, []),

    // CTA
    r(20, 684, 350, 52, T.lime, { r: 14 }),
    t(20, 698, 350, 'Get Template — Free', {
      size: 14, weight: '800', color: T.bg, align: 'center',
    }),
    r(20, 746, 350, 1, T.borderDim),
    t(20, 756, 350, '+ Save for later', {
      size: 12, color: T.textMid, align: 'center', weight: '500',
    }),

    ...bottomNav(0),
  ].flat();

  return { id: 'detail', title: 'Template Detail', width: 390, height: 844, elements };
}

// ─── SCREEN 4: SAVED / COLLECTION ────────────────────────────────────────────
function buildSaved() {
  const saved = [
    { title: 'Depth Carousel', type: 'CAROUSEL', author: 'Mika Ono', accent: T.lime, date: 'Today' },
    { title: 'Magnetic Stack', type: 'STACK', author: 'Leon Haas', accent: T.purple, date: 'Yesterday' },
    { title: 'Reveal Sequence', type: 'SEQUENCE', author: 'Ana Torres', accent: T.coral, date: 'Mar 24' },
    { title: 'Noise Grid', type: 'GRID', author: 'Yuki Ando', accent: T.mint, date: 'Mar 22' },
    { title: 'Liquid Stack', type: 'STACK', author: 'Reza Farsi', accent: T.amber, date: 'Mar 21' },
    { title: 'Pan & Scale', type: 'CAROUSEL', author: 'Léa Vidal', accent: T.lime, date: 'Mar 19' },
  ];

  const elements = [
    ...statusBar(),
    t(20, 52, 200, 'Saved', { size: 26, weight: '900', color: T.text, ls: -0.5 }),
    t(20, 84, 250, saved.length + ' templates saved', { size: 12, color: T.textMid }),

    // New collection button
    r(286, 54, 86, 30, T.surface2, { r: 8, border: T.borderDim }),
    t(294, 63, 70, '+ Collection', { size: 10.5, color: T.textMid, align: 'center' }),

    // Collection card
    r(20, 108, 350, 68, T.limeLt, { r: 14, border: T.border }),
    t(36, 118, 20, '✦', { size: 18, color: T.lime }),
    t(62, 118, 200, 'My Favorites', { size: 14, weight: '700', color: T.text }),
    t(62, 138, 160, saved.length + ' templates', { size: 11, color: T.lime }),
    t(320, 128, 30, '→', { size: 16, color: T.lime }),

    // Divider
    r(20, 186, 350, 1, T.borderDim),
    t(20, 198, 200, 'All Saved', { size: 13, weight: '700', color: T.text }),

    // List view
    ...saved.flatMap((item, i) => {
      const y = 222 + i * 84;
      return [
        r(20, y, 350, 74, T.surface2, { r: 12, border: T.borderDim }),
        // Preview thumbnail
        r(30, y + 11, 70, 52, T.surface3, { r: 8 }),
        el(65, y + 37, 16, item.accent + '25'),
        el(65, y + 37, 8, item.accent + '60'),
        // Type tag
        r(34, y + 15, item.type.length * 5.5 + 12, 16, T.bg + 'BB', { r: 8 }),
        t(40, y + 17, item.type.length * 6, item.type, { size: 8.5, weight: '700', color: item.accent }),
        // Info
        t(112, y + 16, 200, item.title, { size: 13, weight: '600', color: T.text }),
        t(112, y + 34, 120, 'by ' + item.author, { size: 10.5, color: T.textMid }),
        t(112, y + 52, 100, item.date, { size: 10, color: T.textMute }),
        // Download icon
        r(322, y + 22, 32, 32, T.surface3, { r: 8 }),
        t(322, y + 31, 32, '↓', { size: 13, color: T.lime, align: 'center' }),
      ];
    }),

    ...bottomNav(2),
  ].flat();

  return { id: 'saved', title: 'Saved', width: 390, height: 844, elements };
}

// ─── SCREEN 5: PROFILE ────────────────────────────────────────────────────────
function buildProfile() {
  function settingsRow(y, icon, label, value, showArrow = true) {
    return [
      r(20, y, 350, 52, T.surface2, { r: 12, border: T.borderDim }),
      t(34, y + 16, 22, icon, { size: 15, color: T.textMid }),
      t(62, y + 18, 200, label, { size: 13, color: T.text }),
      value ? t(250, y + 18, 80, value, { size: 12, color: T.textMid, align: 'right' }) : null,
      showArrow ? t(342, y + 18, 18, '›', { size: 16, color: T.textMute }) : null,
    ];
  }

  const elements = [
    ...statusBar(),

    // Profile header
    el(60, 100, 38, T.limeLt, { border: T.border }),
    t(40, 80, 40, 'MO', { size: 16, weight: '700', color: T.lime, align: 'center' }),
    t(110, 72, 220, 'Mika Ono', { size: 20, weight: '800', color: T.text }),
    t(110, 98, 220, '@mikaono · Creator', { size: 12, color: T.textMid }),
    t(110, 116, 220, '14 templates published · 12.4K uses', {
      size: 10.5, color: T.lime, weight: '500',
    }),

    // Stats strip
    r(20, 152, 350, 68, T.surface2, { r: 14, border: T.borderDim }),
    ...[
      { v: '14', l: 'Published' },
      { v: '12.4K', l: 'Total Uses' },
      { v: '$2,840', l: 'Earned' },
      { v: '4.9', l: 'Avg Rating' },
    ].flatMap(({ v, l }, i) => {
      const x = 36 + i * 84;
      return [
        t(x, 166, 60, v, { size: 18, weight: '800', color: T.lime, align: 'center' }),
        t(x, 190, 60, l, { size: 9, color: T.textMid, align: 'center' }),
        i < 3 ? r(x + 76, 168, 1, 34, T.borderDim) : null,
      ];
    }),

    // Section
    r(20, 232, 350, 1, T.borderDim),
    t(20, 244, 200, 'Your Templates', { size: 13, weight: '700', color: T.text }),
    t(280, 244, 90, 'Upload new +', { size: 11.5, color: T.lime, weight: '600', align: 'right' }),

    // Mini template preview row
    ...['Depth Loop', 'Stack Echo', 'Grid Flow'].flatMap((name, i) => {
      const x = 20 + i * 116;
      const colors = [T.lime, T.purple, T.coral];
      return [
        r(x, 264, 106, 80, T.surface2, { r: 10, border: T.borderDim }),
        r(x + 2, 266, 102, 50, T.surface3, { r: 9 }),
        el(x + 53, 300, 16, colors[i] + '25'),
        el(x + 53, 300, 8, colors[i] + '60'),
        t(x + 8, 326, 90, name, { size: 11, weight: '600', color: T.text }),
        t(x + 8, 340, 90, colors[i] === T.lime ? 'Carousel' : colors[i] === T.purple ? 'Stack' : 'Grid', {
          size: 9.5, color: colors[i],
        }),
      ];
    }),

    // Settings
    r(20, 366, 350, 1, T.borderDim),
    t(20, 378, 200, 'Account', { size: 13, weight: '700', color: T.text }),

    ...settingsRow(398, '✦', 'Creator Pro', 'Active', true),
    ...settingsRow(460, '◎', 'Notifications', 'On', true),
    ...settingsRow(522, '▣', 'Downloads', '14 files', true),
    ...settingsRow(584, '⚙', 'Settings', null, true),

    // Sign out
    r(20, 648, 350, 48, T.coralLt, { r: 12, border: T.coral + '30' }),
    t(20, 665, 350, 'Sign out', {
      size: 13, weight: '600', color: T.coral, align: 'center',
    }),

    ...bottomNav(3),
  ].flat();

  return { id: 'profile', title: 'Profile', width: 390, height: 844, elements };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'FUSE — Motion templates for obsessive creators',
  description: 'Dark editorial motion template marketplace. Near-black palette with electric chartreuse accents. Masonry browse grid inspired by DarkModeDesign.com "108 Supply". Massive ALL-CAPS trending screen from "Muradov" portfolio. Built for Jitter/Framer/AE template creators and consumers.',
  width: 390,
  height: 844,
  screens: [
    buildBrowse(),
    buildTrending(),
    buildDetail(),
    buildSaved(),
    buildProfile(),
  ],
};

fs.writeFileSync('fuse.pen', JSON.stringify(clean(pen), null, 2));
console.log('✓ fuse.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => {
  const count = Array.isArray(s.elements) ? s.elements.length : 0;
  console.log('  ' + s.title + ':', count, 'elements');
});
