import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MOTE',
  tagline:   'moments, distilled',
  archetype: 'micro-journaling',

  palette: {                   // dark theme
    bg:      '#1A1614',
    surface: '#231F1C',
    text:    '#F5F1EC',
    accent:  '#E05A27',
    accent2: '#5D9B72',
    muted:   'rgba(245,241,236,0.38)',
  },

  lightPalette: {              // light theme — editorial cream
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C2410C',
    accent2: '#4D7C5C',
    muted:   'rgba(28,25,23,0.38)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'How are you feeling?', value: 'good', sub: '4 of 5 — last checked 2 min ago' },
        { type: 'metric-row', items: [
          { label: 'Day Streak', value: '21' },
          { label: 'Today',      value: '3' },
          { label: 'This Month', value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '8:42 AM — good',  sub: 'Finally finished the Murakami novel. A quiet sense of completion, like setting down weight.',     badge: 'books' },
          { icon: 'heart', title: '12:15 PM — okay', sub: 'Lunch alone with the window open. Street sounds, coffee cooling. Ordinary and enough.',           badge: 'stillness' },
          { icon: 'zap',   title: '3:30 PM — great', sub: 'Call with Mia — laughed properly for the first time this week. Connection surprises you.',         badge: 'people' },
        ]},
      ],
    },
    {
      id: 'capture',
      label: 'New Moment',
      content: [
        { type: 'text', label: 'write something', value: 'The afternoon light came through sideways, turning the dust gold. I noticed it for once instead of walking through it.' },
        { type: 'tags', label: 'Mood', items: ['rough', 'low', 'okay', '● good', 'great'] },
        { type: 'tags', label: 'Tags', items: ['light', 'attention', 'home', '+ add'] },
        { type: 'text', label: '✦ Prompt', value: 'What did you notice today that you almost missed?' },
        { type: 'metric', label: 'Characters', value: '143', sub: 'tap save when ready' },
      ],
    },
    {
      id: 'archive',
      label: 'Archive',
      content: [
        { type: 'metric', label: 'April 2026', value: '47', sub: 'moments this month — 23 days active' },
        { type: 'metric-row', items: [
          { label: 'Rough', value: '3' },
          { label: 'Okay',  value: '18' },
          { label: 'Good',  value: '22' },
          { label: 'Great', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Apr 10 · 3 moments', sub: 'Murakami, lunch window, call with Mia',     badge: 'great' },
          { icon: 'calendar', title: 'Apr 9 · 2 moments',  sub: 'Morning run, unexpected email',             badge: 'good' },
          { icon: 'calendar', title: 'Apr 8 · 1 moment',   sub: 'The quiet after rain',                     badge: 'okay' },
          { icon: 'calendar', title: 'Apr 7 · 4 moments',  sub: 'Full day — four distinct moments captured', badge: 'good' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Writing Streak', value: '21', sub: 'days · personal best: 34 days' },
        { type: 'progress', items: [
          { label: 'Toward personal best (34 days)', pct: 62 },
          { label: 'Monthly goal (50 moments)',       pct: 94 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Length', value: '68w' },
          { label: 'Top Mood',   value: 'good' },
          { label: 'Top Tag',    value: 'light' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Top theme: stillness', sub: '12 appearances this month — up from 7 in March',  badge: '#1' },
          { icon: 'eye',      title: 'Peak writing time',    sub: 'Weekday mornings 8–10 AM across 18 entries',       badge: 'insight' },
          { icon: 'check',    title: 'Best week: Apr 7–13',  sub: '14 moments in 7 days — longest consistent run',   badge: 'record' },
        ]},
      ],
    },
    {
      id: 'detail',
      label: 'Moment Detail',
      content: [
        { type: 'metric', label: 'Thursday, 3:30 PM', value: 'great', sub: 'April 10, 2026 · home office · 19°C' },
        { type: 'text', label: 'the moment', value: '"Call with Mia — laughed properly for the first time this week. Connection feels different when it surprises you. We talked for two hours without noticing."' },
        { type: 'tags', label: 'Tags', items: ['people', 'connection', 'joy'] },
        { type: 'list', items: [
          { icon: 'message', title: 'Mar 22 — good', sub: 'Long catch-up call with Mia, both of us exhausted but lifted',   badge: 'related' },
          { icon: 'message', title: 'Feb 15 — low',  sub: 'Feeling lonely today. Wished I\'d called someone.',              badge: 'related' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'You',
      content: [
        { type: 'metric', label: 'Rakis', value: '214', sub: 'total moments · writing since February 2026' },
        { type: 'metric-row', items: [
          { label: 'Streak',  value: '21d' },
          { label: 'Words',   value: '14k' },
          { label: 'Avg/day', value: '1.4' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',     title: 'Daily reminder',          sub: '8:00 AM · enabled',          badge: 'on' },
          { icon: 'eye',      title: 'Mood check-in prompt',    sub: '6:00 PM nudge · disabled',   badge: 'off' },
          { icon: 'layers',   title: 'Writing font',            sub: 'Georgia (serif)',             badge: '→' },
          { icon: 'settings', title: 'Theme',                   sub: 'System default',              badge: '→' },
          { icon: 'share',    title: 'Export moments',          sub: 'Download as .txt file',       badge: '↓' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'capture', label: 'Add',     icon: 'plus' },
    { id: 'archive', label: 'Archive', icon: 'calendar' },
    { id: 'profile', label: 'You',     icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mote-mock', 'MOTE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/mote-mock`);
