// DRAFT — AI Writing Companion
// Inspired by: Cushion.so (light clean layout, Inter Tight, warm off-white) +
//              JetBrains Air on lapa.ninja (developer tool minimalism) +
//              Neon.com "for Teams and Agents" positioning trend
// Theme: LIGHT (warm cream + cobalt blue + amber accent)
// Challenge: Minimalist personal writing OS with session-based workflow
//            pushing a new pattern: "focus strip" sidebar + breathing canvas layout

const fs = require('fs');
const path = require('path');

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG       = '#F8F5F1';  // warm cream (Cushion-inspired)
const SURFACE  = '#FFFFFF';
const SURF2    = '#F2EFE9';
const SURF3    = '#E8E4DC';
const TEXT     = '#1A1612';
const TEXT2    = '#5C5449';
const ACCENT   = '#2A5BF5';  // cobalt blue - focused, productive
const ACCENT2  = '#F59E0B';  // amber - warmth, highlights
const ACCENT3  = '#0EA5E9';  // sky - AI element tint
const GREEN    = '#16A34A';
const ROSE     = '#E11D48';
const MUTED    = 'rgba(26,22,18,0.40)';
const BORDER   = 'rgba(26,22,18,0.10)';
const BORDERM  = 'rgba(26,22,18,0.16)';

// ─── Helpers ──────────────────────────────────────────────────────────────────
let idCounter = 1;
const uid = () => `w${idCounter++}`;

function widget(type, props) {
  return { id: uid(), type, ...props };
}

function text(content, style = {}) {
  return widget('text', { content, style });
}

function rect(x, y, w, h, style = {}) {
  return widget('rect', { x, y, width: w, height: h, style });
}

function frame(x, y, w, h, children = [], style = {}) {
  return widget('frame', { x, y, width: w, height: h, children, style });
}

// ─── Screen Builder ───────────────────────────────────────────────────────────
function makeScreen(name, children) {
  return {
    id: uid(),
    name,
    width: 390,
    height: 844,
    background: BG,
    children
  };
}

// ─── Shared Components ────────────────────────────────────────────────────────
function statusBar() {
  return frame(0, 0, 390, 44, [
    text('9:41', { x: 20, y: 14, fontSize: 15, fontWeight: '600', color: TEXT }),
    text('●●●●', { x: 290, y: 14, fontSize: 10, color: TEXT, letterSpacing: 2 }),
  ], { background: 'transparent' });
}

function bottomNav(active) {
  const tabs = [
    { icon: '✦', label: 'Today', id: 'today' },
    { icon: '≡', label: 'Sessions', id: 'sessions' },
    { icon: '✎', label: 'Write', id: 'write' },
    { icon: '⟡', label: 'Insights', id: 'insights' },
    { icon: '◎', label: 'Profile', id: 'profile' },
  ];
  const children = [
    rect(0, 0, 390, 82, { background: SURFACE, borderTop: `1px solid ${BORDER}` }),
  ];
  tabs.forEach((tab, i) => {
    const x = 10 + i * 74;
    const isActive = tab.id === active;
    children.push(
      text(tab.icon, { x: x + 20, y: 12, fontSize: isActive ? 18 : 16, color: isActive ? ACCENT : TEXT2, textAlign: 'center', width: 34 }),
      text(tab.label, { x: x + 2, y: 34, fontSize: 10, color: isActive ? ACCENT : TEXT2, textAlign: 'center', width: 70,
        fontWeight: isActive ? '600' : '400' }),
    );
    if (isActive) {
      children.push(rect(x + 25, 56, 24, 3, { background: ACCENT, borderRadius: 2 }));
    }
  });
  return frame(0, 762, 390, 82, children, {});
}

// ─── Screen 1: Today Dashboard ────────────────────────────────────────────────
function screen1() {
  const children = [
    statusBar(),

    // Header
    text('Good morning, Léa', { x: 24, y: 56, fontSize: 22, fontWeight: '700', color: TEXT, width: 280 }),
    text('Tuesday, April 7', { x: 24, y: 84, fontSize: 14, color: TEXT2 }),

    // Streak pill
    frame(286, 56, 80, 36, [
      text('🔥 14d', { x: 8, y: 10, fontSize: 13, fontWeight: '600', color: ACCENT2 }),
    ], { background: '#FEF3C7', borderRadius: 20 }),

    // Quick-start CTA
    frame(24, 116, 342, 70, [
      rect(0, 0, 342, 70, { background: ACCENT, borderRadius: 16 }),
      text('Start writing', { x: 20, y: 18, fontSize: 17, fontWeight: '700', color: '#fff' }),
      text('New session · blank canvas', { x: 20, y: 42, fontSize: 13, color: 'rgba(255,255,255,0.72)' }),
      text('↗', { x: 305, y: 20, fontSize: 22, color: '#fff' }),
    ], {}),

    // Section: In Progress
    text('IN PROGRESS', { x: 24, y: 206, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),

    // Draft card 1 — active
    frame(24, 224, 342, 96, [
      rect(0, 0, 342, 96, { background: SURFACE, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }),
      rect(0, 0, 4, 96, { background: ACCENT, borderRadius: '4px 0 0 4px' }),
      text('Product Launch Essay', { x: 20, y: 18, fontSize: 15, fontWeight: '600', color: TEXT }),
      text('1,240 words · 68% complete', { x: 20, y: 42, fontSize: 12, color: TEXT2 }),
      // progress bar
      rect(20, 62, 220, 4, { background: SURF3, borderRadius: 4 }),
      rect(20, 62, 150, 4, { background: ACCENT, borderRadius: 4 }),
      text('Resume →', { x: 262, y: 38, fontSize: 12, fontWeight: '600', color: ACCENT }),
    ], {}),

    // Draft card 2
    frame(24, 332, 342, 80, [
      rect(0, 0, 342, 80, { background: SURFACE, borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }),
      rect(0, 0, 4, 80, { background: ACCENT2, borderRadius: '4px 0 0 4px' }),
      text('Quarterly Review Notes', { x: 20, y: 16, fontSize: 15, fontWeight: '600', color: TEXT }),
      text('480 words · paused 2h ago', { x: 20, y: 40, fontSize: 12, color: TEXT2 }),
      text('Continue →', { x: 258, y: 28, fontSize: 12, fontWeight: '600', color: TEXT2 }),
    ], {}),

    // Section: Today's Goal
    text("TODAY'S GOAL", { x: 24, y: 428, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),

    frame(24, 446, 342, 80, [
      rect(0, 0, 342, 80, { background: SURFACE, borderRadius: 16 }),
      text('500 words written', { x: 20, y: 20, fontSize: 14, fontWeight: '600', color: TEXT }),
      rect(20, 48, 220, 6, { background: SURF3, borderRadius: 6 }),
      rect(20, 48, 170, 6, { background: GREEN, borderRadius: 6 }),
      text('340 / 500', { x: 248, y: 44, fontSize: 12, color: TEXT2 }),
    ], {}),

    // Writing prompts strip
    text('PROMPTS FOR TODAY', { x: 24, y: 544, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),
    frame(24, 562, 160, 72, [
      rect(0, 0, 160, 72, { background: '#EFF6FF', borderRadius: 14 }),
      text('🪄', { x: 14, y: 14, fontSize: 20 }),
      text('Write about a decision\nyou almost didn\'t make', { x: 14, y: 38, fontSize: 11, color: TEXT, lineHeight: 1.5 }),
    ], {}),
    frame(196, 562, 170, 72, [
      rect(0, 0, 170, 72, { background: '#FFF7ED', borderRadius: 14 }),
      text('✦', { x: 14, y: 14, fontSize: 18, color: ACCENT2 }),
      text('Describe your ideal\nmorning routine', { x: 14, y: 38, fontSize: 11, color: TEXT, lineHeight: 1.5 }),
    ], {}),

    // AI badge
    frame(24, 648, 342, 48, [
      rect(0, 0, 342, 48, { background: '#F0F7FF', borderRadius: 12, border: `1px solid rgba(42,91,245,0.15)` }),
      text('⟡', { x: 16, y: 14, fontSize: 18, color: ACCENT3 }),
      text('AI suggests: pick up where you left off', { x: 44, y: 15, fontSize: 13, color: TEXT }),
      text('›', { x: 318, y: 14, fontSize: 18, color: ACCENT }),
    ], {}),

    bottomNav('today'),
  ];

  return makeScreen('Today', children);
}

// ─── Screen 2: Active Write Canvas ────────────────────────────────────────────
function screen2() {
  const children = [
    statusBar(),

    // Top bar with doc title
    rect(0, 44, 390, 52, { background: SURFACE, borderBottom: `1px solid ${BORDER}` }),
    text('←', { x: 20, y: 58, fontSize: 20, color: TEXT }),
    text('Product Launch Essay', { x: 56, y: 58, fontSize: 15, fontWeight: '600', color: TEXT, width: 200 }),
    text('Save', { x: 336, y: 58, fontSize: 14, fontWeight: '600', color: ACCENT }),

    // Focus strip — word count + time
    frame(0, 96, 390, 36, [
      rect(0, 0, 390, 36, { background: SURF2 }),
      text('1,240 words', { x: 24, y: 10, fontSize: 12, fontWeight: '600', color: TEXT }),
      text('·', { x: 106, y: 10, fontSize: 12, color: TEXT2 }),
      text('~5 min read', { x: 118, y: 10, fontSize: 12, color: TEXT2 }),
      text('·', { x: 196, y: 10, fontSize: 12, color: TEXT2 }),
      text('Session: 24m', { x: 208, y: 10, fontSize: 12, color: TEXT2 }),
      text('⏸ Focus mode', { x: 296, y: 10, fontSize: 12, color: ACCENT }),
    ], {}),

    // Writing canvas
    rect(0, 132, 390, 480, { background: SURFACE }),
    text('The morning I decided to launch was a Thursday.', { x: 28, y: 152, fontSize: 16, color: TEXT, width: 334, lineHeight: 1.7, fontWeight: '400' }),
    text('Not because the product was ready — it wasn\'t, not really — but because I\'d been waiting for ready my entire career and ready never came.', { x: 28, y: 196, fontSize: 16, color: TEXT, width: 334, lineHeight: 1.7 }),
    text('The cursor blinked. I stared. Then I hit Publish.', { x: 28, y: 286, fontSize: 16, color: TEXT, width: 334, lineHeight: 1.7 }),

    // Cursor blink line
    rect(28, 340, 2, 22, { background: ACCENT, borderRadius: 2 }),

    // Ghost text (AI suggestion)
    text('And somehow, that was enough.', { x: 36, y: 344, fontSize: 16, color: 'rgba(42,91,245,0.35)', width: 260, fontStyle: 'italic' }),

    // AI sidebar strip (right edge)
    rect(356, 132, 34, 480, { background: '#F5F8FF' }),
    text('⟡', { x: 362, y: 148, fontSize: 16, color: ACCENT3 }),
    text('✦', { x: 363, y: 180, fontSize: 13, color: ACCENT2 }),
    text('≡', { x: 363, y: 210, fontSize: 14, color: TEXT2 }),
    text('⊞', { x: 363, y: 240, fontSize: 14, color: TEXT2 }),

    // Bottom AI suggestion bar
    frame(0, 610, 390, 56, [
      rect(0, 0, 390, 56, { background: '#EFF6FF', borderTop: `1px solid rgba(42,91,245,0.15)` }),
      text('⟡', { x: 16, y: 18, fontSize: 16, color: ACCENT3 }),
      text('AI: "Consider expanding the emotion here"', { x: 42, y: 18, fontSize: 12, color: TEXT2, width: 260 }),
      text('Accept', { x: 316, y: 18, fontSize: 12, fontWeight: '600', color: ACCENT }),
    ], {}),

    // Keyboard placeholder
    rect(0, 666, 390, 96, { background: SURF2 }),
    text('Tap to type · AI assist active', { x: 100, y: 706, fontSize: 13, color: TEXT2, textAlign: 'center', width: 190 }),
  ];

  return makeScreen('Write Canvas', children);
}

// ─── Screen 3: Sessions History ───────────────────────────────────────────────
function screen3() {
  const sessions = [
    { title: 'Product Launch Essay', words: '1,240', duration: '48m', date: 'Today', status: 'active', color: ACCENT },
    { title: 'Quarterly Review Notes', words: '480', duration: '22m', date: 'Today', status: 'paused', color: ACCENT2 },
    { title: 'Team Retrospective', words: '2,100', duration: '1h 12m', date: 'Yesterday', status: 'done', color: GREEN },
    { title: 'Personal Journal #42', words: '680', duration: '18m', date: 'Apr 5', status: 'done', color: GREEN },
    { title: 'Feature Brief: Search', words: '3,400', duration: '2h 8m', date: 'Apr 4', status: 'done', color: GREEN },
  ];

  const children = [
    statusBar(),
    text('Sessions', { x: 24, y: 58, fontSize: 24, fontWeight: '700', color: TEXT }),
    // Filter pills
    ...['All', 'Active', 'Done', 'Shared'].map((label, i) => {
      const isFirst = i === 0;
      return frame(24 + i * 76, 94, 66, 30, [
        rect(0, 0, 66, 30, { background: isFirst ? ACCENT : SURFACE, borderRadius: 15,
          border: isFirst ? 'none' : `1px solid ${BORDERM}` }),
        text(label, { x: 0, y: 8, fontSize: 12, fontWeight: '600',
          color: isFirst ? '#fff' : TEXT2, textAlign: 'center', width: 66 }),
      ], {});
    }),

    // Sessions list
    ...sessions.map((s, i) => {
      const y = 142 + i * 94;
      return frame(24, y, 342, 82, [
        rect(0, 0, 342, 82, { background: SURFACE, borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }),
        rect(0, 0, 4, 82, { background: s.color, borderRadius: '4px 0 0 4px' }),
        text(s.title, { x: 20, y: 14, fontSize: 14, fontWeight: '600', color: TEXT, width: 220 }),
        text(`${s.words} words · ${s.duration}`, { x: 20, y: 38, fontSize: 12, color: TEXT2 }),
        frame(280, 56, 50, 20, [
          rect(0, 0, 50, 20, {
            background: s.status === 'active' ? '#EFF6FF' : s.status === 'paused' ? '#FFF7ED' : '#F0FDF4',
            borderRadius: 10,
          }),
          text(s.status, { x: 0, y: 4, fontSize: 10, fontWeight: '600',
            color: s.status === 'active' ? ACCENT : s.status === 'paused' ? ACCENT2 : GREEN,
            textAlign: 'center', width: 50 }),
        ], {}),
        text(s.date, { x: 20, y: 58, fontSize: 11, color: TEXT2 }),
      ], {});
    }),

    bottomNav('sessions'),
  ];

  return makeScreen('Sessions', children);
}

// ─── Screen 4: Insights ───────────────────────────────────────────────────────
function screen4() {
  const bars = [340, 480, 1240, 820, 2100, 680, 200];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxWords = 2100;

  const children = [
    statusBar(),
    text('Insights', { x: 24, y: 58, fontSize: 24, fontWeight: '700', color: TEXT }),
    text('Your writing patterns', { x: 24, y: 86, fontSize: 14, color: TEXT2 }),

    // Stats row
    frame(24, 110, 100, 80, [
      rect(0, 0, 100, 80, { background: SURFACE, borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }),
      text('8,060', { x: 0, y: 20, fontSize: 20, fontWeight: '700', color: TEXT, textAlign: 'center', width: 100 }),
      text('Words this week', { x: 0, y: 48, fontSize: 10, color: TEXT2, textAlign: 'center', width: 100 }),
    ], {}),
    frame(136, 110, 100, 80, [
      rect(0, 0, 100, 80, { background: SURFACE, borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }),
      text('14d', { x: 0, y: 20, fontSize: 20, fontWeight: '700', color: ACCENT, textAlign: 'center', width: 100 }),
      text('Current streak', { x: 0, y: 48, fontSize: 10, color: TEXT2, textAlign: 'center', width: 100 }),
    ], {}),
    frame(248, 110, 118, 80, [
      rect(0, 0, 118, 80, { background: SURFACE, borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }),
      text('9:30am', { x: 0, y: 20, fontSize: 20, fontWeight: '700', color: ACCENT2, textAlign: 'center', width: 118 }),
      text('Peak writing time', { x: 0, y: 48, fontSize: 10, color: TEXT2, textAlign: 'center', width: 118 }),
    ], {}),

    // Bar chart
    text('WORDS PER DAY', { x: 24, y: 208, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),
    frame(24, 226, 342, 160, [
      rect(0, 0, 342, 160, { background: SURFACE, borderRadius: 16 }),
      ...bars.map((w, i) => {
        const h = Math.round((w / maxWords) * 100);
        const x = 24 + i * 44;
        const isToday = i === 6;
        return [
          rect(x, 130 - h, 24, h, { background: isToday ? ACCENT : SURF3, borderRadius: '4px 4px 0 0' }),
          text(days[i], { x: x, y: 138, fontSize: 10, color: isToday ? ACCENT : TEXT2, textAlign: 'center', width: 24 }),
        ];
      }).flat(),
    ], {}),

    // Writing tone analysis
    text('AI TONE ANALYSIS', { x: 24, y: 404, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),
    frame(24, 422, 342, 120, [
      rect(0, 0, 342, 120, { background: SURFACE, borderRadius: 16 }),
      ...['Reflective', 'Analytical', 'Conversational', 'Persuasive'].map((tone, i) => {
        const pcts = [82, 64, 71, 48];
        const y = 14 + i * 24;
        return [
          text(tone, { x: 16, y, fontSize: 12, color: TEXT, width: 100 }),
          rect(120, y + 4, 170, 6, { background: SURF3, borderRadius: 6 }),
          rect(120, y + 4, Math.round(pcts[i] * 1.7), 6, { background: ACCENT, borderRadius: 6 }),
          text(`${pcts[i]}%`, { x: 298, y, fontSize: 12, color: TEXT2 }),
        ];
      }).flat(),
    ], {}),

    // AI Insight card
    frame(24, 556, 342, 80, [
      rect(0, 0, 342, 80, { background: '#F0F7FF', borderRadius: 16, border: `1px solid rgba(42,91,245,0.12)` }),
      text('⟡', { x: 16, y: 18, fontSize: 20, color: ACCENT3 }),
      text('AI Insight', { x: 46, y: 18, fontSize: 13, fontWeight: '700', color: ACCENT }),
      text('You write 3× longer when you start before 10am. Try scheduling deep-work blocks in the morning.', {
        x: 16, y: 44, fontSize: 12, color: TEXT2, width: 310, lineHeight: 1.5,
      }),
    ], {}),

    bottomNav('insights'),
  ];

  return makeScreen('Insights', children);
}

// ─── Screen 5: AI Companion Settings ──────────────────────────────────────────
function screen5() {
  const children = [
    statusBar(),
    text('AI Companion', { x: 24, y: 58, fontSize: 24, fontWeight: '700', color: TEXT }),
    text('Customise your writing partner', { x: 24, y: 86, fontSize: 14, color: TEXT2 }),

    // Voice section
    text('WRITING VOICE', { x: 24, y: 118, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),
    ...['Conversational', 'Academic', 'Journalistic', 'Creative'].map((voice, i) => {
      const isActive = i === 0;
      return frame(24, 136 + i * 60, 342, 50, [
        rect(0, 0, 342, 50, {
          background: isActive ? '#EFF6FF' : SURFACE,
          borderRadius: 14,
          border: isActive ? `1.5px solid ${ACCENT}` : `1px solid ${BORDER}`,
        }),
        text(voice, { x: 20, y: 16, fontSize: 14, fontWeight: isActive ? '600' : '400', color: isActive ? ACCENT : TEXT }),
        text(isActive ? '◉' : '○', { x: 308, y: 16, fontSize: 16, color: isActive ? ACCENT : SURF3 }),
      ], {});
    }),

    // Toggles section
    text('AI BEHAVIOUR', { x: 24, y: 384, fontSize: 10, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 }),
    ...['Ghost text suggestions', 'Tone alerts', 'Session summaries', 'Auto-save drafts'].map((label, i) => {
      const states = [true, true, false, true];
      const isOn = states[i];
      const y = 402 + i * 58;
      return frame(24, y, 342, 48, [
        rect(0, 0, 342, 48, { background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}` }),
        text(label, { x: 20, y: 15, fontSize: 14, color: TEXT }),
        // toggle
        rect(290, 14, 36, 20, { background: isOn ? ACCENT : SURF3, borderRadius: 12 }),
        rect(isOn ? 308 : 293, 17, 14, 14, { background: '#fff', borderRadius: 8 }),
      ], {});
    }),

    // Reset
    frame(24, 640, 342, 48, [
      rect(0, 0, 342, 48, { background: SURFACE, borderRadius: 14, border: `1px solid rgba(225,29,72,0.25)` }),
      text('Reset AI memory', { x: 0, y: 15, fontSize: 14, fontWeight: '500', color: ROSE, textAlign: 'center', width: 342 }),
    ], {}),

    bottomNav('profile'),
  ];

  return makeScreen('AI Companion', children);
}

// ─── Assemble .pen file ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'DRAFT — AI Writing Companion',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    description: 'Light-theme AI writing OS. Warm cream palette, cobalt blue accent. Inspired by Cushion.so clean light layouts and the emerging AI-native productivity tools trend on lapa.ninja.',
    tags: ['light', 'productivity', 'AI', 'writing', 'minimal'],
  },
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

const outPath = path.join(__dirname, 'draft.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Wrote draft.pen (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.map(s => s.name).join(', ')}`);
