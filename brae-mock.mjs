import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG = 'brae';

const design = {
  appName:   'Brae',
  tagline:   'Local harvest companion',
  archetype: 'food-sustainability',

  palette: {
    bg:      '#1A2218',
    surface: '#222E1F',
    text:    '#E8EDE5',
    accent:  '#6DBF72',
    accent2: '#D4824A',
    muted:   'rgba(200,215,195,0.45)',
  },

  lightPalette: {
    bg:      '#FAF7F0',
    surface: '#FFFFFF',
    text:    '#1C2B1C',
    accent:  '#3D6B44',
    accent2: '#C17A42',
    muted:   'rgba(107,124,107,0.5)',
  },

  screens: [
    {
      id: 'harvest',
      label: 'Harvest',
      content: [
        { type: 'metric', label: 'Week 18 Box', value: '7 items', sub: 'Arriving Thursday · 2 farms' },
        { type: 'metric-row', items: [
          { label: 'Active farms', value: '2' },
          { label: 'Seasonal match', value: '94%' },
          { label: 'CO₂ saved', value: '1.2 kg' },
        ]},
        { type: 'tags', label: 'This week', items: ['🥬 Chard', '🍅 Tomatoes', '🫚 Celeriac', '🌿 Kale', '🎃 Squash'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Rainbow Chard', sub: 'Foxhollow Farm · Greens', badge: '⚡ Use first' },
          { icon: 'star', title: 'Beef Tomatoes', sub: 'Foxhollow Farm · Nightshade', badge: '500g' },
          { icon: 'layers', title: 'Celeriac', sub: 'Stonebury Hill · Root veg', badge: '1 large' },
        ]},
      ],
    },
    {
      id: 'farms',
      label: 'Farms',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active subs', value: '2' },
          { label: 'Weekly spend', value: '£30' },
          { label: 'Miles radius', value: '34 mi' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Foxhollow Farm', sub: 'Somerset · 12 miles · Thu delivery', badge: '✓ Active' },
          { icon: 'map', title: 'Stonebury Hill', sub: 'Devon · 34 miles · Alt. Mon', badge: '◌ Paused' },
        ]},
        { type: 'text', label: 'Foxhollow Farm', value: 'Weekly veg box · £18/wk · Member since 2023 · ★ 4.9' },
        { type: 'progress', items: [
          { label: 'Seasonal coverage', pct: 94 },
          { label: 'Local radius target', pct: 68 },
        ]},
      ],
    },
    {
      id: 'box',
      label: 'My Box',
      content: [
        { type: 'text', label: 'Delivery status', value: 'Picked → Packed → Transit → Delivering Thursday' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Rainbow Chard', sub: 'Wilt quickly — use first · Foxhollow', badge: '🔴 Soon' },
          { icon: 'check', title: 'Beef Tomatoes', sub: 'Vine ripened on farm · 500g', badge: '🍅' },
          { icon: 'layers', title: 'Celeriac', sub: 'Keeps 2–3 weeks · Stonebury', badge: '1 large' },
          { icon: 'heart', title: 'Kale', sub: 'Massaged salads or sauté · 200g', badge: '🌿' },
          { icon: 'star', title: 'Butternut Squash', sub: 'Roast at 200°C · 40 min', badge: '🎃' },
          { icon: 'grid', title: 'Charlotte Potatoes', sub: 'Waxy — best boiled · 750g', badge: '🥔' },
        ]},
        { type: 'metric', label: 'Items confirmed', value: '5 of 7', sub: '2 items en route from farm' },
      ],
    },
    {
      id: 'recipes',
      label: 'Recipes',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Quick', 'Veggie', 'Batch cook'] },
        { type: 'metric', label: 'Featured this week', value: 'Roasted Tomato Tart', sub: '45 min · Easy · 4 servings' },
        { type: 'list', items: [
          { icon: 'star', title: 'Celeriac Remoulade', sub: 'Uses: Celeriac · 15 min', badge: 'Easy' },
          { icon: 'activity', title: 'Kale & Potato Soup', sub: 'Uses: Kale, Potatoes · 35 min', badge: 'Easy' },
          { icon: 'layers', title: 'Butternut Risotto', sub: 'Uses: Squash · 50 min', badge: 'Medium' },
          { icon: 'heart', title: 'Chard & Egg Galette', sub: 'Uses: Chard · 30 min', badge: 'Easy' },
        ]},
        { type: 'progress', items: [
          { label: 'Recipes made this month', pct: 62 },
        ]},
      ],
    },
    {
      id: 'impact',
      label: 'Impact',
      content: [
        { type: 'metric', label: '2026 CO₂ saved', value: '14.2 kg', sub: 'Equivalent to 3 car journeys avoided' },
        { type: 'metric-row', items: [
          { label: 'Local spend', value: '£312' },
          { label: 'Farms backed', value: '4' },
          { label: 'Recipes made', value: '38' },
        ]},
        { type: 'progress', items: [
          { label: 'Seasonal eating score', pct: 78 },
          { label: 'Local sourcing rate', pct: 91 },
          { label: 'Zero-waste score', pct: 65 },
        ]},
        { type: 'text', label: 'Top 15% of Brae members', value: 'Swap 1 tropical fruit for a local berry each week to reach 85% seasonal score.' },
        { type: 'tags', label: 'Badges earned', items: ['🌿 Harvester', '🌍 Low Carbon', '🥬 Seasonal Pro'] },
      ],
    },
  ],

  nav: [
    { id: 'harvest', label: 'Harvest', icon: 'home' },
    { id: 'farms',   label: 'Farms',   icon: 'map' },
    { id: 'box',     label: 'My Box',  icon: 'layers' },
    { id: 'recipes', label: 'Recipes', icon: 'star' },
    { id: 'impact',  label: 'Impact',  icon: 'heart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, `${SLUG}-mock`, `${design.appName} — Interactive Mock`);
console.log(`Mock: ${result.status} → https://ram.zenbin.org/${SLUG}-mock`);
