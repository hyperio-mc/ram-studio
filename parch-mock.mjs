import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'PARCH',
  tagline: 'Your reading life, beautifully kept',
  archetype: 'reading-tracker',
  palette: {
    bg: '#120E08',
    surface: '#1C1610',
    text: '#F5F0E8',
    accent: '#9B66D4',
    accent2: '#E8904A',
    muted: 'rgba(245,240,232,0.4)',
  },
  lightPalette: {
    bg: '#FAF7F0',
    surface: '#FFFFFF',
    text: '#1A1208',
    accent: '#5B2D8E',
    accent2: '#C46E2E',
    muted: 'rgba(26,18,8,0.42)',
  },
  screens: [
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Books', value: '143' },
          { label: 'This Year', value: '29' },
          { label: 'Highlights', value: '184' },
        ]},
        { type: 'text', label: 'Currently Reading', value: 'The Making of the President, 1960 — Theodore H. White' },
        { type: 'progress', items: [
          { label: 'Progress (p. 565/832)', pct: 68 },
        ]},
        { type: 'list', items: [
          { icon: 'book', title: 'The Making of the President', sub: 'Theodore H. White · Reading', badge: '68%' },
          { icon: 'book', title: 'Piranesi', sub: 'Susanna Clarke · Finished', badge: '✓' },
          { icon: 'book', title: 'Orbital', sub: 'Samantha Harvey · Finished', badge: '✓' },
          { icon: 'book', title: 'Poor Things', sub: 'Alasdair Gray · Reading', badge: '42%' },
        ]},
        { type: 'tags', label: 'Genres', items: ['Fiction', 'History', 'Essays', 'Science', 'Poetry'] },
      ],
    },
    {
      id: 'reading-now',
      label: 'Reading Now',
      content: [
        { type: 'metric', label: 'Pages Today', value: '47', sub: '1h 23m reading time' },
        { type: 'metric-row', items: [
          { label: 'Pace', value: '32 p/h' },
          { label: 'Streak', value: '5 days' },
          { label: 'Est. Left', value: '5h' },
        ]},
        { type: 'progress', items: [
          { label: 'Book progress (p. 565 of 832)', pct: 68 },
        ]},
        { type: 'text', label: 'Recent Highlight', value: '"Politics is not the art of the possible. It consists in choosing between the disastrous and the unpalatable." — p. 534' },
      ],
    },
    {
      id: 'highlights',
      label: 'Highlights',
      content: [
        { type: 'metric', label: 'Total Highlights', value: '184', sub: 'Across 29 books' },
        { type: 'list', items: [
          { icon: 'star', title: 'The Making of the President', sub: '"Politics is not the art of the possible..." · p. 534', badge: '♥' },
          { icon: 'eye', title: 'Piranesi', sub: '"The World is very beautiful. I am very fortunate..." · p. 12', badge: '♡' },
          { icon: 'zap', title: 'Orbital', sub: '"The planet doesn\'t know it\'s being watched..." · p. 89', badge: '♥' },
          { icon: 'heart', title: 'Poor Things', sub: '"I am not a slave to past identity..." · p. 214', badge: '♡' },
        ]},
        { type: 'tags', label: 'Themes', items: ['Politics', 'Wonder', 'Space', 'Identity', 'Memory'] },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'text', label: 'Editors Pick', value: 'Books That Changed How We Think — 12 curated titles from the Parch team' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Nobel Winners of the 2000s', sub: '8 books · Community curated', badge: '→' },
          { icon: 'map', title: 'Climate & Future Earth', sub: '14 books · Science & Policy', badge: '→' },
          { icon: 'star', title: 'Short & Brilliant', sub: '10 books · Under 200 pages', badge: '→' },
          { icon: 'heart', title: 'Women Writing War', sub: '9 books · History & memoir', badge: '→' },
        ]},
        { type: 'tags', label: 'Browse by', items: ['Fiction', 'Non-fiction', 'Poetry', 'Biography', 'Science'] },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric', label: 'Books Read in 2025', value: '29', sub: '↑ 8 more than last year' },
        { type: 'metric-row', items: [
          { label: 'Pages', value: '9,847' },
          { label: 'Highlights', value: '184' },
          { label: 'Notes', value: '27' },
        ]},
        { type: 'progress', items: [
          { label: 'Fiction (40%)', pct: 40 },
          { label: 'History (28%)', pct: 28 },
          { label: 'Essays (18%)', pct: 18 },
          { label: 'Other (14%)', pct: 14 },
        ]},
        { type: 'text', label: 'Top Read of 2025', value: 'Orbital — Samantha Harvey · 2024 Booker Prize · ★ 5.0' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Elena Lockwood', value: '143', sub: 'books in library · Reader since 2019' },
        { type: 'metric-row', items: [
          { label: 'This Year', value: '29' },
          { label: 'Streak', value: '5 days' },
          { label: 'Highlights', value: '184' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Favourite Genres', sub: 'Fiction, History, Essays', badge: '›' },
          { icon: 'calendar', title: 'Reading Goal', sub: '30 books in 2025', badge: '›' },
          { icon: 'check', title: 'Format', sub: 'Physical + Digital', badge: '›' },
        ]},
        { type: 'tags', label: 'Badges', items: ['🏆 50 Books', '🔥 5-Day Streak', '📚 Scholar', '🌍 Explorer'] },
      ],
    },
  ],
  nav: [
    { id: 'library', label: 'Library', icon: 'book' },
    { id: 'highlights', label: 'Notes', icon: 'star' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'stats', label: 'Stats', icon: 'chart' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'parch-mock', 'PARCH — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/parch-mock');
