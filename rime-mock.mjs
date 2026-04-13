import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'RIME',
  tagline:   'Voice journaling for the reflective mind',
  archetype: 'voice-journaling',

  palette: {
    bg:      '#1A1210',
    surface: '#241A16',
    text:    '#F5F0EC',
    accent:  '#C85A2A',
    accent2: '#4A7C59',
    muted:   'rgba(245,240,236,0.45)',
  },
  lightPalette: {
    bg:      '#FAF8F5',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#C85A2A',
    accent2: '#4A7C59',
    muted:   'rgba(28,24,20,0.4)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric',     label: '🔥 Daily Streak',   value: '14',    sub: 'days — keep it going' },
        { type: 'metric-row', items: [
          { label: 'Entries this wk', value: '6' },
          { label: 'Voice time',      value: '28m' },
          { label: 'Consistency',     value: '92%' },
        ]},
        { type: 'tags',  label: 'How are you feeling?', items: ['😌 Calm', '😊 Happy', '😤 Tense', '😔 Low', '🤔 Reflective'] },
        { type: 'list',  items: [
          { icon: 'activity', title: 'Morning Gratitude',    sub: 'Today · 7:12 AM · 3 min',     badge: '😌' },
          { icon: 'activity', title: 'Work Clarity Session', sub: 'Yesterday · 8:44 PM · 5 min',  badge: '🤔' },
          { icon: 'activity', title: 'Weekend Reset',        sub: 'Sat Apr 12 · 4 min',           badge: '😊' },
        ]},
        { type: 'text', label: '✨ Weekly Insight', value: '"Gratitude themes appeared in 5 of your last 7 entries this week."' },
      ],
    },
    {
      id: 'record',
      label: 'Record',
      content: [
        { type: 'metric', label: '🎙️ Recording', value: '2:34', sub: 'Voice capture in progress…' },
        { type: 'progress', items: [
          { label: 'Audio quality',  pct: 94 },
          { label: 'Signal clarity', pct: 87 },
        ]},
        { type: 'text',  label: "💬 Today's Prompt", value: '"What made today feel meaningful, even in a small way?"' },
        { type: 'tags',  label: 'Tags', items: ['#morning', '#gratitude', '#work', '+ Add'] },
        { type: 'metric-row', items: [
          { label: 'Pause',   value: '⏸' },
          { label: 'Finish',  value: '⏹' },
          { label: 'Discard', value: '✕' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Entries', value: '6' },
          { label: 'Avg Mood', value: '72%' },
          { label: 'Voice',   value: '28m' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday',    pct: 65 },
          { label: 'Tuesday',   pct: 40 },
          { label: 'Wednesday', pct: 75 },
          { label: 'Thursday',  pct: 55 },
          { label: 'Friday',    pct: 80 },
          { label: 'Saturday',  pct: 60 },
        ]},
        { type: 'metric',   label: '🔥 Streak', value: '14', sub: 'days — best: 21' },
        { type: 'text',  label: '💚 Overall Tone', value: '"Calm and optimistic. Growth-oriented this week. Gratitude is your most frequent theme."' },
        { type: 'progress', items: [
          { label: 'Gratitude', pct: 78 },
          { label: 'Growth',    pct: 55 },
          { label: 'Clarity',   pct: 40 },
          { label: 'Stress',    pct: 22 },
        ]},
      ],
    },
    {
      id: 'library',
      label: 'Journal',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total entries', value: '147' },
          { label: 'This month',    value: '18' },
          { label: 'Tags used',     value: '34' },
        ]},
        { type: 'list', items: [
          { icon: 'play',   title: 'Morning Gratitude',    sub: 'Today · 3:20 · #gratitude',       badge: '😌' },
          { icon: 'play',   title: 'Work Clarity Session', sub: 'Apr 13 · 5:02 · #work',           badge: '🤔' },
          { icon: 'play',   title: 'Weekend Reset',        sub: 'Apr 12 · 4:10 · #weekend',        badge: '😊' },
          { icon: 'play',   title: 'Relationship Goals',   sub: 'Apr 11 · 6:45 · #personal',       badge: '💭' },
          { icon: 'play',   title: 'Thursday Wind-down',   sub: 'Apr 10 · 2:55 · #reflection',     badge: '😴' },
        ]},
      ],
    },
    {
      id: 'themes',
      label: 'Themes',
      content: [
        { type: 'text',  label: 'AI Pattern Detection', value: 'Themes detected across your last 30 entries, sized by frequency.' },
        { type: 'progress', items: [
          { label: '🌱 Gratitude',  pct: 73 },
          { label: '📈 Growth',     pct: 60 },
          { label: '🔦 Clarity',    pct: 47 },
          { label: '🎨 Creativity', pct: 33 },
          { label: '🤝 Connection', pct: 27 },
          { label: '☁️ Stress',     pct: 23 },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Gratitude',  sub: 'You express it 3× more when well-rested.', badge: '+12%' },
          { icon: 'chart', title: 'Growth',     sub: 'Peaks on Monday mornings.',                 badge: '+8%'  },
          { icon: 'alert', title: 'Stress',     sub: 'Linked to late-night entries.',             badge: '−4%'  },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Me',
      content: [
        { type: 'metric-row', items: [
          { label: 'Entries',     value: '147' },
          { label: 'Streak',      value: '14d'  },
          { label: 'Voice Time',  value: '8.2h' },
          { label: 'Consistency', value: '92%'  },
        ]},
        { type: 'tags', label: '🏅 Milestones', items: ['7-Day ✓', '30-Day ✓', '21-Day ✓', '100 Entries ✓', '5h Voice ✓', '💎 60-Day…'] },
        { type: 'list', items: [
          { icon: 'bell',     title: 'Daily Reminder', sub: '7:00 AM every morning', badge: 'On'   },
          { icon: 'activity', title: 'Voice Quality',  sub: 'Recording fidelity',    badge: 'High' },
          { icon: 'zap',      title: 'AI Insights',    sub: 'Pattern detection',     badge: 'On'   },
          { icon: 'lock',     title: 'Privacy & Data', sub: 'Local-first storage',   badge: '→'    },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'library',  label: 'Journal',  icon: 'list'     },
    { id: 'record',   label: 'Record',   icon: 'activity' },
    { id: 'insights', label: 'Insights', icon: 'chart'    },
    { id: 'profile',  label: 'Me',       icon: 'user'     },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'rime-mock', 'RIME — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/rime-mock`);
