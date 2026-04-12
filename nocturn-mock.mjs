import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NOCTURN',
  tagline:   'Protect your deep work',
  archetype: 'focus-productivity',
  palette: {
    bg:      '#0B0C0F',
    surface: '#141519',
    text:    '#E8E4DC',
    accent:  '#F5A623',
    accent2: '#8B6FFF',
    muted:   'rgba(232,228,220,0.4)',
  },
  lightPalette: {
    bg:      '#F7F4EE',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#D4880A',
    accent2: '#6B4FD8',
    muted:   'rgba(26,24,24,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Deep Work Active', value: '2:47:13', sub: 'of 3h goal · Product Design' },
        { type: 'progress', items: [{ label: 'Session progress', pct: 92 }] },
        { type: 'list', items: [
          { icon: 'check',    title: 'Inbox zero + planning',   sub: '08:00 – 09:00', badge: '✓' },
          { icon: 'zap',      title: 'Product Design',          sub: '09:30 – 12:30', badge: '→' },
          { icon: 'code',     title: 'Code review & shipping',  sub: '14:00 – 16:00', badge: '·' },
          { icon: 'heart',    title: 'Writing & thinking',      sub: '16:30 – 18:00', badge: '·' },
        ]},
        { type: 'metric-row', items: [
          { label: '🔥 Streak', value: '14d' },
          { label: '⚡ Today',  value: '5.2h' },
        ]},
      ],
    },
    {
      id: 'sessions',
      label: 'Sessions',
      content: [
        { type: 'metric', label: 'This week', value: '28h 41m', sub: '+12% vs last week' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 65 }, { label: 'Tue', pct: 85 },
          { label: 'Wed', pct: 51 }, { label: 'Thu', pct: 91 },
          { label: 'Fri', pct: 49 }, { label: 'Sun', pct: 65 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Product Design',    sub: 'Today · 2h 47m',     badge: 'Design' },
          { icon: 'code',     title: 'Deep Code Sprint',  sub: 'Today · 3h 12m',     badge: 'Eng' },
          { icon: 'eye',      title: 'Research & Reading',sub: 'Yesterday · 1h 30m', badge: 'Learn' },
          { icon: 'activity', title: 'Feature scoping',   sub: 'Yesterday · 2h 05m', badge: 'Design' },
          { icon: 'code',     title: 'API integration',   sub: 'Mar 21 · 4h 01m',    badge: 'Eng' },
        ]},
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric', label: 'Total this month', value: '97h', sub: 'across 4 projects' },
        { type: 'progress', items: [
          { label: 'RAM Design Studio', pct: 68 },
          { label: 'Backend API v3',    pct: 45 },
          { label: 'Reading List 2026', pct: 27 },
          { label: 'Personal Writing',  pct: 18 },
        ]},
        { type: 'tags', label: 'Categories', items: ['Design', 'Engineering', 'Learning', 'Writing'] },
        { type: 'text', label: 'Top project', value: 'RAM Design Studio is getting 68% of your focus hours this month — in line with your goal.' },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric', label: 'Focus Score', value: '84', sub: 'Top 12% of users · This month' },
        { type: 'metric-row', items: [
          { label: 'Avg / day',  value: '4.9h' },
          { label: 'Best day',   value: '7.3h' },
          { label: 'Streak',     value: '14d'  },
        ]},
        { type: 'progress', items: [
          { label: 'Focus score', pct: 84 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Peak window: 9–12am',          sub: 'Your best focus consistently happens here' },
          { icon: 'star',     title: 'Design avg 2.8h / session',    sub: 'Above your 2h goal — keep it up' },
          { icon: 'alert',    title: 'Wednesday dips are a pattern', sub: 'Protect that afternoon slot' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Rakis', value: '14', sub: 'day streak · Focus craftsman' },
        { type: 'metric-row', items: [
          { label: 'Sessions',    value: '218'  },
          { label: 'Total hours', value: '412h' },
          { label: 'Best streak', value: '31d'  },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Daily goal',        sub: '6h 00m',      badge: '›' },
          { icon: 'bell',     title: 'Reminders',         sub: 'Every 25 min',badge: '›' },
          { icon: 'eye',      title: 'Focus mode',        sub: 'DND + dim',   badge: '›' },
          { icon: 'calendar', title: 'Start of day',      sub: '08:00',       badge: '›' },
        ]},
        { type: 'text', label: 'NOCTURN PRO', value: 'Unlock streaks exports and team stats. Upgrade to Pro for the full experience.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'sessions', label: 'Sessions', icon: 'activity' },
    { id: 'projects', label: 'Projects', icon: 'layers'   },
    { id: 'stats',    label: 'Stats',    icon: 'chart'    },
    { id: 'profile',  label: 'Profile',  icon: 'user'     },
  ],
};

console.log('Generating Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Compiling mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

console.log('Publishing mock...');
const result = await publishMock(html, 'nocturn-mock', 'NOCTURN — Interactive Mock');
console.log('Mock live at:', result.url);
