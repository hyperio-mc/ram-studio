/**
 * gen-solace.js
 * Solace — Your quiet corner for reflection
 *
 * Inspired by: "Dawn: AI for Mental Health" on land-book.com and
 * "Maxima Therapy" on Awwwards — both showcasing warm editorial light themes
 * for wellness/mental health products. Strong trend toward cream backgrounds,
 * serif display type, and gentle terracotta/sage palettes.
 *
 * Theme: LIGHT — warm cream editorial
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F7F3EE',   // warm cream
  surface:   '#FEFCFA',   // near-white warm
  surface2:  '#F0EBE3',   // warm sand
  card:      '#FFFFFF',
  text:      '#1C1815',   // warm near-black
  textMid:   '#5A4E44',   // warm brown-grey
  muted:     '#A89B8E',   // warm muted
  accent:    '#C87860',   // terracotta
  accent2:   '#7A9E82',   // sage green
  accentSoft:'#F0DDD6',   // soft blush
  sage:      '#EAF1EB',   // soft sage tint
  separator: '#E8E0D8',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function px(n) { return { unit: 'px', value: n }; }
function pct(n) { return { unit: '%', value: n }; }
function rgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function color(hex) {
  return { type: 'hex', value: hex };
}

function frame(props) {
  return {
    id: makeId(),
    type: 'FRAME',
    x: 0, y: 0,
    width: 390, height: 844,
    fills: [{ type: 'SOLID', color: color(P.bg) }],
    cornerRadius: 40,
    clips: true,
    children: [],
    ...props
  };
}

function rect(props) {
  return {
    id: makeId(),
    type: 'RECTANGLE',
    x: 0, y: 0,
    width: 100, height: 40,
    fills: [{ type: 'SOLID', color: color(P.surface) }],
    cornerRadius: 0,
    children: [],
    ...props
  };
}

function text(content, props) {
  return {
    id: makeId(),
    type: 'TEXT',
    x: 0, y: 0,
    width: 340,
    height: 30,
    content,
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: 0,
    textAlign: 'left',
    fills: [{ type: 'SOLID', color: color(P.text) }],
    children: [],
    ...props
  };
}

function circle(props) {
  return {
    id: makeId(),
    type: 'ELLIPSE',
    x: 0, y: 0,
    width: 48, height: 48,
    fills: [{ type: 'SOLID', color: color(P.accent) }],
    children: [],
    ...props
  };
}

// ─── Screen 1: Today ─────────────────────────────────────────────────────────
function buildScreenToday() {
  const children = [];

  // Status bar
  children.push(rect({ x:0, y:0, width:390, height:50,
    fills:[{type:'SOLID', color:color(P.bg)}] }));
  children.push(text('9:41', { x:16, y:16, width:50, height:22,
    fontSize:13, fontWeight:600, fills:[{type:'SOLID',color:color(P.textMid)}] }));
  children.push(text('···', { x:350, y:16, width:40, height:22,
    fontSize:15, fontWeight:600, textAlign:'right', fills:[{type:'SOLID',color:color(P.textMid)}] }));

  // Header area
  children.push(text('Good morning,', { x:24, y:60, width:300, height:26,
    fontSize:13, letterSpacing:1.5, fontFamily:'Inter',
    fills:[{type:'SOLID',color:color(P.muted)}] }));
  children.push(text('Anika.', { x:24, y:84, width:280, height:52,
    fontSize:40, fontFamily:'Georgia', fontWeight:700, lineHeight:1.1,
    fills:[{type:'SOLID',color:color(P.text)}] }));

  // Date chip
  children.push(rect({ x:24, y:142, width:130, height:28,
    cornerRadius:14, fills:[{type:'SOLID',color:color(P.surface2)}] }));
  children.push(text('Tue, Apr 1', { x:34, y:148, width:110, height:18,
    fontSize:12, fontFamily:'Inter', fontWeight:500,
    fills:[{type:'SOLID',color:color(P.textMid)}] }));

  // Today's mood card
  children.push(rect({ x:24, y:184, width:342, height:180,
    cornerRadius:20,
    fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.10),offset:{x:0,y:4},blur:24}] }));
  children.push(text('How are you feeling?', { x:44, y:204, width:280, height:22,
    fontSize:11, fontFamily:'Inter', fontWeight:600, letterSpacing:1.2,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Mood options row
  const moods = [
    { emoji:'😌', label:'Calm',   x:44 },
    { emoji:'😊', label:'Happy',  x:108 },
    { emoji:'😤', label:'Tense',  x:172 },
    { emoji:'😔', label:'Low',    x:236 },
    { emoji:'✨', label:'Great',  x:300 },
  ];
  moods.forEach(m => {
    const isActive = m.label === 'Calm';
    children.push(rect({ x:m.x, y:230, width:52, height:60, cornerRadius:14,
      fills:[{type:'SOLID',color:color(isActive ? P.accentSoft : P.bg)}],
      ...(isActive ? {strokeWeight:1.5, strokes:[{type:'SOLID',color:color(P.accent)}]} : {}) }));
    children.push(text(m.emoji, { x:m.x+14, y:238, width:24, height:28, fontSize:22 }));
    children.push(text(m.label, { x:m.x-2, y:268, width:56, height:14,
      fontSize:10, fontFamily:'Inter', textAlign:'center',
      fills:[{type:'SOLID',color:color(isActive ? P.accent : P.muted)}] }));
  });

  children.push(text('Log feeling ›', { x:44, y:308, width:200, height:22,
    fontSize:13, fontFamily:'Inter', fontWeight:500,
    fills:[{type:'SOLID',color:color(P.accent)}] }));

  // Streak card
  children.push(rect({ x:24, y:378, width:160, height:90,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.accentSoft)}] }));
  children.push(text('🔥', { x:40, y:394, width:30, height:28, fontSize:24 }));
  children.push(text('12', { x:40, y:424, width:80, height:36,
    fontSize:28, fontFamily:'Georgia', fontWeight:700,
    fills:[{type:'SOLID',color:color(P.accent)}] }));
  children.push(text('day streak', { x:40, y:454, width:100, height:16,
    fontSize:11, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.textMid)}] }));

  // Prompt card
  children.push(rect({ x:196, y:378, width:170, height:90,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.sage)}] }));
  children.push(text('🌿', { x:212, y:394, width:30, height:28, fontSize:22 }));
  children.push(text('"What made\nyou smile?"', { x:212, y:422, width:140, height:36,
    fontSize:13, fontFamily:'Georgia', fontStyle:'italic', lineHeight:1.3,
    fills:[{type:'SOLID',color:color(P.text)}] }));

  // Journal prompt
  children.push(text("Today's prompt", { x:24, y:484, width:200, height:20,
    fontSize:11, fontFamily:'Inter', fontWeight:600, letterSpacing:1.0,
    fills:[{type:'SOLID',color:color(P.muted)}] }));
  children.push(rect({ x:24, y:508, width:342, height:100,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.08),offset:{x:0,y:2},blur:12}] }));
  children.push(text('"Describe a moment this week\nwhere you felt most yourself."', {
    x:40, y:526, width:300, height:50,
    fontSize:15, fontFamily:'Georgia', fontStyle:'italic', lineHeight:1.55,
    fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('Start writing ›', { x:40, y:582, width:180, height:20,
    fontSize:13, fontFamily:'Inter', fontWeight:500,
    fills:[{type:'SOLID',color:color(P.accent)}] }));

  // Recent entries header
  children.push(text('Recent', { x:24, y:626, width:120, height:22,
    fontSize:11, fontFamily:'Inter', fontWeight:600, letterSpacing:1.0,
    fills:[{type:'SOLID',color:color(P.muted)}] }));
  children.push(text('See all', { x:318, y:626, width:60, height:22,
    fontSize:12, fontFamily:'Inter', textAlign:'right',
    fills:[{type:'SOLID',color:color(P.accent)}] }));

  // Entry chip
  children.push(rect({ x:24, y:652, width:342, height:54,
    cornerRadius:14, fills:[{type:'SOLID',color:color(P.card)}] }));
  children.push(text('😊', { x:38, y:665, width:26, height:26, fontSize:20 }));
  children.push(text('Yesterday — Happy', { x:72, y:660, width:200, height:18,
    fontSize:13, fontFamily:'Inter', fontWeight:500, fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('"I finished the book I\'ve been..."', { x:72, y:678, width:240, height:16,
    fontSize:11, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Nav bar
  children.push(rect({ x:0, y:720, width:390, height:124,
    fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.08),offset:{x:0,y:-2},blur:16}] }));

  const navItems = [
    { label:'Today',    icon:'⊙',  x:35,  active:true },
    { label:'Journal',  icon:'✏',  x:115, active:false },
    { label:'Insights', icon:'◑',  x:195, active:false },
    { label:'Breathe',  icon:'◎',  x:275, active:false },
    { label:'Profile',  icon:'○',  x:337, active:false },
  ];
  navItems.forEach(n => {
    children.push(text(n.icon, { x:n.x, y:735, width:42, height:28,
      fontSize:20, textAlign:'center',
      fills:[{type:'SOLID',color:color(n.active ? P.accent : P.muted)}] }));
    children.push(text(n.label, { x:n.x-5, y:762, width:52, height:16,
      fontSize:10, fontFamily:'Inter', textAlign:'center',
      fills:[{type:'SOLID',color:color(n.active ? P.accent : P.muted)}] }));
  });
  children.push(rect({ x:181, y:800, width:28, height:4,
    cornerRadius:2, fills:[{type:'SOLID',color:color(P.text)}] }));

  return frame({ id:'screen-today', name:'Today', children });
}

// ─── Screen 2: Journal Entry ──────────────────────────────────────────────────
function buildScreenJournal() {
  const children = [];

  // Bg
  children.push(rect({ x:0, y:0, width:390, height:844,
    fills:[{type:'SOLID',color:color(P.bg)}] }));

  // Header
  children.push(text('←', { x:20, y:56, width:32, height:32,
    fontSize:22, fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('April 1', { x:0, y:58, width:390, height:30,
    fontSize:16, fontFamily:'Inter', fontWeight:600, textAlign:'center',
    fills:[{type:'SOLID',color:color(P.textMid)}] }));

  // Mood row
  children.push(text('😌 Calm', { x:24, y:100, width:100, height:30,
    fontSize:14, fontFamily:'Inter', fontWeight:600,
    fills:[{type:'SOLID',color:color(P.accent)}] }));
  children.push(rect({ x:90, y:108, width:1, height:14,
    fills:[{type:'SOLID',color:color(P.separator)}] }));
  children.push(text('7 min read', { x:100, y:102, width:100, height:22,
    fontSize:12, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Title
  children.push(text('What made me smile today', { x:24, y:138, width:340, height:70,
    fontSize:28, fontFamily:'Georgia', fontWeight:700, lineHeight:1.2,
    fills:[{type:'SOLID',color:color(P.text)}] }));

  // Writing area - lined paper effect
  children.push(rect({ x:24, y:220, width:342, height:380,
    cornerRadius:20,
    fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.07),offset:{x:0,y:4},blur:20}] }));

  // Writing lines
  for (let i = 0; i < 8; i++) {
    children.push(rect({ x:44, y:248+(i*40), width:302, height:1,
      fills:[{type:'SOLID',color:color(P.separator)}] }));
  }

  children.push(text('I woke up to the smell of coffee already\nbrewed — my partner had gotten up early.\nSomething about that small gesture filled\nme with warmth all morning.\n\nLater, on my walk, I noticed the cherry\nblossoms are finally out. I stood under\none for a few minutes just watching the\npetals fall...', {
    x:44, y:236, width:302, height:340,
    fontSize:15, fontFamily:'Georgia', lineHeight:1.7,
    fills:[{type:'SOLID',color:color(P.text)}] }));

  // Word count
  children.push(text('142 words · 3 photos', { x:44, y:610, width:200, height:18,
    fontSize:11, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Tags
  children.push(text('Tags:', { x:24, y:638, width:60, height:20,
    fontSize:12, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));

  const tags = ['gratitude', 'nature', 'connection'];
  let tx = 70;
  tags.forEach(t => {
    const w = t.length * 8 + 20;
    children.push(rect({ x:tx, y:632, width:w, height:26,
      cornerRadius:13, fills:[{type:'SOLID',color:color(P.sage)}] }));
    children.push(text(t, { x:tx+10, y:638, width:w-12, height:16,
      fontSize:11, fontFamily:'Inter', fontWeight:500,
      fills:[{type:'SOLID',color:color(P.accent2)}] }));
    tx += w + 8;
  });

  // Bottom actions
  children.push(rect({ x:24, y:680, width:342, height:52,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.accent)}] }));
  children.push(text('Save Entry', { x:24, y:696, width:342, height:22,
    fontSize:15, fontFamily:'Inter', fontWeight:600, textAlign:'center',
    fills:[{type:'SOLID',color:color('#FFFFFF')}] }));

  children.push(text('+ Add photo', { x:24, y:748, width:342, height:20,
    fontSize:13, fontFamily:'Inter', textAlign:'center',
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Nav bar
  children.push(rect({ x:0, y:780, width:390, height:64,
    fills:[{type:'SOLID',color:color(P.card)}] }));
  children.push(rect({ x:181, y:800, width:28, height:4,
    cornerRadius:2, fills:[{type:'SOLID',color:color(P.text)}] }));

  return frame({ id:'screen-journal', name:'Journal Entry', children });
}

// ─── Screen 3: Insights ───────────────────────────────────────────────────────
function buildScreenInsights() {
  const children = [];

  children.push(rect({ x:0, y:0, width:390, height:844,
    fills:[{type:'SOLID',color:color(P.bg)}] }));

  children.push(text('Insights', { x:24, y:62, width:200, height:44,
    fontSize:32, fontFamily:'Georgia', fontWeight:700,
    fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('March · April', { x:24, y:108, width:200, height:22,
    fontSize:13, fontFamily:'Inter', letterSpacing:0.5,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Mood calendar heatmap
  children.push(rect({ x:24, y:140, width:342, height:200,
    cornerRadius:20, fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.08),offset:{x:0,y:4},blur:20}] }));
  children.push(text('MOOD MAP', { x:40, y:158, width:200, height:18,
    fontSize:10, fontFamily:'Inter', fontWeight:700, letterSpacing:1.5,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Calendar dots (7×4 grid of mood dots)
  const moodColors = [P.accent2, P.accent, P.accentSoft, P.surface2, P.accent, P.accent2, P.accent2,
                      P.accentSoft, P.accent, P.accent2, P.surface2, P.accentSoft, P.accent, P.accent,
                      P.accent2, P.accent2, P.accent, P.accentSoft, P.accent2, P.accent, P.accent2,
                      P.surface2, P.accentSoft, P.accent, P.accent2, P.accent, P.accent2, P.accentSoft];

  const days = ['M','T','W','T','F','S','S'];
  days.forEach((d, i) => {
    children.push(text(d, { x:40+(i*42), y:180, width:30, height:16,
      fontSize:10, fontFamily:'Inter', textAlign:'center',
      fills:[{type:'SOLID',color:color(P.muted)}] }));
  });

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      const idx = row*7+col;
      if (idx < moodColors.length) {
        children.push(circle({ x:44+(col*42), y:200+(row*30), width:22, height:22,
          cornerRadius:11, fills:[{type:'SOLID',color:color(moodColors[idx])}] }));
      }
    }
  }

  // Legend
  children.push(circle({ x:40, y:324, width:10, height:10, fills:[{type:'SOLID',color:color(P.accent2)}] }));
  children.push(text('Great', { x:56, y:322, width:50, height:16, fontSize:10, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));
  children.push(circle({ x:110, y:324, width:10, height:10, fills:[{type:'SOLID',color:color(P.accent)}] }));
  children.push(text('Okay', { x:126, y:322, width:50, height:16, fontSize:10, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));
  children.push(circle({ x:180, y:324, width:10, height:10, fills:[{type:'SOLID',color:color(P.accentSoft)}] }));
  children.push(text('Low', { x:196, y:322, width:50, height:16, fontSize:10, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Stats row
  const stats = [
    { v:'23', l:'entries', c:P.accent },
    { v:'87%', l:'positive', c:P.accent2 },
    { v:'12d', l:'streak', c:P.text },
  ];
  stats.forEach((s, i) => {
    children.push(rect({ x:24+(i*118), y:356, width:102, height:80,
      cornerRadius:16, fills:[{type:'SOLID',color:color(i===0?P.accentSoft:i===1?P.sage:P.surface2)}] }));
    children.push(text(s.v, { x:40+(i*118), y:370, width:70, height:36,
      fontSize:28, fontFamily:'Georgia', fontWeight:700,
      fills:[{type:'SOLID',color:color(s.c)}] }));
    children.push(text(s.l, { x:40+(i*118), y:404, width:90, height:16,
      fontSize:11, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));
  });

  // Emotion cloud
  children.push(rect({ x:24, y:452, width:342, height:160,
    cornerRadius:20, fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.07),offset:{x:0,y:4},blur:20}] }));
  children.push(text('COMMON FEELINGS', { x:40, y:468, width:260, height:18,
    fontSize:10, fontFamily:'Inter', fontWeight:700, letterSpacing:1.5,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  const feelings = [
    { w:'grateful', size:20, x:40, y:492, c:P.accent },
    { w:'peaceful', size:16, x:150, y:492, c:P.textMid },
    { w:'creative', size:14, x:260, y:492, c:P.accent2 },
    { w:'anxious', size:13, x:40, y:522, c:P.muted },
    { w:'energised', size:17, x:110, y:520, c:P.text },
    { w:'tender', size:14, x:250, y:524, c:P.accent },
    { w:'hopeful', size:18, x:60, y:550, c:P.accent2 },
    { w:'tired', size:12, x:190, y:552, c:P.muted },
    { w:'joyful', size:16, x:255, y:550, c:P.textMid },
  ];
  feelings.forEach(f => {
    children.push(text(f.w, { x:f.x, y:f.y, width:120, height:f.size+6,
      fontSize:f.size, fontFamily:'Georgia',
      fills:[{type:'SOLID',color:color(f.c)}] }));
  });

  // Pattern insight
  children.push(rect({ x:24, y:626, width:342, height:80,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.accentSoft)}] }));
  children.push(text('✦ Pattern found', { x:40, y:638, width:200, height:18,
    fontSize:11, fontFamily:'Inter', fontWeight:700,
    fills:[{type:'SOLID',color:color(P.accent)}] }));
  children.push(text('You feel happiest on Wednesdays.\nMorning entries tend to be more positive.', {
    x:40, y:656, width:300, height:42,
    fontSize:13, fontFamily:'Georgia', fontStyle:'italic', lineHeight:1.4,
    fills:[{type:'SOLID',color:color(P.textMid)}] }));

  // Nav
  children.push(rect({ x:0, y:780, width:390, height:64,
    fills:[{type:'SOLID',color:color(P.card)}] }));
  children.push(rect({ x:181, y:800, width:28, height:4,
    cornerRadius:2, fills:[{type:'SOLID',color:color(P.text)}] }));

  return frame({ id:'screen-insights', name:'Insights', children });
}

// ─── Screen 4: Breathe ────────────────────────────────────────────────────────
function buildScreenBreathe() {
  const children = [];

  // Warm sky gradient bg
  children.push(rect({ x:0, y:0, width:390, height:844,
    fills:[{type:'GRADIENT_LINEAR',
      gradientStops:[
        {position:0, color:color('#F5EFE8')},
        {position:1, color:color('#EAF1EB')}
      ],
      gradientTransform:[[0,1,0],[-1,0,1]]}] }));

  children.push(text('Breathe', { x:24, y:62, width:200, height:44,
    fontSize:32, fontFamily:'Georgia', fontWeight:700,
    fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('4 min · Exercise', { x:24, y:108, width:200, height:22,
    fontSize:13, fontFamily:'Inter', letterSpacing:0.5,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Breathing circle — the centrepiece
  // Outer ring
  children.push(circle({ x:95, y:150, width:200, height:200,
    fills:[{type:'SOLID',color:rgba(P.accent,0.08)}] }));
  // Middle ring
  children.push(circle({ x:115, y:170, width:160, height:160,
    fills:[{type:'SOLID',color:rgba(P.accent,0.14)}] }));
  // Inner circle
  children.push(circle({ x:140, y:195, width:110, height:110,
    fills:[{type:'GRADIENT_RADIAL',
      gradientStops:[
        {position:0, color:color(P.accentSoft)},
        {position:1, color:color(P.accent)}
      ]}] }));
  children.push(text('Inhale', { x:0, y:240, width:390, height:30,
    fontSize:18, fontFamily:'Georgia', fontStyle:'italic', textAlign:'center',
    fills:[{type:'SOLID',color:color('#FFFFFF')}] }));
  children.push(text('4', { x:0, y:265, width:390, height:40,
    fontSize:32, fontFamily:'Georgia', fontWeight:700, textAlign:'center',
    fills:[{type:'SOLID',color:color('#FFFFFF')}] }));

  // Pattern label
  children.push(text('4-7-8 Breathing', { x:0, y:370, width:390, height:26,
    fontSize:18, fontFamily:'Georgia', fontWeight:700, textAlign:'center',
    fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('Calms the nervous system', { x:0, y:398, width:390, height:20,
    fontSize:13, fontFamily:'Inter', textAlign:'center',
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Progress dots
  const phases = [
    {l:'Inhale', t:'4s', active:true},
    {l:'Hold',   t:'7s', active:false},
    {l:'Exhale', t:'8s', active:false},
  ];
  phases.forEach((p, i) => {
    const cx = 84 + i*111;
    children.push(rect({ x:cx, y:436, width:86, height:56,
      cornerRadius:14,
      fills:[{type:'SOLID',color:color(p.active ? P.accentSoft : P.card)}],
      ...(p.active ? {strokeWeight:1, strokes:[{type:'SOLID',color:color(P.accent)}]} : {}) }));
    children.push(text(p.l, { x:cx+8, y:444, width:70, height:18,
      fontSize:13, fontFamily:'Inter', fontWeight:500, textAlign:'center',
      fills:[{type:'SOLID',color:color(p.active ? P.accent : P.textMid)}] }));
    children.push(text(p.t, { x:cx+8, y:460, width:70, height:22,
      fontSize:16, fontFamily:'Georgia', fontWeight:700, textAlign:'center',
      fills:[{type:'SOLID',color:color(p.active ? P.accent : P.muted)}] }));
  });

  // Round counter
  children.push(text('Round 1 of 4', { x:0, y:510, width:390, height:22,
    fontSize:13, fontFamily:'Inter', textAlign:'center',
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Dot progress
  [0,1,2,3].forEach(i => {
    children.push(circle({ x:176+(i*14), y:536, width:8, height:8,
      fills:[{type:'SOLID',color:color(i===0 ? P.accent : P.separator)}] }));
  });

  // Practice cards
  children.push(text('More practices', { x:24, y:560, width:200, height:22,
    fontSize:11, fontFamily:'Inter', fontWeight:600, letterSpacing:1.0,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  const practices = [
    { n:'Box Breathing', d:'4×4 balance', e:'⬜', c:P.sage },
    { n:'Body Scan',     d:'5 min unwind', e:'🌙', c:P.accentSoft },
  ];
  practices.forEach((p, i) => {
    children.push(rect({ x:24+(i*172), y:586, width:160, height:72,
      cornerRadius:16, fills:[{type:'SOLID',color:color(p.c)}] }));
    children.push(text(p.e, { x:40+(i*172), y:596, width:30, height:28, fontSize:22 }));
    children.push(text(p.n, { x:40+(i*172), y:624, width:130, height:18,
      fontSize:13, fontFamily:'Inter', fontWeight:600,
      fills:[{type:'SOLID',color:color(P.text)}] }));
    children.push(text(p.d, { x:40+(i*172), y:642, width:130, height:14,
      fontSize:11, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));
  });

  // CTA
  children.push(rect({ x:24, y:678, width:342, height:52,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.accent)}] }));
  children.push(text('Begin Session', { x:24, y:694, width:342, height:22,
    fontSize:15, fontFamily:'Inter', fontWeight:600, textAlign:'center',
    fills:[{type:'SOLID',color:color('#FFFFFF')}] }));

  // Nav
  children.push(rect({ x:0, y:780, width:390, height:64,
    fills:[{type:'SOLID',color:rgba('#FFFFFF', 0.85)}] }));
  children.push(rect({ x:181, y:800, width:28, height:4,
    cornerRadius:2, fills:[{type:'SOLID',color:color(P.text)}] }));

  return frame({ id:'screen-breathe', name:'Breathe', children });
}

// ─── Screen 5: Profile / Growth ───────────────────────────────────────────────
function buildScreenProfile() {
  const children = [];

  children.push(rect({ x:0, y:0, width:390, height:844,
    fills:[{type:'SOLID',color:color(P.bg)}] }));

  // Avatar area
  children.push(circle({ x:155, y:60, width:80, height:80,
    fills:[{type:'GRADIENT_RADIAL',
      gradientStops:[{position:0,color:color(P.accentSoft)},{position:1,color:color(P.accent)}]}] }));
  children.push(text('A', { x:0, y:85, width:390, height:40,
    fontSize:30, fontFamily:'Georgia', fontWeight:700, textAlign:'center',
    fills:[{type:'SOLID',color:color('#FFFFFF')}] }));
  children.push(text('Anika Reyes', { x:0, y:152, width:390, height:30,
    fontSize:22, fontFamily:'Georgia', fontWeight:700, textAlign:'center',
    fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('Journaling since Jan 2025', { x:0, y:182, width:390, height:22,
    fontSize:13, fontFamily:'Inter', textAlign:'center',
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Milestone badges
  children.push(text('MILESTONES', { x:24, y:222, width:200, height:18,
    fontSize:10, fontFamily:'Inter', fontWeight:700, letterSpacing:1.5,
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  const badges = [
    { e:'🌱', n:'First\nEntry',   c:P.sage },
    { e:'🔥', n:'7 Day\nStreak',  c:P.accentSoft },
    { e:'🌸', n:'Spring\nWriter', c:'#F5EAF0' },
    { e:'📖', n:'50\nEntries',    c:P.surface2 },
    { e:'✨', n:'30 Day\nStreak', c:P.sage },
    { e:'💙', n:'Mindful\nWeek',  c:'#EAF0F5' },
  ];
  badges.forEach((b, i) => {
    const col = i % 3, row = Math.floor(i/3);
    children.push(rect({ x:24+(col*116), y:244+(row*90), width:100, height:80,
      cornerRadius:16, fills:[{type:'SOLID',color:color(b.c)}] }));
    children.push(text(b.e, { x:36+(col*116), y:252+(row*90), width:40, height:36, fontSize:28 }));
    children.push(text(b.n, { x:36+(col*116), y:286+(row*90), width:80, height:28,
      fontSize:11, fontFamily:'Inter', fontWeight:500, lineHeight:1.3,
      fills:[{type:'SOLID',color:color(P.textMid)}] }));
  });

  // Growth quote
  children.push(rect({ x:24, y:430, width:342, height:80,
    cornerRadius:16, fills:[{type:'SOLID',color:color(P.card)}],
    effects:[{type:'DROP_SHADOW',color:rgba('#8B7355',0.07),offset:{x:0,y:4},blur:16}] }));
  children.push(text('"Growth begins the moment\nyou start noticing."', {
    x:40, y:446, width:280, height:50,
    fontSize:14, fontFamily:'Georgia', fontStyle:'italic', lineHeight:1.5,
    fills:[{type:'SOLID',color:color(P.text)}] }));
  children.push(text('— Solace Insight', { x:220, y:490, width:130, height:16,
    fontSize:11, fontFamily:'Inter', textAlign:'right',
    fills:[{type:'SOLID',color:color(P.muted)}] }));

  // Stats
  const stats2 = [
    {v:'87', l:'entries'},
    {v:'23K', l:'words'},
    {v:'12', l:'streak'},
  ];
  stats2.forEach((s,i) => {
    children.push(rect({ x:24+(i*116), y:526, width:100, height:72,
      cornerRadius:16, fills:[{type:'SOLID',color:color(i%2===0?P.surface2:P.sage)}] }));
    children.push(text(s.v, { x:40+(i*116), y:538, width:68, height:36,
      fontSize:26, fontFamily:'Georgia', fontWeight:700,
      fills:[{type:'SOLID',color:color(P.accent)}] }));
    children.push(text(s.l, { x:40+(i*116), y:568, width:68, height:16,
      fontSize:11, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.muted)}] }));
  });

  // Settings row
  const rows = ['Reminders & notifications','Export my journal','Privacy & data','About Solace'];
  rows.forEach((r, i) => {
    children.push(rect({ x:24, y:612+(i*40), width:342, height:1,
      fills:[{type:'SOLID',color:color(P.separator)}] }));
    children.push(text(r, { x:24, y:618+(i*40), width:280, height:22,
      fontSize:14, fontFamily:'Inter', fills:[{type:'SOLID',color:color(P.text)}] }));
    children.push(text('›', { x:350, y:618+(i*40), width:16, height:22,
      fontSize:16, fills:[{type:'SOLID',color:color(P.muted)}] }));
  });

  // Nav
  children.push(rect({ x:0, y:780, width:390, height:64,
    fills:[{type:'SOLID',color:color(P.card)}] }));
  children.push(rect({ x:181, y:800, width:28, height:4,
    cornerRadius:2, fills:[{type:'SOLID',color:color(P.text)}] }));

  return frame({ id:'screen-profile', name:'Profile & Growth', children });
}

// ─── Assemble .pen file ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'Solace — Mindful Journal',
    description: 'A warm, editorial wellness app for daily journaling and mood reflection. Light theme inspired by Dawn (land-book) and Maxima Therapy (Awwwards).',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: {
      bg: P.bg,
      surface: P.surface,
      text: P.text,
      accent: P.accent,
      accent2: P.accent2,
      muted: P.muted,
    },
    tags: ['wellness', 'journaling', 'mental-health', 'editorial', 'light-theme', 'serif'],
  },
  screens: [
    buildScreenToday(),
    buildScreenJournal(),
    buildScreenInsights(),
    buildScreenBreathe(),
    buildScreenProfile(),
  ],
};

const outPath = path.join(__dirname, 'solace.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ solace.pen written (${(fs.statSync(outPath).size/1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Theme: ${pen.meta.theme}`);
