// GRAIN — Svelte 5 interactive mock
// Light theme primary: warm stone / sage / terracotta fabric transparency app
// Dark theme: deep forest earth tones with terracotta accent

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'GRAIN',
  tagline:   'know what you wear',
  archetype: 'fashion-tech',

  // DARK palette (required by builder)
  palette: {
    bg:      '#131512',
    surface: '#1C2018',
    text:    '#EDE9E2',
    accent:  '#7DAE85',   // lighter sage for dark bg
    accent2: '#D4875A',   // lighter terra for dark bg
    muted:   'rgba(237,233,226,0.4)',
  },

  // LIGHT palette (primary — warm stone editorial)
  lightPalette: {
    bg:      '#F7F5F1',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#5E8A66',   // sage — eco positive
    accent2: '#C4763A',   // terracotta — care / warmth
    muted:   'rgba(28,25,22,0.45)',
  },

  screens: [
    {
      id: 'closet',
      label: 'Closet',
      content: [
        { type: 'metric', label: 'MY CLOSET', value: 'Eco Score 76', sub: '24 garments · 6 need attention' },
        { type: 'tags', label: 'Filter', items: ['All', '🌿 Eco', '⚠️ Synthetic', '♻️ Recycled', '🌾 Natural'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Linen Chore Coat', sub: 'Everlane · 72% linen', badge: '84 🌿' },
          { icon: 'heart', title: 'Merino Crewneck', sub: 'Uniqlo · 100% merino', badge: '91 🌿' },
          { icon: 'map',   title: 'Slim Chinos', sub: 'COS · 98% cotton 2% elastane', badge: '71 🌿' },
          { icon: 'play',  title: 'Tech Fleece', sub: 'Nike · 65% polyester', badge: '38 ⚠️' },
          { icon: 'check', title: 'Oxford Shirt', sub: 'Muji · 100% organic cotton', badge: '88 🌿' },
        ]},
        { type: 'text', label: '✦ Closet insight', value: 'Your top fabrics: linen (34%), cotton (28%), merino (18%). Great natural fibre ratio.' },
      ],
    },

    {
      id: 'detail',
      label: 'Item Detail',
      content: [
        { type: 'metric', label: 'EVERLANE · LINEN CHORE COAT', value: 'Eco Score 84', sub: 'Natural · Low impact · Biodegradable' },
        { type: 'metric-row', items: [
          { label: 'Fibres', value: '3 types' },
          { label: 'Origin', value: 'Portugal' },
          { label: 'Added', value: 'Feb 2026' },
        ]},
        { type: 'tags', label: 'Composition', items: ['72% Linen', '22% Organic Cotton', '6% Elastane'] },
        { type: 'list', items: [
          { icon: 'star',  title: '🫧 Wash cool 30°', sub: 'Preserve fibre integrity', badge: 'Care' },
          { icon: 'heart', title: '🚫 No tumble dry', sub: 'Linen relaxes when flat-dried', badge: 'Care' },
          { icon: 'map',   title: '♻️ Biodegradable', sub: 'Linen + cotton compositable', badge: 'EoL' },
          { icon: 'check', title: '💧 Low water', sub: '~3.8L/wash vs cotton avg', badge: 'Impact' },
        ]},
        { type: 'text', label: '✦ GRAIN note', value: 'Linen improves with washing — it softens over time. The 6% elastane reduces recyclability slightly.' },
      ],
    },

    {
      id: 'materials',
      label: 'Materials',
      content: [
        { type: 'metric', label: 'MATERIAL LIBRARY', value: '80+ fibres', sub: 'Natural · Synthetic · Recycled · Blended' },
        { type: 'tags', label: 'Category', items: ['Natural', 'Synthetic', 'Recycled', 'Semi-synthetic', 'Novel'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Linen (Flax)', sub: 'Natural · Low water · Biodegradable', badge: '92 🌿' },
          { icon: 'star',  title: 'Merino Wool', sub: 'Natural · Protein fibre · Anti-odour', badge: '88 🌿' },
          { icon: 'check', title: 'Organic Cotton', sub: 'Natural · Certified · GOTS', badge: '79 🌿' },
          { icon: 'map',   title: 'Tencel (Lyocell)', sub: 'Semi-synthetic · Closed-loop', badge: '85 🌿' },
          { icon: 'play',  title: 'Recycled Polyester', sub: 'Synthetic · rPET · Sheds micros', badge: '54 ⚠️' },
        ]},
        { type: 'text', label: '✦ Did you know?', value: 'Tencel uses 80% less water than cotton and is produced in a closed-loop solvent process — almost nothing is wasted.' },
      ],
    },

    {
      id: 'impact',
      label: 'Impact',
      content: [
        { type: 'metric', label: 'YOUR CLOSET IMPACT', value: 'Score 76 / 100', sub: 'Better than 68% of wardrobes' },
        { type: 'metric-row', items: [
          { label: '💧 Water', value: 'Low' },
          { label: '🌡 Carbon', value: 'Medium' },
          { label: '♻️ End-of-life', value: 'Good' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Natural fibres', sub: '80% of your closet by weight', badge: '↑ Great' },
          { icon: 'heart', title: 'Synthetic count', sub: '4 garments with microplastic risk', badge: '⚠️ Flag' },
          { icon: 'map',   title: 'Washing habits', sub: '30° avg — you\'re saving energy', badge: '↑ Great' },
          { icon: 'check', title: 'Longevity score', sub: 'Avg. 2.8 years per garment', badge: '→ Avg' },
        ]},
        { type: 'text', label: '✦ Next step', value: 'Swap 1 polyester item for linen or wool this season — your score jumps to 82.' },
      ],
    },

    {
      id: 'scan',
      label: 'Scan',
      content: [
        { type: 'metric', label: 'SCAN A LABEL', value: 'Add to closet', sub: 'Point at any care/composition label' },
        { type: 'text', label: 'How it works', value: 'Photograph the fabric composition label inside your garment. GRAIN reads the fibre mix, country of origin, and care symbols automatically.' },
        { type: 'tags', label: 'Or enter manually', items: ['Cotton %', 'Polyester %', 'Wool %', 'Linen %', 'Other'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Recent scan: Oxford Shirt', sub: '100% Organic Cotton · Egypt', badge: '88 🌿' },
          { icon: 'star',  title: 'Recent scan: Running Tights', sub: '78% Nylon 22% Elastane', badge: '29 ⚠️' },
          { icon: 'heart', title: 'Recent scan: Linen Dress', sub: '100% Linen · Lithuania', badge: '94 🌿' },
        ]},
        { type: 'text', label: '✦ Scan tip', value: 'Labels are usually at the back collar, left side seam, or waistband interior. GRAIN also accepts barcode scans for supported brands.' },
      ],
    },
  ],
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
design.nav = [
  { id: 'closet',    label: 'Closet',    icon: 'star'  },
  { id: 'detail',   label: 'Detail',    icon: 'heart' },
  { id: 'materials', label: 'Materials', icon: 'map'   },
  { id: 'impact',   label: 'Impact',    icon: 'check' },
  { id: 'scan',     label: 'Scan',      icon: 'play'  },
];

// ─── BUILD + PUBLISH ──────────────────────────────────────────────────────────
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('grain-mock.html', html);
console.log('✓ Mock HTML saved locally (grain-mock.html)');
console.log(`  Size: ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'grain-mock', 'GRAIN — know what you wear · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published but no URL returned:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  grain-mock.html saved locally — will publish when quota resets Apr 23');
}
