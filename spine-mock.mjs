import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPINE',
  tagline:   'your reading life, beautifully tracked',
  archetype: 'reading-tracker',
  palette: {
    bg:      '#2A1F0E',
    surface: '#352810',
    text:    '#F5F0E4',
    accent:  '#C8901A',
    accent2: '#4A7C59',
    muted:   'rgba(245,240,228,0.4)',
  },
  lightPalette: {
    bg:      '#F5F0E4',
    surface: '#FFFDF7',
    text:    '#1A1613',
    accent:  '#C8901A',
    accent2: '#4A7C59',
    muted:   'rgba(26,22,19,0.4)',
  },
  screens: [
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'The Sentence', sub: 'Louise Erdrich · 44% complete' },
        { type: 'progress', items: [{ label: 'Reading progress', pct: 44 }] },
        { type: 'metric-row', items: [
          { label: 'time read', value: '3h 20m' },
          { label: 'pages',     value: '84' },
          { label: 'day streak',value: '5 / 7' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Piranesi',     sub: 'Susanna Clarke', badge: '★★★★★' },
          { icon: 'star', title: 'Tomorrow',     sub: 'Gabrielle Zevin', badge: '★★★★' },
          { icon: 'star', title: 'Demon Copperhead', sub: 'Barbara Kingsolver', badge: '★★★★★' },
        ]},
      ],
    },
    {
      id: 'book-detail',
      label: 'Book',
      content: [
        { type: 'metric', label: 'The Sentence', value: '44%', sub: 'Chapter 14 of 32 · ≈ 3h left' },
        { type: 'progress', items: [{ label: 'Overall progress', pct: 44 }] },
        { type: 'metric-row', items: [
          { label: 'current',   value: 'Ch 14' },
          { label: 'pages read', value: '189' },
          { label: 'remaining',  value: '247' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Mon', sub: 'Session · 28 min', badge: '✓' },
          { icon: 'calendar', title: 'Tue', sub: 'Session · 45 min', badge: '✓' },
          { icon: 'calendar', title: 'Wed', sub: 'Session · 12 min', badge: '✓' },
          { icon: 'calendar', title: 'Thu', sub: 'Session · 38 min', badge: '✓' },
          { icon: 'calendar', title: 'Fri',  sub: 'Session · 24 min', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'session',
      label: 'Session',
      content: [
        { type: 'metric', label: 'Active Session', value: '24 min', sub: 'The Sentence · Chapter 14' },
        { type: 'metric-row', items: [
          { label: 'start page', value: 'p. 189' },
          { label: 'goal',       value: '30 min' },
          { label: 'mood',       value: 'Immersive' },
        ]},
        { type: 'text', label: 'Session Note', value: 'The chapter opens with the ghost of Tookie\'s past — a sense of haunting that feels warm rather than cold. Erdrich layers grief with dark humor beautifully.' },
        { type: 'tags', label: 'Reading mood', items: ['Immersive', 'Thought-provoking', 'Slow', 'Emotional'] },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric-row', items: [
          { label: 'books read',  value: '12' },
          { label: 'pages turned', value: '3,847' },
          { label: 'day streak',   value: '18 🔥' },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction — 50%', pct: 50 },
          { label: 'Historical — 25%',       pct: 25 },
          { label: 'Non-fiction — 17%',      pct: 17 },
          { label: 'Mystery — 8%',           pct: 8  },
        ]},
        { type: 'progress', items: [{ label: 'Annual goal: 12 of 24 books (50%)', pct: 50 }] },
        { type: 'metric', label: 'Reading Streak', value: '18 days', sub: 'Best: 31 days · Keep it going!' },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Staff Pick · Editors\' Choice', value: 'James', sub: 'Percival Everett · Literary Fiction' },
        { type: 'list', items: [
          { icon: 'book', title: 'Intermezzo',    sub: 'Sally Rooney', badge: '+' },
          { icon: 'book', title: 'The Waiting',   sub: 'Michael Connelly', badge: '+' },
          { icon: 'book', title: 'Orbital',       sub: 'Samantha Harvey', badge: '+' },
          { icon: 'book', title: 'Onyx Storm',    sub: 'Rebecca Yarros', badge: '+' },
        ]},
        { type: 'tags', label: 'Browse by genre', items: ['Literary', 'History', 'Sci-Fi', 'Essays', 'Mystery'] },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: '✦ Devoted Reader', value: 'Alex Moreau', sub: 'Reading since January 2024' },
        { type: 'metric-row', items: [
          { label: 'books',       value: '47' },
          { label: 'pages',       value: '13.2k' },
          { label: 'best streak', value: '31 days' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '📚 Voracious',    sub: 'Read 40+ books',    badge: '✓' },
          { icon: 'star', title: '🔥 On a Streak',  sub: '18-day streak',     badge: '✓' },
          { icon: 'star', title: '🌙 Night Owl',    sub: 'Read after 10pm',   badge: '✓' },
          { icon: 'star', title: '✍️ Annotator',    sub: '100+ notes saved',  badge: '—' },
        ]},
        { type: 'text', label: 'Reading Identity', value: 'Avg session: 38 min · Reads most: Evenings · Favourite: Literary Fiction · Goal pace: On track ✓' },
      ],
    },
  ],
  nav: [
    { id: 'library',     label: 'Library',  icon: 'layers' },
    { id: 'discover',    label: 'Discover', icon: 'search' },
    { id: 'stats',       label: 'Stats',    icon: 'chart'  },
    { id: 'profile',     label: 'Profile',  icon: 'user'   },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'spine-mock', 'SPINE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/spine-mock`);
