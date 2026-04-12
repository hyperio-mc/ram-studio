// canon-mock.mjs — Svelte interactive mock for CANON
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CANON',
  tagline:   'Build your literary canon.',
  archetype: 'reading-intelligence',

  palette: {            // DARK theme (required)
    bg:      '#1C1814',
    surface: '#2A241E',
    text:    '#F5F0E8',
    accent:  '#C2613A',
    accent2: '#5E8870',
    muted:   'rgba(245,240,232,0.40)',
  },

  lightPalette: {       // LIGHT theme (primary for this design)
    bg:      '#F5F0E8',
    surface: '#FEFCF8',
    text:    '#1C1814',
    accent:  '#C2613A',
    accent2: '#5E8870',
    muted:   'rgba(28,24,20,0.42)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Now Reading', value: 'The Name of the Rose', sub: 'Umberto Eco · 1980' },
        { type: 'progress', items: [{ label: 'Progress — p.276 of 438', pct: 63 }] },
        { type: 'metric-row', items: [{ label: 'Today', value: '42pp' }, { label: 'Sessions', value: '2' }, { label: 'Streak', value: '5d' }] },
        { type: 'list', items: [
          { icon: 'book', title: 'Morning session', sub: '08:12 AM · 18 pp · 42 min', badge: '✓' },
          { icon: 'book', title: 'Lunch break', sub: '01:30 PM · 24 pp · 58 min', badge: '✓' },
        ]},
        { type: 'text', label: 'Last highlight', value: '"Books are not made to be believed, but to be subjected to inquiry."' },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric-row', items: [{ label: 'Total', value: '34' }, { label: 'Reading', value: '4' }, { label: 'Done', value: '12' }] },
        { type: 'list', items: [
          { icon: 'book', title: 'The Name of the Rose', sub: 'Umberto Eco', badge: '63%' },
          { icon: 'book', title: 'Thinking Fast & Slow', sub: 'Daniel Kahneman', badge: '22%' },
          { icon: 'star', title: 'Sapiens', sub: 'Yuval Noah Harari', badge: '✓' },
          { icon: 'list', title: 'The Almanack', sub: 'Naval Ravikant', badge: '→' },
          { icon: 'list', title: 'Meditations', sub: 'Marcus Aurelius', badge: '→' },
        ]},
        { type: 'tags', label: 'Genres in library', items: ['Literary Fiction', 'Philosophy', 'Non-fiction', 'Science', 'History'] },
      ],
    },
    {
      id: 'discover', label: 'Find',
      content: [
        { type: 'text', label: "Editor's Pick", value: 'Gödel, Escher, Bach — Douglas R. Hofstadter' },
        { type: 'list', items: [
          { icon: 'star', title: 'The Anxious Generation', sub: 'Jonathan Haidt', badge: '#1' },
          { icon: 'star', title: 'Same as Ever', sub: 'Morgan Housel', badge: '#2' },
          { icon: 'star', title: 'Meditations', sub: 'Marcus Aurelius', badge: '#3' },
        ]},
        { type: 'tags', label: 'Browse by genre', items: ['Philosophy', 'History', 'Science', 'Fiction', 'Essays'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Pages this month', value: '1,247', sub: '↑ 18% vs last month' },
        { type: 'metric-row', items: [{ label: 'Books done', value: '3' }, { label: 'Hours read', value: '41h' }, { label: 'Per session', value: '38p' }, { label: 'Streak', value: '14d' }] },
        { type: 'progress', items: [
          { label: 'Literary Fiction', pct: 38 },
          { label: 'Non-fiction', pct: 28 },
          { label: 'Philosophy', pct: 20 },
          { label: 'Science', pct: 14 },
        ]},
        { type: 'text', label: 'Best session', value: 'Tue Apr 1 — 182 pages · 4h 12min' },
      ],
    },
    {
      id: 'highlights', label: 'Highlights',
      content: [
        { type: 'metric', label: 'Saved passages', value: '24', sub: 'From 3 books' },
        { type: 'list', items: [
          { icon: 'heart', title: 'The Name of the Rose', sub: '"Stat rosa pristina nomine, nomina nuda tenemus."', badge: 'p.502' },
          { icon: 'heart', title: 'The Name of the Rose', sub: '"The order our mind imagines is like a net, built to attain something."', badge: 'p.208' },
          { icon: 'heart', title: 'The Name of the Rose', sub: '"Books are not made to be believed, but subjected to inquiry."', badge: 'p.94' },
        ]},
        { type: 'text', label: 'Export', value: 'All highlights available as PDF or Markdown export.' },
      ],
    },
  ],

  nav: [
    { id: 'today',      label: 'Today',    icon: 'book'     },
    { id: 'library',    label: 'Library',  icon: 'layers'   },
    { id: 'discover',   label: 'Find',     icon: 'search'   },
    { id: 'insights',   label: 'Insights', icon: 'chart'    },
    { id: 'highlights', label: 'Notes',    icon: 'heart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'canon-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
