/**
 * Echo — Async voice messaging for distributed teams
 * Inspired by: Format Podcasts (darkmodedesign.com) + Haptic (godly.website) + Neon.tech dark branding
 * Trend: Pure-black foundations, electric neon accents, waveform as design motif, audio-first UI
 * Theme: DARK
 */

const fs = require('fs');

const W = 390, H = 844;
const SLUG = 'echo-voice';

const P = {
  bg:       '#06060A',
  surface:  '#0E0E16',
  card:     '#141420',
  card2:    '#1A1A28',
  border:   'rgba(255,255,255,0.06)',
  border2:  'rgba(255,255,255,0.10)',
  text:     '#EEECf8',
  muted:    'rgba(238,236,248,0.40)',
  muted2:   'rgba(238,236,248,0.20)',
  accent:   '#7C5CFC',
  accentFg: '#A58BFD',
  accent2:  '#38F5C8',
  accent3:  '#FF4D7A',
  yellow:   '#FFCB47',
  green:    '#3CF0A0',
};

let idCounter = 1;
const id = () => `el_${idCounter++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return { id: id(), type: 'rectangle', x, y, width: w, height: h,
    backgroundColor: fill, cornerRadius: opts.r || 0,
    borderColor: opts.border || 'transparent', borderWidth: opts.bw || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}

function text(x, y, w, content, size, color, opts = {}) {
  return { id: id(), type: 'text', x, y, width: w, height: opts.h || Math.ceil(size * 1.45),
    content, fontSize: size, color,
    fontWeight: opts.weight || 'regular',
    fontFamily: opts.font || 'Inter',
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || 1.45,
    align: opts.align || 'left',
    opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}

function circle(x, y, r, fill, opts = {}) {
  return { id: id(), type: 'ellipse', x: x - r, y: y - r, width: r * 2, height: r * 2,
    backgroundColor: fill, borderColor: opts.border || 'transparent',
    borderWidth: opts.bw || 0, opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}

function group(els, opts = {}) {
  return { id: id(), type: 'group', children: els, opacity: opts.opacity || 1 };
}

function waveform(x, y, w, h, color, opts = {}) {
  const bars = opts.bars || 24;
  const gap = opts.gap || 2;
  const barW = Math.max(2, Math.floor((w - gap * (bars - 1)) / bars));
  const amplitudes = [0.35,0.55,0.70,0.85,0.65,0.90,1.0,0.75,0.60,0.45,0.80,0.95,0.70,0.55,0.85,1.0,0.65,0.78,0.50,0.90,0.72,0.55,0.40,0.30,0.60,0.82,0.95,0.68,0.45,0.78,0.90,0.55];
  const elements = [];
  for (let i = 0; i < bars; i++) {
    const amp = amplitudes[i % amplitudes.length];
    const barH = Math.max(3, Math.round(h * amp));
    const bx = x + i * (barW + gap);
    const by = y + (h - barH) / 2;
    const played = opts.progress !== undefined && (i / bars < opts.progress);
    const barColor = played ? color : (opts.unplayedColor || 'rgba(255,255,255,0.15)');
    elements.push(rect(bx, by, barW, barH, barColor, { r: 2 }));
  }
  return group(elements);
}

function statusBar() {
  return group([
    text(20, 14, 80, '9:41', 13, P.text, { weight: 'semibold', ls: 0.3 }),
    text(W - 80, 14, 70, 'LTE ▲', 11, P.muted, { align: 'right' }),
  ]);
}

function bottomNav(active) {
  const tabs = [
    { icon: '◎', label: 'Inbox',   idx: 0 },
    { icon: '⌕', label: 'Rooms',   idx: 1 },
    { icon: '●', label: 'Record',  idx: 2 },
    { icon: '☾', label: 'Archive', idx: 3 },
    { icon: '◻', label: 'Profile', idx: 4 },
  ];
  const tabW = W / tabs.length;
  const navH = 82;
  const y = H - navH;
  const els = [rect(0, y, W, navH, P.surface, { border: P.border, bw: 1 })];
  tabs.forEach(tab => {
    const cx = tab.idx * tabW + tabW / 2;
    const isActive = tab.idx === active;
    const color = isActive ? (tab.idx === 2 ? P.accent3 : P.accent) : P.muted;
    if (tab.idx === 2) {
      els.push(circle(cx, y + 24, 22, isActive ? P.accent3 : P.card2, { border: isActive ? P.accent3 : P.border2, bw: 1.5 }));
      els.push(text(cx - 12, y + 14, 24, tab.icon, 14, isActive ? '#FFF' : P.muted, { align: 'center', weight: 'bold' }));
    } else {
      els.push(text(cx - 16, y + 10, 32, tab.icon, 17, color, { align: 'center' }));
    }
    els.push(text(cx - 24, y + 48, 48, tab.label, 9.5, color, { align: 'center', weight: isActive ? 'medium' : 'regular' }));
  });
  return group(els);
}

function avatar(cx, cy, r, initials, bgColor, opts = {}) {
  return group([
    circle(cx, cy, r, bgColor, { border: opts.border || 'transparent', bw: opts.bw || 0 }),
    text(cx - r, cy - r * 0.45, r * 2, initials, r * 0.72, opts.textColor || P.text, { align: 'center', weight: 'semibold' }),
  ]);
}

// SCREEN 1: INBOX
function screen1() {
  const els = [rect(0,0,W,H,P.bg), statusBar()];

  els.push(text(20, 52, 200, 'Echo', 26, P.text, { weight: 'bold', ls: -0.5 }));
  els.push(text(20, 82, 240, 'Inbox', 13, P.muted));
  els.push(rect(W-80, 54, 60, 28, P.accent, { r: 14 }));
  els.push(text(W-74, 60, 48, '+ Voice', 10.5, '#FFF', { weight: 'semibold', align: 'center' }));
  els.push(rect(20, 118, W-40, 32, P.card, { r: 10 }));
  els.push(circle(44, 134, 6, P.accent3));
  els.push(text(60, 124, 220, '3 unplayed messages', 12, P.text, { weight: 'medium' }));
  els.push(text(W-56, 124, 36, 'Jump', 11, P.accent, { weight: 'medium' }));

  const messages = [
    { name:'Maya K.',   time:'2m ago',  dur:'0:42', initials:'MK', avatarBg:'#3B2F9E', progress:0,   unplayed:true,  topic:'Design review feedback' },
    { name:'Juno Park', time:'18m ago', dur:'1:07', initials:'JP', avatarBg:'#1B5E45', progress:0.6, unplayed:false, topic:'Sprint planning notes' },
    { name:'Axel R.',   time:'1h ago',  dur:'0:28', initials:'AR', avatarBg:'#6B2A1A', progress:0,   unplayed:true,  topic:'Client call recap' },
    { name:'Team Echo', time:'3h ago',  dur:'2:15', initials:'TE', avatarBg:'#1A2C5E', progress:1.0, unplayed:false, topic:'Async standup — Monday' },
  ];

  let cardY = 164;
  messages.forEach(msg => {
    const cardH = 96;
    els.push(rect(20, cardY, W-40, cardH, msg.unplayed ? P.card2 : P.card, { r:14, border: msg.unplayed ? P.accent+'22' : P.border, bw: msg.unplayed ? 1 : 0.5 }));
    if (msg.unplayed) els.push(circle(33, cardY+20, 4, P.accent3));
    avatar(62, cardY+48, 22, msg.initials, msg.avatarBg).children.forEach(e => els.push(e));
    els.push(text(94, cardY+14, 180, msg.name, 13, P.text, { weight:'semibold' }));
    els.push(text(94, cardY+32, 200, msg.topic, 11.5, P.muted));
    waveform(94, cardY+54, 200, 22, P.accent2, { bars:28, gap:2, progress:msg.progress, unplayedColor:'rgba(255,255,255,0.12)' }).children.forEach(e => els.push(e));
    els.push(text(W-76, cardY+14, 56, msg.time, 10.5, P.muted, { align:'right' }));
    els.push(text(W-76, cardY+32, 56, msg.dur, 11, msg.unplayed ? P.accent2 : P.muted, { align:'right', weight: msg.unplayed ? 'medium' : 'regular' }));
    cardY += cardH + 10;
  });

  els.push(bottomNav(0));
  return { id:'screen_inbox', name:'Inbox', backgroundColor: P.bg, elements: els };
}

// SCREEN 2: RECORDING
function screen2() {
  const els = [rect(0,0,W,H,P.bg), statusBar()];
  els.push(rect(0, H/2-200, W, 400, P.accent, { opacity:0.04 }));
  els.push(circle(W/2, H/2, 160, P.accent3, { opacity:0.04 }));
  els.push(text(20, 52, W-40, '● Recording', 14, P.accent3, { weight:'semibold', align:'center' }));
  els.push(text(20, 74, W-40, 'Tap to stop when done', 12, P.muted, { align:'center' }));
  els.push(text(20, 130, W-40, '00:47', 64, P.text, { weight:'bold', align:'center', ls:-2 }));

  waveform(20, 230, W-40, 80, P.accent3, { bars:32, gap:3, progress:0.6, unplayedColor:'rgba(56,245,200,0.12)' }).children.forEach(e => els.push(e));

  els.push(rect(20, 348, W-40, 52, P.card, { r:14, border:P.border, bw:1 }));
  els.push(text(40, 361, 60, '→', 14, P.muted));
  els.push(text(62, 358, 240, 'Sending to Maya K.', 13, P.text, { weight:'medium' }));
  els.push(text(62, 376, 200, 'Design Critique Room', 11, P.muted));

  els.push(rect(20, 420, W-40, 110, P.card, { r:14, border:P.border, bw:1 }));
  els.push(text(36, 433, 160, 'Live transcript', 10.5, P.muted, { weight:'medium' }));
  els.push(rect(36, 450, 28, 1, P.border2));
  ['"...the contrast on the hero section feels',
   ' a bit low on mobile — especially the muted',
   ' text in the stat cards. Worth bumping up',
   ' to at least 4.5:1 contrast ratio..."'].forEach((line,i) => {
    els.push(text(36, 458+i*16, W-72, line, 11.5, i<3 ? P.muted : P.accentFg, { lh:1.5 }));
  });

  const cy = 624;
  els.push(circle(W/2-80, cy, 30, P.card, { border:P.border2, bw:1.5 }));
  els.push(text(W/2-104, cy-9, 48, '✕', 17, P.muted, { align:'center' }));
  els.push(text(W/2-104, cy+38, 48, 'Cancel', 10, P.muted, { align:'center' }));
  els.push(circle(W/2, cy, 52, P.accent3, { opacity:0.12 }));
  els.push(circle(W/2, cy, 42, P.accent3));
  els.push(text(W/2-30, cy-9, 60, '■', 22, '#FFF', { align:'center', weight:'bold' }));
  els.push(text(W/2-30, cy+50, 60, 'Stop & Send', 10, P.accent3, { align:'center', weight:'medium' }));
  els.push(circle(W/2+80, cy, 30, P.card, { border:P.border2, bw:1.5 }));
  els.push(text(W/2+56, cy-9, 48, '✎', 17, P.muted, { align:'center' }));
  els.push(text(W/2+56, cy+38, 48, 'Add note', 10, P.muted, { align:'center' }));

  return { id:'screen_recording', name:'Recording', backgroundColor: P.bg, elements: els };
}

// SCREEN 3: THREAD
function screen3() {
  const els = [rect(0,0,W,H,P.bg), statusBar()];
  els.push(text(20, 50, 30, '←', 16, P.muted));
  els.push(text(60, 50, 200, 'Maya K.', 17, P.text, { weight:'semibold' }));
  els.push(text(60, 70, 220, 'Design Critique  ·  3 voices', 11, P.muted));
  [P.accentFg, P.green, P.accent3].forEach((c,i) => els.push(circle(W-52+i*12, 62, 10, c, { opacity:0.85 })));

  const msgs = [
    { sender:'Maya K.',  initials:'MK', avatarBg:'#3B2F9E', self:false, time:'9:32 AM', dur:'0:42', progress:1.0,
      transcript:'"...love the card layout, but the type scale on mobile needs attention..."' },
    { sender:'You',      initials:'YU', avatarBg:P.accent,  self:true,  time:'9:45 AM', dur:'1:14', progress:0, transcript:null },
    { sender:'Axel R.',  initials:'AR', avatarBg:'#6B2A1A', self:false, time:'10:02 AM',dur:'0:33', progress:0,
      transcript:'"...agree with Maya — also button states could use more contrast on dark variant..."' },
  ];

  let msgY = 106;
  msgs.forEach(msg => {
    const bubbleW = 280;
    const bx = msg.self ? W-bubbleW-20 : 58;
    const bubbleH = msg.transcript ? 108 : 72;
    if (!msg.self) avatar(32, msgY+22, 16, msg.initials, msg.avatarBg).children.forEach(e => els.push(e));
    els.push(rect(bx, msgY, bubbleW, bubbleH, msg.self ? P.accent+'22' : P.card, { r:14, border: msg.self ? P.accent+'44' : P.border, bw:1 }));
    els.push(text(bx+14, msgY+10, 120, msg.self ? 'You' : msg.sender, 11, msg.self ? P.accentFg : P.muted, { weight:'medium' }));
    els.push(text(bx+bubbleW-80, msgY+10, 66, msg.time, 10, P.muted, { align:'right' }));
    waveform(bx+14, msgY+32, bubbleW-60, 22, msg.self ? P.accent : P.accent2, { bars:20, gap:2, progress:msg.progress, unplayedColor:'rgba(255,255,255,0.10)' }).children.forEach(e => els.push(e));
    els.push(circle(bx+bubbleW-26, msgY+43, 14, msg.self ? P.accent : P.accent2));
    els.push(text(bx+bubbleW-35, msgY+35, 18, '▶', 10, '#FFF', { align:'center' }));
    els.push(text(bx+14, msgY+60, 60, msg.dur, 10.5, P.muted, { weight:'medium' }));
    if (msg.transcript) els.push(text(bx+14, msgY+76, bubbleW-28, msg.transcript, 10.5, P.muted, { lh:1.4 }));
    msgY += bubbleH + 14;
  });

  const rxY = msgY + 4;
  els.push(rect(58, rxY, 220, 34, P.card, { r:17, border:P.border, bw:1 }));
  ['👍','🎯','🔥','+ React'].forEach((r,i) => {
    els.push(text(76+i*46, rxY+9, i===3?54:28, r, i===3?10.5:14, i===3?P.muted:P.text, { align:'center' }));
  });

  const replyY = H - 140;
  els.push(rect(20, replyY, W-40, 52, P.card, { r:26, border:P.border, bw:1 }));
  els.push(circle(46, replyY+26, 18, P.accent3));
  els.push(text(38, replyY+18, 16, '●', 12, '#FFF', { align:'center' }));
  els.push(text(74, replyY+15, W-140, 'Hold to record reply...', 13, P.muted));
  els.push(circle(W-46, replyY+26, 16, P.accent));
  els.push(text(W-58, replyY+17, 24, '↑', 14, '#FFF', { align:'center', weight:'bold' }));

  els.push(bottomNav(0));
  return { id:'screen_thread', name:'Thread', backgroundColor: P.bg, elements: els };
}

// SCREEN 4: ROOMS
function screen4() {
  const els = [rect(0,0,W,H,P.bg), statusBar()];
  els.push(text(20, 52, 200, 'Rooms', 26, P.text, { weight:'bold', ls:-0.5 }));
  els.push(text(20, 82, 240, 'Voice-first spaces', 13, P.muted));
  els.push(rect(20, 110, W-40, 44, P.card, { r:22, border:P.border, bw:1 }));
  els.push(text(46, 122, 200, 'Search rooms...', 13, P.muted));

  els.push(text(20, 172, 200, 'YOUR ROOMS', 10, P.muted, { weight:'semibold', ls:1.5 }));

  const rooms = [
    { name:'Design Critique', members:6, unread:3, active:true,  icon:'◈', iconColor:P.accentFg },
    { name:'Sprint Planning', members:4, unread:0, active:false, icon:'◇', iconColor:P.green },
    { name:'Eng — Async',     members:8, unread:1, active:true,  icon:'△', iconColor:P.yellow },
  ];

  let ry = 194;
  rooms.forEach(room => {
    const rh = 72;
    els.push(rect(20, ry, W-40, rh, room.active ? P.card2 : P.card, { r:14, border: room.active ? P.accent+'1A' : P.border, bw:1 }));
    els.push(rect(36, ry+18, 36, 36, room.iconColor+'22', { r:10 }));
    els.push(text(40, ry+27, 30, room.icon, 16, room.iconColor, { align:'center' }));
    els.push(text(84, ry+14, 200, room.name, 14, P.text, { weight:'semibold' }));
    els.push(text(84, ry+34, 200, room.members+' members', 11, P.muted));
    if (room.active) {
      waveform(84, ry+50, 80, 12, room.iconColor, { bars:12, gap:1.5, progress:0.5, unplayedColor:'rgba(255,255,255,0.08)' }).children.forEach(e => els.push(e));
    }
    if (room.unread > 0) {
      els.push(circle(W-46, ry+36, 12, P.accent3));
      els.push(text(W-58, ry+28, 24, ''+room.unread, 11, '#FFF', { align:'center', weight:'bold' }));
    }
    ry += rh + 10;
  });

  els.push(text(20, ry+12, 200, 'DISCOVER', 10, P.muted, { weight:'semibold', ls:1.5 }));
  ry += 34;

  const categories = ['Design','Engineering','Product','Marketing','Random'];
  let chipX = 20;
  categories.forEach(cat => {
    const chipW = cat.length * 7.5 + 24;
    const isFirst = cat === 'Design';
    els.push(rect(chipX, ry, chipW, 32, isFirst ? P.accent : P.card, { r:16, border: isFirst ? 'transparent' : P.border, bw:1 }));
    els.push(text(chipX+12, ry+8, chipW-24, cat, 12, isFirst ? '#FFF' : P.muted, { weight: isFirst ? 'semibold' : 'regular' }));
    chipX += chipW + 8;
  });

  ry += 48;
  [{ name:'Open Design Crit', members:22 }, { name:'Indie Makers Standup', members:41 }].forEach(room => {
    const rh = 58;
    els.push(rect(20, ry, W-40, rh, P.card, { r:14, border:P.border, bw:1 }));
    els.push(text(36, ry+12, 220, room.name, 13, P.text, { weight:'semibold' }));
    els.push(text(36, ry+32, 160, room.members+' members', 11, P.muted));
    els.push(rect(W-92, ry+16, 58, 26, P.card2, { r:13, border:P.border2, bw:1 }));
    els.push(text(W-86, ry+22, 46, '+ Join', 11, P.accentFg, { weight:'medium' }));
    ry += rh + 10;
  });

  els.push(bottomNav(1));
  return { id:'screen_rooms', name:'Rooms', backgroundColor: P.bg, elements: els };
}

// SCREEN 5: PROFILE
function screen5() {
  const els = [rect(0,0,W,H,P.bg), statusBar()];
  els.push(rect(0, 60, W, 220, P.accent, { opacity:0.05 }));
  avatar(W/2, 130, 44, 'YU', P.accent).children.forEach(e => els.push(e));
  els.push(circle(W/2+32, 100, 9, P.green, { border:P.bg, bw:2 }));
  els.push(text(20, 186, W-40, 'Your Name', 20, P.text, { weight:'bold', align:'center', ls:-0.3 }));
  els.push(text(20, 210, W-40, '@yourhandle  ·  Product Designer', 12, P.muted, { align:'center' }));

  const stats = [{ val:'184', label:'Voices sent' }, { val:'3.1K', label:'Mins listened' }, { val:'12', label:'Rooms' }];
  const sw = (W-40)/3;
  els.push(rect(20, 240, W-40, 72, P.card, { r:16, border:P.border, bw:1 }));
  stats.forEach((s,i) => {
    const cx = 20+i*sw+sw/2;
    els.push(text(cx-sw/2, 254, sw, s.val, 20, P.text, { weight:'bold', align:'center', ls:-0.5 }));
    els.push(text(cx-sw/2, 278, sw, s.label, 10, P.muted, { align:'center' }));
    if (i<2) els.push(rect(20+(i+1)*sw-0.5, 252, 1, 36, P.border));
  });

  els.push(text(20, 334, 200, 'RECENT ACTIVITY', 10, P.muted, { weight:'semibold', ls:1.5 }));
  els.push(rect(20, 356, W-40, 52, P.card, { r:14, border:P.border, bw:1 }));
  const days = ['M','T','W','T','F','S','S'];
  const activity = [3,5,7,4,9,2,1];
  const maxAct = Math.max(...activity);
  const dayW = (W-40-40)/7;
  days.forEach((d,i) => {
    const barH = Math.round(28*(activity[i]/maxAct));
    const bx = 40+i*dayW;
    const isToday = i===4;
    els.push(rect(bx, 356+4+(28-barH), dayW-6, barH, isToday ? P.accent : P.accent+'44', { r:3 }));
    els.push(text(bx, 392, dayW-6, d, 9, isToday ? P.accentFg : P.muted, { align:'center' }));
  });

  const settings = [
    { icon:'🔔', label:'Notifications', val:'On' },
    { icon:'🎧', label:'Playback speed', val:'1.2x' },
    { icon:'📝', label:'Auto-transcribe', val:'On' },
    { icon:'🔒', label:'Privacy', val:'' },
  ];
  let sy = 428;
  settings.forEach(s => {
    const sh = 52;
    els.push(rect(20, sy, W-40, sh, P.card, { r:12, border:P.border, bw:1 }));
    els.push(text(40, sy+16, 22, s.icon, 16));
    els.push(text(68, sy+15, 200, s.label, 13, P.text, { weight:'medium' }));
    if (s.val) els.push(text(W-76, sy+15, 56, s.val, 12, P.accentFg, { align:'right', weight:'medium' }));
    els.push(text(W-40, sy+15, 20, '>', 14, P.muted, { align:'right' }));
    sy += sh + 8;
  });

  els.push(bottomNav(4));
  return { id:'screen_profile', name:'Profile', backgroundColor: P.bg, elements: els };
}

const pen = {
  version: '2.8',
  meta: {
    name: 'Echo — Async Voice Messaging',
    description: 'Dark-first voice messaging for distributed teams. Electric violet + teal accents, waveform motifs, pure-black foundation.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    slug: SLUG,
  },
  canvas: { width: W, height: H, background: P.bg },
  screens: [ screen1(), screen2(), screen3(), screen4(), screen5() ],
};

fs.writeFileSync('echo.pen', JSON.stringify(pen, null, 2));
console.log('echo.pen written — screens:', pen.screens.length);
pen.screens.forEach(s => console.log('  ' + s.name + ': ' + s.elements.length + ' elements'));
