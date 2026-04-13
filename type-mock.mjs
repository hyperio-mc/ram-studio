import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TYPE',
  tagline:   'Font discovery, specimen & pairing studio',
  archetype: 'design-tools',
  palette: {           // dark theme
    bg:      '#1C1814',
    surface: '#252018',
    text:    '#F8F5F0',
    accent:  '#C94F0A',
    accent2: '#9A9086',
    muted:   'rgba(248,245,240,0.38)',
  },
  lightPalette: {      // light theme (editorial warm)
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#C94F0A',
    accent2: '#4A5560',
    muted:   'rgba(28,24,20,0.42)',
  },
  screens: [
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Font of the Day', value: 'Stabil Grotesk', sub: 'by KOMETA Typefaces · 10 styles · Free' },
        { type: 'metric-row', items: [
          { label: 'New This Week', value: '1,247' },
          { label: 'Trending', value: '↑ 34' },
          { label: 'Saved', value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Stabil Grotesk', sub: 'KOMETA Typefaces — Sans · 10 styles', badge: '★' },
          { icon: 'activity', title: 'Departure Mono', sub: 'Helena Zhang — Monospace · 1 style', badge: 'NEW' },
          { icon: 'layers', title: 'GT Pantheon', sub: 'Grilli Type — Serif · 6 styles', badge: '↑' },
          { icon: 'eye', title: 'Swizzy', sub: 'Independent — Display · 3 styles', badge: '' },
        ]},
        { type: 'tags', label: 'Browse by Style', items: ['Serif', 'Sans-Serif', 'Monospace', 'Display', 'Script', 'Slab'] },
      ],
    },
    {
      id: 'specimen',
      label: 'Specimen',
      content: [
        { type: 'metric', label: 'Stabil Grotesk Extended', value: 'Aa Bb Cc', sub: 'by KOMETA Typefaces · Extended Variable · Free license' },
        { type: 'metric-row', items: [
          { label: 'Styles', value: '10' },
          { label: 'Released', value: '2026' },
          { label: 'License', value: 'Free' },
        ]},
        { type: 'progress', items: [
          { label: 'Thin 100', pct: 10 },
          { label: 'Light 300', pct: 30 },
          { label: 'Regular 400', pct: 50 },
          { label: 'Bold 700', pct: 70 },
          { label: 'Black 900', pct: 90 },
        ]},
        { type: 'text', label: 'Specimen', value: 'The quick brown fox jumps over the lazy dog. 0123456789 @#$%&' },
        { type: 'tags', label: 'Glyphs', items: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'a', 'b', 'c', '1', '2', '!'] },
      ],
    },
    {
      id: 'pairs',
      label: 'Pairs',
      content: [
        { type: 'metric', label: 'Curated Combinations', value: '2,841', sub: 'voted on by the design community' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Stabil Grotesk + Departure Mono', sub: 'Editorial · 1.2k votes', badge: '♥' },
          { icon: 'heart', title: 'GT Pantheon + Inter', sub: 'Brand · 891 votes', badge: '♡' },
          { icon: 'heart', title: 'Swizzy + Stabil Grotesk', sub: 'Display · 654 votes', badge: '♡' },
          { icon: 'heart', title: 'Inter + Departure Mono', sub: 'Tech · 502 votes', badge: '♡' },
        ]},
        { type: 'tags', label: 'Filter by Style', items: ['All', 'Editorial', 'Brand', 'Tech', 'Display'] },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved Fonts', value: '47' },
          { label: 'Collections', value: '12' },
          { label: 'In Use', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Stabil Grotesk', sub: 'KOMETA · 10 styles · Last used 2d ago', badge: 'SANS' },
          { icon: 'code', title: 'Departure Mono', sub: 'Helena Zhang · 1 style · Last used 5d ago', badge: 'MONO' },
          { icon: 'layers', title: 'GT Pantheon', sub: 'Grilli Type · 6 styles · Last used 1w ago', badge: 'SERIF' },
          { icon: 'grid', title: 'Swizzy', sub: 'Independent · 3 styles · Last used 2w ago', badge: 'SANS' },
          { icon: 'check', title: 'Inter Variable', sub: 'Rasmus · 1 var · Last used 1mo ago', badge: 'SANS' },
        ]},
      ],
    },
    {
      id: 'studio',
      label: 'Studio',
      content: [
        { type: 'metric', label: 'Live Type Tester', value: 'The art of type', sub: 'Stabil Grotesk Extended · 36px · Regular · −10 tracking' },
        { type: 'metric-row', items: [
          { label: 'Weight', value: 'Regular' },
          { label: 'Size', value: '36px' },
          { label: 'Leading', value: '1.3×' },
          { label: 'Tracking', value: '−10' },
        ]},
        { type: 'text', label: 'Preview', value: 'The art of choosing type is the art of saying nothing loudly.' },
        { type: 'tags', label: 'Format', items: ['Bold', 'Italic', 'Underline', 'Uppercase', 'Center'] },
        { type: 'tags', label: 'Export', items: ['PNG', 'SVG', 'CSS', 'Figma Token'] },
      ],
    },
    {
      id: 'year',
      label: 'Year Review',
      content: [
        { type: 'metric', label: 'Your Type Year · 2026', value: 'Jan — Apr', sub: '112 sessions across 47 typefaces' },
        { type: 'metric-row', items: [
          { label: 'Fonts Saved', value: '47' },
          { label: 'Pairs Made', value: '12' },
          { label: 'Glyphs Seen', value: '1.2k' },
        ]},
        { type: 'progress', items: [
          { label: 'Stabil Grotesk', pct: 88 },
          { label: 'Inter Variable', pct: 64 },
          { label: 'Departure Mono', pct: 49 },
          { label: 'GT Pantheon', pct: 35 },
          { label: 'Swizzy', pct: 26 },
        ]},
        { type: 'tags', label: 'Your Style DNA', items: ['Sans-Serif', 'Editorial', 'Variable', 'Display', 'Free fonts'] },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'specimen', label: 'Specimen', icon: 'eye' },
    { id: 'pairs',    label: 'Pairs',    icon: 'layers' },
    { id: 'library',  label: 'Library',  icon: 'star' },
    { id: 'studio',   label: 'Studio',   icon: 'grid' },
    { id: 'year',     label: 'Year',     icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'type-mock', 'TYPE — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
