import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'REVEL',
  tagline:   "Find what's happening around you",
  archetype: 'event-discovery',

  palette: {           // dark theme
    bg:      '#1C1712',
    surface: '#2A2118',
    text:    '#FAF6F0',
    accent:  '#C4511A',
    accent2: '#4A7B4A',
    muted:   'rgba(250,246,240,0.45)',
  },
  lightPalette: {      // light theme
    bg:      '#FAF6F0',
    surface: '#FFFFFF',
    text:    '#1C1712',
    accent:  '#C4511A',
    accent2: '#4A7B4A',
    muted:   'rgba(28,23,18,0.45)',
  },

  screens: [
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Events This Week', value: '47', sub: 'in San Francisco' },
        { type: 'metric-row', items: [
          { label: 'Free Events', value: '18' },
          { label: 'Near You', value: '12' },
          { label: 'This Weekend', value: '9' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Jazz Under the Stars', sub: 'Yerba Buena · Fri Apr 11 · $25', badge: 'Music' },
          { icon: 'heart', title: 'Latinx Art Exhibition', sub: 'SFMOMA · Sat Apr 12 · Free', badge: 'Art' },
          { icon: 'activity', title: 'Ferry Building Market', sub: 'Ferry Building · Sun Apr 13', badge: 'Food' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Music', 'Art', 'Food', 'Outdoor', 'Film', 'Culture'] },
      ],
    },
    {
      id: 'event-detail',
      label: 'Event Detail',
      content: [
        { type: 'metric', label: 'Jazz Under the Stars', value: '$25', sub: 'Friday April 11 · 7:00 PM – 10:30 PM' },
        { type: 'text', label: 'Venue', value: 'Yerba Buena Gardens, 750 Howard St, San Francisco' },
        { type: 'text', label: 'About', value: 'An evening of world-class jazz in the heart of San Francisco. Featuring five ensembles across two stages, food vendors, and a wine garden.' },
        { type: 'metric-row', items: [
          { label: 'Attending', value: '234' },
          { label: 'Saved', value: '89' },
          { label: 'Rating', value: '4.8★' },
        ]},
        { type: 'progress', items: [
          { label: 'Tickets Remaining', pct: 42 },
        ]},
        { type: 'tags', label: 'Tags', items: ['Jazz', 'Outdoor', 'All Ages', 'Wine Garden', 'Live Music'] },
      ],
    },
    {
      id: 'browse',
      label: 'Browse',
      content: [
        { type: 'list', items: [
          { icon: 'zap', title: 'Neon Nights Festival', sub: 'Mission District · Fri Apr 18', badge: 'Music' },
          { icon: 'eye', title: 'Botanical Garden Tour', sub: 'Golden Gate Park · Sat Apr 19', badge: 'Outdoor' },
          { icon: 'star', title: 'Ramen Pop-Up Night', sub: 'Civic Center · Sun Apr 20', badge: 'Food' },
          { icon: 'play', title: 'Short Film Showcase', sub: 'Castro Theatre · Mon Apr 21', badge: 'Film' },
        ]},
        { type: 'tags', label: 'Filter By', items: ['Tonight', 'Free', 'Outdoors', 'Under $20', 'All Ages'] },
        { type: 'progress', items: [
          { label: 'Music', pct: 80 },
          { label: 'Food & Drink', pct: 65 },
          { label: 'Art & Culture', pct: 55 },
          { label: 'Outdoor & Sports', pct: 40 },
        ]},
      ],
    },
    {
      id: 'map',
      label: 'Map',
      content: [
        { type: 'metric', label: 'Nearby Events', value: '5', sub: 'Within 1.5 miles · updated just now' },
        { type: 'list', items: [
          { icon: 'map', title: 'Jazz Under the Stars', sub: 'Yerba Buena Gardens · 0.4mi', badge: '0.4mi' },
          { icon: 'map', title: 'Latinx Art Exhibition', sub: 'SFMOMA · 0.6mi', badge: '0.6mi' },
          { icon: 'map', title: 'Ramen Pop-Up', sub: 'Civic Center · 0.8mi', badge: '0.8mi' },
          { icon: 'map', title: 'Comedy Night Live', sub: 'Mission · 1.2mi', badge: '1.2mi' },
          { icon: 'map', title: 'Bay to Breakers', sub: 'GG Park · 1.4mi', badge: '1.4mi' },
        ]},
        { type: 'tags', label: 'Distance', items: ['0.5mi', '1mi', '2mi', '5mi', 'Any'] },
      ],
    },
    {
      id: 'saved',
      label: 'Saved',
      content: [
        { type: 'metric', label: 'Saved Events', value: '8', sub: 'across April & May 2026' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Jazz Under the Stars', sub: 'Fri Apr 11 · Yerba Buena', badge: 'Apr 11' },
          { icon: 'heart', title: 'Latinx Art Exhibition', sub: 'Sat Apr 12 · SFMOMA', badge: 'Apr 12' },
          { icon: 'heart', title: 'Ferry Building Market', sub: 'Sun Apr 13 · Ferry Building', badge: 'Apr 13' },
          { icon: 'heart', title: 'Alamo Cinema Night', sub: 'Sun Apr 14 · Alamo Square', badge: 'Apr 14' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Music', value: '3' },
          { label: 'Food', value: '2' },
          { label: 'Art', value: '2' },
          { label: 'Film', value: '1' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Kim · San Francisco', value: '47', sub: 'events attended this year' },
        { type: 'metric-row', items: [
          { label: 'Attended', value: '47' },
          { label: 'Saved', value: '8' },
          { label: 'Reviews', value: '12' },
        ]},
        { type: 'tags', label: 'My Interests', items: ['Music', 'Art', 'Outdoor', 'Food & Drink', 'Film', 'Culture'] },
        { type: 'progress', items: [
          { label: 'Music events', pct: 62 },
          { label: 'Food & Drink', pct: 28 },
          { label: 'Art events', pct: 18 },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'New events near me', sub: 'Notification enabled', badge: '✓' },
          { icon: 'bell', title: 'Event reminders', sub: 'Notification enabled', badge: '✓' },
          { icon: 'settings', title: 'Friend activity', sub: 'Notification disabled', badge: '—' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'discover',     label: 'Discover', icon: 'home' },
    { id: 'browse',       label: 'Browse',   icon: 'search' },
    { id: 'map',          label: 'Map',      icon: 'map' },
    { id: 'saved',        label: 'Saved',    icon: 'heart' },
    { id: 'profile',      label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'revel-mock', 'REVEL — Interactive Mock');
console.log('Mock published:', result.status, '→ https://ram.zenbin.org/revel-mock');
