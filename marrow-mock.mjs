import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MARROW',
  tagline:   'nourish from within',
  archetype: 'wellness-nutrition',

  palette: {
    bg:      '#F8F5EF',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#4A7A46',
    accent2: '#B87A3A',
    muted:   'rgba(26,21,16,0.45)',
  },

  lightPalette: {
    bg:      '#F8F5EF',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#4A7A46',
    accent2: '#B87A3A',
    muted:   'rgba(26,21,16,0.4)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Calories today', value: '1,247', sub: '/ 1,800 kcal goal · 69% reached' },
        { type: 'metric-row', items: [
          { label: 'Protein', value: '82g' },
          { label: 'Carbs', value: '145g' },
          { label: 'Fat', value: '38g' },
        ]},
        { type: 'progress', items: [
          { label: 'Protein (82 / 120g)', pct: 68 },
          { label: 'Carbs (145 / 200g)', pct: 73 },
          { label: 'Fat (38 / 65g)', pct: 58 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Overnight oats + berries', sub: '8:30 am — Breakfast', badge: '312' },
          { icon: 'check', title: 'Grain bowl with tahini', sub: '12:15 pm — Lunch', badge: '580' },
          { icon: 'heart', title: 'Apple + almond butter', sub: '3:40 pm — Snack', badge: '210' },
          { icon: 'plus', title: 'Dinner not logged yet', sub: 'Tap to log your evening meal', badge: '+' },
        ]},
      ],
    },
    {
      id: 'nutrients',
      label: 'Nutrients',
      content: [
        { type: 'metric', label: 'Nutrient Score', value: '73', sub: '/ 100 — Good · Protein & fibre on track' },
        { type: 'progress', items: [
          { label: 'Protein 82 / 120g', pct: 68 },
          { label: 'Carbohydrates 145 / 200g', pct: 73 },
          { label: 'Fat 38 / 65g', pct: 58 },
          { label: 'Fibre 18 / 25g', pct: 72 },
          { label: 'Calories 1,247 / 1,800', pct: 69 },
        ]},
        { type: 'tags', label: 'Vitamins & Minerals', items: ['Vit C 94%', 'B12 82%', 'Calcium 68%', 'Mg 57%', 'Iron 42%', 'Vit D 28%'] },
        { type: 'text', label: 'Focus today', value: 'Vitamin D and Iron are below target. Consider oily fish, leafy greens, or a short walk for sunlight exposure.' },
      ],
    },
    {
      id: 'habits',
      label: 'Habits',
      content: [
        { type: 'metric-row', items: [
          { label: 'Water', value: '1.6L' },
          { label: 'Steps', value: '4.3K' },
          { label: 'Sleep', value: '7h14' },
        ]},
        { type: 'progress', items: [
          { label: 'Hydration (1.6 / 2.5L)', pct: 64 },
          { label: 'Movement (4,280 / 10,000 steps)', pct: 43 },
          { label: 'Sleep quality — Good', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Logged meals', sub: 'Consistent 8 days running', badge: '8🔥' },
          { icon: 'activity', title: 'Water goal', sub: '0.9L remaining today', badge: '64%' },
          { icon: 'chart', title: 'Daily steps', sub: '5,720 steps to goal', badge: '43%' },
          { icon: 'star', title: 'Sleep 7h+', sub: 'Target met — 7h 14m', badge: '✓' },
        ]},
        { type: 'text', label: '8-day streak 🔥', value: 'Best streak: 21 days. Keep going — consistency beats perfection.' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'This week\'s headline', value: '+23%', sub: 'more protein than last week — excellent progress' },
        { type: 'metric-row', items: [
          { label: 'Avg daily', value: '1,642' },
          { label: 'Best day', value: 'Tue' },
          { label: 'Deficit', value: '−158' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday 1,680 kcal', pct: 93 },
          { label: 'Tuesday 1,920 kcal', pct: 107 },
          { label: 'Wednesday 1,540 kcal', pct: 86 },
          { label: 'Thursday 1,820 kcal', pct: 101 },
          { label: 'Friday 1,247 kcal (in progress)', pct: 69 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Vitamin D — very low', sub: 'Try: oily fish, eggs, sunlight', badge: '28%' },
          { icon: 'alert', title: 'Iron — below goal', sub: 'Try: legumes, leafy greens, seeds', badge: '42%' },
          { icon: 'activity', title: 'Omega-3 — low', sub: 'Try: walnuts, flaxseed, salmon', badge: '35%' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Mercer', value: '38', sub: 'days logged · Maintaining goal' },
        { type: 'metric-row', items: [
          { label: 'Streak', value: '8d 🔥' },
          { label: 'Avg score', value: '71' },
          { label: 'Weeks', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Daily calories', sub: 'Maintaining goal', badge: '1,800' },
          { icon: 'activity', title: 'Protein target', sub: 'Muscle maintenance', badge: '120g' },
          { icon: 'home', title: 'Water intake', sub: 'Hydration goal', badge: '2.5L' },
          { icon: 'map', title: 'Daily steps', sub: 'Active lifestyle', badge: '10K' },
        ]},
        { type: 'tags', label: 'Connected apps', items: ['Apple Health', 'Strava', 'Oura Ring'] },
      ],
    },
  ],

  nav: [
    { id: 'today',     label: 'Today',    icon: 'home' },
    { id: 'nutrients', label: 'Nutrients', icon: 'activity' },
    { id: 'habits',    label: 'Habits',   icon: 'heart' },
    { id: 'insights',  label: 'Insights', icon: 'chart' },
    { id: 'profile',   label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'marrow-mock', 'MARROW — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/marrow-mock');
