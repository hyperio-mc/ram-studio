// volta-mock.mjs — Svelte interactive mock for VOLTA

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VOLTA',
  tagline:   'Journeys, elevated.',
  archetype: 'luxury-travel-concierge',

  palette: {
    bg:      '#090807',
    surface: '#131110',
    text:    '#EDE5D8',
    accent:  '#C49A5E',
    accent2: '#7EA38E',
    muted:   'rgba(237,229,216,0.40)',
  },
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#A07838',
    accent2: '#4E7D68',
    muted:   'rgba(26,21,16,0.42)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',   label: 'FEATURED DESTINATION', value: 'KYOTO — Japan · Spring Season' },
        { type: 'metric', label: 'Member Status', value: 'OBSIDIAN', sub: '48,200 pts · Apex tier: 1,800 pts away' },
        { type: 'metric-row', items: [
          { label: 'Upcoming Trips', value: '2' },
          { label: 'Reservations', value: '4' },
          { label: 'Concierge Req.', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'DINING — Niku Kappo', sub: 'Tokyo · Wagyu counter · Tonight', badge: 'OPEN' },
          { icon: 'map',  title: 'HOTEL — Aman Kyoto', sub: 'Kyoto · Forest Suite · Member rate', badge: 'BOOK' },
          { icon: 'calendar', title: 'TRIP — Tokyo Apr 12–18', sub: '2 dining · 1 hotel · Confirmed', badge: '✓' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['Book Table', 'Find Hotel', 'Contact Concierge', 'My Trips'] },
      ],
    },
    {
      id: 'dining', label: 'Dining',
      content: [
        { type: 'text', label: 'TOKYO · TONIGHT', value: 'Primetime access for Volta members' },
        { type: 'tags', label: 'Cuisine Filter', items: ['ALL', 'JAPANESE', 'FRENCH', 'NORDIC', 'ITALIAN'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'NIKU KAPPO', sub: 'Wagyu · Tokyo · Michelin ★★ — FULLY BOOKED', badge: 'FULL' },
          { icon: 'check', title: 'FLORILÈGE', sub: 'New French · Omotesando · 2 slots — 7:30pm · 9:00pm', badge: '2 SLOTS' },
          { icon: 'star',  title: 'SÉZANNE', sub: 'French Modern · Marunouchi · 1 counter seat', badge: 'EXCL.' },
        ]},
        { type: 'progress', items: [
          { label: 'Table availability tonight (Tokyo)', pct: 30 },
          { label: 'Waitlisted requests filled this month', pct: 78 },
        ]},
        { type: 'text', label: 'Concierge Note', value: 'Your concierge can attempt same-day waitlist priority for fully-booked venues. Message to request.' },
      ],
    },
    {
      id: 'hotels', label: 'Hotels',
      content: [
        { type: 'tags', label: 'Destination', items: ['TOKYO', 'KYOTO', 'OSAKA', 'HAKONE'] },
        { type: 'text', label: 'Apr 12–18 · 2 guests', value: '6 properties available' },
        { type: 'list', items: [
          { icon: 'star', title: 'Palace Hotel Tokyo', sub: 'Marunouchi · Imperial Palace view — ¥86K/night', badge: 'PICK' },
          { icon: 'map',  title: 'The Peninsula Tokyo', sub: 'Hibiya · Grand Deluxe Suite — ¥112K or 24K pts', badge: 'VIEW' },
          { icon: 'lock', title: 'Aman Tokyo', sub: 'Otemachi · Deluxe Garden — ¥148K comp spa', badge: 'OBS.' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg. Member Savings', value: '18%' },
          { label: 'Properties', value: '420' },
          { label: 'Pts Available', value: '48K' },
        ]},
        { type: 'text', label: 'Member Benefit', value: '4th night free automatically applied at all Aman, Rosewood, and Peninsula properties.' },
      ],
    },
    {
      id: 'concierge', label: 'Concierge',
      content: [
        { type: 'metric', label: 'Active Requests', value: '3', sub: '2 require your attention' },
        { type: 'list', items: [
          { icon: 'check',    title: 'Dinner · Florilège · Apr 12', sub: '7:30 PM · 4 guests · Counter seats secured', badge: 'CONF.' },
          { icon: 'activity', title: 'Helicopter · Kyoto transfer · Apr 18', sub: 'Private transfer · 2 pax · Checking availability', badge: 'IN PROG' },
          { icon: 'bell',     title: 'Spa · Aman Tokyo · Apr 13', sub: 'Awaiting choice: Aman Journey or Ryokan Ritual?', badge: 'ACTION' },
        ]},
        { type: 'tags', label: 'Quick Reply', items: ['Aman Journey', 'Ryokan Ritual', 'Ask Concierge'] },
        { type: 'progress', items: [
          { label: 'Requests resolved this trip', pct: 67 },
          { label: 'Avg. concierge response time', pct: 92 },
        ]},
        { type: 'text', label: 'Completed', value: 'Dinner · Kikunoi · Mar 22 — completed, rate this experience?' },
      ],
    },
    {
      id: 'member', label: 'Member',
      content: [
        { type: 'text', label: 'VOLTA OBSIDIAN', value: 'James Beaumont · Member since 2022' },
        { type: 'metric', label: 'Volta Points', value: '48,200', sub: 'Earned this year: 12,400 pts' },
        { type: 'metric-row', items: [
          { label: 'Tier', value: 'OBSIDIAN' },
          { label: 'To APEX', value: '1,800' },
          { label: 'Card', value: '···4921' },
        ]},
        { type: 'progress', items: [
          { label: 'Progress to Apex tier', pct: 96 },
          { label: 'Wellness credits used ($2,400/yr)', pct: 58 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Dining',       sub: 'Priority access + same-day cancel · Michelin 1–3★', badge: 'ACTIVE' },
          { icon: 'home',     title: 'Hotels',       sub: '420 properties · 4th night free · comp spa', badge: 'ACTIVE' },
          { icon: 'heart',    title: 'Experiences',  sub: 'Concerts, fashion, gallery openings', badge: 'ACTIVE' },
          { icon: 'activity', title: 'Health',       sub: 'Remedy Place · Sollis Health · $2,400/yr', badge: 'ACTIVE' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',     label: 'Today',     icon: 'home' },
    { id: 'dining',    label: 'Dining',    icon: 'star' },
    { id: 'hotels',    label: 'Hotels',    icon: 'map' },
    { id: 'concierge', label: 'Concierge', icon: 'message' },
    { id: 'member',    label: 'Member',    icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'volta-travel-mock', 'VOLTA — Interactive Mock');
console.log('Mock live at:', result.url);
