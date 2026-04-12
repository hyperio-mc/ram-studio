import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SHELF',
  tagline:   'Read more. Track every page.',
  archetype: 'reading-tracker-light',
  palette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1712',
    accent:  '#C8522A',
    accent2: '#4E7D5B',
    muted:   'rgba(26,23,18,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1712',
    accent:  '#C8522A',
    accent2: '#4E7D5B',
    muted:   'rgba(26,23,18,0.45)',
  },
  nav: [
    { label: 'Now',      icon: '◉' },
    { label: 'Library',  icon: '⊞' },
    { label: 'Session',  icon: '◷' },
    { label: 'Stats',    icon: '◑' },
    { label: 'Discover', icon: '✦' },
  ],
  screens: [
    {
      id: 'now', name: 'Now',
      description: 'Current book with progress, daily goal ring, and reading queue',
      components: [
        { type: 'greeting', text: 'Good morning, Mia.', sub: 'Wednesday · April 1' },
        { type: 'book-hero', title: 'The Demon-Haunted World', author: 'Carl Sagan',
          progress: 62, page: '217 of 352', spineColor: 'accent' },
        { type: 'stat-grid', cols: 3, items: [
          { value: '28',  label: 'pages today', color: 'default' },
          { value: '4.2h',label: 'this week',   color: 'default' },
          { value: '12🔥',label: 'day streak',  color: 'default' },
        ]},
        { type: 'goal-ring', value: 28, max: 40, label: 'daily goal', color: 'accent' },
        { type: 'cta-full', text: 'Continue Reading →', color: 'accent' },
        { type: 'section-label', text: 'Up Next' },
        { type: 'queue-list', items: [
          { title: 'Piranesi',          author: 'Susanna Clarke',   color: 'accent2' },
          { title: 'Babel',             author: 'R.F. Kuang',       color: 'gold'    },
          { title: 'Klara and the Sun', author: 'Kazuo Ishiguro',   color: 'accent'  },
        ]},
      ],
    },
    {
      id: 'library', name: 'Library',
      description: 'Book grid with spine colors, yearly goal banner, filter pills',
      components: [
        { type: 'header', title: 'Library', subtitle: '18 books in 2026' },
        { type: 'filter-pills', items: ['All', 'Fiction', 'Non-Fiction', 'Essays'], active: 0, color: 'accent' },
        { type: 'goal-banner', label: '2026 goal: 30 books', sub: '18 read · 60%', pct: 60, color: 'accent' },
        { type: 'book-grid', cols: 3, items: [
          { title: 'The Demon-Haunted', color: 'accent' },
          { title: 'Thinking Fast',     color: 'accent2' },
          { title: 'Dune',              color: 'gold'    },
          { title: 'Klara & the Sun',   color: 'accent'  },
          { title: 'Project Hail Mary', color: 'accent2' },
          { title: 'Poor Things',       color: 'gold'    },
          { title: 'Piranesi',          color: 'accent'  },
          { title: 'Babel',             color: 'accent2' },
          { title: 'Normal People',     color: 'gold'    },
        ]},
      ],
    },
    {
      id: 'session', name: 'Session',
      description: 'Live reading timer, pages counter, quote capture, ambience picker',
      components: [
        { type: 'back-row', left: '← Reading Now' },
        { type: 'timer-hero', value: '01:24:08', label: 'Session', book: 'The Demon-Haunted World', pages: 'p. 189 — 217' },
        { type: 'stat-row', items: [{ value: '28 pages', label: 'this session', color: 'accent2' }] },
        { type: 'quote-capture', quote: '"We are star stuff which has taken its destiny into its own hands."', attribution: '— p. 196', color: 'accent' },
        { type: 'action-row', actions: [
          { label: '⏸  Pause',        style: 'ghost'   },
          { label: 'Finish Session',  style: 'primary' },
        ]},
        { type: 'ambience', items: ['☁ Rain', '♪ Lo-fi', '🌿 Forest', '∅ Silence'], active: 1 },
      ],
    },
    {
      id: 'stats', name: 'Stats',
      description: '3,241 pages hero stat, daily bar chart, speed, streak, genre breakdown',
      components: [
        { type: 'header', title: 'Stats' },
        { type: 'filter-pills', items: ['Week', 'Month', 'Year', 'All'], active: 2, style: 'dark' },
        { type: 'stat-hero', value: '3,241', label: 'pages read in 2026', badge: '↑ 18% vs 2025', badgeColor: 'accent2', font: 'mono', size: 'jumbo' },
        { type: 'bar-chart', label: 'Pages / Day', days: [
          {value:28},{value:0},{value:45},{value:32},{value:18},
          {value:55},{value:40},{value:22},{value:0},{value:38},
          {value:62},{value:44},{value:31,active:true},
        ]},
        { type: 'stat-pair', items: [
          { label: 'Speed',  value: '34 p/hr', color: 'default' },
          { label: 'Streak', value: '12 days 🔥', color: 'default' },
        ]},
        { type: 'breakdown-list', items: [
          { label: 'Science', color: 'accent',  pct: 38 },
          { label: 'Fiction', color: 'accent2', pct: 34 },
          { label: 'History', color: 'gold',    pct: 18 },
          { label: 'Essays',  color: 'muted',   pct: 10 },
        ]},
      ],
    },
    {
      id: 'discover', name: 'Discover',
      description: 'Personalised recs with spine-color cards, trending by genre',
      components: [
        { type: 'header', title: 'Discover', subtitle: 'Based on your reading' },
        { type: 'search-bar', placeholder: '⌕  Search books, authors...' },
        { type: 'section-label', text: 'Because you read Sagan' },
        { type: 'rec-list', items: [
          { title: 'A Brief History of Time', author: 'Stephen Hawking', color: 'accent',  tag: 'SCIENCE' },
          { title: 'Cosmos',                  author: 'Carl Sagan',       color: 'accent2', tag: 'CLASSIC' },
          { title: 'The Elegant Universe',    author: 'Brian Greene',     color: 'gold',    tag: 'PHYSICS' },
        ]},
        { type: 'section-label', text: 'Trending in Science' },
        { type: 'numbered-list', items: [
          { title: 'The Whole Earth',    author: 'Dr Sarah Stewart',    num: '01' },
          { title: 'Entangled Life',     author: 'Merlin Sheldrake',    num: '02' },
          { title: 'Other Minds',        author: 'Peter Godfrey-Smith', num: '03' },
        ]},
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'shelf-mock', 'SHELF — Interactive Mock');
console.log('Mock live at:', result.url);
