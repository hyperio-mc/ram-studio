// VERDANT — Biophilic Personal Growth & Wellness Garden
// Inspired by: FC Porto Memorial (Awwwards SOTD 22 Mar 2026) editorial storytelling
// + Emergence Magazine (Land-book) ecology/culture aesthetic
// + Kyn & Folk artisanal craft warmth + Aevi Nordic Skincare minimal nature-forward
// Light theme — editorial warmth, organic palette, serif typography moments

const fs = require('fs');

const SLUG = 'verdant';
const APP = 'VERDANT';

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F7F4EF',   // warm parchment
  surface:  '#FFFFFF',
  surfaceAlt: '#EDE9E1', // soft tan card
  text:     '#1C1A16',   // near-black warm
  textMid:  '#6B6459',   // muted warm brown
  accent:   '#3D6B4F',   // forest green (primary)
  accentSoft:'#E8F0EA',  // green tint bg
  terra:    '#C4692A',   // terra cotta (secondary accent)
  terrasft: '#F5E6DB',   // terra tint
  gold:     '#C9A84C',   // harvest gold
  sage:     '#8AAF8E',   // light sage
  border:   'rgba(28,26,22,0.10)',
  muted:    'rgba(28,26,22,0.45)',
};

// ── Typography ────────────────────────────────────────────────────────────────
const T = {
  serif:  '"Lora", "Georgia", serif',
  sans:   '"Inter", "system-ui", sans-serif',
  mono:   '"JetBrains Mono", monospace',
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const base = {
  fontFamily:      T.sans,
  backgroundColor: P.bg,
  color:           P.text,
  minHeight:       '100%',
  fontSize:        14,
  lineHeight:      1.6,
};

// ── Helper: card ──────────────────────────────────────────────────────────────
function card(children, style = {}) {
  return {
    type: 'view',
    style: {
      backgroundColor: P.surface,
      borderRadius: 16,
      padding: 20,
      border: `1px solid ${P.border}`,
      ...style,
    },
    children,
  };
}

function cardAlt(children, style = {}) {
  return {
    type: 'view',
    style: {
      backgroundColor: P.surfaceAlt,
      borderRadius: 16,
      padding: 20,
      ...style,
    },
    children,
  };
}

// ── Helper: pill badge ─────────────────────────────────────────────────────────
function pill(text, color = P.accentSoft, textColor = P.accent) {
  return {
    type: 'view',
    style: {
      backgroundColor: color,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    children: [{
      type: 'text',
      value: text,
      style: { color: textColor, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    }],
  };
}

// ── Helper: section header ─────────────────────────────────────────────────────
function sectionHead(title, sub, serif = false) {
  return {
    type: 'view',
    style: { marginBottom: 16, gap: 4 },
    children: [
      {
        type: 'text',
        value: title,
        style: {
          fontSize: serif ? 22 : 17,
          fontWeight: '700',
          color: P.text,
          fontFamily: serif ? T.serif : T.sans,
          letterSpacing: serif ? -0.3 : 0,
        },
      },
      ...(sub ? [{
        type: 'text',
        value: sub,
        style: { fontSize: 12, color: P.muted },
      }] : []),
    ],
  };
}

// ── Helper: progress bar ──────────────────────────────────────────────────────
function progressBar(label, pct, color = P.accent, note = '') {
  return {
    type: 'view',
    style: { gap: 6, marginBottom: 12 },
    children: [
      {
        type: 'view',
        style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        children: [
          { type: 'text', value: label, style: { fontSize: 13, color: P.text, fontWeight: '500' } },
          { type: 'text', value: `${pct}%${note ? '  ' + note : ''}`, style: { fontSize: 12, color: P.muted } },
        ],
      },
      {
        type: 'view',
        style: { height: 6, backgroundColor: P.border, borderRadius: 4 },
        children: [{
          type: 'view',
          style: { height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 4 },
          children: [],
        }],
      },
    ],
  };
}

// ── Helper: metric tile ───────────────────────────────────────────────────────
function metricTile(value, label, sub, color = P.accent, bgColor = P.accentSoft) {
  return {
    type: 'view',
    style: {
      backgroundColor: bgColor,
      borderRadius: 14,
      padding: 16,
      flex: 1,
      gap: 4,
    },
    children: [
      { type: 'text', value, style: { fontSize: 28, fontWeight: '800', color, letterSpacing: -1, fontFamily: T.serif } },
      { type: 'text', value: label, style: { fontSize: 12, fontWeight: '600', color: P.text } },
      ...(sub ? [{ type: 'text', value: sub, style: { fontSize: 11, color: P.muted } }] : []),
    ],
  };
}

// ── Helper: practice row ──────────────────────────────────────────────────────
function practiceRow(icon, name, streak, status, lastDone, color = P.accent) {
  const statusColors = { done: P.accent, pending: P.terra, rest: P.gold };
  const statusLabels = { done: '✓ Done', pending: '· Pending', rest: '◌ Rest' };
  return {
    type: 'view',
    style: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottom: `1px solid ${P.border}`,
      gap: 14,
    },
    children: [
      {
        type: 'view',
        style: {
          width: 40, height: 40, borderRadius: 12, backgroundColor: P.accentSoft,
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        },
        children: [{ type: 'text', value: icon, style: { fontSize: 18 } }],
      },
      {
        type: 'view',
        style: { flex: 1, gap: 2 },
        children: [
          { type: 'text', value: name, style: { fontSize: 14, fontWeight: '600', color: P.text } },
          { type: 'text', value: lastDone, style: { fontSize: 11, color: P.muted } },
        ],
      },
      {
        type: 'view',
        style: { alignItems: 'flex-end', gap: 4 },
        children: [
          {
            type: 'view',
            style: {
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
              backgroundColor: status === 'done' ? P.accentSoft : status === 'pending' ? P.terrasft : '#FEF3DC',
            },
            children: [{
              type: 'text',
              value: statusLabels[status],
              style: { fontSize: 10, fontWeight: '700', color: statusColors[status] },
            }],
          },
          { type: 'text', value: `🔥 ${streak}d`, style: { fontSize: 11, color: P.gold, fontWeight: '600' } },
        ],
      },
    ],
  };
}

// ── SCREEN 1 — Garden (Dashboard) ─────────────────────────────────────────────
const screen1 = {
  type: 'view',
  style: { ...base, padding: 20, gap: 20 },
  children: [
    // Header
    {
      type: 'view',
      style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
      children: [
        {
          type: 'view',
          style: { gap: 2 },
          children: [
            { type: 'text', value: 'Sunday, 22 March', style: { fontSize: 12, color: P.muted, fontWeight: '500' } },
            { type: 'text', value: 'Your Garden', style: { fontSize: 24, fontWeight: '800', color: P.text, fontFamily: T.serif, letterSpacing: -0.5 } },
            pill('🌱 Week 12 of Growth', P.accentSoft, P.accent),
          ],
        },
        {
          type: 'view',
          style: { width: 42, height: 42, borderRadius: 21, backgroundColor: P.terra, alignItems: 'center', justifyContent: 'center' },
          children: [{ type: 'text', value: 'AK', style: { fontSize: 14, fontWeight: '800', color: P.surface } }],
        },
      ],
    },

    // Season card — editorial hero
    {
      type: 'view',
      style: {
        backgroundColor: P.accent,
        borderRadius: 20,
        padding: 24,
        gap: 10,
        overflow: 'hidden',
        position: 'relative',
      },
      children: [
        { type: 'text', value: 'SPRING EQUINOX', style: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 2 } },
        { type: 'text', value: 'A season of new roots.', style: { fontSize: 21, fontWeight: '700', color: P.surface, fontFamily: T.serif, lineHeight: 1.3 } },
        { type: 'text', value: 'Your consistency this week has been remarkable. 6 of 7 practices completed.', style: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 } },
        {
          type: 'view',
          style: { flexDirection: 'row', gap: 8, marginTop: 4 },
          children: [
            {
              type: 'view',
              style: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
              children: [{ type: 'text', value: 'Today\'s Reflection →', style: { fontSize: 12, fontWeight: '700', color: P.surface } }],
            },
          ],
        },
      ],
    },

    // 3 metric tiles
    {
      type: 'view',
      style: { flexDirection: 'row', gap: 10 },
      children: [
        metricTile('24', 'Day Streak', 'personal best', P.accent, P.accentSoft),
        metricTile('6', 'Practices', 'active rituals', P.terra, P.terrasft),
        metricTile('84%', 'Vitality', 'this month', P.gold, '#FEF3DC'),
      ],
    },

    // Today's practices (preview)
    card([
      {
        type: 'view',
        style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
        children: [
          { type: 'text', value: 'Today\'s Practices', style: { fontSize: 15, fontWeight: '700', color: P.text } },
          { type: 'text', value: '4/6 done', style: { fontSize: 12, color: P.accent, fontWeight: '600' } },
        ],
      },
      practiceRow('🌬️', 'Morning Breathwork', 24, 'done', 'Completed 7:12 AM'),
      practiceRow('📖', 'Mindful Reading', 18, 'done', 'Completed 8:30 AM'),
      practiceRow('🚶', 'Nature Walk', 11, 'pending', 'Not yet today'),
      practiceRow('✍️', 'Evening Journal', 24, 'pending', 'Not yet today'),
    ]),
  ],
};

// ── SCREEN 2 — Practices ──────────────────────────────────────────────────────
const screen2 = {
  type: 'view',
  style: { ...base, padding: 20, gap: 20 },
  children: [
    sectionHead('Practices', 'Your active rituals & habits', true),

    // Filter row
    {
      type: 'view',
      style: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
      children: [
        { type: 'view', style: { backgroundColor: P.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
          children: [{ type: 'text', value: 'All', style: { fontSize: 12, fontWeight: '700', color: P.surface } }] },
        { type: 'view', style: { backgroundColor: P.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, border: `1px solid ${P.border}` },
          children: [{ type: 'text', value: 'Body', style: { fontSize: 12, fontWeight: '600', color: P.muted } }] },
        { type: 'view', style: { backgroundColor: P.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, border: `1px solid ${P.border}` },
          children: [{ type: 'text', value: 'Mind', style: { fontSize: 12, fontWeight: '600', color: P.muted } }] },
        { type: 'view', style: { backgroundColor: P.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, border: `1px solid ${P.border}` },
          children: [{ type: 'text', value: 'Spirit', style: { fontSize: 12, fontWeight: '600', color: P.muted } }] },
      ],
    },

    // Practice cards
    card([
      { type: 'view', style: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
        children: [
          { type: 'view', style: { width: 48, height: 48, borderRadius: 14, backgroundColor: P.accentSoft, alignItems: 'center', justifyContent: 'center' },
            children: [{ type: 'text', value: '🌬️', style: { fontSize: 22 } }] },
          { type: 'view', style: { flex: 1, gap: 3 },
            children: [
              { type: 'text', value: 'Morning Breathwork', style: { fontSize: 15, fontWeight: '700', color: P.text } },
              { type: 'text', value: 'Box breathing · 10 min · 6:30 AM', style: { fontSize: 12, color: P.muted } },
              { type: 'view', style: { flexDirection: 'row', gap: 6, marginTop: 4 },
                children: [pill('Body', P.accentSoft, P.accent), pill('🔥 24d streak', '#FEF3DC', P.gold)] },
            ],
          },
        ],
      },
      { type: 'view', style: { marginTop: 16 },
        children: [progressBar('This week', 86, P.accent, '6/7 days')] },
    ]),

    card([
      { type: 'view', style: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
        children: [
          { type: 'view', style: { width: 48, height: 48, borderRadius: 14, backgroundColor: P.terrasft, alignItems: 'center', justifyContent: 'center' },
            children: [{ type: 'text', value: '🚶', style: { fontSize: 22 } }] },
          { type: 'view', style: { flex: 1, gap: 3 },
            children: [
              { type: 'text', value: 'Nature Walk', style: { fontSize: 15, fontWeight: '700', color: P.text } },
              { type: 'text', value: 'Outdoor walking · 30–45 min · Flexible', style: { fontSize: 12, color: P.muted } },
              { type: 'view', style: { flexDirection: 'row', gap: 6, marginTop: 4 },
                children: [pill('Body', P.accentSoft, P.accent), pill('🔥 11d streak', '#FEF3DC', P.gold)] },
            ],
          },
        ],
      },
      { type: 'view', style: { marginTop: 16 },
        children: [progressBar('This week', 71, P.terra, '5/7 days')] },
    ]),

    card([
      { type: 'view', style: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
        children: [
          { type: 'view', style: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0ECE4', alignItems: 'center', justifyContent: 'center' },
            children: [{ type: 'text', value: '✍️', style: { fontSize: 22 } }] },
          { type: 'view', style: { flex: 1, gap: 3 },
            children: [
              { type: 'text', value: 'Evening Journal', style: { fontSize: 15, fontWeight: '700', color: P.text } },
              { type: 'text', value: 'Reflective writing · 15 min · 9:00 PM', style: { fontSize: 12, color: P.muted } },
              { type: 'view', style: { flexDirection: 'row', gap: 6, marginTop: 4 },
                children: [pill('Mind', '#EEE9FF', '#7B5EA7'), pill('🔥 24d streak', '#FEF3DC', P.gold)] },
            ],
          },
        ],
      },
      { type: 'view', style: { marginTop: 16 },
        children: [progressBar('This week', 57, '#7B5EA7', '4/7 days')] },
    ]),
  ],
};

// ── SCREEN 3 — Log Entry (Today's Reflection) ─────────────────────────────────
const screen3 = {
  type: 'view',
  style: { ...base, padding: 20, gap: 18 },
  children: [
    sectionHead('Today\'s Reflection', 'Sunday, 22 March 2026', true),

    // Mood selector
    card([
      { type: 'text', value: 'How are you feeling?', style: { fontSize: 13, fontWeight: '600', color: P.text, marginBottom: 12 } },
      {
        type: 'view',
        style: { flexDirection: 'row', justifyContent: 'space-around' },
        children: [
          ['🌱','Rooted'], ['☀️','Energised'], ['🌊','Flowing'], ['🌙','Reflective'], ['🌿','Calm'],
        ].map(([emoji, label], i) => ({
          type: 'view',
          style: {
            alignItems: 'center', gap: 4,
            backgroundColor: i === 2 ? P.accentSoft : 'transparent',
            borderRadius: 12, padding: 8,
            border: i === 2 ? `2px solid ${P.accent}` : '2px solid transparent',
          },
          children: [
            { type: 'text', value: emoji, style: { fontSize: 24 } },
            { type: 'text', value: label, style: { fontSize: 10, fontWeight: i === 2 ? '700' : '500', color: i === 2 ? P.accent : P.muted } },
          ],
        })),
      },
    ]),

    // Gratitude
    card([
      { type: 'text', value: '🌻  Three things I\'m grateful for', style: { fontSize: 13, fontWeight: '700', color: P.text, marginBottom: 12 } },
      ...[
        'The quiet of early morning before the house wakes up.',
        'How the light fell through the kitchen window at 7am.',
        'A conversation with an old friend I hadn\'t expected.',
      ].map((text, i) => ({
        type: 'view',
        style: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
        children: [
          { type: 'view', style: { width: 22, height: 22, borderRadius: 11, backgroundColor: P.accentSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
            children: [{ type: 'text', value: `${i+1}`, style: { fontSize: 11, fontWeight: '700', color: P.accent } }] },
          { type: 'text', value: text, style: { fontSize: 13, color: P.text, flex: 1, lineHeight: 1.5 } },
        ],
      })),
    ]),

    // Free write
    card([
      { type: 'text', value: '✍️  Today\'s pages', style: { fontSize: 13, fontWeight: '700', color: P.text, marginBottom: 10 } },
      {
        type: 'view',
        style: { backgroundColor: P.bg, borderRadius: 10, padding: 14, minHeight: 100 },
        children: [{
          type: 'text',
          value: 'There\'s something about Sundays in late March — the way the season feels genuinely suspended between what was and what\'s coming. I found myself standing still in the garden today, noticing how the soil smells different now, richer somehow...',
          style: { fontSize: 13, color: P.text, lineHeight: 1.6, fontFamily: T.serif },
        }],
      },
    ]),

    // Tags
    card([
      { type: 'text', value: 'Tags', style: { fontSize: 13, fontWeight: '600', color: P.text, marginBottom: 10 } },
      {
        type: 'view',
        style: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        children: [
          ['#spring', P.accentSoft, P.accent],
          ['#gratitude', P.terrasft, P.terra],
          ['#stillness', '#EEE9FF', '#7B5EA7'],
          ['#nature', P.accentSoft, P.accent],
          ['+ Add', P.bg, P.muted],
        ].map(([tag, bg, color]) => ({
          type: 'view',
          style: { backgroundColor: bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, border: tag === '+ Add' ? `1px dashed ${P.border}` : 'none' },
          children: [{ type: 'text', value: tag, style: { fontSize: 12, fontWeight: '600', color } }],
        })),
      },
    ]),
  ],
};

// ── SCREEN 4 — Growth Timeline ────────────────────────────────────────────────
const screen4 = {
  type: 'view',
  style: { ...base, padding: 20, gap: 20 },
  children: [
    sectionHead('Growth Timeline', 'Your journey this season', true),

    // Month progress
    card([
      { type: 'view', style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
        children: [
          { type: 'text', value: 'March 2026', style: { fontSize: 15, fontWeight: '700', color: P.text } },
          { type: 'text', value: '22 days in', style: { fontSize: 12, color: P.muted } },
        ],
      },
      progressBar('Practices completed', 78, P.accent, '52/67'),
      progressBar('Journal entries', 91, P.terra, '20/22'),
      progressBar('Streak maintained', 100, P.gold, '22/22'),
    ]),

    // Monthly summary tiles
    {
      type: 'view',
      style: { flexDirection: 'row', gap: 10 },
      children: [
        metricTile('52', 'Practices', 'March', P.accent, P.accentSoft),
        metricTile('20', 'Entries', 'journals', P.terra, P.terrasft),
      ],
    },

    // Timeline entries (editorial scroll cards)
    {
      type: 'view',
      style: { gap: 1 },
      children: [
        { type: 'text', value: 'MILESTONES', style: { fontSize: 10, fontWeight: '700', color: P.muted, letterSpacing: 2, marginBottom: 10 } },
        ...[
          { date: 'Mar 22', icon: '🌱', title: '24-Day Breathwork Streak', body: 'Unbroken morning practice since Feb 27.', color: P.accentSoft, accent: P.accent },
          { date: 'Mar 15', icon: '📖', title: 'Completed "Braiding Sweetgrass"', body: 'Three weeks of mindful reading complete.', color: P.terrasft, accent: P.terra },
          { date: 'Mar 8', icon: '🌊', title: 'Cold Water Immersion — First Time', body: 'Two minutes in the sea at Chesil Beach.', color: '#EEE9FF', accent: '#7B5EA7' },
          { date: 'Mar 1', icon: '🌿', title: 'Spring Season Begins', body: 'Set intentions for growth and renewal.', color: '#FEF3DC', accent: P.gold },
        ].map(({ date, icon, title, body, color, accent }) => ({
          type: 'view',
          style: { flexDirection: 'row', gap: 14, marginBottom: 14, alignItems: 'flex-start' },
          children: [
            { type: 'view', style: { alignItems: 'center', gap: 0 },
              children: [
                { type: 'view', style: { width: 38, height: 38, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center' },
                  children: [{ type: 'text', value: icon, style: { fontSize: 18 } }] },
                { type: 'view', style: { width: 1, flex: 1, backgroundColor: P.border, marginTop: 4, minHeight: 20 }, children: [] },
              ],
            },
            { type: 'view', style: { flex: 1, paddingBottom: 14 },
              children: [
                { type: 'text', value: date, style: { fontSize: 10, color: P.muted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 } },
                { type: 'text', value: title, style: { fontSize: 13, fontWeight: '700', color: P.text, marginBottom: 3 } },
                { type: 'text', value: body, style: { fontSize: 12, color: P.textMid, lineHeight: 1.4 } },
              ],
            },
          ],
        })),
      ],
    },
  ],
};

// ── SCREEN 5 — Insights ───────────────────────────────────────────────────────
const screen5 = {
  type: 'view',
  style: { ...base, padding: 20, gap: 20 },
  children: [
    sectionHead('Insights', 'Patterns from your garden', true),

    // Seasonal insight card (editorial, accent bg)
    {
      type: 'view',
      style: { backgroundColor: P.terra, borderRadius: 20, padding: 22, gap: 10 },
      children: [
        { type: 'text', value: '🌸  SPRING PATTERN', style: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 } },
        { type: 'text', value: 'You\'re most consistent in the mornings.', style: { fontSize: 18, fontWeight: '700', color: P.surface, fontFamily: T.serif, lineHeight: 1.3 } },
        { type: 'text', value: 'Practices completed before 9am have a 94% completion rate vs 61% for afternoon slots.', style: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 } },
      ],
    },

    // Weekly rhythm card
    card([
      { type: 'text', value: 'Weekly Rhythm', style: { fontSize: 14, fontWeight: '700', color: P.text, marginBottom: 14 } },
      {
        type: 'view',
        style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 60 },
        children: [
          { day: 'M', pct: 100 }, { day: 'T', pct: 83 }, { day: 'W', pct: 100 }, { day: 'T', pct: 67 },
          { day: 'F', pct: 100 }, { day: 'S', pct: 83 }, { day: 'S', pct: 50 },
        ].map(({ day, pct }) => ({
          type: 'view',
          style: { alignItems: 'center', gap: 4, flex: 1 },
          children: [
            { type: 'view', style: { width: 24, height: Math.round(pct * 0.48), borderRadius: 6, backgroundColor: pct === 100 ? P.accent : pct >= 80 ? P.sage : P.surfaceAlt }, children: [] },
            { type: 'text', value: day, style: { fontSize: 10, color: P.muted, fontWeight: '600' } },
          ],
        })),
      },
    ]),

    // Top practices
    card([
      { type: 'text', value: 'Strongest Practices', style: { fontSize: 14, fontWeight: '700', color: P.text, marginBottom: 14 } },
      progressBar('Morning Breathwork', 96, P.accent, '24d streak'),
      progressBar('Evening Journal', 87, '#7B5EA7', '24d streak'),
      progressBar('Mindful Reading', 82, P.terra, '18d streak'),
      progressBar('Nature Walk', 71, P.sage, '11d streak'),
    ]),

    // Growth quote — editorial serif
    cardAlt([
      { type: 'text', value: '"The garden suggests there might be a place where we can meet nature halfway."', style: { fontSize: 15, fontFamily: T.serif, fontStyle: 'italic', color: P.text, lineHeight: 1.6 } },
      { type: 'text', value: '— Michael Pollan', style: { fontSize: 12, color: P.muted, marginTop: 8 } },
    ]),
  ],
};

// ── Navigation ────────────────────────────────────────────────────────────────
const nav = [
  { id: 'screen1', label: 'Garden', icon: '🌿' },
  { id: 'screen2', label: 'Practices', icon: '🌱' },
  { id: 'screen3', label: 'Journal', icon: '✍️' },
  { id: 'screen4', label: 'Timeline', icon: '🗓' },
  { id: 'screen5', label: 'Insights', icon: '🌸' },
];

// ── Assemble .pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'VERDANT — Biophilic Growth Garden',
    description: 'A personal wellness & growth tracker inspired by editorial design and seasonal storytelling. Light theme with warm botanical palette.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['wellness', 'biophilic', 'editorial', 'light-theme', 'growth', 'habits'],
  },
  theme: {
    mode: 'light',
    colors: {
      background: P.bg,
      surface: P.surface,
      text: P.text,
      accent: P.accent,
      accent2: P.terra,
      muted: P.muted,
      border: P.border,
    },
    typography: {
      fontFamily: T.sans,
      serifFamily: T.serif,
      scale: { xs: 10, sm: 12, base: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
    },
  },
  screens: [
    { id: 'screen1', label: 'Garden',    root: screen1 },
    { id: 'screen2', label: 'Practices', root: screen2 },
    { id: 'screen3', label: 'Journal',   root: screen3 },
    { id: 'screen4', label: 'Timeline',  root: screen4 },
    { id: 'screen5', label: 'Insights',  root: screen5 },
  ],
  navigation: nav,
  interactions: [
    { trigger: { type: 'tap', target: 'nav-garden' },    action: { type: 'navigate', screen: 'screen1' } },
    { trigger: { type: 'tap', target: 'nav-practices' }, action: { type: 'navigate', screen: 'screen2' } },
    { trigger: { type: 'tap', target: 'nav-journal' },   action: { type: 'navigate', screen: 'screen3' } },
    { trigger: { type: 'tap', target: 'nav-timeline' },  action: { type: 'navigate', screen: 'screen4' } },
    { trigger: { type: 'tap', target: 'nav-insights' },  action: { type: 'navigate', screen: 'screen5' } },
  ],
};

fs.writeFileSync('/workspace/group/design-studio/verdant.pen', JSON.stringify(pen, null, 2));
console.log('✅ verdant.pen written (' + Math.round(fs.statSync('/workspace/group/design-studio/verdant.pen').size / 1024) + 'KB)');
