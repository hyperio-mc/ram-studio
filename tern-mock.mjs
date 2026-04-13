import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TERN',
  tagline:   'Know Your Sound',
  archetype: 'music-intelligence',
  palette: {
    bg:      '#0A0B10',
    surface: '#111320',
    text:    '#E2E8F0',
    accent:  '#7C3AED',
    accent2: '#06B6D4',
    muted:   'rgba(148,163,184,0.55)',
  },
  lightPalette: {
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1A0A2E',
    accent:  '#6D28D9',
    accent2: '#0891B2',
    muted:   'rgba(26,10,46,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Listening Streak', value: '31 days', sub: '🔥 personal best' },
        { type: 'metric-row', items: [
          { label: 'Today', value: '284 min' },
          { label: 'Artists', value: '28' },
          { label: 'Streak', value: '31d' },
        ]},
        { type: 'text', label: 'Now Playing', value: 'Neon Bloom — Bicep · 2:14 / 5:12' },
        { type: 'progress', items: [
          { label: 'Electronic', pct: 38 },
          { label: 'Ambient', pct: 27 },
          { label: 'Indie', pct: 20 },
          { label: 'Jazz', pct: 15 },
        ]},
        { type: 'tags', label: 'Weekly Days', items: ['Mon ▪', 'Tue ▪', 'Wed ▪', 'Thu ▪', 'Fri ▪', 'Sat ◈', 'Sun ○'] },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'For You', value: 'Based on your sound', sub: 'Updated today' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Late Night Drive', sub: 'Four Tet · Ambient', badge: 'Ambient' },
          { icon: 'zap',      title: 'Crystalline',     sub: 'Objekt · Techno',  badge: 'Techno' },
          { icon: 'heart',    title: 'Sundream',        sub: 'Bonobo · Electronic', badge: 'New' },
          { icon: 'star',     title: 'Lavender',        sub: 'Bonobo · Downtempo', badge: 'Top' },
        ]},
        { type: 'tags', label: 'Moods', items: ['Focus Flow', 'Late Night', 'Sunday Slow', 'Peak Hours'] },
        { type: 'text', label: 'Curated for you', value: 'Based on 312 songs played this week across 7 genres.' },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric', label: 'This Week', value: '47h 23m', sub: '+12% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Artists', value: '28' },
          { label: 'Songs', value: '312' },
          { label: 'Genres', value: '7' },
        ]},
        { type: 'progress', items: [
          { label: 'Neon Bloom — Bicep', pct: 92 },
          { label: 'Late Night Feelings — Mark Ronson', pct: 75 },
          { label: 'Lavender — Bonobo', pct: 61 },
          { label: 'Crystalline — Objekt', pct: 51 },
          { label: 'Pulse Width — Aphex Twin', pct: 43 },
        ]},
        { type: 'text', label: 'Top Genre', value: 'Electronic — 38% of all plays. You\'ve listened to 12 new artists in this genre this month.' },
      ],
    },
    {
      id: 'artist',
      label: 'Artist',
      content: [
        { type: 'metric', label: 'Bicep', value: '142 plays', sub: 'Your #1 artist this week' },
        { type: 'metric-row', items: [
          { label: 'Hours', value: '11.8h' },
          { label: 'Rank', value: '#247' },
          { label: 'Global', value: 'Top 1%' },
        ]},
        { type: 'list', items: [
          { icon: 'play',  title: 'Glue',       sub: '58 plays · 4:52', badge: '#1' },
          { icon: 'play',  title: 'Neon Bloom', sub: '47 plays · 5:12', badge: '#2' },
          { icon: 'play',  title: 'Vale',       sub: '24 plays · 6:08', badge: '#3' },
          { icon: 'play',  title: 'Hawk',       sub: '13 plays · 7:24', badge: '#4' },
        ]},
        { type: 'text', label: 'Listening History', value: 'You discovered Bicep in March 2021. Peak listening: November 2024 with 89 plays in a single month.' },
      ],
    },
    {
      id: 'soundmap',
      label: 'Sound Map',
      content: [
        { type: 'metric', label: 'Your Musical Landscape', value: '7 Genres', sub: 'Mapped this week' },
        { type: 'progress', items: [
          { label: 'Electronic ↑ Energetic', pct: 88 },
          { label: 'Ambient → Calm / Dark', pct: 72 },
          { label: 'Indie ↗ Energetic / Bright', pct: 60 },
          { label: 'Jazz ↙ Calm / Dark', pct: 45 },
          { label: 'Soul → Calm / Bright', pct: 38 },
        ]},
        { type: 'tags', label: 'Mood Distribution', items: ['38% Electronic', '27% Ambient', '20% Indie', '15% Jazz'] },
        { type: 'text', label: 'Sound Profile', value: 'Your taste skews Energetic + Dark. You listen most during late evenings (10pm–1am) and weekend mornings.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Marcus Rivera', value: 'Top Listener', sub: '#247 globally · Bicep' },
        { type: 'metric-row', items: [
          { label: 'Streak', value: '31d' },
          { label: 'Artists', value: '284' },
          { label: 'Since', value: '2021' },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Audio Quality', sub: 'Lossless streaming',    badge: 'On' },
          { icon: 'bell',     title: 'New Releases',  sub: 'Artist notifications',  badge: 'On' },
          { icon: 'star',     title: 'TERN Pro',      sub: 'Active subscription',   badge: 'Pro' },
          { icon: 'share',    title: 'Connected',     sub: 'Spotify linked',        badge: '✓' },
        ]},
        { type: 'tags', label: 'Top Genres', items: ['Electronic', 'Ambient', 'Indie', 'Jazz', 'Techno'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home' },
    { id: 'discover',  label: 'Discover', icon: 'search' },
    { id: 'stats',     label: 'Stats',   icon: 'chart' },
    { id: 'artist',    label: 'Artist',  icon: 'activity' },
    { id: 'soundmap',  label: 'Map',     icon: 'map' },
    { id: 'profile',   label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'tern-mock', 'TERN — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/tern-mock');
