// EMULSION — Analog Film Photography Companion
// Inspired by: withframes.com (dark film notebook) + darkmodedesign.com warm-dark showcase
// Theme: DARK — warm darkroom palette, analog-meets-digital tactile UI
// Pencil.dev v2.8 generator

const fs = require('fs');

const C = {
  bg:         '#120F09',
  surface:    '#1D1913',
  card:       '#252017',
  lift:       '#2F2A1C',
  accent:     '#C8974A',
  accent2:    '#8B6230',
  accentLt:   'rgba(200,151,74,0.13)',
  green:      '#6BAF74',
  red:        '#C15F4E',
  purple:     '#8B6BAF',
  text:       '#EDE5D0',
  muted:      'rgba(237,229,208,0.42)',
  dim:        '#706550',
  border:     'rgba(200,151,74,0.16)',
  borderDim:  'rgba(237,229,208,0.08)',
};

const SF   = "'Georgia','Times New Roman',serif";
const MONO = "'SF Mono','Courier New',monospace";
const SANS = "'Inter','Helvetica Neue',sans-serif";

function t(content, x, y, w, h, o = {}) {
  return {
    type:'text', x, y, width:w, height:h, content,
    fontSize:o.fs||14, fontFamily:o.font||SANS, color:o.color||C.text,
    fontWeight:o.weight||'normal', textAlign:o.align||'left',
    opacity:o.opacity||1, backgroundColor:'transparent',
    letterSpacing:o.ls||0, borderRadius:0,
  };
}
function r(x, y, w, h, o = {}) {
  return {
    type:'rectangle', x, y, width:w, height:h,
    backgroundColor:o.bg||C.surface,
    borderRadius:o.r||8,
    borderColor:o.border||'transparent',
    borderWidth:o.bw||0,
    opacity:o.op||1,
  };
}
function ic(name, x, y, sz, color) {
  return { type:'icon', x, y, width:sz, height:sz, iconName:name, color:color||C.muted };
}
function circ(x, y, d, o = {}) {
  return { type:'ellipse', x, y, width:d, height:d,
    backgroundColor:o.bg||C.surface, borderColor:o.border||'transparent', borderWidth:o.bw||0 };
}
function ln(x, y, w, color) {
  return r(x, y, w, 1, { bg:color||C.border, r:0 });
}

// ── NAV BAR (reusable) ──────────────────────────────────────────────────────
function nav(activeIdx) {
  const items = [
    { icon:'home', label:'Home' },
    { icon:'camera', label:'Shoot' },
    null, // FAB
    { icon:'list', label:'Rolls' },
    { icon:'settings', label:'Gear' },
  ];
  const positions = [36, 116, 195, 258, 338];
  return [
    r(0, 720, 390, 72, { bg:C.surface, r:0 }),
    ln(0, 720, 390, C.border),
    circ(171, 720, 48, { bg:C.accent, border:C.bg, bw:3 }),
    ic('plus', 180, 730, 28, C.bg),
    ...items.flatMap((item, i) => {
      if (!item) return [];
      const active = i === activeIdx || (activeIdx === 2 && i === 3);
      return [
        ic(item.icon, positions[i]-12, 734, 24, active ? C.accent : C.dim),
        t(item.label, positions[i]-24, 760, 48, 12, { fs:9, font:MONO, color:active?C.accent:C.dim, align:'center' }),
      ];
    }),
  ];
}

function statusBar() {
  return [
    r(0, 0, 390, 50, { bg:C.bg, r:0 }),
    t('9:41', 20, 16, 60, 18, { font:MONO, fs:13, color:C.text }),
    ic('battery', 340, 16, 20, C.muted),
    ic('wifi', 316, 16, 18, C.muted),
  ];
}

// ─── SCREEN 1 · DASHBOARD ───────────────────────────────────────────────────
const s1 = {
  id:'dashboard', label:'Dashboard', backgroundColor:C.bg,
  widgets:[
    ...statusBar(),

    // Header
    t('EMULSION', 24, 62, 180, 34, { font:SF, fs:26, color:C.accent, weight:'700', ls:5 }),
    t('35mm · Portra 400', 24, 97, 180, 16, { fs:11, font:MONO, color:C.dim }),
    circ(348, 60, 36, { bg:C.card, border:C.border, bw:1.5 }),
    t('AK', 348, 70, 36, 18, { fs:11, color:C.accent, align:'center', weight:'700' }),

    // Active roll card
    r(20, 120, 350, 132, { bg:C.card, r:16, border:C.border, bw:1 }),
    r(20, 120, 350, 3, { bg:C.accent, r:0 }),
    t('ACTIVE ROLL', 40, 133, 120, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    t('Roll #14 — Kyoto Streets', 40, 150, 280, 20, { fs:16, color:C.text, weight:'600' }),
    t('Kodak Portra 400  ·  Canon AE-1', 40, 172, 260, 16, { fs:11, font:MONO, color:C.muted }),
    // progress bar
    r(40, 194, 310, 6, { bg:'rgba(237,229,208,0.09)', r:3 }),
    r(40, 194, 197, 6, { bg:C.accent, r:3 }),
    t('25', 40, 206, 40, 14, { fs:11, font:MONO, color:C.accent, weight:'700' }),
    t('frames shot', 68, 206, 80, 14, { fs:11, color:C.dim }),
    t('11 left', 310, 206, 58, 14, { fs:11, font:MONO, color:C.muted, align:'right' }),
    // film perforations decoration
    ...Array.from({length:6},(_,i)=> r(40+i*54, 226, 12, 18, { bg:'rgba(237,229,208,0.05)', r:2 })),

    // Stats row
    ...[[14,'Rolls',20],[312,'Frames',140],[8,'Stocks',260]].flatMap(([val,lbl,x])=>[
      r(x, 266, 110, 76, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
      t(String(val), x+55, 278, 60, 30, { fs:26, font:SF, color:C.text, weight:'700', align:'center' }),
      t(lbl, x+55, 312, 60, 14, { fs:10, font:MONO, color:C.dim, align:'center', ls:1 }),
    ]),

    // Recent shots header
    t('RECENT SHOTS', 24, 358, 160, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    t('See all', 310, 358, 60, 14, { fs:11, color:C.accent, align:'right' }),

    // Shot items
    ...[
      { scene:'Nishiki Market, Gate', settings:'f/2.8  ·  1/125s  ·  ISO 400', frame:'Frame 25', dot:C.green },
      { scene:'Kinkaku-ji Temple', settings:'f/5.6  ·  1/500s  ·  ISO 400', frame:'Frame 24', dot:C.dim },
      { scene:"Philosopher's Path", settings:'f/4.0  ·  1/250s  ·  ISO 400', frame:'Frame 23', dot:C.accent },
    ].flatMap((shot, i)=>[
      r(20, 378+i*68, 350, 60, { bg:C.card, r:12 }),
      circ(40, 390+i*68, 36, { bg:C.lift, border:'rgba(200,151,74,0.2)', bw:1 }),
      ic('camera', 45, 395+i*68, 26, i===0?C.accent:C.dim),
      t(shot.scene, 88, 386+i*68, 210, 16, { fs:13, color:C.text, weight:'500' }),
      t(shot.settings, 88, 404+i*68, 210, 14, { fs:11, font:MONO, color:C.muted }),
      t(shot.frame, 300, 386+i*68, 64, 14, { fs:10, font:MONO, color:C.dim, align:'right' }),
      circ(355, 394+i*68, 10, { bg:shot.dot }),
    ]),

    ...nav(0),
  ],
};

// ─── SCREEN 2 · SHOT LOGGER ─────────────────────────────────────────────────
const s2 = {
  id:'shot-logger', label:'Log a Shot', backgroundColor:C.bg,
  widgets:[
    ...statusBar(),
    ic('arrow-left', 20, 62, 22, C.text),
    t('Log Shot', 195, 59, 100, 24, { fs:18, color:C.text, weight:'600', align:'center' }),
    t('Frame 26', 310, 62, 70, 18, { fs:12, font:MONO, color:C.accent, align:'right' }),

    // Shutter dial section
    t('SHUTTER SPEED', 195, 98, 200, 14, { fs:9, font:MONO, color:C.dim, align:'center', ls:2 }),
    // Outer ring
    circ(147, 122, 96, { bg:C.lift, border:C.border, bw:2 }),
    // Inner hub
    circ(171, 146, 48, { bg:C.card, border:C.border, bw:1 }),
    // Tick marks at 12, 3, 6, 9 positions
    r(193, 122, 4, 16, { bg:C.accent, r:2 }),
    r(193, 202, 4, 16, { bg:C.dim, r:2 }),
    r(147, 162, 16, 4, { bg:C.dim, r:2 }),
    r(225, 162, 16, 4, { bg:C.dim, r:2 }),
    // Center value
    t('1/125', 171, 155, 58, 24, { fs:18, font:SF, color:C.text, weight:'700', align:'center' }),
    t('sec', 209, 161, 22, 12, { fs:9, font:MONO, color:C.accent }),

    // Shutter presets strip
    ...['1/1000','1/500','1/250','1/125','1/60','1/30','1/15'].flatMap((v,i)=>{
      const active = v==='1/125';
      return [
        r(16+i*52, 252, 46, 28, { bg:active?C.accentLt:'transparent', border:active?C.accent:C.borderDim, bw:1, r:6 }),
        t(v, 16+i*52, 258, 46, 16, { fs:10, font:MONO, color:active?C.accent:C.muted, align:'center' }),
      ];
    }),

    ln(20, 300, 350, C.borderDim),

    // Aperture + ISO cards
    r(20, 314, 168, 90, { bg:C.card, r:14, border:C.borderDim, bw:1 }),
    t('APERTURE', 104, 324, 120, 14, { fs:9, font:MONO, color:C.dim, align:'center', ls:2 }),
    t('f/2.8', 104, 346, 120, 30, { fs:28, font:SF, color:C.accent, weight:'700', align:'center' }),
    ic('chevron-left', 28, 354, 20, C.dim),
    ic('chevron-right', 162, 354, 20, C.dim),

    r(202, 314, 168, 90, { bg:C.card, r:14, border:C.borderDim, bw:1 }),
    t('ISO', 286, 324, 120, 14, { fs:9, font:MONO, color:C.dim, align:'center', ls:2 }),
    t('400', 286, 346, 120, 30, { fs:28, font:SF, color:C.text, weight:'700', align:'center' }),
    ic('chevron-left', 210, 354, 20, C.dim),
    ic('chevron-right', 352, 354, 20, C.dim),

    // Notes field
    t('NOTES', 24, 422, 80, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    r(20, 440, 350, 56, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
    t('Golden hour — temple gate, backlit', 36, 454, 310, 18, { fs:13, font:SF, color:C.muted }),

    // Location row
    r(20, 508, 350, 46, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
    ic('map-pin', 36, 521, 20, C.accent),
    t('Kinkaku-ji, Kyoto', 62, 523, 210, 16, { fs:13, color:C.text }),
    t('Update', 304, 523, 54, 16, { fs:11, color:C.accent, align:'right' }),

    // Exposure meter
    t('EXPOSURE', 24, 572, 120, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    r(20, 590, 350, 12, { bg:'rgba(237,229,208,0.07)', r:6 }),
    // Gradient bar (under=red, balanced=green, over=amber)
    r(20, 590, 116, 12, { bg:C.red, r:0, op:0.3 }),
    r(136, 590, 118, 12, { bg:C.green, r:0, op:0.35 }),
    r(254, 590, 116, 12, { bg:C.accent, r:0, op:0.3 }),
    // Needle at +0.3 (slightly right of center)
    r(192, 584, 3, 24, { bg:C.text, r:2 }),
    t('−3', 20, 604, 28, 12, { fs:9, font:MONO, color:C.red }),
    t('0', 191, 604, 20, 12, { fs:9, font:MONO, color:C.muted, align:'center' }),
    t('+3', 348, 604, 28, 12, { fs:9, font:MONO, color:C.dim, align:'right' }),

    // Save CTA
    r(20, 644, 350, 54, { bg:C.accent, r:16 }),
    t('LOG FRAME 26', 195, 660, 200, 22, { fs:15, font:MONO, color:C.bg, weight:'700', align:'center', ls:1 }),

    ...nav(1),
  ],
};

// ─── SCREEN 3 · ROLL DETAIL ─────────────────────────────────────────────────
const s3 = {
  id:'roll-detail', label:'Roll Detail', backgroundColor:C.bg,
  widgets:[
    ...statusBar(),
    ic('arrow-left', 20, 62, 22, C.text),
    t('Roll #14', 195, 59, 100, 24, { fs:18, color:C.text, weight:'600', align:'center' }),
    ic('more-horizontal', 352, 62, 22, C.dim),

    // Roll info card
    r(20, 92, 350, 92, { bg:C.card, r:16, border:C.border, bw:1 }),
    r(20, 92, 5, 92, { bg:C.accent, r:3 }),
    t('Kyoto Streets', 38, 100, 260, 20, { fs:17, color:C.text, weight:'700' }),
    t('Kodak Portra 400  ·  Canon AE-1 Program', 38, 122, 290, 14, { fs:11, font:MONO, color:C.muted }),
    t('March 28 – Apr 6, 2026', 38, 140, 200, 14, { fs:11, color:C.dim }),
    r(282, 106, 72, 28, { bg:C.accentLt, r:8, border:C.accent, bw:1 }),
    t('25 / 36', 282, 113, 72, 16, { fs:12, font:MONO, color:C.accent, align:'center', weight:'700' }),

    // Filmstrip
    t('FILMSTRIP', 24, 198, 120, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    r(0, 214, 390, 102, { bg:C.surface, r:0 }),
    ...Array.from({length:12},(_,i)=> r(8+i*32, 216, 14, 10, { bg:'rgba(237,229,208,0.06)', r:2 })),
    ...Array.from({length:7},(_,i)=>{
      const logged=i<5, active=i===4;
      return [
        r(8+i*54, 230, 46, 66, {
          bg:logged?(active?C.lift:'rgba(200,151,74,0.07)'):'rgba(237,229,208,0.02)',
          r:4, border:active?C.accent:(logged?'rgba(200,151,74,0.2)':C.borderDim), bw:active?2:1
        }),
        t(String(i+21), 8+i*54+23, 288, 46, 12, {
          fs:9, font:MONO, color:active?C.accent:(logged?C.muted:C.dim), align:'center'
        }),
      ];
    }).flat(),
    ...Array.from({length:12},(_,i)=> r(8+i*32, 304, 14, 10, { bg:'rgba(237,229,208,0.06)', r:2 })),

    // Frame list
    t('LOGGED FRAMES', 24, 332, 160, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),

    ...[
      { n:'25', scene:'Nishiki Market, Gate', settings:'f/2.8 · 1/125s', dot:C.green },
      { n:'24', scene:'Kinkaku-ji Temple', settings:'f/5.6 · 1/500s', dot:C.dim },
      { n:'23', scene:"Philosopher's Path", settings:'f/4.0 · 1/250s', dot:C.green },
      { n:'22', scene:'Fushimi Inari Torii', settings:'f/8.0 · 1/1000s', dot:C.accent },
    ].flatMap((fr,i)=>[
      r(20, 352+i*68, 350, 60, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
      r(32, 364+i*68, 28, 28, { bg:C.accentLt, r:6 }),
      t(fr.n, 32, 370+i*68, 28, 16, { fs:11, font:MONO, color:C.accent, weight:'700', align:'center' }),
      t(fr.scene, 72, 360+i*68, 220, 16, { fs:13, color:C.text, weight:'500' }),
      t(fr.settings, 72, 378+i*68, 220, 14, { fs:11, font:MONO, color:C.muted }),
      circ(352, 368+i*68, 10, { bg:fr.dot }),
    ]),

    ...nav(3),
  ],
};

// ─── SCREEN 4 · FILM ARCHIVE ─────────────────────────────────────────────────
const s4 = {
  id:'film-archive', label:'Film Archive', backgroundColor:C.bg,
  widgets:[
    ...statusBar(),
    t('Archive', 24, 62, 200, 30, { fs:24, color:C.text, weight:'700', font:SF }),
    t('14 rolls · 312 frames', 24, 94, 200, 16, { fs:11, font:MONO, color:C.muted }),
    ic('filter', 352, 64, 24, C.dim),

    // Search
    r(20, 118, 350, 42, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
    ic('search', 36, 130, 18, C.dim),
    t('Search rolls, stocks, locations...', 62, 130, 260, 18, { fs:13, color:C.dim }),

    // Filter chips
    ...['All','Portra','Tri-X','HP5','Gold 200'].flatMap((label,i)=>{
      const active=i===0;
      const widths=[36,56,38,46,72];
      const offsets=[0,44,108,154,208];
      return [
        r(20+offsets[i], 172, widths[i], 28, { bg:active?C.accent:C.card, r:14, border:active?C.accent:C.borderDim, bw:1 }),
        t(label, 20+offsets[i], 179, widths[i], 14, { fs:10, font:MONO, color:active?C.bg:C.muted, align:'center', weight:active?'700':'normal' }),
      ];
    }),

    // Roll grid cards
    ...[
      { n:'14', title:'Kyoto Streets', stock:'Portra 400', date:'Apr 2026', pct:0.69, frames:'25/36', color:C.accent },
      { n:'13', title:'Tokyo Rain', stock:'HP5 Plus', date:'Mar 2026', pct:1, frames:'36/36', color:C.green },
      { n:'12', title:'Osaka Night', stock:'Cinestill 800T', date:'Mar 2026', pct:1, frames:'36/36', color:C.purple },
      { n:'11', title:'Nara Deer Park', stock:'Gold 200', date:'Feb 2026', pct:1, frames:'36/36', color:C.green },
    ].flatMap((roll,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const x=20+col*185, y=216+row*148;
      return [
        r(x, y, 168, 138, { bg:C.card, r:14, border:i===0?C.border:C.borderDim, bw:1 }),
        r(x, y, 168, 3, { bg:roll.color, r:0 }),
        r(x+12, y+12, 26, 20, { bg:C.accentLt, r:5 }),
        t('#'+roll.n, x+12, y+15, 26, 14, { fs:9, font:MONO, color:C.accent, align:'center', weight:'700' }),
        t(roll.title, x+12, y+38, 144, 16, { fs:13, color:C.text, weight:'600' }),
        t(roll.stock, x+12, y+56, 144, 14, { fs:10, font:MONO, color:C.muted }),
        t(roll.date, x+12, y+74, 80, 12, { fs:10, color:C.dim }),
        r(x+12, y+92, 144, 4, { bg:'rgba(237,229,208,0.08)', r:2 }),
        r(x+12, y+92, Math.round(144*roll.pct), 4, { bg:roll.color, r:2, op:0.7 }),
        t(roll.frames, x+12, y+100, 100, 12, { fs:9, font:MONO, color:C.dim }),
      ];
    }),

    ...nav(3),
  ],
};

// ─── SCREEN 5 · GEAR BAG ─────────────────────────────────────────────────────
const s5 = {
  id:'gear-bag', label:'Gear Bag', backgroundColor:C.bg,
  widgets:[
    ...statusBar(),

    // Profile
    circ(195, 68, 72, { bg:C.lift, border:C.border, bw:2 }),
    ic('user', 206, 79, 50, C.accent),
    t('Alex Kim', 195, 148, 200, 22, { fs:18, color:C.text, weight:'700', font:SF, align:'center' }),
    t('@alexkim35mm', 195, 172, 200, 16, { fs:12, font:MONO, color:C.dim, align:'center' }),

    // Stats bar
    r(20, 200, 350, 64, { bg:C.card, r:14, border:C.borderDim, bw:1 }),
    ...[['14','Rolls',75],['312','Frames',195],['8','Stocks',315]].flatMap(([val,lbl,cx],i)=>[
      t(val, cx-40, 212, 80, 24, { fs:20, font:SF, color:C.text, weight:'700', align:'center' }),
      t(lbl, cx-40, 238, 80, 14, { fs:9, font:MONO, color:C.dim, align:'center', ls:1 }),
      ...(i<2?[r(20+(i+1)*116, 208, 1, 48, { bg:C.borderDim, r:0 })]:[]),
    ]),

    // Cameras
    t('MY CAMERAS', 24, 286, 160, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    t('+ Add', 330, 286, 44, 14, { fs:11, color:C.accent, align:'right' }),

    ...[
      { name:'Canon AE-1 Program', desc:'35mm SLR  ·  FD Mount', active:true },
      { name:'Olympus XA2', desc:'35mm Compact  ·  Fixed Lens', active:false },
    ].flatMap((cam,i)=>[
      r(20, 306+i*64, 350, 54, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
      ic('camera', 36, 320+i*64, 24, i===0?C.accent:C.dim),
      t(cam.name, 70, 312+i*64, 220, 16, { fs:13, color:C.text, weight:'500' }),
      t(cam.desc, 70, 330+i*64, 220, 14, { fs:10, font:MONO, color:C.muted }),
      ...(cam.active?[
        r(284, 314+i*64, 68, 22, { bg:C.accentLt, r:11, border:C.accent, bw:1 }),
        t('Active', 284, 318+i*64, 68, 14, { fs:9, font:MONO, color:C.accent, align:'center', weight:'700' }),
      ]:[]),
    ]),

    // Film inventory
    t('FILM INVENTORY', 24, 450, 160, 14, { fs:9, font:MONO, color:C.dim, ls:2 }),
    t('+ Add', 330, 450, 44, 14, { fs:11, color:C.accent, align:'right' }),

    ...[
      { name:'Kodak Portra 400', qty:'3 rolls', color:C.accent },
      { name:'Ilford HP5 Plus', qty:'5 rolls', color:C.dim },
      { name:'Cinestill 800T', qty:'2 rolls', color:C.purple },
    ].flatMap((stock,i)=>[
      r(20, 470+i*58, 350, 48, { bg:C.card, r:12, border:C.borderDim, bw:1 }),
      r(20, 470+i*58, 4, 48, { bg:stock.color, r:3, op:0.9 }),
      t(stock.name, 36, 482+i*58, 240, 16, { fs:13, color:C.text, weight:'500' }),
      t(stock.qty, 300, 482+i*58, 60, 16, { fs:11, font:MONO, color:stock.color, align:'right', weight:'600' }),
    ]),

    // Export
    r(20, 650, 350, 52, { bg:C.card, r:14, border:C.border, bw:1 }),
    ic('share', 44, 664, 22, C.accent),
    t('Export to Lightroom', 76, 663, 220, 20, { fs:14, color:C.text, weight:'500' }),
    ic('chevron-right', 348, 664, 20, C.dim),

    ...nav(4),
  ],
};

// ─── Write .pen ──────────────────────────────────────────────────────────────
const pen = {
  version:'2.8',
  meta:{
    name:'Emulsion',
    tagline:'Every frame, captured perfectly.',
    description:'Analog film photography companion app — log exposures with tactile dial UI, track film rolls, manage gear. Dark warmth of a real darkroom. Inspired by withframes.com and the dark mode aesthetic on darkmodedesign.com.',
    author:'RAM Design Heartbeat',
    created:new Date().toISOString(),
    theme:'dark',
  },
  canvas:{ width:390, height:792, backgroundColor:C.bg },
  screens:[s1,s2,s3,s4,s5],
};

fs.writeFileSync('emulsion.pen', JSON.stringify(pen, null, 2));
console.log('✓ emulsion.pen written —', JSON.stringify(pen).length.toLocaleString(), 'chars,', pen.screens.length, 'screens');
