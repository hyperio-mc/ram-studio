import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FACET',
  tagline:   'Every material tells a story.',
  archetype: 'material-discovery',
  palette: {
    bg:      '#0C0B09',
    surface: '#181714',
    text:    '#E8E3DC',
    accent:  '#C47D2A',
    accent2: '#6B8A9E',
    muted:   'rgba(232,227,220,0.45)',
  },
  lightPalette: {
    bg:      '#F5F2ED',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#A06520',
    accent2: '#4A6A7E',
    muted:   'rgba(26,23,20,0.45)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'Materials Found', value: '12,480', sub: 'Across 18 categories' },
        { type: 'metric-row', items: [
          { label: 'Stone', value: '4.2k' },
          { label: 'Wood', value: '2.8k' },
          { label: 'Metal', value: '1.9k' },
          { label: 'Textile', value: '3.6k' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Calacatta Oro', sub: 'Marble · Carrara, Italy', badge: 'PREMIUM' },
          { icon: 'heart', title: 'Verde Indio', sub: 'Quartzite · Brazil', badge: 'IN STOCK' },
          { icon: 'layers', title: 'Smoked Oak', sub: 'Hardwood · Appalachians, US', badge: 'NEW' },
          { icon: 'zap', title: 'Pewter Zinc', sub: 'Metal · Belgium', badge: '6wk' },
        ]},
        { type: 'tags', label: 'Categories', items: ['All', 'Stone', 'Wood', 'Metal', 'Textile', 'Glass'] },
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'Calacatta Oro', value: '$285', sub: 'Per m² · Marble · Carrara, Italy' },
        { type: 'metric-row', items: [
          { label: 'Thickness', value: '20mm' },
          { label: 'Slab', value: '320×180' },
          { label: 'Lead', value: '6–10wk' },
          { label: 'Origin', value: 'Italy' },
        ]},
        { type: 'progress', items: [
          { label: 'In-stock availability', pct: 72 },
          { label: 'Sustainability score', pct: 88 },
          { label: 'Visual match confidence', pct: 97 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'DOP Certified', sub: 'Declaration of Performance verified' },
          { icon: 'check', title: '840+ Suppliers', sub: 'Compare pricing across regions' },
          { icon: 'map', title: 'Quarry Traceability', sub: 'Full chain-of-custody documentation' },
        ]},
        { type: 'text', label: 'Notes', value: 'Calacatta Oro is characterised by its dramatic veining and warm ivory background. Ideal for statement flooring and bathroom cladding.' },
      ],
    },
    {
      id: 'boards', label: 'Boards',
      content: [
        { type: 'metric', label: 'Active Projects', value: '3', sub: 'Collection boards' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Penthouse Suite · Zurich', sub: '7 materials · Updated 2h ago', badge: '↗' },
          { icon: 'layers', title: 'Seaside Villa · Mallorca', sub: '5 materials · Updated yesterday', badge: '↗' },
          { icon: 'layers', title: 'Office Fit-out · NYC', sub: '8 materials · Updated 3d ago', badge: '↗' },
        ]},
        { type: 'tags', label: 'Material Types in Use', items: ['Marble', 'Quartzite', 'Oak', 'Zinc', 'Sandstone'] },
        { type: 'text', label: 'Recent Activity', value: 'Added Calacatta Oro to Penthouse Suite board. Removed Black Absolut from Seaside Villa.' },
      ],
    },
    {
      id: 'palette', label: 'Project',
      content: [
        { type: 'metric', label: 'Penthouse Suite · Zurich', value: '68%', sub: 'Budget allocated · 5 materials specified' },
        { type: 'progress', items: [
          { label: 'Calacatta Oro — Flooring (142m²)', pct: 30 },
          { label: 'Smoked Oak — Wall panelling (88m²)', pct: 20 },
          { label: 'Pewter Zinc — Ceiling (34m²)', pct: 14 },
          { label: 'Verde Indio — Feature wall (26m²)', pct: 12 },
          { label: 'Sahara Gold — Terrace (210m²)', pct: 24 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Area', value: '500m²' },
          { label: 'Est. Cost', value: '$94k' },
          { label: 'Suppliers', value: '4' },
        ]},
      ],
    },
    {
      id: 'scan', label: 'Scan',
      content: [
        { type: 'metric', label: 'Last Scan Result', value: '97%', sub: 'Match confidence · Calacatta Oro identified' },
        { type: 'metric-row', items: [
          { label: 'Scans Today', value: '12' },
          { label: 'Saved', value: '4' },
          { label: 'No Match', value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'Calacatta Oro', sub: '97% match · Marble · Italy', badge: '✓' },
          { icon: 'eye', title: 'Verde Indio', sub: '94% match · Quartzite · Brazil', badge: '✓' },
          { icon: 'search', title: 'Unknown Granite', sub: '61% match · Needs review', badge: '?' },
        ]},
        { type: 'text', label: 'Tip', value: 'For best results, scan in even natural light. Hold 20–30cm from the surface and keep the camera steady.' },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'boards', label: 'Boards', icon: 'layers' },
    { id: 'palette', label: 'Project', icon: 'grid' },
    { id: 'scan', label: 'Scan', icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'facet-mock', 'FACET — Interactive Mock');
console.log('Mock live at:', result.url);
