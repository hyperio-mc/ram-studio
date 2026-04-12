import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'VITALS',
  tagline: 'Personal Health Dashboard',
  archetype: 'health',
  palette: {
    bg:      '#030014',
    surface: '#0D0A1F',
    text:    '#FFFFFF',
    accent:  '#FC5F2B',
    accent2: '#00B982',
    muted:   'rgba(255,255,255,0.45)',
  },
  lightPalette: {
    bg:      '#F4F2FF',
    surface: '#FFFFFF',
    text:    '#0E0C1A',
    accent:  '#FC5F2B',
    accent2: '#00B982',
    muted:   'rgba(14,12,26,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Good morning, Alex — Thursday, Apr 10', value: 'Ready to perform', sub: 'Readiness 87 · HRV 58ms · Resting HR 52 bpm · Sleep 7h 42m' },
        { type: 'metric-row', items: [
          { label: 'Readiness', value: '87' },
          { label: 'HRV',       value: '58ms' },
          { label: 'Sleep',     value: '7h 42m' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Heart Rate',  sub: '52 bpm resting · Zone 2 ready',      badge: '↑ CORAL'   },
          { icon: 'activity', title: 'Sleep',        sub: '7h 42m · 91% efficiency · REM 1h 54m', badge: '↑ PURPLE' },
          { icon: 'activity', title: 'HRV',          sub: '58ms · +4ms from baseline · Good',   badge: '↑ TEAL'    },
          { icon: 'activity', title: 'Recovery',     sub: '87% · 6-day active streak',           badge: '↑ GREEN'   },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['Log Workout', 'Start Session', 'Add Note', 'Trends'] },
      ],
    },
    {
      id: 'heart',
      label: 'Heart',
      content: [
        { type: 'metric', label: 'Heart Rate — Today', value: '52 bpm', sub: 'Resting · Min 48 · Max 161 · Avg 67 · Zone 2 dominant' },
        { type: 'metric-row', items: [
          { label: 'Resting', value: '52' },
          { label: 'Max',     value: '161' },
          { label: 'Zone 2',  value: '43m' },
        ]},
        { type: 'progress', items: [
          { label: 'Zone 1 — Recovery (45–95 bpm)',  pct: 55 },
          { label: 'Zone 2 — Aerobic (96–133 bpm)',  pct: 30 },
          { label: 'Zone 3 — Tempo (134–152 bpm)',   pct: 10 },
          { label: 'Zone 4–5 — Peak (153+ bpm)',     pct: 5  },
        ]},
        { type: 'tags', label: 'View', items: ['24h', '7 days', '30 days', 'All time'] },
      ],
    },
    {
      id: 'sleep',
      label: 'Sleep',
      content: [
        { type: 'metric', label: 'Sleep — Last Night', value: '7h 42m', sub: '91% efficiency · 10:54pm–6:36am · Deep 1h 28m · REM 1h 54m' },
        { type: 'metric-row', items: [
          { label: 'Deep',  value: '1h 28m' },
          { label: 'REM',   value: '1h 54m' },
          { label: 'Light', value: '3h 52m' },
        ]},
        { type: 'progress', items: [
          { label: 'Awake (7%)',  pct: 7  },
          { label: 'Light (51%)', pct: 51 },
          { label: 'Deep (19%)',  pct: 19 },
          { label: 'REM (25%)',   pct: 25 },
        ]},
        { type: 'tags', label: 'Period', items: ['Last night', '7-day avg', '30-day avg', 'Trends'] },
      ],
    },
    {
      id: 'hrv',
      label: 'HRV',
      content: [
        { type: 'metric', label: 'Heart Rate Variability', value: '58ms', sub: '+4ms from baseline · 30-day avg 54ms · Trending up · AI: Good recovery window' },
        { type: 'metric-row', items: [
          { label: 'Today',    value: '58ms' },
          { label: 'Baseline', value: '54ms' },
          { label: 'Delta',    value: '+4ms' },
        ]},
        { type: 'progress', items: [
          { label: '30-day HRV trend (improving)',     pct: 72 },
          { label: 'Stress vs recovery balance (good)', pct: 65 },
          { label: 'Autonomic tone (strong)',           pct: 80 },
        ]},
        { type: 'tags', label: 'AI Insight', items: ['Show', 'Blur', 'Hide', 'What is HRV?'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Insights — AI Analysis', value: 'Peak window: 9am–1pm', sub: 'Based on HRV, sleep, and 30-day pattern · Source: AI · Tap to verify' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Train today',           sub: 'Readiness 87 + HRV +4ms → good zone-2 session.',               badge: 'AI'      },
          { icon: 'star',     title: 'Sleep debt cleared',    sub: '3-night recovery streak → nervous system balanced.',            badge: 'AI'      },
          { icon: 'check',    title: 'Zone 2 on track',       sub: '43m aerobic logged this week of 150m weekly target.',           badge: '29%'     },
          { icon: 'activity', title: 'Evening HRV dip',       sub: 'Screen time after 10pm correlates with lower next-day HRV.',    badge: 'PATTERN' },
        ]},
        { type: 'tags', label: 'AI Provenance', items: ['Show All', 'Blur AI', 'Hide AI', 'Sources'] },
      ],
    },
    {
      id: 'recovery',
      label: 'Recovery',
      content: [
        { type: 'metric', label: 'Recovery — 7-Day View', value: '87%', sub: 'Today · 6-day active streak · Load vs recovery balanced · Ready for hard effort' },
        { type: 'metric-row', items: [
          { label: 'Today',   value: '87%'  },
          { label: 'Avg 7d',  value: '81%'  },
          { label: 'Streak',  value: '6d'   },
        ]},
        { type: 'progress', items: [
          { label: 'Training load (moderate)',  pct: 58 },
          { label: 'Recovery score (high)',     pct: 87 },
          { label: 'Readiness headroom (29%)',  pct: 29 },
        ]},
        { type: 'tags', label: 'Guidance', items: ['Hard effort OK', 'Moderate', 'Rest day', 'Active recovery'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: '◉' },
    { id: 'heart',    label: 'Heart',    icon: '♡' },
    { id: 'sleep',    label: 'Sleep',    icon: '◑' },
    { id: 'hrv',      label: 'HRV',      icon: '◈' },
    { id: 'insights', label: 'Insights', icon: '◇' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vitals-mock', 'VITALS — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/vitals-mock`);
