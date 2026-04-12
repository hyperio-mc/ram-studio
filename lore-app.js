#!/usr/bin/env node
/**
 * LORE — Story Intelligence Workspace
 * Inspired by: Obsidian knowledge graph patterns (darkmodedesign.com)
 * + Atlas Card luxury editorial dark aesthetic (godly.website)
 * Theme: DARK (mesa was light)
 * Slug: lore
 */

const fs = require('fs');

const P = {
  bg:       '#080B12',
  surface:  '#0E1320',
  surface2: '#141929',
  border:   '#1E2A42',
  text:     '#EAE6DC',
  textDim:  '#8A8680',
  accent:   '#6B4FE8',
  gold:     '#B8984A',
  danger:   '#E85B4F',
  success:  '#4FBF7A',
  warn:     '#C4873D',
};

const w = 390, h = 844;

function rect(x, y, width, height, fill, opts = {}) {
  return { type: 'rect', x, y, width, height, fill,
    cornerRadius: opts.r || 0, opacity: opts.opacity || 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}) };
}
function text(x, y, content, fontSize, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), fontSize, fill,
    fontWeight: opts.weight || 400, fontFamily: 'Inter',
    textAlign: opts.align || 'left', opacity: opts.opacity || 1,
    letterSpacing: opts.tracking || 0 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'ellipse', x: cx - r, y: cy - r, width: r * 2, height: r * 2,
    fill, opacity: opts.opacity || 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}) };
}
function line(x1, y1, x2, y2, stroke, strokeWidth = 1, opacity = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth, opacity };
}
function pill(x, y, w2, h2, fill, opts = {}) {
  return rect(x, y, w2, h2, fill, { r: h2 / 2, ...opts });
}

function statusBar() {
  return [
    rect(0, 0, w, 44, P.bg),
    text(w / 2, 16, '9:41', 15, P.text, { weight: 600, align: 'center' }),
    circle(340, 22, 3, P.text, { opacity: 0.8 }),
    circle(350, 22, 3, P.text, { opacity: 0.6 }),
    circle(360, 22, 3, P.text, { opacity: 0.4 }),
    rect(370, 16, 16, 9, 'transparent', { stroke: P.textDim, strokeWidth: 1, r: 2 }),
    rect(386, 19, 2, 3, P.textDim, { r: 1 }),
    rect(371, 17, 10, 7, P.text, { r: 1 }),
  ];
}

function navBar(activeIdx) {
  const tabs = [
    { icon: '◈', label: 'Universe' },
    { icon: '◉', label: 'Characters' },
    { icon: '◌', label: 'Timeline' },
    { icon: '◫', label: 'Lore' },
    { icon: '◧', label: 'Threads' },
  ];
  const items = [
    rect(0, h - 84, w, 84, P.surface),
    rect(0, h - 84, w, 1, P.border),
  ];
  tabs.forEach((tab, i) => {
    const x = (w / tabs.length) * i + (w / tabs.length) / 2;
    const isActive = i === activeIdx;
    if (isActive) items.push(rect(x - 22, h - 80, 44, 3, P.accent, { r: 2 }));
    items.push(text(x, h - 62, tab.icon, isActive ? 20 : 18, isActive ? P.accent : P.textDim, { align: 'center' }));
    items.push(text(x, h - 34, tab.label, 10, isActive ? P.text : P.textDim, { align: 'center', tracking: 0.3 }));
  });
  return items;
}

// SCREEN 1: Universe Dashboard
function screenUniverse() {
  const els = [rect(0, 0, w, h, P.bg), ...statusBar()];

  els.push(text(20, 60, 'LORE', 11, P.gold, { weight: 700, tracking: 4 }));
  els.push(text(20, 82, 'The Pale Kingdom', 22, P.text, { weight: 700 }));
  els.push(pill(20, 100, 60, 20, P.accent + '26'));
  els.push(text(50, 114, 'DRAFT', 9, P.accent, { weight: 700, tracking: 2, align: 'center' }));
  els.push(pill(86, 100, 72, 20, P.surface2));
  els.push(text(122, 114, 'FANTASY', 9, P.textDim, { weight: 600, tracking: 2, align: 'center' }));

  // Metrics card
  els.push(rect(20, 136, w - 40, 96, P.surface, { r: 14 }));
  const metrics = [
    { label: 'ACTS', val: '3/5', color: P.accent },
    { label: 'WORDS', val: '42K', color: P.gold },
    { label: 'CHARS', val: '18', color: P.success },
    { label: 'SCENES', val: '67', color: P.warn },
  ];
  metrics.forEach((m, i) => {
    const x = 20 + (i * ((w - 40) / 4)) + ((w - 40) / 8);
    els.push(text(x, 168, m.val, 20, m.color, { weight: 700, align: 'center' }));
    els.push(text(x, 188, m.label, 8, P.textDim, { weight: 600, tracking: 1.5, align: 'center' }));
    if (i < 3) els.push(rect(20 + ((i + 1) * ((w - 40) / 4)), 150, 1, 64, P.border));
  });

  // Act structure
  els.push(text(20, 248, 'ACT STRUCTURE', 10, P.textDim, { weight: 700, tracking: 2 }));
  const acts = [
    { label: 'Act I', name: 'The Call', scenes: 12, pct: 78, color: P.accent },
    { label: 'Act II-A', name: 'Descent', scenes: 21, pct: 55, color: P.gold },
    { label: 'Act II-B', name: 'The Turn', scenes: 18, pct: 30, color: P.warn },
    { label: 'Act III', name: 'Resolution', scenes: 16, pct: 8, color: P.danger },
  ];
  acts.forEach((act, i) => {
    const y = 266 + i * 44;
    const barX = 118, barW = w - 40 - 98 - 26;
    els.push(rect(20, y, w - 40, 36, P.surface, { r: 8 }));
    els.push(text(28, y + 12, act.label, 10, act.color, { weight: 700, tracking: 1 }));
    els.push(text(28, y + 26, act.name, 11, P.text, { weight: 500 }));
    els.push(rect(barX, y + 15, barW, 6, P.border, { r: 3 }));
    els.push(rect(barX, y + 15, Math.max(4, barW * act.pct / 100), 6, act.color, { r: 3 }));
    els.push(text(w - 24, y + 21, act.scenes + 'sc', 10, P.textDim, { align: 'right' }));
  });

  // Recent activity
  els.push(text(20, 450, 'RECENT ACTIVITY', 10, P.textDim, { weight: 700, tracking: 2 }));
  const activity = [
    { time: '2h ago', icon: '◉', label: 'Lyra Ashveil — motives updated', color: P.accent },
    { time: '5h ago', icon: '◌', label: 'Scene 34 "The Mirror Room" drafted', color: P.gold },
    { time: '1d ago', icon: '◧', label: 'Thread: The Pale War marked active', color: P.warn },
    { time: '2d ago', icon: '◫', label: 'Stonehavre Fortress added to Lore', color: P.success },
  ];
  activity.forEach((a, i) => {
    const y = 468 + i * 46;
    els.push(rect(20, y, w - 40, 38, P.surface, { r: 8 }));
    els.push(rect(20, y, 3, 38, a.color, { r: 2 }));
    els.push(text(32, y + 13, a.icon, 14, a.color));
    els.push(text(52, y + 13, a.label, 12, P.text));
    els.push(text(52, y + 27, a.time, 10, P.textDim));
  });

  // Graph preview
  els.push(rect(20, 658, w - 40, 70, P.surface2, { r: 12 }));
  els.push(text(32, 676, '◈  STORY GRAPH', 10, P.gold, { weight: 700, tracking: 2 }));
  els.push(text(32, 692, '18 characters  ·  24 connections  ·  6 clusters', 11, P.textDim));
  els.push(text(w - 28, 684, 'Explore →', 11, P.accent, { align: 'right' }));

  const nodes = [[280,698,6,P.accent],[300,688,4,P.gold],[320,704,5,P.accent],[310,718,4,P.textDim],[292,716,3,P.warn],[332,692,3,P.success]];
  nodes.forEach(([x,y,r,c]) => els.push(circle(x, y, r, c, { opacity: 0.7 })));
  els.push(line(280,698, 300,688, P.accent, 1, 0.3));
  els.push(line(300,688, 320,704, P.accent, 1, 0.3));
  els.push(line(280,698, 292,716, P.gold, 1, 0.3));
  els.push(line(320,704, 310,718, P.textDim, 1, 0.3));
  els.push(line(300,688, 332,692, P.success, 1, 0.3));

  els.push(...navBar(0));
  return { id: 'universe', width: w, height: h, elements: els };
}

// SCREEN 2: Characters
function screenCharacters() {
  const els = [rect(0, 0, w, h, P.bg), ...statusBar()];

  els.push(text(20, 60, 'CHARACTERS', 10, P.gold, { weight: 700, tracking: 2 }));
  els.push(text(20, 82, '18 Active Roles', 22, P.text, { weight: 700 }));

  const filters = ['All', 'Protagonist', 'Antagonist', 'Support'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw = f.length * 7.5 + 20;
    els.push(pill(fx, 108, fw, 26, i === 0 ? P.accent : P.surface2));
    els.push(text(fx + fw / 2, 125, f, 11, i === 0 ? '#fff' : P.textDim, { weight: 500, align: 'center' }));
    fx += fw + 8;
  });

  els.push(rect(20, 146, w - 40, 38, P.surface, { r: 10, stroke: P.border, strokeWidth: 1 }));
  els.push(text(40, 169, '⌕  Search characters…', 13, P.textDim));

  const chars = [
    { name: 'Lyra Ashveil', role: 'PROTAGONIST', arc: 'The reluctant heir seeking truth', arcPct: 72, links: 8, scenes: 34, color: P.accent, init: 'L' },
    { name: 'Calder Voss', role: 'ANTAGONIST', arc: "The Pale King whose grief became empire", arcPct: 60, links: 11, scenes: 28, color: P.danger, init: 'C' },
    { name: 'Maren Sol', role: 'SUPPORT', arc: "Lyra's mentor — keeper of forbidden maps", arcPct: 45, links: 5, scenes: 16, color: P.gold, init: 'M' },
    { name: 'The Archivist', role: 'MYSTERY', arc: 'Unknown allegiances — appears at chapter breaks', arcPct: 15, links: 3, scenes: 7, color: P.warn, init: '?' },
  ];

  chars.forEach((c, i) => {
    const y = 200 + i * 128;
    const barW = w - 40 - 36;
    els.push(rect(20, y, w - 40, 120, P.surface, { r: 12 }));
    els.push(rect(20, y, 4, 120, c.color, { r: 2 }));
    els.push(circle(54, y + 30, 22, c.color + '22'));
    els.push(circle(54, y + 30, 22, 'transparent', { stroke: c.color, strokeWidth: 1.5 }));
    els.push(text(54, y + 24, c.init, 16, c.color, { weight: 700, align: 'center' }));
    els.push(text(84, y + 18, c.name, 14, P.text, { weight: 700 }));
    const rw = c.role.length * 6 + 14;
    els.push(pill(84, y + 30, rw, 16, c.color + '22'));
    els.push(text(84 + rw / 2, y + 41, c.role, 8, c.color, { weight: 700, tracking: 1, align: 'center' }));
    els.push(text(28, y + 58, c.arc, 11, P.textDim));
    els.push(rect(28, y + 80, barW, 4, P.border, { r: 2 }));
    els.push(rect(28, y + 80, barW * c.arcPct / 100, 4, c.color, { r: 2 }));
    els.push(text(28, y + 96, 'ARC ' + c.arcPct + '%', 9, P.textDim, { tracking: 1 }));
    els.push(text(w - 28, y + 96, c.links + ' links · ' + c.scenes + ' scenes', 9, P.textDim, { align: 'right' }));
  });

  els.push(...navBar(1));
  return { id: 'characters', width: w, height: h, elements: els };
}

// SCREEN 3: Timeline / Beat Sheet
function screenTimeline() {
  const els = [rect(0, 0, w, h, P.bg), ...statusBar()];

  els.push(text(20, 60, 'STORY TIMELINE', 10, P.gold, { weight: 700, tracking: 2 }));
  els.push(text(20, 82, 'Dramatic Arc', 22, P.text, { weight: 700 }));
  els.push(text(20, 106, 'The Pale Kingdom · Beat Sheet', 12, P.textDim));

  // Tension curve visualization
  const curveY = 228, curveH = 68, totalW = w - 40;
  const segs = [
    { pct: 8,  tension: 0.15, color: P.accent },
    { pct: 22, tension: 0.45, color: P.accent },
    { pct: 14, tension: 0.70, color: P.gold },
    { pct: 20, tension: 0.90, color: P.danger },
    { pct: 12, tension: 1.00, color: P.danger },
    { pct: 14, tension: 0.60, color: P.warn },
    { pct: 10, tension: 0.20, color: P.success },
  ];
  let segX = 20;
  segs.forEach(s => {
    const sw = totalW * s.pct / 100;
    const sh = Math.round(curveH * s.tension);
    const sy = curveY + curveH - sh;
    els.push(rect(segX, sy, sw - 2, sh, s.color + '44', { r: 2 }));
    els.push(rect(segX, sy, sw - 2, 3, s.color, { r: 1 }));
    segX += sw;
  });
  els.push(rect(20, curveY + curveH, totalW, 1, P.border));

  // Beat sheet
  els.push(text(20, 314, 'BEAT SHEET', 10, P.textDim, { weight: 700, tracking: 2 }));
  const beats = [
    { num: '01', act: 'I',   title: 'Opening Image',         desc: 'Lyra in the ruins of Ashveil Keep',          status: 'done' },
    { num: '05', act: 'I',   title: 'Inciting Incident',     desc: "The Pale King's seal found in the library",  status: 'done' },
    { num: '12', act: 'I',   title: 'Break Into Two',        desc: "Lyra accepts Maren's offer to cross the Pale", status: 'draft' },
    { num: '21', act: 'II',  title: 'Midpoint',              desc: "Archivist appears — allegiances shift",       status: 'outline' },
    { num: '34', act: 'II',  title: 'Dark Night of the Soul',desc: "Maren's betrayal revealed",                  status: 'outline' },
    { num: '46', act: 'III', title: 'Climax',                desc: 'Confrontation at the Pale Throne',            status: 'blank' },
    { num: '54', act: 'III', title: 'Final Image',           desc: 'Mirror of opening — transformation complete', status: 'blank' },
  ];
  const sc = { done: P.success, draft: P.accent, outline: P.gold, blank: P.border };

  els.push(rect(48, 330, 2, beats.length * 62, P.border));
  beats.forEach((b, i) => {
    const y = 330 + i * 62;
    els.push(circle(49, y + 10, 8, sc[b.status] + '33'));
    els.push(circle(49, y + 10, 4, sc[b.status]));
    els.push(text(20, y + 14, 'A' + b.act, 8, P.textDim, { tracking: 1, align: 'center' }));
    els.push(rect(64, y, w - 84, 54, P.surface, { r: 8 }));
    els.push(circle(w - 28, y + 10, 5, sc[b.status]));
    els.push(text(72, y + 14, 'SC.' + b.num, 9, P.textDim, { tracking: 1 }));
    els.push(text(72, y + 28, b.title, 12, P.text, { weight: 600 }));
    els.push(text(72, y + 43, b.desc, 10, P.textDim));
  });

  els.push(...navBar(2));
  return { id: 'timeline', width: w, height: h, elements: els };
}

// SCREEN 4: Lore Compendium
function screenLore() {
  const els = [rect(0, 0, w, h, P.bg), ...statusBar()];

  els.push(text(20, 60, 'LORE COMPENDIUM', 10, P.gold, { weight: 700, tracking: 2 }));
  els.push(text(20, 82, 'World Entries', 22, P.text, { weight: 700 }));

  const cats = [
    { icon: '⬡', label: 'Locations', count: 12, color: P.accent },
    { icon: '⚑', label: 'Factions',  count: 7,  color: P.gold },
    { icon: '◎', label: 'Artifacts', count: 9,  color: P.warn },
    { icon: '✦', label: 'Events',    count: 15, color: P.success },
  ];
  cats.forEach((cat, i) => {
    const x = 20 + i * 88;
    const isActive = i === 0;
    els.push(rect(x, 106, 80, 56, isActive ? P.surface2 : P.surface, { r: 10 }));
    if (isActive) els.push(rect(x, 106, 80, 3, cat.color, { r: 2 }));
    els.push(text(x + 40, 126, cat.icon, 18, cat.color, { align: 'center' }));
    els.push(text(x + 40, 142, cat.label, 10, isActive ? P.text : P.textDim, { align: 'center', weight: isActive ? 600 : 400 }));
    els.push(text(x + 40, 155, String(cat.count), 9, cat.color, { align: 'center', weight: 700 }));
  });

  const locs = [
    { name: 'Stonehavre Fortress', type: 'FORTIFICATION', desc: "The Pale King's seat. Built upon old-world bones.", tags: ['Calder Voss', 'Pale War', 'Act II'], color: P.danger, imp: 'CRITICAL' },
    { name: 'The Ashen Crossing',  type: 'WILDERNESS',    desc: 'Treacherous pass. Only the desperate attempt it.', tags: ['Lyra', 'Maren Sol', 'Scene 14'], color: P.accent, imp: 'MAJOR' },
    { name: 'Library of Immured Voices', type: 'INSTITUTION', desc: "Forbidden archive. The Archivist's sealed domain.", tags: ['Archivist', 'Scene 05', 'The Seal'], color: P.gold, imp: 'MAJOR' },
    { name: 'Ashveil Keep (Ruined)', type: 'ORIGIN', desc: "Lyra's birthplace. Now ash and echo. Opening/closing.", tags: ['Lyra', 'Act I', 'Final Image'], color: P.textDim, imp: 'SYMBOLIC' },
  ];

  locs.forEach((loc, i) => {
    const y = 174 + i * 138;
    els.push(rect(20, y, w - 40, 130, P.surface, { r: 12 }));
    els.push(rect(20, y, w - 40, 4, loc.color, { r: 2 }));
    const tw = loc.type.length * 6.2 + 14;
    els.push(pill(28, y + 10, tw, 18, loc.color + '22'));
    els.push(text(28 + tw / 2, y + 23, loc.type, 8, loc.color, { weight: 700, tracking: 1.5, align: 'center' }));
    els.push(pill(w - 28 - 62, y + 10, 64, 18, 'transparent', { stroke: loc.color, strokeWidth: 1 }));
    els.push(text(w - 28 - 62 + 32, y + 23, loc.imp, 7, loc.color, { weight: 700, tracking: 1, align: 'center' }));
    els.push(text(28, y + 38, loc.name, 14, P.text, { weight: 700 }));
    els.push(text(28, y + 56, loc.desc, 11, P.textDim));
    els.push(text(28, y + 78, 'CONNECTED TO', 9, P.textDim, { tracking: 1.5 }));
    let cx = 28;
    loc.tags.forEach(tag => {
      const cw = tag.length * 6.2 + 14;
      els.push(pill(cx, y + 92, cw, 18, P.surface2));
      els.push(text(cx + cw / 2, y + 105, tag, 9, P.textDim, { align: 'center' }));
      cx += cw + 6;
    });
  });

  els.push(...navBar(3));
  return { id: 'lore', width: w, height: h, elements: els };
}

// SCREEN 5: Plot Threads
function screenThreads() {
  const els = [rect(0, 0, w, h, P.bg), ...statusBar()];

  els.push(text(20, 60, 'PLOT THREADS', 10, P.gold, { weight: 700, tracking: 2 }));
  els.push(text(20, 82, 'Active Storylines', 22, P.text, { weight: 700 }));

  // Summary
  els.push(rect(20, 112, w - 40, 52, P.surface, { r: 10 }));
  [['ACTIVE','6',P.accent],['STALLED','2',P.warn],['RESOLVED','3',P.success],['PLANTED','4',P.gold]].forEach(([label,val,color], i) => {
    const x = 20 + (i * ((w-40)/4)) + ((w-40)/8);
    els.push(text(x, 132, val, 18, color, { weight: 700, align: 'center' }));
    els.push(text(x, 150, label, 8, P.textDim, { tracking: 1.5, align: 'center' }));
    if (i < 3) els.push(rect(20 + ((i+1)*((w-40)/4)), 120, 1, 36, P.border));
  });

  const threads = [
    { name: 'The Pale Inheritance',   status: 'ACTIVE',   pct: 60, chars: ['Lyra','Calder'],     scenes: 23, color: P.danger, priority: 'CRITICAL',  desc: 'Who has claim to the Pale Throne — and at what cost?' },
    { name: "The Archivist's Game",   status: 'ACTIVE',   pct: 40, chars: ['Archivist','Maren'],  scenes: 12, color: P.accent, priority: 'MAJOR',     desc: "What is the Archivist's real allegiance? Do not resolve before Act III." },
    { name: "Maren's Betrayal",       status: 'PLANTED',  pct: 25, chars: ['Maren','Lyra'],       scenes: 8,  color: P.gold,  priority: 'MAJOR',     desc: 'Clues seeded from Scene 03. Payoff: Act II-B. Must feel inevitable.' },
    { name: 'The Second Seal',        status: 'STALLED',  pct: 10, chars: ['Archivist'],          scenes: 4,  color: P.warn,  priority: 'MINOR',     desc: 'Introduced Scene 07. Needs a resolution path — currently unlinked.' },
    { name: "Lyra's True Name",       status: 'ACTIVE',   pct: 72, chars: ['Lyra','Calder','Maren'], scenes: 31, color: P.success, priority: 'SYMBOLIC', desc: 'Names given vs names earned. Runs the full story length.' },
  ];

  const statusColors = { ACTIVE: P.accent, PLANTED: P.gold, STALLED: P.warn, RESOLVED: P.success };

  threads.forEach((t, i) => {
    const y = 178 + i * 118;
    const barW = w - 40 - 36;
    els.push(rect(20, y, w - 40, 110, P.surface, { r: 12 }));
    els.push(rect(20, y, 4, 110, t.color, { r: 2 }));
    const sc2 = statusColors[t.status] || P.textDim;
    els.push(circle(w - 30, y + 18, 5, sc2));
    els.push(text(w - 40, y + 22, t.status, 9, sc2, { weight: 700, tracking: 1, align: 'right' }));
    els.push(text(32, y + 18, t.name, 13, P.text, { weight: 700 }));
    els.push(text(32, y + 34, t.desc.slice(0, 62) + (t.desc.length > 62 ? '…' : ''), 11, P.textDim));
    let chx = 32;
    t.chars.forEach(ch => {
      const cw = ch.length * 6.5 + 14;
      els.push(pill(chx, y + 54, cw, 18, t.color + '22'));
      els.push(text(chx + cw / 2, y + 67, ch, 9, t.color, { align: 'center' }));
      chx += cw + 6;
    });
    els.push(text(w - 28, y + 67, t.scenes + ' scenes', 9, P.textDim, { align: 'right' }));
    els.push(rect(32, y + 82, barW, 4, P.border, { r: 2 }));
    els.push(rect(32, y + 82, Math.max(6, barW * t.pct / 100), 4, t.color, { r: 2 }));
    els.push(text(32, y + 96, 'WOVEN ' + t.pct + '%', 9, P.textDim, { tracking: 1 }));
    els.push(text(w - 28, y + 96, t.priority, 9, t.color, { weight: 700, tracking: 1, align: 'right' }));
  });

  els.push(...navBar(4));
  return { id: 'threads', width: w, height: h, elements: els };
}

// Build pen
const pen = {
  version: '2.8',
  name: 'LORE — Story Intelligence Workspace',
  description: "A dark cinematic story intelligence platform for screenwriters and narrative designers. Inspired by Obsidian's knowledge graph patterns (darkmodedesign.com) + Atlas Card's luxury editorial dark aesthetic (godly.website).",
  theme: 'dark',
  slug: 'lore',
  createdAt: new Date().toISOString(),
  screens: [
    screenUniverse(),
    screenCharacters(),
    screenTimeline(),
    screenLore(),
    screenThreads(),
  ],
  palette: {
    bg: P.bg, surface: P.surface, text: P.text,
    accent: P.accent, accent2: P.gold, muted: 'rgba(234,230,220,0.38)',
  },
};

fs.writeFileSync('/workspace/group/design-studio/lore.pen', JSON.stringify(pen, null, 2));
console.log('✓ lore.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(' ', s.id, '—', s.elements.length, 'elements'));
