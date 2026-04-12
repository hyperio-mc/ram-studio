// DECK — DJ controller app where the interface IS hardware
// Inspired by: Subframe.com hardware command pill (skeuomorphic in flat UI)
// Palette: near-black chassis + steel gray hardware + amber LED + cyan waveform
// Anti-pattern: no Spotify-dark, no glass, no flat icons — tactile physical hardware

const fs = require('fs');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  chassis:  '#0A0B0C',   // near-black metal chassis
  panel:    '#141618',   // panel surface (slightly lighter)
  groove:   '#1A1D21',   // deep inset groove
  steel:    '#2A2D32',   // steel gray hardware body
  steelMid: '#3D4147',   // mid steel (inactive states)
  steelHi:  '#52575F',   // steel highlight edge
  steelLo:  '#1E2125',   // steel shadow edge

  // LED colors
  ledOff:   '#1C1E20',   // LED dead (off)
  ledGreen: '#22C55E',   // LED green (safe zone)
  ledYellow:'#EAB308',   // LED yellow (hot)
  ledRed:   '#EF4444',   // LED red (clip)
  ledAmber: '#F97316',   // amber warm active (cue, buttons)
  ledCyan:  '#00D4FF',   // cyan waveform / sync
  ledWhite: '#F8FAFC',   // bright white indicator

  // Text
  label:    '#8B9099',   // hardware label engraved (muted gray)
  labelHi:  '#C4C9D1',   // active label
  readout:  '#00D4FF',   // BPM readout (cyan LED display)
  waveform: '#00D4FF',   // waveform trace

  // Crossfader / mixer
  faderTrack: '#111315',
  faderCap:   '#4A5058',
  faderHi:    '#6B7280',
};

const W_M = 390, H_M = 844;
const W_D = 1440, H_D = 900;

// ── Primitives ─────────────────────────────────────────────────────────────────
const R = (x,y,w,h,fill,r=0,opts={}) => ({
  type:'rectangle', x, y, width:Math.max(0,w), height:Math.max(0,h),
  fill, cornerRadius:r, ...opts
});
const T = (content,x,y,size,fill,opts={}) => ({
  type:'text', content: String(content), x, y, fontSize:size, fill,
  fontFamily:'JetBrains Mono', fontWeight:400, ...opts
});
const TB = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontWeight:700,...opts});
const TS = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontFamily:'Inter',fontWeight:400,...opts});
const TSB = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontFamily:'Inter',fontWeight:700,...opts});

// ── Hardware Components ────────────────────────────────────────────────────────

// Vinyl platter: concentric ring simulation using layered rects (circles via high cornerRadius)
function Platter(cx, cy, r, isPlaying=true, trackLabel='') {
  const els = [];
  // outer rim
  els.push(R(cx-r, cy-r, r*2, r*2, C.steel, r));
  // groove rings (3 bands)
  const rInner = r - 6;
  els.push(R(cx-rInner, cy-rInner, rInner*2, rInner*2, C.groove, rInner));
  const rMid = rInner - 12;
  els.push(R(cx-rMid, cy-rMid, rMid*2, rMid*2, C.steelLo+'88', rMid));
  const rInner2 = rMid - 10;
  els.push(R(cx-rInner2, cy-rInner2, rInner2*2, rInner2*2, C.groove, rInner2));
  const rLabel = rInner2 - 8;
  els.push(R(cx-rLabel, cy-rLabel, rLabel*2, rLabel*2, C.steel, rLabel));
  // center spindle
  els.push(R(cx-8, cy-8, 16, 16, C.steelHi, 8));
  els.push(R(cx-4, cy-4, 8, 8, C.chassis, 4));
  // position needle indicator
  if (isPlaying) {
    els.push(R(cx + rInner - 10, cy - 2, 18, 4, C.ledAmber, 2));
  }
  // track label on platter center
  if (trackLabel) {
    els.push(TS(trackLabel, cx - rLabel + 4, cy - 8, 8, C.labelHi,
      {textAlign:'center', width: rLabel * 2 - 8}));
  }
  return els;
}

// LED bar meter: stacked thin rects simulating a VU meter
// level: 0.0 – 1.0
function LedMeter(x, y, w, h, level=0.7, vertical=true) {
  const els = [];
  const segments = 20;
  const gap = 2;
  if (vertical) {
    const segH = Math.floor((h - gap * (segments-1)) / segments);
    for (let i = 0; i < segments; i++) {
      const sy = y + h - (i+1) * (segH + gap);
      const active = (i / segments) < level;
      let col = C.ledOff;
      if (active) {
        if (i / segments < 0.6) col = C.ledGreen;
        else if (i / segments < 0.8) col = C.ledYellow;
        else col = C.ledRed;
      }
      els.push(R(x, sy, w, segH, col, 1));
    }
  } else {
    const segW = Math.floor((w - gap * (segments-1)) / segments);
    for (let i = 0; i < segments; i++) {
      const sx = x + i * (segW + gap);
      const active = (i / segments) < level;
      let col = C.ledOff;
      if (active) {
        if (i / segments < 0.6) col = C.ledGreen;
        else if (i / segments < 0.8) col = C.ledYellow;
        else col = C.ledRed;
      }
      els.push(R(sx, y, segW, h, col, 1));
    }
  }
  return els;
}

// Rotary knob: circular body + value arc + center dot
function Knob(cx, cy, r, value=0.5, label='', col=C.ledAmber) {
  const els = [];
  // body
  els.push(R(cx-r, cy-r, r*2, r*2, C.steel, r));
  els.push(R(cx-r+3, cy-r+3, (r-3)*2, (r-3)*2, C.groove, r-3));
  // value indicator line (approximated as a small rect at the "position")
  const angle = -140 + value * 280; // degrees, -140 to +140
  const rad = (angle * Math.PI) / 180;
  const ix = cx + Math.cos(rad) * (r - 6);
  const iy = cy + Math.sin(rad) * (r - 6);
  els.push(R(ix - 2, iy - 2, 5, 5, col, 2));
  // center dot
  els.push(R(cx - 4, cy - 4, 8, 8, C.steelHi, 4));
  els.push(R(cx - 2, cy - 2, 4, 4, C.chassis, 2));
  // label
  if (label) {
    els.push(T(label, cx - r, cy + r + 5, 8, C.label,
      {textAlign:'center', width: r * 2}));
  }
  return els;
}

// Hardware button (illuminated)
function HwButton(x, y, w, h, label, lit=false, col=C.ledAmber, r=4) {
  const els = [];
  // button body with bevel
  els.push(R(x, y, w, h, C.steelMid, r));
  els.push(R(x+1, y+1, w-2, h-2, lit ? C.steel : C.groove, r-1));
  if (lit) {
    // glow overlay
    els.push(R(x+2, y+2, w-4, 4, col+'44', r-2));
  }
  // LED dot
  els.push(R(x + w/2 - 3, y + 6, 6, 6, lit ? col : C.ledOff, 3));
  // label
  els.push(T(label, x+2, y+h-12, 8, lit ? C.labelHi : C.label,
    {textAlign:'center', width: w-4}));
  return els;
}

// Fader: track + cap
function Fader(x, y, w, h, value=0.5, label='', orient='vertical') {
  const els = [];
  if (orient === 'vertical') {
    // track
    els.push(R(x + w/2 - 2, y + 8, 4, h - 16, C.faderTrack, 2));
    // track groove
    els.push(R(x + w/2 - 1, y + 8, 2, h - 16, C.groove, 1));
    // cap position (value 0=bottom, 1=top)
    const capY = y + 8 + (1-value) * (h - 48);
    els.push(R(x + 4, capY, w - 8, 32, C.faderCap, 3));
    els.push(R(x + 6, capY + 14, w - 12, 4, C.faderHi, 2));
    if (label) els.push(T(label, x, y + h + 4, 8, C.label, {textAlign:'center', width:w}));
  } else {
    // horizontal
    els.push(R(x + 8, y + h/2 - 2, w - 16, 4, C.faderTrack, 2));
    const capX = x + 8 + value * (w - 48);
    els.push(R(capX, y + 4, 32, h - 8, C.faderCap, 3));
    els.push(R(capX + 14, y + 6, 4, h - 12, C.faderHi, 2));
    if (label) els.push(T(label, x, y + h + 4, 8, C.label));
  }
  return els;
}

// Waveform strip: simulated audio waveform using vertical rects
function Waveform(x, y, w, h, playhead=0.35) {
  const els = [];
  // background
  els.push(R(x, y, w, h, C.groove, 2));
  // waveform bars
  const bars = 80;
  const barW = Math.floor((w - 2) / bars);
  const seed = [0.4,0.7,0.3,0.9,0.5,0.6,0.2,0.8,0.45,0.75,0.35,0.85,0.55,0.65,
                0.3,0.9,0.4,0.7,0.6,0.5,0.8,0.3,0.7,0.4,0.9,0.5,0.6,0.2,0.8,0.45,
                0.75,0.35,0.85,0.55,0.65,0.3,0.9,0.4,0.7,0.6,0.5,0.8,0.3,0.7,0.4,
                0.9,0.5,0.6,0.2,0.8,0.45,0.75,0.35,0.85,0.55,0.65,0.3,0.9,0.4,0.7,
                0.6,0.5,0.8,0.3,0.7,0.4,0.9,0.5,0.6,0.2,0.8,0.45,0.75,0.35,0.85,
                0.55,0.65,0.3,0.9,0.4];
  const midY = y + h/2;
  for (let i = 0; i < bars; i++) {
    const amp = seed[i % seed.length];
    const barH = amp * (h - 4);
    const bx = x + 1 + i * (barW + 1);
    const played = i / bars < playhead;
    const isPlayhead = Math.abs(i / bars - playhead) < 0.02;
    const col = isPlayhead ? C.ledWhite : played ? C.ledCyan : C.steelMid + '88';
    els.push(R(bx, midY - barH/2, barW, barH, col, 1));
  }
  // playhead line
  const phX = x + 1 + playhead * w;
  els.push(R(phX - 1, y, 2, h, C.ledWhite, 0));
  return els;
}

// BPM readout (LED display style)
function BpmDisplay(x, y, bpm='128.0', label='BPM') {
  const els = [];
  els.push(R(x, y, 80, 36, C.groove, 4));
  els.push(R(x+2, y+2, 76, 32, C.chassis, 3));
  els.push(TB(bpm, x+8, y+8, 16, C.readout, {letterSpacing:2}));
  els.push(T(label, x+8, y+26, 8, C.label));
  return els;
}

// Hardware pill (Subframe-inspired command pill — skeuomorphic in flat context)
function HwPill(x, y, w, h, tabs=[], activeIdx=0) {
  const els = [];
  // pill body with bevel
  els.push(R(x, y, w, h, C.steelLo, h/2));
  els.push(R(x+1, y+1, w-2, h-2, C.steel, h/2-1));
  els.push(R(x+2, y+2, w-4, 6, C.steelHi+'44', h/2-2));
  const tabW = Math.floor((w - 8) / tabs.length);
  tabs.forEach((tab, i) => {
    const tx = x + 4 + i * tabW;
    const active = i === activeIdx;
    if (active) {
      els.push(R(tx, y+3, tabW, h-6, C.chassis, h/2-3));
      els.push(R(tx+1, y+4, tabW-2, h-8, C.groove, h/2-4));
      els.push(TSB(tab, tx, y+4, 10, C.ledCyan,
        {textAlign:'center', width:tabW}));
    } else {
      els.push(TS(tab, tx, y+4, 10, C.label,
        {textAlign:'center', width:tabW}));
    }
  });
  return els;
}

// EQ band (3-band: LOW / MID / HI)
function EqBand(x, y, w, label, value=0.5) {
  const els = [];
  const knobR = w * 0.38;
  const cx = x + w/2;
  const cy = y + knobR + 4;
  els.push(...Knob(cx, cy, knobR, value, label,
    label === 'HI' ? C.ledCyan : label === 'MID' ? C.ledAmber : C.ledGreen));
  return els;
}

// ── Screen builders ────────────────────────────────────────────────────────────

// mDeck — vinyl platter + waveform + transport
function mDeck() {
  const els = [R(0,0,W_M,H_M,C.chassis)];

  // Top bar
  els.push(R(0,0,W_M,44,C.panel));
  els.push(...HwPill(12,8,180,28,['DECK','MIX','FX','LIB'],0));
  els.push(...BpmDisplay(W_M-100,4,128.0));

  // Platter (large, central)
  const pr = 130;
  const pcx = W_M/2, pcy = 200 + pr;
  els.push(...Platter(pcx, pcy, pr, true, 'Bicep — Glue'));

  // LED meters (left + right of platter)
  els.push(...LedMeter(18, 120, 10, 200, 0.78));
  els.push(...LedMeter(32, 120, 10, 200, 0.72));
  els.push(...LedMeter(W_M-28, 120, 10, 200, 0.65));
  els.push(...LedMeter(W_M-42, 120, 10, 200, 0.70));

  // Waveform strip
  els.push(...Waveform(16, 378, W_M-32, 52, 0.35));

  // Transport controls row
  const btnY = 446;
  const btns = [
    {label:'◀◀', lit:false, x:16},
    {label:'◀',  lit:false, x:64},
    {label:'▶▶', lit:true,  x:112, col:C.ledCyan},
    {label:'CUE', lit:true,  x:160, col:C.ledAmber},
    {label:'SYNC',lit:false, x:220},
    {label:'LOOP',lit:false, x:280},
    {label:'HOT', lit:true,  x:338, col:C.ledRed},
  ];
  btns.forEach(b => {
    els.push(...HwButton(b.x, btnY, 42, 38, b.label, b.lit, b.col||C.ledAmber));
  });

  // EQ knobs
  const eqY = 510;
  els.push(...EqBand(16,   eqY, 72, 'LOW', 0.6));
  els.push(...EqBand(96,   eqY, 72, 'MID', 0.5));
  els.push(...EqBand(176,  eqY, 72, 'HI',  0.7));

  // Gain / Volume knobs
  els.push(...Knob(310, eqY+36, 28, 0.72, 'GAIN',   C.ledAmber));
  els.push(...Knob(362, eqY+36, 28, 0.85, 'VOL',    C.ledCyan));

  // Pitch fader
  els.push(...Fader(268, 504, 24, 120, 0.52, 'PITCH'));

  // Crossfader section
  els.push(R(0, H_M-100, W_M, 100, C.panel));
  els.push(T('CROSSFADER', 16, H_M-92, 8, C.label));
  els.push(...Fader(16, H_M-80, W_M-32, 28, 0.48, '', 'horizontal'));

  // Channel A/B labels
  els.push(TSB('A', 16, H_M-46, 11, C.ledAmber));
  els.push(TSB('B', W_M-24, H_M-46, 11, C.ledCyan));

  // Hot cue pads (4 on each side)
  const padY = H_M - 50;
  const padColors = [C.ledAmber, C.ledCyan, C.ledGreen, C.ledRed];
  for (let i=0; i<4; i++) {
    els.push(R(52 + i*50, padY, 38, 32, padColors[i]+'33', 3));
    els.push(R(53 + i*50, padY+1, 36, 14, padColors[i]+'22', 2));
    els.push(T(i+1+'', 70 + i*50, padY+8, 10, padColors[i]+'CC', {textAlign:'center'}));
  }

  return els;
}

// mMixer — vertical channel faders + EQ
function mMixer() {
  const els = [R(0,0,W_M,H_M,C.chassis)];

  // Top bar
  els.push(R(0,0,W_M,44,C.panel));
  els.push(...HwPill(12,8,180,28,['DECK','MIX','FX','LIB'],1));
  els.push(T('MIXER', W_M-70, 14, 11, C.label));

  // 4 channel strips
  const channels = [
    {label:'CH 1', bpm:'128.0', level:0.75, eq:[0.6,0.5,0.7], active:true,  col:C.ledAmber},
    {label:'CH 2', bpm:'128.0', level:0.68, eq:[0.5,0.55,0.6], active:true,  col:C.ledCyan},
    {label:'CH 3', bpm:'130.5', level:0.3,  eq:[0.5,0.5,0.5], active:false, col:C.ledGreen},
    {label:'CH 4', bpm:'—',     level:0,    eq:[0.5,0.5,0.5], active:false, col:C.steelMid},
  ];
  const chW = Math.floor(W_M / 4);

  channels.forEach((ch, i) => {
    const cx = i * chW;
    // channel label
    els.push(R(cx, 50, chW-2, 22, ch.active ? C.groove : C.panel, 0));
    els.push(TS(ch.label, cx+4, 57, 9, ch.active ? ch.col : C.label));

    // BPM
    els.push(T(ch.bpm, cx+4, 74, 9, ch.active ? C.readout : C.steelMid));

    // EQ section (3 mini knobs)
    ['L','M','H'].forEach((band, bi) => {
      const kr = 14;
      const kcx = cx + (bi+0.5) * (chW/3);
      els.push(...Knob(kcx, 110, kr, ch.eq[bi], band,
        bi===0 ? C.ledGreen : bi===1 ? C.ledAmber : C.ledCyan));
    });

    // Gain knob
    els.push(...Knob(cx + chW/2, 168, 14, 0.6, 'G', ch.col));

    // LED meter
    els.push(...LedMeter(cx + chW/2 - 6, 198, 8, 260, ch.level));
    els.push(...LedMeter(cx + chW/2 + 2, 198, 8, 260, ch.level * 0.95));

    // Channel fader
    els.push(...Fader(cx + 8, 200, 26, 240, ch.level, ''));

    // PFL/CUE button
    els.push(...HwButton(cx+4, 462, chW-8, 22, 'CUE', ch.active, ch.col, 3));
  });

  // Separator
  els.push(R(0, 492, W_M, 1, C.steelLo));

  // Master section
  els.push(TS('MASTER', 16, 502, 10, C.label));
  els.push(...LedMeter(16, 520, 12, 120, 0.82));
  els.push(...LedMeter(30, 520, 12, 120, 0.78));
  els.push(...Knob(90, 580, 28, 0.8, 'MASTER', C.ledCyan));
  els.push(...Knob(150, 580, 22, 0.65, 'BOOTH', C.ledAmber));
  els.push(...Knob(200, 580, 22, 0.5, 'PHONES', C.steelHi));

  // Headphone cue mix
  els.push(T('CUE MIX', 240, 556, 9, C.label));
  els.push(...Fader(240, 560, 16, 80, 0.6, ''));

  // Crossfader
  els.push(R(0, H_M-80, W_M, 80, C.panel));
  els.push(T('CROSSFADER', 16, H_M-72, 8, C.label));
  els.push(...Fader(16, H_M-62, W_M-32, 28, 0.5, '', 'horizontal'));
  els.push(TSB('A', 16, H_M-26, 11, C.ledAmber));
  els.push(TSB('B', W_M-24, H_M-26, 11, C.ledCyan));

  return els;
}

// mFX — hardware pill FX rack
function mFX() {
  const els = [R(0,0,W_M,H_M,C.chassis)];

  // Top bar
  els.push(R(0,0,W_M,44,C.panel));
  els.push(...HwPill(12,8,180,28,['DECK','MIX','FX','LIB'],2));

  // FX units (3 units, stacked)
  const fxDefs = [
    {name:'REVERB',   params:['TIME','DAMP','MIX'], vals:[0.6,0.4,0.5], active:true, col:C.ledCyan},
    {name:'DELAY',    params:['TIME','FEED','MIX'], vals:[0.5,0.65,0.35],active:true, col:C.ledAmber},
    {name:'FILTER',   params:['FREQ','RES','MIX'],  vals:[0.7,0.3,0.6], active:false, col:C.steelMid},
  ];

  fxDefs.forEach((fx, i) => {
    const unitY = 56 + i * 240;
    const unitH = 220;

    // Unit chassis
    els.push(R(10, unitY, W_M-20, unitH, C.panel, 6));
    els.push(R(12, unitY+2, W_M-24, unitH-4, C.groove, 5));

    // Unit header
    els.push(R(12, unitY+2, W_M-24, 28, C.steel, 5));
    els.push(TSB(fx.name, 24, unitY+9, 11, fx.active ? fx.col : C.label));

    // Power button
    els.push(...HwButton(W_M-52, unitY+4, 36, 22, '⏻', fx.active, fx.col, 3));

    // Type selector pill
    els.push(...HwPill(24, unitY+38, W_M-48, 24, ['A','B','C','D'], 0));

    // 3 parameter knobs
    fx.params.forEach((param, pi) => {
      const kr = 28;
      const kcx = 52 + pi * 108;
      const kcy = unitY + 118;
      els.push(...Knob(kcx, kcy, kr, fx.vals[pi], param, fx.active ? fx.col : C.steelMid));
    });

    // Level bar (horizontal LED meter)
    els.push(T('LEVEL', 24, unitY+168, 8, C.label));
    els.push(...LedMeter(24, unitY+180, W_M-60, 10, fx.active ? fx.vals[2] : 0, false));

    // Assign buttons (Deck A / Deck B / Master)
    ['A','B','MST'].forEach((dest, di) => {
      const dx = W_M - 128 + di * 36;
      const dy = unitY + 162;
      els.push(...HwButton(dx, dy, 30, 24, dest,
        fx.active && di < 2, di === 0 ? C.ledAmber : di === 1 ? C.ledCyan : C.steelHi, 3));
    });
  });

  return els;
}

// mLibrary — track browser
function mLibrary() {
  const els = [R(0,0,W_M,H_M,C.chassis)];

  // Top bar
  els.push(R(0,0,W_M,44,C.panel));
  els.push(...HwPill(12,8,180,28,['DECK','MIX','FX','LIB'],3));

  // Search bar
  els.push(R(10,52,W_M-20,36,C.groove,18));
  els.push(R(12,54,W_M-24,32,C.panel,17));
  els.push(T('⌕  Search tracks...', 28, 66, 12, C.steelMid));

  // Sort chips
  const sorts = ['BPM','KEY','ARTIST','LABEL'];
  sorts.forEach((s,i) => {
    els.push(R(10 + i*90, 96, 84, 22, i===0 ? C.ledAmber+'33' : C.groove, 11));
    els.push(T(s, 10 + i*90 + 10, 103, 9, i===0 ? C.ledAmber : C.label));
  });

  // Track list
  const tracks = [
    {title:'Glue',         artist:'Bicep',         bpm:'128', key:'Am', dur:'6:12', cued:true},
    {title:'Movement',     artist:'Four Tet',       bpm:'122', key:'Dm', dur:'7:40', cued:false},
    {title:'Kilo',         artist:'Bicep',          bpm:'130', key:'Gm', dur:'5:58', cued:false},
    {title:'Svefn-g-Englar',artist:'Sigur Rós',     bpm:'85',  key:'C',  dur:'10:05',cued:false},
    {title:'Porcelain',    artist:'Moby',           bpm:'130', key:'Fm', dur:'5:08', cued:false},
    {title:'Faze Action',  artist:'Faze Action',    bpm:'124', key:'Bb', dur:'8:22', cued:false},
    {title:'Spastik',      artist:'Plastikman',     bpm:'136', key:'Am', dur:'11:30',cued:false},
    {title:'Strings of Life', artist:'Derrick May', bpm:'128', key:'F',  dur:'8:01', cued:false},
  ];

  const trackH = 54;
  tracks.forEach((t, i) => {
    const ty = 126 + i * trackH;
    if (ty + trackH > H_M - 60) return;
    const isEven = i % 2 === 0;
    els.push(R(0, ty, W_M, trackH, t.cued ? C.ledAmber+'11' : isEven ? C.groove : C.chassis));
    if (t.cued) {
      els.push(R(0, ty, 3, trackH, C.ledAmber));
    }
    els.push(TSB(t.title, 14, ty+10, 12, t.cued ? C.ledAmber : C.labelHi));
    els.push(TS(t.artist, 14, ty+28, 10, C.label));
    els.push(T(t.bpm, W_M-110, ty+10, 10, C.readout));
    els.push(T(t.key, W_M-70, ty+10, 10, C.ledGreen));
    els.push(T(t.dur, W_M-44, ty+10, 10, C.steelMid));
    // Load button
    els.push(...HwButton(W_M-50, ty+28, 42, 18, 'LOAD', false, C.ledAmber, 3));
  });

  // Bottom mini waveform
  els.push(R(0, H_M-56, W_M, 56, C.panel));
  els.push(...Waveform(10, H_M-48, W_M-20, 36, 0.35));

  return els;
}

// mSet — set recording / live view
function mSet() {
  const els = [R(0,0,W_M,H_M,C.chassis)];

  els.push(R(0,0,W_M,44,C.panel));
  els.push(TS('SET RECORDER', 16, 14, 12, C.labelHi));
  els.push(...HwButton(W_M-60, 8, 50, 28, '⏺  REC', true, C.ledRed, 14));

  // Recording time
  els.push(R(10, 52, W_M-20, 56, C.groove, 4));
  els.push(TB('01:23:47', W_M/2 - 60, 68, 28, C.ledAmber, {letterSpacing:2}));
  els.push(T('RECORDING', W_M/2 - 36, 98, 9, C.label));

  // Full-set waveform
  els.push(T('SET WAVEFORM', 16, 118, 9, C.label));
  els.push(...Waveform(10, 130, W_M-20, 70, 0.62));

  // Track log
  const segments = [
    {start:'00:00', end:'06:12', title:'Bicep — Glue',          col:C.ledAmber},
    {start:'06:12', end:'13:52', title:'Four Tet — Movement',   col:C.ledCyan},
    {start:'13:52', end:'19:50', title:'Bicep — Kilo',          col:C.ledGreen},
    {start:'19:50', end:'29:55', title:'Sigur Rós — Svefn...',  col:C.ledAmber+'88'},
    {start:'29:55', end:'35:03', title:'Moby — Porcelain',      col:C.steelHi},
    {start:'35:03', end:'43:25', title:'Faze Action',           col:C.ledCyan+'88'},
  ];

  els.push(T('TRACK LOG', 16, 214, 9, C.label));
  segments.forEach((seg, i) => {
    const sy = 228 + i * 44;
    els.push(R(10, sy, 4, 36, seg.col, 2));
    els.push(TS(seg.title, 24, sy+4, 11, C.labelHi));
    els.push(T(seg.start + ' – ' + seg.end, 24, sy+22, 9, C.label));
    els.push(...HwButton(W_M-54, sy+6, 42, 22, 'MARK', false, C.ledAmber, 3));
  });

  // Export row
  els.push(R(0, H_M-60, W_M, 60, C.panel));
  els.push(T('EXPORT', 16, H_M-38, 9, C.label));
  els.push(...HwButton(W_M-136, H_M-54, 60, 32, 'WAV', false, C.steelHi, 4));
  els.push(...HwButton(W_M-68, H_M-54, 60, 32, 'SHARE', true, C.ledCyan, 4));

  return els;
}

// ── DESKTOP ───────────────────────────────────────────────────────────────────

// dMain — full 2-deck console view
function dMain() {
  const els = [R(0,0,W_D,H_D,C.chassis)];

  // Top bar
  els.push(R(0,0,W_D,40,C.panel));
  els.push(TSB('DECK', 20, 11, 14, C.ledAmber));
  els.push(TS('by RAM Studio', 66, 14, 11, C.label));
  els.push(...HwPill(W_D/2-140, 6, 280, 28, ['PERFORMANCE','STUDIO','LIVE'], 0));
  els.push(...BpmDisplay(W_D-180, 2, '128.0'));
  els.push(...BpmDisplay(W_D-96, 2, '128.0'));

  // ─── Deck A (left) ────────────────────────────────────────────────────────
  const deckAX = 0, deckW = 480;

  // Deck label
  els.push(R(deckAX, 40, deckW, 22, C.ledAmber+'22'));
  els.push(TSB('DECK A', deckAX+12, 50, 10, C.ledAmber));
  els.push(TS('Bicep — Glue', deckAX+70, 50, 10, C.labelHi));
  els.push(T('128.0 BPM  Am  6:12', W_D/2 - 160, 50, 9, C.readout));

  // Platter A
  const prA = 140, pAcx = deckAX + deckW/2, pAcy = 40+22+prA+16;
  els.push(...Platter(pAcx, pAcy, prA, true, 'Glue'));

  // LED meters A
  els.push(...LedMeter(deckAX+12, 72, 10, 240, 0.78));
  els.push(...LedMeter(deckAX+24, 72, 10, 240, 0.75));
  els.push(...LedMeter(deckAX+deckW-22, 72, 10, 240, 0.72));
  els.push(...LedMeter(deckAX+deckW-34, 72, 10, 240, 0.68));

  // EQ A
  const eqAY = 72 + 244;
  ['LOW','MID','HI'].forEach((b,bi) => {
    els.push(...EqBand(deckAX + 40 + bi*72, eqAY, 64, b, [0.6,0.5,0.7][bi]));
  });
  els.push(...Knob(deckAX + deckW - 60, eqAY+36, 28, 0.75, 'GAIN', C.ledAmber));

  // Transport A
  const tAY = eqAY + 100;
  const tBtns = ['◀◀','◀','▶▶','CUE','SYNC','LOOP'];
  tBtns.forEach((b, bi) => {
    const lit = ['▶▶','CUE'].includes(b);
    els.push(...HwButton(deckAX+12 + bi*74, tAY, 66, 36, b,
      lit, b==='▶▶' ? C.ledCyan : C.ledAmber, 4));
  });

  // Waveform A
  els.push(...Waveform(deckAX+12, tAY+44, deckW-24, 44, 0.35));

  // Pitch fader A
  els.push(...Fader(deckAX+deckW-30, 72+22, 20, 200, 0.52, 'PITCH'));

  // ─── Center Mixer ────────────────────────────────────────────────────────
  const mixX = deckW, mixW = W_D - deckW * 2;

  els.push(R(mixX, 40, mixW, H_D-40, C.panel));

  // Channel faders (A + B + 2 aux)
  const chLabels = ['A','B','C','D'];
  const chCols   = [C.ledAmber, C.ledCyan, C.ledGreen, C.steelHi];
  const chVals   = [0.8, 0.7, 0.2, 0];
  chLabels.forEach((ch, ci) => {
    const fcx = mixX + 20 + ci * (mixW/4 - 2);
    els.push(TS(ch, fcx + 10, 52, 11, chCols[ci]));
    els.push(...LedMeter(fcx + 8, 68, 8, 180, chVals[ci]));
    els.push(...LedMeter(fcx + 18, 68, 8, 180, chVals[ci] * 0.95));
    els.push(...Fader(fcx, 72, 32, 170, chVals[ci], ''));
    els.push(...HwButton(fcx, 250, 32, 20, 'CUE', ci < 2, chCols[ci], 3));
  });

  // Master out
  els.push(T('MASTER', mixX+8, 280, 8, C.label));
  els.push(...LedMeter(mixX+8, 292, 10, 120, 0.82));
  els.push(...LedMeter(mixX+20, 292, 10, 120, 0.79));
  els.push(...Knob(mixX+48, 350, 26, 0.8, 'MSTR', C.ledCyan));

  // Headphones
  els.push(...Knob(mixX+90, 350, 22, 0.6, 'PHONES', C.steelHi));

  // Crossfader
  els.push(R(mixX+4, H_D-70, mixW-8, 50, C.groove, 4));
  els.push(T('X-FADER', mixX+12, H_D-64, 8, C.label));
  els.push(...Fader(mixX+8, H_D-56, mixW-16, 28, 0.5, '', 'horizontal'));
  els.push(TSB('A', mixX+8, H_D-22, 10, C.ledAmber));
  els.push(TSB('B', mixX+mixW-14, H_D-22, 10, C.ledCyan));

  // ─── Deck B (right) ───────────────────────────────────────────────────────
  const deckBX = W_D - deckW;

  els.push(R(deckBX, 40, deckW, 22, C.ledCyan+'22'));
  els.push(TSB('DECK B', deckBX+12, 50, 10, C.ledCyan));
  els.push(TS('Four Tet — Movement', deckBX+72, 50, 10, C.labelHi));
  els.push(T('122.0 BPM  Dm  7:40', deckBX + deckW - 230, 50, 9, C.readout));

  const prB = 140, pBcx = deckBX + deckW/2, pBcy = 40+22+prB+16;
  els.push(...Platter(pBcx, pBcy, prB, false, 'Movement'));

  els.push(...LedMeter(deckBX+12, 72, 10, 240, 0.65));
  els.push(...LedMeter(deckBX+24, 72, 10, 240, 0.62));
  els.push(...LedMeter(deckBX+deckW-22, 72, 10, 240, 0.70));
  els.push(...LedMeter(deckBX+deckW-34, 72, 10, 240, 0.66));

  const eqBY = 72 + 244;
  ['LOW','MID','HI'].forEach((b,bi) => {
    els.push(...EqBand(deckBX + 40 + bi*72, eqBY, 64, b, [0.5,0.55,0.6][bi]));
  });
  els.push(...Knob(deckBX + deckW - 60, eqBY+36, 28, 0.68, 'GAIN', C.ledCyan));

  const tBY = eqBY + 100;
  tBtns.forEach((b, bi) => {
    const lit = b === '▶▶';
    els.push(...HwButton(deckBX+12 + bi*74, tBY, 66, 36, b,
      lit, C.ledCyan, 4));
  });

  els.push(...Waveform(deckBX+12, tBY+44, deckW-24, 44, 0.0));
  els.push(...Fader(deckBX+deckW-30, 72+22, 20, 200, 0.5, 'PITCH'));

  return els;
}

// dFX — FX rack panel (desktop)
function dFX() {
  const els = [R(0,0,W_D,H_D,C.chassis)];

  els.push(R(0,0,W_D,40,C.panel));
  els.push(TSB('DECK', 20, 11, 14, C.ledAmber));
  els.push(TS('by RAM Studio', 66, 14, 11, C.label));
  els.push(...HwPill(W_D/2-140, 6, 280, 28, ['PERFORMANCE','FX RACK','LIVE'], 1));

  // 4 FX units side by side
  const fxDefs = [
    {name:'REVERB',   params:['TIME','DAMP','FREQ','MIX'],  vals:[0.6,0.4,0.5,0.45], active:true, col:C.ledCyan},
    {name:'DELAY',    params:['TIME','FEED','RATE','MIX'],  vals:[0.5,0.65,0.4,0.35],active:true, col:C.ledAmber},
    {name:'FILTER',   params:['FREQ','RES','ENV','MIX'],    vals:[0.7,0.3,0.4,0.6],  active:true, col:C.ledGreen},
    {name:'FLANGER',  params:['RATE','DEPTH','FDBK','MIX'], vals:[0.3,0.5,0.2,0.0],  active:false,col:C.steelMid},
  ];

  const unitW = Math.floor(W_D / 4) - 8;
  fxDefs.forEach((fx, i) => {
    const ux = 8 + i * (unitW + 8);
    const uy = 48;
    const uh = H_D - 56;

    els.push(R(ux, uy, unitW, uh, C.panel, 6));
    els.push(R(ux+2, uy+2, unitW-4, uh-4, C.groove, 5));

    // Header
    els.push(R(ux+2, uy+2, unitW-4, 32, C.steel, 5));
    els.push(TSB(fx.name, ux+12, uy+11, 12, fx.active ? fx.col : C.label));
    els.push(...HwButton(ux+unitW-48, uy+6, 38, 22, '⏻', fx.active, fx.col, 3));

    // Type selector
    els.push(...HwPill(ux+8, uy+40, unitW-16, 26, ['A','B','C','D'], 0));

    // 4 knobs (2x2 grid)
    const kr = 34;
    [[0,1],[2,3]].forEach(([row0, row1], ri) => {
      [row0, row1].forEach((pi, ci) => {
        if (pi >= fx.params.length) return;
        const kcx = ux + (unitW/2) * ci + unitW/4;
        const kcy = uy + 90 + ri * 110 + kr;
        els.push(...Knob(kcx, kcy, kr, fx.vals[pi], fx.params[pi],
          fx.active ? fx.col : C.steelMid));
      });
    });

    // Level bar
    els.push(T('LEVEL', ux+8, uy+uh-80, 9, C.label));
    els.push(...LedMeter(ux+8, uy+uh-68, unitW-16, 10,
      fx.active ? fx.vals[fx.vals.length-1] : 0, false));

    // Assign
    els.push(T('SEND TO', ux+8, uy+uh-48, 8, C.label));
    ['A','B','M'].forEach((dest, di) => {
      els.push(...HwButton(ux+8+di*((unitW-16)/3+2), uy+uh-38,
        Math.floor((unitW-16)/3), 28, dest,
        fx.active && di < 2, di===0 ? C.ledAmber : di===1 ? C.ledCyan : C.steelHi, 3));
    });
  });

  return els;
}

// dLibrary — track library
function dLibrary() {
  const els = [R(0,0,W_D,H_D,C.chassis)];

  els.push(R(0,0,W_D,40,C.panel));
  els.push(TSB('DECK', 20, 11, 14, C.ledAmber));
  els.push(TS('by RAM Studio', 66, 14, 11, C.label));
  els.push(...HwPill(W_D/2-140, 6, 280, 28, ['PERFORMANCE','LIBRARY','LIVE'], 1));

  // Left sidebar — crates
  const sbW = 220;
  els.push(R(0, 40, sbW, H_D-40, C.panel));
  els.push(T('CRATES', 16, 52, 9, C.label));

  const crates = ['All Tracks','Recently Added','Techno Sets','Ambient','Late Night','Picked Today'];
  crates.forEach((c,i) => {
    const cy = 66 + i * 32;
    const active = i === 0;
    els.push(R(0, cy, sbW, 30, active ? C.ledAmber+'22' : 'transparent'));
    if (active) els.push(R(0, cy, 3, 30, C.ledAmber));
    els.push(TS(c, 14, cy+9, 11, active ? C.ledAmber : C.labelHi));
  });

  // Main track list
  const listX = sbW + 1;
  const listW = W_D - sbW - 280;

  // Column headers
  els.push(R(listX, 40, listW, 28, C.groove));
  const cols = [{label:'TITLE', w:300},{label:'ARTIST',w:200},{label:'BPM',w:70},
                {label:'KEY',w:60},{label:'ENERGY',w:80},{label:'DURATION',w:70}];
  let cx2 = listX + 12;
  cols.forEach(col => {
    els.push(T(col.label, cx2, 51, 8, C.label));
    cx2 += col.w;
  });

  // Tracks
  const tracks2 = [
    {t:'Glue',             a:'Bicep',          bpm:'128.0',key:'Am',e:'████░',dur:'6:12',  cued:true},
    {t:'Movement',         a:'Four Tet',        bpm:'122.0',key:'Dm',e:'███░░',dur:'7:40',  cued:false},
    {t:'Kilo',             a:'Bicep',           bpm:'130.5',key:'Gm',e:'████░',dur:'5:58',  cued:false},
    {t:'Svefn-g-Englar',   a:'Sigur Rós',       bpm:'85.0', key:'C', e:'█░░░░',dur:'10:05', cued:false},
    {t:'Porcelain',        a:'Moby',            bpm:'130.0',key:'Fm',e:'███░░',dur:'5:08',  cued:false},
    {t:'Strings of Life',  a:'Derrick May',     bpm:'128.5',key:'F', e:'█████',dur:'8:01',  cued:false},
    {t:'Spastik',          a:'Plastikman',      bpm:'136.0',key:'Am',e:'████░',dur:'11:30', cued:false},
    {t:'Pacific State',    a:'808 State',       bpm:'126.0',key:'Bb',e:'███░░',dur:'6:54',  cued:false},
    {t:'Theme From S-Express',a:'S-Express',    bpm:'128.0',key:'Eb',e:'████░',dur:'4:18',  cued:false},
    {t:'Voodoo Ray',       a:'A Guy Called Gerald',bpm:'130.0',key:'Fm',e:'████░',dur:'7:36',cued:false},
    {t:'Can You Feel It',  a:'Larry Heard',     bpm:'120.0',key:'Am',e:'██░░░',dur:'7:20',  cued:false},
    {t:'Acid Tracks',      a:'Phuture',         bpm:'122.0',key:'?', e:'████░',dur:'10:34', cued:false},
    {t:'Your Love',        a:'Frankie Knuckles',bpm:'126.5',key:'Am',e:'███░░',dur:'7:46',  cued:false},
    {t:'Mystery of Love',  a:'Larry Heard',     bpm:'118.0',key:'F', e:'██░░░',dur:'5:26',  cued:false},
    {t:'Nude Photo',       a:'Model 500',       bpm:'124.0',key:'Gm',e:'███░░',dur:'6:08',  cued:false},
  ];

  tracks2.forEach((t, i) => {
    const ty = 68 + i * 36;
    if (ty + 36 > H_D - 70) return;
    const isEven = i % 2 === 0;
    els.push(R(listX, ty, listW, 35, t.cued ? C.ledAmber+'11' : isEven ? C.groove : C.chassis));
    if (t.cued) els.push(R(listX, ty, 3, 35, C.ledAmber));

    let tx2 = listX + 12;
    els.push(TSB(t.t, tx2, ty+11, 11, t.cued ? C.ledAmber : C.labelHi)); tx2 += 300;
    els.push(TS(t.a, tx2, ty+11, 11, C.label)); tx2 += 200;
    els.push(T(t.bpm, tx2, ty+11, 10, C.readout)); tx2 += 70;
    els.push(T(t.key, tx2, ty+11, 10, C.ledGreen)); tx2 += 60;
    els.push(T(t.e, tx2, ty+11, 9, C.ledAmber+'88')); tx2 += 80;
    els.push(T(t.dur, tx2, ty+11, 10, C.steelMid));

    // Load buttons
    els.push(...HwButton(listX+listW-80, ty+6, 36, 22, 'LOAD A', false, C.ledAmber, 3));
    els.push(...HwButton(listX+listW-40, ty+6, 36, 22, 'LOAD B', false, C.ledCyan, 3));
  });

  // Right panel — waveform + metadata
  const infoX = listX + listW + 1;
  const infoW = W_D - infoX;
  els.push(R(infoX, 40, infoW, H_D-40, C.panel));
  els.push(T('PREVIEW', infoX+8, 52, 9, C.label));
  els.push(...Waveform(infoX+8, 64, infoW-16, 60, 0.0));
  els.push(TSB('Glue', infoX+8, 140, 13, C.labelHi));
  els.push(TS('Bicep', infoX+8, 158, 10, C.label));
  els.push(T('128.0 BPM', infoX+8, 178, 10, C.readout));
  els.push(T('Am  6:12', infoX+8, 194, 10, C.ledGreen));

  // Tags
  ['techno','ambient','british','2017'].forEach((tag,ti) => {
    els.push(R(infoX+8, 210 + ti*22, 80, 16, C.groove, 8));
    els.push(T(tag, infoX+16, 215 + ti*22, 8, C.label));
  });

  // Load buttons
  els.push(...HwButton(infoX+8, H_D-90, infoW-16, 36, 'LOAD → DECK A', true, C.ledAmber, 4));
  els.push(...HwButton(infoX+8, H_D-48, infoW-16, 36, 'LOAD → DECK B', false, C.ledCyan, 4));

  return els;
}

// dSetRecording — full waveform review post-set
function dSetRecording() {
  const els = [R(0,0,W_D,H_D,C.chassis)];

  els.push(R(0,0,W_D,40,C.panel));
  els.push(TSB('DECK', 20, 11, 14, C.ledAmber));
  els.push(TS('by RAM Studio', 66, 14, 11, C.label));
  els.push(...HwPill(W_D/2-140, 6, 280, 28, ['PERFORMANCE','LIBRARY','SET'], 2));

  // Set info
  els.push(R(0,40,W_D,56,C.panel));
  els.push(TSB('Fabric 01 — Recording', 20, 52, 16, C.labelHi));
  els.push(TS('01h 23m 47s  ·  14 tracks  ·  recorded Mar 19, 2026', 20, 76, 11, C.label));
  els.push(...HwButton(W_D-140, 48, 60, 28, '⬇ WAV', false, C.steelHi, 4));
  els.push(...HwButton(W_D-72, 48, 60, 28, '↗ SHARE', true, C.ledCyan, 4));

  // Full set waveform
  els.push(T('FULL SET WAVEFORM', 20, 108, 9, C.label));
  els.push(...Waveform(16, 122, W_D-32, 100, 0.62));

  // Playback transport
  const tY = 234;
  const tBtns2 = ['◀◀','◀','▶▶','▶▶▶'];
  tBtns2.forEach((b,bi) => {
    els.push(...HwButton(16 + bi*52, tY, 46, 32, b, b==='▶▶', C.ledCyan, 4));
  });
  els.push(T('01:23:47 / 01:23:47', 230, tY+10, 11, C.readout));

  // Track segments bar
  els.push(T('TRACK SEGMENTS', 20, 278, 9, C.label));
  const segments2 = [
    {pct:0.074, len:0.074, title:'Glue — Bicep', col:C.ledAmber},
    {pct:0.074, len:0.093, title:'Movement — Four Tet', col:C.ledCyan},
    {pct:0.167, len:0.071, title:'Kilo — Bicep', col:C.ledGreen},
    {pct:0.238, len:0.120, title:'Svefn-g-Englar', col:C.ledAmber+'66'},
    {pct:0.358, len:0.061, title:'Porcelain', col:C.steelHi},
    {pct:0.419, len:0.100, title:'Faze Action', col:C.ledCyan+'66'},
    {pct:0.519, len:0.138, title:'Spastik', col:C.ledRed+'66'},
    {pct:0.657, len:0.083, title:'Strings of Life', col:C.ledGreen+'66'},
    {pct:0.740, len:0.260, title:'...', col:C.steelMid},
  ];
  const segBarY = 292, segBarH = 36;
  segments2.forEach(seg => {
    const sx = 16 + seg.pct * (W_D-32);
    const sw = seg.len * (W_D-32);
    els.push(R(sx, segBarY, sw-1, segBarH, seg.col+'33', 2));
    els.push(R(sx, segBarY, 3, segBarH, seg.col, 2));
    if (sw > 60) {
      els.push(T(seg.title, sx+6, segBarY+12, 8, seg.col+'CC'));
    }
  });

  // Track log table
  els.push(T('TRACK LOG', 20, 342, 9, C.label));
  const logHeaders = ['#','TITLE','ARTIST','BPM','KEY','IN','OUT','DUR'];
  const logXs = [20, 52, 320, 520, 600, 660, 740, 820];
  logHeaders.forEach((h,hi) => {
    els.push(T(h, logXs[hi], 358, 8, C.label));
  });
  els.push(R(16, 368, W_D-32, 1, C.steelLo));

  const logTracks = [
    ['01','Glue','Bicep','128.0','Am','0:00','6:12','6:12'],
    ['02','Movement','Four Tet','122.0','Dm','6:12','13:52','7:40'],
    ['03','Kilo','Bicep','130.5','Gm','13:52','19:50','5:58'],
    ['04','Svefn-g-Englar','Sigur Rós','85.0','C','19:50','29:55','10:05'],
    ['05','Porcelain','Moby','130.0','Fm','29:55','35:03','5:08'],
    ['06','Faze Action','Faze Action','124.0','Bb','35:03','43:25','8:22'],
    ['07','Spastik','Plastikman','136.0','Am','43:25','54:55','11:30'],
    ['08','Strings of Life','Derrick May','128.5','F','54:55','62:56','8:01'],
  ];

  logTracks.forEach((row, ri) => {
    const ry = 376 + ri * 34;
    if (ry + 34 > H_D) return;
    els.push(R(16, ry, W_D-32, 33, ri%2===0 ? C.groove : C.chassis));
    row.forEach((cell, ci) => {
      const col = ci===0 ? C.label : ci===1 ? C.labelHi : ci===3 ? C.readout : ci===4 ? C.ledGreen : C.steelMid;
      const fw = (ci===1) ? 700 : 400;
      els.push(T(cell, logXs[ci], ry+11, ci===1?11:10, col, fw===700?{fontWeight:700}:{}));
    });
    // Play button
    els.push(...HwButton(W_D-56, ry+4, 40, 24, '▶', false, C.ledAmber, 3));
  });

  return els;
}

// ── Assemble all screens in penviewer-compatible format ───────────────────────
function makeScreen(id, w, h, elements) {
  return {
    type:     'frame',
    id,
    x:        0,
    y:        0,
    width:    w,
    height:   h,
    fill:     C.chassis,
    children: elements,
  };
}

const pen = {
  version:  '2.8',
  children: [
    // Mobile
    makeScreen('mDeck',         W_M, H_M, mDeck()),
    makeScreen('mMixer',        W_M, H_M, mMixer()),
    makeScreen('mFX',           W_M, H_M, mFX()),
    makeScreen('mLibrary',      W_M, H_M, mLibrary()),
    makeScreen('mSet',          W_M, H_M, mSet()),
    // Desktop
    makeScreen('dMain',         W_D, H_D, dMain()),
    makeScreen('dFX',           W_D, H_D, dFX()),
    makeScreen('dLibrary',      W_D, H_D, dLibrary()),
    makeScreen('dSetRecording', W_D, H_D, dSetRecording()),
  ],
};

fs.writeFileSync('deck.pen', JSON.stringify(pen, null, 2));
console.log(`✓ deck.pen written — ${pen.children.length} screens`);
pen.children.forEach(s => console.log(`  ${s.id.padEnd(16)} ${s.width}×${s.height}  ${s.children.length} elements`));
