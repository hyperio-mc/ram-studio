import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'CAMPO',
  tagline: 'Seasonal Food & Local Farm Discovery',
  archetype: 'lifestyle',
  palette: {
    bg:      '#2A1A0E',
    surface: '#3D2A1A',
    text:    '#F5F0E8',
    accent:  '#D97C2A',
    accent2: '#4D7A56',
    muted:   'rgba(245,240,232,0.45)',
  },
  lightPalette: {
    bg:      '#F6F2EB',
    surface: '#FFFFFF',
    text:    '#1C160C',
    accent:  '#8B5E3C',
    accent2: '#4D7A56',
    muted:   'rgba(28,22,12,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Spring Season', value: '18 in season', sub: 'Near Chamonix · April 9 · Markets open today' },
        { type: 'metric-row', items: [
          { label: 'Markets Open', value: '2' },
          { label: 'Farms Nearby', value: '11' },
          { label: 'This Week', value: '€84' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Chamonix Saturday Market', sub: '8am–1pm · 0.4km · 68 stalls', badge: 'OPEN' },
          { icon: 'map', title: 'Les Houches Farm Stand',   sub: '9am–12pm · 4.2km · 12 vendors', badge: 'CLOSED' },
        ]},
        { type: 'text', label: 'Freshest Right Now', value: 'Asparagus (Ferme du Lac) · Wild Ramps (Alpine Roots) · Snap Peas (Vallée Verte) · Spinach (La Bergerie)' },
        { type: 'tags', label: 'Quick Actions', items: ['Browse Markets', 'What\'s in Season', 'Add to Pantry', 'Log Purchase'] },
      ],
    },
    {
      id: 'markets',
      label: 'Markets',
      content: [
        { type: 'metric-row', items: [
          { label: 'Nearby', value: '8' },
          { label: 'Open Now', value: '2' },
          { label: 'Saved', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Chamonix Saturday Market',  sub: 'Sat · Sun · 0.4km · 68 stalls · ★ 4.9', badge: 'OPEN' },
          { icon: 'map', title: 'Les Houches Farm Stand',    sub: 'Tue · Fri · 4.2km · 12 vendors · ★ 4.8', badge: 'CLOSED'},
          { icon: 'map', title: 'Servoz Harvest Market',     sub: 'Thu · 8.7km · 24 stalls · ★ 4.7',        badge: 'CLOSED'},
          { icon: 'map', title: 'Argentière Alpine Growers', sub: 'Sat · 12.3km · 31 stalls · ★ 4.9',       badge: 'CLOSED'},
          { icon: 'map', title: 'Sallanches Bio Market',     sub: 'Wed · Sat · 18.1km · 45 stalls · ★ 4.6', badge: 'OPEN' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Open Now', 'Organic', 'Year-round', 'Weekend'] },
      ],
    },
    {
      id: 'farm',
      label: 'Farm Detail',
      content: [
        { type: 'metric', label: 'Ferme du Lac', value: '★ 4.9', sub: 'Chamonix-Mont-Blanc · Est. 1987 · Certified Organic · Biodynamic' },
        { type: 'metric-row', items: [
          { label: 'Hectares', value: '14' },
          { label: 'Products', value: '38' },
          { label: 'At market', value: 'Sat' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Asparagus',   sub: 'Picked yesterday · €3.50/bunch',  badge: 'FRESH' },
          { icon: 'activity', title: 'Wild Ramps',  sub: 'Picked this morning · €5.00/bag', badge: 'TODAY' },
          { icon: 'activity', title: 'Fiddleheads', sub: 'Picked today · €4.00/100g',       badge: 'TODAY' },
          { icon: 'activity', title: 'Baby Spinach',sub: 'Picked yesterday · €2.80/bag',    badge: 'FRESH' },
        ]},
        { type: 'tags', label: 'Actions', items: ['Save Farm', 'Get Alerts', 'Get Directions', 'Share'] },
      ],
    },
    {
      id: 'season',
      label: 'Season',
      content: [
        { type: 'metric', label: 'April · Chamonix Region', value: '18 in season', sub: 'Spring at peak · 8 items hitting full availability this week' },
        { type: 'progress', items: [
          { label: 'Asparagus — Peak (90%)',   pct: 90 },
          { label: 'Wild Ramps — Peak (85%)',  pct: 85 },
          { label: 'Spinach — Peak (95%)',     pct: 95 },
          { label: 'Radishes — Available (70%)', pct: 70 },
          { label: 'Snap Peas — Available (55%)',pct: 55 },
          { label: 'Watercress — End (30%)',   pct: 30 },
          { label: 'Leeks — End (25%)',        pct: 25 },
        ]},
        { type: 'text', label: 'April Pairing', value: 'Asparagus + ramps + poached eggs — all three at peak together this week. Best window: next 12 days.' },
        { type: 'tags', label: 'Month', items: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] },
      ],
    },
    {
      id: 'pantry',
      label: 'Pantry',
      content: [
        { type: 'metric-row', items: [
          { label: 'In Stock', value: '24' },
          { label: 'Shopping List', value: '7' },
          { label: '% Local', value: '78%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Asparagus',      sub: 'Ferme du Lac · 2 bunches needed',    badge: 'GET' },
          { icon: 'alert', title: 'Free-range eggs',sub: 'Poulet Alpin · 1 dozen needed',      badge: 'GET' },
          { icon: 'activity', title: 'Wild garlic', sub: 'Any forager stall · 1 bag',          badge: 'LIST'},
          { icon: 'activity', title: 'Alpine cheese',sub: 'Fromagerie Cham. · 200g',           badge: 'LIST'},
          { icon: 'check', title: 'Carrots',        sub: 'Ferme du Lac · in stock · 2 days ago',badge: 'OK' },
          { icon: 'check', title: 'Kale',           sub: 'Vallée Verte · in stock · today',    badge: 'OK' },
        ]},
        { type: 'tags', label: 'View', items: ['All', 'Shopping List', 'In Stock', 'Running Low'] },
      ],
    },
    {
      id: 'profile',
      label: 'You',
      content: [
        { type: 'metric', label: 'Sophie Muller — Chamonix', value: 'Local Champion', sub: 'Member since Jan 2024 · CAMPO verified buyer' },
        { type: 'metric-row', items: [
          { label: 'Markets', value: '47' },
          { label: 'Farms', value: '12' },
          { label: 'CO₂ Saved', value: '18kg' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Ferme du Lac',   sub: 'Organic · Vegetables · Saved farm', badge: '★ 4.9' },
          { icon: 'star', title: 'Alpine Roots',   sub: 'Biodynamic · Mixed · Saved farm',   badge: '★ 4.8' },
          { icon: 'star', title: 'Ruche du Mont',  sub: 'Artisan · Honey · Saved farm',      badge: '★ 4.9' },
        ]},
        { type: 'text', label: 'Your Food Values', value: 'Organic · Biodynamic · Local · Seasonal. Badges: Early Spring, Market Regular, 5 Farms Saved, Zero Waste Week, Local Champion.' },
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',   icon: '◉' },
    { id: 'markets', label: 'Markets', icon: '⊟' },
    { id: 'season',  label: 'Season',  icon: '◈' },
    { id: 'pantry',  label: 'Pantry',  icon: '◇' },
    { id: 'profile', label: 'You',     icon: '◎' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'campo-mock', 'CAMPO — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/campo-mock`);
