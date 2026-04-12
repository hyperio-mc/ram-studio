import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DOSE',
  tagline:   'Precision Skincare Intelligence',
  archetype: 'health-beauty-tech',
  palette: {
    bg:      '#1A1A1F',
    surface: '#252530',
    text:    '#F5F3EF',
    accent:  '#00A896',
    accent2: '#007A6C',
    muted:   'rgba(245,243,239,0.38)',
  },
  lightPalette: {
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1A1A1F',
    accent:  '#00A896',
    accent2: '#007A6C',
    muted:   'rgba(26,26,31,0.40)',
  },
  screens: [
    {
      id: 'analyze', label: 'Analyze',
      content: [
        { type: 'metric', label: 'Skin Score', value: '8.4', sub: 'Out of 10 · ↑ +0.6 this month' },
        { type: 'metric-row', items: [
          { label: 'Moisture', value: '68%' },
          { label: 'Elastin', value: 'A+' },
          { label: 'Texture', value: '74%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'UV Index', value: '34' },
          { label: 'Oil-Water', value: '52:48' },
          { label: 'Pores', value: '0.3mm' },
        ]},
        { type: 'text', label: 'Last Scan', value: '2 hours ago · 6 diagnostics captured' },
        { type: 'tags', label: 'Scan Status', items: ['Active', 'Orbital Map', 'Baseline Set', 'Formula Ready'] },
      ],
    },
    {
      id: 'formula', label: 'Formula',
      content: [
        { type: 'metric', label: 'Formula FORM·026', value: '6 Actives', sub: 'pH 5.5 · PM Serum' },
        { type: 'list', items: [
          { icon: 'star', title: 'Retinol 0.1%',      sub: 'Vitamin A · Renewal',     badge: '●●●' },
          { icon: 'star', title: 'Niacinamide 5%',    sub: 'Vitamin B3 · Barrier',    badge: '●●●●' },
          { icon: 'star', title: 'Hyaluronic A. 2%',  sub: 'Humectant · Hydration',   badge: '●●●●●' },
          { icon: 'star', title: 'Ceramide NP 0.5%',  sub: 'Lipid · Repair',          badge: '●●●●●' },
          { icon: 'star', title: 'Peptide CK 1%',     sub: 'Peptide · Firmness',      badge: '●●●' },
          { icon: 'star', title: 'Squalane 3%',       sub: 'Emollient · Seal',        badge: '●●●●' },
        ]},
        { type: 'progress', items: [
          { label: 'Potency', pct: 78 },
        ]},
      ],
    },
    {
      id: 'routine', label: 'Routine',
      content: [
        { type: 'metric', label: 'Consistency Streak', value: '11 days', sub: '↑ Personal best this quarter' },
        { type: 'text', label: 'Morning — 4 min', value: '① Gentle Cleanse · ② DOSE Formula · ③ SPF 50+' },
        { type: 'text', label: 'Evening — 5 min', value: '① Oil Cleanse · ② Active Serum (3×/wk) · ③ Barrier Repair' },
        { type: 'progress', items: [
          { label: 'AM Compliance', pct: 91 },
          { label: 'PM Compliance', pct: 74 },
        ]},
        { type: 'tags', label: 'Today', items: ['AM Done ✓', 'PM Pending', 'Retinol Night', 'No Exfoliant'] },
      ],
    },
    {
      id: 'lab', label: 'Lab',
      content: [
        { type: 'metric', label: 'Ingredient Library', value: '47 Actives', sub: 'Mapped to your skin profile' },
        { type: 'list', items: [
          { icon: 'search', title: 'Retinol',       sub: 'Vitamin A · Renewal · Risk: Low',   badge: '0.1%' },
          { icon: 'search', title: 'Niacinamide',   sub: 'B3 · Barrier · Risk: Low',           badge: '5%' },
          { icon: 'search', title: 'Hyaluronic A.', sub: 'Humectant · Hydrate · Risk: None',   badge: '2%' },
          { icon: 'search', title: 'Ceramide NP',   sub: 'Lipid · Repair · Risk: None',        badge: '0.5%' },
          { icon: 'search', title: 'Squalane',      sub: 'Emollient · Seal · Risk: None',      badge: '3%' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Humectant', 'Emollient', 'Lipid'] },
      ],
    },
    {
      id: 'progress', label: 'Progress',
      content: [
        { type: 'metric', label: '30-Day Overview', value: '+23%', sub: 'Overall skin improvement' },
        { type: 'progress', items: [
          { label: 'Moisture',  pct: 68 },
          { label: 'Elastin',   pct: 74 },
          { label: 'Texture',   pct: 60 },
          { label: 'Oil Balance', pct: 82 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Moisture +Δ', value: '+14' },
          { label: 'Elastin +Δ',  value: '+12' },
          { label: 'Texture +Δ',  value: '+12' },
        ]},
        { type: 'text', label: 'Next Milestone', value: 'Pore refinement target — 14 days remaining at current compliance rate' },
      ],
    },
  ],
  nav: [
    { id: 'analyze',  label: 'Analyze',  icon: 'eye' },
    { id: 'formula',  label: 'Formula',  icon: 'layers' },
    { id: 'routine',  label: 'Routine',  icon: 'calendar' },
    { id: 'lab',      label: 'Lab',      icon: 'search' },
    { id: 'progress', label: 'Progress', icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'dose-mock', 'DOSE — Interactive Mock');
console.log('Mock live at:', result.url);
