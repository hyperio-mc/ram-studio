// CHORD — Music discovery where playlists ARE gradient panels
// Inspired by: Stripe Sessions prismatic diagonal tiles + Kunsthalle Basel minimal chrome
// Palette: off-white lavender bg + deep midnight indigo + 6 mood gradients
// Anti-pattern: no album art, no dark-mode default, no Spotify clone

const fs = require('fs');

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#F5F3F8',   // Stripe Sessions near-white lavender
  surface: '#EDEAF4',   // slightly deeper surface
  raised:  '#E4E0F0',   // elevated card
  ink:     '#180A44',   // deep midnight indigo (Stripe Sessions type)
  muted:   '#8880A6',   // muted purple-gray
  faint:   '#C4BFD8',   // very faint rule / placeholder
  rule:    '#D4CFE6',   // lavender rule
  white:   '#FFFFFF',
  // 6 mood chords (each is a gradient pair: [primary, secondary])
  moods: {
    focus:  ['#2563EB', '#06B6D4'],  // blue → cyan (deep work)
    energy: ['#F97316', '#EF4444'],  // orange → red (workout)
    flow:   ['#F59E0B', '#FBBF24'],  // amber → gold (creative)
    dream:  ['#8B5CF6', '#EC4899'],  // violet → pink (ambient/sleep)
    ground: ['#10B981', '#065F46'],  // emerald → forest (focus/nature)
    pulse:  ['#F43F5E', '#A855F7'],  // rose → purple (party/hype)
  }
};

const W_M = 390, H_M = 844;
const W_D = 1440, H_D = 900;

// ── Primitives ────────────────────────────────────────────────────────────────
const R = (x,y,w,h,fill,r=0,opts={}) => ({
  type:'rectangle', x,y,width:Math.max(0,w),height:Math.max(0,h),fill,cornerRadius:r,...opts
});
const T = (content,x,y,size,fill,opts={}) => ({
  type:'text',content,x,y,fontSize:size,fill,fontFamily:'Inter',fontWeight:400,...opts
});
const TB = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontWeight:700,...opts});
const TL = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontWeight:300,...opts});
const TM = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontFamily:'JetBrains Mono',fontWeight:400,...opts});

// ── Gradient panel simulation ─────────────────────────────────────────────────
// Simulates a diagonal gradient using layered transparent rects
function GradPanel(x, y, w, h, [c1, c2], r=10, label='', sublabel='') {
  const els = [
    R(x, y, w, h, c1, r),
    // diagonal bleed from bottom-right corner
    R(x + w*0.35, y + h*0.3, w*0.65, h*0.7, c2+'BB', r),
    R(x + w*0.6,  y,         w*0.4,  h*0.55, c2+'66', r),
    // top-right subtle bloom
    R(x + w*0.75, y,         w*0.25, h*0.4,  C.white+'22', r),
  ];
  if (label) {
    els.push(TB(label, x+16, y+h-36, 13, C.white+'EE'));
    if (sublabel) els.push(T(sublabel, x+16, y+h-20, 10, C.white+'99'));
  }
  return els;
}

// Compact gradient chip (horizontal)
function GradChip(x, y, w, h, [c1, c2], label, active=false) {
  const r = h/2;
  const els = [
    R(x, y, w, h, c1, r),
    R(x+w*0.4, y, w*0.6, h, c2+'AA', r),
    T(label, x+12, y+h/2, 11, C.white+'EE',
      {textAlignVertical:'center',fontWeight:600}),
  ];
  if (active) {
    els.push(R(x-2, y-2, w+4, h+4, C.ink+'22', r+2));
    els.push(R(x, y, w, h, 'transparent', r, {stroke:C.ink,strokeWidth:2}));
  }
  return els;
}

// Progress bar
function ProgressBar(x, y, w, progress, color, bg=C.rule) {
  return [
    R(x, y, w, 3, bg, 2),
    R(x, y, Math.floor(w * progress), 3, color, 2),
  ];
}

// Avatar
function Avatar(x, y, size, initials, color=C.raised) {
  return [
    R(x, y, size, size, color, size/2),
    TB(initials, x+size/2, y+size/2, size*0.38, C.ink+'AA',
      {textAlignHorizontal:'center',textAlignVertical:'center'}),
  ];
}

// Mobile status bar
function StatusBar(x, y, w) {
  return [
    R(x,y,w,44,C.bg),
    TB('9:41', x+20, y+14, 13, C.ink),
    T('●●●● ▶ ⠿ 97%', x+w-16, y+14, 11, C.muted,
      {textAlignHorizontal:'right'}),
  ];
}

// Mobile header
function MobileHeader(x, y, w, title, showBack=false) {
  return [
    R(x,y,w,48,C.bg),
    R(x,y+48,w,1,C.rule),
    TB(title, x+w/2, y+24, 15, C.ink,
      {textAlignHorizontal:'center',textAlignVertical:'center'}),
    ...(showBack ? [T('←', x+16, y+24, 18, C.muted,{textAlignVertical:'center'})] : []),
  ];
}

// Bottom nav
function BottomNav(x, y, w, active=0) {
  const tabs = [
    {icon:'⌂', label:'Home'},
    {icon:'◎', label:'Discover'},
    {icon:'♪', label:'Library'},
    {icon:'◉', label:'Profile'},
  ];
  const els = [
    R(x,y,w,56,C.bg),
    R(x,y,w,1,C.rule),
  ];
  tabs.forEach((tab,i) => {
    const tx = x + (w/4)*(i+0.5);
    const isActive = i===active;
    els.push(T(tab.icon, tx, y+18, 18, isActive?C.ink:C.faint,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
    els.push(T(tab.label, tx, y+38, 9, isActive?C.ink:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:isActive?700:400}));
    if (isActive) els.push(R(tx-16, y, 32, 2, C.ink, 1));
  });
  return els;
}

// ── Mini player bar (mobile) ──────────────────────────────────────────────────
function MiniPlayer(x, y, w, mood='dream', track='Weightless', artist='Marconi Union') {
  const [c1,c2] = C.moods[mood];
  return [
    R(x,y,w,64,C.white,10),
    R(x,y,w,64,'transparent',10,{stroke:C.rule,strokeWidth:1}),
    // gradient thumb
    R(x+10, y+10, 44, 44, c1, 8),
    R(x+10+44*0.4, y+10, 44*0.6, 44, c2+'AA', 8),
    TB(track, x+64, y+18, 13, C.ink),
    T(artist, x+64, y+34, 10, C.muted),
    // controls
    T('⏮', x+w-96, y+22, 16, C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center'}),
    T('⏸', x+w-64, y+22, 20, C.ink,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}),
    T('⏭', x+w-32, y+22, 16, C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center'}),
    ...ProgressBar(x+10, y+60, w-20, 0.38, c1),
  ];
}

// ── SCREEN 1: Mobile Home ─────────────────────────────────────────────────────
function mHome() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));
  els.push(...MobileHeader(0,44,W_M,'CHORD'));

  // Greeting
  els.push(TB('Good evening.', 20, 104, 22, C.ink));
  els.push(TL('What do you need right now?', 20, 128, 13, C.muted));

  // 6 mood chips horizontal scroll
  const moods = [
    ['focus','Focus'],['energy','Energy'],['flow','Flow'],
    ['dream','Dream'],['ground','Ground'],['pulse','Pulse'],
  ];
  let chipX = 20;
  moods.forEach(([key, label]) => {
    const chipW = label.length * 7.5 + 28;
    els.push(...GradChip(chipX, 148, chipW, 28, C.moods[key], label, key==='dream'));
    chipX += chipW + 8;
  });

  // "Now Trending" section — 2-column gradient panel grid
  els.push(TB('Now Trending', 20, 194, 13, C.ink));
  els.push(T('↗ 12 new sessions today', W_M-16, 194, 10, C.muted,
    {textAlignHorizontal:'right',fontWeight:400}));

  const panelW = (W_M-48)/2;
  const panelH = 140;
  const trendingPanels = [
    { mood: 'dream', title: 'Dreamstate Vol.4', sub: '24 tracks · 1h 18m' },
    { mood: 'energy', title: 'Morning Charge', sub: '18 tracks · 52m' },
    { mood: 'focus', title: 'Deep Work II', sub: '31 tracks · 2h 04m' },
    { mood: 'pulse', title: 'Late Night Hype', sub: '22 tracks · 1h 07m' },
  ];
  trendingPanels.forEach((p,i) => {
    const px = 16 + (i%2)*(panelW+16);
    const py = 210 + Math.floor(i/2)*(panelH+12);
    els.push(...GradPanel(px, py, panelW, panelH, C.moods[p.mood], 10, p.title, p.sub));
  });

  // Recently played row
  const recY = 210 + 2*(panelH+12) + 8;
  els.push(TB('Recently Played', 20, recY, 13, C.ink));
  const recentMoods = ['flow','ground','focus','dream'];
  recentMoods.forEach((mood,i) => {
    const rx = 20 + i*82;
    const [c1,c2] = C.moods[mood];
    els.push(R(rx, recY+18, 70, 70, c1, 8));
    els.push(R(rx+70*0.4, recY+18, 70*0.6, 70, c2+'AA', 8));
  });

  // Mini player
  els.push(...MiniPlayer(0, H_M-120, W_M, 'dream'));
  els.push(...BottomNav(0, H_M-56, W_M, 0));

  return { type:'frame', id:'mHome', x:0, y:0, width:W_M, height:H_M, fill:C.bg, children:els };
}

// ── SCREEN 2: Mobile Player (full-screen gradient) ────────────────────────────
function mPlayer() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  const [c1,c2] = C.moods.dream;

  // Full-screen gradient panel fills top ~55% of screen
  const panH = 480;
  els.push(...GradPanel(0, 0, W_M, panH, C.moods.dream, 0));
  // Slight overlay for readability
  els.push(R(0, panH-120, W_M, 120, C.white+'AA'));

  // Status bar on gradient
  els.push(TB('9:41', 20, 14, 13, C.white));
  els.push(T('●●●● ▶ ⠿ 97%', W_M-16, 14, 11, C.white+'CC',
    {textAlignHorizontal:'right'}));

  // Back + menu
  els.push(T('∨', W_M/2, 54, 20, C.white+'CC',
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('⋯', W_M-24, 54, 20, C.white+'CC',
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Track name overlaying gradient bottom
  els.push(TB('Weightless', 24, panH-88, 28, C.ink));
  els.push(T('Marconi Union', 24, panH-56, 13, C.muted));

  // Mood label
  els.push(...GradChip(W_M-84, panH-68, 68, 22, C.moods.dream, 'Dream'));

  // Controls section (white bg)
  const ctrlY = panH + 16;

  // Progress bar full width
  els.push(...ProgressBar(24, ctrlY, W_M-48, 0.38, c1, C.rule));
  els.push(T('1:44', 24, ctrlY+10, 10, C.muted));
  els.push(T('4:34', W_M-24, ctrlY+10, 10, C.muted,{textAlignHorizontal:'right'}));

  // Main controls
  const controlsY = ctrlY+44;
  els.push(T('⟨⟨', 48, controlsY, 22, C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(W_M/2-30, controlsY-30, 60, 60, c1, 30));
  els.push(R(W_M/2-30, controlsY-30, 60, 60, c2+'66', 30));
  els.push(T('⏸', W_M/2, controlsY, 24, C.white,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));
  els.push(T('⟩⟩', W_M-48, controlsY, 22, C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Secondary controls
  const sec2Y = controlsY + 60;
  els.push(T('↺', 32, sec2Y, 18, C.faint,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('♡', W_M-32, sec2Y, 18, C.faint,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('⇌', W_M/2, sec2Y, 16, C.faint,{textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Queue preview
  const qY = sec2Y + 48;
  els.push(R(0, qY, W_M, H_M-qY, C.surface, 0));
  els.push(TB('Up Next', 20, qY+14, 12, C.ink));
  const queue = ['Clair de Lune','Gymnopédie No.1','Experience'];
  const qMoods = ['dream','dream','flow'];
  queue.forEach((track,i) => {
    const qiY = qY+36+i*48;
    const [qc1,qc2] = C.moods[qMoods[i]];
    els.push(R(20, qiY, 38, 38, qc1, 6));
    els.push(R(20+38*0.4, qiY, 38*0.6, 38, qc2+'AA', 6));
    els.push(TB(track, 68, qiY+8, 12, C.ink));
    els.push(T(['Debussy','Erik Satie','Ludovico Einaudi'][i], 68, qiY+24, 10, C.muted));
    els.push(T(['5:28','3:05','5:10'][i], W_M-20, qiY+19, 10, C.muted,
      {textAlignHorizontal:'right'}));
  });

  return { type:'frame', id:'mPlayer', x:0, y:0, width:W_M, height:H_M, fill:C.bg, children:els };
}

// ── SCREEN 3: Mobile Library ──────────────────────────────────────────────────
function mLibrary() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));
  els.push(...MobileHeader(0,44,W_M,'Library'));

  // Tabs
  const tabs = ['Playlists','Albums','Artists','Downloads'];
  const tabW = W_M/tabs.length;
  tabs.forEach((tab,i) => {
    const active = i===0;
    els.push(T(tab, 44+i*tabW, 104, 12, active?C.ink:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:active?700:400}));
    if(active) els.push(R(44+i*tabW-tab.length*3.5, 118, tab.length*7, 2, C.ink, 1));
  });
  els.push(R(0,122,W_M,1,C.rule));

  // Playlists — gradient panel list
  const playlists = [
    {mood:'dream',   name:'Late Night Study',    count:'24 tracks',  dur:'1h 22m'},
    {mood:'energy',  name:'Morning Run 5K',       count:'18 tracks',  dur:'54m'},
    {mood:'focus',   name:'Deep Work: Coding',    count:'31 tracks',  dur:'2h 08m'},
    {mood:'flow',    name:'Sunday Creative',      count:'14 tracks',  dur:'48m'},
    {mood:'pulse',   name:'Pre-Game Warmup',      count:'22 tracks',  dur:'1h 05m'},
    {mood:'ground',  name:'Hiking Playlist',      count:'27 tracks',  dur:'1h 40m'},
  ];

  let listY = 132;
  playlists.forEach((pl) => {
    const [c1,c2] = C.moods[pl.mood];
    els.push(R(0,listY,W_M,56,'transparent'));
    // Gradient thumbnail
    els.push(R(16, listY+8, 40, 40, c1, 6));
    els.push(R(16+40*0.4, listY+8, 40*0.6, 40, c2+'AA', 6));
    // Text
    els.push(TB(pl.name, 68, listY+16, 13, C.ink));
    els.push(T(`${pl.count} · ${pl.dur}`, 68, listY+32, 11, C.muted));
    // Chevron
    els.push(T('›', W_M-20, listY+28, 16, C.faint,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
    els.push(R(68, listY+56, W_M-68, 1, C.rule));
    listY += 56;
  });

  // Create playlist button
  els.push(R(16, listY+12, W_M-32, 44, C.raised, 22));
  els.push(TB('+ Create New Playlist', W_M/2, listY+34, 13, C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  els.push(...MiniPlayer(0, H_M-120, W_M, 'dream'));
  els.push(...BottomNav(0, H_M-56, W_M, 2));

  return { type:'frame', id:'mLibrary', x:0, y:0, width:W_M, height:H_M, fill:C.bg, children:els };
}

// ── SCREEN 4: Mobile Discover ─────────────────────────────────────────────────
function mDiscover() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));
  els.push(...MobileHeader(0,44,W_M,'Discover'));

  // Large editorial headline
  els.push(TB('Find your', 20, 106, 26, C.ink));
  els.push(TB('frequency.', 20, 136, 26, C.moods.dream[0]));

  // 6 large mood tiles — editorial grid
  // Top 2 large, bottom 4 smaller
  const topW = (W_M-48)/2;
  const topH = 160;
  const bottomW = (W_M-56)/3;
  const bottomH = 110;

  // Top row: Dream (large) + Energy (large)
  els.push(...GradPanel(16, 168, topW, topH, C.moods.dream, 10, 'Dream', 'ambient · sleep · peace'));
  els.push(...GradPanel(32+topW, 168, topW, topH, C.moods.energy, 10, 'Energy', 'workout · drive'));

  // Bottom row: 4 smaller
  const bottomMoods = [
    ['focus','Focus'],['flow','Flow'],['ground','Ground'],['pulse','Pulse']
  ];
  bottomMoods.forEach(([key,label],i) => {
    const bx = 16 + i*(bottomW+8);
    // wrap to 2 per row
    const brow = Math.floor(i/3);
    const bcol = i%3;
    const bpx = 16 + bcol*(bottomW+8);
    const bpy = 168+topH+10+brow*(bottomH+8);
    els.push(...GradPanel(bpx, bpy, bottomW, bottomH, C.moods[key], 8, label));
  });

  // "For You Today" strip
  const fyY = 168+topH+10+(bottomH+8)+8;
  els.push(TB('For You Today', 20, fyY+4, 13, C.ink));

  const forYou = [
    {mood:'dream', name:'Focus Session 3h', new:true},
    {mood:'flow',  name:'Sunday Jazz', new:false},
    {mood:'focus', name:'Binaural Beta', new:true},
  ];
  forYou.forEach((f,i) => {
    const fx = 16+i*((W_M-32)/3 + 8);
    const fw = (W_M-48)/3;
    const fh = 80;
    const fyY2 = fyY+22;
    els.push(...GradPanel(fx, fyY2, fw, fh, C.moods[f.mood], 8));
    if(f.new) {
      els.push(R(fx+fw-32, fyY2+6, 26, 14, C.white+'EE', 7));
      els.push(T('NEW', fx+fw-19, fyY2+13, 7, C.ink,
        {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));
    }
    els.push(T(f.name, fx, fyY2+fh+6, 9, C.muted, {width:fw}));
  });

  els.push(...MiniPlayer(0, H_M-120, W_M, 'dream'));
  els.push(...BottomNav(0, H_M-56, W_M, 1));

  return { type:'frame', id:'mDiscover', x:0, y:0, width:W_M, height:H_M, fill:C.bg, children:els };
}

// ── SCREEN 5: Mobile Search ───────────────────────────────────────────────────
function mSearch() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));
  els.push(...MobileHeader(0,44,W_M,'Search'));

  // Search bar
  els.push(R(16,97,W_M-32,42,C.surface,21));
  els.push(T('⌕  Search songs, artists, moods...', W_M/2, 118, 13, C.faint,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Browse by mood label
  els.push(TB('Browse by Mood', 20, 154, 13, C.ink));

  // 6 mood panels in 2-col grid
  const panW2 = (W_M-48)/2;
  const panH2 = 76;
  const moodEntries = Object.entries(C.moods);
  moodEntries.forEach(([key, pair],i) => {
    const col = i%2, row = Math.floor(i/2);
    const px = 16+col*(panW2+16);
    const py = 172+row*(panH2+10);
    const label = key.charAt(0).toUpperCase()+key.slice(1);
    els.push(...GradPanel(px, py, panW2, panH2, pair, 10, label));
  });

  // Recent searches
  const rsY = 172 + 3*(panH2+10) + 8;
  els.push(TB('Recent', 20, rsY, 13, C.ink));
  els.push(T('Clear', W_M-20, rsY, 11, C.muted,{textAlignHorizontal:'right',fontWeight:600}));
  const recents = ['Marconi Union', 'ambient piano', 'focus playlist', 'lo-fi beats'];
  recents.forEach((rec,i) => {
    els.push(T('⌕ '+rec, 20, rsY+20+i*34, 13, C.muted));
    els.push(T('↗', W_M-20, rsY+20+i*34, 13, C.faint,{textAlignHorizontal:'right'}));
    els.push(R(0,rsY+38+i*34,W_M,1,C.rule));
  });

  els.push(...BottomNav(0, H_M-56, W_M, 1));

  return { type:'frame', id:'mSearch', x:0, y:0, width:W_M, height:H_M, fill:C.bg, children:els };
}

// ── SCREEN 6: Desktop Home ────────────────────────────────────────────────────
function dHome() {
  const els = [R(0,0,W_D,H_D,C.bg)];

  // Left sidebar (220px)
  const SB = 220;
  els.push(R(0,0,SB,H_D,C.surface));
  els.push(R(SB,0,1,H_D,C.rule));

  // Logo
  els.push(R(0,0,SB,56,C.surface));
  els.push(TB('♩ CHORD', 24, 28, 16, C.ink, {textAlignVertical:'center'}));
  els.push(R(0,56,SB,1,C.rule));

  // Nav
  const navItems=[
    {icon:'⌂',label:'Home',active:true},
    {icon:'◎',label:'Discover',active:false},
    {icon:'♪',label:'Library',active:false},
    {icon:'⌕',label:'Search',active:false},
    {icon:'◉',label:'Profile',active:false},
  ];
  navItems.forEach((n,i) => {
    const ny=62+i*44;
    els.push(R(8,ny,SB-16,36,n.active?C.moods.dream[0]+'18':'transparent',8));
    els.push(T(n.icon,26,ny+18,14,n.active?C.ink:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
    els.push(T(n.label,44,ny+18,13,n.active?C.ink:C.muted,
      {textAlignVertical:'center',fontWeight:n.active?700:400}));
    if(n.active) els.push(R(SB-8,ny+10,3,16,C.ink,2));
  });

  // Mood filter chips in sidebar
  els.push(R(0,284,SB,1,C.rule));
  els.push(TM('MOODS',16,298,8,C.muted));
  Object.entries(C.moods).forEach(([key,pair],i) => {
    const my=310+i*34;
    const label=key.charAt(0).toUpperCase()+key.slice(1);
    els.push(R(12,my+2,8,20,pair[0],4));
    els.push(T(label,28,my+12,12,C.ink,{textAlignVertical:'center'}));
    els.push(T('48',SB-16,my+12,10,C.muted,{textAlignHorizontal:'right',textAlignVertical:'center'}));
  });

  // Recent at bottom of sidebar
  els.push(R(0,H_D-64,SB,64,C.raised));
  els.push(R(0,H_D-64,SB,1,C.rule));
  els.push(...Avatar(12,H_D-48,36,'AK',C.moods.dream[0]+'44'));
  els.push(TB('Aiko K.',56,H_D-46,12,C.ink));
  els.push(T('Free Plan',56,H_D-32,10,C.muted));

  // Main content (740px)
  const MX=SB+1, MW=740;
  els.push(R(MX,0,MW,H_D,'transparent'));

  // Header
  els.push(R(MX,0,MW,52,C.bg));
  els.push(R(MX,52,MW,1,C.rule));
  els.push(TB('Good evening, Aiko',MX+20,26,16,C.ink,{textAlignVertical:'center'}));
  els.push(R(MX+MW-50,12,38,30,C.raised,15));
  els.push(T('⌕',MX+MW-31,27,14,C.muted,{textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Hero strip — "Your Mood Right Now"
  const heroY=56;
  els.push(R(MX,heroY,MW,200,C.surface));
  els.push(TB('Your Mood Right Now',MX+20,heroY+18,13,C.ink));
  els.push(T('Based on 9 PM listening patterns',MX+20,heroY+36,11,C.muted));

  // Large gradient panel
  const heroPW=320,heroPH=140;
  els.push(...GradPanel(MX+MW-heroPW-20, heroY+24, heroPW, heroPH,
    C.moods.dream, 12, 'Dreamstate Vol.4', '24 tracks · 1h 18m · 847 listeners'));
  // Play button
  els.push(R(MX+20,heroY+50,100,40,C.ink,20));
  els.push(TB('▶  Play',MX+70,heroY+70,12,C.white,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('or choose a mood →',MX+132,heroY+70,11,C.muted,{textAlignVertical:'center'}));

  // Trending panels grid
  const gridY=heroY+208;
  els.push(TB('Trending',MX+20,gridY,13,C.ink));
  els.push(T('See all →',MX+MW-20,gridY,11,C.moods.dream[0],
    {textAlignHorizontal:'right',fontWeight:600}));

  const gridPW=(MW-60)/3;
  const gridPH=160;
  const trending=[
    {mood:'dream',   name:'Late Night Sessions', plays:'12.4k plays'},
    {mood:'energy',  name:'Morning Charge',       plays:'8.7k plays'},
    {mood:'focus',   name:'Deep Work II',         plays:'6.2k plays'},
  ];
  trending.forEach((t,i) => {
    const px=MX+20+i*(gridPW+10);
    els.push(...GradPanel(px,gridY+18,gridPW,gridPH,C.moods[t.mood],10,t.name,t.plays));
  });

  // Recently played row
  const rpY=gridY+18+gridPH+20;
  els.push(TB('Recently Played',MX+20,rpY,13,C.ink));
  const recent=[
    {mood:'flow',   name:'Sunday Jazz',    artist:'Various Artists'},
    {mood:'ground', name:'Forest Bathing', artist:'Hiroshi Yoshimura'},
    {mood:'focus',  name:'Binaural Beta',  artist:'Brain.fm'},
    {mood:'pulse',  name:'Pre-Game',       artist:'Your Mix'},
  ];
  recent.forEach((r,i) => {
    const rx=MX+20+i*((MW-40)/4+8);
    const rw=(MW-40)/4-2;
    const [c1,c2]=C.moods[r.mood];
    els.push(R(rx,rpY+18,rw,80,c1,8));
    els.push(R(rx+rw*0.4,rpY+18,rw*0.6,80,c2+'AA',8));
    els.push(T(r.name,rx,rpY+106,11,C.ink,{width:rw,fontWeight:600}));
    els.push(T(r.artist,rx,rpY+120,9,C.muted,{width:rw}));
  });

  // Right panel (player) 
  const RP_X=MX+MW+1, RP_W=W_D-RP_X;
  els.push(R(RP_X,0,1,H_D,C.rule));
  els.push(R(RP_X,0,RP_W,H_D,C.bg));

  // Now playing in right panel
  const [c1,c2]=C.moods.dream;
  els.push(...GradPanel(RP_X+12,8,RP_W-24,RP_W-24,C.moods.dream,12));
  els.push(TB('Weightless',RP_X+12,RP_W+14,14,C.ink));
  els.push(T('Marconi Union',RP_X+12,RP_W+30,11,C.muted));
  els.push(T('♡',RP_X+RP_W-24,RP_W+20,18,C.faint,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  els.push(...ProgressBar(RP_X+12,RP_W+52,RP_W-24,0.38,c1));
  els.push(T('1:44',RP_X+12,RP_W+62,9,C.muted));
  els.push(T('4:34',RP_X+RP_W-12,RP_W+62,9,C.muted,{textAlignHorizontal:'right'}));

  const ctrlY=RP_W+80;
  els.push(T('⏮',RP_X+RP_W/2-50,ctrlY,18,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(RP_X+RP_W/2-22,ctrlY-22,44,44,c1,22));
  els.push(R(RP_X+RP_W/2-22,ctrlY-22,44,44,c2+'66',22));
  els.push(T('⏸',RP_X+RP_W/2,ctrlY,18,C.white,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));
  els.push(T('⏭',RP_X+RP_W/2+50,ctrlY,18,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Volume
  els.push(...ProgressBar(RP_X+12,ctrlY+40,RP_W-24,0.7,C.ink+'88'));

  return { type:'frame', id:'dHome', x:0, y:0, width:W_D, height:H_D, fill:C.bg, children:els };
}

// ── SCREEN 7: Desktop Discover ───────────────────────────────────────────────
function dDiscover() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  const SB=220;
  els.push(R(0,0,SB,H_D,C.surface));
  els.push(R(SB,0,1,H_D,C.rule));
  els.push(TB('♩ CHORD',24,28,16,C.ink,{textAlignVertical:'center'}));
  els.push(R(0,56,SB,1,C.rule));

  const MX=SB+1, MW=W_D-SB-1;
  els.push(R(MX,0,MW,H_D,'transparent'));

  // Header
  els.push(R(MX,0,MW,52,C.bg));
  els.push(R(MX,52,MW,1,C.rule));
  els.push(TB('Discover',MX+20,26,16,C.ink,{textAlignVertical:'center'}));
  els.push(T('What do you need today?',MX+20,42,11,C.muted));

  // Mood filter tabs
  const tabMoods=['All','Focus','Energy','Flow','Dream','Ground','Pulse'];
  let tabX=MX+20;
  tabMoods.forEach((tab,i) => {
    const active=i===0;
    const tw=tab.length*7.5+20;
    els.push(R(tabX,58,tw,24,active?C.ink:C.raised,12));
    els.push(T(tab,tabX+tw/2,70,10,active?C.white:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:active?700:400}));
    tabX+=tw+8;
  });

  // Editorial hero — large gradient + curated text (Kunsthalle Basel influence)
  const heroW=Math.floor(MW*0.55), heroH=260;
  els.push(...GradPanel(MX+20, 90, heroW, heroH, C.moods.dream, 12,
    'Dreamstate — The Collection', 'Curated for late hours · 24 sessions · 6h 44m'));

  // Editorial text beside hero
  const editX=MX+20+heroW+20;
  const editW=MW-heroW-60;
  els.push(TB('Editor\'s Pick',editX,100,10,C.muted,{fontFamily:'JetBrains Mono'}));
  els.push(TB('Music that slows time down.',editX,120,20,C.ink,{width:editW,lineHeight:1.3}));
  els.push(TL('We curated 24 sessions from the ambient catalog specifically for the hours between 10pm and 2am — when the creative mind runs cleanest.',
    editX,164,13,C.muted,{width:editW,lineHeight:1.65}));
  els.push(R(editX,220,80,36,C.ink,18));
  els.push(TB('Listen Now',editX+40,238,11,C.white,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(editX+88,220,80,36,C.raised,18));
  els.push(T('Save',editX+128,238,11,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // 6-mood grid below
  const moods6Y=90+heroH+20;
  els.push(TB('All Moods',MX+20,moods6Y,13,C.ink));
  const gw=(MW-60)/6, gh=100;
  Object.entries(C.moods).forEach(([key,pair],i) => {
    const label=key.charAt(0).toUpperCase()+key.slice(1);
    const px=MX+20+i*(gw+8);
    els.push(...GradPanel(px,moods6Y+18,gw,gh,pair,8,label));
  });

  // Recent additions below moods
  const raY=moods6Y+18+gh+20;
  els.push(TB('New This Week',MX+20,raY,13,C.ink));
  const newThisWeek=[
    {mood:'pulse',name:'Club Classics 2026',plays:'4.2k'},
    {mood:'focus',name:'Synthwave Study',   plays:'2.8k'},
    {mood:'flow', name:'Coffee Shop Jazz',  plays:'1.1k'},
    {mood:'ground',name:'Forest Ambience', plays:'847'},
  ];
  const nw=(MW-60)/4;
  newThisWeek.forEach((n,i) => {
    const [c1,c2]=C.moods[n.mood];
    const nx=MX+20+i*(nw+8);
    els.push(R(nx,raY+18,nw,80,c1,8));
    els.push(R(nx+nw*0.4,raY+18,nw*0.6,80,c2+'AA',8));
    els.push(TB(n.name,nx,raY+106,11,C.ink,{width:nw}));
    els.push(T(n.plays+' plays',nx,raY+120,9,C.muted));
  });

  return { type:'frame', id:'dDiscover', x:0, y:0, width:W_D, height:H_D, fill:C.bg, children:els };
}

// ── SCREEN 8: Desktop Full Player ────────────────────────────────────────────
function dPlayer() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  const [c1,c2]=C.moods.dream;

  // Full bleed gradient panel left 50%
  const half=W_D/2;
  els.push(...GradPanel(0,0,half,H_D,C.moods.dream,0));
  els.push(R(0,H_D-180,half,180,C.white+'CC'));

  // Right side: white with track info + controls
  els.push(R(half,0,W_D-half,H_D,C.bg));
  els.push(R(half,0,1,H_D,C.rule));

  // Left: back + track title overlaid on gradient
  els.push(T('← Back to Home',32,28,12,C.white+'AA',{fontWeight:600}));
  els.push(TB('Weightless',32,H_D-148,40,C.ink));
  els.push(T('Marconi Union',32,H_D-100,15,C.muted));
  els.push(...GradChip(32,H_D-72,72,24,C.moods.dream,'Dream'));

  // Right: controls
  const RX=half+40;
  const RW=W_D-half-80;

  // Track header
  els.push(TB('Now Playing',RX,32,11,C.muted,{fontFamily:'JetBrains Mono'}));
  els.push(R(RX,52,RW,1,C.rule));

  // Waveform-style progress (simulated with varying height bars)
  const wfY=64, wfH=60, wfW=RW;
  const barCount=80;
  const barW=Math.floor(wfW/barCount)-1;
  const progress=0.38;
  for(let i=0;i<barCount;i++) {
    const bh=Math.max(8,Math.floor(Math.random()*wfH));
    const bx=RX+i*(barW+1);
    const by=wfY+(wfH-bh)/2;
    const played=i/barCount < progress;
    els.push(R(bx,by,barW,bh,played?c1+'CC':C.rule,1));
  }
  els.push(T('1:44',RX,wfY+wfH+4,9,C.muted));
  els.push(T('4:34',RX+RW,wfY+wfH+4,9,C.muted,{textAlignHorizontal:'right'}));

  // Main controls
  const ctrlY=wfY+wfH+44;
  els.push(T('↺',RX,ctrlY+12,18,C.faint,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('⏮',RX+RW/2-80,ctrlY+12,22,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(RX+RW/2-32,ctrlY-8,64,64,c1,32));
  els.push(R(RX+RW/2-32,ctrlY-8,64,64,c2+'66',32));
  els.push(T('⏸',RX+RW/2,ctrlY+24,26,C.white,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));
  els.push(T('⏭',RX+RW/2+80,ctrlY+12,22,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('⇌',RX+RW,ctrlY+12,18,C.faint,{textAlignHorizontal:'right',textAlignVertical:'center'}));

  // Volume
  const volY=ctrlY+72;
  els.push(T('🔈',RX,volY+2,11,C.faint));
  els.push(...ProgressBar(RX+20,volY+4,RW-44,0.7,C.ink+'66'));
  els.push(T('🔊',RX+RW,volY+2,11,C.faint,{textAlignHorizontal:'right'}));

  // Queue below
  const queueY=volY+36;
  els.push(R(RX-40,queueY,RW+80,1,C.rule));
  els.push(TB('Up Next',RX,queueY+12,12,C.ink));
  const queueTracks=[
    {mood:'dream',name:'Clair de Lune',        artist:'Debussy',       dur:'5:28'},
    {mood:'dream',name:'Gymnopédie No.1',       artist:'Erik Satie',    dur:'3:05'},
    {mood:'flow', name:'Experience',            artist:'L. Einaudi',    dur:'5:10'},
    {mood:'focus',name:'Time',                  artist:'Hans Zimmer',   dur:'4:36'},
  ];
  queueTracks.forEach((q,i) => {
    const qiY=queueY+34+i*52;
    const [qc1,qc2]=C.moods[q.mood];
    els.push(R(RX,qiY,44,44,qc1,6));
    els.push(R(RX+44*0.4,qiY,44*0.6,44,qc2+'AA',6));
    els.push(TB(q.name,RX+54,qiY+10,13,C.ink));
    els.push(T(q.artist,RX+54,qiY+26,11,C.muted));
    els.push(T(q.dur,RX+RW,qiY+22,10,C.muted,{textAlignHorizontal:'right'}));
    els.push(R(RX,qiY+48,RW,1,C.rule));
  });

  return { type:'frame', id:'dPlayer', x:0, y:0, width:W_D, height:H_D, fill:C.bg, children:els };
}

// ── SCREEN 9: Desktop Library ────────────────────────────────────────────────
function dLibrary() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  const SB=220;
  els.push(R(0,0,SB,H_D,C.surface));
  els.push(R(SB,0,1,H_D,C.rule));
  els.push(TB('♩ CHORD',24,28,16,C.ink,{textAlignVertical:'center'}));
  els.push(R(0,56,SB,1,C.rule));

  const MX=SB+1, MW=W_D-SB-1;

  // Header
  els.push(R(MX,0,MW,52,C.bg));
  els.push(R(MX,52,MW,1,C.rule));
  els.push(TB('Your Library',MX+20,26,16,C.ink,{textAlignVertical:'center'}));

  // View tabs
  const views=['Grid','List','By Mood'];
  views.forEach((v,i) => {
    const active=i===0;
    els.push(R(MX+MW-180+i*58,16,52,22,active?C.raised:'transparent',11));
    els.push(T(v,MX+MW-180+i*58+26,27,10,active?C.ink:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:active?700:400}));
  });

  // Filters
  els.push(R(MX,52,MW,40,C.surface));
  els.push(R(MX,92,MW,1,C.rule));
  const filters=['All Playlists','Saved Albums','Downloaded','Created by You'];
  let fx=MX+20;
  filters.forEach((f,i) => {
    const active=i===0;
    els.push(T(f,fx,72,11,active?C.ink:C.muted,
      {textAlignVertical:'center',fontWeight:active?700:400}));
    if(active) els.push(R(fx,90,f.length*6.5,2,C.ink,1));
    fx+=f.length*6.5+28;
  });

  // Grid of playlist panels
  const playlists=[
    {mood:'dream',   name:'Late Night Study',  count:'24 tracks', hr:'1h 22m'},
    {mood:'energy',  name:'Morning Run 5K',    count:'18 tracks', hr:'54m'},
    {mood:'focus',   name:'Deep Work: Code',   count:'31 tracks', hr:'2h 08m'},
    {mood:'flow',    name:'Sunday Creative',   count:'14 tracks', hr:'48m'},
    {mood:'pulse',   name:'Pre-Game Warmup',   count:'22 tracks', hr:'1h 05m'},
    {mood:'ground',  name:'Hiking Playlist',   count:'27 tracks', hr:'1h 40m'},
    {mood:'dream',   name:'Sleep Soundscape',  count:'8 tracks',  hr:'3h 20m'},
    {mood:'flow',    name:'Coffee & Jazz',     count:'19 tracks', hr:'1h 12m'},
    {mood:'focus',   name:'Binaural Study',    count:'12 tracks', hr:'2h 00m'},
  ];
  const cols=4, panW3=(MW-40-cols*12)/cols, panH3=160;
  playlists.forEach((pl,i) => {
    const col=i%cols, row=Math.floor(i/cols);
    const px=MX+20+col*(panW3+12);
    const py=98+row*(panH3+16);
    els.push(...GradPanel(px,py,panW3,panH3,C.moods[pl.mood],10,pl.name,`${pl.count} · ${pl.hr}`));
  });

  // Add playlist button
  const addRow=Math.floor(playlists.length/cols);
  const addCol=playlists.length%cols;
  const addX=MX+20+addCol*(panW3+12);
  const addY=98+addRow*(panH3+16);
  els.push(R(addX,addY,panW3,panH3,C.raised,10));
  els.push(T('+',addX+panW3/2,addY+panH3/2-10,32,C.faint,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('New Playlist',addX+panW3/2,addY+panH3/2+20,11,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  return { type:'frame', id:'dLibrary', x:0, y:0, width:W_D, height:H_D, fill:C.bg, children:els };
}

// ── SCREEN 10: Desktop Queue + Mood Analysis ─────────────────────────────────
function dQueue() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  const SB=220;
  els.push(R(0,0,SB,H_D,C.surface));
  els.push(R(SB,0,1,H_D,C.rule));
  els.push(TB('♩ CHORD',24,28,16,C.ink,{textAlignVertical:'center'}));
  els.push(R(0,56,SB,1,C.rule));

  const MX=SB+1, MW=W_D-SB-1;

  // Two-panel layout: queue (left 480px) + mood analysis (right)
  const QW=480;
  els.push(R(MX,0,QW,H_D,'transparent'));
  els.push(R(MX+QW,0,1,H_D,C.rule));

  // Queue header
  els.push(R(MX,0,QW,52,C.bg));
  els.push(R(MX,52,QW,1,C.rule));
  els.push(TB('Queue',MX+20,26,16,C.ink,{textAlignVertical:'center'}));
  els.push(T('14 tracks · 1h 12m',MX+20,42,10,C.muted));
  els.push(T('Clear all',MX+QW-20,26,11,C.muted,
    {textAlignHorizontal:'right',fontWeight:600,textAlignVertical:'center'}));

  // Current track
  els.push(R(MX,52,QW,84,C.surface));
  els.push(R(MX,136,QW,1,C.rule));
  const [dc1,dc2]=C.moods.dream;
  els.push(R(MX+16,62,60,60,dc1,8));
  els.push(R(MX+16+60*0.4,62,60*0.6,60,dc2+'AA',8));
  els.push(TB('Weightless',MX+86,70,14,C.ink));
  els.push(T('Marconi Union · Weightless',MX+86,88,11,C.muted));
  els.push(...GradChip(MX+86,100,56,20,C.moods.dream,'Dream'));
  els.push(...ProgressBar(MX+16,124,QW-32,0.38,dc1));
  els.push(T('Now Playing',MX+QW-20,68,9,C.moods.dream[0],
    {textAlignHorizontal:'right',fontWeight:700,fontFamily:'JetBrains Mono'}));

  // Queue list
  const queueItems=[
    {mood:'dream',  name:'Clair de Lune',       artist:'Debussy',              dur:'5:28'},
    {mood:'dream',  name:'Gymnopédie No.1',      artist:'Erik Satie',           dur:'3:05'},
    {mood:'flow',   name:'Experience',           artist:'Ludovico Einaudi',     dur:'5:10'},
    {mood:'focus',  name:'Time',                 artist:'Hans Zimmer',          dur:'4:36'},
    {mood:'dream',  name:'Holocene',             artist:'Bon Iver',             dur:'5:37'},
    {mood:'ground', name:'Ólafur Arnalds',       artist:'Near Light',           dur:'4:50'},
    {mood:'flow',   name:'La Valse d\'Amélie',   artist:'Yann Tiersen',         dur:'2:47'},
  ];
  queueItems.forEach((q,i) => {
    const qiY=140+i*50;
    const [qc1,qc2]=C.moods[q.mood];
    els.push(R(MX,qiY,QW,50,'transparent'));
    els.push(R(MX+16,qiY+5,40,40,qc1,6));
    els.push(R(MX+16+40*0.4,qiY+5,40*0.6,40,qc2+'AA',6));
    els.push(TB(q.name,MX+66,qiY+13,12,C.ink));
    els.push(T(q.artist,MX+66,qiY+28,10,C.muted));
    els.push(T(q.dur,MX+QW-20,qiY+22,10,C.muted,{textAlignHorizontal:'right'}));
    els.push(T('⋯',MX+QW-48,qiY+22,14,C.faint,{textAlignHorizontal:'center',textAlignVertical:'center'}));
    els.push(R(MX+16,qiY+50,QW-32,1,C.rule));
  });

  // Right panel: Mood Analysis
  const AX=MX+QW+1, AW=MW-QW-1;
  els.push(R(AX,0,AW,52,C.bg));
  els.push(R(AX,52,AW,1,C.rule));
  els.push(TB('Mood Analysis',AX+16,26,14,C.ink,{textAlignVertical:'center'}));
  els.push(T('This queue · 14 tracks',AX+16,42,10,C.muted));

  // Mood breakdown bars
  const moodBreakdown=[
    {key:'dream', pct:68},
    {key:'flow',  pct:18},
    {key:'focus', pct:8},
    {key:'ground',pct:6},
  ];
  let brkY=64;
  els.push(TM('MOOD DISTRIBUTION',AX+16,brkY,8,C.muted));
  brkY+=18;
  moodBreakdown.forEach(({key,pct}) => {
    const [mc1]=C.moods[key];
    const label=key.charAt(0).toUpperCase()+key.slice(1);
    els.push(T(label,AX+16,brkY+14,12,C.ink,{textAlignVertical:'center'}));
    els.push(T(`${pct}%`,AX+AW-16,brkY+14,11,mc1,
      {textAlignHorizontal:'right',textAlignVertical:'center',fontWeight:700}));
    els.push(R(AX+16,brkY+26,AW-32,6,C.rule,3));
    els.push(R(AX+16,brkY+26,Math.floor((AW-32)*pct/100),6,mc1+'AA',3));
    brkY+=46;
  });

  // Mood summary card
  brkY+=10;
  els.push(R(AX+16,brkY,AW-32,100,C.surface,10));
  els.push(...GradPanel(AX+16,brkY,AW-32,100,C.moods.dream,10));
  els.push(TB('Predominantly Dream',AX+28,brkY+24,13,C.white+'EE'));
  els.push(TL('This queue is built for quiet, focused states. Ideal for late evenings, light reading, or creative work.',
    AX+28,brkY+44,11,C.white+'BB',{width:AW-60,lineHeight:1.5}));

  // Energy timeline
  brkY+=114;
  els.push(TM('ENERGY ARC',AX+16,brkY,8,C.muted));
  brkY+=16;
  // Simple bar chart
  const energyValues=[40,35,30,45,32,38,28,30,25,28,35,42,38,30];
  const barW2=Math.floor((AW-32)/energyValues.length)-2;
  energyValues.forEach((v,i) => {
    const bh=Math.floor(60*v/100);
    const bx=AX+16+i*(barW2+2);
    const by=brkY+60-bh;
    const playing=i===0;
    els.push(R(bx,by,barW2,bh,playing?dc1:C.rule,2));
  });
  els.push(T('low energy',AX+16,brkY+66,8,C.faint));
  els.push(T('high',AX+AW-16,brkY+66,8,C.faint,{textAlignHorizontal:'right'}));

  return { type:'frame', id:'dQueue', x:0, y:0, width:W_D, height:H_D, fill:C.bg, children:els };
}

// ── Build ─────────────────────────────────────────────────────────────────────
// Fix the ++ typo in dHome
function buildPen() {
  const pen = {
    version: '2.8',
    children: [
      mHome(), mPlayer(), mLibrary(), mDiscover(), mSearch(),
      dHome(), dDiscover(), dPlayer(), dLibrary(), dQueue(),
    ]
  };
  // Fix any NaN/invalid values
  const clean = JSON.parse(JSON.stringify(pen, (k, v) => {
    if (typeof v === 'number' && !isFinite(v)) return 0;
    return v;
  }));
  fs.writeFileSync('/workspace/group/design-studio/chord.pen', JSON.stringify(clean, null, 2));
  console.log('✓ chord.pen written — 10 screens (5 mobile, 5 desktop)');
}

buildPen();
