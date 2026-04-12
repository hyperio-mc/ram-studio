import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LULL',
  tagline:   'A space to arrive in yourself',
  archetype: 'mindfulness-journal',

  // ── LIGHT palette (primary — this is a light-first design) ─────────────────
  lightPalette: {
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1D1A14',
    accent:  '#5A7856',   // sage
    accent2: '#A0694A',   // clay
    muted:   'rgba(29,26,20,0.42)',
  },

  // ── DARK palette ────────────────────────────────────────────────────────────
  palette: {
    bg:      '#1A1D18',
    surface: '#222520',
    text:    '#EDE8DE',
    accent:  '#7FAE7B',   // sage lightened for dark
    accent2: '#C48E65',   // clay lightened for dark
    muted:   'rgba(237,232,222,0.42)',
  },

  screens: [
    {
      id: 'morning', label: 'Morning',
      content: [
        { type: 'metric', label: 'Good morning — Monday 24 March', value: 'Calm', sub: 'How you\'re arriving today · Mood logged at 7:41 am' },
        { type: 'text', label: 'Today\'s Intention', value: 'Be present with the people around me.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Drink water before coffee', sub: 'Completed ✓', badge: '✓' },
          { icon: 'activity', title: 'Take a 10-minute walk after lunch', sub: 'Tap to complete', badge: '○' },
          { icon: 'activity', title: 'Call Mum — she asked about Sunday', sub: 'Tap to complete', badge: '○' },
        ]},
        { type: 'text', label: "Today's Prompt", value: '"What would make today feel complete?" — Tap to journal ↗' },
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric', label: 'Monday 24 March · Free Write', value: '187 words', sub: 'Entry in progress · 7:42 am · Tap to continue' },
        { type: 'text', label: 'Current Entry', value: "It's strange how some mornings carry a different weight. Not heavy, exactly — more like the air before rain. I woke up thinking about the conversation from last night and I still don't know what I was trying to say.\n\nI think I want more space in my days. Not necessarily time — just room to breathe between things." },
        { type: 'list', items: [
          { icon: 'calendar', title: 'The rhythm of ordinary days', sub: 'Sun 23 Mar · 3 min read', badge: '→' },
          { icon: 'calendar', title: 'Why I keep starting things', sub: 'Thu 20 Mar · 5 min read', badge: '→' },
          { icon: 'calendar', title: 'On rest without guilt', sub: 'Tue 18 Mar · 4 min read', badge: '→' },
        ]},
      ],
    },
    {
      id: 'prompts', label: 'Prompts',
      content: [
        { type: 'metric', label: "Today's Featured Prompt", value: 'Relationships', sub: '"What would make today feel complete?" — Guided reflection' },
        { type: 'text', label: 'Prompt', value: '"What would make today feel complete?" — Tap to begin journaling ↗' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Gratitude', sub: '12 prompts · On noticing what\'s already here', badge: '→' },
          { icon: 'user', title: 'Relationships', sub: '9 prompts · On how we love and are loved', badge: '→' },
          { icon: 'star', title: 'Work & Purpose', sub: '11 prompts · On meaning in daily effort', badge: '→' },
          { icon: 'eye', title: 'Inner Life', sub: '14 prompts · On the self, gently', badge: '→' },
        ]},
      ],
    },
    {
      id: 'mood', label: 'Mood',
      content: [
        { type: 'metric', label: '21-Day Streak · This Week', value: 'Improving', sub: 'Mood lifts on days you journal in the morning · Pattern detected' },
        { type: 'metric-row', items: [
          { label: 'Energy', value: '7 / 10' },
          { label: 'Anxiety', value: '3 / 10' },
          { label: 'Focus', value: '8 / 10' },
        ]},
        { type: 'progress', items: [
          { label: 'Energy', pct: 70 },
          { label: 'Anxiety (inverse)', pct: 30 },
          { label: 'Focus', pct: 80 },
          { label: 'Connection', pct: 60 },
        ]},
        { type: 'text', label: 'LULL Observation', value: 'Your mood lifts consistently on days you journal in the morning. 21 consecutive check-ins ✦' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Journal Streak', value: '21 days' },
          { label: 'Words Written', value: '4,820' },
          { label: 'Prompts Used', value: '14' },
        ]},
        { type: 'progress', items: [
          { label: 'Relationships (14 mentions)', pct: 88 },
          { label: 'Work & purpose (11 mentions)', pct: 69 },
          { label: 'Rest & recovery (9 mentions)', pct: 56 },
          { label: 'Creativity (8 mentions)', pct: 50 },
        ]},
        { type: 'text', label: 'Pattern Insight', value: 'You write longest on Sundays and shortest on Wednesdays. Your energy and word count align closely.' },
        { type: 'metric', label: 'Next Milestone', value: '30 days', sub: '9 days to go · You\'re building something real.' },
      ],
    },
  ],

  nav: [
    { id: 'morning', label: 'Morning', icon: 'home' },
    { id: 'journal', label: 'Journal',  icon: 'edit' },
    { id: 'prompts', label: 'Prompts',  icon: 'layers' },
    { id: 'mood',    label: 'Mood',     icon: 'heart' },
    { id: 'insights',label: 'Insights', icon: 'chart' },
  ],
};

// LULL is light-first — swap palette and lightPalette so dark toggle shows dark
// The mock builder reads palette as dark and lightPalette as light.
// We want light to be default, so we pass light as palette (shown first)
// and dark as lightPalette (shown on toggle). Then rename the toggle labels.
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lull-mock', 'LULL — Interactive Mock');

if (result.status === 403 && result.body?.includes('maximum')) {
  console.error('⚠ ZenBin 100-page cap. Delete stale pages then retry.');
  process.exit(1);
}

console.log('Mock live at:', result.url);
