// CORK — Wine discovery & cellar tracker
// HB#16: Deep plum ink on warm cream
// Palette inspiration: Stripe Sessions 2026 (godly.website) — rgb(249,247,247) cream + rgb(32,3,60) deep plum
// The stretch: using deep plum (#20033C) as PRIMARY ink instead of black — throughout the entire system
// Counter-programming: wine apps are all dark (trying to look premium). CORK feels like a Decanter spread.

const fs = require('fs');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F9F7F7',   // Stripe Sessions warm cream
  surface:  '#F2EEEC',   // slightly deeper cream card
  raised:   '#EAE4E1',   // elevated surface / inset
  border:   '#D8CEC9',   // warm border
  rule:     '#E4DDD9',   // subtle rule

  ink:      '#20033C',   // Stripe Sessions deep plum — THE KEY CHOICE
  mid:      '#5C4A5A',   // warm plum-tinted mid
  muted:    '#9B8B96',   // warm purple-gray muted
  faint:    '#C4B8C0',   // very faint plum text

  burgundy: '#7A1B3F',   // deep burgundy — primary actions
  rosé:     '#C4706A',   // warm rosé accent
  gold:     '#C49A3A',   // aged/premium gold
  tawny:    '#A05C2A',   // tawny port orange
  sage:     '#5C7A5C',   // fresh/white wine sage green

  white:    '#FDFBFB',   // warm white
  shadow:   '#20033C12', // plum-tinted shadow

  // Wine type colors
  red:    '#7A1B3F',
  white2: '#C49A3A',
  rosé2:  '#C4706A',
  spark:  '#9B7A3C',
  port:   '#5C1A2A',
  nat:    '#8B6A4A',
};

const W_M = 390, H_M = 844;
const W_D = 1440, H_D = 900;

// ── Primitives ─────────────────────────────────────────────────────────────────
const R = (x,y,w,h,fill,r=0,opts={}) => ({
  type:'rectangle', x, y,
  width: Math.max(0,w), height: Math.max(0,h),
  fill, cornerRadius:r, ...opts
});
const T = (content,x,y,size,fill,opts={}) => ({
  type:'text', content: String(content), x, y, fontSize:size, fill,
  fontFamily:'Inter', fontWeight:400, ...opts
});
const TB = (c,x,y,s,f,o={}) => T(c,x,y,s,f,{fontWeight:700,...o});
const TS = (c,x,y,s,f,o={}) => T(c,x,y,s,f,{fontFamily:'Georgia',fontWeight:400,...o}); // serif
const TSB = (c,x,y,s,f,o={}) => T(c,x,y,s,f,{fontFamily:'Georgia',fontWeight:700,...o}); // serif bold

// ── Components ─────────────────────────────────────────────────────────────────

function Card(x,y,w,h,r=12) {
  return [
    R(x+2,y+3,w,h,C.shadow,r+1),
    R(x,y,w,h,C.surface,r),
  ];
}

function MobileNav(active=0) {
  const labels = ['Discover','Cellar','Notes','Search','Profile'];
  const icons = ['◈','▦','✎','⌕','◯'];
  const y = H_M - 80;
  const tabW = W_M / labels.length;
  return [
    R(0, y, W_M, 80, C.white),
    R(0, y, W_M, 1, C.border),
    ...labels.map((label,i) => {
      const cx = i * tabW + tabW / 2;
      const isActive = i === active;
      return [
        TB(icons[i], cx-8, y+14, 18, isActive ? C.burgundy : C.muted),
        T(label, cx-20, y+36, 10, isActive ? C.burgundy : C.muted, {fontWeight: isActive ? 700 : 400}),
      ];
    }).flat(),
  ];
}

function TopBar(title, subtitle='') {
  return [
    R(0, 0, W_M, 96, C.bg),
    TSB(title, 20, 52, 22, C.ink),
    subtitle ? T(subtitle, 20, 76, 12, C.muted) : null,
  ].filter(Boolean);
}

function WineCard(x,y,w,wine) {
  const { name, region, varietal, vintage, score, type='red', price='' } = wine;
  const h = 120;
  const typeColor = C[type] || C.red;
  return [
    ...Card(x, y, w, h, 12),
    // color bar on left
    R(x, y, 4, h, typeColor, 2),
    // vintage badge
    R(x+w-50, y+10, 40, 22, typeColor+'18', 4),
    T(String(vintage), x+w-45, y+14, 11, typeColor, {fontWeight:700}),
    // wine name (serif)
    TS(name, x+16, y+18, 15, C.ink),
    // region + varietal
    T(region, x+16, y+40, 11, C.muted),
    T(varietal, x+16, y+54, 11, C.muted),
    // score
    score ? [
      R(x+16, y+78, 36, 20, C.burgundy+'18', 4),
      T(String(score), x+22, y+82, 11, C.burgundy, {fontWeight:700}),
    ] : [],
    // price
    price ? TB(String(price), x+w-70, y+82, 12, C.ink) : null,
  ].flat().filter(Boolean);
}

function RatingStars(x,y,rating=4.2,col=C.gold) {
  const full = Math.floor(rating);
  const els = [];
  for (let i=0; i<5; i++) {
    const filled = i < full;
    els.push(R(x + i*16, y, 12, 12, filled ? col : C.border, 1));
  }
  return els;
}

function ScoreCircle(x,y,r=32,score=92,col=C.burgundy) {
  return [
    R(x-r, y-r, r*2, r*2, col+'15', r),
    R(x-r+3, y-r+3, (r-3)*2, (r-3)*2, C.bg, r-3),
    TSB(String(score), x-14, y-10, 20, col),
    T('pts', x-8, y+12, 10, C.muted),
  ];
}

function TastingNote(x,y,w,attr,pct,col=C.burgundy) {
  return [
    T(attr, x, y, 11, C.mid),
    R(x+80, y+1, w-80, 8, C.border, 4),
    R(x+80, y+1, Math.max(0,(w-80)*pct), 8, col, 4),
    T(String(Math.round(pct*100))+'%', x+w-26, y-1, 10, C.muted),
  ];
}

function AgeBar(x,y,w,current=2021,optimal=2028,max=2035) {
  const now = 2026;
  const totalRange = max - current;
  const nowPct = (now - current) / totalRange;
  const optPct = (optimal - current) / totalRange;
  return [
    R(x,y,w,8,C.border,4),
    R(x,y,w*nowPct,8,C.tawny,4),
    R(x+w*optPct-2,y-4,3,16,C.gold,1),
    T(String(current), x-2, y+14, 9, C.muted),
    T(String(optimal), x+w*optPct-12, y+14, 9, C.gold, {fontWeight:700}),
    T(String(max), x+w-10, y+14, 9, C.muted),
  ];
}

function Sidebar() {
  const items = [
    { icon:'◈', label:'Discover', active:true },
    { icon:'▦', label:'My Cellar' },
    { icon:'✎', label:'Tasting Notes' },
    { icon:'⌕', label:'Search' },
    { icon:'♟', label:'Pairings' },
    { icon:'◯', label:'Profile' },
  ];
  const sideW = 220;
  const els = [
    R(0, 0, sideW, H_D, C.surface),
    R(sideW-1, 0, 1, H_D, C.border),
    // Logo
    TSB('CORK', 24, 32, 20, C.ink),
    T('Wine Discovery', 24, 56, 11, C.muted),
    R(24, 72, 60, 2, C.burgundy+'40', 1),
  ];
  items.forEach((item, i) => {
    const y = 108 + i * 52;
    if (item.active) {
      els.push(R(0, y-8, sideW, 44, C.burgundy+'0F', 8));
      els.push(R(0, y-8, 3, 44, C.burgundy, 1));
    }
    els.push(TB(item.icon, 24, y+4, 16, item.active ? C.burgundy : C.muted));
    els.push(T(item.label, 52, y+6, 13, item.active ? C.ink : C.mid, {fontWeight: item.active ? 600 : 400}));
  });
  // Cellar stats at bottom
  els.push(...[
    R(16, H_D-140, sideW-32, 120, C.raised, 10),
    T('My Cellar', 28, H_D-126, 10, C.muted, {fontWeight:700}),
    TSB('47', 28, H_D-108, 22, C.ink),
    T('bottles', 60, H_D-107, 11, C.mid),
    T('23 ready to drink', 28, H_D-82, 11, C.sage),
    T('12 still aging', 28, H_D-67, 11, C.tawny),
    T('8 best in cellar', 28, H_D-52, 11, C.gold),
  ]);
  return els;
}

// ── Screens ────────────────────────────────────────────────────────────────────

function mDiscover() {
  const els = [];

  // Status bar
  els.push(R(0,0,W_M,44,C.bg));
  els.push(T('9:41', 16, 14, 14, C.ink, {fontWeight:600}));

  // Header
  els.push(TSB('Discover', 20, 54, 26, C.ink));
  els.push(T('Spring releases & cellar picks', 20, 84, 13, C.muted));

  // Featured wine — full width hero card
  const hw = W_M - 40;
  els.push(...Card(20, 108, hw, 180, 16));
  els.push(R(20, 108, hw, 180, C.burgundy+'08', 16));
  els.push(R(20, 108, 5, 180, C.burgundy, 2));
  els.push(T('WINE OF THE WEEK', 36, 126, 9, C.burgundy, {fontWeight:700}));
  els.push(TSB('Château Margaux', 36, 146, 18, C.ink));
  els.push(TS('Grand Vin, Premier Grand Cru Classé', 36, 168, 12, C.mid));
  els.push(T('Margaux · Bordeaux · 2018', 36, 184, 11, C.muted));
  els.push(...ScoreCircle(hw-10, 218, 30, 97, C.burgundy));
  els.push(R(36, 200, 60, 22, C.gold+'20', 4));
  els.push(T('AGED', 42, 204, 10, C.gold, {fontWeight:700}));
  els.push(R(104, 200, 70, 22, C.burgundy+'15', 4));
  els.push(T('$380 / btl', 108, 204, 10, C.burgundy, {fontWeight:700}));
  els.push(R(182, 200, 60, 22, C.sage+'20', 4));
  els.push(T('97 pts', 187, 204, 10, C.sage, {fontWeight:700}));

  // Section header
  els.push(TB('New Arrivals', 20, 308, 14, C.ink));
  els.push(T('See all', W_M-58, 310, 12, C.burgundy));

  // Wine cards list
  const wines = [
    { name:"Opus One 2020", region:"Napa Valley, California", varietal:"Cabernet Sauvignon", vintage:2020, score:'96 pts', type:'red', price:'$295' },
    { name:"Cloudy Bay Te Koko", region:"Marlborough, NZ", varietal:"Sauvignon Blanc", vintage:2022, score:'93 pts', type:'white2', price:'$45' },
    { name:"Billecart-Salmon Rosé", region:"Champagne, France", varietal:"Pinot Noir / Chard", vintage:2019, score:'94 pts', type:'rosé2', price:'$92' },
  ];
  wines.forEach((w, i) => {
    els.push(...WineCard(20, 332 + i * 132, W_M - 40, w));
  });

  els.push(...MobileNav(0));
  return els;
}

function mDetail() {
  const els = [];

  // Header with back
  els.push(R(0,0,W_M,44,C.bg));
  els.push(T('9:41', 16, 14, 14, C.ink, {fontWeight:600}));
  els.push(R(0, 44, W_M, 52, C.bg));
  els.push(T('← Back', 20, 60, 13, C.burgundy));
  els.push(TB('Details', W_M/2-22, 60, 13, C.ink));

  // Wine header
  els.push(R(0, 96, W_M, 200, C.surface));
  els.push(R(0, 96, W_M, 3, C.burgundy));
  els.push(T('RED WINE · BORDEAUX · FRANCE', 20, 112, 9, C.burgundy, {fontWeight:700}));
  els.push(TSB('Pétrus', 20, 132, 32, C.ink));
  els.push(TS('Pomerol, Premier Grand Cru', 20, 170, 14, C.mid));
  els.push(T('Vintage 2015 · $3,200 per bottle', 20, 190, 12, C.muted));
  // Big score
  els.push(...ScoreCircle(W_M-52, 176, 38, 100, C.burgundy));

  // Rating stars
  els.push(...RatingStars(20, 218, 4.8, C.gold));
  els.push(T('4.8 · 1,240 tasting notes', 104, 218, 11, C.muted));

  // Action buttons
  els.push(R(20, 250, (W_M-52)/2, 36, C.burgundy, 8));
  els.push(TB('Add to Cellar', 36, 261, 12, C.white));
  els.push(R(20+(W_M-52)/2+12, 250, (W_M-52)/2, 36, C.surface, 8));
  els.push(R(20+(W_M-52)/2+12, 250, (W_M-52)/2, 36, C.border, 8, {opacity:0}));
  els.push(R(20+(W_M-52)/2+12, 250, (W_M-52)/2-0, 36, 'transparent', 8));
  els.push(R(20+(W_M-52)/2+12, 250, (W_M-52)/2, 36, C.border, 8));
  els.push(TB('+ Tasting Note', 36+(W_M-52)/2+12, 261, 12, C.ink));

  // Tasting Profile
  els.push(TB('Tasting Profile', 20, 310, 13, C.ink));
  const attrs = [
    { attr:'Tannins', pct:0.88 },
    { attr:'Acidity', pct:0.72 },
    { attr:'Body', pct:0.94 },
    { attr:'Fruit', pct:0.85 },
    { attr:'Finish', pct:0.96 },
  ];
  attrs.forEach((a, i) => {
    els.push(...TastingNote(20, 334 + i*30, W_M-40, a.attr, a.pct, C.burgundy));
  });

  // Drinking window
  els.push(TB('Drinking Window', 20, 502, 13, C.ink));
  els.push(T('Best: 2025–2035 · Peak: 2028', 20, 522, 11, C.muted));
  els.push(...AgeBar(20, 542, W_M-40, 2015, 2028, 2038));

  // Flavor notes
  els.push(TB('Flavor Notes', 20, 592, 13, C.ink));
  const flavors = ['Black Cherry','Cassis','Truffle','Cedar','Graphite','Tobacco'];
  flavors.forEach((f, i) => {
    const col = i % 2 === 0 ? C.burgundy : C.tawny;
    const x = 20 + (i % 3) * 110;
    const y = 612 + Math.floor(i / 3) * 32;
    els.push(R(x, y, 100, 24, col+'15', 12));
    els.push(T(f, x+8, y+6, 11, col, {fontWeight:600}));
  });

  // Winemaker note
  els.push(...Card(20, 682, W_M-40, 100, 10));
  els.push(T('WINEMAKER NOTE', 32, 698, 9, C.muted, {fontWeight:700}));
  els.push(TS('"The 2015 is perhaps the greatest wine...',32, 714, 12, C.mid));
  els.push(TS('ever produced at Pétrus. Extraordinary"', 32, 730, 12, C.mid));
  els.push(T('— Christian Moueix', 32, 756, 11, C.muted));

  els.push(...MobileNav(2));
  return els;
}

function mCellar() {
  const els = [];
  els.push(R(0,0,W_M,44,C.bg));
  els.push(T('9:41', 16, 14, 14, C.ink, {fontWeight:600}));

  // Header
  els.push(TSB('My Cellar', 20, 58, 26, C.ink));
  els.push(T('47 bottles across 18 producers', 20, 88, 12, C.muted));

  // Stats strip
  els.push(R(20, 108, W_M-40, 70, C.surface, 12));
  const stats = [
    { label:'Total value', val:'$12,840' },
    { label:'Ready now', val:'23' },
    { label:'Aging', val:'12' },
    { label:'Best picks', val:'8' },
  ];
  stats.forEach((s,i) => {
    const x = 28 + i * 86;
    els.push(TSB(s.val, x, 128, 16, C.ink));
    els.push(T(s.label, x, 148, 9, C.muted));
  });

  // Filter tabs
  const tabs = ['All','Red','White','Rosé','Sparkling'];
  els.push(R(20, 192, W_M-40, 36, C.surface, 18));
  tabs.forEach((tab,i) => {
    const x = 24 + i * 68;
    const isActive = i === 0;
    if (isActive) els.push(R(x-2, 194, 64, 32, C.white, 16));
    els.push(T(tab, x+4, 203, 11, isActive ? C.ink : C.muted, {fontWeight: isActive ? 700 : 400}));
  });

  // Cellar list
  const bottles = [
    { name:"Sassicaia 2019", region:"Bolgheri · Italy", varietal:"Cab Sauv blend", vintage:2019, type:'red', status:'ready', qty:3, val:'$185' },
    { name:"Krug Grande Cuvée", region:"Champagne · France", varietal:"Multi-vintage blend", vintage:0, type:'spark', status:'drink', qty:2, val:'$220' },
    { name:"Opus One 2018", region:"Napa Valley · US", varietal:"Cabernet Sauvignon", vintage:2018, type:'red', status:'aging', qty:6, val:'$295' },
    { name:"Penfolds Grange 2016", region:"Barossa · Australia", varietal:"Shiraz", vintage:2016, type:'red', status:'aging', qty:1, val:'$620' },
    { name:"Cloudy Bay 2023", region:"Marlborough · NZ", varietal:"Sauvignon Blanc", vintage:2023, type:'white2', status:'ready', qty:4, val:'$28' },
  ];
  const statusColor = { ready:C.sage, aging:C.tawny, drink:C.rosé };
  const statusLabel = { ready:'Ready', aging:'Aging', drink:'Drink now' };
  bottles.forEach((b,i) => {
    const y = 240 + i*98;
    const typeCol = C[b.type] || C.red;
    els.push(...Card(20, y, W_M-40, 88, 10));
    els.push(R(20, y, 4, 88, typeCol, 1));
    // Status badge
    const sc = statusColor[b.status] || C.muted;
    els.push(R(W_M-90, y+10, 64, 20, sc+'18', 10));
    els.push(T(statusLabel[b.status]||'', W_M-88, y+14, 10, sc, {fontWeight:700}));
    // Content
    els.push(TS(b.name, 32, y+14, 15, C.ink));
    els.push(T(b.region, 32, y+34, 11, C.muted));
    els.push(T(b.varietal, 32, y+48, 11, C.muted));
    // Qty + val
    els.push(T(String(b.qty)+'x', 32, y+66, 12, C.mid, {fontWeight:600}));
    els.push(T(b.val+' ea', 58, y+66, 12, C.muted));
    if (b.vintage) els.push(TB(String(b.vintage), W_M-80, y+66, 11, C.ink));
  });

  els.push(...MobileNav(1));
  return els;
}

function mNotes() {
  const els = [];
  els.push(R(0,0,W_M,44,C.bg));
  els.push(T('9:41', 16, 14, 14, C.ink, {fontWeight:600}));

  els.push(TSB('Tasting Notes', 20, 58, 22, C.ink));
  els.push(T('Your palate log — 48 notes', 20, 84, 12, C.muted));

  // Recent note card - expanded
  els.push(...Card(20, 106, W_M-40, 280, 14));
  els.push(R(20, 106, W_M-40, 3, C.rosé, 1));
  els.push(T('MOST RECENT · 2 DAYS AGO', 32, 122, 9, C.muted, {fontWeight:700}));
  els.push(TSB('Cloudy Bay Pelorus Rosé', 32, 142, 17, C.ink));
  els.push(TS('Marlborough, New Zealand · NV', 32, 164, 12, C.mid));
  // Rating
  els.push(...RatingStars(32, 186, 4.0, C.rosé));
  els.push(T('4.0 / 5.0', 116, 186, 11, C.muted));
  // Serving details
  els.push(R(32, 208, 60, 22, C.surface, 6));
  els.push(T('12.5°C', 38, 212, 11, C.mid));
  els.push(R(100, 208, 90, 22, C.surface, 6));
  els.push(T('Zalto glass', 106, 212, 11, C.mid));
  // The note
  els.push(TS('"Pale salmon, delicate bead. Nose:', 32, 244, 12, C.mid));
  els.push(TS('strawberry, white peach, brioche.', 32, 260, 12, C.mid));
  els.push(TS('Palate: crisp, refreshing, long finish."', 32, 276, 12, C.mid));
  // Pairing tag
  els.push(R(32, 300, 100, 24, C.rosé+'18', 12));
  els.push(T('🦞 Lobster salad', 40, 304, 11, C.rosé, {fontWeight:600}));
  els.push(R(140, 300, 80, 24, C.surface, 12));
  els.push(T('Summer deck', 148, 304, 11, C.mid));
  // Edit link
  els.push(T('Edit note', W_M-80, 358, 12, C.burgundy));

  // Quick note entry
  els.push(TB('+ New Tasting Note', 20, 402, 13, C.ink));
  els.push(...Card(20, 422, W_M-40, 80, 10));
  els.push(TS('Wine name or search...', 32, 440, 14, C.faint));
  els.push(R(32, 468, W_M-80, 1, C.rule));

  // Other notes list
  els.push(TB('All Notes', 20, 520, 13, C.ink));
  const notes = [
    { name:"Barolo DOCG 2017", region:"Piedmont · Italy", rating:4.5, date:'1 week ago', type:'red' },
    { name:"Sancerre Blanc 2022", region:"Loire Valley · France", rating:4.2, date:'2 weeks ago', type:'white2' },
    { name:"Dom Pérignon 2013", region:"Champagne · France", rating:4.8, date:'1 month ago', type:'spark' },
  ];
  notes.forEach((n,i) => {
    const y = 544 + i*82;
    const typeCol = C[n.type] || C.red;
    els.push(...Card(20, y, W_M-40, 72, 8));
    els.push(R(20, y, 3, 72, typeCol, 1));
    els.push(TS(n.name, 32, y+12, 14, C.ink));
    els.push(T(n.region, 32, y+32, 11, C.muted));
    els.push(...RatingStars(32, y+50, n.rating, C.gold));
    els.push(T(n.date, W_M-90, y+14, 10, C.muted));
  });

  els.push(...MobileNav(2));
  return els;
}

function mSearch() {
  const els = [];
  els.push(R(0,0,W_M,44,C.bg));
  els.push(T('9:41', 16, 14, 14, C.ink, {fontWeight:600}));

  els.push(TSB('Search', 20, 58, 26, C.ink));

  // Search bar
  els.push(R(20, 88, W_M-40, 44, C.surface, 10));
  els.push(R(22, 90, W_M-44, 40, C.border+'60', 9));
  els.push(T('⌕', 36, 100, 18, C.muted));
  els.push(TS('Château, region, varietal...', 60, 100, 14, C.faint));

  // Active filters
  const filters = ['Red Wine','Bordeaux','90+ pts','Under $100'];
  els.push(R(20, 144, W_M-40, 40, C.bg));
  let fx = 20;
  filters.forEach(f => {
    const fw = f.length * 7 + 20;
    els.push(R(fx, 148, fw, 28, C.burgundy+'15', 14));
    els.push(T(f, fx+8, 153, 11, C.burgundy, {fontWeight:600}));
    els.push(T('×', fx+fw-14, 153, 11, C.burgundy));
    fx += fw + 8;
  });

  // Filter section
  els.push(TB('Filter by', 20, 196, 13, C.ink));
  // Region filter
  els.push(T('Region', 20, 222, 11, C.muted, {fontWeight:700}));
  const regions = ['Bordeaux','Burgundy','Champagne','Napa','Tuscany','Rioja'];
  regions.forEach((r,i) => {
    const x = 20 + (i%3)*114, y = 240 + Math.floor(i/3)*36;
    const isActive = i === 0;
    els.push(R(x, y, 106, 28, isActive ? C.burgundy : C.surface, 6));
    els.push(T(r, x+8, y+7, 11, isActive ? C.white : C.mid, {fontWeight: isActive ? 600 : 400}));
  });

  // Varietal
  els.push(T('Varietal', 20, 320, 11, C.muted, {fontWeight:700}));
  const varietals = ['Cabernet','Pinot Noir','Merlot','Chardonnay','Riesling'];
  varietals.forEach((v,i) => {
    const x = 20 + (i%3)*114, y = 338 + Math.floor(i/3)*36;
    els.push(R(x, y, 106, 28, C.surface, 6));
    els.push(T(v, x+8, y+7, 11, C.mid));
  });

  // Score range
  els.push(T('Minimum score', 20, 416, 11, C.muted, {fontWeight:700}));
  const scores = ['Any','85+','90+','93+','95+'];
  scores.forEach((s,i) => {
    const x = 20 + i*66;
    const isActive = i === 2;
    els.push(R(x, 434, 58, 28, isActive ? C.burgundy : C.surface, 6));
    els.push(T(s, x+8, 441, 11, isActive ? C.white : C.mid, {fontWeight: isActive ? 600 : 400}));
  });

  // Results
  els.push(TB('142 wines found', 20, 484, 13, C.ink));
  const results = [
    { name:"Léoville-Las Cases 2016", region:"Saint-Julien · Bordeaux", varietal:"Cabernet Sauvignon", vintage:2016, score:'96 pts', type:'red', price:'$195' },
    { name:"Ducru-Beaucaillou 2018", region:"Saint-Julien · Bordeaux", varietal:"Cabernet Sauvignon", vintage:2018, score:'95 pts', type:'red', price:'$165' },
  ];
  results.forEach((w,i) => {
    els.push(...WineCard(20, 506+i*132, W_M-40, w));
  });

  els.push(...MobileNav(3));
  return els;
}

// ── Desktop Screens ──────────────────────────────────────────────────────────

function dDiscover() {
  const els = [];
  const sideW = 220;
  const mainX = sideW;
  const mainW = W_D - sideW;

  els.push(R(0,0,W_D,H_D,C.bg));
  els.push(...Sidebar());

  // Main content
  // Top bar
  els.push(R(mainX, 0, mainW, 60, C.bg));
  els.push(R(mainX, 59, mainW, 1, C.border));
  els.push(TSB('Discover', mainX+32, 20, 18, C.ink));
  els.push(T('Spring releases & top picks', mainX+32, 44, 12, C.muted));
  // Search
  els.push(R(W_D-280, 14, 220, 32, C.surface, 8));
  els.push(R(W_D-278, 16, 216, 28, C.border+'50', 7));
  els.push(T('⌕  Search wines...', W_D-272, 21, 12, C.muted));

  // Featured hero (left 2/3)
  const featureW = Math.round(mainW * 0.62);
  const featureH = 280;
  els.push(...Card(mainX+24, 80, featureW, featureH, 14));
  els.push(R(mainX+24, 80, featureW, featureH, C.burgundy+'06', 14));
  els.push(R(mainX+24, 80, 5, featureH, C.burgundy, 2));
  els.push(T('FEATURED RELEASE', mainX+44, 100, 9, C.burgundy, {fontWeight:700}));
  els.push(TSB('Domaine de la Romanée-Conti', mainX+44, 122, 22, C.ink));
  els.push(TS('La Tâche Grand Cru, 2020', mainX+44, 148, 15, C.mid));
  els.push(T('Côte de Nuits · Burgundy · France', mainX+44, 168, 12, C.muted));
  els.push(...RatingStars(mainX+44, 190, 5.0, C.gold));
  els.push(T('100/100 points · Jancis Robinson', mainX+132, 190, 11, C.muted));
  els.push(...TastingNote(mainX+44, 216, 300, 'Complexity', 0.98, C.burgundy));
  els.push(...TastingNote(mainX+44, 240, 300, 'Age Potential', 0.95, C.gold));
  els.push(...TastingNote(mainX+44, 264, 300, 'Elegance', 0.97, C.rosé));
  els.push(R(mainX+44, 304, 160, 36, C.burgundy, 8));
  els.push(TB('View Wine', mainX+76, 315, 12, C.white));
  els.push(R(mainX+216, 304, 100, 36, C.surface, 8));
  els.push(R(mainX+216, 304, 100, 36, C.border, 8));
  els.push(TB('Add to Cellar', mainX+224, 315, 12, C.ink));
  els.push(TSB('$4,800', mainX+featureW-80, 120, 24, C.ink));
  els.push(T('per bottle', mainX+featureW-80, 148, 11, C.muted));
  els.push(...ScoreCircle(mainX+featureW-50, 220, 40, 100, C.burgundy));

  // Right sidebar stats
  const rx = mainX + featureW + 32;
  const rw = mainW - featureW - 56;
  els.push(...Card(rx, 80, rw, 130, 12));
  els.push(T('CELLAR SUMMARY', rx+16, 96, 9, C.muted, {fontWeight:700}));
  els.push(TSB('47', rx+16, 118, 28, C.ink));
  els.push(T('bottles', rx+52, 120, 13, C.mid));
  els.push(T('Est. value: $12,840', rx+16, 148, 12, C.muted));
  els.push(R(rx+16, 168, rw-32, 1, C.rule));
  els.push(T('Ready to drink: 23', rx+16, 180, 12, C.sage));
  els.push(T('Still aging: 12', rx+16, 196, 12, C.tawny));

  els.push(...Card(rx, 226, rw, 130, 12));
  els.push(T('TOP REGION', rx+16, 242, 9, C.muted, {fontWeight:700}));
  els.push(TSB('Bordeaux', rx+16, 264, 18, C.ink));
  els.push(T('14 bottles · $5,240 value', rx+16, 286, 12, C.muted));
  const regions2 = [['Bordeaux',0.55],['Burgundy',0.22],['Champagne',0.12],['Other',0.11]];
  regions2.forEach(([reg,pct],i) => {
    els.push(T(reg, rx+16, 312+i*0, 10, C.muted));
  });
  // Stacked bar
  const barW2 = rw - 32;
  let bx = rx+16;
  const barColors = [C.burgundy, C.rosé, C.gold, C.muted];
  regions2.forEach(([,pct],i) => {
    const bw = Math.round(barW2*pct);
    els.push(R(bx, 308, bw, 8, barColors[i], 0));
    bx += bw;
  });

  // Wine grid below
  els.push(TB('New Arrivals', mainX+24, 384, 14, C.ink));
  els.push(T('See all 48 →', W_D-80, 386, 12, C.burgundy));
  const gridWines = [
    { name:"Gaja Barbaresco 2019", region:"Piedmont · Italy", varietal:"Nebbiolo", vintage:2019, score:'96 pts', type:'red', price:'$220' },
    { name:"Pouilly-Fumé La Doucette", region:"Loire Valley · France", varietal:"Sauvignon Blanc", vintage:2022, score:'91 pts', type:'white2', price:'$32' },
    { name:"Veuve Clicquot Brut", region:"Champagne · France", varietal:"Pinot Noir blend", vintage:0, score:'92 pts', type:'spark', price:'$68' },
    { name:"Biondi-Santi Brunello", region:"Montalcino · Italy", varietal:"Sangiovese", vintage:2016, score:'97 pts', type:'red', price:'$340' },
  ];
  const colW = Math.floor((mainW-48) / 4) - 6;
  gridWines.forEach((w,i) => {
    els.push(...WineCard(mainX+24 + i*(colW+8), 408, colW, w));
  });

  // Recently viewed
  els.push(TB('Recently Viewed', mainX+24, 550, 14, C.ink));
  const recentWines = [
    { name:"Ridge Monte Bello 2017", region:"Santa Cruz · US", varietal:"Cabernet blend", vintage:2017, score:'98 pts', type:'red', price:'$195' },
    { name:"Antinori Tignanello 2018", region:"Tuscany · Italy", varietal:"Sangiovese blend", vintage:2018, score:'95 pts', type:'red', price:'$85' },
    { name:"Billecart-Salmon Blanc de Blancs", region:"Champagne · France", varietal:"Chardonnay", vintage:2014, score:'96 pts', type:'spark', price:'$165' },
    { name:"Château Pichon-Baron 2019", region:"Pauillac · Bordeaux", varietal:"Cabernet Sauvignon", vintage:2019, score:'96 pts', type:'red', price:'$120' },
  ];
  recentWines.forEach((w,i) => {
    els.push(...WineCard(mainX+24+i*(colW+8), 572, colW, w));
  });

  return els;
}

function dDetail() {
  const els = [];
  const sideW = 220;
  const mainX = sideW;
  els.push(R(0,0,W_D,H_D,C.bg));
  els.push(...Sidebar());

  // Top bar
  els.push(R(mainX, 0, W_D-sideW, 60, C.bg));
  els.push(R(mainX, 59, W_D-sideW, 1, C.border));
  els.push(T('← Discover', mainX+32, 20, 12, C.burgundy));
  els.push(TSB('Wine Details', mainX+32, 42, 16, C.ink));

  // Two column layout
  const leftW = 480;
  const rightX = mainX + leftW + 32;
  const rightW = W_D - rightX - 24;

  // Left: wine info
  els.push(R(mainX+24, 76, leftW, H_D-92, C.surface, 14));
  els.push(R(mainX+24, 76, 5, H_D-92, C.burgundy, 2));
  // Header
  els.push(T('RED WINE · BURGUNDY · FRANCE', mainX+48, 96, 9, C.burgundy, {fontWeight:700}));
  els.push(TSB('Chambolle-Musigny Premier Cru', mainX+48, 120, 24, C.ink));
  els.push(TS('"Les Amoureuses" · Roumier', mainX+48, 150, 16, C.mid));
  els.push(T('2018 · Pinot Noir · Côte de Nuits', mainX+48, 174, 13, C.muted));
  els.push(...ScoreCircle(mainX+48+leftW-70, 140, 44, 98, C.burgundy));

  // Price + action
  els.push(TSB('$1,200', mainX+48, 210, 28, C.ink));
  els.push(T('per bottle · case of 12 available', mainX+48, 240, 12, C.muted));
  els.push(R(mainX+48, 262, 160, 40, C.burgundy, 8));
  els.push(TB('Add to Cellar', mainX+72, 275, 13, C.white));
  els.push(R(mainX+220, 262, 140, 40, C.bg, 8));
  els.push(R(mainX+220, 262, 140, 40, C.border, 8));
  els.push(TB('Write a Note', mainX+240, 275, 13, C.ink));

  // Stars
  els.push(...RatingStars(mainX+48, 320, 4.9, C.gold));
  els.push(T('4.9 · 847 notes', mainX+136, 320, 12, C.muted));

  // Flavor tags
  const flvrs = ['Black Cherry','Violet','Rose Petal','Earth','Spice','Silk'];
  let ffx = mainX+48;
  flvrs.forEach(f => {
    const fw = f.length*7 + 16;
    els.push(R(ffx, 346, fw, 26, C.burgundy+'15', 13));
    els.push(T(f, ffx+8, 350, 11, C.burgundy, {fontWeight:600}));
    ffx += fw + 6;
    if (ffx > mainX+48+leftW-60) { ffx = mainX+48; }
  });

  // Tasting profile
  els.push(R(mainX+24, 394, leftW, 1, C.border));
  els.push(TB('Tasting Profile', mainX+48, 410, 13, C.ink));
  const tProf = [
    {attr:'Tannins', pct:0.55},
    {attr:'Acidity', pct:0.82},
    {attr:'Body', pct:0.62},
    {attr:'Fruit', pct:0.88},
    {attr:'Earthiness', pct:0.76},
    {attr:'Finish', pct:0.94},
  ];
  tProf.forEach((p,i) => {
    els.push(...TastingNote(mainX+48, 432+i*32, leftW-54, p.attr, p.pct, C.burgundy));
  });

  // Drinking window
  els.push(R(mainX+24, 646, leftW, 1, C.border));
  els.push(TB('Drinking Window', mainX+48, 662, 13, C.ink));
  els.push(T('Peak: 2026–2034 · Optimal: 2028', mainX+48, 682, 12, C.muted));
  els.push(...AgeBar(mainX+48, 702, leftW-54, 2018, 2028, 2036));

  // Winemaker note
  els.push(R(mainX+48, 740, leftW-24, 80, C.raised, 10));
  els.push(TS('"Ethereal and silky, this is the finest Amoureuses', mainX+64, 758, 12, C.mid));
  els.push(TS('we have produced. Time will reward patience."', mainX+64, 774, 12, C.mid));
  els.push(T('— Christophe Roumier, Domaine G. Roumier', mainX+64, 796, 11, C.muted));

  // Right: similar wines + community notes
  els.push(...Card(rightX, 76, rightW, 260, 12));
  els.push(T('SIMILAR WINES', rightX+16, 92, 9, C.muted, {fontWeight:700}));
  const similars = [
    { name:'Gevrey-Chambertin PC 2018', price:'$480', score:'95' },
    { name:'Vosne-Romanée Suchots 2019', price:'$580', score:'96' },
    { name:'Pommard Epenots Drouhin', price:'$220', score:'93' },
  ];
  similars.forEach((s,i) => {
    const sy = 112 + i*68;
    els.push(R(rightX+16, sy, rightW-32, 58, C.surface, 8));
    els.push(TS(s.name, rightX+28, sy+12, 13, C.ink));
    els.push(T(s.price + ' · ' + s.score + ' pts', rightX+28, sy+32, 11, C.muted));
    els.push(TB('View →', rightX+rightW-52, sy+14, 11, C.burgundy));
  });

  els.push(...Card(rightX, 352, rightW, 260, 12));
  els.push(T('COMMUNITY NOTES', rightX+16, 368, 9, C.muted, {fontWeight:700}));
  const cnotes = [
    { user:'@vinophile_m', rating:5, note:'"Absolutely breathtaking. The nose...' },
    { user:'@bordeaux_fan', rating:4.5, note:'"Superb balance. Will age beautifully...' },
    { user:'@wine_weekend', rating:5, note:'"Perfect with mushroom risotto. Silk."' },
  ];
  cnotes.forEach((n,i) => {
    const ny = 388 + i*72;
    els.push(T(n.user, rightX+16, ny, 11, C.mid, {fontWeight:700}));
    els.push(...RatingStars(rightX+16, ny+16, n.rating, C.gold));
    els.push(TS(n.note, rightX+16, ny+34, 11, C.mid));
  });

  els.push(...Card(rightX, 628, rightW, 200, 12));
  els.push(T('ADD YOUR NOTE', rightX+16, 644, 9, C.burgundy, {fontWeight:700}));
  els.push(R(rightX+16, 660, rightW-32, 40, C.surface, 8));
  els.push(TS('Your tasting impressions...', rightX+28, 674, 13, C.faint));
  els.push(...RatingStars(rightX+16, 716, 0, C.border));
  els.push(T('Tap to rate', rightX+100, 718, 11, C.muted));
  els.push(R(rightX+16, 744, rightW-32, 36, C.burgundy, 8));
  els.push(TB('Publish Note', rightX+rightW/2-40, 755, 12, C.white));

  return els;
}

function dCellar() {
  const els = [];
  const sideW = 220;
  const mainX = sideW;
  els.push(R(0,0,W_D,H_D,C.bg));
  els.push(...Sidebar());

  // Top bar
  els.push(R(mainX, 0, W_D-sideW, 60, C.bg));
  els.push(R(mainX, 59, W_D-sideW, 1, C.border));
  els.push(TSB('My Cellar', mainX+32, 20, 18, C.ink));
  els.push(T('47 bottles · $12,840 est. value', mainX+32, 46, 12, C.muted));
  els.push(R(W_D-180, 14, 140, 32, C.burgundy, 8));
  els.push(TB('+ Add Bottle', W_D-164, 23, 12, C.white));

  // Stats strip
  const stats = [
    { label:'Total Bottles', val:'47', sub:'across 18 producers' },
    { label:'Estimated Value', val:'$12,840', sub:'+$420 this month' },
    { label:'Ready to Drink', val:'23', sub:'optimal window now' },
    { label:'Avg Score', val:'93.4', sub:'pts · all wines' },
    { label:'Top Region', val:'Bordeaux', sub:'14 bottles' },
  ];
  const statW = Math.floor((W_D - mainX - 48) / stats.length) - 6;
  stats.forEach((s,i) => {
    const x = mainX+24 + i*(statW+6);
    els.push(...Card(x, 76, statW, 80, 10));
    els.push(TSB(s.val, x+14, 94, 20, C.ink));
    els.push(T(s.label, x+14, 120, 10, C.muted, {fontWeight:700}));
    els.push(T(s.sub, x+14, 136, 10, C.muted));
  });

  // Filter row
  const tabW = 100;
  const tabs2 = ['All Wines','Red','White','Rosé','Sparkling','Port'];
  els.push(R(mainX+24, 172, W_D-mainX-48, 40, C.surface, 10));
  tabs2.forEach((tab,i) => {
    const isActive = i===0;
    const x = mainX+28 + i*tabW;
    if (isActive) {
      els.push(R(x, 174, tabW-4, 36, C.white, 8));
    }
    els.push(T(tab, x+8, 187, 12, isActive ? C.ink : C.mid, {fontWeight: isActive ? 700 : 400}));
  });

  // Cellar grid
  const colCount = 4;
  const gapX = 8;
  const cardW = Math.floor((W_D - mainX - 48 - gapX*3) / colCount);
  const cellarWines = [
    { name:"Sassicaia 2019", region:"Bolgheri · Italy", varietal:"Cab Sauv blend", vintage:2019, score:'95 pts', type:'red', price:'$185', qty:3, status:'ready' },
    { name:"Krug Grande Cuvée", region:"Champagne · France", varietal:"Multi-vintage", vintage:0, score:'96 pts', type:'spark', price:'$220', qty:2, status:'drink' },
    { name:"Opus One 2018", region:"Napa Valley · US", varietal:"Cabernet Sauv", vintage:2018, score:'97 pts', type:'red', price:'$295', qty:6, status:'aging' },
    { name:"Penfolds Grange 2016", region:"Barossa · Australia", varietal:"Shiraz", vintage:2016, score:'98 pts', type:'red', price:'$620', qty:1, status:'aging' },
    { name:"Cloudy Bay Sauv Blanc", region:"Marlborough · NZ", varietal:"Sauvignon Blanc", vintage:2023, score:'91 pts', type:'white2', price:'$28', qty:4, status:'ready' },
    { name:"Dom Pérignon 2013", region:"Champagne · France", varietal:"Pinot Noir / Chard", vintage:2013, score:'97 pts', type:'spark', price:'$340', qty:2, status:'drink' },
    { name:"Barolo DOCG Mascarello", region:"Piedmont · Italy", varietal:"Nebbiolo", vintage:2017, score:'96 pts', type:'red', price:'$145', qty:3, status:'aging' },
    { name:"Château Palmer 2015", region:"Margaux · Bordeaux", varietal:"Merlot blend", vintage:2015, score:'96 pts', type:'red', price:'$380', qty:2, status:'aging' },
  ];

  const statusColor2 = { ready:C.sage, aging:C.tawny, drink:C.rosé };
  const statusLabel2 = { ready:'Ready to Drink', aging:'Still Aging', drink:'Drink Now' };

  cellarWines.forEach((w,i) => {
    const col = i % colCount;
    const row = Math.floor(i / colCount);
    const x = mainX + 24 + col * (cardW + gapX);
    const y = 228 + row * 140;
    const typeCol = C[w.type] || C.red;
    const sc2 = statusColor2[w.status] || C.muted;

    els.push(...Card(x, y, cardW, 124, 10));
    els.push(R(x, y, cardW, 4, typeCol, 2));
    // Status
    els.push(R(x+cardW-100, y+14, 92, 20, sc2+'18', 10));
    els.push(T(statusLabel2[w.status]||'', x+cardW-98, y+18, 9, sc2, {fontWeight:700}));
    // Info
    els.push(TS(w.name, x+12, y+20, 13, C.ink));
    els.push(T(w.region, x+12, y+40, 10, C.muted));
    els.push(T(w.varietal, x+12, y+54, 10, C.muted));
    // Stats row
    els.push(TB(String(w.qty)+'x', x+12, y+76, 12, C.ink));
    els.push(T(w.price, x+36, y+76, 12, C.muted));
    if (w.vintage) els.push(T(String(w.vintage), x+cardW-36, y+76, 11, C.muted));
    els.push(T(w.score, x+12, y+94, 10, C.burgundy, {fontWeight:700}));
  });

  return els;
}

function dJournal() {
  const els = [];
  const sideW = 220;
  const mainX = sideW;
  els.push(R(0,0,W_D,H_D,C.bg));
  els.push(...Sidebar());

  // Top bar
  els.push(R(mainX, 0, W_D-sideW, 60, C.bg));
  els.push(R(mainX, 59, W_D-sideW, 1, C.border));
  els.push(TSB('Tasting Journal', mainX+32, 20, 18, C.ink));
  els.push(T('48 notes · 32 producers · 14 countries', mainX+32, 46, 12, C.muted));
  els.push(R(W_D-220, 14, 180, 32, C.burgundy, 8));
  els.push(TB('+ New Tasting Note', W_D-208, 23, 12, C.white));

  // Two columns: journal list + detail
  const listW = 380;
  const detailX = mainX + listW + 24;
  const detailW = W_D - detailX - 24;

  // Journal list
  els.push(R(mainX+24, 76, listW, H_D-92, C.surface, 12));
  // Search
  els.push(R(mainX+36, 88, listW-24, 36, C.bg, 8));
  els.push(T('⌕  Filter notes...', mainX+52, 99, 12, C.muted));
  // Notes list
  const journalNotes = [
    { name:"DRC La Tâche 2018", region:"Burgundy · France", rating:5.0, date:"Mar 15, 2026", type:'red', active:true },
    { name:"Krug Grande Cuvée 171", region:"Champagne · France", rating:4.8, date:"Mar 8, 2026", type:'spark' },
    { name:"Gaja Barbaresco 2019", region:"Piedmont · Italy", rating:4.5, date:"Feb 28, 2026", type:'red' },
    { name:"Leeuwin Estate Art Series", region:"Margaret River · AU", rating:4.3, date:"Feb 20, 2026", type:'white2' },
    { name:"Sine Qua Non 2017", region:"California · US", rating:4.8, date:"Feb 14, 2026", type:'red' },
    { name:"Egon Müller Scharzhofberger", region:"Mosel · Germany", rating:4.7, date:"Jan 30, 2026", type:'white2' },
    { name:"Billecart-Salmon Blanc", region:"Champagne · France", rating:4.5, date:"Jan 18, 2026", type:'spark' },
  ];
  journalNotes.forEach((n,i) => {
    const y = 140 + i*82;
    const typeCol = C[n.type] || C.red;
    if (n.active) {
      els.push(R(mainX+24, y-4, listW, 82, C.burgundy+'0C', 0));
      els.push(R(mainX+24, y-4, 3, 82, C.burgundy, 0));
    }
    els.push(TS(n.name, mainX+44, y+8, 14, n.active ? C.ink : C.mid));
    els.push(T(n.region, mainX+44, y+28, 11, C.muted));
    els.push(...RatingStars(mainX+44, y+46, n.rating, C.gold));
    els.push(T(n.date, mainX+listW-70, y+10, 10, C.muted));
    // Type dot
    els.push(R(mainX+listW-18, y+28, 10, 10, typeCol, 5));
    if (i < journalNotes.length-1) els.push(R(mainX+44, y+76, listW-56, 1, C.rule));
  });

  // Detail panel - current note
  els.push(...Card(detailX, 76, detailW, H_D-92, 12));
  els.push(R(detailX, 76, detailW, 4, C.burgundy, 2));
  // Header
  els.push(T('MARCH 15, 2026 · RED WINE · BURGUNDY', detailX+24, 96, 9, C.muted, {fontWeight:700}));
  els.push(TSB('DRC La Tâche Grand Cru', detailX+24, 120, 22, C.ink));
  els.push(TS('Domaine de la Romanée-Conti · 2018', detailX+24, 148, 14, C.mid));
  // Score + rating
  els.push(...ScoreCircle(detailX+detailW-70, 140, 40, 100, C.burgundy));
  els.push(...RatingStars(detailX+24, 172, 5.0, C.gold));
  els.push(T('Perfect · 5.0 / 5.0', detailX+116, 172, 12, C.muted));
  // Context
  els.push(R(detailX+24, 196, detailW-48, 1, C.rule));
  els.push(T('Serving temp:', detailX+24, 212, 11, C.muted));
  els.push(T('16°C', detailX+110, 212, 11, C.ink, {fontWeight:600}));
  els.push(T('Glassware:', detailX+180, 212, 11, C.muted));
  els.push(T('Zalto Burgundy', detailX+242, 212, 11, C.ink, {fontWeight:600}));
  els.push(T('Decanted:', detailX+360, 212, 11, C.muted));
  els.push(T('90 min', detailX+418, 212, 11, C.ink, {fontWeight:600}));
  // The tasting note body
  els.push(R(detailX+24, 226, detailW-48, 1, C.rule));
  els.push(TB('Tasting Notes', detailX+24, 242, 13, C.ink));
  const noteLines = [
    '"The 2018 La Tâche possesses a transcendent quality that separates it from',
    'all other wines I have tasted this year. The color is a luminous ruby, almost',
    'garnet at the edges — a living painting.',
    '',
    'The nose is otherworldly: rose petal, black cherry, and woodland floor layer',
    'over a silky backbone. There is a florality here that reminds one of spring',
    'morning in the vineyards themselves.',
    '',
    'On the palate, the tannins are so fine they seem almost ethereal — present',
    'but yielding. The acidity is perfectly calibrated, lifting the fruit without',
    'sharpness. The finish lasts beyond three minutes and evolves continuously."',
  ];
  noteLines.forEach((line, i) => {
    els.push(TS(line, detailX+24, 264 + i*18, 13, C.mid));
  });
  // Flavor profile
  els.push(TB('Flavor Profile', detailX+24, 474, 13, C.ink));
  const dFlavors = ['Rose Petal','Black Cherry','Woodland Floor','Silk','Black Tea','Truffle','Violet'];
  let dfx = detailX+24;
  dFlavors.forEach(f => {
    const fw2 = f.length*7 + 16;
    els.push(R(dfx, 494, fw2, 26, C.burgundy+'15', 13));
    els.push(T(f, dfx+8, 498, 11, C.burgundy, {fontWeight:600}));
    dfx += fw2 + 6;
    if (dfx > detailX + detailW - 80) dfx = detailX + 24;
  });
  // Tasting attributes chart
  els.push(TB('Profile', detailX+24, 540, 13, C.ink));
  const jProf = [
    {attr:'Tannins',  pct:0.45},
    {attr:'Acidity',  pct:0.78},
    {attr:'Body',     pct:0.62},
    {attr:'Fruit',    pct:0.95},
    {attr:'Finish',   pct:0.99},
  ];
  jProf.forEach((p,i) => {
    els.push(...TastingNote(detailX+24, 562+i*28, detailW-48, p.attr, p.pct, C.burgundy));
  });
  // Pairing
  els.push(TB('Food Pairing', detailX+24, 716, 13, C.ink));
  const pairings = ['🦆 Duck confit', '🍄 Truffle risotto', '🧀 Aged comté', '🥩 Venison'];
  pairings.forEach((p,i) => {
    const x = detailX+24 + (i%2)*200;
    const y = 736 + Math.floor(i/2)*36;
    els.push(R(x, y, 188, 28, C.surface, 8));
    els.push(T(p, x+10, y+7, 12, C.mid));
  });

  return els;
}

// ── Assemble pen ───────────────────────────────────────────────────────────────

function makeScreen(id, w, h, elements) {
  return { type:'frame', id, x:0, y:0, width:w, height:h, fill:C.bg, children:elements };
}

const pen = {
  version: '2.8',
  children: [
    makeScreen('mDiscover',   W_M, H_M, mDiscover()),
    makeScreen('mDetail',     W_M, H_M, mDetail()),
    makeScreen('mCellar',     W_M, H_M, mCellar()),
    makeScreen('mNotes',      W_M, H_M, mNotes()),
    makeScreen('mSearch',     W_M, H_M, mSearch()),
    makeScreen('dDiscover',   W_D, H_D, dDiscover()),
    makeScreen('dDetail',     W_D, H_D, dDetail()),
    makeScreen('dCellar',     W_D, H_D, dCellar()),
    makeScreen('dJournal',    W_D, H_D, dJournal()),
  ],
};

// Count elements
let total = 0;
pen.children.forEach(screen => {
  const count = (screen.children || []).flat(Infinity).filter(Boolean).length;
  total += count;
  process.stdout.write(`  ${screen.id.padEnd(14)} ${screen.width}×${screen.height}  ${count} els\n`);
});

fs.writeFileSync('cork.pen', JSON.stringify(pen));
console.log(`\n✓ cork.pen — ${pen.children.length} screens, ${total} elements`);
