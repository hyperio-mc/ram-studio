/**
 * WEFT — Async Writing Studio for Distributed Teams
 * Light theme: warm paper white + violet + amber/terracotta
 * Inspired by:
 *   - godly.website: Reflect (editorial note-taking UI), Amie (calendar with
 *     display typography), Stripe Sessions (clean product surfaces)
 *   - awwwards.com: "The Lookback" retrospective design, "Unseen Studio 2025
 *     Wrapped" — editorial large-type meets structured data architecture
 *   Trend: "editorial information architecture" — magazine-scale display type
 *   contrasted with dense structured lists; warm paper tones replacing cold whites.
 * RAM Design Heartbeat — 2026-03-28
 */

const fs = require('fs');

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#FAF8F4',   // warm paper
  bg2:      '#F4F1EB',   // slightly darker warm
  surface:  '#FFFFFF',
  surface2: '#F8F6F1',
  border:   'rgba(124,92,191,0.14)',
  border2:  'rgba(24,23,26,0.08)',
  accent:   '#7C5CBF',   // warm violet
  accent2:  '#E07D2D',   // amber/terracotta
  acc10:    'rgba(124,92,191,0.10)',
  acc20:    'rgba(124,92,191,0.20)',
  amb10:    'rgba(224,125,45,0.10)',
  amb20:    'rgba(224,125,45,0.20)',
  success:  '#2D9E6B',
  text:     '#18171A',
  textDim:  '#6B6770',
  textFaint:'rgba(24,23,26,0.32)',
  white:    '#FFFFFF',
  ink:      '#18171A',
};

let eid = 0;
const id = () => `e${++eid}`;

function r(x, y, w, h, fill, opts = {}) {
  return { id: id(), type: 'rect', x, y, w, h, fill, ...opts };
}
function t(x, y, str, size, weight, fill, opts = {}) {
  return { id: id(), type: 'text', x, y, text: str, fontSize: size, fontWeight: weight, fill, ...opts };
}
function card(x, y, w, h, opts = {}) {
  return r(x, y, w, h, opts.fill || C.surface, {
    rx: opts.rx || 16,
    stroke: opts.stroke || C.border2,
    strokeWidth: 1,
    ...opts,
  });
}
function pill(x, y, w, h, bg, label, fg, fs = 11) {
  return [
    r(x, y, w, h, bg, { rx: h / 2 }),
    t(x + w/2, y + h/2 + 4, label, fs, '600', fg, { textAlign: 'center' }),
  ];
}
function div(y, opacity = 0.06) {
  return r(20, y, 350, 1, `rgba(24,23,26,${opacity})`);
}
function bar(x, y, w, h, pct, track, fill) {
  return [
    r(x, y, w, h, track, { rx: h/2 }),
    r(x, y, Math.max(Math.round(w * pct), 3), h, fill, { rx: h/2 }),
  ];
}

function statusBar() {
  return [
    t(20, 18, '9:41', 15, '600', C.textDim),
    t(370, 18, '● ▲ ▮▮▮', 11, '400', C.textDim, { textAlign: 'right' }),
  ];
}

function navBar(active) {
  const items = [
    { icon: '✍', label: 'Studio' },
    { icon: '⊕', label: 'Capture' },
    { icon: '⌘', label: 'Threads' },
    { icon: '◈', label: 'Insights' },
    { icon: '◎', label: 'Archive' },
  ];
  const els = [];
  els.push(r(0, 784, 390, 60, C.surface, { stroke: C.border2, strokeWidth: 1 }));
  els.push(r(160, 836, 70, 4, 'rgba(24,23,26,0.14)', { rx: 2 }));
  items.forEach((item, i) => {
    const cx = 39 + i * 78;
    const on = i === active;
    const fg = on ? C.accent : C.textFaint;
    if (on) {
      els.push(r(cx - 22, 788, 44, 36, C.acc10, { rx: 10 }));
      els.push(r(cx - 14, 787, 28, 2, C.accent, { rx: 1 }));
    }
    els.push(t(cx, 807, item.icon, 18, '400', fg, { textAlign: 'center' }));
    els.push(t(cx, 824, item.label, 9, on ? '700' : '500', fg, { textAlign: 'center' }));
  });
  return els;
}

// ─── Screen 1: Studio ────────────────────────────────────────────────────────
function s1() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  // Subtle texture strip
  els.push(r(0, 0, 390, 160, C.bg2));
  els.push(...statusBar());

  // App wordmark
  els.push(t(20, 52, 'WEFT', 11, '800', C.accent));
  // Large editorial header
  els.push(t(20, 72, 'Good morning,', 28, '300', C.textDim));
  els.push(t(20, 102, 'Mara.', 36, '800', C.text));

  // Date sub
  els.push(t(20, 144, 'Saturday, 28 March', 13, '400', C.textDim));
  // Writing streak pill
  els.push(...pill(236, 134, 118, 24, C.acc10, '🔥 14-day streak', C.accent, 10));

  // Weekly progress card
  els.push(card(16, 168, 358, 94, { rx: 20 }));
  els.push(r(16, 168, 3, 94, C.accent, { rx: 1 }));
  els.push(t(34, 188, 'WORDS THIS WEEK', 9, '700', C.accent));
  els.push(t(34, 216, '3,840', 36, '800', C.text));
  els.push(t(108, 214, '/ 5,000', 14, '500', C.textDim));
  // mini word bar
  const days = ['M','T','W','T','F','S'];
  const vals = [0.7, 0.85, 0.4, 0.92, 0.6, 0.3];
  days.forEach((d, i) => {
    const bx = 226 + i * 24;
    const bh = Math.round(38 * vals[i]);
    const by = 222 - bh;
    const active = i === 5;
    els.push(r(bx, by, 12, bh, active ? C.accent : 'rgba(124,92,191,0.25)', { rx: 3 }));
    els.push(t(bx + 6, 234, d, 9, '500', C.textFaint, { textAlign: 'center' }));
  });

  // Progress bar
  els.push(t(34, 253, '76% of weekly goal', 11, '500', C.textDim));
  els.push(...bar(34, 248, 170, 4, 0.76, 'rgba(124,92,191,0.12)', C.accent));

  // Recent threads header
  els.push(t(20, 278, 'Recent Threads', 14, '700', C.text));
  els.push(t(340, 278, 'See all', 12, '500', C.accent, { textAlign: 'right' }));

  // Thread entries
  const threads = [
    { title: 'Q2 Product Strategy', tag: 'Strategy', words: '820 words', updated: '2h ago', color: C.accent },
    { title: 'Team retrospective — Feb', tag: 'Retro', words: '540 words', updated: 'Yesterday', color: C.accent2 },
    { title: 'Interview synthesis: UX research', tag: 'Research', words: '1,240 words', updated: '3d ago', color: C.success },
    { title: 'Personal OKRs draft', tag: 'Personal', words: '310 words', updated: '5d ago', color: C.textDim },
  ];

  threads.forEach((th, i) => {
    const ty = 296 + i * 76;
    els.push(card(16, ty, 358, 68, { rx: 14 }));
    els.push(r(16, ty, 3, 68, th.color, { rx: 1 }));
    els.push(t(34, ty + 18, th.title, 14, '600', C.text));
    els.push(...pill(34, ty + 36, 70, 20, `${th.color === C.accent ? C.acc10 : 'rgba(224,125,45,0.10)'}`, th.tag, th.color === C.accent ? C.accent : C.accent2, 10));
    els.push(t(34 + 76, ty + 45, th.words, 11, '400', C.textDim));
    els.push(t(354, ty + 45, th.updated, 11, '400', C.textFaint, { textAlign: 'right' }));
  });

  els.push(...navBar(0));
  return els;
}

// ─── Screen 2: Capture ───────────────────────────────────────────────────────
function s2() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(r(0, 0, 390, 200, C.bg2));
  els.push(...statusBar());

  els.push(t(20, 52, 'WEFT', 11, '800', C.accent));
  els.push(t(20, 72, 'Quick', 34, '300', C.textDim));
  els.push(t(20, 108, 'Capture', 34, '800', C.text));
  els.push(t(20, 150, 'What\'s on your mind?', 14, '400', C.textDim));

  // Compose area
  els.push(card(16, 168, 358, 200, { rx: 20, stroke: C.border }));
  els.push(r(16, 168, 358, 200, 'rgba(124,92,191,0.03)', { rx: 20 }));
  // cursor blink indicator
  els.push(t(34, 192, 'The Q2 strategy needs a clearer', 15, '400', C.text));
  els.push(t(34, 212, 'north star. Right now the team is', 15, '400', C.text));
  els.push(t(34, 232, 'pulling in three directions — we', 15, '400', C.text));
  els.push(t(34, 252, 'need to crystallise the primary', 15, '400', C.text));
  els.push(t(34, 272, 'bet before the offsite...', 15, '400', C.text));
  els.push(r(34 + 168, 268, 2, 18, C.accent, {})); // cursor
  // Word count
  els.push(t(354, 356, '47 words', 11, '500', C.textDim, { textAlign: 'right' }));

  // Thread selector
  els.push(t(20, 384, 'Add to thread', 12, '700', C.textDim));
  const threadOpts = ['Q2 Product Strategy', 'New thread +'];
  threadOpts.forEach((opt, i) => {
    const isActive = i === 0;
    els.push(r(20 + i * 196, 400, 172, 36, isActive ? C.acc10 : C.surface, { rx: 18, stroke: isActive ? C.accent : C.border2, strokeWidth: 1 }));
    els.push(t(106 + i * 196, 421, opt, 12, isActive ? '700' : '500', isActive ? C.accent : C.textDim, { textAlign: 'center' }));
  });

  // AI suggestions
  els.push(t(20, 456, 'AI · Connected ideas', 11, '700', C.accent));
  const suggestions = [
    { icon: '⟳', text: 'Relates to: "Team Vision" thread (3 matches)', color: C.acc10 },
    { icon: '◈', text: 'Insight: this theme appears in 4 recent entries', color: C.amb10 },
    { icon: '⊕', text: 'Suggest: add to "Q2 Alignment" cluster', color: C.acc10 },
  ];
  suggestions.forEach((s, i) => {
    const sy = 472 + i * 44;
    els.push(card(16, sy, 358, 36, { rx: 12, fill: s.color, stroke: 'transparent' }));
    els.push(t(38, sy + 18, s.icon, 13, '700', C.accent));
    els.push(t(56, sy + 18, s.text, 12, '400', C.text));
  });

  // Suggested tags
  els.push(t(20, 612, 'Suggested tags', 12, '700', C.textDim));
  const tags = ['Strategy', 'Alignment', 'Leadership', 'Q2'];
  let tx2 = 20;
  tags.forEach(tag => {
    const tw = tag.length * 7 + 24;
    els.push(r(tx2, 628, tw, 28, C.acc10, { rx: 14 }));
    els.push(t(tx2 + tw / 2, 644, tag, 11, '600', C.accent, { textAlign: 'center' }));
    tx2 += tw + 10;
  });

  // Post button
  els.push(r(16, 668, 358, 50, C.accent, { rx: 25 }));
  els.push(t(195, 698, 'Weave into thread  ↗', 14, '700', C.white, { textAlign: 'center' }));

  els.push(...navBar(1));
  return els;
}

// ─── Screen 3: Threads ───────────────────────────────────────────────────────
function s3() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(r(0, 0, 390, 130, C.bg2));
  els.push(...statusBar());

  els.push(t(20, 52, 'WEFT', 11, '800', C.accent));
  els.push(t(20, 72, 'Threads', 32, '800', C.text));
  els.push(t(20, 112, '12 active threads', 13, '400', C.textDim));
  // Search
  els.push(card(16, 130, 358, 38, { rx: 19, fill: C.surface }));
  els.push(t(44, 152, '⌕  Search threads…', 13, '400', C.textFaint));

  // Filter pills
  const filters = ['All', 'Work', 'Personal', 'Research'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 8 + 24;
    const isActive = i === 0;
    els.push(r(fx, 180, fw, 28, isActive ? C.accent : C.surface, { rx: 14, stroke: isActive ? 'transparent' : C.border2, strokeWidth: 1 }));
    els.push(t(fx + fw/2, 196, f, 12, isActive ? '700' : '500', isActive ? C.white : C.textDim, { textAlign: 'center' }));
    fx += fw + 10;
  });

  // Thread cards (more detailed)
  const threads = [
    { title: 'Q2 Product Strategy', tag: 'Work', entries: 8, words: '3,820', progress: 0.76, days: 12, color: C.accent },
    { title: 'Team Retro — Feb Sprint', tag: 'Work', entries: 5, words: '1,540', progress: 0.52, days: 6, color: C.accent2 },
    { title: 'UX Research Synthesis', tag: 'Research', entries: 14, words: '7,200', progress: 0.91, days: 21, color: '#2D9E6B' },
    { title: 'Personal OKRs 2026', tag: 'Personal', entries: 3, words: '940', progress: 0.28, days: 4, color: C.textDim },
  ];

  threads.forEach((th, i) => {
    const ty = 220 + i * 128;
    els.push(card(16, ty, 358, 116, { rx: 16 }));
    els.push(r(16, ty, 3, 116, th.color, { rx: 1 }));
    // title
    els.push(t(34, ty + 20, th.title, 15, '700', C.text));
    // meta row
    els.push(...pill(34, ty + 36, 50, 18, `rgba(24,23,26,0.06)`, th.tag, C.textDim, 10));
    els.push(t(94, ty + 44, `${th.entries} entries · ${th.words} words · ${th.days} days`, 11, '400', C.textDim));
    // progress bar
    els.push(t(34, ty + 66, 'Progress', 10, '700', C.textDim));
    els.push(...bar(100, ty + 62, 216, 6, th.progress, 'rgba(24,23,26,0.07)', th.color === C.accent ? C.accent : th.color));
    els.push(t(324, ty + 66, `${Math.round(th.progress*100)}%`, 10, '700', C.textDim));
    // last entry line
    els.push(div(ty + 80));
    els.push(t(34, ty + 94, 'Continue writing...', 11, '500', th.color));
    els.push(t(354, ty + 94, '→', 13, '700', th.color === C.accent ? C.accent : th.color, { textAlign: 'right' }));
  });

  els.push(...navBar(2));
  return els;
}

// ─── Screen 4: Insights ──────────────────────────────────────────────────────
function s4() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(r(0, 0, 390, 140, '#EEE8FF')); // soft violet tint
  els.push(...statusBar());

  els.push(t(20, 52, 'WEFT', 11, '800', C.accent));
  els.push(t(20, 72, 'Weekly', 32, '300', C.accent));
  els.push(t(20, 106, 'Insights', 32, '800', C.text));
  els.push(t(20, 146, 'AI digest · Week of 24 March', 12, '500', C.textDim));

  // Big stat row
  els.push(card(16, 164, 170, 80, { rx: 16 }));
  els.push(t(102, 192, '3,840', 28, '800', C.text, { textAlign: 'center' }));
  els.push(t(102, 216, 'words written', 11, '500', C.textDim, { textAlign: 'center' }));

  els.push(card(204, 164, 170, 80, { rx: 16 }));
  els.push(t(289, 192, '7', 28, '800', C.accent2, { textAlign: 'center' }));
  els.push(t(289, 216, 'sessions', 11, '500', C.textDim, { textAlign: 'center' }));

  // Themes this week
  els.push(t(20, 260, 'Recurring themes', 13, '700', C.text));
  const themes = [
    { label: 'Alignment', pct: 0.84, count: '9 refs' },
    { label: 'Strategy', pct: 0.68, count: '7 refs' },
    { label: 'Prioritisation', pct: 0.52, count: '5 refs' },
    { label: 'Team health', pct: 0.32, count: '3 refs' },
  ];
  themes.forEach((th, i) => {
    const ty = 278 + i * 38;
    els.push(t(20, ty + 14, th.label, 12, '600', C.text));
    els.push(...bar(120, ty + 9, 194, 8, th.pct, 'rgba(124,92,191,0.1)', C.accent));
    els.push(t(324, ty + 14, th.count, 11, '500', C.textDim, { textAlign: 'right' }));
  });

  els.push(div(436));

  // AI surface
  els.push(card(16, 444, 358, 116, { rx: 18, fill: 'rgba(124,92,191,0.05)', stroke: C.border }));
  els.push(t(34, 464, '◈  AI SYNTHESIS', 9, '800', C.accent));
  els.push(t(34, 480, '"You consistently circle back to alignment', 13, '400', C.text));
  els.push(t(34, 496, 'and prioritisation. The thread "Q2 Strategy"', 13, '400', C.text));
  els.push(t(34, 512, 'is your most active — consider a structured', 13, '400', C.text));
  els.push(t(34, 528, 'distillation session this week."', 13, '400', C.text));
  els.push(r(34, 548, 100, 1, C.border));
  els.push(t(34, 558, '→ Run Distillation', 12, '600', C.accent));

  // Connected threads
  els.push(t(20, 576, 'Connections found', 13, '700', C.text));
  const conns = [
    { a: 'Q2 Strategy', b: 'Team Retro', strength: 0.88 },
    { a: 'Personal OKRs', b: 'Q2 Strategy', strength: 0.62 },
  ];
  conns.forEach((c, i) => {
    const cy = 594 + i * 52;
    els.push(card(16, cy, 358, 44, { rx: 12 }));
    els.push(t(34, cy + 22, c.a, 12, '600', C.text));
    els.push(t(195, cy + 22, '⟷', 14, '400', C.accent, { textAlign: 'center' }));
    els.push(t(220, cy + 22, c.b, 12, '600', C.text));
    els.push(t(354, cy + 22, `${Math.round(c.strength * 100)}%`, 11, '700', C.accent2, { textAlign: 'right' }));
  });

  els.push(...navBar(3));
  return els;
}

// ─── Screen 5: Archive ───────────────────────────────────────────────────────
function s5() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(r(0, 0, 390, 130, C.bg2));
  els.push(...statusBar());

  els.push(t(20, 52, 'WEFT', 11, '800', C.accent));
  els.push(t(20, 72, 'Archive', 32, '800', C.text));
  els.push(t(20, 112, '284 entries across 14 months', 13, '400', C.textDim));

  // Search
  els.push(card(16, 128, 284, 38, { rx: 19 }));
  els.push(t(44, 150, '⌕  Search entries…', 13, '400', C.textFaint));
  els.push(...pill(308, 128, 66, 38, C.accent, '⊞ Filter', C.white, 12));

  // Month group: March
  els.push(t(20, 184, 'March 2026', 12, '700', C.accent));
  els.push(t(354, 184, '14 entries', 11, '500', C.textDim, { textAlign: 'right' }));

  const entries = [
    { date: 'Today', title: 'Q2 north star — thinking out loud', words: '47w', tag: 'Strategy' },
    { date: 'Mar 27', title: 'Retro debrief — what we learned', words: '312w', tag: 'Retro' },
    { date: 'Mar 26', title: 'User interview #6 synthesis notes', words: '620w', tag: 'Research' },
    { date: 'Mar 25', title: 'Morning pages — clarity on team structure', words: '210w', tag: 'Personal' },
    { date: 'Mar 24', title: 'Engineering capacity vs ambition', words: '380w', tag: 'Strategy' },
  ];

  entries.forEach((e, i) => {
    const ey = 200 + i * 64;
    els.push(div(ey));
    els.push(t(20, ey + 20, e.date, 11, '500', C.textDim));
    els.push(t(82, ey + 20, e.title, 13, '600', C.text));
    els.push(t(82, ey + 36, `${e.words} · ${e.tag}`, 11, '400', C.textDim));
    els.push(t(354, ey + 28, '›', 16, '300', C.textFaint, { textAlign: 'right' }));
  });

  // February group
  els.push(t(20, 532, 'February 2026', 12, '700', C.textDim));
  els.push(t(354, 532, '31 entries', 11, '500', C.textFaint, { textAlign: 'right' }));

  const febEntries = [
    { date: 'Feb 28', title: 'End of month — what moved forward?', words: '480w', tag: 'Retro' },
    { date: 'Feb 26', title: 'Hiring matrix for Q2 roles', words: '290w', tag: 'Strategy' },
    { date: 'Feb 22', title: 'Design system principles draft', words: '540w', tag: 'Design' },
  ];

  febEntries.forEach((e, i) => {
    const ey = 548 + i * 64;
    els.push(div(ey));
    els.push(t(20, ey + 20, e.date, 11, '500', C.textFaint));
    els.push(t(82, ey + 20, e.title, 13, '400', C.textDim));
    els.push(t(82, ey + 36, `${e.words} · ${e.tag}`, 11, '400', C.textFaint));
    els.push(t(354, ey + 28, '›', 16, '300', C.textFaint, { textAlign: 'right' }));
  });

  els.push(...navBar(4));
  return els;
}

// ─── Build .pen file ─────────────────────────────────────────────────────────
const penData = {
  version: '2.8',
  meta: {
    name: 'WEFT — Async Writing Studio',
    description: 'Editorial light-theme writing & knowledge distillation tool for distributed teams',
    createdAt: new Date().toISOString(),
  },
  screens: [
    { id: 's1', name: 'Studio',   width: 390, height: 844, elements: s1() },
    { id: 's2', name: 'Capture',  width: 390, height: 844, elements: s2() },
    { id: 's3', name: 'Threads',  width: 390, height: 844, elements: s3() },
    { id: 's4', name: 'Insights', width: 390, height: 844, elements: s4() },
    { id: 's5', name: 'Archive',  width: 390, height: 844, elements: s5() },
  ],
};

fs.writeFileSync('weft.pen', JSON.stringify(penData, null, 2));
console.log('✓ weft.pen written');
console.log(`  Screens: ${penData.screens.length}`);
penData.screens.forEach(sc => {
  console.log(`  ${sc.name}: ${sc.elements.length} elements`);
});
