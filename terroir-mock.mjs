import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'TERROIR',
  tagline: 'Discover artisan foods & drinks from around the world',
  archetype: 'artisan-food-discovery',
  palette: {
    bg: '#1C1410',
    surface: '#2C1F18',
    text: '#F5EFE8',
    accent: '#C4622D',
    accent2: '#7B9E6B',
    muted: 'rgba(245,239,232,0.4)',
  },
  lightPalette: {
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    text: '#2C1A0E',
    accent: '#C4622D',
    accent2: '#7B9E6B',
    muted: 'rgba(44,26,14,0.4)',
  },
  screens: [
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Featured Drop', value: 'Umbrian Truffle Oil', sub: 'Umbria, Italy · Cold-pressed · Limited' },
        { type: 'metric-row', items: [{ label: 'Makers', value: '140+' }, { label: 'Countries', value: '28' }, { label: 'Products', value: '800+' }] },
        { type: 'tags', label: 'Trending', items: ['Matcha 🍵', 'Raw Honey 🍯', 'Olive Oil 🫒', 'Spice 🌶️'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Ceremonial Matcha', sub: 'Nakai Tea House · Uji, Japan', badge: '$32' },
          { icon: 'heart', title: 'Wildflower Raw Honey', sub: 'Miels de Provence · France', badge: '$28' },
          { icon: 'star', title: 'Fleur de Sel', sub: 'Salinas del Mañana · Brittany', badge: '$22' },
        ]},
      ],
    },
    {
      id: 'product',
      label: 'Product',
      content: [
        { type: 'metric', label: 'Frantoio Muraglia · Andria, Italy', value: 'Coratina EVOO', sub: '★★★★★  4.9  (142 tasting notes)' },
        { type: 'tags', label: 'Tasting Notes', items: ['Peppery', 'Grassy', 'Artichoke', 'Citrus', 'Almond'] },
        { type: 'text', label: 'Maker Story', value: 'Cold-pressed within 4 hours of harvest from century-old Coratina trees. Polyphenol count: 680 mg/kg — among Italy\'s highest.' },
        { type: 'metric-row', items: [{ label: 'Price', value: '$52' }, { label: 'Volume', value: '500ml' }, { label: 'Harvest', value: '2025' }] },
        { type: 'progress', items: [{ label: 'Fruitiness', pct: 72 }, { label: 'Bitterness', pct: 85 }, { label: 'Pungency', pct: 90 }] },
      ],
    },
    {
      id: 'collections',
      label: 'Collections',
      content: [
        { type: 'metric', label: 'Curated', value: '12 Collections', sub: 'Updated weekly by our artisan experts' },
        { type: 'list', items: [
          { icon: 'star', title: 'The Japan Pack', sub: '12 products · from $28', badge: '🇯🇵' },
          { icon: 'star', title: 'Mediterranean Table', sub: '8 products · from $32', badge: '🫒' },
          { icon: 'heart', title: 'Honey World Tour', sub: '6 items · from $22', badge: '🍯' },
          { icon: 'zap', title: 'Heat Seeker', sub: '9 items · from $18', badge: '🌶️' },
          { icon: 'star', title: 'Morning Ritual', sub: '5 items · from $24', badge: '☕' },
        ]},
      ],
    },
    {
      id: 'makers',
      label: 'Makers',
      content: [
        { type: 'metric', label: 'Artisan Network', value: '140 Makers', sub: '28 countries · all direct relationships' },
        { type: 'list', items: [
          { icon: 'user', title: 'Nakai Tea House', sub: 'Uji, Kyoto · Matcha & Gyokuro', badge: '12' },
          { icon: 'user', title: 'Frantoio Muraglia', sub: 'Andria, Puglia · EVOO', badge: '7' },
          { icon: 'user', title: 'Miels de Provence', sub: 'Luberon, France · Raw Honey', badge: '4' },
          { icon: 'user', title: 'Salinas del Mañana', sub: 'Guerande, Brittany · Sea Salt', badge: '3' },
        ]},
        { type: 'tags', label: 'Regions', items: ['Japan', 'Italy', 'France', 'Spain', 'Georgia'] },
      ],
    },
    {
      id: 'cellar',
      label: 'My Cellar',
      content: [
        { type: 'metric-row', items: [{ label: 'Saved', value: '3' }, { label: 'Orders', value: '2' }, { label: 'Total Spent', value: '$284' }] },
        { type: 'list', items: [
          { icon: 'heart', title: 'Ceremonial Matcha', sub: 'Nakai Tea House', badge: '$32' },
          { icon: 'heart', title: 'Coratina EVOO', sub: 'Frantoio Muraglia', badge: '$52' },
          { icon: 'heart', title: 'Wildflower Raw Honey', sub: 'Miels de Provence', badge: '$28' },
        ]},
        { type: 'text', label: 'Active Order', value: 'Order #TR-2847 — In Transit · Japan Pack × 1 · ETA: Mar 28' },
        { type: 'metric', label: 'Bag Total', value: '$80', sub: 'Free shipping unlocked · Checkout →' },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'home' },
    { id: 'product', label: 'Search', icon: 'search' },
    { id: 'collections', label: 'Collections', icon: 'star' },
    { id: 'makers', label: 'Makers', icon: 'user' },
    { id: 'cellar', label: 'Cellar', icon: 'heart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'terroir-mock', 'TERROIR — Interactive Mock');
console.log('Mock live at:', result.url);
