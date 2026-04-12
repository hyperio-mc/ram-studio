// blog-glass.js — Generates a glassy scrollable storytelling blog design
// 6 mobile screens showing scroll sections of an editorial photo essay
// Theme: "First Light" — Aurora Borealis photography essay
const fs = require('fs');

const SW = 375, SH = 812, GAP = 100;

const variables = {
  // Backgrounds
  'sky-deep':   { type: 'color', value: '#04060f' },
  'sky-mid':    { type: 'color', value: '#0a0f1e' },
  // Aurora palette
  'aurora-g':   { type: 'color', value: '#00e5a0' },
  'aurora-b':   { type: 'color', value: '#3b5bdb' },
  'aurora-p':   { type: 'color', value: '#9c3fe8' },
  'aurora-c':   { type: 'color', value: '#00d4ff' },
  // Glass
  'glass':      { type: 'color', value: '#ffffff' },
  // Text
  'text':       { type: 'color', value: '#ffffff' },
  'text-dim':   { type: 'color', value: '#a8b4c8' },
  'text-muted': { type: 'color', value: '#5c6a82' },
  // Accents
  'gold':       { type: 'color', value: '#f5c842' },
  'warm':       { type: 'color', value: '#ff6b35' },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const rgba = (hex, a) => ({ type: 'color', color: hex, opacity: a });

// Glassmorphism card: white tint + subtle border
const glassStyle = (opacity = 0.08, borderOpacity = 0.18) => ({
  fill:   rgba('#ffffff', opacity),
  stroke: { fill: rgba('#ffffff', borderOpacity), thickness: 1 },
});

const radialGlow = (color, cx = 0.5, cy = 0.5, w = 1, h = 1) => ({
  type: 'gradient', gradientType: 'radial', enabled: true,
  center: { x: cx, y: cy },
  size: { width: w, height: h },
  colors: [{ color: color + '40', position: 0 }, { color: color + '00', position: 1 }],
});

const linearGrad = (c1, c2, rotation = 180) => ({
  type: 'gradient', gradientType: 'linear', rotation,
  colors: [{ color: c1, position: 0 }, { color: c2, position: 1 }],
});

const t = (name, content, opts = {}) => ({
  type: 'text', name, content,
  fontSize:   opts.size    || 14,
  fontWeight: opts.weight  || '400',
  fill:       opts.fill    || '$text',
  textAlign:  opts.align   || 'left',
  ...(opts.ls         ? { letterSpacing: opts.ls }     : {}),
  ...(opts.lh         ? { lineHeight: opts.lh }        : {}),
  ...(opts.w          ? { width: opts.w, textGrowth: 'fixed-width' } : {}),
  ...(opts.x != null  ? { x: opts.x }                 : {}),
  ...(opts.y != null  ? { y: opts.y }                 : {}),
});

const el = (name, props) => ({ type: 'ellipse', name, ...props });

const fr = (name, props, children = []) => ({
  type: 'frame', name, ...props,
  ...(children.length ? { children } : {}),
});

// Star field — tiny white dots scattered across the sky
function starField(x, y, w, h, count = 28) {
  const stars = [];
  // Deterministic "random" using golden ratio spiral
  for (let i = 0; i < count; i++) {
    const px = Math.round(x + (i * 137.5 % w));
    const py = Math.round(y + (i * 97.3 % h));
    const sz = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5;
    const op = 0.4 + (i % 3) * 0.2;
    stars.push(el(`star${i}`, {
      x: px, y: py, width: sz, height: sz,
      fill: rgba('#ffffff', op),
    }));
  }
  return stars;
}

// Pill badge (category / reading time)
const pill = (name, label, fillColor = rgba('#ffffff', 0.12), textColor = '$text') =>
  fr(name, {
    height: 28, cornerRadius: 99,
    fill: fillColor,
    stroke: { fill: rgba('#ffffff', 0.2), thickness: 1 },
    layout: 'horizontal', justifyContent: 'center', alignItems: 'center', padding: [0, 14],
  }, [t('l', label, { size: 12, weight: '500', fill: textColor, ls: 0.3 })]);

// Glass reading card
const glassCard = (name, x, y, w, children, radius = 20) =>
  fr(name, {
    x, y, width: w,
    cornerRadius: radius,
    ...glassStyle(0.1, 0.2),
    layout: 'vertical', padding: 24, gap: 0,
  }, children);

// Divider line
const divider = () => fr('div', { width: 40, height: 2, cornerRadius: 1, fill: rgba('#ffffff', 0.25) });

// ── SCREEN 1 — HERO ────────────────────────────────────────────────────────
function screen1() {
  return fr('Hero — First Light', {
    x: 0, y: 0, width: SW, height: SH,
    fill: '$sky-deep',
  }, [
    // ── Sky photography simulation — gradient layers ──
    // Base deep navy
    fr('sky-base', { x: 0, y: 0, width: SW, height: SH,
      fill: linearGrad('#000814', '#0a0824', 180) }),

    // Aurora band — wide green sweep across mid-sky
    fr('aurora-green', { x: -60, y: 120, width: 500, height: 260, opacity: 0.85,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.5, y: 0.6 }, size: { width: 1, height: 0.8 },
        colors: [
          { color: '#00e5a040', position: 0 },
          { color: '#00e5a018', position: 0.4 },
          { color: '#00000000', position: 1 },
        ]} }),

    // Aurora band — purple/violet
    fr('aurora-purple', { x: 80, y: 80, width: 400, height: 320, opacity: 0.7,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.4, y: 0.5 }, size: { width: 0.9, height: 1 },
        colors: [
          { color: '#9c3fe850', position: 0 },
          { color: '#3b5bdb20', position: 0.5 },
          { color: '#00000000', position: 1 },
        ]} }),

    // Stars
    ...starField(0, 0, SW, 360, 35),

    // Distant mountain silhouette (dark frame at bottom)
    fr('mountains', { x: 0, y: SH - 200, width: SW, height: 200,
      fill: linearGrad('#020409', '#000000', 180) }),
    // Mountain peaks suggestion — irregular dark shapes
    fr('peak1', { x: -20, y: SH - 190, width: 220, height: 180, cornerRadius: 8,
      fill: '#010208' }),
    fr('peak2', { x: 160, y: SH - 160, width: 260, height: 160, cornerRadius: 8,
      fill: '#010208' }),
    fr('peak3', { x: 80, y: SH - 175, width: 180, height: 175, cornerRadius: 8,
      fill: '#010208' }),

    // Atmospheric ground glow (reflected aurora on snow)
    el('ground-glow', { x: 0, y: SH - 100, width: SW, height: 100, opacity: 0.4,
      fill: linearGrad('#00e5a018', '#00000000', 0) }),

    // ── Hero text overlay ──
    // Category + read time pills
    fr('meta-pills', { x: 24, y: 64, layout: 'horizontal', gap: 8 }, [
      pill('cat', 'PHOTOGRAPHY', rgba('#00e5a0', 0.15), '$aurora-g'),
      pill('rt', '8 min read', rgba('#ffffff', 0.08), '$text-dim'),
    ]),

    // Issue / vol
    t('issue', 'Vol. 04 · The Natural World', {
      size: 11, weight: '500', fill: '$text-muted', ls: 1.2,
      x: 24, y: 108,
    }),

    // Main headline — large, dramatic
    t('headline', 'First\nLight', {
      size: 88, weight: '800', fill: '$text', lh: 0.9, align: 'left',
      w: 320, x: 24, y: 132,
    }),

    // Subhead
    t('subhead', 'Chasing the Aurora Borealis\nacross the Lofoten Islands', {
      size: 18, weight: '300', fill: '$text-dim', lh: 1.4,
      w: 300, x: 24, y: 328,
    }),

    // ── Glass author/meta card at bottom ──
    glassCard('author-card', 20, SH - 152, 335, [
      fr('author-row', { layout: 'horizontal', gap: 14, alignItems: 'center', width: 287 }, [
        // Avatar circle
        fr('avatar', { width: 44, height: 44, cornerRadius: 22,
          fill: linearGrad('#00e5a0', '#3b5bdb', 135) },
          [t('ini', 'KM', { size: 14, weight: '700', align: 'center', fill: '#fff' })]),
        fr('author-info', { layout: 'vertical', gap: 3, width: 'fill_container' }, [
          t('name', 'Kira Matsuda', { size: 15, weight: '600' }),
          t('date', 'March 2026  ·  Northern Norway', { size: 12, fill: '$text-dim' }),
        ]),
        // Bookmark icon
        fr('bm', { width: 32, height: 32, cornerRadius: 8, fill: rgba('#ffffff', 0.1),
          layout: 'vertical', justifyContent: 'center', alignItems: 'center' },
          [t('ic', '♡', { size: 16, fill: '$text-dim', align: 'center' })]),
      ]),
    ]),

    // Scroll cue
    fr('scroll-cue', { x: SW / 2 - 14, y: SH - 28, layout: 'vertical', gap: 3, alignItems: 'center' }, [
      t('sc', '↓', { size: 14, fill: rgba('#ffffff', 0.3).color, align: 'center' }),
    ]),
  ]);
}

// ── SCREEN 2 — OPENING ─────────────────────────────────────────────────────
function screen2() {
  const sx = SW + GAP;
  return fr('Opening — Into the Dark', {
    x: sx, y: 0, width: SW, height: SH,
    fill: '$sky-deep',
  }, [
    // Continuation of sky at top — thin strip
    fr('sky-top', { x: 0, y: 0, width: SW, height: 200,
      fill: linearGrad('#050b1a', '#04060f', 180) }),

    // Aurora hint at top
    fr('aurora-top', { x: -40, y: -20, width: 460, height: 250, opacity: 0.5,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.5, y: 0.3 }, size: { width: 1, height: 0.8 },
        colors: [{ color: '#00e5a030', position: 0 }, { color: '#00000000', position: 1 }] } }),

    ...starField(0, 0, SW, 180, 16),

    // ── Opening glass reading card ──
    glassCard('opening', 20, 170, 335, [
      // Drop cap style opening
      fr('dropcap-row', { layout: 'horizontal', gap: 0, width: 287, alignItems: 'flex-start' }, [
        t('dropcap', 'T', {
          size: 72, weight: '800', fill: '$aurora-g', lh: 0.85, align: 'left',
        }),
        t('opening-p', 'he light came without warning. One moment the sky above Flakstad was a cold, indifferent black — the next, a curtain of green fire rippled across the horizon.', {
          size: 15, weight: '400', fill: '$text', lh: 1.7, w: 230,
        }),
      ]),
    ], 24),

    // Second glass card — continuation text
    glassCard('para-2', 20, 430, 335, [
      t('p2', 'I had been waiting three nights for this moment. Three nights of frozen fingers and thermos coffee, of sleeping in a rented Volvo with fogged windows, of waking at 2am to apps that promised displays which never came.', {
        size: 15, weight: '400', fill: '$text-dim', lh: 1.75, w: 287,
      }),
    ], 16),

    // Floating stat pills
    fr('stats', { x: 20, y: SH - 100, layout: 'horizontal', gap: 10 }, [
      fr('stat1', { height: 52, cornerRadius: 14, fill: rgba('#00e5a0', 0.1),
        stroke: { fill: rgba('#00e5a0', 0.25), thickness: 1 },
        layout: 'vertical', justifyContent: 'center', alignItems: 'center', padding: [0, 18], gap: 2 }, [
        t('v', '-28°C', { size: 18, weight: '700', fill: '$aurora-c', align: 'center' }),
        t('l', 'Temperature', { size: 10, fill: '$text-muted', align: 'center', ls: 0.3 }),
      ]),
      fr('stat2', { height: 52, cornerRadius: 14, fill: rgba('#9c3fe8', 0.1),
        stroke: { fill: rgba('#9c3fe8', 0.25), thickness: 1 },
        layout: 'vertical', justifyContent: 'center', alignItems: 'center', padding: [0, 18], gap: 2 }, [
        t('v', 'KP-8', { size: 18, weight: '700', fill: '$aurora-p', align: 'center' }),
        t('l', 'Activity', { size: 10, fill: '$text-muted', align: 'center', ls: 0.3 }),
      ]),
      fr('stat3', { height: 52, cornerRadius: 14, fill: rgba('#ffffff', 0.06),
        stroke: { fill: rgba('#ffffff', 0.12), thickness: 1 },
        layout: 'vertical', justifyContent: 'center', alignItems: 'center', padding: [0, 18], gap: 2 }, [
        t('v', '02:17', { size: 18, weight: '700', fill: '$text', align: 'center' }),
        t('l', 'Captured', { size: 10, fill: '$text-muted', align: 'center', ls: 0.3 }),
      ]),
    ]),
  ]);
}

// ── SCREEN 3 — IMMERSIVE PHOTO ─────────────────────────────────────────────
function screen3() {
  const sx = 2 * (SW + GAP);
  return fr('Full Frame — The Green Curtain', {
    x: sx, y: 0, width: SW, height: SH,
    fill: '$sky-deep',
  }, [
    // Full bleed photo simulation — green aurora dominant
    fr('photo-bg', { x: 0, y: 0, width: SW, height: SH,
      fill: linearGrad('#000c1a', '#00120f', 190) }),

    // Strong green aurora — main subject
    fr('aurora-main', { x: -80, y: 0, width: 560, height: SH * 0.7, opacity: 0.9,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.55, y: 0.35 }, size: { width: 1, height: 1 },
        colors: [
          { color: '#00e5a060', position: 0 },
          { color: '#00a86830', position: 0.45 },
          { color: '#00000000', position: 1 },
        ]} }),

    // Secondary blue/violet arc
    fr('aurora-arc', { x: 0, y: 80, width: SW, height: 500, opacity: 0.65,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.3, y: 0.2 }, size: { width: 0.8, height: 0.8 },
        colors: [
          { color: '#3b5bdb50', position: 0 },
          { color: '#9c3fe828', position: 0.5 },
          { color: '#00000000', position: 1 },
        ]} }),

    // Atmospheric streaks of light
    fr('streak1', { x: 40, y: 100, width: 8, height: 280, cornerRadius: 4, opacity: 0.3,
      fill: linearGrad('#00e5a0', '#00000000', 180) }),
    fr('streak2', { x: 180, y: 60, width: 5, height: 200, cornerRadius: 3, opacity: 0.25,
      fill: linearGrad('#9c3fe8', '#00000000', 180) }),
    fr('streak3', { x: 290, y: 130, width: 7, height: 240, cornerRadius: 3, opacity: 0.2,
      fill: linearGrad('#3b5bdb', '#00000000', 180) }),

    ...starField(0, 0, SW, 300, 30),

    // Landscape dark silhouette
    fr('land', { x: 0, y: SH - 180, width: SW, height: 180,
      fill: linearGrad('#000000', '#010203', 180) }),
    fr('fjord1', { x: -30, y: SH - 170, width: 280, height: 160, cornerRadius: 12, fill: '#000103' }),
    fr('fjord2', { x: 200, y: SH - 155, width: 250, height: 145, cornerRadius: 12, fill: '#000204' }),

    // Reflected aurora on water/snow
    fr('reflection', { x: 0, y: SH - 80, width: SW, height: 80, opacity: 0.25,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.5, y: 0 }, size: { width: 0.8, height: 2 },
        colors: [{ color: '#00e5a060', position: 0 }, { color: '#00000000', position: 1 }] } }),

    // Floating top label
    fr('top-label', { x: 24, y: 28, layout: 'horizontal', gap: 8, alignItems: 'center' }, [
      fr('dot', { width: 6, height: 6, cornerRadius: 3, fill: '$aurora-g' }),
      t('l', 'Unprocessed · 24mm f/2.8 · ISO 3200', { size: 11, fill: rgba('#ffffff', 0.5).color, ls: 0.3 }),
    ]),

    // Glass caption at bottom
    fr('caption', {
      x: 20, y: SH - 108, width: 335,
      cornerRadius: 16,
      fill: rgba('#000000', 0.55),
      stroke: { fill: rgba('#00e5a0', 0.3), thickness: 1 },
      layout: 'vertical', padding: 18, gap: 6,
    }, [
      t('cap-title', '"The green curtain"', { size: 17, weight: '700', fill: '$aurora-g' }),
      t('cap-body', 'Flakstad Beach, 02:17 AM. The display lasted eleven minutes.', {
        size: 13, fill: '$text-dim', lh: 1.5, w: 299 }),
    ]),
  ]);
}

// ── SCREEN 4 — BODY + PULL QUOTE ──────────────────────────────────────────
function screen4() {
  const sx = 3 * (SW + GAP);
  return fr('Body — What the Camera Misses', {
    x: sx, y: 0, width: SW, height: SH,
    fill: '$sky-deep',
  }, [
    fr('bg', { x: 0, y: 0, width: SW, height: SH,
      fill: linearGrad('#040810', '#060a14', 180) }),

    // Subtle aurora tint at top
    fr('top-glow', { x: 0, y: 0, width: SW, height: 300, opacity: 0.3,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.5, y: 0 }, size: { width: 1, height: 1 },
        colors: [{ color: '#9c3fe830', position: 0 }, { color: '#00000000', position: 1 }] } }),

    // Section label
    fr('sec-label', { x: 24, y: 32, layout: 'horizontal', gap: 10, alignItems: 'center' }, [
      fr('line', { width: 24, height: 2, cornerRadius: 1, fill: '$aurora-g' }),
      t('l', 'CHAPTER TWO', { size: 11, weight: '600', fill: '$aurora-g', ls: 1.5 }),
    ]),

    // Body text card
    glassCard('body', 20, 64, 335, [
      t('h2', 'What the camera misses', { size: 20, weight: '700', lh: 1.2, w: 287 }),
      fr('spacer', { width: 287, height: 14 }),
      t('p1', 'No photograph can capture the sound of silence at 2am on an Arctic beach. The crunch of compacted snow. The faint creak of ice sheets adjusting to temperature. Or the way the aurora moves — not as a static band of colour, but as something alive, breathing.', {
        size: 15, weight: '400', fill: '$text-dim', lh: 1.75, w: 287 }),
    ], 20),

    // ── Pull quote — the centrepiece ──
    fr('pull-quote', {
      x: 16, y: 290, width: SW - 32,
      cornerRadius: 20,
      fill: [
        rgba('#ffffff', 0.06),
        { type: 'gradient', gradientType: 'radial',
          center: { x: 0.1, y: 0.1 }, size: { width: 1, height: 1 },
          colors: [{ color: '#00e5a010', position: 0 }, { color: '#00000000', position: 1 }] },
      ],
      stroke: { fill: rgba('#00e5a0', 0.3), thickness: 1 },
      layout: 'vertical', padding: 28, gap: 16,
    }, [
      t('qmark', '❝', { size: 32, fill: '$aurora-g', align: 'left' }),
      t('quote', 'The aurora doesn\'t perform for the camera. It performs for whoever is cold enough and stubborn enough to still be standing in the dark.', {
        size: 19, weight: '500', fill: '$text', lh: 1.55, w: 287,
      }),
      fr('attr-row', { layout: 'horizontal', gap: 10, alignItems: 'center', width: 287 }, [
        fr('attr-line', { width: 20, height: 1, fill: rgba('#ffffff', 0.3) }),
        t('attr', 'Kira Matsuda, Field Journal', { size: 12, fill: '$text-muted', ls: 0.2 }),
      ]),
    ]),

    // Continued body
    glassCard('body-2', 20, 544, 335, [
      t('p2', 'I shot 847 frames that night. Maybe twelve are worth keeping. That ratio is not failure — it\'s the cost of being present for something unrepeatable.', {
        size: 15, weight: '400', fill: '$text-dim', lh: 1.75, w: 287 }),
    ], 16),
  ]);
}

// ── SCREEN 5 — PHOTO MOSAIC ────────────────────────────────────────────────
function screen5() {
  const sx = 4 * (SW + GAP);

  // Each tile: a simulated photo with gradient + glass label
  const tile = (name, x, y, w, h, gradColors, rotation, label) => fr(name, {
    x, y, width: w, height: h, cornerRadius: 16,
    fill: { type: 'gradient', gradientType: 'linear', rotation,
      colors: gradColors },
  }, [
    // Subtle inner top reflection
    fr('ref', { x: 0, y: 0, width: w, height: h * 0.4, cornerRadius: 16,
      fill: rgba('#ffffff', 0.04) }),
    // Glass label
    fr('lbl', {
      x: 10, y: h - 44, width: w - 20, height: 36,
      cornerRadius: 10,
      fill: rgba('#000000', 0.55),
      stroke: { fill: rgba('#ffffff', 0.1), thickness: 1 },
      layout: 'horizontal', padding: [0, 12], alignItems: 'center',
    }, [
      t('l', label, { size: 11, fill: rgba('#ffffff', 0.8).color, ls: 0.2 }),
    ]),
  ]);

  return fr('Mosaic — Four Moments', {
    x: sx, y: 0, width: SW, height: SH,
    fill: '$sky-deep',
  }, [
    fr('bg', { x: 0, y: 0, width: SW, height: SH,
      fill: linearGrad('#03060f', '#040810', 180) }),

    // Section header
    fr('sec-head', { x: 20, y: 24, layout: 'vertical', gap: 4, width: 335 }, [
      t('title', 'Four Moments', { size: 26, weight: '700' }),
      t('sub', 'The night in fragments', { size: 14, fill: '$text-dim' }),
    ]),

    // Mosaic grid — 2 columns, uneven heights for visual interest
    // Left column: tall top + short bottom
    tile('photo-1', 20, 88, 161, 230,
      [{ color: '#00e5a0', position: 0 }, { color: '#005c42', position: 0.5 }, { color: '#000a08', position: 1 }],
      160, '01:48 AM · Wide'),

    tile('photo-2', 20, 330, 161, 164,
      [{ color: '#1a0a3d', position: 0 }, { color: '#9c3fe8', position: 0.4 }, { color: '#3b0a7a', position: 1 }],
      200, 'Purple band'),

    // Right column: short top + tall bottom
    tile('photo-3', 193, 88, 162, 164,
      [{ color: '#001833', position: 0 }, { color: '#3b5bdb', position: 0.5 }, { color: '#0a1a40', position: 1 }],
      150, 'Fjord reflection'),

    tile('photo-4', 193, 264, 162, 230,
      [{ color: '#0a0014', position: 0 }, { color: '#00a8ff', position: 0.3 }, { color: '#00e5a0', position: 0.7 }, { color: '#000c10', position: 1 }],
      170, 'Corona · 03:22 AM'),

    // Wide photo at bottom
    tile('photo-5', 20, 506, 335, 192,
      [{ color: '#050b18', position: 0 }, { color: '#0a2a4a', position: 0.3 }, { color: '#00e5a020', position: 0.7 }, { color: '#000c08', position: 1 }],
      165, 'The whole sky — 10mm f/2.0'),

    // Bottom caption
    fr('bottom-note', { x: 20, y: SH - 32, layout: 'horizontal', gap: 6, alignItems: 'center' }, [
      t('l', 'All images unedited RAW → JPEG. No compositing.', { size: 11, fill: '$text-muted' }),
    ]),
  ]);
}

// ── SCREEN 6 — AUTHOR + CLOSING ───────────────────────────────────────────
function screen6() {
  const sx = 5 * (SW + GAP);
  return fr('Closing — Still Dark', {
    x: sx, y: 0, width: SW, height: SH,
    fill: '$sky-deep',
  }, [
    fr('bg', { x: 0, y: 0, width: SW, height: SH,
      fill: linearGrad('#04060f', '#070a16', 180) }),

    // Subtle aurora at top
    fr('glow-top', { x: 0, y: 0, width: SW, height: 260, opacity: 0.35,
      fill: { type: 'gradient', gradientType: 'radial',
        center: { x: 0.6, y: 0 }, size: { width: 1, height: 1 },
        colors: [{ color: '#00e5a035', position: 0 }, { color: '#00000000', position: 1 }] } }),

    ...starField(0, 0, SW, 240, 20),

    // Closing text card
    glassCard('closing', 20, 40, 335, [
      fr('end-tag', { layout: 'horizontal', gap: 8, width: 287, alignItems: 'center' }, [
        fr('endline', { width: 20, height: 2, cornerRadius: 1, fill: '$aurora-g' }),
        t('fin', 'CLOSING', { size: 11, weight: '600', fill: '$aurora-g', ls: 1.5 }),
      ]),
      fr('sp1', { width: 287, height: 16 }),
      t('c-title', 'It\'s still dark\nwhen I pack up.', { size: 24, weight: '700', lh: 1.2, w: 287 }),
      fr('sp2', { width: 287, height: 12 }),
      t('c-body', 'The aurora has gone. The sky has faded to the grey-blue of approaching dawn. My memory card holds 4GB of what I came here for. I drive back to the cabin without turning the radio on.\n\nSome things don\'t need a soundtrack.', {
        size: 15, fill: '$text-dim', lh: 1.75, w: 287 }),
    ], 20),

    // ── Author card ──
    fr('author-block', {
      x: 20, y: 382, width: 335,
      cornerRadius: 20,
      fill: rgba('#ffffff', 0.06),
      stroke: { fill: rgba('#ffffff', 0.12), thickness: 1 },
      layout: 'vertical', padding: 20, gap: 14,
    }, [
      fr('top-row', { layout: 'horizontal', gap: 14, alignItems: 'center', width: 295 }, [
        fr('avatar', { width: 56, height: 56, cornerRadius: 28,
          fill: linearGrad('#00e5a0', '#3b5bdb', 135) },
          [t('ini', 'KM', { size: 16, weight: '800', align: 'center', fill: '#fff' })]),
        fr('info', { layout: 'vertical', gap: 4, width: 'fill_container' }, [
          t('name', 'Kira Matsuda', { size: 16, weight: '700' }),
          t('bio-line', 'Documentary photographer · Tokyo', { size: 13, fill: '$text-dim' }),
        ]),
        fr('follow-btn', {
          height: 34, cornerRadius: 99,
          fill: rgba('#00e5a0', 0.15),
          stroke: { fill: rgba('#00e5a0', 0.35), thickness: 1 },
          layout: 'horizontal', justifyContent: 'center', alignItems: 'center', padding: [0, 16],
        }, [t('fl', 'Follow', { size: 13, weight: '600', fill: '$aurora-g' })]),
      ]),
      divider(),
      t('bio', 'Kira has spent 14 winters in the Arctic circle photographing natural light phenomena. Her work has appeared in National Geographic, Monocle, and Wired.', {
        size: 13, fill: '$text-muted', lh: 1.6, w: 295 }),
    ]),

    // ── Next article card ──
    fr('next-card', {
      x: 20, y: 594, width: 335, height: 132,
      cornerRadius: 16,
      fill: [
        rgba('#ffffff', 0.05),
        { type: 'gradient', gradientType: 'linear', rotation: 135,
          colors: [{ color: '#9c3fe810', position: 0 }, { color: '#3b5bdb08', position: 1 }] },
      ],
      stroke: { fill: rgba('#ffffff', 0.1), thickness: 1 },
      layout: 'vertical', padding: 18, gap: 8,
    }, [
      fr('nx-top', { layout: 'horizontal', gap: 6, alignItems: 'center', width: 299 }, [
        t('nx-tag', 'NEXT STORY', { size: 10, weight: '600', fill: '$aurora-p', ls: 1.2 }),
      ]),
      t('nx-title', 'Into the Blue Hour:\nPortrait photography in Okinawa', {
        size: 17, weight: '700', lh: 1.3, w: 299 }),
      fr('nx-meta', { layout: 'horizontal', gap: 12, alignItems: 'center', width: 299 }, [
        t('nx-author', 'Jun Okamoto', { size: 12, fill: '$text-muted' }),
        t('nx-rt', '·  6 min', { size: 12, fill: '$text-muted' }),
      ]),
    ]),

    // Progress dots
    fr('dots', { x: SW / 2 - 38, y: SH - 32, layout: 'horizontal', gap: 6 }, [
      ...[1,2,3,4,5].map(n => fr(`d${n}`, { width: 6, height: 6, cornerRadius: 3, fill: rgba('#ffffff', 0.15) })),
      fr('d6', { width: 18, height: 6, cornerRadius: 3, fill: '$aurora-g' }),
    ]),
  ]);
}

// ── Assemble & write ────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  variables,
  children: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
    screen6(),
  ],
};

const json = JSON.stringify(doc, null, 2);
fs.writeFileSync('blog-glass.pen', json);
console.log(`✅ Written blog-glass.pen (${(json.length / 1024).toFixed(1)}KB)`);
console.log(`   ${doc.children.length} screens · ${Object.keys(variables).length} variables`);
