import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VELD',
  tagline:   'Know your footprint. Own your future.',
  archetype: 'sustainability-tracker',
  palette: {
    bg:      '#1A2016',
    surface: '#232E1E',
    text:    '#E8F0E2',
    accent:  '#6AB757',
    accent2: '#D4883A',
    muted:   'rgba(232,240,226,0.45)',
  },
  lightPalette: {
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#1C1A17',
    accent:  '#4E7A43',
    accent2: '#C07830',
    muted:   'rgba(28,26,23,0.40)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'This Week', value: '4.2 kg', sub: 'CO₂ · ↓12% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Travel', value: '1.8 kg' },
          { label: 'Food', value: '1.1 kg' },
          { label: 'Energy', value: '0.8 kg' },
        ]},
        { type: 'progress', items: [
          { label: 'Weekly Goal (5.0 kg)', pct: 84 },
          { label: 'Monthly Goal (20 kg)', pct: 42 },
        ]},
        { type: 'tags', label: 'Active Goals', items: ['Under 5 kg/wk ✓', 'Bike 3×/wk', 'Vegetarian Mon'] },
        { type: 'text', label: 'Today\'s Tip', value: 'Try cycling to work — saves ~0.4 kg CO₂ per trip.' },
      ],
    },
    {
      id: 'breakdown',
      label: 'Breakdown',
      content: [
        { type: 'metric', label: 'Total Footprint', value: '4.2 kg', sub: 'This week · 6% below average' },
        { type: 'progress', items: [
          { label: 'Travel  43%', pct: 43 },
          { label: 'Food  26%', pct: 26 },
          { label: 'Energy  19%', pct: 19 },
          { label: 'Shopping  7%', pct: 7 },
          { label: 'Other  5%', pct: 5 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Travel', sub: '1.8 kg CO₂ this week', badge: '43%' },
          { icon: 'zap', title: 'Food & Drink', sub: '1.1 kg CO₂ this week', badge: '26%' },
          { icon: 'home', title: 'Energy', sub: '0.8 kg CO₂ this week', badge: '19%' },
        ]},
      ],
    },
    {
      id: 'track',
      label: 'Track',
      content: [
        { type: 'metric', label: 'Today', value: '0.54 kg', sub: 'CO₂ logged so far' },
        { type: 'list', items: [
          { icon: 'map', title: 'Morning commute', sub: 'Bus · 8.2 km', badge: '0.14' },
          { icon: 'heart', title: 'Lunch — veggie bowl', sub: 'Food · Plant-based', badge: '0.32' },
          { icon: 'grid', title: 'Grocery shopping', sub: 'Shopping · Local store', badge: '0.08' },
        ]},
        { type: 'tags', label: 'Quick Log', items: ['🚗 Drive', '✈ Fly', '🚌 Transit', '🚲 Bike', '🍽 Meal'] },
        { type: 'text', label: 'Streak', value: '🔥 12-day streak — keep going!' },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Primary Goal', value: '60%', sub: 'Reduce to 3.5 kg/wk by June' },
        { type: 'progress', items: [
          { label: 'Reduce to 3.5 kg/wk', pct: 60 },
          { label: 'Vegetarian 3× per week', pct: 67 },
          { label: 'Zero flights this month', pct: 100 },
          { label: 'Bike to work 3× week', pct: 33 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Track for 7 days', sub: 'Completed Mar 28', badge: '✓' },
          { icon: 'check', title: 'Under 5 kg/week', sub: 'Completed Apr 2', badge: '✓' },
          { icon: 'star', title: 'Under 4 kg/week', sub: '0.2 kg to go', badge: '→' },
          { icon: 'star', title: 'Under 3.5 kg/week', sub: 'Main target', badge: '…' },
        ]},
      ],
    },
    {
      id: 'recommendations',
      label: 'For You',
      content: [
        { type: 'text', label: 'Top Recommendation', value: 'Switch to green energy at home — save up to 1.2 kg CO₂/day.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Bike to work', sub: 'Saves 0.42 kg CO₂/day', badge: 'High' },
          { icon: 'heart', title: 'Plant-based Monday', sub: 'Saves 0.6 kg CO₂/week', badge: 'Med' },
          { icon: 'grid', title: 'Buy secondhand', sub: 'Saves 0.2 kg CO₂/item', badge: 'Low' },
          { icon: 'home', title: 'Lower thermostat 2°', sub: 'Saves 0.15 kg CO₂/day', badge: 'Med' },
        ]},
        { type: 'tags', label: 'Filter by', items: ['All', 'Travel', 'Food', 'Home', 'Shopping'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Monthly Progress', value: '−32%', sub: 'Reduction since January' },
        { type: 'metric-row', items: [
          { label: 'Jan avg', value: '6.2 kg' },
          { label: 'Apr avg', value: '4.2 kg' },
          { label: 'Target', value: '3.5 kg' },
        ]},
        { type: 'progress', items: [
          { label: 'You  4.2 kg', pct: 42 },
          { label: 'App avg  5.8 kg', pct: 58 },
          { label: 'Country avg  8.3 kg', pct: 83 },
          { label: 'Paris target  2.0 kg', pct: 20 },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Maya R.', sub: 'logged a car-free week', badge: '2h' },
          { icon: 'user', title: 'James K.', sub: 'hit first monthly goal', badge: '5h' },
          { icon: 'user', title: 'Priya M.', sub: 'reduced food footprint 40%', badge: '1d' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'breakdown', label: 'Footprint', icon: 'chart' },
    { id: 'track', label: 'Track', icon: 'plus' },
    { id: 'goals', label: 'Goals', icon: 'star' },
    { id: 'insights', label: 'Insights', icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'veld-mock', 'VELD — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/veld-mock');
