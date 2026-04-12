import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'QUORUM',
  tagline: 'Private gatherings, beautifully managed.',
  archetype: 'social-concierge',

  // DARK theme (required)
  palette: {
    bg:      '#0C0B09',
    surface: '#161410',
    text:    '#F0EDE6',
    accent:  '#C4952A',
    accent2: '#8B7355',
    muted:   'rgba(240,237,230,0.38)',
  },

  // LIGHT theme (primary — this run is light)
  lightPalette: {
    bg:      '#F8F5EF',
    surface: '#FFFFFF',
    text:    '#0F0E0C',
    accent:  '#B8820F',
    accent2: '#6B5B3E',
    muted:   'rgba(15,14,12,0.42)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'GOOD MORNING, ELLIOT', value: '2', sub: 'gatherings today' },
        { type: 'metric-row', items: [
          { label: 'UPCOMING', value: '7' },
          { label: 'INVITES', value: '3' },
          { label: 'QUORUM', value: '41' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Investment Salon', sub: '7 PM · The Parlour, SoHo', badge: 'CONFIRMED' },
          { icon: 'alert', title: 'Design Studio Crit', sub: '2 PM · Studio 4, Tribeca', badge: 'RSVP' },
        ]},
        { type: 'tags', label: 'THIS WEEK', items: ['Founders Brunch SAT', 'Philosophy Walk SUN', 'Book Club MON'] },
      ],
    },
    {
      id: 'gatherings', label: 'Gatherings',
      content: [
        { type: 'metric-row', items: [
          { label: 'ALL', value: '7' },
          { label: 'HOSTING', value: '2' },
          { label: 'INVITED', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Investment Salon', sub: 'FRI APR 3 · 9/12 attending', badge: '01' },
          { icon: 'calendar', title: 'Design Studio Crit', sub: 'FRI APR 3 · 6/8 attending', badge: '02' },
          { icon: 'calendar', title: 'Founders Brunch', sub: 'SAT APR 4 · 14/20 attending', badge: '03' },
          { icon: 'calendar', title: 'Philosophy Walk', sub: 'SUN APR 5 · 8/12 attending', badge: '04' },
        ]},
      ],
    },
    {
      id: 'event', label: 'Event',
      content: [
        { type: 'metric', label: 'PRIVATE DINNER · NO. 07', value: 'Investment Salon', sub: 'Hosted by Claire Voss' },
        { type: 'metric-row', items: [
          { label: 'DATE', value: 'Apr 3' },
          { label: 'TIME', value: '7 PM' },
          { label: 'VENUE', value: 'Parlour' },
        ]},
        { type: 'text', label: 'ABOUT THIS GATHERING', value: 'A closed dinner for eight around emerging market theses. Moderated by Claire Voss. Wine provided.' },
        { type: 'metric-row', items: [
          { label: 'ATTENDING', value: '9/12' },
          { label: 'STATUS', value: '✓ CONFIRMED' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Claire Voss', sub: 'Host · Partner, Sequoia', badge: 'HOST' },
          { icon: 'user', title: 'Yael Park', sub: 'Founder, Helix', badge: null },
          { icon: 'user', title: 'Marco Lehn', sub: 'Design Director, Arc', badge: null },
        ]},
      ],
    },
    {
      id: 'network', label: 'Network',
      content: [
        { type: 'metric', label: 'YOUR QUORUM', value: '41', sub: 'trusted members' },
        { type: 'list', items: [
          { icon: 'user', title: 'Claire Voss', sub: 'Partner, Sequoia', badge: 'HOST' },
          { icon: 'user', title: 'Yael Park', sub: 'Founder, Helix', badge: null },
          { icon: 'user', title: 'Marco Lehn', sub: 'Design Director, Arc', badge: 'HOST' },
          { icon: 'user', title: 'Raymond Kang', sub: 'GP, Torch Capital', badge: null },
          { icon: 'user', title: 'Nadia Adeyemi', sub: 'Writer + Curator', badge: null },
        ]},
        { type: 'tags', label: 'BY INTEREST', items: ['FINANCE', 'DESIGN', 'CULTURE', 'TECH', 'FOUNDERS'] },
      ],
    },
    {
      id: 'create', label: 'Create',
      content: [
        { type: 'metric', label: 'NEW GATHERING', value: 'Tuesday Salon', sub: 'Define your quorum' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Apr 10 — 7:00 PM', sub: 'Date & Time', badge: null },
          { icon: 'map', title: 'The Parlour, SoHo', sub: 'Venue', badge: null },
          { icon: 'user', title: '12 max attendees', sub: 'Private Dinner', badge: null },
        ]},
        { type: 'tags', label: 'INVITED', items: ['✓ Yael Park', '✓ Claire Voss', 'Marco Lehn', 'R. Kang'] },
        { type: 'progress', items: [{ label: 'INVITES SENT', pct: 50 }] },
        { type: 'metric-row', items: [
          { label: 'CONFIRMED', value: '2' },
          { label: 'PENDING', value: '2' },
          { label: 'CAPACITY', value: '12' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'gatherings', label: 'Events', icon: 'calendar' },
    { id: 'event', label: 'Detail', icon: 'star' },
    { id: 'network', label: 'Network', icon: 'user' },
    { id: 'create', label: 'Create', icon: 'plus' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'quorum-mock', 'QUORUM — Interactive Mock');
console.log('Mock live at:', result.url);
