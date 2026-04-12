import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'STRIDE',
  tagline:   'Athletic Performance OS',
  archetype: 'sports-performance',
  palette: {           // DARK theme
    bg:      '#161210',
    surface: '#1E1C1A',
    text:    '#F2EEE8',
    accent:  '#4A7AF0',
    accent2: '#33D990',
    muted:   'rgba(242,238,232,0.42)',
  },
  lightPalette: {      // LIGHT theme — warm ivory, electric blue, vivid green
    bg:      '#F6F2EC',
    surface: '#FFFFFF',
    text:    '#161210',
    accent:  '#1D56E8',
    accent2: '#00C875',
    muted:   'rgba(22,18,16,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',   label: 'Good morning, ARIA', value: 'WEEK 14 · Friday' },
        { type: 'metric', label: "TODAY'S PLAN", value: '12.4', sub: 'km · Easy aerobic · Zone 2' },
        { type: 'metric-row', items: [
          { label: 'WEEK KM',  value: '38.2' },
          { label: 'TIME',     value: '4h28' },
          { label: 'TSS LOAD', value: '724'  },
        ]},
        { type: 'list', items: [
          { icon: 'play',     title: 'Sat — Long Run',  sub: '18 km · Zone 2',  badge: '↑' },
          { icon: 'activity', title: 'Sun — Rest',      sub: 'Recovery day',    badge: '—' },
          { icon: 'zap',      title: 'Mon — Tempo',     sub: '8 km · Zone 4',   badge: '!' },
        ]},
        { type: 'text', label: 'Readiness', value: '◉ Score 87 — Great, ready to train hard today' },
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'metric', label: 'ELAPSED TIME', value: '38:42', sub: 'Active recording' },
        { type: 'metric-row', items: [
          { label: 'DISTANCE', value: '6.84 km'  },
          { label: 'PACE',     value: '5:39 /km' },
        ]},
        { type: 'metric', label: 'HEART RATE', value: '154', sub: 'bpm · Zone 3 — Aerobic' },
        { type: 'progress', items: [
          { label: 'Lap 1  5:42', pct: 60 },
          { label: 'Lap 2  5:39', pct: 70 },
          { label: 'Lap 3  5:36', pct: 80 },
        ]},
        { type: 'tags', label: 'HR Zones', items: ['Z1', 'Z2', 'Z3 ●', 'Z4', 'Z5'] },
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'text',   label: 'Personal Records', value: '5K: 21:08 · 10K: 44:22 · HM: 1:38' },
        { type: 'metric-row', items: [
          { label: 'LOAD',  value: '724'  },
          { label: 'FORM',  value: '+12'  },
          { label: 'VO₂MAX',value: '56.3' },
        ]},
        { type: 'progress', items: [
          { label: 'Week 8',  pct: 76 },
          { label: 'Week 9',  pct: 69 },
          { label: 'Week 10', pct: 93 },
          { label: 'Week 13', pct: 100 },
          { label: 'Week 14', pct: 69 },
        ]},
        { type: 'text', label: 'Best Session', value: '◉ Threshold Run Tue 25 Mar — New 8K PR!' },
        { type: 'text', label: 'Pace Trend',   value: '5:42 → 5:33 /km  ↓ 9s over 7 weeks' },
      ],
    },
    {
      id: 'recover', label: 'Recover',
      content: [
        { type: 'metric', label: 'READINESS SCORE', value: '87', sub: '/ 100 · Great — hard training OK' },
        { type: 'progress', items: [
          { label: 'Sleep Quality', pct: 91 },
          { label: 'HRV',           pct: 78 },
          { label: 'Resting HR',    pct: 62 },
          { label: 'Muscle Fatigue',pct: 58 },
        ]},
        { type: 'metric', label: 'SLEEP', value: '8h 14m', sub: '10:44 PM → 6:58 AM' },
        { type: 'text', label: 'AI Recommendation', value: 'Readiness high. Good day for threshold workout.' },
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'text', label: 'March 2026', value: '210.4 km · 17h 28m · 28 sessions' },
        { type: 'list', items: [
          { icon: 'play', title: 'Tempo Run',  sub: 'Thu 27 Mar · 8.2 km · 4:48/km',   badge: '39m'  },
          { icon: 'play', title: 'Easy Run',   sub: 'Wed 26 Mar · 10.5 km · 6:02/km',  badge: '1h3m' },
          { icon: 'zap',  title: 'Intervals',  sub: 'Tue 25 Mar · 7.4 km · 4:10/km',   badge: '44m'  },
          { icon: 'play', title: 'Long Run',   sub: 'Sun 23 Mar · 18.1 km · 5:48/km',  badge: '1h45' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'text',   label: 'ARIA REEVES', value: 'Intermediate · Marathon training · Boston Qualifier Apr 2027' },
        { type: 'metric-row', items: [
          { label: 'DAYS',  value: '342'   },
          { label: 'KM',    value: '1,840' },
          { label: 'RACES', value: '18'    },
        ]},
        { type: 'progress', items: [
          { label: 'Boston 2027 goal progress', pct: 38 },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Units',         sub: 'km / pace',         badge: '›' },
          { icon: 'heart',    title: 'HR Zones',      sub: 'Lactate method',    badge: '›' },
          { icon: 'map',      title: 'GPS Device',    sub: 'Garmin 965',        badge: '›' },
          { icon: 'bell',     title: 'Notifications', sub: 'Run reminders on',  badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',   icon: 'home'     },
    { id: 'session', label: 'Train',   icon: 'play'     },
    { id: 'stats',   label: 'Stats',   icon: 'chart'    },
    { id: 'recover', label: 'Recover', icon: 'activity' },
    { id: 'profile', label: 'Me',      icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'stride-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
