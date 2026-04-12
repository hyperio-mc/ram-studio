import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'STACKS',
  tagline:   'Read deeply, track beautifully',
  archetype: 'reading-tracker',
  palette: {           // dark theme (required)
    bg:      '#1E1A14',
    surface: '#2A2318',
    text:    '#FAF7F0',
    accent:  '#C45D2A',
    accent2: '#5A8A7A',
    muted:   'rgba(250,247,240,0.40)',
  },
  lightPalette: {      // light theme
    bg:      '#FAF7F0',
    surface: '#FFFFFF',
    text:    '#1E1A14',
    accent:  '#C45D2A',
    accent2: '#5A8A7A',
    muted:   'rgba(30,26,20,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Current Book', value: 'Sapiens', sub: 'Yuval Noah Harari · 62% complete' },
        { type: 'metric-row', items: [
          { label: 'Today', value: '18 min' },
          { label: 'Streak', value: '21 days' },
          { label: 'Goal', value: '30 min' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily reading goal', pct: 60 },
          { label: 'Book progress (ch.14/23)', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'book', title: 'The Aleph', sub: 'Jorge Luis Borges · Up next #2', badge: '→' },
          { icon: 'book', title: 'Piranesi', sub: 'Susanna Clarke · Up next #3', badge: '→' },
          { icon: 'book', title: 'Pachinko', sub: 'Lee Min-jin · Up next #4', badge: '→' },
        ]},
        { type: 'tags', label: 'Reading days this week', items: ['Mon ✓', 'Tue ✓', 'Wed ✓', 'Thu ◉', 'Fri', 'Sat', 'Sun'] },
      ],
    },
    {
      id: 'stacks',
      label: 'My Stacks',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total books', value: '47' },
          { label: 'Reading', value: '2' },
          { label: 'Done', value: '31' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Sapiens', sub: 'Harari · 62% complete', badge: '▶' },
          { icon: 'check', title: 'Pachinko', sub: 'Lee Min-jin · Finished Mar 2', badge: '✓' },
          { icon: 'check', title: 'Stoner', sub: 'John Williams · Finished Feb 14', badge: '✓' },
          { icon: 'list', title: 'The Aleph', sub: 'Borges · Queue #2', badge: '≡' },
          { icon: 'list', title: 'Piranesi', sub: 'Clarke · Queue #3', badge: '≡' },
          { icon: 'list', title: 'Gilead', sub: 'Marilynne Robinson · Queue #4', badge: '≡' },
        ]},
        { type: 'tags', label: 'Genres in your stacks', items: ['Literary Fiction', 'Non-fiction', 'History', 'Science', 'Memoir'] },
      ],
    },
    {
      id: 'reading',
      label: 'Currently Reading',
      content: [
        { type: 'metric', label: 'Sapiens — Yuval Noah Harari', value: '62%', sub: 'Chapter 14 of 23 · p.312 · Est. 4h 12m left' },
        { type: 'progress', items: [
          { label: 'Overall progress', pct: 62 },
          { label: 'Chapter 14 progress', pct: 45 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Today', value: '18 min' },
          { label: 'Chapter', value: '14/23' },
          { label: 'Page', value: '312' },
        ]},
        { type: 'text', label: 'Latest highlight', value: '"History is something that very few people have been doing while everyone else was ploughing fields…" — p.308' },
        { type: 'list', items: [
          { icon: 'star', title: 'The Arrow of History', sub: 'Chapter 14 · started today', badge: '→' },
        ]},
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'text', label: "Editor's pick this week", value: 'The Remains of the Day — Kazuo Ishiguro. Booker Prize winner. A masterclass in restraint and regret.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Homo Deus', sub: 'Harari · Because you read Sapiens', badge: '+' },
          { icon: 'star', title: '21 Lessons for the 21st Century', sub: 'Harari · Because you read Sapiens', badge: '+' },
          { icon: 'star', title: 'Guns, Germs and Steel', sub: 'Diamond · Because you read Sapiens', badge: '+' },
          { icon: 'star', title: 'The Selfish Gene', sub: 'Dawkins · Popular this week', badge: '+' },
          { icon: 'star', title: 'Prophet Song', sub: 'Paul Lynch · #1 popular this week', badge: '+' },
        ]},
        { type: 'tags', label: 'Browse genres', items: ['Fiction', 'History', 'Sci-Fi', 'Philosophy', 'Memoir', 'Science'] },
      ],
    },
    {
      id: 'notes',
      label: 'Notes',
      content: [
        { type: 'metric-row', items: [
          { label: 'Highlights', value: '32' },
          { label: 'Notes', value: '12' },
          { label: 'Quotes saved', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '"The real difference between us and chimpanzees is the mythical glue…"', sub: 'Sapiens · p.28 · Ch.2 · Mar 12', badge: '❝' },
          { icon: 'heart', title: 'Connects to Dunbar\'s number — why humans need narrative to scale cooperation', sub: 'Sapiens · p.28 · Note · Mar 12', badge: '✎' },
          { icon: 'star', title: '"Money is the most universal and efficient system of mutual trust ever devised."', sub: 'Sapiens · p.180 · Ch.10 · Mar 28', badge: '❝' },
        ]},
        { type: 'tags', label: 'Filter by book', items: ['Sapiens', 'Pachinko', 'Stoner', 'All books'] },
      ],
    },
    {
      id: 'stats',
      label: 'Year in Reading',
      content: [
        { type: 'metric', label: '2025 in Reading', value: '31 books', sub: '8,412 pages · 127 hours reading time' },
        { type: 'metric-row', items: [
          { label: 'Pages read', value: '8,412' },
          { label: 'Hours read', value: '127h' },
          { label: 'Avg rating', value: '4.2 ★' },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction (42%)', pct: 42 },
          { label: 'Non-fiction (28%)', pct: 28 },
          { label: 'History (18%)', pct: 18 },
          { label: 'Science (12%)', pct: 12 },
        ]},
        { type: 'text', label: 'Top author', value: 'Kazuo Ishiguro — 3 books read this year. Never Let Me Go, The Remains of the Day, Klara and the Sun.' },
        { type: 'tags', label: 'Best months', items: ['June 5 books', 'Jan 4 books', 'Sep 4 books', 'Oct 3 books'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'stacks',   label: 'Stacks',   icon: 'layers' },
    { id: 'reading',  label: 'Reading',  icon: 'activity' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'notes',    label: 'Notes',    icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'stacks-mock', 'STACKS — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/stacks-mock');
