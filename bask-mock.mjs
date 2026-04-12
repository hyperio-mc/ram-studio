import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BASK',
  tagline:   'Deep focus, without the noise',
  archetype: 'productivity-calm',
  palette: {           // dark fallback
    bg:      '#1C1917',
    surface: '#2A2521',
    text:    '#F5F1EC',
    accent:  '#C47A40',
    accent2: '#3D8B5F',
    muted:   'rgba(245,241,236,0.4)',
  },
  lightPalette: {      // primary light theme
    bg:      '#F5F1EC',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C47A40',
    accent2: '#3D8B5F',
    muted:   'rgba(28,25,23,0.42)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',   label: 'Today\'s Intention', value: 'Ship the design system handoff' },
        { type: 'metric-row', items: [
          { label: 'Flow Score', value: 'Focused' },
          { label: 'Sessions',   value: '3 / 4' },
          { label: 'Deep Hrs',   value: '4:05' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Deep Work',      sub: '8:15–9:55',   badge: '1h 40m' },
          { icon: 'check', title: 'Review & Plan',  sub: '10:10–10:35', badge: '25m'    },
          { icon: 'play',  title: 'Design Sprint',  sub: '11:00–1:00',  badge: 'Active' },
          { icon: 'calendar', title: 'Buffer',       sub: '2:00–2:30',  badge: '30m'    },
        ]},
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Design Sprint', value: '1:02:17', sub: 'of 2:00:00 · 52% complete' },
        { type: 'text',   label: '✦ Bask noticed', value: 'You\'re 8 min ahead of your usual pace.' },
        { type: 'tags',   label: 'Session Controls', items: ['⏸  Pause', '✎  Note', '■  End'] },
        { type: 'text',   label: 'Distractions Blocked', value: '⊘  17 apps quietly blocked' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Peak Hours',    value: '9–11 AM' },
          { label: 'Avg Session',   value: '47 min' },
          { label: 'Best Day',      value: 'Thu' },
          { label: 'Distractions',  value: '−28%' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 53 },
          { label: 'Tue', pct: 75 },
          { label: 'Wed', pct: 47 },
          { label: 'Thu', pct: 85 },
          { label: 'Fri', pct: 70 },
          { label: 'Sat', pct: 17 },
        ]},
        { type: 'text', label: '✦ Bask noticed', value: 'You focus 22% deeper when you skip Slack until 11 AM.' },
        { type: 'metric', label: 'Deep Work Streak', value: '12 days', sub: 'Best this month · Record' },
      ],
    },
    {
      id: 'log', label: 'Log',
      content: [
        { type: 'list', items: [
          { icon: 'star',  title: 'Design Sprint',    sub: 'Today 11:00 AM',    badge: '1h 2m'  },
          { icon: 'check', title: 'Review & Plan',    sub: 'Today 10:10 AM',    badge: '25m'    },
          { icon: 'check', title: 'Deep Work',        sub: 'Today 8:15 AM',     badge: '1h 40m' },
          { icon: 'check', title: 'Component library', sub: 'Yesterday 2:30 PM', badge: '58m'   },
          { icon: 'check', title: 'Deep Work',        sub: 'Yesterday 9:00 AM', badge: '2h 8m'  },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Account', value: 'Kai N.', sub: 'Pro Plan · kai@studio.io' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Ambient nudges',    sub: 'Subtle tips during sessions',     badge: 'On'  },
          { icon: 'bell',     title: 'Morning brief',      sub: 'Day plan set at 8 AM',            badge: 'On'  },
          { icon: 'chart',    title: 'Weekly patterns',    sub: 'Rhythm review every Sunday',      badge: 'On'  },
          { icon: 'alert',    title: 'Distraction block',  sub: 'Auto-block during focus',         badge: 'Off' },
        ]},
        { type: 'text', label: 'Quiet Hours', value: '10:00 PM – 7:30 AM · All notifications silenced.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'focus',    label: 'Focus',    icon: 'eye'      },
    { id: 'insights', label: 'Insights', icon: 'chart'    },
    { id: 'log',      label: 'Log',      icon: 'list'     },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'bask-mock', 'BASK — Interactive Mock');
console.log('Mock live at:', result.url);
