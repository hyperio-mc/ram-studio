import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'RECTO',
  tagline:   'Your reading life, beautifully tracked.',
  archetype: 'personal-reading-library',

  palette: {
    bg:      '#09080C',
    surface: '#17131C',
    text:    '#F2EDE8',
    accent:  '#C8A97E',
    accent2: '#7C6DF0',
    muted:   'rgba(242,237,232,0.38)',
  },
  lightPalette: {
    bg:      '#F5F0E8',
    surface: '#FFFFFF',
    text:    '#1A1412',
    accent:  '#9E7A4A',
    accent2: '#5A4CC0',
    muted:   'rgba(26,20,18,0.42)',
  },

  screens: [
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'The Buried Giant', sub: 'Kazuo Ishiguro · Ch. 14 of 23' },
        { type: 'progress', items: [{ label: 'Reading progress', pct: 61 }] },
        { type: 'tags', label: 'Reading Queue', items: ['Piranesi', 'Klara & the Sun', 'Tomorrow × 2', 'Normal People'] },
        { type: 'metric-row', items: [{ label: 'This Year', value: '14' }, { label: 'Streak', value: '12d 🔥' }, { label: 'Pages', value: '4.2K' }] },
        { type: 'list', items: [
          { icon: 'star', title: 'Piranesi', sub: 'Susanna Clarke · Fantasy', badge: '→' },
          { icon: 'star', title: 'Klara & the Sun', sub: 'Kazuo Ishiguro · Sci-Fi', badge: '→' },
          { icon: 'star', title: 'Tomorrow, Tomorrow', sub: 'Gabrielle Zevin · Drama', badge: '→' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Book Detail',
      content: [
        { type: 'metric', label: 'The Buried Giant', value: '61%', sub: 'Page 210 of 347 · Chapter 14' },
        { type: 'progress', items: [
          { label: 'Chapter progress', pct: 61 },
          { label: 'Pages today', pct: 38 },
        ]},
        { type: 'metric-row', items: [{ label: 'Sessions', value: '9' }, { label: 'Hours', value: '6.2h' }, { label: 'Pace', value: '42 pp/h' }] },
        { type: 'text', label: 'Last Note', value: '"The fog as metaphor for collective forgetting — how communities suppress painful memories to maintain peace." · Ch. 11' },
        { type: 'tags', label: 'Genres', items: ['Literary Fiction', 'Arthurian', 'Memory', 'Grief', 'England'] },
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'metric', label: 'Active Reading Session', value: '24:17', sub: 'The Buried Giant · Ch. 14' },
        { type: 'metric-row', items: [{ label: 'Focus', value: '92%' }, { label: 'Pace', value: '42 pp/h' }, { label: 'Today', value: '67 min' }] },
        { type: 'progress', items: [{ label: 'Session focus', pct: 92 }] },
        { type: 'text', label: 'Focus Mode', value: '◎ Notifications paused · Deep reading mode active' },
        { type: 'tags', label: 'Session Tags', items: ['Focus Mode', 'Night Read', 'Chapter 14'] },
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'metric', label: '2025 Annual Challenge', value: '14 / 24', sub: '58% complete · 10 books remaining' },
        { type: 'metric-row', items: [{ label: 'Hours', value: '146' }, { label: 'Daily Avg', value: '28m' }, { label: 'Streak', value: '21d' }] },
        { type: 'progress', items: [
          { label: 'Literary Fiction', pct: 42 },
          { label: 'Science Fiction', pct: 28 },
          { label: 'Non-Fiction', pct: 18 },
          { label: 'Other', pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'January', sub: '1 book completed', badge: '✓' },
          { icon: 'chart', title: 'February', sub: '2 books completed', badge: '✓' },
          { icon: 'chart', title: 'March', sub: '3 books completed', badge: '✓' },
          { icon: 'chart', title: 'April', sub: '2 books in progress', badge: '…' },
        ]},
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'AI Pick · 98% Match', value: 'Never Let Me Go', sub: 'Kazuo Ishiguro · Literary Fiction' },
        { type: 'text', label: 'Why this match', value: '"Because you love Ishiguro\'s exploration of memory, loss, and quiet devastation."' },
        { type: 'tags', label: 'Categories', items: ['For You', 'Fiction', 'Sci-Fi', 'History', 'Classics'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Booker Prize Winners', sub: '12 books curated', badge: '→' },
          { icon: 'layers', title: 'Mind-Bending Sci-Fi', sub: '18 books curated', badge: '→' },
          { icon: 'layers', title: 'Japanese Masters', sub: '9 books curated', badge: '→' },
          { icon: 'layers', title: 'Short Story Collections', sub: '7 books curated', badge: '→' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Eleanor Marsh', value: 'The Contemplative', sub: 'Literary Explorer · 14 books in 2025' },
        { type: 'metric-row', items: [{ label: 'Books', value: '87' }, { label: 'Pages', value: '27.4K' }, { label: 'Countries', value: '18' }] },
        { type: 'list', items: [
          { icon: 'zap', title: '21-Day Streak', sub: 'Longest streak achieved', badge: '🔥' },
          { icon: 'check', title: 'Decade Reader', sub: '10 books completed', badge: '📚' },
          { icon: 'star', title: 'Completist', sub: 'All Ishiguro novels read', badge: '◈' },
          { icon: 'heart', title: 'Night Owl', sub: 'Read past 10pm × 10', badge: '◷' },
        ]},
        { type: 'tags', label: 'Collections', items: ['Favourites (23)', 'Want to Read (41)', '5-Star Reads (8)'] },
      ],
    },
  ],

  nav: [
    { id: 'library',  label: 'Library',  icon: 'layers' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'session',  label: 'Session',  icon: 'play' },
    { id: 'stats',    label: 'Stats',    icon: 'chart' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'recto-mock', 'RECTO — Interactive Mock');
console.log('Mock live at:', result.url);
