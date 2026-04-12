// SIGNAL — High-signal social with chat feed DNA
// Palette: warm near-black + electric chartreuse + coral + warm off-white
// Inspired by: HyperBEAM frontier aesthetic + ao.ar.io precision

const fs = require('fs');

const C = {
  bg:       '#0E0F0F',   // warm near-black (NOT cool Twitter gray)
  surface:  '#161818',   // card surface
  raised:   '#1E2020',   // elevated elements
  border:   '#272A2A',   // hairline borders
  chart:    '#C8FF00',   // electric chartreuse — the spark
  chartDim: '#8AB800',   // dimmed chartreuse
  coral:    '#FF5C38',   // hot coral for alerts/trending
  ice:      '#38D1E8',   // cool cyan for links/mentions
  text:     '#E8E8E5',   // warm near-white
  muted:    '#7A7A76',   // warm gray
  faint:    '#3A3D3D',   // very faint for placeholders
  online:   '#C8FF00',   // chartreuse = live/online
  white:    '#FFFFFF',
};

const W_M = 390, H_M = 844;
const W_D = 1440, H_D = 900;

// ─── Helpers ────────────────────────────────────────────────────────────────

const R = (x,y,w,h,fill,r=0,opts={}) => ({
  type:'rectangle', x,y,width:w,height:h, fill,
  cornerRadius:r, ...opts
});

const T = (content,x,y,size,fill,opts={}) => ({
  type:'text', content, x, y,
  fontSize:size, fill,
  fontFamily:'Inter', fontWeight:400,
  ...opts
});

const TB = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontWeight:700,...opts});

const TM = (content,x,y,size,fill,opts={}) =>
  T(content,x,y,size,fill,{fontFamily:'JetBrains Mono',fontWeight:400,...opts});

// Avatar circle
function Avatar(x, y, size, initials, online=false) {
  const els = [
    R(x,y,size,size, '#2A2D2D', size/2),
    T(initials, x+size/2, y+size/2, size*0.38, C.chart,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}),
  ];
  if (online) {
    els.push(R(x+size-7, y+size-7, 9, 9, C.chart, 5));
    els.push(R(x+size-6, y+size-6, 7, 7, C.bg, 4)); // ring gap
    els.push(R(x+size-5, y+size-5, 5, 5, C.chart, 3));
  }
  return els;
}

// Reaction pill
function Pill(x, y, icon, count, active=false) {
  const bg = active ? '#1E2A0A' : C.raised;
  const fg = active ? C.chart : C.muted;
  return [
    R(x,y,52,26,bg,13),
    T(`${icon} ${count}`, x+26, y+13, 11, fg,
      {textAlignHorizontal:'center',textAlignVertical:'center'}),
  ];
}

// Channel tag
function Tag(x, y, label, accent=C.chart) {
  return [
    R(x,y,label.length*6.5+12, 18, accent+'22', 9),
    T(label, x+label.length*6.5/2+6, y+9, 9, accent,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}),
  ];
}

// Thin connecting line for thread
function ThreadLine(x, yTop, height) {
  return [R(x, yTop, 2, height, C.chartDim+'44', 1)];
}

// ─── FEED CARD (text post) ───────────────────────────────────────────────────
function FeedCard(x, y, w, avatar, name, handle, time, channel, body, reactions, replies=[]) {
  const avatarSize = 36;
  const els = [];
  const padX = 16, padY = 14;

  // Card background
  els.push(R(x,y,w,0,C.surface,8)); // height calculated later
  // Top border accent line
  els.push(R(x,y,w,1,C.border));

  // Avatar + meta row
  els.push(...Avatar(x+padX, y+padY, avatarSize, avatar, false));
  els.push(TB(name, x+padX+avatarSize+10, y+padY+2, 13, C.text));
  els.push(T(handle, x+padX+avatarSize+10, y+padY+18, 11, C.muted));
  els.push(T(time, x+w-padX-40, y+padY+10, 10, C.faint,
    {textAlignHorizontal:'right'}));
  els.push(...Tag(x+w-padX-40-channel.length*6.5-25, y+padY+6, channel));

  // Body text
  const bodyY = y+padY+avatarSize+16;
  els.push(T(body, x+padX, bodyY, 13, C.text,
    {width:w-padX*2, lineHeight:1.55}));

  const reactionY = bodyY+52;

  // Reaction pills
  reactions.forEach(([icon,count,active],i) => {
    els.push(...Pill(x+padX+i*60, reactionY, icon, count, active));
  });

  // Signal meter (thin chartreuse bar — "heat" indicator)
  const heat = Math.floor(Math.random()*70)+30; // % heat
  els.push(R(x+w-padX-60, reactionY+4, 60, 4, C.border, 2));
  els.push(R(x+w-padX-60, reactionY+4, Math.floor(60*heat/100), 4, C.chart+'66', 2));
  els.push(TM('SIG', x+w-padX-60, reactionY-1, 7, C.chartDim));

  const cardH = reactionY+30-y;
  // Fix card height
  els[0].height = cardH;

  return { els, height: cardH };
}

// ─── IMAGE CARD ──────────────────────────────────────────────────────────────
function ImageCard(x, y, w, avatar, name, handle, time, channel, imgLabel, caption, reactions) {
  const avatarSize = 36;
  const els = [];
  const padX = 16, padY = 14;

  els.push(R(x,y,w,0,C.surface,8));
  els.push(R(x,y,w,1,C.border));

  els.push(...Avatar(x+padX, y+padY, avatarSize, avatar, true));
  els.push(TB(name, x+padX+avatarSize+10, y+padY+2, 13, C.text));
  els.push(T(handle, x+padX+avatarSize+10, y+padY+18, 11, C.muted));
  els.push(T(time, x+w-padX, y+padY+10, 10, C.muted,
    {textAlignHorizontal:'right'}));
  els.push(...Tag(x+padX+avatarSize+10, y+padY+34, channel, C.coral));

  // Image block (full width minus padding)
  const imgY = y+padY+avatarSize+20;
  const imgH = 160;
  els.push(R(x+padX, imgY, w-padX*2, imgH, '#1A2A1A', 6));
  // Image label (simulated photo)
  els.push(R(x+padX, imgY, w-padX*2, imgH, C.chart+'0A', 6));
  // Subtle grid to simulate photo
  for(let i=0;i<4;i++) {
    els.push(R(x+padX+(w-padX*2)*i/4, imgY, 1, imgH, C.chart+'15'));
  }
  els.push(R(x+padX, imgY+(imgH/3), w-padX*2, 1, C.chart+'10'));
  els.push(R(x+padX, imgY+(imgH*2/3), w-padX*2, 1, C.chart+'10'));
  els.push(T(imgLabel, x+w/2, imgY+imgH/2, 11, C.chart+'80',
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}));

  // Caption
  const capY = imgY+imgH+10;
  els.push(T(caption, x+padX, capY, 13, C.text, {width:w-padX*2, lineHeight:1.5}));

  const reactionY = capY+44;
  reactions.forEach(([icon,count,active],i) => {
    els.push(...Pill(x+padX+i*60, reactionY, icon, count, active));
  });

  // LIVE badge if active
  els.push(R(x+padX+avatarSize-8, y+padY+avatarSize-8, 28, 14, C.coral, 7));
  els.push(T('LIVE', x+padX+avatarSize-8+14, y+padY+avatarSize-8+7, 7, C.white,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:800}));

  const cardH = reactionY+36-y;
  els[0].height = cardH;

  return { els, height: cardH };
}

// ─── THREAD REPLY ─────────────────────────────────────────────────────────────
function ThreadReply(x, y, w, avatar, name, body, reactions, indent=0) {
  const els = [];
  const padX = 14+indent;

  els.push(...Avatar(x+padX, y, 28, avatar));
  els.push(TB(name, x+padX+36, y+2, 11, C.text));
  els.push(T(body, x+padX+36, y+18, 12, C.text, {width:w-padX-40, lineHeight:1.5}));

  const reactionY = y+18+32;
  reactions.forEach(([icon,count,active],i) => {
    els.push(...Pill(x+padX+36+i*56, reactionY, icon, count, active));
  });

  return { els, height: reactionY+30-y };
}

// ─── NAV BAR (mobile bottom) ─────────────────────────────────────────────────
function MobileNav(x, y, w, activeTab=0) {
  const els = [
    R(x,y,w,56, C.surface),
    R(x,y,w,1, C.border),
  ];
  const tabs = ['⌂','◎','✦','◈','◉'];
  const labels = ['Feed','Signals','Compose','Channels','Profile'];
  tabs.forEach((icon,i) => {
    const tx = x + (w/5)*(i+0.5);
    const active = i===activeTab;
    if(i===2) {
      // compose — chartreuse button
      els.push(R(tx-20, y+8, 40, 40, C.chart, 20));
      els.push(T(icon, tx, y+28, 18, C.bg,
        {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:900}));
    } else {
      els.push(T(icon, tx, y+16, 18, active ? C.chart : C.faint,
        {textAlignHorizontal:'center',textAlignVertical:'center'}));
      els.push(T(labels[i], tx, y+38, 8, active ? C.chart : C.muted,
        {textAlignHorizontal:'center',textAlignVertical:'center'}));
    }
  });
  return els;
}

// ─── MOBILE STATUS BAR ───────────────────────────────────────────────────────
function StatusBar(x, y, w) {
  return [
    R(x,y,w,44,C.bg),
    T('9:41', x+20, y+14, 13, C.text,{fontWeight:600}),
    T('●●●●  ▶  ⠿ 97%', x+w-16, y+14, 11, C.text,
      {textAlignHorizontal:'right'}),
  ];
}

// ─── MOBILE HEADER ───────────────────────────────────────────────────────────
function MobileHeader(x, y, w, title, showSearch=true) {
  return [
    R(x,y,w,48,C.bg),
    R(x,y+48,w,1,C.border),
    TB(title, x+w/2, y+24, 15, C.text,
      {textAlignHorizontal:'center',textAlignVertical:'center'}),
    // Signal indicator — blinking chartreuse dot
    R(x+w/2-32, y+14, 8, 8, C.chart, 4),
    ...(showSearch ? [
      R(x+w-52, y+12, 36, 26, C.raised, 13),
      T('⌕', x+w-34, y+25, 14, C.muted,
        {textAlignHorizontal:'center',textAlignVertical:'center'}),
    ] : []),
  ];
}

// ─── SCREEN 1: Mobile Feed ───────────────────────────────────────────────────
function mFeed() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));
  els.push(...MobileHeader(0,44,W_M,'SIGNAL'));

  // Channel pills (horizontal scroll)
  const channels = ['All','#design','#crypto','#builds','#irl','#noise'];
  const pillColors = [C.chart,C.ice,C.coral,C.chart+'AA',C.ice+'AA',C.muted];
  els.push(R(0,93,W_M,40,C.bg));
  channels.forEach((ch,i) => {
    const w = ch.length*7.5+20;
    const prevWidth = channels.slice(0,i).reduce((a,c)=>a+c.length*7.5+28,12);
    const active = i===0;
    els.push(R(prevWidth, 100, w, 26, active?C.chart:C.raised, 13));
    els.push(T(ch, prevWidth+w/2, 113, 11, active?C.bg:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:active?700:400}));
  });

  // Feed cards
  let curY = 137;

  const c1 = ImageCard(0, curY, W_M,
    'AK','Aiko K.','@aiko','2m ago','#design',
    'PHOTO • SF studio session',
    'New workspace setup. Three monitors feels excessive until you have three monitors.',
    [['♥','847',true],['⟲','142',false],['◈','28',false]]);
  c1.els.forEach(e=>els.push(e));
  curY += c1.height + 2;

  const c2 = FeedCard(0, curY, W_M,
    'JM','Jonas M.','@jm','8m ago','#builds',
    'Shipped the new parser. 3.2x faster than before. Sometimes the boring refactor is the right move.',
    [['♥','312',false],['⟲','67',false],['◈','19',true]]);
  c2.els.forEach(e=>els.push(e));
  curY += c2.height + 2;

  const c3 = FeedCard(0, curY, W_M,
    'RK','Remi K.','@remi','15m ago','#crypto',
    'The AO compute layer is genuinely different from everything before it. Permanent compute = permanent social. The implications haven\'t hit people yet.',
    [['♥','1.2k',false],['⟲','394',false],['◈','88',false]]);
  c3.els.forEach(e=>els.push(e));

  // Bottom nav
  els.push(...MobileNav(0, H_M-56, W_M, 0));

  return frame('mFeed', 0, 0, W_M, H_M, C.bg, els);
}

// ─── SCREEN 2: Mobile Thread View (chat dynamics) ────────────────────────────
function mThread() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));

  // Header with back
  els.push(R(0,44,W_M,48,C.bg));
  els.push(R(0,92,W_M,1,C.border));
  els.push(T('←', 16, 68, 18, C.chart,{textAlignVertical:'center'}));
  els.push(TB('Thread', W_M/2, 68, 15, C.text,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('24 replies', W_M/2, 84, 10, C.muted,
    {textAlignHorizontal:'center'}));

  // Original post
  const origY = 97;
  els.push(R(0,origY,W_M,0,C.raised));

  const avatarSize = 40;
  els.push(...Avatar(16, origY+14, avatarSize, 'AK', true));
  els.push(TB('Aiko K.', 64, origY+16, 14, C.text));
  els.push(T('@aiko', 64, origY+33, 11, C.muted));
  els.push(T('2m ago', W_M-16, origY+20, 10, C.muted,{textAlignHorizontal:'right'}));
  els.push(T('The gap between "I could ship this" and "I should ship this" is where most good ideas die. SIGNAL is about collapsing that gap. High signal only.', 16, origY+62, 13, C.text,{width:W_M-32,lineHeight:1.6}));

  // Signal meter large
  const sigY = origY+140;
  els.push(R(16, sigY, W_M-32, 6, C.border, 3));
  els.push(R(16, sigY, Math.floor((W_M-32)*0.78), 6, C.chart+'88', 3));
  els.push(T('78% signal', W_M-16, sigY-2, 9, C.chartDim,{textAlignHorizontal:'right'}));

  // Reaction bar (larger)
  els.push(...Pill(16, sigY+14, '♥','1.2k',true));
  els.push(...Pill(76, sigY+14, '⟲','394',false));
  els.push(...Pill(136, sigY+14, '◈','88',false));
  els.push(...Pill(196, sigY+14, '⤴','Reply',false));

  els.push(R(0,sigY+52,W_M,1,C.border));
  els[2].height = sigY+52-origY;

  // Thread replies with connecting lines
  let repY = sigY+58;

  // Reply 1 + subthread
  els.push(...ThreadLine(28, repY, 110));

  const r1 = ThreadReply(0, repY, W_M, 'JM','Jonas M.',
    'The "should" vs "could" distinction is underrated. I keep a note called "graveyard" — full of things I could have shipped. Maybe 1 in 10 were actually worth it.',
    [['♥','89',false],['⤴','Reply',false]]);
  r1.els.forEach(e=>els.push(e));
  repY += r1.height+8;

  // Nested reply (indent)
  els.push(...ThreadLine(50, repY, 80));
  const r2 = ThreadReply(16, repY, W_M-16, 'AK','Aiko K.',
    'That graveyard note idea is 🔥 — stealing this',
    [['♥','34',true]],22);
  r2.els.forEach(e=>els.push(e));
  repY += r2.height+8;

  // Reply 2
  els.push(...ThreadLine(28, repY, 90));
  const r3 = ThreadReply(0, repY, W_M, 'RK','Remi K.',
    'This is why async-first teams ship faster. No meeting to approve the decision — you already know if it\'s signal or noise.',
    [['♥','156',false],['⟲','23',false],['⤴','Reply',false]]);
  r3.els.forEach(e=>els.push(e));
  repY += r3.height+8;

  // Reply input
  els.push(R(0, H_M-80, W_M, 80, C.surface));
  els.push(R(0, H_M-80, W_M, 1, C.border));
  els.push(R(8, H_M-62, W_M-70, 44, C.raised, 22));
  els.push(T('Reply to Aiko...', 24, H_M-40, 13, C.faint,{textAlignVertical:'center'}));
  els.push(R(W_M-56, H_M-62, 44, 44, C.chart, 22));
  els.push(T('⤴', W_M-34, H_M-40, 16, C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));

  return frame('mThread', 0, 0, W_M, H_M, C.bg, els);
}

// ─── SCREEN 3: Mobile Profile ─────────────────────────────────────────────────
function mProfile() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));

  // Cover banner
  els.push(R(0,44,W_M,100,C.raised));
  // Subtle grid texture
  for(let i=0;i<8;i++) els.push(R(i*(W_M/8),44,1,100,C.chart+'12'));
  for(let j=0;j<5;j++) els.push(R(0,44+j*25,W_M,1,C.chart+'08'));
  els.push(R(W_M/2-40,60,80,18,C.chart+'33',9));
  els.push(T('SIGNAL DESIGNER', W_M/2, 69, 9, C.chart,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700,fontFamily:'JetBrains Mono'}));

  // Avatar
  els.push(R(16,104,64,64,C.bg,32)); // border ring
  els.push(R(18,106,60,60,'#1E2A10',30));
  els.push(TB('AK',48,136,22,C.chart,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  // Online
  els.push(R(64,150,12,12,C.chart,6));
  els.push(R(65,151,10,10,C.bg,5));
  els.push(R(66,152,8,8,C.chart,4));

  // Follow button
  els.push(R(W_M-90,118,78,32,C.chart,16));
  els.push(TB('Follow', W_M-51, 134, 12, C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Name + handle
  els.push(TB('Aiko Kato', 16, 176, 18, C.text));
  els.push(T('@aiko  ·  Follows you', 16, 198, 12, C.muted));
  els.push(T('Product designer. Building SIGNAL. SF → everywhere. High signal only.', 16, 216, 13, C.text,{width:W_M-32,lineHeight:1.5}));

  // Stats row
  const statsY = 262;
  els.push(R(0,statsY,W_M,1,C.border));
  els.push(R(0,statsY+50,W_M,1,C.border));
  const stats = [['2.4k','Following'],['18.7k','Followers'],['94%','Signal']];
  stats.forEach(([val,label],i) => {
    const sx = (W_M/3)*(i+0.5);
    els.push(TB(val, sx, statsY+18, 15, i===2?C.chart:C.text,
      {textAlignHorizontal:'center'}));
    els.push(T(label, sx, statsY+34, 10, C.muted,
      {textAlignHorizontal:'center'}));
    if(i<2) els.push(R((W_M/3)*(i+1), statsY, 1, 50, C.border));
  });

  // Tab bar
  const tabY = statsY+52;
  const tabs = ['Posts','Signals','Media','Replies'];
  tabs.forEach((tab,i) => {
    const tx = (W_M/4)*(i+0.5);
    const active = i===0;
    els.push(T(tab, tx, tabY+18, 12, active?C.chart:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:active?700:400}));
    if(active) els.push(R(tx-24, tabY+34, 48, 2, C.chart, 1));
  });
  els.push(R(0,tabY+36,W_M,1,C.border));

  // Post grid (media tab style)
  const gridY = tabY+40;
  const gridSize = (W_M-2)/3;
  for(let r=0;r<3;r++) {
    for(let c=0;c<3;c++) {
      const gx = c*(gridSize+1);
      const gy = gridY+r*(gridSize+1);
      els.push(R(gx,gy,gridSize,gridSize,C.raised));
      // Simulated image content
      els.push(R(gx,gy,gridSize,gridSize,C.chart+(r===0&&c===0?'15':'08')));
      for(let k=0;k<3;k++) {
        els.push(R(gx,gy+k*(gridSize/3),gridSize,1,C.chart+'12'));
      }
    }
  }

  els.push(...MobileNav(0,H_M-56,W_M,4));

  return frame('mProfile', 0, 0, W_M, H_M, C.bg, els);
}

// ─── SCREEN 4: Mobile Compose ─────────────────────────────────────────────────
function mCompose() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));

  // Header
  els.push(R(0,44,W_M,52,C.bg));
  els.push(R(0,96,W_M,1,C.border));
  els.push(T('Cancel', 16, 70, 14, C.muted,{textAlignVertical:'center'}));
  els.push(TB('New Signal', W_M/2, 70, 15, C.text,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(W_M-76, 58, 64, 28, C.chart, 14));
  els.push(TB('Beam', W_M-44, 72, 13, C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Channel selector
  els.push(R(0,97,W_M,44,C.raised));
  els.push(T('Posting to', 16, 119, 11, C.muted,{textAlignVertical:'center'}));
  els.push(R(90,107,110,28,C.chart+'22',14));
  els.push(T('#design  ▾', 145, 121, 12, C.chart,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}));

  // Compose area
  els.push(...Avatar(16,150,38,'AK'));
  // Textarea simulation
  els.push(T("What's the signal?", 64, 160, 16, C.faint,
    {width:W_M-80,lineHeight:1.6}));

  // Typed text simulation
  els.push(T('The difference between a good design system and a great one is knowing what NOT to include. Constraints are the product. Shipping what matters.', 64, 160, 16, C.text,
    {width:W_M-80,lineHeight:1.6}));

  // Blinking cursor
  els.push(R(64,248,2,18,C.chart));

  // Signal strength meter (live as you type)
  const meterY = 290;
  els.push(T('SIGNAL STRENGTH', 64, meterY, 9, C.muted,{fontFamily:'JetBrains Mono'}));
  els.push(R(64, meterY+14, W_M-80, 4, C.border, 2));
  els.push(R(64, meterY+14, Math.floor((W_M-80)*0.72), 4, C.chart+'AA', 2));
  els.push(T('72%', W_M-16, meterY+10, 9, C.chart,
    {textAlignHorizontal:'right',fontFamily:'JetBrains Mono',fontWeight:700}));

  // Media attachments
  const attY = meterY+36;
  els.push(R(0,attY,W_M,1,C.border));
  els.push(R(0,attY+8,W_M,88,'#00000000'));
  // Attached image preview
  els.push(R(64,attY+12,80,64,C.raised,8));
  els.push(R(64,attY+12,80,64,C.chart+'12',8));
  els.push(T('JPG', 104, attY+44, 10, C.chartDim,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontFamily:'JetBrains Mono'}));
  // Add more
  els.push(R(152,attY+24,44,44,C.raised,6));
  els.push(T('+', 174, attY+46, 18, C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Toolbar
  const toolY = H_M-100;
  els.push(R(0,toolY,W_M,1,C.border));
  els.push(R(0,toolY,W_M,60,C.surface));
  const tools = ['⊞','♪','📍','@','#'];
  tools.forEach((t,i) => {
    els.push(T(t, 16+i*46, toolY+30, 18, C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
  });
  // Character limit
  els.push(R(W_M-52, toolY+12, 36, 36, 'transparent', 18, {stroke:C.border,strokeWidth:2}));
  els.push(T('128', W_M-34, toolY+30, 10, C.chart,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontFamily:'JetBrains Mono'}));

  // Keyboard simulation
  els.push(R(0,toolY+60,W_M,H_M-(toolY+60),C.raised));
  const rows = [['q','w','e','r','t','y','u','i','o','p'],
                ['a','s','d','f','g','h','j','k','l'],
                ['⇧','z','x','c','v','b','n','m','⌫']];
  rows.forEach((row,ri) => {
    const keyW = Math.floor((W_M-20)/10);
    const startX = ri===1?12:ri===2?4:4;
    row.forEach((k,ci) => {
      const kx = startX+ci*(keyW+2);
      const ky = toolY+66+ri*(36);
      els.push(R(kx,ky,keyW,30,ri===2&&(ci===0||ci===row.length-1)?C.faint:C.surface,6));
      els.push(T(k,kx+keyW/2,ky+15,12,C.text,
        {textAlignHorizontal:'center',textAlignVertical:'center'}));
    });
  });
  // Space bar
  els.push(R(60,toolY+66+3*36,W_M-120,30,C.surface,6));
  els.push(T('space',W_M/2,toolY+66+3*36+15,11,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  return frame('mCompose', 0, 0, W_M, H_M, C.bg, els);
}

// ─── SCREEN 5: Mobile Channels ─────────────────────────────────────────────────
function mChannels() {
  const els = [R(0,0,W_M,H_M,C.bg)];
  els.push(...StatusBar(0,0,W_M));
  els.push(...MobileHeader(0,44,W_M,'Channels',false));

  // Search bar
  els.push(R(12,97,W_M-24,38,C.raised,19));
  els.push(T('⌕  Search channels...', 30, 116, 13, C.faint,{textAlignVertical:'center'}));
  els.push(R(0,139,W_M,1,C.border));

  // Section: Your channels
  els.push(T('YOUR CHANNELS', 16, 153, 9, C.muted,{fontFamily:'JetBrains Mono',fontWeight:600}));

  const channels = [
    {icon:'◈',name:'#design',desc:'Product & visual design',count:'12',active:true,color:C.chart},
    {icon:'◉',name:'#builds',desc:'Shipping & launches',count:'3',active:false,color:C.ice},
    {icon:'◎',name:'#crypto',desc:'AO, Arweave, DeFi signal',count:'47',active:false,color:C.coral},
    {icon:'◈',name:'#irl',desc:'Events, SF, meetups',count:'0',active:false,color:C.chartDim},
    {icon:'◉',name:'#noise',desc:'Everything else',count:'8',active:false,color:C.muted},
  ];

  let chy = 168;
  channels.forEach((ch,i) => {
    els.push(R(0,chy,W_M,52,i===0?C.chart+'0C':'transparent'));
    // Icon
    els.push(R(16,chy+14,24,24,ch.color+'22',12));
    els.push(T(ch.icon,28,chy+26,12,ch.color,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
    // Name + desc
    els.push(TB(ch.name,50,chy+16,13,i===0?C.chart:C.text));
    els.push(T(ch.desc,50,chy+33,11,C.muted));
    // Badge
    if(ch.count!=='0') {
      const badgeW = ch.count.length*7+10;
      els.push(R(W_M-16-badgeW,chy+18,badgeW,18,i===0?C.chart:C.raised,9));
      els.push(T(ch.count,W_M-16-badgeW/2,chy+27,10,i===0?C.bg:C.muted,
        {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));
    }
    els.push(R(50,chy+52,W_M-50,1,C.border));
    chy+=52;
  });

  // Discover section
  els.push(T('DISCOVER', 16, chy+12, 9, C.muted,{fontFamily:'JetBrains Mono',fontWeight:600}));
  chy+=30;

  const discover = [
    {name:'#arweave',members:'4.2k',hot:true},
    {name:'#vibe-coding',members:'8.7k',hot:true},
    {name:'#sf-founders',members:'1.1k',hot:false},
  ];
  discover.forEach((d,i) => {
    els.push(R(0,chy,W_M,48,'transparent'));
    els.push(TB(d.name,16,chy+14,13,C.text));
    els.push(T(`${d.members} members`,16,chy+31,11,C.muted));
    if(d.hot) {
      els.push(R(16+d.name.length*8,chy+10,36,16,C.coral+'22',8));
      els.push(T('HOT',16+d.name.length*8+18,chy+18,7,C.coral,
        {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:800,fontFamily:'JetBrains Mono'}));
    }
    els.push(R(W_M-70,chy+12,60,26,C.raised,13));
    els.push(T('Join',W_M-40,chy+25,11,C.chart,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}));
    els.push(R(0,chy+48,W_M,1,C.border));
    chy+=48;
  });

  els.push(...MobileNav(0,H_M-56,W_M,3));
  return frame('mChannels', 0, 0, W_M, H_M, C.bg, els);
}

// ─── SCREEN 6: Desktop Home (3-column) ─────────────────────────────────────
function dHome() {
  const els = [R(0,0,W_D,H_D,C.bg)];

  // Left sidebar (240px)
  const SB_W = 240;
  els.push(R(0,0,SB_W,H_D,C.surface));
  els.push(R(SB_W,0,1,H_D,C.border));

  // Logo
  els.push(R(0,0,SB_W,56,C.surface));
  els.push(R(20,16,28,28,C.chart,14));
  els.push(TB('S',34,30,14,C.bg,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(TB('SIGNAL',58,30,14,C.text,{textAlignVertical:'center'}));
  els.push(R(0,56,SB_W,1,C.border));

  // Nav items
  const navItems = [
    {icon:'⌂',label:'Feed',active:true},
    {icon:'◎',label:'Signals',active:false},
    {icon:'◈',label:'Channels',active:false},
    {icon:'◉',label:'Profile',active:false},
    {icon:'⚙',label:'Settings',active:false},
  ];
  navItems.forEach((item,i) => {
    const ny = 64+i*44;
    const bg = item.active ? C.chart+'15' : 'transparent';
    els.push(R(8,ny,SB_W-16,36,bg,8));
    els.push(T(item.icon,24,ny+18,14,item.active?C.chart:C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
    els.push(T(item.label,44,ny+18,13,item.active?C.chart:C.muted,
      {textAlignVertical:'center',fontWeight:item.active?700:400}));
    if(item.active) els.push(R(SB_W-10,ny+10,3,16,C.chart,2));
  });

  // Compose button
  els.push(R(12,H_D-72,SB_W-24,40,C.chart,20));
  els.push(TB('+ New Signal',SB_W/2,H_D-52,13,C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // User row at bottom
  els.push(R(0,H_D-84,SB_W,84,C.raised));
  els.push(R(0,H_D-84,SB_W,1,C.border));
  els.push(...Avatar(12,H_D-68,40,'AK',true));
  els.push(TB('Aiko K.',60,H_D-62,12,C.text));
  els.push(T('@aiko',60,H_D-48,10,C.muted));

  // Main feed (740px wide)
  const FEED_X = SB_W+1;
  const FEED_W = 740;
  els.push(R(FEED_X,0,FEED_W,H_D,'transparent'));

  // Feed header
  els.push(R(FEED_X,0,FEED_W,52,C.bg));
  els.push(R(FEED_X,52,FEED_W,1,C.border));
  els.push(TB('Feed',FEED_X+20,26,16,C.text,{textAlignVertical:'center'}));
  // Filter tabs
  const filters=['For You','Following','Trending'];
  filters.forEach((f,i) => {
    const fx=FEED_X+120+i*90;
    const active=i===1;
    els.push(T(f,fx,26,12,active?C.chart:C.muted,
      {textAlignVertical:'center',fontWeight:active?700:400}));
    if(active) els.push(R(fx-20,50,f.length*7+6,2,C.chart));
  });

  // Search
  els.push(R(FEED_X+FEED_W-180,12,168,30,C.raised,15));
  els.push(T('⌕  Search signals...',FEED_X+FEED_W-96,27,11,C.faint,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Feed cards (desktop)
  let fy = 56;
  // Post 1: image post
  const pw = FEED_W-2;
  els.push(R(FEED_X,fy,pw,0,C.surface));
  const pAvatarSize=38;
  els.push(...Avatar(FEED_X+16,fy+14,pAvatarSize,'AK',true));
  els.push(TB('Aiko Kato',FEED_X+62,fy+16,13,C.text));
  els.push(T('@aiko · 2m ago',FEED_X+62,fy+32,10,C.muted));
  els.push(...Tag(FEED_X+62,fy+46,'#design'));
  // Image + text side by side on desktop
  const imgW1=260,imgH1=140;
  els.push(R(FEED_X+16,fy+72,imgW1,imgH1,C.raised,6));
  els.push(R(FEED_X+16,fy+72,imgW1,imgH1,C.chart+'0C',6));
  for(let k=0;k<4;k++) els.push(R(FEED_X+16,fy+72+k*(imgH1/4),imgW1,1,C.chart+'10'));
  els.push(T('PHOTO',FEED_X+16+imgW1/2,fy+72+imgH1/2,9,C.chartDim,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontFamily:'JetBrains Mono'}));
  els.push(T('New workspace setup. Three monitors feels excessive until you actually have three monitors. Worth every dollar.',
    FEED_X+292,fy+78,13,C.text,{width:pw-310,lineHeight:1.6}));
  // Reactions
  els.push(...Pill(FEED_X+16,fy+226,'♥','847',true));
  els.push(...Pill(FEED_X+76,fy+226,'⟲','142',false));
  els.push(...Pill(FEED_X+136,fy+226,'◈','28',false));
  // Signal meter
  els.push(R(FEED_X+pw-90,fy+230,76,4,C.border,2));
  els.push(R(FEED_X+pw-90,fy+230,58,4,C.chart+'66',2));
  els.push(TM('SIG 76%',FEED_X+pw-90,fy+220,8,C.chartDim));
  els[els.length-8].height = fy+260-fy;
  fy+=262;

  // Post 2: text only
  els.push(R(FEED_X,fy,pw,0,C.surface));
  els.push(R(FEED_X,fy,pw,1,C.border));
  els.push(...Avatar(FEED_X+16,fy+14,pAvatarSize,'RK'));
  els.push(TB('Remi Khoury',FEED_X+62,fy+16,13,C.text));
  els.push(T('@remi · 15m ago',FEED_X+62,fy+32,10,C.muted));
  els.push(...Tag(FEED_X+62,fy+46,'#crypto',C.coral));
  els.push(T('The AO compute layer is genuinely different from everything that came before it. Permanent compute means permanent social. The implications haven\'t hit most people yet — but they will.',
    FEED_X+16,fy+72,14,C.text,{width:pw-32,lineHeight:1.65}));
  els.push(...Pill(FEED_X+16,fy+140,'♥','1.2k',false));
  els.push(...Pill(FEED_X+76,fy+140,'⟲','394',false));
  els.push(...Pill(FEED_X+136,fy+140,'◈','88',false));
  els.push(R(FEED_X+pw-90,fy+144,76,4,C.border,2));
  els.push(R(FEED_X+pw-90,fy+144,64,4,C.chart+'88',2));
  els[els.length-12].height = fy+172-fy;
  fy+=174;

  // Right sidebar (460px)
  const RS_X = FEED_X+FEED_W+1;
  const RS_W = W_D-RS_X;
  els.push(R(RS_X,0,1,H_D,C.border));
  els.push(R(RS_X,0,RS_W,H_D,C.bg));

  // Trending signals
  els.push(R(RS_X,0,RS_W,52,C.bg));
  els.push(TB('Trending Signals',RS_X+16,26,13,C.text,{textAlignVertical:'center'}));
  els.push(R(RS_X,52,RS_W,1,C.border));

  const trends = [
    {tag:'#AO-compute',posts:'4.2k signals',hot:true},
    {tag:'#vibe-design',posts:'2.8k signals',hot:true},
    {tag:'#signal-v2',posts:'1.1k signals',hot:false},
    {tag:'#sf-launch-week',posts:'847 signals',hot:false},
  ];
  trends.forEach((tr,i) => {
    const ty=58+i*52;
    els.push(R(RS_X+8,ty,RS_W-16,48,'transparent'));
    // Heat bar
    const heat=[88,72,54,41][i];
    els.push(R(RS_X+16,ty+8,RS_W-32,3,C.border,2));
    els.push(R(RS_X+16,ty+8,Math.floor((RS_W-32)*heat/100),3,C.chart+['FF','CC','88','55'][i],2));
    els.push(TB(tr.tag,RS_X+16,ty+20,13,C.text));
    els.push(T(tr.posts,RS_X+16,ty+35,10,C.muted));
    if(tr.hot) {
      els.push(R(RS_X+16+tr.tag.length*8,ty+14,28,14,C.coral+'33',7));
      els.push(T('HOT',RS_X+16+tr.tag.length*8+14,ty+21,6,C.coral,
        {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:800,fontFamily:'JetBrains Mono'}));
    }
    els.push(R(RS_X,ty+48,RS_W,1,C.border));
  });

  // Who to follow
  els.push(TB('Who to Follow',RS_X+16,270,13,C.text));
  els.push(R(RS_X,286,RS_W,1,C.border));
  const follow=[{name:'Jonas M.',handle:'@jm',sig:'94%'},{name:'Mika A.',handle:'@mika',sig:'88%'}];
  follow.forEach((f,i) => {
    const fy=292+i*60;
    els.push(...Avatar(RS_X+16,fy+10,36,f.name.split(' ').map(n=>n[0]).join('')));
    els.push(TB(f.name,RS_X+60,fy+14,12,C.text));
    els.push(T(f.handle,RS_X+60,fy+28,10,C.muted));
    els.push(TM(f.sig+' SIG',RS_X+60,fy+42,8,C.chartDim));
    els.push(R(RS_X+RS_W-68,fy+14,56,24,C.chart+'22',12));
    els.push(T('Follow',RS_X+RS_W-40,fy+26,10,C.chart,
      {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}));
    els.push(R(RS_X,fy+52,RS_W,1,C.border));
  });

  return frame('dHome', 0, 0, W_D, H_D, C.bg, els);
}

// ─── SCREEN 7: Desktop Thread / Chat Feed ────────────────────────────────────
function dThread() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  els.push(R(0,0,240,H_D,C.surface));
  els.push(R(240,0,1,H_D,C.border));
  // Sidebar (same as dHome)
  els.push(R(20,16,28,28,C.chart,14));
  els.push(TB('S',34,30,14,C.bg,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(TB('SIGNAL',58,30,14,C.text,{textAlignVertical:'center'}));
  els.push(R(0,56,240,1,C.border));

  // Thread pane header
  const TP_X=241, TP_W=580;
  els.push(R(TP_X,0,TP_W,52,C.bg));
  els.push(R(TP_X,52,TP_W,1,C.border));
  els.push(T('← Feed',TP_X+16,26,13,C.chart,{textAlignVertical:'center',fontWeight:600}));
  els.push(TB('Thread',TP_X+TP_W/2,26,15,C.text,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(T('24 replies',TP_X+TP_W/2,40,10,C.muted,{textAlignHorizontal:'center'}));

  // Original post
  const OP_Y=56;
  els.push(R(TP_X,OP_Y,TP_W,0,C.raised));
  els.push(...Avatar(TP_X+16,OP_Y+16,44,'AK',true));
  els.push(TB('Aiko Kato',TP_X+68,OP_Y+18,14,C.text));
  els.push(T('@aiko · 2m ago',TP_X+68,OP_Y+34,11,C.muted));
  els.push(T('The gap between "I could ship this" and "I should ship this" is where most good ideas die. SIGNAL is about collapsing that gap. Ship high-signal only. Delete the noise.',
    TP_X+16,OP_Y+70,14,C.text,{width:TP_W-32,lineHeight:1.65}));
  // Signal meter
  const sm_y=OP_Y+142;
  els.push(R(TP_X+16,sm_y,TP_W-32,5,C.border,3));
  els.push(R(TP_X+16,sm_y,Math.floor((TP_W-32)*0.78),5,C.chart+'88',3));
  els.push(TM('78% SIGNAL STRENGTH',TP_X+TP_W-16,sm_y-4,8,C.chartDim,
    {textAlignHorizontal:'right'}));
  // Reactions
  els.push(...Pill(TP_X+16,sm_y+12,'♥','1.2k',true));
  els.push(...Pill(TP_X+76,sm_y+12,'⟲','394',false));
  els.push(...Pill(TP_X+136,sm_y+12,'◈','88',false));
  els.push(...Pill(TP_X+196,sm_y+12,'⤴','Reply',false));
  els[els.length-8].height = sm_y+44-OP_Y;
  els.push(R(TP_X,sm_y+46,TP_W,1,C.border));

  // Replies
  let ry=sm_y+52;

  // Reply thread with connecting lines
  const replies=[
    {avatar:'JM',name:'Jonas M.',body:'The "should" vs "could" distinction is underrated. I keep a note called "graveyard" — full of things I could have shipped. Maybe 1 in 10 were actually worth it.',reactions:[['♥','89'],['⤴','Reply']],children:[
      {avatar:'AK',name:'Aiko K.',body:'That graveyard note idea is 🔥 stealing this immediately',reactions:[['♥','34',true]]},
    ]},
    {avatar:'RK',name:'Remi K.',body:'This is why async-first teams ship faster. No meeting to approve the decision — you already know if it\'s signal or noise.',reactions:[['♥','156'],['⟲','23'],['⤴','Reply']],children:[]},
    {avatar:'MA',name:'Mika A.',body:'Signal vs noise is the real design challenge of our time. Not just in apps — in everything.',reactions:[['♥','72'],['⤴','Reply']],children:[]},
  ];

  replies.forEach((rep) => {
    // Connecting line
    const lineH = 80 + (rep.children?.length||0)*60;
    els.push(...ThreadLine(TP_X+30,ry,lineH));
    // Reply
    els.push(...Avatar(TP_X+16,ry,36,rep.avatar));
    els.push(TB(rep.name,TP_X+60,ry+4,13,C.text));
    els.push(T(rep.body,TP_X+60,ry+22,13,C.text,{width:TP_W-76,lineHeight:1.55}));
    const repy=ry+22+Math.ceil(rep.body.length/60)*18+8;
    rep.reactions.forEach(([icon,count,act],ri) => {
      els.push(...Pill(TP_X+60+ri*58,repy,icon,count,act));
    });
    ry=repy+34;

    // Children
    rep.children?.forEach(child => {
      els.push(...ThreadLine(TP_X+50,ry,60));
      els.push(...Avatar(TP_X+36,ry,30,child.avatar));
      els.push(TB(child.name,TP_X+74,ry+3,11,C.text));
      els.push(T(child.body,TP_X+74,ry+18,12,C.text,{width:TP_W-90,lineHeight:1.5}));
      const crepy=ry+18+28;
      child.reactions.forEach(([icon,count,act],ri) => {
        els.push(...Pill(TP_X+74+ri*56,crepy,icon,count,act));
      });
      ry=crepy+32;
    });
    ry+=8;
  });

  // Reply input
  els.push(R(TP_X,H_D-70,TP_W,70,C.surface));
  els.push(R(TP_X,H_D-70,TP_W,1,C.border));
  els.push(...Avatar(TP_X+12,H_D-52,32,'AK'));
  els.push(R(TP_X+52,H_D-58,TP_W-108,42,C.raised,21));
  els.push(T('Reply to Aiko...',TP_X+70,H_D-37,13,C.faint,{textAlignVertical:'center'}));
  els.push(R(TP_X+TP_W-48,H_D-56,36,36,C.chart,18));
  els.push(T('⤴',TP_X+TP_W-30,H_D-38,14,C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:700}));

  // Right: Related signals panel
  const RS2_X=TP_X+TP_W+1;
  const RS2_W=W_D-RS2_X;
  els.push(R(RS2_X,0,1,H_D,C.border));
  els.push(R(RS2_X,0,RS2_W,H_D,C.bg));
  els.push(TB('Related Signals',RS2_X+16,26,13,C.text,{textAlignVertical:'center'}));
  els.push(R(RS2_X,52,RS2_W,1,C.border));

  const related=[
    'The 10x engineer myth vs the 10x communicator reality',
    '"Move fast and break things" is now a historical artifact',
    'Why "obvious in hindsight" is the highest compliment',
  ];
  related.forEach((rel,i) => {
    const rsy=60+i*80;
    els.push(R(RS2_X+8,rsy,RS2_W-16,72,C.surface,8));
    els.push(T(rel,RS2_X+20,rsy+12,12,C.text,{width:RS2_W-40,lineHeight:1.5}));
    els.push(T('Signal score:',RS2_X+20,rsy+52,9,C.muted));
    const sc=[82,71,68][i];
    els.push(R(RS2_X+20+68,rsy+55,RS2_W-56-68,4,C.border,2));
    els.push(R(RS2_X+20+68,rsy+55,Math.floor((RS2_W-56-68)*sc/100),4,C.chart+'88',2));
    els.push(TM(`${sc}%`,RS2_X+RS2_W-24,rsy+51,8,C.chartDim,{textAlignHorizontal:'right'}));
  });

  return frame('dThread', 0, 0, W_D, H_D, C.bg, els);
}

// ─── SCREEN 8: Desktop Profile ────────────────────────────────────────────────
function dProfile() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  els.push(R(0,0,240,H_D,C.surface));
  els.push(R(240,0,1,H_D,C.border));
  els.push(R(20,16,28,28,C.chart,14));
  els.push(TB('S',34,30,14,C.bg,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(TB('SIGNAL',58,30,14,C.text,{textAlignVertical:'center'}));
  els.push(R(0,56,240,1,C.border));

  // Profile main area
  const PM_X=241, PM_W=W_D-241;

  // Cover
  const coverH=180;
  els.push(R(PM_X,0,PM_W,coverH,C.raised));
  // Grid texture
  for(let i=0;i<20;i++) els.push(R(PM_X+i*(PM_W/20),0,1,coverH,C.chart+'10'));
  for(let j=0;j<8;j++) els.push(R(PM_X,j*(coverH/8),PM_W,1,C.chart+'08'));
  // Profile text in cover
  els.push(TM('SIGNAL DESIGNER · SF · HIGH SIGNAL ONLY',PM_X+PM_W/2,90,10,C.chart+'66',
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}));
  // Chartreuse glow blob
  els.push(R(PM_X+PM_W/2-60,coverH/2-40,120,80,C.chart+'08',40));

  // Avatar
  els.push(R(PM_X+32,coverH-40,84,84,C.bg,42));
  els.push(R(PM_X+34,coverH-38,80,80,'#1E2A10',40));
  els.push(TB('AK',PM_X+74,coverH+2,28,C.chart,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(PM_X+90,coverH+24,14,14,C.chart,7));
  els.push(R(PM_X+91,coverH+25,12,12,C.bg,6));
  els.push(R(PM_X+92,coverH+26,10,10,C.chart,5));

  // Follow + message buttons
  els.push(R(PM_X+PM_W-172,coverH+16,80,34,C.chart,17));
  els.push(TB('Follow',PM_X+PM_W-132,coverH+33,12,C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(PM_X+PM_W-84,coverH+16,72,34,C.raised,17));
  els.push(T('Message',PM_X+PM_W-48,coverH+33,12,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Name + bio
  const bioY=coverH+56;
  els.push(TB('Aiko Kato',PM_X+32,bioY,20,C.text));
  els.push(T('@aiko  ·  Follows you',PM_X+32,bioY+24,13,C.muted));
  els.push(T('Product designer building SIGNAL. Former @figma @notion. SF → everywhere.',
    PM_X+32,bioY+46,13,C.text,{width:440,lineHeight:1.5}));

  // Stats
  const statY=bioY+88;
  const stats=[['18.7k','Followers'],['2.4k','Following'],['94%','Signal Score'],['1,247','Signals']];
  stats.forEach(([val,label],i) => {
    const sx=PM_X+32+i*150;
    els.push(TB(val,sx,statY,18,i===2?C.chart:C.text));
    els.push(T(label,sx,statY+20,10,C.muted));
    if(i<3) els.push(R(sx+120,statY-4,1,36,C.border));
  });

  // Tab bar
  const tabY=statY+48;
  els.push(R(PM_X,tabY,PM_W,1,C.border));
  els.push(R(PM_X,tabY+40,PM_W,1,C.border));
  const tabs=['Signals','Media','Replies','Likes'];
  tabs.forEach((tab,i) => {
    const tx=PM_X+32+i*120;
    const active=i===0;
    els.push(T(tab,tx,tabY+20,13,active?C.chart:C.muted,
      {textAlignVertical:'center',fontWeight:active?700:400}));
    if(active) els.push(R(tx-4,tabY+38,tab.length*8,2,C.chart,1));
  });

  // Signal grid
  const gridY=tabY+46;
  const cols=3, gapX=12, gapY=8;
  const itemW=(PM_W-64-(cols-1)*gapX)/cols;
  const posts=[
    'The gap between "could ship" and "should ship" is where most good ideas die.',
    'New workspace. Three monitors is excessive until it isn\'t.',
    'The AO compute layer changes everything. Permanent compute = permanent social.',
    'Signal vs noise is the real design challenge of our time.',
    'Shipped the new parser. 3.2x faster. Sometimes boring is right.',
    'Constraints are the product. Shipping what matters.',
  ];
  posts.forEach((post,i) => {
    const col=i%cols, row=Math.floor(i/cols);
    const px=PM_X+32+col*(itemW+gapX);
    const py=gridY+row*(80+gapY);
    els.push(R(px,py,itemW,76,C.surface,8));
    els.push(T(post,px+12,py+10,11,C.text,{width:itemW-24,lineHeight:1.5}));
    els.push(T(`♥ ${[847,312,1200,72,89,156][i]}  ⟲ ${[142,67,394,14,12,23][i]}`,
      px+12,py+56,9,C.muted));
    // Heat bar
    const heat=[76,62,88,54,71,68][i];
    els.push(R(px+itemW-56,py+58,44,3,C.border,2));
    els.push(R(px+itemW-56,py+58,Math.floor(44*heat/100),3,C.chart+'88',2));
  });

  return frame('dProfile', 0, 0, W_D, H_D, C.bg, els);
}

// ─── SCREEN 9: Desktop Explore / Signals Map ─────────────────────────────────
function dExplore() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  els.push(R(0,0,240,H_D,C.surface));
  els.push(R(240,0,1,H_D,C.border));
  els.push(R(20,16,28,28,C.chart,14));
  els.push(TB('S',34,30,14,C.bg,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(TB('SIGNAL',58,30,14,C.text,{textAlignVertical:'center'}));
  els.push(R(0,56,240,1,C.border));

  const EX_X=241,EX_W=W_D-241;

  // Header
  els.push(R(EX_X,0,EX_W,52,C.bg));
  els.push(R(EX_X,52,EX_W,1,C.border));
  els.push(TB('Signals',EX_X+20,26,16,C.text,{textAlignVertical:'center'}));
  els.push(T('Real-time signal map',EX_X+20,42,10,C.muted));
  // Search
  els.push(R(EX_X+EX_W-280,12,268,30,C.raised,15));
  els.push(T('⌕  Search topics, channels, people...',EX_X+EX_W-146,27,11,C.faint,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Signal heat map visualization (unique to SIGNAL)
  const mapY=58;
  const mapH=280;
  els.push(R(EX_X,mapY,EX_W,mapH,C.surface));
  els.push(TB('SIGNAL HEATMAP · LIVE',EX_X+16,mapY+14,9,C.chartDim,
    {fontFamily:'JetBrains Mono'}));
  // Blinking dot
  els.push(R(EX_X+EX_W-20,mapY+10,8,8,C.chart,4));

  // Bubble nodes (signal topics as sized bubbles)
  const bubbles=[
    {x:200,y:90,r:60,label:'#AO-compute',color:C.chart,opacity:'FF'},
    {x:380,y:120,r:44,label:'#vibe-design',color:C.chart,opacity:'CC'},
    {x:540,y:80,r:38,label:'#crypto',color:C.coral,opacity:'FF'},
    {x:160,y:190,r:32,label:'#builds',color:C.ice,opacity:'CC'},
    {x:460,y:195,r:50,label:'#design',color:C.chart,opacity:'99'},
    {x:680,y:110,r:28,label:'#sf-irl',color:C.chartDim,opacity:'AA'},
    {x:750,y:180,r:22,label:'#noise',color:C.muted,opacity:'66'},
    {x:620,y:210,r:34,label:'#ai',color:C.coral,opacity:'88'},
    {x:300,y:210,r:26,label:'#open-source',color:C.ice,opacity:'77'},
    {x:850,y:120,r:18,label:'#music',color:C.chartDim,opacity:'55'},
    {x:920,y:190,r:14,label:'#writing',color:C.muted,opacity:'44'},
  ];
  bubbles.forEach(b => {
    els.push(R(EX_X+b.x-b.r, mapY+b.y-b.r, b.r*2, b.r*2, b.color+b.opacity, b.r));
    if(b.r>20) {
      els.push(T(b.label,EX_X+b.x,mapY+b.y,b.r>40?9:7,
        b.r>50?C.bg:C.text,
        {textAlignHorizontal:'center',textAlignVertical:'center',
         fontWeight:700,fontFamily:'JetBrains Mono'}));
    }
  });
  // Connection lines between related topics
  [[200,90,380,120],[380,120,460,195],[540,80,620,210]].forEach(([x1,y1,x2,y2]) => {
    els.push(R(EX_X+Math.min(x1,x2),mapY+Math.min(y1,y2),
      Math.abs(x2-x1)||1,Math.abs(y2-y1)||1,C.chart+'22'));
  });
  els.push(R(EX_X,mapY+mapH-1,EX_W,1,C.border));

  // Trending grid below
  const gridStart=mapY+mapH+12;
  els.push(TB('Trending Now',EX_X+16,gridStart+4,13,C.text));

  const trends=[
    {tag:'#AO-compute',count:'4,200 signals',delta:'+28%',heat:88,color:C.chart},
    {tag:'#vibe-design',count:'2,800 signals',delta:'+15%',heat:72,color:C.chart},
    {tag:'#sf-launch-week',count:'1,100 signals',delta:'+42%',heat:91,color:C.coral},
    {tag:'#ai-native',count:'847 signals',delta:'+8%',heat:54,color:C.ice},
    {tag:'#open-source',count:'612 signals',delta:'+3%',heat:41,color:C.chartDim},
    {tag:'#builds',count:'389 signals',delta:'-2%',heat:28,color:C.muted},
  ];

  const tW=(EX_W-32-10*2)/3;
  trends.forEach((tr,i) => {
    const col=i%3, row=Math.floor(i/3);
    const tx=EX_X+16+col*(tW+10);
    const ty=gridStart+24+row*68;
    els.push(R(tx,ty,tW,60,C.surface,8));
    // Heat bar at top of card
    els.push(R(tx,ty,tW,3,C.border,0,{borderRadiusTopLeft:8,borderRadiusTopRight:8}));
    els.push(R(tx,ty,Math.floor(tW*tr.heat/100),3,tr.color+'BB',0));
    els.push(TB(tr.tag,tx+12,ty+14,13,C.text));
    els.push(T(tr.count,tx+12,ty+30,10,C.muted));
    const posColor=tr.delta.startsWith('-')?C.coral:C.chart;
    els.push(T(tr.delta,tx+tW-12,ty+22,11,posColor,
      {textAlignHorizontal:'right',fontFamily:'JetBrains Mono',fontWeight:700}));
  });

  return frame('dExplore', 0, 0, W_D, H_D, C.bg, els);
}

// ─── SCREEN 10: Desktop Compose / Signal Studio ──────────────────────────────
function dCompose() {
  const els = [R(0,0,W_D,H_D,C.bg)];
  els.push(R(0,0,240,H_D,C.surface));
  els.push(R(240,0,1,H_D,C.border));
  els.push(R(20,16,28,28,C.chart,14));
  els.push(TB('S',34,30,14,C.bg,{textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(TB('SIGNAL',58,30,14,C.text,{textAlignVertical:'center'}));
  els.push(R(0,56,240,1,C.border));

  // Modal overlay
  els.push(R(241,0,W_D-241,H_D,C.bg+'EE'));

  // Compose modal
  const MOD_W=680,MOD_H=560;
  const MOD_X=(W_D-MOD_W)/2,MOD_Y=(H_D-MOD_H)/2;
  els.push(R(MOD_X,MOD_Y,MOD_W,MOD_H,C.surface,12));
  els.push(R(MOD_X,MOD_Y,MOD_W,1,C.border));

  // Modal header
  els.push(R(MOD_X,MOD_Y,MOD_W,52,C.raised,0));
  els.push(TB('New Signal',MOD_X+20,MOD_Y+26,14,C.text,{textAlignVertical:'center'}));
  // Channel selector
  els.push(R(MOD_X+140,MOD_Y+14,120,26,C.bg,13));
  els.push(T('#design  ▾',MOD_X+200,MOD_Y+27,12,C.chart,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontWeight:600}));
  // Audience
  els.push(R(MOD_X+270,MOD_Y+14,120,26,C.bg,13));
  els.push(T('Everyone  ▾',MOD_X+330,MOD_Y+27,12,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  // Close
  els.push(T('✕',MOD_X+MOD_W-30,MOD_Y+26,14,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Compose area
  els.push(...Avatar(MOD_X+16,MOD_Y+62,36,'AK',true));
  // Text area
  els.push(T("What's the signal?",MOD_X+62,MOD_Y+72,15,C.faint));
  els.push(T('Constraints are the product. The best design systems succeed not by adding more options, but by ruthlessly removing them. What stays is what matters.',
    MOD_X+62,MOD_Y+72,15,C.text,{width:MOD_W-78,lineHeight:1.65}));
  // Cursor
  els.push(R(MOD_X+62,MOD_Y+148,2,18,C.chart));

  // Signal strength live meter
  const smY=MOD_Y+180;
  els.push(R(MOD_X+62,smY,MOD_W-78,1,C.border));
  els.push(TM('SIGNAL STRENGTH',MOD_X+62,smY+10,8,C.muted));
  els.push(R(MOD_X+62,smY+22,MOD_W-78-60,5,C.border,3));
  els.push(R(MOD_X+62,smY+22,Math.floor((MOD_W-78-60)*0.84),5,C.chart+'AA',3));
  els.push(TM('84%',MOD_X+MOD_W-62,smY+18,9,C.chart,
    {textAlignHorizontal:'right',fontWeight:700}));
  els.push(T('Strong signal — this will reach your top followers',
    MOD_X+62,smY+36,10,C.chartDim));

  // Media row
  const mediaY=smY+56;
  els.push(R(MOD_X,mediaY,MOD_W,1,C.border));
  els.push(R(MOD_X+16,mediaY+10,80,64,C.raised,8));
  els.push(R(MOD_X+16,mediaY+10,80,64,C.chart+'0C',8));
  els.push(T('IMG',MOD_X+56,mediaY+42,9,C.chartDim,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontFamily:'JetBrains Mono'}));
  els.push(R(MOD_X+104,mediaY+20,50,44,C.raised,6));
  els.push(T('+',MOD_X+129,mediaY+42,20,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  // Toolbar
  const toolY=MOD_Y+MOD_H-54;
  els.push(R(MOD_X,toolY,MOD_W,1,C.border));
  els.push(R(MOD_X,toolY,MOD_W,54,C.raised,0,
    {borderRadiusBottomLeft:12,borderRadiusBottomRight:12}));
  const tools2=['⊞','♪','@','#','◎'];
  tools2.forEach((t,i) => {
    els.push(T(t,MOD_X+20+i*44,toolY+27,16,C.muted,
      {textAlignHorizontal:'center',textAlignVertical:'center'}));
  });
  // Char count ring
  els.push(R(MOD_X+MOD_W-108,toolY+9,36,36,C.bg,18));
  els.push(T('116',MOD_X+MOD_W-90,toolY+27,9,C.chartDim,
    {textAlignHorizontal:'center',textAlignVertical:'center',fontFamily:'JetBrains Mono'}));
  // Draft / Send
  els.push(R(MOD_X+MOD_W-64,toolY+11,54,32,C.faint,16));
  els.push(T('Draft',MOD_X+MOD_W-37,toolY+27,11,C.muted,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));
  els.push(R(MOD_X+MOD_W-64+62,toolY+11,80,32,C.chart,16));
  els.push(TB('Beam ⤴',MOD_X+MOD_W-64+62+40,toolY+27,12,C.bg,
    {textAlignHorizontal:'center',textAlignVertical:'center'}));

  return frame('dCompose', 0, 0, W_D, H_D, C.bg, els);
}

// ─── BUILD ────────────────────────────────────────────────────────────────────
function frame(id, x, y, w, h, bg, children) {
  return { type:'frame', id, x, y, width:w, height:h, fill:bg, children };
}

const pen = {
  version: '2.8',
  children: [
    mFeed(),
    mThread(),
    mProfile(),
    mCompose(),
    mChannels(),
    dHome(),
    dThread(),
    dProfile(),
    dExplore(),
    dCompose(),
  ]
};

fs.writeFileSync('/workspace/group/design-studio/signal.pen', JSON.stringify(pen, null, 2));
console.log('✓ signal.pen written — 10 screens (5 mobile, 5 desktop)');
