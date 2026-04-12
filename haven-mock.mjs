import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HAVEN',
  tagline:   'Your city, curated.',
  archetype: 'urban-concierge',
  palette: {
    bg:      '#1A2E1E',
    surface: '#243428',
    text:    '#F2EEE8',
    accent:  '#4A8B5A',
    accent2: '#D4AA48',
    muted:   'rgba(242,238,232,0.42)',
  },
  lightPalette: {
    bg:      '#F8F5EF',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#2C5F3A',
    accent2: '#B8922E',
    muted:   'rgba(26,20,16,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Good morning, James', value: 'April 3', sub: 'Friday · 72° Clear in Manhattan' },
        { type: 'metric-row', items: [{ label: 'Reservations', value: '3' }, { label: 'Saved', value: '47' }, { label: 'Points', value: '4.7K' }] },
        { type: 'list', items: [
          { icon: 'star', title: 'Eleven Madison Park', sub: 'Michelin ★★★ · Tonight 8pm', badge: 'TONIGHT' },
          { icon: 'map', title: 'Sommelier Bar', sub: 'Wine & Jazz · SoHo', badge: '★ 4.9' },
          { icon: 'heart', title: 'The Aviary NYC', sub: 'Craft Cocktails · West Loop', badge: 'NEW' },
        ]},
        { type: 'text', label: 'Upcoming', value: 'Atomix · Korean Fine Dining · Tonight 8:00 PM · 2 guests' },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'Category', items: ['All', 'Dining', 'Cocktail Bars', 'Experiences', 'Wellness'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Bâtard', sub: 'French-American · Tribeca · ★★', badge: 'OPEN' },
          { icon: 'map', title: 'Lore Wine Bar', sub: 'Intimate · West Village', badge: 'QUIET' },
          { icon: 'heart', title: 'Double Chicken Please', sub: 'Creative Cocktails · Lower East Side', badge: 'HOT' },
          { icon: 'play', title: 'Jazz at Lincoln Center', sub: 'Tonight 8pm · Limited seats', badge: 'LIMITED' },
          { icon: 'grid', title: 'Brooklyn Roof Garden', sub: 'Sat Morning · Guided tour', badge: 'NEW' },
        ]},
        { type: 'text', label: 'Tip', value: 'Bâtard released 3 prime-time slots for Saturday evening.' },
      ],
    },
    {
      id: 'reserve', label: 'Reserve',
      content: [
        { type: 'list', items: [
          { icon: 'calendar', title: 'Atomix', sub: 'Today · 8:00 PM · 2 guests', badge: '✓' },
          { icon: 'calendar', title: 'Don Angie', sub: 'Sat Apr 5 · 7:30 PM · 4 guests', badge: '✓' },
          { icon: 'calendar', title: 'Sunday at Maison', sub: 'Sun Apr 6 · 11:00 AM · 2 guests', badge: '…' },
          { icon: 'calendar', title: 'The Aviary NYC', sub: 'Thu Apr 10 · 9:00 PM · 2 guests', badge: 'WL' },
        ]},
        { type: 'progress', items: [
          { label: 'Dining this month', pct: 72 },
          { label: 'Experiences used', pct: 40 },
        ]},
        { type: 'metric', label: 'Next reservation', value: 'Tonight', sub: 'Atomix · 8:00 PM · Table 7 confirmed' },
      ],
    },
    {
      id: 'concierge', label: 'Concierge',
      content: [
        { type: 'text', label: 'You', value: 'Can you get me a table for two at Atomix this Saturday? Preferably 7:30.' },
        { type: 'text', label: 'HAVEN', value: 'On it, James. Atomix has availability at 7:30 PM for 2 guests this Saturday. Shall I confirm?' },
        { type: 'text', label: 'You', value: 'Yes — it\'s a birthday dinner.' },
        { type: 'text', label: 'HAVEN', value: 'Done ✓  Atomix, Sat April 5 at 7:30 PM. Birthday noted. Confirmation sent.' },
        { type: 'text', label: 'You', value: 'Can you also recommend a good jazz spot nearby for after?' },
        { type: 'metric', label: 'HAVEN is suggesting', value: 'Jazz at Lincoln Center', sub: '3 blocks away · Available tonight · 2 seats remaining' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'HAVEN Obsidian', value: '4,720', sub: 'Points · Member since 2021 · James Whitfield' },
        { type: 'metric-row', items: [{ label: 'Reservations', value: '32' }, { label: 'Saved', value: '47' }, { label: 'Experiences', value: '12' }] },
        { type: 'tags', label: 'Neighborhoods', items: ['Manhattan', 'Brooklyn', 'West Village'] },
        { type: 'list', items: [
          { icon: 'settings', title: 'Preferences', sub: 'Cuisines, dietary, neighborhoods', badge: '›' },
          { icon: 'heart', title: 'Saved Places', sub: '47 venues in your collection', badge: '›' },
          { icon: 'calendar', title: 'Reservation History', sub: '32 past bookings', badge: '›' },
          { icon: 'message', title: 'Concierge History', sub: 'View past requests & notes', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',     label: 'Today',     icon: 'home' },
    { id: 'discover',  label: 'Discover',  icon: 'search' },
    { id: 'reserve',   label: 'Reserve',   icon: 'calendar' },
    { id: 'concierge', label: 'Concierge', icon: 'message' },
    { id: 'profile',   label: 'Profile',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'haven-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
