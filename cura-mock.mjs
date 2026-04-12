// cura-mock.mjs — CURA Svelte interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CURA',
  tagline:   'Your longevity OS, distilled',
  archetype: 'health-longevity',
  palette: {
    bg:      '#0F0E0C',
    surface: '#1C1A17',
    text:    '#F5F0E8',
    accent:  '#E8821A',
    accent2: '#4ADE80',
    muted:   'rgba(168,158,140,0.45)',
  },
  lightPalette: {
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1C1A17',
    accent:  '#C86B0A',
    accent2: '#16A34A',
    muted:   'rgba(28,26,23,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Health Score', value: '87', sub: '↑ +4 pts vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Recovery', value: '92%' },
          { label: 'Readiness', value: '84%' },
          { label: 'Stress', value: 'Low' },
        ]},
        { type: 'text', label: 'CURA INSIGHT', value: 'Your HRV is 12% above baseline — ideal conditions for high-intensity training today.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Heart Rate', sub: 'Resting', badge: '58 bpm' },
          { icon: 'eye', title: 'Sleep Quality', sub: '7h 32m', badge: '82/100' },
          { icon: 'zap', title: 'Glucose', sub: 'Stable', badge: '94 mg/dL' },
          { icon: 'map', title: 'Steps', sub: '56% goal', badge: '4,210' },
        ]},
      ],
    },
    {
      id: 'body', label: 'Body',
      content: [
        { type: 'metric-row', items: [
          { label: 'Heart Rate', value: '58 bpm' },
          { label: 'HRV', value: '68 ms' },
        ]},
        { type: 'metric', label: 'Recovery Score', value: '92%', sub: 'Full recovery · Green zone' },
        { type: 'progress', items: [
          { label: 'Active Calories', pct: 76 },
          { label: 'Exercise Time', pct: 93 },
          { label: 'Stand Hours', pct: 67 },
          { label: 'VO2 Estimate', pct: 88 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Active Calories', sub: '76% goal', badge: '381 kcal' },
          { icon: 'heart', title: 'Resting HR', sub: '↓ improving', badge: '52 bpm' },
        ]},
      ],
    },
    {
      id: 'mind', label: 'Mind',
      content: [
        { type: 'metric', label: 'Focus Score', value: '78', sub: 'Above average — blue zone' },
        { type: 'tags', label: 'Sleep Stages', items: ['Awake 12m', 'Light 148m', 'Deep 110m', 'REM 92m'] },
        { type: 'progress', items: [
          { label: 'Awake', pct: 5 },
          { label: 'Light Sleep', pct: 41 },
          { label: 'Deep Sleep', pct: 30 },
          { label: 'REM', pct: 25 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Stress Level', sub: '28/100', badge: 'Low' },
          { icon: 'check', title: 'Meditation', sub: 'Today', badge: '12 min' },
          { icon: 'zap', title: 'Mindfulness Streak', sub: '🔥', badge: '14 days' },
          { icon: 'layers', title: 'Deep Work', sub: '4h 10m', badge: '3 sessions' },
        ]},
      ],
    },
    {
      id: 'nourish', label: 'Nourish',
      content: [
        { type: 'metric', label: 'Calories Today', value: '1,840', sub: '560 remaining · On track' },
        { type: 'progress', items: [
          { label: 'Protein', pct: 75 },
          { label: 'Fat', pct: 85 },
          { label: 'Carbs', pct: 90 },
          { label: 'Fiber', pct: 80 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Eggs & avocado toast', sub: '7:42 AM · 480 kcal', badge: 'P +32g' },
          { icon: 'star', title: 'Grilled chicken salad', sub: '1:15 PM · 620 kcal', badge: 'P +54g' },
          { icon: 'star', title: 'Greek yogurt & berries', sub: '4:00 PM · 210 kcal', badge: 'P +14g' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Week 12 of 52', value: '57%', sub: '4 of 7 goals on track' },
        { type: 'progress', items: [
          { label: 'VO2 Max: 50+', pct: 72 },
          { label: 'Body Comp 18%', pct: 85 },
          { label: 'Sleep Quality 85+', pct: 96 },
          { label: 'Daily Steps 10K', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'VO2 Max: 50+', sub: '46.2 / 50', badge: 'On track' },
          { icon: 'chart', title: 'Body Comp 18%', sub: '20.1% → 18%', badge: '2 months' },
          { icon: 'eye', title: 'Sleep Quality 85+', sub: '82 / 85', badge: 'Almost' },
          { icon: 'map', title: 'Daily Steps 10K', sub: '6,200 avg', badge: 'Behind' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',   icon: 'home'     },
    { id: 'body',    label: 'Body',    icon: 'activity' },
    { id: 'mind',    label: 'Mind',    icon: 'eye'      },
    { id: 'nourish', label: 'Nourish', icon: 'heart'    },
    { id: 'goals',   label: 'Goals',   icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cura-mock', 'CURA — Interactive Mock');
console.log('Mock live at:', result.url);
