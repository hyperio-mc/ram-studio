import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Quire',
  tagline: 'Read what matters',
  archetype: 'editorial-reader',
  palette: {
    bg:      '#1C1917',
    surface: '#292524',
    text:    '#FAF8F3',
    accent:  '#DC2626',
    accent2: '#1D4ED8',
    muted:   'rgba(250,248,243,0.45)',
  },
  lightPalette: {
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#B91C1C',
    accent2: '#1D4ED8',
    muted:   'rgba(28,25,23,0.42)',
  },
  screens: [
    {
      id: 'brief',
      label: "Today's Brief",
      content: [
        { type: 'metric', label: 'Morning Edition', value: 'Apr 8', sub: 'Tuesday' },
        { type: 'metric-row', items: [
          { label: 'Stories today', value: '12' },
          { label: 'Min to read', value: '47' },
          { label: 'Topics', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'The Architecture of Quiet Spaces', sub: 'Culture · Maya Holloway · 7 min', badge: 'NEW' },
          { icon: 'activity', title: 'Why open-source won the AI race', sub: 'Technology · James Okafor · 12 min', badge: 'TOP' },
          { icon: 'heart', title: 'River cities that refused to flood', sub: 'Environment · Lena Costa · 11 min', badge: '' },
        ]},
        { type: 'tags', label: 'Trending Topics', items: ['Culture', 'AI', 'Environment', 'Science', 'Society'] },
      ],
    },
    {
      id: 'explore',
      label: 'Explore Topics',
      content: [
        { type: 'text', label: 'Discover', value: 'Five topic areas, each with its own visual identity and editorial voice.' },
        { type: 'list', items: [
          { icon: 'eye', title: 'Culture', sub: '124 stories · Architecture, Art, Style', badge: '◉' },
          { icon: 'zap', title: 'Technology', sub: '98 stories · AI, Privacy, Hardware', badge: '◈' },
          { icon: 'heart', title: 'Environment', sub: '76 stories · Cities, Climate, Nature', badge: '◎' },
          { icon: 'star', title: 'Science', sub: '89 stories · Research, Discovery, Space', badge: '◇' },
          { icon: 'users', title: 'Society', sub: '113 stories · Policy, Economics, Culture', badge: '▣' },
        ]},
        { type: 'tags', label: 'Recently Active', items: ['Urban Design', 'Open Source', 'Flooding', 'Chips', 'Reading'] },
      ],
    },
    {
      id: 'reader',
      label: 'Story Reader',
      content: [
        { type: 'metric', label: 'The Architecture of Quiet Spaces', value: '32%', sub: '7 min read · Culture' },
        { type: 'text', label: 'Maya Holloway', value: 'There is a growing movement among architects who argue that noise pollution has become the defining crisis of the modern city.' },
        { type: 'text', label: 'Pull Quote', value: '"Silence is not the absence of sound — it is a space you must actively design for." — Amara Singh, Studio Pause' },
        { type: 'progress', items: [
          { label: 'Reading progress', pct: 32 },
        ]},
        { type: 'tags', label: 'Related', items: ['Architecture', 'Urban Design', 'Acoustics', 'Wellness'] },
      ],
    },
    {
      id: 'saved',
      label: 'Saved Reading',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved articles', value: '6' },
          { label: 'Total reading', value: '47m' },
          { label: 'Topics', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'The Architecture of Quiet Spaces', sub: 'Culture · 7 min', badge: '◉' },
          { icon: 'zap', title: 'Why open-source won the AI race', sub: 'Technology · 12 min', badge: '◈' },
          { icon: 'heart', title: 'The forgotten art of slow code', sub: 'Technology · 6 min', badge: '◈' },
          { icon: 'activity', title: 'River cities that refused to flood', sub: 'Environment · 11 min', badge: '◎' },
        ]},
        { type: 'tags', label: 'Lists', items: ['Weekend Read', 'Long-form', 'Favourites'] },
      ],
    },
    {
      id: 'profile',
      label: 'Reader Profile',
      content: [
        { type: 'metric', label: 'Simone Laurent', value: '284', sub: 'articles read · member since 2025' },
        { type: 'metric-row', items: [
          { label: 'Hours read', value: '37h' },
          { label: 'This week', value: '3h' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'progress', items: [
          { label: 'Culture', pct: 80 },
          { label: 'Technology', pct: 65 },
          { label: 'Environment', pct: 45 },
          { label: 'Science', pct: 30 },
        ]},
        { type: 'tags', label: 'Favourite Topics', items: ['Culture', 'Technology', 'Environment', 'Science'] },
        { type: 'text', label: 'Newsletter', value: 'Morning Edition newsletter active — delivered daily at 7:00 AM.' },
      ],
    },
  ],
  nav: [
    { id: 'brief', label: 'Brief', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'search' },
    { id: 'reader', label: 'Read', icon: 'eye' },
    { id: 'saved', label: 'Saved', icon: 'heart' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'quire');
const result = await publishMock(built, 'quire-mock', 'Quire — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/quire-mock`);
