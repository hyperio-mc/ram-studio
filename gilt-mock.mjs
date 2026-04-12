// gilt-mock.mjs — GILT interactive Svelte mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GILT',
  tagline:   'The card that opens every door',
  archetype: 'luxury-fintech',

  palette: {                 // dark fallback (inversion of light)
    bg:      '#1A1614',
    surface: '#2A211C',
    text:    '#FAF8F4',
    accent:  '#B8965A',
    accent2: '#E8D5A3',
    muted:   'rgba(250,248,244,0.45)',
  },

  lightPalette: {            // primary: warm ivory luxury
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#B8965A',
    accent2: '#8B6914',
    muted:   'rgba(26,22,20,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Available Balance', value: '$24,810', sub: 'GILT Obsidian · ••••4821' },
        { type: 'metric-row', items: [
          { label: 'This Month', value: '$3,240' },
          { label: 'Gold Points', value: '48,200' },
        ]},
        { type: 'text', label: "Today's Opportunity", value: "Carbone, NYC — Table for 2 at 8:30 PM. Included with GILT." },
        { type: 'list', items: [
          { icon: 'star', title: 'Nobu Downtown', sub: 'Dining · Yesterday', badge: '-$320' },
          { icon: 'star', title: 'The Connaught, London', sub: 'Hotels · 2 days ago', badge: '-$1,840' },
          { icon: 'star', title: 'Blade Airport Transfer', sub: 'Transport · 3 days ago', badge: '-$240' },
        ]},
      ],
    },
    {
      id: 'venues', label: 'Venues',
      content: [
        { type: 'text', label: 'Featured Tonight', value: 'Le Bernardin — West 51st St, NYC. Michelin ⭐⭐⭐ · Table available 8 PM.' },
        { type: 'list', items: [
          { icon: 'map', title: 'Aman New York', sub: 'Hotels · 5th Ave · ★ 4.8', badge: 'Reserve' },
          { icon: 'map', title: 'Carbone', sub: 'Italian · Greenwich Village · ★ 4.7', badge: 'Reserve' },
          { icon: 'map', title: 'The Ned NYC', sub: 'Members Club · Financial District · ★ 4.9', badge: 'Reserve' },
          { icon: 'map', title: 'Nobu Downtown', sub: 'Japanese · Tribeca · ★ 4.6', badge: 'Reserve' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Dining', 'Hotels', 'Events', 'Wellness', 'Travel'] },
      ],
    },
    {
      id: 'concierge', label: 'Concierge',
      content: [
        { type: 'text', label: 'Your Concierge — Online ●', value: 'Available 24/7 · Average response 90 seconds' },
        { type: 'list', items: [
          { icon: 'message', title: 'Friday table at Nobu arranged', sub: 'Concierge · 2:34 PM', badge: '✓' },
          { icon: 'message', title: 'Airport pickup confirmed for Sunday 6 AM', sub: 'Concierge · 2:35 PM', badge: '✓' },
          { icon: 'message', title: 'Mercedes S-Class · James · +1 212 555 0142', sub: 'Driver details', badge: '→' },
        ]},
        { type: 'tags', label: 'Quick Requests', items: ['Table for 2', 'Jet charter', 'Spa booking', 'Airport VIP'] },
        { type: 'text', label: 'Message', value: 'What can I arrange for you?' },
      ],
    },
    {
      id: 'card', label: 'Card',
      content: [
        { type: 'metric', label: 'GILT Obsidian', value: '$24,810', sub: 'ALEX WINTERS · ••••4821 · Valid 09/28' },
        { type: 'metric-row', items: [
          { label: 'Monthly Spend', value: '$3,240' },
          { label: 'Gold Points', value: '48,200' },
        ]},
        { type: 'progress', items: [
          { label: 'Gold → Platinum (1,800 pts away)', pct: 96 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'Show CVV', sub: 'Tap to reveal security code', badge: '→' },
          { icon: 'lock', title: 'Freeze Card', sub: 'Temporarily disable transactions', badge: '→' },
          { icon: 'share', title: 'Add to Apple Wallet', sub: 'Instant contactless payments', badge: '→' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'March 2026', value: '$3,240', sub: '↓ 12% vs February · Health: Excellent' },
        { type: 'progress', items: [
          { label: 'Dining (45%)', pct: 45 },
          { label: 'Hotels (30%)', pct: 30 },
          { label: 'Transport (15%)', pct: 15 },
          { label: 'Experiences (10%)', pct: 10 },
        ]},
        { type: 'text', label: 'Weekly Pattern', value: 'Saturdays are your highest spend day. Peak this week: $840 on Saturday.' },
        { type: 'metric-row', items: [
          { label: 'Dining', value: '$1,458' },
          { label: 'Hotels', value: '$972' },
          { label: 'Transport', value: '$486' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'home',      label: 'Home',      icon: 'home' },
    { id: 'venues',    label: 'Venues',    icon: 'map' },
    { id: 'concierge', label: 'Concierge', icon: 'message' },
    { id: 'card',      label: 'Card',      icon: 'layers' },
    { id: 'insights',  label: 'Insights',  icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'gilt-mock', 'GILT — Interactive Mock');
console.log('Mock live at:', result.url);
