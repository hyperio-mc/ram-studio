import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CHALK',
  tagline:   'Think in long form',
  archetype: 'editorial-knowledge',
  palette: {
    bg:      '#1C1A18',
    surface: '#252220',
    text:    '#F5F1EB',
    accent:  '#C0522E',
    accent2: '#E8A98A',
    muted:   'rgba(245,241,235,0.4)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1A18',
    accent:  '#C0522E',
    accent2: '#8B3A1E',
    muted:   'rgba(28,26,24,0.4)',
  },
  screens: [
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: "Today's Thread", value: 'The anatomy of a good argument', sub: '12 min read · Philosophy' },
        { type: 'metric-row', items: [
          { label: 'Notes', value: '247' },
          { label: 'Collections', value: '14' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'On the concept of deep work', sub: 'Productivity · 4 min', badge: 'New' },
          { icon: 'activity', title: 'Mental models for decision making', sub: 'Thinking · 8 min', badge: '60%' },
          { icon: 'star', title: 'The art of asking better questions', sub: 'Learning · 6 min', badge: '' },
          { icon: 'check', title: 'Why silence is a design tool', sub: 'Design · 3 min', badge: '85%' },
        ]},
        { type: 'tags', label: 'Topics', items: ['Philosophy', 'Design', 'Writing', 'Science', 'History'] },
      ],
    },
    {
      id: 'reading',
      label: 'Reading',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'The anatomy of a good argument', sub: '35% complete · 8 min remaining' },
        { type: 'text', label: 'From the note', value: 'An argument is a sequence of statements intended to establish a definite proposition. Not all collections of claims qualify — there must be structure, evidence, and a conclusion the premises support.' },
        { type: 'text', label: 'Callout', value: '"The strength of an argument is not in its volume, but in its clarity." — Aristotle' },
        { type: 'metric-row', items: [
          { label: 'Words', value: '1,840' },
          { label: 'Highlights', value: '3' },
          { label: 'Read time', value: '12m' },
        ]},
        { type: 'tags', label: 'Related topics', items: ['Logos', 'Ethos', 'Pathos', 'Rhetoric', 'Logic'] },
      ],
    },
    {
      id: 'explore',
      label: 'Explore',
      content: [
        { type: 'metric', label: 'Featured Thread', value: 'The paradox of choice and the art of satisficing', sub: 'Decision Theory · 9 min read' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Voice in non-fiction', sub: 'Writing · 5 min', badge: 'Writing' },
          { icon: 'zap', title: 'How memory is formed', sub: 'Science · 7 min', badge: 'Science' },
          { icon: 'eye', title: 'Whitespace is not empty', sub: 'Design · 4 min', badge: 'Design' },
          { icon: 'calendar', title: 'The Gutenberg press effect', sub: 'History · 6 min', badge: 'History' },
          { icon: 'star', title: 'The examined life', sub: 'Philosophy · 10 min', badge: 'Pick' },
        ]},
        { type: 'progress', items: [
          { label: 'Philosophy', pct: 38 },
          { label: 'Design', pct: 27 },
          { label: 'Writing', pct: 21 },
          { label: 'Science', pct: 14 },
        ]},
      ],
    },
    {
      id: 'collections',
      label: 'Collections',
      content: [
        { type: 'metric', label: 'Pinned Collection', value: 'Philosophy of Mind & Consciousness', sub: '24 threads · Updated yesterday' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Writing Craft', sub: '18 threads', badge: '18' },
          { icon: 'activity', title: 'Cognitive Science', sub: '12 threads', badge: '12' },
          { icon: 'eye', title: 'Design Principles', sub: '31 threads', badge: '31' },
          { icon: 'chart', title: 'Economic Thinking', sub: '9 threads', badge: '9' },
        ]},
        { type: 'text', label: 'Recently Added', value: 'Gettier problems in epistemology · Passive voice and when to use it · The Dunning-Kruger effect revisited' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'This Week', value: '4.2 hrs', sub: 'Total reading time · ↑18% from last week' },
        { type: 'metric-row', items: [
          { label: 'Threads', value: '32' },
          { label: 'Highlights', value: '47' },
          { label: 'Collections', value: '3' },
        ]},
        { type: 'progress', items: [
          { label: 'Philosophy (38%)', pct: 38 },
          { label: 'Design (27%)', pct: 27 },
          { label: 'Writing (21%)', pct: 21 },
          { label: 'Science (14%)', pct: 14 },
        ]},
        { type: 'metric', label: 'Reading Streak', value: '14 days 🔥', sub: 'Your personal best — keep going!' },
        { type: 'list', items: [
          { icon: 'star', title: '"Argument is to thought what grammar is to language."', sub: 'Philosophy of Mind', badge: '♡' },
          { icon: 'star', title: '"Whitespace is not empty. It is a decision."', sub: 'Design Principles', badge: '♡' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'library',     label: 'Library',     icon: 'home' },
    { id: 'explore',     label: 'Explore',      icon: 'search' },
    { id: 'reading',     label: 'New',          icon: 'plus' },
    { id: 'collections', label: 'Collections',  icon: 'layers' },
    { id: 'insights',    label: 'Insights',     icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'chalk-mock', 'CHALK — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/chalk-mock`);
