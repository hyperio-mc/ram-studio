import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PIQUE',
  tagline:   'Personal Style Intelligence',
  archetype: 'fashion-curation',
  palette: {
    bg:      '#2A1F1B',
    surface: '#3D2E28',
    text:    '#FDFAF6',
    accent:  '#C07A56',
    accent2: '#7BA897',
    muted:   'rgba(253,250,246,0.45)',
  },
  lightPalette: {
    bg:      '#FDFAF6',
    surface: '#F5EFE8',
    text:    '#2A1F1B',
    accent:  '#C07A56',
    accent2: '#7BA897',
    muted:   'rgba(42,31,27,0.45)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'For You', value: 'Côte d\'Azur Edit', sub: '3 pieces tagged · Tap pins to explore' },
        { type: 'metric-row', items: [
          { label: 'Pieces', value: '24' },
          { label: 'Annotations', value: '47' },
          { label: 'Match', value: '88%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Wrap Dress', sub: 'Silk chiffon · 3 pins', badge: '✦' },
          { icon: 'heart', title: 'Linen Jacket', sub: 'ARKET · 67% linen', badge: '↗' },
          { icon: 'eye', title: 'Raffia Tote', sub: 'Jacquemus · 2 pins', badge: '→' },
        ]},
        { type: 'tags', label: 'Occasion Filter', items: ['All', 'Everyday', 'Evening', 'Holiday', 'Smart'] },
      ],
    },
    {
      id: 'detail', label: 'Item Detail',
      content: [
        { type: 'metric', label: 'Linen Safari Jacket', value: '£189', sub: 'ARKET · Spring Collection 2026' },
        { type: 'progress', items: [
          { label: 'Your Style Match', pct: 88 },
          { label: 'Occasion Fit', pct: 76 },
          { label: 'Palette Harmony', pct: 92 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Fabric', value: '67% Linen' },
          { label: 'Care', value: 'Hand wash' },
          { label: 'Pins', value: '3' },
        ]},
        { type: 'tags', label: 'Annotations', items: ['Italian lapel', '67% linen', 'Patch pocket', 'Self-belt'] },
        { type: 'text', label: 'Style Notes', value: 'Elevated casual anchor piece. Pairs with tailored trousers or a maxi skirt. The relaxed structure works across smart casual and holiday occasions.' },
      ],
    },
    {
      id: 'wardrobe', label: 'Wardrobe',
      content: [
        { type: 'metric', label: 'My Wardrobe', value: '24', sub: 'pieces · 6 complete outfits' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Linen Jacket', sub: 'ARKET · 3 pins · Worn 4×', badge: '3' },
          { icon: 'layers', title: 'Wrap Dress', sub: 'Réalisation · 4 pins · Worn 7×', badge: '4' },
          { icon: 'layers', title: 'Raffia Tote', sub: 'Jacquemus · 2 pins · Worn 12×', badge: '2' },
          { icon: 'layers', title: 'Midi Dress', sub: 'Sandro · 5 pins · Worn 2×', badge: '5' },
          { icon: 'layers', title: 'Cream Blazer', sub: 'COS · 2 pins · Worn 6×', badge: '2' },
        ]},
        { type: 'tags', label: 'Filter by', items: ['All', 'Tops', 'Dresses', 'Bags', 'Shoes'] },
      ],
    },
    {
      id: 'style', label: 'Style Profile',
      content: [
        { type: 'metric', label: 'Your Archetype', value: 'The Minimalist', sub: 'Clean lines · Neutral palette · Quality over quantity' },
        { type: 'metric-row', items: [
          { label: 'Style Score', value: '91' },
          { label: 'Outfits', value: '6' },
          { label: 'Top %', value: '12%' },
        ]},
        { type: 'progress', items: [
          { label: 'Everyday', pct: 72 },
          { label: 'Smart Casual', pct: 55 },
          { label: 'Evening', pct: 38 },
          { label: 'Holiday', pct: 64 },
        ]},
        { type: 'tags', label: 'Palette', items: ['Warm Sand 28%', 'Sage 22%', 'Oat 18%', 'Lavender 14%'] },
        { type: 'text', label: 'Style Insight', value: 'Your wardrobe tells a consistent story: earthy neutrals with occasional pale pastels. You invest in quality basics and shy away from bold prints.' },
      ],
    },
    {
      id: 'builder', label: 'Outfit Builder',
      content: [
        { type: 'metric', label: 'Build Outfit', value: 'Smart Casual', sub: 'Occasion selected' },
        { type: 'progress', items: [
          { label: 'Outfit Harmony', pct: 82 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Linen Safari Jacket', sub: 'Hero piece · ARKET', badge: '✦' },
          { icon: 'check', title: 'Wide-Leg Trousers', sub: 'Oat colour · COS', badge: '✓' },
          { icon: 'plus', title: 'Add shoes…', sub: 'AI suggests tan sandals', badge: '+' },
        ]},
        { type: 'text', label: 'AI Suggestion', value: 'Add tan leather sandals to complete the earthy palette story. Heel height under 5cm keeps this firmly in smart casual territory.' },
        { type: 'tags', label: 'Occasion', items: ['Smart Casual', 'Evening', 'Holiday'] },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'star' },
    { id: 'wardrobe', label: 'Wardrobe', icon: 'layers' },
    { id: 'style',    label: 'Style',    icon: 'heart' },
    { id: 'builder',  label: 'Build',    icon: 'plus' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pique-mock', 'PIQUE — Interactive Mock');
console.log('Mock live at:', result.url);
