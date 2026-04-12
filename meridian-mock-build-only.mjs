import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'MERIDIAN',
  tagline:   'Your daily ritual, elevated.',
  archetype: 'luxury-wellness-concierge',
  palette: {
    bg:      '#1C1814',
    surface: '#2A2218',
    text:    '#F8F4EE',
    accent:  '#B8622C',
    accent2: '#4A7C6B',
    muted:   'rgba(248,244,238,0.42)',
  },
  lightPalette: {
    bg:      '#F8F4EE',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#B8622C',
    accent2: '#4A7C6B',
    muted:   'rgba(28,24,20,0.42)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text',   label: 'Good morning', value: 'James.' },
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '12' },
          { label: 'Bookings', value: '3'  },
          { label: 'Tier',     value: 'Gold' },
        ]},
        { type: 'list', items: [
          { icon: '☀️', title: 'Sunrise Yoga', sub: 'Today · 7:00 AM',  badge: 'RITUAL' },
          { icon: '🥗', title: 'Pressed Juice', sub: 'Today · 8:30 AM', badge: 'RITUAL' },
        ]},
        { type: 'text', label: 'Tonight', value: 'Nobu New York — Dinner, 7:30 PM · 2 guests' },
        { type: 'text', label: 'Your Concierge', value: '"Your table at Nobu is confirmed."' },
      ],
    },
    {
      id: 'explore', label: 'Explore',
      content: [
        { type: 'tags', label: 'Categories', items: ['Dining', 'Wellness', 'Travel', 'Culture'] },
        { type: 'text', label: "Editor's Selection", value: "Aman Spa New York — ★ 4.9 · Members Only" },
        { type: 'list', items: [
          { icon: '🍷', title: 'Le Bernardin',  sub: 'DINING · MIDTOWN',  badge: 'TABLE AVAIL' },
          { icon: '🧘', title: 'Remedy Place',  sub: 'WELLNESS · SOHO',   badge: 'MEMBERS'     },
        ]},
      ],
    },
    {
      id: 'booking', label: 'Book',
      content: [
        { type: 'text', label: 'Wellness Experience', value: 'Aman Spa New York' },
        { type: 'metric-row', items: [
          { label: 'Rating', value: '4.9★' },
          { label: 'From',   value: '$380'  },
          { label: 'Guests', value: '2'     },
        ]},
        { type: 'tags', label: 'Select Date', items: ['SAT 29', 'SUN 30 ✓', 'MON 31', 'TUE 1'] },
        { type: 'tags', label: 'Select Time', items: ['10:00 AM', '2:00 PM ✓', '4:30 PM'] },
        { type: 'text', label: 'Earn', value: '✦ 1,200 Meridian Points on this booking' },
      ],
    },
    {
      id: 'card', label: 'Card',
      content: [
        { type: 'metric', label: 'Membership Tier', value: 'Gold', sub: 'Since 2022' },
        { type: 'metric', label: 'Points Balance', value: '24,850', sub: 'Meridian Points' },
        { type: 'list', items: [
          { icon: '✦', title: 'Unlimited concierge, 24 / 7',   badge: '✓' },
          { icon: '⊕', title: 'Priority reservations 500+ venues', badge: '✓' },
          { icon: '◈', title: 'Spa credits · $400 quarterly',   badge: '✓' },
        ]},
      ],
    },
    {
      id: 'bookings', label: 'Upcoming',
      content: [
        { type: 'list', items: [
          { icon: '🍷', title: 'Nobu New York',      sub: 'Tonight · 7:30 PM',  badge: 'CONFIRMED' },
          { icon: '🧘', title: 'Aman Spa NYC',       sub: 'Sun 30 · 2:00 PM',   badge: 'CONFIRMED' },
          { icon: '🎭', title: 'MoMA Members Night', sub: 'Mon 31 · 6:00 PM',   badge: 'RESERVED'  },
        ]},
        { type: 'progress', items: [
          { label: 'Gold tier progress',    pct: 72 },
          { label: 'Monthly sessions goal', pct: 58 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',     label: 'Home',    icon: 'home'     },
    { id: 'explore',  label: 'Explore', icon: 'search'   },
    { id: 'booking',  label: 'Book',    icon: 'plus'     },
    { id: 'card',     label: 'Card',    icon: 'star'     },
    { id: 'bookings', label: 'Trips',   icon: 'calendar' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
fs.writeFileSync('meridian-mock.html', html);
console.log('✓ Built meridian-mock.html, size:', html.length, 'bytes');
