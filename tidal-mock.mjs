import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TIDAL',
  tagline:   'Artist analytics, deep as the ocean',
  archetype: 'music-analytics',

  palette: {              // dark — deep-sea bioluminescence
    bg:      '#030B17',
    surface: '#071120',
    text:    '#E0F2FE',
    accent:  '#06B6D4',
    accent2: '#818CF8',
    muted:   'rgba(125,185,216,0.4)',
  },
  lightPalette: {         // light toggle
    bg:      '#F0F9FF',
    surface: '#FFFFFF',
    text:    '#0C1A30',
    accent:  '#0891B2',
    accent2: '#6366F1',
    muted:   'rgba(12,26,48,0.4)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Monthly Streams', value: '4.2M' },
          { label: 'Followers',       value: '182K' },
          { label: 'Revenue',         value: '$8.4K' },
        ]},
        { type: 'metric', label: 'Now Playing', value: 'Midnight Tide', sub: 'Trending #3 worldwide' },
        { type: 'progress', items: [
          { label: 'Stream Velocity (7d)', pct: 82 },
          { label: 'Follower Growth',      pct: 64 },
          { label: 'Playlist Adds',        pct: 47 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Midnight Tide',    sub: '1.4M streams', badge: '+12%' },
          { icon: 'music',    title: 'Undertow',         sub: '980K streams', badge: '+8%'  },
          { icon: 'star',     title: 'Saltwater Dreams', sub: '744K streams', badge: '+5%'  },
        ]},
      ],
    },
    {
      id: 'streams', label: 'Streams',
      content: [
        { type: 'metric', label: 'This Month', value: '4.2M', sub: '↑ +18% vs March' },
        { type: 'metric-row', items: [
          { label: 'Peak Day',  value: 'Saturday' },
          { label: 'Peak Hour', value: '10–11 PM' },
          { label: 'Daily Avg', value: '140K'     },
        ]},
        { type: 'progress', items: [
          { label: 'Spotify',       pct: 52 },
          { label: 'Apple Music',   pct: 24 },
          { label: 'YouTube Music', pct: 14 },
          { label: 'Tidal',         pct: 6  },
        ]},
        { type: 'tags', label: 'Trending In', items: ['US','UK','CA','AU','DE'] },
      ],
    },
    {
      id: 'tracks', label: 'Tracks',
      content: [
        { type: 'list', items: [
          { icon: 'star',     title: 'Midnight Tide',    sub: '2026 · 1.4M streams',  badge: '#1'  },
          { icon: 'activity', title: 'Undertow',         sub: '2026 · 980K streams',  badge: '#2'  },
          { icon: 'activity', title: 'Saltwater Dreams', sub: '2025 · 744K streams',  badge: '#3'  },
          { icon: 'chart',    title: 'Bioluminescence',  sub: '2025 · 612K streams',  badge: '#4'  },
          { icon: 'chart',    title: 'Deep Current',     sub: '2025 · 540K streams',  badge: '#5'  },
          { icon: 'list',     title: 'Pressure Ridge',   sub: '2024 · 488K streams',  badge: '#6'  },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Tracks', value: '18'   },
          { label: 'Avg Streams',  value: '420K' },
          { label: 'Save Rate',    value: '8.4%' },
        ]},
      ],
    },
    {
      id: 'audience', label: 'Audience',
      content: [
        { type: 'metric', label: 'Total Followers', value: '182K', sub: '+2.1% this week' },
        { type: 'metric-row', items: [
          { label: 'Female', value: '58%' },
          { label: 'Male',   value: '42%' },
          { label: 'Countries', value: '32' },
        ]},
        { type: 'progress', items: [
          { label: '18–24 years', pct: 34 },
          { label: '25–34 years', pct: 38 },
          { label: '35–44 years', pct: 14 },
          { label: '45+ years',   pct: 14 },
        ]},
        { type: 'list', items: [
          { icon: 'map',    title: 'United States', sub: '51K listeners', badge: '28%' },
          { icon: 'map',    title: 'United Kingdom', sub: '25K listeners', badge: '14%' },
          { icon: 'map',    title: 'Canada',        sub: '20K listeners', badge: '11%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Session', value: '38m'  },
          { label: 'Skip Rate',   value: '12.4%' },
        ]},
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'April 2026', value: '$8,412', sub: '↑ +18% vs March' },
        { type: 'metric-row', items: [
          { label: 'YTD Total',    value: '$24.5K' },
          { label: 'Next Payout', value: 'May 15' },
          { label: 'Est. Payout', value: '$8,412' },
        ]},
        { type: 'progress', items: [
          { label: 'Spotify (45%)',       pct: 45 },
          { label: 'Apple Music (25%)',   pct: 25 },
          { label: 'YouTube (18%)',       pct: 18 },
          { label: 'Tidal (8%)',          pct: 8  },
        ]},
        { type: 'text', label: 'Earnings Note', value: 'Revenue estimates are based on reported stream counts and platform average per-stream rates. Actual payouts may vary.' },
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'home'     },
    { id: 'streams',  label: 'Streams',  icon: 'activity' },
    { id: 'tracks',   label: 'Tracks',   icon: 'list'     },
    { id: 'audience', label: 'Audience', icon: 'user'     },
    { id: 'revenue',  label: 'Revenue',  icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'tidal-mock', 'TIDAL — Interactive Mock');
console.log('Mock live at:', result.url || `https://ram.zenbin.org/tidal-mock`);
console.log('Status:', result.status);
