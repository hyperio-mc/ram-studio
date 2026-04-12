// larder-mock.mjs — Svelte 5 interactive mock for LARDER
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LARDER',
  tagline:   'Know every ingredient, from soil to plate.',
  archetype: 'food-provenance-intelligence',

  palette: {           // DARK fallback
    bg:      '#1A1410',
    surface: '#2A201C',
    text:    '#F4EFE6',
    accent:  '#C84831',
    accent2: '#D97706',
    muted:   'rgba(244,239,230,0.40)',
  },

  lightPalette: {      // LIGHT theme — primary
    bg:      '#F4EFE6',
    surface: '#FAFAF7',
    text:    '#1A1410',
    accent:  '#C84831',
    accent2: '#5B7B5E',
    muted:   'rgba(26,20,16,0.42)',
  },

  screens: [
    {
      id: 'harvest', label: "Today's Harvest",
      content: [
        { type: 'metric', label: "Arriving Today", value: '14', sub: '3 more than yesterday' },
        { type: 'metric-row', items: [
          { label: 'Suppliers', value: '6' },
          { label: 'End Soon', value: '2' },
          { label: 'Certified', value: '9' },
        ]},
        { type: 'tags', label: 'Active Farms', items: ['Hawkstone', 'Solé Grains', 'Fernhill', 'Cob & Co', 'The Salt House'] },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Purple Heritage Carrots', sub: '08:00 · Hawkstone Farm · CERTIFIED', badge: 'Today' },
          { icon: 'star',     title: 'White Truffle, Grade A',  sub: '10:30 · Solé Grains · PREMIUM',    badge: 'Today' },
          { icon: 'activity', title: 'Veal Sweetbreads',        sub: '11:00 · Cob & Co · CHILLED',        badge: 'Today' },
        ]},
      ],
    },
    {
      id: 'suppliers', label: 'Suppliers',
      content: [
        { type: 'metric', label: 'Active Partnerships', value: '18', sub: '4 new this season' },
        { type: 'list', items: [
          { icon: 'check',  title: 'Hawkstone Farm',       sub: 'Devon, UK · 34 mi · Organic',    badge: '98' },
          { icon: 'star',   title: 'Solé Grains',          sub: 'Périgord, FR · Import · Premium', badge: '97' },
          { icon: 'heart',  title: 'Fernhill Dairy',       sub: 'Somerset, UK · 12 mi · Certified',badge: '95' },
          { icon: 'layers', title: 'Cob & Co Meats',       sub: 'Yorkshire, UK · 56 mi · Heritage', badge: '96' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Organic', 'Local', 'Seasonal', 'Certified'] },
      ],
    },
    {
      id: 'ingredient', label: 'Ingredient',
      content: [
        { type: 'metric', label: 'Purple Heritage Carrots', value: '94%', sub: 'Freshness score · Hawkstone Farm · Lot #HF-2024-C7' },
        { type: 'metric-row', items: [
          { label: 'Moisture', value: '82%' },
          { label: 'Brix',     value: '8.2°' },
          { label: 'Days Old', value: '2' },
        ]},
        { type: 'progress', items: [
          { label: 'Freshness', pct: 94 },
          { label: 'Moisture',  pct: 82 },
          { label: 'Quality',   pct: 96 },
        ]},
        { type: 'tags', label: 'Certifications', items: ['ORGANIC', 'IN SEASON', 'LOCAL', 'TRACEABLE'] },
        { type: 'text', label: "Chef's Note", value: "Best roasted at 200°C with thyme and preserved lemon. Pairs beautifully with pan-seared duck." },
      ],
    },
    {
      id: 'calendar', label: 'Seasonal',
      content: [
        { type: 'text', label: 'Peak Season — March', value: 'Currently at peak: Rhubarb, Purple Carrots, Wild Garlic, Jersey Royals, Morel Mushrooms.' },
        { type: 'progress', items: [
          { label: 'Rhubarb',         pct: 95 },
          { label: 'Purple Carrots',  pct: 92 },
          { label: 'Wild Garlic',     pct: 88 },
          { label: 'Morel Mushroom',  pct: 84 },
          { label: 'Jersey Royals',   pct: 76 },
          { label: 'Blood Orange',    pct: 71 },
          { label: 'Sea Kale',        pct: 68 },
        ]},
        { type: 'tags', label: 'Coming Next Week', items: ['Asparagus', 'Samphire', 'Elderflower'] },
      ],
    },
    {
      id: 'orders', label: 'Orders',
      content: [
        { type: 'metric', label: 'This Week', value: '£2,840', sub: '12 orders · 94% on-time' },
        { type: 'metric-row', items: [
          { label: 'Confirmed', value: '4' },
          { label: 'In Transit', value: '3' },
          { label: 'Delivered', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Hawkstone Farm',  sub: '3 items · 12 kg · Thu 27',  badge: '£186' },
          { icon: 'activity', title: 'Solé Grains',     sub: '1 item · 250 g · Thu 27',   badge: '£310' },
          { icon: 'check',    title: 'Fernhill Dairy',  sub: '5 items · 8 kg · Wed 26',   badge: '£124' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['+ New Order', 'Export CSV', 'Set Budget'] },
      ],
    },
  ],

  nav: [
    { id: 'harvest',    label: 'Harvest',   icon: 'home'     },
    { id: 'suppliers',  label: 'Suppliers', icon: 'layers'   },
    { id: 'ingredient', label: 'Ingredient',icon: 'star'     },
    { id: 'calendar',   label: 'Seasonal',  icon: 'calendar' },
    { id: 'orders',     label: 'Orders',    icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'axon-mock', 'LARDER — Interactive Mock');
console.log('Mock live at:', result.url);
