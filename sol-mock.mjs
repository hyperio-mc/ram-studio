import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Sol',
  tagline:   'Know your energy. Own your day.',
  archetype: 'wellness-ai',
  palette: {
    bg:      '#1A1208',
    surface: '#241A0E',
    text:    '#F5EDD8',
    accent:  '#E8A020',
    accent2: '#D4781A',
    muted:   'rgba(245,237,216,0.4)',
  },
  lightPalette: {
    bg:      '#FDF8F0',
    surface: '#FFFCF5',
    text:    '#1C1611',
    accent:  '#E8A020',
    accent2: '#D4781A',
    muted:   'rgba(28,22,17,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Energy Score', value: '73', sub: 'Physical 73% · Mental 45%' },
        { type: 'metric-row', items: [
          { label: 'Streak', value: '12d' },
          { label: 'Focus', value: '10–11:30' },
          { label: 'Sleep', value: '7.2h' },
        ]},
        { type: 'text', label: '✦ Sol AI', value: 'Your focus window peaks 10–11:30am today. Deep work before noon.' },
        { type: 'progress', items: [
          { label: 'Morning ritual', pct: 60 },
          { label: 'Movement goal',  pct: 78 },
          { label: 'Hydration',      pct: 45 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Hydration — 500ml',  sub: 'Completed 6:34am',  badge: '✓' },
          { icon: 'check', title: 'Sunlight — 10 min',  sub: 'Completed 6:52am',  badge: '✓' },
          { icon: 'check', title: 'Movement — 20 min',  sub: 'Completed 7:08am',  badge: '✓' },
          { icon: 'zap',   title: 'Cold shower',        sub: 'Pending',            badge: '○' },
          { icon: 'heart', title: 'Journaling',         sub: 'Pending',            badge: '○' },
        ]},
      ],
    },
    {
      id: 'ritual', label: 'Ritual',
      content: [
        { type: 'metric', label: '🔥 Streak', value: '12', sub: 'Days — longest ever!' },
        { type: 'tags', label: 'Ritual steps', items: ['Hydration ✓', 'Sunlight ✓', 'Movement ✓', 'Cold shower', 'Journal'] },
        { type: 'progress', items: [
          { label: 'Hydration (+4 pts)',    pct: 100 },
          { label: 'Sunlight (+6 pts)',     pct: 100 },
          { label: 'Movement (+12 pts)',    pct: 100 },
          { label: 'Cold shower (+8 pts)',  pct: 0   },
          { label: 'Journaling (+5 pts)',   pct: 0   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Done',    value: '3/5' },
          { label: 'Pts earned', value: '+22' },
          { label: 'Remaining', value: '+13' },
        ]},
        { type: 'text', label: 'Tip', value: 'Cold showers on completion days score +8 energy points on average. Try finishing with 2 minutes cold.' },
      ],
    },
    {
      id: 'insight', label: 'Insight',
      content: [
        { type: 'text', label: '✦ Sol Intelligence · Apr 1', value: 'Your energy is climbing. Three patterns are working for you. Updated based on last 14 days of data.' },
        { type: 'progress', items: [
          { label: 'Mon 62', pct: 62 },
          { label: 'Tue 78', pct: 78 },
          { label: 'Wed 55', pct: 55 },
          { label: 'Thu 88', pct: 88 },
          { label: 'Fri 91', pct: 91 },
          { label: 'Sat 73', pct: 73 },
          { label: 'Sun 66', pct: 66 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Early sunlight → +18% energy', sub: 'Days with 10+ min sunlight before 8am score 18pts higher', badge: '☀' },
          { icon: 'activity', title: 'Movement drives clarity',  sub: 'Mental energy peaks 2h after morning walks', badge: '🏃' },
          { icon: 'heart', title: 'Journaling predicts flow',   sub: 'Correlates 0.78 with entering flow state before noon', badge: '📓' },
        ]},
        { type: 'text', label: '✦ Recommendation', value: 'Complete journaling before 8:30am today to maximise your afternoon deep work window.' },
      ],
    },
    {
      id: 'schedule', label: 'Schedule',
      content: [
        { type: 'metric-row', items: [
          { label: 'Focus time', value: '3h 20m' },
          { label: 'Meetings',   value: '1h' },
          { label: 'Free',       value: '2h' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: '6:30  Morning Ritual',    sub: 'Ritual block',          badge: '☀' },
          { icon: 'eye',      title: '8:00  Deep Work',         sub: 'Peak focus window',     badge: '⚡' },
          { icon: 'users',    title: '9:30  Team Sync',         sub: '30 min meeting',        badge: '👥' },
          { icon: 'eye',      title: '10:00 Deep Work',         sub: 'Longest focus block',   badge: '⚡' },
          { icon: 'activity', title: '11:30 Break + Walk',      sub: 'Energy restore',        badge: '🚶' },
          { icon: 'list',     title: '13:00 Admin & Email',     sub: 'Low energy tasks',      badge: '📧' },
          { icon: 'star',     title: '14:00 Creative Work',     sub: 'Mid-energy creative',   badge: '✦' },
        ]},
        { type: 'tags', label: 'Today\'s blocks', items: ['2× Focus', '1× Meeting', 'Ritual', 'Break', 'Admin'] },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'metric', label: 'Day Score', value: '81', sub: '↑ 8 pts from yesterday · Energy peak day 🌅' },
        { type: 'metric-row', items: [
          { label: 'Ritual', value: '3/5' },
          { label: 'Focus',  value: '3h 20m' },
          { label: 'Steps',  value: '8,420' },
        ]},
        { type: 'progress', items: [
          { label: 'Ritual completion', pct: 60 },
          { label: 'Energy vs target',  pct: 81 },
          { label: 'Deep work',         pct: 83 },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Sunlight streak: 12 days', sub: 'Keep it going tomorrow',  badge: '✓' },
          { icon: 'check', title: 'Walk: 4.2km · 42 min',    sub: 'Above weekly average',    badge: '✓' },
          { icon: 'check', title: 'Deep work: 3h 20min',     sub: 'Personal best this week', badge: '✓' },
          { icon: 'alert', title: 'Journaling missed',       sub: 'Try before 8:30am',       badge: '○' },
          { icon: 'alert', title: 'Cold shower skipped',     sub: 'Missed +8 pts',           badge: '○' },
        ]},
        { type: 'text', label: '✦ Sol Prompt', value: '"What gave you the most energy today, and how do you recreate it tomorrow?"' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'ritual',   label: 'Ritual',   icon: 'star'     },
    { id: 'insight',  label: 'Insight',  icon: 'chart'    },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'reflect',  label: 'Reflect',  icon: 'heart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sol-mock', 'Sol — Interactive Mock');
console.log('Mock live at:', result.url);
