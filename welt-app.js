// welt-app.js — WELT global signal feed
// Theme: DARK — deep warm near-black #0B0807 + copper amber #C4862E + warm ivory #E8DFD0
// Inspired by:
//   Muzli ECHO Smart Device — terracotta/amber on near-black warm dark palette (#e28157 + #1c0f0c)
//   Awwwards SOTD "The Lookback" (Mar 27) — editorial retrospective style
//   Awwwards SOTD "Unseen Studio 2025 Wrapped" (Mar 24) — data-meets-editorial dark treatment
// Concept: Global perspectives app — see what different nations are reading and thinking
//   about the same events. Each story carries signals from multiple countries.
//   World signal feed · regional intelligence · perspective diversity score

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// Palette — warm dark
const BG      = '#0B0807';  // very deep warm near-black
const SURFACE = '#161210';  // dark warm card
const CARD    = '#1F1A16';  // slightly lighter card
const CARD2   = '#262018';  // even lighter
const COPPER  = '#C4862E';  // amber copper — primary accent
const COPPER2 = '#D9A055';  // lighter copper
const IVORY   = '#E8DFD0';  // warm ivory — primary text
const IVORY2  = '#C8BCA8';  // slightly muted ivory
const ROSE    = '#A06070';  // muted rose — secondary
const TEAL    = '#3D8C85';  // muted teal for contrast
const DIM     = 'rgba(232,223,208,0.15)';
const MUTED   = 'rgba(232,223,208,0.42)';
const FAINT   = 'rgba(232,223,208,0.08)';

// Region colors
const R_EU    = '#5B7EC4';  // blue — Europe
const R_AS    = '#C45B5B';  // red — Asia
const R_AM    = '#5BC48C';  // green — Americas
const R_AF    = '#C4A45B';  // gold — Africa
const R_ME    = '#C47A5B';  // orange — Middle East

let nodes = [];
let id = 1;

function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({ type:'RECTANGLE', id:`node_${id++}`, name, x, y, width:w, height:h, fill,
    cornerRadius: opts.cr||0, opacity: opts.op||1, stroke: opts.stroke||null, strokeWidth: opts.sw||0 });
}
function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({ type:'TEXT', id:`node_${id++}`, name, x, y, width:w, content, fontSize:size, color,
    font: opts.font||'IBM Plex Mono', weight: opts.weight||400, align: opts.align||'left',
    lh: opts.lh||1.35, ls: opts.ls||0 });
}

function serif(name, x, y, w, content, size, color, opts={}) {
  return text(name, x, y, w, content, size, color, {font:'Cormorant Garamond', weight:opts.weight||600, lh:opts.lh||1.1, ls:opts.ls||-.01, ...opts});
}
function mono(name, x, y, w, content, size, color, opts={}) {
  return text(name, x, y, w, content, size, color, {font:'IBM Plex Mono', weight:opts.weight||400, lh:opts.lh||1.4, ls:opts.ls||0.02, ...opts});
}
function sans(name, x, y, w, content, size, color, opts={}) {
  return text(name, x, y, w, content, size, color, {font:'Inter', weight:opts.weight||400, lh:opts.lh||1.4, ls:opts.ls||0, ...opts});
}

function statusBar(sx) {
  rect(`sb-bg-${sx}`, sx, 0, W, 44, BG);
  mono(`time-${sx}`, sx+16, 14, 50, '9:41', 11, IVORY, {weight:700, op:0.7});
  rect(`bat-${sx}`, sx+W-54, 18, 25, 12, DIM, {cr:3});
  rect(`bat-fill-${sx}`, sx+W-53, 19, 16, 10, COPPER, {cr:2, op:0.7});
  rect(`sig-${sx}`, sx+W-86, 17, 9, 13, DIM, {cr:1});
  rect(`wifi-${sx}`, sx+W-71, 19, 11, 9, DIM, {cr:2});
}

function bottomNav(sx, active) {
  rect(`nav-bg-${sx}`, sx, H-80, W, 80, SURFACE);
  rect(`nav-top-${sx}`, sx, H-80, W, 1, DIM);
  const tabs = [
    {label:'SIGNAL', icon:'◎'},
    {label:'STORY',  icon:'◈'},
    {label:'GLOBE',  icon:'○'},
    {label:'REGIONS',icon:'◇'},
    {label:'PROFILE',icon:'∘'},
  ];
  const tw = Math.floor(W / tabs.length);
  tabs.forEach((tab, i) => {
    const tx = sx + i * tw + Math.floor(tw/2) - 20;
    const isActive = i === active;
    const col = isActive ? COPPER : MUTED;
    mono(`nav-icon-${sx}-${i}`, tx, H-62, 40, tab.icon, 13, col, {align:'center'});
    mono(`nav-lbl-${sx}-${i}`, tx-8, H-42, 56, tab.label, 6, col, {align:'center', ls:0.05});
    if (isActive) rect(`nav-dot-${sx}-${i}`, sx+i*tw+Math.floor(tw/2)-3, H-76, 6, 3, COPPER, {cr:2});
  });
}

// ─── Screen 0 — SIGNAL (global feed) ────────────────────────────────────────
function screenSignal(sx) {
  rect(`s0-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Header
  mono(`s0-date`, sx+20, 54, 220, 'MON 30 MAR 2026 · LIVE', 9, COPPER2, {ls:0.08, weight:700});
  serif(`s0-title`, sx+20, 68, 180, 'WELT', 38, IVORY, {weight:700, ls:0.06});
  mono(`s0-sub`, sx+20, 110, 240, 'global signal feed', 9, MUTED, {ls:0.04});

  // Signal strength indicator — top-right
  rect(`s0-sig-bg`, sx+W-72, 60, 56, 32, FAINT, {cr:6});
  mono(`s0-sig-lbl`, sx+W-69, 66, 50, 'SIGNAL', 6, MUTED, {align:'center', ls:0.08});
  mono(`s0-sig-val`, sx+W-69, 76, 50, '94%', 11, COPPER, {align:'center', weight:700});

  // World activity strip
  rect(`s0-activity-bg`, sx+16, 132, W-32, 32, CARD, {cr:6});
  mono(`s0-activity-lbl`, sx+28, 140, 160, '◎ 847 STORIES · 112 COUNTRIES', 8, COPPER2, {ls:0.04, weight:700});
  mono(`s0-activity-sub`, sx+W-80, 140, 70, '+3.2% today', 8, MUTED, {align:'right'});
  rect(`s0-activity-bar`, sx+16, 162, W-32, 2, DIM);
  rect(`s0-activity-fill`, sx+16, 162, Math.floor((W-32)*0.94), 2, COPPER, {cr:1});

  // Top story — featured large
  rect(`s0-hero-bg`, sx+16, 174, W-32, 108, CARD, {cr:8});
  rect(`s0-hero-bar`, sx+16, 174, W-32, 3, COPPER, {cr:2});
  mono(`s0-hero-tag`, sx+28, 183, 160, '🔥 TOP STORY · 83 COUNTRIES', 7, COPPER, {ls:0.06, weight:700});
  serif(`s0-hero-hed`, sx+24, 198, W-48, 'The AI governance summit fractures on enforcement', 16, IVORY, {weight:700, lh:1.2});
  // Region signals
  const topRegions = [{c:R_EU,l:'EU'},{c:R_AS,l:'AS'},{c:R_AM,l:'AM'},{c:R_ME,l:'ME'},{c:R_AF,l:'AF'}];
  topRegions.forEach((r, i) => {
    rect(`s0-hero-reg-${i}`, sx+28+i*38, 248, 30, 14, r.c, {cr:3, op:0.85});
    mono(`s0-hero-rl-${i}`, sx+28+i*38, 251, 30, r.l, 7, BG, {align:'center', weight:700});
  });
  mono(`s0-hero-time`, sx+W-90, 248, 80, '3h ago · live', 8, MUTED, {align:'right'});
  mono(`s0-hero-count`, sx+28, 264, 200, '4,812 articles · 83 countries', 8, MUTED);

  // Story list
  mono(`s0-list-lbl`, sx+20, 292, 200, 'TRENDING SIGNALS', 8, MUTED, {ls:0.08});

  const stories = [
    {tag:'ECONOMY', hed:'Central banks diverge on rate path as inflation data splits', regions:4, countries:64, hrs:'5h', hot:true},
    {tag:'SCIENCE', hed:'Deep-sea survey maps unknown trench ecosystem for first time', regions:3, countries:31, hrs:'8h', hot:false},
    {tag:'POLITICS', hed:'Three elections in one week reshape regional power balance', regions:3, countries:47, hrs:'11h', hot:false},
    {tag:'TECH',    hed:'Open-source model surpasses proprietary benchmarks silently', regions:5, countries:72, hrs:'14h', hot:true},
  ];

  let sy = 308;
  stories.forEach((s, i) => {
    rect(`s0-s-bg-${i}`, sx+16, sy, W-32, 74, SURFACE, {cr:6});
    rect(`s0-s-line-${i}`, sx+16, sy, 3, 74, s.hot?COPPER:DIM, {cr:2});
    mono(`s0-s-tag-${i}`, sx+28, sy+8, 120, s.tag, 7, s.hot?COPPER2:MUTED, {ls:0.08, weight:700});
    mono(`s0-s-time-${i}`, sx+W-58, sy+8, 50, s.hrs+' ago', 7, MUTED, {align:'right'});
    serif(`s0-s-hed-${i}`, sx+28, sy+22, W-60, s.hed, 12, IVORY, {weight:600, lh:1.3});
    mono(`s0-s-meta-${i}`, sx+28, sy+56, 200, `${s.countries} countries · ${s.regions} regions`, 7, MUTED);
    sy += 80;
  });

  bottomNav(sx, 0);
}

// ─── Screen 1 — STORY (multi-perspective) ───────────────────────────────────
function screenStory(sx) {
  rect(`s1-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Top bar
  mono(`s1-back`, sx+20, 54, 60, '← BACK', 9, MUTED, {ls:0.04});
  mono(`s1-share`, sx+W-56, 54, 50, 'SHARE ↗', 9, COPPER, {ls:0.04});

  // Story hero
  rect(`s1-hero`, sx, 72, W, 110, CARD);
  mono(`s1-tag`, sx+20, 82, 180, '🔥 TOP STORY · 83 COUNTRIES', 7, COPPER, {ls:0.06, weight:700});
  serif(`s1-hed`, sx+20, 96, W-40, 'The AI governance summit fractures on enforcement', 18, IVORY, {weight:700, lh:1.2});
  mono(`s1-meta`, sx+20, 150, W-40, '4,812 articles · 3h ago · updating live', 8, MUTED);
  mono(`s1-regions`, sx+20, 164, 200, '83 countries · 5 regions active', 8, COPPER2, {weight:700});

  // Perspective section label
  mono(`s1-persp-lbl`, sx+20, 192, 280, 'HOW THE WORLD SEES IT', 8, MUTED, {ls:0.1});

  // Regional perspective cards
  const perspectives = [
    {region:'EUROPE', flag:'🇪🇺', color:R_EU, angle:'Favours binding enforcement with sanctions mechanism', tone:'concerned', count:'1,247'},
    {region:'EAST ASIA', flag:'🌏', color:R_AS, angle:'Emphasises national sovereignty, resists external oversight', tone:'resistant', count:'893'},
    {region:'USA', flag:'🇺🇸', color:R_AM, angle:'Split: industry self-regulation vs congressional mandate', tone:'divided', count:'742'},
    {region:'AFRICA', flag:'🌍', color:R_AF, angle:'Raises access equity — developing nations excluded from draft', tone:'critical', count:'318'},
  ];

  perspectives.forEach((p, i) => {
    const py = 208 + i * 100;
    rect(`s1-p-bg-${i}`, sx+16, py, W-32, 92, CARD, {cr:6});
    rect(`s1-p-left-${i}`, sx+16, py, 3, 92, p.color, {cr:2});
    mono(`s1-p-reg-${i}`, sx+28, py+10, 140, p.flag+' '+p.region, 9, p.color, {weight:700, ls:0.04});
    mono(`s1-p-count-${i}`, sx+W-72, py+10, 64, p.count+' art.', 8, MUTED, {align:'right'});
    sans(`s1-p-angle-${i}`, sx+28, py+28, W-60, p.angle, 11, IVORY, {lh:1.45, weight:400});
    // Tone badge
    rect(`s1-tone-bg-${i}`, sx+28, py+70, 70, 14, p.color, {cr:3, op:0.2});
    mono(`s1-tone-lbl-${i}`, sx+28, py+73, 70, p.tone.toUpperCase(), 7, p.color, {align:'center', weight:700, ls:0.05});
  });

  bottomNav(sx, 1);
}

// ─── Screen 2 — GLOBE (geographic view) ─────────────────────────────────────
function screenGlobe(sx) {
  rect(`s2-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  serif(`s2-title`, sx+20, 54, 200, 'Globe', 28, IVORY, {weight:700});
  mono(`s2-sub`, sx+20, 86, 280, '847 STORIES · 112 COUNTRIES · LIVE', 8, COPPER2, {ls:0.06, weight:700});

  // Globe representation — abstract circular map
  const cx = sx + W/2;
  const cy = 220;
  const R = 100;

  // Globe rings
  rect(`s2-ring-3`, cx-R-20, cy-R-20, (R+20)*2, (R+20)*2, FAINT, {cr:R+20});
  rect(`s2-ring-2`, cx-R-8, cy-R-8, (R+8)*2, (R+8)*2, FAINT, {cr:R+8});
  rect(`s2-globe-bg`, cx-R, cy-R, R*2, R*2, CARD, {cr:R});

  // Continent blob shapes (simplified as rectangles at various positions)
  // Europe blob
  rect(`s2-eu-1`, cx-20, cy-40, 35, 30, R_EU, {cr:8, op:0.7});
  rect(`s2-eu-2`, cx-15, cy-20, 25, 22, R_EU, {cr:6, op:0.5});
  // Asia blob
  rect(`s2-as-1`, cx+15, cy-38, 55, 32, R_AS, {cr:8, op:0.7});
  rect(`s2-as-2`, cx+20, cy-10, 42, 28, R_AS, {cr:6, op:0.5});
  rect(`s2-as-3`, cx+30, cy+14, 28, 20, R_AS, {cr:6, op:0.4});
  // Americas blob
  rect(`s2-am-1`, cx-75, cy-32, 30, 36, R_AM, {cr:8, op:0.65});
  rect(`s2-am-2`, cx-68, cy+8, 22, 32, R_AM, {cr:6, op:0.5});
  // Africa blob
  rect(`s2-af-1`, cx-10, cy+6, 28, 42, R_AF, {cr:8, op:0.6});
  // Middle East
  rect(`s2-me-1`, cx+8, cy-4, 20, 18, R_ME, {cr:5, op:0.6});

  // Globe clip (covers overflow with ring)
  // Active story pulses
  const pulses = [
    {x:cx-8, y:cy-28, c:COPPER, r:8, label:'EU'},   // Europe — AI story hot
    {x:cx+40, y:cy-22, c:R_AS, r:6, label:''},
    {x:cx-60, y:cy-16, c:R_AM, r:6, label:''},
    {x:cx+8, y:cy+24, c:R_AF, r:4, label:''},
  ];
  pulses.forEach((p, i) => {
    rect(`s2-pulse-glow-${i}`, p.x-p.r*2.5, p.y-p.r*2.5, p.r*5, p.r*5, p.c, {cr:p.r*3, op:0.18});
    rect(`s2-pulse-${i}`, p.x-p.r/2, p.y-p.r/2, p.r, p.r, p.c, {cr:p.r, op:0.95});
  });

  // Globe label
  mono(`s2-globe-lbl`, cx-50, cy+R+14, 100, 'LIVE SIGNAL MAP', 7, MUTED, {align:'center', ls:0.1});

  // Region stats grid
  mono(`s2-stats-lbl`, sx+20, 342, 200, 'REGIONAL ACTIVITY', 8, MUTED, {ls:0.08});

  const regions = [
    {name:'EUROPE',      stories:312, trend:'+8%',  color:R_EU},
    {name:'EAST ASIA',   stories:218, trend:'+14%', color:R_AS},
    {name:'AMERICAS',    stories:186, trend:'-2%',  color:R_AM},
    {name:'MIDDLE EAST', stories:74,  trend:'+22%', color:R_ME},
    {name:'AFRICA',      stories:57,  trend:'+5%',  color:R_AF},
  ];

  regions.forEach((r, i) => {
    const ry = 358 + i * 56;
    rect(`s2-r-bg-${i}`, sx+16, ry, W-32, 48, CARD, {cr:6});
    rect(`s2-r-dot-${i}`, sx+28, ry+16, 12, 12, r.color, {cr:6});
    mono(`s2-r-name-${i}`, sx+48, ry+9, 140, r.name, 9, IVORY, {weight:700, ls:0.04});
    mono(`s2-r-stories-${i}`, sx+48, ry+25, 140, `${r.stories} active stories`, 8, MUTED);
    mono(`s2-r-trend-${i}`, sx+W-70, ry+16, 60, r.trend, 11, r.trend.startsWith('+')?TEAL:ROSE, {align:'right', weight:700});
    // Mini bar
    const barW = Math.round((W-80) * r.stories / 350);
    rect(`s2-r-bar-bg-${i}`, sx+28, ry+40, W-60, 3, DIM, {cr:2});
    rect(`s2-r-bar-${i}`, sx+28, ry+40, barW, 3, r.color, {cr:2, op:0.7});
  });

  bottomNav(sx, 2);
}

// ─── Screen 3 — REGIONS ─────────────────────────────────────────────────────
function screenRegions(sx) {
  rect(`s3-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  serif(`s3-title`, sx+20, 54, 240, 'Regions', 28, IVORY, {weight:700});
  mono(`s3-sub`, sx+20, 86, 240, 'BROWSE BY WORLD REGION', 8, MUTED, {ls:0.08});

  const regionCards = [
    {name:'Europe', sub:'312 stories · 47 countries', color:R_EU, trend:'AI governance · energy transition · elections', signal:94},
    {name:'East Asia', sub:'218 stories · 18 countries', color:R_AS, trend:'Technology · trade policy · maritime tensions', signal:88},
    {name:'Americas', sub:'186 stories · 35 countries', color:R_AM, trend:'Economic data · climate · domestic politics', signal:72},
    {name:'Middle East', sub:'74 stories · 14 countries', color:R_ME, trend:'Regional diplomacy · energy · infrastructure', signal:85},
    {name:'Africa', sub:'57 stories · 54 countries', color:R_AF, trend:'Development finance · elections · climate', signal:61},
    {name:'South Asia', sub:'43 stories · 8 countries', color:ROSE, trend:'Political transitions · floods · technology', signal:58},
  ];

  regionCards.forEach((r, i) => {
    const ry = 108 + i * 98;
    rect(`s3-card-${i}`, sx+16, ry, W-32, 88, CARD, {cr:8});
    rect(`s3-card-left-${i}`, sx+16, ry, 4, 88, r.color, {cr:2});

    serif(`s3-name-${i}`, sx+30, ry+10, 220, r.name, 18, IVORY, {weight:700});
    mono(`s3-sub-${i}`, sx+30, ry+32, 220, r.sub, 8, r.color, {weight:700, ls:0.03});
    mono(`s3-trend-${i}`, sx+30, ry+48, W-70, r.trend, 8, MUTED, {lh:1.3});

    // Signal strength bar
    mono(`s3-sig-lbl-${i}`, sx+W-68, ry+10, 58, 'SIGNAL', 6, MUTED, {align:'right', ls:0.06});
    mono(`s3-sig-val-${i}`, sx+W-68, ry+22, 58, `${r.signal}%`, 13, r.color, {align:'right', weight:700});
    rect(`s3-sig-bg-${i}`, sx+W-68, ry+42, 52, 4, DIM, {cr:2});
    rect(`s3-sig-fill-${i}`, sx+W-68, ry+42, Math.round(52*r.signal/100), 4, r.color, {cr:2, op:0.8});

    mono(`s3-arrow-${i}`, sx+W-28, ry+36, 20, '›', 18, DIM);
  });

  bottomNav(sx, 3);
}

// ─── Screen 4 — PROFILE ─────────────────────────────────────────────────────
function screenProfile(sx) {
  rect(`s4-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Reader profile header
  mono(`s4-lbl`, sx+20, 54, 200, 'READER PROFILE', 9, COPPER, {ls:0.1, weight:700});
  serif(`s4-name`, sx+20, 68, 240, 'A. Thatcher', 26, IVORY, {weight:700});
  mono(`s4-since`, sx+20, 98, 240, 'WELT READER · SINCE 2024', 8, MUTED, {ls:0.06, weight:700});
  rect(`s4-avatar`, sx+W-68, 54, 48, 48, CARD, {cr:24});
  rect(`s4-avatar-ring`, sx+W-70, 52, 52, 52, COPPER, {cr:26, op:0.3});
  mono(`s4-init`, sx+W-52, 70, 24, 'AT', 12, COPPER, {align:'center', weight:700});

  // Diversity score — the key metric
  rect(`s4-div-bg`, sx+16, 118, W-32, 76, CARD, {cr:10});
  serif(`s4-div-val`, sx+28, 126, 80, '7.8', 34, COPPER, {weight:700});
  mono(`s4-div-lbl`, sx+28, 164, 140, 'PERSPECTIVE DIVERSITY', 7, MUTED, {ls:0.07});
  mono(`s4-div-sub`, sx+130, 132, W-160, 'Your reading spans 5 world regions — top 12% of readers. You\'re actively seeking counter-narratives.', 9, IVORY2, {lh:1.5, weight:400});

  // Reading stats
  mono(`s4-stats-lbl`, sx+20, 206, 200, 'READING PATTERNS', 8, MUTED, {ls:0.08});
  rect(`s4-stats-bg`, sx+16, 222, W-32, 52, SURFACE, {cr:8});
  const stats = [{v:'312', l:'STORIES'}, {v:'47', l:'COUNTRIES'}, {v:'5', l:'REGIONS'}, {v:'14d', l:'STREAK'}];
  stats.forEach((s, i) => {
    const sx2 = sx+30 + i*80;
    serif(`s4-sv-${i}`, sx2, 232, 68, s.v, 18, i===3?TEAL:IVORY, {weight:700, align:'center'});
    mono(`s4-sl-${i}`, sx2, 253, 68, s.l, 7, MUTED, {align:'center', ls:0.05});
  });

  // Region breakdown
  mono(`s4-region-lbl`, sx+20, 286, 200, 'BY REGION', 8, MUTED, {ls:0.08});
  const rBreakdown = [
    {name:'Europe', pct:0.38, c:R_EU, v:'118 stories'},
    {name:'Americas', pct:0.26, c:R_AM, v:'81 stories'},
    {name:'East Asia', pct:0.22, c:R_AS, v:'68 stories'},
    {name:'Africa', pct:0.09, c:R_AF, v:'28 stories'},
    {name:'Middle East', pct:0.05, c:R_ME, v:'17 stories'},
  ];
  rBreakdown.forEach((r, i) => {
    const ry = 302 + i * 40;
    mono(`s4-rn-${i}`, sx+20, ry, 90, r.name, 9, IVORY, {weight:700});
    rect(`s4-rb-bg-${i}`, sx+110, ry+2, W-150, 12, DIM, {cr:6});
    rect(`s4-rb-fill-${i}`, sx+110, ry+2, Math.round((W-150)*r.pct), 12, r.c, {cr:6, op:0.8});
    mono(`s4-rv-${i}`, sx+W-72, ry, 62, r.v, 8, r.c, {align:'right'});
  });

  // Followed topics
  mono(`s4-topics-lbl`, sx+20, 508, 200, 'FOLLOWED TOPICS', 8, MUTED, {ls:0.08});
  const topics = ['AI Governance', 'Climate Policy', 'Geopolitics', 'Tech Regulation', 'Global Economy'];
  topics.forEach((t, i) => {
    const tw = t.length * 6.5 + 20;
    const tx = sx + 20 + [0, 106, 210, 0, 110][i];
    const ty = 524 + Math.floor(i/3)*28;
    rect(`s4-topic-bg-${i}`, tx, ty, tw, 20, CARD, {cr:10});
    mono(`s4-topic-lbl-${i}`, tx+10, ty+6, tw-20, t, 8, COPPER2, {ls:0.03});
  });

  // Reading streak calendar (heatmap)
  mono(`s4-streak-lbl`, sx+20, 590, 200, 'ACTIVITY · MARCH 2026', 8, MUTED, {ls:0.08});
  rect(`s4-streak-bg`, sx+16, 606, W-32, 36, SURFACE, {cr:6});
  const days = [3,6,8,2,9,5,4,7,6,8,10,4,6,8,3,5,7,9,6,8,10,5,7,9,4,6,8,5,7,10,8];
  days.forEach((v, i) => {
    if (i >= 30) return;
    const dx = sx+24 + i*10;
    const ht = Math.min(24, Math.round(v * 2.2));
    const op = 0.15 + v/10 * 0.85;
    rect(`s4-day-${i}`, dx, 606+36-4-ht, 7, ht, COPPER, {cr:2, op});
  });

  // Today's reading prompt
  rect(`s4-prompt-bg`, sx+16, 654, W-32, 44, CARD, {cr:8});
  rect(`s4-prompt-bar`, sx+16, 654, 3, 44, COPPER, {cr:2});
  serif(`s4-prompt-txt`, sx+28, 662, W-52, 'Read something outside your usual regions today.', 11, IVORY2, {weight:500, lh:1.4});
  mono(`s4-prompt-sub`, sx+28, 683, 200, '↳ Expand your perspective score', 8, COPPER, {ls:0.02});

  bottomNav(sx, 4);
}

// ─── BUILD ───────────────────────────────────────────────────────────────────
function screenX(index) { return GAP + index * (W + GAP); }

screenSignal(screenX(0));
screenStory(screenX(1));
screenGlobe(screenX(2));
screenRegions(screenX(3));
screenProfile(screenX(4));

const pen = {
  version: '2.8',
  name: 'WELT',
  width: canvas_w,
  height: H,
  fill: BG,
  children: nodes
};

fs.writeFileSync('welt.pen', JSON.stringify(pen, null, 2));
console.log(`✓ welt.pen written — ${nodes.length} nodes, canvas ${canvas_w}×${H}`);
