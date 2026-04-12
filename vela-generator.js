/**
 * VELA — Premium AI Concierge
 * Dark luxury aesthetic inspired by atlascard.com (seen on godly.website)
 * + Linear's AI agent workflow visualization (darkmodedesign.com)
 *
 * Deep midnight navy palette with champagne gold accents.
 * 6 screens: Home · Discover · AI Activity · Booking · Membership · Preferences
 */

const fs = require('fs');

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  bg:       '#07091A',   // deep midnight
  bg2:      '#0C0F26',   // slightly lifted bg
  surface:  '#111630',   // card surface
  surface2: '#181E3A',   // elevated surface
  border:   '#242B4D',   // subtle border
  gold:     '#C9A96E',   // champagne gold — Atlas Card inspired
  goldDim:  '#8B6E42',   // dimmed gold
  goldHi:   '#E5C98A',   // highlight gold
  blue:     '#7C9ECC',   // steel blue accent
  blueDim:  '#3A5880',   // dimmed blue
  teal:     '#5BBFB5',   // teal for status
  rose:     '#D46D7A',   // rose for alerts
  fg:       '#E8E2D6',   // warm off-white
  fg2:      '#A89E8E',   // muted foreground
  fg3:      '#6B6057',   // very muted
  white:    '#FFFFFF',
  overlay:  'rgba(7,9,26,0.85)',
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
let idCounter = 1;
const uid = (prefix = 'el') => `${prefix}_${idCounter++}`;

function rect(x, y, w, h, fill, extra = {}) {
  return { type: 'RECT', id: uid('r'), x, y, width: w, height: h, fill, ...extra };
}

function text(x, y, content, size, fill, extra = {}) {
  return {
    type: 'TEXT', id: uid('t'), x, y, content,
    fontSize: size, fill,
    fontFamily: extra.mono ? 'JetBrains Mono' : (size >= 28 ? 'Instrument Serif' : 'Inter'),
    fontWeight: extra.bold ? 700 : (extra.medium ? 500 : 400),
    ...extra,
  };
}

function line(x1, y1, x2, y2, stroke = C.border, extra = {}) {
  return { type: 'LINE', id: uid('l'), x1, y1, x2, y2, stroke, strokeWidth: 1, ...extra };
}

function circle(cx, cy, r, fill, extra = {}) {
  return { type: 'ELLIPSE', id: uid('c'), cx, cy, rx: r, ry: r, fill, ...extra };
}

function group(children, extra = {}) {
  return { type: 'GROUP', id: uid('g'), children, ...extra };
}

// Tag pill
function pill(x, y, label, bg, fg, w = 80) {
  return group([
    rect(x, y, w, 22, bg, { rx: 11 }),
    text(x + w/2, y + 11, label, 9, fg, { textAnchor: 'middle', dominantBaseline: 'central', bold: false }),
  ]);
}

// ─── STATUS BAR ─────────────────────────────────────────────────────────────
function statusBar(y = 0) {
  return group([
    rect(0, y, 390, 44, 'transparent'),
    text(20, y + 22, '9:41', 14, C.fg, { bold: true, dominantBaseline: 'central' }),
    text(370, y + 22, '◉ ▪▪▪ ⬡', 11, C.fg2, { textAnchor: 'end', dominantBaseline: 'central' }),
  ]);
}

// ─── NAV BAR ────────────────────────────────────────────────────────────────
function navBar(active = 0) {
  const items = [
    { icon: '⌂', label: 'Home' },
    { icon: '◈', label: 'Discover' },
    { icon: '◎', label: 'Agent' },
    { icon: '♦', label: 'Cards' },
    { icon: '◉', label: 'Profile' },
  ];
  const y = 780;
  const els = [
    rect(0, y, 390, 90, C.bg2, { rx: 0 }),
    line(0, y, 390, y, C.border),
  ];
  items.forEach((item, i) => {
    const x = 19 + i * 71;
    const isActive = i === active;
    if (isActive) {
      els.push(rect(x - 4, y + 12, 40, 40, C.surface2, { rx: 12 }));
    }
    els.push(text(x + 16, y + 32, item.icon, 20, isActive ? C.gold : C.fg3, { textAnchor: 'middle', dominantBaseline: 'central' }));
    els.push(text(x + 16, y + 56, item.label, 9, isActive ? C.gold : C.fg3, { textAnchor: 'middle' }));
  });
  return group(els);
}

// ─── SCREEN 1: HOME / DASHBOARD ─────────────────────────────────────────────
function homeScreen() {
  const elements = [
    // Background
    rect(0, 0, 390, 870, C.bg),

    // Top nav
    statusBar(0),
    group([
      text(20, 62, 'Good evening, Alex', 14, C.fg2),
      text(20, 86, 'Your concierge is active', 24, C.fg, { bold: true }),
      // Avatar
      circle(358, 74, 22, C.surface2),
      text(358, 74, 'A', 14, C.gold, { textAnchor: 'middle', dominantBaseline: 'central', bold: true }),
    ]),

    // AI Status Pill — Linear-inspired
    group([
      rect(20, 114, 350, 54, C.surface, { rx: 16 }),
      circle(46, 141, 7, C.teal),
      // Pulse rings
      circle(46, 141, 11, 'rgba(91,191,181,0.2)'),
      circle(46, 141, 15, 'rgba(91,191,181,0.08)'),
      text(64, 135, 'Vela is working', 12, C.fg, { bold: true }),
      text(64, 151, 'Searching Nobu Tokyo for Friday 8pm · 2 guests', 10, C.fg2),
      text(352, 141, '→', 14, C.gold, { textAnchor: 'end', dominantBaseline: 'central' }),
    ]),

    // Section: Upcoming
    text(20, 192, 'UPCOMING', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    // Upcoming trip card
    group([
      rect(20, 208, 350, 130, C.surface, { rx: 20 }),
      // Gradient accent strip
      rect(20, 208, 8, 130, C.gold, { rx: 4 }),
      text(44, 232, 'Tokyo', 26, C.fg, { bold: true }),
      text(44, 258, 'Mar 28 – Apr 4 · 7 nights', 12, C.fg2),
      // Progress bar
      rect(44, 280, 240, 3, C.border, { rx: 2 }),
      rect(44, 280, 140, 3, C.gold, { rx: 2 }),
      text(44, 300, 'Pre-trip prep', 10, C.fg2),
      text(284, 300, '58%', 10, C.goldDim, { textAnchor: 'end' }),
      // Chips
      pill(44, 310, 'Flights ✓', 'rgba(91,191,181,0.15)', C.teal, 70),
      pill(122, 310, 'Hotel ✓', 'rgba(91,191,181,0.15)', C.teal, 65),
      pill(195, 310, 'Dining', 'rgba(201,169,110,0.15)', C.gold, 55),
    ]),

    // Quick actions row
    text(20, 362, 'QUICK ACTIONS', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    // 3 quick action cards
    ...[
      { icon: '✦', label: 'Reserve\nTable', x: 20, accent: C.gold },
      { icon: '◈', label: 'Find\nHotel', x: 140, accent: C.blue },
      { icon: '⟳', label: 'Car\nService', x: 260, accent: C.teal },
    ].flatMap(({ icon, label, x, accent }) => [
      rect(x, 378, 106, 90, C.surface, { rx: 16 }),
      rect(x + 12, 390, 30, 30, `${accent}22`, { rx: 10 }),
      text(x + 27, 405, icon, 16, accent, { textAnchor: 'middle', dominantBaseline: 'central' }),
      ...label.split('\n').map((line, li) =>
        text(x + 53, 434 + li * 14, line, 11, C.fg, { textAnchor: 'middle' })
      ),
    ]),

    // Recent activity
    text(20, 492, 'RECENT ACTIVITY', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    ...([
      { icon: '✦', title: 'Nobu Tokyo reserved', sub: 'Mar 28, 8:00 PM · 2 guests', tag: 'Done', tagCol: C.teal },
      { icon: '◈', title: 'Park Hyatt confirmed', sub: 'Mar 28–Apr 4 · 1 king suite', tag: 'Conf.', tagCol: C.teal },
      { icon: '↗', title: 'JL 007 NRT departure', sub: 'Mar 28, 11:40 AM · Business', tag: 'Ready', tagCol: C.gold },
    ].flatMap(({ icon, title, sub, tag, tagCol }, i) => {
      const y = 510 + i * 64;
      return [
        rect(20, y, 350, 56, i % 2 === 0 ? C.surface : 'transparent', { rx: 14 }),
        rect(28, y + 13, 30, 30, `${C.surface2}`, { rx: 10 }),
        text(43, y + 28, icon, 12, C.gold, { textAnchor: 'middle', dominantBaseline: 'central' }),
        text(68, y + 20, title, 12, C.fg, { bold: true }),
        text(68, y + 36, sub, 10, C.fg2),
        pill(300, y + 17, tag, `${tagCol}22`, tagCol, 46),
      ];
    })),

    navBar(0),
  ];
  return elements;
}

// ─── SCREEN 2: DISCOVER ─────────────────────────────────────────────────────
function discoverScreen() {
  return [
    rect(0, 0, 390, 870, C.bg),
    statusBar(0),

    text(20, 62, 'Discover', 28, C.fg, { bold: true }),
    text(20, 92, 'Curated for you in Tokyo', 14, C.fg2),

    // Search bar
    group([
      rect(20, 114, 350, 44, C.surface, { rx: 14 }),
      text(46, 136, '⌕  Hotels, restaurants, experiences...', 13, C.fg3, { dominantBaseline: 'central' }),
    ]),

    // Filter pills
    ...(['All', 'Dining', 'Stays', 'Events', 'Spa'].map((label, i) => {
      const isActive = i === 0;
      const x = 20 + [0, 32, 84, 130, 182][i];
      const w = [40, 64, 56, 70, 40][i];
      return group([
        rect(x, 172, w, 28, isActive ? C.gold : C.surface, { rx: 14 }),
        text(x + w / 2, 186, label, 11, isActive ? C.bg : C.fg2, { textAnchor: 'middle', dominantBaseline: 'central' }),
      ]);
    })),

    // Large hero card
    group([
      rect(20, 214, 350, 190, C.surface, { rx: 20 }),
      rect(20, 214, 350, 190, 'rgba(7,9,26,0)', { rx: 20 }),  // placeholder for image overlay
      // Image placeholder gradient
      rect(20, 214, 350, 190, `linear-gradient(135deg, ${C.surface2} 0%, #1a1040 100%)`, { rx: 20 }),
      // Stars decoration
      ...[
        [60, 240], [120, 255], [200, 235], [280, 250], [340, 238],
        [80, 275], [170, 260], [310, 270], [240, 280],
      ].map(([sx, sy]) => circle(sx, sy, 1.5, C.fg3)),
      text(44, 312, 'Nobu Tokyo', 22, C.fg, { bold: true }),
      text(44, 334, 'Toranomon · Japanese Fusion', 12, C.fg2),
      text(44, 356, '★ 4.9', 12, C.gold),
      text(110, 356, '· Michelin ★★', 12, C.fg2),
      pill(260, 346, 'Reserved', 'rgba(91,191,181,0.2)', C.teal, 78),
    ]),

    // Two-column bento grid — Atlas Card inspired
    text(20, 420, 'RECOMMENDED STAYS', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    ...([
      { title: 'Park Hyatt Tokyo', sub: 'Shinjuku · 52F', price: '¥98,000/n', w: 212, x: 20, h: 144 },
      { title: 'Trunk Hotel', sub: 'Shibuya · Boutique', price: '¥45,000/n', w: 124, x: 244, h: 144 },
      { title: 'The Tokyo EDITION', sub: 'Toranomon · Skyline', price: '¥72,000/n', w: 168, x: 20, h: 110 },
      { title: 'Aman Tokyo', sub: 'Otemachi · Luxury', price: '¥280,000/n', w: 164, x: 202, h: 110 },
    ].flatMap(({ title, sub, price, w, x, h }, i) => {
      const y = 436 + (i < 2 ? 0 : 152);
      return [
        rect(x, y, w, h, C.surface, { rx: 16 }),
        rect(x, y, w, 50, C.surface2, { rx: 16 }),  // image placeholder header
        // dots
        ...[0.2, 0.5, 0.8].map(t => circle(x + w * t, y + 25, 2, C.fg3)),
        text(x + 12, y + 68, title, 12, C.fg, { bold: true }),
        text(x + 12, y + 84, sub, 10, C.fg2),
        text(x + 12, y + h - 18, price, 10, C.gold),
      ];
    })),

    navBar(1),
  ];
}

// ─── SCREEN 3: AI AGENT ACTIVITY (Linear-inspired) ──────────────────────────
function agentScreen() {
  return [
    rect(0, 0, 390, 870, C.bg),
    statusBar(0),

    text(20, 62, 'Vela Agent', 28, C.fg, { bold: true }),
    text(20, 92, 'Working on 3 tasks', 14, C.teal),

    // Active agent card
    group([
      rect(20, 114, 350, 110, C.surface, { rx: 20 }),
      // Pulsing indicator
      circle(44, 155, 10, 'rgba(91,191,181,0.15)'),
      circle(44, 155, 7, 'rgba(91,191,181,0.25)'),
      circle(44, 155, 4, C.teal),
      text(64, 142, 'Searching for Friday table', 14, C.fg, { bold: true }),
      text(64, 160, 'Nobu Tokyo · 2 guests · 8pm', 12, C.fg2),
      text(64, 180, 'Checking 6 alternative venues…', 11, C.blue),
      // Progress
      rect(64, 198, 250, 3, C.border, { rx: 2 }),
      rect(64, 198, 170, 3, C.teal, { rx: 2 }),
      text(318, 196, '68%', 9, C.teal, { textAnchor: 'end' }),
    ]),

    // Agent log — Linear code log style
    text(20, 244, 'AGENT LOG', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    group([
      rect(20, 260, 350, 320, C.surface, { rx: 20 }),
      // Terminal-style log lines
      ...([
        { time: '21:04', text: '→ search("nobu tokyo", date="mar28", guests=2)', col: C.fg2, indent: 0 },
        { time: '21:04', text: '  found 1 result · capacity: full', col: C.rose, indent: 12 },
        { time: '21:04', text: '→ expand_search(radius=2km, cuisine="japanese")', col: C.fg2, indent: 0 },
        { time: '21:04', text: '  found 14 venues matching criteria', col: C.teal, indent: 12 },
        { time: '21:05', text: '→ filter(michelin_star>=1, available=true)', col: C.fg2, indent: 0 },
        { time: '21:05', text: '  6 venues qualify · scoring by pref…', col: C.gold, indent: 12 },
        { time: '21:05', text: '→ rank_by_preferences(user_id="alex")', col: C.fg2, indent: 0 },
        { time: '21:05', text: '  Sushi Saito → 97 · Ishikawa → 94', col: C.blue, indent: 12 },
        { time: null, text: '▌', col: C.fg, indent: 0 },
      ].map(({ time, text: t, col, indent }, i) => {
        const y = 282 + i * 32;
        return group([
          time ? text(30, y, time, 9, C.fg3, { mono: true }) : null,
          text(70 + indent, y, t, 10, col, { mono: true }),
        ].filter(Boolean));
      })),
    ]),

    // Completed tasks
    text(20, 604, 'COMPLETED', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    ...([
      { title: 'Park Hyatt suite confirmed', sub: 'Booked at preferred rate · ¥98,000/n', icon: '✓' },
      { title: 'JL007 business class', sub: 'Seat 3A · Departs 11:40 · NRT', icon: '✓' },
      { title: 'Airport transfer', sub: 'Narita → Shinjuku · 60-90 min', icon: '✓' },
    ].flatMap(({ title, sub, icon }, i) => {
      const y = 622 + i * 58;
      return [
        rect(20, y, 350, 50, 'transparent', { rx: 14 }),
        line(20, y + 50, 370, y + 50, C.border),
        rect(28, y + 10, 30, 30, 'rgba(91,191,181,0.12)', { rx: 10 }),
        text(43, y + 25, icon, 12, C.teal, { textAnchor: 'middle', dominantBaseline: 'central' }),
        text(68, y + 18, title, 12, C.fg, { bold: true }),
        text(68, y + 34, sub, 10, C.fg2),
      ];
    })),

    navBar(2),
  ];
}

// ─── SCREEN 4: BOOKING DETAIL ────────────────────────────────────────────────
function bookingScreen() {
  return [
    rect(0, 0, 390, 870, C.bg),
    statusBar(0),

    // Back nav
    text(20, 62, '← Back', 13, C.fg2),
    text(195, 62, 'Booking Detail', 15, C.fg, { textAnchor: 'middle', bold: true }),

    // Hero card — Atlas card inspired luxury treatment
    group([
      rect(20, 86, 350, 200, C.surface2, { rx: 24 }),
      // Star field background
      ...[
        [50, 110], [100, 100], [160, 120], [240, 95], [300, 115],
        [80, 160], [200, 145], [340, 130], [120, 175], [280, 165],
      ].map(([sx, sy]) => circle(sx, sy, 1.5, C.fg3)),
      // Gold accent line
      rect(20, 86, 350, 4, C.gold, { rx: 2 }),
      text(44, 122, 'Park Hyatt Tokyo', 22, C.fg, { bold: true }),
      text(44, 148, 'Shinjuku · 52nd Floor · King Suite', 13, C.fg2),
      // Rating
      text(44, 172, '★★★★★', 14, C.gold),
      text(130, 172, 'Forbes Five-Star', 11, C.fg2),
      // Dates
      text(44, 200, 'Mar 28', 16, C.fg, { bold: true }),
      text(105, 200, '→', 16, C.fg2),
      text(124, 200, 'Apr 4', 16, C.fg, { bold: true }),
      text(44, 220, '7 nights · Suite 5204', 11, C.fg2),
      text(308, 214, '¥686,000', 14, C.gold, { textAnchor: 'end', bold: true }),
      text(308, 230, 'Points rate', 9, C.fg3, { textAnchor: 'end' }),
    ]),

    // Vela handling strip
    group([
      rect(20, 298, 350, 44, 'rgba(201,169,110,0.1)', { rx: 14 }),
      rect(20, 298, 4, 44, C.gold, { rx: 2 }),
      text(36, 320, '✦ Vela managed this booking · Saved ¥124,000 vs public rate', 11, C.gold, { dominantBaseline: 'central' }),
    ]),

    // Details section
    text(20, 362, 'RESERVATION DETAILS', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    group([
      rect(20, 378, 350, 200, C.surface, { rx: 20 }),
      ...([
        { label: 'Confirmation', value: 'PHT-29847-VX' },
        { label: 'Room type', value: 'Park Deluxe King Suite' },
        { label: 'Check-in', value: 'Mar 28, 3:00 PM' },
        { label: 'Check-out', value: 'Apr 4, 12:00 PM' },
        { label: 'Breakfast', value: 'Included · Peak Lounge' },
        { label: 'Extras', value: 'Airport transfer · Turndown' },
      ].flatMap(({ label, value }, i) => {
        const y = 400 + i * 28;
        return [
          text(36, y, label, 11, C.fg2),
          text(354, y, value, 11, C.fg, { textAnchor: 'end' }),
          i < 5 ? line(36, y + 14, 354, y + 14, C.border) : null,
        ].filter(Boolean);
      })),
    ]),

    // Included perks
    text(20, 596, 'CARD PERKS APPLIED', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    ...(['Room upgrade applied', '$100 F&B credit', 'Late checkout 4PM'].map((perk, i) => {
      const y = 612 + i * 44;
      return group([
        rect(20, y, 350, 36, 'transparent'),
        line(20, y + 36, 370, y + 36, C.border),
        circle(32, y + 18, 6, 'rgba(201,169,110,0.15)'),
        circle(32, y + 18, 3, C.gold),
        text(48, y + 18, perk, 12, C.fg, { dominantBaseline: 'central' }),
        text(354, y + 18, '✓', 12, C.teal, { textAnchor: 'end', dominantBaseline: 'central' }),
      ]);
    })),

    // CTA
    group([
      rect(20, 748, 350, 52, C.gold, { rx: 16 }),
      text(195, 774, 'View in Calendar', 15, C.bg, { textAnchor: 'middle', dominantBaseline: 'central', bold: true }),
    ]),

    navBar(3),
  ];
}

// ─── SCREEN 5: MEMBERSHIP ───────────────────────────────────────────────────
function membershipScreen() {
  return [
    rect(0, 0, 390, 870, C.bg),
    statusBar(0),

    text(20, 62, 'Membership', 28, C.fg, { bold: true }),
    text(20, 92, 'Vela Obsidian', 14, C.gold),

    // Card visual — Atlas Card style
    group([
      rect(20, 114, 350, 196, C.surface2, { rx: 24 }),
      // Gradient overlay hint
      rect(200, 114, 170, 196, 'rgba(201,169,110,0.04)', { rx: 24 }),
      // Star field
      ...[
        [40, 140], [90, 130], [170, 145], [250, 125], [320, 142],
        [60, 190], [140, 200], [220, 185], [300, 195], [350, 175],
        [100, 240], [200, 255], [310, 245],
      ].map(([sx, sy]) => circle(sx, sy, 1.5, C.fg3)),
      // Vela wordmark
      text(44, 160, 'VELA', 20, C.gold, { bold: true, letterSpacing: '0.35em' }),
      text(44, 180, 'OBSIDIAN', 9, C.goldDim, { letterSpacing: '0.2em' }),
      // Member name & number
      text(44, 270, 'ALEX CHEN', 13, C.fg, { bold: true, letterSpacing: '0.1em' }),
      text(44, 290, '•••• •••• •••• 7291', 13, C.fg2, { mono: true }),
      // NFC / chip icons
      text(324, 156, '◈', 22, C.goldDim, { textAnchor: 'end' }),
    ]),

    // Points balance
    group([
      rect(20, 324, 350, 76, C.surface, { rx: 20 }),
      text(36, 350, 'Points Balance', 12, C.fg2),
      text(36, 372, '284,950', 22, C.gold, { bold: true }),
      text(354, 372, '≈ $2,849 value', 12, C.fg2, { textAnchor: 'end' }),
      // mini progress
      rect(36, 384, 280, 3, C.border, { rx: 2 }),
      rect(36, 384, 178, 3, C.gold, { rx: 2 }),
      text(320, 382, '57% to Diamond', 9, C.fg3, { textAnchor: 'end' }),
    ]),

    // Benefits
    text(20, 420, 'OBSIDIAN BENEFITS', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    ...([
      { icon: '✈', title: 'Priority Boarding', sub: 'All tier 1 airlines', used: true },
      { icon: '◈', title: 'Hotel Upgrades', sub: '400+ properties worldwide', used: true },
      { icon: '✦', title: 'Dining Reservations', sub: 'Primetime tables guaranteed', used: false },
      { icon: '◎', title: '24/7 AI Concierge', sub: 'Vela Agent always on', used: false },
      { icon: '⬡', title: 'Airport Lounge Access', sub: '1,400+ lounges globally', used: false },
    ].flatMap(({ icon, title, sub, used }, i) => {
      const y = 438 + i * 58;
      return [
        rect(20, y, 350, 50, 'transparent'),
        line(20, y + 50, 370, y + 50, C.border),
        rect(28, y + 10, 30, 30, used ? 'rgba(201,169,110,0.15)' : C.surface, { rx: 10 }),
        text(43, y + 25, icon, 14, used ? C.gold : C.fg3, { textAnchor: 'middle', dominantBaseline: 'central' }),
        text(68, y + 18, title, 12, C.fg, { bold: true }),
        text(68, y + 34, sub, 10, C.fg2),
        used ? text(354, y + 25, 'Active', 10, C.teal, { textAnchor: 'end', dominantBaseline: 'central' }) : null,
      ].filter(Boolean);
    })),

    navBar(4),
  ];
}

// ─── SCREEN 6: AI PREFERENCES ───────────────────────────────────────────────
function preferencesScreen() {
  return [
    rect(0, 0, 390, 870, C.bg),
    statusBar(0),

    text(20, 62, 'AI Preferences', 28, C.fg, { bold: true }),
    text(20, 92, 'How Vela learns about you', 14, C.fg2),

    // Taste profile card
    group([
      rect(20, 114, 350, 150, C.surface, { rx: 20 }),
      text(36, 142, 'Dining Preferences', 14, C.fg, { bold: true }),
      ...([
        { label: 'Cuisine', tags: ['Japanese', 'French', 'Nordic'] },
        { label: 'Style', tags: ['Omakase', 'Fine dining'] },
        { label: 'Avoid', tags: ['Loud venues'] },
      ].flatMap(({ label, tags }, ri) => {
        const baseY = 162 + ri * 38;
        let xOffset = 90;
        const tagEls = tags.map(tag => {
          const w = tag.length * 7 + 20;
          const el = pill(xOffset, baseY - 11, tag, C.surface2, C.fg2, w);
          xOffset += w + 8;
          return el;
        });
        return [
          text(36, baseY, label, 11, C.fg3),
          ...tagEls,
        ];
      })),
    ]),

    // Travel style card
    group([
      rect(20, 278, 350, 120, C.surface, { rx: 20 }),
      text(36, 306, 'Travel Style', 14, C.fg, { bold: true }),
      ...([
        { label: 'Hotels', val: 'Five-star · Boutique preferred' },
        { label: 'Seat', val: 'Business · Window' },
        { label: 'Pace', val: 'Exploratory · No rush' },
      ].flatMap(({ label, val }, i) => {
        const y = 326 + i * 24;
        return [
          text(36, y, label, 11, C.fg3),
          text(354, y, val, 11, C.fg, { textAnchor: 'end' }),
        ];
      })),
    ]),

    // AI behavior toggles
    text(20, 420, 'AGENT BEHAVIOR', 9, C.fg3, { bold: true, letterSpacing: '0.12em' }),

    ...([
      { title: 'Auto-book preferred venues', sub: 'Vela books without asking', on: true },
      { title: 'Proactive suggestions', sub: 'Vela monitors & alerts you', on: true },
      { title: 'Price optimization', sub: 'Book at lowest available rate', on: false },
      { title: 'Itinerary building', sub: 'Auto-generate day plans', on: false },
    ].flatMap(({ title, sub, on }, i) => {
      const y = 438 + i * 60;
      const toggleX = 314;
      return [
        rect(20, y, 350, 52, 'transparent'),
        line(20, y + 52, 370, y + 52, C.border),
        text(20, y + 18, title, 13, C.fg, { bold: true }),
        text(20, y + 36, sub, 11, C.fg2),
        // Toggle pill
        rect(toggleX, y + 16, 44, 22, on ? C.gold : C.surface2, { rx: 11 }),
        circle(on ? toggleX + 33 : toggleX + 11, y + 27, 9, on ? C.bg : C.fg3),
      ];
    })),

    // AI memory strip
    group([
      rect(20, 692, 350, 54, 'rgba(124,158,204,0.1)', { rx: 16 }),
      rect(20, 692, 4, 54, C.blue, { rx: 2 }),
      text(36, 714, 'Vela Memory', 13, C.blue, { bold: true }),
      text(36, 732, '847 preferences learned · 3.2 years of history', 11, C.fg2),
      text(354, 714, '◈ View', 11, C.blue, { textAnchor: 'end' }),
    ]),

    navBar(4),
  ];
}

// ─── ASSEMBLE SCREENS ────────────────────────────────────────────────────────
const screens = [
  { id: 'home',        label: 'Home',         elements: homeScreen() },
  { id: 'discover',   label: 'Discover',      elements: discoverScreen() },
  { id: 'agent',      label: 'AI Agent',      elements: agentScreen() },
  { id: 'booking',    label: 'Booking',       elements: bookingScreen() },
  { id: 'membership', label: 'Membership',    elements: membershipScreen() },
  { id: 'prefs',      label: 'Preferences',   elements: preferencesScreen() },
];

// ─── BUILD .PEN FILE ─────────────────────────────────────────────────────────
function flattenElements(elements) {
  const flat = [];
  function visit(el) {
    if (!el) return;
    if (el.type === 'GROUP') {
      (el.children || []).forEach(visit);
    } else {
      flat.push(el);
    }
  }
  elements.forEach(visit);
  return flat;
}

const pen = {
  version: '2.8',
  meta: {
    name: 'Vela — Premium AI Concierge',
    slug: 'vela',
    description: 'A luxury AI travel concierge app with real-time agent activity visualization. Dark midnight palette with champagne gold.',
    archetype: 'luxury-concierge',
    theme: 'dark',
    createdAt: new Date().toISOString(),
  },
  canvas: {
    width: 390,
    height: 870,
    background: C.bg,
  },
  screens: screens.map(s => ({
    id: s.id,
    label: s.label,
    width: 390,
    height: 870,
    background: C.bg,
    elements: flattenElements(s.elements),
  })),
};

fs.writeFileSync('/workspace/group/design-studio/vela.pen', JSON.stringify(pen, null, 2));
console.log('✓ vela.pen written');
console.log(`  ${screens.length} screens, ${pen.screens.reduce((a, s) => a + s.elements.length, 0)} elements total`);
