// vein-mock.mjs -- VEIN Svelte interactive mock

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VEIN',
  tagline:   'Biometric intelligence, alive in the dark',
  archetype: 'health-dark',

  palette: {
    bg:      '#0E0B09',
    surface: '#1A1410',
    text:    '#F5EDE4',
    accent:  '#F97316',
    accent2: '#FB7185',
    muted:   'rgba(196,168,130,0.4)',
  },

  lightPalette: {
    bg:      '#FDF8F3',
    surface: '#FFFFFF',
    text:    '#1A1210',
    accent:  '#D4580A',
    accent2: '#E05070',
    muted:   'rgba(26,18,16,0.4)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Readiness Score', value: '94', sub: 'Peak -- optimal for training' },
        { type: 'metric-row', items: [
          { label: 'Resting HR', value: '58 bpm' },
          { label: 'SpO2', value: '97%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sleep', value: '7h 22m' },
          { label: 'Energy', value: '2,840 cal' },
        ]},
        { type: 'progress', items: [
          { label: 'Activity Ring', pct: 78 },
          { label: 'HRV Score', pct: 62 },
          { label: 'Sleep Quality', pct: 85 },
        ]},
        { type: 'text', label: 'Peak Focus Window', value: '10:00 -- 12:30 -- Optimal for deep work today' },
        { type: 'tags', label: 'Today', items: ['7-day streak', 'Prime readiness', 'HRV up'] },
      ],
    },
    {
      id: 'heart', label: 'Heart',
      content: [
        { type: 'metric', label: 'Current Heart Rate', value: '72 BPM', sub: 'Resting -- Normal range' },
        { type: 'metric-row', items: [
          { label: 'Min HR', value: '52' },
          { label: 'Max HR', value: '115' },
          { label: 'Avg HR', value: '68' },
        ]},
        { type: 'progress', items: [
          { label: 'Rest Zone (52%)', pct: 52 },
          { label: 'Light Zone (30%)', pct: 30 },
          { label: 'Cardio Zone (14%)', pct: 14 },
          { label: 'Peak Zone (4%)', pct: 4 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Weekly Trend', sub: 'Avg HR down 3 BPM from last week', badge: 'v' },
          { icon: 'heart', title: 'Max HR', sub: '115 BPM -- 10:22 AM during interval run', badge: '!' },
        ]},
        { type: 'text', label: 'Zone Summary', value: 'Healthy distribution -- majority resting and light zones indicate good aerobic base.' },
      ],
    },
    {
      id: 'sleep', label: 'Sleep',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '81', sub: 'Good -- 7h 22m total' },
        { type: 'metric-row', items: [
          { label: 'Deep', value: '1h 28m' },
          { label: 'REM', value: '3h 6m' },
          { label: 'Light', value: '2h 40m' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Sleep', pct: 20 },
          { label: 'REM Sleep', pct: 42 },
          { label: 'Light Sleep', pct: 36 },
          { label: 'Awake', pct: 2 },
        ]},
        { type: 'text', label: 'Sleep Insight', value: 'Deep sleep +18 min vs your average. REM peaked 3--6 AM -- great memory consolidation window.' },
        { type: 'tags', label: 'Tonight', items: ['Bedtime: 10:45 PM', '8h 15m target', 'Consistent schedule'] },
      ],
    },
    {
      id: 'recovery', label: 'Recovery',
      content: [
        { type: 'metric', label: 'Recovery Score', value: '94', sub: 'Peak Readiness -- all systems go' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '68 ms' },
          { label: 'Resting HR', value: '58 bpm' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Respiratory', value: '14 /min' },
          { label: 'Body Temp', value: '97.1 F' },
        ]},
        { type: 'progress', items: [
          { label: 'HRV Score', pct: 68 },
          { label: 'HR Recovery', pct: 58 },
          { label: 'Respiratory', pct: 56 },
          { label: 'Temperature', pct: 97 },
        ]},
        { type: 'text', label: "Today's Plan", value: 'High-intensity training window: 10 AM -- 2 PM. Hydrate +600ml. Avoid high carbs pre-workout.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'HRV trend improving', sub: 'Up 12% over 3 weeks -- strong parasympathetic recovery', badge: '+12%' },
          { icon: 'eye', title: 'REM cycles lengthening', sub: 'Avg REM 3h 6m -- top 15% for your age group', badge: '3h 6m' },
          { icon: 'zap', title: 'Peak output window found', sub: 'Best performance consistently 3--4 hrs after waking', badge: '94' },
          { icon: 'heart', title: 'Breathwork correlation', sub: 'Box breathing nights: HRV averages 8ms higher next morning', badge: '+8ms' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Cardiovascular', 'Sleep', 'Performance', 'Recovery'] },
        { type: 'text', label: 'Next Steps', value: 'Schedule high-focus work at 10:30 AM. Continue box breathing. Maintain bedtime at 10:45 PM.' },
      ],
    },
  ],

  nav: [
    { id: 'home',     label: 'Home',     icon: 'home'     },
    { id: 'heart',    label: 'Heart',    icon: 'heart'    },
    { id: 'sleep',    label: 'Sleep',    icon: 'eye'      },
    { id: 'recovery', label: 'Recovery', icon: 'activity' },
    { id: 'insights', label: 'Insights', icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vein-mock', 'VEIN -- Interactive Mock');
console.log('Mock live at:', result.url);
