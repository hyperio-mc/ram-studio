// mare-mock.mjs — Svelte interactive mock for MARE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MARE',
  tagline:   'Sleep Intelligence Platform',
  archetype: 'sleep-health-wearable',
  palette: {           // DARK theme — deep midnight + bioluminescent green
    bg:      '#06080F',
    surface: '#0D1120',
    text:    '#DCE8F5',
    accent:  '#00E5A0',
    accent2: '#6B52FF',
    muted:   'rgba(220,232,245,0.38)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#EFF4FB',
    surface: '#FFFFFF',
    text:    '#080C18',
    accent:  '#00B882',
    accent2: '#5B44E0',
    muted:   'rgba(8,12,24,0.42)',
  },
  screens: [
    {
      id: 'score', label: 'Score',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '87', sub: 'Good · Top 18% of your age group' },
        { type: 'metric-row', items: [
          { label: 'Deep Sleep', value: '1h 42m' },
          { label: 'REM',        value: '2h 08m' },
          { label: 'Efficiency', value: '91%'    },
        ]},
        { type: 'progress', items: [
          { label: 'Awake  ·  6%',  pct: 6   },
          { label: 'Light  ·  38%', pct: 38  },
          { label: 'Deep   ·  27%', pct: 68  },
          { label: 'REM    ·  34%', pct: 86  },
        ]},
        { type: 'tags', label: 'Stage Breakdown', items: ['Awake 18m', 'Light 2h24m', 'Deep 1h42m', 'REM 2h08m'] },
        { type: 'text', label: 'AI Insight', value: 'Your deep sleep peaks on nights you stop screens before 10pm.' },
      ],
    },
    {
      id: 'stages', label: 'Stages',
      content: [
        { type: 'metric', label: 'Total Sleep', value: '7h 32m', sub: 'Mar 27 — 11:08pm → 7:16am' },
        { type: 'progress', items: [
          { label: 'Deep  ·  1h 42m', pct: 27  },
          { label: 'REM   ·  2h 08m', pct: 34  },
          { label: 'Light ·  2h 24m', pct: 38  },
          { label: 'Awake ·  18m',    pct: 5   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sleep Onset', value: '12 min' },
          { label: 'Consistency', value: '84/100' },
        ]},
        { type: 'text', label: 'Hypnogram', value: 'Deep sleep dominant 1–3am · Two full REM cycles · Wake-up in light stage ✓' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Light sleep', sub: '2h 24m · 38%', badge: '→' },
          { icon: 'star',     title: 'Deep sleep',  sub: '1h 42m · 27%', badge: '✓' },
          { icon: 'eye',      title: 'REM sleep',   sub: '2h 08m · 34%', badge: '✓' },
          { icon: 'zap',      title: 'Awake time',  sub: '18m · 5%',     badge: '→' },
        ]},
      ],
    },
    {
      id: 'trends', label: 'Trends',
      content: [
        { type: 'metric', label: '30-Day Average', value: '85.2', sub: '↑ +4.1 pts vs last month — improving' },
        { type: 'metric-row', items: [
          { label: 'January',  value: '76' },
          { label: 'February', value: '81' },
          { label: 'March',    value: '85' },
        ]},
        { type: 'progress', items: [
          { label: 'Best week · Mar 17–23', pct: 91  },
          { label: 'This week · Mar 24–28', pct: 87  },
          { label: 'Last week · Mar 10–16', pct: 82  },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Best nights: Sun & Wed',     sub: 'Consistent pattern',    badge: '✦' },
          { icon: 'activity', title: 'Deep sleep peak: 2h 04m',    sub: 'Top 10%',               badge: '✓' },
          { icon: 'heart',    title: 'HRV trending up',            sub: 'Recovery improving',    badge: '↑' },
        ]},
        { type: 'text', label: 'Sleep Debt', value: 'Sleep debt this week: 38 min · Recover with +19 min on weekends.' },
      ],
    },
    {
      id: 'recovery', label: 'Recovery',
      content: [
        { type: 'metric', label: 'Readiness Score', value: '82', sub: 'Ready to train — recovery strong' },
        { type: 'metric-row', items: [
          { label: 'HRV',      value: '58ms' },
          { label: 'Rest. HR', value: '52bpm' },
          { label: 'SpO₂',    value: '97%'  },
        ]},
        { type: 'progress', items: [
          { label: 'HRV · ↑ +4ms vs baseline',    pct: 72  },
          { label: 'Resting HR · ↓ optimal',       pct: 88  },
          { label: 'Body Temp · +0.1° baseline',   pct: 50  },
          { label: 'SpO₂ · normal range',          pct: 97  },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Hydrate early',   sub: '500ml within 30min of waking',       badge: '✓' },
          { icon: 'check',  title: 'Light movement',  sub: '20-min walk boosts HRV today',        badge: '✓' },
          { icon: 'alert',  title: 'Limit caffeine',  sub: 'Delay first coffee until 10am',       badge: '!' },
        ]},
      ],
    },
    {
      id: 'coach', label: 'Coach',
      content: [
        { type: 'metric', label: 'Wind-Down Protocol', value: '1h 28m', sub: 'Until target bedtime — 10:30pm' },
        { type: 'list', items: [
          { icon: 'check', title: '9:30pm — Dim lights to warm', sub: 'Done', badge: '✓' },
          { icon: 'check', title: '9:45pm — End screen use',     sub: 'Done', badge: '✓' },
          { icon: 'play',  title: '10:00pm — 4-7-8 breathing',  sub: '3 min · Active now', badge: '▶' },
          { icon: 'list',  title: '10:15pm — Room at 18–19°C',  sub: 'Upcoming', badge: '·' },
          { icon: 'eye',   title: '10:30pm — Lights off',       sub: 'Target', badge: '·' },
        ]},
        { type: 'text', label: 'Tonight\'s Goal', value: 'Sleep score target: 88+ · Focus: maximize deep sleep window 12–3am.' },
        { type: 'tags', label: 'Protocols', items: ['4-7-8 Breathing', 'Screen cutoff', 'Cool room', 'Dark env'] },
      ],
    },
  ],
  nav: [
    { id: 'score',    label: 'Score',    icon: 'star'     },
    { id: 'stages',   label: 'Stages',   icon: 'activity' },
    { id: 'trends',   label: 'Trends',   icon: 'chart'    },
    { id: 'recovery', label: 'Recovery', icon: 'heart'    },
    { id: 'coach',    label: 'Coach',    icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'mare-mock', 'MARE — Interactive Sleep Intelligence Mock');
console.log('Mock live at:', result.url);
