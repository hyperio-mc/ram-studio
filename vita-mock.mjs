import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'VITA',
  tagline: 'Daily longevity, made ritual',
  archetype: 'health-longevity',

  // Dark palette (required)
  palette: {
    bg:      '#1A1A14',
    surface: '#242420',
    text:    '#EDE9E2',
    accent:  '#6B9A6B',
    accent2: '#C9885E',
    muted:   'rgba(237,233,226,0.4)',
  },

  // Light palette (warm cream — matches the design)
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#5A7A5A',
    accent2: '#B87350',
    muted:   'rgba(120,113,108,0.5)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Vitality Score', value: '78', sub: '↑ 4 pts from last week' },
        { type: 'metric-row', items: [
          { label: 'Movement', value: '65%' },
          { label: 'Sleep', value: '82%' },
          { label: 'Nourish', value: '71%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Breathwork', sub: '8:00 AM · 5 min box breathing', badge: '✓' },
          { icon: 'check', title: 'Cold Exposure', sub: '8:15 AM · 3 min cold shower', badge: '✓' },
          { icon: 'check', title: '30 min Movement', sub: '9:00 AM · Zone 2 cardio', badge: '✓' },
          { icon: 'check', title: 'Protein Breakfast', sub: '9:30 AM · Greek yogurt + berries', badge: '✓' },
          { icon: 'activity', title: 'Afternoon Walk', sub: '2:00 PM · Pending', badge: '→' },
          { icon: 'activity', title: 'Evening Journal', sub: '9:00 PM · Pending', badge: '→' },
        ]},
        { type: 'tags', label: 'Streak', items: ['🔥 14 Days', 'Week 12', 'Longevity Protocol'] },
      ],
    },
    {
      id: 'rituals',
      label: 'Rituals',
      content: [
        { type: 'text', label: 'Your Ritual Stack', value: '6 morning · 3 evening rituals active' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Breathwork', sub: 'Box breathing · 4-4-4-4 · 5 min', badge: '21d' },
          { icon: 'zap', title: 'Cold Exposure', sub: 'Cold shower or ice bath · 3 min', badge: '14d' },
          { icon: 'heart', title: 'Zone 2 Cardio', sub: 'Low-intensity aerobic · 30 min', badge: '9d' },
          { icon: 'eye', title: 'Sunlight', sub: '10 min outdoor light exposure', badge: '18d' },
          { icon: 'star', title: 'Journaling', sub: 'Reflection + gratitude log · 10 min', badge: '6d' },
        ]},
        { type: 'progress', items: [
          { label: 'Morning completion', pct: 80 },
          { label: 'Evening completion', pct: 55 },
          { label: 'Weekly streak rate', pct: 92 },
        ]},
      ],
    },
    {
      id: 'nourish',
      label: 'Nourish',
      content: [
        { type: 'metric', label: 'Calories Today', value: '1,840', sub: 'of 2,200 kcal goal' },
        { type: 'metric-row', items: [
          { label: 'Protein', value: '142g' },
          { label: 'Carbs', value: '168g' },
          { label: 'Fat', value: '72g' },
          { label: 'Water', value: '6/8' },
        ]},
        { type: 'progress', items: [
          { label: 'Protein (142 / 180g)', pct: 79 },
          { label: 'Carbohydrates (168 / 220g)', pct: 76 },
          { label: 'Fat (72 / 80g)', pct: 90 },
          { label: 'Hydration (6 / 8 glasses)', pct: 75 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Breakfast', sub: 'Greek yogurt, berries, granola · 8:30 AM', badge: '420' },
          { icon: 'star', title: 'Lunch', sub: 'Salmon bowl, quinoa, avocado · 12:15 PM', badge: '680' },
          { icon: 'star', title: 'Snack', sub: 'Almonds + apple · 3:00 PM', badge: '210' },
          { icon: 'star', title: 'Dinner', sub: 'Chicken, sweet potato, greens · 6:30 PM', badge: '530' },
        ]},
      ],
    },
    {
      id: 'sleep',
      label: 'Sleep',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '84', sub: '7h 22min total · Last night' },
        { type: 'metric-row', items: [
          { label: 'Efficiency', value: '91%' },
          { label: 'Deep', value: '1h 48m' },
          { label: 'REM', value: '1h 56m' },
          { label: 'Awake', value: '12min' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Sleep quality', pct: 88 },
          { label: 'REM ratio', pct: 78 },
          { label: 'Sleep efficiency', pct: 91 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'HRV: 52ms', sub: 'Above your 7-day average', badge: '↑' },
          { icon: 'heart', title: 'Resting HR: 58 bpm', sub: 'Consistent with baseline', badge: '→' },
          { icon: 'alert', title: 'Late sleep onset', sub: 'Try shifting bedtime 30 min earlier', badge: '!' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'Week of Apr 7–13', value: 'Vitality trending up 8% — strongest week in a month.' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '52ms' },
          { label: 'Resting HR', value: '58bpm' },
          { label: 'VO2 Est.', value: '44.2' },
          { label: 'Recovery', value: '76%' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon — 62', pct: 62 },
          { label: 'Tue — 71', pct: 71 },
          { label: 'Wed — 68', pct: 68 },
          { label: 'Thu — 75', pct: 75 },
          { label: 'Fri — 78', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Zone 2 Cardio', sub: '2 more sessions this week for VO2 gain', badge: '!' },
          { icon: 'star', title: 'Sleep Timing', sub: 'Aim for 10:30 PM bedtime consistently', badge: '→' },
          { icon: 'zap', title: 'Protein Intake', sub: 'Hit 160g+ today and tomorrow', badge: '→' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'rituals',  label: 'Rituals',  icon: 'list' },
    { id: 'nourish',  label: 'Nourish',  icon: 'heart' },
    { id: 'sleep',    label: 'Sleep',    icon: 'eye' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vita-mock', 'VITA — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/vita-mock`);
