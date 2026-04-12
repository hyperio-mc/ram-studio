// HAVEN — interior design moodboard companion
// Inspired by: Ray Is a Place (siteinspire) warm editorial wood photography + Overlay (lapa.ninja) polaroid arc layout
// Light linen theme: warm oat bg, sage accent, walnut tan

const fs = require('fs');

function uid() {
  return Math.random().toString(36).slice(2, 18).padStart(16, '0');
}

// Palette
const BG       = '#F4F0EB';  // warm oat/linen
const SURFACE  = '#FDFBF8';  // pure cream
const SURFACE2 = '#EDE8E1';  // muted oat card
const TEXT     = '#1A1614';  // near-black warm
const TEXT2    = '#6B5E54';  // muted brown
const ACCENT   = '#4D7260';  // forest sage
const ACCENT2  = '#A07850';  // walnut tan
const WHITE    = '#FFFFFF';

// ─── helper builders ────────────────────────────────────────────────
function uid16() { return Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,10); }

function rect(x, y, w, h, color, cornerRadius = 0, opacity = 1) {
  return { id: uid16(), type: 'rectangle', frame: { x, y, width: w, height: h },
    fills: [{ type: 'solid', color }], cornerRadius, opacity };
}

function text(x, y, w, h, content, fontSize, color, bold = false, align = 'left') {
  return { id: uid16(), type: 'text', frame: { x, y, width: w, height: h },
    content, fontSize, color, fontWeight: bold ? 700 : 400, textAlign: align };
}

function circle(x, y, r, color, opacity = 1) {
  return { id: uid16(), type: 'ellipse', frame: { x: x - r, y: y - r, width: r * 2, height: r * 2 },
    fills: [{ type: 'solid', color }], opacity };
}

function pill(x, y, w, h, bg, label, fontSize, textColor, bold = false) {
  return [
    rect(x, y, w, h, bg, h / 2),
    text(x, y + Math.round((h - fontSize - 2) / 2), w, fontSize + 2, label, fontSize, textColor, bold, 'center')
  ];
}

// Room card — simulates a Polaroid-style photo card (inspired by Overlay arc layout)
function roomCard(x, y, w, h, roomColor, roomLabel, subLabel) {
  return {
    id: uid16(), type: 'frame',
    frame: { x, y, width: w, height: h },
    fills: [{ type: 'solid', color: WHITE }],
    cornerRadius: 4,
    children: [
      rect(6, 6, w - 12, h - 40, roomColor, 3),
      text(8, h - 32, w - 16, 14, roomLabel, 11, TEXT, true),
      text(8, h - 18, w - 16, 12, subLabel, 9, TEXT2),
    ]
  };
}

// ─── SCREEN 1: Home / Discover ───────────────────────────────────────
function screenHome() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(rect(0, 0, W, H, BG));
  ch.push(text(20, 14, 200, 14, '9:41', 12, TEXT, true));
  ch.push(text(334, 14, 50, 14, '● ▲ ■', 9, TEXT2, false, 'right'));

  // Greeting
  ch.push(text(24, 52, 300, 28, 'Good morning, Jordan.', 22, TEXT, true));
  ch.push(text(24, 82, 320, 16, 'Your spaces are waiting.', 13, TEXT2));

  // Search bar
  ch.push(rect(24, 108, W - 48, 42, SURFACE, 21));
  ch.push(text(46, 119, 240, 20, '⌕  Search rooms, styles, palettes...', 12, TEXT2));

  // Section header
  ch.push(text(24, 170, 250, 16, 'Trending in Japandi', 15, TEXT, true));
  ch.push(text(24, 188, 200, 13, '↑ 24% this week', 11, ACCENT));

  // Fanned room cards (Overlay-inspired arc stacking)
  // Back left card — visually rotated/offset
  ch.push(rect(42, 222, 162, 200, '#C8B8A4', 4));  // shadow-card
  ch.push(rect(40, 220, 162, 200, '#C8B8A4', 4));
  ch.push(text(48, 390, 150, 14, 'Nordic Living', 10, TEXT2));

  // Back right card
  ch.push(rect(198, 226, 162, 200, '#9BAF9A', 4));
  ch.push(rect(196, 224, 162, 200, '#9BAF9A', 4));
  ch.push(text(204, 394, 150, 14, 'Kyoto Study', 10, TEXT2));

  // Front center card (prominent)
  const frontCard = roomCard(110, 208, 170, 210, '#B8C5BC', 'Linen Corner · Copenhagen', 'Japandi · Saved 1.2K');
  ch.push(frontCard);
  // Heart on front card
  ch.push(circle(268, 222, 10, WHITE, 0.92));
  ch.push(text(260, 215, 16, 14, '♡', 10, TEXT));

  // Style pills
  const styles = [['Japandi', ACCENT, WHITE, true], ['Nordic', SURFACE2, TEXT2, false],
    ['Coastal', SURFACE2, TEXT2, false], ['Wabi-Sabi', SURFACE2, TEXT2, false]];
  let px = 24;
  styles.forEach(([s, bg, tc, b]) => {
    const pw = s.length * 7.5 + 22;
    ch.push(...pill(px, 436, pw, 30, bg, s, 11, tc, b));
    px += pw + 10;
  });

  // Your Boards section
  ch.push(text(24, 486, 200, 16, 'Your Boards', 15, TEXT, true));
  ch.push(text(320, 486, 55, 14, 'See all', 12, ACCENT, false, 'right'));

  const boards = [['#D6CABD','The Linen Study','42 items'],['#B8CCC0','Kitchen Refresh','18 items'],['#C4B8A8','Bedroom Calm','31 items']];
  boards.forEach(([c, l, n], i) => {
    const bx = 24 + i * 120;
    ch.push(rect(bx, 510, 110, 90, c, 10));
    ch.push(rect(bx, 582, 110, 34, SURFACE, 10));
    ch.push(text(bx + 8, 588, 94, 14, l, 10, TEXT, true));
    ch.push(text(bx + 8, 604, 94, 12, n, 9, TEXT2));
  });

  // Bottom nav
  ch.push(rect(0, 746, W, 98, SURFACE, 0, 0.96));
  ch.push(rect(0, 746, W, 1, TEXT, 0, 0.07));
  const nav = ['◎ Home','◈ Discover','＋ Create','♡ Saved','○ Profile'];
  const nc  = [ACCENT, TEXT2, TEXT2, TEXT2, TEXT2];
  nav.forEach((n, i) => {
    const nx = i * 78;
    const [icon, ...rest] = n.split(' ');
    ch.push(text(nx, 758, 78, 20, icon, 18, nc[i], false, 'center'));
    ch.push(text(nx, 780, 78, 12, rest.join(' '), 9, nc[i], i===0, 'center'));
  });
  ch.push(rect(130, 820, 130, 4, TEXT, 22, 0.14));

  return { id: uid16(), name: 'Home', frame: { x: 0, y: 0, width: W, height: H }, children: ch };
}

// ─── SCREEN 2: Discover Mosaic ──────────────────────────────────────
function screenDiscover() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(rect(0, 0, W, H, BG));
  ch.push(text(20, 14, 200, 14, '9:41', 12, TEXT, true));

  ch.push(text(24, 50, 250, 28, 'Discover', 26, TEXT, true));
  ch.push(text(24, 80, 310, 14, '14,200 spaces · 87 countries', 12, TEXT2));

  // Filter row
  ch.push(rect(24, 104, 90, 32, SURFACE, 16));
  ch.push(text(24, 111, 90, 18, '⇅  Sort', 12, TEXT, false, 'center'));
  ch.push(rect(124, 104, 90, 32, SURFACE, 16));
  ch.push(text(124, 111, 90, 18, '⊕  Filter', 12, TEXT, false, 'center'));
  ch.push(...pill(224, 104, 88, 32, ACCENT, '✓ Japandi', 11, WHITE, true));
  ch.push(rect(322, 104, 44, 32, SURFACE, 16));
  ch.push(text(322, 111, 44, 18, '◫', 14, TEXT, false, 'center'));

  // Staggered 3-col mosaic
  const rooms = [
    ['#C4B4A0',160,'Kyoto Loft'],['#9BAF9A',200,'Nordic Cabin'],['#B8C0C8',160,'Coastal Den'],
    ['#D4C8B8',140,'Tokyo Flat'],['#B4C4B8',150,'Oslo Study'],['#C8B8C0',190,'Lisbon Roof'],
    ['#C0C8B8',175,'Kyushu Spa'],['#D0C4B0',120,'Bergen Loft'],['#B8C4BC',175,'Azores Rest'],
  ];
  const colX = [12, 137, 262], colW = [119, 119, 119];
  let colY = [148, 148, 148];
  rooms.forEach(([c, h, l], i) => {
    const col = i % 3, x = colX[col], y = colY[col], w = colW[col];
    ch.push(rect(x, y, w, h, c, 10));
    ch.push(circle(x + w - 16, y + 14, 10, WHITE, 0.88));
    ch.push(text(x + w - 22, y + 8, 14, 14, '♡', 9, TEXT));
    ch.push(rect(x, y + h - 30, w, 30, TEXT, 10, 0.38));
    ch.push(text(x + 6, y + h - 24, w - 12, 18, l, 10, WHITE, true));
    colY[col] += h + 8;
  });

  // Nav
  ch.push(rect(0, 746, W, 98, SURFACE, 0, 0.96));
  ch.push(rect(0, 746, W, 1, TEXT, 0, 0.07));
  const nav = ['◎ Home','◈ Discover','＋ Create','♡ Saved','○ Profile'];
  const nc  = [TEXT2, ACCENT, TEXT2, TEXT2, TEXT2];
  nav.forEach((n, i) => {
    const nx = i * 78;
    const [icon, ...rest] = n.split(' ');
    ch.push(text(nx, 758, 78, 20, icon, 18, nc[i], false, 'center'));
    ch.push(text(nx, 780, 78, 12, rest.join(' '), 9, nc[i], i===1, 'center'));
  });
  ch.push(rect(130, 820, 130, 4, TEXT, 22, 0.14));

  return { id: uid16(), name: 'Discover', frame: { x: 430, y: 0, width: W, height: H }, children: ch };
}

// ─── SCREEN 3: Moodboard ─────────────────────────────────────────────
function screenBoard() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(rect(0, 0, W, H, BG));
  ch.push(text(20, 14, 200, 14, '9:41', 12, TEXT, true));
  ch.push(text(20, 48, 30, 20, '←', 16, TEXT));
  ch.push(text(80, 48, 230, 20, 'The Linen Study', 16, TEXT, true, 'center'));
  ch.push(text(336, 48, 34, 20, '⋯', 16, TEXT2));

  // Hero board image
  ch.push(rect(24, 80, W - 48, 178, '#D6CABD', 14));
  ch.push(rect(24, 226, W - 48, 32, TEXT, 14, 0.42));
  ch.push(text(36, 233, 200, 18, 'The Linen Study', 13, WHITE, true));
  ch.push(text(280, 233, 96, 16, '42 items · 3 rooms', 10, WHITE, false, 'right'));

  // Color palette strip
  ch.push(text(24, 274, 200, 14, 'Palette', 12, TEXT2));
  const palColors = ['#D6CABD','#B8C0AA','#8A9480','#C4A882','#E8E0D4','#4D7260'];
  palColors.forEach((c, i) => ch.push(rect(24 + i * 42, 292, 36, 36, c, 8)));
  ch.push(text(24 + 6*42 + 4, 304, 50, 16, '+ Add', 11, TEXT2));

  // Saved Items list
  ch.push(rect(24, 342, W - 48, 1, TEXT, 0, 0.08));
  ch.push(text(24, 352, 200, 16, 'Saved Items', 14, TEXT, true));
  ch.push(text(314, 352, 60, 14, 'Grid ⊞', 11, TEXT2, false, 'right'));

  const items = [
    ['#D4CAB8','Katayama Linen Throw','Muji','£89','Textiles'],
    ['#B8C4A4','Ōgi Floor Lamp','Made.com','£245','Lighting'],
    ['#C8BEB2','Washi Paper Print','Society6','£42','Art'],
    ['#BCCCC0','Sori Barstool','Fritz Hansen','£680','Furniture'],
  ];
  items.forEach(([c, name, src, price, tag], i) => {
    const iy = 376 + i * 82;
    ch.push(rect(24, iy, W - 48, 74, SURFACE, 10));
    ch.push(rect(32, iy + 9, 56, 56, c, 8));
    ch.push(text(98, iy + 10, 160, 16, name, 13, TEXT, true));
    ch.push(text(98, iy + 28, 140, 14, src, 11, TEXT2));
    ch.push(...pill(98, iy + 46, tag.length * 7 + 16, 20, SURFACE2, tag, 9, TEXT2));
    ch.push(text(W - 48 - 60, iy + 18, 52, 18, price, 14, TEXT, true, 'right'));
  });

  // CTA
  ch.push(rect(24, 714, W - 48, 44, ACCENT, 22));
  ch.push(text(24, 725, W - 48, 22, '+ Add to board', 14, WHITE, true, 'center'));

  ch.push(rect(130, 820, 130, 4, TEXT, 22, 0.14));

  return { id: uid16(), name: 'Moodboard', frame: { x: 860, y: 0, width: W, height: H }, children: ch };
}

// ─── SCREEN 4: Project Tracker ───────────────────────────────────────
function screenProject() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(rect(0, 0, W, H, BG));
  ch.push(text(20, 14, 200, 14, '9:41', 12, TEXT, true));
  ch.push(text(20, 48, 30, 20, '←', 16, TEXT));
  ch.push(text(80, 48, 220, 20, 'Spring Refresh', 16, TEXT, true, 'center'));
  ch.push(...pill(316, 42, 64, 28, '#EAF4EF', 'Active', 10, ACCENT, true));

  // Budget donut ring (dot-based)
  const cx = 195, cy = 176, R = 66;
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * 2 * Math.PI - Math.PI / 2;
    const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
    ch.push(circle(px, py, 4, i < 26 ? ACCENT : SURFACE2));
  }
  ch.push(text(cx - 62, cy - 26, 124, 28, '£4,200', 22, TEXT, true, 'center'));
  ch.push(text(cx - 52, cy + 4, 104, 14, 'of £6,000', 12, TEXT2, false, 'center'));
  ch.push(text(cx - 52, cy + 18, 104, 14, '70% used', 10, TEXT2, false, 'center'));

  // Stats row
  const stats = [['12','Weeks left','#F4F0EB'],['8','Tasks done','#EAF4EF'],['3','Rooms done','#F4EFE8']];
  const sc = [TEXT2, ACCENT, ACCENT2];
  stats.forEach(([v, l, bg], i) => {
    const sx = 24 + i * 116;
    ch.push(rect(sx, 256, 108, 54, SURFACE, 10));
    ch.push(text(sx, 264, 108, 22, v, 18, sc[i], true, 'center'));
    ch.push(text(sx, 286, 108, 14, l, 10, TEXT2, false, 'center'));
  });

  // Room progress
  ch.push(rect(24, 322, W - 48, 1, TEXT, 0, 0.08));
  ch.push(text(24, 330, 200, 16, 'By Room', 14, TEXT, true));

  const rooms = [['Living Room',75,'6/8 tasks'],['Bedroom',40,'3/8 tasks'],['Kitchen',90,'7/8 tasks'],['Bathroom',20,'1/5 tasks']];
  rooms.forEach(([l, pct, note], i) => {
    const ry = 354 + i * 66;
    ch.push(text(24, ry, 220, 14, l, 13, TEXT, true));
    ch.push(text(W - 56, ry, 56, 14, `${pct}%`, 12, pct >= 75 ? ACCENT : TEXT2, true, 'right'));
    ch.push(rect(24, ry + 20, W - 48, 8, SURFACE2, 4));
    ch.push(rect(24, ry + 20, Math.round((W - 48) * pct / 100), 8, pct >= 75 ? ACCENT : ACCENT2, 4));
    ch.push(text(24, ry + 34, 200, 14, note, 10, TEXT2));
  });

  // Next milestone
  ch.push(rect(24, 630, W - 48, 58, '#EAF4EF', 12));
  ch.push(text(36, 642, 22, 20, '◈', 14, ACCENT));
  ch.push(text(62, 640, 280, 16, 'Next: Final bedroom textiles delivery', 13, TEXT, true));
  ch.push(text(62, 658, 280, 14, 'Expected 14 Apr · Japandi Linen Co.', 11, TEXT2));

  ch.push(rect(130, 820, 130, 4, TEXT, 22, 0.14));

  return { id: uid16(), name: 'Project', frame: { x: 1290, y: 0, width: W, height: H }, children: ch };
}

// ─── SCREEN 5: Profile / Style DNA ──────────────────────────────────
function screenProfile() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(rect(0, 0, W, H, BG));
  ch.push(text(20, 14, 200, 14, '9:41', 12, TEXT, true));
  ch.push(text(24, 50, 250, 22, 'Your Profile', 20, TEXT, true));
  ch.push(text(346, 50, 24, 22, '⚙', 16, TEXT2));

  // Avatar
  ch.push(circle(195, 122, 40, ACCENT2));
  ch.push(text(175, 104, 40, 36, 'J', 28, WHITE, true, 'center'));
  ch.push(text(24, 168, W - 48, 18, 'Jordan Clarke', 16, TEXT, true, 'center'));
  ch.push(text(24, 188, W - 48, 14, 'Designing a life worth living', 12, TEXT2, false, 'center'));

  // Stats
  const stats = [['12','Boards'],['1.2K','Saves'],['3','Projects'],['847','Items']];
  stats.forEach(([v, l], i) => {
    const sx = 24 + i * 86;
    ch.push(rect(sx, 212, 78, 54, SURFACE, 10));
    ch.push(text(sx, 220, 78, 22, v, 17, TEXT, true, 'center'));
    ch.push(text(sx, 242, 78, 14, l, 10, TEXT2, false, 'center'));
  });

  // Style DNA
  ch.push(rect(24, 278, W - 48, 1, TEXT, 0, 0.08));
  ch.push(text(24, 288, 200, 16, 'Your Style DNA', 14, TEXT, true));

  const dna = [['Japandi',68,ACCENT],['Coastal',19,'#5B8FA8'],['Wabi-Sabi',9,ACCENT2],['Minimal',4,TEXT2]];
  dna.forEach(([s, pct, c], i) => {
    const dy = 312 + i * 46;
    ch.push(text(24, dy, 140, 14, s, 13, TEXT, true));
    ch.push(text(W - 56, dy, 48, 14, `${pct}%`, 12, c, true, 'right'));
    ch.push(rect(24, dy + 18, W - 48, 7, SURFACE2, 4));
    ch.push(rect(24, dy + 18, Math.round((W - 48) * pct / 100), 7, c, 4));
  });

  // Recent boards
  ch.push(rect(24, 504, W - 48, 1, TEXT, 0, 0.08));
  ch.push(text(24, 514, 200, 16, 'Recent Boards', 14, TEXT, true));
  ch.push(text(314, 514, 60, 14, 'See all', 12, ACCENT, false, 'right'));

  const bColors = ['#D6CABD','#B8C0AA','#C8B8C0','#BCCCC0'];
  const bLabels = ['Linen Study','Kitchen Refresh','Bedroom Calm','Office Nook'];
  bColors.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = 24 + col * 180, by = 538 + row * 100;
    ch.push(rect(bx, by, 170, 88, c, 10));
    ch.push(rect(bx, by + 62, 170, 26, TEXT, 10, 0.4));
    ch.push(text(bx + 8, by + 68, 154, 16, bLabels[i], 10, WHITE, true));
  });

  // Buttons
  ch.push(rect(24, 748, (W - 56) / 2, 42, ACCENT, 21));
  ch.push(text(24, 759, (W - 56) / 2, 22, '+ Follow', 13, WHITE, true, 'center'));
  const bx2 = 24 + (W - 56) / 2 + 8;
  ch.push(rect(bx2, 748, (W - 56) / 2, 42, SURFACE, 21));
  ch.push(text(bx2, 759, (W - 56) / 2, 22, '↑ Share', 13, TEXT, true, 'center'));

  ch.push(rect(130, 820, 130, 4, TEXT, 22, 0.14));

  return { id: uid16(), name: 'Profile', frame: { x: 1720, y: 0, width: W, height: H }, children: ch };
}

// ─── Assemble ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'HAVEN — interior design moodboard companion',
  description: 'Light linen theme: warm oat + forest sage + walnut. Inspired by Ray Is a Place (siteinspire) editorial warm-wood photography and Overlay (lapa.ninja) polaroid arc card layout. Stacked room photo cards as discovery UI, mosaic grid, moodboard palette, project tracker, style DNA.',
  screens: [
    screenHome(),
    screenDiscover(),
    screenBoard(),
    screenProject(),
    screenProfile(),
  ]
};

fs.writeFileSync('haven.pen', JSON.stringify(pen, null, 2));
const kb = (fs.statSync('haven.pen').size / 1024).toFixed(1);
console.log(`✓ haven.pen — ${pen.screens.length} screens, ${kb} KB`);
