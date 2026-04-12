import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Croft',
  tagline: 'Your reading life, beautifully kept',
  archetype: 'personal-productivity',
  palette: {
    bg: '#1A1210',
    surface: '#241A16',
    text: '#F5EFE8',
    accent: '#C15F3C',
    accent2: '#E8A882',
    muted: 'rgba(245,239,232,0.4)',
  },
  lightPalette: {
    bg: '#F8F4EE',
    surface: '#FFFFFF',
    text: '#1A0F09',
    accent: '#C15F3C',
    accent2: '#E8965A',
    muted: 'rgba(26,15,9,0.4)',
  },
  screens: [
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'Books Read', value: '47', sub: 'this year' },
        { type: 'metric-row', items: [{ label: 'Pages', value: '14.2K' }, { label: 'Streak', value: '23d' }, { label: 'Avg', value: '4.1★' }] },
        { type: 'list', items: [
          { icon: 'star', title: 'The Dispossessed', sub: 'Ursula K. Le Guin · 80% done', badge: '●' },
          { icon: 'check', title: 'Piranesi', sub: 'Susanna Clarke · Finished Mar 18', badge: '✓' },
          { icon: 'eye', title: 'Thinking, Fast and Slow', sub: 'Daniel Kahneman · 34%', badge: '●' },
        ]},
        { type: 'progress', items: [
          { label: 'March goal: 3 books', pct: 67 },
        ]},
      ],
    },
    {
      id: 'book-detail',
      label: 'Book Detail',
      content: [
        { type: 'metric', label: 'The Dispossessed', value: '80%', sub: 'Le Guin · 341 of 426 pages' },
        { type: 'metric-row', items: [{ label: 'Sessions', value: '12' }, { label: 'Total hrs', value: '8.4' }, { label: 'Pace', value: '41p/h' }] },
        { type: 'progress', items: [
          { label: 'Reading progress', pct: 80 },
          { label: 'Goal pace', pct: 92 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Last session', sub: 'Yesterday · 45 min · p.302–341', badge: '+39' },
          { icon: 'calendar', title: 'Mar 20', sub: '52 min · p.255–302', badge: '+47' },
        ]},
        { type: 'tags', label: 'Genres', items: ['Sci-fi', 'Literary', 'Philosophy', 'Classic'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: '2026 Reading', value: '47', sub: 'books finished · on pace for 68' },
        { type: 'metric-row', items: [{ label: 'Fiction', value: '62%' }, { label: 'Non-fiction', value: '38%' }] },
        { type: 'progress', items: [
          { label: 'Sci-fi', pct: 40 },
          { label: 'Literary fiction', pct: 22 },
          { label: 'Philosophy', pct: 18 },
          { label: 'History', pct: 20 },
        ]},
        { type: 'metric-row', items: [{ label: 'Best month', value: 'Jan · 8' }, { label: 'Longest streak', value: '31 days' }] },
        { type: 'text', label: 'Reading Pattern', value: 'You read most on Tuesday evenings and Sunday mornings. Peak focus: 9–11pm.' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'Reading Notes', value: '124', sub: 'highlights & reflections' },
        { type: 'list', items: [
          { icon: 'star', title: '"True journey is return."', sub: 'The Dispossessed · p.68 · highlighted', badge: '★' },
          { icon: 'message', title: 'On Anarchism & Utopia', sub: 'Your note · Mar 21 · 3 min read', badge: '✎' },
          { icon: 'star', title: '"The only thing that makes life possible…"', sub: 'The Left Hand of Darkness · p.11', badge: '★' },
        ]},
        { type: 'tags', label: 'Themes', items: ['Utopia', 'Freedom', 'Society', 'Le Guin'] },
        { type: 'text', label: 'Last reflection', value: 'Le Guin\'s Anarres feels more relevant than ever — a society built on mutual aid, stripped of ownership.' },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'text', label: 'Because you loved Le Guin', value: 'Readers who share your taste also loved these.' },
        { type: 'list', items: [
          { icon: 'heart', title: 'The Word for World is Forest', sub: 'Ursula K. Le Guin · 187 pages', badge: '98%' },
          { icon: 'heart', title: 'A Memory Called Empire', sub: 'Arkady Martine · 462 pages', badge: '96%' },
          { icon: 'heart', title: 'The Long Way to a Small, Angry Planet', sub: 'Becky Chambers · 404 pages', badge: '94%' },
        ]},
        { type: 'metric-row', items: [{ label: 'Matches', value: '847' }, { label: 'Readers like you', value: '1.2K' }] },
        { type: 'tags', label: 'Your taste profile', items: ['Speculative', 'Literary', 'Hopepunk', 'Character-driven'] },
      ],
    },
    {
      id: 'add-book',
      label: 'Add Book',
      content: [
        { type: 'text', label: 'Search', value: 'Find by title, author, or ISBN' },
        { type: 'list', items: [
          { icon: 'search', title: 'The Parable of the Sower', sub: 'Octavia E. Butler · 352 pages', badge: 'Add' },
          { icon: 'search', title: 'Parable of the Talents', sub: 'Octavia E. Butler · 448 pages', badge: 'Add' },
          { icon: 'search', title: 'Kindred', sub: 'Octavia E. Butler · 264 pages', badge: 'Add' },
        ]},
        { type: 'tags', label: 'Add to shelf', items: ['Currently reading', 'Want to read', 'Finished', 'DNF'] },
      ],
    },
  ],
  nav: [
    { id: 'library', label: 'Library', icon: 'layers' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'add-book', label: 'Add', icon: 'plus' },
    { id: 'journal', label: 'Journal', icon: 'star' },
    { id: 'insights', label: 'Stats', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'croft-mock', 'Croft — Interactive Mock');
console.log('Mock live at:', result.url);
