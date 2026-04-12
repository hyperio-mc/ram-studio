'use strict';
const fs = require('fs'), path = require('path');

// ─── PAUSE: Daily Reflection & Journaling ─────────────────────────────────
// Heartbeat #469 — Light theme
// Inspired by:
//   · Dribbble "calm UI" signal: wellness going quiet — no streaks, no rings,
//     no gamification. Warm sand neutrals + desaturated sage. Anti-anxiety design.
//   · Land-book / Muzli: Instrument Serif entering personal-growth apps as
//     "editorial with rigor" — serif prompt, sans body, creates warmth + precision
//   · Mobbin: Onboarding as the flagship design artifact in wellness apps —
//     one question per screen, most typographically invested part of the product
//   · Lapa Ninja: Anti-purple revolt — Pantone Cloud Dancer off-white bases,
//     warm sage green > neon green for wellness accent
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'pause';
const W = 390, H = 844;

// ─── PALETTE — Cloud Dancer base, warm sage ───────────────────────────────
const BG      = '#F8F6F1';   // Cloud Dancer — warm off-white, not cold white
const SURF    = '#FFFFFF';
const CARD    = '#F0EDE5';   // parchment card
const BORDER  = '#E0DAD0';
const TEXT    = '#1E1C18';   // warm near-black (not cold #000)
const TEXT2   = '#7A7567';   // warm mid-grey
const MUTED   = '#B5AFA3';
const SAGE    = '#5A8A6E';   // desaturated sage green (calm, not electric)
const SAGE_L  = '#E8F0EB';   // sage tint
const SAGE_M  = '#2E5A3D';   // deep sage for emphasis
const BLUSH   = '#C4876A';   // warm blush accent (alternative to sage)
const BLUSH_L = '#F5EAE3';   // blush tint
const SERIF   = 'Georgia,Lora,serif';   // editorial serif for prompts
const SANS    = 'Inter,sans-serif';

const NAV_Y = H - 72;

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill, ...opts };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content: String(content), size, fill, ...opts };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill, ...opts };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, ...opts };
}

// ────────────────────────────────────────────────
// SCREEN 1: TODAY — The daily prompt
// ────────────────────────────────────────────────
function buildToday() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Subtle texture — horizontal grain lines at low opacity
  for (let y = 0; y < H; y += 14) {
    s.push(line(0, y, W, y, 'rgba(30,28,24,0.03)', { sw: 1 }));
  }

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT2, { anchor: 'end' }));

  // Date — quiet, minimal
  s.push(text(W / 2, 68, 'Saturday, April 12', 13, TEXT2, { anchor: 'middle', fw: 400 }));
  s.push(text(W / 2, 88, '·', 14, MUTED, { anchor: 'middle' }));

  // App name — barely there
  s.push(text(W / 2, 108, 'PAUSE', 10, MUTED, { anchor: 'middle', fw: 600, ls: 4 }));

  // Decorative thin rule
  s.push(line(W/2 - 24, 120, W/2 + 24, 120, BORDER, { sw: 0.5 }));

  // THE PROMPT — this is the hero of the screen
  // Large serif, centered, generous line height
  const prompt = 'What are you\ncarrying today\nthat you could\nset down?';
  const promptLines = prompt.split('\n');
  promptLines.forEach((ln, i) => {
    s.push(text(W / 2, 174 + i * 42, ln, 30, TEXT, {
      anchor: 'middle', font: SERIF, fw: 400
    }));
  });

  // Tiny prompt count — not a streak, just a number
  s.push(text(W / 2, 358, 'Prompt 47 of this year', 11, MUTED, { anchor: 'middle' }));

  // Entry area — soft card
  s.push(rect(24, 386, W - 48, 200, SURF, { rx: 16 }));
  s.push(rect(24, 386, W - 48, 200, 'none', { rx: 16, stroke: BORDER, sw: 0.5 }));

  // Placeholder text (italic feel via smaller size + muted)
  s.push(text(44, 418, 'Begin writing…', 14, MUTED, { fw: 300 }));

  // Writing area lines (subtle)
  for (let li = 0; li < 5; li++) {
    s.push(line(44, 440 + li * 28, W - 44, 440 + li * 28, BORDER, { sw: 0.4 }));
  }

  // Cursor blink
  s.push(rect(44, 420, 1.5, 16, SAGE, { opacity: 0.7 }));

  // Word count
  s.push(text(44, 596, '0 words', 11, MUTED));
  s.push(text(W - 44, 596, 'Save', 13, SAGE, { anchor: 'end', fw: 600 }));

  // Mood selector row — no score, just a gentle check-in
  s.push(text(24, 610, 'How are you feeling?', 11, TEXT2, { fw: 500 }));
  const moods = ['😌', '🙂', '😐', '😔', '😤'];
  const moodLabels = ['calm', 'good', 'okay', 'low', 'heavy'];
  moods.forEach((m, i) => {
    const mx2 = 28 + i * 66;
    s.push(circle(mx2, 638, 20, i === 0 ? SAGE_L : CARD));
    s.push(text(mx2, 642, m, 16, TEXT, { anchor: 'middle' }));
    s.push(text(mx2, 662, moodLabels[i], 8, i === 0 ? SAGE : MUTED, { anchor: 'middle' }));
  });

  // Divider
  s.push(line(24, 678, W - 24, 678, BORDER, { sw: 0.4 }));

  // Action row
  const tools = [
    { x: 52,  icon: '🎙', label: 'Voice' },
    { x: 130, icon: '📷', label: 'Photo' },
    { x: 208, icon: '#',  label: 'Tag'   },
    { x: 286, icon: '⋯',  label: 'More'  },
  ];
  tools.forEach(t => {
    s.push(text(t.x, 706, t.icon, 18, TEXT2, { anchor: 'middle' }));
    s.push(text(t.x, 724, t.label, 9, MUTED, { anchor: 'middle' }));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const nav = [
    { l: 'Today', x: 52 }, { l: 'Journal', x: 130 }, { l: 'Reflect', x: 208 },
    { l: 'Prompts', x: 286 }, { l: 'You', x: 358 },
  ];
  nav.forEach((n, i) => {
    const active = i === 0;
    s.push(circle(n.x, NAV_Y + 20, 3, active ? SAGE : MUTED));
    s.push(text(n.x, NAV_Y + 48, n.l, 10, active ? SAGE : TEXT2, {
      anchor: 'middle', fw: active ? 600 : 400
    }));
    if (active) s.push(line(n.x - 14, NAV_Y + 56, n.x + 14, NAV_Y + 56, SAGE, { sw: 1.5 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 2: JOURNAL — Archive of past entries
// ────────────────────────────────────────────────
function buildJournal() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT2, { anchor: 'end' }));

  // Header
  s.push(text(20, 70, 'Journal', 32, TEXT, { fw: 700, font: SERIF }));
  s.push(text(20, 100, '47 entries this year', 13, TEXT2 ));

  // Quick stats row
  const jStats = [{ l: '47 entries', v: 'this year' }, { l: '142 avg', v: 'words' }, { l: '5 of 7', v: 'this week' }];
  jStats.forEach((js, i) => {
    const jsx = 20 + i * 118;
    s.push(text(jsx, 108, js.l, 14, TEXT, { fw: 700 }));
    s.push(text(jsx, 124, js.v, 10, TEXT2 ));
  });

  // Search bar
  s.push(rect(20, 138, W - 40, 36, CARD, { rx: 10 }));
  s.push(text(42, 160, 'Search entries…', 13, MUTED));
  s.push(circle(33, 156, 6, 'none', { stroke: MUTED, sw: 1.2 }));
  s.push(line(37, 161, 41, 165, MUTED, { sw: 1.2 }));

  // Month filter
  const months = ['Apr', 'Mar', 'Feb', 'Jan'];
  let mx = 20;
  months.forEach((m, i) => {
    const mw = m.length * 9 + 20;
    s.push(rect(mx, 180, mw, 26, i === 0 ? SAGE_L : CARD, { rx: 13 }));
    s.push(text(mx + mw / 2, 196, m, 12, i === 0 ? SAGE : TEXT2, {
      anchor: 'middle', fw: i === 0 ? 600 : 400
    }));
    mx += mw + 8;
  });

  // Entry list — no gamification, just dates and excerpts
  const entries = [
    {
      date: 'Friday, April 11',
      prompt: 'What brought you back to yourself today?',
      excerpt: 'The walk in the evening, fog still on the hills. I forgot for a while that I was worried.',
      mood: '·',
      words: 142,
    },
    {
      date: 'Thursday, April 10',
      prompt: 'What do you keep returning to?',
      excerpt: 'The same question keeps surfacing. Not with urgency anymore — more like an old friend.',
      mood: '·',
      words: 89,
    },
    {
      date: 'Wednesday, April 9',
      prompt: 'Describe the last moment of quiet you had.',
      excerpt: 'Before anyone woke up. Coffee, window, the specific grey of that particular morning.',
      mood: '·',
      words: 203,
    },
    {
      date: 'Tuesday, April 8',
      prompt: 'What are you learning to let go of?',
      excerpt: 'The need to have the answer before I begin. The grip on how things should have gone.',
      mood: '·',
      words: 167,
    },
    {
      date: 'Monday, April 7',
      prompt: 'Who are you becoming?',
      excerpt: 'Someone slower. More willing to sit with discomfort. I notice I interrupt less.',
      mood: '·',
      words: 95,
    },
  ];

  entries.forEach((e, i) => {
    const ey = 218 + i * 108;
    // Card
    s.push(rect(20, ey, W - 40, 98, SURF, { rx: 12 }));

    // Date
    s.push(text(36, ey + 20, e.date, 11, TEXT2, { fw: 500 }));
    s.push(text(W - 36, ey + 20, e.words + ' words', 10, MUTED, { anchor: 'end' }));

    // Prompt in serif (small, italic feel)
    s.push(text(36, ey + 40, '"' + e.prompt + '"', 11, TEXT2, { font: SERIF }));

    // Excerpt
    const excTrunc = e.excerpt.length > 68 ? e.excerpt.slice(0, 65) + '…' : e.excerpt;
    s.push(text(36, ey + 62, excTrunc, 13, TEXT, { fw: 400 }));

    // Bottom rule
    s.push(line(36, ey + 82, W - 36, ey + 82, BORDER, { sw: 0.3 }));
    s.push(text(36, ey + 92, '→', 11, MUTED));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const nav = [
    { l: 'Today', x: 52 }, { l: 'Journal', x: 130 }, { l: 'Reflect', x: 208 },
    { l: 'Prompts', x: 286 }, { l: 'You', x: 358 },
  ];
  nav.forEach((n, i) => {
    const active = i === 1;
    s.push(circle(n.x, NAV_Y + 20, 3, active ? SAGE : MUTED));
    s.push(text(n.x, NAV_Y + 48, n.l, 10, active ? SAGE : TEXT2, {
      anchor: 'middle', fw: active ? 600 : 400
    }));
    if (active) s.push(line(n.x - 14, NAV_Y + 56, n.x + 14, NAV_Y + 56, SAGE, { sw: 1.5 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 3: REFLECT — Weekly reading, no gamification
// ────────────────────────────────────────────────
function buildReflect() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT2, { anchor: 'end' }));

  // Header
  s.push(text(20, 70, 'Reflect', 32, TEXT, { fw: 700, font: SERIF }));
  s.push(text(20, 100, 'Week of April 7–12', 13, TEXT2 ));

  // Week rhythm — not a streak, a simple visual of which days had entries
  s.push(line(20, 118, W - 20, 118, BORDER, { sw: 0.4 }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const wrote = [true, true, true, true, true, false, false]; // honest, no guilt
  days.forEach((d, i) => {
    const dx = 36 + i * 48;
    s.push(circle(dx, 148, 14, wrote[i] ? SAGE_L : CARD));
    s.push(text(dx, 152, d, 12, wrote[i] ? SAGE : MUTED, { anchor: 'middle', fw: wrote[i] ? 600 : 400 }));
  });
  // No "streak count" — just "5 of 7 days" in neutral language
  s.push(text(20, 180, 'You wrote 5 of 7 days this week.', 13, TEXT2 ));

  s.push(line(20, 196, W - 20, 196, BORDER, { sw: 0.4 }));

  // This week's synthesis — editorial pull quote style
  s.push(text(20, 222, 'This week in your words', 11, TEXT2, { fw: 600, ls: 1 }));

  // Large serif pull quote
  const pullQuote = '"The need to have\nthe answer before\nI begin."';
  pullQuote.split('\n').forEach((ln, i) => {
    s.push(text(28, 258 + i * 38, ln, 22, TEXT, { font: SERIF, fw: 400 }));
  });
  s.push(line(20, 352, 4, 352, SAGE, { sw: 24, opacity: 0.4 })); // left accent bar
  s.push(text(28, 366, 'from Tuesday, April 8', 11, TEXT2, { fw: 400 }));

  s.push(line(20, 382, W - 20, 382, BORDER, { sw: 0.4 }));

  // Themes that surfaced this week (not tags, just observations)
  s.push(text(20, 402, 'Themes', 14, TEXT, { fw: 600, font: SERIF }));

  const themes = [
    { label: 'Letting go',      count: 3 },
    { label: 'Quiet moments',   count: 2 },
    { label: 'Becoming',        count: 2 },
    { label: 'Returning',       count: 1 },
  ];
  themes.forEach((t, i) => {
    const ty = 424 + i * 40;
    s.push(text(20, ty + 16, t.label, 14, TEXT));
    // Thin bar proportional to count
    const barW = (t.count / 5) * (W - 160);
    s.push(rect(W - barW - 60, ty + 8, barW, 16, SAGE_L, { rx: 8 }));
    s.push(text(W - 36, ty + 18, t.count + 'x', 11, TEXT2, { anchor: 'end' }));
    s.push(line(20, ty + 36, W - 20, ty + 36, BORDER, { sw: 0.3 }));
  });

  // Monthly overview link
  s.push(rect(20, 590, W - 40, 44, CARD, { rx: 10 }));
  s.push(text(36, 616, 'View April in full', 14, TEXT, { fw: 500 }));
  s.push(text(W - 36, 616, '→', 14, TEXT2, { anchor: 'end' }));

  // Most-used word this week — gentle, not clinical
  s.push(line(20, 648, W - 20, 648, BORDER, { sw: 0.4 }));
  s.push(text(20, 668, 'A word that kept returning', 13, TEXT, { fw: 600, font: SERIF }));
  s.push(text(W / 2, 710, '"quiet"', 38, TEXT, { anchor: 'middle', font: SERIF, fw: 700 }));
  s.push(text(W / 2, 740, 'appeared in 4 of your 5 entries this week', 11, MUTED, { anchor: 'middle' }));

  // Other recurring words — small, secondary
  const otherWords = ['still', 'perhaps', 'morning'];
  otherWords.forEach((w, i) => {
    s.push(text(80 + i * 115, 762, `"${w}"`, 13, MUTED, { anchor: 'middle', font: SERIF }));
  });
  s.push(text(W / 2, 776, '· · ·', 11, MUTED, { anchor: 'middle' }));

  // Year context — no numbers, just time
  s.push(text(W / 2, 784, 'Writing since January 2026', 12, MUTED, { anchor: 'middle' }));
  s.push(line(20, 796, W - 20, 796, BORDER, { sw: 0.3, opacity: 0.5 }));

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const nav = [
    { l: 'Today', x: 52 }, { l: 'Journal', x: 130 }, { l: 'Reflect', x: 208 },
    { l: 'Prompts', x: 286 }, { l: 'You', x: 358 },
  ];
  nav.forEach((n, i) => {
    const active = i === 2;
    s.push(circle(n.x, NAV_Y + 20, 3, active ? SAGE : MUTED));
    s.push(text(n.x, NAV_Y + 48, n.l, 10, active ? SAGE : TEXT2, {
      anchor: 'middle', fw: active ? 600 : 400
    }));
    if (active) s.push(line(n.x - 14, NAV_Y + 56, n.x + 14, NAV_Y + 56, SAGE, { sw: 1.5 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 4: PROMPTS — Explore & choose
// ────────────────────────────────────────────────
function buildPrompts() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT2, { anchor: 'end' }));

  // Header
  s.push(text(20, 70, 'Prompts', 32, TEXT, { fw: 700, font: SERIF }));
  s.push(text(20, 100, 'Questions worth sitting with', 13, TEXT2 ));

  // Saved prompts banner
  s.push(rect(20, 114, W - 40, 32, BLUSH_L, { rx: 8 }));
  s.push(text(36, 133, '3 prompts saved', 12, BLUSH, { fw: 600 }));
  s.push(text(W - 36, 133, 'View saved →', 11, BLUSH, { anchor: 'end' }));

  // Category filter
  const cats = ['All', 'Present', 'Past', 'Future', 'Others'];
  let cx2 = 20;
  cats.forEach((c, i) => {
    const cw = c.length * 9 + 18;
    s.push(rect(cx2, 114, cw, 26, i === 0 ? SAGE_L : CARD, { rx: 13 }));
    s.push(text(cx2 + cw / 2, 130, c, 11, i === 0 ? SAGE : TEXT2, {
      anchor: 'middle', fw: i === 0 ? 600 : 400
    }));
    cx2 += cw + 6;
  });

  // Mini month calendar strip — days with dots for entries written
  s.push(text(20, 154, 'April', 12, TEXT2, { fw: 600 }));
  s.push(text(W - 20, 154, '47 entries', 11, MUTED, { anchor: 'end' }));
  const calDays = [7,8,9,10,11,12];
  const calWrote = [true,true,true,true,true,false];
  calDays.forEach((d, i) => {
    const cdx = 24 + i * 58;
    s.push(text(cdx, 176, String(d), 11, calWrote[i] ? TEXT : MUTED, { anchor: 'middle', fw: calWrote[i] ? 600 : 400 }));
    if (calWrote[i]) s.push(circle(cdx, 186, 2.5, SAGE));
  });
  s.push(line(20, 196, W - 20, 196, BORDER, { sw: 0.4 }));

  // Prompt of the day — featured, large serif card
  s.push(rect(20, 208, W - 40, 120, SAGE_L, { rx: 16 }));
  s.push(rect(20, 152, W - 40, 120, 'none', { rx: 16, stroke: SAGE, sw: 0.5, opacity: 0.4 }));
  s.push(text(36, 236, 'TODAY\'S PROMPT', 9, SAGE, { fw: 700, ls: 2 }));
  s.push(text(36, 264, 'What are you carrying', 18, TEXT, { font: SERIF }));
  s.push(text(36, 286, 'today that you could', 18, TEXT, { font: SERIF }));
  s.push(text(36, 308, 'set down?', 18, TEXT, { font: SERIF }));
  s.push(text(W - 36, 322, 'Write now →', 12, SAGE, { anchor: 'end', fw: 600 }));

  // Prompt list
  s.push(line(20, 340, W - 20, 340, BORDER, { sw: 0.4 }));
  s.push(text(20, 362, 'Questions to explore', 14, TEXT, { fw: 600, font: SERIF }));
  s.push(text(W - 20, 362, '84 total', 11, MUTED, { anchor: 'end' }));

  const prompts = [
    { q: 'What brought you back to yourself today?', cat: 'Present' },
    { q: 'Describe the last moment of quiet you had.', cat: 'Present' },
    { q: 'Who are you becoming?', cat: 'Future' },
    { q: 'What do you keep returning to?', cat: 'Past' },
    { q: 'What have you forgiven yourself for recently?', cat: 'Past' },
    { q: 'What would you do with a completely empty afternoon?', cat: 'Future' },
    { q: 'What are you learning to let go of?', cat: 'Present' },
  ];

  prompts.forEach((p, i) => {
    const py = 380 + i * 60;
    s.push(rect(20, py, W - 40, 50, SURF, { rx: 10 }));
    const qT = p.q.length > 50 ? p.q.slice(0, 47) + '…' : p.q;
    s.push(text(36, py + 20, qT, 13, TEXT, { fw: 400, font: SERIF }));
    const catW = p.cat.length * 7.5 + 12;
    s.push(rect(36, py + 32, catW, 14, CARD, { rx: 7 }));
    s.push(text(36 + catW / 2, py + 41, p.cat, 8, TEXT2, { anchor: 'middle' }));
    s.push(text(W - 36, py + 28, '+', 16, MUTED, { anchor: 'end' }));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const nav = [
    { l: 'Today', x: 52 }, { l: 'Journal', x: 130 }, { l: 'Reflect', x: 208 },
    { l: 'Prompts', x: 286 }, { l: 'You', x: 358 },
  ];
  nav.forEach((n, i) => {
    const active = i === 3;
    s.push(circle(n.x, NAV_Y + 20, 3, active ? SAGE : MUTED));
    s.push(text(n.x, NAV_Y + 48, n.l, 10, active ? SAGE : TEXT2, {
      anchor: 'middle', fw: active ? 600 : 400
    }));
    if (active) s.push(line(n.x - 14, NAV_Y + 56, n.x + 14, NAV_Y + 56, SAGE, { sw: 1.5 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 5: ONBOARDING — Editorial, one question
// (Mobbin insight: onboarding = flagship craft moment)
// ────────────────────────────────────────────────
function buildOnboarding() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Very minimal — no status bar chrome, full bleed quiet
  s.push(rect(0, 0, W, H, BG));

  // Grain texture
  for (let y = 0; y < H; y += 14) {
    s.push(line(0, y, W, y, 'rgba(30,28,24,0.025)', { sw: 1 }));
  }

  // Step indicator — tiny dots, no numbers
  const steps = [0, 1, 2, 3];
  steps.forEach((_, i) => {
    s.push(circle(W/2 - 18 + i * 12, 80, i === 0 ? 4 : 3, i === 0 ? SAGE : MUTED));
  });

  // App logo — minimal
  s.push(text(W / 2, 130, 'PAUSE', 11, MUTED, { anchor: 'middle', fw: 600, ls: 5 }));

  // THE question — this is the entire screen
  // Large, centered, generous breathing room
  s.push(text(W / 2, 260, 'What would it mean', 28, TEXT, { anchor: 'middle', font: SERIF, fw: 400 }));
  s.push(text(W / 2, 298, 'to actually', 28, TEXT, { anchor: 'middle', font: SERIF, fw: 400 }));
  s.push(text(W / 2, 336, 'slow down?', 28, TEXT, { anchor: 'middle', font: SERIF, fw: 700 }));

  // Breathing room — thin line accent
  s.push(line(W/2 - 20, 368, W/2 + 20, 368, SAGE, { sw: 1, opacity: 0.6 }));

  // Subtext — not a sales pitch, a genuine statement
  s.push(text(W / 2, 410, 'PAUSE isn\'t about building habits.', 14, TEXT2, { anchor: 'middle' }));
  s.push(text(W / 2, 432, 'It\'s a daily invitation to reflect.', 14, TEXT2, { anchor: 'middle' }));
  s.push(text(W / 2, 454, 'Write when you feel like it.', 14, MUTED, { anchor: 'middle' }));

  // Feature chips — quiet commitments
  const chips = ['No streaks', 'No ads', 'No scores', 'Your words stay yours'];
  chips.forEach((c, i) => {
    const chx = i < 2 ? 36 + i * 140 : 36 + (i - 2) * 160;
    const chy = i < 2 ? 492 : 516;
    const cw = c.length * 6.8 + 18;
    s.push(rect(chx, chy - 12, cw, 20, CARD, { rx: 10 }));
    s.push(text(chx + cw/2, chy, c, 9, TEXT2, { anchor: 'middle' }));
  });

  // CTA — quiet, not urgent
  s.push(rect(40, 570, W - 80, 52, SAGE, { rx: 14 }));
  s.push(text(W / 2, 600, 'Begin', 16, SURF, { anchor: 'middle', fw: 600 }));

  // Secondary
  s.push(text(W / 2, 640, 'I already have an account', 13, TEXT2, { anchor: 'middle' }));

  // Fine print — honest
  s.push(text(W / 2, 700, 'No account needed to start writing.', 11, MUTED, { anchor: 'middle' }));
  s.push(text(W / 2, 718, 'Sync later if you want to.', 11, MUTED, { anchor: 'middle' }));

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 6: FULL ENTRY — Writing in full
// ────────────────────────────────────────────────
function buildEntry() {
  const s = [];
  s.push(rect(0, 0, W, H, SURF));

  // Minimal top bar (distraction-free writing)
  s.push(rect(0, 0, W, 44, SURF));
  s.push(text(20, 28, '← Journal', 13, TEXT2, { fw: 500 }));
  s.push(text(W - 20, 28, 'Done', 14, SAGE, { anchor: 'end', fw: 600 }));

  // Date + prompt context
  s.push(text(W / 2, 64, 'Friday, April 11', 12, TEXT2, { anchor: 'middle' }));
  s.push(line(20, 76, W - 20, 76, BORDER, { sw: 0.4 }));

  // Prompt reminder — small serif, quiet
  s.push(rect(20, 88, W - 40, 44, BG, { rx: 8 }));
  s.push(text(36, 114, '"What brought you back to yourself today?"', 11, TEXT2, { font: SERIF }));

  s.push(line(20, 142, W - 20, 142, BORDER, { sw: 0.3 }));

  // Writing area — clean, ruled, generous
  const entryLines = [
    { y: 174, txt: 'The walk in the evening, fog still on the hills.', size: 15, col: TEXT },
    { y: 202, txt: 'I forgot for a while that I was worried about', size: 15, col: TEXT },
    { y: 230, txt: 'anything. The light was doing something particular', size: 15, col: TEXT },
    { y: 258, txt: 'to the colour of the stone walls.', size: 15, col: TEXT },
    { y: 286, txt: '', size: 15, col: TEXT },
    { y: 314, txt: 'Ran into the neighbour with the old dog. We didn\'t', size: 15, col: TEXT },
    { y: 342, txt: 'say much. Just stood there for a moment, the dog', size: 15, col: TEXT },
    { y: 370, txt: 'accepting both our hands.', size: 15, col: TEXT },
    { y: 398, txt: '', size: 15, col: TEXT },
    { y: 426, txt: 'That was it. That was the thing.', size: 15, col: TEXT, serif: true },
  ];

  // Ruled lines
  for (let i = 0; i < 20; i++) {
    s.push(line(20, 166 + i * 28, W - 20, 166 + i * 28, 'rgba(224,218,208,0.5)', { sw: 0.4 }));
  }

  entryLines.forEach(l => {
    s.push(text(28, l.y, l.txt, l.size, l.col, { fw: l.serif ? 500 : 300, font: l.serif ? SERIF : SANS }));
  });

  // Cursor
  s.push(rect(28, 444, 1.5, 18, SAGE, { opacity: 0.7 }));

  // Word count bar — quiet
  s.push(rect(0, H - 88, W, 1, BORDER, { opacity: 0.6 }));
  s.push(text(28, H - 72, '142 words', 12, MUTED));
  s.push(text(W/2, H - 72, '·', 12, MUTED, { anchor: 'middle' }));
  s.push(text(W/2 + 20, H - 72, '5 min read', 12, MUTED));
  s.push(text(W - 28, H - 72, 'Apr 11', 12, MUTED, { anchor: 'end' }));
  s.push(line(0, H - 60, W, H - 60, BORDER, { sw: 0.4 }));

  // Writing toolbar — ultra minimal
  s.push(rect(0, H - 52, W, 52, SURF));
  s.push(line(0, H - 52, W, H - 52, BORDER, { sw: 0.4 }));
  const wTools = [
    { x: 40,  icon: 'B',  label: '' },
    { x: 80,  icon: 'I',  label: '' },
    { x: 120, icon: '"',  label: '' },
    { x: 160, icon: '—',  label: '' },
    { x: W - 40, icon: '🎙', label: '' },
  ];
  wTools.forEach(t => {
    s.push(text(t.x, H - 22, t.icon, 16, TEXT2, { anchor: 'middle', fw: t.icon === 'B' ? 700 : 400 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// ASSEMBLE
// ────────────────────────────────────────────────
const screens = [
  { name: 'Today',      elements: buildToday()      },
  { name: 'Journal',    elements: buildJournal()    },
  { name: 'Reflect',    elements: buildReflect()    },
  { name: 'Prompts',    elements: buildPrompts()    },
  { name: 'Onboarding', elements: buildOnboarding() },
  { name: 'Write',      elements: buildEntry()      },
];

const total = screens.reduce((a, sc) => a + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'PAUSE',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 469,
    elements: total,
    description: "Daily reflection & journaling app. Anti-gamification: no streaks, no badges, no progress rings. Cloud Dancer off-white base (#F8F6F1 — Pantone 2026 influence), desaturated sage green accent, Georgia/Lora serif for all prompts (editorial warmth). Inspired by Dribbble 'calm UI' wellness trend, Mobbin insight that onboarding is the most craft-invested part of shipped wellness apps, and Lapa Ninja anti-purple revolt toward warm-neutral palettes.",
  },
  screens: screens.map(sc => ({ name: sc.name, svg: `${W}x${H}`, elements: sc.elements })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`PAUSE: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
