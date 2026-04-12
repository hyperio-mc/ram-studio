import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Conclave',
  tagline:   'Private travel intelligence for the select few',
  archetype: 'luxury-travel-concierge',

  // DARK palette — obsidian / warm gold
  palette: {
    bg:      '#0D0D0F',
    surface: '#161618',
    text:    '#F0EDE6',
    accent:  '#C8A96E',
    accent2: '#6B8F8C',
    muted:   'rgba(240,237,230,0.42)',
  },

  // LIGHT palette — warm ivory / deep ink
  lightPalette: {
    bg:      '#F6F2EC',
    surface: '#FFFFFF',
    text:    '#1A1612',
    accent:  '#C8A96E',
    accent2: '#5A8280',
    muted:   'rgba(26,22,18,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Good evening, James', value: '✦ OBSIDIAN', sub: 'Private member since 2022' },
        { type: 'metric-row', items: [
          { label: 'Active Trip', value: 'Japan' },
          { label: 'Days Away', value: '38' },
          { label: 'Items', value: '3/11' },
        ]},
        { type: 'text', label: 'Today\'s Curation', value: 'Amalfi Coast — Private villa access, Oct 12–19. 6 villas remaining for Obsidian members.' },
        { type: 'tags', label: 'Quick Access', items: ['✈ Flights', '⛵ Yachts', '🏛 Villas', '🚘 Ground'] },
        { type: 'progress', items: [
          { label: 'Japan Trip · Confirmed', pct: 27 },
        ]},
        { type: 'list', items: [
          { icon: 'message', title: 'Sophie · Concierge', sub: '"Your Nobu reservation is confirmed for Nov 4"', badge: '●' },
        ]},
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'Curated for You', value: '12', sub: 'destinations this week' },
        { type: 'tags', label: 'Filter', items: ['All', 'Europe', 'Asia', 'Americas', 'Islands'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Kyoto by Night', sub: 'Exclusive ryokan · 8 villas remaining · From $4,200/night', badge: '✦' },
          { icon: 'map', title: 'Santorini · Cave Suites', sub: 'Greece · 4.9 · 340 stays · HOT', badge: '🔥' },
          { icon: 'map', title: 'Maldives · Overwater', sub: 'All-inclusive · 4.9 · 340 stays · NEW', badge: '✓' },
        ]},
        { type: 'text', label: 'Trending Experiences', value: 'Private Opera Vienna · Heli-Ski Chamonix · Vineyard Burgundy · F1 Paddock Monaco' },
        { type: 'progress', items: [
          { label: 'Members save avg 22%', pct: 78 },
          { label: 'Availability this week', pct: 60 },
        ]},
      ],
    },
    {
      id: 'trips', label: 'Trips',
      content: [
        { type: 'metric', label: 'Japan · Nov 3–14', value: '38', sub: 'days until departure' },
        { type: 'progress', items: [
          { label: 'Trip confirmed (3 of 11)', pct: 27 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '✈ Heathrow → Narita', sub: 'BA006 · 13:45 · Business Suite · Nov 3', badge: '✓' },
          { icon: 'check', title: '🏨 Ritz-Carlton Tokyo', sub: 'Club Level Suite · 4 nights · Nov 3', badge: '✓' },
          { icon: 'check', title: '🍱 Narisawa · Dinner', sub: 'Tasting menu · 8pm · 2 guests · Nov 4', badge: '✓' },
          { icon: 'calendar', title: '🚄 Shinkansen → Kyoto', sub: 'Gran Class · 10am · Nov 7', badge: '…' },
          { icon: 'calendar', title: '🏯 Nishiyama Onsen', sub: 'Historic ryokan · 3 nights · Nov 7', badge: '…' },
          { icon: 'calendar', title: '🎎 Tea Ceremony (Private)', sub: 'Urasenke school · Nov 10', badge: '…' },
        ]},
      ],
    },
    {
      id: 'concierge', label: 'Concierge',
      content: [
        { type: 'metric', label: 'Sophie · Personal Concierge', value: '● Online', sub: 'Responds in under 2 minutes' },
        { type: 'list', items: [
          { icon: 'message', title: 'Narita transfer confirmed', sub: 'Driver: Kenji +81 90-1234-5678 · Nov 3', badge: '✓' },
          { icon: 'message', title: 'Sukiyabashi Jiro booked', sub: 'Nov 5 · 7:30pm · 2 omakase · ¥66,000 pp', badge: '✓' },
          { icon: 'message', title: 'Nobu reservation', sub: 'Nov 4 · 8pm · confirmed', badge: '✓' },
        ]},
        { type: 'tags', label: 'Quick Requests', items: ['Book restaurant', 'Transport', 'Event tickets', 'Hotel upgrade'] },
        { type: 'text', label: 'Your Request', value: 'Type anything — Sophie handles Sukiyabashi Jiro bookings, Blade helicopter transfers, opera tickets, and anything else you need.' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'James Richardson', value: 'OBSIDIAN', sub: 'Member since 2022 · Annual renewal Dec 2026' },
        { type: 'metric-row', items: [
          { label: 'Trips', value: '47' },
          { label: 'Nights', value: '312' },
          { label: 'Countries', value: '29' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '✈ Airport Suite Access', sub: '1,200+ lounges globally', badge: '✓' },
          { icon: 'check', title: '🏨 Hotel Elite Status', sub: '250+ preferred properties', badge: '✓' },
          { icon: 'check', title: '🚘 Ground Priority', sub: 'Dedicated driver network', badge: '✓' },
          { icon: 'star', title: '🎟 Exclusive Events', sub: 'Opera, racing & private dinners', badge: '+' },
        ]},
        { type: 'tags', label: 'Account', items: ['Preferences', 'Payments', 'Security', 'Help'] },
      ],
    },
  ],

  nav: [
    { id: 'home',       label: 'Home',      icon: 'home'    },
    { id: 'discover',   label: 'Discover',  icon: 'map'     },
    { id: 'trips',      label: 'Trips',     icon: 'calendar'},
    { id: 'concierge',  label: 'Concierge', icon: 'message' },
    { id: 'profile',    label: 'Profile',   icon: 'user'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'conclave-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
